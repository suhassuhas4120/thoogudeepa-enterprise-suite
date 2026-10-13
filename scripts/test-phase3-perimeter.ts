import { generateTableSignature, verifyTableSignature } from '../lib/qrSignature';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, description: string) {
  if (condition) {
    passed++;
    console.log(`✓ [PASS] ${description}`);
  } else {
    failed++;
    failures.push(description);
    console.error(`✗ [FAIL] ${description}`);
  }
}

async function runTest() {
  console.log('=====================================================');
  console.log(' PHASE 3: CRYPTOGRAPHIC PERIMETER & ANTI-TAMPERING  ');
  console.log('=====================================================');

  // 1. Test HMAC-SHA256 Signature Determinism
  const validSig1 = generateTableSignature('T-12', 2);
  const validSig2 = generateTableSignature('T-12', 2);
  assert(typeof validSig1 === 'string' && validSig1.length === 10, 'Signature generated as 10-character cryptographic token');
  assert(validSig1 === validSig2, 'Signature generation is deterministic and reproducible');

  // 2. Test Verification Utility
  const matchResult = verifyTableSignature('T-12', 2, validSig1);
  assert(matchResult === true, 'Matching table, seat, and signature successfully validates');

  const seatTamperResult = verifyTableSignature('T-12', 3, validSig1);
  assert(seatTamperResult === false, 'Seat alteration (Chair 2 -> Chair 3) fails signature verification');

  const tableTamperResult = verifyTableSignature('T-14', 2, validSig1);
  assert(tableTamperResult === false, 'Table alteration (Table 12 -> Table 14) fails signature verification');

  // 3. Test API Table Whitelist Boundary (/api/session/verify)
  const invalidTableRes = await fetch(`${BASE_URL}/api/session/verify?table=T-99&seat=1`);
  const invalidTableData = await invalidTableRes.json();
  assert(invalidTableRes.status === 400, 'Non-existent Table 99 query returns HTTP 400 Bad Request');
  assert(invalidTableData.error === 'INVALID_TABLE', 'Server identifies error as INVALID_TABLE');

  const arbitraryTableRes = await fetch(`${BASE_URL}/api/session/verify?table=FAKE_HACK&seat=1`);
  assert(arbitraryTableRes.status === 400, 'Arbitrary string table parameter rejected with HTTP 400');

  // 4. Test Invalid Seat Boundary
  const invalidSeatRes = await fetch(`${BASE_URL}/api/session/verify?table=T-02&seat=99`);
  const invalidSeatData = await invalidSeatRes.json();
  assert(invalidSeatRes.status === 400, 'Out-of-range Seat 99 query returns HTTP 400 Bad Request');
  assert(invalidSeatData.error === 'INVALID_SEAT', 'Server identifies error as INVALID_SEAT');

  // 5. Test Unsigned Manual URL Tampering Rejection
  const unsignedRes = await fetch(`${BASE_URL}/api/session/verify?table=T-02&seat=1&deviceToken=unauthenticated-test-user`);
  const unsignedData = await unsignedRes.json();
  assert(unsignedRes.status === 403, 'Unsigned manual URL query rejected with HTTP 403 Forbidden');
  assert(unsignedData.isTampered === true, 'Response identifies unsigned manual entry as tampered');
  assert(unsignedData.error === 'SIGNATURE_REQUIRED', 'Error code specifies SIGNATURE_REQUIRED');

  // 6. Test Forged Signature Parameter Rejection
  const tamperedApiRes = await fetch(`${BASE_URL}/api/session/verify?table=T-05&seat=2&sig=malicious99`);
  const tamperedApiData = await tamperedApiRes.json();
  assert(tamperedApiRes.status === 403, 'Tampered signature parameter rejected with HTTP 403 Forbidden');
  assert(tamperedApiData.isTampered === true, 'Response identifies forged signature as tampered');
  assert(tamperedApiData.error === 'INVALID_SIGNATURE', 'Error code specifies INVALID_SIGNATURE');

  // 7. Test Authentic QR Signature Handshake
  const authenticSig = generateTableSignature('T-05', 2);
  const authenticApiRes = await fetch(`${BASE_URL}/api/session/verify?table=T-05&seat=2&sig=${authenticSig}`);
  assert(authenticApiRes.status === 200, 'Authentic QR signature accepted with HTTP 200 OK');

  // 8. Test Global QR Signatures Directory Endpoint
  const sigsRes = await fetch(`${BASE_URL}/api/qr/signatures`);
  const sigsData = await sigsRes.json();
  assert(sigsRes.status === 200, 'QR signatures endpoint returns HTTP 200 OK');
  assert(sigsData.success === true && sigsData.count === 34, 'Signatures endpoint provisions all 34 tables');
  assert(Boolean(sigsData.signatures?.['T-02']?.[1]), 'Table T-02 Chair 1 signature provisioned correctly');

  console.log('\n=====================================================');
  console.log(` RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    console.error('Test failures:', failures);
    process.exit(1);
  }
}

runTest().then(() => process.exit(0)).catch(err => {
  console.error('Test fatal error:', err);
  process.exit(1);
});
