-- ==============================================================================
-- THOOGUDEEPA DONNE BIRYANI MANE — COMPLETE SEED SCRIPT
-- Seeds all 34 Tables and 133 Seats initialized to VACANT
-- ==============================================================================

-- 1. Insert 34 Tables
-- 4x 2-Seaters (T-01 to T-04)
INSERT INTO tables (id, number, section, capacity, status) VALUES
  ('tbl-01', 'T-01', 'Express / Couple Hall', 2, 'VACANT'),
  ('tbl-02', 'T-02', 'Express / Couple Hall', 2, 'VACANT'),
  ('tbl-03', 'T-03', 'Express / Couple Hall', 2, 'VACANT'),
  ('tbl-04', 'T-04', 'Express / Couple Hall', 2, 'VACANT')
ON CONFLICT (number) DO UPDATE SET capacity = EXCLUDED.capacity, section = EXCLUDED.section;

-- 10x 3-Seaters (T-05 to T-14)
INSERT INTO tables (id, number, section, capacity, status) VALUES
  ('tbl-05', 'T-05', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-06', 'T-06', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-07', 'T-07', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-08', 'T-08', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-09', 'T-09', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-10', 'T-10', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-11', 'T-11', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-12', 'T-12', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-13', 'T-13', 'Main Dining Hall', 3, 'VACANT'),
  ('tbl-14', 'T-14', 'Main Dining Hall', 3, 'VACANT')
ON CONFLICT (number) DO UPDATE SET capacity = EXCLUDED.capacity, section = EXCLUDED.section;

-- 10x 4-Seaters (T-15 to T-24)
INSERT INTO tables (id, number, section, capacity, status) VALUES
  ('tbl-15', 'T-15', 'Family Section', 4, 'VACANT'),
  ('tbl-16', 'T-16', 'Family Section', 4, 'VACANT'),
  ('tbl-17', 'T-17', 'Family Section', 4, 'VACANT'),
  ('tbl-18', 'T-18', 'Family Section', 4, 'VACANT'),
  ('tbl-19', 'T-19', 'Family Section', 4, 'VACANT'),
  ('tbl-20', 'T-20', 'Family Section', 4, 'VACANT'),
  ('tbl-21', 'T-21', 'Family Section', 4, 'VACANT'),
  ('tbl-22', 'T-22', 'Family Section', 4, 'VACANT'),
  ('tbl-23', 'T-23', 'Family Section', 4, 'VACANT'),
  ('tbl-24', 'T-24', 'Family Section', 4, 'VACANT')
ON CONFLICT (number) DO UPDATE SET capacity = EXCLUDED.capacity, section = EXCLUDED.section;

-- 5x 5-Seaters (T-25 to T-29)
INSERT INTO tables (id, number, section, capacity, status) VALUES
  ('tbl-25', 'T-25', 'Courtyard Garden', 5, 'VACANT'),
  ('tbl-26', 'T-26', 'Courtyard Garden', 5, 'VACANT'),
  ('tbl-27', 'T-27', 'Courtyard Garden', 5, 'VACANT'),
  ('tbl-28', 'T-28', 'Courtyard Garden', 5, 'VACANT'),
  ('tbl-29', 'T-29', 'Courtyard Garden', 5, 'VACANT')
ON CONFLICT (number) DO UPDATE SET capacity = EXCLUDED.capacity, section = EXCLUDED.section;

-- 5x 6-Seaters (T-30 to T-34)
INSERT INTO tables (id, number, section, capacity, status) VALUES
  ('tbl-30', 'T-30', 'Grand Feast Hall', 6, 'VACANT'),
  ('tbl-31', 'T-31', 'Grand Feast Hall', 6, 'VACANT'),
  ('tbl-32', 'T-32', 'Grand Feast Hall', 6, 'VACANT'),
  ('tbl-33', 'T-33', 'Grand Feast Hall', 6, 'VACANT'),
  ('tbl-34', 'T-34', 'Grand Feast Hall', 6, 'VACANT')
