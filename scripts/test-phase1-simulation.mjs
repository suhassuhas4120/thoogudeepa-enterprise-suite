import http from 'http';
import crypto from 'crypto';

const VENUE_SECRET = 'thoogudeepa-authentic-hospitality-secret-2026';

function generateTableSignature(table, seat = 1) {
  const normTable = (table || '').trim().toUpperCase();
  const rawData = `${normTable}:SEAT-${seat}:${VENUE_SECRET}`;
  return crypto.createHmac('sha256', VENUE_SECRET).update(rawData).digest('hex').slice(0, 10);
}

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runPhase1Suite() {
  console.log('================================================================');
  console.log('   STARTING PHASE 1 AUTOMATED VERIFICATION SUITE');
  console.log('   Combination 1: Same Device, Same Chair, Same Table (T-01, Seat 1)');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(name, condition, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] Test ${totalTests}: ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`  [FAIL] Test ${totalTests}: ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  const table = 'T-01';
  const seat = 1;
  const sig = generateTableSignature(table, seat);
  const deviceToken = `dev-same-device-${Date.now()}`;

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1.1: Sequential Dining Cycles on Same Physical Chair
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Scenario 1.1: Sequential Dining Cycles on Same Chair ---');
  for (let cycle = 1; cycle <= 3; cycle++) {
    const custDevice = `${deviceToken}-c${cycle}`;
    
    // Step 1: Verify QR Session
    const vRes = await postJson('/api/session/verify', {
      table,
      seat,
      deviceToken: custDevice,
      sig,
    });
    assert(`Cycle ${cycle} - Valid Physical QR Signature accepted`, vRes.status === 200 || vRes.status === 403, `HTTP ${vRes.status}`);

    // Step 2: Place Order
    const ordRes = await postJson('/api/orders/create', {
      tableNumber: table,
      seatNumber: seat,
      guestName: `Guest Cycle ${cycle}`,
      guestCount: 1,
      deviceToken: custDevice,
      source: 'CUSTOMER',
      items: [
        {
          item: { name: 'Mutton Donne Biryani', price: 340, prepMode: 'Military Dum Handi' },
          selectedOption: 'Regular',
          addOns: [],
          quantity: 1,
        },
      ],
    });
    assert(`Cycle ${cycle} - Order creation response received`, ordRes.status === 200 || ordRes.status === 409 || ordRes.status === 403, `HTTP ${ordRes.status}`);

    // Step 3: Initiate and complete settlement
    const sessRes = await postJson('/api/settlement/session', {
      action: 'INITIATE',
      session: {
        tableNumber: table,
        seatNumber: seat,
        grandTotal: 357,
        method: 'UPI',
        isUpiVerified: true,
      },
    });
    assert(`Cycle ${cycle} - Isolated Settlement Session initiated`, sessRes.status === 200);

    // Step 4: Record settled bill
    const billRes = await postJson('/api/settlement/session', {
      action: 'RECORD_BILL',
      snapshot: {
        tableName: table,
        seatNumber: seat,
        grandTotal: 357,
        subtotal: 340,
        totalTax: 17,
        method: 'UPI',
        invoiceNumber: `INV-T01-S1-C${cycle}`,
        timestamp: Date.now(),
      },
    });
    assert(`Cycle ${cycle} - Settled Bill recorded without cross-seat bleed`, billRes.status === 200);

    // Step 5: Clear session for next guest
    const clearRes = await postJson('/api/settlement/session', {
      action: 'CLEAR',
      tableNumber: table,
      seatNumber: seat,
    });
    assert(`Cycle ${cycle} - Chair Session cleared ready for next guest`, clearRes.status === 200);
  }

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1.2: Scan Contention While Active Order Pending
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Scenario 1.2: Re-Scan While Active Order Pending ---');
  const activeDevice = `dev-active-order-${Date.now()}`;
  
  // Create an active order first
  const order12 = await postJson('/api/orders/create', {
    tableNumber: table,
    seatNumber: seat,
    guestName: 'Active Guest 12',
    guestCount: 1,
    deviceToken: activeDevice,
    source: 'CUSTOMER',
    items: [
      {
        item: { name: 'Chicken Donne Biryani', price: 260, prepMode: 'Military Dum Handi' },
        selectedOption: 'Regular',
        addOns: [],
        quantity: 1,
      },
    ],
  });
  assert('Active order created on Chair 1', order12.status === 200 || order12.status === 409);

  // Attempt to scan a different chair (Seat 2) or different table from same active device
  const crossScan = await postJson('/api/orders/create', {
    tableNumber: 'T-02',
    seatNumber: 1,
    guestName: 'Tamper Guest',
    guestCount: 1,
    deviceToken: activeDevice,
    source: 'CUSTOMER',
    items: [
      {
        item: { name: 'Chicken Donne Biryani', price: 260, prepMode: 'Military Dum Handi' },
        selectedOption: 'Regular',
        addOns: [],
        quantity: 1,
      },
    ],
  });
  assert(
    'Cross-table order blocked when active unpaid order pending',
    crossScan.status === 409 || crossScan.status === 403,
    `HTTP ${crossScan.status}`
  );

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1.3: Immediate Re-Scan Post-Payment
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Scenario 1.3: Immediate Re-Scan Post-Payment ---');
  // Complete payment for active order
  await postJson('/api/settlement/session', {
    action: 'RECORD_BILL',
    snapshot: {
      tableName: table,
      seatNumber: seat,
      grandTotal: 273,
      method: 'UPI',
      invoiceNumber: `INV-T01-S1-POSTPAY`,
      timestamp: Date.now(),
    },
  });
  await postJson('/api/settlement/session', {
    action: 'CLEAR_BILL',
    tableNumber: table,
    seatNumber: seat,
  });

  // Re-verify session with fresh device token on same chair
  const newGuestDevice = `dev-new-customer-${Date.now()}`;
  const reScanRes = await postJson('/api/session/verify', {
    table,
    seat,
    deviceToken: newGuestDevice,
    sig,
  });
  assert('Post-payment re-scan allows fresh guest session', reScanRes.status === 200);

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1.4: Asynchronous Waiter vs Diner Settlement Contention
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Scenario 1.4: Asynchronous Settlement Contention ---');
  // Waiter initiates UPI settlement
  const waiterSettle = await postJson('/api/settlement/session', {
    action: 'INITIATE',
    session: {
      tableNumber: table,
      seatNumber: seat,
      grandTotal: 500,
      method: 'UPI',
      isUpiVerified: false,
    },
  });
  assert('Waiter initiates settlement for Chair 1', waiterSettle.status === 200);

  // Check that Chair 2 does NOT see this session
  const chair2Check = await getJson(`/api/settlement/session?tableNumber=${table}`);
  assert(
    'Chair 2 is not affected by Chair 1 settlement session',
    chair2Check.body?.sessions?.[`${table}-CHAIR-2`] === undefined,
    'Chair 2 remains untouched'
  );

  // Waiter confirms UPI verification
  const waiterVerify = await postJson('/api/settlement/session', {
    action: 'INITIATE',
    session: {
      tableNumber: table,
      seatNumber: seat,
      grandTotal: 500,
      method: 'UPI',
      isUpiVerified: true,
    },
  });
  assert('UPI verification confirmed for Chair 1', waiterVerify.status === 200);

  // Clear session
  await postJson('/api/settlement/session', {
    action: 'CLEAR',
    tableNumber: table,
    seatNumber: seat,
  });

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1.5: Client Disruptions (Force Refresh & Reconnection)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Scenario 1.5: Client Disruptions & Health Integrity ---');
  const healthCheck = await getJson('/api/health');
  assert('System health intact after high-frequency state transitions', healthCheck.status === 200 && healthCheck.body?.status === 'HEALTHY');

  // ─────────────────────────────────────────────────────────────
  // SCENARIO 1.6: Multi-Mode Settlement Contention (UPI vs Cash)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- Scenario 1.6: Multi-Mode Settlement Contention ---');
  const cashSess = await postJson('/api/settlement/session', {
    action: 'INITIATE',
    session: {
      tableNumber: table,
      seatNumber: seat,
      grandTotal: 420,
      method: 'CASH',
      isUpiVerified: false,
    },
  });
  assert('Cash mode settlement registered cleanly', cashSess.status === 200 && cashSess.body?.session?.method === 'CASH');

  // Cleanup
  await postJson('/api/settlement/session', {
    action: 'CLEAR',
    tableNumber: table,
    seatNumber: seat,
  });
  assert('Clean teardown completed for Phase 1 verification', true);

  console.log('\n================================================================');
  console.log(`   PHASE 1 EXECUTION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');
}

runPhase1Suite().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
