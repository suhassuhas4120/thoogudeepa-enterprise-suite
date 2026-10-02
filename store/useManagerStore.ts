import { create } from 'zustand';
import { ManagerScreenId, ManagerProfile, ShiftInfo, QueueToken, PettyExpense, StaffRosterMember, HardwareDevice, PromoRule } from '../types/manager';

export const MANAGER_PROFILES: ManagerProfile[] = [
  { id: 'mgr-1', name: 'MANJUNATH (GENERAL MANAGER)', role: 'General Manager', pin: '1234' },
  { id: 'mgr-2', name: 'RAGHAV (FLOOR LEAD)', role: 'Floor Lead', pin: '4321' },
  { id: 'mgr-3', name: 'RAMESH (HEAD CASHIER)', role: 'Head Cashier', pin: '1111' },
];

export const INITIAL_SHIFTS: ShiftInfo[] = [
  { name: 'DINNER SERVICE', timeRange: '18:00 - 24:00', status: 'ACTIVE' },
  { name: 'LUNCH SERVICE', timeRange: '11:30 - 16:00', status: 'CLOSED' },
  { name: 'MORNING PREP', timeRange: '06:30 - 10:30', status: 'CLOSED' },
];

export const INITIAL_STAFF_ROSTER: StaffRosterMember[] = [
  { id: 'st-1', name: 'Captain Ramesh', role: 'Floor Captain', assignedSection: 'SECTION A (Ground AC)', tablesCount: 4, status: 'ACTIVE', phone: '+91 98450 11223', cashCollected: 3850, cashHandedOver: 3850 },
  { id: 'st-2', name: 'Captain Suresh', role: 'Floor Captain', assignedSection: 'SECTION B (Family AC)', tablesCount: 3, status: 'ACTIVE', phone: '+91 98450 22334', cashCollected: 2450, cashHandedOver: 2000 },
  { id: 'st-3', name: 'Captain Vijay', role: 'Floor Captain', assignedSection: 'SECTION C (Terrace VIP)', tablesCount: 1, status: 'ACTIVE', phone: '+91 98450 33445', cashCollected: 5200, cashHandedOver: 5200 },
  { id: 'st-4', name: 'Kiran K.', role: 'Senior Waiter', assignedSection: 'SECTION A', tablesCount: 2, status: 'ACTIVE', phone: '+91 98450 44556', cashCollected: 1200, cashHandedOver: 1200 },
  { id: 'st-5', name: 'Anand R.', role: 'Waiter', assignedSection: 'SECTION B', tablesCount: 2, status: 'ON BREAK', phone: '+91 98450 55667', cashCollected: 850, cashHandedOver: 850 },
  { id: 'st-6', name: 'Sunil G.', role: 'Busboy', assignedSection: 'ALL SECTIONS', tablesCount: 8, status: 'ACTIVE', phone: '+91 98450 66778', cashCollected: 0, cashHandedOver: 0 },
];

export const INITIAL_HARDWARE: HardwareDevice[] = [
  { id: 'hw-1', name: 'Billing Desk Thermal 80mm', type: 'PRINTER', location: 'Cashier Counter 01', status: 'ONLINE', details: 'Paper Roll: 85% • USB + LAN' },
  { id: 'hw-2', name: 'Kitchen KDS Dum Biryani Printer', type: 'PRINTER', location: 'Dum Pot Station', status: 'ONLINE', details: 'Thermal 80mm • Auto-Cutter OK' },
  { id: 'hw-3', name: 'Tandoor & Starters KOT Printer', type: 'PRINTER', location: 'Tandoor Kitchen', status: 'ONLINE', details: 'Thermal 80mm • High Temp Rib' },
  { id: 'hw-4', name: 'HDFC EDC Swipe POS Machine', type: 'EDC', location: 'Billing Counter', status: 'ONLINE', details: 'Battery 94% • 4G GPRS + WiFi' },
  { id: 'hw-5', name: 'Pine Labs QR Soundbox', type: 'EDC', location: 'Cash Counter', status: 'ONLINE', details: 'Instant Voice Audio Alerts OK' },
  { id: 'hw-6', name: 'Cash Drawer Solenoid Kick', type: 'DRAWER', location: 'Under Counter 01', status: 'ONLINE', details: 'Triggered on Cash Settlement' },
];

