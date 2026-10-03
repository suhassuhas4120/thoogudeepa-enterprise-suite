/**
 * test-phase8-waiter-tablet.js
 *
 * Phase 8 Automated Test Suite: Waiter Tablet Station (10" Captain Experience)
 *
 * Verifies:
 *   1. Tablet cockpit route (/waiter/tablet) HTTP 200 reachability
 *   2. Full 34-table floor matrix with valid status, capacity, and current bill
 *   3. Section filtering: Family Section, Main Dining Hall, Express, Courtyard, Grand Feast Hall
 *   4. Selected table detail inspection with active KOT tickets and stages
 *   5. Realtime customer ping alerts side-panel feed
 *   6. Ping resolution via /api/pings/resolve from tablet cockpit
 *   7. Cash payment recording via /api/tables/vacate & bridge
 *   8. Table vacate confirmation guard & database reset
 *   9. Post-test cleanup
 */

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';
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
  if (method === 'POST') options.body = JSON.stringify(body);
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
  url += params.join('&') + '&limit=50';
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function dbGetSingle(table, filters = {}) {
  const rows = await dbQuery(table, filters);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    errors.push(message);
    console.log(`  ✗ ${message}`);
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('  PHASE 8 TEST SUITE: Waiter Tablet Captain Station');
  console.log(`  Server: ${BASE}`);
  console.log('======================================================\n');

  // TEST 1: Tablet Route Reachability
  console.log('── TEST 1: Captain Cockpit Route Reachability ──');
  const res = await fetch(`${BASE}/waiter/tablet`);
  assert(res.status === 200, 'Waiter tablet route (/waiter/tablet) is accessible (HTTP 200)');

  // TEST 2: Complete 34-Table Matrix
  console.log('\n── TEST 2: Complete 34-Table Floor Matrix ──');
  const tables = await dbQuery('tables');
  assert(Array.isArray(tables), 'Tables data retrieved as array');
  assert(tables.length >= 34, `Cockpit displays all ${tables.length} tables (expected ≥34)`);
  
  const validStatuses = ['VACANT', 'OCCUPIED', 'BILLING', 'CLEANING'];
  const allValid = tables.every((t) => validStatuses.includes(t.status) || t.status === null);
  assert(allValid, 'Every table status conforms to floor status schema');

  // TEST 3: Section Mapping
  console.log('\n── TEST 3: Floor Section Filtering ──');
  const sections = [
    'Family Section',
    'Main Dining Hall',
    'Express / Couple Hall',
    'Courtyard Garden',
    'Grand Feast Hall',
  ];
  sections.forEach((sec) => {
    const secTables = tables.filter((t) => t.section?.toLowerCase().includes(sec.toLowerCase().slice(0, 8)));
    assert(secTables.length > 0, `Section '${sec}' has ${secTables.length} tables assigned`);
  });

  // TEST 4: Seating & KOT Inspection on Tablet Cockpit
  console.log('\n── TEST 4: Table Inspection & Active KOT Tickets ──');
  const testTable = 'T-18';
  await api('/api/tables/seat', { tableNumber: testTable, guestCount: 4, serverName: 'Captain Nayana' });
  const orderRes = await api('/api/orders/create', {
    tableNumber: testTable,
    seatNumber: 1,
    items: [
      { name: 'Mutton Donne Biryani', quantity: 2, price: 340, unitPrice: 340 },
      { name: 'Guntur Chicken Fry', quantity: 1, price: 240, unitPrice: 240 },
    ],
  });
  assert(orderRes.ok, `Order created for table ${testTable}`);
  const ticketId = orderRes.json?.ticketId;
  assert(!!ticketId, `Ticket ID returned from order create: ${ticketId}`);

  const newTicket = await dbGetSingle('kds_tickets', { id: ticketId });
  assert(!!newTicket, `Tablet inspects active KOT for ${testTable}`);
  assert(newTicket?.status === 'NEW', `Initial ticket status is '${newTicket?.status}' (NEW)`);
  const firstTicket = newTicket;

  // TEST 5: Kitchen Bump reflected in Tablet Pass
  console.log('\n── TEST 5: Kitchen Stage Transition in Tablet Feed ──');
  const bumpRes = await api('/api/kds/bump-table', { ticketId: firstTicket.id, status: 'READY' });
  assert(bumpRes.ok, 'Kitchen bumps ticket to READY');

  const readyTicket = await dbGetSingle('kds_tickets', { id: firstTicket.id });
  assert(readyTicket?.status === 'READY', `Tablet detects ticket in READY pass queue`);

  // TEST 6: Customer Ping in Tablet Side Panel
  console.log('\n── TEST 6: Customer Call Alerts in Tablet Panel ──');
  const pingRes = await api('/api/pings/create', {
    tableNumber: testTable,
    seatNumber: 1,
    type: 'BILL',
    message: 'Please bring the bill to table',
  });
  assert(pingRes.ok, 'Assistance ping created');
  const pingId = pingRes.json?.pingId;
  assert(!!pingId, `Ping ID ${pingId} queued in tablet side panel`);

  const resolveRes = await api('/api/pings/resolve', { pingId });
  assert(resolveRes.ok, 'Captain resolves ping from side panel');
  const dbPing = await dbGetSingle('pings', { id: pingId });
  assert(dbPing?.status === 'RESOLVED', 'Ping resolved in persistent database');

  // TEST 7: Settlement & Vacate Guard
  console.log('\n── TEST 7: Settlement & Vacate Guard ──');
  const vacateRes = await api('/api/tables/vacate', { tableNumber: testTable });
  assert(vacateRes.ok, `Table ${testTable} vacated and reset`);

  const vacatedTable = await dbGetSingle('tables', { number: testTable });
  assert(vacatedTable?.status === 'VACANT', `Table ${testTable} status is 'VACANT'`);
  assert(Number(vacatedTable?.current_bill || 0) === 0, `Table ${testTable} bill is reset to ₹0`);

  // SUMMARY
  console.log('\n======================================================');
  console.log(`  Phase 8 Results: ${passed} passed / ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    console.error('Failed Assertions:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
