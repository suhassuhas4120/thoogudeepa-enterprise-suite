import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tableNumber = (body.tableNumber || body.table || '').toUpperCase();
    const seatNumber = parseInt(body.seatNumber || body.seat || '1', 10);
    const guestName = body.guestName || `Seat ${seatNumber}`;
    const guestCount = parseInt(body.guestCount || '1', 10);
    const items = body.items || [];
    const deviceToken = body.deviceToken || null;

    if (!tableNumber) {
      return NextResponse.json({ error: 'tableNumber is required' }, { status: 400 });
    }
    if (!items.length) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    // Verify table exists
    const { data: tableRecord, error: tableErr } = await supabase
      .from('tables')
      .select('*')
      .eq('number', tableNumber)
      .maybeSingle();

    if (tableErr || !tableRecord) {
      return NextResponse.json({ error: `Table ${tableNumber} does not exist in floor plan` }, { status: 404 });
    }

    // Calculate financials
    const subtotal = items.reduce((acc: number, item: any) => {
      const price = Number(item.unitPrice || item.price || 0);
      const qty = Number(item.quantity || 1);
      return acc + price * qty;
    }, 0);

    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;

    // Generate unique identifiers
    const timestamp = Date.now();
    const cleanTable = tableNumber.replace(/[^a-zA-Z0-9]/g, '');
    const orderId = `ORD-${cleanTable}-S${seatNumber}-${timestamp.toString().slice(-6)}`;
    const ticketId = `KOT-${cleanTable}-${timestamp.toString().slice(-4)}`;

    // 1. Create order record
    const { error: orderErr } = await supabase.from('orders').insert({
      id: orderId,
      table_number: tableNumber,
      seat_number: seatNumber,
      guest_name: guestName,
      guest_count: guestCount,
      items,
      subtotal,
      tax,
      total,
      total_amount: total,
      status: 'UNPAID',
      source: 'CUSTOMER',
      device_token: deviceToken,
    });

    if (orderErr) {
      return NextResponse.json({ error: `Failed to create order: ${orderErr.message}` }, { status: 500 });
    }

    // 2. Insert line items
    const lineItems = items.map((it: any, index: number) => {
      const unitPrice = Number(it.unitPrice || it.price || 0);
      const qty = Number(it.quantity || 1);
      const totalPrice = unitPrice * qty;

      return {
        id: `${orderId}-it-${index + 1}`,
        order_id: orderId,
        table_number: tableNumber,
        seat_number: seatNumber,
        name: it.name,
        quantity: qty,
        unit_price: unitPrice,
        price: unitPrice,
        total_price: totalPrice,
        stage: 'PLACED',
        prep_mode: it.prepMode || 'Dum Pot',
        options: it.options || it.selectedOption || null,
        selected_option: it.selectedOption || it.options || null,
        add_ons: it.addOns || it.add_ons || [],
        notes: it.notes || null,
      };
    });

    const { error: itemsErr } = await supabase.from('order_items').insert(lineItems);
    if (itemsErr) {
      console.error('Failed to insert order line items:', itemsErr);
    }

    // 3. Create KDS ticket
    const { error: kdsErr } = await supabase.from('kds_tickets').insert({
      id: ticketId,
      order_id: orderId,
      table_number: tableNumber,
      seat_number: seatNumber,
      server_name: guestName,
      status: 'NEW',
      source: 'CUSTOMER',
      items: lineItems,
    });

    if (kdsErr) {
      console.error('Failed to create KDS ticket:', kdsErr);
    }

    // 4. Update seat status to OCCUPIED
    await supabase
      .from('table_seats')
      .update({
        status: 'OCCUPIED',
        active_order_id: orderId,
        device_token: deviceToken,
        updated_at: new Date().toISOString(),
      })
      .eq('table_number', tableNumber)
      .eq('seat_number', seatNumber);

    // 5. Update table status and running bill
    const newBill = Number(tableRecord.current_bill || 0) + total;
    const newKotCount = Number(tableRecord.kot_count || 0) + 1;

    await supabase
      .from('tables')
      .update({
        status: 'OCCUPIED',
        current_bill: newBill,
        kot_count: newKotCount,
        guest_count: Math.max(Number(tableRecord.guest_count || 0), guestCount),
        updated_at: new Date().toISOString(),
      })
      .eq('number', tableNumber);

    return NextResponse.json({
      success: true,
      orderId,
      ticketId,
      tableNumber,
      seatNumber,
      subtotal,
      tax,
      total,
      itemCount: items.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
