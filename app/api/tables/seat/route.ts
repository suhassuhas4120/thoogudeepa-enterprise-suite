import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tableNumber = (body.tableNumber || body.table || '').toUpperCase();
    const guestCount = parseInt(body.guestCount || '1', 10);
    const serverName = body.serverName || 'Floor Captain';

    if (!tableNumber) {
      return NextResponse.json({ error: 'tableNumber is required' }, { status: 400 });
    }

    // 1. Check table existence
    const { data: table, error: tErr } = await supabase
      .from('tables')
      .select('*')
      .eq('number', tableNumber)
      .maybeSingle();

    if (tErr || !table) {
      return NextResponse.json({ error: `Table ${tableNumber} not found` }, { status: 404 });
    }

    // 2. Update table state to OCCUPIED
    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from('tables')
      .update({
        status: 'OCCUPIED',
        guest_count: guestCount,
        server_name: serverName,
        updated_at: now,
      })
      .eq('number', tableNumber);

    if (updateErr) {
      return NextResponse.json({ error: `Failed to seat table: ${updateErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tableNumber,
      status: 'OCCUPIED',
      guestCount,
      serverName,
      seatedTime: now,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
