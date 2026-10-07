import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tableNumber = (body.tableNumber || body.table || '').toUpperCase();

    if (!tableNumber) {
      return NextResponse.json({ error: 'tableNumber is required' }, { status: 400 });
    }

    // 1. Verify table exists
    const { data: table, error: tErr } = await supabase
      .from('tables')
      .select('*')
      .eq('number', tableNumber)
      .maybeSingle();

    if (tErr || !table) {
      return NextResponse.json({ error: `Table ${tableNumber} not found` }, { status: 404 });
    }

    const now = new Date().toISOString();

    // 2. Reset table state
    const { error: tableUpdateErr } = await supabase
      .from('tables')
      .update({
        status: 'VACANT',
        current_bill: 0,
        guest_count: 0,
        kot_count: 0,
        merged_with: null,
        updated_at: now,
      })
      .eq('number', tableNumber);

    if (tableUpdateErr) {
      return NextResponse.json({ error: `Failed to vacate table: ${tableUpdateErr.message}` }, { status: 500 });
    }

    // 3. Clear all seats for this table
    await supabase
      .from('table_seats')
      .update({
        status: 'VACANT',
        active_order_id: null,
        device_token: null,
        updated_at: now,
      })
      .eq('table_number', tableNumber);

    // 4. Archive all tickets for this table as COMPLETED
    await supabase
      .from('kds_tickets')
      .update({
        status: 'COMPLETED',
        updated_at: now,
      })
      .eq('table_number', tableNumber);

    return NextResponse.json({
      success: true,
      tableNumber,
      status: 'VACANT',
      message: `Table ${tableNumber} has been vacated and reset`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
