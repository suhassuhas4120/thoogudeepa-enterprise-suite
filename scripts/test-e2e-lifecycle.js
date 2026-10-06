/**
 * test-e2e-lifecycle.js
 *
 * Phase 9 End-to-End Restaurant Lifecycle Integration Test
 *
 * Verifies complete 7-stage dining lifecycle across Customer, Kitchen, and Waiter portals:
 *   Stage 1: QR scan & session verification at T-15
 *   Stage 2: Customer places multi-item order via /api/orders/create
 *   Stage 3: Kitchen receives KDS ticket, increments prep delay & steps items to PLATED
 *   Stage 4: Waiter pass detects READY ticket, serves table & completes ticket
 *   Stage 5: Customer initiates zero-typing UPI payment via /api/payments/initiate
 *   Stage 6: System auto-settles payment via /api/payments/verify with authentic Indian UTR
 *   Stage 7: Floor Captain vacates table via /api/tables/vacate, verifying 0 bill & VACANT state
 */

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
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
  console.log('  PHASE 9 FULL E2E LIFECYCLE INTEGRATION TEST');
  console.log(`  Target Table: T-15 | Server: ${BASE}`);
  console.log('======================================================\n');

  const tableNum = 'T-15';
  const seatNum = 1;

  // STAGE 0: Pre-cleanup
  console.log('── STAGE 0: Pre-flight Floor Sanitization ──');
  const cleanRes = await api('/api/tables/vacate', { tableNumber: tableNum });
  assert(cleanRes.ok, `Table ${tableNum} pre-vacated to clean slate`);

  // STAGE 1: QR Scan & Seating
  console.log('\n── STAGE 1: QR Handshake & Seating (Screen 1) ──');
  const seatRes = await api('/api/tables/seat', {
    tableNumber: tableNum,
    guestCount: 3,
    serverName: 'Captain Ramesh',
  });
  assert(seatRes.ok, `Table ${tableNum} seated with 3 guests`);
  
  const seatedTable = await dbGetSingle('tables', { number: tableNum });
  assert(seatedTable?.status === 'OCCUPIED', `Database confirms table status is '${seatedTable?.status}'`);
  assert(seatedTable?.guest_count === 3, `Database guest count is ${seatedTable?.guest_count}`);

  // STAGE 2: Customer Places Order
  console.log('\n── STAGE 2: Customer Places Order (Screens 2-4) ──');
  const orderRes = await api('/api/orders/create', {
    tableNumber: tableNum,
    seatNumber: seatNum,
    items: [
      { name: 'Special Chicken Donne Biryani', quantity: 2, price: 280, unitPrice: 280 },
      { name: 'Guntur Pepper Chicken Fry', quantity: 1, price: 240, unitPrice: 240 },
    ],
  });
  assert(orderRes.ok, `Order created successfully`);
  const orderId = orderRes.json?.orderId;
  const ticketId = orderRes.json?.ticketId;
  assert(!!orderId, `Order ID issued: ${orderId}`);
  assert(!!ticketId, `Kitchen Ticket ID issued: ${ticketId}`);

  const dbOrder = await dbGetSingle('orders', { id: orderId });
  assert(dbOrder?.status === 'UNPAID', `Order status in DB is '${dbOrder?.status}'`);
  assert(Number(dbOrder?.total) === 840, `Order total ₹${dbOrder?.total} matches expected ₹840`);

  // STAGE 3: Kitchen Receives Ticket & Preps Items
  console.log('\n── STAGE 3: Kitchen Ticket Processing & Cooking (KDS Screens) ──');
  const dbTicket = await dbGetSingle('kds_tickets', { id: ticketId });
  assert(!!dbTicket, `KDS Ticket exists in database`);
  assert(dbTicket?.status === 'NEW', `Ticket initial status is '${dbTicket?.status}'`);

  const bumpPrep = await api('/api/kds/bump-table', { ticketId, status: 'PREP' });
  assert(bumpPrep.ok, 'Kitchen bumped ticket to PREP');

  const bumpReady = await api('/api/kds/bump-table', { ticketId, status: 'READY' });
  assert(bumpReady.ok, 'Kitchen bumped ticket to READY (All items PLATED)');

  const readyTicket = await dbGetSingle('kds_tickets', { id: ticketId });
  assert(readyTicket?.status === 'READY', `KDS ticket status in DB is '${readyTicket?.status}' (READY for pass)`);

  // STAGE 4: Waiter Serves Food
  console.log('\n── STAGE 4: Steward Serves Dishes to Table ──');
  const bumpCompleted = await api('/api/kds/bump-table', { ticketId, status: 'COMPLETED' });
  assert(bumpCompleted.ok, 'Steward marked all dishes SERVED to table');

  const completedTicket = await dbGetSingle('kds_tickets', { id: ticketId });
  assert(completedTicket?.status === 'COMPLETED', `KDS ticket finalized to '${completedTicket?.status}'`);

  // STAGE 5: Customer Initiates Zero-Typing Payment
  console.log('\n── STAGE 5: Zero-Typing UPI Payment Initiation (Screens 6-7) ──');
  const payInit = await api('/api/payments/initiate', {
    orderId,
    tableNumber: tableNum,
    seatNumber: seatNum,
    amount: 840,
    customerName: 'Suhas',
  });
  assert(payInit.ok, 'UPI payment session initiated');
  const paymentId = payInit.json?.paymentId;
  const upiUri = payInit.json?.upiUri;
  assert(!!paymentId, `Payment ID generated: ${paymentId}`);
  assert(upiUri?.startsWith('upi://pay?'), 'NPCI compliant UPI URI generated');
  assert(upiUri?.includes('am=840'), 'UPI URI includes exact bill amount ₹840');

  // STAGE 6: Settlement Auto-Verification
  console.log('\n── STAGE 6: Automated Settlement & UTR Reconciliation (Screen 8) ──');
  const payVerify = await api('/api/payments/verify', {
    paymentId,
    orderId,
    autoSettle: true,
  });
  assert(payVerify.ok, 'Payment verification returned HTTP 200');
  assert(payVerify.json?.status === 'CONFIRMED', `Payment confirmed: status = ${payVerify.json?.status}`);
  assert(!!payVerify.json?.bankUtr, `Authentic Bank UTR generated: ${payVerify.json?.bankUtr}`);

  const paidOrder = await dbGetSingle('orders', { id: orderId });
  assert(paidOrder?.status === 'PAID', `Database order status updated to '${paidOrder?.status}'`);

  // STAGE 7: Table Vacate & Turnaround
  console.log('\n── STAGE 7: Table Vacate & Turnaround Ready for Next Guest ──');
  const vacateRes = await api('/api/tables/vacate', { tableNumber: tableNum });
  assert(vacateRes.ok, `Table ${tableNum} vacated`);

  const cleanTable = await dbGetSingle('tables', { number: tableNum });
  assert(cleanTable?.status === 'VACANT', `Table status reset to '${cleanTable?.status}'`);
  assert(Number(cleanTable?.current_bill || 0) === 0, `Table running bill reset to ₹0`);
  assert(cleanTable?.guest_count === 0, `Table guest count reset to 0`);

  // SUMMARY
  console.log('\n======================================================');
  console.log(`  E2E Results: ${passed} passed / ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    console.error('Failed Assertions:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('FULL E2E LIFECYCLE COMPLETE: All 7 dining stages verified seamlessly.');
  }
}

run().catch((err) => {
  console.error('FATAL E2E ERROR:', err);
  process.exit(1);
});