ON CONFLICT (number) DO UPDATE SET capacity = EXCLUDED.capacity, section = EXCLUDED.section;

-- 2. Insert 133 Seats (All initialized to VACANT)
-- T-01 to T-04 (2 seats each = 8 seats)
INSERT INTO table_seats (id, table_number, seat_number, status) VALUES
  ('T-01-S1', 'T-01', 1, 'VACANT'), ('T-01-S2', 'T-01', 2, 'VACANT'),
  ('T-02-S1', 'T-02', 1, 'VACANT'), ('T-02-S2', 'T-02', 2, 'VACANT'),
  ('T-03-S1', 'T-03', 1, 'VACANT'), ('T-03-S2', 'T-03', 2, 'VACANT'),
  ('T-04-S1', 'T-04', 1, 'VACANT'), ('T-04-S2', 'T-04', 2, 'VACANT')
ON CONFLICT (table_number, seat_number) DO UPDATE SET status = 'VACANT';

-- T-05 to T-14 (3 seats each = 30 seats)
INSERT INTO table_seats (id, table_number, seat_number, status) VALUES
  ('T-05-S1', 'T-05', 1, 'VACANT'), ('T-05-S2', 'T-05', 2, 'VACANT'), ('T-05-S3', 'T-05', 3, 'VACANT'),
  ('T-06-S1', 'T-06', 1, 'VACANT'), ('T-06-S2', 'T-06', 2, 'VACANT'), ('T-06-S3', 'T-06', 3, 'VACANT'),
  ('T-07-S1', 'T-07', 1, 'VACANT'), ('T-07-S2', 'T-07', 2, 'VACANT'), ('T-07-S3', 'T-07', 3, 'VACANT'),
  ('T-08-S1', 'T-08', 1, 'VACANT'), ('T-08-S2', 'T-08', 2, 'VACANT'), ('T-08-S3', 'T-08', 3, 'VACANT'),
  ('T-09-S1', 'T-09', 1, 'VACANT'), ('T-09-S2', 'T-09', 2, 'VACANT'), ('T-09-S3', 'T-09', 3, 'VACANT'),
  ('T-10-S1', 'T-10', 1, 'VACANT'), ('T-10-S2', 'T-10', 2, 'VACANT'), ('T-10-S3', 'T-10', 3, 'VACANT'),
  ('T-11-S1', 'T-11', 1, 'VACANT'), ('T-11-S2', 'T-11', 2, 'VACANT'), ('T-11-S3', 'T-11', 3, 'VACANT'),
  ('T-12-S1', 'T-12', 1, 'VACANT'), ('T-12-S2', 'T-12', 2, 'VACANT'), ('T-12-S3', 'T-12', 3, 'VACANT'),
  ('T-13-S1', 'T-13', 1, 'VACANT'), ('T-13-S2', 'T-13', 2, 'VACANT'), ('T-13-S3', 'T-13', 3, 'VACANT'),
  ('T-14-S1', 'T-14', 1, 'VACANT'), ('T-14-S2', 'T-14', 2, 'VACANT'), ('T-14-S3', 'T-14', 3, 'VACANT')
ON CONFLICT (table_number, seat_number) DO UPDATE SET status = 'VACANT';

