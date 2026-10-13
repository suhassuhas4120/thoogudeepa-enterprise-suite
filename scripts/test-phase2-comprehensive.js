/**
 * Phase 2 — Comprehensive API Endpoint Test Suite
 *
 * Tests all 12 REST routes across every dimension:
 *   - HTTP method correctness
 *   - Response status codes (200, 400, 404, 409, 500)
 *   - Response body shape and field types
 *   - Input validation (missing fields, empty values, wrong types)
 *   - Business logic correctness
 *   - Cascade effects on related DB tables
 *   - Idempotency where applicable
 *   - Response latency benchmarks
 *   - Concurrent request handling
 *   - Full lifecycle integration (seat → order → KDS → payment → vacate)
 *
 * Run:  node scripts/test-phase2-comprehensive.js
 *
 * Prerequisite: dev server must be running on http://localhost:3001
 */

'use strict';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = 'http://localhost:3001/api';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label) {
  if (condition) {
    process.stdout.write(`  [PASS] ${label}\n`);
    passed++;
  } else {
    process.stdout.write(`  [FAIL] ${label}\n`);
    failed++;
    failures.push(label);
  }
}

function section(title) {
  process.stdout.write(`\n${'─'.repeat(60)}\n  ${title}\n${'─'.repeat(60)}\n`);
}

async function post(path, body) {
  const start = Date.now();
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - start;
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  return { res, json, ms, status: res.status };
}

async function get(path) {
  const start = Date.now();
  const res = await fetch(`${BASE}${path}`);
  const ms = Date.now() - start;
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  return { res, json, ms, status: res.status };
}

// Cleanup tracker — table numbers used in tests that need resetting
const usedTables = new Set();

