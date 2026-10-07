import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: tickets } = await db.from('kds_tickets').select('*');
  const { data: orders } = await db.from('orders').select('*');
  const { data: pings } = await db.from('pings').select('*');
  console.log('TICKETS:');
  tickets?.forEach(t => console.log(t.id, t.table_number, t.source, t.status, t.created_at, t.server_name));
  console.log('ORDERS:');
  orders?.forEach(o => console.log(o.id, o.table_number, o.source, o.status, o.created_at, o.guest_name, o.total));
  console.log('PINGS:');
  pings?.forEach(p => console.log(p.id, p.table_number, p.type, p.status, p.created_at, p.message));
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
