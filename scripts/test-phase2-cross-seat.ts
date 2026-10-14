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
  console.log(' PHASE 2: GLOBAL HARDWARE SESSION & CROSS-SEAT SUITE ');
  console.log('=====================================================');

  const sourceTable = 'T-10';
  const sourceSeat = 1;
  const targetSeat = 2;
  const crossTable = 'T-25';
  const crossSeat = 1;
  const testOrderId = `ORD-CROSS-${Date.now()}`;
  const deviceToken = `device-token-cross-${Date.now()}`;
  const testTotal = 720;

  // 1. Seed initial active order at Table 10 Chair 1
  await db.from('orders').insert({
    id: testOrderId,
    table_number: sourceTable,
    seat_number: sourceSeat,
    guest_name: 'Cross Seat Diner',
    items: [{ id: 'menu-1', name: 'Mutton Donne Biryani', quantity: 2, price: 360 }],
    subtotal: 686,
    tax: 34,
    total: testTotal,
    status: 'UNPAID',
    device_token: deviceToken,
  });

  await db.from('order_items').insert({
    id: `oi-${testOrderId}-1`,
    order_id: testOrderId,
    table_number: sourceTable,
    seat_number: sourceSeat,
    name: 'Mutton Donne Biryani',
    quantity: 2,
    price: 360,
    stage: 'PREPARING',
    prep_mode: 'Spicy',
  });

  await db.from('table_seats').update({
    status: 'OCCUPIED',
    active_order_id: testOrderId,
    device_token: deviceToken,
  }).eq('table_number', sourceTable).eq('seat_number', sourceSeat);

  await db.from('tables').update({
    status: 'OCCUPIED',
    current_bill: testTotal,
    guest_count: 1,
  }).eq('number', sourceTable);

  // 2. Test Re-scanning OWN seat (Table 10 Chair 1)
  const ownRes = await fetch(
    `${BASE_URL}/api/session/verify?table=${sourceTable}&seat=${sourceSeat}&deviceToken=${deviceToken}`
  );
  const ownData = await ownRes.json();

  assert(ownRes.status === 200, 'Re-scanning own seat returns HTTP 200');
  assert(ownData.active === true, 'Re-scanning own seat reports active: true');
  assert(ownData.hasActiveOrderElsewhere === false, 'Re-scanning own seat reports hasActiveOrderElsewhere: false');
  assert(ownData.isOccupiedByOtherDevice === false, 'Re-scanning own seat does not trigger other-device conflict');
  assert(ownData.order && ownData.order.id === testOrderId, 'Active unpaid order payload returned seamlessly on own seat');

  // 3. Test Scanning Adjacent Chair at SAME table (Table 10 Chair 2)
  const adjRes = await fetch(
    `${BASE_URL}/api/session/verify?table=${sourceTable}&seat=${targetSeat}&deviceToken=${deviceToken}`
  );
  const adjData = await adjRes.json();

  assert(adjRes.status === 200, 'Scanning adjacent seat returns HTTP 200');
  assert(adjData.active === false, 'Scanning adjacent seat returns active: false');
  assert(adjData.hasActiveOrderElsewhere === true, 'Adjacent seat scan accurately detects active order elsewhere');
  assert(
    adjData.existingOrder &&
    adjData.existingOrder.id === testOrderId &&
    adjData.existingOrder.tableNumber === sourceTable &&
    adjData.existingOrder.seatNumber === sourceSeat,
    'Existing order details point to source Table 10 Chair 1'
  );

  // 4. Test Scanning Completely DIFFERENT Table (Table 25 Chair 1)
  const diffTableRes = await fetch(
    `${BASE_URL}/api/session/verify?table=${crossTable}&seat=${crossSeat}&deviceToken=${deviceToken}`
  );
  const diffTableData = await diffTableRes.json();

  assert(diffTableRes.status === 200, 'Scanning different table returns HTTP 200');
  assert(diffTableData.hasActiveOrderElsewhere === true, 'Different table scan accurately detects active order at Table 10');
  assert(
    diffTableData.existingOrder && diffTableData.existingOrder.tableNumber === sourceTable,
    'Existing order references Table 10, preventing table abandonment'
  );

  // 5. Test 1-Tap Seat Transfer API (/api/session/transfer)
  const transferRes = await fetch(`${BASE_URL}/api/session/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceToken,
      fromTable: sourceTable,
      fromSeat: sourceSeat,
      toTable: sourceTable,
      toSeat: targetSeat,
      orderId: testOrderId,
    }),
  });

  const transferData = await transferRes.json();
  assert(transferRes.status === 200 && transferData.success === true, 'Seat transfer endpoint returns HTTP 200 with success: true');
  assert(transferData.newSeat === targetSeat, 'Seat transfer response confirms new seat assignment');

  // 6. Verify Database State After Migration
  const { data: migratedOrder } = await db.from('orders').select('*').eq('id', testOrderId).maybeSingle();
  assert(
    migratedOrder?.table_number === sourceTable && migratedOrder?.seat_number === targetSeat,
    'Database orders table successfully migrated to new seat'
  );

  const { data: migratedItem } = await db.from('order_items').select('*').eq('order_id', testOrderId).maybeSingle();
  assert(
    migratedItem?.seat_number === targetSeat,
    'Database order_items table successfully migrated to new seat'
  );

  const { data: oldSeat } = await db.from('table_seats').select('*').eq('table_number', sourceTable).eq('seat_number', sourceSeat).maybeSingle();
  assert(
    oldSeat?.status === 'VACANT' && oldSeat?.active_order_id === null && oldSeat?.device_token === null,
    'Previous seat cleanly reset to VACANT with device token and order ID released'
  );

  const { data: newSeat } = await db.from('table_seats').select('*').eq('table_number', sourceTable).eq('seat_number', targetSeat).maybeSingle();
  assert(
    newSeat?.status === 'OCCUPIED' && newSeat?.active_order_id === testOrderId && newSeat?.device_token === deviceToken,
    'Destination seat marked OCCUPIED and securely bound to device token'
  );

  // 7. Test Re-verifying Newly Assigned Seat (Table 10 Chair 2)
  const newSeatRes = await fetch(
    `${BASE_URL}/api/session/verify?table=${sourceTable}&seat=${targetSeat}&deviceToken=${deviceToken}`
  );
  const newSeatData = await newSeatRes.json();
  assert(newSeatData.active === true && newSeatData.hasActiveOrderElsewhere === false, 'Newly migrated seat now resumes silently as active without any conflict');

  // 8. Clean up test records
  await db.from('order_items').delete().eq('order_id', testOrderId);
  await db.from('orders').delete().eq('id', testOrderId);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).in('table_number', [sourceTable, crossTable]);
  await db.from('tables').update({ status: 'VACANT', current_bill: 0, guest_count: 0, kot_count: 0 }).in('number', [sourceTable, crossTable]);

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
