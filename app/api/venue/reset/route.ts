import { NextRequest, NextResponse } from 'next/server';
import { supabase, broadcastStateChange } from '../../../../lib/supabase';
import {
  activeSettlementSessions,
  settledBills,
  clearedSettlementAt,
} from '../../../../lib/settlementStore';

export const dynamic = 'force-dynamic';

async function performVenueReset() {
  // 1. Clear in-memory maps
  activeSettlementSessions.clear();
  settledBills.clear();
  clearedSettlementAt.clear();

  // 2. Reset all tables to VACANT with 0 bill and 0 guest count
  await supabase
    .from('tables')
    .update({
      status: 'VACANT',
      current_bill: 0,
      guest_count: 0,
      kot_count: 0,
      merged_with: null,
      updated_at: new Date().toISOString(),
    })
    .neq('id', 'non_existent_id');

  // 3. Reset all table seats to VACANT with null active orders
  await supabase
    .from('table_seats')
    .update({
      status: 'VACANT',
      active_order_id: null,
      device_token: null,
      updated_at: new Date().toISOString(),
    })
    .neq('id', 'non_existent_id');

  // 4. Delete all lingering KDS tickets
  await supabase
    .from('kds_tickets')
    .delete()
    .neq('id', 'non_existent_id');

  // 5. Mark all open/unpaid orders as PAID
  await supabase
    .from('orders')
    .update({
      status: 'PAID',
      updated_at: new Date().toISOString(),
    })
    .neq('status', 'PAID')
    .neq('status', 'CANCELLED');

  // 6. Mark all order items as SERVED
  await supabase
    .from('order_items')
    .update({
      stage: 'SERVED',
      updated_at: new Date().toISOString(),
    })
    .neq('stage', 'SERVED');

  // 7. Mark all pings as RESOLVED
  await supabase
    .from('pings')
    .update({
      status: 'RESOLVED',
    })
    .neq('status', 'RESOLVED');

  // 8. Delete all temporary settlement pings
  await supabase
    .from('pings')
    .delete()
    .or('type.eq.SETTLEMENT_SESSION,type.eq.SETTLED_BILL');

  // 9. Broadcast real-time reset event across all connected devices
  broadcastStateChange('VENUE_CLEAN_RESET', { timestamp: Date.now() });
}

export async function GET() {
  try {
    await performVenueReset();
    return NextResponse.json({
      success: true,
      message: 'Venue reset complete: kitchen cleared, all tables vacant.',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Venue reset error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await performVenueReset();
    return NextResponse.json({
      success: true,
      message: 'Venue reset complete: kitchen cleared, all tables vacant.',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Venue reset error' },
      { status: 500 }
    );
  }
}
