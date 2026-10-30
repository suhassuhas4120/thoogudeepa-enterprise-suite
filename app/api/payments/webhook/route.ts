import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, broadcastStateChange } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      '';

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature && !webhookSecret.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[Razorpay Webhook] Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    let eventPayload: any;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const eventType = eventPayload?.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventPayload?.payload?.payment?.entity;
      const orderEntity = eventPayload?.payload?.order?.entity;

      const rzPaymentId = paymentEntity?.id;
      const rzOrderId = paymentEntity?.order_id || orderEntity?.id;
      const notes = paymentEntity?.notes || orderEntity?.notes || {};

      let tableNumber = notes?.tableNumber;
      let seatNumber = notes?.seatNumber ? Number(notes.seatNumber) : undefined;
      const amountPaise = paymentEntity?.amount || orderEntity?.amount || 0;
      const amountRupees = amountPaise / 100;

      // 1. Check if there is an existing payment record matching this razorpay order
      let resolvedOrderId: string | null = null;

      if (rzOrderId) {
        const { data: matchedPayment } = await supabase
          .from('payments')
          .select('*')
          .eq('gateway_ref', rzOrderId)
          .maybeSingle();

        if (matchedPayment) {
          resolvedOrderId = matchedPayment.order_id;
          tableNumber = tableNumber || matchedPayment.table_number;
          seatNumber = seatNumber || matchedPayment.seat_number;

          if (matchedPayment.status === 'CONFIRMED') {
            // Already settled idempotently
            return NextResponse.json({ status: 'ok', message: 'Already settled' });
          }

          await supabase
            .from('payments')
            .update({
              status: 'CONFIRMED',
              bank_utr: rzPaymentId || `4281${Math.floor(10000000 + Math.random() * 90000000)}`,
              confirmed_at: new Date().toISOString(),
            })
            .eq('id', matchedPayment.id);
        }
      }

      // If not located via payment gateway_ref, lookup order directly
      if (!resolvedOrderId && tableNumber && seatNumber) {
        const { data: seatOrder } = await supabase
          .from('orders')
          .select('id, status, table_number, seat_number, total_amount')
          .eq('table_number', tableNumber)
          .eq('seat_number', seatNumber)
          .eq('status', 'UNPAID')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (seatOrder) {
          resolvedOrderId = seatOrder.id;
        }
      }

      const nowIso = new Date().toISOString();

      // 2. Mark all unpaid orders for this table/seat as PAID
      if (tableNumber && seatNumber) {
        await supabase
          .from('orders')
          .update({
            status: 'PAID',
            updated_at: nowIso,
          })
          .eq('table_number', tableNumber)
          .eq('seat_number', seatNumber)
          .eq('status', 'UNPAID');

        await supabase
          .from('order_items')
          .update({ stage: 'SERVED', updated_at: nowIso })
          .eq('table_number', tableNumber)
          .eq('seat_number', seatNumber);

        await supabase
          .from('kds_tickets')
          .update({ status: 'COMPLETED', updated_at: nowIso })
          .eq('table_number', tableNumber)
          .eq('seat_number', seatNumber);
      }

      if (resolvedOrderId) {
        await supabase
          .from('orders')
          .update({
            status: 'PAID',
            updated_at: nowIso,
          })
          .eq('id', resolvedOrderId);

        await supabase
          .from('order_items')
          .update({ stage: 'SERVED', updated_at: nowIso })
          .eq('order_id', resolvedOrderId);

        await supabase
          .from('kds_tickets')
          .update({ status: 'COMPLETED', updated_at: nowIso })
          .eq('order_id', resolvedOrderId);
      }

      // 3. Release table seat to VACANT
      if (tableNumber && seatNumber) {
        await supabase
          .from('table_seats')
          .update({
            status: 'VACANT',
            active_order_id: null,
            device_token: null,
            updated_at: nowIso,
          })
          .eq('table_number', tableNumber)
          .eq('seat_number', seatNumber);

        // Check if any seats remain occupied at this table
        const { data: remainingSeats } = await supabase
          .from('table_seats')
          .select('id')
          .eq('table_number', tableNumber)
          .eq('status', 'OCCUPIED');

        if (!remainingSeats || remainingSeats.length === 0) {
          await supabase
            .from('tables')
            .update({
              status: 'VACANT',
              current_bill: 0,
              guest_count: 0,
              kot_count: 0,
              updated_at: nowIso,
            })
            .eq('number', tableNumber);
        } else {
          const { data: remOrders } = await supabase
            .from('orders')
            .select('subtotal')
            .eq('table_number', tableNumber)
            .eq('status', 'UNPAID');
          const remBill = (remOrders || []).reduce((acc: number, o: any) => acc + Number(o.subtotal || 0), 0);
          await supabase
            .from('tables')
            .update({
              current_bill: remBill,
              updated_at: nowIso,
            })
            .eq('number', tableNumber);
        }
      }

        // 6. Auto-resolve lingering PAYMENT and BILL pings for this table/seat
        if (tableNumber) {
          try {
            await supabase
              .from('pings')
              .update({ status: 'RESOLVED' })
              .eq('table_number', tableNumber)
              .in('type', ['PAYMENT', 'BILL']);
          } catch (pingErr) {
            console.warn('[Razorpay Webhook] Ping auto-resolve fallback:', pingErr);
          }
        }

        // 7. Broadcast real-time update
        broadcastStateChange('paymentConfirmed', {
          orderId: resolvedOrderId,
          tableNumber,
          seatNumber,
          amount: amountRupees,
          source: 'RAZORPAY_WEBHOOK',
        });

        broadcastStateChange('paymentPingsResolved', {
          tableNumber,
          seatNumber,
        });
      }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