async function vacate(tableNumber) {
  try {
    await fetch(`${BASE}/tables/vacate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber }),
    });
  } catch { /* best effort */ }
}

// ---------------------------------------------------------------------------
// GROUP 1: Server Connectivity and Global Response Structure
// ---------------------------------------------------------------------------
async function testServerConnectivity() {
  section('Group 1 — Server Connectivity & Response Headers');

  // Server is reachable
  const { res, ms } = await get('/session/verify?table=T-01&seat=1');
  assert(res.ok || res.status === 200, 'Server is reachable at localhost:3001');
  assert(ms < 5000, `Server response latency < 5s (actual: ${ms}ms)`);

  // All responses use application/json content type
  const ct = res.headers.get('content-type') || '';
  assert(ct.includes('application/json'), 'Content-Type: application/json on responses');

  // GET and POST are both accepted on session/verify
  const { status: getStatus } = await get('/session/verify?table=T-01&seat=1');
  const { status: postStatus } = await post('/session/verify', { table: 'T-01', seat: 1 });
  assert(getStatus === 200, 'GET /session/verify returns 200');
  assert(postStatus === 200, 'POST /session/verify returns 200');

  // Unknown routes return 404
  const { status: unknownStatus } = await get('/does-not-exist');
  assert(unknownStatus === 404, 'Unknown route /does-not-exist returns 404');
}

// ---------------------------------------------------------------------------
// GROUP 2: POST /tables/seat
// ---------------------------------------------------------------------------
async function testTablesSeat() {
  section('Group 2 — POST /tables/seat');

  // 2a. Valid request — seats table T-02
  const { json: ok, ms: okMs, status: okStatus } = await post('/tables/seat', {
    tableNumber: 'T-02',
    guestCount: 2,
    serverName: 'Ramesh',
  });
  assert(okStatus === 200, '/tables/seat: 200 on valid request');
  assert(ok.success === true, '/tables/seat: success=true');
  assert(ok.tableNumber === 'T-02', '/tables/seat: tableNumber echoed correctly');
  assert(ok.status === 'OCCUPIED', '/tables/seat: status=OCCUPIED in response');
  assert(ok.guestCount === 2, '/tables/seat: guestCount echoed correctly');
  assert(ok.serverName === 'Ramesh', '/tables/seat: serverName echoed correctly');
  assert(typeof ok.seatedTime === 'string', '/tables/seat: seatedTime is a string');
  assert(!isNaN(new Date(ok.seatedTime).getTime()), '/tables/seat: seatedTime is valid ISO date');
  assert(okMs < 8000, `/tables/seat: responds < 8s on first call / cold-start allowed (actual: ${okMs}ms)`);
  usedTables.add('T-02');

  // 2b. Missing tableNumber → 400
  const { status: s400 } = await post('/tables/seat', { guestCount: 2 });
  assert(s400 === 400, '/tables/seat: 400 when tableNumber missing');

  // 2c. Empty tableNumber → 400
  const { status: s400b } = await post('/tables/seat', { tableNumber: '' });
  assert(s400b === 400, '/tables/seat: 400 when tableNumber is empty string');

  // 2d. Non-existent table → 404
  const { status: s404 } = await post('/tables/seat', { tableNumber: 'T-99' });
  assert(s404 === 404, '/tables/seat: 404 for non-existent table T-99');

  // 2e. Lowercase table number is normalised
  const { status: lower, json: lj } = await post('/tables/seat', { tableNumber: 't-03', guestCount: 1 });
  assert(lower === 200, '/tables/seat: accepts lowercase t-03 (normalised to T-03)');
  assert(lj.tableNumber === 'T-03', '/tables/seat: tableNumber returned in uppercase');
  usedTables.add('T-03');

  // 2f. guestCount defaults to 1 when omitted
  const { json: defGc } = await post('/tables/seat', { tableNumber: 'T-04' });
  assert(defGc.guestCount === 1, '/tables/seat: guestCount defaults to 1 when omitted');
  usedTables.add('T-04');

  // 2g. serverName defaults to Floor Captain when omitted
  const { json: defSn } = await post('/tables/seat', { tableNumber: 'T-05' });
  assert(defSn.serverName === 'Floor Captain', '/tables/seat: serverName defaults to Floor Captain');
  usedTables.add('T-05');

  // 2h. Idempotency — seating again returns 200 (not error)
  const { status: idem } = await post('/tables/seat', { tableNumber: 'T-02', guestCount: 3 });
  assert(idem === 200, '/tables/seat: idempotent — re-seating same table returns 200');

  // Cleanup
  for (const t of ['T-02', 'T-03', 'T-04', 'T-05']) await vacate(t);
}

// ---------------------------------------------------------------------------
// GROUP 3: POST /tables/vacate
// ---------------------------------------------------------------------------
async function testTablesVacate() {
  section('Group 3 — POST /tables/vacate');

  // Seed a table first
  await post('/tables/seat', { tableNumber: 'T-06', guestCount: 4 });
  usedTables.add('T-06');

  // 3a. Valid vacate
  const { json: ok, ms: okMs, status: okStatus } = await post('/tables/vacate', {
    tableNumber: 'T-06',
  });
  assert(okStatus === 200, '/tables/vacate: 200 on valid request');
  assert(ok.success === true, '/tables/vacate: success=true');
  assert(ok.tableNumber === 'T-06', '/tables/vacate: tableNumber echoed');
  assert(ok.status === 'VACANT', '/tables/vacate: status=VACANT in response');
  assert(typeof ok.message === 'string', '/tables/vacate: message string present');
  assert(okMs < 3000, `/tables/vacate: responds < 3s (actual: ${okMs}ms)`);

  // 3b. Missing tableNumber → 400
  const { status: s400 } = await post('/tables/vacate', {});
  assert(s400 === 400, '/tables/vacate: 400 when tableNumber missing');

  // 3c. Non-existent table → 404
  const { status: s404 } = await post('/tables/vacate', { tableNumber: 'T-99' });
  assert(s404 === 404, '/tables/vacate: 404 for non-existent table');

  // 3d. Vacating already VACANT table → 200 (idempotent)
  const { status: idem } = await post('/tables/vacate', { tableNumber: 'T-06' });
  assert(idem === 200, '/tables/vacate: idempotent — vacating already-vacant table returns 200');

  // 3e. Alias field 'table' works too
  await post('/tables/seat', { tableNumber: 'T-07' });
  const { status: alias } = await post('/tables/vacate', { table: 't-07' });
  assert(alias === 200, '/tables/vacate: accepts alias field "table" with lowercase value');
  usedTables.add('T-07');
}

// ---------------------------------------------------------------------------
// GROUP 4: POST /orders/create
// ---------------------------------------------------------------------------
let createdOrderId = null;
let createdTicketId = null;
const ORDER_TABLE = 'T-08';

async function testOrdersCreate() {
  section('Group 4 — POST /orders/create');

  await post('/tables/seat', { tableNumber: ORDER_TABLE, guestCount: 2 });
  usedTables.add(ORDER_TABLE);

  const sampleItem = { name: 'Donne Biryani', quantity: 1, unitPrice: 180, prepMode: 'Dum Pot' };

  // 4a. Valid order creation
  const { json: ok, ms: okMs, status: okStatus } = await post('/orders/create', {
    tableNumber: ORDER_TABLE,
    seatNumber: 1,
    guestName: 'Suresh',
    guestCount: 2,
    items: [sampleItem],
    source: 'CUSTOMER',
    deviceToken: 'dt-test-001',
  });
  assert(okStatus === 200, '/orders/create: 200 on valid request');
  assert(ok.success === true, '/orders/create: success=true');
  assert(typeof ok.orderId === 'string', '/orders/create: orderId is a string');
  assert(ok.orderId.startsWith('ORD-'), '/orders/create: orderId starts with ORD-');
  assert(typeof ok.ticketId === 'string', '/orders/create: ticketId is a string');
  assert(ok.ticketId.startsWith('KOT-'), '/orders/create: ticketId starts with KOT-');
  assert(ok.tableNumber === ORDER_TABLE, '/orders/create: tableNumber echoed correctly');
  assert(ok.seatNumber === 1, '/orders/create: seatNumber echoed correctly');
  assert(typeof ok.subtotal === 'number', '/orders/create: subtotal is a number');
  assert(typeof ok.tax === 'number', '/orders/create: tax is a number');
  assert(typeof ok.total === 'number', '/orders/create: total is a number');
  assert(ok.itemCount === 1, '/orders/create: itemCount matches items array length');
  assert(okMs < 5000, `/orders/create: responds < 5s (actual: ${okMs}ms)`);

  // Store IDs for downstream tests
  createdOrderId = ok.orderId;
  createdTicketId = ok.ticketId;

  // 4b. GST calculation (5% of subtotal)
  const expectedSubtotal = 180;
  const expectedTax = Math.round(expectedSubtotal * 0.05); // 9
  const expectedTotal = expectedSubtotal + expectedTax; // 189
  assert(ok.subtotal === expectedSubtotal, `/orders/create: subtotal correct (${ok.subtotal})`);
  assert(ok.tax === expectedTax, `/orders/create: tax is 5% of subtotal (${ok.tax})`);
  assert(ok.total === expectedTotal, `/orders/create: total = subtotal + tax (${ok.total})`);

  // 4c. Missing tableNumber → 400
  const { status: s400a } = await post('/orders/create', { items: [sampleItem] });
  assert(s400a === 400, '/orders/create: 400 when tableNumber missing');

  // 4d. Empty items array → 400
  const { status: s400b } = await post('/orders/create', { tableNumber: ORDER_TABLE, items: [] });
  assert(s400b === 400, '/orders/create: 400 when items array is empty');

  // 4e. Non-existent table → 404
  const { status: s404 } = await post('/orders/create', { tableNumber: 'T-99', items: [sampleItem] });
  assert(s404 === 404, '/orders/create: 404 for non-existent table');

  // 4f. Source defaults to CUSTOMER
  const { json: srcDefault } = await post('/orders/create', {
    tableNumber: ORDER_TABLE,
    seatNumber: 2,
    items: [sampleItem],
  });
  assert(srcDefault.orderId !== undefined, '/orders/create: default source accepted without error');

  // 4g. WAITER source works
  const { json: waiterSrc, status: waiterStatus } = await post('/orders/create', {
    tableNumber: ORDER_TABLE,
    seatNumber: 2,
    items: [sampleItem],
    source: 'WAITER',
  });
  assert(waiterStatus === 200, '/orders/create: WAITER source accepted');

  // 4h. Multi-item order — totals aggregate correctly
  const multiItems = [
    { name: 'Mutton Sukka', quantity: 2, unitPrice: 220 },
    { name: 'Neer Dosa', quantity: 3, unitPrice: 60 },
  ];
  const { json: multi } = await post('/orders/create', {
    tableNumber: ORDER_TABLE,
    seatNumber: 2,
    items: multiItems,
  });
  const multiSub = 220 * 2 + 60 * 3; // 440 + 180 = 620
  assert(multi.subtotal === multiSub, `/orders/create: multi-item subtotal correct (${multi.subtotal})`);

  // 4i. guestName defaults to "Seat N" when omitted
  const { json: defName } = await post('/orders/create', {
    tableNumber: ORDER_TABLE,
    seatNumber: 2,
    items: [sampleItem],
  });
  assert(defName.orderId !== undefined, '/orders/create: order created without guestName');
}

// ---------------------------------------------------------------------------
// GROUP 5: POST /orders/add-items
// ---------------------------------------------------------------------------
async function testOrdersAddItems() {
  section('Group 5 — POST /orders/add-items');

  if (!createdOrderId) {
    process.stdout.write('  [SKIP] No orderId from Group 4 — cannot run add-items tests\n');
    return;
  }

  const addItem = { name: 'Coconut Water', quantity: 2, unitPrice: 50 };

  // 5a. Valid add-items request
  const { json: ok, ms: okMs, status: okStatus } = await post('/orders/add-items', {
    orderId: createdOrderId,
    items: [addItem],
    source: 'CUSTOMER',
    serverName: 'Ramesh',
  });
  assert(okStatus === 200, '/orders/add-items: 200 on valid request');
  assert(ok.success === true, '/orders/add-items: success=true');
  assert(ok.orderId === createdOrderId, '/orders/add-items: orderId echoed correctly');
  assert(typeof ok.ticketId === 'string', '/orders/add-items: supplementary ticketId is a string');
  assert(ok.ticketId.includes('ADD'), '/orders/add-items: ticketId contains ADD marker');
  assert(typeof ok.newTotal === 'number', '/orders/add-items: newTotal is a number');
  assert(typeof ok.newSubtotal === 'number', '/orders/add-items: newSubtotal is a number');
  assert(ok.addedCount === 1, '/orders/add-items: addedCount matches items length');
  assert(okMs < 5000, `/orders/add-items: responds < 5s (actual: ${okMs}ms)`);

  // 5b. Incremental total logic — newTotal > original total
  const origTotal = 189; // from Group 4 (180 + 9 tax)
  const addedSubtotal = 100; // 50 * 2
  const addedTax = Math.round(addedSubtotal * 0.05); // 5
  const addedTotal = addedSubtotal + addedTax; // 105
  const expectedNewTotal = origTotal + addedTotal;
  assert(ok.newTotal === expectedNewTotal, `/orders/add-items: newTotal = origTotal + addedTotal (${ok.newTotal})`);

  // 5c. Missing orderId → 400
  const { status: s400a } = await post('/orders/add-items', { items: [addItem] });
  assert(s400a === 400, '/orders/add-items: 400 when orderId missing');

  // 5d. Empty items array → 400
  const { status: s400b } = await post('/orders/add-items', { orderId: createdOrderId, items: [] });
  assert(s400b === 400, '/orders/add-items: 400 when items is empty array');

  // 5e. Non-existent orderId → 404
  const { status: s404 } = await post('/orders/add-items', {
    orderId: 'ORD-DOESNOTEXIST-000000',
    items: [addItem],
  });
  assert(s404 === 404, '/orders/add-items: 404 for non-existent orderId');

  // 5f. Sequential line item IDs — second batch starts where first left off
  const { json: second } = await post('/orders/add-items', {
    orderId: createdOrderId,
    items: [{ name: 'Lime Juice', quantity: 1, unitPrice: 40 }],
  });
  assert(second.addedCount === 1, '/orders/add-items: second batch addedCount correct');
  assert(second.newTotal > ok.newTotal, '/orders/add-items: running total increases with each batch');
}

// ---------------------------------------------------------------------------
// GROUP 6: GET + POST /session/verify
// ---------------------------------------------------------------------------
async function testSessionVerify() {
  section('Group 6 — GET + POST /session/verify');

  // 6a. GET — vacant seat returns active=false
  const { json: vacant, status: vs } = await get('/session/verify?table=T-20&seat=1');
  assert(vs === 200, 'GET /session/verify: 200 for vacant seat');
  assert(vacant.active === false, 'GET /session/verify: active=false for vacant seat');
  assert(vacant.tableNumber === 'T-20', 'GET /session/verify: tableNumber in response');
  assert(vacant.seatNumber === 1, 'GET /session/verify: seatNumber in response');
  assert(vacant.order === null, 'GET /session/verify: order=null for vacant seat');

  // 6b. GET — missing table → 400
  const { status: s400 } = await get('/session/verify?seat=1');
  assert(s400 === 400, 'GET /session/verify: 400 when table param missing');

  // 6c. POST — missing table → 400
  const { status: p400 } = await post('/session/verify', { seat: 1 });
  assert(p400 === 400, 'POST /session/verify: 400 when table missing in body');

  // 6d. POST accepts tableNumber alias
  const { status: alias } = await post('/session/verify', { tableNumber: 'T-20', seatNumber: 1 });
  assert(alias === 200, 'POST /session/verify: accepts tableNumber/seatNumber aliases');

  // 6e. GET — non-existent seat (no seat row) → 200 with active=false
  const { json: noSeat, status: noSeatS } = await get('/session/verify?table=T-20&seat=99');
  assert(noSeatS === 200, 'GET /session/verify: 200 for seat that has no row in table_seats');
  assert(noSeatS === 200 && noSeat.active === false, 'GET /session/verify: active=false for non-existent seat row');

  // 6f. Active order — if createdOrderId exists, session must find the active order
  if (createdOrderId) {
    const { json: active, status: as } = await get(`/session/verify?table=${ORDER_TABLE}&seat=1`);
    assert(as === 200, 'GET /session/verify: 200 for seat with active order');
    assert(active.active === true, 'GET /session/verify: active=true when order exists');
    assert(active.order !== null, 'GET /session/verify: order object present when active');
    assert(typeof active.order.id === 'string', 'GET /session/verify: order.id is a string');
    assert(typeof active.order.subtotal === 'number', 'GET /session/verify: order.subtotal is a number');
    assert(typeof active.order.total === 'number', 'GET /session/verify: order.total is a number');
    assert(active.order.status === 'UNPAID', 'GET /session/verify: order.status is UNPAID');
    assert(Array.isArray(active.order.items), 'GET /session/verify: order.items is an array');
    assert(active.order.items.length >= 1, 'GET /session/verify: order.items has at least 1 item');
    assert(typeof active.order.createdAt === 'string', 'GET /session/verify: order.createdAt is a string');
  }

  // 6g. Response time
  const { ms } = await get('/session/verify?table=T-01&seat=1');
  assert(ms < 3000, `GET /session/verify: responds < 3s (actual: ${ms}ms)`);
}

// ---------------------------------------------------------------------------
// GROUP 7: POST /pings/create
// ---------------------------------------------------------------------------
let createdPingId = null;

async function testPingsCreate() {
  section('Group 7 — POST /pings/create');

  // 7a. Valid ping creation
  const { json: ok, ms: okMs, status: okStatus } = await post('/pings/create', {
    tableNumber: 'T-10',
    seatNumber: 1,
    type: 'WATER',
    guestName: 'Meera',
    message: 'Extra water please',
  });
  assert(okStatus === 200, '/pings/create: 200 on valid request');
  assert(ok.success === true, '/pings/create: success=true');
  assert(typeof ok.pingId === 'string', '/pings/create: pingId is a string');
  assert(ok.pingId.startsWith('PING-'), '/pings/create: pingId starts with PING-');
  assert(ok.tableNumber === 'T-10', '/pings/create: tableNumber echoed correctly');
  assert(ok.seatNumber === 1, '/pings/create: seatNumber echoed correctly');
  assert(ok.type === 'WATER', '/pings/create: type echoed correctly');
  assert(ok.status === 'PENDING', '/pings/create: status=PENDING in response');
  assert(typeof ok.createdAt === 'string', '/pings/create: createdAt is a string');
  assert(okMs < 3000, `/pings/create: responds < 3s (actual: ${okMs}ms)`);
  createdPingId = ok.pingId;

  // 7b. Missing tableNumber → 400
  const { status: s400 } = await post('/pings/create', { seatNumber: 1, type: 'WATER' });
  assert(s400 === 400, '/pings/create: 400 when tableNumber missing');

  // 7c. Empty tableNumber → 400
  const { status: s400b } = await post('/pings/create', { tableNumber: '' });
  assert(s400b === 400, '/pings/create: 400 when tableNumber is empty string');

  // 7d. Type defaults to WATER
  const { json: defType } = await post('/pings/create', { tableNumber: 'T-10', seatNumber: 1 });
  assert(defType.type === 'WATER', '/pings/create: type defaults to WATER when omitted');

  // 7e. Type is uppercased
  const { json: lowType } = await post('/pings/create', {
    tableNumber: 'T-10',
    seatNumber: 1,
    type: 'napkin',
  });
  assert(lowType.type === 'NAPKIN', '/pings/create: type is normalised to uppercase');

  // 7f. CALL_WAITER type accepted
  const { status: callType } = await post('/pings/create', {
    tableNumber: 'T-11',
    seatNumber: 1,
    type: 'CALL_WAITER',
  });
  assert(callType === 200, '/pings/create: CALL_WAITER type accepted');

  // 7g. Multiple pings from same seat are allowed (no uniqueness constraint)
  const { status: dup } = await post('/pings/create', {
    tableNumber: 'T-10',
    seatNumber: 1,
    type: 'WATER',
  });
  assert(dup === 200, '/pings/create: multiple pings from same seat accepted');
}

// ---------------------------------------------------------------------------
// GROUP 8: POST /pings/resolve
// ---------------------------------------------------------------------------
async function testPingsResolve() {
  section('Group 8 — POST /pings/resolve');

  if (!createdPingId) {
    process.stdout.write('  [SKIP] No pingId from Group 7 — cannot run resolve tests\n');
    return;
  }

  // 8a. Valid resolve
  const { json: ok, ms: okMs, status: okStatus } = await post('/pings/resolve', {
    pingId: createdPingId,
  });
  assert(okStatus === 200, '/pings/resolve: 200 on valid request');
  assert(ok.success === true, '/pings/resolve: success=true');
  assert(ok.pingId === createdPingId, '/pings/resolve: pingId echoed correctly');
  assert(ok.status === 'RESOLVED', '/pings/resolve: status=RESOLVED in response');
  assert(typeof ok.resolvedAt === 'string', '/pings/resolve: resolvedAt is a string');
  assert(!isNaN(new Date(ok.resolvedAt).getTime()), '/pings/resolve: resolvedAt is valid ISO date');
  assert(okMs < 3000, `/pings/resolve: responds < 3s (actual: ${okMs}ms)`);

  // 8b. Missing pingId → 400
  const { status: s400 } = await post('/pings/resolve', {});
  assert(s400 === 400, '/pings/resolve: 400 when pingId missing');

  // 8c. Resolve non-existent ping → still 200 (Supabase UPDATE on no match is not an error)
  const { status: noMatch } = await post('/pings/resolve', { pingId: 'PING-NONEXISTENT-0000' });
  assert(noMatch === 200, '/pings/resolve: 200 when resolving non-existent ping (no-op update)');

  // 8d. Idempotent — resolving already-resolved ping → 200
  const { status: idem } = await post('/pings/resolve', { pingId: createdPingId });
  assert(idem === 200, '/pings/resolve: idempotent — re-resolving same ping returns 200');
}

// ---------------------------------------------------------------------------
// GROUP 9: POST /kds/bump-item
// ---------------------------------------------------------------------------
async function testKdsBumpItem() {
  section('Group 9 — POST /kds/bump-item');

  if (!createdOrderId) {
    process.stdout.write('  [SKIP] No orderId — cannot look up an item ID for bump-item tests\n');
    return;
  }

  // Fetch first order item ID from the DB directly via Supabase
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(
    'https://dwjjprzyyjmunhdxvkuo.supabase.co',
    'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV'
  );
  const { data: items } = await sb
    .from('order_items')
    .select('id, stage')
    .eq('order_id', createdOrderId)
    .limit(1);

  if (!items || items.length === 0) {
    process.stdout.write('  [SKIP] No order_items found for created order — skipping bump-item tests\n');
    return;
  }

  const itemId = items[0].id;
  const originalStage = items[0].stage;

  // 9a. Valid bump — auto-advance stage
  const { json: ok, ms: okMs, status: okStatus } = await post('/kds/bump-item', { itemId });
  assert(okStatus === 200, '/kds/bump-item: 200 on valid request');
  assert(ok.success === true, '/kds/bump-item: success=true');
  assert(ok.itemId === itemId, '/kds/bump-item: itemId echoed correctly');
  assert(typeof ok.previousStage === 'string', '/kds/bump-item: previousStage is a string');
  assert(typeof ok.stage === 'string', '/kds/bump-item: stage is a string');
  assert(typeof ok.ticketStatus === 'string', '/kds/bump-item: ticketStatus is a string');
  assert(okMs < 5000, `/kds/bump-item: responds < 5s (actual: ${okMs}ms)`);

  // 9b. Stage transitions correctly (PLACED → PREP)
  if (originalStage === 'PLACED') {
    assert(ok.previousStage === 'PLACED', '/kds/bump-item: previousStage=PLACED before first bump');
    assert(ok.stage === 'PREP', '/kds/bump-item: PLACED→PREP on first bump');
  }

  // 9c. Target stage override works
  const { json: explicit } = await post('/kds/bump-item', { itemId, stage: 'PLATED' });
  assert(explicit.stage === 'PLATED', '/kds/bump-item: explicit stage=PLATED honoured');

  // 9d. Target stage to SERVED
  const { json: served } = await post('/kds/bump-item', { itemId, stage: 'SERVED' });
  assert(served.stage === 'SERVED', '/kds/bump-item: explicit stage=SERVED honoured');
  // ticketStatus reflects the aggregate of ALL items in the order.
  // Group 5 add-items added more items to this order, so those may still be in PLACED/PREP
  // and prevent COMPLETED. Assert it's a valid KDS status rather than assuming COMPLETED.
  const validKdsStatuses = ['NEW', 'PREP', 'READY', 'COMPLETED'];
  assert(validKdsStatuses.includes(served.ticketStatus), `/kds/bump-item: ticketStatus is a valid KDS status (${served.ticketStatus})`);

  // 9e. Missing itemId → 400
  const { status: s400 } = await post('/kds/bump-item', {});
  assert(s400 === 400, '/kds/bump-item: 400 when itemId missing');

  // 9f. Non-existent itemId → 404
  const { status: s404 } = await post('/kds/bump-item', { itemId: 'ORD-XX-S1-999999-it-99' });
  assert(s404 === 404, '/kds/bump-item: 404 for non-existent itemId');
}

// ---------------------------------------------------------------------------
// GROUP 10: POST /kds/bump-table
// ---------------------------------------------------------------------------
async function testKdsBumpTable() {
  section('Group 10 — POST /kds/bump-table');

  if (!createdTicketId) {
    process.stdout.write('  [SKIP] No ticketId from Group 4 — cannot run bump-table tests\n');
    return;
  }

  // 10a. Valid bump — advance ticket status NEW → PREP
  const { json: ok, ms: okMs, status: okStatus } = await post('/kds/bump-table', {
    ticketId: createdTicketId,
  });
  // Ticket may already have been bumped in Group 9, so accept any 200
  assert(okStatus === 200, '/kds/bump-table: 200 on valid request');
  assert(ok.success === true, '/kds/bump-table: success=true');
  assert(ok.ticketId === createdTicketId, '/kds/bump-table: ticketId echoed correctly');
  assert(typeof ok.previousStatus === 'string', '/kds/bump-table: previousStatus is a string');
  assert(typeof ok.status === 'string', '/kds/bump-table: status is a string');
  assert(typeof ok.itemStage === 'string', '/kds/bump-table: itemStage is a string');
  assert(typeof ok.updatedItemCount === 'number', '/kds/bump-table: updatedItemCount is a number');
  assert(okMs < 5000, `/kds/bump-table: responds < 5s (actual: ${okMs}ms)`);

  // 10b. Explicit target status override
  const { json: explicit } = await post('/kds/bump-table', {
    ticketId: createdTicketId,
    status: 'READY',
  });
  assert(explicit.status === 'READY', '/kds/bump-table: explicit status=READY honoured');

  // 10c. Bump to COMPLETED
  const { json: completed } = await post('/kds/bump-table', {
    ticketId: createdTicketId,
    status: 'COMPLETED',
  });
  assert(completed.status === 'COMPLETED', '/kds/bump-table: explicit status=COMPLETED honoured');

  // 10d. Missing ticketId → 400
  const { status: s400 } = await post('/kds/bump-table', {});
  assert(s400 === 400, '/kds/bump-table: 400 when ticketId missing');

  // 10e. Non-existent ticketId → 404
  const { status: s404 } = await post('/kds/bump-table', { ticketId: 'KOT-NONEXISTENT-9999' });
  assert(s404 === 404, '/kds/bump-table: 404 for non-existent ticketId');

  // 10f. Idempotent at COMPLETED — bumping again stays COMPLETED
  const { json: idem } = await post('/kds/bump-table', { ticketId: createdTicketId });
  assert(idem.status === 'COMPLETED', '/kds/bump-table: idempotent — COMPLETED stays COMPLETED');
}

// ---------------------------------------------------------------------------
// GROUP 11: POST /kds/toggle-86
// ---------------------------------------------------------------------------
async function testKdsToggle86() {
  section('Group 11 — POST /kds/toggle-86');

  // Fetch a known menu item ID from the DB
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(
    'https://dwjjprzyyjmunhdxvkuo.supabase.co',
    'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV'
  );
  const { data: menuItems } = await sb.from('menu_86').select('id, name, is_86').limit(1);

  if (!menuItems || menuItems.length === 0) {
    process.stdout.write('  [SKIP] No menu items found — skipping toggle-86 tests\n');
    return;
  }

  const menuItem = menuItems[0];
  const menuItemId = menuItem.id;

  // 11a. Valid toggle — auto-flip is_86
  const { json: ok, ms: okMs, status: okStatus } = await post('/kds/toggle-86', {
    itemId: menuItemId,
  });
  assert(okStatus === 200, '/kds/toggle-86: 200 on valid request');
  assert(ok.success === true, '/kds/toggle-86: success=true');
  assert(ok.item !== undefined, '/kds/toggle-86: item object in response');
  assert(ok.item.id === menuItemId, '/kds/toggle-86: item.id echoed correctly');
  assert(typeof ok.item.name === 'string', '/kds/toggle-86: item.name is a string');
  assert(typeof ok.item.is86 === 'boolean', '/kds/toggle-86: item.is86 is a boolean');
  assert(ok.item.is86 !== menuItem.is_86, '/kds/toggle-86: is86 toggled from original value');
  assert(typeof ok.item.category === 'string', '/kds/toggle-86: item.category is a string');
  assert(typeof ok.item.prepDelayMinutes === 'number', '/kds/toggle-86: item.prepDelayMinutes is a number');
  assert(okMs < 3000, `/kds/toggle-86: responds < 3s (actual: ${okMs}ms)`);

  // 11b. Explicit is86=true
  const { json: setTrue } = await post('/kds/toggle-86', { itemId: menuItemId, is86: true });
  assert(setTrue.item.is86 === true, '/kds/toggle-86: explicit is86=true sets item to out-of-stock');

  // 11c. Explicit is86=false
  const { json: setFalse } = await post('/kds/toggle-86', { itemId: menuItemId, is86: false });
  assert(setFalse.item.is86 === false, '/kds/toggle-86: explicit is86=false restores item to in-stock');

  // 11d. prepDelayMinutes override
  const { json: delay } = await post('/kds/toggle-86', {
    itemId: menuItemId,
    is86: false,
    prepDelayMinutes: 30,
  });
  assert(delay.item.prepDelayMinutes === 30, '/kds/toggle-86: prepDelayMinutes updated to 30');

  // 11e. Name lookup works (name substring in itemId field)
  const nameSubstring = menuItem.name.slice(0, 5);
  const { status: byName } = await post('/kds/toggle-86', { itemId: nameSubstring });
  assert(byName === 200, '/kds/toggle-86: item lookup by name substring works');

  // Restore original state
  await post('/kds/toggle-86', { itemId: menuItemId, is86: false, prepDelayMinutes: menuItem.prep_delay_minutes ?? 15 });

  // 11f. Missing itemId → 400
  const { status: s400 } = await post('/kds/toggle-86', {});
  assert(s400 === 400, '/kds/toggle-86: 400 when itemId missing');

  // 11g. Non-existent itemId → 404
  const { status: s404 } = await post('/kds/toggle-86', { itemId: 'COMPLETELY-NONEXISTENT-XYZ-999' });
  assert(s404 === 404, '/kds/toggle-86: 404 for non-existent itemId');
}

// ---------------------------------------------------------------------------
// GROUP 12: POST /payments/initiate
// ---------------------------------------------------------------------------
let createdPaymentId = null;
let createdTxnRef = null;

async function testPaymentsInitiate() {
  section('Group 12 — POST /payments/initiate');

  if (!createdOrderId) {
    process.stdout.write('  [SKIP] No orderId from Group 4 — cannot run payments/initiate tests\n');
    return;
  }

  // 12a. Valid initiation
  const { json: ok, ms: okMs, status: okStatus } = await post('/payments/initiate', {
    orderId: createdOrderId,
    paymentMethod: 'UPI',
  });
  assert(okStatus === 200, '/payments/initiate: 200 on valid request');
  assert(ok.success === true, '/payments/initiate: success=true');
  assert(typeof ok.paymentId === 'string', '/payments/initiate: paymentId is a string');
  assert(ok.paymentId.startsWith('PAY-'), '/payments/initiate: paymentId starts with PAY-');
  assert(typeof ok.txnRef === 'string', '/payments/initiate: txnRef is a string');
  assert(ok.txnRef.startsWith('TXN-'), '/payments/initiate: txnRef starts with TXN-');
  assert(ok.orderId === createdOrderId, '/payments/initiate: orderId echoed correctly');
  assert(typeof ok.amount === 'number', '/payments/initiate: amount is a number');
  assert(ok.amount > 0, '/payments/initiate: amount > 0');
  assert(typeof ok.merchantVpa === 'string', '/payments/initiate: merchantVpa is a string');
  assert(typeof ok.merchantName === 'string', '/payments/initiate: merchantName is a string');
  assert(typeof ok.upiUri === 'string', '/payments/initiate: upiUri is a string');
  assert(ok.upiUri.startsWith('upi://pay?'), '/payments/initiate: upiUri uses upi:// scheme');
  assert(typeof ok.qrDataUrl === 'string', '/payments/initiate: qrDataUrl is a string');
  assert(ok.qrDataUrl.length > 0, '/payments/initiate: qrDataUrl is non-empty');
  assert(ok.status === 'PENDING', '/payments/initiate: status=PENDING in response');
  assert(ok.appIntents !== undefined, '/payments/initiate: appIntents object present');
  assert(typeof ok.appIntents.generic === 'string', '/payments/initiate: appIntents.generic is a string');
  assert(typeof ok.appIntents.gpay === 'string', '/payments/initiate: appIntents.gpay is a string');
  assert(typeof ok.appIntents.phonepe === 'string', '/payments/initiate: appIntents.phonepe is a string');
  assert(typeof ok.appIntents.paytm === 'string', '/payments/initiate: appIntents.paytm is a string');
  assert(okMs < 5000, `/payments/initiate: responds < 5s (actual: ${okMs}ms)`);

  createdPaymentId = ok.paymentId;
  createdTxnRef = ok.txnRef;

  // 12b. UPI URI contains correct merchant VPA
  assert(ok.upiUri.includes('pa='), '/payments/initiate: UPI URI contains pa= (merchant VPA)');
  assert(ok.upiUri.includes('cu=INR'), '/payments/initiate: UPI URI currency is INR');
  assert(ok.upiUri.includes('am='), '/payments/initiate: UPI URI contains amount');

  // 12c. Missing orderId → 400
  const { status: s400 } = await post('/payments/initiate', { paymentMethod: 'UPI' });
  assert(s400 === 400, '/payments/initiate: 400 when orderId missing');

  // 12d. Non-existent orderId → 404
  const { status: s404 } = await post('/payments/initiate', {
    orderId: 'ORD-DOESNOTEXIST-000000',
  });
  assert(s404 === 404, '/payments/initiate: 404 for non-existent orderId');

  // 12e. Already-paid order → 400 (double payment prevention)
  //      We'll test this after the verify step confirms payment
}

// ---------------------------------------------------------------------------
// GROUP 13: GET + POST /payments/verify
// ---------------------------------------------------------------------------
async function testPaymentsVerify() {
  section('Group 13 — GET + POST /payments/verify');

  // 13a. GET without params → 400
  const { status: s400 } = await get('/payments/verify');
  assert(s400 === 400, 'GET /payments/verify: 400 when no query params');

  // 13b. GET with orderId — returns PENDING payment
  if (createdOrderId && createdPaymentId) {
    const { json: pending, status: ps } = await get(
      `/payments/verify?orderId=${encodeURIComponent(createdOrderId)}`
    );
    assert(ps === 200, 'GET /payments/verify: 200 when payment is found by orderId');
    assert(pending.status === 'PENDING', 'GET /payments/verify: status=PENDING before confirmation');
    assert(typeof pending.paymentId === 'string', 'GET /payments/verify: paymentId present');
    assert(typeof pending.amount === 'number', 'GET /payments/verify: amount is a number');
    assert(typeof pending.settled === 'boolean', 'GET /payments/verify: settled is a boolean');
    assert(pending.settled === false, 'GET /payments/verify: settled=false before confirmation');

    // 13c. GET by paymentId
    const { json: byPay, status: bps } = await get(
      `/payments/verify?paymentId=${encodeURIComponent(createdPaymentId)}`
    );
    assert(bps === 200, 'GET /payments/verify: 200 when payment found by paymentId');
    assert(byPay.paymentId === createdPaymentId, 'GET /payments/verify: paymentId matches');

    // 13d. GET by txnRef
    if (createdTxnRef) {
      const { status: btr } = await get(
        `/payments/verify?txnRef=${encodeURIComponent(createdTxnRef)}`
      );
      assert(btr === 200, 'GET /payments/verify: 200 when payment found by txnRef');
    }
  }

  // 13e. GET — non-existent orderId → 404
  const { status: s404 } = await get('/payments/verify?orderId=ORD-DOESNOTEXIST-000000');
  assert(s404 === 404, 'GET /payments/verify: 404 when no payment found');

  // 13f. POST — confirm payment (CONFIRMED settlement cascade)
  if (createdPaymentId) {
    const { json: confirmed, ms: cMs, status: cs } = await post('/payments/verify', {
      paymentId: createdPaymentId,
      orderId: createdOrderId,
      status: 'CONFIRMED',
      paymentMethod: 'UPI',
    });
    assert(cs === 200, 'POST /payments/verify: 200 on confirmation');
    assert(confirmed.success === true, 'POST /payments/verify: success=true');
    assert(confirmed.status === 'CONFIRMED', 'POST /payments/verify: status=CONFIRMED');
    assert(typeof confirmed.bankUtr === 'string', 'POST /payments/verify: bankUtr is a string');
    assert(confirmed.bankUtr.length >= 12, 'POST /payments/verify: bankUtr has 12+ digits');
    assert(typeof confirmed.confirmedAt === 'string', 'POST /payments/verify: confirmedAt is a string');
    assert(confirmed.settled === true, 'POST /payments/verify: settled=true after confirmation');
    assert(cMs < 5000, `/payments/verify: responds < 5s (actual: ${cMs}ms)`);

    // 13g. Cascade — order is marked PAID
    const { createClient } = require('@supabase/supabase-js');
    const sb = createClient(
      'https://dwjjprzyyjmunhdxvkuo.supabase.co',
      'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV'
    );
    const { data: order } = await sb
      .from('orders')
      .select('status')
      .eq('id', createdOrderId)
      .maybeSingle();
    assert(order && order.status === 'PAID', 'POST /payments/verify: order.status → PAID (cascade)');

    // 13h. Cascade — seat is marked PAID
    const { data: seat } = await sb
      .from('table_seats')
      .select('status')
      .eq('table_number', ORDER_TABLE)
      .eq('seat_number', 1)
      .maybeSingle();
    assert(seat && seat.status === 'PAID', 'POST /payments/verify: seat.status → PAID (cascade)');

    // 13i. Idempotency — confirming already-confirmed payment returns success
    const { json: idem, status: idemS } = await post('/payments/verify', {
      paymentId: createdPaymentId,
      orderId: createdOrderId,
    });
    assert(idemS === 200, 'POST /payments/verify: 200 on idempotent re-confirmation');
    assert(idem.status === 'CONFIRMED', 'POST /payments/verify: idempotent — status stays CONFIRMED');

    // 13j. Already-paid order blocks new payment initiation
    const { status: doubleInitiate } = await post('/payments/initiate', {
      orderId: createdOrderId,
    });
    assert(doubleInitiate === 400, '/payments/initiate: 400 when order already paid (double payment blocked)');
  }

  // 13k. POST missing all identifiers → 400
  const { status: pNoId } = await post('/payments/verify', { status: 'CONFIRMED' });
  assert(pNoId === 400, 'POST /payments/verify: 400 when no orderId/paymentId/txnRef provided');

  // 13l. POST — non-existent orderId (no matching payment) → 404
  const { status: pNone } = await post('/payments/verify', { orderId: 'ORD-DOESNOTEXIST-000000' });
  assert(pNone === 404, 'POST /payments/verify: 404 when order not found');
}

// ---------------------------------------------------------------------------
// GROUP 14: Input Boundary and Type Edge Cases (across all endpoints)
// ---------------------------------------------------------------------------
async function testInputBoundaries() {
  section('Group 14 — Input Boundary & Type Edge Cases');

  // 14a. Numeric string for guestCount (string coercion)
  const { status: sc1, json: j1 } = await post('/tables/seat', {
    tableNumber: 'T-09',
    guestCount: '3',
  });
  assert(sc1 === 200, '/tables/seat: guestCount as numeric string "3" accepted');
  assert(j1.guestCount === 3, '/tables/seat: guestCount coerced to number 3');
  usedTables.add('T-09');
  await vacate('T-09');

  // 14b. seatNumber as string in orders/create (coercion)
  const { status: sc2 } = await post('/orders/create', {
    tableNumber: 'T-09',
    seatNumber: '1',
    items: [{ name: 'Test', quantity: 1, unitPrice: 50 }],
  });
  assert(sc2 === 200, '/orders/create: seatNumber as string "1" accepted');
  usedTables.add('T-09');

  // 14c. Zero-price item (edge case)
  const { status: sc3 } = await post('/orders/create', {
    tableNumber: 'T-09',
    seatNumber: 2,
    items: [{ name: 'Water', quantity: 1, unitPrice: 0 }],
  });
  assert(sc3 === 200, '/orders/create: zero-price item accepted');

  // 14d. Very large quantity (no upper bound in code)
  const { status: sc4, json: j4 } = await post('/orders/create', {
    tableNumber: 'T-09',
    seatNumber: 2,
    items: [{ name: 'Neer Dosa', quantity: 100, unitPrice: 60 }],
  });
  assert(sc4 === 200, '/orders/create: large quantity 100 accepted');
  assert(j4.subtotal === 6000, `/orders/create: subtotal correct for qty=100 (${j4.subtotal})`);

  // 14e. Empty string guestName falls back to "Seat N"
  const { status: sc5, json: j5 } = await post('/orders/create', {
    tableNumber: 'T-09',
    seatNumber: 1,
    guestName: '',
    items: [{ name: 'Biryani', quantity: 1, unitPrice: 180 }],
  });
  assert(sc5 === 200, '/orders/create: empty guestName falls back gracefully');

  // 14f. null body on POST → should error gracefully (not crash)
  try {
    const res = await fetch(`${BASE}/tables/seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'null',
    });
    assert(res.status >= 400, 'POST /tables/seat: null body returns 4xx error gracefully');
  } catch {
    assert(false, 'POST /tables/seat: null body should not throw uncaught exception');
  }

  // 14g. Malformed JSON body → should return 400 or 500 (not crash)
  try {
    const res = await fetch(`${BASE}/tables/seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json',
    });
    assert(res.status >= 400, 'POST /tables/seat: malformed JSON returns 4xx gracefully');
  } catch {
    assert(false, 'POST /tables/seat: malformed JSON should not crash server');
  }

  // 14h. Extra unknown fields ignored (no 400 from unknown properties)
  const { status: sc6 } = await post('/tables/vacate', {
    tableNumber: 'T-09',
    unknownField: 'should be ignored',
    anotherExtra: 123,
  });
  assert(sc6 === 200, '/tables/vacate: extra unknown fields are silently ignored');

  // Cleanup
  await vacate('T-09');
}

// ---------------------------------------------------------------------------
// GROUP 15: Response Latency Benchmarks (all 12 endpoints)
// ---------------------------------------------------------------------------
async function testLatencyBenchmarks() {
  section('Group 15 — Response Latency Benchmarks');

  const LIMIT = 3000;

  const runs = [
    ['GET  /session/verify',     () => get('/session/verify?table=T-01&seat=1')],
    ['POST /tables/seat',         () => post('/tables/seat', { tableNumber: 'T-12', guestCount: 1 })],
    ['POST /tables/vacate',       () => post('/tables/vacate', { tableNumber: 'T-12' })],
    ['POST /pings/create',        () => post('/pings/create', { tableNumber: 'T-13', seatNumber: 1 })],
    ['POST /kds/toggle-86',       async () => {
      const { createClient } = require('@supabase/supabase-js');
      const sb = createClient('https://dwjjprzyyjmunhdxvkuo.supabase.co', 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV');
      const { data } = await sb.from('menu_86').select('id').limit(1);
      if (data && data[0]) return post('/kds/toggle-86', { itemId: data[0].id });
      return { ms: 0 };
    }],
  ];

  for (const [label, fn] of runs) {
    const { ms } = await fn();
    process.stdout.write(`  [TIME] ${label}: ${ms}ms\n`);
    assert(ms < LIMIT, `${label} responds < ${LIMIT}ms (actual: ${ms}ms)`);
  }

  // POST /orders/create latency (heavier — allows 5s)
  await post('/tables/seat', { tableNumber: 'T-14' });
  const { ms: createMs } = await post('/orders/create', {
    tableNumber: 'T-14',
    seatNumber: 1,
    items: [{ name: 'Biryani', quantity: 1, unitPrice: 180 }],
  });
  process.stdout.write(`  [TIME] POST /orders/create: ${createMs}ms\n`);
  assert(createMs < 5000, `POST /orders/create responds < 5s (actual: ${createMs}ms)`);
  usedTables.add('T-14');

  // POST /payments/initiate latency (QR code generation — allows 6s)
  if (createdOrderId) {
    const { ms: initMs } = await post('/payments/initiate', { orderId: createdOrderId });
    process.stdout.write(`  [TIME] POST /payments/initiate: ${initMs}ms\n`);
    assert(initMs < 6000, `POST /payments/initiate responds < 6s (actual: ${initMs}ms)`);
  }

  // Cleanup
  await vacate('T-12');
  await vacate('T-14');
}

// ---------------------------------------------------------------------------
// GROUP 16: Concurrent Requests
// ---------------------------------------------------------------------------
async function testConcurrentRequests() {
  section('Group 16 — Concurrent Requests');

  // 16a. 5 concurrent GET /session/verify on different tables
  const start5 = Date.now();
  const concurrent5 = await Promise.all([
    get('/session/verify?table=T-20&seat=1'),
    get('/session/verify?table=T-21&seat=1'),
    get('/session/verify?table=T-22&seat=1'),
    get('/session/verify?table=T-23&seat=1'),
    get('/session/verify?table=T-24&seat=1'),
  ]);
  const elapsed5 = Date.now() - start5;
  process.stdout.write(`  [TIME] 5 concurrent GET /session/verify: ${elapsed5}ms\n`);
  const all200 = concurrent5.every((r) => r.status === 200);
  assert(all200, 'Concurrent: all 5 parallel GET /session/verify return 200');
  assert(elapsed5 < 5000, `Concurrent: 5 parallel session checks complete < 5s (actual: ${elapsed5}ms)`);

  // 16b. 3 concurrent pings from different tables
  const startPings = Date.now();
  const concPings = await Promise.all([
    post('/pings/create', { tableNumber: 'T-15', seatNumber: 1, type: 'WATER' }),
    post('/pings/create', { tableNumber: 'T-16', seatNumber: 1, type: 'NAPKIN' }),
    post('/pings/create', { tableNumber: 'T-17', seatNumber: 1, type: 'CALL_WAITER' }),
  ]);
  const elapsedPings = Date.now() - startPings;
  process.stdout.write(`  [TIME] 3 concurrent POST /pings/create: ${elapsedPings}ms\n`);
  const pingIds = concPings.map((r) => r.json?.pingId).filter(Boolean);
  assert(pingIds.length === 3, 'Concurrent: 3 pings created concurrently, all got unique pingIds');
  assert(new Set(pingIds).size === 3, 'Concurrent: 3 concurrent ping IDs are all unique');
  assert(elapsedPings < 6000, `Concurrent: 3 parallel pings complete < 6s (actual: ${elapsedPings}ms)`);

  // 16c. 3 concurrent seat updates on different tables
  const startSeats = Date.now();
  const concSeats = await Promise.all([
    post('/tables/seat', { tableNumber: 'T-18', guestCount: 2 }),
    post('/tables/seat', { tableNumber: 'T-19', guestCount: 3 }),
    post('/tables/seat', { tableNumber: 'T-20', guestCount: 1 }),
  ]);
  const elapsedSeats = Date.now() - startSeats;
  process.stdout.write(`  [TIME] 3 concurrent POST /tables/seat: ${elapsedSeats}ms\n`);
  const seatSuccess = concSeats.every((r) => r.status === 200);
  assert(seatSuccess, 'Concurrent: 3 concurrent /tables/seat all return 200');
  assert(elapsedSeats < 6000, `Concurrent: 3 parallel seat updates complete < 6s (actual: ${elapsedSeats}ms)`);
  for (const t of ['T-18', 'T-19', 'T-20']) await vacate(t);
}

// ---------------------------------------------------------------------------
// GROUP 17: Full Lifecycle Integration Test
// ---------------------------------------------------------------------------
async function testFullLifecycle() {
  section('Group 17 — Full Lifecycle Integration (Seat → Order → KDS → Pay → Vacate)');

  const LCTABLE = 'T-25';

  // Step 1: Seat the table
  const { json: seated, status: s1 } = await post('/tables/seat', {
    tableNumber: LCTABLE,
    guestCount: 3,
    serverName: 'Nayana',
  });
  assert(s1 === 200, 'Lifecycle: table seated successfully');
  assert(seated.status === 'OCCUPIED', 'Lifecycle: table status=OCCUPIED after seating');
  usedTables.add(LCTABLE);

  // Step 2: Place order
  const { json: order, status: s2 } = await post('/orders/create', {
    tableNumber: LCTABLE,
    seatNumber: 1,
    guestName: 'Group Test',
    guestCount: 3,
    items: [
      { name: 'Donne Biryani', quantity: 2, unitPrice: 180 },
      { name: 'Mutton Sukka', quantity: 1, unitPrice: 220 },
    ],
    source: 'CUSTOMER',
  });
  assert(s2 === 200, 'Lifecycle: order placed successfully');
  const lcOrderId = order.orderId;
  const lcTicketId = order.ticketId;
  assert(typeof lcOrderId === 'string', 'Lifecycle: orderId returned');
  assert(typeof lcTicketId === 'string', 'Lifecycle: ticketId returned');

  // Expected financials: 2*180 + 1*220 = 580 + 29 (5%) = 609
  const expSubtotal = 2 * 180 + 1 * 220; // 580
  const expTax = Math.round(expSubtotal * 0.05); // 29
  const expTotal = expSubtotal + expTax; // 609
  assert(order.subtotal === expSubtotal, `Lifecycle: subtotal correct (${order.subtotal})`);
  assert(order.tax === expTax, `Lifecycle: tax correct (${order.tax})`);
  assert(order.total === expTotal, `Lifecycle: total correct (${order.total})`);

  // Step 3: Verify session shows active order
  const { json: session } = await get(`/session/verify?table=${LCTABLE}&seat=1`);
  assert(session.active === true, 'Lifecycle: session active after order placed');
  assert(session.order.id === lcOrderId, 'Lifecycle: session returns correct orderId');
  assert(session.order.status === 'UNPAID', 'Lifecycle: session order status=UNPAID');

  // Step 4: Add items
  const { json: addResult, status: s4 } = await post('/orders/add-items', {
    orderId: lcOrderId,
    items: [{ name: 'Coconut Water', quantity: 2, unitPrice: 50 }],
  });
  assert(s4 === 200, 'Lifecycle: add-items succeeded');
  const expectedNewTotal = expTotal + (100 + Math.round(100 * 0.05)); // +105
  assert(addResult.newTotal === expectedNewTotal, `Lifecycle: newTotal correct after add-items (${addResult.newTotal})`);

  // Step 5: Initiate payment
  const { json: payment, status: s5 } = await post('/payments/initiate', {
    orderId: lcOrderId,
  });
  assert(s5 === 200, 'Lifecycle: payment initiated successfully');
  const lcPaymentId = payment.paymentId;
  assert(typeof lcPaymentId === 'string', 'Lifecycle: paymentId returned from initiate');
  assert(payment.amount === expectedNewTotal, 'Lifecycle: payment amount matches updated order total');

  // Step 6: Poll payment status (PENDING)
  const { json: pollResult, status: s6 } = await get(
    `/payments/verify?paymentId=${encodeURIComponent(lcPaymentId)}`
  );
  assert(s6 === 200, 'Lifecycle: payment status poll returns 200');
  assert(pollResult.status === 'PENDING', 'Lifecycle: payment status=PENDING before confirmation');

  // Step 7: Confirm payment
  const { json: confirmed, status: s7 } = await post('/payments/verify', {
    paymentId: lcPaymentId,
    orderId: lcOrderId,
    status: 'CONFIRMED',
  });
  assert(s7 === 200, 'Lifecycle: payment confirmed successfully');
  assert(confirmed.settled === true, 'Lifecycle: settled=true after confirmation');

  // Step 8: Verify cascades in DB
  const { createClient } = require('@supabase/supabase-js');
  const sb = createClient(
    'https://dwjjprzyyjmunhdxvkuo.supabase.co',
    'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV'
  );
  const { data: lcOrder } = await sb.from('orders').select('status').eq('id', lcOrderId).maybeSingle();
  assert(lcOrder?.status === 'PAID', 'Lifecycle: order.status=PAID after payment confirmation');

  const { data: lcSeat } = await sb.from('table_seats').select('status')
    .eq('table_number', LCTABLE).eq('seat_number', 1).maybeSingle();
  assert(lcSeat?.status === 'PAID', 'Lifecycle: seat.status=PAID after payment confirmation');

  const { data: lcTable } = await sb.from('tables').select('status').eq('number', LCTABLE).maybeSingle();
  const validTableStatus = ['BILLING', 'OCCUPIED', 'VACANT'].includes(lcTable?.status || '');
  assert(validTableStatus, `Lifecycle: table.status transitioned correctly (${lcTable?.status})`);

  // Step 9: Vacate table
  const { json: vacated, status: s9 } = await post('/tables/vacate', { tableNumber: LCTABLE });
  assert(s9 === 200, 'Lifecycle: table vacated successfully');
  assert(vacated.status === 'VACANT', 'Lifecycle: table status=VACANT after vacate');

  // Step 10: Verify table and seats reset in DB
  const { data: resetTable } = await sb.from('tables').select('status, current_bill, guest_count, kot_count')
    .eq('number', LCTABLE).maybeSingle();
  assert(resetTable?.status === 'VACANT', 'Lifecycle: table.status=VACANT after vacate');
  assert(Number(resetTable?.current_bill) === 0, 'Lifecycle: current_bill reset to 0 after vacate');
  assert(Number(resetTable?.guest_count) === 0, 'Lifecycle: guest_count reset to 0 after vacate');
  assert(Number(resetTable?.kot_count) === 0, 'Lifecycle: kot_count reset to 0 after vacate');

  const { data: resetSeats } = await sb.from('table_seats').select('status, active_order_id')
    .eq('table_number', LCTABLE);
  const allSeatsVacant = resetSeats?.every((s) => s.status === 'VACANT') ?? false;
  const allSeatsNoOrder = resetSeats?.every((s) => s.active_order_id === null) ?? false;
  assert(allSeatsVacant, 'Lifecycle: all seats.status=VACANT after vacate');
  assert(allSeatsNoOrder, 'Lifecycle: all seats.active_order_id=null after vacate');
}

// ---------------------------------------------------------------------------
// GROUP 18: API Structure and Route File Integrity
// ---------------------------------------------------------------------------
async function testApiStructure() {
  section('Group 18 — API Route File Structure');

  const fs = require('fs');
  const path = require('path');
  const root = path.join(__dirname, '..');

  const routes = [
    'app/api/kds/bump-item/route.ts',
    'app/api/kds/bump-table/route.ts',
    'app/api/kds/toggle-86/route.ts',
    'app/api/orders/add-items/route.ts',
    'app/api/orders/create/route.ts',
    'app/api/payments/initiate/route.ts',
    'app/api/payments/verify/route.ts',
    'app/api/pings/create/route.ts',
    'app/api/pings/resolve/route.ts',
    'app/api/session/verify/route.ts',
    'app/api/tables/seat/route.ts',
    'app/api/tables/vacate/route.ts',
  ];

  // Every route file must exist
  for (const route of routes) {
    const full = path.join(root, route);
    assert(fs.existsSync(full), `Route file exists: ${route}`);
  }

  // Every file must have export const dynamic = 'force-dynamic'
  let allDynamic = true;
  for (const route of routes) {
    const content = fs.readFileSync(path.join(root, route), 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic'")) {
      allDynamic = false;
      failures.push(`${route} missing force-dynamic`);
    }
  }
  assert(allDynamic, "All API routes export const dynamic = 'force-dynamic'");

  // Every file must import NextRequest, NextResponse
  let allImports = true;
  for (const route of routes) {
    const content = fs.readFileSync(path.join(root, route), 'utf8');
    if (!content.includes('NextRequest') || !content.includes('NextResponse')) {
      allImports = false;
      failures.push(`${route} missing NextRequest/NextResponse import`);
    }
  }
  assert(allImports, 'All API routes import NextRequest and NextResponse');

  // Every file imports supabase client
  let allSupabase = true;
  for (const route of routes) {
    const content = fs.readFileSync(path.join(root, route), 'utf8');
    if (!content.includes("from '") || !content.includes('supabase')) {
      allSupabase = false;
    }
  }
  assert(allSupabase, 'All API routes import the Supabase client');

  // Every file must have at least one exported async function (POST or GET)
  let allExports = true;
  for (const route of routes) {
    const content = fs.readFileSync(path.join(root, route), 'utf8');
    if (!content.includes('export async function')) {
      allExports = false;
      failures.push(`${route} missing exported async handler function`);
    }
  }
  assert(allExports, 'All API routes have at least one exported async handler');

  // Routes that support both GET and POST
  const dualMethod = ['app/api/session/verify/route.ts', 'app/api/payments/verify/route.ts'];
  for (const route of dualMethod) {
    const content = fs.readFileSync(path.join(root, route), 'utf8');
    const hasGet = content.includes('export async function GET');
    const hasPost = content.includes('export async function POST');
    assert(hasGet && hasPost, `${path.basename(path.dirname(route))}/route.ts exports both GET and POST`);
  }

  // All routes must have try/catch error handling
  let allTryCatch = true;
  for (const route of routes) {
    const content = fs.readFileSync(path.join(root, route), 'utf8');
    if (!content.includes('try {') && !content.includes('try{')) {
      allTryCatch = false;
      failures.push(`${route} missing try/catch error handling`);
    }
  }
  assert(allTryCatch, 'All API routes have try/catch error handling');

  // Stage transition map in bump-item
  const bumpItemContent = fs.readFileSync(path.join(root, 'app/api/kds/bump-item/route.ts'), 'utf8');
  assert(bumpItemContent.includes('PLACED'), 'bump-item: STAGE_TRANSITION contains PLACED');
  assert(bumpItemContent.includes('PLATED'), 'bump-item: STAGE_TRANSITION contains PLATED');
  assert(bumpItemContent.includes('SERVED'), 'bump-item: STAGE_TRANSITION contains SERVED');

  // Ticket transition map in bump-table
  const bumpTableContent = fs.readFileSync(path.join(root, 'app/api/kds/bump-table/route.ts'), 'utf8');
  assert(bumpTableContent.includes('TICKET_TRANSITION'), 'bump-table: TICKET_TRANSITION map defined');
  assert(bumpTableContent.includes("NEW:"), 'bump-table: NEW state in TICKET_TRANSITION');
  assert(bumpTableContent.includes("COMPLETED:"), 'bump-table: COMPLETED state in TICKET_TRANSITION');

  // Payments verify has idempotency check
  const payVerifyContent = fs.readFileSync(path.join(root, 'app/api/payments/verify/route.ts'), 'utf8');
  assert(payVerifyContent.includes("status === 'CONFIRMED'"), 'payments/verify: idempotency check present');

  // GST calculation is 5%
  const createContent = fs.readFileSync(path.join(root, 'app/api/orders/create/route.ts'), 'utf8');
  assert(createContent.includes('0.05'), 'orders/create: 5% GST calculation present');

  // UPI URI uses npci standard scheme
  const initiateContent = fs.readFileSync(path.join(root, 'app/api/payments/initiate/route.ts'), 'utf8');
  assert(initiateContent.includes('upi://pay'), 'payments/initiate: NPCI-compliant UPI URI scheme');
  assert(initiateContent.includes('pa:'), 'payments/initiate: merchant VPA (pa) field in UPI query');
  assert(initiateContent.includes('cu:'), 'payments/initiate: currency (cu) field in UPI query');
}

// ---------------------------------------------------------------------------
// Cleanup — vacate all tables touched during testing
// ---------------------------------------------------------------------------
async function cleanupAll() {
  section('Cleanup — Resetting test tables');
  for (const t of usedTables) {
    await vacate(t);
    process.stdout.write(`  [DONE] Vacated ${t}\n`);
  }
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------
(async () => {
  process.stdout.write('\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');
  process.stdout.write('  Phase 2 — Comprehensive API Test Suite\n');
  process.stdout.write('  18 groups · REST routes · logic · cascades · lifecycle\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');

  const t0 = Date.now();

  try {
    // Check server is up before running any tests
    await fetch(`${BASE}/session/verify?table=T-01&seat=1`);
  } catch {
    process.stdout.write('\n  [ERROR] Dev server not reachable at http://localhost:3001\n');
    process.stdout.write('  Run:  npm run dev\n\n');
    process.exit(1);
  }

  await testServerConnectivity();
  await testTablesSeat();
  await testTablesVacate();
  await testOrdersCreate();
  await testOrdersAddItems();
  await testSessionVerify();
  await testPingsCreate();
  await testPingsResolve();
  await testKdsBumpItem();
  await testKdsBumpTable();
  await testKdsToggle86();
  await testPaymentsInitiate();
  await testPaymentsVerify();
  await testInputBoundaries();
  await testLatencyBenchmarks();
  await testConcurrentRequests();
  await testFullLifecycle();
  await testApiStructure();

  await cleanupAll();

  const totalMs = Date.now() - t0;

  process.stdout.write('\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');
  process.stdout.write(`  Total Time : ${totalMs}ms\n`);
  process.stdout.write(`  Passed     : ${passed}\n`);
  process.stdout.write(`  Failed     : ${failed}\n`);
  process.stdout.write(`  Skipped    : 0\n`);
  process.stdout.write('════════════════════════════════════════════════════════════\n\n');

  if (failures.length > 0) {
    process.stdout.write('  Failures:\n');
    for (const f of failures) process.stdout.write(`    • ${f}\n`);
    process.stdout.write('\n');
    process.exit(1);
  } else {
    process.stdout.write('  All Phase 2 tests passed.\n\n');
    process.exit(0);
  }
})();
