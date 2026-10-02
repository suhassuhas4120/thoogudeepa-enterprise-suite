-- ==============================================================================
-- THOOGUDEEPA DONNE BIRYANI MANE — ENTERPRISE DATABASE SCHEMA
-- Supabase PostgreSQL Free Tier Schema for 34 Tables & 133 Seats
-- ==============================================================================

-- 1. Tables (Physical Table Pods)
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  section TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'VACANT',
  current_bill NUMERIC NOT NULL DEFAULT 0,
  server_name TEXT NOT NULL DEFAULT 'Floor Captain',
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
  seat_number INTEGER NOT NULL,
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID | PAID | CANCELLED
  device_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Order Items (Line Items for Real-Time Stage Stepping)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'RECEIVED', -- RECEIVED | PREPARING | READY | SERVED
  prep_mode TEXT NOT NULL DEFAULT 'Dum Pot',
  options TEXT,
  add_ons TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. KDS Tickets (Kitchen Master Pass Queue)
CREATE TABLE IF NOT EXISTS kds_tickets (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  server_name TEXT NOT NULL DEFAULT 'System',
  status TEXT NOT NULL DEFAULT 'NEW', -- NEW | PREP | READY | COMPLETED
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
  seat_number INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  bank_utr TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Pings (Real-Time Service Alerts)
CREATE TABLE IF NOT EXISTS pings (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  seat_number INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL, -- WATER | CLEAN | TISSUE | SALNA | BILL
  guest_name TEXT NOT NULL DEFAULT 'Guest',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | RESOLVED
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Supabase Realtime CDC on all relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE table_seats;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE kds_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE pings;
