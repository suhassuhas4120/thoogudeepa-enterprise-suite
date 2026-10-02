import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 25,
    },
  },
  db: {
    schema: 'public',
  },
});

// ── Database Types ────────────────────────────────────────────────────────────
export interface DbTable {
  id: string;
  number: string;        // 'T-01' to 'T-34'
  section: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  current_bill: number;
  server_name: string;
  created_at: string;
  updated_at: string;
}

export interface DbTableSeat {
  id: string;            // 'T-15-S1'
  table_number: string;  // 'T-15'
  seat_number: number;   // 1 to 6
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'PAID';
  active_order_id: string | null;
  device_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  table_number: string;
  seat_number: number;
  guest_name: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'UNPAID' | 'PAID' | 'CANCELLED';
  device_token?: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  table_number: string;
  seat_number: number;
  name: string;
  quantity: number;
  price: number;
  stage: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
  prep_mode: string;
  options?: string;
  add_ons?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DbKdsTicket {
  id: string;
  table_number: string;
  server_name: string;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  elapsed_minutes: number;
  source: 'CUSTOMER' | 'WAITER';
  items: any[];
  created_at: string;
  updated_at: string;
}

export interface DbPayment {
  id: string;
  order_id: string;
  table_number: string;
  seat_number: number;
  amount: number;
  payment_method: string;
  bank_utr: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  confirmed_at: string;
}

export interface DbPing {
  id: string;
  table_number: string;
  seat_number: number;
  type: 'WATER' | 'CLEAN' | 'TISSUE' | 'SALNA' | 'BILL';
  guest_name: string;
  message?: string;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
}
