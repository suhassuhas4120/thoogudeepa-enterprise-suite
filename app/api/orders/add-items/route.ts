import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { INITIAL_MENU_ITEMS } from '../../../../data/menuItems';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId;
    const items = body.items || [];
    const source = body.source || 'CUSTOMER';
    const serverName = body.serverName || 'Guest';

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }
    if (!items.length) {
      return NextResponse.json({ error: 'At least one item must be added' }, { status: 400 });
    }

    // 1. Fetch existing order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: `Order ${orderId} not found` }, { status: 404 });
    }

    // SCN-03: Prevent appending items to closed / paid orders
    if (order.status !== 'UNPAID') {
      return NextResponse.json(
        { error: `Cannot append items to order with status ${order.status || 'UNKNOWN'}. Please initiate a new order.` },
        { status: 400 }
      );
    }

    const tableNumber = order.table_number;
    const seatNumber = order.seat_number;

    // SCN-02: Validate items against canonical menu database and calculate authoritative prices
    for (const it of items) {
      const canonical = INITIAL_MENU_ITEMS.find((m) => m.id === it.id || m.name.toLowerCase() === (it.name || '').toLowerCase());
      if (!canonical) {
        return NextResponse.json({ error: `Invalid menu item: ${it.name || it.id}` }, { status: 400 });
      }
      const rawQty = it.quantity;
      const numQty = typeof rawQty === 'number' ? rawQty : parseInt(String(rawQty), 10);
      if (isNaN(numQty) || numQty <= 0 || !Number.isInteger(numQty) || numQty > 25) {
        return NextResponse.json({ error: `Quantity for item "${it.name || it.id}" must be between 1 and 25` }, { status: 400 });
      }
    }

    // 2. Calculate incremental totals using canonical catalog prices
    const addedSubtotal = items.reduce((acc: number, it: any) => {
      const canonical = INITIAL_MENU_ITEMS.find((m) => m.id === it.id || m.name.toLowerCase() === (it.name || '').toLowerCase())!;
      let addOnCost = 0;
      if (Array.isArray(it.addOns) && canonical?.optionsGroup2?.addOns) {
        for (const ao of it.addOns) {
          const aoRecord = canonical.optionsGroup2.addOns.find((a) => a.name === ao);
          if (aoRecord) addOnCost += aoRecord.extraPrice;
        }
      }
      const price = canonical.price + addOnCost;
      const qty = Math.max(1, Math.min(25, Number(it.quantity || 1)));
      return acc + price * qty;
    }, 0);

    const addedTax = Math.round(addedSubtotal * 0.05);
    const addedTotal = addedSubtotal + addedTax;

    const newSubtotal = Number(order.subtotal || 0) + addedSubtotal;
    const newTax = Number(order.tax || 0) + addedTax;
    const newTotal = Number(order.total || order.total_amount || 0) + addedTotal;

    // 3. Count existing items to generate sequential IDs
    const { count: existingCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);

    const startIdx = existingCount || 0;

    // 4. Insert new line items with canonical prices
    const lineItems = items.map((it: any, index: number) => {
      const canonical = INITIAL_MENU_ITEMS.find((m) => m.id === it.id || m.name.toLowerCase() === (it.name || '').toLowerCase())!;
      let addOnCost = 0;
      if (Array.isArray(it.addOns) && canonical?.optionsGroup2?.addOns) {
        for (const ao of it.addOns) {
          const aoRecord = canonical.optionsGroup2.addOns.find((a) => a.name === ao);
          if (aoRecord) addOnCost += aoRecord.extraPrice;
        }
      }
      const unitPrice = canonical.price + addOnCost;
      const qty = Math.max(1, Math.min(25, Number(it.quantity || 1)));

      return {
        id: `${orderId}-it-${startIdx + index + 1}`,
        order_id: orderId,
        table_number: tableNumber,
        seat_number: seatNumber,
        name: canonical.name || it.name,
        quantity: qty,
        unit_price: unitPrice,
        price: unitPrice,
        total_price: unitPrice * qty,
        stage: 'PLACED',
        prep_mode: it.prepMode || 'Dum Pot',
        options: it.options || it.selectedOption || null,
        selected_option: it.selectedOption || it.options || null,
        add_ons: it.addOns || it.add_ons || [],
        addOns: it.addOns || it.add_ons || [],
        notes: it.notes || null,
      };
    });

    const { error: itemsErr } = await supabase.from('order_items').insert(lineItems);
    if (itemsErr) {
      return NextResponse.json({ error: `Failed to insert items: ${itemsErr.message}` }, { status: 500 });
    }

    // 5. Create supplementary KDS ticket
    const timestamp = Date.now();
    const cleanTable = tableNumber.replace(/[^a-zA-Z0-9]/g, '');
    const ticketId = `KOT-${cleanTable}-ADD-${timestamp.toString().slice(-4)}`;

    await supabase.from('kds_tickets').insert({
      id: ticketId,
      order_id: orderId,
      table_number: tableNumber,
      seat_number: seatNumber,
      server_name: serverName,
      status: 'NEW',
      source,
      items: lineItems,
    });

    // 6. Update order financials
    const combinedItems = [...(order.items || []), ...items];
    await supabase
      .from('orders')
      .update({
        items: combinedItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
        total_amount: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // 7. Update table running bill and KOT count
    // SCN-01: Update current_bill with addedSubtotal (untaxed) to prevent 10.25% compounding in UI
    const { data: tableRecord } = await supabase
      .from('tables')
      .select('current_bill, kot_count')
      .eq('number', tableNumber)
      .maybeSingle();

    if (tableRecord) {
      await supabase
        .from('tables')
        .update({
          current_bill: Number(tableRecord.current_bill || 0) + addedSubtotal,
          kot_count: Number(tableRecord.kot_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('number', tableNumber);
    }

    return NextResponse.json({
      success: true,
      orderId,
      ticketId,
      tableNumber,
      seatNumber,
      addedCount: items.length,
      newSubtotal,
      newTax,
      newTotal,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
