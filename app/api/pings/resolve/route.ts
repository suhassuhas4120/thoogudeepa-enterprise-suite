import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pingId = body.pingId;

    if (!pingId) {
      return NextResponse.json({ error: 'pingId is required' }, { status: 400 });
    }

    const { error: updateErr } = await supabase
      .from('pings')
      .update({
        status: 'RESOLVED',
      })
      .eq('id', pingId);

    if (updateErr) {
      return NextResponse.json({ error: `Failed to resolve ping: ${updateErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pingId,
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
