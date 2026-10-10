'use client';

import React, { useState, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Download, Share2, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen9DigitalBill: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    payment,
    guestName,
    tableNumber,
    venueName,
    resetSession,
    seatNumber: contextSeatNumber,
  } = useCustomer();

  const [downloadMsg, setDownloadMsg] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);

  // Active items: prioritize settledItems from waiter or self payment, then cart
  const activeItems = useMemo(() => {
    if (payment.settledItems && payment.settledItems.length > 0) {
      return payment.settledItems.map((si) => ({
        cartItemId: si.id,
        menuItem: { name: si.name },
        quantity: si.quantity,
        totalPrice: si.totalPrice || si.price * si.quantity,
      }));
    }
    if (cart.length > 0) return cart;
    return [];
  }, [payment.settledItems, cart]);

  const subtotal = payment.subtotal > 0 ? payment.subtotal : activeItems.reduce((s, i) => s + i.totalPrice, 0);
  const totalTax = payment.tax > 0 ? payment.tax : Math.round(subtotal * 0.05);
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;
  const paidTotal = payment.totalAmount > 0 ? payment.totalAmount : subtotal + totalTax + payment.tipAmount;

  // Read seat from context with URL fallback
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const seatNumber = contextSeatNumber || parseInt(params.get('seat') || '1', 10);
  const invoiceNumber = payment.invoiceNumber || `INV-${tableNumber.replace('-', '')}-${Date.now().toString().slice(-4)}`;

  const handleDownload = () => {
    setDownloadMsg(true);
    setTimeout(() => setDownloadMsg(false), 2200);
  };

  const handleShareWhatsApp = () => {
    const itemLines = activeItems.map((it: any) => {
      const name = it.menuItem?.name || it.name || 'Dish';
      const qty = it.quantity || 1;
      const price = it.totalPrice || (it.price ? it.price * qty : 0);
      return `${qty}x ${name} — ₹${price}`;
    }).join('\n');

    const receiptText = [
      '🍗 THOOGUDEEPA DONNE BIRYANI MANE',
      'Authentic Military Style Restaurant',
      'Bengaluru, Karnataka',
      '────────────────────────────',
      `Invoice: ${invoiceNumber}`,
      `Table: ${tableNumber} (Seat C-${String(seatNumber).padStart(2, '0')})`,
      '────────────────────────────',
      itemLines || 'Food & Beverage Service',
      '────────────────────────────',
      `Subtotal:    ₹${subtotal}`,
      `GST (5%):    ₹${totalTax}`,
      `Total Paid:  ₹${paidTotal}`,
      `Payment Ref: ${payment.paymentMethod === 'CASH' ? 'CASH-SETTLED' : 'PAID-SETTLED'}`,
      '────────────────────────────',
      'Thank you! Visit again.',
      typeof window !== 'undefined' ? window.location.origin : 'https://thoogudeepa-enterprise-suite.vercel.app',
    ].join('\n');

    const waUrl = `https://wa.me/?text=${encodeURIComponent(receiptText)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
    setShareMsg(true);
    setTimeout(() => setShareMsg(false), 2200);
  };

  const handleDineAgain = () => {
    resetSession();
    setCurrentScreen(1);
  };

  return (
    <ScreenHousing screenNumber={9} screenTitle="Bill Page">
      {/* Header */}
      <WireHeader
        title="Detailed Bill & Invoice"
        showBack={true}
        onBack={() => setCurrentScreen(8)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Tax Invoice Receipt Card */}
        <div className="relative rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-5 shadow-xs space-y-3">
          <div className="text-center pb-3 border-b border-dashed border-[#E8D5C3]">
            <h3 className="text-sm font-black text-[#5B5049] tracking-wide uppercase">
              {venueName}
            </h3>
            <p className="font-mono text-[10px] font-semibold text-[#5B5049]/70 mt-0.5">
              GSTIN: 29AABCT1332L1Z9 • FSSAI: 11223334000182
            </p>
            <div className="mt-1 font-mono text-[10px] font-bold text-[#8A4228]">
              TAX INVOICE #{invoiceNumber}
            </div>
            <div className="text-[10px] text-[#5B5049]/60 font-mono mt-0.5">
              Table: {tableNumber} • Seat: {seatNumber} • Guest: {guestName || 'Diner'}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-1.5 border-b border-dashed border-[#E8D5C3] pb-3 text-xs">
            {activeItems.map((ci) => (
              <div key={ci.cartItemId} className="flex justify-between items-center text-[#5B5049]">
                <span className="font-semibold">
                  {ci.menuItem.name} × {ci.quantity}
                </span>
                <span className="font-mono font-bold">₹{ci.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Tax Computation Breakdown */}
          <div className="space-y-1.5 border-b border-[#E8D5C3] pb-3 text-xs font-mono">
            <div className="flex justify-between text-[#5B5049]/80 font-sans">
              <span>Item Subtotal</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-[#5B5049]/70">
              <span>CGST (2.5%)</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-[#5B5049]/70">
              <span>SGST (2.5%)</span>
              <span>₹{sgst}</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-bold text-[#8A4228]">
                <span className="font-sans">Staff Tip</span>
                <span>+₹{payment.tipAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[#E8D5C3] pt-2 text-sm font-black text-[#5B5049]">
              <span className="font-sans">Grand Total Paid</span>
              <span className="font-mono text-base font-black text-[#8A4228]">₹{paidTotal}</span>
            </div>
          </div>

          {/* Settlement Proof */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-800 font-bold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Paid via {payment.paymentMethod || 'UPI'}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700">STATUS: SETTLED</span>
          </div>
        </div>

        {/* Action Buttons: Download PDF & WhatsApp */}
        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] py-3 text-xs font-black text-[#5B5049] hover:bg-[#F3DFCC]/40 transition shadow-xs"
          >
            <Download className="h-4 w-4 text-[#8A4228]" />
            <span>{downloadMsg ? 'PDF Invoice Downloaded!' : 'Download PDF Bill'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShareWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 py-3 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
          >
            <Share2 className="h-4 w-4 text-emerald-700" />
            <span>{shareMsg ? 'Bill Sent via WhatsApp!' : 'Share Bill via WhatsApp'}</span>
          </motion.button>
        </div>
      </div>

      {/* Sticky Bottom Bar: Dine Again */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDineAgain}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start New Order / Dine Again</span>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
