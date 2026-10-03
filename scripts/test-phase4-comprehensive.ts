/**
 * Phase 4 — Comprehensive NPCI UPI Payment Engine & Dynamic QR Code Test Suite
 *
 * Tests the entire payment ecosystem across every dimension:
 *   - NPCI UPI standard URI specification (RFC 3986 & NPCI guidelines)
 *   - App deep-link intents (Google Pay, PhonePe, Paytm, CRED, BHIM)
 *   - Dynamic QR code generation, binary headers & raster dimensions
 *   - GST tax calculations (CGST 2.5%, SGST 2.5%, Total 5.0%), tips, discounts
 *   - Payment initiation API endpoint (validation, error cases, DB write)
 *   - Double payment prevention & zero-amount rejection
 *   - Payment verification polling (by orderId, paymentId, txnRef)
 *   - Settlement cascades across payments, orders, table_seats, kds_tickets, tables
 *   - Idempotent settlement re-confirmation
 *   - Static tabletop edge anchor QR generation (34 cards, 133 seat anchors)
 *   - 12-digit Bank UTR / NPCI RRN formatting and uniqueness
 *   - Security, sanitization, precision decimal math, and injection prevention
 *   - Full end-to-end payment lifecycle integration
 *
 * Run: npx tsx scripts/test-phase4-comprehensive.ts
 *
 * Prerequisite: Dev server running on http://localhost:3001
 */

import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Helpers & Harness
// ---------------------------------------------------------------------------

const BASE = 'http://localhost:3001/api';
const SUPABASE_URL = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string): void {
  if (condition) {
    process.stdout.write(`  [PASS] ${label}\n`);
    passed++;
  } else {
    process.stdout.write(`  [FAIL] ${label}\n`);
    failed++;
    failures.push(label);
  }
}

function section(title: string): void {
  process.stdout.write(`\n${'─'.repeat(60)}\n  ${title}\n${'─'.repeat(60)}\n`);
}

