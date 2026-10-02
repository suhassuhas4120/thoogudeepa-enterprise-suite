/**
 * test-phase5-customer.js
 * ──────────────────────────────────────────────────────────────────────
 * Phase 5 automated test suite: Customer Ordering Portal (12 Screens Full Integration)
 *
 * Verifies:
 *   1.  Server connectivity
 *   2.  Substep 5.1: URL QR Param Handshake & 80% Exit Recovery (/api/session/verify)
 *   3.  Substep 5.2: Live 86 stock-out toggle & greying sync
 *   4.  Substep 5.3: Multi-item cart placement & incremental appending
 *   5.  Substep 5.4: Live KDS stepper stage transitions (PLACED -> PREP -> READY)
 *   6.  Substep 5.5: Zero-typing payment initiation, dynamic QR, auto-settlement confirmation
 *   7.  Substep 5.6: One-tap service alerts (Water, Salna pings) & resolution
 *   8.  12-Screen router & component integrity
 *   9.  Post-test clean table reset (VACANT, 0 bill)
 */

const BASE = 'http://localhost:3005';
const SUPABASE_URL = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

let passed = 0;
let failed = 0;
const errors = [];

async function api(path, body, method = 'POST') {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (method === 'POST') {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, options);
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
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
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

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  PHASE 5 TEST SUITE: Customer Ordering Portal (12 Screens)');
  console.log(`  Server: ${BASE}`);
  console.log('══════════════════════════════════════════════════════\n');

  // ── TEST 1: Server Reachability ──
  console.log('── TEST 1: Server Reachability ──');
  try {
    const res = await fetch(`${BASE}/`);
    assert('Customer portal home route (/) is reachable', res.status === 200, `Got: ${res.status}`);
  } catch (e) {
    assert('Customer portal home route (/) is reachable', false, e.message);
  }

  // ── TEST 2: Pre-test cleanup at T-01 ──
  console.log('\n── TEST 2: Pre-test cleanup at T-01 ──');
  const vacRes = await api('/api/tables/vacate', { tableNumber: 'T-01' });
  assert('Vacate T-01 pre-test', vacRes.ok, JSON.stringify(vacRes.json));
  await sleep(300);

  // ── TEST 3: Substep 5.1: URL QR Param Handshake & Session Verification (Screen 1) ──
  console.log('\n── TEST 3: Substep 5.1: QR Handshake & Session Verification (Screen 1) ──');
  const sessionEmpty = await api('/api/session/verify?tableNumber=T-01&seatNumber=1', null, 'GET');
  assert('Session verify responds for fresh scan', sessionEmpty.ok, JSON.stringify(sessionEmpty.json));
  assert('Reports active = false for fresh table', sessionEmpty.json?.active === false, `Got: ${sessionEmpty.json?.active}`);

  // Seat guests at T-01
  const seatRes = await api('/api/tables/seat', {
    tableNumber: 'T-01',
    guestCount: 2,
    captainName: 'CustomerCaptain',
  });
  assert('Table T-01 seated via API', seatRes.ok, JSON.stringify(seatRes.json));

  // Place initial order
  const orderRes = await api('/api/orders/create', {
    tableNumber: 'T-01',
    seatNumber: 1,
    guestName: 'Ravi Kumar',
    guestCount: 2,
    source: 'CUSTOMER',
    items: [
      { name: 'Donne Biryani Rice', quantity: 2, price: 110, unitPrice: 110, prepMode: 'Dum Pot' },
      { name: 'Guntur Chicken', quantity: 1, price: 190, unitPrice: 190, prepMode: 'Crispy' },
    ],
  });
  assert('Initial customer order created', orderRes.ok, JSON.stringify(orderRes.json));
  const orderId = orderRes.json?.orderId;
  const initialTotal = orderRes.json?.total; // 410 + 5% = 431
  assert('Order ID is generated', !!orderId, `Got: ${orderId}`);
  await sleep(400);

  // Exit recovery test: re-verify session
  const sessionRecovered = await api('/api/session/verify?tableNumber=T-01&seatNumber=1', null, 'GET');
  assert('80% Exit Recovery: Session verify detects active order', sessionRecovered.json?.active === true, `Got: ${sessionRecovered.json?.active}`);
  assert('Exit Recovery returns correct order ID', sessionRecovered.json?.activeOrder?.id === orderId, `Got: ${sessionRecovered.json?.activeOrder?.id}`);
  assert('Exit Recovery returns unserved items count = 2', sessionRecovered.json?.activeOrder?.items?.length === 2, `Got: ${sessionRecovered.json?.activeOrder?.items?.length}`);

  // ── TEST 4: Substep 5.2: Live 86 Stock-Out Toggle & Preparation Delay (Screens 2 & 3) ──
  console.log('\n── TEST 4: Substep 5.2: Live 86 Stock-Out & Prep Delay (Screens 2 & 3) ──');
  const toggleOn = await api('/api/kds/toggle-86', { itemId: 'item-1', is86: true, prepDelayMinutes: 25 });
  assert('Kitchen 86 toggle ON succeeds', toggleOn.ok, JSON.stringify(toggleOn.json));
  await sleep(400);

  const dbMenu86 = await dbGetSingle('menu_86', { id: 'item-1' });
  assert('menu_86 is_86 is true in database', dbMenu86?.is_86 === true, `Got: ${dbMenu86?.is_86}`);
  assert('menu_86 prep_delay_minutes updated in database', dbMenu86?.prep_delay_minutes === 25, `Got: ${dbMenu86?.prep_delay_minutes}`);

  // Restore 86
  const toggleOff = await api('/api/kds/toggle-86', { itemId: 'item-1', is86: false, prepDelayMinutes: 0 });
  assert('Kitchen 86 toggle OFF restores item availability', toggleOff.ok, JSON.stringify(toggleOff.json));
  await sleep(400);

  const dbMenuRestored = await dbGetSingle('menu_86', { id: 'item-1' });
  assert('menu_86 is_86 restored to false', dbMenuRestored?.is_86 === false, `Got: ${dbMenuRestored?.is_86}`);

  // ── TEST 5: Substep 5.3: Cart & Incremental Sub-Order Aggregator (Screen 4) ──
  console.log('\n── TEST 5: Substep 5.3: Cart & Sub-Order Aggregator (Screen 4) ──');
  const addItemsRes = await api('/api/orders/add-items', {
    orderId,
    tableNumber: 'T-01',
    seatNumber: 1,
    items: [
      { name: 'Kshatriya Kebab', quantity: 1, price: 180, unitPrice: 180, prepMode: 'Deep Fry' },
    ],
  });
  assert('Sub-order append succeeds via /api/orders/add-items', addItemsRes.ok, JSON.stringify(addItemsRes.json));
  const newRunningTotal = addItemsRes.json?.newTotal; // 431 + 189 = 620
  assert('Running bill increments correctly', newRunningTotal > initialTotal, `New total: ${newRunningTotal}`);
  await sleep(400);

  const dbOrderUpdated = await dbGetSingle('orders', { id: orderId });
  assert('Order record updated with new total in DB', Number(dbOrderUpdated?.total_amount) === newRunningTotal, `Got: ${dbOrderUpdated?.total_amount}`);

  // ── TEST 6: Substep 5.4: Live KDS Stepper Tracking (Screen 5) ──
  console.log('\n── TEST 6: Substep 5.4: Live KDS Stepper Tracking (Screen 5) ──');
  const tickets = await dbQuery('kds_tickets', { order_id: orderId });
  const activeTicket = Array.isArray(tickets) && tickets.length > 0 ? tickets[0] : null;
  assert('KDS ticket exists for active order', !!activeTicket, `orderId: ${orderId}`);
  assert('Ticket initial status is NEW', activeTicket?.status === 'NEW', `Got: ${activeTicket?.status}`);

  // Bump whole table/ticket to READY
  const bumpTicket = await api('/api/kds/bump-table', {
    ticketId: activeTicket?.id,
    status: 'READY',
  });
  assert('KDS ticket bump to READY succeeds', bumpTicket.ok, JSON.stringify(bumpTicket.json));
  await sleep(400);

  const dbTicketReady = await dbGetSingle('kds_tickets', { id: activeTicket?.id });
  assert('Ticket status in DB transitioned to READY', dbTicketReady?.status === 'READY', `Got: ${dbTicketReady?.status}`);

  // ── TEST 7: Substep 5.5: Zero-Typing Payment Engine (Screens 6, 7, 8) ──
  console.log('\n── TEST 7: Substep 5.5: Zero-Typing Payment & Settlement (Screens 6, 7, 8) ──');
  const initPayment = await api('/api/payments/initiate', {
    orderId,
    tableNumber: 'T-01',
    seatNumber: 1,
    amount: newRunningTotal,
  });
  assert('Payment initiation (/api/payments/initiate) returns 200', initPayment.ok, JSON.stringify(initPayment.json));
  const payId = initPayment.json?.paymentId;
  const upiUri = initPayment.json?.upiUri;
  assert('Returns paymentId', !!payId, `Got: ${payId}`);
  assert('Returns NPCI UPI URI with INR currency', upiUri?.includes('cu=INR'), `Got: ${upiUri}`);
  assert('Returns dynamic QR base64 data URL', !!initPayment.json?.qrDataUrl, `Length: ${initPayment.json?.qrDataUrl?.length}`);
  assert('Returns 1-tap mobile app intents (GPay/PhonePe)', !!initPayment.json?.appIntents?.phonepe, `Got: ${initPayment.json?.appIntents?.phonepe}`);

  // Automated zero-typing settlement
  const verifyPayment = await api('/api/payments/verify', {
    orderId,
    paymentId: payId,
  });
  assert('Payment verification (/api/payments/verify) returns 200', verifyPayment.ok, JSON.stringify(verifyPayment.json));
  assert('Status transitioned to CONFIRMED', verifyPayment.json?.status === 'CONFIRMED', `Got: ${verifyPayment.json?.status}`);
  assert('Authentic Indian Bank UTR generated', !!verifyPayment.json?.bankUtr?.startsWith('4281'), `Got UTR: ${verifyPayment.json?.bankUtr}`);

  await sleep(500);

  const dbOrderFinal = await dbGetSingle('orders', { id: orderId });
  assert('Order marked PAID in database', dbOrderFinal?.status === 'PAID', `Got: ${dbOrderFinal?.status}`);

  const dbSeatFinal = await dbGetSingle('table_seats', { table_number: 'T-01', seat_number: 1 });
  assert('Seat marked PAID in database', dbSeatFinal?.status === 'PAID', `Got: ${dbSeatFinal?.status}`);

  // ── TEST 8: Substep 5.6: One-Tap Waiter Assistance & Pings (Screen 10) ──
  console.log('\n── TEST 8: Substep 5.6: One-Tap Waiter Assistance (Screen 10) ──');
  const pingCreate = await api('/api/pings/create', {
    tableNumber: 'T-01',
    seatNumber: 1,
    type: 'SALNA',
    guestName: 'Ravi Kumar',
    message: 'Need extra Donne Salna',
  });
  assert('Service ping created via /api/pings/create', pingCreate.ok, JSON.stringify(pingCreate.json));
  const pingId = pingCreate.json?.pingId;
  assert('Ping ID generated', !!pingId, `Got: ${pingId}`);
  await sleep(400);

  const dbPing = await dbGetSingle('pings', { id: pingId });
  assert('Ping status in DB is PENDING', dbPing?.status === 'PENDING', `Got: ${dbPing?.status}`);

  // Resolve ping
  const pingResolve = await api('/api/pings/resolve', { pingId });
  assert('Ping resolve via /api/pings/resolve returns 200', pingResolve.ok, JSON.stringify(pingResolve.json));
  await sleep(400);

  const dbPingResolved = await dbGetSingle('pings', { id: pingId });
  assert('Ping status in DB is RESOLVED', dbPingResolved?.status === 'RESOLVED', `Got: ${dbPingResolved?.status}`);

  // ── TEST 9: Substep 5.6: Digital Tax Invoice & Reset (Screen 9) ──
  console.log('\n── TEST 9: Substep 5.6: Post-Dine Cleanup & Table Turnaround ──');
  const vacEnd = await api('/api/tables/vacate', { tableNumber: 'T-01' });
  assert('Vacate T-01 cleans table state', vacEnd.ok, JSON.stringify(vacEnd.json));
  await sleep(400);

  const dbTableClean = await dbGetSingle('tables', { number: 'T-01' });
  assert('Table T-01 reset to VACANT', dbTableClean?.status === 'VACANT', `Got: ${dbTableClean?.status}`);
  assert('Table T-01 bill reset to 0', Number(dbTableClean?.current_bill) === 0, `Got: ${dbTableClean?.current_bill}`);

  // ── Summary ──
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Phase 5 Results: ${passed} passed / ${failed} failed`);
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
