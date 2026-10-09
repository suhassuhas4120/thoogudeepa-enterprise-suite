import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'http://localhost:3001';

async function runPhase3Tests() {
  console.log('=====================================================');
  console.log('  PHASE 3: HIGH-CONCURRENCY & IDEMPOTENCY TEST SUITE ');
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

  const testTable = 'T-28';

  // Setup: Reset test table
  await db.from('tables').update({ status: 'VACANT', current_bill: 0 }).eq('number', testTable);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).eq('table_number', testTable);

  // ── TEST 1: Rapid Double-Tap Idempotency Test ──────────────────────────
  try {
    const itemPayload = [
      { name: 'Chicken Dum Biryani', price: 260, quantity: 1, unitPrice: 260 },
      { name: 'Mutton Chops', price: 340, quantity: 1, unitPrice: 340 },
    ];

    const postOrder = () =>
      fetch(`${BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: testTable,
          seatNumber: 1,
          guestName: 'Idempotency Tester',
          items: itemPayload,
          source: 'CUSTOMER',
          deviceToken: 'DEV-IDEMPOTENT-001',
        }),
      }).then((r) => r.json());

    // Fire 2 simultaneous requests within milliseconds (simulating double-tap)
    const [res1, res2] = await Promise.all([postOrder(), postOrder()]);

    assert(res1.success === true && res2.success === true, '1. Both requests in rapid double-tap return success');
    assert(res1.orderId === res2.orderId, '2. Both requests resolve to the exact SAME orderId');
    assert(res1.idempotent === true || res2.idempotent === true, '3. Idempotent deduplication flag returned on concurrent submission');

    // Verify DB count: only 1 order created in Supabase
    const { data: dbOrders } = await db
      .from('orders')
      .select('id')
      .eq('table_number', testTable)
      .eq('seat_number', 1)
      .eq('status', 'UNPAID');

    assert(dbOrders?.length === 1, '4. Exactly ONE order created in database despite rapid double-tap');

    const { data: dbTickets } = await db
      .from('kds_tickets')
      .select('id')
      .eq('table_number', testTable)
      .eq('seat_number', 1)
      .eq('status', 'NEW');

    assert(dbTickets?.length === 1, '5. Exactly ONE KOT ticket dispatched to kitchen, preventing duplicate cooking');
  } catch (err: any) {
    console.error('Test 1 failed:', err);
    assert(false, 'Double-tap idempotency test succeeded');
  }

  // ── TEST 2: Pessimistic Table Settlement Lock ───────────────────────────
  try {
    // Chair 1 initiates settlement
    const initiateRes1 = await fetch(`${BASE_URL}/api/settlement/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'INITIATE',
        session: {
          tableNumber: testTable,
          seatNumber: 1,
          seatLabel: 'Chair 1',
          totalAmount: 600,
          initiatedAt: Date.now(),
        },
      }),
    });
    const initData1 = await initiateRes1.json();
    assert(initiateRes1.ok && initData1.success === true, '6. Chair 1 successfully acquires settlement lock for table');

    // Chair 2 attempts to initiate settlement simultaneously
    const initiateRes2 = await fetch(`${BASE_URL}/api/settlement/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'INITIATE',
        session: {
          tableNumber: testTable,
          seatNumber: 2,
          seatLabel: 'Chair 2',
          totalAmount: 300,
          initiatedAt: Date.now(),
        },
      }),
    });
    const initData2 = await initiateRes2.json();

    assert(initiateRes2.status === 409, '7. Chair 2 settlement attempt rejected with HTTP 409 Conflict');
    assert(initData2.error === 'TABLE_SETTLEMENT_LOCKED', '8. Rejection reason identified as TABLE_SETTLEMENT_LOCKED');

    // Release lock
    await fetch(`${BASE_URL}/api/settlement/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CLEAR',
        tableNumber: testTable,
        seatNumber: 1,
      }),
    });

    // Now Chair 2 can settle cleanly
    const retryRes = await fetch(`${BASE_URL}/api/settlement/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'INITIATE',
        session: {
          tableNumber: testTable,
          seatNumber: 2,
          seatLabel: 'Chair 2',
          totalAmount: 300,
          initiatedAt: Date.now(),
        },
      }),
    });
    const retryData = await retryRes.json();
    assert(retryRes.ok && retryData.success === true, '9. Settlement lock released cleanly allowing subsequent seat payment');
  } catch (err: any) {
    console.error('Test 2 failed:', err);
    assert(false, 'Settlement lock test succeeded');
  }

  // ── TEST 3: High Concurrency Multi-Device Stress Test ───────────────────
  try {
    const burstCount = 20;
    console.log(`\nSimulating ${burstCount} concurrent device order queries...`);
    const startTime = Date.now();

    const promises = [];
    for (let i = 1; i <= burstCount; i++) {
      const seat = (i % 4) + 1;
      promises.push(
        fetch(`${BASE_URL}/api/session/verify?table=${testTable}&seat=${seat}&deviceToken=DEV-STRESS-${i}`)
          .then((r) => r.json())
      );
    }

    const results = await Promise.all(promises);
    const elapsed = Date.now() - startTime;

    const allSuccessful = results.every((r) => r && typeof r.active === 'boolean');
    assert(allSuccessful, `10. All ${burstCount} concurrent device requests handled successfully`);
    assert(elapsed < 2000, `11. 20 concurrent requests completed in ${elapsed}ms (sub-2s target met)`);
  } catch (err: any) {
    console.error('Test 3 failed:', err);
    assert(false, 'Concurrency stress test succeeded');
  }

  // Cleanup
  await db.from('kds_tickets').delete().eq('table_number', testTable);
  await db.from('order_items').delete().eq('table_number', testTable);
  await db.from('orders').delete().eq('table_number', testTable);
  await db.from('table_seats').update({ status: 'VACANT', active_order_id: null, device_token: null }).eq('table_number', testTable);
  await db.from('tables').update({ status: 'VACANT', current_bill: 0 }).eq('number', testTable);

  console.log(`\n=====================================================`);
  console.log(`     RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  console.log(`=====================================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase3Tests().catch((e) => {
  console.error('Phase 3 fatal error:', e);
  process.exit(1);
});
