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

  // 2. Reset Supabase tables
  await supabase
    .from('tables')
    .update({ status: 'VACANT', current_bill: 0 })
    .neq('status', 'VACANT');

  // 3. Reset Supabase table seats
  await supabase
    .from('table_seats')
    .update({ status: 'VACANT', active_order_id: null, device_token: null })
    .neq('status', 'VACANT');

  // 4. Mark all pending orders paid and items served
  await supabase
    .from('orders')
    .update({ status: 'PAID' })
    .neq('status', 'PAID')
    .neq('status', 'CANCELLED');

  await supabase
    .from('order_items')
    .update({ stage: 'SERVED' })
    .neq('stage', 'SERVED');

  await supabase
    .from('pings')
    .update({ status: 'RESOLVED' })
    .neq('status', 'RESOLVED');

  // 5. Broadcast real-time reset event across all connected devices
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