-- T-15 to T-24 (4 seats each = 40 seats)
INSERT INTO table_seats (id, table_number, seat_number, status) VALUES
  ('T-15-S1', 'T-15', 1, 'VACANT'), ('T-15-S2', 'T-15', 2, 'VACANT'), ('T-15-S3', 'T-15', 3, 'VACANT'), ('T-15-S4', 'T-15', 4, 'VACANT'),
  ('T-16-S1', 'T-16', 1, 'VACANT'), ('T-16-S2', 'T-16', 2, 'VACANT'), ('T-16-S3', 'T-16', 3, 'VACANT'), ('T-16-S4', 'T-16', 4, 'VACANT'),
  ('T-17-S1', 'T-17', 1, 'VACANT'), ('T-17-S2', 'T-17', 2, 'VACANT'), ('T-17-S3', 'T-17', 3, 'VACANT'), ('T-17-S4', 'T-17', 4, 'VACANT'),
  ('T-18-S1', 'T-18', 1, 'VACANT'), ('T-18-S2', 'T-18', 2, 'VACANT'), ('T-18-S3', 'T-18', 3, 'VACANT'), ('T-18-S4', 'T-18', 4, 'VACANT'),
  ('T-19-S1', 'T-19', 1, 'VACANT'), ('T-19-S2', 'T-19', 2, 'VACANT'), ('T-19-S3', 'T-19', 3, 'VACANT'), ('T-19-S4', 'T-19', 4, 'VACANT'),
  ('T-20-S1', 'T-20', 1, 'VACANT'), ('T-20-S2', 'T-20', 2, 'VACANT'), ('T-20-S3', 'T-20', 3, 'VACANT'), ('T-20-S4', 'T-20', 4, 'VACANT'),
  ('T-21-S1', 'T-21', 1, 'VACANT'), ('T-21-S2', 'T-21', 2, 'VACANT'), ('T-21-S3', 'T-21', 3, 'VACANT'), ('T-21-S4', 'T-21', 4, 'VACANT'),
  ('T-22-S1', 'T-22', 1, 'VACANT'), ('T-22-S2', 'T-22', 2, 'VACANT'), ('T-22-S3', 'T-22', 3, 'VACANT'), ('T-22-S4', 'T-22', 4, 'VACANT'),
  ('T-23-S1', 'T-23', 1, 'VACANT'), ('T-23-S2', 'T-23', 2, 'VACANT'), ('T-23-S3', 'T-23', 3, 'VACANT'), ('T-23-S4', 'T-23', 4, 'VACANT'),
  ('T-24-S1', 'T-24', 1, 'VACANT'), ('T-24-S2', 'T-24', 2, 'VACANT'), ('T-24-S3', 'T-24', 3, 'VACANT'), ('T-24-S4', 'T-24', 4, 'VACANT')
ON CONFLICT (table_number, seat_number) DO UPDATE SET status = 'VACANT';

-- T-25 to T-29 (5 seats each = 25 seats)
INSERT INTO table_seats (id, table_number, seat_number, status) VALUES
  ('T-25-S1', 'T-25', 1, 'VACANT'), ('T-25-S2', 'T-25', 2, 'VACANT'), ('T-25-S3', 'T-25', 3, 'VACANT'), ('T-25-S4', 'T-25', 4, 'VACANT'), ('T-25-S5', 'T-25', 5, 'VACANT'),
  ('T-26-S1', 'T-26', 1, 'VACANT'), ('T-26-S2', 'T-26', 2, 'VACANT'), ('T-26-S3', 'T-26', 3, 'VACANT'), ('T-26-S4', 'T-26', 4, 'VACANT'), ('T-26-S5', 'T-26', 5, 'VACANT'),
  ('T-27-S1', 'T-27', 1, 'VACANT'), ('T-27-S2', 'T-27', 2, 'VACANT'), ('T-27-S3', 'T-27', 3, 'VACANT'), ('T-27-S4', 'T-27', 4, 'VACANT'), ('T-27-S5', 'T-27', 5, 'VACANT'),
  ('T-28-S1', 'T-28', 1, 'VACANT'), ('T-28-S2', 'T-28', 2, 'VACANT'), ('T-28-S3', 'T-28', 3, 'VACANT'), ('T-28-S4', 'T-28', 4, 'VACANT'), ('T-28-S5', 'T-28', 5, 'VACANT'),
  ('T-29-S1', 'T-29', 1, 'VACANT'), ('T-29-S2', 'T-29', 2, 'VACANT'), ('T-29-S3', 'T-29', 3, 'VACANT'), ('T-29-S4', 'T-29', 4, 'VACANT'), ('T-29-S5', 'T-29', 5, 'VACANT')
