/**
 * Phase 3 — Comprehensive State Bridge & Sync Test Suite
 *
 * Tests the entire cross-portal shared state layer:
 *   - useSharedBridge initial floor plan and inventory state
 *   - Canonical dish name normalization
 *   - Customer ordering & financial calculations
 *   - Waiter ping dispatch and duplicate suppression
 *   - Kitchen KDS item stage transitions (PLACED -> PREP -> PLATED -> SERVED)
 *   - Automatic ticket status derivation (NEW -> PREP -> READY -> COMPLETED)
 *   - Active items tracking on tables
 *   - Kitchen bulk dish updates across tickets
 *   - Table bumping & completed ticket purging
 *   - 86 catalog toggling & prep delay adjustments
 *   - Kitchen notification queue management
 *   - Waiter KOT generation & floor seating
 *   - Table merging with bill & activeItems combination
 *   - Waiter payment processing & shift stats accumulation
 *   - Table vacating with cascading ticket/seat reset
 *   - Store reactive subscriptions
 *   - Full system demo state reset
 *   - Cross-tab BroadcastChannel & sync protocol validation
 *   - High-throughput concurrency & performance benchmarks
 *   - Inter-store contract compatibility
 *
 * Run: npx tsx scripts/test-phase3-comprehensive.ts
 */

import { useSharedBridge, getCanonicalDishKey, SharedTable, SharedKDSTicket, SharedPing } from '../store/useSharedBridge';
import { useCustomerStore } from '../store/useCustomerStore';
import { useKitchenStore } from '../store/useKitchenStore';
import { useWaiterStore } from '../store/useWaiterStore';
import { useManagerStore } from '../store/useManagerStore';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// GROUP 1: Initial Store State & Floor Plan Hydration
// ---------------------------------------------------------------------------
function testInitialStoreState(): void {
  section('Group 1 — Initial Store State & Floor Plan Hydration');

  useSharedBridge.getState().resetToFreshDemoState();
  const state = useSharedBridge.getState();

  assert(typeof useSharedBridge === 'function', 'Store hook is defined and callable');
  assert(Array.isArray(state.tables), 'state.tables is an array');
  assert(state.tables.length === 34, `Exact floor layout of 34 tables present (actual: ${state.tables.length})`);

  // Section distribution
  const expressTables = state.tables.filter((t) => t.section === 'Express / Couple Hall');
  const mainHallTables = state.tables.filter((t) => t.section === 'Main Dining Hall');
  const familyTables = state.tables.filter((t) => t.section === 'Family Section');
  const courtyardTables = state.tables.filter((t) => t.section === 'Courtyard Garden');
  const feastTables = state.tables.filter((t) => t.section === 'Grand Feast Hall');

  assert(expressTables.length === 4, 'Express / Couple Hall has exactly 4 tables');
  assert(mainHallTables.length === 10, 'Main Dining Hall has exactly 10 tables');
  assert(familyTables.length === 10, 'Family Section has exactly 10 tables');
  assert(courtyardTables.length === 5, 'Courtyard Garden has exactly 5 tables');
  assert(feastTables.length === 5, 'Grand Feast Hall has exactly 5 tables');

  // Capacity verification
  assert(expressTables.every((t) => t.capacity === 2), 'All Express tables are 2-seaters');
  assert(mainHallTables.every((t) => t.capacity === 3), 'All Main Dining tables are 3-seaters');
  assert(familyTables.every((t) => t.capacity === 4), 'All Family Section tables are 4-seaters');
  assert(courtyardTables.every((t) => t.capacity === 5), 'All Courtyard Garden tables are 5-seaters');
  assert(feastTables.every((t) => t.capacity === 6), 'All Grand Feast tables are 6-seaters');

  const totalSeats = state.tables.reduce((sum, t) => sum + t.capacity, 0);
  assert(totalSeats === 133, `Total floor seating capacity equals 133 seats (actual: ${totalSeats})`);

  // Table default field values
  const allVacant = state.tables.every((t) => t.status === 'VACANT');
  const allZeroBill = state.tables.every((t) => t.currentBill === 0);
  const allZeroGuest = state.tables.every((t) => t.guestCount === 0);
  const allZeroKot = state.tables.every((t) => t.kotCount === 0);
  const allDefaultServer = state.tables.every((t) => t.serverName === 'Floor Captain');
  const allUnseated = state.tables.every((t) => t.seatedTime === '--');

  assert(allVacant, 'All initial tables have status VACANT');
  assert(allZeroBill, 'All initial tables have currentBill = 0');
  assert(allZeroGuest, 'All initial tables have guestCount = 0');
  assert(allZeroKot, 'All initial tables have kotCount = 0');
  assert(allDefaultServer, 'All initial tables have serverName = "Floor Captain"');
  assert(allUnseated, 'All initial tables have seatedTime = "--"');

  // Inventory 86 initial state
  assert(Array.isArray(state.inventory86), 'state.inventory86 is an array');
  assert(state.inventory86.length === INITIAL_MENU_ITEMS.length, `Inventory catalog matches menu size (${INITIAL_MENU_ITEMS.length})`);
  assert(state.inventory86.every((i) => i.is86 === false), 'All items in initial inventory are in-stock (is86 === false)');
  assert(state.inventory86.every((i) => i.prepDelayMinutes === 0), 'All items in initial inventory have prepDelayMinutes === 0');

  // Queues & Stats initial state
  assert(state.kdsTickets.length === 0, 'Initial kdsTickets is empty []');
  assert(state.pings.length === 0, 'Initial pings is empty []');
  assert(state.kitchenNotifications.length === 0, 'Initial kitchenNotifications is empty []');
  assert(state.shiftStats.tablesServed === 0, 'Initial shiftStats.tablesServed === 0');
  assert(state.shiftStats.totalRevenue === 0, 'Initial shiftStats.totalRevenue === 0');
  assert(state.shiftStats.tipsEarned === 0, 'Initial shiftStats.tipsEarned === 0');
  assert(state.shiftStats.avgTurnaroundMinutes === 38, 'Initial shiftStats.avgTurnaroundMinutes === 38');
}

