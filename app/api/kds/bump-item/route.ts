import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

const STAGE_TRANSITION: Record<string, 'PLACED' | 'PREP' | 'PLATED' | 'SERVED'> = {
  PLACED: 'PREP',
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
    const targetStage = body.stage;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    // 1. Fetch current item
    const { data: item, error: itemErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (itemErr || !item) {
      return NextResponse.json({ error: `Item ${itemId} not found` }, { status: 404 });
    }

    const currentStage = item.stage || 'PLACED';
    const nextStage = targetStage || STAGE_TRANSITION[currentStage] || 'PREP';

    // 2. Update item stage
    const { error: updateErr } = await supabase
      .from('order_items')
      .update({
        stage: nextStage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    if (updateErr) {
      return NextResponse.json({ error: `Failed to update stage: ${updateErr.message}` }, { status: 500 });
    }

    // 3. Check sibling items for ticket status synchronization
    let ticketStatus = 'NEW';
    const orderId = item.order_id;

    if (orderId) {
      const { data: siblingItems } = await supabase
        .from('order_items')
        .select('stage')
        .eq('order_id', orderId);

      if (siblingItems && siblingItems.length > 0) {
        const allServed = siblingItems.every((it) => it.stage === 'SERVED');
        const allPlated = siblingItems.every((it) => it.stage === 'PLATED' || it.stage === 'SERVED');
        const anyPrep = siblingItems.some((it) => it.stage === 'PREP' || it.stage === 'PREPARING');

        if (allServed) {
          ticketStatus = 'COMPLETED';
        } else if (allPlated) {
          ticketStatus = 'READY';
        } else if (anyPrep) {
          ticketStatus = 'PREP';
        } else {
          ticketStatus = 'NEW';
        }

        // Update corresponding KDS ticket(s)
        await supabase
          .from('kds_tickets')
          .update({
            status: ticketStatus,
            updated_at: new Date().toISOString(),
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
