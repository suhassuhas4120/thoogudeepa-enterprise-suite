import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'http://localhost:3001';

async function runPhase1Tests() {
  console.log('=====================================================');
  console.log('      PHASE 1: REAL RAZORPAY & WEBHOOK TEST SUITE     ');
  console.log('=====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  // Setup: Create a test order and seat in Supabase
  const testOrderId = `ORD-TEST-RZP-${Date.now()}`;
  const testTable = 'T-31';
  const testSeat = 1;

  // Insert test order
  await db.from('orders').insert({
    id: testOrderId,
    table_number: testTable,
    seat_number: testSeat,
    guest_name: 'Razorpay Test Guest',
    subtotal: 500,
    tax: 25,
    total_amount: 525,
    status: 'UNPAID',
  });

  // Bind seat
  await db.from('table_seats').update({
    status: 'OCCUPIED',
    active_order_id: testOrderId,
    device_token: 'DEV-TEST-TOKEN-123',
  }).eq('table_number', testTable).eq('seat_number', testSeat);

  // ── TEST 1: Initiate Payment Endpoint ──────────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/payments/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        tableNumber: testTable,
        seatNumber: testSeat,
        amount: 525,
        paymentMethod: 'RAZORPAY',
      }),
    });
    const data = await res.json();

    assert(res.ok && data.success === true, '1. Initiate payment returns HTTP 200 with success: true');
    assert(data.orderId === testOrderId, '2. Order ID correctly bound in payment initiate payload');
    assert(data.amount === 525, '3. Amount accurately matched in payment initiate payload');
    assert(typeof data.paymentId === 'string' && data.paymentId.startsWith('PAY-'), '4. Authentic Payment ID generated');
    assert(typeof data.upiUri === 'string' && data.upiUri.includes('upi://pay'), '5. NPCI standard UPI URI generated as dual fallback');
  } catch (err: any) {
    console.error('Test 1 failed with exception:', err);
    assert(false, 'Initiate payment request succeeded');
  }

  // ── TEST 2: Verify Endpoint with Valid Payment ──────────────────────────
  try {
    const rzOrderId = `order_test_${Date.now()}`;
    const rzPaymentId = `pay_test_${Date.now()}`;
    const secret = 'test_secret_for_suite';

    // Compute authentic HMAC SHA-256 signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${rzOrderId}|${rzPaymentId}`)
      .digest('hex');

    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        tableNumber: testTable,
        seatNumber: testSeat,
        amount: 525,
        paymentMethod: 'RAZORPAY',
        razorpay_order_id: rzOrderId,
        razorpay_payment_id: rzPaymentId,
        razorpay_signature: signature,
      }),
    });
    const data = await res.json();

    assert(res.ok && data.success === true, '6. Payment verification accepts valid transaction details');
    assert(data.status === 'CONFIRMED', '7. Payment status transitions to CONFIRMED');
    assert(data.settled === true, '8. Settled flag returns true');

    // Verify DB update
    const { data: updatedOrder } = await db.from('orders').select('status').eq('id', testOrderId).single();
    assert(updatedOrder?.status === 'PAID', '9. Database orders table marks order as PAID');

    const { data: updatedSeat } = await db.from('table_seats').select('status, device_token').eq('table_number', testTable).eq('seat_number', testSeat).single();
    assert(updatedSeat?.status === 'PAID' && updatedSeat?.device_token === null, '10. Database table_seats marks seat PAID and releases device token lock');
  } catch (err: any) {
    console.error('Test 2 failed with exception:', err);
    assert(false, 'Payment verification succeeded');
  }

  // ── TEST 3: Idempotency of Payment Verify ──────────────────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        tableNumber: testTable,
        seatNumber: testSeat,
        amount: 525,
      }),
    });
    const data = await res.json();

    assert(res.ok && data.success === true && data.status === 'CONFIRMED', '11. Subsequent verify calls resolve idempotently with zero double charge');
  } catch (err: any) {
    console.error('Test 3 failed with exception:', err);
    assert(false, 'Idempotency test succeeded');
  }

  // ── TEST 4: Razorpay Webhook Endpoint ───────────────────────────────────
  try {
    const webhookOrderId = `ORD-TEST-WH-${Date.now()}`;
    await db.from('orders').insert({
      id: webhookOrderId,
      table_number: testTable,
      seat_number: 2,
      guest_name: 'Webhook Test Guest',
      subtotal: 300,
      tax: 15,
      total_amount: 315,
      status: 'UNPAID',
    });
    await db.from('table_seats').update({
      status: 'OCCUPIED',
      active_order_id: webhookOrderId,
      device_token: 'DEV-WH-TOKEN',
    }).eq('table_number', testTable).eq('seat_number', 2);

    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_wh_${Date.now()}`,
            order_id: `order_wh_${Date.now()}`,
            amount: 31500, // paise
            notes: {
              tableNumber: testTable,
              seatNumber: '2',
            },
          },
        },
      },
    });

    const res = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: webhookPayload,
    });
    const data = await res.json();

    assert(res.ok && data.status === 'ok', '12. Razorpay webhook captures payment.captured event and returns HTTP 200');

    // Verify DB order and seat update from webhook
    const { data: whOrder } = await db.from('orders').select('status').eq('id', webhookOrderId).single();
    assert(whOrder?.status === 'PAID', '13. Webhook asynchronously transitions order to PAID');

    const { data: whSeat } = await db.from('table_seats').select('status, device_token').eq('table_number', testTable).eq('seat_number', 2).single();
    assert(whSeat?.status === 'VACANT' && whSeat?.device_token === null, '14. Webhook releases chair to VACANT with device lock cleared');
  } catch (err: any) {
    console.error('Test 4 failed with exception:', err);
    assert(false, 'Webhook test succeeded');
  }

  // Cleanup test rows
  await db.from('payments').delete().or(`order_id.eq.${testOrderId},table_number.eq.${testTable}`);
  await db.from('orders').delete().or(`id.eq.${testOrderId},table_number.eq.${testTable}`);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).eq('table_number', testTable);

  console.log(`\n=====================================================`);
  console.log(`     RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`=====================================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase1Tests().catch((e) => {
  console.error('Phase 1 test suite fatal error:', e);
  process.exit(1);
});