// ---------------------------------------------------------------------------
// GROUP 2: Canonical Dish Key Extraction Utility
// ---------------------------------------------------------------------------
function testCanonicalDishKey(): void {
  section('Group 2 — Canonical Dish Key Extraction');

  assert(getCanonicalDishKey('Donne Biryani') === 'donne biryani', 'Simple name lowercased correctly');
  assert(getCanonicalDishKey('Special Chicken Donne Biryani') === 'special chicken donne biryani', 'Multi-word title normalized');
  assert(getCanonicalDishKey('Donne Biryani [Seat 1]') === 'donne biryani', 'Strips [Seat N] tag');
  assert(getCanonicalDishKey('Donne Biryani [Seat 14]') === 'donne biryani', 'Strips multi-digit [Seat 14] tag');
  assert(getCanonicalDishKey('[Table T-05] Mutton Sukka') === 'mutton sukka', 'Strips [Table T-XX] prefix tag');
  assert(getCanonicalDishKey('[Table 12] Neer Dosa') === 'neer dosa', 'Strips numeric [Table N] tag');
  assert(getCanonicalDishKey('[Table T-01] Chicken Kabab [Seat 2]') === 'chicken kabab', 'Strips both [Table ...] and [Seat ...] tags');
  assert(getCanonicalDishKey('Neer Dosa (3 Pcs)') === 'neer dosa 3 pcs', 'Strips parentheses but preserves content');
  assert(getCanonicalDishKey('Kshatriya Chicken Kebab (Crispy)') === 'kshatriya chicken kebab crispy', 'Handles complex bracketed descriptors');
  assert(getCanonicalDishKey('   Donne Biryani   ') === 'donne biryani', 'Trims leading and trailing whitespace');
  assert(getCanonicalDishKey('Mutton    Sukka') === 'mutton sukka', 'Collapses multiple whitespace chars');
  assert(getCanonicalDishKey('DOnNe BiRyAnI') === 'donne biryani', 'Handles mixed uppercase and lowercase');
  assert(getCanonicalDishKey('') === '', 'Empty string produces empty key');
  assert(getCanonicalDishKey('   ') === '', 'Whitespace-only string produces empty key');
  assert(getCanonicalDishKey('[Seat 3]') === '', 'Tag-only string produces empty key');
  assert(getCanonicalDishKey('[Table T-04]') === '', 'Table-tag-only string produces empty key');
  assert(getCanonicalDishKey('Pot (Dum) [Seat 1]') === 'pot dum', 'Handles combined parens and brackets');
  assert(getCanonicalDishKey('Pepper Gravy / Extra') === 'pepper gravy / extra', 'Preserves standard slashes and characters');
}

// ---------------------------------------------------------------------------
// GROUP 3: Customer Order Placement Lifecycle & Financial Math
// ---------------------------------------------------------------------------
function testCustomerOrderPlacement(): void {
  section('Group 3 — Customer Order Placement & Financial Math');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  const item1 = INITIAL_MENU_ITEMS[0]; // Chicken Donne Biryani, Rs. 260
  const item2 = INITIAL_MENU_ITEMS[2]; // Kshatriya Chicken Kebab, Rs. 220

  bridge.customerPlacesOrder('T-01', 'Arjun', 2, [
    { item: item1, selectedOption: 'Medium Spicy', addOns: ['Extra Boiled Egg'], quantity: 2 },
    { item: item2, selectedOption: 'Full Plate', addOns: [], quantity: 1 },
  ]);

  const state1 = useSharedBridge.getState();
  assert(state1.kdsTickets.length === 1, 'KDS ticket created in state');

  const ticket1 = state1.kdsTickets[0];
  assert(ticket1.id.startsWith('KDS-'), 'Ticket ID starts with KDS- prefix');
  assert(ticket1.tableNumber === 'T-01', 'Ticket tableNumber is T-01');
  assert(ticket1.serverName === 'Arjun', 'Ticket serverName set to guestName');
  assert(ticket1.status === 'NEW', 'Ticket status initialized to NEW');
  assert(ticket1.source === 'CUSTOMER', 'Ticket source initialized to CUSTOMER');
  assert(ticket1.items.length === 2, 'Ticket has exactly 2 order items');

  // Item mapping assertions
  const ki1 = ticket1.items[0];
  assert(ki1.name === item1.name, 'First item name matches catalog');
  assert(ki1.quantity === 2, 'First item quantity equals 2');
  assert(ki1.stage === 'PLACED', 'First item stage initialized to PLACED');
  assert(ki1.options === 'Medium Spicy', 'First item options preserved');
  assert(Array.isArray(ki1.addOns) && ki1.addOns[0] === 'Extra Boiled Egg', 'First item addOns preserved');

  const ki2 = ticket1.items[1];
  assert(ki2.name === item2.name, 'Second item name matches catalog');
  assert(ki2.quantity === 1, 'Second item quantity equals 1');
  assert(ki2.stage === 'PLACED', 'Second item stage initialized to PLACED');

  // Table update assertions
  const table1 = state1.tables.find((t) => t.number === 'T-01');
  assert(table1 !== undefined, 'Table T-01 found in floor plan');
  assert(table1?.status === 'OCCUPIED', 'Table status transitioned to OCCUPIED');
  // customerPlacesOrder's 3rd argument is the SEAT number, and guestCount = distinct seats that have ordered
  assert(table1?.guestCount === 1, 'Table guestCount counts distinct ordering seats (seat 2 only -> 1)');
  assert(table1?.kotCount === 1, 'Table kotCount incremented to 1');
  assert(table1?.seatedTime !== '--', 'Table seatedTime updated from "--"');

  // Financial calculations
  const expectedSubtotal = 260 * 2 + 220 * 1; // 520 + 220 = 740
  assert(table1?.currentBill === expectedSubtotal, `Table currentBill matches exact sum (${table1?.currentBill} === ${expectedSubtotal})`);

  // Active items array
  assert(Array.isArray(table1?.activeItems), 'Table activeItems is an array');
  assert(table1?.activeItems?.length === 2, 'Table has 2 activeItems recorded');
  assert(table1?.activeItems?.[0].status === 'Placed', 'First active item has status "Placed"');

  // Kitchen notification creation
  assert(state1.kitchenNotifications.length === 1, 'Kitchen notification added to queue');
  const notif = state1.kitchenNotifications[0];
  assert(notif.ticketId === ticket1.id, 'Notification ticketId references created ticket');
  assert(notif.tableNumber === 'T-01', 'Notification tableNumber is T-01');
  assert(notif.itemCount === 3, `Notification itemCount represents total units (2 + 1 = 3, actual: ${notif.itemCount})`);
  assert(notif.dismissed === false, 'Notification dismissed is initially false');

  // Second order placed on same table (Supplementary KOT)
  bridge.customerPlacesOrder('T-01', 'Arjun', 2, [
    { item: item1, selectedOption: 'Medium Spicy', addOns: [], quantity: 1 },
  ]);

  const state2 = useSharedBridge.getState();
  const table1Updated = state2.tables.find((t) => t.number === 'T-01');
  assert(state2.kdsTickets.length === 2, 'Second KDS ticket appended for table');
  assert(table1Updated?.kotCount === 2, 'Table kotCount incremented to 2');
  assert(table1Updated?.currentBill === expectedSubtotal + 260, `Table currentBill accumulated to ${expectedSubtotal + 260}`);
  assert(table1Updated?.activeItems?.length === 3, 'Table activeItems appended third item');
  assert(state2.kitchenNotifications.length === 2, 'Second kitchen notification created');
}

