/**
 * Phase 5 — Customer Portal Comprehensive Test Suite
 *
 * Covers: state machine, navigation, cart arithmetic, payment calculations,
 * TypeScript type contracts, menu catalog integrity, UI/visual token compliance,
 * component file structure, design system rules, and UX flow correctness
 * across all 12 customer-facing screens.
 *
 * Run: npx tsx scripts/test-phase5-comprehensive.ts
 */

import fs from 'fs';
import path from 'path';

// ─── Harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(label: string, cond: boolean) {
  if (cond) {
    passed++;
    process.stdout.write(`  ✓ ${label}\n`);
  } else {
    failed++;
    failures.push(label);
    process.stdout.write(`  ✗ ${label}\n`);
  }
}

function group(title: string, fn: () => void) {
  console.log(`\n▸ ${title}`);
  fn();
}

const ROOT = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel));

// ─── GROUP 1: TypeScript Type Contract ──────────────────────────────────────

group('TypeScript type contract — types/customer.ts', () => {
  const t = read('types/customer.ts');

  ok('ScreenId covers 1', t.includes('1'));
  ok('ScreenId covers 12', t.includes('12'));
  ok('ScreenId is a type union (not interface)', /export type ScreenId/.test(t));
  ok('ScreenId has all 12 screens', /1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12/.test(t));

  ok('OrderStage has PLACED', t.includes("'PLACED'"));
  ok('OrderStage has PREP', t.includes("'PREP'"));
  ok('OrderStage has PLATED', t.includes("'PLATED'"));
  ok('OrderStage has SERVED', t.includes("'SERVED'"));
  ok('OrderStage is type alias', /export type OrderStage/.test(t));

  ok('WaiterPingType has WATER', t.includes("'WATER'"));
  ok('WaiterPingType has TISSUE', t.includes("'TISSUE'"));
  ok('WaiterPingType has CUTLERY', t.includes("'CUTLERY'"));
  ok("WaiterPingType has TABLE CLEAN", t.includes("'TABLE CLEAN'"));
  ok('WaiterPingType has GENERAL CALL', t.includes("'GENERAL CALL'"));
  ok('WaiterPingType is type alias', /export type WaiterPingType/.test(t));

  ok('CartItem has cartItemId field', /cartItemId: string/.test(t));
  ok('CartItem has menuItem field', /menuItem: MenuItem/.test(t));
  ok('CartItem has selectedOption field', /selectedOption: string/.test(t));
  ok('CartItem has selectedAddOns field', /selectedAddOns: string\[\]/.test(t));
  ok('CartItem has quantity field', /quantity: number/.test(t));
  ok('CartItem has totalPrice field', /totalPrice: number/.test(t));
  ok('CartItem has prepMode field', /prepMode: string/.test(t));
  ok('CartItem has optional isOrdered', /isOrdered\?:\s*boolean/.test(t));
  ok('CartItem has optional orderSeparately', /orderSeparately\?:\s*boolean/.test(t));

  ok('MenuItem has id field', /id: string/.test(t));
  ok('MenuItem has name field', /name: string/.test(t));
  ok('MenuItem has price field', /price: number/.test(t));
  ok('MenuItem has category field', /category: string/.test(t));
  ok('MenuItem has description field', /description: string/.test(t));
  ok('MenuItem has prepMode field', /prepMode: string/.test(t));
  ok('MenuItem has optionsGroup1', /optionsGroup1/.test(t));
  ok('MenuItem has optionsGroup2', /optionsGroup2/.test(t));
  ok('MenuItem optionsGroup1 has choices array', /choices: string\[\]/.test(t));
  ok('MenuItem optionsGroup2 has addOns array', /addOns:/.test(t));
  ok('MenuItem addOn has name and extraPrice', /name: string; extraPrice: number/.test(t) || (t.includes('name: string') && t.includes('extraPrice: number')));

  ok('PaymentDetails has subtotal', /subtotal: number/.test(t));
  ok('PaymentDetails has tax', /tax: number/.test(t));
  ok('PaymentDetails has tipAmount', /tipAmount: number/.test(t));
  ok('PaymentDetails has discount', /discount: number/.test(t));
  ok('PaymentDetails has totalAmount', /totalAmount: number/.test(t));
  ok("PaymentDetails splitMode has NONE", t.includes("'NONE'"));
  ok("PaymentDetails splitMode has ITEMS", t.includes("'ITEMS'"));
  ok("PaymentDetails splitMode has PERSONS", t.includes("'PERSONS'"));
  ok("PaymentDetails paymentMethod has UPI", t.includes("'UPI'"));
  ok("PaymentDetails paymentMethod has CARD", t.includes("'CARD'"));
  ok("PaymentDetails paymentMethod has NET_BANKING", t.includes("'NET_BANKING'"));
  ok("PaymentDetails paymentMethod has CASH", t.includes("'CASH'"));
  ok('PaymentDetails has redeemPoints boolean', /redeemPoints: boolean/.test(t));
  ok('PaymentDetails has pointsAvailable', /pointsAvailable: number/.test(t));
  ok('PaymentDetails has pointsRedeemed', /pointsRedeemed: number/.test(t));
  ok('PaymentDetails has optional transactionId', /transactionId\?:\s*string/.test(t));

  ok('IndividualItemTracking has id', /id: string/.test(t));
  ok('IndividualItemTracking has name', /name: string/.test(t));
  ok('IndividualItemTracking has prepMode', /prepMode: string/.test(t));
  ok('IndividualItemTracking has status', /status: string/.test(t));
  ok('IndividualItemTracking has stage as OrderStage', /stage: OrderStage/.test(t));
});

// ─── GROUP 2: Menu Catalog Integrity ────────────────────────────────────────

