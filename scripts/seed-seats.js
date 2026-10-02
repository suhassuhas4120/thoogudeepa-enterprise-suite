const { createClient } = require('@supabase/supabase-js');

const url = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const key = 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const supabase = createClient(url, key);

// Build 133 seats matching table capacities
const seats = [];

// T-01 to T-04: 2 seats each (8 seats)
for (let i = 1; i <= 4; i++) {
  const t = `T-${String(i).padStart(2, '0')}`;
  seats.push({ id: `${t}-S1`, table_number: t, seat_number: 1, status: 'VACANT' });
  seats.push({ id: `${t}-S2`, table_number: t, seat_number: 2, status: 'VACANT' });
}

// T-05 to T-14: 3 seats each (30 seats)
for (let i = 5; i <= 14; i++) {
  const t = `T-${String(i).padStart(2, '0')}`;
  for (let s = 1; s <= 3; s++) {
    seats.push({ id: `${t}-S${s}`, table_number: t, seat_number: s, status: 'VACANT' });
  }
}

// T-15 to T-24: 4 seats each (40 seats)
for (let i = 15; i <= 24; i++) {
  const t = `T-${String(i).padStart(2, '0')}`;
  for (let s = 1; s <= 4; s++) {
    seats.push({ id: `${t}-S${s}`, table_number: t, seat_number: s, status: 'VACANT' });
  }
}

// T-25 to T-29: 5 seats each (25 seats)
for (let i = 25; i <= 29; i++) {
  const t = `T-${String(i).padStart(2, '0')}`;
  for (let s = 1; s <= 5; s++) {
    seats.push({ id: `${t}-S${s}`, table_number: t, seat_number: s, status: 'VACANT' });
  }
}

// T-30 to T-34: 6 seats each (30 seats)
for (let i = 30; i <= 34; i++) {
  const t = `T-${String(i).padStart(2, '0')}`;
  for (let s = 1; s <= 6; s++) {
    seats.push({ id: `${t}-S${s}`, table_number: t, seat_number: s, status: 'VACANT' });
  }
}

async function seedSeats() {
  console.log(`Seeding ${seats.length} individual seats into table_seats...`);
  const { data, error } = await supabase.from('table_seats').upsert(seats, { onConflict: 'table_number,seat_number' });
  if (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }

  const { count, error: countErr } = await supabase.from('table_seats').select('*', { count: 'exact', head: true });
  console.log(`Total seats now active in Supabase: ${count} seats!`);
}

seedSeats();