ON CONFLICT (table_number, seat_number) DO UPDATE SET status = 'VACANT';

-- T-30 to T-34 (6 seats each = 30 seats)
INSERT INTO table_seats (id, table_number, seat_number, status) VALUES
  ('T-30-S1', 'T-30', 1, 'VACANT'), ('T-30-S2', 'T-30', 2, 'VACANT'), ('T-30-S3', 'T-30', 3, 'VACANT'), ('T-30-S4', 'T-30', 4, 'VACANT'), ('T-30-S5', 'T-30', 5, 'VACANT'), ('T-30-S6', 'T-30', 6, 'VACANT'),
  ('T-31-S1', 'T-31', 1, 'VACANT'), ('T-31-S2', 'T-31', 2, 'VACANT'), ('T-31-S3', 'T-31', 3, 'VACANT'), ('T-31-S4', 'T-31', 4, 'VACANT'), ('T-31-S5', 'T-31', 5, 'VACANT'), ('T-31-S6', 'T-31', 6, 'VACANT'),
  ('T-32-S1', 'T-32', 1, 'VACANT'), ('T-32-S2', 'T-32', 2, 'VACANT'), ('T-32-S3', 'T-32', 3, 'VACANT'), ('T-32-S4', 'T-32', 4, 'VACANT'), ('T-32-S5', 'T-32', 5, 'VACANT'), ('T-32-S6', 'T-32', 6, 'VACANT'),
  ('T-33-S1', 'T-33', 1, 'VACANT'), ('T-33-S2', 'T-33', 2, 'VACANT'), ('T-33-S3', 'T-33', 3, 'VACANT'), ('T-33-S4', 'T-33', 4, 'VACANT'), ('T-33-S5', 'T-33', 5, 'VACANT'), ('T-33-S6', 'T-33', 6, 'VACANT'),
  ('T-34-S1', 'T-34', 1, 'VACANT'), ('T-34-S2', 'T-34', 2, 'VACANT'), ('T-34-S3', 'T-34', 3, 'VACANT'), ('T-34-S4', 'T-34', 4, 'VACANT'), ('T-34-S5', 'T-34', 5, 'VACANT'), ('T-34-S6', 'T-34', 6, 'VACANT')
ON CONFLICT (table_number, seat_number) DO UPDATE SET status = 'VACANT';

-- 3. Initial Menu 86 Inventory Status (All active in-stock)
INSERT INTO menu_86 (id, name, category, is_86, prep_delay_minutes) VALUES
  ('item-1', 'Special Chicken Donne Biryani', 'Rice & Bowls', false, 0),
  ('item-2', 'Thoogudeepa Mutton Donne Biryani', 'Rice & Bowls', false, 0),
  ('item-3', 'Kshatriya Chicken Kebab (Crispy)', 'Starters', false, 0),
  ('item-4', 'Mutton Nalli Roast (Bone Marrow)', 'Starters', false, 0),
  ('item-5', 'Egg Donne Biryani (2 Eggs)', 'Rice & Bowls', false, 0),
  ('item-6', 'Gunpowder Chicken Fry (Nati Style)', 'Starters', false, 0),
  ('item-7', 'Mutton Pepper Dry (Bannur Style)', 'Starters', false, 0),
  ('item-8', 'Chicken Liver Pepper Masala', 'Starters', false, 0),
  ('item-9', 'Thoogudeepa Royal Salna (Unlimited Pot)', 'Sides', false, 0),
  ('item-10', 'Cucumber Onion Raita', 'Sides', false, 0)
ON CONFLICT (id) DO UPDATE SET is_86 = EXCLUDED.is_86;

