'use client';

import React, { useState, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Download, Share2, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadPdfBill } from '../../lib/generatePdfBill';

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

  const { formattedDate, formattedTime } = useMemo(() => {
    const d = new Date();
    return {
      formattedDate: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      formattedTime: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  }, []);

  const effectiveTip =
    payment.tipAmount > 0
      ? payment.tipAmount
      : Math.max(0, paidTotal - (subtotal + totalTax - (payment.discount || 0)));

  const handleDownload = () => {
    downloadPdfBill({
      invoiceNumber,
      tableNumber,
      seatNumber,
      formattedDate,
      formattedTime,
      items: activeItems.map((it: any) => ({
        name: it.menuItem?.name || it.name || 'Dish',
        quantity: it.quantity || 1,
        price: Math.round(it.totalPrice || (it.price && it.quantity ? it.price * it.quantity : it.price) || 0),
      })),
      subtotal,
      cgst,
      sgst,
      totalTax,
      discount: payment.discount || 0,
      tipAmount: effectiveTip,
      paidAmount: paidTotal,
      paymentMethod: payment.paymentMethod || 'UPI',
      bankUtr: payment.paymentMethod === 'CASH' ? 'CASH-SETTLED' : 'PAID-SETTLED',
      captainName: 'Floor Captain',
    });
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

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Tax Invoice Receipt Card */}
        <div className="relative rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-3.5">
          <div className="text-center pb-3 border-b border-dashed border-white/10">
            <h3 className="text-sm font-bold text-amber-100 tracking-wide uppercase font-serif-luxury">
              {venueName}
            </h3>
            <p className="font-mono text-[10px] font-semibold text-stone-400 mt-0.5">
              GSTIN: 29AABCT1332L1Z9 &bull; FSSAI: 11223334000182
            </p>
            <div className="mt-1 font-mono text-[10px] font-bold text-amber-300">
              TAX INVOICE #{invoiceNumber}
            </div>
            <div className="text-[10px] text-stone-400 font-mono mt-0.5">
              Table: {tableNumber} &bull; Seat: {seatNumber} &bull; Guest: {guestName || 'Diner'}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 border-b border-dashed border-white/10 pb-3 text-xs">
            {activeItems.map((ci) => (
              <div key={ci.cartItemId} className="flex justify-between items-center text-stone-200">
                <span className="font-serif-luxury text-sm font-medium">
                  {ci.menuItem.name} &times; {ci.quantity}
                </span>
                <span className="font-mono font-bold text-amber-300">₹{ci.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Tax Computation Breakdown */}
          <div className="space-y-1.5 border-b border-white/10 pb-3 text-xs font-mono text-stone-300">
            <div className="flex justify-between font-sans">
              <span>Item Subtotal</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>CGST (2.5%)</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>SGST (2.5%)</span>
              <span>₹{sgst}</span>
            </div>
            {effectiveTip > 0 && (
              <div className="flex justify-between font-bold text-amber-400 font-sans">
                <span>Waiter Tip</span>
                <span className="font-mono">+₹{effectiveTip}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm font-bold text-amber-100 font-serif-luxury">
              <span>Grand Total Paid</span>
              <span className="font-mono text-base font-extrabold text-amber-300">₹{paidTotal}</span>
            </div>
          </div>

          {/* Settlement Proof */}
          <div className="flex items-center justify-between rounded-2xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-[11px] text-emerald-300 font-bold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Paid via {payment.paymentMethod || 'UPI'}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">STATUS: SETTLED</span>
          </div>
        </div>

        {/* Action Buttons: Download PDF & WhatsApp */}
        <div className="space-y-2.5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-black/40 py-3.5 text-xs font-bold text-amber-200 hover:bg-black/60 transition shadow-sm font-serif-luxury backdrop-blur-md cursor-pointer"
          >
            <Download className="h-4 w-4 text-amber-400" />
            <span>{downloadMsg ? 'PDF Invoice Downloaded!' : 'Download PDF Bill'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShareWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/50 py-3.5 text-xs font-bold text-emerald-200 hover:bg-emerald-950/80 transition shadow-sm font-serif-luxury backdrop-blur-md cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-emerald-400" />
            <span>{shareMsg ? 'Bill Sent via WhatsApp!' : 'Share Bill via WhatsApp'}</span>
          </motion.button>
        </div>
      </div>

      {/* Sticky Bottom Bar: Dine Again */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDineAgain}
          className="flex w-full items-center justify-center gap-2 rounded-[22px] px-6 py-4 shadow-[0_12px_32px_rgba(217,119,6,0.45)] transition hover:brightness-105 border border-amber-300/60 font-serif-luxury text-base font-bold tracking-wide text-amber-950"
          style={{
            background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
          }}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start New Order / Dine Again</span>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
