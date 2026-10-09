import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.orderId || body.order_id;
    const phone = (body.phone || body.phoneNumber || '').replace(/[^0-9]/g, '');
    const email = body.email || null;
    const tableNumber = (body.tableNumber || body.table || '').toUpperCase();
    const invoiceNumber = body.invoiceNumber || `INV-${tableNumber || 'TBL'}-${Date.now().toString().slice(-4)}`;
    const bankUtr = body.bankUtr || body.utr || 'UPI-SETTLED';

    let items = body.items || [];
    let subtotal = Number(body.subtotal || 0);
    let tax = Number(body.tax || 0);
    let total = Number(body.total || body.totalAmount || 0);

    // If orderId is provided, pull canonical order details from Supabase if items missing
    if (orderId && (!items.length || total === 0)) {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderData) {
        items = Array.isArray(orderData.items) ? orderData.items : [];
        subtotal = Number(orderData.subtotal || 0);
        tax = Number(orderData.tax || 0);
        total = Number(orderData.total || orderData.total_amount || 0);
      }
    }

    // Fallback: look up recent ticket items for this table if items are empty
    if ((!items.length || total === 0) && tableNumber) {
      const cleanNum = tableNumber.replace(/^(TABLE\s*|T-?)/i, '').trim();
      const numInt = parseInt(cleanNum, 10);
      const padNum = !isNaN(numInt) ? String(numInt).padStart(2, '0') : cleanNum;
      const rawNum = !isNaN(numInt) ? String(numInt) : cleanNum;
      const { data: ticketData } = await supabase
        .from('kds_tickets')
        .select('*')
        .or(`table_number.eq.${tableNumber},table_number.eq.T-${padNum},table_number.eq.T-${rawNum},table_number.eq.TABLE ${rawNum},table_number.eq.TABLE ${padNum}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ticketData && Array.isArray(ticketData.items) && ticketData.items.length > 0) {
        items = ticketData.items;
      }
    }

    if (!total && items.length) {
      subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.price || it.unitPrice || 0) * (it.quantity || 1)), 0);
      tax = Math.round(subtotal * 0.05);
      total = subtotal + tax;
    }

    if (total > 0 && subtotal === 0) {
      subtotal = Math.round(total / 1.05);
      tax = total - subtotal;
    }

    // Format item lines for receipt
    const itemLines = items.map((it: any) => {
      const qty = it.quantity || 1;
      const price = Number(it.price || it.unitPrice || 0) * qty;
      return `${qty}x ${it.name} — ₹${price}`;
    }).join('\n');

    const formattedDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Authentic receipt template
    const receiptText = [
      '🍗 THOOGUDEEPA DONNE BIRYANI MANE',
      'Authentic Military Style Restaurant',
      'Bengaluru, Karnataka',
      '────────────────────────────',
      `Invoice: ${invoiceNumber}`,
      `Table: ${tableNumber || 'Dine-In'} | Date: ${formattedDate}`,
      '────────────────────────────',
      itemLines || 'Food & Beverage Service',
      '────────────────────────────',
      `Subtotal:    ₹${subtotal}`,
      `GST (5%):    ₹${tax}`,
      `Total Paid:  ₹${total}`,
      `Payment Ref: ${bankUtr}`,
      '────────────────────────────',
      'Thank you! Visit again.',
      'https://thoogudeepa-enterprise-suite.vercel.app',
    ].join('\n');

    // Clean Indian 10-digit or international phone format
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const whatsappWebLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(receiptText)}`;

    const deliveryStatus = {
      whatsapp: false,
      email: false,
      whatsappWebLink,
    };

    // 1. WhatsApp Cloud API Dispatch (if Meta credentials present)
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappToken && whatsappPhoneId && !whatsappToken.includes('placeholder') && formattedPhone) {
      try {
        const waRes = await fetch(`https://graph.facebook.com/v21.0/${whatsappPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: { body: receiptText },
          }),
        });
        if (waRes.ok) {
          deliveryStatus.whatsapp = true;
        }
      } catch (waErr) {
        console.warn('[Receipt] WhatsApp API dispatch fallback:', waErr);
      }
    }

    // 2. Resend Email Dispatch (if Resend credentials present)
    const resendApiKey = process.env.RESEND_API_KEY;
    const receiptFrom = process.env.RECEIPT_FROM_EMAIL || 'receipts@thoogudeepa.in';

    if (resendApiKey && !resendApiKey.includes('placeholder') && email) {
      try {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #EAE5DF; border-radius: 16px; background-color: #FAF8F5;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #9C3D1E; margin: 0; font-size: 22px; text-transform: uppercase;">Thoogudeepa Donne Biryani Mane</h1>
              <p style="color: #78716C; margin: 4px 0 0; font-size: 13px;">Official Tax Invoice</p>
            </div>
            <div style="background-color: #FFFFFF; padding: 18px; border-radius: 12px; border: 1px solid #EAE5DF; margin-bottom: 16px;">
              <p style="margin: 0 0 6px; font-size: 14px;"><strong>Invoice:</strong> ${invoiceNumber}</p>
              <p style="margin: 0 0 6px; font-size: 14px;"><strong>Table:</strong> ${tableNumber}</p>
              <p style="margin: 0; font-size: 13px; color: #78716C;"><strong>Date:</strong> ${formattedDate}</p>
            </div>
            <div style="background-color: #FFFFFF; padding: 18px; border-radius: 12px; border: 1px solid #EAE5DF;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; color: #44403C; border-bottom: 1px solid #F5F5F4; padding-bottom: 8px;">Order Breakdown</h3>
              <pre style="font-family: monospace; font-size: 13px; color: #292524; white-space: pre-wrap; margin: 0 0 12px;">${itemLines}</pre>
              <div style="border-top: 1px dashed #D6D3D1; padding-top: 12px; font-size: 14px;">
                <p style="display: flex; justify-content: space-between; margin: 4px 0;"><span>Subtotal:</span> <strong>₹${subtotal}</strong></p>
                <p style="display: flex; justify-content: space-between; margin: 4px 0;"><span>GST (5%):</span> <strong>₹${tax}</strong></p>
                <p style="display: flex; justify-content: space-between; margin: 8px 0 0; font-size: 16px; color: #9C3D1E; border-top: 1px solid #EAE5DF; padding-top: 8px;"><span>Total Paid:</span> <strong>₹${total}</strong></p>
                <p style="margin: 8px 0 0; font-size: 11px; color: #78716C;">Payment Ref: ${bankUtr}</p>
              </div>
            </div>
            <p style="text-align: center; color: #78716C; font-size: 12px; margin-top: 20px;">Thank you for dining with us! Thoogudeepa Donne Biryani Mane</p>
          </div>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: receiptFrom,
            to: [email],
            subject: `Receipt: ${invoiceNumber} — Thoogudeepa Donne Biryani Mane`,
            html: emailHtml,
          }),
        });

        if (resendRes.ok) {
          deliveryStatus.email = true;
        }
      } catch (emailErr) {
        console.warn('[Receipt] Resend email dispatch fallback:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      tableNumber,
      total,
      receiptText,
      deliveryStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error generating receipt' }, { status: 500 });
  }
}