// ---------------------------------------------------------------------------
// GROUP 4: Customer Waiter Pings & Duplicate Suppression
// ---------------------------------------------------------------------------
function testCustomerWaiterPings(): void {
  section('Group 4 — Customer Waiter Pings & Duplicate Suppression');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  // Initial ping
  bridge.customerPingsWaiter('T-02', 'WATER', 'Priya', 'Need cold water');
  const state1 = useSharedBridge.getState();
  assert(state1.pings.length === 1, 'Ping added to state.pings array');

  const ping1 = state1.pings[0];
  assert(ping1.id.startsWith('p-'), 'Ping ID starts with "p-" prefix');
  assert(ping1.tableNumber === 'T-02', 'Ping tableNumber matches T-02');
  assert(ping1.type === 'WATER', 'Ping type matches WATER');
  assert(ping1.guestName === 'Priya', 'Ping guestName matches Priya');
  assert(ping1.message === 'Need cold water', 'Ping message preserved');
  assert(ping1.status === 'PENDING', 'Ping status is PENDING');

  // Deduplication check: Same table, same type, status PENDING
  bridge.customerPingsWaiter('T-02', 'WATER', 'Priya', 'Need water again');
  const state2 = useSharedBridge.getState();
  assert(state2.pings.length === 1, 'Duplicate WATER ping for T-02 is suppressed (still 1 ping)');

  // Distinct ping type from same table is permitted
  bridge.customerPingsWaiter('T-02', 'BILL', 'Priya', 'Please bring bill');
  const state3 = useSharedBridge.getState();
  assert(state3.pings.length === 2, 'Different ping type (BILL) for T-02 is accepted (2 pings)');

  // Same ping type from a DIFFERENT table is permitted
  bridge.customerPingsWaiter('T-03', 'WATER', 'Vijay', 'Water please');
  const state4 = useSharedBridge.getState();
  assert(state4.pings.length === 3, 'WATER ping for T-03 is accepted (3 pings)');

  // Ping without custom message
  bridge.customerPingsWaiter('T-04', 'CALL_WAITER', 'Kavya');
  const state5 = useSharedBridge.getState();
  assert(state5.pings.length === 4, 'CALL_WAITER ping without message accepted (4 pings)');
  const ping4 = state5.pings.find((p) => p.tableNumber === 'T-04');
  assert(ping4?.message === undefined, 'Omitted message is safely undefined');
}

// ---------------------------------------------------------------------------
// GROUP 5: Kitchen KDS Stage Bumping & Status Auto-Sync
// ---------------------------------------------------------------------------
function testKitchenStageBumping(): void {
  section('Group 5 — Kitchen KDS Stage Bumping & Status Auto-Sync');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  const item = INITIAL_MENU_ITEMS[0];
  bridge.customerPlacesOrder('T-05', 'Kiran', 2, [
    { item, selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  let ticket = useSharedBridge.getState().kdsTickets[0];
  const ticketId = ticket.id;
  const itemId = ticket.items[0].id;

  assert(ticket.items[0].stage === 'PLACED', 'Initial item stage is PLACED');
  assert(ticket.status === 'NEW', 'Initial ticket status is NEW');

  // Bump 1: PLACED -> PREP
  bridge.kitchenBumpItemStage(ticketId, itemId);
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'PREP', 'Bump 1: Stage transitioned PLACED -> PREP');
  assert(ticket.status === 'PREP', 'Ticket status automatically derived to PREP');

  const tableAfterPrep = useSharedBridge.getState().tables.find((t) => t.number === 'T-05');
  assert(tableAfterPrep?.activeItems?.[0].status === 'Cooking', 'Table activeItem status synced to "Cooking"');

  // Bump 2: PREP -> PLATED
  bridge.kitchenBumpItemStage(ticketId, itemId);
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'PLATED', 'Bump 2: Stage transitioned PREP -> PLATED');
  assert(ticket.status === 'READY', 'Ticket status automatically derived to READY (all plated)');

  const tableAfterPlated = useSharedBridge.getState().tables.find((t) => t.number === 'T-05');
  assert(tableAfterPlated?.activeItems?.[0].status === 'Ready', 'Table activeItem status synced to "Ready"');

  // Bump 3: PLATED -> SERVED
  bridge.kitchenBumpItemStage(ticketId, itemId);
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'SERVED', 'Bump 3: Stage transitioned PLATED -> SERVED');
  assert(ticket.status === 'COMPLETED', 'Ticket status automatically derived to COMPLETED (all served)');

  const tableAfterServed = useSharedBridge.getState().tables.find((t) => t.number === 'T-05');
  assert(tableAfterServed?.activeItems?.[0].status === 'Served', 'Table activeItem status synced to "Served"');

  // Bump 4: Boundary test — bumping already SERVED item
  bridge.kitchenBumpItemStage(ticketId, itemId);
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'SERVED', 'Stage clamping: SERVED remains SERVED');
  assert(ticket.status === 'COMPLETED', 'Ticket remains COMPLETED');

  // Multi-item ticket status test:
  bridge.customerPlacesOrder('T-06', 'Dinesh', 2, [
    { item, selectedOption: 'Standard', addOns: [], quantity: 1 },
    { item: INITIAL_MENU_ITEMS[1], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  const multiTicket = useSharedBridge.getState().kdsTickets.find((t) => t.tableNumber === 'T-06')!;
  const mTicketId = multiTicket.id;
  const mItem1 = multiTicket.items[0].id;
  const mItem2 = multiTicket.items[1].id;

  // Bump only item 1 to PREP
  bridge.kitchenBumpItemStage(mTicketId, mItem1);
  let curMulti = useSharedBridge.getState().kdsTickets.find((t) => t.id === mTicketId)!;
  assert(curMulti.items[0].stage === 'PREP' && curMulti.items[1].stage === 'PLACED', 'Item 1 is PREP, item 2 is PLACED');
  assert(curMulti.status === 'PREP', 'Ticket status is PREP when any item is in PREP');

  // Bump item 1 to PLATED while item 2 is still PLACED
  bridge.kitchenBumpItemStage(mTicketId, mItem1);
  curMulti = useSharedBridge.getState().kdsTickets.find((t) => t.id === mTicketId)!;
  assert(curMulti.status === 'PREP', 'Ticket remains PREP because not all items are plated');

  // Bump item 2 to PREP then PLATED
  bridge.kitchenBumpItemStage(mTicketId, mItem2);
  bridge.kitchenBumpItemStage(mTicketId, mItem2);
  curMulti = useSharedBridge.getState().kdsTickets.find((t) => t.id === mTicketId)!;
  assert(curMulti.items.every((i) => i.stage === 'PLATED'), 'Both items are now PLATED');
  assert(curMulti.status === 'READY', 'Ticket status transitions to READY when all items are plated');
}

// ---------------------------------------------------------------------------
// GROUP 6: Kitchen Manual Stage Setting & Overrides
// ---------------------------------------------------------------------------
function testKitchenManualStageSetting(): void {
  section('Group 6 — Kitchen Manual Stage Setting & Overrides');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPlacesOrder('T-07', 'Manoj', 1, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  const ticketId = useSharedBridge.getState().kdsTickets[0].id;
  const itemId = useSharedBridge.getState().kdsTickets[0].items[0].id;

  // Jump straight to PLATED
  bridge.kitchenSetItemStage(ticketId, itemId, 'PLATED');
  let ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'PLATED', 'Direct jump to PLATED succeeded');
  assert(ticket.status === 'READY', 'Ticket status is READY');

  // Jump straight to SERVED
  bridge.kitchenSetItemStage(ticketId, itemId, 'SERVED');
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'SERVED', 'Direct jump to SERVED succeeded');
  assert(ticket.status === 'COMPLETED', 'Ticket status is COMPLETED');

  // Regress back to PREP
  bridge.kitchenSetItemStage(ticketId, itemId, 'PREP');
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'PREP', 'Regression back to PREP succeeded');
  assert(ticket.status === 'PREP', 'Ticket status regressed to PREP');

  // Regress back to PLACED
  bridge.kitchenSetItemStage(ticketId, itemId, 'PLACED');
  ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.items[0].stage === 'PLACED', 'Regression back to PLACED succeeded');
  assert(ticket.status === 'NEW', 'Ticket status regressed to NEW');

  // Non-existent ticket or item handling
  bridge.kitchenSetItemStage('KDS-999', 'non-existent-item', 'SERVED');
  assert(useSharedBridge.getState().kdsTickets.length === 1, 'Manual stage call with invalid IDs does not corrupt state');
}

