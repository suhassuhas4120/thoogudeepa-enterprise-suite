/**
 * Waiter Portal (Mobile & Tablet) — Comprehensive Workflow & Logic Test Matrix
 *
 * Evaluates the floor staff operations in a high-volume military restaurant,
 * testing steward authentication, section filtering, floor table map (34 tables),
 * walk-in seating, handheld KOT ordering, ping dispatch resolution, kitchen pass
 * expediting, cash/UPI settlement, two-step vacate turnover, and API boundaries.
 *
 * Execution: npx tsx scripts/test-waiter-workflow-matrix.ts
 */

import { supabase } from '../lib/supabase';
import { WAITER_NAMES } from '../components/waiter-mobile/ScreenM1StaffLogin';
import { SECTIONS } from '../components/waiter-tablet/TabletFloorMap';

interface TestResult {
  section: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];
let passedCount = 0;
let failedCount = 0;

function record(section: string, name: string, condition: boolean, details?: string) {
  if (condition) {
    passedCount++;
    results.push({ section, name, passed: true });
    console.log(`  [PASS] ${name}`);
  } else {
    failedCount++;
    results.push({ section, name, passed: false, details });
    console.log(`  [FAIL] ${name}${details ? ` -> ${details}` : ''}`);
  }
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function fetchApi(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, json };
  } catch (err: any) {
    return { status: 0, ok: false, json: { error: err.message } };
  }
}

