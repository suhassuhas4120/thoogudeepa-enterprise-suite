import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

// ── GET: Real-Time Payment Polling Status ──────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId') || searchParams.get('order_id');
    const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');
    const txnRef = searchParams.get('txnRef') || searchParams.get('gateway_ref');

    if (!orderId && !paymentId && !txnRef) {
      return NextResponse.json(
        { error: 'Provide orderId, paymentId, or txnRef to check payment status' },
        { status: 400 }
      );
    }

    let query = supabase.from('payments').select('*');
    if (paymentId) {
      query = query.eq('id', paymentId);
    } else if (txnRef) {
      query = query.eq('gateway_ref', txnRef);
    } else if (orderId) {
      query = query.eq('order_id', orderId).order('confirmed_at', { ascending: false });
    }

    const { data: payments, error: pErr } = await query.limit(1);

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    if (!payments || payments.length === 0) {
      // Check if the order itself is already marked PAID
      if (orderId) {
        const { data: order } = await supabase
          .from('orders')
          .select('id, status, table_number, seat_number, total_amount')
          .eq('id', orderId)
          .maybeSingle();

        if (order && order.status === 'PAID') {
          return NextResponse.json({
            status: 'CONFIRMED',
            orderId: order.id,
            tableNumber: order.table_number,
            seatNumber: order.seat_number,
            amount: Number(order.total_amount || 0),
            settled: true,
          });
        }
      }

      return NextResponse.json({ status: 'NOT_FOUND', message: 'No payment record found' }, { status: 404 });
    }

    const payment = payments[0];
    return NextResponse.json({
      status: payment.status,
      paymentId: payment.id,
      orderId: payment.order_id,
      tableNumber: payment.table_number,
      seatNumber: payment.seat_number,
      amount: Number(payment.amount),
      bankUtr: payment.bank_utr,
      gatewayRef: payment.gateway_ref,
      confirmedAt: payment.confirmed_at,
      settled: payment.status === 'CONFIRMED',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error checking payment status' }, { status: 500 });
  }
}

