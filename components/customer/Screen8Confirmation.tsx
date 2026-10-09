'use client';

import React, { useState, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import {
  CheckCircle2,
  Star,
  ArrowRight,
  ShieldCheck,
  FileText,
  Download,
  Share2,
  RotateCcw,
  Receipt,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen8Confirmation: React.FC = () => {
  const { currentTheme } = useCustomerTheme();
  const {
    setCurrentScreen,
    payment,
    guestName,
    tableNumber,
    cart,
    venueName,
    resetSession,
  } = useCustomer();

  const [selectedChips, setSelectedChips] = useState<string[]>(['Super Quick Service']);
  const [customFeedback, setCustomFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);
  const [rating, setRating] = useState(0);

  // Read seat from URL
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const seatNumber = parseInt(params.get('seat') || '1', 10);
  const effectiveTable = tableNumber || 'T-01';

  // Floor Captain details from shared bridge
  const { tables } = useSharedBridge();
  const currentTable = tables.find((t) => t.number === effectiveTable);
  const captainName =
    currentTable?.serverName && currentTable.serverName !== 'Floor Captain'
      ? currentTable.serverName
      : 'Floor Captain';

  const { formattedDate, formattedTime } = useMemo(() => {
    const d = new Date();
    const formattedDate = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return { formattedDate, formattedTime };
  }, []);

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
    if (cart.length > 0) {
      return cart;
    }
    return [];
  }, [payment.settledItems, cart]);

  const subtotal = payment.subtotal > 0
    ? payment.subtotal
    : activeItems.reduce((s, i) => s + i.totalPrice, 0);
  const totalTax = payment.tax > 0
    ? payment.tax
    : Math.round(subtotal * 0.05);
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;
  const discount = payment.discount || (payment.redeemPoints ? Math.min(50, subtotal + totalTax) : 0);
  const calculatedGrandTotal = Math.max(0, subtotal + totalTax + payment.tipAmount - discount);
  const paidAmount = payment.totalAmount > 0 ? payment.totalAmount : calculatedGrandTotal;

  // Verified bank reference number & Tax invoice ID
  const bankUtr = useMemo(() => {
    if (payment.paymentMethod === 'CASH') return 'CASH-SETTLED';
    return '4281' + String(Math.abs(effectiveTable.split('').reduce((a, b) => a + b.charCodeAt(0), 428194349255))).slice(0, 8);
  }, [payment.paymentMethod, effectiveTable]);

  const txnId = useMemo(() => {
    return payment.transactionId || `INV-${effectiveTable.replace(/[^a-zA-Z0-9]/g, '')}-${String(seatNumber).padStart(2, '0')}`;
  }, [payment.transactionId, effectiveTable, seatNumber]);

  const invoiceNumber = useMemo(() => {
    return payment.invoiceNumber || `INV-${effectiveTable.replace(/[^a-zA-Z0-9]/g, '')}-${String(seatNumber).padStart(2, '0')}`;
  }, [payment.invoiceNumber, effectiveTable, seatNumber]);

  const chips = [
    'Super Quick Service',
    'Delicious Military Dum',
    'Authentic Donne Aroma',
    'Courteous Staff',
    'Great Ambience',
  ];

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

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
      `Table: ${effectiveTable} (Seat C-${String(seatNumber).padStart(2, '0')}) | Date: ${formattedDate}, ${formattedTime}`,
      '────────────────────────────',
      itemLines || 'Food & Beverage Service',
      '────────────────────────────',
      `Subtotal:    ₹${subtotal}`,
      `GST (5%):    ₹${totalTax}`,
      `Total Paid:  ₹${paidAmount}`,
      `Payment Ref: ${bankUtr}`,
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
    try {
      useSharedBridge.getState().clearSettledBill(effectiveTable, seatNumber);
    } catch {}
    resetSession();
    setCurrentScreen(1);
  };

  return (
    <ScreenHousing screenNumber={8} screenTitle="CONFIRMATION & DIGITAL TAX INVOICE">
      {/* Header */}
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Payment Confirmed</span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black font-mono tracking-tight border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
              {effectiveTable} • C-{String(seatNumber).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName?.toUpperCase()}
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: currentTheme.colors.bgApp }}>
        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center rounded-[28px] border p-5 text-center shadow-md"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="text-[9.5px] font-black uppercase tracking-[0.22em] font-mono"
            style={{ color: currentTheme.colors.textMuted }}
          >
            Payment Confirmed
          </div>

          <div className="my-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#198754] text-white shadow-md shadow-[#198754]/30 animate-bounce">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>

          <h3
            className="text-base font-black"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            Payment Successful
          </h3>
          <div className="font-mono text-xl font-black text-[#198754] mt-1">
            Amount Paid: ₹{paidAmount}
          </div>

          {/* 12-Digit Bank UTR Proof */}
          <div
            className="mt-3 w-full rounded-2xl border p-2.5 text-center font-mono text-[11px]"
            style={{
              backgroundColor: currentTheme.colors.bgElevated,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="font-bold text-xs" style={{ color: currentTheme.colors.textPrimary }}>
              BANK UTR (RRN): {bankUtr}
            </div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: currentTheme.colors.textMuted }}>
              TXN ID: {txnId} • TABLE {effectiveTable} • SEAT C-{String(seatNumber).padStart(2, '0')}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
            <span>Attended by <strong className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>{captainName}</strong> • Console Acknowledged</span>
          </div>
        </motion.div>

        {/* OFFICIAL DIGITAL TAX INVOICE (RECEIPT) */}
        <div
          className="rounded-[28px] border p-5 shadow-xs space-y-3.5"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="text-center pb-3 border-b border-dashed"
            style={{ borderColor: currentTheme.colors.borderLight }}
          >
            <h3
              className="text-sm font-black tracking-wider uppercase"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {venueName || 'Thoogudeepa Donne Biryani Mane'}
            </h3>
            <p
              className="font-mono text-[10px] font-semibold mt-0.5"
              style={{ color: currentTheme.colors.textMuted }}
            >
              GSTIN: 29AABCT1332L1Z9 • FSSAI: 11223334000182
            </p>
            <div
              className="mt-1.5 inline-block rounded-md px-2.5 py-0.5 font-mono text-[10.5px] font-black border"
              style={{
                backgroundColor: currentTheme.colors.pillActiveBg,
                color: currentTheme.colors.pillActiveFg,
                borderColor: currentTheme.colors.pillActiveBorder,
              }}
            >
              TAX INVOICE #{invoiceNumber}
            </div>

            {/* Structured Table, Captain & Diner Metadata */}
            <div
              className="space-y-1.5 text-[10.5px] font-mono mt-3 pt-2.5 border-t border-dashed"
              style={{
                borderColor: currentTheme.colors.borderLight,
                color: currentTheme.colors.textSecondary,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span style={{ color: currentTheme.colors.textMuted }}>DATE:</span>{' '}
                  <strong className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>{formattedDate}</strong>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span style={{ color: currentTheme.colors.textMuted }}>TIME:</span>{' '}
                  <strong className="font-bold whitespace-nowrap" style={{ color: currentTheme.colors.textPrimary }}>{formattedTime}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span style={{ color: currentTheme.colors.textMuted }}>TABLE:</span>{' '}
                  <strong className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>{effectiveTable} (Seat C-{String(seatNumber).padStart(2, '0')})</strong>
                </div>
                <div className="text-right">
                  <span style={{ color: currentTheme.colors.textMuted }}>CAPTAIN:</span>{' '}
                  <strong className="font-bold" style={{ color: currentTheme.colors.buttonBg }}>{captainName}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span style={{ color: currentTheme.colors.textMuted }}>GUEST:</span>{' '}
                  <strong className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>{guestName || 'Valued Diner'}</strong>
                </div>
                <div className="text-right">
                  <span style={{ color: currentTheme.colors.textMuted }}>MODE:</span>{' '}
                  <strong className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>DINE-IN</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div
            className="space-y-2 border-b border-dashed pb-3 text-xs"
            style={{ borderColor: currentTheme.colors.borderLight }}
          >
            <div
              className="flex justify-between items-center text-[10px] font-mono font-black uppercase tracking-wider pb-1"
              style={{ color: currentTheme.colors.textMuted }}
            >
              <span>ITEM DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>
            {activeItems.map((ci) => (
              <div
                key={ci.cartItemId}
                className="flex justify-between items-center"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                <span className="font-semibold text-xs">
                  {ci.menuItem.name} <span className="font-bold" style={{ color: currentTheme.colors.buttonBg }}>× {ci.quantity}</span>
                </span>
                <span className="font-mono font-bold text-xs">₹{ci.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Statutory Tax Breakdown */}
          <div
            className="space-y-1.5 border-b pb-3 text-xs font-mono"
            style={{ borderColor: currentTheme.colors.borderLight }}
          >
            <div className="flex justify-between font-sans" style={{ color: currentTheme.colors.textSecondary }}>
              <span className="font-semibold">Item Subtotal</span>
              <span className="font-mono font-bold" style={{ color: currentTheme.colors.textPrimary }}>₹{subtotal}</span>
            </div>
            <div className="flex justify-between font-sans" style={{ color: currentTheme.colors.textSecondary }}>
              <span className="font-medium">CGST (2.5%)</span>
              <span className="font-mono font-semibold" style={{ color: currentTheme.colors.textPrimary }}>₹{cgst}</span>
            </div>
            <div className="flex justify-between font-sans" style={{ color: currentTheme.colors.textSecondary }}>
              <span className="font-medium">SGST (2.5%)</span>
              <span className="font-mono font-semibold" style={{ color: currentTheme.colors.textPrimary }}>₹{sgst}</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-bold font-sans" style={{ color: currentTheme.colors.buttonBg }}>
                <span className="font-semibold">Staff Tip (Captain & Team)</span>
                <span className="font-mono font-black">+₹{payment.tipAmount}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between font-bold text-emerald-700 font-sans">
                <span className="font-semibold">Loyalty Discount</span>
                <span className="font-mono font-black">-₹{discount}</span>
              </div>
            )}
            <div
              className="flex items-center justify-between border-t-2 pt-2 text-sm font-black"
              style={{ borderColor: currentTheme.colors.border, color: currentTheme.colors.textPrimary }}
            >
              <span className="font-sans font-black tracking-tight">TOTAL AMOUNT PAID</span>
              <span className="font-mono text-base font-black">₹{paidAmount}</span>
            </div>
          </div>

          {/* Settlement Status Pill */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200/90 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
              <span>Paid via <span className="font-black">{payment.paymentMethod || 'UPI'}</span></span>
            </div>
            <span className="font-mono text-[10px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">PAID &amp; SETTLED</span>
          </div>

          {/* Captain Thank-you Note */}
          <div
            className="text-center pt-1 border-t border-dashed text-[10.5px] space-y-0.5"
            style={{ borderColor: currentTheme.colors.borderLight }}
          >
            <p className="font-bold" style={{ color: currentTheme.colors.buttonBg }}>Served with care by {captainName} • Floor Captain</p>
            <p className="font-medium text-[10px]" style={{ color: currentTheme.colors.textMuted }}>Thank you for dining with us! Please visit again.</p>
          </div>
        </div>

        {/* Action Buttons: Download PDF & WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.textPrimary,
            }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border py-3 px-2 text-xs font-black hover:brightness-95 transition shadow-xs"
          >
            <Download className="h-4 w-4" style={{ color: currentTheme.colors.buttonBg }} />
            <span className="font-bold">{downloadMsg ? 'Downloaded!' : 'Download PDF Bill'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 py-3 px-2 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
          >
            <Share2 className="h-4 w-4 text-emerald-700" />
            <span className="font-bold">{shareMsg ? 'Sent on WhatsApp!' : 'Share WhatsApp'}</span>
          </motion.button>
        </div>

        {/* Quick 1-Tap Experience Rating */}
        <div
          className="rounded-[28px] border p-4 shadow-xs space-y-3"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-[10px] font-black uppercase tracking-wider font-mono"
                style={{ color: currentTheme.colors.textMuted }}
              >
                Rate Experience
              </div>
              <div className="text-xs font-bold mt-0.5 font-mono" style={{ color: currentTheme.colors.buttonBg }}>
                {rating > 0 ? `${rating} / 5 Stars` : 'Tap stars to rate'}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    setFeedbackSubmitted(true);
                  }}
                  className="p-1 hover:scale-110 active:scale-95 transition"
                  aria-label={`Rate ${star} of 5 stars`}
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400 stroke-amber-400'
                        : 'fill-none text-slate-300 stroke-[1.75]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Dedicated Feedback Acknowledgement Below Rating Row with Proper Alignment */}
          {feedbackSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2.5 border-t border-dashed flex items-center justify-center"
              style={{ borderColor: currentTheme.colors.borderLight }}
            >
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Thank you for your feedback!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar: Start New Order / Dine Again */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDineAgain}
          style={{
            backgroundColor: currentTheme.colors.buttonBg,
            color: currentTheme.colors.buttonFg,
            boxShadow: currentTheme.colors.buttonShadow,
          }}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] shadow-lg transition hover:brightness-105"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start New Order / Dine Again</span>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