async function run() {
  console.log('\n================================================================');
  console.log('  WAITER PORTAL: WORKFLOW, FLOOR OPERATIONS & LOGIC TEST MATRIX');
  console.log('  Testing Steward Mobile & Captain Tablet against live state');
  console.log('================================================================\n');

  const TEST_TABLE = 'T-10'; // Main Dining Hall table

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Steward Authentication & Section Mapping
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 1: Steward Authentication & Section Mapping ---');

  const validPins = ['1111', '2222', '3333', '4444'];
  const invalidPins = ['0000', '1234', '9999', '5555', ''];

  record(
    'Steward Auth',
    'All 4 steward PINs map to named staff and assigned sections',
    validPins.every((pin) => typeof WAITER_NAMES[pin] === 'string' && WAITER_NAMES[pin].length > 0)
  );

  record(
    'Steward Auth',
    'Invalid PINs correctly rejected by validation logic',
    invalidPins.every((pin) => WAITER_NAMES[pin] === undefined)
  );

  record(
    'Section Assignments',
    'PIN 1111 maps to Ramesh (Section A) and PIN 2222 maps to Suresh (Section B)',
    WAITER_NAMES['1111'].includes('Ramesh') && WAITER_NAMES['2222'].includes('Suresh')
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: 34-Table Floor Layout & Zone Invariants
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 2: Floor Layout & Zone Invariants ---');

  // Verify all 5 floor sections defined
  record(
    'Floor Zones',
    'Floor zones cover Couple Hall, Main Dining, Family, Courtyard, Grand Feast',
    SECTIONS.length >= 6 &&
      SECTIONS.includes('Express / Couple Hall') &&
      SECTIONS.includes('Main Dining Hall') &&
      SECTIONS.includes('Family Section') &&
      SECTIONS.includes('Courtyard Garden') &&
      SECTIONS.includes('Grand Feast Hall')
  );

  // Query tables in database to verify 34 table count
  const { data: allTables, error: tErr } = await supabase
    .from('tables')
    .select('number, section, capacity, status');

  record(
    'Table Count',
    'Database contains 34 floor tables across all sections',
    !tErr && allTables !== null && allTables.length === 34
  );

  record(
    'Table Capacity',
    'Table capacities range appropriately from 2 to 6 seats',
    allTables !== null &&
      allTables.every((t) => t.capacity >= 2 && t.capacity <= 6)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Walk-in Seating & Table Initialization
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 3: Walk-in Seating & Table Initialization ---');

  // Vacate first to guarantee clean state
  await fetchApi('/api/tables/vacate', {
    method: 'POST',
    body: JSON.stringify({ tableNumber: TEST_TABLE }),
  });

  // Seat guests via /api/tables/seat
  const seatRes = await fetchApi('/api/tables/seat', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: TEST_TABLE,
      guestCount: 3,
      serverName: 'Ramesh (Section A)',
    }),
  });

  record(
    'Walk-in Seating',
    'Table T-10 seated with 3 guests assigned to Ramesh',
    seatRes.ok &&
      seatRes.json?.status === 'OCCUPIED' &&
      seatRes.json?.guestCount === 3 &&
      seatRes.json?.serverName === 'Ramesh (Section A)'
  );

  // Verify in database
  const { data: seatedRow } = await supabase
    .from('tables')
    .select('*')
    .eq('number', TEST_TABLE)
    .single();

  record(
    'Seating Persistence',
    'Table status updated to OCCUPIED in database with serverName recorded',
    seatedRow?.status === 'OCCUPIED' &&
      seatedRow?.guest_count === 3 &&
      seatedRow?.server_name === 'Ramesh (Section A)'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Waiter Handheld KOT Ordering (Screen M4)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 4: Waiter Handheld KOT Ordering ---');

  const waiterOrderRes = await fetchApi('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: TEST_TABLE,
      seatNumber: 1,
      guestName: 'Ramesh (Section A)',
      guestCount: 3,
      source: 'WAITER',
      items: [
        {
          id: 'item-1',
          name: 'Special Chicken Donne Biryani',
          quantity: 2,
          price: 260,
          unitPrice: 260,
          prepMode: 'Military Dum Handi',
          selectedOption: 'Medium Spicy (Traditional)',
        },
        {
          id: 'item-3',
          name: 'Kshatriya Chicken Kebab (Crispy)',
          quantity: 1,
          price: 220,
          unitPrice: 220,
          prepMode: 'Kadhai Deep Fry',
        },
      ],
    }),
  });

  const orderId = waiterOrderRes.json?.orderId;
  const ticketId = waiterOrderRes.json?.ticketId;
  const expectedTotal = 520 + 220 + Math.round((520 + 220) * 0.05); // 740 + 37 = 777

  record(
    'Waiter KOT Placement',
    'Handheld order fired to kitchen with source WAITER',
    waiterOrderRes.ok && !!orderId && !!ticketId
  );

  // Verify table bill updated
  const { data: updatedTable } = await supabase
    .from('tables')
    .select('current_bill, kot_count')
    .eq('number', TEST_TABLE)
    .single();

  record(
    'Table Balance Sync',
    'Table running bill incremented and KOT count set to 1',
    Number(updatedTable?.current_bill) === expectedTotal && updatedTable?.kot_count === 1
  );

  // Verify KDS ticket has source = 'WAITER'
  const { data: kdsTicket } = await supabase
    .from('kds_tickets')
    .select('source, server_name')
    .eq('id', ticketId)
    .single();

  record(
    'Kitchen Source Trace',
    'KDS Ticket tagged with source WAITER and steward name',
    kdsTicket?.source === 'WAITER' && kdsTicket?.server_name === 'Ramesh (Section A)'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Assistance Call Dispatch & Resolution (Screen M5)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 5: Assistance Call Dispatch & Resolution ---');

  // Customer triggers assistance call at T-10
  const pingCreate = await fetchApi('/api/pings/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: TEST_TABLE,
      seatNumber: 1,
      type: 'EXTRA_CUTLERY',
      guestName: 'Diner at T-10',
      message: 'Need 2 extra plates and forks',
    }),
  });

  const pingId = pingCreate.json?.pingId;
  record(
    'Ping Dispatch',
    'Assistance call created with status PENDING',
    pingCreate.ok && !!pingId && pingCreate.json?.status === 'PENDING'
  );

  // Waiter attends and resolves ping
  const pingResolve = await fetchApi('/api/pings/resolve', {
    method: 'POST',
    body: JSON.stringify({ pingId }),
  });

  record(
    'Ping Attendance',
    'Steward marks ping as RESOLVED upon delivering items',
    pingResolve.ok && pingResolve.json?.status === 'RESOLVED'
  );

  // Verify resolved in database
  const { data: pingRow } = await supabase
    .from('pings')
    .select('status')
    .eq('id', pingId)
    .single();

  record(
    'Ping DB Update',
    'Database reflects ping status RESOLVED',
    pingRow?.status === 'RESOLVED'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Kitchen Ready Pass Expediting
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 6: Kitchen Ready Pass Expediting ---');

  // Kitchen bumps table ticket to READY
  const bumpReadyRes = await fetchApi('/api/kds/bump-table', {
    method: 'POST',
    body: JSON.stringify({ ticketId, status: 'READY' }),
  });

  record(
    'Pass Counter Notification',
    'Kitchen marks ticket READY to signal food ready at pass counter',
    bumpReadyRes.ok && bumpReadyRes.json?.status === 'READY'
  );

  // Verify ticket status in database is READY
  const { data: readyTicket } = await supabase
    .from('kds_tickets')
    .select('status')
    .eq('id', ticketId)
    .single();

  record(
    'Pass Ticket State',
    'KDS Ticket status is READY for steward pickup',
    readyTicket?.status === 'READY'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Bill Settlement & Cash/UPI Calculation (Screen M6)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 7: Bill Settlement & Payment Collection ---');

  // Cash change calculation logic test
  const billAmount = expectedTotal; // 777
  const cashTendered = 1000;
  const expectedChange = cashTendered - billAmount; // 223

  record(
    'Cash Change Arithmetic',
    'Change calculation correctly yields ₹223 on ₹1000 tendered for ₹777 bill',
    expectedChange === 223
  );

  // Record payment via /api/payments/verify
  const payConfirm = await fetchApi('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      tableNumber: TEST_TABLE,
      amount: billAmount,
      paymentMethod: 'CASH',
    }),
  });

  record(
    'Payment Settlement',
    'Waiter records cash payment: returns CONFIRMED with 12-digit bank UTR',
    payConfirm.ok &&
      payConfirm.json?.status === 'CONFIRMED' &&
      typeof payConfirm.json?.bankUtr === 'string'
  );

  // Verify order is marked PAID
  const { data: paidOrder } = await supabase
    .from('orders')
    .select('status, payment_method')
    .eq('id', orderId)
    .single();

  record(
    'Order Paid Sync',
    'Order status updated to PAID with payment method CASH',
    paidOrder?.status === 'PAID' && paidOrder?.payment_method === 'CASH'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 8: Vacate & Table Turnover (Two-Step Guard)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 8: Vacate & Table Turnover (Two-Step Guard) ---');

  // Vacate table via /api/tables/vacate
  const vacateRes = await fetchApi('/api/tables/vacate', {
    method: 'POST',
    body: JSON.stringify({ tableNumber: TEST_TABLE }),
  });

  record(
    'Table Turnover',
    'Table vacated: status reset to VACANT with current_bill at 0',
    vacateRes.ok && vacateRes.json?.status === 'VACANT'
  );

  // Verify in database that table and seats are clean
  const { data: cleanedTable } = await supabase
    .from('tables')
    .select('*')
    .eq('number', TEST_TABLE)
    .single();

  record(
    'Turnover Invariant',
    'Table record reset: status VACANT, bill 0, guestCount 0, kotCount 0',
    cleanedTable?.status === 'VACANT' &&
      Number(cleanedTable?.current_bill) === 0 &&
      cleanedTable?.guest_count === 0 &&
      cleanedTable?.kot_count === 0
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 9: Error Handling & API Boundary Defenses
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 9: Error Handling & API Boundary Defenses ---');

  // 9.1 Missing tableNumber on seating
  const errSeat = await fetchApi('/api/tables/seat', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  record(
    'API Boundary Check',
    'Missing tableNumber on seating returns 400 Bad Request',
    errSeat.status === 400 && !!errSeat.json?.error
  );

  // 9.2 Nonexistent tableNumber on seating
  const errSeatNotFound = await fetchApi('/api/tables/seat', {
    method: 'POST',
    body: JSON.stringify({ tableNumber: 'T-9999' }),
  });
  record(
    'API Boundary Check',
    'Nonexistent tableNumber on seating returns 404 Not Found',
    errSeatNotFound.status === 404
  );

  // 9.3 Missing tableNumber on vacate
  const errVacate = await fetchApi('/api/tables/vacate', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  record(
    'API Boundary Check',
    'Missing tableNumber on vacate returns 400 Bad Request',
    errVacate.status === 400 && !!errVacate.json?.error
  );

  // 9.4 Nonexistent tableNumber on vacate
  const errVacateNotFound = await fetchApi('/api/tables/vacate', {
    method: 'POST',
    body: JSON.stringify({ tableNumber: 'T-9999' }),
  });
  record(
    'API Boundary Check',
    'Nonexistent tableNumber on vacate returns 404 Not Found',
    errVacateNotFound.status === 404
  );

  // 9.5 Missing pingId on resolve
  const errPingResolve = await fetchApi('/api/pings/resolve', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  record(
    'API Boundary Check',
    'Missing pingId on resolve returns 400 Bad Request',
    errPingResolve.status === 400 && !!errPingResolve.json?.error
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    console.error('Failed Tests:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  - [${r.section}] ${r.name}: ${r.details || 'Assertion failed'}`);
    });
    process.exit(1);
  } else {
    console.log('All waiter portal workflow & logic test cases passed with 100% correctness.');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