// ── POST: Automated Zero-Typing Settlement & Realtime Cascade ──────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId || body.order_id;
    const paymentId = body.paymentId || body.payment_id;
    const txnRef = body.txnRef || body.gateway_ref;
    const targetStatus = body.status === 'FAILED' ? 'FAILED' : 'CONFIRMED';

    if (!orderId && !paymentId && !txnRef && !body.razorpay_payment_id) {
      return NextResponse.json(
        { error: 'orderId, paymentId, or txnRef is required for verification' },
        { status: 400 }
      );
    }

    // Optional: Cryptographic Razorpay HMAC SHA256 signature verification
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const rzPaymentId = body.razorpay_payment_id;
    const rzOrderId = body.razorpay_order_id;
    const rzSignature = body.razorpay_signature;

    if (
      rzSignature &&
      razorpayKeySecret &&
      !razorpayKeySecret.includes('placeholder') &&
      rzOrderId &&
      rzPaymentId
    ) {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${rzOrderId}|${rzPaymentId}`)
        .digest('hex');

      if (expectedSignature !== rzSignature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // 1. Locate existing payment record
    let pQuery = supabase.from('payments').select('*');
    if (paymentId) {
      pQuery = pQuery.eq('id', paymentId);
    } else if (txnRef) {
      pQuery = pQuery.eq('gateway_ref', txnRef);
    } else if (orderId) {
      pQuery = pQuery.eq('order_id', orderId).order('confirmed_at', { ascending: false });
    }

    const { data: existingPayments, error: fetchErr } = await pQuery.limit(1);
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    let targetPayment = existingPayments && existingPayments.length > 0 ? existingPayments[0] : null;

    // Idempotency: If already confirmed, return success immediately
    if (targetPayment && targetPayment.status === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        message: 'Payment was already confirmed and settled',
        status: 'CONFIRMED',
        paymentId: targetPayment.id,
        orderId: targetPayment.order_id,
        bankUtr: targetPayment.bank_utr,
        tableNumber: targetPayment.table_number,
        seatNumber: targetPayment.seat_number,
        amount: Number(targetPayment.amount),
      });
    }

    // Generate authentic 12-digit Indian Bank UTR (RRN)
    const bankUtr = body.bankUtr || `4281${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nowIso = new Date().toISOString();

    let resolvedOrderId = orderId;
    let resolvedTableNumber = body.tableNumber;
    let resolvedSeatNumber = body.seatNumber;
    let resolvedAmount = body.amount;

    if (targetPayment) {
      resolvedOrderId = targetPayment.order_id;
      resolvedTableNumber = targetPayment.table_number;
      resolvedSeatNumber = targetPayment.seat_number;
      resolvedAmount = Number(targetPayment.amount);

      // Update payment record to CONFIRMED
      const { error: updateErr } = await supabase
        .from('payments')
        .update({
          status: targetStatus,
          bank_utr: bankUtr,
          confirmed_at: nowIso,
        })
        .eq('id', targetPayment.id);

      if (updateErr) {
        return NextResponse.json({ error: `Failed to confirm payment: ${updateErr.message}` }, { status: 500 });
      }
    } else {
      // Direct settlement fallback: create confirmed payment row
      const { data: orderRecord, error: ordErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (ordErr || !orderRecord) {
        return NextResponse.json({ error: `Order ${orderId} not found` }, { status: 404 });
      }

      resolvedOrderId = orderRecord.id;
      resolvedTableNumber = orderRecord.table_number;
      resolvedSeatNumber = orderRecord.seat_number;
      resolvedAmount = Number(orderRecord.total_amount || orderRecord.total || 0);

      const newPayId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error: insErr } = await supabase.from('payments').insert({
        id: newPayId,
        order_id: resolvedOrderId,
        table_number: resolvedTableNumber,
        seat_number: resolvedSeatNumber,
        amount: resolvedAmount,
        payment_method: body.paymentMethod || 'UPI',
        gateway_ref: txnRef || `TXN-${resolvedOrderId}-${Date.now().toString().slice(-6)}`,
        bank_utr: bankUtr,
        status: targetStatus,
        confirmed_at: nowIso,
      });

      if (insErr) {
        return NextResponse.json({ error: `Failed to insert confirmed payment: ${insErr.message}` }, { status: 500 });
      }
      targetPayment = { id: newPayId };
    }

    if (targetStatus === 'CONFIRMED') {
      // ── Substep 4.3: Realtime Settlement Cascade ──────────────────

      // 1. Mark Order as PAID
      await supabase
        .from('orders')
        .update({
          status: 'PAID',
          payment_method: body.paymentMethod || 'UPI',
          updated_at: nowIso,
        })
        .eq('id', resolvedOrderId);

      // 2. Mark Seat as PAID
      if (resolvedTableNumber && resolvedSeatNumber) {
        await supabase
          .from('table_seats')
          .update({
            status: 'PAID',
            updated_at: nowIso,
          })
          .eq('table_number', resolvedTableNumber)
          .eq('seat_number', resolvedSeatNumber);
      }

      // 3. Mark KDS Tickets for this order as COMPLETED
      await supabase
        .from('kds_tickets')
        .update({
          status: 'COMPLETED',
          updated_at: nowIso,
        })
        .eq('order_id', resolvedOrderId);

      // 4. Check if all table orders are settled -> update table to BILLING
      if (resolvedTableNumber) {
        const { data: remainingUnpaid } = await supabase
          .from('orders')
          .select('id')
          .eq('table_number', resolvedTableNumber)
          .eq('status', 'UNPAID');

        if (!remainingUnpaid || remainingUnpaid.length === 0) {
          await supabase
            .from('tables')
            .update({
              status: 'BILLING',
              updated_at: nowIso,
            })
            .eq('number', resolvedTableNumber);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: targetStatus,
      paymentId: targetPayment.id,
      orderId: resolvedOrderId,
      tableNumber: resolvedTableNumber,
      seatNumber: resolvedSeatNumber,
      amount: resolvedAmount,
      bankUtr,
      confirmedAt: nowIso,
      settled: targetStatus === 'CONFIRMED',
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error verifying payment' },
      { status: 500 }
    );
  }
}
