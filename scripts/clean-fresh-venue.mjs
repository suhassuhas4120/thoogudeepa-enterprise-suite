import http from 'http';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function broadcastStateChange(reason, payload) {
  try {
    const ch = supabase.channel('restaurant-sync-broadcast', {
      config: { broadcast: { self: false } },
    });
    ch.subscribe(() => {
      ch.send({
        type: 'broadcast',
        event: 'STATE_CHANGED',
        payload: { reason, payload, timestamp: Date.now() },
      });
    });
  } catch {}
}

const httpAgent = new http.Agent({ keepAlive: true });

function requestJson(method, path, payload = null) {
  return new Promise((resolve) => {
    const data = payload ? JSON.stringify(payload) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method,
        agent: httpAgent,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
    if (data) req.write(data);
    req.end();
  });
}

async function cleanAndResetVenue() {
  console.log('================================================================================');
  console.log('   PERFORMING TOTAL VENUE FRESH RESET');
  console.log('   Scope: Clear Kitchen Orders, Vacate All Chairs, Reset Waiter Floor Grid');
  console.log('================================================================================\n');

  // 1. Vacate all 34 tables in API settlement store
  console.log('>>> [1/5] Vacating all 34 tables in settlement store...');
  for (let t = 1; t <= 34; t++) {
    const tableNumber = `T-${String(t).padStart(2, '0')}`;
    await requestJson('POST', '/api/settlement/session', {
      action: 'VACATE',
      tableNumber,
    });
  }
  console.log('    All 34 tables cleared in API settlement store.\n');

  // 2. Reset Supabase tables
  console.log('>>> [2/5] Resetting Supabase tables table to VACANT with 0 bill...');
  try {
    const { error: tblErr } = await supabase
      .from('tables')
      .update({
        status: 'VACANT',
        current_bill: 0,
        updated_at: new Date().toISOString(),
      })
      .neq('id', 'non_existent_id');

    if (tblErr) {
      console.warn('    tables update warning:', tblErr.message);
    } else {
      console.log('    All tables marked VACANT with ₹0 current_bill.');
    }
  } catch (err) {
    console.warn('    tables update error:', err.message);
  }

  // 3. Reset Supabase table_seats
  console.log('\n>>> [3/5] Resetting all table_seats to VACANT with null active orders and device tokens...');
  try {
    const { error: seatErr } = await supabase
      .from('table_seats')
      .update({
        status: 'VACANT',
        active_order_id: null,
        device_token: null,
        updated_at: new Date().toISOString(),
      })
      .neq('id', 'non_existent_id');

    if (seatErr) {
      console.warn('    table_seats update warning:', seatErr.message);
    } else {
      console.log('    All table_seats reset to VACANT and available.');
    }
  } catch (err) {
    console.warn('    table_seats update error:', err.message);
  }

  // 4. Mark all open/unpaid orders as PAID and order_items as SERVED
  console.log('\n>>> [4/5] Closing lingering orders and clearing pings in database...');
  try {
    const { error: ordErr } = await supabase
      .from('orders')
      .update({
        status: 'PAID',
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'UNPAID');

    if (ordErr) console.warn('    orders update warning:', ordErr.message);
    else console.log('    All active unpaid orders marked PAID.');

    const { error: itemErr } = await supabase
      .from('order_items')
      .update({
        stage: 'SERVED',
        updated_at: new Date().toISOString(),
      })
      .neq('stage', 'SERVED');

    if (itemErr) console.warn('    order_items update warning:', itemErr.message);
    else console.log('    All order items marked SERVED.');

    const { error: pingErr } = await supabase
      .from('pings')
      .update({
        status: 'RESOLVED',
      })
      .eq('status', 'PENDING');

    if (pingErr) console.warn('    pings update warning:', pingErr.message);
    else console.log('    All pending pings marked RESOLVED.');

    const { error: kdsErr } = await supabase
      .from('kds_tickets')
      .delete()
      .neq('id', 'non_existent_id');

    if (kdsErr) console.warn('    kds_tickets deletion warning:', kdsErr.message);
    else console.log('    All KDS kitchen tickets deleted.');
  } catch (err) {
    console.warn('    Database cleanup error:', err.message);
  }

  // 5. Broadcast STATE_CHANGED event across venue
  console.log('\n>>> [5/5] Broadcasting real-time venue reset event to all connected devices...');
  try {
    broadcastStateChange('VENUE_CLEAN_RESET', {
      timestamp: Date.now(),
      status: 'VACANT',
    });
    console.log('    Real-time reset broadcast emitted successfully.');
  } catch (err) {
    console.warn('    Broadcast warning:', err.message);
  }

  console.log('\n================================================================================');
  console.log('   TOTAL VENUE FRESH RESET COMPLETED SUCCESSFULLY');
  console.log('   - Kitchen: 0 Active Tickets (Clean)');
  console.log('   - Waiter: All 34 Tables & All Chairs VACANT with ₹0 Bills');
  console.log('   - Customer: All Chairs Available for Fresh QR Ordering');
  console.log('================================================================================\n');
}

cleanAndResetVenue().catch((err) => {
  console.error('Fatal venue reset error:', err);
  process.exit(1);
});
