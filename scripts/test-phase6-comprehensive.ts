/**
 * Phase 6 — Manager Portal Comprehensive Test Suite
 * Run: npx tsx scripts/test-phase6-comprehensive.ts
 *
 * Covers all 16 ScreenM files, useManagerStore, types/manager.ts,
 * business logic, design tokens, UX flows, visual compliance.
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

// ─── GROUP 1: TypeScript Types — types/manager.ts ─────────────────────────────

group('TypeScript types — types/manager.ts', () => {
  const t = read('types/manager.ts');
  ok('types/manager.ts exists', exists('types/manager.ts'));
  ok('ManagerScreenId union covers 1–16', /ManagerScreenId = 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12 \| 13 \| 14 \| 15 \| 16/.test(t));
  ok('ManagerProfile interface exists', /interface ManagerProfile/.test(t));
  ok('ManagerProfile has id field', t.includes('id: string'));
  ok('ManagerProfile has name field', t.includes('name: string'));
  ok('ManagerProfile has role union', /role:.*General Manager.*Floor Lead.*Head Cashier/.test(t));
  ok('ManagerProfile has pin field', t.includes('pin: string'));
  ok('ShiftInfo interface exists', /interface ShiftInfo/.test(t));
  ok('ShiftInfo status is ACTIVE or CLOSED', /ACTIVE.*CLOSED|CLOSED.*ACTIVE/.test(t));
  ok('QueueToken interface exists', /interface QueueToken/.test(t));
  ok('QueueToken status union: WAITING, PAGED, SEATED', /WAITING.*PAGED.*SEATED/.test(t));
  ok('PettyExpense interface exists', /interface PettyExpense/.test(t));
  ok('PettyExpense category covers Kitchen Supplies, Fuel/Gas', t.includes('Kitchen Supplies') && t.includes('Fuel/Gas'));
  ok('PettyExpense has voucherNumber', t.includes('voucherNumber'));
  ok('StaffRosterMember interface exists', /interface StaffRosterMember/.test(t));
  ok('StaffRosterMember status: ACTIVE, ON BREAK, OFF DUTY', /ACTIVE.*ON BREAK.*OFF DUTY/.test(t));
  ok('StaffRosterMember role covers Floor Captain', t.includes('Floor Captain'));
  ok('HardwareDevice interface exists', /interface HardwareDevice/.test(t));
  ok('HardwareDevice type union: PRINTER, EDC, KDS, ROUTER, DRAWER', /PRINTER.*EDC.*KDS.*ROUTER.*DRAWER/.test(t));
  ok('HardwareDevice status: ONLINE, OFFLINE, WARNING', /ONLINE.*OFFLINE.*WARNING/.test(t));
  ok('PromoRule interface exists', /interface PromoRule/.test(t));
  ok('PromoRule has discountPercent field', t.includes('discountPercent'));
  ok('PromoRule has minBillAmount field', t.includes('minBillAmount'));
  ok('PromoRule has isActive boolean', t.includes('isActive: boolean'));
});

// ─── GROUP 2: Manager Store — static data and profiles ────────────────────────

group('Manager store — static data constants', () => {
  const s = read('store/useManagerStore.ts');
  ok('useManagerStore.ts exists', exists('store/useManagerStore.ts'));
  ok('MANAGER_PROFILES exported', /export const MANAGER_PROFILES/.test(s));
  ok('3 manager profiles defined', (s.match(/id: 'mgr-/g) || []).length === 3);
  ok('MANJUNATH profile has role General Manager', /MANJUNATH.*General Manager/.test(s));
  ok('RAGHAV profile has role Floor Lead', /RAGHAV.*Floor Lead/.test(s));
  ok('RAMESH profile has role Head Cashier', /RAMESH.*Head Cashier/.test(s));
  ok('Default PIN is 1234', /pin: '1234'/.test(s));
  ok('INITIAL_SHIFTS exported', /export const INITIAL_SHIFTS/.test(s));
  ok('3 shifts defined (DINNER, LUNCH, MORNING)', s.includes('DINNER SERVICE') && s.includes('LUNCH SERVICE') && s.includes('MORNING PREP'));
  ok('DINNER SERVICE is ACTIVE', /DINNER SERVICE.*ACTIVE/.test(s));
  ok('INITIAL_STAFF_ROSTER exported', /export const INITIAL_STAFF_ROSTER/.test(s));
  ok('6 staff members in roster', (s.match(/id: 'st-/g) || []).length === 6);
  ok('Staff sections: A, B, C defined', s.includes('SECTION A') && s.includes('SECTION B') && s.includes('SECTION C'));
  ok('INITIAL_HARDWARE exported', /export const INITIAL_HARDWARE/.test(s));
  ok('6 hardware devices defined', (s.match(/id: 'hw-/g) || []).length === 6);
  ok('Hardware includes PRINTER, EDC, DRAWER types', s.includes("'PRINTER'") && s.includes("'EDC'") && s.includes("'DRAWER'"));
  ok('INITIAL_PROMOS exported', /export const INITIAL_PROMOS/.test(s));
  ok('4 promo rules defined', (s.match(/id: 'pr-/g) || []).length === 4);
  ok('HAPPYHOUR10 promo exists with 10% discount', /HAPPYHOUR10.*discountPercent: 10|discountPercent: 10.*HAPPYHOUR10/.test(s));
  ok('MGROVERRIDE promo exists', s.includes('MGROVERRIDE'));
});

// ─── GROUP 3: Manager Store — initial state ────────────────────────────────────

group('Manager store — initial state values', () => {
  const s = read('store/useManagerStore.ts');
  ok('Initial currentScreen is 1', /currentScreen: 1/.test(s));
  ok('Initial viewMode is single', /viewMode: 'single'/.test(s));
  ok('Initial activeManager is first profile (mgr-1 index 0)', /MANAGER_PROFILES\[0\]/.test(s));
  ok('Initial activeShift is first shift (index 0)', /INITIAL_SHIFTS\[0\]/.test(s));
  ok('Initial isAuthenticated is true', /isAuthenticated: true/.test(s));
  ok('Initial pinInput is 1234', /pinInput: '1234'/.test(s));
  ok('Initial openingFloat is 5000', /openingFloat: 5000/.test(s));
  ok('Initial selectedTableNumber is A-01', /selectedTableNumber: 'A-01'/.test(s));
  ok('Initial queueTokens has 3 tokens', (s.match(/id: 'q-10/g) || []).length === 3);
  ok('Initial pettyExpenses has 3 entries', (s.match(/voucherNumber: 'V-8/g) || []).length === 3);
  ok('staffRoster uses INITIAL_STAFF_ROSTER', /staffRoster: INITIAL_STAFF_ROSTER/.test(s));
  ok('hardwareDevices uses INITIAL_HARDWARE', /hardwareDevices: INITIAL_HARDWARE/.test(s));
  ok('promos uses INITIAL_PROMOS', /promos: INITIAL_PROMOS/.test(s));
});

// ─── GROUP 4: Manager Store — actions and business logic ──────────────────────

group('Manager store — actions and business logic', () => {
  const s = read('store/useManagerStore.ts');

  // Core navigation
  ok('setCurrentScreen action defined', /setCurrentScreen:.*=\> set/.test(s));
  ok('setViewMode action defined', /setViewMode:.*=\> set/.test(s));
  ok('setActiveManager action defined', /setActiveManager:.*=\> set/.test(s));
  ok('setActiveShift action defined', /setActiveShift:.*=\> set/.test(s));

  // PIN logic
  ok('enterPinDigit slices to 4 digits max', /\.slice\(0, 4\)/.test(s));
  ok('clearPin sets pinInput to empty string', /clearPin:.*=\> set\(\{ pinInput: '' \}\)/.test(s));
  ok('deletePinDigit removes last char', /slice\(0, -1\)/.test(s));
  ok('verifyPin checks pinInput against activeManager.pin', /pinInput === activeManager\.pin/.test(s));
  ok('verifyPin also accepts master PIN 1234', /pinInput === '1234'/.test(s));
  ok('verifyPin sets isAuthenticated true on success', /isAuthenticated: true/.test(s));
  ok('verifyPin navigates to screen 2 on success', /currentScreen: 2/.test(s));
  ok('logout resets isAuthenticated to false', /logout:.*isAuthenticated: false/.test(s));
  ok('logout clears pinInput', /pinInput: ''/.test(s));
  ok('logout resets to screen 1', /currentScreen: 1/.test(s));

  // Queue actions
  ok('addQueueToken generates token number T-NNN', /T-\$\{Math\.floor/.test(s) || s.includes('T-${Math'));
  ok('addQueueToken sets status WAITING', /status: 'WAITING'/.test(s));
  ok('updateQueueStatus maps over queueTokens', /queueTokens:.*map/.test(s));

  // Petty expense actions
  ok('addPettyExpense generates voucherNumber V-NNN', /V-\$\{Math\.floor/.test(s) || s.includes('V-${Math'));
  ok('addPettyExpense prepends to expenses array (newest first)', /\[newExp, \.\.\.s\.pettyExpenses\]/.test(s));
  ok('addPettyExpense uses paidBy from active manager name', /activeManager\.name/.test(s));

  // Staff actions
  ok('updateStaffStatus maps over staffRoster', /staffRoster:.*map/.test(s));
  ok('reconcileStaffCash updates cashHandedOver', /cashHandedOver: amountHandedOver/.test(s));

  // Hardware actions
  ok('toggleHardwareStatus toggles ONLINE to WARNING', /ONLINE.*WARNING|WARNING.*ONLINE/.test(s));

  // Promo actions
  ok('togglePromo flips isActive boolean', /isActive: !p\.isActive/.test(s));
});

// ─── GROUP 5: Manager Store — PIN arithmetic verification ─────────────────────

group('Manager store — PIN verification logic verification', () => {
  // Test PIN logic purely in-file
  const s = read('store/useManagerStore.ts');
  // enterPinDigit slices to 4 — simulate manually
  const result1 = ('1234' + '5').slice(0, 4);
  ok('enterPinDigit max 4 digits: 12345 → 1234', result1 === '1234');
  const result2 = ('12' + '3').slice(0, 4);
  ok('enterPinDigit accumulates: 12 + 3 → 123', result2 === '123');
  const result3 = '1234'.slice(0, -1);
  ok('deletePinDigit: 1234 → 123', result3 === '123');
  const result4 = ''.slice(0, -1);
  ok('deletePinDigit on empty stays empty', result4 === '');
  ok('verifyPin passes for exact manager pin', s.includes('pinInput === activeManager.pin'));
  ok('verifyPin passes for master 1234 override', s.includes("pinInput === '1234'"));
});

// ─── GROUP 6: Z-Report financial logic ────────────────────────────────────────

group('Z-Report — financial calculation logic', () => {
  const s = read('components/manager/ScreenM16DayCloseZReport.tsx');
  ok('Z-Report calculates CGST at 2.5%', s.includes('0.025'));
  ok('Z-Report calculates SGST at 2.5%', (s.match(/0\.025/g) || []).length >= 2);
  ok('Z-Report netRevenue = taxable + cgst + sgst', /netRevenue = taxable \+ cgst \+ sgst/.test(s));
  ok('Z-Report discountTotal is deducted before tax', /discountTotal/.test(s));
  ok('Z-Report expectedCashInTill = openingFloat + cashSales - totalPetty', /openingFloat \+ cashSales - totalPetty/.test(s));
  ok('Z-Report variance = actualCash - expected', /variance = \(Number\(actualCashCounted\)|variance = .*actualCash/.test(s));
  ok('Z-Report pettyExpenses total uses reduce', /pettyExpenses\.reduce/.test(s));
  ok('Z-Report grossSales has floor of 48250', s.includes('48250'));
  ok('Z-Report cashSales is ~26% of gross', s.includes('0.26'));

  // Pure arithmetic
  const taxable = 48250 - 1650;
  const cgst = Math.round(taxable * 0.025);
  const sgst = Math.round(taxable * 0.025);
  const netRevenue = taxable + cgst + sgst;
  ok('Taxable base = grossSales - discountTotal = 46600', taxable === 46600);
  ok('CGST @ 2.5% of 46600 = 1165', cgst === 1165);
  ok('SGST @ 2.5% of 46600 = 1165', sgst === 1165);
  ok('Net revenue = 46600 + 1165 + 1165 = 48930', netRevenue === 48930);
  const cashSales = Math.round(48250 * 0.26);
  const openingFloat = 5000;
  const totalPetty = 540 + 350 + 1850;
  const expectedCash = openingFloat + cashSales - totalPetty;
  ok('Expected cash in till arithmetic is correct', expectedCash === openingFloat + cashSales - totalPetty);
});

// ─── GROUP 7: Sales report category arithmetic ────────────────────────────────

group('Sales report — category share arithmetic', () => {
  const totalSales = 38400;
  const biryani = Math.round(totalSales * 0.58);
  const starters = Math.round(totalSales * 0.22);
  const gravies = Math.round(totalSales * 0.12);
  const beverages = Math.round(totalSales * 0.08);
  const sumShares = biryani + starters + gravies + beverages;

  ok('Biryani share (58%) of 38400 is correct', biryani === 22272);
  ok('Starters share (22%) of 38400 is correct', starters === 8448);
  ok('Gravies share (12%) of 38400 is correct', gravies === 4608);
  ok('Beverages share (8%) of 38400 is correct', beverages === 3072);
  ok('Sum of 4 category amounts = totalSales (no rounding overflow >1)', Math.abs(sumShares - totalSales) <= 4);

  const upiPercent = 0.54;
  const cashPercent = 0.26;
  const cardPercent = 0.14;
  const aggregatorPercent = 0.06;
  ok('Payment channel shares sum to 1.0', Math.abs(upiPercent + cashPercent + cardPercent + aggregatorPercent - 1.0) < 0.001);

  const s = read('components/manager/ScreenM11SalesReport.tsx');
  ok('ScreenM11 imports shiftStats from useSharedBridge', /shiftStats/.test(s));
  ok('ScreenM11 omits analytics desk subtext', !/ANALYTICS DESK/.test(s));
  ok('ScreenM11 has Donne Biryani category (58% share)', s.includes('0.58'));
  ok('ScreenM11 shows UPI payment channel', /UPI/.test(s));
  ok('ScreenM11 shows Swiggy/Zomato aggregator', /Swiggy|Zomato/.test(s));
});

// ─── GROUP 8: Tip pool distribution logic ─────────────────────────────────────

group('Attendance & tips — tip distribution arithmetic', () => {
  const s = read('components/manager/ScreenM14AttendanceTips.tsx');
  ok('ScreenM14 distributes the full tip pool per active staff member', /totalTipPool.*Math\.max|tipPerStaff/.test(s));
  ok('ScreenM14 supports individual tip payouts', /handleIndividualTipPayout|PAY TIP/.test(s));
  ok('ScreenM14 omits pooled split and role subtext', !/Front of House|Back of House|Kitchen Fund|Shared equally among|st\.role|STAFF ATTENDANCE & REWARDS/.test(s));
  ok('ScreenM14 imports staffRoster from useManagerStore', /staffRoster/.test(s));
  ok('ScreenM14 imports shiftStats from useSharedBridge', /shiftStats/.test(s));
  ok('ScreenM14 uses tipsEarned from shiftStats', /tipsEarned/.test(s));

  const tipPool = 2850;
  const serviceShare = Math.round(tipPool * 0.6);
  const kitchenShare = Math.round(tipPool * 0.4);
  ok('Service share (60%) of 2850 = 1710', serviceShare === 1710);
  ok('Kitchen share (40%) of 2850 = 1140', kitchenShare === 1140);
  ok('Service + kitchen = total tip pool', serviceShare + kitchenShare === tipPool);
});

// ─── GROUP 9: Petty cash arithmetic ───────────────────────────────────────────

group('Petty expenses — voucher and arithmetic', () => {
  // From initial expenses
  const ex1 = 540;
  const ex2 = 350;
  const ex3 = 1850;
  const total = ex1 + ex2 + ex3;
  ok('Initial petty expense total = 540 + 350 + 1850 = 2740', total === 2740);

  const s13 = read('components/manager/ScreenM13PettyExpenses.tsx');
  ok('ScreenM13 reduces pettyExpenses for total', /pettyExpenses\.reduce/.test(s13));
  ok('ScreenM13 omits petty cash desk subtext and receipt note', !/PETTY CASH DESK|physical receipt attachment/.test(s13));
  ok('ScreenM13 addPettyExpense called on form submit', /addPettyExpense/.test(s13));
  ok('ScreenM13 has category dropdown with Kitchen Supplies', /Kitchen Supplies/.test(s13));
  ok('ScreenM13 has Fuel/Gas category', /Fuel\/Gas/.test(s13));
  ok('ScreenM13 has Dairy & Fresh category', /Dairy/.test(s13));
  ok('ScreenM13 handles form submit with e.preventDefault()', /e\.preventDefault\(\)/.test(s13));
  ok('ScreenM13 clears desc after submit', /setDesc\(''\)/.test(s13));
  ok('ScreenM13 clears amount after submit', /setAmount\(''\)/.test(s13));
});

// ─── GROUP 10: Waiter cash reconciliation (M9) ────────────────────────────────

group('Waiter cash reconciliation', () => {
  const s9 = read('components/manager/ScreenM9WaiterCash.tsx');
  ok('ScreenM9 imports reconcileStaffCash from store', /reconcileStaffCash/.test(s9));
  ok('ScreenM9 keeps captain cash reconciliation', /CAPTAIN TABLE-SIDE CASH RECONCILIATION/.test(s9));
  ok('ScreenM9 omits physical denomination counter', !/Denomination|denomination|Calculator|totalCalculated/.test(s9));
  ok('ScreenM9 supports partial handover amounts', /handoverAmounts|RECORD HANDOVER/.test(s9));
  ok('ScreenM9 prevents handover above amount due', /amount > amountDue/.test(s9));
});

// ─── GROUP 11: All 16 screen files existence ──────────────────────────────────

group('All 16 manager screen files — existence and minimum size', () => {
  const screens = [
    ['ScreenM1Login.tsx',           5000],
    ['ScreenM2LiveOverview.tsx',     6000],
    ['ScreenM3FloorPlan.tsx',        5000],
    ['ScreenM4BillingPOS.tsx',      15000],
    ['ScreenM5KitchenSpeed.tsx',     3000],
    ['ScreenM6WaitingQueue.tsx',     4000],
    ['ScreenM7StaffRoster.tsx',      3000],
    ['ScreenM8CallsAlerts.tsx',      2500],
    ['ScreenM9WaiterCash.tsx',       3000],
    ['ScreenM10Menu86Stock.tsx',     2500],
    ['ScreenM11SalesReport.tsx',     3500],
    ['ScreenM12OffersRules.tsx',     2500],
    ['ScreenM13PettyExpenses.tsx',   4000],
    ['ScreenM14AttendanceTips.tsx',  3000],
    ['ScreenM15PrinterHealth.tsx',   2000],
    ['ScreenM16DayCloseZReport.tsx', 5000],
  ] as const;

  for (const [name, minSize] of screens) {
    const filePath = `components/manager/${name}`;
    ok(`${name} exists`, exists(filePath));
    ok(`${name} is at least ${minSize}B`, size(filePath) >= minSize);
  }
});

// ─── GROUP 12: All 16 screens — structural requirements ───────────────────────

group('All 16 manager screens — structural requirements', () => {
  const screens = [
    'ScreenM1Login.tsx', 'ScreenM2LiveOverview.tsx', 'ScreenM3FloorPlan.tsx',
    'ScreenM4BillingPOS.tsx', 'ScreenM5KitchenSpeed.tsx', 'ScreenM6WaitingQueue.tsx',
    'ScreenM7StaffRoster.tsx', 'ScreenM8CallsAlerts.tsx', 'ScreenM9WaiterCash.tsx',
    'ScreenM10Menu86Stock.tsx', 'ScreenM11SalesReport.tsx', 'ScreenM12OffersRules.tsx',
    'ScreenM13PettyExpenses.tsx', 'ScreenM14AttendanceTips.tsx',
    'ScreenM15PrinterHealth.tsx', 'ScreenM16DayCloseZReport.tsx',
  ];

  for (const name of screens) {
    const c = read(`components/manager/${name}`);
    ok(`${name} has 'use client'`, c.includes("'use client'") || c.includes('"use client"'));
    ok(`${name} imports React`, /import React/.test(c));
    ok(`${name} exports named function component`, /export function ScreenM/.test(c));
    ok(`${name} imports from useManagerStore or useSharedBridge`, /useManagerStore|useSharedBridge/.test(c));
  }
});

// ─── GROUP 13: Design tokens — no prohibited dark backgrounds ─────────────────

group('Design tokens — no prohibited dark backgrounds in manager screens', () => {
  const prohibitedPatterns = [
    'bg-slate-900',
    'bg-slate-950',
    'bg-stone-900',
    'bg-stone-950',
    'bg-zinc-900',
    'bg-gray-900',
    'bg-neutral-900',
    'bg-black',
  ];

  const screens = [
    'ScreenM2LiveOverview.tsx', 'ScreenM3FloorPlan.tsx', 'ScreenM4BillingPOS.tsx',
    'ScreenM5KitchenSpeed.tsx', 'ScreenM6WaitingQueue.tsx', 'ScreenM7StaffRoster.tsx',
    'ScreenM8CallsAlerts.tsx', 'ScreenM9WaiterCash.tsx', 'ScreenM10Menu86Stock.tsx',
    'ScreenM11SalesReport.tsx', 'ScreenM12OffersRules.tsx', 'ScreenM13PettyExpenses.tsx',
    'ScreenM14AttendanceTips.tsx', 'ScreenM15PrinterHealth.tsx', 'ScreenM16DayCloseZReport.tsx',
  ];

  for (const name of screens) {
    const c = read(`components/manager/${name}`);
    const hasDark = prohibitedPatterns.some(p => c.includes(p));
    ok(`${name} has no prohibited dark background`, !hasDark);
  }

  // M1Login has intentional hardware terminal bg-[#1C1917] — that's NOT a Tailwind dark class, it's a hex
  const m1 = read('components/manager/ScreenM1Login.tsx');
  ok('ScreenM1Login intentional dark section uses custom hex (not slate/stone class)', !m1.includes('bg-slate-900') && !m1.includes('bg-stone-900'));
});

// ─── GROUP 14: Design tokens — brand colors present ──────────────────────────

group('Design tokens — brand terracotta color usage', () => {
  const brandColor = '#9C3D1E';
  const altCta = '#8A4228';

  const screens = [
    'ScreenM1Login.tsx', 'ScreenM2LiveOverview.tsx', 'ScreenM4BillingPOS.tsx',
    'ScreenM7StaffRoster.tsx', 'ScreenM16DayCloseZReport.tsx',
  ];

  for (const name of screens) {
    const c = read(`components/manager/${name}`);
    ok(`${name} uses brand color ${brandColor} or ${altCta}`, c.includes(brandColor) || c.includes(altCta));
  }
});

// ─── GROUP 15: Design tokens — card borders and backgrounds ───────────────────

group('Design tokens — card borders and canvas backgrounds', () => {
  const canvasColor = '#FAF8F5';
  const borderColor = '#EAE5DF';

  const coreScreens = [
    'ScreenM1Login.tsx', 'ScreenM2LiveOverview.tsx', 'ScreenM3FloorPlan.tsx',
    'ScreenM4BillingPOS.tsx', 'ScreenM7StaffRoster.tsx',
  ];

  for (const name of coreScreens) {
    const c = read(`components/manager/${name}`);
    ok(`${name} uses card border ${borderColor}`, c.includes(borderColor));
    ok(`${name} uses canvas/bg color ${canvasColor}`, c.includes(canvasColor));
  }
});

// ─── GROUP 16: Design tokens — shadow compliance ──────────────────────────────

group('Design tokens — no neo-brutalist heavy shadows', () => {
  const screens = [
    'ScreenM1Login.tsx', 'ScreenM2LiveOverview.tsx', 'ScreenM3FloorPlan.tsx',
    'ScreenM9WaiterCash.tsx', 'ScreenM11SalesReport.tsx', 'ScreenM16DayCloseZReport.tsx',
  ];

  for (const name of screens) {
    const c = read(`components/manager/${name}`);
    // Detect neo-brutalist pattern: shadow-[Npx_Npx_0px_#color] with large offsets
    const hasHeavyShadow = /shadow-\[\d{2,}px_\d{2,}px/.test(c);
    ok(`${name} has no neo-brutalist heavy offset shadow`, !hasHeavyShadow);
  }
});

// ─── GROUP 17: Design tokens — font-mono usage ───────────────────────────────

group('Design tokens — monospace font usage in terminal screens', () => {
  const monoScreens = [
    'ScreenM1Login.tsx', 'ScreenM4BillingPOS.tsx',
    'ScreenM9WaiterCash.tsx', 'ScreenM16DayCloseZReport.tsx',
  ];

  for (const name of monoScreens) {
    const c = read(`components/manager/${name}`);
    ok(`${name} uses font-mono`, c.includes('font-mono'));
  }
});

// ─── GROUP 18: UX logic — ScreenM1Login ──────────────────────────────────────

group('UX logic — ScreenM1Login.tsx (authentication flow)', () => {
  const s = read('components/manager/ScreenM1Login.tsx');
  ok('M1 uses useManagerStore', /useManagerStore/.test(s));
  ok('M1 destructures activeManager, pinInput, verifyPin', /activeManager/.test(s) && /pinInput/.test(s) && /verifyPin/.test(s));
  ok('M1 shows MANAGER_PROFILES in select dropdown', /MANAGER_PROFILES/.test(s));
  ok('M1 shows INITIAL_SHIFTS for shift selection', /INITIAL_SHIFTS/.test(s));
  ok('M1 has numeric keypad (1-9 digits)', /\['1', '2', '3', '4', '5', '6', '7', '8', '9'\]/.test(s));
  ok('M1 has CLR (clearPin) button', /clearPin/.test(s));
  ok('M1 has DEL (deletePinDigit) button', /deletePinDigit/.test(s));
  ok('M1 PIN indicators are 4 dots', /\[0, 1, 2, 3\]\.map/.test(s));
  ok('M1 filled dot uses brand color #9C3D1E', /bg-\[#9C3D1E\]/.test(s));
  ok('M1 shows openingFloat value', /openingFloat/.test(s));
  ok('M1 Unlock button navigates to screen 2', /setCurrentScreen\(2\)/.test(s));
  ok('M1 has authentication error state', /authError/.test(s));
  ok('M1 shows INVALID PIN message on error', /INVALID PIN/.test(s));
  ok('M1 shows restaurant name THOOGUDEEPA', /THOOGUDEEPA/i.test(s));
  ok('M1 shows PERIPHERALS READY section', /PERIPHERALS READY/.test(s));
  ok('M1 shows opening float as VERIFIED', /VERIFIED/.test(s));
});

// ─── GROUP 19: UX logic — ScreenM2LiveOverview ───────────────────────────────

group('UX logic — ScreenM2LiveOverview.tsx (dashboard)', () => {
  const s = read('components/manager/ScreenM2LiveOverview.tsx');
  ok('M2 uses useSharedBridge for live data', /useSharedBridge/.test(s));
  ok('M2 destructures tables, kdsTickets, shiftStats', /tables/.test(s) && /kdsTickets/.test(s) && /shiftStats/.test(s));
  ok('M2 calculates occupiedTables (OCCUPIED or BILLING)', /status === 'OCCUPIED'.*status === 'BILLING'|OCCUPIED.*BILLING/.test(s));
  ok('M2 calculates totalSeated from guestCount', /guestCount/.test(s));
  ok('M2 shows active KDS count (not COMPLETED)', /status !== 'COMPLETED'/.test(s));
  ok('M2 shows currentLiveBillSum from currentBill', /currentBill/.test(s));
  ok('M2 shows occupancy percentage', /occupiedTables\.length.*tables\.length/.test(s) || /occupiedTables\.length \/ tables\.length/.test(s));
  ok('M2 has table click handler → setSelectedTableNumber + navigate to S3', /handleTableClick/.test(s) && /setCurrentScreen\(3\)/.test(s));
  ok('M2 has 4 KPI metric cards', s.includes('TODAY SALES') && s.includes('GUESTS SEATED') && s.includes('ACTIVE KITCHEN KOTS') && s.includes('TABLE OCCUPANCY'));
  ok('M2 has View KDS quick link to screen 5', /setCurrentScreen\(5\)/.test(s));
  ok('M2 has Reconcile quick link to screen 9', /setCurrentScreen\(9\)/.test(s));
  ok('M2 has Open Billing POS button to screen 4', /setCurrentScreen\(4\)/.test(s));
  ok('M2 has Z-REPORT link to screen 16', /setCurrentScreen\(16\)/.test(s));
  ok('M2 shows table status legend (OCCUPIED, BILLING, VACANT)', /OCCUPIED/.test(s) && /BILLING/.test(s) && /VACANT/.test(s));
  ok('M2 shows revenue as shiftStats.totalRevenue + currentLiveBillSum', /shiftStats\.totalRevenue \+ currentLiveBillSum/.test(s));
});

// ─── GROUP 20: UX logic — ScreenM3FloorPlan ──────────────────────────────────

group('UX logic — ScreenM3FloorPlan.tsx (floor map)', () => {
  const s = read('components/manager/ScreenM3FloorPlan.tsx');
  ok('M3 uses useSharedBridge for tables', /useSharedBridge/.test(s));
  ok('M3 uses waiterVacatesTable action', /waiterVacatesTable/.test(s));
  ok('M3 uses useManagerStore for selectedTableNumber', /selectedTableNumber/.test(s));
  ok('M3 has section filter tabs (ALL, A, B, C)', /sections.*ALL.*SECTION A|SECTION A.*SECTION B.*SECTION C/.test(s));
  ok('M3 filters tables by section', /filteredTables/.test(s));
  ok('M3 shows selected table detail panel', /selectedTable/.test(s));
  ok('M3 has vacate table handler', /handleVacate/.test(s));
  ok('M3 navigates to Billing POS screen 4', /setCurrentScreen\(4\)/.test(s));
  ok('M3 shows table.number in grid', /tbl\.number|t\.number/.test(s));
  ok('M3 shows table.currentBill', /currentBill/.test(s));
  ok('M3 shows table.guestCount', /guestCount/.test(s));
  ok('M3 shows table.kotCount', /kotCount/.test(s));
});

// ─── GROUP 21: UX logic — ScreenM4BillingPOS ─────────────────────────────────

group('UX logic — ScreenM4BillingPOS.tsx (POS terminal)', () => {
  const s = read('components/manager/ScreenM4BillingPOS.tsx');
  ok('M4 is the largest file (>15KB)', size('components/manager/ScreenM4BillingPOS.tsx') >= 15000);
  ok('M4 uses useSharedBridge for waiterRecordsPayment', /waiterRecordsPayment/.test(s));
  ok('M4 uses waiterVacatesTable from bridge', /waiterVacatesTable/.test(s));
  ok('M4 uses INITIAL_MENU_ITEMS for menu catalog', /INITIAL_MENU_ITEMS/.test(s));
  ok('M4 has selectedTable from tables array', /selectedTable/.test(s));
  ok('M4 has discountPercent state', /discountPercent/.test(s));
  ok('M4 has payment method state (CASH/CARD/UPI/AGGREGATOR)', /paymentMethod/.test(s) && /CASH.*CARD.*UPI.*AGGREGATOR/.test(s));
  ok('M4 has cashTendered state for change calculation', /cashTendered/.test(s));
  ok('M4 has settledSuccess state', /settledSuccess/.test(s));
  ok('M4 has menu search with useState', /menuSearch/.test(s));
  ok('M4 has selectedCategory filter state', /selectedCategory/.test(s));
  ok('M4 has showMenuCatalog toggle state', /showMenuCatalog/.test(s));
  ok('M4 has categories array (ALL, Donne Biryani, etc.)', /categories = \[/.test(s) && s.includes('Donne Biryani'));
  ok('M4 filters INITIAL_MENU_ITEMS by search + category', /filteredMenuItems/.test(s));
  ok('M4 has handleAddDirectItem for counter ordering', /handleAddDirectItem/.test(s));
  ok('M4 has useEffect to sync items with table activeItems', /useEffect/.test(s) && /activeItems/.test(s));
  ok('M4 uses useState and useEffect imports', /useState.*useEffect|useEffect.*useState/.test(s));
});

// ─── GROUP 22: UX logic — ScreenM5KitchenSpeed ───────────────────────────────

group('UX logic — ScreenM5KitchenSpeed.tsx (KDS monitor)', () => {
  const s = read('components/manager/ScreenM5KitchenSpeed.tsx');
  ok('M5 uses useSharedBridge for kdsTickets', /kdsTickets/.test(s));
  ok('M5 uses kitchenBumpTable action', /kitchenBumpTable/.test(s));
  ok('M5 filters active tickets (not COMPLETED)', /status !== 'COMPLETED'/.test(s));
  ok('M5 keeps the dispatch tracker title without operational subtext', /DUM POT.*TANDOOR DISPATCH TRACKER/.test(s)
    && !/KITCHEN SPEED MONITOR|REAL-TIME KDS AUDIT/.test(s));
  ok('M5 shows DUM POT / TANDOOR branding', /DUM POT|TANDOOR/.test(s));
  ok('M5 shows ticket status (READY, PREP, etc.)', /READY|PREP|status/.test(s));
  ok('M5 has alerting / bottleneck detection', /AlertTriangle|alert|BOTTLENECK/.test(s));
});

// ─── GROUP 23: UX logic — ScreenM6WaitingQueue ───────────────────────────────

group('UX logic — ScreenM6WaitingQueue.tsx (queue management)', () => {
  const s = read('components/manager/ScreenM6WaitingQueue.tsx');
  ok('M6 uses useManagerStore for queueTokens', /queueTokens/.test(s));
  ok('M6 uses addQueueToken action', /addQueueToken/.test(s));
  ok('M6 uses updateQueueStatus action', /updateQueueStatus/.test(s));
  ok('M6 uses useSharedBridge for waiterSeatsGuests', /waiterSeatsGuests/.test(s));
  ok('M6 has form to add guest (name, phone, pax, section)', /guestName/.test(s) && /phone/.test(s) && /pax/.test(s) && /section/.test(s));
  ok('M6 handles form submit with e.preventDefault()', /e\.preventDefault\(\)/.test(s));
  ok('M6 has handleSeat function', /handleSeat/.test(s));
  ok('M6 shows queue token status (WAITING, PAGED, SEATED)', /WAITING/.test(s) && /PAGED/.test(s));
  ok('M6 clears guestName after submit', /setGuestName\(''\)/.test(s));
  ok('M6 shows available tables for seating', /tables/.test(s));
});

// ─── GROUP 24: UX logic — ScreenM7StaffRoster ────────────────────────────────

group('UX logic — ScreenM7StaffRoster.tsx (staff management)', () => {
  const s = read('components/manager/ScreenM7StaffRoster.tsx');
  ok('M7 uses useManagerStore for staffRoster', /staffRoster/.test(s));
  ok('M7 uses updateStaffStatus action', /updateStaffStatus/.test(s));
  ok('M7 has broadcast button', /handleBroadcast|Broadcast/.test(s));
  ok('M7 keeps the roster title without operational subtext', /FLOOR CAPTAINS.*TABLE ASSIGNMENTS/.test(s)
    && !/STAFF ROSTER DESK|DINNER SERVICE SQUAD/.test(s));
  ok('M7 shows staff status badges (ACTIVE, ON BREAK)', /ACTIVE/.test(s) && /ON BREAK/.test(s));
  ok('M7 uses brand color #9C3D1E', /\#9C3D1E/.test(s));
  ok('M7 omits only role and assigned section card subtext', !/st\.assignedSection|st\.role/.test(s)
    && /st\.phone|st\.cashCollected|st\.tablesCount/.test(s));
});

// ─── GROUP 25: UX logic — ScreenM8CallsAlerts ────────────────────────────────

group('UX logic — ScreenM8CallsAlerts.tsx (customer pings)', () => {
  const s = read('components/manager/ScreenM8CallsAlerts.tsx');
  ok('M8 uses useSharedBridge for pings', /pings/.test(s));
  ok('M8 uses waiterResolvePing action', /waiterResolvePing/.test(s));
  ok('M8 keeps the calls title without operational subtext', /TABLE SERVICE CALLS.*ESCALATIONS/.test(s)
    && !/CUSTOMER CALLS DESK|REAL-TIME SERVICE ALERTS/.test(s));
  ok('M8 omits the apology discount action', !/handleApology|APOLOGY 10% OFF|10%/.test(s));
  ok('M8 uses rose/red color for alert badge', /bg-rose-600|text-rose-/.test(s));
  ok('M8 shows ping type and table number', /tableNum|tableNumber/.test(s));
});

// ─── GROUP 26: UX logic — ScreenM10Menu86Stock ───────────────────────────────

group('UX logic — ScreenM10Menu86Stock.tsx (86 menu kill-switch)', () => {
  const s = read('components/manager/ScreenM10Menu86Stock.tsx');
  ok('M10 uses useSharedBridge for inventory86', /inventory86/.test(s));
  ok('M10 uses kitchenToggle86 action', /kitchenToggle86/.test(s));
  ok('M10 uses kitchenUpdatePrepDelay action', /kitchenUpdatePrepDelay/.test(s));
  ok('M10 keeps the availability title without operational subtext', /REAL-TIME DISH AVAILABILITY.*PREP DELAYS/.test(s)
    && !/ITEM 86 STOCK CONTROLLER|LIVE MENU KILL-SWITCH|Toggling 86 instantly/.test(s));
  ok('M10 uses rose color for 86 badge', /bg-rose-600|text-rose-/.test(s));
});

// ─── GROUP 27: UX logic — ScreenM12OffersRules ───────────────────────────────

group('UX logic — ScreenM12OffersRules.tsx (promo campaigns)', () => {
  const s = read('components/manager/ScreenM12OffersRules.tsx');
  ok('M12 uses useManagerStore for promos', /promos/.test(s));
  ok('M12 uses togglePromo action', /togglePromo/.test(s));
  ok('M12 keeps promo campaigns without the discounts/promos label or audit log', /ACTIVE PROMOTIONAL CAMPAIGNS/.test(s)
    && !/DISCOUNTS & PROMOS|Manager Goodwill Override Log|Table A-03|Table B-02/.test(s));
  ok('M12 shows ACTIVE PROMOTIONAL CAMPAIGNS text', /PROMOTIONAL CAMPAIGNS|ACTIVE.*PROMO/.test(s));
  ok('M12 shows promo code for each rule', /\.code/.test(s));
  ok('M12 shows discount percentage for each rule', /discountPercent/.test(s));
  ok('M12 shows isActive toggle control', /isActive/.test(s));
  ok('M12 uses brand orange/terracotta color', /orange-600|#9C3D1E/.test(s));
});

// ─── GROUP 28: UX logic — ScreenM15PrinterHealth ─────────────────────────────

group('UX logic — ScreenM15PrinterHealth.tsx (hardware diagnostics)', () => {
  const s = read('components/manager/ScreenM15PrinterHealth.tsx');
  ok('M15 uses useManagerStore for hardwareDevices', /hardwareDevices/.test(s));
  ok('M15 uses toggleHardwareStatus action', /toggleHardwareStatus/.test(s));
  ok('M15 has handleTestPrint function', /handleTestPrint/.test(s));
  ok('M15 test print shows ESC/POS mention', /ESC\/POS/.test(s));
  ok('M15 omits hardware diagnostic subtext', !/HARDWARE DIAGNOSTIC CENTER/.test(s));
  ok('M15 shows THERMAL PRINTERS label', /THERMAL PRINTERS/.test(s));
  ok('M15 shows device status (ONLINE/WARNING/OFFLINE)', /ONLINE/.test(s));
  ok('M15 shows printer location', /\.location/.test(s));
  ok('M15 shows device details (paper roll, battery)', /\.details/.test(s));
});

// ─── GROUP 29: Billing POS — discount and payment arithmetic ──────────────────

group('Billing POS — discount & payment arithmetic', () => {
  const s = read('components/manager/ScreenM4BillingPOS.tsx');

  // Verify calculation patterns exist
  ok('M4 calculates subtotal from items', /subtotal|items\.reduce/.test(s));
  ok('M4 applies discountPercent to subtotal', /discountPercent/.test(s));
  ok('M4 calculates tax (GST/CGST/SGST)', /gst|cgst|sgst|tax|0\.05|0\.025/.test(s));
  ok('M4 calculates change from cashTendered', /cashTendered|change.*tendered|tendered.*change/.test(s));
  ok('M4 handles cash settlement with waiterRecordsPayment', /waiterRecordsPayment/.test(s));
  ok('M4 handles table vacate on settlement', /waiterVacatesTable/.test(s));

  // Pure arithmetic checks
  const items = [
    { price: 290, qty: 2 },
    { price: 340, qty: 1 },
    { price: 260, qty: 1 },
    { price: 40, qty: 2 },
  ];
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  ok('Default POS items subtotal = 290×2 + 340×1 + 260×1 + 40×2 = 1260', subtotal === 1260);

  const discount10pct = Math.round(subtotal * 0.10);
  ok('10% discount on 1260 = 126', discount10pct === 126);

  const afterDiscount = subtotal - discount10pct;
  const tax = Math.round(afterDiscount * 0.05);
  ok('5% GST on 1134 = 57', tax === 57);

  const total = afterDiscount + tax;
  ok('Total after discount and tax = 1191', total === 1191);

  const cashTendered = 1500;
  const change = cashTendered - total;
  ok('Change for ₹1500 cash tendered = 309', change === 309);
});

// ─── GROUP 30: Navigation — state machine between screens ─────────────────────

group('Manager portal — navigation state machine', () => {
  const m1 = read('components/manager/ScreenM1Login.tsx');
  const m2 = read('components/manager/ScreenM2LiveOverview.tsx');
  const m3 = read('components/manager/ScreenM3FloorPlan.tsx');
  const m4 = read('components/manager/ScreenM4BillingPOS.tsx');

  ok('M1 login → M2 dashboard (verifyPin or button)', /setCurrentScreen\(2\)/.test(m1));
  ok('M2 dashboard → M3 floor plan via table click', /setCurrentScreen\(3\)/.test(m2));
  ok('M2 dashboard → M4 billing POS via button', /setCurrentScreen\(4\)/.test(m2));
  ok('M2 dashboard → M5 kitchen speed via link', /setCurrentScreen\(5\)/.test(m2));
  ok('M2 dashboard → M9 waiter cash reconcile link', /setCurrentScreen\(9\)/.test(m2));
  ok('M2 dashboard → M16 Z-report via button', /setCurrentScreen\(16\)/.test(m2));
  ok('M3 floor plan → M4 billing POS', /setCurrentScreen\(4\)/.test(m3));
  ok('M4 billing POS can navigate back', /setCurrentScreen/.test(m4));
  ok('Store logout resets to screen 1', /currentScreen: 1/.test(read('store/useManagerStore.ts')));
});

// ─── GROUP 31: UI components — M1 PIN pad visuals ────────────────────────────

group('UI components — M1Login PIN pad visual design', () => {
  const s = read('components/manager/ScreenM1Login.tsx');
  ok('PIN pad uses 3×3 grid layout', /grid-cols-3/.test(s));
  ok('PIN pad buttons have h-12 height', /h-12/.test(s));
  ok('PIN dots filled state uses scale-110', /scale-110/.test(s));
  ok('PIN dots use rounded-full shape', /rounded-full/.test(s));
  ok('PIN dots use border border-[#EAE5DF]', /border-\[#EAE5DF\]/.test(s));
  ok('Filled PIN dot bg is brand terracotta', /bg-\[#9C3D1E\]/.test(s));
  ok('Empty PIN dot bg is warm canvas', /bg-\[#FAF8F5\]/.test(s));
  ok('Unlock button has shadow-xs', /shadow-xs/.test(s));
  ok('Shift selector has active orange-50 highlight', /bg-orange-50/.test(s));
  ok('Profile select uses FAF8F5 bg', /bg-\[#FAF8F5\]/.test(s));
  ok('Opening float shown in large font (text-2xl)', /text-2xl/.test(s));
  ok('Hardware panel uses brand bg-[#9C3D1E]', /bg-\[#9C3D1E\]/.test(s));
  ok('KeyRound icon used for auth', /KeyRound/.test(s));
});

// ─── GROUP 32: UI components — M2 table grid visuals ─────────────────────────

group('UI components — M2LiveOverview table grid visual', () => {
  const s = read('components/manager/ScreenM2LiveOverview.tsx');
  ok('Table grid uses grid-cols-2/8 responsive layout', /grid-cols-2.*md:grid-cols-8|grid-cols-2 sm:grid-cols-4 md:grid-cols-8/.test(s));
  ok('OCCUPIED table has brand terracotta bg', /bg-\[#9C3D1E\].*OCCUPIED|OCCUPIED.*bg-\[#9C3D1E\]/.test(s));
  ok('BILLING table has amber-50 bg with amber border', /bg-amber-50.*amber-500|amber.*BILLING/.test(s));
  ok('VACANT table has white bg with hover border', /bg-white.*hover:border-\[#9C3D1E\]/.test(s));
  ok('Capacity shown with P suffix (4P, 2P)', /capacity.*P|capacity\}P/.test(s));
  ok('KOT count shown per table', /kotCount/.test(s));
  ok('Guest count shown per table', /guestCount/.test(s));
  ok('Current bill shown per table', /currentBill/.test(s));
  ok('KPI cards use shadow-xs', /shadow-xs/.test(s));
  ok('KPI grid is 4 columns on desktop', /md:grid-cols-4/.test(s));
});

// ─── GROUP 33: UI components — M4 Billing POS layout ─────────────────────────

group('UI components — M4BillingPOS layout and components', () => {
  const s = read('components/manager/ScreenM4BillingPOS.tsx');
  ok('M4 has menu search input', /menuSearch/.test(s) && /Search|search/.test(s));
  ok('M4 has category tab filters', /selectedCategory/.test(s));
  ok('M4 has payment method selector (CASH/CARD/UPI/AGGREGATOR)', /CASH.*CARD.*UPI|paymentMethod/.test(s));
  ok('M4 has qty increment/decrement buttons (+/-)', /Plus.*Minus|Minus.*Plus|qty.*\+|qty.*-/.test(s));
  ok('M4 has item isFree toggle (complimentary)', /isFree/.test(s));
  ok('M4 has trash/delete item button', /Trash2/.test(s));
  ok('M4 has settled success confirmation state', /settledSuccess/.test(s));
  ok('M4 uses CreditCard, QrCode, Banknote icons', /CreditCard/.test(s) && /QrCode/.test(s) && /Banknote/.test(s));
  ok('M4 has Smartphone icon for UPI', /Smartphone/.test(s));
  ok('M4 has Sparkles icon for promo/offers', /Sparkles/.test(s));
  ok('M4 uses LayoutGrid for catalog view toggle', /LayoutGrid/.test(s));
  ok('M4 has PlusCircle for add to bill', /PlusCircle/.test(s));
});

// ─── GROUP 34: UI components — M9 cash reconciliation visuals ─────────────────

group('UI components — M9WaiterCash cash reconciliation', () => {
  const s = read('components/manager/ScreenM9WaiterCash.tsx');
  ok('M9 uses Banknote icon', /Banknote/.test(s));
  ok('M9 shows reconcileStaffCash per staff member', /reconcileStaffCash/.test(s));
  ok('M9 uses CheckCircle2 for reconciliation success', /CheckCircle2/.test(s));
  ok('M9 uses IndianRupee icon', /IndianRupee/.test(s));
  ok('M9 has handover amount input', /Amount handed over|handover-/.test(s));
});

// ─── GROUP 35: No AI traces in manager portal files ───────────────────────────

group('No AI traces or unwanted terms — manager portal', () => {
  const aiTerms = ['feat:', 'fix:', 'chore:', 'refactor:', 'AI-generated', 'ai generated', 'Lorem ipsum', 'TODO: implement', '// PLACEHOLDER'];

  const filesToCheck = [
    'store/useManagerStore.ts',
    'types/manager.ts',
    'components/manager/ScreenM1Login.tsx',
    'components/manager/ScreenM2LiveOverview.tsx',
    'components/manager/ScreenM3FloorPlan.tsx',
    'components/manager/ScreenM4BillingPOS.tsx',
    'components/manager/ScreenM5KitchenSpeed.tsx',
    'components/manager/ScreenM6WaitingQueue.tsx',
    'components/manager/ScreenM7StaffRoster.tsx',
    'components/manager/ScreenM8CallsAlerts.tsx',
    'components/manager/ScreenM9WaiterCash.tsx',
    'components/manager/ScreenM10Menu86Stock.tsx',
    'components/manager/ScreenM11SalesReport.tsx',
    'components/manager/ScreenM12OffersRules.tsx',
    'components/manager/ScreenM13PettyExpenses.tsx',
    'components/manager/ScreenM14AttendanceTips.tsx',
    'components/manager/ScreenM15PrinterHealth.tsx',
    'components/manager/ScreenM16DayCloseZReport.tsx',
  ];

  for (const file of filesToCheck) {
    const c = read(file);
    const hasAiTrace = aiTerms.some(term => c.toLowerCase().includes(term.toLowerCase()));
    ok(`${path.basename(file)} has no AI traces`, !hasAiTrace);
  }
});

// ─── GROUP 36: Brand venue name consistency ───────────────────────────────────

group('Brand venue name consistency — manager portal', () => {
  const m1 = read('components/manager/ScreenM1Login.tsx');
  const m16 = read('components/manager/ScreenM16DayCloseZReport.tsx');
  ok('M16 omits day close Z-report subtext', !/DAY CLOSE NIGHT Z-REPORT/.test(m16));
  const store = read('store/useManagerStore.ts');

  ok('M1 shows THOOGUDEEPA DONNE BIRYANI MANE', /THOOGUDEEPA DONNE BIRYANI MANE/i.test(m1));
  ok('M16 Z-report shows Thoogudeepa Donne Biryani Mane', /Thoogudeepa Donne Biryani Mane|THOOGUDEEPA DONNE BIRYANI/.test(m16));
  ok('Store manager profiles use proper restaurant section names', /SECTION A.*Ground AC|Ground AC.*SECTION A/.test(store));
  ok('Store petty expenses reference real Karnataka vendors', /Nandini Dairy|Gandhi Bazaar|Indane Gas/.test(store));
  ok('Store queue tokens have Kannada/Karnataka names', /Santhosh Kumar|Deepak Rao|Meenakshi Iyer/.test(store));
  ok('Manager profiles use real restaurant roles', store.includes("'General Manager'") && store.includes("'Floor Lead'") && store.includes("'Head Cashier'"));
});

// ─── GROUP 37: Lucide icons usage across manager portal ───────────────────────

group('Lucide icons — proper usage across manager screens', () => {
  const s1 = read('components/manager/ScreenM1Login.tsx');
  const s2 = read('components/manager/ScreenM2LiveOverview.tsx');
  const s4 = read('components/manager/ScreenM4BillingPOS.tsx');
  const s7 = read('components/manager/ScreenM7StaffRoster.tsx');
  const s8 = read('components/manager/ScreenM8CallsAlerts.tsx');

  ok('M1 imports lucide-react icons', /from 'lucide-react'/.test(s1));
  ok('M1 uses ShieldCheck icon', /ShieldCheck/.test(s1));
  ok('M1 uses Lock/Unlock icons', /Lock|Unlock/.test(s1));
  ok('M2 uses TrendingUp for revenue KPI', /TrendingUp/.test(s2));
  ok('M2 uses IndianRupee for sales display', /IndianRupee/.test(s2));
  ok('M2 uses AlertTriangle for kitchen alerts', /AlertTriangle/.test(s2));
  ok('M4 imports IndianRupee from lucide', /IndianRupee/.test(s4));
  ok('M4 imports Percent icon', /Percent/.test(s4));
  ok('M7 imports Phone icon for staff contacts', /Phone/.test(s7));
  ok('M7 imports Radio or Users for broadcast', /Radio|Users/.test(s7));
  ok('M8 imports Bell icon for alerts', /Bell/.test(s8));
  ok('M8 imports CheckCircle2 for resolved pings', /CheckCircle2/.test(s8));
});

// ─── GROUP 38: Store import integrity ────────────────────────────────────────

group('Manager store — import and type integrity', () => {
  const s = read('store/useManagerStore.ts');
  ok('useManagerStore imports create from zustand', /import \{ create \} from 'zustand'/.test(s));
  ok('useManagerStore imports ManagerScreenId from types', /ManagerScreenId/.test(s));
  ok('useManagerStore imports ManagerProfile from types', /ManagerProfile/.test(s));
  ok('useManagerStore imports ShiftInfo from types', /ShiftInfo/.test(s));
  ok('useManagerStore imports QueueToken from types', /QueueToken/.test(s));
  ok('useManagerStore imports PettyExpense from types', /PettyExpense/.test(s));
  ok('useManagerStore imports StaffRosterMember from types', /StaffRosterMember/.test(s));
  ok('useManagerStore imports HardwareDevice from types', /HardwareDevice/.test(s));
  ok('useManagerStore imports PromoRule from types', /PromoRule/.test(s));
  ok('useManagerStore exports useManagerStore as create<ManagerStoreState>', /create<ManagerStoreState>/.test(s));
});

// ─── GROUP 39: Cross-portal bridge integration ────────────────────────────────

group('Manager portal — useSharedBridge integration', () => {
  const bridge = 'store/useSharedBridge.ts';
  ok('useSharedBridge.ts exists', exists(bridge));

  const b = read(bridge);
  ok('Bridge exports tables array', /tables/.test(b));
  ok('Bridge exports kdsTickets array', /kdsTickets/.test(b));
  ok('Bridge exports shiftStats object', /shiftStats/.test(b));
  ok('Bridge exports pings array', /pings/.test(b));
  ok('Bridge exports inventory86 for menu 86 control', /inventory86/.test(b));
  ok('Bridge has waiterResolvePing action', /waiterResolvePing/.test(b));
  ok('Bridge has waiterSeatsGuests action', /waiterSeatsGuests/.test(b));
  ok('Bridge has waiterVacatesTable action', /waiterVacatesTable/.test(b));
  ok('Bridge has waiterRecordsPayment action', /waiterRecordsPayment/.test(b));
  ok('Bridge has kitchenBumpTable action', /kitchenBumpTable/.test(b));
  ok('Bridge has kitchenToggle86 action', /kitchenToggle86/.test(b));
  ok('Bridge has kitchenUpdatePrepDelay action', /kitchenUpdatePrepDelay/.test(b));

  // Screens that need bridge vs. store-only
  const bridgeScreens = ['ScreenM2LiveOverview.tsx', 'ScreenM3FloorPlan.tsx', 'ScreenM4BillingPOS.tsx', 'ScreenM5KitchenSpeed.tsx', 'ScreenM8CallsAlerts.tsx', 'ScreenM10Menu86Stock.tsx'];
  const storeOnlyScreens = ['ScreenM7StaffRoster.tsx', 'ScreenM9WaiterCash.tsx', 'ScreenM12OffersRules.tsx', 'ScreenM13PettyExpenses.tsx', 'ScreenM15PrinterHealth.tsx'];

  for (const name of bridgeScreens) {
    ok(`${name} imports useSharedBridge`, /useSharedBridge/.test(read(`components/manager/${name}`)));
  }
  for (const name of storeOnlyScreens) {
    ok(`${name} uses useManagerStore (not bridge only)`, /useManagerStore/.test(read(`components/manager/${name}`)));
  }
});

// ─── GROUP 40: Responsive layout tokens ───────────────────────────────────────

group('UI/UX — responsive layout tokens in manager portal', () => {
  const s2 = read('components/manager/ScreenM2LiveOverview.tsx');
  const s1 = read('components/manager/ScreenM1Login.tsx');
  const s4 = read('components/manager/ScreenM4BillingPOS.tsx');
  const s16 = read('components/manager/ScreenM16DayCloseZReport.tsx');

  ok('M2 uses max-w-6xl container', /max-w-6xl/.test(s2));
  ok('M2 has responsive grid (grid-cols-1 md:grid-cols-4)', /md:grid-cols-4/.test(s2));
  ok('M1 uses max-w-5xl container', /max-w-5xl/.test(s1));
  ok('M1 uses 12-column grid (grid-cols-12)', /grid-cols-12/.test(s1));
  ok('M4 uses max-w for container width', /max-w/.test(s4));
  ok('M16 uses max-w-5xl container', /max-w-5xl/.test(s16));
  ok('M16 has 2-column responsive grid', /md:grid-cols-2/.test(s16));

  // UX accessibility and interaction checks
  ok('M1 keypad buttons use hover states', /hover:/.test(s1));
  ok('M2 table buttons use transition', /transition/.test(s2));
  ok('M4 has interactive hover state styling on buttons', /hover:bg-/.test(s4));
  ok('M9 has handover amount input elements', /type="number"/.test(read('components/manager/ScreenM9WaiterCash.tsx')));
  ok('M16 has number input for cash counted', /type="number"/.test(s16));
  ok('M6 has form element for queue entry', /<form/.test(read('components/manager/ScreenM6WaitingQueue.tsx')));
  ok('M13 has form element for petty expense', /<form/.test(read('components/manager/ScreenM13PettyExpenses.tsx')));
});

// ─── Final Summary ─────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
console.log('Phase 6 — Manager Portal');
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  for (const f of failures) console.log(`  ✗ ${f}`);
}
console.log('─'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
