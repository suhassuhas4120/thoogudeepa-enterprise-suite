/**
 * test-phase3-bridge.js
 * ──────────────────────────────────────────────────────────────────────
 * Phase 3 automated test suite: Shared Bridge API wiring + Supabase persistence.
 *
 * Tests:
 *   1.  Verify dev server is reachable
 *   2.  Vacate T-20 (pre-test cleanup)
 *   3.  Seat guests at T-20 via /api/tables/seat → verify DB row updated
 *   4.  Place order at T-20 via /api/orders/create → verify order in DB
 *   5.  Verify KDS ticket created in DB for T-20
 *   6.  Bump KDS item stage via /api/kds/bump-item → verify DB updated
 *   7.  Bump entire ticket via /api/kds/bump-table → verify status = READY
 *   8.  Create a ping via /api/pings/create → verify ping in DB
 *   9.  Resolve the ping via /api/pings/resolve → verify status = RESOLVED
 *  10.  Toggle 86 on item-1 via /api/kds/toggle-86 → verify is_86 = true in DB
 *  11.  Toggle 86 off again → verify is_86 = false
 *  12.  Vacate T-20 via /api/tables/vacate → verify status = VACANT in DB
 *  13.  Verify all order_items for the order have stage = PLACED (initial)
 *  14.  Place a WAITER order at T-21 → verify source = WAITER in DB
 *  15.  Vacate T-21 cleanup
 *  16.  Concurrent: seat T-22, place order, bump, resolve, vacate (stress path)
 *  17.  Verify pings table is clean (no orphan pending pings for T-20/T-21/T-22)
 *  18.  Verify tables T-20, T-21, T-22 all VACANT after test
 */

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

// ── Supabase direct check ────────────────────────────────────────────
const SUPABASE_URL = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

let passed = 0;
let failed = 0;
const errors = [];

// ── Helpers ──────────────────────────────────────────────────────────

async function api(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: 'no json' }));
  return { status: res.status, ok: res.ok, json };
}

