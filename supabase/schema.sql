-- ==============================================================================
-- THOOGUDEEPA DONNE BIRYANI MANE — PRODUCTION DATABASE SCHEMA
-- PostgreSQL Schema for 34 Tables & 133 Seats
-- ==============================================================================

-- Drop old empty mock tables to prevent column collision from earlier experiments
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS kds_tickets CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS table_seats CASCADE;
DROP TABLE IF EXISTS pings CASCADE;

-- 1. Tables (Physical Table Pods - 34 tables)
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'VACANT',
  guest_count INTEGER NOT NULL DEFAULT 0,
  current_bill NUMERIC NOT NULL DEFAULT 0,
  server_name TEXT NOT NULL DEFAULT 'Floor Captain',
  kot_count INTEGER NOT NULL DEFAULT 0,
  merged_with TEXT,
  seated_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table Seats (Single-Occupancy Seat Matrix: 133 Seats Total)
CREATE TABLE IF NOT EXISTS table_seats (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL REFERENCES tables(number) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'VACANT',
  active_order_id TEXT,
  device_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (table_number, seat_number)
);

-- 3. Orders (Seat-Isolated Orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL REFERENCES tables(number) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL DEFAULT 1,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  guest_count INTEGER NOT NULL DEFAULT 1,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'UNPAID',
  source TEXT NOT NULL DEFAULT 'CUSTOMER',
  device_token TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Order Items (Line Items for Real-Time Stage Stepping)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  seat_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'PLACED',
  prep_mode TEXT NOT NULL DEFAULT 'Dum Pot',
  options TEXT,
  selected_option TEXT,
  add_ons TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. KDS Tickets (Kitchen Master Pass Queue)
CREATE TABLE IF NOT EXISTS kds_tickets (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  table_number TEXT NOT NULL,
  seat_number INTEGER DEFAULT 1,
  server_name TEXT NOT NULL DEFAULT 'System',
  status TEXT NOT NULL DEFAULT 'NEW',
  elapsed_minutes INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'CUSTOMER',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Payments (Pure-UPI Idempotent Settlements)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  seat_number INTEGER NOT NULL DEFAULT 1,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  gateway_ref TEXT,
  bank_utr TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Pings (Real-Time Service Alerts)
CREATE TABLE IF NOT EXISTS pings (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  seat_number INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Menu 86 (Live Kitchen Stock Out Sync)
CREATE TABLE IF NOT EXISTS menu_86 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_86 BOOLEAN NOT NULL DEFAULT FALSE,
  prep_delay_minutes INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_table_seats_table ON table_seats(table_number);
CREATE INDEX IF NOT EXISTS idx_table_seats_device ON table_seats(device_token);
CREATE INDEX IF NOT EXISTS idx_orders_table_seat ON orders(table_number, seat_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_stage ON order_items(stage);
CREATE INDEX IF NOT EXISTS idx_kds_tickets_table ON kds_tickets(table_number);
CREATE INDEX IF NOT EXISTS idx_kds_tickets_status ON kds_tickets(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pings_table ON pings(table_number);
CREATE INDEX IF NOT EXISTS idx_pings_status ON pings(status);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tables, table_seats, orders, order_items, kds_tickets, payments, pings, menu_86;
  EXCEPTION 
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;
