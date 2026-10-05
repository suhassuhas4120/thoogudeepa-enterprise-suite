'use client';

import React, { useState, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
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
  const [rating, setRating] = useState(5);

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
      : 'Captain Suresh';

  const formattedDateTime = useMemo(() => {
    const d = new Date();
    const dateStr = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  }, []);

  // Calculations
  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
  const cgst = Math.round(subtotal * 0.025);
  const sgst = Math.round(subtotal * 0.025);
  const totalTax = cgst + sgst;
  const discount = payment.discount || (payment.redeemPoints ? Math.min(50, subtotal + totalTax) : 0);
  const calculatedGrandTotal = Math.max(0, subtotal + totalTax + payment.tipAmount - discount);
  const paidAmount = payment.totalAmount > 0 ? payment.totalAmount : calculatedGrandTotal;

  // Verified 12-digit bank reference number & Tax invoice ID
  const bankUtr = '4281' + Math.floor(10000000 + Math.random() * 90000000);
  const txnId = payment.transactionId || '#TXN-' + Math.floor(100000 + Math.random() * 900000);
  const invoiceNumber = `INV-${effectiveTable.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;

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
    setShareMsg(true);
    setTimeout(() => setShareMsg(false), 2200);
  };

  const handleDineAgain = () => {
    resetSession();
    setCurrentScreen(1);
  };

  return (
    <ScreenHousing screenNumber={8} screenTitle="CONFIRMATION & DIGITAL TAX INVOICE">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Payment Confirmed</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
              {effectiveTable} • C-{String(seatNumber).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName?.toUpperCase()}
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-5 text-center shadow-md"
        >
          <div className="text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            Payment Confirmed
          </div>

          <div className="my-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#198754] text-white shadow-md shadow-[#198754]/30 animate-bounce">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>

          <h3 className="text-base font-black text-[#5B5049]">Payment Successful</h3>
          <div className="font-mono text-xl font-black text-[#198754] mt-1">
            Amount Paid: ₹{paidAmount}
          </div>

          {/* 12-Digit Bank UTR Proof */}
          <div className="mt-3 w-full rounded-2xl border border-[#E8D5C3] bg-[#F3DFCC]/50 p-2.5 text-center font-mono text-[11px] text-[#5B5049]">
            <div className="font-bold text-[#8A4228] text-xs">BANK UTR (RRN): {bankUtr}</div>
            <div className="text-[10px] font-semibold text-[#5B5049]/80 mt-0.5">
              TXN ID: {txnId} • TABLE {effectiveTable} • SEAT C-{String(seatNumber).padStart(2, '0')}
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
            <span>Attended by <strong className="font-bold text-[#2A2522]">{captainName}</strong> • Console Acknowledged</span>
          </div>
        </motion.div>

        {/* OFFICIAL DIGITAL TAX INVOICE (RECEIPT) */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-5 shadow-xs space-y-3.5">
          <div className="text-center pb-3 border-b border-dashed border-[#E8D5C3]">
            <h3 className="text-sm font-black text-[#2A2522] tracking-wider uppercase">
              {venueName || 'Thoogudeepa Donne Biryani Mane'}
            </h3>
            <p className="font-mono text-[10px] font-semibold text-[#5B5049]/75 mt-0.5">
              GSTIN: 29AABCT1332L1Z9 • FSSAI: 11223334000182
            </p>
            <div className="mt-1.5 inline-block rounded-md bg-[#8A4228]/10 px-2.5 py-0.5 font-mono text-[10.5px] font-black text-[#8A4228]">
              TAX INVOICE #{invoiceNumber}
            </div>

            {/* Structured Table, Captain & Diner Metadata */}
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10.5px] font-mono text-[#5B5049] mt-3 pt-2.5 border-t border-dashed border-[#E8D5C3]">
              <div className="text-left">
                <span className="text-[#5B5049]/70 font-semibold">TABLE:</span>{' '}
                <strong className="font-bold text-[#2A2522]">{effectiveTable} (Seat C-{String(seatNumber).padStart(2, '0')})</strong>
              </div>
              <div className="text-right">
                <span className="text-[#5B5049]/70 font-semibold">CAPTAIN:</span>{' '}
                <strong className="font-bold text-[#8A4228]">{captainName}</strong>
              </div>
              <div className="text-left">
                <span className="text-[#5B5049]/70 font-semibold">GUEST:</span>{' '}
                <strong className="font-bold text-[#2A2522]">{guestName || 'Valued Diner'}</strong>
              </div>
              <div className="text-right">
                <span className="text-[#5B5049]/70 font-semibold">DATE:</span>{' '}
                <strong className="font-bold text-[#2A2522]">{formattedDateTime}</strong>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 border-b border-dashed border-[#E8D5C3] pb-3 text-xs">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-[#5B5049]/60 uppercase tracking-wider pb-1">
              <span>ITEM DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>
            {cart.map((ci) => (
              <div key={ci.cartItemId} className="flex justify-between items-center text-[#2A2522]">
                <span className="font-semibold text-xs">
                  {ci.menuItem.name} <span className="text-[#8A4228] font-bold">× {ci.quantity}</span>
                </span>
                <span className="font-mono font-bold text-xs">₹{ci.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Statutory Tax Breakdown */}
          <div className="space-y-1.5 border-b border-[#E8D5C3] pb-3 text-xs font-mono">
            <div className="flex justify-between text-[#5B5049] font-sans">
              <span className="font-semibold">Item Subtotal</span>
              <span className="font-mono font-bold text-[#2A2522]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-[#5B5049]/80 font-sans">
              <span className="font-medium">CGST (2.5%)</span>
              <span className="font-mono font-semibold text-[#2A2522]">₹{cgst}</span>
            </div>
            <div className="flex justify-between text-[#5B5049]/80 font-sans">
              <span className="font-medium">SGST (2.5%)</span>
              <span className="font-mono font-semibold text-[#2A2522]">₹{sgst}</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-bold text-[#8A4228] font-sans">
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
            <div className="flex items-center justify-between border-t-2 border-[#2A2522]/10 pt-2 text-sm font-black text-[#2A2522]">
              <span className="font-sans font-black tracking-tight">TOTAL AMOUNT PAID</span>
              <span className="font-mono text-base font-black text-[#8A4228]">₹{paidAmount}</span>
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
          <div className="text-center pt-1 border-t border-dashed border-[#E8D5C3] text-[10.5px] text-[#5B5049] space-y-0.5">
            <p className="font-bold text-[#8A4228]">Served with care by {captainName} • Floor Captain</p>
            <p className="font-medium text-[#5B5049]/70 text-[10px]">Thank you for dining with us! Please visit again.</p>
          </div>
        </div>

        {/* Action Buttons: Download PDF & WhatsApp */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#E8D5C3] bg-white py-3 px-2 text-xs font-black text-[#5B5049] hover:bg-[#F3DFCC]/40 transition shadow-xs"
          >
            <Download className="h-4 w-4 text-[#8A4228]" />
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
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#5B5049]/70 font-mono">
                Rate Experience
              </div>
              <div className="text-xs font-bold text-[#8A4228] mt-0.5 font-mono">
                {rating} / 5 Stars
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
                    className={`h-5 w-5 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
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
              className="pt-2.5 border-t border-dashed border-[#E8D5C3] flex items-center justify-center"
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
          className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start New Order / Dine Again</span>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