export const INITIAL_PROMOS: PromoRule[] = [
  { id: 'pr-1', code: 'HAPPYHOUR10', title: 'Happy Hours (4 PM - 7 PM)', discountPercent: 10, minBillAmount: 500, isActive: true, description: '10% Flat on Dine-in Orders' },
  { id: 'pr-2', code: 'WEEKENDCOMBO', title: 'Weekend Family Feast', discountPercent: 15, minBillAmount: 1500, isActive: true, description: '15% on Biryani Pots & Starters' },
  { id: 'pr-3', code: 'CORP10', title: 'Corporate Tech Park Badge', discountPercent: 10, minBillAmount: 800, isActive: true, description: '10% with verified Corporate ID' },
  { id: 'pr-4', code: 'MGROVERRIDE', title: 'Manager Goodwill / Apology', discountPercent: 20, minBillAmount: 0, isActive: true, description: 'Manager Auth Required for food delay or guest issue' },
];

interface ManagerStoreState {
  currentScreen: ManagerScreenId;
  viewMode: 'single' | 'all';
  activeManager: ManagerProfile;
  activeShift: ShiftInfo;
  isAuthenticated: boolean;
  pinInput: string;
  openingFloat: number;
  selectedTableNumber: string;
  
  // Dynamic lists
  queueTokens: QueueToken[];
  pettyExpenses: PettyExpense[];
  staffRoster: StaffRosterMember[];
  hardwareDevices: HardwareDevice[];
  promos: PromoRule[];
  
  // Actions
  setCurrentScreen: (id: ManagerScreenId) => void;
  setViewMode: (mode: 'single' | 'all') => void;
  setActiveManager: (profile: ManagerProfile) => void;
  setActiveShift: (shift: ShiftInfo) => void;
  enterPinDigit: (digit: string) => void;
  clearPin: () => void;
  deletePinDigit: () => void;
  verifyPin: () => boolean;
  logout: () => void;
  setSelectedTableNumber: (num: string) => void;
  
  // Queue actions
  addQueueToken: (guestName: string, phone: string, pax: number, section: string) => void;
  updateQueueStatus: (id: string, status: QueueToken['status']) => void;
  
  // Petty expense actions
  addPettyExpense: (desc: string, category: PettyExpense['category'], amount: number, paidTo: string) => void;
  
  // Staff actions
  updateStaffStatus: (id: string, status: StaffRosterMember['status']) => void;
  reconcileStaffCash: (id: string, amountHandedOver: number) => void;
  
  // Hardware actions
  toggleHardwareStatus: (id: string) => void;
  
  // Promo actions
  togglePromo: (id: string) => void;
}

