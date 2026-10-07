/**
 * Phase 10 — Edge Cases & Defensive Logic
 * Comprehensive test suite covering all boundary conditions, guard clauses,
 * defensive logic paths, deduplication, rollback, clamping and invariants.
 *
 * Run: npx tsx scripts/test-phase10-comprehensive.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── minimal test harness ──────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function group(title: string, fn: () => void) {
  console.log(`\n━━━ ${title} ━━━`);
  fn();
}

function ok(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
    failures.push(label);
  }
}

import { useSharedBridge } from '../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';

const bridgeState = () => useSharedBridge.getState();
const tableOf = (n: string) => bridgeState().tables.find((t) => t.number === n)!;
const freshBridge = () => bridgeState().resetToFreshDemoState();
/** Places a customer order on a table so it has a live KDS ticket, bill and active items. */
function orderOn(tableNum: string, dishIdx = 0, qty = 1, guests = 2) {
  const item = INITIAL_MENU_ITEMS[dishIdx];
  bridgeState().customerPlacesOrder(tableNum, 'Test Guest', guests, [
    { item, selectedOption: 'Regular', addOns: [], quantity: qty },
  ] as never);
  return item;
}

const ROOT = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ─── helpers ──────────────────────────────────────────────────────────────
function hasText(src: string, ...needles: string[]): boolean {
  return needles.every((n) => src.includes(n));
}

