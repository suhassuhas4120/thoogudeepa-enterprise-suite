import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { generateTableSignature, verifyTableSignature } from '../../../../lib/qrSignature';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = (searchParams.get('table') || searchParams.get('tableNumber') || '').toUpperCase();
  const seat = parseInt(searchParams.get('seat') || searchParams.get('seatNumber') || '1', 10);
  const deviceToken = searchParams.get('deviceToken') || null;
  const sig = searchParams.get('sig') || searchParams.get('token') || null;

  return handleVerifySession(table, seat, deviceToken, sig);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const table = (body.table || body.tableNumber || '').toUpperCase();
    const seat = parseInt(body.seat || body.seatNumber || '1', 10);
    const deviceToken = body.deviceToken || null;
    const sig = body.sig || body.token || null;

    return handleVerifySession(table, seat, deviceToken, sig);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }
}

async function handleVerifySession(
  tableNumber: string,
  seatNumber: number,
  deviceToken: string | null,
  sig?: string | null
) {
  if (!tableNumber) {
    return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
  }

  // Whitelist check: only accept valid tables T-01 to T-34
  const tableNumMatch = tableNumber.match(/^(?:TABLE\s*|T-?)(\d+)$/i);
  const parsedNum = tableNumMatch ? parseInt(tableNumMatch[1], 10) : null;
  if (!parsedNum || parsedNum < 1 || parsedNum > 34) {
    return NextResponse.json({
      error: 'INVALID_TABLE',
      message: 'Table number must be between T-01 and T-34',
    }, { status: 400 });
  }

  // Seat check: must be a valid seat number (1-6)
  if (isNaN(seatNumber) || seatNumber < 1 || seatNumber > 6) {
    return NextResponse.json({
      error: 'INVALID_SEAT',
      message: 'Seat number must be between 1 and 6',
    }, { status: 400 });
  }

  // Cryptographic signature check (if URL includes signature)
  if (sig && !verifyTableSignature(tableNumber, seatNumber, sig)) {
    return NextResponse.json({
      active: false,
      isTampered: true,
      error: 'INVALID_SIGNATURE',
      message: 'Table parameters do not match physical QR signature. Please scan your physical table QR.',
    }, { status: 403 });
  }

  try {
    // 0. Global Hardware Session Engine: check if this device has an active unpaid order in the venue
    let existingActiveOrder: any = null;
    if (deviceToken) {
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('device_token', deviceToken)
        .eq('status', 'UNPAID')
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeOrders && activeOrders.length > 0) {
        existingActiveOrder = activeOrders[0];
      }
    }

    // Require authentic physical QR signature if device does not hold an active order
    if (!sig && !existingActiveOrder) {
      return NextResponse.json({
        active: false,
        isTampered: true,
        error: 'SIGNATURE_REQUIRED',
        message: 'Physical QR verification required. Table parameters must not be manually entered.',
      }, { status: 403 });
    }

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
        signatureVerified: Boolean(sig),
        sessionToken: sig ? generateTableSignature(tableNumber, seatNumber) : undefined,
        order: null,
        message: 'Seat is currently vacant',
      });
    }

    if (existingActiveOrder) {
      const isSameTable = existingActiveOrder.table_number.toUpperCase() === tableNumber.toUpperCase();
      const isSameSeat = Number(existingActiveOrder.seat_number) === Number(seatNumber);

      if (isSameTable && isSameSeat) {
        // Legitimate diner on their own chair: silent instant resume
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', existingActiveOrder.id)
          .order('created_at', { ascending: true });

        const orderObj = {
          id: existingActiveOrder.id,
          guestName: existingActiveOrder.guest_name,
          subtotal: Number(existingActiveOrder.subtotal),
          tax: Number(existingActiveOrder.tax),
          total: Number(existingActiveOrder.total || existingActiveOrder.total_amount),
          status: existingActiveOrder.status,
          items: items || [],
          createdAt: existingActiveOrder.created_at,
        };

        return NextResponse.json({
          active: true,
          tableNumber,
          seatNumber,
          isOccupiedByOtherDevice: false,
          hasActiveOrderElsewhere: false,
          vacantSeats: [],
          order: orderObj,
          activeOrder: orderObj,
        });
      } else {
        // Diner has an active unpaid order on a different chair or table
        return NextResponse.json({
          active: false,
          tableNumber,
          seatNumber,
          isOccupiedByOtherDevice: false,
          hasActiveOrderElsewhere: true,
          existingOrder: {
            id: existingActiveOrder.id,
            tableNumber: existingActiveOrder.table_number,
            seatNumber: existingActiveOrder.seat_number,
            total: Number(existingActiveOrder.total || existingActiveOrder.total_amount),
            guestName: existingActiveOrder.guest_name,
            createdAt: existingActiveOrder.created_at,
          },
          order: null,
          message: `You have an active dining session at Table ${existingActiveOrder.table_number} Chair ${existingActiveOrder.seat_number}`,
        });
      }
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
        .eq('seat_number', seatNumber)
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
