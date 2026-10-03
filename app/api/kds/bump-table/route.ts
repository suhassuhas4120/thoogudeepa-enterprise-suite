import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

const TICKET_TRANSITION: Record<string, { ticket: 'PREP' | 'READY' | 'COMPLETED'; item: 'PREP' | 'PLATED' | 'SERVED' }> = {
  NEW: { ticket: 'PREP', item: 'PREP' },
  PREP: { ticket: 'READY', item: 'PLATED' },
  READY: { ticket: 'COMPLETED', item: 'SERVED' },
  COMPLETED: { ticket: 'COMPLETED', item: 'SERVED' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticketId = body.ticketId;
    const targetStatus = body.status;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    // 1. Fetch ticket
    const { data: ticket, error: tErr } = await supabase
      .from('kds_tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (tErr || !ticket) {
      return NextResponse.json({ error: `Ticket ${ticketId} not found` }, { status: 404 });
    }

    const currentStatus = ticket.status || 'NEW';
    const transition = TICKET_TRANSITION[currentStatus] || { ticket: 'PREP', item: 'PREP' };
    const nextStatus = targetStatus || transition.ticket;
    const nextItemStage =
      targetStatus === 'READY'
        ? 'PLATED'
        : targetStatus === 'COMPLETED'
        ? 'SERVED'
        : targetStatus === 'PREP'
        ? 'PREP'
        : transition.item;

    // 2. Update ticket status
    await supabase
      .from('kds_tickets')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    // 3. Update all associated line items
    let updatedItemCount = 0;
    if (ticket.order_id) {
      const { data: updatedItems, error: itemsErr } = await supabase
        .from('order_items')
        .update({
          stage: nextItemStage,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', ticket.order_id)
        .select('id');

      if (!itemsErr && updatedItems) {
        updatedItemCount = updatedItems.length;
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      previousStatus: currentStatus,
      status: nextStatus,
      itemStage: nextItemStage,
      updatedItemCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
