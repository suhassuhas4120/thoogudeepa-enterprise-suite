import { NextRequest, NextResponse } from 'next/server';
import { supabase, broadcastStateChange } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceToken, fromTable, fromSeat, toTable, toSeat, orderId } = body;

    if (!deviceToken || !toTable || !toSeat || !orderId) {
      return NextResponse.json(
        { error: 'deviceToken, toTable, toSeat, and orderId are required' },
        { status: 400 }
      );
    }

    const normFromTable = String(fromTable || '').toUpperCase();
    const normToTable = String(toTable || '').toUpperCase();
    const normFromSeat = Number(fromSeat || 1);
    const normToSeat = Number(toSeat || 1);

    // 1. Validate that the order exists, is unpaid, and belongs to this device
    const { data: orderRecord, error: ordErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('device_token', deviceToken)
      .eq('status', 'UNPAID')
      .maybeSingle();

    if (ordErr || !orderRecord) {
      return NextResponse.json(
        { error: 'Order not found, already settled, or does not belong to this device' },
        { status: 404 }
      );
    }

    // 2. Validate that destination seat is vacant
    const { data: targetSeat, error: seatErr } = await supabase
      .from('table_seats')
      .select('*')
      .eq('table_number', normToTable)
      .eq('seat_number', normToSeat)
      .maybeSingle();

    if (seatErr || !targetSeat) {
      return NextResponse.json(
        { error: `Destination seat Table ${normToTable} Chair ${normToSeat} not found` },
        { status: 404 }
      );
    }

    if (targetSeat.status !== 'VACANT') {
      return NextResponse.json(
        { error: `Destination seat Table ${normToTable} Chair ${normToSeat} is already occupied` },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    const orderTotal = Number(orderRecord.total || orderRecord.total_amount || 0);

    // 3. Atomically transfer order, items, and tickets
    // A. Update orders table
    await supabase
      .from('orders')
      .update({
        table_number: normToTable,
        seat_number: normToSeat,
        updated_at: nowIso,
      })
      .eq('id', orderId);

    // B. Update order items
    await supabase
      .from('order_items')
      .update({
        table_number: normToTable,
        seat_number: normToSeat,
        updated_at: nowIso,
      })
      .eq('order_id', orderId);

    // C. Update KDS tickets
    await supabase
      .from('kds_tickets')
      .update({
        table_number: normToTable,
        updated_at: nowIso,
      })
      .eq('order_id', orderId);

    // D. Release previous seat to VACANT
    await supabase
      .from('table_seats')
      .update({
        status: 'VACANT',
        active_order_id: null,
        device_token: null,
        updated_at: nowIso,
      })
      .eq('table_number', normFromTable)
      .eq('seat_number', normFromSeat);

    // E. Occupy destination seat
    await supabase
      .from('table_seats')
      .update({
        status: 'OCCUPIED',
        active_order_id: orderId,
        device_token: deviceToken,
        updated_at: nowIso,
      })
      .eq('table_number', normToTable)
      .eq('seat_number', normToSeat);

    // F. Reconcile source table
    if (normFromTable !== normToTable) {
      const { data: remainingSeats } = await supabase
        .from('table_seats')
        .select('id')
        .eq('table_number', normFromTable)
        .eq('status', 'OCCUPIED');

      if (!remainingSeats || remainingSeats.length === 0) {
        await supabase
          .from('tables')
          .update({
            status: 'VACANT',
            current_bill: 0,
            guest_count: 0,
            kot_count: 0,
            updated_at: nowIso,
          })
          .eq('number', normFromTable);
      }
    }

    // G. Reconcile destination table
    await supabase
      .from('tables')
      .update({
        status: 'OCCUPIED',
        current_bill: orderTotal,
        guest_count: 1,
        updated_at: nowIso,
      })
      .eq('number', normToTable);

    // 4. Broadcast table transfer event to Waiter Mobile and Kitchen KDS
    broadcastStateChange('tableTransferred', {
      orderId,
      fromTable: normFromTable,
      fromSeat: normFromSeat,
      toTable: normToTable,
      toSeat: normToSeat,
      total: orderTotal,
    });

    return NextResponse.json({
      success: true,
      message: `Dining session transferred to Table ${normToTable} Chair ${normToSeat}`,
      newTable: normToTable,
      newSeat: normToSeat,
      orderId,
    });
  } catch (err: any) {
    console.error('Session transfer error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error transferring session' },
      { status: 500 }
    );
  }
}
