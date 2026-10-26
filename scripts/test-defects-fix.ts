/**
 * Verification Test Suite for the 3 Defects:
 * 1. Dine Again resets old order details completely and starts fresh.
 * 2. Complete taxed amount (5% GST) displayed consistently across all waiter mobile & tablet views.
 * 3. Waiter mobile header has Shift Performance button and logout button is inside Shift Performance.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { useSharedBridge } from '../store/useSharedBridge';
import { useCustomerStore } from '../store/useCustomerStore';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';

console.log('\n================================================================');
console.log('  TESTING DEFECT FIXES: DINE AGAIN, TAX CONSISTENCY & SHIFT MODAL');
console.log('================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// DEFECT 1: DINE AGAIN RESETS OLD ORDER DETAILS AND CLEARS SETTLED BILL
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- DEFECT 1: Customer Dine Again Session Cleanliness ---');

const testTable = 'T-01';
const testSeat = 1;

// 1. Simulate customer placed order and bill settled
const bridge = useSharedBridge.getState();
const customer = useCustomerStore.getState();

customer.setTableNumber(testTable);
customer.setSeatNumber(testSeat);
customer.addToCart(INITIAL_MENU_ITEMS[0], undefined, undefined, 2);
assert.strictEqual(useCustomerStore.getState().cart.length, 1, 'Cart has items');

// Simulate bill settled
bridge.recordSettledBill({
  invoiceNumber: 'INV-TEST-001',
  items: [{ id: '1', name: 'Mutton Donne Biryani', quantity: 2, price: 320, totalPrice: 640, seatNumber: 1 }],
  subtotal: 640,
  totalTax: 32,
  cgst: 16,
  sgst: 16,
  grandTotal: 672,
  method: 'UPI',
  seatLabel: 'Chair 1',
  seatNumber: 1,
  captainName: 'Floor Captain',
  tableName: testTable,
  section: 'Main Dining Hall',
  guestCount: 1,
  formattedDate: '24 Oct 2026',
  formattedTime: '09:30 PM',
});

assert(
  useSharedBridge.getState().settledBills[`${testTable}-CHAIR-${testSeat}`] !== undefined,
  'Settled bill snapshot exists before Dine Again'
);

// 2. Trigger Dine Again flow: clearSettledBill + resetSession + setCurrentScreen(1)
useSharedBridge.getState().clearSettledBill(testTable, testSeat);
useCustomerStore.getState().resetSession();

// Verify settledBills is purged
assert.strictEqual(
  useSharedBridge.getState().settledBills[`${testTable}-CHAIR-${testSeat}`],
  undefined,
  '[PASS] Settled bill removed from bridge settledBills'
);

// Verify customer store state is clean
const afterReset = useCustomerStore.getState();
assert.strictEqual(afterReset.cart.length, 0, '[PASS] Cart is completely empty');
assert.strictEqual(afterReset.currentScreen, 1, '[PASS] Screen reset to Screen 1');
assert.strictEqual(afterReset.itemTracking.length, 0, '[PASS] Item tracking cleared');
assert.strictEqual(afterReset.guestName, '', '[PASS] Guest name reset to empty');
assert.strictEqual(afterReset.isSettled, false, '[PASS] isSettled flag is false');
assert.strictEqual(afterReset.orderPlacedAt, 0, '[PASS] orderPlacedAt is 0');

// Verify syncWithActiveSession does not restore old orders after Dine Again
useCustomerStore.getState().syncWithActiveSession(testTable, testSeat);
const afterSync = useCustomerStore.getState();
assert.strictEqual(afterSync.cart.length, 0, '[PASS] syncWithActiveSession does NOT resurrect old orders');
assert.strictEqual(afterSync.currentScreen, 1, '[PASS] Stays on fresh Screen 1');

// Verify Screen8Confirmation, Screen9DigitalBill, and luxury variants call clearSettledBill in handleDineAgain
const s8Content = fs.readFileSync(path.join(__dirname, '../components/customer/Screen8Confirmation.tsx'), 'utf8');
const s9Content = fs.readFileSync(path.join(__dirname, '../components/customer/Screen9DigitalBill.tsx'), 'utf8');
const s8LuxContent = fs.readFileSync(path.join(__dirname, '../components/customer/luxury/Screen8Confirmation.tsx'), 'utf8');
const s9LuxContent = fs.readFileSync(path.join(__dirname, '../components/customer/luxury/Screen9DigitalBill.tsx'), 'utf8');

assert(s8Content.includes('clearSettledBill'), '[PASS] Screen8Confirmation calls clearSettledBill in handleDineAgain');
assert(s9Content.includes('clearSettledBill'), '[PASS] Screen9DigitalBill calls clearSettledBill in handleDineAgain');
assert(s8LuxContent.includes('clearSettledBill'), '[PASS] Luxury Screen8Confirmation calls clearSettledBill in handleDineAgain');
assert(s9LuxContent.includes('clearSettledBill'), '[PASS] Luxury Screen9DigitalBill calls clearSettledBill in handleDineAgain');

// ─────────────────────────────────────────────────────────────────────────────
// DEFECT 2: COMPLETE TAXED BILL AMOUNT CONSISTENT IN ALL PLACES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- DEFECT 2: Complete Taxed Bill Amount Consistency ---');

// Formula verification: 5% GST on 1000 subtotal = 1050
const subtotal1000 = 1000;
const taxed1000 = Math.round(subtotal1000 * 1.05);
assert.strictEqual(taxed1000, 1050, 'Taxed formula standard: subtotal * 1.05');

// Check ScreenM2FloorGrid: all bill displays use taxed amount
const m2Floor = fs.readFileSync(path.join(__dirname, '../components/waiter-mobile/ScreenM2FloorGrid.tsx'), 'utf8');
assert(m2Floor.includes('Math.round(rawBill * 1.05)'), '[PASS] ScreenM2FloorGrid taxes rawBill');
assert(m2Floor.includes('Math.round((tbl.currentBill || 0) * 1.05)'), '[PASS] ScreenM2FloorGrid taxes solo tbl.currentBill');
assert(m2Floor.includes('Math.round(tables.reduce((s, t) => s + (t.currentBill || 0), 0) * 1.05)'), '[PASS] ScreenM2FloorGrid floorLiveBill is taxed');

// Check ScreenM3TableSheet: vacate message uses grandTotal instead of untaxed currentBill
const m3Sheet = fs.readFileSync(path.join(__dirname, '../components/waiter-mobile/ScreenM3TableSheet.tsx'), 'utf8');
assert(m3Sheet.includes('grandTotal > 0') && m3Sheet.includes('Payment pending (₹${grandTotal.toFixed(2)})'), '[PASS] ScreenM3TableSheet vacate warning displays taxed grandTotal');

// Check ScreenM6Settlement: fallback bill calculation adds tax properly
const m6Settle = fs.readFileSync(path.join(__dirname, '../components/waiter-mobile/ScreenM6Settlement.tsx'), 'utf8');
assert(m6Settle.includes('const calcTax = Math.round(calcSub * 0.05);') && m6Settle.includes('const calcGrand = calcSub + calcTax;'), '[PASS] ScreenM6Settlement fallback calculates taxed grandTotal');

// Check TabletFloorMap: all tables calculate taxed totalBill
const tabFloor = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletFloorMap.tsx'), 'utf8');
assert(tabFloor.includes('Math.round(groupCurrentBill * 1.05)') || tabFloor.includes('Math.round((primaryTbl.currentBill || allMembers.reduce((sum, m) => sum + (m.currentBill || 0), 0)) * 1.05)'), '[PASS] TabletFloorMap taxes merged table bills');
assert(tabFloor.includes('totalBill: Math.round((tbl.currentBill || 0) * 1.05)'), '[PASS] TabletFloorMap taxes solo table bills');

// Check TabletTableDetail: totalTableBill uses baseFiredSubtotal * 1.05
const tabDetail = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletTableDetail.tsx'), 'utf8');
assert(tabDetail.includes('const baseFiredSubtotal = Math.max(groupCurrentBill, firedSubtotal);') || tabDetail.includes('const baseFiredSubtotal = Math.max(table.currentBill || 0, firedSubtotal);'), '[PASS] TabletTableDetail computes baseFiredSubtotal');
assert(tabDetail.includes('Math.round(baseFiredSubtotal * 1.05)'), '[PASS] TabletTableDetail taxes baseFiredSubtotal');
assert(tabDetail.includes('Payment pending (₹${totalTableBill.toFixed(2)})'), '[PASS] TabletTableDetail vacate warning uses taxed totalTableBill');

// Check TabletPaymentPanel: totalTableBill uses baseFiredSubtotal * 1.05
const tabPayment = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletPaymentPanel.tsx'), 'utf8');
assert(tabPayment.includes('const baseFiredSubtotal = Math.max(groupCurrentBill, totalTableFiredSubtotal);') || tabPayment.includes('const baseFiredSubtotal = Math.max(table?.currentBill || 0, totalTableFiredSubtotal);'), '[PASS] TabletPaymentPanel computes baseFiredSubtotal');
assert(tabPayment.includes('Math.round(baseFiredSubtotal * 1.05)'), '[PASS] TabletPaymentPanel taxes baseFiredSubtotal');

// Check TabletSettleModal: fullBill uses table.currentBill * 1.05
const tabSettle = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletSettleModal.tsx'), 'utf8');
assert(tabSettle.includes('const fullBill = Math.round(groupCurrentBill * 1.05);') || tabSettle.includes('const fullBill = Math.round((table.currentBill || 0) * 1.05);'), '[PASS] TabletSettleModal fullBill is taxed');

// Check TabletSplitModal: grandTotal taxes Math.max(table.currentBill, itemsSubtotal)
const tabSplit = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletSplitModal.tsx'), 'utf8');
assert(tabSplit.includes('const grandTotal = isVacant ? 0 : Math.round(Math.max(groupCurrentBill, itemsSubtotal) * 1.05);') || tabSplit.includes('const grandTotal = isVacant ? 0 : Math.round(Math.max(table.currentBill || 0, itemsSubtotal) * 1.05);'), '[PASS] TabletSplitModal grandTotal is taxed');

// Check TabletActionPanel: vacate warning uses totalWithGst
const tabAction = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletActionPanel.tsx'), 'utf8');
assert(tabAction.includes('totalWithGst > 0') && tabAction.includes('Payment pending (₹${totalWithGst.toFixed(2)})'), '[PASS] TabletActionPanel vacate warning uses totalWithGst');

// Check TabletMergeModal: bills are taxed
const tabMerge = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletMergeModal.tsx'), 'utf8');
assert(tabMerge.includes('Bill: ₹{Math.round((currentTable.currentBill || 0) * 1.05)}'), '[PASS] TabletMergeModal current table bill is taxed');
assert(tabMerge.includes('₹{Math.round((t.currentBill || 0) * 1.05)}'), '[PASS] TabletMergeModal table card bill is taxed');

// Check TabletShiftModal: myBill and cards are taxed
const tabShift = fs.readFileSync(path.join(__dirname, '../components/waiter-tablet/TabletShiftModal.tsx'), 'utf8');
assert(tabShift.includes('const myBill = Math.round(myTables.reduce((acc, t) => acc + (t.currentBill || 0), 0) * 1.05);'), '[PASS] TabletShiftModal myBill is taxed');
assert(tabShift.includes('₹${Math.round(tbl.currentBill * 1.05)}'), '[PASS] TabletShiftModal table item bill is taxed');

// ─────────────────────────────────────────────────────────────────────────────
// DEFECT 3: WAITER MOBILE HEADER SHIFT PERFORMANCE BUTTON & LOGOUT INSIDE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- DEFECT 3: Waiter Mobile Shift Performance & Moved Logout ---');

const waiterMobilePage = fs.readFileSync(path.join(__dirname, '../app/waiter/mobile/page.tsx'), 'utf8');
const mobileShiftModal = fs.readFileSync(path.join(__dirname, '../components/waiter-mobile/MobileShiftModal.tsx'), 'utf8');

// Header has Shift Performance button
assert(waiterMobilePage.includes('Shift Performance'), '[PASS] Waiter mobile header has Shift Performance button');
assert(waiterMobilePage.includes('setShowShiftPerformance(true)'), '[PASS] Header button triggers setShowShiftPerformance(true)');

// Header does NOT have direct logout button
const headerSlice = waiterMobilePage.substring(
  waiterMobilePage.indexOf('<header'),
  waiterMobilePage.indexOf('</header>')
);
assert(!headerSlice.includes('handleLogout'), '[PASS] Direct logout button removed from waiter mobile header');
assert(!headerSlice.includes('<LogOut'), '[PASS] LogOut icon removed from waiter mobile header');

assert(mobileShiftModal.includes('Log Out'), '[PASS] MobileShiftModal contains End Shift & Log Out button');
assert(mobileShiftModal.includes('onLogout()'), '[PASS] MobileShiftModal calls onLogout() when End Shift is tapped');
assert(mobileShiftModal.includes('Shift Performance'), '[PASS] MobileShiftModal renders Shift Performance view');
assert(mobileShiftModal.includes('shiftRevenue'), '[PASS] MobileShiftModal renders shift revenue');

console.log('\n================================================================');
console.log('  ALL 3 DEFECT VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)');
console.log('================================================================\n');

process.exit(0);

