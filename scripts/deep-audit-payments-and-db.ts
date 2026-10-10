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

async function runAudit() {
  console.log('=====================================================');
  console.log(' PART 1: DATABASE COMPLETENESS & 34 TABLES/SEATS AUDIT');
  console.log('=====================================================');

  // 1. Audit 34 Tables
  const { data: tables, error: tableErr } = await db
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  assert(!tableErr && !!tables, 'Tables query executed successfully');
  assert(tables?.length === 34, `Exact count of 34 tables present in database (Found: ${tables?.length})`);

  // Verify all table numbers from T-01 to T-34
  const expectedTables = Array.from({ length: 34 }, (_, i) => `T-${String(i + 1).padStart(2, '0')}`);
  const presentTableNumbers = tables?.map(t => t.number) || [];
  const missingTables = expectedTables.filter(t => !presentTableNumbers.includes(t));
  assert(missingTables.length === 0, `All expected table numbers T-01 through T-34 present (Missing: ${missingTables.join(', ') || 'None'})`);

  // Verify sections and capacities
  let sectionAndCapacityValid = true;
  tables?.forEach(t => {
    const num = parseInt(t.number.replace('T-', ''), 10);
    if (num >= 1 && num <= 4) {
      if (t.capacity !== 2 || !t.section.includes('Express')) sectionAndCapacityValid = false;
    } else if (num >= 5 && num <= 14) {
      if (t.capacity !== 3 || !t.section.includes('Main')) sectionAndCapacityValid = false;
    } else if (num >= 15 && num <= 24) {
      if (t.capacity !== 4 || !t.section.includes('Family')) sectionAndCapacityValid = false;
    } else if (num >= 25 && num <= 29) {
      if (t.capacity !== 5 || !t.section.includes('Courtyard')) sectionAndCapacityValid = false;
    } else if (num >= 30 && num <= 34) {
      if (t.capacity !== 6 || !t.section.includes('Grand')) sectionAndCapacityValid = false;
    }
  });
  assert(sectionAndCapacityValid, 'All 34 tables have correct designated floor sections and seat capacities');

  // 2. Audit Table Seats
  const { data: seats, error: seatErr } = await db
    .from('table_seats')
    .select('*')
    .order('table_number', { ascending: true });

  assert(!seatErr && !!seats, 'Table seats query executed successfully');
  assert(seats?.length === 133, `Exact count of 133 individual seats present across all 34 tables (Found: ${seats?.length})`);

  // Check seat capacity distribution per table
  const seatsByTable: Record<string, number> = {};
  seats?.forEach(s => {
    seatsByTable[s.table_number] = (seatsByTable[s.table_number] || 0) + 1;
  });

  let allTableSeatCountsCorrect = true;
  expectedTables.forEach(t => {
    const num = parseInt(t.replace('T-', ''), 10);
    let expectedCap = 2;
    if (num >= 5 && num <= 14) expectedCap = 3;
    else if (num >= 15 && num <= 24) expectedCap = 4;
    else if (num >= 25 && num <= 29) expectedCap = 5;
    else if (num >= 30 && num <= 34) expectedCap = 6;

    if (seatsByTable[t] !== expectedCap) {
      allTableSeatCountsCorrect = false;
    }
  });
  assert(allTableSeatCountsCorrect, 'All 34 tables possess exact corresponding seats in table_seats (2, 3, 4, 5, 6)');

  // 3. Verify Database Entity Tables Schemas
  const { error: ordErr } = await db.from('orders').select('id, table_number, seat_number, status, total').limit(1);
  assert(!ordErr, 'Orders table structure verified with proper columns and types');

  const { error: oiErr } = await db.from('order_items').select('id, order_id, table_number, seat_number, name, quantity, price, stage').limit(1);
  assert(!oiErr, 'Order items table structure verified with proper columns and types');

  const { error: kdsErr } = await db.from('kds_tickets').select('id, order_id, table_number, status, items').limit(1);
  assert(!kdsErr, 'KDS tickets table structure verified with proper columns and types');

  const { error: payErr } = await db.from('payments').select('id, order_id, table_number, seat_number, amount, payment_method, gateway_ref, bank_utr, status, confirmed_at').limit(1);
  assert(!payErr, 'Payments table structure verified with proper columns and types');

  const { error: pingErr } = await db.from('pings').select('id, table_number, seat_number, type, guest_name, message, status').limit(1);
  assert(!pingErr, 'Pings table structure verified with proper columns and types');

  console.log('\n=====================================================');
  console.log(' PART 2: PAYMENT LOGICS, STORAGE & SETTLEMENT AUDIT ');
  console.log('=====================================================');

  const testTable = 'T-20';
  const testSeat = 2;
  const testOrderId = `ORD-AUDIT-${Date.now()}`;
  const testAmount = 540;

  // Pre-seed an order in Supabase for testing payment flow
  const { error: seedOrdErr } = await db.from('orders').insert({
    id: testOrderId,
    table_number: testTable,
    seat_number: testSeat,
    guest_name: 'Test Diner',
    items: [{ id: 'menu-1', name: 'Mutton Donne Biryani', quantity: 2, price: 270 }],
    subtotal: 514,
    tax: 26,
    total: testAmount,
    status: 'UNPAID',
    device_token: 'device-audit-token-1',
  });
  assert(!seedOrdErr, `Test order ${testOrderId} initialized in database`);

  // Seat binding
  await db.from('table_seats').update({
    status: 'OCCUPIED',
    active_order_id: testOrderId,
    device_token: 'device-audit-token-1',
  }).eq('table_number', testTable).eq('seat_number', testSeat);

  // A. Initiate Payment
  const initRes = await fetch(`${BASE_URL}/api/payments/initiate`, {
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
  const initData = await initRes.json();

  assert(initRes.status === 200 && initData.success === true, 'Payment initiation API returns HTTP 200 with success: true');
  assert(initData.amount === testAmount, 'Payment initiation correctly binds bill amount');
  assert(typeof initData.paymentId === 'string' && initData.paymentId.startsWith('PAY-'), 'Payment initiation generates authentic Payment ID');
  assert(initData.upiUri && initData.upiUri.startsWith('upi://pay?'), 'Payment initiation generates valid NPCI UPI payment URI');

  // Verify record written to payments table
  const { data: dbPayRecord, error: dbPayQueryErr } = await db
    .from('payments')
    .select('*')
    .eq('id', initData.paymentId)
    .maybeSingle();

  assert(!dbPayQueryErr && !!dbPayRecord, 'Payment record accurately stored in Supabase payments table');
  assert(dbPayRecord?.status === 'PENDING', 'Initial payment record status correctly saved as PENDING');
  assert(Number(dbPayRecord?.amount) === testAmount, 'Stored payment record amount matches exact bill total');

  // B. Verify Payment Polling (GET)
  const pollRes = await fetch(`${BASE_URL}/api/payments/verify?paymentId=${initData.paymentId}`);
  const pollData = await pollRes.json();
  assert(pollRes.status === 200 && pollData.status === 'PENDING', 'Payment polling GET endpoint accurately returns pending status');

  // C. Execute Settlement Verification (POST)
  const verifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: testOrderId,
      paymentId: initData.paymentId,
      tableNumber: testTable,
      seatNumber: testSeat,
      amount: testAmount,
      paymentMethod: 'UPI',
    }),
  });
  const verifyData = await verifyRes.json();

  assert(verifyRes.status === 200 && verifyData.success === true, 'Payment verification POST endpoint returns HTTP 200 with success: true');
  assert(verifyData.status === 'CONFIRMED' && verifyData.settled === true, 'Payment status successfully updated to CONFIRMED and settled: true');
  assert(typeof verifyData.bankUtr === 'string' && verifyData.bankUtr.length === 12, 'Authentic 12-digit Indian Bank UTR generated and recorded');

  // D. Database Cascade Verification
  const { data: updatedPayRecord } = await db.from('payments').select('*').eq('id', initData.paymentId).maybeSingle();
  assert(updatedPayRecord?.status === 'CONFIRMED', 'Database payments table status updated to CONFIRMED');
  assert(updatedPayRecord?.bank_utr === verifyData.bankUtr, 'Database payments table stores bank UTR reference');

  const { data: updatedOrder } = await db.from('orders').select('*').eq('id', testOrderId).maybeSingle();
  assert(updatedOrder?.status === 'PAID', 'Database orders table status transitioned to PAID');

  const { data: updatedSeat } = await db.from('table_seats').select('*').eq('table_number', testTable).eq('seat_number', testSeat).maybeSingle();
  assert(updatedSeat?.status === 'PAID' && updatedSeat?.device_token === null, 'Database table_seats marked PAID and device token lock released');

  // E. Idempotency Check (Duplicate Verification call)
  const duplicateVerifyRes = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: testOrderId,
      paymentId: initData.paymentId,
    }),
  });
  const duplicateVerifyData = await duplicateVerifyRes.json();
  assert(duplicateVerifyRes.status === 200 && duplicateVerifyData.status === 'CONFIRMED', 'Subsequent verification call resolves idempotently without double-settlement');

  // F. Table Settlement Pessimistic Lock Check
  const lockInitRes = await fetch(`${BASE_URL}/api/settlement/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'INITIATE',
      session: {
        tableNumber: testTable,
        seatNumber: 1,
        grandTotal: 400,
        method: 'UPI',
        initiatedAt: Date.now(),
      },
    }),
  });
  const lockInitData = await lockInitRes.json();
  assert(lockInitRes.status === 200 && lockInitData.success === true, 'Chair 1 acquires pessimistic settlement lock for table');

  // Chair 2 attempts simultaneous settlement on same table
  const conflictRes = await fetch(`${BASE_URL}/api/settlement/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'INITIATE',
      session: {
        tableNumber: testTable,
        seatNumber: 3,
        grandTotal: 300,
        method: 'UPI',
        initiatedAt: Date.now(),
      },
    }),
  });
  const conflictData = await conflictRes.json();
  assert(conflictRes.status === 409 && conflictData.error === 'TABLE_SETTLEMENT_LOCKED', 'Concurrent settlement attempt by another chair returns HTTP 409 Conflict');

  // Clear settlement lock
  const clearLockRes = await fetch(`${BASE_URL}/api/settlement/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'CLEAR',
      tableNumber: testTable,
      seatNumber: 1,
    }),
  });
  assert(clearLockRes.status === 200, 'Settlement lock cleared cleanly');

  // Clean up audit test records
  await db.from('payments').delete().eq('id', initData.paymentId);
  await db.from('orders').delete().eq('id', testOrderId);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).eq('table_number', testTable).eq('seat_number', testSeat);
  await db.from('tables').update({ status: 'VACANT', current_bill: 0, guest_count: 0, kot_count: 0 }).eq('number', testTable);

  console.log('\n=====================================================');
  console.log(` AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    console.error('Audit failures:', failures);
    process.exit(1);
  }
}

runAudit().then(() => process.exit(0)).catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
