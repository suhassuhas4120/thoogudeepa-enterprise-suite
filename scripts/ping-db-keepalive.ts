import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.DEPLOYED_APP_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.TEST_SUPABASE_URL ||
  'https://dwjjprzyyjmunhdxvkuo.supabase.co';

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.TEST_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

async function main() {
  console.log(`[Keepalive] Pinging Supabase DB at: ${SUPABASE_URL}`);
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  const startTime = Date.now();
  const { data, error } = await client.from('tables').select('number').limit(1);
  const latency = Date.now() - startTime;

  if (error) {
    console.error(`[Keepalive FAIL] Supabase error (${latency}ms):`, error.message);
    process.exit(1);
  }

  console.log(`[Keepalive SUCCESS] DB active and healthy (${latency}ms). Rows returned:`, data?.length ?? 0);
  process.exit(0);
}

main().catch((err) => {
  console.error('[Keepalive EXCEPTION]:', err);
  process.exit(1);
});
