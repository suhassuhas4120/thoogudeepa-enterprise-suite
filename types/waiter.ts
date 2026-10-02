import { WaiterPingType, MenuItem, CartItem } from './customer';

export type WaiterScreenId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TableStatus = 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING' | 'RESERVED';

export interface FloorTable {
  id: string;
  number: string;
  section: string;
  capacity: number;
  status: TableStatus;
  guestCount: number;
  seatedTime: string;
  currentBill: number;
  serverName: string;
  kotCount: number;
  mergedWith?: string;
  activeItems?: { name: string; quantity: number; status: string }[];
}

export interface WaiterCustomerPing {
  id: string;
  tableNumber: string;
  type: WaiterPingType;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  guestName?: string;
}

export interface KitchenReadyItem {
  id: string;
  tableNumber: string;
  dishName: string;
  quantity: number;
  prepTime: string;
  readyTimestamp: string;
  status: 'READY' | 'SERVED';
}

export interface ShiftStats {
  tablesServed: number;
  totalRevenue: number;
  tipsEarned: number;
  avgTurnaroundMinutes: number;
}
