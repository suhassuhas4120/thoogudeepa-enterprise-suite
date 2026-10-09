import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = (searchParams.get('table') || searchParams.get('tableNumber') || '').toUpperCase();
  const seat = parseInt(searchParams.get('seat') || searchParams.get('seatNumber') || '1', 10);
  const deviceToken = searchParams.get('deviceToken') || null;

  return handleVerifySession(table, seat, deviceToken);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const table = (body.table || body.tableNumber || '').toUpperCase();
    const seat = parseInt(body.seat || body.seatNumber || '1', 10);
    const deviceToken = body.deviceToken || null;

    return handleVerifySession(table, seat, deviceToken);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }
}

async function handleVerifySession(tableNumber: string, seatNumber: number, deviceToken: string | null) {
  if (!tableNumber) {
    return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
  }

  try {
    // 1. Check seat status in table_seats
    const { data: seatData, error: sErr } = await supabase
      .from('table_seats')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('seat_number', seatNumber)
      .maybeSingle();

    if (sErr) {
      return NextResponse.json({ error: sErr.message }, { status: 500 });
    }

    if (!seatData) {
      return NextResponse.json({
        active: false,
        tableNumber,
        seatNumber,
        order: null,
        message: 'Seat is currently vacant',
      });
    }

    const isOccupiedByOther = Boolean(
      seatData &&
      seatData.status === 'OCCUPIED' &&
      seatData.device_token &&
      deviceToken &&
      seatData.device_token !== deviceToken
    );

    let vacantSeats: number[] = [];
    if (isOccupiedByOther) {
      const { data: tableSeats } = await supabase
        .from('table_seats')
        .select('seat_number, status')
        .eq('table_number', tableNumber)
        .order('seat_number');
      vacantSeats = (tableSeats || []).filter((s: any) => s.status === 'VACANT').map((s: any) => s.seat_number);
    }

    // 2. If seat is not vacant or has an active order, find the unpaid order
    if (seatData.status !== 'VACANT' || seatData.active_order_id) {
      let orderQuery = supabase
        .from('orders')
        .select('*')
        .eq('table_number', tableNumber)
        .eq('status', 'UNPAID')
        .order('created_at', { ascending: false })
        .limit(1);

      if (seatData.active_order_id) {
        orderQuery = supabase
          .from('orders')
          .select('*')
          .eq('id', seatData.active_order_id)
          .eq('status', 'UNPAID')
          .limit(1);
      }

      const { data: orderData, error: oErr } = await orderQuery.maybeSingle();

      if (oErr) {
        return NextResponse.json({ error: oErr.message }, { status: 500 });
      }

      if (orderData) {
        // Fetch active items
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id)
          .order('created_at', { ascending: true });
        const orderObj = {
          id: orderData.id,
          guestName: orderData.guest_name,
          subtotal: Number(orderData.subtotal),
          tax: Number(orderData.tax),
          total: Number(orderData.total || orderData.total_amount),
          status: orderData.status,
          items: items || [],
          createdAt: orderData.created_at,
        };

        return NextResponse.json({
          active: !isOccupiedByOther,
          tableNumber,
          seatNumber,
          isOccupiedByOtherDevice: isOccupiedByOther,
          vacantSeats,
          order: isOccupiedByOther ? null : orderObj,
          activeOrder: isOccupiedByOther ? null : orderObj,
        });
      }
    }

    // 3. Fallback: check deviceToken match across table orders
    if (deviceToken) {
      const { data: tokenOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('table_number', tableNumber)
        .eq('device_token', deviceToken)
        .eq('status', 'UNPAID')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tokenOrder) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', tokenOrder.id);

        const tokenOrderObj = {
          id: tokenOrder.id,
          guestName: tokenOrder.guest_name,
          subtotal: Number(tokenOrder.subtotal),
          tax: Number(tokenOrder.tax),
          total: Number(tokenOrder.total || tokenOrder.total_amount),
          status: tokenOrder.status,
          items: items || [],
          createdAt: tokenOrder.created_at,
        };

        return NextResponse.json({
          active: true,
          tableNumber,
          seatNumber: tokenOrder.seat_number,
          isOccupiedByOtherDevice: false,
          vacantSeats: [],
          order: tokenOrderObj,
          activeOrder: tokenOrderObj,
        });
      }
    }

    return NextResponse.json({
      active: false,
      tableNumber,
      seatNumber,
      isOccupiedByOtherDevice: isOccupiedByOther,
      vacantSeats,
      order: null,
      message: 'No active unpaid order found for this seat',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