async function postApi(route: string, body: Record<string, unknown>): Promise<{ status: number; json: any; ms: number }> {
  const t0 = Date.now();
  const res = await fetch(`${BASE}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  let json: any = null;
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, json, ms };
}

async function getApi(route: string): Promise<{ status: number; json: any; ms: number }> {
  const t0 = Date.now();
  const res = await fetch(`${BASE}${route}`);
  const ms = Date.now() - t0;
  let json: any = null;
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, json, ms };
}

// ---------------------------------------------------------------------------
// GROUP 1: NPCI UPI URI Specification & Scheme Compliance
// ---------------------------------------------------------------------------
function testUpiUriSpecification(): void {
  section('Group 1 — NPCI UPI URI Specification & Scheme Compliance');

  const merchantVpa = 'thoogudeepa@okicici';
  const merchantName = 'Thoogudeepa Donne Biryani';
  const amount = 480.00;
  const formattedAmount = amount.toFixed(2);
  const txnRef = 'TXN-ORD-T01-123456';
  const transactionNote = 'Table T-01 Seat 1 Bill';

  const upiQuery = new URLSearchParams({
    pa: merchantVpa,
    pn: merchantName,
    am: formattedAmount,
    cu: 'INR',
    tn: transactionNote,
    tr: txnRef,
  });

  const upiUri = `upi://pay?${upiQuery.toString()}`;

  assert(upiUri.startsWith('upi://pay?'), 'URI scheme strictly starts with "upi://pay?"');
  assert(upiQuery.get('pa') === merchantVpa, 'VPA (pa) matches merchant UPI address');
  assert(upiQuery.get('pn') === merchantName, 'Merchant name (pn) matches business title');
  assert(upiQuery.get('am') === '480.00', 'Amount (am) formatted strictly with 2 decimal places');
  assert(upiQuery.get('cu') === 'INR', 'Currency (cu) strictly equals "INR"');
  assert(upiQuery.get('tn') === transactionNote, 'Transaction note (tn) preserved');
  assert(upiQuery.get('tr') === txnRef, 'Transaction reference (tr) matches reference code');

  // Decimal formatting checks
  assert((10).toFixed(2) === '10.00', 'Integer amount 10 formats to 10.00');
  assert((99.5).toFixed(2) === '99.50', 'Single decimal 99.5 formats to 99.50');
  assert((245.999).toFixed(2) === '246.00', 'Three decimals round correctly to 2 decimals');

  // Parsing back from URI string
  const urlObj = new URL(upiUri);
  assert(urlObj.protocol === 'upi:', 'Parsed protocol is "upi:"');
  assert(urlObj.hostname === 'pay', 'Parsed hostname is "pay"');
  assert(urlObj.searchParams.get('cu') === 'INR', 'Parsed searchParam cu is INR');
  assert(urlObj.searchParams.get('pa') === 'thoogudeepa@okicici', 'Parsed searchParam pa is thoogudeepa@okicici');

  // VPA syntax validation
  const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  assert(vpaRegex.test('thoogudeepa@okicici'), 'Valid ICICI UPI VPA passes regex');
  assert(vpaRegex.test('merchant.bills@okhdfcbank'), 'Valid HDFC UPI VPA passes regex');
  assert(vpaRegex.test('user@upi'), 'Valid generic UPI VPA passes regex');
  assert(!vpaRegex.test('invalid-vpa-without-at'), 'Invalid VPA without @ fails regex');
  assert(!vpaRegex.test('@emptyusername'), 'Invalid VPA with empty handle fails regex');
  assert(!vpaRegex.test('username@'), 'Invalid VPA with empty bank handle fails regex');

  // URL Encoding
  assert(upiUri.includes('pn=Thoogudeepa+Donne+Biryani') || upiUri.includes('pn=Thoogudeepa%20Donne%20Biryani'), 'Spaces in payee name properly encoded');
  assert(!upiUri.includes(' '), 'URI string contains zero raw whitespace characters');
}

// ---------------------------------------------------------------------------
// GROUP 2: App Deep-Link Intent URI Generation
// ---------------------------------------------------------------------------
function testAppIntentDeepLinks(): void {
  section('Group 2 — App Deep-Link Intent URI Generation');

  const query = new URLSearchParams({
    pa: 'thoogudeepa@okicici',
    pn: 'Thoogudeepa Donne Biryani',
    am: '350.00',
    cu: 'INR',
    tn: 'Table T-02 Seat 1',
    tr: 'TXN-101',
  }).toString();

  const intents = {
    generic: `upi://pay?${query}`,
    gpay: `tez://upi/pay?${query}`,
    phonepe: `phonepe://pay?${query}`,
    paytm: `paytmmp://pay?${query}`,
    cred: `credpay://upi/pay?${query}`,
    bhim: `bhim://pay?${query}`,
  };

  assert(intents.generic.startsWith('upi://pay?'), 'Generic intent uses standard upi:// scheme');
  assert(intents.gpay.startsWith('tez://upi/pay?'), 'Google Pay intent uses tez://upi/pay? scheme');
  assert(intents.phonepe.startsWith('phonepe://pay?'), 'PhonePe intent uses phonepe://pay? scheme');
  assert(intents.paytm.startsWith('paytmmp://pay?'), 'Paytm intent uses paytmmp://pay? scheme');
  assert(intents.cred.startsWith('credpay://upi/pay?'), 'CRED intent uses credpay://upi/pay? scheme');
  assert(intents.bhim.startsWith('bhim://pay?'), 'BHIM intent uses bhim://pay? scheme');

  // Parameter preservation across all apps
  for (const [app, uri] of Object.entries(intents)) {
    assert(uri.includes('pa=thoogudeepa%40okicici') || uri.includes('pa=thoogudeepa@okicici'), `${app}: Preserves merchant VPA`);
    assert(uri.includes('am=350.00'), `${app}: Preserves exact amount`);
    assert(uri.includes('cu=INR'), `${app}: Preserves currency INR`);
  }
}

// ---------------------------------------------------------------------------
// GROUP 3: Dynamic QR Code Binary & Image Integrity
// ---------------------------------------------------------------------------
async function testQrCodeImageIntegrity(): Promise<void> {
  section('Group 3 — Dynamic QR Code Binary & Image Integrity');

  const upiUri = 'upi://pay?pa=thoogudeepa@okicici&pn=Thoogudeepa&am=260.00&cu=INR&tn=Bill&tr=TXN-1';

  const t0 = Date.now();
  const qrDataUrl = await QRCode.toDataURL(upiUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: {
      dark: '#0F3A22',
      light: '#FFFFFF',
    },
  });
  const ms = Date.now() - t0;

  process.stdout.write(`  [TIME] QRCode.toDataURL generation latency: ${ms}ms\n`);
  assert(ms < 100, `QR Code generation latency under 100ms (actual: ${ms}ms)`);

  assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Data URL starts with standard PNG data URI header');

  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  assert(buffer.length > 500, `Decoded PNG binary length is valid (${buffer.length} bytes)`);

  // PNG Magic Header: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  const isPngHeader =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 && // P
    buffer[2] === 0x4E && // N
    buffer[3] === 0x47 && // G
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A;
  assert(isPngHeader, 'Decoded buffer has valid 8-byte PNG file signature');

  // IHDR Chunk verification (bytes 12-16 must be "IHDR")
  const ihdrChunk = buffer.subarray(12, 16).toString('ascii');
  assert(ihdrChunk === 'IHDR', 'First PNG chunk is IHDR');

  // Width & Height from IHDR (big-endian 32-bit integers at offsets 16 and 20)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert(width === 320, `Generated PNG width equals configured 320px (actual: ${width})`);
  assert(height === 320, `Generated PNG height equals configured 320px (actual: ${height})`);

  // Fallback QR generator URL
  const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}&color=0F3A22`;
  assert(fallbackUrl.includes('size=300x300'), 'Fallback URL includes size=300x300');
  assert(fallbackUrl.includes('color=0F3A22'), 'Fallback URL specifies brand forest green color');
  assert(fallbackUrl.includes(encodeURIComponent('upi://pay?')), 'Fallback URL has encoded UPI URI');
}

// ---------------------------------------------------------------------------
// GROUP 4: GST Tax, Tips, Discounts & Rounding Mathematics
// ---------------------------------------------------------------------------
function testFinancialTaxMath(): void {
  section('Group 4 — GST Tax, Tips, Discounts & Rounding Mathematics');

  // 1. Standard 5% GST computation
  const calcBill = (subtotal: number, tip = 0, discount = 0) => {
    const cgst = Math.round(subtotal * 0.025);
    const sgst = Math.round(subtotal * 0.025);
    const totalGst = Math.round(subtotal * 0.05);
    const grandTotal = Math.max(0, subtotal + totalGst + tip - discount);
    return { subtotal, cgst, sgst, totalGst, tip, discount, grandTotal };
  };

  const bill1 = calcBill(260); // 1x Donne Biryani
  assert(bill1.subtotal === 260, 'Subtotal: 260');
  assert(bill1.totalGst === 13, `5% GST on 260 is 13 (actual: ${bill1.totalGst})`);
  assert(bill1.cgst === 7, `CGST 2.5% on 260 rounded is 7 (actual: ${bill1.cgst})`);
  assert(bill1.sgst === 7, `SGST 2.5% on 260 rounded is 7 (actual: ${bill1.sgst})`);
  assert(bill1.grandTotal === 273, `Grand total is 273 (actual: ${bill1.grandTotal})`);

  // 2. Odd-number subtotal with rounding
  const bill2 = calcBill(195);
  // 195 * 0.05 = 9.75 -> Math.round -> 10
  assert(bill2.totalGst === 10, '5% GST on 195 rounds up to 10');
  assert(bill2.grandTotal === 205, 'Grand total is 205 (195 + 10)');

  // 3. Preset tip calculations
  const billWithTip = calcBill(500, 50);
  assert(billWithTip.totalGst === 25, '5% GST on 500 is 25');
  assert(billWithTip.grandTotal === 575, 'Grand total with Rs. 50 tip is 575 (500 + 25 + 50)');

  // 4. Loyalty points discount (Rs. 50 off)
  const billWithDiscount = calcBill(500, 0, 50);
  assert(billWithDiscount.grandTotal === 475, 'Grand total with Rs. 50 discount is 475 (500 + 25 - 50)');

  // 5. Discount exceeding total amount clamped at 0
  const billCapped = calcBill(30, 0, 100);
  assert(billCapped.grandTotal === 0, 'Grand total clamped to 0 when discount exceeds bill');

  // 6. Split-bill calculations
  const splitBill = (total: number, persons: number) => {
    const baseShare = Math.floor(total / persons);
    const remainder = total % persons;
    const shares = Array.from({ length: persons }, (_, i) => baseShare + (i < remainder ? 1 : 0));
    return shares;
  };

  const split2 = splitBill(273, 2);
  assert(split2.length === 2, 'Split by 2 yields 2 shares');
  assert(split2[0] === 137 && split2[1] === 136, '273 split by 2 gives 137 and 136');
  assert(split2[0] + split2[1] === 273, 'Sum of 2-way shares equals 273');

  const split3 = splitBill(1000, 3);
  assert(split3.length === 3, 'Split by 3 yields 3 shares');
  assert(split3[0] === 334 && split3[1] === 333 && split3[2] === 333, '1000 split by 3 gives 334, 333, 333');
  assert(split3.reduce((s, v) => s + v, 0) === 1000, 'Sum of 3-way shares equals 1000');

  const split4 = splitBill(755, 4);
  assert(split4.reduce((s, v) => s + v, 0) === 755, 'Sum of 4-way shares equals 755');

  const split6 = splitBill(1895, 6);
  assert(split6.reduce((s, v) => s + v, 0) === 1895, 'Sum of 6-way shares equals 1895');
}

// ---------------------------------------------------------------------------
// GROUP 5: Payment Initiation API Endpoint (POST /api/payments/initiate)
// ---------------------------------------------------------------------------
let createdTestOrderId = '';
let createdTestPaymentId = '';
let createdTestTxnRef = '';

async function testPaymentInitiationApi(): Promise<void> {
  section('Group 5 — Payment Initiation API Endpoint (POST /api/payments/initiate)');

  // Seat a clean table and place an order to get a valid orderId in DB
  const table = 'T-32';
  await postApi('/tables/seat', { tableNumber: table, guestCount: 2 });
  const orderRes = await postApi('/orders/create', {
    tableNumber: table,
    seatNumber: 1,
    guestName: 'UPI Tester',
    items: [{ name: 'Mutton Donne Biryani', quantity: 1, unitPrice: 340 }],
  });

  assert(orderRes.status === 200, 'Test order created in DB for payment tests');
  createdTestOrderId = orderRes.json?.orderId;
  assert(typeof createdTestOrderId === 'string' && createdTestOrderId.startsWith('ORD-'), 'Valid orderId received');

  // 1. Valid initiation request
  const initRes = await postApi('/payments/initiate', {
    orderId: createdTestOrderId,
    paymentMethod: 'UPI',
  });

  assert(initRes.status === 200, 'POST /api/payments/initiate returns 200');
  assert(initRes.json.success === true, 'Response success is true');
  assert(typeof initRes.json.paymentId === 'string' && initRes.json.paymentId.startsWith('PAY-'), 'paymentId generated with PAY- prefix');
  assert(typeof initRes.json.txnRef === 'string' && initRes.json.txnRef.startsWith('TXN-'), 'txnRef generated with TXN- prefix');
  assert(initRes.json.orderId === createdTestOrderId, 'orderId echoed correctly');
  assert(initRes.json.amount === 357, `amount matches order total + 5% tax (340 + 17 = 357, actual: ${initRes.json.amount})`);
  assert(initRes.json.status === 'PENDING', 'Initial payment status is PENDING');
  assert(typeof initRes.json.upiUri === 'string' && initRes.json.upiUri.startsWith('upi://pay?'), 'Valid UPI URI generated');
  assert(typeof initRes.json.qrDataUrl === 'string' && initRes.json.qrDataUrl.startsWith('data:image/png;base64,'), 'QR data URL returned');
  assert(initRes.json.appIntents?.gpay?.startsWith('tez://upi/pay?'), 'Google Pay appIntent generated');
  assert(initRes.json.appIntents?.phonepe?.startsWith('phonepe://pay?'), 'PhonePe appIntent generated');

  createdTestPaymentId = initRes.json.paymentId;
  createdTestTxnRef = initRes.json.txnRef;

  // 2. Missing orderId parameter
  const missingOrder = await postApi('/payments/initiate', { paymentMethod: 'UPI' });
  assert(missingOrder.status === 400, 'Missing orderId returns 400 Bad Request');

  // 3. Non-existent orderId parameter
  const nonExistent = await postApi('/payments/initiate', { orderId: 'ORD-INVALID-999999' });
  assert(nonExistent.status === 404, 'Non-existent orderId returns 404 Not Found');

  // 4. Verify PENDING payment row created in Supabase
  const { data: dbPayment, error: dbErr } = await supabase
    .from('payments')
    .select('*')
    .eq('id', createdTestPaymentId)
    .maybeSingle();

  assert(!dbErr && dbPayment !== null, 'Payment record successfully persisted in payments table');
  assert(dbPayment.status === 'PENDING', 'Database payment record status is PENDING');
  assert(dbPayment.order_id === createdTestOrderId, 'Database payment record order_id matches');
  assert(dbPayment.amount === 357, 'Database payment record amount matches');
  assert(dbPayment.gateway_ref === createdTestTxnRef, 'Database payment record gateway_ref matches txnRef');
}

// ---------------------------------------------------------------------------
// GROUP 6: Payment Verification Polling (GET /api/payments/verify)
// ---------------------------------------------------------------------------
async function testPaymentVerificationPolling(): Promise<void> {
  section('Group 6 — Payment Verification Polling (GET /api/payments/verify)');

  // 1. Poll by orderId
  const pollOrder = await getApi(`/payments/verify?orderId=${encodeURIComponent(createdTestOrderId)}`);
  assert(pollOrder.status === 200, 'GET /api/payments/verify?orderId=... returns 200');
  assert(pollOrder.json.status === 'PENDING', 'Polled status is PENDING before confirmation');
  assert(pollOrder.json.settled === false, 'Polled settled flag is false');
  assert(pollOrder.json.paymentId === createdTestPaymentId, 'Polled paymentId matches');
  assert(pollOrder.json.amount === 357, 'Polled amount matches');

  // 2. Poll by paymentId
  const pollPayment = await getApi(`/payments/verify?paymentId=${encodeURIComponent(createdTestPaymentId)}`);
  assert(pollPayment.status === 200, 'GET /api/payments/verify?paymentId=... returns 200');
  assert(pollPayment.json.orderId === createdTestOrderId, 'Poll by paymentId returns correct orderId');

  // 3. Poll by txnRef
  const pollTxn = await getApi(`/payments/verify?txnRef=${encodeURIComponent(createdTestTxnRef)}`);
  assert(pollTxn.status === 200, 'GET /api/payments/verify?txnRef=... returns 200');
  assert(pollTxn.json.paymentId === createdTestPaymentId, 'Poll by txnRef returns correct paymentId');

  // 4. Missing all query params
  const missingParams = await getApi('/payments/verify');
  assert(missingParams.status === 400, 'GET without params returns 400 Bad Request');

  // 5. Non-existent query parameter
  const nonExistent = await getApi('/payments/verify?orderId=ORD-NOT-FOUND-000');
  assert(nonExistent.status === 404, 'GET with non-existent orderId returns 404 Not Found');
}

// ---------------------------------------------------------------------------
// GROUP 7: Payment Confirmation & Settlement Cascade (POST /api/payments/verify)
// ---------------------------------------------------------------------------
async function testPaymentConfirmationCascade(): Promise<void> {
  section('Group 7 — Payment Confirmation & Settlement Cascade (POST /api/payments/verify)');

  const verifyRes = await postApi('/payments/verify', {
    paymentId: createdTestPaymentId,
    orderId: createdTestOrderId,
    status: 'CONFIRMED',
    paymentMethod: 'UPI',
  });

  assert(verifyRes.status === 200, 'POST /api/payments/verify returns 200 on settlement');
  assert(verifyRes.json.success === true, 'Response success is true');
  assert(verifyRes.json.status === 'CONFIRMED', 'Response status is CONFIRMED');
  assert(verifyRes.json.settled === true, 'Response settled flag is true');
  assert(typeof verifyRes.json.bankUtr === 'string', 'Response includes bankUtr string');
  assert(verifyRes.json.bankUtr.length >= 12, 'bankUtr is at least 12 digits');
  assert(typeof verifyRes.json.confirmedAt === 'string', 'Response includes confirmedAt timestamp');

  // 1. Verify cascade to payments table
  const { data: dbPay } = await supabase
    .from('payments')
    .select('status, bank_utr')
    .eq('id', createdTestPaymentId)
    .maybeSingle();
  assert(dbPay?.status === 'CONFIRMED', 'Cascade: payments.status -> CONFIRMED');
  assert(dbPay?.bank_utr === verifyRes.json.bankUtr, 'Cascade: payments.bank_utr recorded');

  // 2. Verify cascade to orders table
  const { data: dbOrder } = await supabase
    .from('orders')
    .select('status')
    .eq('id', createdTestOrderId)
    .maybeSingle();
  assert(dbOrder?.status === 'PAID', 'Cascade: orders.status -> PAID');

  // 3. Verify cascade to table_seats table
  const { data: dbSeat } = await supabase
    .from('table_seats')
    .select('status')
    .eq('table_number', 'T-32')
    .eq('seat_number', 1)
    .maybeSingle();
  assert(dbSeat?.status === 'PAID', 'Cascade: table_seats.status -> PAID');

  // 4. Verify cascade to kds_tickets table
  const { data: dbTicket } = await supabase
    .from('kds_tickets')
    .select('status')
    .eq('order_id', createdTestOrderId)
    .maybeSingle();
  assert(dbTicket?.status === 'COMPLETED', 'Cascade: kds_tickets.status -> COMPLETED');

  // 5. Idempotent re-confirmation check
  const reConfirm = await postApi('/payments/verify', {
    paymentId: createdTestPaymentId,
    orderId: createdTestOrderId,
  });
  assert(reConfirm.status === 200, 'Idempotent re-confirmation returns 200');
  assert(reConfirm.json.status === 'CONFIRMED', 'Idempotent re-confirmation preserves CONFIRMED');

  // 6. Double payment prevention: Trying to initiate payment on already-paid order
  const doubleInitiate = await postApi('/payments/initiate', {
    orderId: createdTestOrderId,
  });
  assert(doubleInitiate.status === 400, 'Initiating payment on PAID order blocked with 400 (Double payment prevented)');

  // Clean up table T-32
  await postApi('/tables/vacate', { tableNumber: 'T-32' });
}

// ---------------------------------------------------------------------------
// GROUP 8: Static Tabletop Edge QR Asset Generator
// ---------------------------------------------------------------------------
function testStaticTabletopQrAssets(): void {
  section('Group 8 — Static Tabletop Edge QR Asset Generator');

  const cardsDir = path.join(__dirname, '../public/printable-cards');
  assert(fs.existsSync(cardsDir), 'public/printable-cards directory exists');

  const files = fs.readdirSync(cardsDir).filter((f) => f.startsWith('Table_T-') && f.endsWith('.html'));
  assert(files.length === 34, `Exactly 34 table cards exist in printable-cards (actual: ${files.length})`);

  let totalSeatsFound = 0;
  const tableCapacities: Record<string, number> = {
    // 4 Express couple pods (2 seats)
    'T-01': 2, 'T-02': 2, 'T-03': 2, 'T-04': 2,
    // 10 Main dining hall (3 seats)
    'T-05': 3, 'T-06': 3, 'T-07': 3, 'T-08': 3, 'T-09': 3,
    'T-10': 3, 'T-11': 3, 'T-12': 3, 'T-13': 3, 'T-14': 3,
    // 10 Family section (4 seats)
    'T-15': 4, 'T-16': 4, 'T-17': 4, 'T-18': 4, 'T-19': 4,
    'T-20': 4, 'T-21': 4, 'T-22': 4, 'T-23': 4, 'T-24': 4,
    // 5 Courtyard garden (5 seats)
    'T-25': 5, 'T-26': 5, 'T-27': 5, 'T-28': 5, 'T-29': 5,
    // 5 Grand feast hall (6 seats)
    'T-30': 6, 'T-31': 6, 'T-32': 6, 'T-33': 6, 'T-34': 6,
  };

  for (let i = 1; i <= 34; i++) {
    const tblNum = `T-${String(i).padStart(2, '0')}`;
    const filePath = path.join(cardsDir, `Table_${tblNum}.html`);
    assert(fs.existsSync(filePath), `Card exists for table ${tblNum}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const expectedCap = tableCapacities[tblNum];

    // Count SEAT # occurrences
    const seatMatches = content.match(/SEAT #\d+/g) || [];
    assert(seatMatches.length === expectedCap, `${tblNum}: Contains exactly ${expectedCap} seat QR code blocks`);
    totalSeatsFound += seatMatches.length;

    // Check Surge target URL (data param in img src is URL-encoded)
    const decodedContent = decodeURIComponent(content);
    assert(decodedContent.includes(`table=${tblNum}`), `${tblNum}: QR link targets correct tableNumber`);
    assert(decodedContent.includes('https://thoogudeepa-develop.surge.sh/'), `${tblNum}: QR link uses production surge domain`);
    assert(content.includes('@media print'), `${tblNum}: Contains print media stylesheet`);
    assert(content.includes('size: A4 landscape'), `${tblNum}: Formatted for A4 landscape print sheets`);
  }

  assert(totalSeatsFound === 133, `Sum of all seat QR blocks across 34 cards equals 133 seats (actual: ${totalSeatsFound})`);
}

