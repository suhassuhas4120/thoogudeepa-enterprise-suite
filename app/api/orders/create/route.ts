import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { clearSettledBillInMemory } from '../../../../lib/settlementStore';

export const dynamic = 'force-dynamic';

const globalForOrders = globalThis as unknown as {
  inFlightOrderLocks: Map<string, Promise<any>>;
};
const inFlightOrderLocks =
  globalForOrders.inFlightOrderLocks ??
  (globalForOrders.inFlightOrderLocks = new Map<string, Promise<any>>());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tableNumber = (body.tableNumber || body.table || '').toUpperCase();
    const seatNumber = parseInt(body.seatNumber || body.seat || '1', 10);
    const guestName = body.guestName || `Seat ${seatNumber}`;
    const guestCount = parseInt(body.guestCount || '1', 10);
    const items = body.items || [];
    const deviceToken = body.deviceToken || null;
    const source: 'CUSTOMER' | 'WAITER' = body.source === 'WAITER' ? 'WAITER' : 'CUSTOMER';

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

    // Chair Device Concurrency & Ownership Protection
    if (source === 'CUSTOMER') {
      // 1. Strict Cross-Chair/Table Guard: Do not allow customer to place order on a different chair/table if they have an active unpaid order
      if (deviceToken) {
        const { data: activeUnpaidOrders } = await supabase
          .from('orders')
          .select('id, table_number, seat_number, total, total_amount')
          .eq('device_token', deviceToken)
          .eq('status', 'UNPAID')
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeUnpaidOrders && activeUnpaidOrders.length > 0) {
          const activeOrd = activeUnpaidOrders[0];
          const isSameTable = activeOrd.table_number.toUpperCase() === tableNumber.toUpperCase();
          const isSameSeat = Number(activeOrd.seat_number) === Number(seatNumber);

          if (!isSameTable || !isSameSeat) {
            // Verify if the active order's chair is still occupied in the dining room
            const { data: seatCheck } = await supabase
              .from('table_seats')
              .select('status, active_order_id, device_token')
              .eq('table_number', activeOrd.table_number)
              .eq('seat_number', activeOrd.seat_number)
              .maybeSingle();

            const isSeatStillOccupied = Boolean(
              !seatCheck ||
              (seatCheck.status === 'OCCUPIED' &&
                (seatCheck.active_order_id || seatCheck.device_token === deviceToken))
            );

            if (isSeatStillOccupied) {
              return NextResponse.json(
                {
                  error: 'ACTIVE_ORDER_PENDING',
                  message: `You already have an active dining order at Table ${activeOrd.table_number} Chair ${activeOrd.seat_number}. Please settle your pending bill before placing orders on another chair.`,
                  existingOrder: {
                    id: activeOrd.id,
                    tableNumber: activeOrd.table_number,
                    seatNumber: activeOrd.seat_number,
                    total: Number(activeOrd.total || activeOrd.total_amount || 0),
                  },
                },
                { status: 403 }
              );
            }
          }
        }
      }

      // 2. Prevent taking over an already-occupied chair
      const { data: currentSeat } = await supabase
        .from('table_seats')
        .select('*')
        .eq('table_number', tableNumber)
        .eq('seat_number', seatNumber)
        .maybeSingle();

      if (
        currentSeat &&
        currentSeat.status === 'OCCUPIED' &&
        currentSeat.device_token &&
        deviceToken &&
        currentSeat.device_token !== deviceToken
      ) {
        const { data: allSeats } = await supabase
          .from('table_seats')
          .select('seat_number, status')
          .eq('table_number', tableNumber)
          .order('seat_number');

        const vacantSeats = (allSeats || [])
          .filter((s: any) => s.status === 'VACANT')
          .map((s: any) => s.seat_number);

        return NextResponse.json(
          {
            error: 'CHAIR_OCCUPIED_BY_ANOTHER_DEVICE',
            message: `Chair ${seatNumber} at Table ${tableNumber} is already active on another device.`,
            tableNumber,
            occupiedSeat: seatNumber,
            vacantSeats,
          },
          { status: 409 }
        );
      }
    }

    // Calculate financials
    const subtotal = items.reduce((acc: number, item: any) => {
      const price = Number(item.unitPrice || item.price || 0);
      const qty = Number(item.quantity || 1);
      return acc + price * qty;
    }, 0);

    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;

    const lockKey = `${tableNumber}-S${seatNumber}`;

    // Synchronous mutex chaining: acquire reference to current tail, install ourselves as the new tail
    const previousLock = inFlightOrderLocks.get(lockKey);
    let releaseLock: () => void = () => {};
    const myLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    inFlightOrderLocks.set(lockKey, myLock);

    // Wait for previous in-flight order for this exact chair if any
    if (previousLock) {
      try {
        await previousLock;
      } catch {}
    }

    try {
      // Idempotency check: Look for identical order created in the last 45 seconds
      const fortyFiveSecsAgo = new Date(Date.now() - 45000).toISOString();
      const { data: recentOrder } = await supabase
        .from('orders')
        .select('id, table_number, seat_number, total_amount, status, created_at')
        .eq('table_number', tableNumber)
        .eq('seat_number', seatNumber)
        .eq('status', 'UNPAID')
        .gte('created_at', fortyFiveSecsAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentOrder && Math.abs(Number(recentOrder.total_amount) - total) < 0.01) {
        const { data: recentItems } = await supabase
          .from('order_items')
          .select('name, quantity')
          .eq('order_id', recentOrder.id);

        const itemsMatch =
          recentItems &&
          recentItems.length === items.length &&
          items.every((it: any) =>
            recentItems.some((ri: any) => ri.name === it.name && Number(ri.quantity) === Number(it.quantity || 1))
          );

        if (itemsMatch) {
          return NextResponse.json({
            success: true,
            orderId: recentOrder.id,
            ticketId: `KOT-${tableNumber.replace(/[^a-zA-Z0-9]/g, '')}-${recentOrder.id.slice(-4)}`,
            tableNumber,
            seatNumber,
            total,
            source,
            idempotent: true,
            message: 'Order accepted idempotently',
          });
        }
      }
      // Generate unique identifiers
      const timestamp = Date.now();
      const cleanTable = tableNumber.replace(/[^a-zA-Z0-9]/g, '');
      const orderId = `ORD-${cleanTable}-S${seatNumber}-${timestamp.toString().slice(-6)}`;
      const ticketId = `KOT-${cleanTable}-${timestamp.toString().slice(-4)}`;

      const nowIso = new Date().toISOString();

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
        source,
        device_token: deviceToken,
        created_at: nowIso,
        updated_at: nowIso,
      });

    if (orderErr) {
      return NextResponse.json({ error: `Failed to create order: ${orderErr.message}` }, { status: 500 });
    }

    // Delete any previous settled bill for this chair
    try {
      const cleanT = (tableNumber || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
      const nTable = `T-${String(parseInt(cleanT, 10) || 1).padStart(2, '0')}`;
      clearSettledBillInMemory(nTable, seatNumber);
      await supabase
        .from('pings')
        .delete()
        .or(`id.eq.SETTLED-BILL-${nTable}-S${seatNumber},id.eq.SETTLE-SESSION-${nTable}-S${seatNumber}`);
    } catch {}

    // 2. Insert line items
    const lineItems = items.map((it: any, index: number) => {
      const unitPrice = Number(it.unitPrice || it.price || 0);
      const qty = Number(it.quantity || 1);
      const totalPrice = unitPrice * qty;
      const itemSeat = it.seat_number || it.seatNumber || seatNumber;

      return {
        id: it.id || `${orderId}-it-${index + 1}`,
        order_id: orderId,
        table_number: tableNumber,
        seat_number: itemSeat,
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
        created_at: nowIso,
        updated_at: nowIso,
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
      source,
      items: lineItems,
      created_at: nowIso,
      updated_at: nowIso,
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
        updated_at: nowIso,
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
        guest_count: Math.max(Number(tableRecord.guest_count || 0), guestCount, seatNumber),
        updated_at: nowIso,
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
    } finally {
      if (inFlightOrderLocks.get(lockKey) === myLock) {
        inFlightOrderLocks.delete(lockKey);
      }
      releaseLock();
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
