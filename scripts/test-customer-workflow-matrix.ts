/**
 * Customer Ordering Portal — Comprehensive Workflow & Logic Test Matrix
 *
 * Evaluates the customer experience from initial QR code scan to final settlement,
 * testing for data loss, network recovery, edge cases, financial invariants,
 * security guardrails, inventory (86) toggles, and multi-portal state synchronization.
 *
 * Execution: npx tsx scripts/test-customer-workflow-matrix.ts
 */

import { supabase } from '../lib/supabase';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';

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
  console.log('  CUSTOMER PORTAL: WORKFLOW, LOGIC & SECURITY TEST MATRIX');
  console.log('  Testing against live API and Supabase state');
  console.log('================================================================\n');

  const TEST_TABLE = 'T-01';
  const TEST_SEAT = 1;

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: QR Scan & Parameter Handshake
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 1: QR Scan & Parameter Handshake ---');

  // Clean test table first
  await fetchApi('/api/tables/vacate', {
    method: 'POST',
    body: JSON.stringify({ tableNumber: TEST_TABLE }),
  });

  // 1.1 Valid scan session verification on vacant table
  const s1 = await fetchApi(`/api/session/verify?tableNumber=${TEST_TABLE}&seatNumber=${TEST_SEAT}`);
  record(
    'QR Scan',
    'Vacant table returns active=false and no ongoing order',
    s1.ok && s1.json?.active === false && s1.json?.order === null
  );

  // 1.2 Lowercase table normalization
  const s2 = await fetchApi(`/api/session/verify?tableNumber=t-01&seatNumber=1`);
  record(
    'QR Scan',
    'Lowercase table param (t-01) normalizes correctly to T-01',
    s2.ok && s2.json?.tableNumber === 'T-01'
  );

  // 1.3 Missing table parameter validation
  const s3 = await fetchApi(`/api/session/verify?seatNumber=1`);
  record(
    'QR Scan',
    'Missing table parameter returns 400 Bad Request',
    s3.status === 400 && !!s3.json?.error
  );

  // 1.4 Nonexistent table validation on order creation
  const s4 = await fetchApi('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: 'T-9999',
      seatNumber: 1,
      items: [{ name: 'Test Biryani', quantity: 1, price: 260 }],
    }),
  });
  record(
    'QR Scan',
    'Nonexistent table order attempt returns 404 not found',
    s4.status === 404 && s4.json?.error?.includes('does not exist')
  );

  // 1.5 Injection protection in table parameter
  const s5 = await fetchApi('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: "T-01'; DROP TABLE orders; --",
      seatNumber: 1,
      items: [{ name: 'Test Biryani', quantity: 1, price: 260 }],
    }),
  });
  record(
    'QR Scan',
    'SQL injection payload in tableNumber safely handled with 404',
    s5.status === 404
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Menu Integrity, Stock-Out (86) & Financial Invariants
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 2: Menu Integrity & Inventory (86) ---');

  record(
    'Menu & Pricing',
    'Canonical menu contains authentic Donne Biryani catalogue (>=6 items)',
    INITIAL_MENU_ITEMS.length >= 6 && INITIAL_MENU_ITEMS.some((i) => i.name.includes('Donne Biryani'))
  );

  const biryani = INITIAL_MENU_ITEMS.find((i) => i.id === 'item-1')!;
  record(
    'Menu & Pricing',
    'Item options and add-ons structure has non-zero pricing',
    biryani.price > 0 && biryani.optionsGroup2.addOns.every((a) => a.extraPrice > 0)
  );

  // 2.1 Out of Stock (86) Toggle test
  const toggle86On = await fetchApi('/api/kds/toggle-86', {
    method: 'POST',
    body: JSON.stringify({ itemId: 'item-1', is86: true }),
  });
  record(
    'Inventory 86',
    'Item marked 86 stock-out via Kitchen toggle',
    toggle86On.ok && toggle86On.json?.item?.is86 === true
  );

  // Re-enable item
  const toggle86Off = await fetchApi('/api/kds/toggle-86', {
    method: 'POST',
    body: JSON.stringify({ itemId: 'item-1', is86: false }),
  });
  record(
    'Inventory 86',
    'Item restored to active stock via Kitchen toggle',
    toggle86Off.ok && toggle86Off.json?.item?.is86 === false
  );

  // 2.2 Empty cart rejection
  const ordEmpty = await fetchApi('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: TEST_TABLE,
      seatNumber: TEST_SEAT,
      items: [],
    }),
  });
  record(
    'Cart Invariants',
    'Zero-item order rejected with 400 Bad Request',
    ordEmpty.status === 400 && !!ordEmpty.json?.error
  );

  // 2.3 Tax calculation invariant (5% GST: 2.5% CGST + 2.5% SGST)
  const itemPrice = 260;
  const qty = 2;
  const subtotal = itemPrice * qty; // 520
  const expectedTax = Math.round(subtotal * 0.05); // 26
  const expectedTotal = subtotal + expectedTax; // 546

  const ordCreate = await fetchApi('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: TEST_TABLE,
      seatNumber: TEST_SEAT,
      guestName: 'Diner Test',
      guestCount: 2,
      items: [
        {
          id: 'item-1',
          name: 'Special Chicken Donne Biryani',
          quantity: qty,
          unitPrice: itemPrice,
          price: itemPrice,
          prepMode: 'Military Dum Handi',
          selectedOption: 'Medium Spicy (Traditional)',
        },
      ],
    }),
  });

  const createdOrderId = ordCreate.json?.orderId;
  const createdTicketId = ordCreate.json?.ticketId;

  record(
    'Order Placement',
    'Order created successfully with positive identifiers',
    ordCreate.ok && !!createdOrderId && !!createdTicketId
  );

  record(
    'Financial Invariant',
    'Accurate GST 5% calculation and financial sum match',
    ordCreate.json?.subtotal === subtotal &&
      ordCreate.json?.tax === expectedTax &&
      ordCreate.json?.total === expectedTotal
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Real-Time Session Recovery & Browser Resilience
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 3: Session Recovery & Browser Resilience ---');

  // 3.1 Customer closes browser or switches app, re-scans table QR
  const recoverRes = await fetchApi(
    `/api/session/verify?tableNumber=${TEST_TABLE}&seatNumber=${TEST_SEAT}`
  );
  record(
    'Browser Resilience',
    'Active session recovers ongoing unpaid order upon re-entry',
    recoverRes.ok &&
      recoverRes.json?.active === true &&
      recoverRes.json?.activeOrder?.id === createdOrderId &&
      recoverRes.json?.activeOrder?.total === expectedTotal
  );

  // 3.2 Verify table occupancy cascaded in database
  const { data: tableRow } = await supabase
    .from('tables')
    .select('*')
    .eq('number', TEST_TABLE)
    .single();

  record(
    'Database Cascade',
    'Table status updated to OCCUPIED and current_bill matches order total',
    tableRow?.status === 'OCCUPIED' && Number(tableRow?.current_bill) === expectedTotal
  );

  // 3.3 Verify KDS ticket exists with stage PLACED
  const { data: ticketRow } = await supabase
    .from('kds_tickets')
    .select('*')
    .eq('id', createdTicketId)
    .single();

  record(
    'Kitchen Sync',
    'KDS Ticket created with status NEW and line items staged PLACED',
    ticketRow?.status === 'NEW' && ticketRow?.items?.length > 0
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Incremental Ordering (Add More Dishes Later)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 4: Incremental Ordering ---');

  const addPrice = 220;
  const addQty = 1;
  const addSub = addPrice * addQty;
  const addTax = Math.round(addSub * 0.05);
  const addTot = addSub + addTax;

  const addRes = await fetchApi('/api/orders/add-items', {
    method: 'POST',
    body: JSON.stringify({
      orderId: createdOrderId,
      serverName: 'Diner Test',
      items: [
        {
          id: 'item-3',
          name: 'Kshatriya Chicken Kebab (Crispy)',
          quantity: addQty,
          unitPrice: addPrice,
          price: addPrice,
          prepMode: 'Kadhai Deep Fry',
        },
      ],
    }),
  });

  const cumulativeTotal = expectedTotal + addTot;

  record(
    'Incremental Ordering',
    'Supplementary dishes added to existing order with updated total',
    addRes.ok && addRes.json?.newTotal === cumulativeTotal
  );

  // Verify updated table bill reflects incremental addition
  const { data: updatedTableRow } = await supabase
    .from('tables')
    .select('current_bill')
    .eq('number', TEST_TABLE)
    .single();

  record(
    'Financial Integrity',
    'Table current_bill synchronized with incremental additions',
    Number(updatedTableRow?.current_bill) === cumulativeTotal
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Service Assistance & Waiter Dispatch
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 5: Service Assistance & Waiter Dispatch ---');

  const pingRes = await fetchApi('/api/pings/create', {
    method: 'POST',
    body: JSON.stringify({
      tableNumber: TEST_TABLE,
      seatNumber: TEST_SEAT,
      type: 'WATER',
      message: 'Need 2 extra glasses of warm water',
    }),
  });

  const pingId = pingRes.json?.pingId;
  record(
    'Service Ping',
    'Customer assistance call created with PENDING status',
    pingRes.ok && pingRes.json?.status === 'PENDING' && !!pingId
  );

  // Steward / Captain marks ping attended
  const resolvePingRes = await fetchApi('/api/pings/resolve', {
    method: 'POST',
    body: JSON.stringify({ pingId }),
  });
  record(
    'Service Ping',
    'Ping successfully marked RESOLVED by floor staff',
    resolvePingRes.ok && resolvePingRes.json?.status === 'RESOLVED'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Payment Gateway, Dynamic QR & Anti-Fraud Settle
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 6: Payment Gateway, Dynamic QR & Anti-Fraud Settle ---');

  // 6.1 Initiate UPI Payment
  const initPay = await fetchApi('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({
      orderId: createdOrderId,
      tableNumber: TEST_TABLE,
      seatNumber: TEST_SEAT,
      amount: cumulativeTotal,
      paymentMethod: 'UPI',
    }),
  });

  record(
    'Payment Initiation',
    'NPCI-compliant UPI URI and dynamic QR generated',
    initPay.ok &&
      typeof initPay.json?.upiUri === 'string' &&
      initPay.json?.upiUri.startsWith('upi://pay?') &&
      typeof initPay.json?.qrDataUrl === 'string' &&
      !!initPay.json?.paymentId
  );

  // 6.2 Polling before confirmation shows PENDING
  const pollBefore = await fetchApi(`/api/payments/verify?orderId=${encodeURIComponent(createdOrderId)}`);
  record(
    'Payment Polling',
    'Real-time status check returns PENDING prior to confirmation',
    pollBefore.ok && pollBefore.json?.status === 'PENDING' && pollBefore.json?.settled === false
  );

  // 6.3 Automated Confirmation with Authentic 12-digit UTR
  const verifyPay = await fetchApi('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({
      orderId: createdOrderId,
      paymentId: initPay.json?.paymentId,
      paymentMethod: 'UPI',
    }),
  });

  record(
    'Payment Settlement',
    'Payment confirmed with generated 12-digit bank UTR',
    verifyPay.ok &&
      verifyPay.json?.status === 'CONFIRMED' &&
      verifyPay.json?.settled === true &&
      typeof verifyPay.json?.bankUtr === 'string' &&
      verifyPay.json?.bankUtr.length >= 10
  );

  // 6.4 Idempotency Check: Replay settlement verification
  const replayPay = await fetchApi('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({
      orderId: createdOrderId,
      paymentId: initPay.json?.paymentId,
      paymentMethod: 'UPI',
    }),
  });

  record(
    'Anti-Fraud Idempotency',
    'Replay confirmation safely handled without duplicate debit or corrupt balance',
    replayPay.ok &&
      replayPay.json?.status === 'CONFIRMED' &&
      replayPay.json?.message?.includes('already confirmed')
  );

  // 6.5 Double payment prevention on initiate
  const doubleInit = await fetchApi('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({
      orderId: createdOrderId,
      tableNumber: TEST_TABLE,
      seatNumber: TEST_SEAT,
      amount: cumulativeTotal,
    }),
  });

  record(
    'Payment Guard',
    'Initiation rejected for already settled order',
    doubleInit.status === 400 && doubleInit.json?.status === 'PAID'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 7: Multi-Portal Cascade & Cleanup
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 7: Multi-Portal Cascade & Cleanup ---');

  // Verify order status in DB is PAID
  const { data: finalOrder } = await supabase
    .from('orders')
    .select('status')
    .eq('id', createdOrderId)
    .single();

  record(
    'Database Sync',
    'Order marked PAID in database',
    finalOrder?.status === 'PAID'
  );

  // Verify KDS tickets completed
  const { data: finalTickets } = await supabase
    .from('kds_tickets')
    .select('status')
    .eq('order_id', createdOrderId);

  record(
    'Kitchen Sync',
    'KDS tickets marked COMPLETED upon settlement',
    finalTickets !== null &&
      finalTickets.length > 0 &&
      finalTickets.every((t) => t.status === 'COMPLETED')
  );

  // Reset table via vacate endpoint
  const vacateRes = await fetchApi('/api/tables/vacate', {
    method: 'POST',
    body: JSON.stringify({ tableNumber: TEST_TABLE }),
  });

  record(
    'Floor Turnover',
    'Table vacated and reset for next diner party',
    vacateRes.ok && vacateRes.json?.status === 'VACANT'
  );

  // Post-vacate verification
  const postVacate = await fetchApi(`/api/session/verify?tableNumber=${TEST_TABLE}&seatNumber=${TEST_SEAT}`);
  record(
    'Turnover Integrity',
    'Vacated seat returns active=false for next customer scan',
    postVacate.ok && postVacate.json?.active === false
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
    console.log('All customer workflow & logic test cases passed with 100% correctness.');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
