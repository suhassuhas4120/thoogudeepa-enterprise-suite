import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data: tickets, error: e1 } = await db.from('kds_tickets').select('id, table_number, status');
  const { data: tables, error: e2 } = await db.from('tables').select('number, status, current_bill, kot_count').neq('status', 'VACANT');
  const { data: pings, error: e3 } = await db.from('pings').select('id, table_number, status, type').neq('status', 'RESOLVED');
  const { data: orders, error: e4 } = await db.from('orders').select('id, table_number, status');

  console.log('--- DB SUMMARY ---');
  console.log('Active KDS tickets in DB:', tickets?.length, e1 || '');
  if (tickets && tickets.length > 0) {
    console.log('First 5 tickets:', tickets.slice(0, 5));
  }
  console.log('Non-vacant tables in DB:', tables?.length, e2 || '');
  if (tables && tables.length > 0) {
    console.log('Tables:', tables);
  }
  console.log('Pending pings in DB:', pings?.length, e3 || '');
  console.log('Orders in DB:', orders?.length, e4 || '');
}

check().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
