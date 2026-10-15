import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, description: string) {
  if (condition) {
    passed++;
    console.log(`✓ [PASS] ${description}`);
  } else {
    failed++;
    failures.push(description);
    console.error(`✗ [FAIL] ${description}`);
  }
}

async function runTest() {
  console.log('=====================================================');
  console.log(' PHASE 1: PAYMENT PING AUTO-PURGE & SYNC TEST SUITE  ');
  console.log('=====================================================');

  const testTable = 'T-15';
  const testSeat = 2;
  const testOrderId = `ORD-PURGE-${Date.now()}`;
  const testPingId1 = `PING-PAY-${Date.now()}`;
  const testPingId2 = `PING-BILL-${Date.now()}`;
  const testAmount = 650;

  // 1. Seed order and pending pings
  await db.from('orders').insert({
    id: testOrderId,
    table_number: testTable,
    seat_number: testSeat,
    guest_name: 'Diner Purge Test',
    items: [{ id: 'menu-1', name: 'Biryani Feast', quantity: 2, price: 325 }],
    subtotal: 619,
    tax: 31,
    total: testAmount,
    status: 'UNPAID',
    device_token: 'device-token-purge-1',
  });

  await db.from('table_seats').update({
    status: 'OCCUPIED',
    active_order_id: testOrderId,
    device_token: 'device-token-purge-1',
  }).eq('table_number', testTable).eq('seat_number', testSeat);

  await db.from('pings').insert([
    {
      id: testPingId1,
      table_number: testTable,
      seat_number: testSeat,
      type: 'PAYMENT',
      guest_name: 'Diner Purge Test',
      message: 'Customer requested bill settlement',
      status: 'PENDING',
    },
    {
      id: testPingId2,
      table_number: testTable,
      seat_number: testSeat,
      type: 'BILL',
      guest_name: 'Diner Purge Test',
      message: 'Print bill requested',
      status: 'PENDING',
    },
  ]);

  // 2. Verify pings exist as PENDING
  const { data: prePings } = await db
    .from('pings')
    .select('*')
    .in('id', [testPingId1, testPingId2]);

  assert(prePings?.length === 2, 'Pre-condition: Two pending payment/bill pings created in database');
  assert(prePings?.every(p => p.status === 'PENDING') ?? false, 'Pre-condition: Both pings have status PENDING');

  // 3. Initiate and verify payment
  const verifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: testOrderId,
      tableNumber: testTable,
      seatNumber: testSeat,
      amount: testAmount,
      paymentMethod: 'UPI',
    }),
  });

  const verifyData = await verifyRes.json();
  assert(verifyRes.status === 200 && verifyData.success === true, 'Payment verification returns HTTP 200 with success: true');
  assert(verifyData.status === 'CONFIRMED' && verifyData.settled === true, 'Payment status updated to CONFIRMED and settled: true');

  // 4. Verify that pings were automatically resolved in Supabase
  const { data: postPings } = await db
    .from('pings')
    .select('*')
    .in('id', [testPingId1, testPingId2]);

  assert(
    postPings?.every(p => p.status === 'RESOLVED') ?? false,
    'Database cascade automatically transitions all PAYMENT and BILL pings to RESOLVED'
  );

  // 5. Test Webhook Auto-Purge Channel
  const webhookTable = 'T-16';
  const webhookSeat = 1;
  const webhookOrderId = `ORD-WB-PURGE-${Date.now()}`;
  const webhookPingId = `PING-WB-${Date.now()}`;

  await db.from('orders').insert({
    id: webhookOrderId,
    table_number: webhookTable,
    seat_number: webhookSeat,
    guest_name: 'Webhook Diner',
    items: [{ id: 'menu-2', name: 'Kababs', quantity: 1, price: 300 }],
    subtotal: 285,
    tax: 15,
    total: 300,
    status: 'UNPAID',
  });

  await db.from('table_seats').update({
    status: 'OCCUPIED',
    active_order_id: webhookOrderId,
  }).eq('table_number', webhookTable).eq('seat_number', webhookSeat);

  await db.from('pings').insert({
    id: webhookPingId,
    table_number: webhookTable,
    seat_number: webhookSeat,
    type: 'PAYMENT',
    guest_name: 'Webhook Diner',
    status: 'PENDING',
  });

  const webhookPayload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_fake_${Date.now()}`,
          order_id: `order_fake_${Date.now()}`,
          amount: 30000, // paise
          notes: {
            tableNumber: webhookTable,
            seatNumber: String(webhookSeat),
          },
        },
      },
    },
  };

  const wbRes = await fetch(`${BASE_URL}/api/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload),
  });

  const wbData = await wbRes.json();
  assert(wbRes.status === 200 && wbData.status === 'ok', 'Webhook payment processing returns HTTP 200');

  const { data: wbPostPings } = await db
    .from('pings')
    .select('*')
    .eq('id', webhookPingId);

  assert(
    wbPostPings?.[0]?.status === 'RESOLVED',
    'Webhook processing automatically transitions PAYMENT pings to RESOLVED in database'
  );

  // 6. Clean up test records
  await db.from('pings').delete().in('id', [testPingId1, testPingId2, webhookPingId]);
  await db.from('orders').delete().in('id', [testOrderId, webhookOrderId]);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).in('table_number', [testTable, webhookTable]);
  await db.from('tables').update({ status: 'VACANT', current_bill: 0, guest_count: 0, kot_count: 0 }).in('number', [testTable, webhookTable]);

  console.log('\n=====================================================');
  console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    console.error('Test failures:', failures);
    process.exit(1);
  }
}

runTest().then(() => process.exit(0)).catch(err => {
  console.error('Test fatal error:', err);
  process.exit(1);
});
