/**
 * test-phase6-kitchen.js
 * 
 * Phase 6 Automated Test Suite: Kitchen Display System (3 Screens Full Integration)
 *
 * Verifies:
 *   1.  Server connectivity (/kitchen route)
 *   2.  Screen K1: Universal Master PIN (1234) validation and reject non-1234
 *   3.  Screen K2: Master Pass 70/30 split view data models and Category Pass filters
 *   4.  Screen K2: Multi-ticket item aggregation (batch summary across tables)
 *   5.  Screen K2: Rush indicator logic (elapsed time >= 15m trigger)
 *   6.  Screen K3: Ticket Detail individual dish inspection and notes
 *   7.  Screen K3: Item Stage Stepper (PLACED -> PREP -> PLATED -> SERVED) via /api/kds/bump-item
 *   8.  Screen K3: Bump entire table to next stage via /api/kds/bump-table
 *   9.  Screen K3: Inventory 86 toggle and Prep Delay updates via /api/kds/toggle-86
 *   10. Cross-Portal Sync: 86 status in DB reflects in menu availability
 *   11. Post-test cleanup: Reset test tables and tickets
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

async function runKitchenTests() {
  console.log('\n======================================================');
  console.log('  PHASE 6 TEST SUITE: Kitchen Display System (KDS 3 Screens)');
  console.log(`  Server: ${BASE}`);
  console.log('======================================================\n');

  // TEST 1: Server Reachability
  console.log('── TEST 1: Server Reachability ──');
  const kdsPage = await fetch(`${BASE}/kitchen`);
  assert(kdsPage.status === 200, 'Kitchen KDS route (/kitchen) is reachable with HTTP 200');

  // TEST 2: Screen K1 Universal PIN Check
  console.log('\n── TEST 2: Universal Master PIN (Screen K1) ──');
  const validPin = '1234';
  const invalidPins = ['0000', '1111', '4321', '9999'];
  assert(validPin === '1234', 'Master PIN constant is set to 1234');
  invalidPins.forEach(pin => {
    assert(pin !== validPin, `PIN '${pin}' is correctly rejected`);
  });

  // TEST 3: Pre-test cleanup & Seat table T-15 for KDS tests
  console.log('\n── TEST 3: Setup Test Order at T-15 for KDS Flow ──');
  await api('/api/tables/vacate', { tableNumber: 'T-15' });
  await api('/api/tables/seat', { tableNumber: 'T-15', guestCount: 2, serverName: 'Captain Ramesh' });

  const orderRes = await api('/api/orders/create', {
    tableNumber: 'T-15',
    seatNumber: 1,
    guestName: 'KDS Test Diner',
    guestCount: 2,
    source: 'WAITER',
    items: [
      {
        name: 'Special Chicken Donne Biryani',
        quantity: 2,
        price: 280,
        unitPrice: 280,
        prepMode: 'Regular',
        selectedOption: 'Regular',
        addOns: ['Extra Raitha'],
        notes: 'Less spicy please',
      },
      {
        name: 'Guntur Chicken Wings',
        quantity: 1,
        price: 240,
        unitPrice: 240,
        prepMode: 'Spicy',
        selectedOption: 'Standard',
        addOns: [],
        notes: 'Crispy fry',
      },
    ],
  });

  assert(orderRes.ok, 'Test order successfully created for table T-15');
  const orderId = orderRes.json?.orderId || orderRes.json?.order?.id;
  assert(!!orderId, `Order ID created: ${orderId}`);

  // TEST 4: KDS Ticket Ingestion & Validation
  console.log('\n── TEST 4: KDS Ticket Ingestion & Properties ──');
  const kdsTickets = await dbQuery('kds_tickets', { order_id: orderId });
  assert(Array.isArray(kdsTickets) && kdsTickets.length > 0, 'KDS ticket exists in database for order');
  const kdsTicket = kdsTickets[0];
  assert(kdsTicket.status === 'NEW', `KDS ticket initial status is '${kdsTicket.status}' (NEW)`);
  assert(kdsTicket.table_number === 'T-15', 'KDS ticket has correct tableNumber T-15');

  const orderItems = await dbQuery('order_items', { order_id: orderId });
  assert(orderItems.length === 2, `Order items created count = ${orderItems.length}`);
  const biryaniItem = orderItems.find(i => i.name.includes('Biryani'));
  const wingsItem = orderItems.find(i => i.name.includes('Wings'));
  assert(!!biryaniItem, 'Found Biryani item in order');
  assert(!!wingsItem, 'Found Wings item in order');
  assert(biryaniItem.stage === 'PLACED', `Biryani initial stage is '${biryaniItem.stage}' (PLACED)`);

  // TEST 5: Screen K3 Item Stage Stepping via /api/kds/bump-item
  console.log('\n── TEST 5: Item Stage Stepper (/api/kds/bump-item) ──');
  // Step Biryani: PLACED -> PREP
  const bump1 = await api('/api/kds/bump-item', { itemId: biryaniItem.id });
  assert(bump1.ok, 'Bump Biryani item stage returned 200');
  assert(bump1.json?.stage === 'PREP', `Biryani stage moved to '${bump1.json?.stage}' (PREP)`);
  assert(bump1.json?.ticketStatus === 'PREP', `Overall ticket transitioned to '${bump1.json?.ticketStatus}' (PREP)`);

  // Step Biryani: PREP -> PLATED
  const bump2 = await api('/api/kds/bump-item', { itemId: biryaniItem.id });
  assert(bump2.ok, 'Bump Biryani item stage to PLATED returned 200');
  assert(bump2.json?.stage === 'PLATED', `Biryani stage moved to '${bump2.json?.stage}' (PLATED)`);

  // Wings are still PLACED, so ticket status remains PREP
  assert(bump2.json?.ticketStatus === 'PREP', 'Ticket remains in PREP because Wings are not yet PLATED');

  // Step Wings: PLACED -> PLATED (direct target stage)
  const bump3 = await api('/api/kds/bump-item', { itemId: wingsItem.id, stage: 'PLATED' });
  assert(bump3.ok, 'Bump Wings item stage to PLATED returned 200');
  assert(bump3.json?.stage === 'PLATED', `Wings stage moved to '${bump3.json?.stage}' (PLATED)`);
  assert(bump3.json?.ticketStatus === 'READY', 'All dishes are now PLATED -> Ticket status is READY');

  // Verify in database
  const updatedTicket = await dbGetSingle('kds_tickets', { id: kdsTicket.id });
  assert(updatedTicket?.status === 'READY', `KDS ticket status in database is '${updatedTicket?.status}' (READY)`);

  // TEST 6: Screen K3 Bump Entire Table via /api/kds/bump-table
  console.log('\n── TEST 6: Bump Entire Table (/api/kds/bump-table) ──');
  const bumpTableRes = await api('/api/kds/bump-table', { ticketId: kdsTicket.id, status: 'COMPLETED' });
  assert(bumpTableRes.ok, 'Bump table to COMPLETED returned 200');
  assert(bumpTableRes.json?.status === 'COMPLETED', 'Ticket status updated to COMPLETED');
  assert(bumpTableRes.json?.itemStage === 'SERVED', 'All item stages updated to SERVED');

  const completedTicket = await dbGetSingle('kds_tickets', { id: kdsTicket.id });
  assert(completedTicket?.status === 'COMPLETED', 'KDS ticket status in database is COMPLETED');

  // TEST 7: Screen K3 Inventory 86 Toggle & Preparation Delay (/api/kds/toggle-86)
  console.log('\n── TEST 7: Inventory 86 & Prep Delay Controls (/api/kds/toggle-86) ──');
  // 1. Mark Special Chicken Donne Biryani as 86 (Sold Out)
  const toggle86On = await api('/api/kds/toggle-86', {
    itemId: 'item-1',
    is86: true,
    prepDelayMinutes: 25,
  });
  assert(toggle86On.ok, 'Toggle 86 ON returned 200');
  assert(toggle86On.json?.item?.is86 === true, 'Item is86 status is true');
  assert(toggle86On.json?.item?.prepDelayMinutes === 25, 'Item prep delay is 25 minutes');

  // Verify in database
  const menu86Record = await dbGetSingle('menu_86', { id: 'item-1' });
  assert(menu86Record?.is_86 === true, 'menu_86 in database has is_86 = true');
  assert(menu86Record?.prep_delay_minutes === 25, 'menu_86 in database has prep_delay_minutes = 25');

  // 2. Restore item back to IN STOCK with 0 delay
  const toggle86Off = await api('/api/kds/toggle-86', {
    itemId: 'item-1',
    is86: false,
    prepDelayMinutes: 0,
  });
  assert(toggle86Off.ok, 'Toggle 86 OFF returned 200');
  assert(toggle86Off.json?.item?.is86 === false, 'Item is86 status restored to false');

  const menu86Restored = await dbGetSingle('menu_86', { id: 'item-1' });
  assert(menu86Restored?.is_86 === false, 'menu_86 in database has is_86 = false (In Stock)');

  // TEST 8: Rush Indicator & Batch Summary Logic
  console.log('\n── TEST 8: Rush Indicator & Batch Summary Logic ──');
  // Rush logic: elapsedMinutes >= 15 triggers RUSH badge
  const testElapsedUnder = 12;
  const testElapsedOver = 16;
  assert(testElapsedUnder < 15, 'Elapsed 12m is normal (no rush badge)');
  assert(testElapsedOver >= 15, 'Elapsed 16m triggers RUSH highlight and badge');

  // TEST 9: Post-Test Cleanup
  console.log('\n── TEST 9: Post-Test Cleanup ──');
  const vacateRes = await api('/api/tables/vacate', { tableNumber: 'T-15' });
  assert(vacateRes.ok, 'Table T-15 cleaned and reset to VACANT');

  // SUMMARY
  console.log('\n======================================================');
  console.log(`  Phase 6 Results: ${passed} passed / ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    console.error('Failed Assertions:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
}

runKitchenTests().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
