export type ManagerScreenId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export interface ManagerProfile {
  id: string;
  name: string;
  role: 'General Manager' | 'Floor Lead' | 'Head Cashier';
  pin: string;
}

export interface ShiftInfo {
  name: string;
  timeRange: string;
  status: 'ACTIVE' | 'CLOSED';
}

export interface QueueToken {
  id: string;
  tokenNumber: string;
  guestName: string;
  phone: string;
  pax: number;
  section: string;
  waitTimeMins: number;
  status: 'WAITING' | 'PAGED' | 'SEATED';
  timestamp: string;
}

export interface PettyExpense {
  id: string;
  voucherNumber: string;
  description: string;
  category: 'Kitchen Supplies' | 'Dairy & Fresh' | 'Fuel/Gas' | 'Emergency Maintenance' | 'Miscellaneous';
  amount: number;
  paidTo: string;
  paidBy: string;
  time: string;
}

export interface StaffRosterMember {
  id: string;
  name: string;
  role: 'Floor Captain' | 'Senior Waiter' | 'Waiter' | 'Busboy' | 'Runner';
  assignedSection: string;
  tablesCount: number;
  status: 'ACTIVE' | 'ON BREAK' | 'OFF DUTY';
  phone: string;
  cashCollected: number;
  cashHandedOver: number;
}

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'PRINTER' | 'EDC' | 'KDS' | 'ROUTER' | 'DRAWER';
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  details: string;
}

export interface PromoRule {
  id: string;
  code: string;
  title: string;
  discountPercent: number;
  minBillAmount: number;
  isActive: boolean;
  description: string;
}
