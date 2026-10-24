import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

const STAGE_TRANSITION: Record<string, string> = {
  PLACED: 'RECEIVED',
  RECEIVED: 'PREP',
  PREP: 'PLATED',
  PREPARING: 'PLATED',
  PLATED: 'SERVED',
  READY: 'SERVED',
  SERVED: 'SERVED',
};

// Global in-flight lock map to serialize concurrent dish status updates per ticket
const globalForBump = globalThis as unknown as {
  inFlightBumpLocks: Map<string, Promise<any>>;
};
const inFlightBumpLocks =
  globalForBump.inFlightBumpLocks ??
  (globalForBump.inFlightBumpLocks = new Map<string, Promise<any>>());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = body.itemId;
    const ticketId = body.ticketId;
    const itemName = body.itemName ? String(body.itemName).trim().toLowerCase() : '';
    let targetStage = body.stage;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    if (targetStage === 'PREPARING') targetStage = 'PREP';
    if (targetStage === 'READY') targetStage = 'PLATED';

    // Serialize concurrent updates for the same ticket/order to prevent race conditions
    const lockKey = ticketId || String(body.tableNumber || itemId);
    const prevLock = inFlightBumpLocks.get(lockKey) || Promise.resolve();
    let releaseLock: () => void = () => {};
    const nextLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    inFlightBumpLocks.set(lockKey, prevLock.then(() => nextLock, () => nextLock));
    await prevLock;

    try {
      const nowIso = new Date().toISOString();

      // Normalize table number if provided
      const rawTable = body.tableNumber ? String(body.tableNumber).trim() : '';
      const cleanNum = rawTable.replace(/^(TABLE\s*|T-?)/i, '').trim();
      const normTable = cleanNum ? `T-${String(parseInt(cleanNum, 10) || cleanNum).padStart(2, '0')}` : '';

      // 1. Fetch item from order_items
      let { data: item } = await supabase
        .from('order_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();

      const normSearch = String(itemId).trim().toLowerCase();

      // If not matched by exact ID, try matching by itemName within recent order items
      if (!item && itemName) {
        let q = supabase
          .from('order_items')
          .select('*')
          .ilike('name', `%${itemName}%`)
          .order('created_at', { ascending: false })
          .limit(10);
        if (normTable) {
          q = q.or(`table_number.eq.${normTable},table_number.eq.${rawTable}`);
        }
        const { data: matchedByName } = await q;
        if (matchedByName && matchedByName.length > 0) {
          item = matchedByName.find((it: any) => it.stage !== 'SERVED') || matchedByName[0];
        }
      }

      // If still not matched, try searching order_items by tableNumber
      if (!item && normTable) {
        const { data: tblItems } = await supabase
          .from('order_items')
          .select('*')
          .or(`table_number.eq.${normTable},table_number.eq.${rawTable}`)
          .order('created_at', { ascending: false })
          .limit(20);
        if (tblItems && tblItems.length > 0) {
          item =
            tblItems.find((it: any) =>
              it.id === itemId ||
              (itemName && (it.name || '').trim().toLowerCase().includes(itemName)) ||
              (normSearch && (it.name || '').trim().toLowerCase().includes(normSearch))
            ) ||
            tblItems.find((it: any) => it.stage !== 'SERVED');
        }
      }

      // 2. Fetch ticket from kds_tickets
      let targetTicket: any = null;
      if (ticketId && ticketId !== 'tbl-direct') {
        const { data: t } = await supabase
          .from('kds_tickets')
          .select('*')
          .eq('id', ticketId)
          .maybeSingle();
        if (t) targetTicket = t;
      }

      if (!targetTicket && item?.order_id) {
        const { data: t } = await supabase
          .from('kds_tickets')
          .select('*')
          .eq('order_id', item.order_id)
          .maybeSingle();
        if (t) targetTicket = t;
      }

      // Search tickets by table number if provided
      if (!targetTicket && normTable) {
        const { data: tblTickets } = await supabase
          .from('kds_tickets')
          .select('*')
          .or(`table_number.eq.${normTable},table_number.eq.${rawTable}`)
          .order('created_at', { ascending: false });
        if (tblTickets && tblTickets.length > 0) {
          targetTicket =
            tblTickets.find((t: any) =>
              Array.isArray(t.items) &&
              t.items.some((it: any) =>
                it.id === itemId ||
                (itemName && (it.name || '').trim().toLowerCase().includes(itemName)) ||
                (normSearch && (it.name || '').trim().toLowerCase().includes(normSearch))
              )
            ) ||
            tblTickets.find((t: any) => t.status !== 'COMPLETED') ||
            tblTickets[0];
        }
      }

      if (!targetTicket) {
        const { data: allActiveTickets } = await supabase
          .from('kds_tickets')
          .select('*')
          .neq('status', 'COMPLETED');
        targetTicket = (allActiveTickets || []).find((t: any) =>
          Array.isArray(t.items) &&
          t.items.some((it: any) => 
            it.id === itemId ||
            (itemName && (it.name || '').trim().toLowerCase().includes(itemName))
          )
        );

        if (!targetTicket) {
          // Fallback for direct dish name matching, but only target unserved items
          targetTicket = (allActiveTickets || []).find((t: any) =>
            Array.isArray(t.items) &&
            t.items.some((it: any) => {
              const itName = (it.name || '').trim().toLowerCase();
              return (itName === normSearch || (itName && normSearch.includes(itName))) && it.stage !== 'SERVED';
            })
          );
        }
      }

      // Fallback: search recent tickets across all statuses (including COMPLETED)
      if (!item && !targetTicket) {
        const { data: recentTickets } = await supabase
          .from('kds_tickets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        targetTicket = (recentTickets || []).find((t: any) =>
          Array.isArray(t.items) &&
          t.items.some((it: any) =>
            it.id === itemId ||
            (itemName && (it.name || '').trim().toLowerCase().includes(itemName)) ||
            (normSearch && (it.name || '').trim().toLowerCase().includes(normSearch))
          )
        );
      }

      // If the item belongs to a valid floor table, upsert it into order_items so it persists
      if (!item && !targetTicket && normTable) {
        const nameToSave = body.itemName || (body.name ? String(body.name) : `Item ${itemId}`);
        const priceToSave = Number(body.price || body.unitPrice || 0);
        const qtyToSave = Number(body.quantity || 1);
        const seatToSave = Number(body.seatNumber || body.seat_number) || 1;
        const { data: insertedItem } = await supabase
          .from('order_items')
          .upsert({
            id: itemId,
            order_id: `ORD-${normTable.replace(/[^a-zA-Z0-9]/g, '')}-${nowIso.slice(-6)}`,
            table_number: normTable,
            seat_number: seatToSave,
            name: nameToSave,
            quantity: qtyToSave,
            price: priceToSave,
            unit_price: priceToSave,
            total_price: priceToSave * qtyToSave,
            stage: targetStage || 'SERVED',
            created_at: nowIso,
            updated_at: nowIso,
          })
          .select('*')
          .maybeSingle();
        if (insertedItem) {
          item = insertedItem;
        }
      }

      if (!item && !targetTicket) {
        return NextResponse.json({ error: `Item ${itemId} not found` }, { status: 404 });
      }

      let ticketItem = targetTicket?.items?.find((it: any) => 
        it.id === itemId ||
        (item && it.id === item.id)
      ) || targetTicket?.items?.find((it: any) =>
        (!itemId && itemName && (it.name || '').trim().toLowerCase() === itemName) ||
        (!itemId && normSearch && (it.name || '').trim().toLowerCase().includes(normSearch))
      );
      if (!ticketItem && targetTicket?.items) {
        ticketItem = targetTicket.items.find((it: any) => {
          const itName = (it.name || '').trim().toLowerCase();
          return (itName === normSearch || (itName && normSearch.includes(itName))) && it.stage !== 'SERVED';
        });
      }

      const currentStage = item?.stage || ticketItem?.stage || 'PLACED';
      const nextStage = targetStage || STAGE_TRANSITION[currentStage] || 'PREP';

      // 3. Update order_items
      if (item) {
        await supabase
          .from('order_items')
          .update({
            stage: nextStage,
            updated_at: nowIso,
          })
          .eq('id', item.id);
      } else if (targetTicket && ticketItem) {
        await supabase
          .from('order_items')
          .upsert({
            id: ticketItem.id || itemId,
            order_id: targetTicket.order_id || targetTicket.id,
            table_number: targetTicket.table_number,
            seat_number: ticketItem.seatNumber || ticketItem.seat_number || targetTicket.seat_number || 1,
            name: ticketItem.name,
            quantity: ticketItem.quantity || 1,
            price: ticketItem.price || ticketItem.unit_price || 0,
            unit_price: ticketItem.unit_price || ticketItem.price || 0,
            total_price: (ticketItem.price || ticketItem.unit_price || 0) * (ticketItem.quantity || 1),
            stage: nextStage,
            prep_mode: ticketItem.prepMode || ticketItem.prep_mode || 'Regular',
            options: ticketItem.options || null,
            selected_option: ticketItem.selected_option || ticketItem.options || null,
            add_ons: ticketItem.add_ons || ticketItem.addOns || [],
            notes: ticketItem.notes || null,
            created_at: nowIso,
            updated_at: nowIso,
          });
      }

      // 4. Update kds_tickets
      let ticketStatus = 'NEW';
      if (targetTicket) {
        const updatedTicketItems = (targetTicket.items || []).map((it: any) => {
          const isMatch =
            it.id === itemId ||
            (item && it.id === item.id) ||
            (ticketItem && it.id === ticketItem.id) ||
            (!itemId && itemName && (it.name || '').trim().toLowerCase() === itemName);
          if (isMatch) {
            return { ...it, stage: nextStage };
          }
          return it;
        });

        const allServed = updatedTicketItems.length > 0 && updatedTicketItems.every((it: any) => it.stage === 'SERVED');
        const allPlated = updatedTicketItems.length > 0 && updatedTicketItems.every((it: any) => it.stage === 'PLATED' || it.stage === 'SERVED');
        const anyActive = updatedTicketItems.some((it: any) => it.stage === 'PREP' || it.stage === 'PLATED' || it.stage === 'RECEIVED');

        if (allServed) {
          ticketStatus = 'SERVED';
        } else if (allPlated) {
          ticketStatus = 'READY';
        } else if (anyActive) {
          ticketStatus = 'PREP';
        } else {
          ticketStatus = 'NEW';
        }

        await supabase
          .from('kds_tickets')
          .update({
            status: ticketStatus,
            items: updatedTicketItems,
            updated_at: nowIso,
          })
          .eq('id', targetTicket.id);

        // Broadcast update so all connected screens update in <50ms
        try {
          const { broadcastStateChange } = await import('../../../../lib/supabase');
          broadcastStateChange('KDS_ITEM_BUMPED', {
            ticketId: targetTicket.id,
            itemId,
            stage: nextStage,
          });
        } catch (bcErr) {
          console.warn('Broadcast error in bump-item:', bcErr);
        }
      }

      return NextResponse.json({
        success: true,
        itemId,
        previousStage: currentStage,
        stage: nextStage,
        ticketStatus,
      });
    } finally {
      releaseLock();
      if (inFlightBumpLocks.get(lockKey) === nextLock) {
        inFlightBumpLocks.delete(lockKey);
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