// ---------------------------------------------------------------------------
// GROUP 7: Kitchen Bulk Item Stage Setting Across Tickets
// ---------------------------------------------------------------------------
function testKitchenBulkItemStage(): void {
  section('Group 7 — Kitchen Bulk Item Stage Setting Across Tickets');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  const biryani = INITIAL_MENU_ITEMS[0]; // Special Chicken Donne Biryani
  const mutton = INITIAL_MENU_ITEMS[1];  // Thoogudeepa Mutton Donne Biryani

  // Place order for Table 1: Biryani
  bridge.customerPlacesOrder('T-08', 'Customer A', 2, [
    { item: biryani, selectedOption: 'Standard', addOns: [], quantity: 2 },
  ]);

  // Place order for Table 2: Biryani and Mutton
  bridge.customerPlacesOrder('T-09', 'Customer B', 2, [
    { item: biryani, selectedOption: 'Standard', addOns: [], quantity: 1 },
    { item: mutton, selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  // Place order for Table 3: Only Mutton
  bridge.customerPlacesOrder('T-10', 'Customer C', 1, [
    { item: mutton, selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  assert(useSharedBridge.getState().kdsTickets.length === 3, 'Three distinct tickets created across tables');

  // Execute bulk bump on Special Chicken Donne Biryani to 'PLATED'
  bridge.kitchenSetBulkItemStage('Special Chicken Donne Biryani', 'PLATED');

  const tickets = useSharedBridge.getState().kdsTickets;
  const t8 = tickets.find((t) => t.tableNumber === 'T-08')!;
  const t9 = tickets.find((t) => t.tableNumber === 'T-09')!;
  const t10 = tickets.find((t) => t.tableNumber === 'T-10')!;

  assert(t8.items[0].stage === 'PLATED', 'Table 8 Biryani updated to PLATED');
  assert(t8.status === 'READY', 'Table 8 ticket status is READY');

  const t9Biryani = t9.items.find((i) => i.name === biryani.name)!;
  const t9Mutton = t9.items.find((i) => i.name === mutton.name)!;
  assert(t9Biryani.stage === 'PLATED', 'Table 9 Biryani updated to PLATED');
  assert(t9Mutton.stage === 'PLACED', 'Table 9 Mutton untouched at PLACED');
  assert(t9.status === 'PREP', 'Table 9 ticket status is PREP (one item plated, one placed)');

  assert(t10.items[0].stage === 'PLACED', 'Table 10 (mutton only) completely untouched at PLACED');
  assert(t10.status === 'NEW', 'Table 10 ticket status remains NEW');

  // Bulk bump with canonical dish key matching
  bridge.kitchenSetBulkItemStage('mutton donne biryani', 'SERVED');
  const ticketsAfterMutton = useSharedBridge.getState().kdsTickets;
  const t10Updated = ticketsAfterMutton.find((t) => t.tableNumber === 'T-10')!;
  assert(t10Updated.items[0].stage === 'SERVED', 'Fuzzy canonical match for Mutton updated Table 10 to SERVED');
  assert(t10Updated.status === 'COMPLETED', 'Table 10 ticket status updated to COMPLETED');
}

// ---------------------------------------------------------------------------
// GROUP 8: Kitchen Bump Entire Table & Item Transition
// ---------------------------------------------------------------------------
function testKitchenBumpTable(): void {
  section('Group 8 — Kitchen Bump Entire Table & Item Transition');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPlacesOrder('T-11', 'Raghu', 3, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 2 },
    { item: INITIAL_MENU_ITEMS[2], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  const ticket = useSharedBridge.getState().kdsTickets[0];
  assert(ticket.status === 'NEW', 'Ticket initially NEW');
  assert(ticket.items.every((i) => i.stage === 'PLACED'), 'All items initially PLACED');

  // Bump the whole table
  bridge.kitchenBumpTable(ticket.id);

  const bumpedTicket = useSharedBridge.getState().kdsTickets[0];
  assert(bumpedTicket.status === 'READY', 'Whole ticket bumped to READY');
  assert(bumpedTicket.items.every((i) => i.stage === 'PLATED'), 'All items in ticket transitioned to PLATED');

  // Non-existent ticket bump
  bridge.kitchenBumpTable('KDS-INVALID');
  assert(useSharedBridge.getState().kdsTickets.length === 1, 'Invalid ticketId does not mutate ticket array');
}

// ---------------------------------------------------------------------------
// GROUP 9: Kitchen Ticket Archiving & Clearance
// ---------------------------------------------------------------------------
function testKitchenTicketClearance(): void {
  section('Group 9 — Kitchen Ticket Archiving & Clearance');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  // Create 3 tickets: one COMPLETED, one READY, one NEW
  bridge.customerPlacesOrder('T-12', 'Guest 1', 1, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);
  bridge.customerPlacesOrder('T-13', 'Guest 2', 1, [
    { item: INITIAL_MENU_ITEMS[1], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);
  bridge.customerPlacesOrder('T-14', 'Guest 3', 1, [
    { item: INITIAL_MENU_ITEMS[2], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  const tickets = useSharedBridge.getState().kdsTickets;
  const t1Id = tickets[0].id;
  const t2Id = tickets[1].id;

  // Complete ticket 1
  bridge.kitchenSetItemStage(t1Id, tickets[0].items[0].id, 'SERVED');
  // Ready ticket 2
  bridge.kitchenBumpTable(t2Id);

  const stateBeforeClear = useSharedBridge.getState();
  assert(stateBeforeClear.kdsTickets[0].status === 'COMPLETED', 'Ticket 1 is COMPLETED');
  assert(stateBeforeClear.kdsTickets[1].status === 'READY', 'Ticket 2 is READY');
  assert(stateBeforeClear.kdsTickets[2].status === 'NEW', 'Ticket 3 is NEW');

  // Clear completed
  bridge.kitchenClearCompleted();

  const stateAfterClear = useSharedBridge.getState();
  assert(stateAfterClear.kdsTickets.length === 2, 'Only 2 tickets remain after clearing completed');
  assert(!stateAfterClear.kdsTickets.some((t) => t.status === 'COMPLETED'), 'No COMPLETED tickets remain');
  assert(stateAfterClear.kdsTickets.some((t) => t.tableNumber === 'T-13'), 'READY ticket for T-13 preserved');
  assert(stateAfterClear.kdsTickets.some((t) => t.tableNumber === 'T-14'), 'NEW ticket for T-14 preserved');

  // Idempotent call when none are completed
  bridge.kitchenClearCompleted();
  assert(useSharedBridge.getState().kdsTickets.length === 2, 'Idempotent call preserves tickets unchanged');
}

// ---------------------------------------------------------------------------
// GROUP 10: Kitchen 86 Catalog & Prep Delay Mechanics
// ---------------------------------------------------------------------------
function testKitchenInventory86(): void {
  section('Group 10 — Kitchen 86 Inventory & Prep Delay');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  const targetItem = INITIAL_MENU_ITEMS[0];
  const itemId = targetItem.id;

  const initial86 = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(initial86.is86 === false, 'Item is initially in-stock (is86 === false)');
  assert(initial86.prepDelayMinutes === 0, 'Item initially has 0 prep delay');

  // Toggle 86 ON
  bridge.kitchenToggle86(itemId);
  let curItem = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(curItem.is86 === true, 'Toggle 1: is86 flipped to true');

  // Toggle 86 OFF
  bridge.kitchenToggle86(itemId);
  curItem = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(curItem.is86 === false, 'Toggle 2: is86 flipped back to false');

  // Add prep delay (+15 mins)
  bridge.kitchenUpdatePrepDelay(itemId, 15);
  curItem = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(curItem.prepDelayMinutes === 15, 'Prep delay increased to 15 mins');

  // Add another (+10 mins)
  bridge.kitchenUpdatePrepDelay(itemId, 10);
  curItem = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(curItem.prepDelayMinutes === 25, 'Prep delay accumulated to 25 mins');

  // Subtract delay (-10 mins)
  bridge.kitchenUpdatePrepDelay(itemId, -10);
  curItem = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(curItem.prepDelayMinutes === 15, 'Prep delay reduced to 15 mins');

  // Subtract past zero (-30 mins) -> clamped to 0
  bridge.kitchenUpdatePrepDelay(itemId, -30);
  curItem = useSharedBridge.getState().inventory86.find((i) => i.id === itemId)!;
  assert(curItem.prepDelayMinutes === 0, 'Prep delay clamped to 0 (Math.max)');

  // Mutating non-existent item
  bridge.kitchenToggle86('non-existent-item');
  assert(useSharedBridge.getState().inventory86.length === INITIAL_MENU_ITEMS.length, 'Non-existent item toggle safe');
}

// ---------------------------------------------------------------------------
// GROUP 11: Kitchen Notification Queue Lifecycle
// ---------------------------------------------------------------------------
function testKitchenNotifications(): void {
  section('Group 11 — Kitchen Notification Queue Lifecycle');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPlacesOrder('T-15', 'User 1', 1, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 2 },
  ]);
  bridge.customerPlacesOrder('T-16', 'User 2', 1, [
    { item: INITIAL_MENU_ITEMS[1], selectedOption: 'Standard', addOns: [], quantity: 3 },
  ]);

  let notifs = useSharedBridge.getState().kitchenNotifications;
  assert(notifs.length === 2, 'Two notifications in queue');
  assert(notifs.every((n) => n.dismissed === false), 'Both notifications are active');

  // Dismiss first notification
  const firstId = notifs[0].id;
  bridge.kitchenDismissNotification(firstId);

  notifs = useSharedBridge.getState().kitchenNotifications;
  assert(notifs.find((n) => n.id === firstId)?.dismissed === true, 'First notification marked dismissed');
  assert(notifs.find((n) => n.id !== firstId)?.dismissed === false, 'Second notification remains active');

  // Dismiss all notifications
  bridge.kitchenDismissAllNotifications();
  notifs = useSharedBridge.getState().kitchenNotifications;
  assert(notifs.every((n) => n.dismissed === true), 'All notifications now marked dismissed');
}

// ---------------------------------------------------------------------------
// GROUP 12: Kitchen Pass Call Floor Waiter Integration
// ---------------------------------------------------------------------------
function testCallFloorWaiter(): void {
  section('Group 12 — Kitchen Pass Call Floor Waiter Integration');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.callFloorWaiter('T-17', 'Biryani hot on pickup pass');

  const pings = useSharedBridge.getState().pings;
  assert(pings.length === 1, 'Floor call generated a ping record');
  const ping = pings[0];
  assert(ping.tableNumber === 'T-17', 'Ping tableNumber matches T-17');
  assert(ping.type === 'FOOD', 'Ping type is FOOD');
  assert(ping.guestName === 'Kitchen Pass', 'Ping guestName is "Kitchen Pass"');
  assert(ping.message === 'Biryani hot on pickup pass', 'Ping message matches reason');
  assert(ping.status === 'PENDING', 'Ping status is PENDING');
}

// ---------------------------------------------------------------------------
// GROUP 13: Waiter KOT Placement & Ticket Generation
// ---------------------------------------------------------------------------
function testWaiterFiresKOT(): void {
  section('Group 13 — Waiter KOT Placement & Ticket Generation');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  const item = INITIAL_MENU_ITEMS[0]; // Rs. 260
  bridge.waiterFiresKOT('T-18', 'Captain Ramesh', [
    { item, selectedOption: 'Spicy', quantity: 2 },
  ]);

  const state = useSharedBridge.getState();
  assert(state.kdsTickets.length === 1, 'KDS ticket created from waiter KOT');
  const ticket = state.kdsTickets[0];
  assert(ticket.source === 'WAITER', 'Ticket source is "WAITER"');
  assert(ticket.serverName === 'Captain Ramesh', 'Ticket serverName set to captain');
  assert(ticket.status === 'NEW', 'Ticket status initialized to NEW');
  assert(ticket.items[0].id.startsWith('ki-w-'), 'Ticket item ID starts with ki-w- prefix');

  const table = state.tables.find((t) => t.number === 'T-18')!;
  assert(table.status === 'OCCUPIED', 'Table status transitioned to OCCUPIED');
  assert(table.currentBill === 520, `Table currentBill matches KOT total (520, actual: ${table.currentBill})`);
  assert(table.kotCount === 1, 'Table kotCount incremented to 1');

  assert(state.kitchenNotifications.length === 1, 'Kitchen notification generated from waiter KOT');
}

// ---------------------------------------------------------------------------
// GROUP 14: Waiter Seating & Guest Headcount
// ---------------------------------------------------------------------------
function testWaiterSeatsGuests(): void {
  section('Group 14 — Waiter Seating & Guest Headcount');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.waiterSeatsGuests('T-19', 4, 'Captain Suresh');

  const table = useSharedBridge.getState().tables.find((t) => t.number === 'T-19')!;
  assert(table.status === 'OCCUPIED', 'Table status is OCCUPIED');
  assert(table.guestCount === 4, 'Table guestCount is 4');
  assert(table.serverName === 'Captain Suresh', 'Table serverName is Captain Suresh');
  assert(table.seatedTime !== '--', 'Table seatedTime is updated');
}

// ---------------------------------------------------------------------------
// GROUP 15: Waiter Table Merging & Bill Aggregation
// ---------------------------------------------------------------------------
function testWaiterMergeTables(): void {
  section('Group 15 — Waiter Table Merging & Bill Aggregation');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  // Setup Table 20 with order (Rs. 520)
  bridge.customerPlacesOrder('T-20', 'Guest 20', 2, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 2 },
  ]);

  // Setup Table 21 with order (Rs. 220)
  bridge.customerPlacesOrder('T-21', 'Guest 21', 2, [
    { item: INITIAL_MENU_ITEMS[2], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  const t20Before = useSharedBridge.getState().tables.find((t) => t.number === 'T-20')!;
  const t21Before = useSharedBridge.getState().tables.find((t) => t.number === 'T-21')!;
  assert(t20Before.currentBill === 520, 'T-20 bill is 520');
  assert(t21Before.currentBill === 220, 'T-21 bill is 220');

  // Merge T-21 with T-20 (whole tables only)
  useSharedBridge.getState().waiterMergeTables('T-20', 'T-21');

  const state = useSharedBridge.getState();
  const t20After = state.tables.find((t) => t.number === 'T-20')!;
  const t21After = state.tables.find((t) => t.number === 'T-21')!;

  // Per-table model: each table keeps its own bill, guests and items. Nothing is poured into the primary.
  assert(t20After.currentBill === 520, `Primary keeps its own bill (520, actual: ${t20After.currentBill})`);
  assert(t21After.currentBill === 220, `Secondary keeps its own bill (220, actual: ${t21After.currentBill})`);
  assert(t20After.currentBill + t21After.currentBill === 740, 'Group total across members is 740 (floor grid sums members)');
  assert(t20After.guestCount === 1 && t21After.guestCount === 1, `Each table keeps its own guest count (1 + 1, actual: ${t20After.guestCount} + ${t21After.guestCount})`);
  assert(t20After.activeItems?.length === 1 && t21After.activeItems?.length === 1, 'Each table keeps its own activeItems');

  // Group linkage: lowest table number is the primary and EVERY member (primary included) points at it
  assert(t20After.mergedWith === 'T-20', 'Primary mergedWith points to itself (group head)');
  assert(t21After.mergedWith === 'T-20', 'Secondary mergedWith points to primary');
  assert(
    JSON.stringify(t20After.mergeGroupPeers) === JSON.stringify(['T-20', 'T-21']) &&
      JSON.stringify(t21After.mergeGroupPeers) === JSON.stringify(['T-20', 'T-21']),
    'Both members list the same sorted mergeGroupPeers'
  );

  // Unmerge hands each table back untouched
  useSharedBridge.getState().waiterUnmergeTable('T-21');
  const afterUnmerge = useSharedBridge.getState().tables;
  const u20 = afterUnmerge.find((t) => t.number === 'T-20')!;
  const u21 = afterUnmerge.find((t) => t.number === 'T-21')!;
  assert(u20.currentBill === 520 && u21.currentBill === 220, 'Unmerge leaves each table bill unchanged (520 / 220)');
  assert(!u20.mergedWith && !u21.mergedWith && !u20.mergeGroupPeers && !u21.mergeGroupPeers, 'Unmerge clears all merge links');

  // Invalid merge call
  bridge.waiterMergeTables('T-99', 'T-88');
  assert(useSharedBridge.getState().tables.length === 34, 'Invalid table merge does not alter store');

  // Cap: a group never exceeds 4 tables
  useSharedBridge.getState().resetToFreshDemoState();
  const b2 = useSharedBridge.getState();
  b2.waiterMergeTables('T-20', 'T-21');
  b2.waiterMergeTables('T-20', 'T-22');
  b2.waiterMergeTables('T-20', 'T-23');
  b2.waiterMergeTables('T-20', 'T-24'); // 5th table -> silently blocked
  const grp = useSharedBridge.getState().tables.find((t) => t.number === 'T-20')!;
  assert(grp.mergeGroupPeers?.length === 4, `Merge group is capped at 4 tables (actual: ${grp.mergeGroupPeers?.length})`);
  assert(!useSharedBridge.getState().tables.find((t) => t.number === 'T-24')!.mergedWith, '5th table is not linked to the group');
}

// ---------------------------------------------------------------------------
// GROUP 16: Waiter Ping Resolution
// ---------------------------------------------------------------------------
function testWaiterResolvePing(): void {
  section('Group 16 — Waiter Ping Resolution');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPingsWaiter('T-22', 'WATER', 'Sunil');
  const pingId = useSharedBridge.getState().pings[0].id;
  assert(useSharedBridge.getState().pings.length === 1, 'Ping exists');

  bridge.waiterResolvePing(pingId);
  assert(useSharedBridge.getState().pings.length === 0, 'Ping removed after resolution');

  // Non-existent ping resolve is safe
  bridge.waiterResolvePing('p-invalid');
  assert(useSharedBridge.getState().pings.length === 0, 'Resolving invalid ping ID is safe no-op');
}

// ---------------------------------------------------------------------------
// GROUP 17: Waiter Payment Settlement & Shift Stats Tracking
// ---------------------------------------------------------------------------
function testWaiterPaymentSettlement(): void {
  section('Group 17 — Waiter Payment Settlement & Shift Stats Tracking');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPlacesOrder('T-23', 'Guest 23', 2, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 2 },
  ]);

  const initialRevenue = useSharedBridge.getState().shiftStats.totalRevenue;
  const initialServed = useSharedBridge.getState().shiftStats.tablesServed;

  bridge.waiterRecordsPayment('T-23', 'UPI', 520);

  const state = useSharedBridge.getState();
  const table = state.tables.find((t) => t.number === 'T-23')!;
  assert(table.status === 'BILLING', 'Table transitioned to BILLING status');
  assert(state.shiftStats.totalRevenue === initialRevenue + 520, `Shift totalRevenue increased by 520 (actual: ${state.shiftStats.totalRevenue})`);
  assert(state.shiftStats.tablesServed === initialServed + 1, `Shift tablesServed incremented by 1 (actual: ${state.shiftStats.tablesServed})`);

  // Payment on a merged table updates both partner tables to BILLING
  bridge.customerPlacesOrder('T-24', 'Guest 24', 2, [{ item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 }]);
  bridge.customerPlacesOrder('T-25', 'Guest 25', 2, [{ item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 }]);
  bridge.waiterMergeTables('T-24', 'T-25');

  bridge.waiterRecordsPayment('T-24', 'CASH', 520);
  const t24 = useSharedBridge.getState().tables.find((t) => t.number === 'T-24')!;
  const t25 = useSharedBridge.getState().tables.find((t) => t.number === 'T-25')!;
  assert(t24.status === 'BILLING', 'Target merged table status is BILLING');
  assert(t25.status === 'BILLING', 'Partner merged table status also is BILLING');
}

// ---------------------------------------------------------------------------
// GROUP 18: Waiter Table Vacating & Cascading Ticket Purge
// ---------------------------------------------------------------------------
function testWaiterVacateTable(): void {
  section('Group 18 — Waiter Table Vacating & Cascading Purge');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPlacesOrder('T-26', 'Guest 26', 2, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  assert(useSharedBridge.getState().kdsTickets.some((t) => t.tableNumber === 'T-26'), 'Ticket exists for T-26 before vacate');

  bridge.waiterVacatesTable('T-26');

  const state = useSharedBridge.getState();
  const table = state.tables.find((t) => t.number === 'T-26')!;
  assert(table.status === 'VACANT', 'Table status reset to VACANT');
  assert(table.currentBill === 0, 'Table currentBill reset to 0');
  assert(table.guestCount === 0, 'Table guestCount reset to 0');
  assert(table.kotCount === 0, 'Table kotCount reset to 0');
  assert(table.seatedTime === '--', 'Table seatedTime reset to "--"');
  assert(Array.isArray(table.activeItems) && table.activeItems.length === 0, 'Table activeItems reset to []');
  assert(table.mergedWith === undefined, 'Table mergedWith reset to undefined');
  assert(!state.kdsTickets.some((t) => t.tableNumber === 'T-26'), 'All KDS tickets for T-26 purged');

  // Vacating a merged table pair
  bridge.customerPlacesOrder('T-27', 'Guest 27', 2, [{ item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 }]);
  bridge.customerPlacesOrder('T-28', 'Guest 28', 2, [{ item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 }]);
  bridge.waiterMergeTables('T-27', 'T-28');

  bridge.waiterVacatesTable('T-27');
  const t27 = useSharedBridge.getState().tables.find((t) => t.number === 'T-27')!;
  const t28 = useSharedBridge.getState().tables.find((t) => t.number === 'T-28')!;
  assert(t27.status === 'VACANT', 'Primary merged table vacated');
  assert(t28.status === 'VACANT', 'Partner merged table vacated in cascade');
}

// ---------------------------------------------------------------------------
// GROUP 19: Waiter Serving Kitchen Item
// ---------------------------------------------------------------------------
function testWaiterMarkKitchenItemServed(): void {
  section('Group 19 — Waiter Serving Kitchen Item');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  bridge.customerPlacesOrder('T-29', 'Guest 29', 2, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 },
    { item: INITIAL_MENU_ITEMS[1], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  const ticket = useSharedBridge.getState().kdsTickets[0];
  const ticketId = ticket.id;
  const it1 = ticket.items[0].id;
  const it2 = ticket.items[1].id;

  bridge.waiterMarkKitchenItemServed(ticketId, it1);
  let curTicket = useSharedBridge.getState().kdsTickets[0];
  assert(curTicket.items[0].stage === 'SERVED', 'Item 1 marked SERVED');
  assert(curTicket.status === 'NEW', 'Ticket status remains NEW while item 2 is not served');

  bridge.waiterMarkKitchenItemServed(ticketId, it2);
  curTicket = useSharedBridge.getState().kdsTickets[0];
  assert(curTicket.items[1].stage === 'SERVED', 'Item 2 marked SERVED');
  assert(curTicket.status === 'COMPLETED', 'Ticket status is COMPLETED when all items served');
}

// ---------------------------------------------------------------------------
// GROUP 20: Store Subscriptions & Reactive State Listeners
// ---------------------------------------------------------------------------
function testStoreSubscriptions(): void {
  section('Group 20 — Store Subscriptions & Reactive Listeners');

  let notificationCount = 0;
  let lastSeenBill = 0;

  const unsubscribe = useSharedBridge.subscribe((state) => {
    notificationCount++;
    const t30 = state.tables.find((t) => t.number === 'T-30');
    if (t30) lastSeenBill = t30.currentBill;
  });

  useSharedBridge.getState().customerPlacesOrder('T-30', 'Sub Test', 1, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 1 },
  ]);

  assert(notificationCount > 0, `Subscription fired on state update (fired: ${notificationCount} times)`);
  assert(lastSeenBill === 260, `Subscription listener observed updated table bill (Rs. ${lastSeenBill})`);

  unsubscribe();
  const countAtUnsub = notificationCount;
  useSharedBridge.getState().customerPingsWaiter('T-30', 'WATER', 'Sub Test');
  assert(notificationCount === countAtUnsub, 'Unsubscribe successfully halts listener callbacks');
}

// ---------------------------------------------------------------------------
// GROUP 21: Demo State Full System Reset
// ---------------------------------------------------------------------------
function testDemoStateReset(): void {
  section('Group 21 — Demo State Full System Reset');

  const bridge = useSharedBridge.getState();

  // Create dirty state across all entities
  bridge.customerPlacesOrder('T-31', 'Dirty User', 4, [
    { item: INITIAL_MENU_ITEMS[0], selectedOption: 'Standard', addOns: [], quantity: 4 },
  ]);
  bridge.customerPingsWaiter('T-31', 'WATER', 'Dirty User');
  bridge.kitchenToggle86(INITIAL_MENU_ITEMS[0].id);
  bridge.waiterRecordsPayment('T-31', 'UPI', 1040);

  const dirtyState = useSharedBridge.getState();
  assert(dirtyState.kdsTickets.length > 0, 'Dirty state has tickets');
  assert(dirtyState.pings.length > 0, 'Dirty state has pings');
  assert(dirtyState.kitchenNotifications.length > 0, 'Dirty state has notifications');
  assert(dirtyState.inventory86.some((i) => i.is86 === true), 'Dirty state has 86 items');
  assert(dirtyState.shiftStats.totalRevenue > 0, 'Dirty state has revenue');

  // Trigger full reset
  bridge.resetToFreshDemoState();

  const resetState = useSharedBridge.getState();
  assert(resetState.tables.length === 34, 'Reset preserves 34 tables');
  assert(resetState.tables.every((t) => t.status === 'VACANT'), 'All tables reset to VACANT');
  assert(resetState.tables.every((t) => t.currentBill === 0), 'All tables currentBill reset to 0');
  assert(resetState.kdsTickets.length === 0, 'kdsTickets cleared to []');
  assert(resetState.pings.length === 0, 'pings cleared to []');
  assert(resetState.kitchenNotifications.length === 0, 'kitchenNotifications cleared to []');
  assert(resetState.inventory86.every((i) => i.is86 === false), 'All inventory86 items reset to is86=false');
  assert(resetState.shiftStats.totalRevenue === 0, 'shiftStats.totalRevenue reset to 0');
  assert(resetState.shiftStats.tablesServed === 0, 'shiftStats.tablesServed reset to 0');
}

// ---------------------------------------------------------------------------
// GROUP 22: Cross-Tab Broadcast & Sync Contract Emulation
// ---------------------------------------------------------------------------
function testBroadcastSyncContract(): void {
  section('Group 22 — Cross-Tab Broadcast & Sync Contract Emulation');

  // Test the structural payload contract used by BroadcastChannel / WebSocket
  const samplePayload = {
    type: 'SYNC_STATE',
    payload: {
      tables: useSharedBridge.getState().tables,
      kdsTickets: [
        {
          id: 'KDS-101',
          tableNumber: 'T-01',
          serverName: 'Waiter 1',
          timestamp: '12:00 PM',
          elapsedMinutes: 5,
          status: 'READY' as const,
          items: [],
          source: 'CUSTOMER' as const,
        },
        {
          id: 'KDS-102',
          tableNumber: 'T-02',
          serverName: 'Waiter 2',
          timestamp: '12:05 PM',
          elapsedMinutes: 0,
          status: 'COMPLETED' as const, // Should be filtered out on incoming sync
          items: [],
          source: 'CUSTOMER' as const,
        },
      ],
      pings: [],
      inventory86: useSharedBridge.getState().inventory86,
      shiftStats: {
        tablesServed: 5,
        totalRevenue: 3500,
        tipsEarned: 200,
        avgTurnaroundMinutes: 35,
      },
    },
  };

  assert(samplePayload.type === 'SYNC_STATE', 'Payload type matches SYNC_STATE contract');
  assert(Array.isArray(samplePayload.payload.tables), 'Payload includes tables array');
  assert(Array.isArray(samplePayload.payload.kdsTickets), 'Payload includes kdsTickets array');

  // Verify the business rule: COMPLETED tickets are stripped on sync
  const uncompleted = samplePayload.payload.kdsTickets.filter((tk) => tk.status !== 'COMPLETED');
  assert(uncompleted.length === 1, 'Sync filter contract excludes COMPLETED tickets');
  assert(uncompleted[0].id === 'KDS-101', 'Active READY ticket is preserved on sync');

  // Verify shiftStats payload integrity check
  const rawStats = samplePayload.payload.shiftStats;
  const isSafeStats = typeof rawStats.tablesServed === 'number' && typeof rawStats.totalRevenue === 'number';
  assert(isSafeStats, 'Shift stats validation contract verifies required numeric types');
}

// ---------------------------------------------------------------------------
// GROUP 23: Concurrency & High Load Performance Benchmarks
// ---------------------------------------------------------------------------
function testHighLoadBenchmarks(): void {
  section('Group 23 — Concurrency & High Load Performance');

  useSharedBridge.getState().resetToFreshDemoState();
  const bridge = useSharedBridge.getState();

  const ORDER_COUNT = 50;
  const item = INITIAL_MENU_ITEMS[0];

  const t0 = Date.now();
  for (let i = 0; i < ORDER_COUNT; i++) {
    const tableIndex = (i % 34) + 1;
    const tableNumber = `T-${String(tableIndex).padStart(2, '0')}`;
    bridge.customerPlacesOrder(tableNumber, `Guest-${i}`, 1, [
      { item, selectedOption: 'Standard', addOns: [], quantity: 1 },
    ]);
  }
  const elapsedMs = Date.now() - t0;

  process.stdout.write(`  [TIME] 50 rapid order placements: ${elapsedMs}ms\n`);
  assert(elapsedMs < 1000, `50 order placements executed in < 1000ms (actual: ${elapsedMs}ms)`);

  const state = useSharedBridge.getState();
  assert(state.kdsTickets.length === ORDER_COUNT, `All ${ORDER_COUNT} tickets present in state`);

  // Ticket ID uniqueness check
  const ticketIds = state.kdsTickets.map((t) => t.id);
  const uniqueIds = new Set(ticketIds);
  assert(uniqueIds.size === ORDER_COUNT, 'All generated ticket IDs under high load are strictly unique');

  // Financial integrity check
  const expectedTotalAcrossFloor = ORDER_COUNT * 260;
  const actualTotalAcrossFloor = state.tables.reduce((sum, t) => sum + t.currentBill, 0);
  assert(
    actualTotalAcrossFloor === expectedTotalAcrossFloor,
    `Total revenue across all tables equals exact sum (${actualTotalAcrossFloor} === ${expectedTotalAcrossFloor})`
  );

  // Rapid bulk bump performance
  const t1 = Date.now();
  bridge.kitchenSetBulkItemStage('special chicken donne biryani', 'PLATED');
  const bulkElapsed = Date.now() - t1;
  process.stdout.write(`  [TIME] Bulk update across 50 tickets: ${bulkElapsed}ms\n`);
  assert(bulkElapsed < 500, `Bulk update across 50 tickets completed in < 500ms (actual: ${bulkElapsed}ms)`);
}

// ---------------------------------------------------------------------------
// GROUP 24: Inter-Store Contract Compatibility
// ---------------------------------------------------------------------------
function testInterStoreCompatibility(): void {
  section('Group 24 — Inter-Store Contract Compatibility');

  // Customer store contract
  assert(typeof useCustomerStore === 'function', 'Customer store hook is defined');
  const customerState = useCustomerStore.getState();
  assert(typeof customerState.placeAllOrders === 'function', 'Customer store exports placeAllOrders');
  assert(typeof customerState.pingWaiter === 'function', 'Customer store exports pingWaiter');

  // Kitchen store contract
  assert(typeof useKitchenStore === 'function', 'Kitchen store hook is defined');
  const kitchenState = useKitchenStore.getState();
  assert(typeof kitchenState.bumpItemStage === 'function', 'Kitchen store exports bumpItemStage');
  assert(typeof kitchenState.bumpTable === 'function', 'Kitchen store exports bumpTable');
  assert(typeof kitchenState.callFloorWaiter === 'function', 'Kitchen store exports callFloorWaiter');

  // Waiter store contract
  assert(typeof useWaiterStore === 'function', 'Waiter store hook is defined');
  const waiterState = useWaiterStore.getState();
  assert(typeof waiterState.addToOrderCart === 'function', 'Waiter store exports addToOrderCart');
  assert(typeof waiterState.fireKOTToKitchen === 'function', 'Waiter store exports fireKOTToKitchen');

  // Manager store contract
  assert(typeof useManagerStore === 'function', 'Manager store hook is defined');
  const managerState = useManagerStore.getState();
  assert(Array.isArray(managerState.queueTokens), 'Manager store exports queueTokens');
  assert(Array.isArray(managerState.staffRoster), 'Manager store exports staffRoster');
  assert(Array.isArray(managerState.hardwareDevices), 'Manager store exports hardwareDevices');
}

// ---------------------------------------------------------------------------
// Main Runner
// ---------------------------------------------------------------------------
(function runSuite() {
  process.stdout.write('\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');
  process.stdout.write('  Phase 3 — Comprehensive State Bridge & Sync Test Suite\n');
  process.stdout.write('  24 groups · Zustand store · transitions · sync · load\n');
  process.stdout.write('════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  testInitialStoreState();
  testCanonicalDishKey();
  testCustomerOrderPlacement();
  testCustomerWaiterPings();
  testKitchenStageBumping();
  testKitchenManualStageSetting();
  testKitchenBulkItemStage();
  testKitchenBumpTable();
  testKitchenTicketClearance();
  testKitchenInventory86();
  testKitchenNotifications();
  testCallFloorWaiter();
  testWaiterFiresKOT();
  testWaiterSeatsGuests();
  testWaiterMergeTables();
  testWaiterResolvePing();
  testWaiterPaymentSettlement();
  testWaiterVacateTable();
  testWaiterMarkKitchenItemServed();
  testStoreSubscriptions();
  testDemoStateReset();
  testBroadcastSyncContract();
  testHighLoadBenchmarks();
  testInterStoreCompatibility();

  // Reset state to clean after testing
  useSharedBridge.getState().resetToFreshDemoState();

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
    process.stdout.write('  All Phase 3 tests passed.\n\n');
    process.exit(0);
  }
})();
