import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function resetAll() {
  console.log('--- PURGING TEST DATA FROM SUPABASE ---');

  // 1. Delete pings
  const { error: pingErr } = await db.from('pings').delete().neq('id', '___non_existent___');
  console.log('Pings deleted:', pingErr || 'OK');

  // 2. Delete kds_tickets
  const { error: kdsErr } = await db.from('kds_tickets').delete().neq('id', '___non_existent___');
  console.log('KDS tickets deleted:', kdsErr || 'OK');

  // 3. Delete order_items
  const { error: oiErr } = await db.from('order_items').delete().neq('id', '___non_existent___');
  console.log('Order items deleted:', oiErr || 'OK');

  // 4. Delete payments
  const { error: payErr } = await db.from('payments').delete().neq('id', '___non_existent___');
  console.log('Payments deleted:', payErr || 'OK');

  // 5. Delete orders
  const { error: ordErr } = await db.from('orders').delete().neq('id', '___non_existent___');
  console.log('Orders deleted:', ordErr || 'OK');

  // 6. Reset all tables to VACANT
  const { error: tblErr } = await db.from('tables').update({
    status: 'VACANT',
    current_bill: 0,
    guest_count: 0,
    kot_count: 0,
    server_name: 'Floor Captain',
    merged_with: null,
  }).neq('number', '___non_existent___');
  console.log('Tables reset to VACANT:', tblErr || 'OK');

  // 7. Reset all table_seats to VACANT
  const { error: seatErr } = await db.from('table_seats').update({
    status: 'VACANT',
    active_order_id: null,
    device_token: null,
  }).neq('id', '___non_existent___');
  console.log('Seats reset to VACANT:', seatErr || 'OK');

  console.log('--- PURGE COMPLETE ---');
}

resetAll().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