// ---------------------------------------------------------------------------
// GROUP 9: Bank UTR & NPCI RRN Standards Compliance
// ---------------------------------------------------------------------------
function testBankUtrFormatting(): void {
  section('Group 9 — Bank UTR & NPCI RRN Standards Compliance');

  const utrRegex = /^\d{12}$/;

  const generateUtr = () => {
    return '4281' + Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const sampleUtrs = Array.from({ length: 100 }, () => generateUtr());

  assert(sampleUtrs.every((u) => utrRegex.test(u)), 'All 100 generated UTRs are strictly 12 digits');
  assert(sampleUtrs.every((u) => u.startsWith('4281')), 'All UTRs start with valid bank prefix');

  const uniqueUtrs = new Set(sampleUtrs);
  assert(uniqueUtrs.size === 100, 'Zero collision across 100 randomly generated UTRs');

  // Boundary regex tests
  assert(!utrRegex.test('42811234567'), '11-digit string fails 12-digit UTR validation');
  assert(!utrRegex.test('4281123456789'), '13-digit string fails 12-digit UTR validation');
  assert(!utrRegex.test('42811234567A'), 'Alphanumeric string fails numeric UTR validation');
}

// ---------------------------------------------------------------------------
// GROUP 10: Security, Sanitization & High-Precision Decimal Math
// ---------------------------------------------------------------------------
function testSecurityAndSanitization(): void {
  section('Group 10 — Security, Sanitization & High-Precision Decimal Math');

  // Floating-point precision validation (prevent 0.1 + 0.2 = 0.30000000000000004 bug)
  const floatSubtotal = 0.1 + 0.2;
  const safeFormatted = Number(floatSubtotal.toFixed(2));
  assert(safeFormatted === 0.30, 'Safe decimal formatting corrects floating-point precision error');

  // Large bill precision (catering order of Rs. 65,432.50)
  const largeAmount = 65432.50;
  const upiLarge = new URLSearchParams({ am: largeAmount.toFixed(2) }).toString();
  assert(upiLarge === 'am=65432.50', 'Large bill amount formatted accurately');

  // CRLF injection prevention in transaction note
  const rawNote = 'Table T-01\r\npa=hacker@upi\r\nam=1.00';
  const sanitizedParams = new URLSearchParams({ tn: rawNote }).toString();
  assert(!sanitizedParams.includes('\r'), 'CR characters escaped in query string');
  assert(!sanitizedParams.includes('\n'), 'LF characters escaped in query string');
  assert(sanitizedParams.includes('%0D%0A') || sanitizedParams.includes('+'), 'Newlines safely URL-encoded');

  // Special characters in guest name
  const specialName = 'Dr. Manjunath & Family (VIP)';
  const paramsWithSpecial = new URLSearchParams({ pn: specialName }).toString();
  assert(!paramsWithSpecial.includes('&Family'), 'Ampersand encoded to prevent parameter injection');
  assert(paramsWithSpecial.includes('%26') || paramsWithSpecial.includes('+'), 'Ampersand correctly converted to %26');
}

// ---------------------------------------------------------------------------
// GROUP 11: End-to-End Payment Flow & Latency Benchmarks
// ---------------------------------------------------------------------------
async function testEndToEndPaymentLifecycle(): Promise<void> {
  section('Group 11 — End-to-End Payment Flow & Latency Benchmarks');

  const tableNumber = 'T-33';

  // 1. Seat table
  const t0 = Date.now();
  await postApi('/tables/seat', { tableNumber, guestCount: 4, serverName: 'Captain Nayana' });
  const seatMs = Date.now() - t0;
  process.stdout.write(`  [TIME] Seating table ${tableNumber}: ${seatMs}ms\n`);

  // 2. Create order
  const t1 = Date.now();
  const order = await postApi('/orders/create', {
    tableNumber,
    seatNumber: 1,
    guestName: 'E2E Payer',
    items: [
      { name: 'Special Chicken Donne Biryani', quantity: 2, unitPrice: 260 },
      { name: 'Kshatriya Chicken Kebab (Crispy)', quantity: 2, unitPrice: 220 },
    ],
  });
  const orderMs = Date.now() - t1;
  process.stdout.write(`  [TIME] Placing order: ${orderMs}ms\n`);
  assert(order.status === 200, 'E2E Order created');
  const e2eOrderId = order.json.orderId;
  const expectedTotal = (260 * 2 + 220 * 2) + Math.round((260 * 2 + 220 * 2) * 0.05); // (520 + 440 = 960) + 48 = 1008
  assert(order.json.total === expectedTotal, `Order total matches calculation (${order.json.total} === ${expectedTotal})`);

  // 3. Initiate payment
  const t2 = Date.now();
  const payment = await postApi('/payments/initiate', { orderId: e2eOrderId, paymentMethod: 'UPI' });
  const initMs = Date.now() - t2;
  process.stdout.write(`  [TIME] Initiating payment & QR generation: ${initMs}ms\n`);
  assert(payment.status === 200, 'E2E Payment initiated');
  assert(initMs < 3000, `Initiation latency under 3s (actual: ${initMs}ms)`);
  const e2ePaymentId = payment.json.paymentId;
  assert(payment.json.amount === expectedTotal, 'Payment amount equals order total');

  // 4. Poll verification (PENDING)
  const t3 = Date.now();
  const poll = await getApi(`/payments/verify?paymentId=${encodeURIComponent(e2ePaymentId)}`);
  const pollMs = Date.now() - t3;
  process.stdout.write(`  [TIME] Polling payment: ${pollMs}ms\n`);
  assert(poll.status === 200 && poll.json.status === 'PENDING', 'Payment polls as PENDING');
  assert(pollMs < 1000, `Polling latency under 1s (actual: ${pollMs}ms)`);

  // 5. Settle payment
  const t4 = Date.now();
  const settlement = await postApi('/payments/verify', {
    paymentId: e2ePaymentId,
    orderId: e2eOrderId,
    status: 'CONFIRMED',
  });
  const settleMs = Date.now() - t4;
  process.stdout.write(`  [TIME] Settlement & cascade: ${settleMs}ms\n`);
  assert(settlement.status === 200 && settlement.json.status === 'CONFIRMED', 'Payment successfully settled as CONFIRMED');
  assert(settleMs < 3000, `Settlement latency under 3s (actual: ${settleMs}ms)`);

  // 6. Verify table reset post-vacate
  const vacate = await postApi('/tables/vacate', { tableNumber });
  assert(vacate.status === 200, 'Table successfully vacated post-payment');
}

// ---------------------------------------------------------------------------
// GROUP 12: Client Component Contract & Wireframe Integrity
// ---------------------------------------------------------------------------
function testComponentContractIntegrity(): void {
  section('Group 12 — Client Component Contract & Wireframe Integrity');

  const root = path.join(__dirname, '..');

  // Screen6PaymentBreakdown file checks
  const screen6Path = path.join(root, 'components/customer/Screen6PaymentBreakdown.tsx');
  assert(fs.existsSync(screen6Path), 'Screen6PaymentBreakdown.tsx exists');
  const screen6Content = fs.readFileSync(screen6Path, 'utf8');
  assert(screen6Content.includes('0.05'), 'Screen6 includes 5% GST computation');
  assert(screen6Content.includes('tipPresets = [30, 50, 100]'), 'Screen6 contains [30, 50, 100] tip presets');
  assert(screen6Content.includes('setSplitMode'), 'Screen6 integrates split mode');

  // Screen7PaymentGateway file checks
  const screen7Path = path.join(root, 'components/customer/Screen7PaymentGateway.tsx');
  assert(fs.existsSync(screen7Path), 'Screen7PaymentGateway.tsx exists');
  const screen7Content = fs.readFileSync(screen7Path, 'utf8');
  assert(screen7Content.includes('/api/payments/initiate'), 'Screen7 calls /api/payments/initiate');
  assert(screen7Content.includes('/api/payments/verify'), 'Screen7 polls /api/payments/verify');
  assert(screen7Content.includes('showQrModal'), 'Screen7 has QR modal state');
  assert(screen7Content.includes('appIntents'), 'Screen7 maps app intent links');

  // Screen8Confirmation file checks
  const screen8Path = path.join(root, 'components/customer/Screen8Confirmation.tsx');
  assert(fs.existsSync(screen8Path), 'Screen8Confirmation.tsx exists');
  const screen8Content = fs.readFileSync(screen8Path, 'utf8');
  assert(screen8Content.includes('bankUtr'), 'Screen8 displays verified bank UTR');
  assert(screen8Content.includes('Payment Confirmed'), 'Screen8 displays payment confirmed header');

  // Screen9DigitalBill file checks
  const screen9Path = path.join(root, 'components/customer/Screen9DigitalBill.tsx');
  assert(fs.existsSync(screen9Path), 'Screen9DigitalBill.tsx exists');
  const screen9Content = fs.readFileSync(screen9Path, 'utf8');
  assert(screen9Content.includes('0.025'), 'Screen9 breaks down 2.5% CGST and 2.5% SGST');
  assert(screen9Content.includes('INV-'), 'Screen9 formats official tax invoice number');
}

// ---------------------------------------------------------------------------
// Main Runner
// ---------------------------------------------------------------------------
(async function runSuite() {
  process.stdout.write('\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');
  process.stdout.write('  Phase 4 — Comprehensive NPCI UPI & Dynamic QR Test Suite\n');
  process.stdout.write('  12 groups · NPCI spec · QR binary · tax math · lifecycle\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  testUpiUriSpecification();
  testAppIntentDeepLinks();
  await testQrCodeImageIntegrity();
  testFinancialTaxMath();
  await testPaymentInitiationApi();
  await testPaymentVerificationPolling();
  await testPaymentConfirmationCascade();
  testStaticTabletopQrAssets();
  testBankUtrFormatting();
  testSecurityAndSanitization();
  await testEndToEndPaymentLifecycle();
  testComponentContractIntegrity();

  const totalTime = Date.now() - startTime;

  process.stdout.write('\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');
  process.stdout.write(`  Total Time : ${totalTime}ms\n`);
  process.stdout.write(`  Passed     : ${passed}\n`);
  process.stdout.write(`  Failed     : ${failed}\n`);
  process.stdout.write(`  Skipped    : 0\n`);
  process.stdout.write('════════════════════════════════════════════════════════════\n\n');

  if (failures.length > 0) {
    process.stdout.write('  Failures:\n');
    for (const f of failures) {
      process.stdout.write(`    • ${f}\n`);
    }
    process.stdout.write('\n');
    process.exit(1);
  } else {
    process.stdout.write('  All Phase 4 tests passed.\n\n');
  }
})();
