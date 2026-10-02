const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const key = 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const supabase = createClient(url, key);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    totalFailed++;
  }
}

async function runPhase1Tests() {
  console.log('----------------------------------------------------');
  console.log('Phase 1 Verification: Database & Floor Plan Integrity');
  console.log('----------------------------------------------------');

  // Test 1: Verify Supabase Tables Count
  const { data: tables, error: tErr } = await supabase
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  assert(!tErr, 'Connected to Supabase tables without error');
  assert(tables && tables.length === 34, `34 tables exist in Supabase (Found: ${tables ? tables.length : 0})`);

  // Test 2: Floor Plan Capacity Distribution
  if (tables && tables.length === 34) {
    const twoSeaters = tables.filter((t) => t.capacity === 2);
    const threeSeaters = tables.filter((t) => t.capacity === 3);
    const fourSeaters = tables.filter((t) => t.capacity === 4);
    const fiveSeaters = tables.filter((t) => t.capacity === 5);
    const sixSeaters = tables.filter((t) => t.capacity === 6);

    assert(twoSeaters.length === 4, `4x 2-Seaters T-01 to T-04 (Found: ${twoSeaters.length})`);
    assert(threeSeaters.length === 10, `10x 3-Seaters T-05 to T-14 (Found: ${threeSeaters.length})`);
    assert(fourSeaters.length === 10, `10x 4-Seaters T-15 to T-24 (Found: ${fourSeaters.length})`);
    assert(fiveSeaters.length === 5, `5x 5-Seaters T-25 to T-29 (Found: ${fiveSeaters.length})`);
    assert(sixSeaters.length === 5, `5x 6-Seaters T-30 to T-34 (Found: ${sixSeaters.length})`);

    const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
    assert(totalSeats === 133, `Total physical seat count equals 133 (Found: ${totalSeats})`);

    const hasT01 = tables.some((t) => t.number === 'T-01');
    const hasT34 = tables.some((t) => t.number === 'T-34');
    assert(hasT01 && hasT34, 'Table boundary checks passed: T-01 and T-34 present');
  }

  // Test 3: Table Seats Remote Verification (133 physical seat rows)
  const { count: seatCount, error: seatErr } = await supabase
    .from('table_seats')
    .select('*', { count: 'exact', head: true });

  assert(!seatErr, 'table_seats table exists in Supabase');
  assert(seatCount === 133, `133 individual seats seeded in table_seats (Found: ${seatCount})`);

  // Test 4: Menu 86 Catalog in Supabase
  const { data: menu86, error: mErr } = await supabase
    .from('menu_86')
    .select('*')
    .order('id', { ascending: true });

  assert(!mErr, 'Connected to menu_86 without error');
  assert(menu86 && menu86.length === 10, `All 10 canonical menu items tracked in menu_86 (Found: ${menu86 ? menu86.length : 0})`);

  // Test 5: Verify Transactional Tables are Live
  const { error: ordErr } = await supabase.from('orders').select('*', { head: true });
  assert(!ordErr, 'orders table verified live');

  const { error: itmErr } = await supabase.from('order_items').select('*', { head: true });
  assert(!itmErr, 'order_items table verified live');

  const { error: kdsErr } = await supabase.from('kds_tickets').select('*', { head: true });
  assert(!kdsErr, 'kds_tickets table verified live');

  const { error: payErr } = await supabase.from('payments').select('*', { head: true });
  assert(!payErr, 'payments table verified live');

  const { error: pingErr } = await supabase.from('pings').select('*', { head: true });
  assert(!pingErr, 'pings table verified live');

  // Test 6: useSharedBridge tables integrity
  const bridgePath = path.join(__dirname, '..', 'store', 'useSharedBridge.ts');
  const bridgeContent = fs.readFileSync(bridgePath, 'utf8');
  assert(bridgeContent.includes("number: 'T-01'"), "useSharedBridge initialized with 'T-01'");
  assert(bridgeContent.includes("number: 'T-34'"), "useSharedBridge initialized with 'T-34'");
  assert(!bridgeContent.includes("number: 'A-01'"), 'Legacy dummy table A-01 completely removed from bridge');

  // Test 7: Fallback Table in Customer Portal
  const customerStorePath = path.join(__dirname, '..', 'store', 'useCustomerStore.ts');
  const customerStoreContent = fs.readFileSync(customerStorePath, 'utf8');
  assert(customerStoreContent.includes("tableNumber: 'T-01'"), "useCustomerStore default table is 'T-01'");

  const welcomeScreenPath = path.join(__dirname, '..', 'components', 'customer', 'Screen1Welcome.tsx');
  const welcomeScreenContent = fs.readFileSync(welcomeScreenPath, 'utf8');
  assert(welcomeScreenContent.includes("'T-01'"), "Screen1Welcome fallback table is 'T-01'");

  // Test 8: Database Schema File Completeness
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  assert(schemaContent.includes('order_id TEXT REFERENCES orders(id)'), 'kds_tickets has order_id foreign key');
  assert(schemaContent.includes('unit_price NUMERIC'), 'order_items includes unit_price column');
  assert(schemaContent.includes('selected_option TEXT'), 'order_items includes selected_option column');
  assert(schemaContent.includes('CREATE TABLE IF NOT EXISTS menu_86'), 'schema includes menu_86 definition');

  console.log('----------------------------------------------------');
  console.log(`Results: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log('----------------------------------------------------');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runPhase1Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
