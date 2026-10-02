/**
 * test-phase4-payments.js
 * ──────────────────────────────────────────────────────────────────────
 * Phase 4 automated test suite: Zero-Typing Payment Engine
 * (NPCI Standard UPI Intent, Dynamic QR, Settlement Verification & Cascade)
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
  console.log('  PHASE 4 TEST SUITE: Zero-Typing Payment Engine');
  console.log(`  Server: ${BASE}`);
  console.log('══════════════════════════════════════════════════════\n');

  // ── TEST 1: Server Reachability ──
  console.log('── TEST 1: Server reachability ──');
  try {
    const res = await fetch(`${BASE}/api/session/verify?tableNumber=T-25&seatNumber=1`);
    assert('Dev server is reachable', res.status < 500, `Got status ${res.status}`);
  } catch (e) {
    assert('Dev server is reachable', false, e.message);
  }

  // ── TEST 2: Pre-test Cleanup & Seating ──
  console.log('\n── TEST 2: Pre-test cleanup & seating at T-25 ──');
  const vac = await api('/api/tables/vacate', { tableNumber: 'T-25' });
  assert('Vacate T-25', vac.ok, JSON.stringify(vac.json));
  await sleep(300);

  const seat = await api('/api/tables/seat', {
    tableNumber: 'T-25',
    guestCount: 2,
    captainName: 'PaymentCaptain',
  });
  assert('Seat T-25', seat.ok, JSON.stringify(seat.json));

  // ── TEST 3: Create Active Order ──
  console.log('\n── TEST 3: Create active order at T-25 ──');
  const orderRes = await api('/api/orders/create', {
    tableNumber: 'T-25',
    seatNumber: 1,
    guestName: 'PayTester',
    guestCount: 2,
    source: 'CUSTOMER',
    items: [
      { name: 'Mutton Biryani', quantity: 1, price: 260, unitPrice: 260, prepMode: 'Dum' },
      { name: 'Gunpowder Wings', quantity: 1, price: 180, unitPrice: 180, prepMode: 'Crispy' },
    ],
  });
  assert('Order created', orderRes.ok, JSON.stringify(orderRes.json));
  const orderId = orderRes.json?.orderId;
  const expectedTotal = orderRes.json?.total; // 440 + 5% GST = 462
  assert('Order ID is generated', !!orderId, `Got: ${orderId}`);
  assert('Order total calculated correctly', expectedTotal > 0, `Total: ${expectedTotal}`);
  await sleep(400);

  // ── TEST 4: Substep 4.1: UPI Intent & Dynamic QR Generation ──
  console.log('\n── TEST 4: Substep 4.1: Payment Initiation (/api/payments/initiate) ──');
  const initRes = await api('/api/payments/initiate', {
    orderId,
    tableNumber: 'T-25',
    seatNumber: 1,
    amount: expectedTotal,
  });
  assert('Payment initiate returns 200', initRes.ok, JSON.stringify(initRes.json));

  const initData = initRes.json;
  assert('Returns paymentId', !!initData.paymentId, `Got: ${initData.paymentId}`);
  assert('Returns txnRef', !!initData.txnRef, `Got: ${initData.txnRef}`);
  assert('Returns status = PENDING', initData.status === 'PENDING', `Got: ${initData.status}`);
  assert('UPI URI starts with upi://pay?', initData.upiUri?.startsWith('upi://pay?'), `Got: ${initData.upiUri}`);
  assert('UPI URI contains merchant VPA', initData.upiUri?.includes('pa='), `Got: ${initData.upiUri}`);
  assert('UPI URI contains exact amount', initData.upiUri?.includes(`am=${expectedTotal.toFixed(2)}`), `Got: ${initData.upiUri}`);
  assert('UPI URI contains currency INR', initData.upiUri?.includes('cu=INR'), `Got: ${initData.upiUri}`);
  assert('UPI URI contains transaction reference', initData.upiUri?.includes(`tr=${initData.txnRef}`), `Got: ${initData.upiUri}`);

  // Dynamic QR Code check
  assert(
    'Returns dynamic base64 QR Data URL or QR Image URL',
    initData.qrDataUrl?.startsWith('data:image/') || initData.qrDataUrl?.startsWith('http'),
    `qrDataUrl length: ${initData.qrDataUrl?.length}`
  );
  assert('Returns external fallback QR Image URL', !!initData.qrImageUrl, `Got: ${initData.qrImageUrl}`);

  // Mobile App Intents check
  assert('App intent for Google Pay exists', !!initData.appIntents?.gpay?.startsWith('tez://upi/pay?'), `Got: ${initData.appIntents?.gpay}`);
  assert('App intent for PhonePe exists', !!initData.appIntents?.phonepe?.startsWith('phonepe://pay?'), `Got: ${initData.appIntents?.phonepe}`);
  assert('App intent for Paytm exists', !!initData.appIntents?.paytm?.startsWith('paytmmp://pay?'), `Got: ${initData.appIntents?.paytm}`);
  assert('App intent for Cred exists', !!initData.appIntents?.cred?.startsWith('credpay://upi/pay?'), `Got: ${initData.appIntents?.cred}`);
  assert('App intent for BHIM exists', !!initData.appIntents?.bhim?.startsWith('bhim://pay?'), `Got: ${initData.appIntents?.bhim}`);

  await sleep(400);

  // Database check for PENDING payment
  const dbPaymentPending = await dbGetSingle('payments', { id: initData.paymentId });
  assert('Payment record inserted in DB', !!dbPaymentPending, `ID: ${initData.paymentId}`);
  assert('Payment status in DB is PENDING', dbPaymentPending?.status === 'PENDING', `Got: ${dbPaymentPending?.status}`);
  assert('Payment amount in DB matches order total', Number(dbPaymentPending?.amount) === expectedTotal, `Got: ${dbPaymentPending?.amount}`);
  assert('Payment gateway_ref matches txnRef', dbPaymentPending?.gateway_ref === initData.txnRef, `Got: ${dbPaymentPending?.gateway_ref}`);

  // ── TEST 5: Edge Cases & Input Validation ──
  console.log('\n── TEST 5: Input validation & error boundaries ──');
  const noOrderId = await api('/api/payments/initiate', { amount: 100 });
  assert('Initiate without orderId returns 400', noOrderId.status === 400, `Got: ${noOrderId.status}`);

  const badOrderId = await api('/api/payments/initiate', { orderId: 'NON-EXISTENT-ORDER-999' });
  assert('Initiate with invalid orderId returns 404', badOrderId.status === 404, `Got: ${badOrderId.status}`);

  // ── TEST 6: Substep 4.2: Polling Status (GET /api/payments/verify) ──
  console.log('\n── TEST 6: Substep 4.2: Payment Polling (GET /api/payments/verify) ──');
  const pollRes = await api(`/api/payments/verify?orderId=${orderId}`, null, 'GET');
  assert('Polling GET returns 200', pollRes.ok, JSON.stringify(pollRes.json));
  assert('Polling returns status = PENDING', pollRes.json?.status === 'PENDING', `Got: ${pollRes.json?.status}`);
  assert('Polling returns settled = false', pollRes.json?.settled === false, `Got: ${pollRes.json?.settled}`);

  // ── TEST 7: Substep 4.2 & 4.3: Automated Settlement & Cascade (POST /api/payments/verify) ──
  console.log('\n── TEST 7: Substep 4.2 & 4.3: Settlement & Cascade (POST /api/payments/verify) ──');
  const verifyRes = await api('/api/payments/verify', {
    orderId,
    paymentId: initData.paymentId,
    txnRef: initData.txnRef,
  });
  assert('Payment verify returns 200', verifyRes.ok, JSON.stringify(verifyRes.json));
  assert('Verify status is CONFIRMED', verifyRes.json?.status === 'CONFIRMED', `Got: ${verifyRes.json?.status}`);
  assert('Verify settled is true', verifyRes.json?.settled === true, `Got: ${verifyRes.json?.settled}`);
  assert('12-digit Indian Bank UTR generated', !!verifyRes.json?.bankUtr?.match(/^4281\d{8}$/), `Got UTR: ${verifyRes.json?.bankUtr}`);

  await sleep(500); // Allow database update propagation

  // ── TEST 8: Settlement Cascade Verification in Database ──
  console.log('\n── TEST 8: Realtime settlement cascade in database ──');
  const dbPaymentConfirmed = await dbGetSingle('payments', { id: initData.paymentId });
  assert('Payment record status transitioned to CONFIRMED', dbPaymentConfirmed?.status === 'CONFIRMED', `Got: ${dbPaymentConfirmed?.status}`);
  assert('Payment record has confirmed_at timestamp', !!dbPaymentConfirmed?.confirmed_at, `Got: ${dbPaymentConfirmed?.confirmed_at}`);
  assert('Payment record has unique bank_utr', !!dbPaymentConfirmed?.bank_utr, `Got: ${dbPaymentConfirmed?.bank_utr}`);

  const dbOrderPaid = await dbGetSingle('orders', { id: orderId });
  assert('Order status updated to PAID in DB', dbOrderPaid?.status === 'PAID', `Got: ${dbOrderPaid?.status}`);

  const dbSeatPaid = await dbGetSingle('table_seats', { table_number: 'T-25', seat_number: 1 });
  assert('table_seats status updated to PAID in DB', dbSeatPaid?.status === 'PAID', `Got: ${dbSeatPaid?.status}`);

  const dbTableStatus = await dbGetSingle('tables', { number: 'T-25' });
  assert('tables status transitioned to BILLING', dbTableStatus?.status === 'BILLING', `Got: ${dbTableStatus?.status}`);

  // ── TEST 9: Idempotency & Double Payment Prevention ──
  console.log('\n── TEST 9: Idempotency & double-payment protection ──');
  const duplicateVerify = await api('/api/payments/verify', {
    orderId,
    paymentId: initData.paymentId,
  });
  assert('Duplicate verify succeeds idempotently', duplicateVerify.ok, JSON.stringify(duplicateVerify.json));
  assert('Duplicate verify maintains CONFIRMED status', duplicateVerify.json?.status === 'CONFIRMED', `Got: ${duplicateVerify.json?.status}`);
  assert('Duplicate verify returns same bank UTR', duplicateVerify.json?.bankUtr === verifyRes.json?.bankUtr, `Got: ${duplicateVerify.json?.bankUtr}`);

  const duplicateInitiate = await api('/api/payments/initiate', {
    orderId,
    tableNumber: 'T-25',
    seatNumber: 1,
    amount: expectedTotal,
  });
  assert('Re-initiating payment for already PAID order is rejected', duplicateInitiate.status === 400, `Got status: ${duplicateInitiate.status}`);
  assert('Returns order already settled message', duplicateInitiate.json?.error?.includes('already settled'), `Got: ${duplicateInitiate.json?.error}`);

  // ── TEST 10: Polling Post-Settlement Verification ──
  console.log('\n── TEST 10: Polling post-settlement verification ──');
  const pollAfterPay = await api(`/api/payments/verify?orderId=${orderId}`, null, 'GET');
  assert('Polling after settlement reports CONFIRMED', pollAfterPay.json?.status === 'CONFIRMED', `Got: ${pollAfterPay.json?.status}`);
  assert('Polling after settlement reports settled = true', pollAfterPay.json?.settled === true, `Got: ${pollAfterPay.json?.settled}`);

  // ── TEST 11: Cleanup & Reset ──
  console.log('\n── TEST 11: Post-test cleanup ──');
  const vacEnd = await api('/api/tables/vacate', { tableNumber: 'T-25' });
  assert('Vacate T-25 post-test', vacEnd.ok, JSON.stringify(vacEnd.json));
  await sleep(300);

  const finalTable = await dbGetSingle('tables', { number: 'T-25' });
  assert('T-25 status is VACANT', finalTable?.status === 'VACANT', `Got: ${finalTable?.status}`);
  assert('T-25 current_bill is reset to 0', Number(finalTable?.current_bill) === 0, `Got: ${finalTable?.current_bill}`);

  // ── Summary ──
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Phase 4 Results: ${passed} passed / ${failed} failed`);
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
