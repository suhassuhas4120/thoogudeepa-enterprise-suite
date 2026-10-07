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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = body.itemId;
    const ticketId = body.ticketId;
    let targetStage = body.stage;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    if (targetStage === 'PREPARING') targetStage = 'PREP';
    if (targetStage === 'READY') targetStage = 'PLATED';

    const nowIso = new Date().toISOString();

    // 1. Fetch item from order_items
    const { data: item } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    // 2. Fetch ticket from kds_tickets
    let targetTicket: any = null;
    if (ticketId) {
      const { data: t } = await supabase
        .from('kds_tickets')
        .select('*')
        .eq('id', ticketId)
        .maybeSingle();
      if (t) targetTicket = t;
    }

    if (!targetTicket) {
      const { data: allActiveTickets } = await supabase
        .from('kds_tickets')
        .select('*')
        .neq('status', 'COMPLETED');
      targetTicket = (allActiveTickets || []).find((t: any) =>
        Array.isArray(t.items) && t.items.some((it: any) => it.id === itemId)
      );
    }

    if (!item && !targetTicket) {
      const { data: anyTicket } = await supabase
        .from('kds_tickets')
        .select('*');
      targetTicket = (anyTicket || []).find((t: any) =>
        Array.isArray(t.items) && t.items.some((it: any) => it.id === itemId)
      );
    }

    if (!item && !targetTicket) {
      return NextResponse.json({ error: `Item ${itemId} not found` }, { status: 404 });
    }

    const ticketItem = targetTicket?.items?.find((it: any) => it.id === itemId);
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
        .eq('id', itemId);
    } else if (targetTicket && ticketItem) {
      await supabase
        .from('order_items')
        .upsert({
          id: itemId,
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
        if (it.id === itemId) {
          return { ...it, stage: nextStage };
        }
        return it;
      });

      const allServed = updatedTicketItems.length > 0 && updatedTicketItems.every((it: any) => it.stage === 'SERVED');
      const allPlated = updatedTicketItems.length > 0 && updatedTicketItems.every((it: any) => it.stage === 'PLATED' || it.stage === 'SERVED');
      const anyActive = updatedTicketItems.some((it: any) => it.stage === 'PREP' || it.stage === 'PLATED' || it.stage === 'RECEIVED');

      if (allServed) {
        ticketStatus = 'COMPLETED';
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
    }

    const orderId = item?.order_id || targetTicket?.order_id;
    if (orderId) {
      const { data: siblingItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (siblingItems && siblingItems.length > 0) {
        const allServed = siblingItems.every((it) => it.stage === 'SERVED');
        const allPlated = siblingItems.every((it) => it.stage === 'PLATED' || it.stage === 'SERVED');
        const anyActive = siblingItems.some((it) => it.stage === 'PREP' || it.stage === 'PREPARING' || it.stage === 'RECEIVED' || it.stage === 'PLATED');

        const resolvedStatus = allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW';

        await supabase
          .from('kds_tickets')
          .update({
            status: resolvedStatus,
            items: siblingItems,
            updated_at: nowIso,
          })
          .eq('order_id', orderId);
      }
    }

    return NextResponse.json({
      success: true,
      itemId,
      previousStage: currentStage,
      stage: nextStage,
      ticketStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
