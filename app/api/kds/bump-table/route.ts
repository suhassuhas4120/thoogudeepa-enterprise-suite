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

    const rawTable = body.tableNumber ? String(body.tableNumber).trim() : '';
    const cleanNum = rawTable.replace(/^(TABLE\s*|T-?)/i, '').trim();
    const normTable = cleanNum ? `T-${String(parseInt(cleanNum, 10) || cleanNum).padStart(2, '0')}` : '';

    // 1. Fetch ticket
    let { data: ticket, error: tErr } = await supabase
      .from('kds_tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (!ticket && normTable) {
      const { data: tblTickets } = await supabase
        .from('kds_tickets')
        .select('*')
        .or(`table_number.eq.${normTable},table_number.eq.${rawTable}`)
        .order('created_at', { ascending: false });
      if (tblTickets && tblTickets.length > 0) {
        ticket = tblTickets.find((t: any) => t.status !== 'COMPLETED') || tblTickets[0];
      }
    }

    const currentStatus = ticket?.status || 'NEW';
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

    if (!ticket) {
      return NextResponse.json(
        { error: `Ticket ${ticketId} not found in database`, ticketId },
        { status: 404 }
      );
    }

    const updatedTicketItems = (ticket.items || []).map((it: any) => ({
      ...it,
      stage: it.stage === 'SERVED' ? 'SERVED' : nextItemStage,
    }));

    // 2. Update ticket status & items
    await supabase
      .from('kds_tickets')
      .update({
        status: nextStatus,
        items: updatedTicketItems,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticket.id || ticketId);

    // 3. Update all associated line items in order_items table (preserving SERVED)
    let updatedItemCount = updatedTicketItems.length;
    const nowIso = new Date().toISOString();
    if (ticket.order_id) {
      const { data: updatedItems } = await supabase
        .from('order_items')
        .update({
          stage: nextItemStage,
          updated_at: nowIso,
        })
        .eq('order_id', ticket.order_id)
        .neq('stage', 'SERVED')
        .select('*');

      if (updatedItems && updatedItems.length > 0) {
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