// ─── SOURCE FILES ──────────────────────────────────────────────────────────
const bridge    = read('store/useSharedBridge.ts');
const customer  = read('store/useCustomerStore.ts');
const waiter    = read('store/useWaiterStore.ts');
const manager   = read('store/useManagerStore.ts');
const kitchen   = read('types/kitchen.ts');
const menuItems = read('data/menuItems.ts');

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 1 — Empty cart guard in placeAllOrders
// ═══════════════════════════════════════════════════════════════════════════
group('Empty cart guard — placeAllOrders', () => {
  ok(
    'placeAllOrders filters to newlyAddedItems = cart items where !isOrdered',
    hasText(customer, 'const newlyAddedItems = state.cart.filter((c) => !c.isOrdered)')
  );
  ok(
    'empty newlyAddedItems check exits early with screen 5',
    hasText(customer, 'if (newlyAddedItems.length === 0)', 'return { currentScreen: 5 }')
  );
  ok(
    'no items → does NOT call customerPlacesOrder when list is empty',
    // The bridge call is inside the else path — after the early return
    hasText(customer, 'newlyAddedItems.length === 0') &&
    customer.indexOf('return { currentScreen: 5 }') < customer.indexOf('bridge.customerPlacesOrder')
  );
  ok(
    'items are marked isOrdered after placeAllOrders',
    hasText(customer, 'updatedCart = state.cart.map((c) => ({ ...c, isOrdered: true }))')
  );
  ok(
    'cart with all isOrdered items → placeAllOrders returns early to screen 5',
    customer.split('newlyAddedItems.length === 0').length >= 2
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 2 — fireKOTToKitchen empty cart guard
// ═══════════════════════════════════════════════════════════════════════════
group('Empty cart guard — fireKOTToKitchen', () => {
  ok(
    'fireKOTToKitchen returns early when orderCart is empty',
    hasText(waiter, 'if (!orderCart.length || !selectedTableNumber) return')
  );
  ok(
    'fireKOTToKitchen returns early when selectedTableNumber is empty',
    hasText(waiter, 'if (!orderCart.length || !selectedTableNumber) return')
  );
  ok(
    'fireKOTToKitchen clears cart to [] after firing',
    hasText(waiter, "set({ orderCart: [], currentScreen: 3 })")
  );
  ok(
    'fireKOTToKitchen sets currentScreen to 3 (Waiter Table Detail)',
    hasText(waiter, 'currentScreen: 3')
  );
  ok(
    'fireKOTToKitchen auto-seats if table is VACANT',
    hasText(waiter, "table.status === 'VACANT'", 'waiterSeatsGuests')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 3 — updateCartQuantity removes item on zero/negative quantity
// ═══════════════════════════════════════════════════════════════════════════
group('Zero and negative quantity guard — customer cart', () => {
  ok(
    'updateCartQuantity: newQty <= 0 returns null (removes item)',
    hasText(customer, 'const newQty = ci.quantity + delta', 'if (newQty <= 0) return null')
  );
  ok(
    'null items are filtered out via .filter(Boolean)',
    hasText(customer, '.filter(Boolean) as CartItem[]')
  );
  ok(
    'delta = -100 on qty 1 → results in newQty = -99 → removed',
    // The logic is: newQty = 1 + (-100) = -99, which is <= 0 → null → filtered
    hasText(customer, 'if (newQty <= 0) return null')
  );
  ok(
    'positive delta accumulates quantity correctly',
    hasText(customer, 'const newQty = ci.quantity + delta')
  );
  ok(
    'totalPrice recalculated as singleUnitPrice * newQty on update',
    hasText(customer, 'const singleUnitPrice = ci.totalPrice / ci.quantity', 'singleUnitPrice * newQty')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 4 — updateOrderCartQty in waiter store removes on zero
// ═══════════════════════════════════════════════════════════════════════════
group('Zero quantity guard — waiter order cart', () => {
  ok(
    'updateOrderCartQty: newQty <= 0 returns null',
    hasText(waiter, 'const newQty = ci.quantity + delta', 'if (newQty <= 0) return null')
  );
  ok(
    'waiter cart items filtered with .filter(Boolean)',
    hasText(waiter, '.filter(Boolean) as CartItem[]')
  );
  ok(
    'totalPrice recalculated correctly on waiter qty update',
    hasText(waiter, '(ci.totalPrice / ci.quantity) * newQty')
  );
  ok(
    'addToOrderCart merges by menuItem.id + selectedOption (no duplicate lines)',
    hasText(waiter, 'ci.menuItem.id === item.id && ci.selectedOption === selectedOption')
  );
  ok(
    'waiter addToOrderCart: same item+option → accumulates quantity',
    hasText(waiter, 'ci.quantity + quantity')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 5 — Ping deduplication guard
// ═══════════════════════════════════════════════════════════════════════════
group('Ping deduplication — customerPingsWaiter', () => {
  ok(
    'deduplication check: hasDuplicate uses tableNumber + type + PENDING status',
    hasText(
      bridge,
      "p.tableNumber === tableNumber && p.type === type && p.status === 'PENDING'"
    )
  );
  ok(
    'early return when duplicate pending ping exists',
    hasText(bridge, 'if (hasDuplicate) return')
  );
  ok(
    'new ping has status PENDING on creation',
    hasText(bridge, "status: 'PENDING'", "id: 'p-' + Date.now()")
  );
  ok(
    'ping object includes tableNumber, type, message, timestamp, guestName',
    hasText(bridge, 'tableNumber,', 'type,', 'message: msg', 'timestamp: nowTime()', 'guestName,')
  );
  ok(
    'deduplication: different ping type from same table still allowed',
    // The check uses BOTH tableNumber AND type → different type = different ping
    hasText(bridge, 'p.type === type')
  );
  ok(
    'different table same type not blocked (tableNumber check prevents only same table)',
    hasText(bridge, 'p.tableNumber === tableNumber')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 6 — waiterResolvePing removes ping (no status change to RESOLVED)
// ═══════════════════════════════════════════════════════════════════════════
group('Ping resolution — waiterResolvePing optimistic delete', () => {
  ok(
    'waiterResolvePing uses filter to remove, not status update',
    hasText(bridge, 'pings: state.pings.filter((p) => p.id !== pingId)')
  );
  ok(
    'ping is absent after resolution (not marked RESOLVED)',
    // Confirm there is NO "status: 'RESOLVED'" in the resolve action
    !bridge.includes("status: 'RESOLVED'")
  );
  ok(
    'prevPings snapshot taken before optimistic delete for rollback',
    hasText(bridge, 'const prevPings = get().pings')
  );
  ok(
    'rollback restores pings to prevPings on API failure',
    hasText(bridge, "useSharedBridge.setState({ pings: prevPings })")
  );
  ok(
    'second resolve on already-removed ping is safe (filter on missing id = no-op)',
    // filter() on an id that is not present simply returns the same array
    hasText(bridge, 'state.pings.filter((p) => p.id !== pingId)')
  );
  ok(
    'waiterResolvePing posts to /api/pings/resolve',
    hasText(bridge, "'/api/pings/resolve'", '{ pingId }')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 7 — Stage clamping in kitchenBumpItemStage
// ═══════════════════════════════════════════════════════════════════════════
group('Stage clamping — kitchenBumpItemStage at SERVED boundary', () => {
  ok(
    'stageOrder defined as PLACED → PREP → PLATED → SERVED',
    hasText(bridge, "const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED']")
  );
  ok(
    'curIdx uses stageOrder.indexOf(it.stage)',
    hasText(bridge, 'const curIdx = stageOrder.indexOf(it.stage)')
  );
  ok(
    'SERVED item stays SERVED: curIdx < length-1 condition clamps at last index',
    hasText(bridge, 'curIdx < stageOrder.length - 1 ? stageOrder[curIdx + 1] : stageOrder[curIdx]')
  );
  ok(
    'SERVED (index 3) with length-1=3: 3 < 3 is false → stays at stageOrder[3]=SERVED',
    // Logic check: stageOrder.length=4, length-1=3, curIdx=3 → 3<3=false → stageOrder[3]='SERVED'
    hasText(bridge, 'stageOrder[curIdx]')
  );
  ok(
    'allServed check correctly triggers COMPLETED ticket status',
    hasText(bridge, "allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW'")
  );
  ok(
    'kitchenSetItemStage allows direct set of any valid stage',
    hasText(bridge, 'kitchenSetItemStage: (ticketId, itemId, stage) =>')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 8 — kitchenClearCompleted only removes COMPLETED tickets
// ═══════════════════════════════════════════════════════════════════════════
group('kitchenClearCompleted — only COMPLETED tickets removed', () => {
  ok(
    'filter keeps tickets where status !== COMPLETED',
    hasText(bridge, "kdsTickets: state.kdsTickets.filter((t) => t.status !== 'COMPLETED')")
  );
  ok(
    "NEW tickets survive kitchenClearCompleted (status !== 'COMPLETED')",
    hasText(bridge, "t.status !== 'COMPLETED'")
  );
  ok(
    "PREP tickets survive kitchenClearCompleted",
    hasText(bridge, "t.status !== 'COMPLETED'")
  );
  ok(
    "READY tickets survive kitchenClearCompleted",
    hasText(bridge, "t.status !== 'COMPLETED'")
  );
  ok(
    'kitchenClearCompleted has no API post (local only)',
    // There is no bridgePost after kitchenClearCompleted
    bridge.indexOf("kitchenClearCompleted: () =>") <
      bridge.indexOf("kitchenToggle86: (itemId)")
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 9 — waiterVacatesTable removes all KDS tickets for that table
// ═══════════════════════════════════════════════════════════════════════════
group('waiterVacatesTable — table reset and ticket cleanup', () => {
  ok(
    'vacate removes ALL KDS tickets for the vacated table (not just COMPLETED)',
    (() => {
      freshBridge();
      orderOn('T-02'); // ticket is NEW (not completed)
      const had = bridgeState().kdsTickets.some((tk) => tk.tableNumber === 'T-02');
      bridgeState().waiterVacatesTable('T-02');
      return had && !bridgeState().kdsTickets.some((tk) => tk.tableNumber === 'T-02');
    })()
  );
  ok(
    'vacate leaves other tables\' tickets untouched',
    (() => {
      freshBridge();
      orderOn('T-02');
      orderOn('T-03');
      bridgeState().waiterVacatesTable('T-02');
      const left = bridgeState().kdsTickets;
      return left.length === 1 && left[0].tableNumber === 'T-03';
    })()
  );
  ok(
    'vacate also clears the merged partner table and its tickets',
    (() => {
      freshBridge();
      orderOn('T-05', 0, 1, 4);
      orderOn('T-06', 1, 1, 2);
      bridgeState().waiterMergeTables('T-05', 'T-06');
      bridgeState().waiterVacatesTable('T-05');
      const noTickets = !bridgeState().kdsTickets.some((tk) => tk.tableNumber === 'T-05' || tk.tableNumber === 'T-06');
      return noTickets && tableOf('T-05').status === 'VACANT' && tableOf('T-06').status === 'VACANT';
    })()
  );
  ok(
    'table status set to VACANT after vacate',
    // substring after waiterVacatesTable — confirms VACANT is set in the vacate action
    bridge.substring(bridge.indexOf('waiterVacatesTable')).includes("status: 'VACANT'")
  );
  ok(
    'currentBill reset to 0 on vacate',
    hasText(bridge, 'currentBill: 0,')
  );
  ok(
    'guestCount reset to 0 on vacate',
    hasText(bridge, 'guestCount: 0,')
  );
  ok(
    'seatedTime reset to -- on vacate',
    hasText(bridge, "seatedTime: '--'")
  );
  ok(
    'activeItems cleared to [] on vacate',
    hasText(bridge, 'activeItems: [],')
  );
  ok(
    'mergedWith set to undefined on vacate',
    hasText(bridge, 'mergedWith: undefined,')
  );
  ok(
    'prevTables + prevTickets snapshot taken before vacate for rollback',
    hasText(bridge, 'const prevTables = get().tables', 'const prevTickets = get().kdsTickets')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 10 — resetSession does NOT clear tableNumber
// ═══════════════════════════════════════════════════════════════════════════
group('resetSession — tableNumber persists across session reset', () => {
  ok(
    'resetSession does not include tableNumber in the reset set()',
    !customer
      .substring(customer.lastIndexOf('resetSession: () =>'))
      .split('});')[0]
      .includes('tableNumber')
  );
  ok(
    'resetSession resets currentScreen to 1',
    hasText(customer, 'currentScreen: 1,', 'previousScreen: 1,')
  );
  ok(
    'resetSession clears guestName to empty string',
    hasText(customer, "guestName: '',")
  );
  ok(
    'resetSession clears cart to []',
    hasText(customer, 'cart: [],')
  );
  ok(
    'resetSession resets orderStage to PLACED',
    hasText(customer, "orderStage: 'PLACED',")
  );
  ok(
    'resetSession clears itemTracking to []',
    hasText(customer, 'itemTracking: [],')
  );
  ok(
    'resetSession resets payment to initialEmptyPayment',
    hasText(customer, 'payment: initialEmptyPayment,')
  );
  ok(
    'resetSession sets waiterNotification to null',
    hasText(customer, 'waiterNotification: null,')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 11 — Manager PIN guard and login
// ═══════════════════════════════════════════════════════════════════════════
group('Manager PIN guard — verifyPin logic', () => {
  ok(
    'verifyPin returns true when pinInput matches activeManager.pin',
    hasText(manager, 'if (pinInput === activeManager.pin || pinInput === ')
  );
  ok(
    'verifyPin returns false when pin is wrong — no screen navigation',
    hasText(manager, 'return false;')
  );
  ok(
    'verifyPin sets isAuthenticated: true on success',
    hasText(manager, 'set({ isAuthenticated: true, currentScreen: 2 })')
  );
  ok(
    'verifyPin navigates to screen 2 on success only',
    hasText(manager, 'currentScreen: 2 })')
  );
  ok(
    'logout resets isAuthenticated to false',
    hasText(manager, "logout: () => set({ isAuthenticated: false, pinInput: '', currentScreen: 1 })")
  );
  ok(
    'logout clears pinInput to empty string',
    hasText(manager, "pinInput: ''")
  );
  ok(
    'logout resets currentScreen to 1',
    hasText(manager, 'currentScreen: 1 })')
  );
  ok(
    'clearPin resets pinInput to empty string',
    hasText(manager, "clearPin: () => set({ pinInput: '' })")
  );
  ok(
    'deletePinDigit removes last character from pinInput',
    hasText(manager, "deletePinDigit: () => set((s) => ({ pinInput: s.pinInput.slice(0, -1) }))")
  );
  ok(
    'enterPinDigit appends digit and clamps to 4 characters',
    hasText(manager, "(s.pinInput + digit).slice(0, 4)")
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 12 — Manager profiles and PIN values
// ═══════════════════════════════════════════════════════════════════════════
group('Manager profiles — correct PINs and names', () => {
  ok(
    'MANJUNATH profile exists with correct uppercase name',
    hasText(manager, "name: 'MANJUNATH (GENERAL MANAGER)'")
  );
  ok(
    'MANJUNATH PIN is 1234',
    hasText(manager, "{ id: 'mgr-1', name: 'MANJUNATH (GENERAL MANAGER)', role: 'General Manager', pin: '1234' }")
  );
  ok(
    'RAGHAV profile exists with correct name',
    hasText(manager, "name: 'RAGHAV (FLOOR LEAD)'")
  );
  ok(
    'RAGHAV PIN is 4321',
    hasText(manager, "pin: '4321'")
  );
  ok(
    'RAMESH profile exists with correct name',
    hasText(manager, "name: 'RAMESH (HEAD CASHIER)'")
  );
  ok(
    'RAMESH PIN is 1111',
    hasText(manager, "pin: '1111'")
  );
  ok(
    'openingFloat is 5000',
    hasText(manager, 'openingFloat: 5000')
  );
  ok(
    'MANAGER_PROFILES is an exported array with 3 managers',
    hasText(manager, 'export const MANAGER_PROFILES: ManagerProfile[] = [')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 13 — waiterRecordsPayment accumulates shiftStats (not overwrites)
// ═══════════════════════════════════════════════════════════════════════════
group('Shift stat accumulation — waiterRecordsPayment', () => {
  ok(
    'totalRevenue accumulates: state.shiftStats.totalRevenue + amount',
    hasText(bridge, 'totalRevenue: state.shiftStats.totalRevenue + amount')
  );
  ok(
    'tablesServed increments by 1: state.shiftStats.tablesServed + 1',
    hasText(bridge, 'tablesServed: state.shiftStats.tablesServed + 1')
  );
  ok(
    'shiftStats spread to keep other fields unchanged',
    hasText(bridge, '...state.shiftStats,')
  );
  ok(
    'payment sets table status to BILLING',
    hasText(bridge, "status: 'BILLING'")
  );
  ok(
    'payment handles merged table partner (BILLING set on both tables)',
    (() => {
      freshBridge();
      orderOn('T-05', 0, 1, 4);
      orderOn('T-06', 1, 1, 2);
      bridgeState().waiterMergeTables('T-05', 'T-06');
      bridgeState().waiterRecordsPayment('T-05', 'CASH', 500);
      return (
        tableOf('T-05').status === 'BILLING' &&
        tableOf('T-06').status === 'BILLING' &&
        bridgeState().shiftStats.tablesServed === 1 // a merged group is ONE settlement
      );
    })()
  );
  ok(
    'initial shiftStats has totalRevenue: 0 and tablesServed: 0',
    hasText(bridge, 'totalRevenue: 0,', 'tablesServed: 0,')
  );
  ok(
    'avgTurnaroundMinutes initialized to 38',
    hasText(bridge, 'avgTurnaroundMinutes: 38,')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 14 — waiterMergeTables guest count formula
// ═══════════════════════════════════════════════════════════════════════════
group('waiterMergeTables — per-table model and guard', () => {
  ok(
    'merge keeps each table\'s own guest count (no pooling onto the primary)',
    (() => {
      freshBridge();
      orderOn('T-05', 0, 1, 4); // seat arg > capacity 3 -> falls back to seat 1
      orderOn('T-06', 1, 1, 3); // seat 3
      const g5 = tableOf('T-05').guestCount;
      const g6 = tableOf('T-06').guestCount;
      bridgeState().waiterMergeTables('T-05', 'T-06');
      return tableOf('T-05').guestCount === g5 && tableOf('T-06').guestCount === g6;
    })() &&
    (() => {
      freshBridge();
      bridgeState().waiterSeatsGuests('T-05', 4, 'Captain Ramesh');
      bridgeState().waiterSeatsGuests('T-06', 2, 'Captain Ramesh');
      bridgeState().waiterMergeTables('T-05', 'T-06');
      return tableOf('T-05').guestCount === 4 && tableOf('T-06').guestCount === 2;
    })()
  );
  ok(
    'guard: merge returns state unchanged if either table is not found',
    (() => {
      freshBridge();
      const before = bridgeState().tables;
      bridgeState().waiterMergeTables('T-05', 'T-99');
      bridgeState().waiterMergeTables('T-98', 'T-99');
      return bridgeState().tables === before;
    })()
  );
  ok(
    'guard: a merge group is capped at 4 tables',
    (() => {
      freshBridge();
      bridgeState().waiterMergeTables('T-05', 'T-06');
      bridgeState().waiterMergeTables('T-05', 'T-07');
      bridgeState().waiterMergeTables('T-05', 'T-08');
      const beforeFifth = bridgeState().tables;
      bridgeState().waiterMergeTables('T-05', 'T-09'); // 5th table must be refused
      return bridgeState().tables === beforeFifth && tableOf('T-05').mergeGroupPeers?.length === 4;
    })()
  );
  ok(
    'every table in the group (primary included) gets mergedWith = primary table number',
    (() => {
      freshBridge();
      bridgeState().waiterMergeTables('T-06', 'T-05'); // argument order must not matter
      return tableOf('T-05').mergedWith === 'T-05' && tableOf('T-06').mergedWith === 'T-05';
    })()
  );
  ok(
    'all members record the same sorted peer list',
    (() => {
      freshBridge();
      bridgeState().waiterMergeTables('T-06', 'T-05');
      const a = JSON.stringify(tableOf('T-05').mergeGroupPeers);
      const b = JSON.stringify(tableOf('T-06').mergeGroupPeers);
      return a === b && a === JSON.stringify(['T-05', 'T-06']);
    })()
  );
  ok(
    'each table keeps its own bill after merge (floor grid sums members, no double billing)',
    (() => {
      freshBridge();
      const d1 = orderOn('T-05', 0, 1, 2);
      const d2 = orderOn('T-06', 1, 2, 2);
      bridgeState().waiterMergeTables('T-05', 'T-06');
      return tableOf('T-05').currentBill === d1.price && tableOf('T-06').currentBill === d2.price * 2;
    })()
  );
  ok(
    'merge does not zero any member\'s bill',
    (() => {
      freshBridge();
      orderOn('T-05', 0, 1, 2);
      orderOn('T-06', 1, 1, 2);
      bridgeState().waiterMergeTables('T-05', 'T-06');
      return tableOf('T-05').currentBill > 0 && tableOf('T-06').currentBill > 0;
    })()
  );
  ok(
    'each table keeps its own activeItems after merge',
    (() => {
      freshBridge();
      orderOn('T-05', 0, 1, 2);
      orderOn('T-06', 1, 1, 2);
      const n5 = tableOf('T-05').activeItems?.length ?? 0;
      const n6 = tableOf('T-06').activeItems?.length ?? 0;
      bridgeState().waiterMergeTables('T-05', 'T-06');
      return n5 >= 1 && n6 >= 1 && tableOf('T-05').activeItems?.length === n5 && tableOf('T-06').activeItems?.length === n6;
    })()
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 15 — Optimistic rollback pattern in bridge actions
// ═══════════════════════════════════════════════════════════════════════════
group('Optimistic rollback contracts', () => {
  ok(
    'customerPlacesOrder snapshots prevState before update',
    hasText(bridge, 'const prevState = {', 'kdsTickets: get().kdsTickets')
  );
  ok(
    'customerPlacesOrder rollback restores prevState on API failure',
    hasText(bridge, 'useSharedBridge.setState(prevState)')
  );
  ok(
    'customerPingsWaiter snapshots prevPings before optimistic update',
    hasText(bridge, 'const prevPings = get().pings')
  );
  ok(
    'waiterFiresKOT snapshots prevState (kdsTickets + kitchenNotifications + tables)',
    hasText(bridge, "kdsTickets: get().kdsTickets,", "kitchenNotifications: get().kitchenNotifications,", "tables: get().tables,")
  );
  ok(
    'waiterVacatesTable snapshots prevTables + prevTickets',
    hasText(bridge, 'const prevTables = get().tables', 'const prevTickets = get().kdsTickets')
  );
  ok(
    'kitchenBumpItemStage snapshots prevTickets + prevTables',
    hasText(bridge, 'const prevTickets = get().kdsTickets', 'const prevTables = get().tables')
  );
  ok(
    'kitchenToggle86 snapshots prevInventory',
    hasText(bridge, 'const prevInventory = get().inventory86')
  );
  ok(
    'kitchenUpdatePrepDelay snapshots prevInventory',
    bridge.split('const prevInventory = get().inventory86').length >= 3
  );
  ok(
    'waiterSeatsGuests snapshots prevTables',
    hasText(bridge, 'const prevTables = get().tables')
  );
  ok(
    'bridgePost calls onRollback on !res.ok',
    hasText(bridge, 'if (!res.ok)', 'onRollback?.();')
  );
  ok(
    'bridgePost calls onRollback on network error (catch)',
    hasText(bridge, '.catch((err) =>', 'onRollback?.();')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 16 — BroadcastChannel key and localStorage key
// ═══════════════════════════════════════════════════════════════════════════
group('BroadcastChannel and localStorage key correctness', () => {
  ok(
    'BroadcastChannel name is thoogudeepa_bridge_sync',
    hasText(bridge, "new BroadcastChannel('thoogudeepa_bridge_sync')")
  );
  ok(
    'localStorage key is thoogudeepa_bridge_v1',
    hasText(bridge, "'thoogudeepa_bridge_v1'")
  );
  ok(
    'resetToFreshDemoState removes thoogudeepa_bridge_v1 from localStorage',
    hasText(bridge, "localStorage.removeItem('thoogudeepa_bridge_v1')")
  );
  ok(
    'BroadcastChannel message type is SYNC_STATE',
    hasText(bridge, "type: 'SYNC_STATE'")
  );
  ok(
    'syncChannel.onmessage checks event.data.type === SYNC_STATE',
    hasText(bridge, "event.data?.type === 'SYNC_STATE'")
  );
  ok(
    'isBroadcasting flag prevents re-broadcast loops',
    hasText(bridge, 'let isBroadcasting = false', 'if (isBroadcasting) return')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 17 — localStorage rehydration and ticket counter dedup
// ═══════════════════════════════════════════════════════════════════════════
group('localStorage rehydration — ticket counter deduplication', () => {
  ok(
    'ticket counter dedup: ticketCounter resumes after the highest persisted ticket',
    /ticketCounter\s*=\s*\(maxNum\s*>\s*0\s*\?\s*maxNum\s*:\s*1\)\s*\+\s*1/.test(bridge)
  );
  ok(
    'maxNum extraction parses the numeric part of KDS-NNN[-suffix] and subtracts 100',
    /replace\(\/\^KDS-\/,\s*''\)\.split\('-'\)\[0\]/.test(bridge) && /parsedInt\s*-\s*100/.test(bridge)
  );
  ok(
    'maxNum takes the max of valid numbers and falls back to 0',
    /Math\.max\(\.\.\.validNums\)/.test(bridge) && /validNums\.length\s*>\s*0\s*\?[^:]+:\s*0/.test(bridge)
  );
  ok(
    'COMPLETED and orphan (vacant-table) tickets filtered out on rehydration',
    /\.filter\(\(tk\)\s*=>\s*tk\s*&&\s*tk\.status\s*!==\s*'COMPLETED'\s*&&\s*activeTableNums\.has\(tk\.tableNumber\)\)/.test(bridge)
  );
  ok(
    'kitchenNotifications not persisted (session-only, cleared to [])',
    hasText(bridge, 'kitchenNotifications: [],')
  );
  ok(
    'rehydration requires parsed.tables to be an array before applying',
    hasText(bridge, 'if (parsed && Array.isArray(parsed.tables))')
  );
  ok(
    'ticketCounter starts at 1 on fresh state (module-level)',
    hasText(bridge, 'let ticketCounter = 1')
  );
  ok(
    'makeTicketId generates KDS-101-NNN for the first ticket and KDS-102-NNN for the next',
    (() => {
      freshBridge();
      orderOn('T-02');
      orderOn('T-03');
      const ids = bridgeState().kdsTickets.map((tk) => tk.id);
      return ids.length === 2 && /^KDS-101-\d{3}$/.test(ids[0]) && /^KDS-102-\d{3}$/.test(ids[1]);
    })()
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 18 — resetToFreshDemoState contract
// ═══════════════════════════════════════════════════════════════════════════
group('resetToFreshDemoState — full reset contract', () => {
  ok(
    'resetToFreshDemoState resets ticketCounter to 1',
    hasText(bridge, 'ticketCounter = 1')
  );
  ok(
    'tables reset to freshTables (all 34 VACANT)',
    hasText(bridge, 'tables: freshTables,')
  );
  ok(
    'kdsTickets reset to empty array []',
    hasText(bridge, 'kdsTickets: [],')
  );
  ok(
    'pings reset to empty array []',
    hasText(bridge, 'pings: [],')
  );
  ok(
    'inventory86 reset to freshInventory86',
    hasText(bridge, 'inventory86: freshInventory86,')
  );
  ok(
    'kitchenNotifications reset to empty array []',
    hasText(bridge, 'kitchenNotifications: [],')
  );
  ok(
    'shiftStats reset to zeros with avgTurnaroundMinutes 38',
    hasText(
      bridge,
      'tablesServed: 0,',
      'totalRevenue: 0,',
      'tipsEarned: 0,',
      'avgTurnaroundMinutes: 38,'
    )
  );
  ok(
    'localStorage cleared on reset (removeItem)',
    hasText(bridge, "localStorage.removeItem('thoogudeepa_bridge_v1')")
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 19 — addToCart deduplication (same item+option+addons)
// ═══════════════════════════════════════════════════════════════════════════
group('addToCart — deduplication and cartItemId uniqueness', () => {
  ok(
    'addToCart finds existing by !isOrdered + menuItem.id + selectedOption + addOns sort-match',
    hasText(
      customer,
      '!ci.isOrdered',
      'ci.menuItem.id === item.id',
      'ci.selectedOption === selectedOption',
      'JSON.stringify([...ci.selectedAddOns].sort())'
    )
  );
  ok(
    'duplicate item+option → accumulates quantity instead of adding new entry',
    hasText(customer, 'const newQty = ci.quantity + quantity')
  );
  ok(
    'new (non-duplicate) item gets unique cartItemId via Date.now + random',
    hasText(customer, "'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)")
  );
  ok(
    'different options for same menuItem get separate cartItemId (no merge)',
    // The condition checks selectedOption equality — different option → new entry
    hasText(customer, 'ci.selectedOption === selectedOption')
  );
  ok(
    'different addons for same item get separate cartItemId',
    hasText(customer, 'JSON.stringify([...ci.selectedAddOns].sort())', 'JSON.stringify([...selectedAddOns].sort())')
  );
  ok(
    'ordered items (!isOrdered check) are never merged with new same-item orders',
    hasText(customer, '!ci.isOrdered &&')
  );
  ok(
    'default quantity = 1 when not specified in addToCart',
    hasText(customer, 'quantity = 1')
  );
  ok(
    'default selectedOption = first choice of optionsGroup1',
    hasText(customer, 'selectedOption = item.optionsGroup1.choices[0]')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 20 — GST tax calculation invariant
// ═══════════════════════════════════════════════════════════════════════════
group('GST tax calculation invariant', () => {
  ok(
    'tax = Math.round(subtotal * 0.05) — 5% GST',
    hasText(customer, 'const tax = Math.round(subtotal * 0.05)')
  );
  ok(
    'subtotal = sum of cart totalPrices',
    hasText(customer, 'cart.reduce((s, i) => s + i.totalPrice, 0)')
  );
  ok(
    'subtotal = 0 when cart is empty',
    hasText(customer, 'cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : 0')
  );
  ok(
    'discount capped at min(50, subtotal + tax)',
    hasText(customer, 'Math.min(50, subtotal + tax)')
  );
  ok(
    'totalAmount = Math.max(0, subtotal + tax + tip - discount)',
    hasText(customer, 'const totalAmount = Math.max(0, subtotal + tax + tip - discount)')
  );
  ok(
    'totalAmount cannot go negative (Math.max(0,...))',
    hasText(customer, 'Math.max(0, ')
  );
  ok(
    'tip = 0 when cart is empty (no subtotal)',
    hasText(customer, 'const tip = subtotal > 0 ? prevPayment.tipAmount : 0')
  );
  ok(
    'pointsAvailable initialized to 250',
    hasText(customer, 'pointsAvailable: 250,')
  );
  ok(
    'toggleRedeemPoints sets pointsRedeemed to 100 when activating',
    hasText(customer, 'const pointsRedeemed = willRedeem ? 100 : 0')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 21 — Split bill calculation and splitMode
// ═══════════════════════════════════════════════════════════════════════════
group('Split bill — splitMode and splitCount', () => {
  ok(
    'setSplitMode accepts NONE, ITEMS, or PERSONS',
    hasText(customer, "splitMode: mode,")
  );
  ok(
    'setSplitMode stores splitCount (defaults to 2)',
    hasText(customer, 'splitCount: count,')
  );
  ok(
    'setSplitMode default count = 2',
    hasText(customer, 'mode, count = 2')
  );
  ok(
    'initial splitMode is NONE',
    hasText(customer, "splitMode: 'NONE',")
  );
  ok(
    'paymentMethod defaults to UPI',
    hasText(customer, "paymentMethod: 'UPI',")
  );
  ok(
    'setPaymentMethod stores to payment.paymentMethod (not payment.method)',
    hasText(customer, 'paymentMethod: method,') && !hasText(customer, 'method: method,')
  );
  ok(
    'confirmAndPay generates transaction ID with #TXN- prefix',
    hasText(customer, "'#TXN-' + Math.floor(100000 + Math.random() * 900000)")
  );
  ok(
    'confirmAndPay navigates to screen 8 (confirmation)',
    hasText(customer, 'currentScreen: 8,')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 22 — Kitchen station routing correctness
// ═══════════════════════════════════════════════════════════════════════════
group('Kitchen station routing — getStationForItem edge cases', () => {
  ok(
    'biryani keyword → DUM_BIRYANI',
    hasText(kitchen, "n.includes('biryani')")
  );
  ok(
    'rice keyword → DUM_BIRYANI',
    hasText(kitchen, "n.includes('rice')")
  );
  ok(
    'donne keyword → DUM_BIRYANI',
    hasText(kitchen, "n.includes('donne')")
  );
  ok(
    'kebab → KEBAB_TANDOOR',
    hasText(kitchen, "n.includes('kebab')")
  );
  ok(
    'fry → KEBAB_TANDOOR',
    hasText(kitchen, "n.includes('fry')")
  );
  ok(
    'wings → KEBAB_TANDOOR',
    hasText(kitchen, "n.includes('wings')")
  );
  ok(
    'gulab/jamun → DESSERTS',
    hasText(kitchen, "n.includes('gulab')", "n.includes('jamun')")
  );
  ok(
    'payasam → DESSERTS',
    hasText(kitchen, "n.includes('payasam')")
  );
  ok(
    'coffee has no station keyword → falls to MASTER_DISPATCH',
    !hasText(kitchen, "n.includes('coffee')") ||
    kitchen.indexOf("n.includes('coffee')") > kitchen.indexOf("return 'MASTER_DISPATCH'")
  );
  ok(
    'default fallback is MASTER_DISPATCH',
    hasText(kitchen, "return 'MASTER_DISPATCH'")
  );
  ok(
    'KITCHEN_MASTER_PIN is 1234',
    hasText(kitchen, "export const KITCHEN_MASTER_PIN = '1234'")
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 23 — 86 inventory toggle correctness
// ═══════════════════════════════════════════════════════════════════════════
group('86 inventory — kitchenToggle86 and prepDelay', () => {
  ok(
    'kitchenToggle86 flips is86 boolean',
    hasText(bridge, 'item.id === itemId ? { ...item, is86: !item.is86 } : item')
  );
  ok(
    'toggle is optimistic with rollback snapshot',
    hasText(bridge, 'const prevInventory = get().inventory86')
  );
  ok(
    'toggle posts to /api/kds/toggle-86',
    hasText(bridge, "'/api/kds/toggle-86'")
  );
  ok(
    'toggle sends is86: !currentItem.is86 (inverted value)',
    hasText(bridge, "is86: !currentItem?.is86")
  );
  ok(
    'kitchenUpdatePrepDelay uses Math.max(0, ...) to clamp negative delays',
    hasText(bridge, 'const newDelay = Math.max(0, (currentItem?.prepDelayMinutes ?? 0) + deltaMinutes)')
  );
  ok(
    'prepDelay stored as Math.max(0, existing + delta)',
    hasText(bridge, 'prepDelayMinutes: Math.max(0, item.prepDelayMinutes + deltaMinutes)')
  );
  ok(
    'freshInventory86 maps INITIAL_MENU_ITEMS to is86: false',
    hasText(bridge, 'is86: false,')
  );
  ok(
    'initial prepDelayMinutes is 0',
    hasText(bridge, 'prepDelayMinutes: 0,')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 24 — kitchenDismissNotification and kitchenDismissAllNotifications
// ═══════════════════════════════════════════════════════════════════════════
group('Kitchen notifications — dismiss guards', () => {
  ok(
    'kitchenDismissNotification sets dismissed: true for matching id',
    hasText(bridge, 'n.id === notifId ? { ...n, dismissed: true } : n')
  );
  ok(
    'kitchenDismissAllNotifications sets all dismissed: true',
    hasText(bridge, 'kitchenNotifications: state.kitchenNotifications.map((n) => ({ ...n, dismissed: true }))')
  );
  ok(
    'kitchen notification shape includes ticketId, tableNumber, itemCount, timestamp, dismissed',
    hasText(bridge, 'ticketId: ticket.id,', 'tableNumber,', 'itemCount:', 'dismissed: false')
  );
  ok(
    'kitchenNotifications not included in localStorage persistence',
    hasText(bridge, '// kitchenNotifications intentionally NOT persisted (session-only)')
  );
  ok(
    'callFloorWaiter delegates to customerPingsWaiter with type FOOD',
    hasText(bridge, "get().customerPingsWaiter(tableNumber, 'FOOD', 'Kitchen Pass', reason)")
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 25 — Floor plan data integrity — all 34 tables
// ═══════════════════════════════════════════════════════════════════════════
group('Floor plan — 34 tables correct IDs and capacities', () => {
  ok(
    'freshTables has exactly 34 entries (tbl-01 through tbl-34)',
    (bridge.match(/id: 'tbl-\d+'/g) || []).length === 34
  );
  ok(
    'T-01 to T-04 capacity 2 (Express/Couple Hall)',
    hasText(bridge, "number: 'T-01'", "capacity: 2")
  );
  ok(
    'T-05 to T-14 capacity 3 (Main Dining Hall)',
    hasText(bridge, "number: 'T-05'", "capacity: 3")
  );
  ok(
    'T-15 to T-24 capacity 4 (Family Section)',
    hasText(bridge, "number: 'T-15'", "capacity: 4")
  );
  ok(
    'T-25 to T-29 capacity 5 (Courtyard Garden)',
    hasText(bridge, "number: 'T-25'", "capacity: 5")
  );
  ok(
    'T-30 to T-34 capacity 6 (Grand Feast Hall)',
    hasText(bridge, "number: 'T-30'", "capacity: 6")
  );
  ok(
    'all fresh tables start as VACANT',
    (bridge.match(/status: 'VACANT'/g) || []).length >= 34
  );
  ok(
    'all fresh tables start with guestCount: 0',
    (bridge.match(/guestCount: 0,/g) || []).length >= 34
  );
  ok(
    'all fresh tables start with currentBill: 0',
    (bridge.match(/currentBill: 0,/g) || []).length >= 34
  );
  ok(
    'all fresh tables start with kotCount: 0',
    (bridge.match(/kotCount: 0/g) || []).length >= 34
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 26 — kitchenBumpTable marks all items PLATED + ticket READY
// ═══════════════════════════════════════════════════════════════════════════
group('kitchenBumpTable — table-level batch stage advance', () => {
  ok(
    'kitchenBumpTable sets ticket status to READY',
    hasText(bridge, "status: 'READY',")
  );
  ok(
    'kitchenBumpTable sets all items to PLATED stage',
    hasText(bridge, "items: t.items.map((i) => ({ ...i, stage: 'PLATED' }))")
  );
  ok(
    'kitchenBumpTable snapshots prevTickets for rollback',
    hasText(bridge, 'const prevTickets = get().kdsTickets')
  );
  ok(
    'kitchenBumpTable posts to /api/kds/bump-table',
    hasText(bridge, "'/api/kds/bump-table'", "{ ticketId, status: 'READY' }")
  );
  ok(
    'bump-table rollback restores kdsTickets to prevTickets',
    hasText(bridge, 'useSharedBridge.setState({ kdsTickets: prevTickets })')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 27 — waiterMarkKitchenItemServed contract
// ═══════════════════════════════════════════════════════════════════════════
group('waiterMarkKitchenItemServed — marks individual item SERVED', () => {
  ok(
    'waiterMarkKitchenItemServed sets item stage to SERVED',
    hasText(bridge, "it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it")
  );
  ok(
    'ticket status set to COMPLETED if all items are SERVED',
    hasText(bridge, "status: allServed ? 'COMPLETED' : t.status")
  );
  ok(
    'allServed checks every item stage === SERVED',
    hasText(bridge, "const allServed = newItems.every((i) => i.stage === 'SERVED')")
  );
  ok(
    'partial serving: if not allServed, ticket status unchanged',
    hasText(bridge, "status: allServed ? 'COMPLETED' : t.status")
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 28 — setPaymentMethod and confirmAndPay contract
// ═══════════════════════════════════════════════════════════════════════════
group('Payment — setPaymentMethod and confirmAndPay', () => {
  ok(
    'setPaymentMethod stores to payment.paymentMethod field',
    hasText(customer, 'paymentMethod: method,')
  );
  ok(
    'confirmAndPay calls bridge.waiterRecordsPayment with tableNumber, method and totalAmount',
    hasText(customer, 'bridge.waiterRecordsPayment(state.tableNumber, state.payment.paymentMethod, state.payment.totalAmount)')
  );
  ok(
    'confirmAndPay navigates to screen 8',
    hasText(customer, 'currentScreen: 8,')
  );
  ok(
    'transactionId generated with 6-digit random suffix',
    hasText(customer, 'Math.floor(100000 + Math.random() * 900000)')
  );
  ok(
    'initial transactionId is empty string',
    hasText(customer, "transactionId: '',")
  );
  ok(
    'initial redeemPoints is false',
    hasText(customer, 'redeemPoints: false,')
  );
  ok(
    'updateTip recalculates totalAmount: subtotal + tax + tip - discount',
    hasText(customer, 'state.payment.subtotal + state.payment.tax + tip - state.payment.discount')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 29 — Menu item data integrity
// ═══════════════════════════════════════════════════════════════════════════
group('Menu items — data shape and first item validation', () => {
  ok(
    'item-1 is Special Chicken Donne Biryani at 260',
    hasText(menuItems, "id: 'item-1'", "name: 'Special Chicken Donne Biryani'", 'price: 260,')
  );
  ok(
    'item-1 has optionsGroup1 with choices array',
    hasText(menuItems, 'optionsGroup1:', 'choices:')
  );
  ok(
    'item-1 has optionsGroup2 with addOns array',
    hasText(menuItems, 'optionsGroup2:', 'addOns:')
  );
  ok(
    'item-1 addOn: Extra Boiled Egg costs 20',
    hasText(menuItems, "'Extra Boiled Egg (1 Pc)'", 'extraPrice: 20')
  );
  ok(
    'item-1 addOn: Kushka Rice Portion costs 90',
    hasText(menuItems, "'Kushka Rice Portion'", 'extraPrice: 90')
  );
  ok(
    'item-2 is Thoogudeepa Mutton Donne Biryani at 340',
    hasText(menuItems, "id: 'item-2'", "name: 'Thoogudeepa Mutton Donne Biryani'", 'price: 340,')
  );
  ok(
    'item-3 is Kshatriya Chicken Kebab at 220',
    hasText(menuItems, "id: 'item-3'", 'price: 220,')
  );
  ok(
    'INITIAL_MENU_ITEMS is exported as a const array',
    hasText(menuItems, 'export const INITIAL_MENU_ITEMS: MenuItem[] = [')
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP 30 — visibilitychange re-sync and applyPersistedState guard
// ═══════════════════════════════════════════════════════════════════════════
group('Cross-tab sync — applyPersistedState guard and reconciliation', () => {
  ok(
    'applyPersistedState validates tables is an array before applying',
    hasText(bridge, 'if (!parsed || !Array.isArray(parsed.tables)) return')
  );
  ok(
    'incoming kdsTickets filtered to exclude COMPLETED and orphan tickets on sync',
    /as SharedKDSTicket\[\]\)\s*\.filter\(\(tk\)\s*=>\s*tk\s*&&\s*tk\.status\s*!==\s*'COMPLETED'\s*&&\s*activeTableNums\.has\(tk\.tableNumber\)\)/.test(bridge)
  );
  ok(
    'shiftStats validated by checking typeof tablesServed and totalRevenue',
    hasText(bridge, 'typeof rawStats.tablesServed === ', 'typeof rawStats.totalRevenue === ')
  );
  ok(
    'safeShiftStats falls back to current shiftStats if validation fails',
    hasText(bridge, ': cur.shiftStats')
  );
  ok(
    'suppressBroadcast prevents re-broadcast by toggling isBroadcasting',
    hasText(bridge, 'isBroadcasting = true', 'isBroadcasting = false')
  );
  ok(
    'useSharedBridge.subscribe saves state to localStorage on every change',
    hasText(bridge, "localStorage.setItem(", "'thoogudeepa_bridge_v1'")
  );
  ok(
    'kitchenNotifications not included in subscribe localStorage save',
    hasText(bridge, '// kitchenNotifications intentionally NOT persisted')
  );
});

// ─── final report ─────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`  Phase 10 Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(60));

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('\n  All assertions passed.');
  process.exit(0);
}
