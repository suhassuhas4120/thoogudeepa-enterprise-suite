import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId || body.order_id;
    const requestedAmount = body.amount !== undefined ? Number(body.amount) : null;
    const paymentMethod = body.paymentMethod || 'UPI';

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 1. Fetch order details from Supabase
    const { data: orderRecord, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !orderRecord) {
      return NextResponse.json({ error: `Order ${orderId} not found` }, { status: 404 });
    }

    // Double payment prevention: check if already paid
    if (orderRecord.status === 'PAID') {
      return NextResponse.json(
        { error: 'Order is already settled and paid', status: 'PAID', orderId },
        { status: 400 }
      );
    }

    const tableNumber = body.tableNumber || orderRecord.table_number;
    const seatNumber = Number(body.seatNumber ?? orderRecord.seat_number ?? 1);
    const amount = requestedAmount !== null && requestedAmount > 0
      ? requestedAmount
      : Number(orderRecord.total_amount || orderRecord.total || 0);

    if (amount <= 0) {
      return NextResponse.json({ error: 'Order total amount must be greater than 0' }, { status: 400 });
    }

    // 2. Generate unique Transaction Reference & Payment Record ID
    const timestamp = Date.now();
    const txnRef = `TXN-${orderId}-${timestamp.toString().slice(-6)}`;
    const paymentId = `PAY-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Build NPCI Compliant Standard UPI URL
    const merchantVpa = process.env.NEXT_PUBLIC_MERCHANT_UPI_VPA || 'thoogudeepa@okicici';
    const merchantName = 'Thoogudeepa Donne Biryani';
    const transactionNote = `Table ${tableNumber} Seat ${seatNumber} Bill`;
    const formattedAmount = amount.toFixed(2);

    const upiQuery = new URLSearchParams({
      pa: merchantVpa,
      pn: merchantName,
      am: formattedAmount,
      cu: 'INR',
      tn: transactionNote,
      tr: txnRef,
    });

    const upiUri = `upi://pay?${upiQuery.toString()}`;

    // App Intent Deep Links
    const appIntents = {
      generic: upiUri,
      gpay: `tez://upi/pay?${upiQuery.toString()}`,
      phonepe: `phonepe://pay?${upiQuery.toString()}`,
      paytm: `paytmmp://pay?${upiQuery.toString()}`,
      cred: `credpay://upi/pay?${upiQuery.toString()}`,
      bhim: `bhim://pay?${upiQuery.toString()}`,
    };

    // 4. Generate Dynamic QR Code (base64 Data URL) with Fallback URL
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(upiUri, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#0F3A22', // Brand forest green
          light: '#FFFFFF',
        },
      });
    } catch (qrErr) {
      console.warn('QR Code generation fallback:', qrErr);
    }

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      upiUri
    )}&color=0F3A22`;

    // 5. Insert or update pending payment record in Supabase
    const { error: insertErr } = await supabase.from('payments').insert({
      id: paymentId,
      order_id: orderId,
      table_number: tableNumber,
      seat_number: seatNumber,
      amount,
      payment_method: paymentMethod,
      gateway_ref: txnRef,
      bank_utr: null,
      status: 'PENDING',
    });

    if (insertErr) {
      console.error('Failed to create pending payment record:', insertErr);
      return NextResponse.json(
        { error: `Database error creating payment: ${insertErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId,
      txnRef,
      orderId,
      tableNumber,
      seatNumber,
      amount,
      merchantVpa,
      merchantName,
      upiUri,
      qrDataUrl: qrDataUrl || qrImageUrl,
      qrImageUrl,
      appIntents,
      status: 'PENDING',
    });
  } catch (err: any) {
    console.error('Payment initiation error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error initiating payment' },
      { status: 500 }
    );
  }
}
