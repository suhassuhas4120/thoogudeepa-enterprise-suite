import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { clearSettledBillInMemory } from '../../../../lib/settlementStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const rawTable = body.tableNumber || body.table || '';
    const tNum = cleanNum(rawTable);
    const tableNumber = tNum ? `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}` : rawTable.toUpperCase();

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

    const seatNumber = typeof body.seatNumber === 'number' ? body.seatNumber : undefined;

    // ── SPECIFIC CHAIR / SEAT VACATE ──
    if (typeof seatNumber === 'number') {
      // 1. Clear this specific seat in table_seats
      await supabase
        .from('table_seats')
        .update({
          status: 'VACANT',
          active_order_id: null,
          device_token: null,
          updated_at: now,
        })
        .eq('table_number', tableNumber)
        .eq('seat_number', seatNumber);

      // 1b. Mark any active unpaid orders for this chair as PAID so subsequent scans treat customer as new user
      await supabase
        .from('orders')
        .update({ status: 'PAID', updated_at: now })
        .eq('table_number', tableNumber)
        .eq('seat_number', seatNumber)
        .eq('status', 'UNPAID');

      // 2. Fetch and filter active KDS tickets
      const { data: activeTickets } = await supabase
        .from('kds_tickets')
        .select('*')
        .eq('table_number', tableNumber)
        .neq('status', 'COMPLETED');

      let remainingItemsTotal = 0;
      let hasOtherSeatItems = false;

      if (activeTickets && activeTickets.length > 0) {
        for (const tk of activeTickets) {
          const items = Array.isArray(tk.items) ? tk.items : [];
          const tkSeat = tk.seat_number !== undefined && tk.seat_number !== null ? Number(tk.seat_number) : undefined;

          const thisSeatItems = items.filter((it: any) => {
            const itSeat = (it.seat_number !== undefined && it.seat_number !== null)
              ? Number(it.seat_number)
              : (it.seatNumber !== undefined && it.seatNumber !== null)
              ? Number(it.seatNumber)
              : tkSeat;
            return itSeat === seatNumber;
          });
          const otherSeatItems = items.filter((it: any) => {
            const itSeat = (it.seat_number !== undefined && it.seat_number !== null)
              ? Number(it.seat_number)
              : (it.seatNumber !== undefined && it.seatNumber !== null)
              ? Number(it.seatNumber)
              : tkSeat;
            return itSeat !== seatNumber;
          });

          if (thisSeatItems.length > 0 || tkSeat === seatNumber) {
            if (otherSeatItems.length === 0) {
              // Entire ticket belonged to settled seat -> mark COMPLETED
              await supabase
                .from('kds_tickets')
                .update({ status: 'COMPLETED', updated_at: now })
                .eq('id', tk.id);
            } else {
              // Mixed ticket -> keep active with only other seats' items
              await supabase
                .from('kds_tickets')
                .update({ items: otherSeatItems, updated_at: now })
                .eq('id', tk.id);
              hasOtherSeatItems = true;
              otherSeatItems.forEach((it: any) => {
                remainingItemsTotal += Number(it.price || it.unit_price || 0) * Number(it.quantity || 1);
              });
            }
          } else {
            hasOtherSeatItems = true;
            items.forEach((it: any) => {
              remainingItemsTotal += Number(it.price || it.unit_price || 0) * Number(it.quantity || 1);
            });
          }
        }
      }

      // 3. Update table bill and status
      const newBill = Math.round(remainingItemsTotal * 1.05);
      const newStatus = hasOtherSeatItems ? 'OCCUPIED' : 'VACANT';
      const newGuestCount = hasOtherSeatItems ? Math.max(1, (table.guest_count || 2) - 1) : 0;
      const newKotCount = hasOtherSeatItems ? Math.max(1, (table.kot_count || 1) - 1) : 0;

      await supabase
        .from('tables')
        .update({
          status: newStatus,
          current_bill: newBill,
          guest_count: newGuestCount,
          kot_count: newKotCount,
          updated_at: now,
        })
        .eq('number', tableNumber);

      // Clear settled bills for this specific chair
      try {
        clearSettledBillInMemory(tableNumber, seatNumber);
        if (!hasOtherSeatItems) {
          clearSettledBillInMemory(tableNumber);
        }
        await supabase
          .from('pings')
          .delete()
          .or(`id.eq.SETTLED-BILL-${tableNumber}-S${seatNumber},id.eq.SETTLE-SESSION-${tableNumber}-S${seatNumber},id.eq.SETTLED-BILL-${tableNumber}`);
      } catch {}

      return NextResponse.json({
        success: true,
        tableNumber,
        seatNumber,
        status: newStatus,
        remainingBill: newBill,
        message: `Chair ${seatNumber} at Table ${tableNumber} has been vacated and settled`,
      });
    }

    // ── FULL TABLE VACATE ──
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

    // 3b. Mark any active unpaid orders for this table as PAID so subsequent scans treat all chairs as fresh new users
    await supabase
      .from('orders')
      .update({ status: 'PAID', updated_at: now })
      .eq('table_number', tableNumber)
      .eq('status', 'UNPAID');

    // 4. Archive all tickets for this table as COMPLETED
    await supabase
      .from('kds_tickets')
      .update({
        status: 'COMPLETED',
        updated_at: now,
      })
      .eq('table_number', tableNumber);

    // 5. Clear settled bills for this table
    try {
      clearSettledBillInMemory(tableNumber);
      const cleanT = (tableNumber || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
      const nTable = `T-${String(parseInt(cleanT, 10) || 1).padStart(2, '0')}`;
      await supabase
        .from('pings')
        .delete()
        .or(`id.ilike.SETTLE-SESSION-${nTable}%,id.ilike.SETTLED-BILL-${nTable}%`);
    } catch {}

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