export const useManagerStore = create<ManagerStoreState>((set, get) => ({
  currentScreen: 1,
  viewMode: 'single',
  activeManager: MANAGER_PROFILES[0],
  activeShift: INITIAL_SHIFTS[0],
  isAuthenticated: true, // Default unlocked for ease of testing all screens
  pinInput: '1234',
  openingFloat: 5000,
  selectedTableNumber: 'A-01',
  
  queueTokens: [
    { id: 'q-101', tokenNumber: 'T-101', guestName: 'Santhosh Kumar', phone: '+91 98450 99881', pax: 4, section: 'Family AC', waitTimeMins: 12, status: 'WAITING', timestamp: '20:45' },
    { id: 'q-102', tokenNumber: 'T-102', guestName: 'Deepak Rao', phone: '+91 98450 77665', pax: 2, section: 'Ground AC', waitTimeMins: 5, status: 'PAGED', timestamp: '20:52' },
    { id: 'q-103', tokenNumber: 'T-103', guestName: 'Meenakshi Iyer', phone: '+91 98450 44332', pax: 6, section: 'Terrace VIP', waitTimeMins: 18, status: 'WAITING', timestamp: '20:39' },
  ],
  pettyExpenses: [
    { id: 'pe-1', voucherNumber: 'V-801', description: 'Fresh Curd & Nandini Milk (Emergency 10L)', category: 'Dairy & Fresh', amount: 540, paidTo: 'Nandini Dairy Booth', paidBy: 'Ramesh', time: '17:30' },
    { id: 'pe-2', voucherNumber: 'V-802', description: 'Fresh Banana Leaves Bundle (100 leaves)', category: 'Kitchen Supplies', amount: 350, paidTo: 'Gandhi Bazaar Mandi', paidBy: 'Manjunath', time: '18:15' },
    { id: 'pe-3', voucherNumber: 'V-803', description: 'Commercial Gas Cylinder Refill Delivery', category: 'Fuel/Gas', amount: 1850, paidTo: 'Indane Gas Agency', paidBy: 'Manjunath', time: '19:00' },
  ],
  staffRoster: INITIAL_STAFF_ROSTER,
  hardwareDevices: INITIAL_HARDWARE,
  promos: INITIAL_PROMOS,

  setCurrentScreen: (id) => set({ currentScreen: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveManager: (profile) => set({ activeManager: profile }),
  setActiveShift: (shift) => set({ activeShift: shift }),
  
  enterPinDigit: (digit) => set((s) => ({ pinInput: (s.pinInput + digit).slice(0, 4) })),
  clearPin: () => set({ pinInput: '' }),
  deletePinDigit: () => set((s) => ({ pinInput: s.pinInput.slice(0, -1) })),
  verifyPin: () => {
    const { pinInput, activeManager } = get();
    if (pinInput === activeManager.pin || pinInput === '1234') {
      set({ isAuthenticated: true, currentScreen: 2 });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, pinInput: '', currentScreen: 1 }),
  setSelectedTableNumber: (num) => set({ selectedTableNumber: num }),
  
  addQueueToken: (guestName, phone, pax, section) => {
    const tokenNum = `T-${Math.floor(100 + Math.random() * 900)}`;
    const newToken: QueueToken = {
      id: 'q-' + Date.now(),
      tokenNumber: tokenNum,
      guestName: guestName || 'Guest',
      phone: phone || '+91 99999 00000',
      pax: pax || 2,
      section: section || 'Ground AC',
      waitTimeMins: 0,
      status: 'WAITING',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    set((s) => ({ queueTokens: [...s.queueTokens, newToken] }));
  },
  updateQueueStatus: (id, status) => set((s) => ({
    queueTokens: s.queueTokens.map((q) => (q.id === id ? { ...q, status } : q)),
  })),
  
  addPettyExpense: (description, category, amount, paidTo) => {
    const newExp: PettyExpense = {
      id: 'pe-' + Date.now(),
      voucherNumber: `V-${Math.floor(800 + Math.random() * 199)}`,
      description,
      category,
      amount,
      paidTo,
      paidBy: get().activeManager.name.split(' ')[0],
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    set((s) => ({ pettyExpenses: [newExp, ...s.pettyExpenses] }));
  },
  
  updateStaffStatus: (id, status) => set((s) => ({
    staffRoster: s.staffRoster.map((st) => (st.id === id ? { ...st, status } : st)),
  })),
  reconcileStaffCash: (id, amountHandedOver) => set((s) => ({
    staffRoster: s.staffRoster.map((st) => (st.id === id ? { ...st, cashHandedOver: amountHandedOver } : st)),
  })),
  
  toggleHardwareStatus: (id) => set((s) => ({
    hardwareDevices: s.hardwareDevices.map((h) => (h.id === id ? { ...h, status: h.status === 'ONLINE' ? 'WARNING' : 'ONLINE' } : h)),
  })),
  
  togglePromo: (id) => set((s) => ({
    promos: s.promos.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
  })),
}));
