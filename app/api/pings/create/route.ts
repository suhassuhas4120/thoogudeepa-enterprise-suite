import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawTable = (body.tableNumber || body.table || '').toString();
    const cleanT = rawTable.replace(/^(TABLE\s*|T-?)/i, '').trim();
    const tableNumber = `T-${String(parseInt(cleanT, 10) || 1).padStart(2, '0')}`;
    const seatNumber = parseInt(body.seatNumber || body.seat || '1', 10);
    const type = (body.type || 'WATER').toUpperCase();
    const guestName = body.guestName || `Seat ${seatNumber}`;
    const message = body.message || null;

    if (!cleanT) {
      return NextResponse.json({ error: 'tableNumber is required' }, { status: 400 });
    }

    const timestamp = Date.now();
    const cleanTable = tableNumber.replace(/[^a-zA-Z0-9]/g, '');
    const randSuffix = Math.random().toString(36).slice(2, 6);
    const pingId = body.pingId || body.id || `PING-${cleanTable}-S${seatNumber}-${timestamp}-${randSuffix}`;

    const { error: insertErr } = await supabase.from('pings').insert({
      id: pingId,
      table_number: tableNumber,
      seat_number: seatNumber,
      type,
      guest_name: guestName,
      message,
      status: 'PENDING',
    });

    if (insertErr) {
      return NextResponse.json({ error: `Failed to create ping: ${insertErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pingId,
      tableNumber,
      seatNumber,
      type,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
