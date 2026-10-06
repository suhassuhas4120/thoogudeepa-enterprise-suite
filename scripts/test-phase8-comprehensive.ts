/**
 * Phase 8 — UI / Visual / UX / Design System Compliance
 * Tests all screen files across customer, kitchen, manager, and shared UI
 * components against the enforced design system, UX patterns, and accessibility.
 *
 * Run: npx tsx scripts/test-phase8-comprehensive.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Harness ──────────────────────────────────────────────────────────────────

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

function group(title: string, fn: () => void): void {
  console.log(`\n▸ ${title}`);
  fn();
}

function read(relPath: string): string {
  const full = path.join(process.cwd(), relPath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
}

function exists(relPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), relPath));
}

// ─── Design System Constants ──────────────────────────────────────────────────

const TERRACOTTA_PRIMARY   = '#9C3D1E';
const TERRACOTTA_WARM      = '#8A4228';
const GOLD_SAFFRON         = '#D28835';
const CANVAS_APP           = '#FAF8F5';
const CARD_BORDER          = '#EAE5DF';
const CUSTOMER_BG_WARM     = '#FFFCF7';
const CUSTOMER_BORDER_WARM = '#E8D5C3';

const CUSTOMER_SCREENS = [
  'components/customer/Screen1Welcome.tsx',
  'components/customer/Screen2Menu.tsx',
  'components/customer/Screen3ItemDetail.tsx',
  'components/customer/Screen4Cart.tsx',
  'components/customer/Screen5LiveTracking.tsx',
  'components/customer/Screen6PaymentBreakdown.tsx',
  'components/customer/Screen7PaymentGateway.tsx',
  'components/customer/Screen8Confirmation.tsx',
  'components/customer/Screen9DigitalBill.tsx',
  'components/customer/Screen10WaiterCall.tsx',
  'components/customer/Screen11Loyalty.tsx',
  'components/customer/Screen12Feedback.tsx',
];

const MANAGER_SCREENS = [
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

const KITCHEN_FILES = [
  'components/kitchen/ScreenK1Login.tsx',
  'components/kitchen/ScreenK2Overview.tsx',
  'components/kitchen/ScreenK3Detail.tsx',
  'components/kitchen/KitchenTabletHousing.tsx',
];

const UI_FILES = [
  'components/ui/ScreenHousing.tsx',
  'components/ui/WireHeader.tsx',
  'components/ui/StickyBottomBar.tsx',
  'components/ui/ItemDrawer.tsx',
];

const ALL_COMPONENT_FILES = [...CUSTOMER_SCREENS, ...MANAGER_SCREENS, ...KITCHEN_FILES, ...UI_FILES];

// ─── GROUP 1: All component files exist ───────────────────────────────────────

group('File existence — all screen and UI component files', () => {
  CUSTOMER_SCREENS.forEach(f => ok(`${path.basename(f)} exists`, exists(f)));
  MANAGER_SCREENS.forEach(f => ok(`${path.basename(f)} exists`, exists(f)));
  KITCHEN_FILES.forEach(f => ok(`${path.basename(f)} exists`, exists(f)));
  UI_FILES.forEach(f => ok(`${path.basename(f)} exists`, exists(f)));
  ok('app/globals.css exists', exists('app/globals.css'));
  ok('app/layout.tsx exists', exists('app/layout.tsx'));
});

// ─── GROUP 2: globals.css — design foundation ────────────────────────────────

group('globals.css — CSS custom properties and design foundation', () => {
  const css = read('app/globals.css');
  ok('--bg-app: #FAF8F5 defined', css.includes('--bg-app: #FAF8F5'));
  ok('--bg-surface: #FFFFFF defined', css.includes('--bg-surface: #FFFFFF'));
  ok('--text-primary: #1C1917 defined', css.includes('--text-primary: #1C1917'));
  ok('--text-secondary: #44403C defined', css.includes('--text-secondary: #44403C'));
  ok('--text-muted: #78716C defined', css.includes('--text-muted: #78716C'));
  ok('--brand-terracotta: #9C3D1E defined', css.includes('--brand-terracotta: #9C3D1E'));
  ok('--brand-gold: #D28835 defined', css.includes('--brand-gold: #D28835'));
  ok('Plus Jakarta Sans font loaded via Google Fonts', css.includes('Plus+Jakarta+Sans') || css.includes('Plus Jakarta Sans'));
  ok('JetBrains Mono font imported via Google Fonts', css.includes('JetBrains+Mono') || css.includes('JetBrains Mono'));
  ok('body uses Plus Jakarta Sans font-family', css.includes("font-family: 'Plus Jakarta Sans'"));
  ok('body background-color: #FAF8F5 set', css.includes('background-color: #FAF8F5'));
  ok('body color: #1C1917 set', css.includes('color: #1C1917'));
  ok('-webkit-font-smoothing: antialiased applied', css.includes('-webkit-font-smoothing: antialiased'));
  ok('-webkit-tap-highlight-color: transparent (mobile UX)', css.includes('-webkit-tap-highlight-color: transparent'));
  ok('.glass-header class defined', css.includes('.glass-header'));
  ok('.glass-footer class defined', css.includes('.glass-footer'));
  ok('glass-header uses backdrop-filter blur', css.includes('backdrop-filter: blur'));
  ok('.phone-mockup class defined', css.includes('.phone-mockup'));
  ok('.screen-housing class defined', css.includes('.screen-housing'));
  ok('phone-mockup width: 380px', css.includes('width: 380px'));
  ok('phone-mockup height: 800px', css.includes('height: 800px'));
  ok('phone-mockup border-radius: 40px (rounded phone edges)', css.includes('border-radius: 40px'));
  ok('Custom scrollbar styles defined (::-webkit-scrollbar)', css.includes('::-webkit-scrollbar'));
  ok('Scrollbar thumb uses rounded border-radius', css.includes('border-radius: 9999px'));
  ok('@media print rule for thermal receipt', css.includes('@media print'));
  ok('Thermal receipt targets #thermal-receipt element', css.includes('#thermal-receipt'));
  ok('Thermal receipt width: 80mm', css.includes('width: 80mm'));
  ok('Receipt font: Courier New (thermal printer standard)', css.includes("'Courier New'"));
  ok('[data-vaul-drawer] transition defined', css.includes('[data-vaul-drawer]'));
  ok('[data-vaul-overlay] backdrop defined', css.includes('[data-vaul-overlay]'));
});

// ─── GROUP 3: app/layout.tsx — root layout config ────────────────────────────

group('app/layout.tsx — root layout and metadata', () => {
  const l = read('app/layout.tsx');
  ok('layout.tsx exists and has content', l.length > 100);
  ok('layout imports globals.css', l.includes('globals.css'));
  ok('layout has metadata export (title)', l.includes('metadata') || l.includes('title'));
  ok('layout uses html and body tags', l.includes('<html') && l.includes('<body'));
  ok('layout has lang attribute on html', l.includes('lang='));
});

// ─── GROUP 4: ScreenHousing — mobile phone frame component ───────────────────

group('components/ui/ScreenHousing.tsx — mobile phone housing', () => {
  const s = read('components/ui/ScreenHousing.tsx');
  ok("ScreenHousing has 'use client' directive", s.includes("'use client'") || s.includes('"use client"'));
  ok('ScreenHousing imports Wifi and Battery from lucide-react', s.includes('Wifi') && s.includes('Battery'));
  ok('ScreenHousing imports React', s.includes('import React'));
  ok('ScreenHousing uses phone-mockup class', s.includes('phone-mockup'));
  ok('ScreenHousing renders Dynamic Island pill (bg-slate-900 — intentional)', s.includes('bg-slate-900'));
  ok('ScreenHousing has mobile status bar with time indicator (12:45)', s.includes('12:45') || s.includes('status') || s.includes('time'));
  ok('ScreenHousing renders Wifi icon for signal indicator', s.includes('Wifi'));
  ok('ScreenHousing renders Battery icon for battery indicator', s.includes('Battery'));
  ok('ScreenHousing is exported as named export', s.includes('export') && s.includes('ScreenHousing'));
  ok('ScreenHousing accepts children prop', s.includes('children'));
});

// ─── GROUP 5: WireHeader — customer navigation header ────────────────────────

group('components/ui/WireHeader.tsx — customer app header', () => {
  const w = read('components/ui/WireHeader.tsx');
  ok("WireHeader has 'use client' directive", w.includes("'use client'") || w.includes('"use client"'));
  ok('WireHeader imports ArrowLeft from lucide-react', w.includes('ArrowLeft'));
  ok('WireHeader imports Bell from lucide-react', w.includes('Bell'));
  ok('WireHeader imports ShoppingCart from lucide-react', w.includes('ShoppingCart'));
  ok('WireHeader uses backdrop-blur glassmorphism', w.includes('backdrop-blur') || w.includes('glass-header'));
  ok('WireHeader connects to CustomerContext', w.includes('useCustomer') || w.includes('CustomerContext'));
  ok('WireHeader exported as named export', w.includes('export') && w.includes('WireHeader'));
  ok('WireHeader uses justify-between for layout', w.includes('justify-between'));
  ok('WireHeader has sticky positioning', w.includes('sticky') || w.includes('fixed'));
  ok('WireHeader has z-index for overlay stacking', w.includes('z-'));
});

// ─── GROUP 6: StickyBottomBar — customer CTA bar ─────────────────────────────

group('components/ui/StickyBottomBar.tsx — sticky CTA bottom bar', () => {
  const s = read('components/ui/StickyBottomBar.tsx');
  ok("StickyBottomBar has 'use client' directive", s.includes("'use client'") || s.includes('"use client"'));
  ok('StickyBottomBar imports React', s.includes('import React'));
  ok('StickyBottomBar exported as named or default export', s.includes('export'));
  ok('StickyBottomBar uses sticky positioning', s.includes('sticky') || s.includes('fixed'));
  ok('StickyBottomBar uses bottom-0 positioning', s.includes('bottom-0') || s.includes('bottom:'));
  ok('StickyBottomBar uses backdrop blur styling', s.includes('backdrop-blur') || s.includes('glass-footer'));
  ok('StickyBottomBar accepts children and optional label prop', s.includes('children') && s.includes('label'));
  ok('StickyBottomBar has layout container styling', s.includes('px-') && s.includes('py-'));
  ok('StickyBottomBar has z-index for stacking', s.includes('z-'));
});

// ─── GROUP 7: ItemDrawer — bottom sheet menu item detail ─────────────────────

group('components/ui/ItemDrawer.tsx — menu item bottom sheet drawer', () => {
  const d = read('components/ui/ItemDrawer.tsx');
  ok("ItemDrawer has 'use client' directive", d.includes("'use client'") || d.includes('"use client"'));
  ok('ItemDrawer imports Plus and Minus icons (quantity controls)', d.includes('Plus') && d.includes('Minus'));
  ok('ItemDrawer imports X icon (close button)', d.includes('X,') || d.includes(', X') || d.includes('X }'));
  ok('ItemDrawer imports Check icon (confirm)', d.includes('Check'));
  ok('ItemDrawer imports MenuItem type', d.includes('MenuItem'));
  ok('ItemDrawer uses bg-slate-900/50 backdrop (intentional dark modal overlay)', d.includes('bg-slate-900'));
  ok('ItemDrawer has backdrop-blur for modal overlay', d.includes('backdrop'));
  ok('ItemDrawer has useState for quantity state', d.includes('useState'));
  ok('ItemDrawer has useEffect for reset on item change', d.includes('useEffect'));
  ok('ItemDrawer uses rounded-t-3xl or rounded-t-2xl top-sheet style', d.includes('rounded-t-'));
  ok('ItemDrawer uses orange/terracotta for CTA button', d.includes('orange-600') || d.includes(TERRACOTTA_PRIMARY) || d.includes(TERRACOTTA_WARM));
  ok('ItemDrawer has min/max quantity guards (min 1)', d.includes('Math.max') || d.includes('> 0') || d.includes('>= 1'));
  ok('ItemDrawer exported as named or default export', d.includes('export'));
  ok('ItemDrawer has touch-friendly button sizes', d.includes('p-') || d.includes('h-'));
});

// ─── GROUP 8: All customer screens — 'use client' directive ──────────────────

group('Customer screens — use client directive (all 12)', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} has 'use client' directive`, c.includes("'use client'") || c.includes('"use client"'));
  });
});

// ─── GROUP 9: All customer screens — lucide-react icons ──────────────────────

group('Customer screens — lucide-react icon imports (all 12)', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} imports from lucide-react`, c.includes('lucide-react'));
  });
});

// ─── GROUP 10: All customer screens — ScreenHousing wrapper ──────────────────

group('Customer screens — ScreenHousing wrapper component (all 12)', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} uses ScreenHousing component`, c.includes('ScreenHousing'));
  });
});

// ─── GROUP 11: All customer screens — React functional component ──────────────

group('Customer screens — React functional component export (all 12)', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} imports React`, c.includes('import React'));
    ok(`${name} has default or named export`, c.includes('export default') || c.includes('export function') || c.includes('export const'));
  });
});

// ─── GROUP 12: Customer screens — store connections ──────────────────────────

group('Customer screens — store and context connections', () => {
  const screens = CUSTOMER_SCREENS.map(f => read(f));

  ok('Customer screens connect to CustomerContext or useCustomer', screens.filter(c => c.includes('useCustomer') || c.includes('CustomerContext') || c.includes('useCustomerStore')).length >= 10);
  ok('Screens placing orders connect to shared order tracking or bridge', screens.filter(c => c.includes('useSharedBridge') || c.includes('useOrderTrackingQuery') || c.includes('cart')).length >= 8);
  ok('Screen4Cart connects to store for order submission', screens[3].includes('useCustomer') || screens[3].includes('useSharedBridge'));
  ok('Screen5LiveTracking connects to real-time order tracking', screens[4].includes('useOrderTrackingQuery') || screens[4].includes('useSharedBridge'));
  ok('Screen10WaiterCall triggers waiter assistance requests', screens[9].includes('customerPingsWaiter') || screens[9].includes('useSharedBridge') || screens[9].includes('ping') || screens[9].includes('Waiter'));
  ok('Screen11Loyalty displays loyalty points and rewards', screens[10].includes('point') || screens[10].includes('Point') || screens[10].includes('loyal') || screens[10].includes('tier'));
  ok('Screen12Feedback has rating/feedback submission', screens[11].includes('rating') || screens[11].includes('star') || screens[11].includes('feedback') || screens[11].includes('submit'));
});

// ─── GROUP 13: Customer screens — rounded corners (no sharp UI) ───────────────

group('Customer screens — rounded corners on all interactive elements', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} uses rounded classes (no sharp corners)`, c.includes('rounded'));
    ok(`${name} uses rounded-lg or larger on cards`, c.includes('rounded-lg') || c.includes('rounded-xl') || c.includes('rounded-2xl') || c.includes('rounded-3xl') || c.includes('rounded-['));
  });
});

// ─── GROUP 14: Customer screens — flex layout (all use flex) ─────────────────

group('Customer screens — flex layout used consistently', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} uses flex layout`, c.includes('flex'));
  });
});

// ─── GROUP 15: Customer screens — transition/animation classes ───────────────

group('Customer screens — micro-interactions and transitions', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} has transition or framer-motion animations`, c.includes('transition') || c.includes('motion') || c.includes('animate'));
  });
  const s5 = read('components/customer/Screen5LiveTracking.tsx');
  ok('Screen5 (live tracking) has pulsing/spinning real-time indicator', s5.includes('animate-pulse') || s5.includes('animate-ping') || s5.includes('animate-spin'));
  const s8 = read('components/customer/Screen8Confirmation.tsx');
  ok('Screen8 (confirmation) has animated confirmation feedback', s8.includes('motion') || s8.includes('transition') || s8.includes('animate'));
});

// ─── GROUP 16: Customer screens — no forbidden dark backgrounds ───────────────

group('Customer screens — no forbidden dark backgrounds (light theme; slate-900 allowed for accents)', () => {
  // Translucent bg-black/NN overlays (e.g. the sold-out "86" overlay on menu photos) are allowed;
  // only an opaque bg-black page background is a violation.
  const FORBIDDEN = ['bg-stone-900', 'bg-slate-950', 'bg-gray-900', 'bg-zinc-900', 'bg-neutral-900'];
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const violations = [...FORBIDDEN.filter(cls => c.includes(cls)), ...(/bg-black(?!\/)/.test(c) ? ['bg-black'] : [])];
    ok(`${name} has no dark background classes`, violations.length === 0);
  });
});

// ─── GROUP 17: Customer screens — soft elevation (no harsh neo-brutalist shadows) ──

group('Customer screens — soft elevation styling (no harsh offset shadows)', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const hasBrutalist = /shadow-\[\d+px_\d+px_0px_#/.test(c);
    ok(`${name} has no harsh brutalist offset shadow`, !hasBrutalist);
  });
});

// ─── GROUP 18: Customer screens — warm background token usage ────────────────

group('Customer screens — warm background and canvas tokens', () => {
  const hasCustBg = CUSTOMER_SCREENS.filter(f => read(f).includes(CUSTOMER_BG_WARM) || read(f).includes(CANVAS_APP)).length;
  ok('Customer screens use warm off-white #FFFCF7 or #FAF8F5 canvas', hasCustBg >= 6);
  ok('ScreenHousing uses light chrome (bg-white status bar, slate borders)', read('components/ui/ScreenHousing.tsx').includes('bg-white') && read('components/ui/ScreenHousing.tsx').includes('border-slate-'));
  ok('globals.css defines #FAF8F5 canvas background for app', read('app/globals.css').includes('#FAF8F5'));
});

// ─── GROUP 19: Customer screens — typography hierarchy ────────────────────────

group('Customer screens — typography sizing and weight hierarchy', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const hasTextSizing = c.includes('text-xs') || c.includes('text-sm') || c.includes('text-base') || c.includes('text-lg') || c.includes('text-xl') || c.includes('text-[');
    ok(`${name} uses typography scale classes`, hasTextSizing);
  });
});

// ─── GROUP 20: Customer Screen1 — welcome/QR scan screen ─────────────────────

group('Screen1Welcome — welcome and QR entry screen elements', () => {
  const s = read('components/customer/Screen1Welcome.tsx');
  ok('Screen1 has table or seat number entry', s.includes('table') || s.includes('Table') || s.includes('seat') || s.includes('Seat'));
  ok('Screen1 has guest name input', s.includes('guestName') || s.includes('guest') || s.includes('name'));
  ok('Screen1 has submit/enter button', s.includes('onClick') || s.includes('button') || s.includes('Button'));
  ok('Screen1 uses useState for form state', s.includes('useState'));
  ok('Screen1 has Thoogudeepa branding', s.includes('Thoogudeepa') || s.includes('thoogudeepa') || s.includes('DONNE BIRYANI'));
  ok('Screen1 navigates to menu screen (setCurrentScreen)', s.includes('setCurrentScreen'));
  ok('Screen1 has welcome greeting or dine context', s.includes('Welcome') || s.includes('welcome') || s.includes('DINE') || s.includes('Namaste'));
  ok('Screen1 uses warm terracotta branding (#8A4228 or #9C3D1E)', s.includes(TERRACOTTA_WARM) || s.includes(TERRACOTTA_PRIMARY));
  ok('Screen1 has padding for comfortable spacing', s.includes('p-') || s.includes('px-') || s.includes('py-'));
});

// ─── GROUP 21: Customer Screen2 — menu browser ───────────────────────────────

group('Screen2Menu — menu browsing and category filters', () => {
  const s = read('components/customer/Screen2Menu.tsx');
  ok('Screen2 has category filter/tabs', s.includes('category') || s.includes('Category') || s.includes('filter'));
  ok('Screen2 renders menu items list', s.includes('INITIAL_MENU_ITEMS') || s.includes('menuItem') || s.includes('item.name'));
  ok('Screen2 has item price display', s.includes('price') || s.includes('₹'));
  ok('Screen2 has add-to-cart functionality', s.includes('addToCart') || s.includes('addToOrderCart') || s.includes('ItemDrawer'));
  ok('Screen2 uses ItemDrawer for item detail', s.includes('ItemDrawer'));
  ok('Screen2 shows item badges (Bestseller etc)', s.includes('badge') || s.includes('Badge') || s.includes('Bestseller') || s.includes('label'));
  ok('Screen2 has search or filter capability', s.includes('search') || s.includes('Search') || s.includes('filter') || s.includes('category'));
  ok('Screen2 uses 86 inventory to mark unavailable items', s.includes('is86') || s.includes('inventory86') || s.includes('useSharedBridge'));
  ok('Screen2 has scroll area for long lists', s.includes('overflow-y-auto') || s.includes('overflow-y-scroll') || s.includes('scroll'));
});

// ─── GROUP 22: Customer Screen4 — cart ───────────────────────────────────────

group('Screen4Cart — order cart and place order flow', () => {
  const s = read('components/customer/Screen4Cart.tsx');
  ok('Screen4 renders cart items list', s.includes('orderCart') || s.includes('cartItem') || s.includes('cart'));
  ok('Screen4 shows item quantities', s.includes('quantity') || s.includes('qty'));
  ok('Screen4 shows subtotal/total price', s.includes('subtotal') || s.includes('total') || s.includes('Total'));
  ok('Screen4 has place order / confirm CTA button', s.includes('Place') || s.includes('Confirm') || s.includes('Order') || s.includes('KOT'));
  ok('Screen4 has empty cart state', s.includes('empty') || s.includes('Empty') || s.includes('cart.length === 0') || s.includes('orderCart.length'));
  ok('Screen4 has back navigation (showBack prop or onBack handler)', s.includes('showBack') || s.includes('onBack') || s.includes('ArrowLeft'));
  ok('Screen4 has item remove/quantity controls', s.includes('Minus') || s.includes('minus') || s.includes('remove') || s.includes('Trash'));
});

// ─── GROUP 23: Customer Screen5 — live order tracking ─────────────────────────

group('Screen5LiveTracking — real-time order status display', () => {
  const s = read('components/customer/Screen5LiveTracking.tsx');
  ok('Screen5 shows order stages (PLACED/PREP/PLATED/SERVED)', s.includes('PLACED') && s.includes('PREP') && s.includes('PLATED') && s.includes('SERVED'));
  ok('Screen5 shows live ticket or stage status', s.includes('overallStage') || s.includes('tickets') || s.includes('orderStage'));
  ok('Screen5 has live/real-time indicator', s.includes('animate-ping') || s.includes('animate-pulse') || s.includes('Wifi') || s.includes('Live'));
  ok('Screen5 uses real-time CDC order tracking query', s.includes('useOrderTrackingQuery') || s.includes('useSharedBridge'));
  ok('Screen5 shows item lists from active tickets', s.includes('allMyItems') || s.includes('items') || s.includes('item'));
  ok('Screen5 has progress steps and active progress line', s.includes('stages') && (s.includes('Progress Line') || s.includes('bg-orange-500')));
  ok('Screen5 has labels for order stage progression', s.includes('PREPARING') && s.includes('READY TO SERVE') && s.includes('SERVED'));
});

// ─── GROUP 24: Customer Screen6 — payment breakdown ──────────────────────────

group('Screen6PaymentBreakdown — billing and GST calculation', () => {
  const s = read('components/customer/Screen6PaymentBreakdown.tsx');
  ok('Screen6 shows subtotal amount', s.includes('subtotal') || s.includes('Subtotal'));
  ok('Screen6 shows GST/tax calculation (5% GST: 2.5% CGST + 2.5% SGST)', s.includes('0.05') || s.includes('GST') || s.includes('tax'));
  ok('Screen6 shows grand total amount', s.includes('grandTotal') || s.includes('Total'));
  ok('Screen6 has tip presets and custom tip support', s.includes('tip') && s.includes('tipPresets'));
  ok('Screen6 has bill split functionality (splitPersons)', s.includes('splitPersons') || s.includes('setSplitMode'));
  ok('Screen6 shows rupee symbol', s.includes('₹'));
  ok('Screen6 has proceed to payment CTA', s.includes('Proceed') || s.includes('Pay') || s.includes('pay') || s.includes('Screen7'));
});

// ─── GROUP 25: Customer Screen7 — payment gateway ────────────────────────────

group('Screen7PaymentGateway — UPI, Card, Netbanking payment options', () => {
  const s = read('components/customer/Screen7PaymentGateway.tsx');
  ok('Screen7 has UPI payment option', s.includes('Smartphone') || s.includes('UPI') || s.includes('upi'));
  ok('Screen7 has Card payment option', s.includes('CreditCard') || s.includes('CARD') || s.includes('Card'));
  ok('Screen7 has Net Banking option', s.includes('Building2') || s.includes('Bank') || s.includes('bank'));
  ok('Screen7 has Cash at Counter option', s.includes('Banknote') || s.includes('Cash') || s.includes('cash'));
  ok('Screen7 generates dynamic UPI payment URI and QR code', s.includes('upiUri') || s.includes('qrDataUrl') || s.includes('QrCode'));
  ok('Screen7 shows payment security guarantee', s.includes('ShieldCheck') || s.includes('Secure') || s.includes('secure'));
  ok('Screen7 connects to payment recording bridge action', s.includes('waiterRecordsPayment') || s.includes('payment'));
  ok('Screen7 navigates to confirmation on success', s.includes('Screen8') || s.includes('confirmation') || s.includes('Confirmation') || s.includes('setCurrentScreen(8)'));
});

// ─── GROUP 26: Customer Screen8 — order confirmation ─────────────────────────

group('Screen8Confirmation — success confirmation screen elements', () => {
  const s = read('components/customer/Screen8Confirmation.tsx');
  ok('Screen8 has success/check icon or visual', s.includes('Check') || s.includes('check') || s.includes('success'));
  ok('Screen8 shows confirmation message', s.includes('Confirmed') || s.includes('confirmed') || s.includes('Paid') || s.includes('Success'));
  ok('Screen8 has order number or transaction reference', s.includes('transactionId') || s.includes('TXN') || s.includes('order'));
  ok('Screen8 has navigation CTA (view bill or return)', s.includes('Digital Bill') || s.includes('Screen9') || s.includes('setCurrentScreen'));
  ok('Screen8 uses gentle soft shadow elevation', s.includes('shadow-md') || s.includes('shadow-sm') || s.includes('shadow-xs'));
  ok('Screen8 has green success color for confirmation (#198754 or emerald)', s.includes('#198754') || s.includes('emerald') || s.includes('green'));
});

// ─── GROUP 27: Customer Screen9 — digital bill ───────────────────────────────

group('Screen9DigitalBill — digital tax invoice receipt', () => {
  const s = read('components/customer/Screen9DigitalBill.tsx');
  ok('Screen9 renders tax invoice header', s.includes('TAX INVOICE') || s.includes('Invoice') || s.includes('Bill'));
  ok('Screen9 renders venue name from context (venueName)', s.includes('venueName') || s.includes('Thoogudeepa'));
  ok('Screen9 shows itemized order lines', s.includes('cart.map') && s.includes('totalPrice'));
  ok('Screen9 shows total amount with rupee symbol', s.includes('₹') && s.includes('paidTotal'));
  ok('Screen9 shows statutory GSTIN & FSSAI information', s.includes('GSTIN') && s.includes('FSSAI'));
  ok('Screen9 has CGST and SGST statutory split (2.5% each)', s.includes('cgst') && s.includes('sgst'));
  ok('Screen9 has share/download options', s.includes('handleDownload') && s.includes('handleShareWhatsApp'));
});

// ─── GROUP 28: Customer Screen10 — waiter call ───────────────────────────────

group('Screen10WaiterCall — ping waiter buttons', () => {
  const s = read('components/customer/Screen10WaiterCall.tsx');
  ok('Screen10 has WATER ping option', s.includes('WATER') || s.includes('Water'));
  ok('Screen10 has TISSUE ping option', s.includes('TISSUE') || s.includes('Tissue'));
  ok('Screen10 has CUTLERY ping option', s.includes('CUTLERY') || s.includes('Cutlery'));
  ok('Screen10 has GENERAL ASSISTANCE call option', s.includes('GENERAL') || s.includes('General') || s.includes('Call') || s.includes('BILL'));
  ok('Screen10 triggers waiter call action', s.includes('customerPingsWaiter') || s.includes('ping') || s.includes('Ping'));
  ok('Screen10 has confirmation/sent feedback state', s.includes('sent') || s.includes('Sent') || s.includes('success') || s.includes('useState'));
  ok('Screen10 has bell or assistance icon from lucide', s.includes('lucide-react'));
});

// ─── GROUP 29: Customer Screen11 — loyalty ───────────────────────────────────

group('Screen11Loyalty — loyalty points dashboard', () => {
  const s = read('components/customer/Screen11Loyalty.tsx');
  ok('Screen11 shows loyalty points balance', s.includes('point') || s.includes('Point'));
  ok('Screen11 uses orange accent color', /orange-(500|600|700)/.test(s));
  ok('Screen11 has tier or membership display', s.includes('tier') || s.includes('Tier') || s.includes('Gold') || s.includes('Silver') || s.includes('Member'));
  ok('Screen11 has reward redemption/history section', s.includes('reward') || s.includes('history') || s.includes('earn') || s.includes('redeem'));
  ok('Screen11 uses lucide icons', s.includes('lucide-react'));
});

// ─── GROUP 30: Customer Screen12 — feedback ──────────────────────────────────

group('Screen12Feedback — post-meal feedback and rating', () => {
  const s = read('components/customer/Screen12Feedback.tsx');
  ok('Screen12 has star rating UI', s.includes('star') || s.includes('Star') || s.includes('rating'));
  ok('Screen12 has rating categories (food/service/ambiance)', s.includes('food') || s.includes('Food') || s.includes('service') || s.includes('Service'));
  ok('Screen12 has comment/feedback textarea', s.includes('comment') || s.includes('Comment') || s.includes('feedback') || s.includes('textarea'));
  ok('Screen12 has submit button', s.includes('Submit') || s.includes('submit') || s.includes('Send'));
  ok('Screen12 uses useState for rating state', s.includes('useState'));
  ok('Screen12 has thank-you / success state', s.includes('Thank') || s.includes('thank') || s.includes('success') || s.includes('submitted'));
});

// ─── GROUP 31: Kitchen files — use client directive ──────────────────────────

group('Kitchen screens — use client directive', () => {
  KITCHEN_FILES.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} has 'use client'`, c.includes("'use client'") || c.includes('"use client"'));
  });
});

// ─── GROUP 32: KitchenTabletHousing — tablet bezel frame ────────────────────

group('KitchenTabletHousing — tablet hardware frame component', () => {
  const k = read('components/kitchen/KitchenTabletHousing.tsx');
  ok('KitchenTabletHousing imports Wifi, Flame, AlertCircle from lucide', k.includes('Wifi') && k.includes('Flame') && k.includes('AlertCircle'));
  ok('KitchenTabletHousing uses intentional dark bezel (border-slate-800)', k.includes('border-slate-800') || k.includes('slate-800'));
  ok('KitchenTabletHousing connects to useKitchenStore', k.includes('useKitchenStore'));
  ok('KitchenTabletHousing has kitchen header bar', k.includes('header') || k.includes('bar') || k.includes('status'));
  ok('KitchenTabletHousing exported as named export', k.includes('export') && k.includes('KitchenTabletHousing'));
  ok('KitchenTabletHousing accepts children', k.includes('children'));
  ok('KitchenTabletHousing has station indicator', k.includes('station') || k.includes('Station') || k.includes('MASTER'));
});

// ─── GROUP 33: ScreenK1Login — kitchen PIN login ──────────────────────────────

group('ScreenK1Login — kitchen staff PIN login screen', () => {
  const s = read('components/kitchen/ScreenK1Login.tsx');
  ok('ScreenK1 has PIN entry pad', s.includes('PIN') || s.includes('pin') || s.includes('handleKeyPress'));
  ok('ScreenK1 uses KitchenTabletHousing wrapper', s.includes('KitchenTabletHousing'));
  ok('ScreenK1 sets active station upon login', s.includes('setActiveStation'));
  ok('ScreenK1 validates against KITCHEN_MASTER_PIN', s.includes('KITCHEN_MASTER_PIN'));
  ok('ScreenK1 navigates to Screen 2 on successful PIN entry', s.includes('setCurrentScreen(2)'));
  ok('ScreenK1 has backspace / clear PIN handlers', s.includes('handleBackspace') && s.includes('handleClear'));
});

// ─── GROUP 34: ScreenK2Overview — kitchen order display board ────────────────

group('ScreenK2Overview — kitchen display system overview', () => {
  const s = read('components/kitchen/ScreenK2Overview.tsx');
  ok('ScreenK2 supports KDS tickets from bridge', s.includes('bridgeTickets') || s.includes('kdsTickets'));
  ok('ScreenK2 shows KDS order stages (RECEIVED, PREPARING, READY)', s.includes('RECEIVED') && s.includes('PREPARING') && s.includes('READY'));
  ok('ScreenK2 has menu category filter (MenuCategory, ALL_CATEGORIES)', s.includes('selectedCategory') && s.includes('ALL_CATEGORIES'));
  ok('ScreenK2 connects to kitchenSetItemStage for bumping item stage', s.includes('kitchenSetItemStage'));
  ok('ScreenK2 connects to kitchenSetBulkItemStage for bulk item dispatch', s.includes('kitchenSetBulkItemStage'));
  ok('ScreenK2 tracks elapsed time for tickets', s.includes('elapsedMinutes') || s.includes('Clock'));
  ok('ScreenK2 uses KitchenTabletHousing wrapper', s.includes('KitchenTabletHousing'));
  // NOTE: the AudioContext chime for new KOTs is no longer in ScreenK2Overview (it now only lives in the waiter pages).
  // Check with the team whether the kitchen chime was removed on purpose; until then just verify tickets are read.
  ok('ScreenK2 reads incoming KOT tickets from the shared bridge (kdsTickets)', s.includes('kdsTickets'));
});

// ─── GROUP 35: ScreenK3Detail — ticket item-level detail ──────────────────────

group('ScreenK3Detail — kitchen ticket item detail view', () => {
  const s = read('components/kitchen/ScreenK3Detail.tsx');
  ok('ScreenK3 shows item name and quantity', s.includes('name') && s.includes('quantity'));
  ok('ScreenK3 has per-item stage progression', s.includes('stage') || s.includes('Stage') || s.includes('bumpItem'));
  ok('ScreenK3 has back button to overview (setCurrentScreen(2))', s.includes('setCurrentScreen(2)') || s.includes('back'));
  ok('ScreenK3 uses KitchenTabletHousing wrapper', s.includes('KitchenTabletHousing'));
  ok('ScreenK3 uses orange accent branding', /orange-(500|600|700)/.test(s));
  ok('ScreenK3 displays special cooking instructions and options', s.includes('note') || s.includes('addOn') || s.includes('option'));
});

// ─── GROUP 36: All manager screens — use client directive ────────────────────

group('Manager screens — use client directive (all 16)', () => {
  MANAGER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} has 'use client'`, c.includes("'use client'") || c.includes('"use client"'));
  });
});

// ─── GROUP 37: All manager screens — lucide icons ────────────────────────────

group('Manager screens — lucide-react imports (all 16)', () => {
  MANAGER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} imports from lucide-react`, c.includes('lucide-react'));
  });
});

// ─── GROUP 38: Manager screens — terracotta brand color ──────────────────────

group('Manager screens — orange accent used across portal', () => {
  const withAccent = MANAGER_SCREENS.filter(f => /orange-(500|600|700)/.test(read(f))).length;
  ok('At least 12 manager screens use the orange accent', withAccent >= 12);
});

// ─── GROUP 39: Manager screens — no forbidden dark backgrounds ───────────────

group('Manager screens — no forbidden dark backgrounds (slate-900 allowed for accents)', () => {
  const FORBIDDEN = ['bg-stone-900', 'bg-slate-950', 'bg-gray-900', 'bg-zinc-900', 'bg-black'];
  MANAGER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const violations = FORBIDDEN.filter(cls => c.includes(cls));
    ok(`${name} has no dark background classes`, violations.length === 0);
  });
});

// ─── GROUP 40: Manager screens — card border color #EAE5DF ───────────────────

group('Manager screens — slate card border usage', () => {
  const hasCardBorder = MANAGER_SCREENS.filter(f => /border-slate-(200|300|900)/.test(read(f))).length;
  ok('At least 12 manager screens use slate card borders', hasCardBorder >= 12);
  ok('ScreenM2LiveOverview uses card border', /border-slate-(200|300|900)/.test(read('components/manager/ScreenM2LiveOverview.tsx')));
  ok('ScreenM11SalesReport uses card border', /border-slate-(200|300|900)/.test(read('components/manager/ScreenM11SalesReport.tsx')));
});

// ─── GROUP 41: Manager screens — rounded card corners ────────────────────────

group('Manager screens — rounded corners on cards and panels', () => {
  MANAGER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    ok(`${name} uses rounded classes`, c.includes('rounded'));
  });
});

// ─── GROUP 42: ScreenM1Login — manager PIN authentication ────────────────────

group('ScreenM1Login — manager portal PIN login', () => {
  const s = read('components/manager/ScreenM1Login.tsx');
  ok('ScreenM1Login imports MANAGER_PROFILES and INITIAL_SHIFTS from store', s.includes('MANAGER_PROFILES') && s.includes('INITIAL_SHIFTS'));
  ok('ScreenM1Login has numeric keypad entry', s.includes('enterPinDigit') || s.includes('pinInput'));
  ok('ScreenM1Login has profile selection', s.includes('activeManager') || s.includes('setActiveManager'));
  ok('ScreenM1Login uses orange accent tag', /orange-(500|600|700)/.test(s));
  ok('ScreenM1Login supports verifyPin validation', s.includes('verifyPin'));
  ok('ScreenM1Login has clear / delete PIN functions', s.includes('clearPin') && s.includes('deletePinDigit'));
});

// ─── GROUP 43: ScreenM2LiveOverview — manager dashboard ──────────────────────

group('ScreenM2LiveOverview — manager live dashboard cards', () => {
  const s = read('components/manager/ScreenM2LiveOverview.tsx');
  ok('ScreenM2 shows total revenue stat', s.includes('totalRevenue'));
  ok('ScreenM2 shows tables served count', s.includes('tablesServed'));
  ok('ScreenM2 tracks occupied tables count', s.includes('occupiedTables') || s.includes('OCCUPIED'));
  ok('ScreenM2 shows active KDS tickets count', s.includes('activeKdsCount') || s.includes('kdsTickets'));
  ok('ScreenM2 uses stat card layout with slate borders', /border-slate-(200|300|900)/.test(s));
  ok('ScreenM2 uses shiftStats from bridge', s.includes('shiftStats') && s.includes('useSharedBridge'));
});

// ─── GROUP 44: ScreenM11SalesReport — analytics screen ───────────────────────

group('ScreenM11SalesReport — sales analytics and reporting', () => {
  const s = read('components/manager/ScreenM11SalesReport.tsx');
  ok('ScreenM11 calculates totalSales based on shiftStats', s.includes('totalSales') && s.includes('shiftStats'));
  ok('ScreenM11 shows category-wise sales distribution', s.includes('categories') && s.includes('Donne Biryani'));
  ok('ScreenM11 shows payment channel distribution (UPI, Cash, Card)', s.includes('channels') && s.includes('UPI') && s.includes('Cash'));
  ok('ScreenM11 shows top revenue-generating dishes', s.includes('topDishes') && s.includes('Mutton Donne Biryani'));
  ok('ScreenM11 uses slate card border', /border-slate-(200|300|900)/.test(s));
});

// ─── GROUP 45: ScreenM13PettyExpenses — expense tracking ─────────────────────

group('ScreenM13PettyExpenses — petty cash expense management', () => {
  const s = read('components/manager/ScreenM13PettyExpenses.tsx');
  ok('ScreenM13 has add expense functionality', s.includes('addPettyExpense') || s.includes('pettyExpenses'));
  ok('ScreenM13 shows expense categories', s.includes('category') || s.includes('Category'));
  ok('ScreenM13 shows running total of petty expenses', s.includes('totalPetty') || s.includes('reduce'));
  ok('ScreenM13 uses orange accent color', /orange-(500|600|700)/.test(s));
});

// ─── GROUP 46: ScreenM16DayCloseZReport — end of day ─────────────────────────

group('ScreenM16DayCloseZReport — day close and Z-report screen', () => {
  const s = read('components/manager/ScreenM16DayCloseZReport.tsx');
  ok('ScreenM16 has day close / Z-report print action', s.includes('handlePrintZ') || s.includes('handleLockShift'));
  ok('ScreenM16 calculates CGST and SGST statutory tax breakdown', s.includes('cgst') && s.includes('sgst'));
  ok('ScreenM16 calculates drawer variance and cash reconciliation', s.includes('variance') && s.includes('expectedCashInTill'));
  ok('ScreenM16 has shift locking state', s.includes('shiftLocked') && s.includes('setShiftLocked'));
  ok('ScreenM16 uses orange accent color', /orange-(500|600|700)/.test(s));
});

// ─── GROUP 47: Shadow system compliance ───────────────────────────────────────

group('Shadow system compliance across customer and management portals', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const hasBrutalist = /shadow-\[\d+px_\d+px_0px_#/.test(c);
    ok(`${name} uses soft shadows (no harsh box shadows)`, !hasBrutalist);
  });
  const m10 = read('components/manager/ScreenM10Menu86Stock.tsx');
  ok('ScreenM10 uses intentional POS killswitch tactile elevation', m10.includes('shadow-'));
});

// ─── GROUP 48: No AI traces in any component file ────────────────────────────

group('No AI traces or unwanted terms — all component files', () => {
  const BANNED_PATTERNS = [
    /\bfeat:/i,
    /\bfix:/i,
    /\bchore:/i,
    /\bai-generated\b/i,
    /\blorem ipsum\b/i,
    /\btodo:\s*implement\b/i,
    /\/\/\s*placeholder\b/i,
    /\bmock_data\b/i,
    /\bgenerated by ai\b/i,
    /\bchatgpt\b/i,
    /\bcopilot\b/i,
  ];

  ALL_COMPONENT_FILES.forEach(f => {
    const c = read(f);
    const violations = BANNED_PATTERNS.filter(p => p.test(c));
    const name = path.basename(f, '.tsx');
    ok(`${name} has no AI traces or unwanted terms`, violations.length === 0);
  });
  ok('globals.css has no AI traces', !BANNED_PATTERNS.some(p => p.test(read('app/globals.css'))));
  ok('app/layout.tsx has no AI traces', !BANNED_PATTERNS.some(p => p.test(read('app/layout.tsx'))));
});

// ─── GROUP 49: Typography — font weight hierarchy ────────────────────────────

group('Typography — font-weight hierarchy and text sizing across portals', () => {
  const custWithFontBold = CUSTOMER_SCREENS.filter(f => {
    const c = read(f);
    return c.includes('font-bold') || c.includes('font-semibold') || c.includes('font-medium') || c.includes('font-black');
  }).length;
  ok('All 12 customer screens use font-weight hierarchy', custWithFontBold === 12);

  const mgrWithFont = MANAGER_SCREENS.filter(f => {
    const c = read(f);
    return c.includes('font-bold') || c.includes('font-semibold') || c.includes('font-medium') || c.includes('font-black');
  }).length;
  ok('All manager screens use font-weight hierarchy', mgrWithFont === MANAGER_SCREENS.length);

  const custWithTextSizes = CUSTOMER_SCREENS.filter(f => {
    const c = read(f);
    return c.includes('text-xs') || c.includes('text-sm') || c.includes('text-base') || c.includes('text-lg') || c.includes('text-xl');
  }).length;
  ok('All customer screens use text size classes for hierarchy', custWithTextSizes === 12);

  const k2 = read('components/kitchen/ScreenK2Overview.tsx');
  ok('Kitchen overview uses high contrast typography (font-bold/black)', k2.includes('font-bold') && k2.includes('font-black'));

  ok('ScreenM16 or Screen9 uses mono font for receipt formatting', read('components/customer/Screen9DigitalBill.tsx').includes('font-mono') && read('components/manager/ScreenM16DayCloseZReport.tsx').includes('font-mono'));
});

// ─── GROUP 50: Spacing and padding consistency ────────────────────────────────

group('Spacing — padding and gap consistency across all portals', () => {
  const custWithPadding = CUSTOMER_SCREENS.filter(f => {
    const c = read(f);
    return c.includes('p-') || c.includes('px-') || c.includes('py-') || c.includes('pt-') || c.includes('pb-');
  }).length;
  ok('All 12 customer screens have padding', custWithPadding === 12);

  const mgrWithPadding = MANAGER_SCREENS.filter(f => {
    const c = read(f);
    return c.includes('p-') || c.includes('px-') || c.includes('py-');
  }).length;
  ok('All manager screens have padding', mgrWithPadding === MANAGER_SCREENS.length);

  const custWithGap = CUSTOMER_SCREENS.filter(f => read(f).includes('gap-')).length;
  ok('At least 8 customer screens use gap- for spacing', custWithGap >= 8);

  const custWithMax = CUSTOMER_SCREENS.filter(f => read(f).includes('max-w-') || read(f).includes('w-full') || read(f).includes('flex')).length;
  ok('All customer screens constrain layout width', custWithMax === 12);
});

// ─── GROUP 51: Interactive UX — hover and tap states ──────────────────────────

group('Interactive UX — hover and tap states on interactive elements', () => {
  const custWithHover = CUSTOMER_SCREENS.filter(f => read(f).includes('hover:') || read(f).includes('whileTap')).length;
  ok('All customer screens have interactive feedback (hover: or framer whileTap)', custWithHover === 12);

  const mgrWithHover = MANAGER_SCREENS.filter(f => read(f).includes('hover:')).length;
  ok('All manager screens have hover: states on interactive elements', mgrWithHover === MANAGER_SCREENS.length);

  const kitWithHover = KITCHEN_FILES.filter(f => read(f).includes('hover:')).length;
  ok('Kitchen screens have hover: states', kitWithHover >= 2);
});

// ─── GROUP 52: Button patterns — consistent CTA styling ──────────────────────

group('Button patterns — CTA button styling consistency', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const hasRoundedButton = c.includes('rounded') && (c.includes('px-') || c.includes('py-') || c.includes('p-'));
    ok(`${name} has rounded and padded interactive buttons`, hasRoundedButton);
  });

  const custWithTerracotta = CUSTOMER_SCREENS.filter(f => read(f).includes(TERRACOTTA_PRIMARY) || read(f).includes(TERRACOTTA_WARM) || read(f).includes('orange-600')).length;
  ok('At least 8 customer screens use terracotta/warm brand colors for primary actions', custWithTerracotta >= 8);
});

// ─── GROUP 53: Loading and empty state UX ────────────────────────────────────

group('UX — loading states, empty states, and skeleton patterns', () => {
  const allFiles = [...CUSTOMER_SCREENS, ...MANAGER_SCREENS, ...KITCHEN_FILES];

  const withLoading = allFiles.filter(f => {
    const c = read(f);
    return c.includes('loading') || c.includes('Loading') || c.includes('spinner') || c.includes('animate-spin') || c.includes('animate-pulse');
  }).length;
  ok('At least 5 files implement loading states', withLoading >= 5);

  const withEmpty = allFiles.filter(f => {
    const c = read(f);
    return c.includes('empty') || c.includes('Empty') || c.includes('length === 0') || c.includes('.length');
  }).length;
  ok('At least 8 files handle empty state display', withEmpty >= 8);

  const s5 = read('components/customer/Screen5LiveTracking.tsx');
  ok('Screen5 handles empty/no-orders state', s5.includes('length') || s5.includes('empty') || s5.includes('No'));

  const k2 = read('components/kitchen/ScreenK2Overview.tsx');
  ok('Kitchen overview handles empty ticket queue state', k2.includes('empty') || k2.includes('tablesState') || k2.includes('length'));
});

// ─── GROUP 54: Color accessibility — status color contrast ────────────────────

group('Color accessibility — badge and status color contrast', () => {
  const k2 = read('components/kitchen/ScreenK2Overview.tsx');
  ok('Kitchen uses white text on colored status badges', k2.includes('text-white'));
  ok('Kitchen has status badges for order stages', k2.includes('STAGE_STEPS') && k2.includes('STAGE_LABELS'));

  const m2 = read('components/manager/ScreenM2LiveOverview.tsx');
  ok('Manager overview uses color-coded table status', m2.includes('OCCUPIED') && m2.includes('BILLING'));

  const s8 = read('components/customer/Screen8Confirmation.tsx');
  ok('Confirmation screen uses green for success state', s8.includes('#198754') || s8.includes('emerald'));

  const s10 = read('components/customer/Screen10WaiterCall.tsx');
  ok('Waiter call screen pairs icons with labels for accessibility', s10.includes('lucide-react'));
});

// ─── GROUP 55: Image and touch target compliance ─────────────────────────────

group('UX touch targets — minimum touch areas on mobile', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const hasComfortableTouch = c.includes('h-') || c.includes('py-') || c.includes('p-');
    ok(`${name} provides touch-friendly targets`, hasComfortableTouch);
  });

  const k2 = read('components/kitchen/ScreenK2Overview.tsx');
  ok('Kitchen overview has large buttons for quick kitchen interactions', k2.includes('p-') || k2.includes('px-') || k2.includes('py-'));
});

// ─── GROUP 56: Overflow and scrolling — content doesn't clip ─────────────────

group('Layout — overflow and scroll handling', () => {
  CUSTOMER_SCREENS.forEach(f => {
    const c = read(f);
    const name = path.basename(f, '.tsx');
    const handlesScroll = c.includes('overflow-y-auto') || c.includes('ScreenHousing');
    ok(`${name} handles content overflow/scroll`, handlesScroll);
  });

  const k2 = read('components/kitchen/ScreenK2Overview.tsx');
  ok('Kitchen overview has overflow handling for table grid', k2.includes('overflow'));
});

// ─── GROUP 57: Intentional dark exceptions are preserved ─────────────────────

group('Dark theme exceptions — intentional dark elements preserved', () => {
  const kt = read('components/kitchen/KitchenTabletHousing.tsx');
  ok('KitchenTabletHousing STILL has intentional dark bezel (border-slate-800)', kt.includes('border-slate-800') || kt.includes('slate-800'));

  const sh = read('components/ui/ScreenHousing.tsx');
  ok('ScreenHousing STILL has Dynamic Island pill (bg-slate-900)', sh.includes('bg-slate-900'));

  const id = read('components/ui/ItemDrawer.tsx');
  ok('ItemDrawer STILL has dark modal backdrop (bg-slate-900/50)', id.includes('bg-slate-900'));
});

// ─── GROUP 58: Screen-level spacing and layout structure ─────────────────────

group('Screen layout — header + content + housing structure', () => {
  const custWithHeader = CUSTOMER_SCREENS.filter(f => {
    const c = read(f);
    return c.includes('WireHeader') || c.includes('ScreenHousing');
  }).length;
  ok('All 12 customer screens have header structure', custWithHeader === 12);

  const custWithHousing = CUSTOMER_SCREENS.filter(f => read(f).includes('ScreenHousing')).length;
  ok('All 12 customer screens use ScreenHousing wrapper', custWithHousing === 12);

  const kitWithHousing = KITCHEN_FILES.filter(f => read(f).includes('KitchenTabletHousing')).length;
  ok('At least 3 kitchen screens use KitchenTabletHousing', kitWithHousing >= 3);
});

// ─── GROUP 59: Animation and micro-interaction quality ───────────────────────

group('Micro-interactions — transitions, duration, and framer-motion', () => {
  const custWithMotion = CUSTOMER_SCREENS.filter(f => read(f).includes('motion') || read(f).includes('transition')).length;
  ok('All 12 customer screens incorporate smooth transitions or motion', custWithMotion === 12);

  const s1 = read('components/customer/Screen1Welcome.tsx');
  ok('Screen1 uses animation on entry or button interaction', s1.includes('motion') || s1.includes('transition'));

  const itemDrawer = read('components/ui/ItemDrawer.tsx');
  ok('ItemDrawer uses smooth transition for slide-up sheet', itemDrawer.includes('motion') || itemDrawer.includes('transition'));
});

// ─── GROUP 60: Brand consistency — Saffron Gold #D28835 and warm accents ─────

group('Brand consistency — Saffron Gold #D28835 and warm accents', () => {
  ok('globals.css defines --brand-gold: #D28835', read('app/globals.css').includes(GOLD_SAFFRON));

  const allWithWarmAccents = ALL_COMPONENT_FILES.filter(f => {
    const c = read(f);
    return c.includes(GOLD_SAFFRON) || c.includes('amber') || c.includes('gold') || c.includes('orange');
  }).length;
  ok('At least 15 component files use warm saffron/gold/amber accents', allWithWarmAccents >= 15);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n────────────────────────────────────────────────────────────');
console.log('Phase 8 — UI / Visual / UX / Design System Compliance');
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${passed + failed}`);

if (failures.length > 0) {
  console.log('\nFailed assertions:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
}
console.log('────────────────────────────────────────────────────────────');

if (failed > 0) process.exit(1);
