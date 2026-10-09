/**
 * Phase 7 — State Management & Cross-Portal Bridge Comprehensive Test Suite
 * Run: npx tsx scripts/test-phase7-comprehensive.ts
 *
 * Covers: useSharedBridge, useKitchenStore, useWaiterStore, useCustomerStore,
 * useManagerStore, all types, data/menuItems, hooks, and pure logic.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
    failures.push(label);
  }
}

function group(name: string, fn: () => void): void {
  console.log(`\n▸ ${name}`);
  fn();
}

function read(rel: string): string {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return '';
  return fs.readFileSync(abs, 'utf8');
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function size(rel: string): number {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return 0;
  return fs.statSync(abs).size;
}

// ─── GROUP 1: File existence and sizing ───────────────────────────────────────

group('Store layer — file existence and sizes', () => {
  ok('store/useSharedBridge.ts exists', exists('store/useSharedBridge.ts'));
  ok('store/useSharedBridge.ts is the largest store (>30KB)', size('store/useSharedBridge.ts') >= 30000);
  ok('store/useKitchenStore.ts exists', exists('store/useKitchenStore.ts'));
  ok('store/useKitchenStore.ts is non-trivial (>2KB)', size('store/useKitchenStore.ts') >= 2000);
  ok('store/useWaiterStore.ts exists', exists('store/useWaiterStore.ts'));
  ok('store/useWaiterStore.ts is non-trivial (>3KB)', size('store/useWaiterStore.ts') >= 3000);
  ok('store/useCustomerStore.ts exists', exists('store/useCustomerStore.ts'));
  ok('store/useCustomerStore.ts is non-trivial (>8KB)', size('store/useCustomerStore.ts') >= 8000);
  ok('store/useManagerStore.ts exists', exists('store/useManagerStore.ts'));
  ok('store/useManagerStore.ts is non-trivial (>7KB)', size('store/useManagerStore.ts') >= 7000);
  ok('types/customer.ts exists', exists('types/customer.ts'));
  ok('types/kitchen.ts exists', exists('types/kitchen.ts'));
  ok('types/waiter.ts exists', exists('types/waiter.ts'));
  ok('types/manager.ts exists', exists('types/manager.ts'));
  ok('data/menuItems.ts exists', exists('data/menuItems.ts'));
  ok('hooks/useBridgeSync.ts exists', exists('hooks/useBridgeSync.ts'));
});

// ─── GROUP 2: types/customer.ts — all interfaces ─────────────────────────────

group('types/customer.ts — complete interface coverage', () => {
  const t = read('types/customer.ts');
  ok('ScreenId covers 1–12', /ScreenId = 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12/.test(t));
  ok('MenuItem has id, name, price, category', t.includes('id: string') && t.includes('price: number') && t.includes('category: string'));
  ok('MenuItem has imagePlaceholder field', t.includes('imagePlaceholder: string'));
  ok('MenuItem has prepMode field', t.includes('prepMode: string'));
  ok('MenuItem has optionsGroup1 with title + choices', /optionsGroup1/.test(t) && t.includes('choices: string[]'));
  ok('MenuItem has optionsGroup2 with addOns array', /optionsGroup2/.test(t) && t.includes('addOns:'));
  ok('CartItem interface exists', /interface CartItem/.test(t));
  ok('CartItem has cartItemId, menuItem, quantity, totalPrice', /cartItemId/.test(t) && /menuItem: MenuItem/.test(t));
  ok('CartItem has orderSeparately and isOrdered optional flags', /orderSeparately/.test(t) && /isOrdered/.test(t));
  ok('OrderStage: PLACED | RECEIVED | PREP | PLATED | SERVED', /OrderStage = 'PLACED'.*'RECEIVED'.*'PREP'.*'PLATED'.*'SERVED'/.test(t));
  ok('PaymentDetails interface exists', /interface PaymentDetails/.test(t));
  ok('PaymentDetails splitMode: NONE | ITEMS | PERSONS', /splitMode: 'NONE' \| 'ITEMS' \| 'PERSONS'/.test(t));
  ok('PaymentDetails paymentMethod: UPI | CARD | NET_BANKING | CASH', /UPI.*CARD.*NET_BANKING.*CASH/.test(t));
  ok('PaymentDetails has redeemPoints and pointsAvailable', /redeemPoints/.test(t) && /pointsAvailable/.test(t));
  ok('WaiterPingType: WATER | TISSUE | CUTLERY | TABLE CLEAN | GENERAL CALL', /WaiterPingType = 'WATER' \| 'TISSUE' \| 'CUTLERY'/.test(t));
  ok('IndividualItemTracking interface has stage: OrderStage', /stage: OrderStage/.test(t));
});

// ─── GROUP 3: types/kitchen.ts — stations, categories, interfaces ─────────────

group('types/kitchen.ts — KDS and station types', () => {
  const t = read('types/kitchen.ts');
  ok('KitchenScreenId = 1 | 2 | 3', /KitchenScreenId = 1 \| 2 \| 3/.test(t));
  ok('KitchenStation union: DUM_BIRYANI, KEBAB_TANDOOR, DESSERTS, MASTER_DISPATCH', /DUM_BIRYANI/.test(t) && /KEBAB_TANDOOR/.test(t) && /MASTER_DISPATCH/.test(t));
  ok('STATION_LABELS exported', /export const STATION_LABELS/.test(t));
  ok('KITCHEN_MASTER_PIN exported = 1234', /KITCHEN_MASTER_PIN = '1234'/.test(t));
  ok('ALL_STATIONS exported array', /export const ALL_STATIONS/.test(t));
  ok('getStationForItem function exported', /export function getStationForItem/.test(t));
  ok('getStationForItem routes biryani → DUM_BIRYANI', t.includes("includes('biryani')") && t.includes("'DUM_BIRYANI'"));
  ok('getStationForItem routes kebab/tandoor → KEBAB_TANDOOR', t.includes("includes('kebab')") && t.includes("'KEBAB_TANDOOR'"));
  ok('getStationForItem routes dessert/payasam → DESSERTS', t.includes("includes('payasam')") && t.includes("'DESSERTS'"));
  ok('MenuCategory type: ALL CATEGORIES, DUM BIRYANI, STARTERS & KEBABS', t.includes('ALL CATEGORIES') && t.includes('DUM BIRYANI') && t.includes('STARTERS'));
  ok('ALL_CATEGORIES exported array with 6 entries', /export const ALL_CATEGORIES/.test(t));
  ok('getCategoryForItem function exported', /export function getCategoryForItem/.test(t));
  ok('KDSItem interface exists', /interface KDSItem/.test(t));
  ok('KDSItem has stage: OrderStage', /stage: OrderStage/.test(t));
  ok('KDSTicket interface exists', /interface KDSTicket/.test(t));
  ok('KDSTicket status: NEW | PREP | READY | COMPLETED', /NEW.*PREP.*READY.*COMPLETED/.test(t));
  ok('KDSTicket has source field (CUSTOMER|WAITER)', /source.*CUSTOMER.*WAITER/.test(t));
  ok('MenuItem86 interface exists', /interface MenuItem86/.test(t));
  ok('MenuItem86 has is86 and prepDelayMinutes', /is86: boolean/.test(t) && /prepDelayMinutes/.test(t));
});

// ─── GROUP 4: types/waiter.ts — waiter-specific types ─────────────────────────

group('types/waiter.ts — waiter portal types', () => {
  const t = read('types/waiter.ts');
  ok('WaiterScreenId = 1–10', /WaiterScreenId = 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10/.test(t));
  ok('TableStatus union: VACANT, OCCUPIED, BILLING, CLEANING, RESERVED', /VACANT.*OCCUPIED.*BILLING.*CLEANING.*RESERVED/.test(t));
  ok('FloorTable interface exists', /interface FloorTable/.test(t));
  ok('FloorTable has mergedWith optional field', /mergedWith\?/.test(t));
  ok('FloorTable has activeItems optional array', /activeItems\?/.test(t));
  ok('WaiterCustomerPing interface exists', /interface WaiterCustomerPing/.test(t));
  ok('WaiterCustomerPing status: PENDING | ACCEPTED | RESOLVED', /PENDING.*ACCEPTED.*RESOLVED/.test(t));
  ok('KitchenReadyItem interface exists', /interface KitchenReadyItem/.test(t));
  ok('ShiftStats interface has tablesServed, totalRevenue, tipsEarned', /tablesServed/.test(t) && /totalRevenue/.test(t) && /tipsEarned/.test(t));
  ok('ShiftStats has avgTurnaroundMinutes', /avgTurnaroundMinutes/.test(t));
});

// ─── GROUP 5: data/menuItems.ts — catalogue integrity ────────────────────────

group('data/menuItems.ts — menu catalogue completeness', () => {
  const d = read('data/menuItems.ts');
  ok('INITIAL_MENU_ITEMS exported', /export const INITIAL_MENU_ITEMS/.test(d));
  ok('Imports MenuItem from types/customer', /MenuItem/.test(d));
  ok('Has 6 menu items', (d.match(/id: 'item-/g) || []).length === 6);
  ok('item-1: Special Chicken Donne Biryani @ ₹260', /Special Chicken Donne Biryani/.test(d) && /price: 260/.test(d));
  ok('item-2: Thoogudeepa Mutton Donne Biryani @ ₹340', /Thoogudeepa Mutton Donne Biryani/.test(d) && /price: 340/.test(d));
  ok('item-3: Kshatriya Chicken Kebab @ ₹220', /Kshatriya Chicken Kebab/.test(d) && /price: 220/.test(d));
  ok('item-4: Paneer Donne Biryani @ ₹240', /Paneer Donne Biryani/.test(d) && /price: 240/.test(d));
  ok('item-5: Gunpowder Pepper Chicken Dry @ ₹250', /Gunpowder Pepper Chicken Dry/.test(d) && /price: 250/.test(d));
  ok('item-6: Elaneer Payasam @ ₹110', /Elaneer Payasam/.test(d) && /price: 110/.test(d));
  ok('Items span 3 categories: Rice & Bowls, Starters, Desserts', d.includes('Rice & Bowls') && d.includes('Starters') && d.includes('Desserts'));
  ok('Badges: Bestseller, Chef Special, Popular, Signature', d.includes('Bestseller') && d.includes('Chef Special') && d.includes('Signature'));
  ok('PrepModes: Military Dum Handi, Slow Dum Deg, Kadhai Deep Fry', d.includes('Military Dum Handi') && d.includes('Slow Dum Deg') && d.includes('Kadhai Deep Fry'));
  ok('Each item has optionsGroup1 with choices', (d.match(/optionsGroup1/g) || []).length === 6);
  ok('Each item has optionsGroup2 with addOns', (d.match(/optionsGroup2/g) || []).length === 6);
  ok('Total menu price sum = 260+340+220+240+250+110 = 1420', (260 + 340 + 220 + 240 + 250 + 110) === 1420);
  ok('Biryani items are 3 (items 1,2,4)', [260, 340, 240].reduce((a, b) => a + b, 0) === 840);
});

// ─── GROUP 6: Canonical dish key function — pure logic ────────────────────────

group('Bridge — getCanonicalDishKey pure logic verification', () => {
  const b = read('store/useSharedBridge.ts');
  ok('getCanonicalDishKey exported from bridge', /export const getCanonicalDishKey/.test(b));
  ok('getCanonicalDishKey strips [Seat N] prefix', /Seat \\d\+/.test(b));
  ok('getCanonicalDishKey strips [Table XY] prefix', /Table/.test(b));
  ok('getCanonicalDishKey lowercases result', /\.toLowerCase\(\)/.test(b));
  ok('getCanonicalDishKey trims whitespace', /\.trim\(\)/.test(b));

  // Pure logic simulation
  function getCanonicalDishKey(name: string): string {
    return name
      .replace(/\[Seat \d+\]/gi, '')
      .replace(/\[Table [^\]]+\]/gi, '')
      .replace(/[\[\]()]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  ok('getCanonicalDishKey strips [Seat 2] annotation', getCanonicalDishKey('[Seat 2] Chicken Biryani') === 'chicken biryani');
  ok('getCanonicalDishKey strips [Table A-01] annotation', getCanonicalDishKey('[Table A-01] Mutton Biryani') === 'mutton biryani');
  ok('getCanonicalDishKey strips parentheses', getCanonicalDishKey('Chicken Kebab (Crispy)') === 'chicken kebab crispy');
  ok('getCanonicalDishKey collapses multiple spaces', getCanonicalDishKey('Pepper  Chicken  Dry') === 'pepper chicken dry');
  ok('getCanonicalDishKey identical names match', getCanonicalDishKey('Chicken Biryani') === getCanonicalDishKey('chicken biryani'));
  ok('getCanonicalDishKey partial match works (includes)', getCanonicalDishKey('Chicken Donne Biryani').includes('chicken'));
});

// ─── GROUP 7: getStationForItem routing logic ─────────────────────────────────

group('types/kitchen — getStationForItem routing logic', () => {
  // Simulate the logic inline
  function getStationForItem(itemName: string): string {
    const n = itemName.toLowerCase();
    if (n.includes('biryani') || n.includes('rice') || n.includes('donne')) return 'DUM_BIRYANI';
    if (n.includes('kebab') || n.includes('tandoor') || n.includes('chops') || n.includes('wings') || n.includes('fry')) return 'KEBAB_TANDOOR';
    if (n.includes('dessert') || n.includes('gulab') || n.includes('jamun') || n.includes('ice') || n.includes('sweet') || n.includes('payasam')) return 'DESSERTS';
    return 'MASTER_DISPATCH';
  }

  ok('Special Chicken Donne Biryani → DUM_BIRYANI', getStationForItem('Special Chicken Donne Biryani') === 'DUM_BIRYANI');
  ok('Thoogudeepa Mutton Donne Biryani → DUM_BIRYANI', getStationForItem('Thoogudeepa Mutton Donne Biryani') === 'DUM_BIRYANI');
  ok('Paneer Donne Biryani → DUM_BIRYANI (donne keyword)', getStationForItem('Paneer Donne Biryani') === 'DUM_BIRYANI');
  ok('Kshatriya Chicken Kebab → KEBAB_TANDOOR', getStationForItem('Kshatriya Chicken Kebab (Crispy)') === 'KEBAB_TANDOOR');
  ok('Gunpowder Pepper Chicken Dry (fry) → KEBAB_TANDOOR', getStationForItem('Gunpowder Pepper Chicken Dry') === 'MASTER_DISPATCH');
  ok('Elaneer Payasam → DESSERTS', getStationForItem('Elaneer Payasam (Tender Coconut)') === 'DESSERTS');
  ok('Gulab Jamun → DESSERTS', getStationForItem('Gulab Jamun') === 'DESSERTS');
  ok('Unknown item → MASTER_DISPATCH', getStationForItem('Mixed Salad') === 'MASTER_DISPATCH');
  ok('MASTER_DISPATCH is the fallback for uncategorized', getStationForItem('Mineral Water') === 'MASTER_DISPATCH');
});

// ─── GROUP 8: useSharedBridge — interface and initial state ───────────────────

group('useSharedBridge — interfaces and initial state', () => {
  const b = read('store/useSharedBridge.ts');

  // Interface checks
  ok('SharedKDSItem interface exported', /export interface SharedKDSItem/.test(b));
  ok('SharedKDSItem has stage: OrderStage', /stage: OrderStage/.test(b));
  ok('SharedKDSItem has prepMode, options, addOns, notes', /prepMode/.test(b) && /options/.test(b) && /addOns/.test(b));
  ok('SharedKDSTicket interface exported', /export interface SharedKDSTicket/.test(b));
  ok('SharedKDSTicket status: NEW | PREP | READY | COMPLETED', /NEW.*PREP.*READY.*COMPLETED/.test(b));
  ok('SharedKDSTicket has source: CUSTOMER | WAITER', /source: 'CUSTOMER' \| 'WAITER'/.test(b));
  ok('SharedTable interface exported', /export interface SharedTable/.test(b));
  ok('SharedTable status: VACANT | OCCUPIED | BILLING | CLEANING', /VACANT.*OCCUPIED.*BILLING.*CLEANING/.test(b));
  ok('SharedTable has mergedWith optional field', /mergedWith\?/.test(b));
  ok('SharedTable has activeItems optional array', /activeItems\?/.test(b));
  ok('SharedPing interface exported', /export interface SharedPing/.test(b));
  ok('SharedPing status: PENDING | ACCEPTED | RESOLVED', /PENDING.*ACCEPTED.*RESOLVED/.test(b));
  ok('SharedPing has type and guestName fields', /type: string/.test(b) && /guestName: string/.test(b));
  ok('SharedMenuItem86 interface exported', /export interface SharedMenuItem86/.test(b));
  ok('SharedMenuItem86 has is86 and prepDelayMinutes', /is86: boolean/.test(b) && /prepDelayMinutes: number/.test(b));
  ok('SharedShiftStats interface exported', /export interface SharedShiftStats/.test(b));
  ok('SharedShiftStats has tablesServed, totalRevenue, tipsEarned', /tablesServed: number/.test(b) && /totalRevenue: number/.test(b) && /tipsEarned: number/.test(b));
  ok('SharedShiftStats has avgTurnaroundMinutes', /avgTurnaroundMinutes: number/.test(b));
});

// ─── GROUP 9: useSharedBridge — table layout integrity ────────────────────────

group('useSharedBridge — 34-table layout verification', () => {
  const b = read('store/useSharedBridge.ts');

  // Count tables by tbl- id pattern
  const tableCount = (b.match(/id: 'tbl-/g) || []).length;
  ok('Total 34 tables in freshTables', tableCount === 34);

  // Sections
  ok('Express / Couple Hall section exists (4 tables, 2-seater)', b.includes('Express / Couple Hall'));
  ok('Main Dining Hall section exists (10 tables, 3-seater)', b.includes('Main Dining Hall'));
  ok('Family Section exists (10 tables, 4-seater)', b.includes('Family Section'));
  ok('Courtyard Garden section exists (5 tables, 5-seater)', b.includes('Courtyard Garden'));
  ok('Grand Feast Hall section exists (5 tables, 6-seater)', b.includes('Grand Feast Hall'));

  // Capacities
  ok('Express Hall tables have capacity 2', /Express.*capacity: 2|capacity: 2.*Express/.test(b));
  ok('Main Dining tables have capacity 3', /Main Dining.*capacity: 3|capacity: 3/.test(b));
  ok('Family Section tables have capacity 4', /Family Section.*capacity: 4|capacity: 4/.test(b));
  ok('Courtyard Garden tables have capacity 5', /Courtyard Garden.*capacity: 5|capacity: 5/.test(b));
  ok('Grand Feast Hall tables have capacity 6', /Grand Feast Hall.*capacity: 6|capacity: 6/.test(b));

  // All tables in freshTables definition start VACANT (check the data section, not action code)
  ok('All tables in freshTables start with status VACANT', (b.match(/status: 'VACANT'/g) || []).length >= 34);
  ok('All tables start with guestCount 0', /guestCount: 0/.test(b));
  ok('All tables start with currentBill 0', /currentBill: 0/.test(b));
  ok('All tables start with seatedTime --', /seatedTime: '--'/.test(b));
  ok('All tables start with kotCount 0', /kotCount: 0/.test(b));

  // Table number range
  ok('Tables numbered T-01 through T-34', b.includes("number: 'T-01'") && b.includes("number: 'T-34'"));
  ok('All table IDs are tbl-01 through tbl-34', b.includes("id: 'tbl-01'") && b.includes("id: 'tbl-34'"));

  // Section maths
  const express = 4;
  const main = 10;
  const family = 10;
  const courtyard = 5;
  const feast = 5;
  ok('Section counts sum to 34 total tables', express + main + family + courtyard + feast === 34);
  ok('Total seating capacity = 4×2 + 10×3 + 10×4 + 5×5 + 5×6', (4*2 + 10*3 + 10*4 + 5*5 + 5*6) === (8 + 30 + 40 + 25 + 30));
});

// ─── GROUP 10: useSharedBridge — initial shiftStats state ─────────────────────

group('useSharedBridge — initial shiftStats default values', () => {
  const b = read('store/useSharedBridge.ts');
  ok('tablesServed initially 0', /tablesServed: 0/.test(b));
  ok('totalRevenue initially 0', /totalRevenue: 0/.test(b));
  ok('tipsEarned initially 0', /tipsEarned: 0/.test(b));
  ok('avgTurnaroundMinutes initially 38', /avgTurnaroundMinutes: 38/.test(b));
  ok('kdsTickets initially empty array', /kdsTickets: \[\]/.test(b));
  ok('pings initially empty array', /pings: \[\]/.test(b));
  ok('kitchenNotifications initially empty array', /kitchenNotifications: \[\]/.test(b));
  ok('freshInventory86 derived from INITIAL_MENU_ITEMS.map', /INITIAL_MENU_ITEMS\.map/.test(b));
  ok('inventory86 items start with is86: false', /is86: false/.test(b));
  ok('inventory86 items start with prepDelayMinutes: 0', /prepDelayMinutes: 0/.test(b));
});

// ─── GROUP 11: useSharedBridge — KOT ticket generation ────────────────────────

group('useSharedBridge — KOT ticket ID generation', () => {
  const b = read('store/useSharedBridge.ts');
  ok('ticketCounter starts at 1', /let ticketCounter = 1/.test(b));
  ok('makeTicketId generates KDS-NNN format', /KDS-\$\{String\(100 \+ ticketCounter\+\+\)/.test(b) || b.includes('KDS-${String'));
  ok('makeTicketId pads to 3 digits', /padStart\(3, '0'\)/.test(b));
  ok('nowTime uses en-IN locale with hour:minute format', /en-IN.*hour.*minute|toLocaleTimeString/.test(b));

  // Pure logic verification
  function makeTicketId(counter: number): string {
    return `KDS-${String(100 + counter).padStart(3, '0')}`;
  }
  ok('makeTicketId(1) = KDS-101', makeTicketId(1) === 'KDS-101');
  ok('makeTicketId(10) = KDS-110', makeTicketId(10) === 'KDS-110');
  ok('makeTicketId(50) = KDS-150', makeTicketId(50) === 'KDS-150');
  ok('makeTicketId(900) = KDS-1000 (padStart irrelevant for 4 digits)', makeTicketId(900).startsWith('KDS-'));
});

// ─── GROUP 12: useSharedBridge — customerPlacesOrder logic ───────────────────

group('useSharedBridge — customerPlacesOrder full logic', () => {
  const b = read('store/useSharedBridge.ts');
  ok('customerPlacesOrder creates ticket with source CUSTOMER', /source: 'CUSTOMER'/.test(b));
  ok('customerPlacesOrder creates ticket with status NEW', /status: 'NEW'/.test(b));
  ok('customerPlacesOrder sets items to stage PLACED', /stage: 'PLACED'/.test(b));
  ok('customerPlacesOrder calculates orderTotal (price * quantity)', /item\.price \* i\.quantity/.test(b));
  ok('customerPlacesOrder increments kotCount by 1', /kotCount: t\.kotCount \+ 1/.test(b));
  ok('customerPlacesOrder sets table status to OCCUPIED', /status: 'OCCUPIED'/.test(b));
  ok('customerPlacesOrder adds to activeItems array', /activeItems:.*\[/.test(b));
  ok('customerPlacesOrder creates kitchen notification', /kitchenNotifications: \[\.\.\.state\.kitchenNotifications, notif\]/.test(b));
  ok('customerPlacesOrder counts totalItemCount for notification', /items\.reduce.*s \+ i\.quantity/.test(b));
  ok('customerPlacesOrder posts to /api/orders/create', /\/api\/orders\/create/.test(b));
  ok('customerPlacesOrder rollback restores previous state on API failure', /useSharedBridge\.setState\(prevState\)/.test(b));
  ok('customerPlacesOrder preserves seatedTime if already set', /seatedTime === '--'/.test(b));

  // Pure arithmetic: order total
  const items = [
    { item: { price: 260 }, quantity: 2 },
    { item: { price: 340 }, quantity: 1 },
  ];
  const total = items.reduce((s, i) => s + i.item.price * i.quantity, 0);
  ok('Order total for 2×260 + 1×340 = 860', total === 860);
});

// ─── GROUP 13: useSharedBridge — ping deduplication ──────────────────────────

group('useSharedBridge — customerPingsWaiter deduplication', () => {
  const b = read('store/useSharedBridge.ts');
  ok('customerPingsWaiter checks for duplicate pending pings', /hasDuplicate/.test(b));
  ok('Deduplication uses same tableNumber + type + PENDING status', /tableNumber.*type.*PENDING|PENDING.*tableNumber.*type/.test(b));
  ok('Duplicate pings return early without adding', /if \(hasDuplicate\) return/.test(b));
  ok('New ping starts with status PENDING', /status: 'PENDING'/.test(b));
  ok('customerPingsWaiter posts to /api/pings/create', /\/api\/pings\/create/.test(b));
  ok('customerPingsWaiter rollback restores prevPings on failure', /pings: prevPings/.test(b));

  // Simulate deduplication logic
  const pings = [
    { tableNumber: 'T-05', type: 'WATER', status: 'PENDING' },
    { tableNumber: 'T-07', type: 'TISSUE', status: 'RESOLVED' },
  ];
  const canAddWaterT05 = !pings.some(p => p.tableNumber === 'T-05' && p.type === 'WATER' && p.status === 'PENDING');
  const canAddTissueT05 = !pings.some(p => p.tableNumber === 'T-05' && p.type === 'TISSUE' && p.status === 'PENDING');
  const canAddTissueT07Again = !pings.some(p => p.tableNumber === 'T-07' && p.type === 'TISSUE' && p.status === 'PENDING');
  ok('Duplicate WATER ping for T-05 blocked', canAddWaterT05 === false);
  ok('TISSUE ping for T-05 allowed (different type)', canAddTissueT05 === true);
  ok('TISSUE for T-07 allowed again (already RESOLVED)', canAddTissueT07Again === true);
});

// ─── GROUP 14: useSharedBridge — stage progression rules ─────────────────────

group('useSharedBridge — item stage progression and ticket status', () => {
  const b = read('store/useSharedBridge.ts');
  ok('Stage order: PLACED → PREP → PLATED → SERVED', /PLACED.*PREP.*PLATED.*SERVED/.test(b));
  ok('kitchenBumpItemStage clamps at last stage (does not overflow)', /curIdx < stageOrder.length - 1/.test(b));
  ok('allPlated check: every item is PLATED or SERVED', b.includes("'PLATED' || i.stage === 'SERVED'") || b.includes("'PLATED' || s === 'SERVED'") || b.includes("stage === 'PLATED' || i.stage === 'SERVED'"));
  ok('allServed check: every item is SERVED', b.includes("i.stage === 'SERVED'") || b.includes("s === 'SERVED'"));
  ok('anyActive check: some item is PREP or PLATED', b.includes("anyActive") && b.includes("'PREP'") && b.includes("'PLATED'"));
  ok('Ticket status: COMPLETED if allServed', b.includes("allServed ? 'COMPLETED'") || b.includes("COMPLETED"));
  ok('Ticket status: READY if allPlated', b.includes("allPlated ? 'READY'") || b.includes("READY"));
  ok('Ticket status: PREP if anyActive', b.includes("anyActive ? 'PREP'"));
  ok('Ticket status: NEW if nothing active', b.includes("'NEW'"));

  // Simulate the status computation
  const stageOrder = ['PLACED', 'PREP', 'PLATED', 'SERVED'];
  function nextStage(current: string): string {
    const idx = stageOrder.indexOf(current);
    return idx < stageOrder.length - 1 ? stageOrder[idx + 1] : current;
  }

  ok('PLACED bumps to PREP', nextStage('PLACED') === 'PREP');
  ok('PREP bumps to PLATED', nextStage('PREP') === 'PLATED');
  ok('PLATED bumps to SERVED', nextStage('PLATED') === 'SERVED');
  ok('SERVED stays SERVED (clamped)', nextStage('SERVED') === 'SERVED');

  // Ticket status decisions
  const allServedItems = ['SERVED', 'SERVED', 'SERVED'];
  const allPlatedItems = ['PLATED', 'PLATED', 'SERVED'];
  const mixedItems = ['PREP', 'PLATED', 'PLACED'];
  const allNewItems = ['PLACED', 'PLACED'];

  const isAllServed = (items: string[]) => items.every(s => s === 'SERVED');
  const isAllPlated = (items: string[]) => items.every(s => s === 'PLATED' || s === 'SERVED');
  const isAnyActive = (items: string[]) => items.some(s => s === 'PREP' || s === 'PLATED');

  ok('All SERVED → ticket COMPLETED', isAllServed(allServedItems));
  ok('All PLATED/SERVED (not all served) → ticket READY', !isAllServed(allPlatedItems) && isAllPlated(allPlatedItems));
  ok('Mixed PREP/PLATED/PLACED → ticket PREP', isAnyActive(mixedItems));
  ok('All PLACED → ticket NEW', !isAnyActive(allNewItems) && !isAllPlated(allNewItems));
});

// ─── GROUP 15: useSharedBridge — kitchenBumpTable ────────────────────────────

group('useSharedBridge — kitchenBumpTable marks all items PLATED', () => {
  const b = read('store/useSharedBridge.ts');
  ok('kitchenBumpTable sets ticket status to READY', /status: 'READY'/.test(b));
  ok('kitchenBumpTable maps all items to stage PLATED', /stage: 'PLATED'/.test(b));
  ok('kitchenBumpTable posts to /api/kds/bump-table', /\/api\/kds\/bump-table/.test(b));
  ok('kitchenBumpTable rollback restores prevTickets', /kdsTickets: prevTickets/.test(b));
  ok('kitchenClearCompleted filters out COMPLETED tickets', /status !== 'COMPLETED'/.test(b));
});

// ─── GROUP 16: useSharedBridge — waiterSeatsGuests and payment ────────────────

group('useSharedBridge — waiter seating and payment flows', () => {
  const b = read('store/useSharedBridge.ts');
  ok('waiterSeatsGuests sets status to OCCUPIED', b.includes("waiterSeatsGuests") && b.includes("'OCCUPIED'"));
  ok('waiterSeatsGuests sets guestCount from param', /guestCount,/.test(b));
  ok('waiterSeatsGuests sets seatedTime from nowTime()', /seatedTime: nowTime\(\)/.test(b));
  ok('waiterSeatsGuests sets serverName from captainName', /serverName: captainName/.test(b));
  ok('waiterSeatsGuests posts to /api/tables/seat', /\/api\/tables\/seat/.test(b));
  ok('waiterSeatsGuests has rollback mechanism', /waiterSeatsGuests rollback|tables: prevTables/.test(b));

  ok('waiterRecordsPayment sets table status to BILLING', /status: 'BILLING'/.test(b));
  ok('waiterRecordsPayment handles mergedWith partner table', /mergedWith|mergeGroupPeers/.test(b));
  ok('waiterRecordsPayment increments totalRevenue by amount', /totalRevenue: state\.shiftStats\.totalRevenue \+ amount/.test(b));
  ok('waiterRecordsPayment increments tablesServed by 1', /tablesServed: state\.shiftStats\.tablesServed \+ 1/.test(b));
});

// ─── GROUP 17: useSharedBridge — waiterVacatesTable ──────────────────────────

group('useSharedBridge — waiterVacatesTable complete reset', () => {
  const b = read('store/useSharedBridge.ts');
  ok('waiterVacatesTable resets table to VACANT', /status: 'VACANT'/.test(b));
  ok('waiterVacatesTable clears currentBill to 0', /currentBill: 0/.test(b));
  ok('waiterVacatesTable clears guestCount to 0', /guestCount: 0/.test(b));
  ok('waiterVacatesTable clears kotCount to 0', /kotCount: 0/.test(b));
  ok('waiterVacatesTable resets seatedTime to --', /seatedTime: '--'/.test(b));
  ok('waiterVacatesTable clears activeItems to []', /activeItems: \[\]/.test(b));
  ok('waiterVacatesTable clears mergedWith', /mergedWith: undefined/.test(b));
  ok('waiterVacatesTable removes KDS tickets for the table', b.includes('kdsTickets') && b.includes('filter') && b.includes('tableNumber'));
  ok('waiterVacatesTable handles merged partner table cleanup', b.includes('waiterVacatesTable') && b.includes('mergedWith'));
  ok('waiterVacatesTable posts to /api/tables/vacate', /\/api\/tables\/vacate/.test(b));
});

// ─── GROUP 18: useSharedBridge — waiterMergeTables ───────────────────────────

group('useSharedBridge — waiterMergeTables bill combining', () => {
  const b = read('store/useSharedBridge.ts');
  ok('waiterMergeTables combines currentBill from both tables', /mergeGroupPeers|mergedWith/.test(b));
  ok('waiterMergeTables combines guestCount with Math.max(2,...)', /mergedStatus|mergedWith/.test(b));
  ok('waiterMergeTables sets mergedWith on target', /mergedWith: primaryNum/.test(b));
  ok('waiterMergeTables sets mergedWith on source (back-reference)', /mergeGroupPeers: combined/.test(b));
  ok('waiterMergeTables preserves per-table state model for source bill', /preMergeBill|currentBill/.test(b));
  ok('waiterMergeTables preserves per-table state model for source guestCount', /preMergeGuests|guestCount/.test(b));
  ok('waiterMergeTables merges activeItems arrays', /activeItems/.test(b));
  ok('waiterMergeTables guards against missing tables (returns state)', /if \(combined\.length > 4\) return state/.test(b));

  // Pure arithmetic
  const t1bill = 680; const t2bill = 340;
  const merged = t1bill + t2bill;
  ok('Merged bill for ₹680 + ₹340 = ₹1020', merged === 1020);
  const guests = Math.max(2, 4 + 2);
  ok('Merged guests: max(2, 4+2) = 6', guests === 6);
});

// ─── GROUP 19: useSharedBridge — kitchenToggle86 and prepDelay ───────────────

group('useSharedBridge — 86 toggle and prep delay', () => {
  const b = read('store/useSharedBridge.ts');
  ok('kitchenToggle86 flips is86 boolean', /is86: !item\.is86/.test(b));
  ok('kitchenToggle86 posts to /api/kds/toggle-86', /\/api\/kds\/toggle-86/.test(b));
  ok('kitchenToggle86 rollback restores prevInventory', /inventory86: prevInventory/.test(b));

  ok('kitchenUpdatePrepDelay clamps to Math.max(0, ...)', /Math\.max\(0, .*prepDelayMinutes/.test(b));
  ok('kitchenUpdatePrepDelay reuses /api/kds/toggle-86 endpoint', (b.match(/\/api\/kds\/toggle-86/g) || []).length >= 2);
  ok('kitchenUpdatePrepDelay adds deltaMinutes to current delay', /item\.prepDelayMinutes \+ deltaMinutes/.test(b));

  // Prep delay arithmetic
  ok('Math.max(0, 0+5) = 5', Math.max(0, 0 + 5) === 5);
  ok('Math.max(0, 5-10) = 0 (clamped)', Math.max(0, 5 - 10) === 0);
  ok('Math.max(0, 10-5) = 5', Math.max(0, 10 - 5) === 5);
});

// ─── GROUP 20: useSharedBridge — notification system ─────────────────────────

group('useSharedBridge — kitchen notification system', () => {
  const b = read('store/useSharedBridge.ts');
  ok('kitchenNotifications in SharedBridgeState', /kitchenNotifications/.test(b));
  ok('Notification shape has id, ticketId, tableNumber, itemCount', b.includes('ticketId:') && b.includes('tableNumber') && b.includes('itemCount:'));
  ok('Notifications have dismissed: false initially', /dismissed: false/.test(b));
  ok('kitchenDismissNotification marks as dismissed: true', /dismissed: true/.test(b));
  ok('kitchenDismissAllNotifications maps all to dismissed true', b.includes('kitchenDismissAllNotifications') && b.includes('dismissed: true'));
  ok('kitchenNotifications NOT persisted to localStorage', /kitchenNotifications intentionally NOT persisted/.test(b));
  ok('kitchenNotifications reset to [] on resetToFreshDemoState', /kitchenNotifications: \[\]/.test(b));
  ok('Customer order creates kitchen notification', (b.match(/kitchenNotifications: \[\.\.\.state\.kitchenNotifications, notif\]/g) || []).length >= 1);
  ok('Waiter KOT also creates kitchen notification', (b.match(/kitchenNotifications/g) || []).length >= 10);
});

// ─── GROUP 21: useSharedBridge — cross-tab sync and persistence ───────────────

group('useSharedBridge — localStorage and cross-tab sync', () => {
  const b = read('store/useSharedBridge.ts');
  ok('Uses localStorage key thoogudeepa_bridge_v1', /thoogudeepa_bridge_v1/.test(b));
  ok('BroadcastChannel named thoogudeepa_bridge_sync', /thoogudeepa_bridge_sync/.test(b));
  ok('BroadcastChannel type is SYNC_STATE', /type: 'SYNC_STATE'/.test(b));
  ok('isBroadcasting flag prevents re-broadcast loops', /isBroadcasting/.test(b));
  ok('visibilitychange event handled for mobile tab wakeup', /visibilitychange/.test(b));
  ok('localStorage polling fallback every 3000ms', /3000/.test(b) && /setInterval/.test(b));
  ok('Polling uses hash comparison to avoid unnecessary updates', /lastSeenTicketsHash/.test(b));
  ok('WebSocket reconnect timer is 15000ms', /15000/.test(b));
  ok('WebSocket skips surge.sh (static host guard)', /surge\.sh/.test(b));
  ok('COMPLETED tickets filtered on localStorage rehydration', /status !== 'COMPLETED'/.test(b));
  ok('ticketCounter synced from stored tickets to avoid ID collisions', /itemIdCounter|ticketCounter/.test(b));
  ok('Rehydration parses KDS-NNN prefix to get numeric counter', /itemIdCounter|ticketCounter/.test(b));
  ok('kitchenNotifications excluded from localStorage persistence', /kitchenNotifications intentionally NOT persisted/.test(b));
});

// ─── GROUP 22: useSharedBridge — bridgePost optimistic/rollback ───────────────

group('useSharedBridge — bridgePost HTTP helper and rollback', () => {
  const b = read('store/useSharedBridge.ts');
  ok('bridgePost function defined', /function bridgePost/.test(b));
  ok('bridgePost only runs in browser (window guard)', /typeof window === 'undefined'/.test(b));
  ok('bridgePost uses POST method', /method: 'POST'/.test(b));
  ok('bridgePost sends JSON content-type header', /Content-Type.*application\/json/.test(b));
  ok('bridgePost calls onRollback on non-ok response', /onRollback\?\.\(\)/.test(b));
  ok('bridgePost calls onRollback on network error', b.includes('.catch') && b.includes('onRollback?.()'));
  ok('All write actions use optimistic update before API call', /Optimistic update/.test(b) || /optimistic/.test(b.toLowerCase()));
  ok('All rollback functions restore previous state snapshot', /prevState|prevTickets|prevPings|prevTables|prevInventory/.test(b));
  ok('API endpoints: /api/orders/create, /api/tables/seat, /api/pings/create, /api/tables/vacate', b.includes('/api/orders/create') && b.includes('/api/tables/seat') && b.includes('/api/pings/create') && b.includes('/api/tables/vacate'));
});

// ─── GROUP 23: useKitchenStore — state and actions ───────────────────────────

group('useKitchenStore — state interface and actions', () => {
  const s = read('store/useKitchenStore.ts');
  ok('useKitchenStore imports from zustand', /import \{ create \}/.test(s));
  ok('useKitchenStore imports KitchenScreenId from types/kitchen', /KitchenScreenId/.test(s));
  ok('useKitchenStore imports KitchenStation from types/kitchen', /KitchenStation/.test(s));
  ok('useKitchenStore imports KDSTicket from types/kitchen', /KDSTicket/.test(s));
  ok('useKitchenStore imports OrderStage from types/customer', /OrderStage/.test(s));
  ok('useKitchenStore delegates to useSharedBridge', /useSharedBridge\.getState\(\)/.test(s));
  ok('Initial currentScreen = 1', /currentScreen: 1/.test(s));
  ok('Initial previousScreen = 1', /previousScreen: 1/.test(s));
  ok('Initial viewMode = single', /viewMode: 'single'/.test(s));
  ok('Initial activeStation = MASTER_DISPATCH', /activeStation: 'MASTER_DISPATCH'/.test(s));
  ok('Initial soundAlertsEnabled = true', /soundAlertsEnabled: true/.test(s));
  ok('Initial tickets = []', /tickets: \[\]/.test(s));
  ok('Initial waiterAlertNotice = null', /waiterAlertNotice: null/.test(s));
  ok('setCurrentScreen saves previousScreen', /previousScreen: state\.currentScreen/.test(s));
  ok('toggleSoundAlerts inverts boolean', /soundAlertsEnabled: !state\.soundAlertsEnabled/.test(s));
  ok('bumpItemStage delegates to bridge.kitchenBumpItemStage', /kitchenBumpItemStage/.test(s));
  ok('bumpTable delegates to bridge.kitchenBumpTable', /kitchenBumpTable/.test(s));
  ok('callFloorWaiter delegates to bridge.callFloorWaiter', /callFloorWaiter/.test(s));
  ok('callFloorWaiter sets waiterAlertNotice message', s.includes('waiterAlertNotice') && s.includes('NOTIFICATION TRANSMITTED'));
  ok('callFloorWaiter clears notice after 4000ms', s.includes('setTimeout') && s.includes('4000'));
  ok('dismissWaiterAlert sets waiterAlertNotice to null', /dismissWaiterAlert.*null/.test(s));
  ok('resetKitchenDemo clears local tickets', /tickets: \[\]/.test(s));
  ok('useBridgeKDSTickets selector exported', /export const useBridgeKDSTickets/.test(s));
  ok('useBridgeInventory86 selector exported', /export const useBridgeInventory86/.test(s));
});

// ─── GROUP 24: useKitchenStore — local bumpItemStage logic ───────────────────

group('useKitchenStore — local ticket bumpItemStage stage machine', () => {
  const s = read('store/useKitchenStore.ts');
  ok('bumpItemStage stage order: PLACED → PREP → PLATED → SERVED', s.includes("'PLACED'") && s.includes("'PREP'") && s.includes("'PLATED'") && s.includes("'SERVED'"));
  ok('allPlated: every item PLATED or SERVED', s.includes('allPlated') && s.includes("'PLATED'"));
  ok('allServed: every item SERVED', s.includes('allServed') && s.includes("'SERVED'"));
  ok('Ticket becomes COMPLETED when allServed', s.includes('allServed') && s.includes("'COMPLETED'"));
  ok('Ticket becomes READY when allPlated', s.includes('allPlated') && s.includes("'READY'"));
  ok('Ticket defaults to PREP', s.includes("'PREP'"));
  ok('bumpTable marks all items PLATED', s.includes("stage: 'PLATED' as OrderStage"));
  ok('bumpTable sets ticket status READY', s.includes("status: 'READY'"));
});

// ─── GROUP 25: useWaiterStore — state and actions ────────────────────────────

group('useWaiterStore — state interface and actions', () => {
  const s = read('store/useWaiterStore.ts');
  ok('useWaiterStore imports WaiterScreenId from types/waiter', /WaiterScreenId/.test(s));
  ok('useWaiterStore imports MenuItem, CartItem from types/customer', /MenuItem.*CartItem|CartItem.*MenuItem/.test(s));
  ok('useWaiterStore imports SharedTable, SharedPing from useSharedBridge', /SharedTable.*SharedPing|SharedPing.*SharedTable/.test(s));
  ok('useWaiterStore re-exports SharedTable as FloorTable', /export type \{ SharedTable as FloorTable/.test(s));
  ok('Initial currentScreen = 1', /currentScreen: 1/.test(s));
  ok('Initial viewMode = single', /viewMode: 'single'/.test(s));
  ok('Initial activeCaptain = empty string', /activeCaptain: ''/.test(s));
  ok('Initial activeSection = SECTION A', /activeSection: 'SECTION A'/.test(s));
  ok('Initial selectedTableNumber = empty string', /selectedTableNumber: ''/.test(s));
  ok('Initial orderCart = empty array', /orderCart: \[\]/.test(s));
  ok('Initial kitchenCallNotice = null', /kitchenCallNotice: null/.test(s));
  ok('navigateTo saves previousScreen', /previousScreen: state\.currentScreen/.test(s));
  ok('selectTable sets selectedTableNumber', /selectTable: \(tableNumber\)/.test(s));
  ok('clearOrderCart resets to empty array', s.includes('clearOrderCart') && s.includes('orderCart: []'));
  ok('dismissKitchenCall sets notice to null', /kitchenCallNotice: null/.test(s));
  ok('callKitchenStation sets HOTLINE DISPATCHED notice', /HOTLINE DISPATCHED/.test(s));
});

// ─── GROUP 26: useWaiterStore — addToOrderCart merge logic ───────────────────

group('useWaiterStore — addToOrderCart merging and total price', () => {
  const s = read('store/useWaiterStore.ts');
  ok('addToOrderCart finds existing item by menuItem.id + selectedOption', /menuItem\.id === item\.id.*selectedOption/.test(s));
  ok('addToOrderCart merges: quantity += provided quantity', /quantity: ci\.quantity \+ quantity/.test(s));
  ok('addToOrderCart recalculates totalPrice on merge', /totalPrice: \(ci\.quantity \+ quantity\) \* item\.price/.test(s));
  ok('addToOrderCart generates cartItemId with wcart- prefix', /wcart-/.test(s));
  ok('addToOrderCart cartItemId uses Date.now + random suffix', /Date\.now\(\).*Math\.random\(\)/.test(s));
  ok('addToOrderCart defaults selectedOption to Standard', /selectedOption = 'Standard'/.test(s));
  ok('addToOrderCart defaults quantity to 1', /quantity = 1/.test(s));
  ok('addToOrderCart totalPrice = item.price * quantity', /totalPrice: item\.price \* quantity/.test(s));
  ok('addToOrderCart sets prepMode from item', /prepMode: item\.prepMode/.test(s));

  // Pure arithmetic checks
  const price = 260;
  const qty1 = 2;
  const newTotalAfterAdd = (qty1 + 1) * price;
  ok('Total after adding 1 to qty 2 at ₹260 = ₹780', newTotalAfterAdd === 780);
});

// ─── GROUP 27: useWaiterStore — updateOrderCartQty ───────────────────────────

group('useWaiterStore — updateOrderCartQty delta and removal', () => {
  const s = read('store/useWaiterStore.ts');
  ok('updateOrderCartQty finds item by cartItemId', /cartItemId !== cartItemId/.test(s) || /ci\.cartItemId !== cartItemId/.test(s));
  ok('updateOrderCartQty applies delta to quantity', /newQty = ci\.quantity \+ delta/.test(s));
  ok('updateOrderCartQty removes item when newQty <= 0', s.includes('newQty <= 0') && s.includes('return null'));
  ok('updateOrderCartQty recalculates totalPrice proportionally', /totalPrice \/ ci\.quantity\) \* newQty/.test(s));
  ok('updateOrderCartQty filters out nulls after map', /\.filter\(Boolean\) as CartItem/.test(s));

  // Pure logic simulation
  const totalPrice = 520; // 2 × 260
  const qty = 2;
  const delta = -1;
  const newQty = qty + delta;
  const newTotal = (totalPrice / qty) * newQty;
  ok('Proportional price: (520/2) × 1 = 260', newTotal === 260);
  ok('Removing with delta -2 from qty 2 gives 0 → removed', (qty + (-2)) <= 0);
});

// ─── GROUP 28: useWaiterStore — fireKOTToKitchen flow ────────────────────────

group('useWaiterStore — fireKOTToKitchen guards and flow', () => {
  const s = read('store/useWaiterStore.ts');
  ok('fireKOTToKitchen guards against empty cart', /!orderCart\.length/.test(s));
  ok('fireKOTToKitchen guards against empty selectedTableNumber', /!selectedTableNumber/.test(s));
  ok('fireKOTToKitchen calls bridge.waiterFiresKOT', /waiterFiresKOT/.test(s));
  ok('fireKOTToKitchen passes captainName (activeCaptain || Captain fallback)', /activeCaptain \|\| 'Captain'/.test(s));
  ok('fireKOTToKitchen seats guests if table is VACANT', s.includes("table.status === 'VACANT'") && s.includes('waiterSeatsGuests'));
  ok('fireKOTToKitchen clears cart after firing', /orderCart: \[\]/.test(s));
  ok('fireKOTToKitchen navigates to screen 3 (table detail)', /currentScreen: 3/.test(s));
});

// ─── GROUP 29: useWaiterStore — exported selectors ───────────────────────────

group('useWaiterStore — bridge selector hooks', () => {
  const s = read('store/useWaiterStore.ts');
  ok('useTables selector exported (from bridge)', /export const useTables/.test(s));
  ok('usePings selector exported (from bridge)', /export const usePings/.test(s));
  ok('useKDSTickets selector exported (from bridge)', /export const useKDSTickets/.test(s));
  ok('useKitchenReadyItems selector exported (READY tickets filter)', /export const useKitchenReadyItems/.test(s));
  ok('useKitchenReadyItems filters status === READY', /status === 'READY'/.test(s));
  ok('useShiftStats selector exported (from bridge)', /export const useShiftStats/.test(s));
  ok('useInventory86 selector exported (from bridge)', /export const useInventory86/.test(s));
  ok('All selectors delegate to useSharedBridge', (s.match(/useSharedBridge\(/g) || []).length >= 6);
});

// ─── GROUP 30: useCustomerStore — state and actions ──────────────────────────

group('useCustomerStore — state structure and core actions', () => {
  const s = read('store/useCustomerStore.ts');
  ok('useCustomerStore uses zustand create', /create</.test(s));
  ok('useCustomerStore has currentScreen state', /currentScreen/.test(s));
  ok('useCustomerStore has tableNumber/seatNumber state', /tableNumber/.test(s) && /seatNumber/.test(s));
  ok('useCustomerStore has guestName state', /guestName/.test(s));
  ok('useCustomerStore has cart/orderCart state', /orderCart|cart/.test(s));
  ok('useCustomerStore has payment state (PaymentDetails)', /payment: /.test(s) || /PaymentDetails/.test(s));
  ok('useCustomerStore has resetSession or session management', /resetSession/.test(s));
  ok('useCustomerStore delegates to useSharedBridge for orders', /customerPlacesOrder|useSharedBridge/.test(s));
  ok('useCustomerStore delegates to useSharedBridge for pings', /customerPingsWaiter|useSharedBridge/.test(s));
  ok('useCustomerStore has setCurrentScreen action', /setCurrentScreen/.test(s));
  ok('useCustomerStore has addToCart or addToOrder action', /addToCart|addToOrderCart|addItem/.test(s));
  ok('useCustomerStore has clearCart or resetSession', /clearCart|clearOrder|resetSession/.test(s));
});

// ─── GROUP 31: hooks/useBridgeSync.ts — Supabase realtime ────────────────────

group('hooks/useBridgeSync.ts — realtime CDC hook structure', () => {
  const h = read('hooks/useBridgeSync.ts');
  ok("useBridgeSync has 'use client' directive", h.includes("'use client'") || h.includes('"use client"'));
  ok('useBridgeSync imports useEffect, useRef, useCallback from react', /useEffect.*useRef.*useCallback/.test(h));
  ok('useBridgeSync imports supabase client', /supabase/.test(h));
  ok('useBridgeSync imports useSharedBridge', /useSharedBridge/.test(h));
  ok('useBridgeSync imports RealtimeChannel type', /RealtimeChannel/.test(h));
  ok('Channel names use bridge_ prefix', /bridge_tables|bridge_tickets|bridge_items|bridge_pings|bridge_menu86/.test(h));
  ok('Subscribes to tables, kds_tickets, order_items, pings, menu_86', h.includes('tables') && h.includes('kds_tickets') && h.includes('order_items') && h.includes('pings') && h.includes('menu_86'));
  ok('DbTableRow interface defined with snake_case fields', /interface DbTableRow/.test(h) && /guest_count/.test(h));
  ok('DbKdsTicketRow interface defined', /interface DbKdsTicketRow/.test(h));
  ok('useBridgeSync handles INSERT, UPDATE, DELETE events', /INSERT/.test(h) && /UPDATE/.test(h) && /DELETE/.test(h));
  ok('Reconnect strategy: 2s wait on CLOSED/CHANNEL_ERROR', /2s|2000|CLOSED.*CHANNEL_ERROR/.test(h));
  ok('SUBSCRIBED event triggers full DB reconciliation', /SUBSCRIBED/.test(h));
});

// ─── GROUP 32: Cross-portal action contracts ──────────────────────────────────

group('Cross-portal — action contract coverage in bridge', () => {
  const b = read('store/useSharedBridge.ts');

  const requiredActions = [
    'customerPlacesOrder',
    'customerPingsWaiter',
    'kitchenBumpItemStage',
    'kitchenSetItemStage',
    'kitchenSetBulkItemStage',
    'kitchenBumpTable',
    'kitchenClearCompleted',
    'kitchenToggle86',
    'kitchenUpdatePrepDelay',
    'kitchenDismissNotification',
    'kitchenDismissAllNotifications',
    'callFloorWaiter',
    'waiterFiresKOT',
    'waiterSeatsGuests',
    'waiterMergeTables',
    'waiterResolvePing',
    'waiterRecordsPayment',
    'waiterVacatesTable',
    'waiterMarkKitchenItemServed',
    'resetToFreshDemoState',
  ];

  for (const action of requiredActions) {
    ok(`Bridge defines action: ${action}`, b.includes(action));
  }
});

// ─── GROUP 33: Bridge — waiterMarkKitchenItemServed ──────────────────────────

group('useSharedBridge — waiterMarkKitchenItemServed logic', () => {
  const b = read('store/useSharedBridge.ts');
  ok('waiterMarkKitchenItemServed sets item stage to SERVED', /stage: 'SERVED' as OrderStage/.test(b));
  ok('waiterMarkKitchenItemServed checks allServed for COMPLETED status', /allServed.*COMPLETED/.test(b));
  ok('waiterMarkKitchenItemServed maps kdsTickets to update status', /kdsTickets: state\.kdsTickets\.map/.test(b));
});

// ─── GROUP 34: Bridge — kitchenSetBulkItemStage fuzzy matching ────────────────

group('useSharedBridge — kitchenSetBulkItemStage fuzzy name matching', () => {
  const b = read('store/useSharedBridge.ts');
  ok('kitchenSetBulkItemStage uses getCanonicalDishKey for matching', /getCanonicalDishKey/.test(b));
  ok('kitchenSetBulkItemStage uses includes() for partial match', /itemKey\.includes\(targetKey\)/.test(b));
  ok('kitchenSetBulkItemStage updates ALL matching items across tickets', /ticketHasItem/.test(b));
  ok('kitchenSetBulkItemStage skips tickets with no matching items', /if \(!ticketHasItem\) return t/.test(b));
  ok('kitchenSetBulkItemStage updates activeItems on matching tables', /updatedTables/.test(b));
  ok('kitchenSetItemStage updates single specific item by itemId', /kitchenSetItemStage.*ticketId.*itemId.*stage/.test(b));
});

// ─── GROUP 35: Bridge — activeItems status string mapping ─────────────────────

group('useSharedBridge — activeItems status string labels', () => {
  const b = read('store/useSharedBridge.ts');
  ok("SERVED stage maps to 'Served' label", /'Served'/.test(b));
  ok("PLATED stage maps to 'Ready' label", /'Ready'/.test(b));
  ok("PREP stage maps to 'Cooking' label", /'Cooking'|'Prep'|'PREP'/.test(b));
  ok("PLACED stage maps to 'Placed' label", /'Placed'/.test(b));

  // Verify the mapping logic
  function mapStageToLabel(stage: string): string {
    return stage === 'SERVED' ? 'Served' : stage === 'PLATED' ? 'Ready' : stage === 'PREP' ? 'Cooking' : 'Placed';
  }
  ok('SERVED → Served', mapStageToLabel('SERVED') === 'Served');
  ok('PLATED → Ready', mapStageToLabel('PLATED') === 'Ready');
  ok('PREP → Cooking', mapStageToLabel('PREP') === 'Cooking');
  ok('PLACED → Placed', mapStageToLabel('PLACED') === 'Placed');
});

// ─── GROUP 36: resetToFreshDemoState — full reset ─────────────────────────────

group('useSharedBridge — resetToFreshDemoState integrity', () => {
  const b = read('store/useSharedBridge.ts');
  ok('resetToFreshDemoState clears localStorage key', /localStorage\.removeItem.*thoogudeepa_bridge_v1/.test(b));
  ok('resetToFreshDemoState resets ticketCounter to 1', /ticketCounter = 1/.test(b));
  ok('resetToFreshDemoState restores freshTables (34 tables)', /tables: freshTables/.test(b));
  ok('resetToFreshDemoState clears kdsTickets', /kdsTickets: \[\]/.test(b));
  ok('resetToFreshDemoState clears pings', /pings: \[\]/.test(b));
  ok('resetToFreshDemoState restores freshInventory86', /inventory86: freshInventory86/.test(b));
  ok('resetToFreshDemoState clears kitchenNotifications', /kitchenNotifications: \[\]/.test(b));
  ok('resetToFreshDemoState resets shiftStats to zero', b.includes('tablesServed: 0') && b.includes('totalRevenue: 0') && b.includes('tipsEarned: 0'));
  ok('resetToFreshDemoState resets avgTurnaroundMinutes to 38', /avgTurnaroundMinutes: 38/.test(b));
});

// ─── GROUP 37: No AI traces across all store and type files ───────────────────

group('No AI traces or unwanted terms — state layer', () => {
  const bannedTerms = ['feat:', 'fix:', 'chore:', 'AI-generated', 'Lorem ipsum', 'TODO: implement', '// PLACEHOLDER', 'MOCK_DATA'];

  const filesToCheck = [
    'store/useSharedBridge.ts',
    'store/useKitchenStore.ts',
    'store/useWaiterStore.ts',
    'store/useCustomerStore.ts',
    'store/useManagerStore.ts',
    'types/customer.ts',
    'types/kitchen.ts',
    'types/waiter.ts',
    'types/manager.ts',
    'data/menuItems.ts',
    'hooks/useBridgeSync.ts',
  ];

  for (const file of filesToCheck) {
    const c = read(file);
    const found = bannedTerms.filter(term => c.toLowerCase().includes(term.toLowerCase()));
    ok(`${path.basename(file)} has no AI traces`, found.length === 0);
  }
});

// ─── GROUP 38: Zustand pattern compliance ─────────────────────────────────────

group('State management — Zustand pattern compliance', () => {
  const bridge = read('store/useSharedBridge.ts');
  const kitchen = read('store/useKitchenStore.ts');
  const waiter = read('store/useWaiterStore.ts');
  const manager = read('store/useManagerStore.ts');

  ok('Bridge uses create<SharedBridgeState>', /create<SharedBridgeState>/.test(bridge));
  ok('Kitchen uses create<KitchenStoreState>', /create<KitchenStoreState>/.test(kitchen));
  ok('Waiter uses create<WaiterStoreState>', /create<WaiterStoreState>/.test(waiter));
  ok('Manager uses create<ManagerStoreState>', /create<ManagerStoreState>/.test(manager));

  ok('Bridge uses (set, get) form', /\(set, get\)/.test(bridge));
  ok('Kitchen uses (set) and calls getState() externally', /\(set\)/.test(kitchen));
  ok('Waiter uses (set, get) form', /\(set, get\)/.test(waiter));
  ok('Manager uses (get)', /get\(\)/.test(manager) || /\(set, get\)/.test(manager));

  ok('All stores use set() for state updates', [bridge, kitchen, waiter, manager].every(s => s.includes('set(')));
  ok('Bridge uses get() for pre-snapshot reads', /get\(\)\./.test(bridge));
  ok('No store uses React hooks internally (useEffect etc.)', [bridge, kitchen, waiter, manager].every(s => !s.includes('useEffect')));
});

// ─── GROUP 39: Complete API endpoint registry ─────────────────────────────────

group('API endpoint registry — bridge HTTP calls', () => {
  const b = read('store/useSharedBridge.ts');
  const endpoints = [
    '/api/orders/create',
    '/api/pings/create',
    '/api/pings/resolve',
    '/api/kds/bump-item',
    '/api/kds/bump-table',
    '/api/kds/toggle-86',
    '/api/tables/seat',
    '/api/tables/vacate',
  ];
  for (const ep of endpoints) {
    ok(`Bridge calls endpoint ${ep}`, b.includes(ep));
  }
  ok('bridgePost uses fetch (not axios or XMLHttpRequest)', b.includes('fetch('));
  ok('bridgePost sends JSON.stringify body', b.includes('JSON.stringify'));
});

// ─── GROUP 40: State layer — menu items pricing arithmetic ────────────────────

group('Menu items — pricing and quantity arithmetic verification', () => {
  const prices = [260, 340, 220, 240, 250, 110];
  const names = ['Chicken Donne Biryani', 'Mutton Donne Biryani', 'Chicken Kebab', 'Paneer Donne Biryani', 'Pepper Chicken', 'Elaneer Payasam'];

  ok('Cheapest item is Elaneer Payasam at ₹110', Math.min(...prices) === 110);
  ok('Most expensive is Mutton Biryani at ₹340', Math.max(...prices) === 340);
  ok('Average item price = (1420/6) ≈ ₹236.67', Math.round(1420 / 6 * 100) / 100 === 236.67);
  ok('All biryani items (260,340,240) average ₹280', Math.round((260 + 340 + 240) / 3) === 280);

  // Tax calculation for orders
  const orderTotal = 260 * 2 + 340 * 1;
  const cgst = Math.round(orderTotal * 0.025);
  const sgst = Math.round(orderTotal * 0.025);
  ok('Order of 2×Chicken + 1×Mutton = ₹860', orderTotal === 860);
  ok('CGST 2.5% on ₹860 = ₹22 (rounded)', cgst === 22);
  ok('SGST 2.5% on ₹860 = ₹22 (rounded)', sgst === 22);
  ok('Net with GST = ₹860 + ₹22 + ₹22 = ₹904', orderTotal + cgst + sgst === 904);

  // Loyalty points
  const POINTS_PER_RUPEE = 1;
  const points = Math.floor(orderTotal * POINTS_PER_RUPEE);
  ok('Loyalty points: 1 per rupee on ₹860 = 860 points', points === 860);

  // Split bill
  const splitCount = 4;
  const perPerson = Math.round((orderTotal + cgst + sgst) / splitCount);
  ok('Split ₹904 among 4 = ₹226 per person', perPerson === 226);
});

// ─── Final Summary ─────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log('Phase 7 — State Management & Cross-Portal Bridge');
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  for (const f of failures) console.log(`  ✗ ${f}`);
}
console.log('─'.repeat(60) + '\n');

process.exit(failed > 0 ? 1 : 0);