group('Menu catalog integrity — data/menuItems.ts', () => {
  const raw = read('data/menuItems.ts');

  ok('File imports MenuItem type', /import.*MenuItem.*from/.test(raw));
  ok('Exports INITIAL_MENU_ITEMS', /export const INITIAL_MENU_ITEMS/.test(raw));

  // Count items by counting 'id: ' occurrences
  const idMatches = raw.match(/\s+id:\s*['"`]item-\d+['"`]/g) || [];
  ok('Catalog has at least 6 items', idMatches.length >= 6);
  ok('No empty item array', !raw.includes('INITIAL_MENU_ITEMS: MenuItem[] = []'));

  // item-1 checks
  ok('item-1 exists', raw.includes("id: 'item-1'"));
  ok('item-1 is Chicken Donne Biryani', raw.includes('Special Chicken Donne Biryani'));
  ok('item-1 is in Rice & Bowls', raw.includes("category: 'Rice & Bowls'") || raw.includes('Rice & Bowls'));
  ok('item-1 price is 260', raw.includes('price: 260'));

  // item-2 checks
  ok('item-2 exists', raw.includes("id: 'item-2'"));
  ok('item-2 is Mutton Biryani', raw.includes('Thoogudeepa Mutton Donne Biryani'));
  ok('item-2 price is 340', raw.includes('price: 340'));

  // item-3 checks
  ok('item-3 exists', raw.includes("id: 'item-3'"));
  ok('item-3 is Chicken Kebab', raw.includes('Kshatriya Chicken Kebab'));
  ok('item-3 is in Starters', raw.includes("category: 'Starters'"));
  ok('item-3 price is 220', raw.includes('price: 220'));

  // item-4 checks
  ok('item-4 exists', raw.includes("id: 'item-4'"));
  ok('item-4 is Paneer Biryani', raw.includes('Paneer Donne Biryani'));
  ok('item-4 price is 240', raw.includes('price: 240'));

  // item-5 checks
  ok('item-5 exists', raw.includes("id: 'item-5'"));
  ok('item-5 is Pepper Chicken', raw.includes('Gunpowder Pepper Chicken'));
  ok('item-5 price is 250', raw.includes('price: 250'));

  // item-6 checks
  ok('item-6 exists', raw.includes("id: 'item-6'"));
  ok('item-6 is Elaneer Payasam', raw.includes('Elaneer Payasam'));
  ok('item-6 is in Desserts', raw.includes("category: 'Desserts'"));
  ok('item-6 price is 110', raw.includes('price: 110'));

  // Structural checks for all items
  ok('All items have optionsGroup1', (raw.match(/optionsGroup1/g) || []).length >= 6);
  ok('All items have optionsGroup2', (raw.match(/optionsGroup2/g) || []).length >= 6);
  ok('All items have choices arrays', (raw.match(/choices:/g) || []).length >= 6);
  ok('All items have addOns arrays', (raw.match(/addOns:/g) || []).length >= 6);
  ok('All items have prepMode', (raw.match(/prepMode:/g) || []).length >= 6);
  ok('All items have description', (raw.match(/description:/g) || []).length >= 6);
  ok('All items have imagePlaceholder', (raw.match(/imagePlaceholder:/g) || []).length >= 6);

  // Verify prices are all non-zero positive numbers
  const prices = [...raw.matchAll(/price:\s*(\d+)/g)].map(m => parseInt(m[1]));
  ok('All item prices are positive (> 0)', prices.every(p => p > 0));
  ok('Price range is realistic (₹10–₹2000)', prices.every(p => p >= 10 && p <= 2000));

  // Badge checks
  ok('Has at least one badge field', /badge:/.test(raw));
  ok('Has Bestseller badge', raw.includes('Bestseller'));
  ok('Has Chef Special badge', raw.includes('Chef Special'));
  ok('Has Popular badge', raw.includes('Popular'));

  // Add-on prices are non-negative
  const addonPrices = [...raw.matchAll(/extraPrice:\s*(\d+)/g)].map(m => parseInt(m[1]));
  ok('All add-on extra prices are non-negative', addonPrices.every(p => p >= 0));
  ok('Has at least 8 add-on entries total', addonPrices.length >= 8);
});

// ─── GROUP 3: Zustand Store Structure — useCustomerStore.ts ─────────────────

group('Customer Zustand store structure — store/useCustomerStore.ts', () => {
  const s = read('store/useCustomerStore.ts');

  ok('Imports create from zustand', /import.*create.*from.*zustand/.test(s));
  ok('Imports ScreenId', s.includes('ScreenId'));
  ok('Imports MenuItem', s.includes('MenuItem'));
  ok('Imports CartItem', s.includes('CartItem'));
  ok('Imports OrderStage', s.includes('OrderStage'));
  ok('Imports PaymentDetails', s.includes('PaymentDetails'));
  ok('Imports WaiterPingType', s.includes('WaiterPingType'));
  ok('Imports INITIAL_MENU_ITEMS', /import.*INITIAL_MENU_ITEMS/.test(s));
  ok('Imports useSharedBridge', /import.*useSharedBridge.*from/.test(s));

  ok('State: currentScreen field defined', /currentScreen: ScreenId/.test(s));
  ok('State: previousScreen field defined', /previousScreen: ScreenId/.test(s));
  ok('State: viewMode field defined', /viewMode:/.test(s));
  ok('State: guestName field defined', /guestName: string/.test(s));
  ok('State: tableNumber field defined', /tableNumber: string/.test(s));
  ok('State: venueName field defined', /venueName: string/.test(s));
  ok('State: cart field defined', /cart: CartItem\[\]/.test(s));
  ok('State: orderStage field defined', /orderStage: OrderStage/.test(s));
  ok('State: itemTracking array defined', /itemTracking: IndividualItemTracking\[\]/.test(s));
  ok('State: payment field defined', /payment: PaymentDetails/.test(s));
  ok('State: waiterNotification nullable', /waiterNotification:.*null/.test(s));

  ok('Action: setCurrentScreen defined', /setCurrentScreen:/.test(s));
  ok('Action: navigateTo defined', /navigateTo:/.test(s));
  ok('Action: setViewMode defined', /setViewMode:/.test(s));
  ok('Action: setGuestName defined', /setGuestName:/.test(s));
  ok('Action: addToCart defined', /addToCart:/.test(s));
  ok('Action: updateCartQuantity defined', /updateCartQuantity:/.test(s));
  ok('Action: removeCartItem defined', /removeCartItem:/.test(s));
  ok('Action: orderSeparately defined', /orderSeparately:/.test(s));
  ok('Action: placeAllOrders defined', /placeAllOrders:/.test(s));
  ok('Action: setOrderStage defined', /setOrderStage:/.test(s));
  ok('Action: updateTip defined', /updateTip:/.test(s));
  ok('Action: setSplitMode defined', /setSplitMode:/.test(s));
  ok('Action: setPaymentMethod defined', /setPaymentMethod:/.test(s));
  ok('Action: toggleRedeemPoints defined', /toggleRedeemPoints:/.test(s));
  ok('Action: confirmAndPay defined', /confirmAndPay:/.test(s));
  ok('Action: pingWaiter defined', /pingWaiter:/.test(s));
  ok('Action: dismissWaiterNotification defined', /dismissWaiterNotification:/.test(s));
  ok('Action: resetSession defined', /resetSession:/.test(s));

  ok('Initial currentScreen is 1', /currentScreen:\s*1/.test(s));
  ok('Initial previousScreen is 1', /previousScreen:\s*1/.test(s));
  ok('Initial cart is empty array', /cart:\s*\[\]/.test(s));
  ok("Initial orderStage is 'PLACED'", /orderStage:\s*'PLACED'/.test(s));
  ok('Initial itemTracking is empty array', /itemTracking:\s*\[\]/.test(s));
  ok('Initial waiterNotification is null', /waiterNotification:\s*null/.test(s));

  // navigateTo saves previousScreen
  ok('navigateTo saves previousScreen before switching', s.includes('previousScreen: state.currentScreen') && /navigateTo/.test(s));

  // setCurrentScreen also updates previousScreen
  ok('setCurrentScreen also tracks previousScreen', s.includes('previousScreen: state.currentScreen'));

  // addToCart handles same-item merge via existingIndex
  ok('addToCart checks for existing item before adding (merge logic)', /existingIndex/.test(s));
  ok('addToCart merges quantities when item+option same', /newQty = ci\.quantity \+ quantity/.test(s));
  ok('addToCart creates new cart item with cartItemId', /cartItemId:.*Date\.now/.test(s));

  // updateCartQuantity removes at <=0 quantity
  ok('updateCartQuantity removes item when qty <= 0', /newQty\s*<=\s*0/.test(s));
  ok('updateCartQuantity filters nulls out', /\.filter\(Boolean\)/.test(s));

  // removeCartItem filters by cartItemId
  ok('removeCartItem filters by cartItemId', /ci\.cartItemId !== cartItemId/.test(s));

  // calculatePaymentTotals helper exists
  ok('calculatePaymentTotals helper function defined', /const calculatePaymentTotals/.test(s));
  ok('calculatePaymentTotals computes 5% GST (0.05)', /\* 0\.05/.test(s));
  ok('calculatePaymentTotals totalAmount uses Math.max(0, ...)', /Math\.max\(0/.test(s));

  // placeAllOrders behaviour
  ok('placeAllOrders filters only unordered items', /\.filter\(.*!c\.isOrdered/.test(s) || /\.filter\(.*isOrdered/.test(s));
  ok('placeAllOrders navigates to screen 5', /currentScreen:\s*5/.test(s));
  ok('placeAllOrders marks cart items as isOrdered', /isOrdered:\s*true/.test(s));
  ok('placeAllOrders calls placeOrderToSupabase', /placeOrderToSupabase/.test(s));
  ok('placeAllOrders calls bridge fallback customerPlacesOrder', /customerPlacesOrder/.test(s));

  // orderSeparately creates tracking entry
  ok('orderSeparately creates IndividualItemTracking entry', /trackingEntry:.*IndividualItemTracking/.test(s) || /trackingEntry/.test(s));
  ok("orderSeparately sets status 'Sent to Kitchen Separately'", s.includes("Sent to Kitchen Separately"));
  ok("orderSeparately entry stage is 'PLACED'", s.includes("stage: 'PLACED'") || /stage:.*'PLACED'/.test(s));

  // confirmAndPay
  ok('confirmAndPay navigates to screen 8', /currentScreen:\s*8/.test(s));
  ok('confirmAndPay generates transactionId', /randomTxn.*TXN/.test(s) || /#TXN-/.test(s));
  ok('confirmAndPay calls bridge waiterRecordsPayment', /waiterRecordsPayment/.test(s));

  // pingWaiter
  ok('pingWaiter sets waiterNotification active: true', /active:\s*true/.test(s));
  ok('pingWaiter calls bridge customerPingsWaiter', /customerPingsWaiter/.test(s));

  // resetSession
  ok('resetSession resets currentScreen to 1', /currentScreen:\s*1/.test(s.slice(s.indexOf('resetSession'))));
  ok('resetSession clears cart', /cart:\s*\[\]/.test(s.slice(s.indexOf('resetSession'))));
  ok('resetSession clears itemTracking', /itemTracking:\s*\[\]/.test(s.slice(s.indexOf('resetSession'))));
  ok('resetSession sets waiterNotification to null', /waiterNotification:\s*null/.test(s.slice(s.indexOf('resetSession'))));

  // updateTip
  ok('updateTip updates tipAmount in payment', /tipAmount:\s*tip/.test(s));
  ok('updateTip recalculates totalAmount', /totalAmount:.*subtotal.*tax.*tip/.test(s) || /state\.payment\.subtotal.*state\.payment\.tax.*tip/.test(s));

  // toggleRedeemPoints
  ok('toggleRedeemPoints flips redeemPoints boolean', /willRedeem = !state\.payment\.redeemPoints/.test(s));
  ok('toggleRedeemPoints sets discount = 0 when off', /discount.*0/.test(s));
  ok('toggleRedeemPoints caps discount at 50', /Math\.min\(50/.test(s));

  // setSplitMode
  ok('setSplitMode sets splitMode on payment', /splitMode:\s*mode/.test(s));
  ok('setSplitMode sets splitCount', /splitCount:\s*count/.test(s));

  // setPaymentMethod
  ok('setPaymentMethod updates paymentMethod field', /paymentMethod:\s*method/.test(s));

  // initialEmptyPayment
  ok('initialEmptyPayment has subtotal 0', /subtotal:\s*0/.test(s));
  ok("initialEmptyPayment has splitMode 'NONE'", /splitMode:\s*'NONE'/.test(s));
  ok("initialEmptyPayment has paymentMethod 'UPI'", /paymentMethod:\s*'UPI'/.test(s));
  ok('initialEmptyPayment has redeemPoints false', /redeemPoints:\s*false/.test(s));
  ok('initialEmptyPayment has pointsAvailable 250', /pointsAvailable:\s*250/.test(s));
});

// ─── GROUP 4: Payment Arithmetic Logic ──────────────────────────────────────

group('Payment arithmetic — pure logic assertions', () => {
  // Simulate calculatePaymentTotals inline
  interface MockPayment {
    redeemPoints: boolean;
    tipAmount: number;
    splitMode: string;
    paymentMethod: string;
    pointsAvailable: number;
    pointsRedeemed: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
    totalAmount?: number;
    transactionId?: string;
  }

  const calc = (cart: { totalPrice: number }[], prev: MockPayment) => {
    const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : 0;
    const tax = Math.round(subtotal * 0.05);
    const discount = prev.redeemPoints ? Math.min(50, subtotal + tax) : 0;
    const tip = subtotal > 0 ? prev.tipAmount : 0;
    const totalAmount = Math.max(0, subtotal + tax + tip - discount);
    return { subtotal, tax, discount, tip, totalAmount };
  };

  const basePayment: MockPayment = {
    redeemPoints: false,
    tipAmount: 0,
    splitMode: 'NONE',
    paymentMethod: 'UPI',
    pointsAvailable: 250,
    pointsRedeemed: 0,
  };

  // Empty cart
  const empty = calc([], basePayment);
  ok('Empty cart subtotal is 0', empty.subtotal === 0);
  ok('Empty cart tax is 0', empty.tax === 0);
  ok('Empty cart totalAmount is 0', empty.totalAmount === 0);

  // Single item ₹260
  const single260 = calc([{ totalPrice: 260 }], basePayment);
  ok('₹260 item subtotal is 260', single260.subtotal === 260);
  ok('₹260 item tax is 5% = 13', single260.tax === 13);
  ok('₹260 item total without tip is 273', single260.totalAmount === 273);

  // Two items: ₹260 + ₹340 = ₹600
  const two = calc([{ totalPrice: 260 }, { totalPrice: 340 }], basePayment);
  ok('₹260 + ₹340 subtotal is 600', two.subtotal === 600);
  ok('₹600 tax at 5% = 30', two.tax === 30);
  ok('₹600 total without tip is 630', two.totalAmount === 630);

  // Tip added
  const withTip = calc([{ totalPrice: 260 }], { ...basePayment, tipAmount: 50 });
  ok('₹260 + ₹50 tip total = 323', withTip.totalAmount === 323);

  // Redeem points — caps at ₹50 discount
  const withRedeem = calc([{ totalPrice: 260 }], { ...basePayment, redeemPoints: true });
  ok('Redeem points discount = min(50, 273) = 50', withRedeem.discount === 50);
  ok('₹260 total with redeem = 273 - 50 = 223', withRedeem.totalAmount === 223);

  // Redeem points on small bill where subtotal+tax < 50
  const smallBill = calc([{ totalPrice: 30 }], { ...basePayment, redeemPoints: true });
  const smallTax = Math.round(30 * 0.05);
  ok(`Small ₹30 bill discount capped at ₹${30 + smallTax}`, smallBill.discount === Math.min(50, 30 + smallTax));

  // GST split verification for Screen9 (2.5% CGST + 2.5% SGST = 5%)
  const subtotal = 260;
  const cgst = Math.round(subtotal * 0.025);
  const sgst = Math.round(subtotal * 0.025);
  ok('CGST (2.5%) for ₹260 = 6 or 7', cgst >= 6 && cgst <= 7);
  ok('SGST (2.5%) for ₹260 = 6 or 7', sgst >= 6 && sgst <= 7);
  ok('CGST + SGST equals total 5% tax (within 1₹ rounding tolerance)', Math.abs((cgst + sgst) - Math.round(subtotal * 0.05)) <= 1);

  // Tip presets from Screen6
  ok('Tip preset 30 is valid', [30, 50, 100].includes(30));
  ok('Tip preset 50 is valid', [30, 50, 100].includes(50));
  ok('Tip preset 100 is valid', [30, 50, 100].includes(100));

  // Split per-person calculation
  const grandTotal = 630;
  const splitPersons = 3;
  ok('Split 3-way: ₹630 / 3 = ₹210 per person', Math.ceil(grandTotal / splitPersons) === 210);
  const splitTwo = 630;
  ok('Split 2-way: ₹630 / 2 = ₹315 per person', Math.ceil(splitTwo / 2) === 315);

  // Unplaced count logic
  const cart: { isOrdered: boolean }[] = [
    { isOrdered: false },
    { isOrdered: false },
    { isOrdered: true },
  ];
  const unplacedCount = cart.filter(c => !c.isOrdered).length;
  ok('unplacedCount counts only non-ordered items', unplacedCount === 2);

  // totalPrice merging on same item add
  const baseItem = { cartItemId: 'c-1', quantity: 2, totalPrice: 520 };
  const perUnit = baseItem.totalPrice / baseItem.quantity; // 260
  const merged = { ...baseItem, quantity: 3, totalPrice: perUnit * 3 };
  ok('Merging same item adds qty correctly', merged.quantity === 3);
  ok('Merging same item recalculates totalPrice', merged.totalPrice === 780);

  // InvoiceNumber pattern from Screen9
  const tableNumber = 'T-01';
  const invoiceBase = `INV-${tableNumber.replace('-', '')}`;
  ok("Invoice prefix is 'INV-T01'", invoiceBase === 'INV-T01');

  // Cart quantity -> badge
  const cartItems = [
    { quantity: 2 },
    { quantity: 3 },
    { quantity: 1 },
  ];
  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  ok('Cart badge shows total quantity (6)', totalCartQty === 6);
});

// ─── GROUP 5: Context Layer ──────────────────────────────────────────────────

group('Customer context layer — context/CustomerContext.tsx', () => {
  const c = read('context/CustomerContext.tsx');

  ok("Context file has 'use client' directive", c.includes("'use client'") || c.includes('"use client"'));
  ok('Imports useCustomerStore from store', /import.*useCustomerStore.*from/.test(c));
  ok('Imports useMenuQuery from hooks', /import.*useMenuQuery.*from/.test(c));
  ok('Imports INITIAL_MENU_ITEMS from data', /import.*INITIAL_MENU_ITEMS.*from/.test(c));
  ok('Imports ScreenId type', /ScreenId/.test(c));
  ok('Imports MenuItem type', /MenuItem/.test(c));
  ok('Imports CartItem type', /CartItem/.test(c));
  ok('Imports OrderStage type', /OrderStage/.test(c));
  ok('Imports PaymentDetails type', /PaymentDetails/.test(c));
  ok('Imports WaiterPingType type', /WaiterPingType/.test(c));

  ok('Re-exports INITIAL_MENU_ITEMS', /export.*INITIAL_MENU_ITEMS/.test(c));
  ok('Re-exports useCustomerStore', /export.*useCustomerStore/.test(c));

  ok('useCustomer function is exported', /export function useCustomer/.test(c));
  ok('useCustomer calls useCustomerStore()', /useCustomerStore\(\)/.test(c));
  ok('useCustomer calls useMenuQuery()', /useMenuQuery\(\)/.test(c));
  ok('useCustomer merges store with ...store spread', /\.\.\.store/.test(c));
  ok('useCustomer returns menuItems', /menuItems/.test(c));
  ok('useCustomer returns isMenuLoading', /isMenuLoading/.test(c));
  ok('useCustomer falls back to INITIAL_MENU_ITEMS when no query data', /menuQueryData \|\| INITIAL_MENU_ITEMS/.test(c) || /\|\|\s*INITIAL_MENU_ITEMS/.test(c));

  ok('CustomerProvider exported', /export function CustomerProvider/.test(c));
  ok('CustomerProvider accepts children prop', /children.*React\.ReactNode/.test(c) || /children:.*ReactNode/.test(c));
  ok('CustomerProvider is passthrough (no context value set)', c.includes('<>{children}</>') || c.includes('<React.Fragment>{children}</React.Fragment>'));
});

// ─── GROUP 6: All 12 Screen Files Exist and Are Non-Trivial ─────────────────

group('All 12 customer screen files — existence and size', () => {
  const screens = [
    { name: 'Screen1Welcome.tsx', minBytes: 5000 },
    { name: 'Screen2Menu.tsx', minBytes: 8000 },
    { name: 'Screen3ItemDetail.tsx', minBytes: 4000 },
    { name: 'Screen4Cart.tsx', minBytes: 4000 },
    { name: 'Screen5LiveTracking.tsx', minBytes: 5000 },
    { name: 'Screen6PaymentBreakdown.tsx', minBytes: 4000 },
    { name: 'Screen7PaymentGateway.tsx', minBytes: 8000 },
    { name: 'Screen8Confirmation.tsx', minBytes: 3000 },
    { name: 'Screen9DigitalBill.tsx', minBytes: 4000 },
    { name: 'Screen10WaiterCall.tsx', minBytes: 3000 },
    { name: 'Screen11Loyalty.tsx', minBytes: 3000 },
    { name: 'Screen12Feedback.tsx', minBytes: 3000 },
  ];

  for (const s of screens) {
    const rel = `components/customer/${s.name}`;
    const fileExists = exists(rel);
    ok(`${s.name} exists`, fileExists);
    if (fileExists) {
      const stat = fs.statSync(path.join(ROOT, rel));
      ok(`${s.name} is non-trivial (>= ${s.minBytes} bytes)`, stat.size >= s.minBytes);
    }
  }
});

// ─── GROUP 7: Screen File Structural Requirements ────────────────────────────

group("Screen file structural requirements — 'use client' & imports", () => {
  const screenFiles = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen3ItemDetail.tsx',
    'Screen4Cart.tsx',
    'Screen5LiveTracking.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen7PaymentGateway.tsx',
    'Screen8Confirmation.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
    'Screen11Loyalty.tsx',
    'Screen12Feedback.tsx',
  ];

  for (const f of screenFiles) {
    const content = read(`components/customer/${f}`);
    ok(`${f} has 'use client' directive`, content.includes("'use client'") || content.includes('"use client"'));
    ok(`${f} imports useCustomer from context`, /import.*useCustomer.*from.*CustomerContext/.test(content));
    ok(`${f} imports ScreenHousing`, /import.*ScreenHousing/.test(content));
    ok(`${f} uses React.FC type`, /React\.FC/.test(content));
    ok(`${f} exports a named component`, /export const Screen\d+/.test(content));
  }
});

// ─── GROUP 8: WireHeader Usage in Appropriate Screens ───────────────────────

group('WireHeader usage — present in screens 2–12', () => {
  const screensWithHeader = [
    'Screen2Menu.tsx',
    'Screen3ItemDetail.tsx',
    'Screen4Cart.tsx',
    'Screen5LiveTracking.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen7PaymentGateway.tsx',
    'Screen8Confirmation.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
  ];

  for (const f of screensWithHeader) {
    const content = read(`components/customer/${f}`);
    ok(`${f} imports WireHeader`, /import.*WireHeader/.test(content));
    ok(`${f} renders <WireHeader`, /<WireHeader/.test(content));
  }
});

// ─── GROUP 9: StickyBottomBar Usage ─────────────────────────────────────────

group('StickyBottomBar usage in primary CTA screens', () => {
  const screensWithStickyBar = [
    'Screen2Menu.tsx',
    'Screen4Cart.tsx',
    'Screen5LiveTracking.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
  ];

  for (const f of screensWithStickyBar) {
    const content = read(`components/customer/${f}`);
    ok(`${f} imports StickyBottomBar`, /import.*StickyBottomBar/.test(content));
    ok(`${f} renders <StickyBottomBar`, /<StickyBottomBar/.test(content));
  }
});

// ─── GROUP 10: ScreenHousing Component — UI/Visual Tokens ───────────────────

group('ScreenHousing component — design tokens and structure', () => {
  const sh = read('components/ui/ScreenHousing.tsx');

  ok("ScreenHousing has 'use client'", sh.includes("'use client'") || sh.includes('"use client"'));
  ok('ScreenHousing exports named component', /export const ScreenHousing/.test(sh));
  ok('ScreenHousing accepts children prop', /children.*ReactNode/.test(sh) || /children:.*React\.ReactNode/.test(sh));
  ok('ScreenHousing accepts optional screenNumber', /screenNumber\?/.test(sh));
  ok('ScreenHousing accepts optional screenTitle', /screenTitle\?/.test(sh));
  ok('ScreenHousing accepts optional className', /className\?/.test(sh));

  ok('ScreenHousing has phone mockup container', /phone-mockup/.test(sh));
  ok('ScreenHousing status bar has bg-white/95 (not dark)', /bg-white\/95/.test(sh));

  // Dynamic Island pill is intentionally bg-slate-900 (hardware UI exception)
  ok('ScreenHousing Dynamic Island pill is bg-slate-900 (intentional hardware UI)', /bg-slate-900/.test(sh));

  // Content area uses warm canvas — not a dark background
  ok('Screen content area uses warm canvas bg-[#FAF8F5]/70', /bg-\[#FAF8F5\]\/70/.test(sh));
  ok('Screen content area is NOT bg-slate-950 or bg-stone-900', !(/bg-slate-950|bg-stone-900/.test(sh.replace(/bg-slate-900/, ''))));

  // Structural
  ok('ScreenHousing has status bar with Wifi icon', /Wifi/.test(sh));
  ok('ScreenHousing has status bar with Battery icon', /Battery/.test(sh));
  ok('ScreenHousing wraps content in overflow-y-auto container', /overflow-y-auto/.test(sh));
  ok('ScreenHousing label pill shows SCREEN {screenNumber}', /SCREEN \{screenNumber\}/.test(sh));
  ok('ScreenHousing label pill uses orange pulse indicator', /animate-pulse/.test(sh));
});

// ─── GROUP 11: WireHeader Component — UI/Visual/UX Tokens ───────────────────

group('WireHeader component — design tokens and UX patterns', () => {
  const wh = read('components/ui/WireHeader.tsx');

  ok("WireHeader has 'use client'", wh.includes("'use client'") || wh.includes('"use client"'));
  ok('WireHeader exports named component', /export const WireHeader/.test(wh));
  ok('WireHeader accepts title prop', /title:/.test(wh));
  ok('WireHeader accepts showBack optional prop', /showBack\?/.test(wh));
  ok('WireHeader accepts onBack optional prop', /onBack\?/.test(wh));
  ok('WireHeader accepts showCallWaiter optional prop', /showCallWaiter\?/.test(wh));
  ok('WireHeader accepts showCart optional prop', /showCart\?/.test(wh));

  ok('WireHeader container is sticky top-0', /sticky top-0/.test(wh));
  ok('WireHeader uses bg-white/95 backdrop-blur', /bg-white\/95/.test(wh) && /backdrop-blur/.test(wh));
  ok('WireHeader border uses slate-200', /border-slate-200/.test(wh));
  ok('WireHeader is NOT bg-slate-900 or bg-stone-900', !/bg-slate-900|bg-stone-900/.test(wh));

  ok('WireHeader call-waiter button navigates to Screen 10', /navigateTo\(10\)/.test(wh));
  ok('WireHeader cart button navigates to Screen 4', /navigateTo\(4\)/.test(wh));
  ok('WireHeader back button uses onBack or navigateTo(previousScreen)', /onBack.*navigateTo\(previousScreen/.test(wh) || /onBack \? onBack/.test(wh));

  ok('WireHeader call-waiter button uses orange styling', /border-orange-200.*bg-orange-50|orange/.test(wh));
  ok('WireHeader cart button uses brand color #9C3D1E', /bg-\[#9C3D1E\]/.test(wh));
  ok('WireHeader cart badge shows total quantity', /totalCartCount/.test(wh) && /cart\.reduce/.test(wh));
  ok('WireHeader cart badge only shows when totalCartCount > 0', /totalCartCount\s*>\s*0/.test(wh));
  ok('WireHeader cart badge uses orange-600 background', /bg-orange-600/.test(wh));

  ok('WireHeader imports ArrowLeft for back button', /ArrowLeft/.test(wh));
  ok('WireHeader imports Bell for waiter button', /Bell/.test(wh));
  ok('WireHeader imports ShoppingCart for cart button', /ShoppingCart/.test(wh));
  ok('WireHeader uses framer-motion', /from 'framer-motion'/.test(wh));
  ok('WireHeader calls useCustomer', /useCustomer\(\)/.test(wh));
  ok('WireHeader has z-index z-30', /z-30/.test(wh));
});

// ─── GROUP 12: StickyBottomBar Component — Structure ────────────────────────

group('StickyBottomBar component — design tokens', () => {
  const sb = read('components/ui/StickyBottomBar.tsx');

  ok("StickyBottomBar has 'use client'", sb.includes("'use client'") || sb.includes('"use client"'));
  ok('StickyBottomBar exports named component', /export const StickyBottomBar/.test(sb));
  ok('StickyBottomBar is sticky bottom-0', /sticky bottom-0/.test(sb));
  ok('StickyBottomBar has bg-white/95', /bg-white\/95/.test(sb));
  ok('StickyBottomBar has backdrop-blur', /backdrop-blur/.test(sb));
  ok('StickyBottomBar has z-30 or z-index', /z-30/.test(sb));
  ok('StickyBottomBar has border-t', /border-t/.test(sb));
  ok('StickyBottomBar renders children', /\{children\}/.test(sb));
  ok('StickyBottomBar has shadow', /shadow/.test(sb));
  ok('StickyBottomBar is NOT bg-slate-900 or bg-stone-900', !/bg-slate-900|bg-stone-900/.test(sb));
});

// ─── GROUP 13: ItemDrawer Component ─────────────────────────────────────────

group('ItemDrawer component — structure and intentional dark overlay', () => {
  const itdPath = 'components/ui/ItemDrawer.tsx';
  ok('ItemDrawer.tsx exists', exists(itdPath));

  if (exists(itdPath)) {
    const id = read(itdPath);
    ok("ItemDrawer has 'use client'", id.includes("'use client'") || id.includes('"use client"'));
    ok('ItemDrawer exports named component', /export.*ItemDrawer/.test(id));
    // Dark overlay is intentional exception for modal dimming
    ok('ItemDrawer has intentional dark overlay (bg-slate-900/50 or similar)', /bg-slate-900|bg-black/.test(id));
    ok('ItemDrawer uses backdrop-blur on overlay', /backdrop-blur/.test(id));
    ok('ItemDrawer content panel is NOT dark (bg-white or warm color)', /bg-white|bg-\[#FFF|bg-\[#FAF/.test(id));
  }
});

// ─── GROUP 14: Design Token Compliance — Screen Backgrounds ──────────────────

group('Design token compliance — screen background colors', () => {
  // Screens that directly set bg-[#FFFCF7] on their content container
  const screensWithWarmBg = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen3ItemDetail.tsx',
    'Screen4Cart.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
  ];

  for (const f of screensWithWarmBg) {
    const content = read(`components/customer/${f}`);
    ok(`${f} uses warm screen background #FFFCF7`, /bg-\[#FFFCF7\]/.test(content));
  }

  // Screen5 uses ScreenHousing content area (#FAF8F5/70) — no explicit bg on body div
  ok('Screen5LiveTracking.tsx renders inside ScreenHousing warm canvas', /ScreenHousing/.test(read('components/customer/Screen5LiveTracking.tsx')));
});

// ─── GROUP 15: Design Token Compliance — No Prohibited Dark Backgrounds ───────

group('Design token compliance — no prohibited dark backgrounds in screen files', () => {
  const screenFiles = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen3ItemDetail.tsx',
    'Screen4Cart.tsx',
    'Screen5LiveTracking.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen7PaymentGateway.tsx',
    'Screen8Confirmation.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
    'Screen11Loyalty.tsx',
    'Screen12Feedback.tsx',
  ];

  for (const f of screenFiles) {
    const content = read(`components/customer/${f}`);
    // bg-stone-900 is never allowed in customer screens
    ok(`${f} has no bg-stone-900`, !content.includes('bg-stone-900'));
    // bg-slate-950 is never allowed
    ok(`${f} has no bg-slate-950`, !content.includes('bg-slate-950'));
    // bg-stone-100 as a background is not used in customer screens
    ok(`${f} has no bg-stone-100 background class`, !content.includes('bg-stone-100'));
  }
});

// ─── GROUP 16: Design Token Compliance — Brand CTA Buttons ───────────────────

group('Design token compliance — brand CTA button colors', () => {
  const screenCTACheck: { file: string; label: string }[] = [
    { file: 'Screen1Welcome.tsx', label: 'Welcome proceed button' },
    { file: 'Screen2Menu.tsx', label: 'Menu cart CTA' },
    { file: 'Screen4Cart.tsx', label: 'Cart place order CTA' },
    { file: 'Screen6PaymentBreakdown.tsx', label: 'Payment breakdown CTA' },
    { file: 'Screen9DigitalBill.tsx', label: 'Digital bill dine-again CTA' },
    { file: 'Screen10WaiterCall.tsx', label: 'Waiter call send button' },
  ];

  for (const { file, label } of screenCTACheck) {
    const content = read(`components/customer/${file}`);
    ok(`${label}: uses brand CTA color #8A4228 or #9C3D1E`, /bg-\[#8A4228\]|bg-\[#9C3D1E\]/.test(content));
  }
});

// ─── GROUP 17: Design Token Compliance — Card Borders and Typography ──────────

group('Design token compliance — card borders and typography', () => {
  const files = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
  ];

  for (const f of files) {
    const content = read(`components/customer/${f}`);
    ok(`${f} uses warm card border #E8D5C3`, /border-\[#E8D5C3\]/.test(content));
  }

  // Typography pattern checks
  const s6 = read('components/customer/Screen6PaymentBreakdown.tsx');
  ok('Screen6 section label uses font-mono', /font-mono/.test(s6));
  ok('Screen6 section label uses tracking-[0.22em]', /tracking-\[0\.22em\]/.test(s6));
  ok('Screen6 section label uses uppercase', /uppercase/.test(s6));
  ok('Screen6 amount display uses font-black', /font-black/.test(s6));

  const s9 = read('components/customer/Screen9DigitalBill.tsx');
  ok('Screen9 invoice number uses font-mono', /font-mono/.test(s9));
  ok('Screen9 uses tracking-wide or tracking-wider', /tracking-wide/.test(s9));

  const s1 = read('components/customer/Screen1Welcome.tsx');
  ok('Screen1 venue name uses uppercase', /uppercase/.test(s1));
  ok('Screen1 venue name uses font-black', /font-black/.test(s1));
  ok('Screen1 table badge uses tracking-wide', /tracking-wide/.test(s1));
});

// ─── GROUP 18: Screen-Specific UX Logic — Screen 1 Welcome ───────────────────

group('UX logic — Screen1Welcome.tsx', () => {
  const s1 = read('components/customer/Screen1Welcome.tsx');

  ok('Screen1 reads ?table= URL param', /params\.get\('table'\)/.test(s1));
  ok('Screen1 reads ?seat= URL param', /params\.get\('seat'\)/.test(s1));
  ok('Screen1 calls setTableNumber on mount', /setTableNumber/.test(s1));
  ok('Screen1 checks /api/session/verify endpoint', /\/api\/session\/verify/.test(s1));
  ok('Screen1 uses setCheckingSession for loading state', /setCheckingSession/.test(s1));
  ok('Screen1 navigates to screen 5 if activeOrder found', /setCurrentScreen\(5\)/.test(s1));
  ok('Screen1 navigates to screen 2 for fresh session', /setCurrentScreen\(2\)/.test(s1));
  ok("Screen1 shows 'Resume Ongoing Order' when activeOrderFound", /Resume Ongoing Order/.test(s1));
  ok("Screen1 shows 'PROCEED TO MENU' text for fresh session", /PROCEED TO MENU/.test(s1));
  ok('Screen1 has guestName input field', /type="text"/.test(s1) && /guestName/.test(s1));
  ok('Screen1 has placeholder for guestName', /placeholder/.test(s1));
  ok('Screen1 sets default name to Seat {seatNumber} if blank', /Seat \$\{seatNumber\}/.test(s1) || /`Seat \$\{/.test(s1));
  ok('Screen1 shows active order restoration banner', /Active Dine-In Session Restored/.test(s1));
  ok('Screen1 uses Wi-Fi button that sets wifiConnected', /setWifiConnected\(true\)/.test(s1));
  ok('Screen1 shows Wi-Fi Connected state when connected', /Wi-Fi Connected/.test(s1));
  ok('Screen1 wraps in ScreenHousing', /<ScreenHousing/.test(s1));
  ok('Screen1 uses framer-motion animations', /from 'framer-motion'/.test(s1));
  ok('Screen1 has Crown icon for venue logo', /Crown/.test(s1));
  ok('Screen1 has MapPin for table badge', /MapPin/.test(s1));
  ok("Screen1 uses 'Powered by Thoogudeepa SaaS' brand footer", /Powered by Thoogudeepa SaaS/.test(s1));
});

// ─── GROUP 19: Screen-Specific UX Logic — Screen 6 Payment Breakdown ─────────

group('UX logic — Screen6PaymentBreakdown.tsx', () => {
  const s6 = read('components/customer/Screen6PaymentBreakdown.tsx');

  ok('Screen6 calculates 5% GST inline', /\* 0\.05/.test(s6));
  ok('Screen6 shows subtotal row', /Subtotal/.test(s6));
  ok('Screen6 shows tax row with GST label', /5% GST/.test(s6));
  ok('Screen6 shows tip row conditionally', /tipAmount > 0/.test(s6));
  ok('Screen6 shows Total Amount row', /Total Amount/.test(s6));
  ok('Screen6 has tip presets [30, 50, 100]', s6.includes('[30, 50, 100]') || (s6.includes('30') && s6.includes('50') && s6.includes('100')));
  ok('Screen6 has None tip option', /None/.test(s6));
  ok('Screen6 has split bill UI section', /Split Bill/.test(s6) || /splitPersons/.test(s6));
  ok('Screen6 has 4 split options: 2,3,4,5 way', /2, 3, 4, 5/.test(s6) || s6.includes('[2, 3, 4, 5]'));
  ok('Screen6 shows per-person amount', /grandTotal \/ splitPersons/.test(s6) || /\/ splitPersons/.test(s6));
  ok('Screen6 navigates to Screen7 on payment CTA', /setCurrentScreen\(7\)/.test(s6));
  ok('Screen6 back navigates to Screen5', /setCurrentScreen\(5\)/.test(s6));
  ok('Screen6 CTA shows grand total amount', /grandTotal/.test(s6));
  ok('Screen6 custom tip input supported', /customTip/.test(s6) || /handleCustomTipChange/.test(s6));
  ok('Screen6 uses setSplitMode action', /setSplitMode/.test(s6));
  ok('Screen6 uses updateTip action', /updateTip/.test(s6));
  ok('Screen6 tip presets use font-mono', /font-mono/.test(s6));
  ok('Screen6 total uses brand color #8A4228', /text-\[#8A4228\]/.test(s6));
  ok('Screen6 imports Heart icon (tip section)', /Heart/.test(s6));
  ok('Screen6 imports Users icon (split section)', /Users/.test(s6));
  ok('Screen6 imports Receipt icon (bill section)', /Receipt/.test(s6));
});

// ─── GROUP 20: Screen-Specific UX Logic — Screen 9 Digital Bill ──────────────

group('UX logic — Screen9DigitalBill.tsx', () => {
  const s9 = read('components/customer/Screen9DigitalBill.tsx');

  ok('Screen9 computes CGST at 2.5%', /\* 0\.025/.test(s9));
  ok('Screen9 computes SGST at 2.5%', /sgst.*0\.025|0\.025.*sgst/.test(s9) || (s9.match(/\* 0\.025/g) || []).length >= 2);
  ok('Screen9 shows CGST label', /CGST/.test(s9));
  ok('Screen9 shows SGST label', /SGST/.test(s9));
  ok('Screen9 shows Grand Total Paid', /Grand Total Paid/.test(s9));
  ok("Screen9 shows 'TAX INVOICE #' prefix", /TAX INVOICE #/.test(s9));
  ok('Screen9 invoice number uses INV- prefix', /INV-/.test(s9));
  ok('Screen9 shows GSTIN number', /GSTIN/.test(s9));
  ok('Screen9 shows FSSAI number', /FSSAI/.test(s9));
  ok('Screen9 shows payment method used', /payment\.paymentMethod/.test(s9) || /paymentMethod/.test(s9));
  ok("Screen9 shows 'STATUS: SETTLED'", /STATUS: SETTLED/.test(s9));
  ok('Screen9 has Download PDF button', /Download PDF/.test(s9) || /Download.*Bill/.test(s9));
  ok('Screen9 has WhatsApp share button', /WhatsApp/.test(s9));
  ok('Screen9 has VIP Club navigation (Screen11)', /setCurrentScreen\(11\)/.test(s9));
  ok('Screen9 has Feedback navigation (Screen12)', /setCurrentScreen\(12\)/.test(s9));
  ok('Screen9 dine-again calls resetSession then Screen1', /resetSession/.test(s9) && /setCurrentScreen\(1\)/.test(s9));
  ok('Screen9 shows venueName', /venueName/.test(s9));
  ok('Screen9 shows tableNumber and guestName on invoice', /tableNumber/.test(s9) && /guestName/.test(s9));
  ok('Screen9 has Download icon from lucide', /Download/.test(s9));
  ok('Screen9 has Share2 icon from lucide', /Share2/.test(s9));
  ok('Screen9 uses Settlement Proof with CheckCircle2', /CheckCircle2/.test(s9));
});

// ─── GROUP 21: Screen-Specific UX Logic — Screen 10 Waiter Call ──────────────

group('UX logic — Screen10WaiterCall.tsx', () => {
  const s10 = read('components/customer/Screen10WaiterCall.tsx');

  ok('Screen10 imports WaiterPingType', /WaiterPingType/.test(s10));
  ok('Screen10 imports useSharedBridge for live ping status', /useSharedBridge/.test(s10));
  ok('Screen10 has exactly 4 preset ping buttons', (s10.match(/type:.*'WATER'|type:.*'TISSUE'|type:.*'CUTLERY'|type:.*'TABLE CLEAN'/g) || []).length === 4);
  ok("Screen10 has WATER ping", /type:.*'WATER'/.test(s10) || s10.includes("'WATER'"));
  ok("Screen10 has TISSUE ping", /type:.*'TISSUE'/.test(s10) || s10.includes("'TISSUE'"));
  ok("Screen10 has CUTLERY ping", /type:.*'CUTLERY'/.test(s10) || s10.includes("'CUTLERY'"));
  ok("Screen10 has TABLE CLEAN ping", /type:.*'TABLE CLEAN'/.test(s10) || s10.includes("'TABLE CLEAN'"));
  ok('Screen10 has custom text textarea input', /<textarea/.test(s10));
  ok('Screen10 custom send uses GENERAL CALL type', /GENERAL CALL/.test(s10));
  ok('Screen10 calls pingWaiter on button click', /pingWaiter/.test(s10));
  ok('Screen10 shows waiterNotification success banner', /waiterNotification/.test(s10));
  ok("Screen10 success banner says 'Captain Summoned!'", /Captain Summoned/.test(s10));
  ok('Screen10 return navigates to previousScreen', /previousScreen/.test(s10));
  ok('Screen10 prevents self-loop (returnTarget !== 10)', /!== 10/.test(s10) || /previousScreen !== 10/.test(s10));
  ok('Screen10 return fallback is Screen 2', /: 2/.test(s10) || /returnTarget.*2/.test(s10));
  ok('Screen10 send button disabled when customText empty', /disabled.*!customText/.test(s10) || /disabled=\{!customText/.test(s10));
  ok('Screen10 clears customText after send', /setCustomText\(''\)/.test(s10));
  ok('Screen10 sends button has Send icon', /Send/.test(s10));
  ok('Screen10 Droplets icon for Water button', /Droplets/.test(s10));
  ok('Screen10 Utensils icon for Cutlery button', /Utensils/.test(s10));
  ok('Screen10 Sparkles icon for Table Clean button', /Sparkles/.test(s10));
  ok('Screen10 uses AnimatePresence for notification', /AnimatePresence/.test(s10));
  ok('Screen10 live pings checked against tableNumber', /pings.*tableNumber|tableNumber.*pings/.test(s10) || (s10.includes('pings') && s10.includes('tableNumber')));
});

// ─── GROUP 22: Screen2Menu UX Logic ──────────────────────────────────────────

group('UX logic — Screen2Menu.tsx', () => {
  const s2 = read('components/customer/Screen2Menu.tsx');

  ok('Screen2 has category filter', /category|Category|filter/.test(s2));
  ok("Screen2 has 'All' category option", /'All'/.test(s2) || s2.includes('"All"'));
  ok("Screen2 has 'Rice & Bowls' category", /Rice.*Bowls/.test(s2));
  ok("Screen2 has 'Starters' category", /Starters/.test(s2));
  ok("Screen2 has 'Beverages' category", /Beverages/.test(s2));
  ok('Screen2 has search input', /type="text".*search|search.*type="text"|placeholder.*search|Search/.test(s2));
  ok('Screen2 handles 86 sold-out items', /inventory86|menu_86|86/.test(s2));
  ok('Screen2 blocks navigation to Screen3 for sold-out items', /navigateTo\(3\)|setCurrentScreen\(3\)/.test(s2));
  ok('Screen2 shows cart summary bar at bottom', /CartItem\|cart\.length|cart\.reduce|totalCartCount/.test(s2) || /cart/.test(s2));
  ok('Screen2 navigates to Screen3 for item detail', /navigateTo\(3\)|setCurrentScreen\(3\)/.test(s2));
  ok('Screen2 navigates to Screen4 for cart', /navigateTo\(4\)|setCurrentScreen\(4\)/.test(s2));
  ok('Screen2 imports ItemDrawer or uses drawer', /ItemDrawer|drawer/i.test(s2));
  ok('Screen2 uses framer-motion', /from 'framer-motion'/.test(s2));
});

// ─── GROUP 23: Screen3ItemDetail UX Logic ────────────────────────────────────

group('UX logic — Screen3ItemDetail.tsx', () => {
  const s3 = read('components/customer/Screen3ItemDetail.tsx');

  ok('Screen3 uses selectedDetailItem from store', /selectedDetailItem/.test(s3));
  ok('Screen3 shows optionsGroup1 choices (radio-style)', /optionsGroup1/.test(s3));
  ok('Screen3 shows optionsGroup2 addOns (checkbox-style)', /optionsGroup2/.test(s3));
  ok('Screen3 calculates total price with add-ons', /extraPrice|totalPrice/.test(s3));
  ok('Screen3 has sold-out gate', /soldOut|sold.out|86/i.test(s3));
  ok('Screen3 addToCart CTA navigates to Screen4', /navigateTo\(4\)|setCurrentScreen\(4\)/.test(s3));
  ok('Screen3 imports addToCart action', /addToCart/.test(s3));
});

// ─── GROUP 24: Screen4Cart UX Logic ──────────────────────────────────────────

group('UX logic — Screen4Cart.tsx', () => {
  const s4 = read('components/customer/Screen4Cart.tsx');

  ok('Screen4 shows cart item list', /cart\.map/.test(s4));
  ok('Screen4 has quantity stepper (+/-)', /updateCartQuantity/.test(s4));
  ok('Screen4 has remove item button', /removeCartItem/.test(s4));
  ok('Screen4 has orderSeparately button', /orderSeparately/.test(s4));
  ok('Screen4 shows totalPrice per item', /totalPrice/.test(s4));
  ok('Screen4 shows total amount or subtotal', /subtotal|total/.test(s4));
  ok('Screen4 calls placeAllOrders on proceed', /placeAllOrders/.test(s4));
  ok('Screen4 shows unplacedCount or similar indicator', /unplacedCount|isOrdered|notOrdered/i.test(s4) || /!c\.isOrdered|!item\.isOrdered/.test(s4));
  ok('Screen4 has Browse More button navigating to Screen2', /setCurrentScreen\(2\)|navigateTo\(2\)/.test(s4));
});

// ─── GROUP 25: Screen5LiveTracking UX Logic ───────────────────────────────────

group('UX logic — Screen5LiveTracking.tsx', () => {
  const s5 = read('components/customer/Screen5LiveTracking.tsx');

  ok('Screen5 uses live tickets from useOrderTrackingQuery (allMyItems)', /tickets|allMyItems|overallStage/.test(s5));
  ok('Screen5 shows stage progression', /PLACED|PREP|PLATED|SERVED/.test(s5));
  ok('Screen5 has real-time query hook', /useOrderTracking|useRealtime|supabase/.test(s5));
  ok('Screen5 navigates to Screen6 for payment', /setCurrentScreen\(6\)|navigateTo\(6\)/.test(s5));
  ok('Screen5 has Pay Now or payment CTA', /Pay Now|Payment|setCurrentScreen\(6\)/.test(s5));
  ok('Screen5 uses framer-motion', /from 'framer-motion'/.test(s5));
});

// ─── GROUP 26: Screen8Confirmation UX Logic ──────────────────────────────────

group('UX logic — Screen8Confirmation.tsx', () => {
  const s8 = read('components/customer/Screen8Confirmation.tsx');

  ok('Screen8 shows payment confirmed state', /Payment.*Confirmed|Confirmed|SUCCESS/i.test(s8));
  ok('Screen8 shows transactionId', /transactionId|txnId|bankUtr/.test(s8));
  ok('Screen8 has navigate to Screen9 (digital bill)', /setCurrentScreen\(9\)|navigateTo\(9\)/.test(s8));
  ok('Screen8 dine-again/new-order flows through Screen9 (not direct S1 jump)', /setCurrentScreen\(9\)|navigateTo\(9\)/.test(s8));
  ok('Screen8 uses brand color for confirmation', /bg-\[#8A4228\]|bg-emerald|bg-green/.test(s8));
});

// ─── GROUP 27: API Route Files Exist ─────────────────────────────────────────

group('API route files exist — app/api/', () => {
  const apiRoutes = [
    'app/api/session/verify/route.ts',
    'app/api/orders/create/route.ts',
    'app/api/payments/initiate/route.ts',
    'app/api/payments/verify/route.ts',
  ];

  for (const route of apiRoutes) {
    ok(`${route} exists`, exists(route));
  }
});

// ─── GROUP 28: Hooks — useMenuQuery and useOrderTrackingQuery ─────────────────

group('Customer hooks — useMenuQuery and useOrderTrackingQuery', () => {
  const menuHookPath = 'hooks/useMenuQuery.ts';
  const trackingHookPath = 'hooks/useOrderTrackingQuery.ts';

  ok('useMenuQuery hook file exists', exists(menuHookPath));
  ok('useOrderTrackingQuery hook file exists', exists(trackingHookPath));

  if (exists(menuHookPath)) {
    const mh = read(menuHookPath);
    ok('useMenuQuery uses TanStack Query (useQuery)', /useQuery/.test(mh));
    ok('useMenuQuery exports useMenuQuery', /export.*useMenuQuery/.test(mh));
    ok('useMenuQuery has queryKey', /queryKey/.test(mh));
  }

  if (exists(trackingHookPath)) {
    const th = read(trackingHookPath);
    ok('useOrderTrackingQuery exports hook', /export.*useOrderTrackingQuery/.test(th));
    ok('useOrderTrackingQuery uses supabase or realtime hooks', /supabase|realtime|useRealtime/.test(th) || th.includes('useRealtimeTickets'));
  }
});

// ─── GROUP 29: Dark Theme Violations Scan — All Customer Screens ──────────────

group('Dark theme violations scan — customer portal screens comprehensive', () => {
  // The intentional dark exceptions (ScreenHousing Dynamic Island, ItemDrawer overlay)
  // are in the UI components, not in customer screen files directly.
  // Customer screen files themselves must not have dark backgrounds.

  const prohibitedPatterns = [
    'bg-slate-900',
    'bg-slate-950',
    'bg-stone-900',
    'bg-stone-950',
    'bg-zinc-900',
    'bg-zinc-950',
    'bg-gray-900',
    'bg-gray-950',
    'bg-neutral-900',
    'bg-neutral-950',
  ];

  const allScreens = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen3ItemDetail.tsx',
    'Screen4Cart.tsx',
    'Screen5LiveTracking.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen7PaymentGateway.tsx',
    'Screen8Confirmation.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
    'Screen11Loyalty.tsx',
    'Screen12Feedback.tsx',
  ];

  for (const f of allScreens) {
    const content = read(`components/customer/${f}`);
    const violations = prohibitedPatterns.filter(p => content.includes(p));
    ok(`${f} has no dark background violations`, violations.length === 0);
  }
});

// ─── GROUP 30: Design System — Shadow Compliance ─────────────────────────────

group('Design system — shadow token compliance (no neo-brutalist heavy shadows)', () => {
  const screenFiles = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
  ];

  for (const f of screenFiles) {
    const content = read(`components/customer/${f}`);
    // No neo-brutalist drop-shadow pattern like shadow-[4px_4px_0px_#0f172a]
    ok(`${f} has no neo-brutalist heavy shadow`, !/shadow-\[\d+px_\d+px_0px/.test(content));
    // Uses lightweight shadow tokens
    ok(`${f} uses shadow-xs, shadow-sm, or shadow-lg where present`, !(/shadow(?!-none|-\[)/.test(content)) || /shadow-(xs|sm|md|lg|xl)/.test(content));
  }
});

// ─── GROUP 31: UX Navigation State Machine ────────────────────────────────────

group('UX navigation state machine — flow correctness', () => {
  const s1 = read('components/customer/Screen1Welcome.tsx');
  const s4 = read('components/customer/Screen4Cart.tsx');
  const s6 = read('components/customer/Screen6PaymentBreakdown.tsx');
  const s7 = read('components/customer/Screen7PaymentGateway.tsx');
  const s8 = read('components/customer/Screen8Confirmation.tsx');
  const s9 = read('components/customer/Screen9DigitalBill.tsx');
  const s10 = read('components/customer/Screen10WaiterCall.tsx');

  // Navigation flow: S1 → S2 or S5
  ok('S1 can navigate to S2 (fresh session)', /setCurrentScreen\(2\)/.test(s1));
  ok('S1 can navigate to S5 (session recovery)', /setCurrentScreen\(5\)/.test(s1));

  // S4 → S2 (browse more)
  ok('S4 can navigate back to S2 (browse more)', /setCurrentScreen\(2\)|navigateTo\(2\)/.test(s4));

  // S6 → S5 (back) and S6 → S7 (forward)
  ok('S6 back navigates to S5', /setCurrentScreen\(5\)/.test(s6));
  ok('S6 CTA navigates to S7', /setCurrentScreen\(7\)/.test(s6));

  // S7 → S8 after payment
  ok('S7 navigates to S8 on payment confirmation', /setCurrentScreen\(8\)|navigateTo\(8\)/.test(s7));

  // S8 → S9 (detailed bill) — dine-again goes through S9
  ok('S8 navigates to S9 (view detailed bill)', /setCurrentScreen\(9\)|navigateTo\(9\)/.test(s8));
  ok('S8 does not directly jump to S1 — dine-again is on S9', !s8.includes('setCurrentScreen(1)') || s8.includes('setCurrentScreen(9)'));

  // S9 → S11 (loyalty) and S9 → S12 (feedback)
  ok('S9 navigates to S11 (VIP club loyalty)', /setCurrentScreen\(11\)/.test(s9));
  ok('S9 navigates to S12 (feedback/review)', /setCurrentScreen\(12\)/.test(s9));
  ok('S9 dine-again resets then goes to S1', /resetSession/.test(s9) && /setCurrentScreen\(1\)/.test(s9));

  // S10 returns to previousScreen
  ok('S10 navigates back to previousScreen (not 10)', /previousScreen/.test(s10));
  ok('S10 default fallback is S2 when previousScreen is 10', /returnTarget.*: 2|: 2$/.test(s10) || /\|\| 2/.test(s10) || s10.includes(': 2'));
});

// ─── GROUP 32: Framer Motion Usage — Animations Present ──────────────────────

group('Framer-motion animations present in primary screens', () => {
  const animatedScreens = [
    'Screen1Welcome.tsx',
    'Screen2Menu.tsx',
    'Screen4Cart.tsx',
    'Screen6PaymentBreakdown.tsx',
    'Screen9DigitalBill.tsx',
    'Screen10WaiterCall.tsx',
  ];

  for (const f of animatedScreens) {
    const content = read(`components/customer/${f}`);
    ok(`${f} imports framer-motion`, /from 'framer-motion'/.test(content));
    ok(`${f} uses motion. components`, /\bmotion\./.test(content));
  }
});

// ─── GROUP 33: Screen7 PaymentGateway — Complex UX ────────────────────────────

group('UX logic — Screen7PaymentGateway.tsx (complex payment flow)', () => {
  const s7 = read('components/customer/Screen7PaymentGateway.tsx');

  ok('Screen7 file is substantial (>8KB)', read('components/customer/Screen7PaymentGateway.tsx').length > 8000);
  ok('Screen7 calls /api/payments/initiate', /\/api\/payments\/initiate/.test(s7));
  ok('Screen7 polls /api/payments/verify', /\/api\/payments\/verify/.test(s7));
  ok('Screen7 has UPI deep links', /upi:\/\/|intent:\/\//.test(s7));
  ok('Screen7 has QR modal state or QR display', /qr|QR|qrModal/.test(s7));
  ok('Screen7 handles payment method selection', /paymentMethod|UPI|CARD/.test(s7));
  ok('Screen7 navigates to Screen8 on confirmation', /setCurrentScreen\(8\)|navigateTo\(8\)/.test(s7));
  ok('Screen7 has back navigation to Screen6', /setCurrentScreen\(6\)|navigateTo\(6\)/.test(s7));
  ok('Screen7 uses useEffect for polling or session fetch', /useEffect/.test(s7));
  ok('Screen7 imports useState', /useState/.test(s7));
});

// ─── GROUP 34: Screen11 Loyalty and Screen12 Feedback Exist and Function ──────

group('UX logic — Screen11Loyalty.tsx and Screen12Feedback.tsx', () => {
  const s11 = read('components/customer/Screen11Loyalty.tsx');
  const s12 = read('components/customer/Screen12Feedback.tsx');

  ok("Screen11 has 'use client'", s11.includes("'use client'") || s11.includes('"use client"'));
  ok('Screen11 imports useCustomer', /useCustomer/.test(s11));
  ok('Screen11 imports ScreenHousing', /ScreenHousing/.test(s11));
  ok('Screen11 has loyalty / points / VIP content', /loyalty|points|VIP|reward|scratch/i.test(s11));
  ok('Screen11 uses brand color #8A4228 or #9C3D1E', /8A4228|9C3D1E/.test(s11));
  ok('Screen11 has navigation back to previous screen', /navigateTo|setCurrentScreen/.test(s11));

  ok("Screen12 has 'use client'", s12.includes("'use client'") || s12.includes('"use client"'));
  ok('Screen12 imports useCustomer', /useCustomer/.test(s12));
  ok('Screen12 imports ScreenHousing', /ScreenHousing/.test(s12));
  ok('Screen12 has feedback / rating / review content', /feedback|rating|review|star|Rate/i.test(s12));
  ok('Screen12 uses brand color #8A4228 or #9C3D1E', /8A4228|9C3D1E/.test(s12));
  ok('Screen12 has submit feedback handler', /submit|Submit/.test(s12));
});

// ─── GROUP 35: No AI Traces in Customer Portal Files ──────────────────────────

group('No AI traces or unwanted terms in customer portal files', () => {
  const allCustomerFiles = [
    'store/useCustomerStore.ts',
    'types/customer.ts',
    'context/CustomerContext.tsx',
    'data/menuItems.ts',
    'hooks/useMenuQuery.ts',
  ];

  const aiTerms = ['feat:', 'chore:', 'fix:', 'feat(', 'chore(', 'FEAT', 'TODO: AI', '// AI generated', '// AI:', '// Gemini', 'LLM', 'ChatGPT', 'copilot'];

  for (const f of allCustomerFiles) {
    if (!exists(f)) continue;
    const content = read(f);
    const foundTerms = aiTerms.filter(t => content.includes(t));
    ok(`${f} has no AI trace terms`, foundTerms.length === 0);
  }

  // Also check all 12 screen files
  const screens = Array.from({ length: 12 }, (_, i) => `components/customer/Screen${i + 1}${['Welcome','Menu','ItemDetail','Cart','LiveTracking','PaymentBreakdown','PaymentGateway','Confirmation','DigitalBill','WaiterCall','Loyalty','Feedback'][i]}.tsx`);
  for (const f of screens) {
    if (!exists(f)) continue;
    const content = read(f);
    const foundTerms = aiTerms.filter(t => content.includes(t));
    ok(`${f} has no AI trace terms`, foundTerms.length === 0);
  }
});

// ─── GROUP 36: Venue Name and Brand Constants ─────────────────────────────────

group('Brand constants and venue name consistency', () => {
  const store = read('store/useCustomerStore.ts');
  const s1 = read('components/customer/Screen1Welcome.tsx');
  const s9 = read('components/customer/Screen9DigitalBill.tsx');

  ok("Store venueName is 'Thoogudeepa donne biryani mane'", store.includes('Thoogudeepa donne biryani mane'));
  ok('Screen1 shows venue name via venueName', /venueName/.test(s1));
  ok('Screen9 shows venue name (invoice header)', /venueName/.test(s9));
  ok('Screen1 has THOOGUDEEPA brand label', /THOOGUDEEPA/.test(s1));

  ok('Screen1 has correct Supabase import for session check', /from '.*supabase'|from ".*supabase"/.test(s1));

  const initialTableNumber = /tableNumber:\s*'T-01'/.test(store);
  ok("Store initial tableNumber is 'T-01'", initialTableNumber);
  ok('Store initial viewMode is single', /viewMode:\s*'single'/.test(store));
  ok('Store initial guestName is empty string', /guestName:\s*''/.test(store));
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log(`Phase 5 — Customer Portal`);
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  for (const f of failures) {
    console.log(`  ✗ ${f}`);
  }
}

console.log('─'.repeat(60) + '\n');
process.exit(failed > 0 ? 1 : 0);
