import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'http://localhost:3001';

async function runPhase2Tests() {
  console.log('=====================================================');
  console.log('   PHASE 2: AUTONOMOUS RECOVERY & MULTI-DEVICE SUITE  ');
  console.log('=====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  const testTable = 'T-29';
  const testOrderId = `ORD-TEST-REC-${Date.now()}`;
  const deviceTokenA = 'DEV-PHONE-CHROME-001';
  const deviceTokenB = 'DEV-PHONE-SAFARI-002';

  // Setup: Table 29 Chair 1 occupied by deviceTokenA with an active order
  await db.from('orders').insert({
    id: testOrderId,
    table_number: testTable,
    seat_number: 1,
    guest_name: 'Guest 1',
    subtotal: 260,
    tax: 13,
    total_amount: 273,
    status: 'UNPAID',
    device_token: deviceTokenA,
  });

  await db.from('table_seats').update({
    status: 'OCCUPIED',
    active_order_id: testOrderId,
    device_token: deviceTokenA,
  }).eq('table_number', testTable).eq('seat_number', 1);

  // Chair 2 & 3 are VACANT
  await db.from('table_seats').update({
    status: 'VACANT',
    active_order_id: null,
    device_token: null,
  }).eq('table_number', testTable).in('seat_number', [2, 3, 4]);

  // ── TEST 1: Same Device Verification (Seamless Auto-Load) ───────────────
  try {
    const res = await fetch(`${BASE_URL}/api/session/verify?table=${testTable}&seat=1&deviceToken=${deviceTokenA}`);
    const data = await res.json();

    assert(res.ok && data.active === true, '1. Primary device token verifies active dining session');
    assert(data.isOccupiedByOtherDevice === false, '2. Primary device does not trigger other-device conflict');
    assert(data.order && data.order.id === testOrderId, '3. Active unpaid order payload returned seamlessly');
  } catch (err: any) {
    console.error('Test 1 failed:', err);
    assert(false, 'Primary device verification succeeded');
  }

  // ── TEST 2: Second Device Same Chair (Conflict Detection) ────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/session/verify?table=${testTable}&seat=1&deviceToken=${deviceTokenB}`);
    const data = await res.json();

    assert(res.ok && data.isOccupiedByOtherDevice === true, '4. Different device token on occupied chair triggers conflict flag');
    assert(Array.isArray(data.vacantSeats) && data.vacantSeats.includes(2), '5. Returns list of available open chairs at the table');
    assert(data.order === null, '6. Order data shielded from unauthorized device to prevent cross-leakage');
  } catch (err: any) {
    console.error('Test 2 failed:', err);
    assert(false, 'Conflict detection succeeded');
  }

  // ── TEST 3: 1-Tap Session Resume / Claim by Returning Guest ─────────────
  try {
    const res = await fetch(`${BASE_URL}/api/session/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableNumber: testTable,
        seatNumber: 1,
        deviceToken: deviceTokenB,
        claim: true,
      }),
    });
    const data = await res.json();

    assert(res.ok && data.active === true, '7. 1-Tap claim successfully adopts active dining session');
    assert(data.isOccupiedByOtherDevice === false, '8. Conflict cleared upon session claim');
    assert(data.order && data.order.id === testOrderId, '9. Active unpaid bill delivered to returning device without PIN/OTP');

    // Verify DB update
    const { data: seatRow } = await db.from('table_seats').select('device_token').eq('table_number', testTable).eq('seat_number', 1).single();
    assert(seatRow?.device_token === deviceTokenB, '10. Database seat device token updated to new claimed device');
  } catch (err: any) {
    console.error('Test 3 failed:', err);
    assert(false, 'Session claim succeeded');
  }

  // ── TEST 4: Multi-Seat Cart Isolation (Seat 2 vs Seat 1) ────────────────
  try {
    const res = await fetch(`${BASE_URL}/api/session/verify?table=${testTable}&seat=2&deviceToken=${deviceTokenA}`);
    const data = await res.json();

    assert(res.ok && data.active === false, '11. Vacant adjacent chair reports active: false for fresh browsing');
    assert(data.isOccupiedByOtherDevice === false, '12. Vacant adjacent chair allows clean independent ordering');
  } catch (err: any) {
    console.error('Test 4 failed:', err);
    assert(false, 'Seat 2 isolation succeeded');
  }

  // Cleanup
  await db.from('orders').delete().eq('id', testOrderId);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).eq('table_number', testTable);

  console.log(`\n=====================================================`);
  console.log(`     RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`=====================================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase2Tests().catch((e) => {
  console.error('Phase 2 fatal error:', e);
  process.exit(1);
});
