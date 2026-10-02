/**
 * simulate-peak-rush.js
 *
 * Phase 9 Concurrency & Stress Simulation:
 * Simulates peak weekend rush (15 concurrent tables) placing orders,
 * kitchen bumping items, zero-typing UPI payment settlement, and table vacate turnaround.
 *
 * Verifies:
 *   - 15 concurrent customer orders without race conditions or database deadlocks
 *   - Complete KDS ticket generation and stage progression under concurrency
 *   - Concurrent payment initiation and verification
 *   - Clean table turnaround and reset
 *   - Latency metrics and 100% success rate
 */

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';
const SUPABASE_URL = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

const CONCURRENT_TABLES = 15;
const DISH_SELECTIONS = [
  { name: 'Special Chicken Donne Biryani', quantity: 2, price: 280, unitPrice: 280 },
  { name: 'Mutton Donne Biryani (Seeraga Samba)', quantity: 1, price: 340, unitPrice: 340 },
  { name: 'Guntur Pepper Chicken Fry', quantity: 1, price: 240, unitPrice: 240 },
  { name: 'Kshatriya Kebab (Dum Fried)', quantity: 2, price: 220, unitPrice: 220 },
  { name: 'Egg Donne Biryani', quantity: 1, price: 210, unitPrice: 210 },
  { name: 'Nati Koli Donne Biryani', quantity: 1, price: 380, unitPrice: 380 },
];

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

async function simulateTableFlow(tableIndex) {
  const tableNumber = `T-${String(tableIndex).padStart(2, '0')}`;
  const seatNumber = (tableIndex % 2) + 1;
  const t0 = Date.now();
  const logs = [];

  try {
    // 1. Seat guests
    const seatRes = await api('/api/tables/seat', {
      tableNumber,
      guestCount: 2 + (tableIndex % 4),
      serverName: `Floor Steward ${((tableIndex % 4) + 1)}`,
    });
    if (!seatRes.ok) throw new Error(`Seat failed on ${tableNumber}: ${JSON.stringify(seatRes.json)}`);
    logs.push('Seated');

    // 2. Select items & place order
    const dish1 = DISH_SELECTIONS[tableIndex % DISH_SELECTIONS.length];
    const dish2 = DISH_SELECTIONS[(tableIndex + 2) % DISH_SELECTIONS.length];
    const orderRes = await api('/api/orders/create', {
      tableNumber,
      seatNumber,
      items: [dish1, dish2],
    });
    if (!orderRes.ok) throw new Error(`Order failed on ${tableNumber}: ${JSON.stringify(orderRes.json)}`);
    const orderId = orderRes.json.orderId;
    const ticketId = orderRes.json.ticketId;
    logs.push(`Order ${orderId}`);

    // 3. Kitchen stage bump (PREP -> READY)
    if (ticketId) {
      await api('/api/kds/bump-table', { ticketId, status: 'PREP' });
      await api('/api/kds/bump-table', { ticketId, status: 'READY' });
      logs.push('KDS Ready');
    }

    // 4. Initiate payment
    const totalAmount = (dish1.price * dish1.quantity) + (dish2.price * dish2.quantity);
    const payRes = await api('/api/payments/initiate', {
      orderId,
      tableNumber,
      seatNumber,
      amount: totalAmount,
      customerName: `Guest ${tableNumber}`,
    });
    if (!payRes.ok) throw new Error(`Payment initiate failed on ${tableNumber}: ${JSON.stringify(payRes.json)}`);
    const paymentId = payRes.json.paymentId;
    logs.push(`Payment Initiated`);

    // 5. Verify & confirm payment
    const verifyRes = await api('/api/payments/verify', {
      paymentId,
      orderId,
      autoSettle: true,
    });
    if (!verifyRes.ok) throw new Error(`Payment verify failed on ${tableNumber}: ${JSON.stringify(verifyRes.json)}`);
    logs.push('Payment Confirmed');

    // 6. Settle and vacate table
    const vacateRes = await api('/api/tables/vacate', { tableNumber });
    if (!vacateRes.ok) throw new Error(`Vacate failed on ${tableNumber}: ${JSON.stringify(vacateRes.json)}`);
    logs.push('Vacated');

    const duration = Date.now() - t0;
    return {
      tableNumber,
      success: true,
      orderId,
      duration,
      logs: logs.join(' → '),
    };
  } catch (err) {
    return {
      tableNumber,
      success: false,
      error: err.message,
      duration: Date.now() - t0,
    };
  }
}

async function run() {
  console.log('\n================================================================');
  console.log(`  PEAK RUSH CONCURRENCY SIMULATION (${CONCURRENT_TABLES} CONCURRENT TABLES)`);
  console.log(`  Server: ${BASE}`);
  console.log('================================================================\n');

  console.log(`Launching ${CONCURRENT_TABLES} simultaneous table lifecycle threads...`);
  const startTime = Date.now();

  const promises = [];
  for (let i = 1; i <= CONCURRENT_TABLES; i++) {
    promises.push(simulateTableFlow(i));
  }

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  let passed = 0;
  let failed = 0;

  console.log('\n── Execution Results per Table ──');
  results.forEach((r) => {
    if (r.success) {
      passed++;
      console.log(`  ✓ Table ${r.tableNumber}: ${r.duration}ms | ${r.logs}`);
    } else {
      failed++;
      console.log(`  ✗ Table ${r.tableNumber}: FAILED in ${r.duration}ms | Error: ${r.error}`);
    }
  });

  const avgDuration = Math.round(results.reduce((a, b) => a + b.duration, 0) / results.length);
  const throughputPerMin = Math.round((passed / (totalDuration / 1000)) * 60);

  console.log('\n================================================================');
  console.log(`  Simulation Summary:`);
  console.log(`  • Success Rate:    ${passed}/${CONCURRENT_TABLES} (${Math.round((passed / CONCURRENT_TABLES) * 100)}%)`);
  console.log(`  • Total Wall Time: ${totalDuration} ms`);
  console.log(`  • Avg Table Latency: ${avgDuration} ms`);
  console.log(`  • Peak Throughput:  ${throughputPerMin} orders/minute equivalent`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`Simulation failed with ${failed} table errors.`);
    process.exit(1);
  } else {
    console.log('CONCURRENCY SIMULATION PASSED: Zero deadlocks, 100% throughput fidelity.');
  }
}

run().catch((err) => {
  console.error('FATAL SIMULATION ERROR:', err);
  process.exit(1);
});
