const { createClient } = require('@supabase/supabase-js');

const url = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const key = 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const supabase = createClient(url, key);

const BASE_URL = 'http://localhost:3005';

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    totalFailed++;
  }
}

async function runPhase2Tests() {
  console.log('----------------------------------------------------');
  console.log('Phase 2 Verification: Core Next.js API Routes Engine');
  console.log('----------------------------------------------------');

  let testOrderId = null;
  let testTicketId = null;
  let firstItemId = null;
  let testPingId = null;

  // Pre-test cleanup: ensure T-15 is clean and vacant before test execution
  await fetch(`${BASE_URL}/api/tables/vacate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: 'T-15' }),
  });

  // Test 1: Session Verification (Initially Vacant Seat)
  const res1 = await fetch(`${BASE_URL}/api/session/verify?table=T-15&seat=1`);
  const data1 = await res1.json();
  assert(res1.status === 200, 'GET /api/session/verify returns 200');
  assert(data1.active === false, 'Seat T-15 S1 initially reports active = false');

  // Test 2: Order Creation (Customer Places Order)
  const orderPayload = {
    tableNumber: 'T-15',
    seatNumber: 1,
    guestName: 'Arun Kumar',
    guestCount: 2,
    deviceToken: 'DEV-TEST-TOKEN-001',
    items: [
      {
        name: 'Special Chicken Donne Biryani',
        quantity: 2,
        price: 260,
        unitPrice: 260,
        prepMode: 'Military Dum Handi',
        options: 'Medium Spicy',
        addOns: ['Extra Boiled Egg'],
      },
      {
        name: 'Kshatriya Chicken Kebab (Crispy)',
        quantity: 1,
        price: 220,
        unitPrice: 220,
        prepMode: 'Kadhai Deep Fry',
      },
    ],
  };

  const res2 = await fetch(`${BASE_URL}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  const data2 = await res2.json();

  assert(res2.status === 200, 'POST /api/orders/create returns 200');
  assert(data2.success === true, 'Order created successfully');
  assert(Boolean(data2.orderId && data2.ticketId), `Generated Order ID: ${data2.orderId}, Ticket ID: ${data2.ticketId}`);
  assert(data2.subtotal === 740, `Subtotal calculated correctly: 740 (Got: ${data2.subtotal})`);
  assert(data2.tax === 37, `Tax (5%) calculated correctly: 37 (Got: ${data2.tax})`);
  assert(data2.total === 777, `Total calculated correctly: 777 (Got: ${data2.total})`);

  testOrderId = data2.orderId;
  testTicketId = data2.ticketId;

  // Verify Database State for Order Creation
  const { data: dbOrder } = await supabase.from('orders').select('*').eq('id', testOrderId).single();
  assert(dbOrder && dbOrder.status === 'UNPAID', 'Order persisted in Supabase with status UNPAID');

  const { data: dbItems } = await supabase.from('order_items').select('*').eq('order_id', testOrderId);
  assert(dbItems && dbItems.length === 2, `2 line items inserted in order_items (Found: ${dbItems ? dbItems.length : 0})`);
  if (dbItems && dbItems.length > 0) {
    firstItemId = dbItems[0].id;
  }

  const { data: dbTicket } = await supabase.from('kds_tickets').select('*').eq('id', testTicketId).single();
  assert(dbTicket && dbTicket.order_id === testOrderId, 'KDS ticket links order_id foreign key');

  const { data: dbTable } = await supabase.from('tables').select('*').eq('number', 'T-15').single();
  assert(dbTable && dbTable.status === 'OCCUPIED' && Number(dbTable.current_bill) >= 777, 'Table T-15 status transitioned to OCCUPIED with running bill');

  // Test 3: Session Recovery Check (80% Exit Recovery)
  const res3 = await fetch(`${BASE_URL}/api/session/verify?table=T-15&seat=1`);
  const data3 = await res3.json();
  assert(data3.active === true, 'GET /api/session/verify recovers active session on reload');
  assert(data3.order && data3.order.id === testOrderId, 'Session recovery returns correct active order');
  assert(data3.order && data3.order.items.length === 2, 'Session recovery returns persisted dish items');

  // Test 4: Incremental Ordering (Add Items without clearing bill)
  const addItemsPayload = {
    orderId: testOrderId,
    items: [
      {
        name: 'Mutton Nalli Roast (Bone Marrow)',
        quantity: 1,
        price: 380,
        unitPrice: 380,
        prepMode: 'Tawa Bhuna',
      },
    ],
  };

  const res4 = await fetch(`${BASE_URL}/api/orders/add-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addItemsPayload),
  });
  const data4 = await res4.json();

  assert(res4.status === 200, 'POST /api/orders/add-items returns 200');
  assert(data4.success === true, 'Item added incrementally to existing order');
  assert(data4.newTotal === 777 + 380 + Math.round(380 * 0.05), `Running bill updated to ${data4.newTotal}`);

  const { data: updatedItems } = await supabase.from('order_items').select('*').eq('order_id', testOrderId);
  assert(updatedItems && updatedItems.length === 3, 'order_items count increased to 3 items');

  // Test 5: Kitchen Item Stage Stepper (PLACED -> PREP -> PLATED)
  if (firstItemId) {
    const res5 = await fetch(`${BASE_URL}/api/kds/bump-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: firstItemId }),
    });
    const data5 = await res5.json();
    assert(res5.status === 200, 'POST /api/kds/bump-item returns 200');
    assert(data5.stage === 'PREP', `Item stepped to PREP (Got: ${data5.stage})`);
  }

  // Test 6: Kitchen Table Ticket Bump (Bulk Pass)
  const res6 = await fetch(`${BASE_URL}/api/kds/bump-table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId: testTicketId, status: 'READY' }),
  });
  const data6 = await res6.json();
  assert(res6.status === 200, 'POST /api/kds/bump-table returns 200');
  assert(data6.status === 'READY', 'Ticket status bumped to READY');

  // Test 7: Kitchen 86 Inventory Toggle
  const res7a = await fetch(`${BASE_URL}/api/kds/toggle-86`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId: 'item-1', is86: true, prepDelayMinutes: 20 }),
  });
  const data7a = await res7a.json();
  assert(res7a.status === 200, 'POST /api/kds/toggle-86 marks item-1 out of stock');
  assert(data7a.item.is86 === true && data7a.item.prepDelayMinutes === 20, 'menu_86 is_86 set to true with 20m delay');

  // Restore 86
  const res7b = await fetch(`${BASE_URL}/api/kds/toggle-86`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId: 'item-1', is86: false, prepDelayMinutes: 0 }),
  });
  const data7b = await res7b.json();
  assert(data7b.item.is86 === false, 'menu_86 is_86 restored to false');

  // Test 8: Service Pings (Customer calls waiter)
  const pingPayload = {
    tableNumber: 'T-15',
    seatNumber: 1,
    type: 'WATER',
    guestName: 'Arun Kumar',
    message: 'Extra chilled water bottle please',
  };

  const res8 = await fetch(`${BASE_URL}/api/pings/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pingPayload),
  });
  const data8 = await res8.json();
  assert(res8.status === 200, 'POST /api/pings/create returns 200');
  assert(data8.status === 'PENDING', 'Ping registered with status PENDING');
  testPingId = data8.pingId;

  // Test 9: Waiter Resolves Ping
  if (testPingId) {
    const res9 = await fetch(`${BASE_URL}/api/pings/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pingId: testPingId }),
    });
    const data9 = await res9.json();
    assert(res9.status === 200, 'POST /api/pings/resolve returns 200');
    assert(data9.status === 'RESOLVED', 'Ping transitioned to RESOLVED');
  }

  // Test 10: Floor Captain Seats Walk-ins
  const res10 = await fetch(`${BASE_URL}/api/tables/seat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: 'T-02', guestCount: 2, serverName: 'Captain Ramesh' }),
  });
  const data10 = await res10.json();
  assert(res10.status === 200, 'POST /api/tables/seat returns 200');
  assert(data10.status === 'OCCUPIED' && data10.guestCount === 2, 'Table T-02 seated with 2 guests');

  // Test 11: Waiter Vacates Table
  const res11 = await fetch(`${BASE_URL}/api/tables/vacate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: 'T-15' }),
  });
  const data11 = await res11.json();
  assert(res11.status === 200, 'POST /api/tables/vacate returns 200');
  assert(data11.status === 'VACANT', 'Table T-15 reset to VACANT');

  const { data: vacatedTable } = await supabase.from('tables').select('*').eq('number', 'T-15').single();
  assert(vacatedTable.status === 'VACANT' && Number(vacatedTable.current_bill) === 0, 'Database table T-15 running bill reset to 0');

  // Vacate T-02 as well to leave database pristine
  await fetch(`${BASE_URL}/api/tables/vacate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: 'T-02' }),
  });

  console.log('----------------------------------------------------');
  console.log(`Results: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log('----------------------------------------------------');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
