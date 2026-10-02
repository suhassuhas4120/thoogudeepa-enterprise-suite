const { createClient } = require('@supabase/supabase-js');

const url = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const key = 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const supabase = createClient(url, key);

const tables = [
  // 4x 2-Seaters (T-01 to T-04)
  { id: 'tbl-01', number: 'T-01', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT' },
  { id: 'tbl-02', number: 'T-02', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT' },
  { id: 'tbl-03', number: 'T-03', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT' },
  { id: 'tbl-04', number: 'T-04', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT' },

  // 10x 3-Seaters (T-05 to T-14)
  { id: 'tbl-05', number: 'T-05', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-06', number: 'T-06', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-07', number: 'T-07', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-08', number: 'T-08', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-09', number: 'T-09', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-10', number: 'T-10', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-11', number: 'T-11', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-12', number: 'T-12', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-13', number: 'T-13', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },
  { id: 'tbl-14', number: 'T-14', section: 'Main Dining Hall', capacity: 3, status: 'VACANT' },

  // 10x 4-Seaters (T-15 to T-24)
  { id: 'tbl-15', number: 'T-15', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-16', number: 'T-16', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-17', number: 'T-17', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-18', number: 'T-18', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-19', number: 'T-19', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-20', number: 'T-20', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-21', number: 'T-21', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-22', number: 'T-22', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-23', number: 'T-23', section: 'Family Section', capacity: 4, status: 'VACANT' },
  { id: 'tbl-24', number: 'T-24', section: 'Family Section', capacity: 4, status: 'VACANT' },

  // 5x 5-Seaters (T-25 to T-29)
  { id: 'tbl-25', number: 'T-25', section: 'Courtyard Garden', capacity: 5, status: 'VACANT' },
  { id: 'tbl-26', number: 'T-26', section: 'Courtyard Garden', capacity: 5, status: 'VACANT' },
  { id: 'tbl-27', number: 'T-27', section: 'Courtyard Garden', capacity: 5, status: 'VACANT' },
  { id: 'tbl-28', number: 'T-28', section: 'Courtyard Garden', capacity: 5, status: 'VACANT' },
  { id: 'tbl-29', number: 'T-29', section: 'Courtyard Garden', capacity: 5, status: 'VACANT' },

  // 5x 6-Seaters (T-30 to T-34)
  { id: 'tbl-30', number: 'T-30', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT' },
  { id: 'tbl-31', number: 'T-31', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT' },
  { id: 'tbl-32', number: 'T-32', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT' },
  { id: 'tbl-33', number: 'T-33', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT' },
  { id: 'tbl-34', number: 'T-34', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT' },
];

async function seed() {
  console.log('Seeding 34 tables into Supabase...');
  const { data, error } = await supabase.from('tables').upsert(tables, { onConflict: 'number' });
  if (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
  console.log('Successfully seeded', tables.length, 'tables.');

  const { data: verify, count } = await supabase.from('tables').select('number', { count: 'exact' });
  console.log('Total tables in Supabase now:', count);
}

seed();