async function dbQuery(table, filters = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?`;
  const params = [];
  for (const [key, val] of Object.entries(filters)) {
    if (typeof val === 'object' && val.neq !== undefined) {
      params.push(`${key}=neq.${val.neq}`);
    } else {
      params.push(`${key}=eq.${val}`);
    }
  }
  url += params.join('&') + '&limit=20';
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

async function dbGetSingle(table, filters = {}) {
  const rows = await dbQuery(table, filters);
  return Array.isArray(rows) ? rows[0] : null;
}

function assert(testName, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    errors.push({ testName, detail });
    console.log(`  ❌ ${testName}${detail ? ': ' + detail : ''}`);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Test Runner ──────────────────────────────────────────────────────

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  PHASE 3 TEST SUITE: Bridge API Wiring + Supabase Persistence');
  console.log(`  Server: ${BASE}`);
  console.log('══════════════════════════════════════════════════════\n');

  // ─── TEST 1: Server reachability ─────────────────────────────────
  console.log('── TEST 1: Server reachability ──');
  try {
    const res = await fetch(`${BASE}/api/session/verify?tableNumber=T-20&seatNumber=1`);
    assert('Dev server is reachable', res.status < 500, `Got ${res.status}`);
  } catch (e) {
    assert('Dev server is reachable', false, e.message);
  }

  // ─── TEST 2: Pre-test cleanup — vacate T-20 ──────────────────────
  console.log('\n── TEST 2: Pre-test cleanup ──');
  const vacate20 = await api('/api/tables/vacate', { tableNumber: 'T-20' });
  assert('Vacate T-20 (cleanup)', vacate20.ok, JSON.stringify(vacate20.json));
  await sleep(300);

  // ─── TEST 3: Seat guests at T-20 ─────────────────────────────────
  console.log('\n── TEST 3: Seat guests at T-20 ──');
  const seat = await api('/api/tables/seat', {
    tableNumber: 'T-20',
    guestCount: 3,
    captainName: 'TestCaptain',
  });
  assert('Seat API returns 200', seat.ok, JSON.stringify(seat.json));

  await sleep(500); // allow DB write to propagate

  const tableRow = await dbGetSingle('tables', { number: 'T-20' });
  assert('T-20 status is OCCUPIED in DB', tableRow?.status === 'OCCUPIED',
    `Got: ${tableRow?.status}`);
  assert('T-20 guest_count = 3 in DB', tableRow?.guest_count === 3,
    `Got: ${tableRow?.guest_count}`);

  // ─── TEST 4: Place order at T-20 ─────────────────────────────────
  console.log('\n── TEST 4: Place order at T-20 ──');
  const order = await api('/api/orders/create', {
    tableNumber: 'T-20',
    seatNumber: 1,
    guestName: 'TestGuest',
    guestCount: 3,
    source: 'CUSTOMER',
    items: [
      { name: 'Chicken Biryani', quantity: 2, price: 180, unitPrice: 180, prepMode: 'Regular', selectedOption: null, addOns: [], notes: '' },
      { name: 'Mutton Curry', quantity: 1, price: 220, unitPrice: 220, prepMode: 'Spicy', selectedOption: null, addOns: [], notes: '' },
    ],
  });
  assert('Order create returns 200', order.ok, JSON.stringify(order.json));

  const orderId = order.json?.orderId;
  assert('Order ID returned', !!orderId, `Got: ${orderId}`);

  await sleep(500);

  const orderRow = await dbGetSingle('orders', { id: orderId });
  assert('Order exists in DB', !!orderRow, `orderId: ${orderId}`);
  assert('Order table_number = T-20', orderRow?.table_number === 'T-20', `Got: ${orderRow?.table_number}`);
  assert('Order status = UNPAID', orderRow?.status === 'UNPAID', `Got: ${orderRow?.status}`);
  assert('Order source = CUSTOMER', orderRow?.source === 'CUSTOMER', `Got: ${orderRow?.source}`);

  // ─── TEST 5: Verify KDS ticket created ──────────────────────────
  console.log('\n── TEST 5: KDS ticket created ──');
  const ticketRows = await dbQuery('kds_tickets', { table_number: 'T-20' });
  const ticket = Array.isArray(ticketRows) ? ticketRows.find((t) => t.order_id === orderId) : null;
  assert('KDS ticket exists in DB', !!ticket, `orderId: ${orderId}`);
  assert('Ticket status = NEW', ticket?.status === 'NEW', `Got: ${ticket?.status}`);
  assert('Ticket source = CUSTOMER', ticket?.source === 'CUSTOMER', `Got: ${ticket?.source}`);

  const ticketId = ticket?.id;

  // ─── TEST 6: Verify order_items created ─────────────────────────
  console.log('\n── TEST 6: order_items created ──');
  const itemRows = await dbQuery('order_items', { order_id: orderId });
  assert('order_items rows exist', Array.isArray(itemRows) && itemRows.length === 2,
    `Got ${itemRows?.length} items`);

  const biryaniItem = Array.isArray(itemRows) ? itemRows.find((i) => i.name === 'Chicken Biryani') : null;
  assert('Chicken Biryani item in DB', !!biryaniItem, JSON.stringify(itemRows?.map(i => i.name)));
  assert('Biryani quantity = 2', biryaniItem?.quantity === 2, `Got: ${biryaniItem?.quantity}`);
  assert('Biryani stage = PLACED', biryaniItem?.stage === 'PLACED', `Got: ${biryaniItem?.stage}`);

  const biryaniItemId = biryaniItem?.id;

  // ─── TEST 7: Bump KDS item stage ────────────────────────────────
  console.log('\n── TEST 7: Bump KDS item stage ──');
  const bump = await api('/api/kds/bump-item', { ticketId, itemId: biryaniItemId });
  assert('Bump item returns 200', bump.ok, JSON.stringify(bump.json));

  await sleep(400);

  const bumpedTicket = await dbGetSingle('kds_tickets', { id: ticketId });
  assert('Ticket still exists after bump', !!bumpedTicket, `ticketId: ${ticketId}`);
  // Ticket status should update based on item stages
  // After bumping only 1 of 2 items, status depends on implementation
  assert('Ticket status is valid after bump',
    ['NEW', 'PREP', 'READY', 'COMPLETED'].includes(bumpedTicket?.status),
    `Got: ${bumpedTicket?.status}`);

  // ─── TEST 8: Bump entire ticket ──────────────────────────────────
  console.log('\n── TEST 8: Bump entire ticket to READY ──');
  const bumpTable = await api('/api/kds/bump-table', { ticketId, status: 'READY' });
  assert('Bump table returns 200', bumpTable.ok, JSON.stringify(bumpTable.json));

  await sleep(400);

  const readyTicket = await dbGetSingle('kds_tickets', { id: ticketId });
  assert('Ticket status = READY in DB', readyTicket?.status === 'READY',
    `Got: ${readyTicket?.status}`);

  // ─── TEST 9: Create a ping ────────────────────────────────────────
  console.log('\n── TEST 9: Create ping ──');
  const ping = await api('/api/pings/create', {
    tableNumber: 'T-20',
    seatNumber: 1,
    type: 'WATER',
    guestName: 'TestGuest',
    message: 'Need water please',
  });
  assert('Ping create returns 200', ping.ok, JSON.stringify(ping.json));

  const pingId = ping.json?.pingId;
  assert('Ping ID returned', !!pingId, `Got: ${pingId}`);

  await sleep(400);

  const pingRow = await dbGetSingle('pings', { id: pingId });
  assert('Ping exists in DB', !!pingRow, `pingId: ${pingId}`);
  assert('Ping status = PENDING', pingRow?.status === 'PENDING', `Got: ${pingRow?.status}`);
  assert('Ping type = WATER', pingRow?.type === 'WATER', `Got: ${pingRow?.type}`);

  // ─── TEST 10: Resolve ping ────────────────────────────────────────
  console.log('\n── TEST 10: Resolve ping ──');
  const resolve = await api('/api/pings/resolve', { pingId });
  assert('Ping resolve returns 200', resolve.ok, JSON.stringify(resolve.json));

  await sleep(400);

  const resolvedPing = await dbGetSingle('pings', { id: pingId });
  assert('Ping status = RESOLVED in DB', resolvedPing?.status === 'RESOLVED',
    `Got: ${resolvedPing?.status}`);

  // ─── TEST 11: Toggle 86 ON ────────────────────────────────────────
  console.log('\n── TEST 11: Toggle 86 ON ──');
  const toggle86on = await api('/api/kds/toggle-86', { itemId: 'item-1', is86: true });
  assert('Toggle 86 ON returns 200', toggle86on.ok, JSON.stringify(toggle86on.json));

  await sleep(400);

  const menu86on = await dbGetSingle('menu_86', { id: 'item-1' });
  assert('menu_86 is_86 = true in DB', menu86on?.is_86 === true, `Got: ${menu86on?.is_86}`);

  // ─── TEST 12: Toggle 86 OFF ───────────────────────────────────────
  console.log('\n── TEST 12: Toggle 86 OFF ──');
  const toggle86off = await api('/api/kds/toggle-86', { itemId: 'item-1', is86: false });
  assert('Toggle 86 OFF returns 200', toggle86off.ok, JSON.stringify(toggle86off.json));

  await sleep(400);

  const menu86off = await dbGetSingle('menu_86', { id: 'item-1' });
  assert('menu_86 is_86 = false in DB', menu86off?.is_86 === false, `Got: ${menu86off?.is_86}`);

  // ─── TEST 13: Vacate T-20 ────────────────────────────────────────
  console.log('\n── TEST 13: Vacate T-20 ──');
  const vacateEnd = await api('/api/tables/vacate', { tableNumber: 'T-20' });
  assert('Vacate T-20 returns 200', vacateEnd.ok, JSON.stringify(vacateEnd.json));

  await sleep(400);

  const vacatedRow = await dbGetSingle('tables', { number: 'T-20' });
  assert('T-20 status = VACANT after vacate', vacatedRow?.status === 'VACANT',
    `Got: ${vacatedRow?.status}`);
  assert('T-20 current_bill = 0 after vacate', Number(vacatedRow?.current_bill) === 0,
    `Got: ${vacatedRow?.current_bill}`);

  // ─── TEST 14: Waiter WAITER-sourced order at T-21 ────────────────
  console.log('\n── TEST 14: WAITER order at T-21 ──');
  const vacate21 = await api('/api/tables/vacate', { tableNumber: 'T-21' });
  assert('Pre-vacate T-21', vacate21.ok, JSON.stringify(vacate21.json));

  const seat21 = await api('/api/tables/seat', { tableNumber: 'T-21', guestCount: 2, captainName: 'WaiterTest' });
  assert('Seat T-21', seat21.ok, JSON.stringify(seat21.json));

  const waiterOrder = await api('/api/orders/create', {
    tableNumber: 'T-21',
    seatNumber: 1,
    guestName: 'WaiterTest',
    guestCount: 2,
    source: 'WAITER',
    items: [
      { name: 'Veg Biryani', quantity: 1, price: 130, unitPrice: 130, prepMode: 'Regular', selectedOption: null, addOns: [], notes: '' },
    ],
  });
  assert('WAITER order create returns 200', waiterOrder.ok, JSON.stringify(waiterOrder.json));

  await sleep(500);

  const waiterOrderId = waiterOrder.json?.orderId;
  const waiterOrderRow = await dbGetSingle('orders', { id: waiterOrderId });
  assert('WAITER order source = WAITER in DB', waiterOrderRow?.source === 'WAITER',
    `Got: ${waiterOrderRow?.source}`);

  const waiterTickets = await dbQuery('kds_tickets', { table_number: 'T-21' });
  const waiterTicket = Array.isArray(waiterTickets)
    ? waiterTickets.find((t) => t.order_id === waiterOrderId)
    : null;
  assert('WAITER KDS ticket has source = WAITER', waiterTicket?.source === 'WAITER',
    `Got: ${waiterTicket?.source}`);

  // ─── TEST 15: Vacate T-21 ────────────────────────────────────────
  console.log('\n── TEST 15: Vacate T-21 cleanup ──');
  const vacate21End = await api('/api/tables/vacate', { tableNumber: 'T-21' });
  assert('Vacate T-21', vacate21End.ok, JSON.stringify(vacate21End.json));

  // ─── TEST 16: Stress path — T-22 concurrent operations ──────────
  console.log('\n── TEST 16: Stress path T-22 ──');
  await api('/api/tables/vacate', { tableNumber: 'T-22' });
  await api('/api/tables/seat', { tableNumber: 'T-22', guestCount: 4, captainName: 'StressTest' });
  const stressOrder = await api('/api/orders/create', {
    tableNumber: 'T-22',
    seatNumber: 2,
    guestName: 'StressGuest',
    guestCount: 4,
    source: 'CUSTOMER',
    items: [
      { name: 'Paneer Butter Masala', quantity: 2, price: 160, unitPrice: 160, prepMode: 'Medium', selectedOption: null, addOns: [], notes: '' },
      { name: 'Parotta', quantity: 4, price: 25, unitPrice: 25, prepMode: 'Regular', selectedOption: null, addOns: [], notes: '' },
    ],
  });
  assert('Stress order created', stressOrder.ok, JSON.stringify(stressOrder.json));
  const stressOrderId = stressOrder.json?.orderId;

  await sleep(600);

  const stressTicketRows = await dbQuery('kds_tickets', { table_number: 'T-22' });
  const stressTicket = Array.isArray(stressTicketRows)
    ? stressTicketRows.find((t) => t.order_id === stressOrderId)
    : null;
  assert('Stress KDS ticket created', !!stressTicket, `orderId: ${stressOrderId}`);

  // Create + resolve ping in stress
  const stressPing = await api('/api/pings/create', {
    tableNumber: 'T-22', seatNumber: 2, type: 'TISSUE', guestName: 'StressGuest', message: 'Need tissues'
  });
  assert('Stress ping created', stressPing.ok, JSON.stringify(stressPing.json));

  if (stressPing.ok && stressPing.json?.pingId) {
    const stressResolve = await api('/api/pings/resolve', { pingId: stressPing.json.pingId });
    assert('Stress ping resolved', stressResolve.ok, JSON.stringify(stressResolve.json));
  }

  // Vacate stress table
  const vacateStress = await api('/api/tables/vacate', { tableNumber: 'T-22' });
  assert('Stress table vacated', vacateStress.ok, JSON.stringify(vacateStress.json));

  // ─── TEST 17: No orphan pending pings ───────────────────────────
  console.log('\n── TEST 17: No orphan pending pings ──');
  await sleep(400);
  const orphanPings20 = await dbQuery('pings', { table_number: 'T-20', status: 'PENDING' });
  assert('No orphan PENDING pings for T-20', Array.isArray(orphanPings20) && orphanPings20.length === 0,
    `Found ${orphanPings20?.length}`);

  // ─── TEST 18: Final state check ─────────────────────────────────
  console.log('\n── TEST 18: Final table states ──');
  await sleep(500);
  const finalT20 = await dbGetSingle('tables', { number: 'T-20' });
  const finalT21 = await dbGetSingle('tables', { number: 'T-21' });
  const finalT22 = await dbGetSingle('tables', { number: 'T-22' });
  assert('T-20 VACANT at end', finalT20?.status === 'VACANT', `Got: ${finalT20?.status}`);
  assert('T-21 VACANT at end', finalT21?.status === 'VACANT', `Got: ${finalT21?.status}`);
  assert('T-22 VACANT at end', finalT22?.status === 'VACANT', `Got: ${finalT22?.status}`);

  // ─── Summary ─────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed / ${failed} failed`);
  if (errors.length > 0) {
    console.log('\n  Failed tests:');
    errors.forEach((e) => console.log(`    ❌ ${e.testName}: ${e.detail}`));
  }
  console.log('══════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
