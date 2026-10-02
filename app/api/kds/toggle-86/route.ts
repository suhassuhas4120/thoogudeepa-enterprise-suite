import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = body.itemId || body.id;
    const is86Param = body.is86;
    const prepDelayMinutes = body.prepDelayMinutes !== undefined ? Number(body.prepDelayMinutes) : undefined;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    // 1. Fetch current item state from menu_86
    const { data: item, error: itemErr } = await supabase
      .from('menu_86')
      .select('*')
      .or(`id.eq.${itemId},name.ilike.%${itemId}%`)
      .limit(1)
      .maybeSingle();

    if (itemErr || !item) {
      return NextResponse.json({ error: `Item ${itemId} not found in catalog` }, { status: 404 });
    }

    const nextIs86 = typeof is86Param === 'boolean' ? is86Param : !item.is_86;
    const nextPrepDelay = prepDelayMinutes !== undefined ? prepDelayMinutes : item.prep_delay_minutes;

    // 2. Update menu_86 record
    const { error: updateErr } = await supabase
      .from('menu_86')
      .update({
        is_86: nextIs86,
        prep_delay_minutes: nextPrepDelay,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (updateErr) {
      return NextResponse.json({ error: `Failed to update inventory status: ${updateErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        is86: nextIs86,
        prepDelayMinutes: nextPrepDelay,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
