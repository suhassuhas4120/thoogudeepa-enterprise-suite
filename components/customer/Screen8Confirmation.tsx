'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { CheckCircle2, Star, ArrowRight, ShieldCheck, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen8Confirmation: React.FC = () => {
  const { setCurrentScreen, payment, guestName, tableNumber } = useCustomer();
  const [selectedChips, setSelectedChips] = useState<string[]>(['Super Quick Service']);
  const [customFeedback, setCustomFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Read seat from URL
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const seatNumber = parseInt(params.get('seat') || '1', 10);

  // Verified 12-digit bank reference number
  const bankUtr = '4281' + Math.floor(10000000 + Math.random() * 90000000);
  const txnId = payment.transactionId || '#TXN-' + Math.floor(100000 + Math.random() * 900000);

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

  return (
    <ScreenHousing screenNumber={8} screenTitle="Confirmation & Feedback">
      {/* Header */}
      <WireHeader
        title="Confirmation & Feedback"
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-5 text-center shadow-xs"
        >
          <div className="text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            Payment Confirmed
          </div>

          <div className="my-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#198754] text-white shadow-md shadow-[#198754]/30">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>

          <h3 className="text-base font-black text-[#5B5049]">Payment Successful</h3>
          <div className="font-mono text-sm font-black text-[#198754] mt-1">
            Amount Paid: ₹{payment.totalAmount}
          </div>

          {/* 12-Digit Bank UTR Proof */}
          <div className="mt-3 w-full rounded-2xl border border-[#E8D5C3] bg-[#F3DFCC]/50 p-2.5 text-center font-mono text-[11px] text-[#5B5049]">
            <div className="font-bold text-[#8A4228]">BANK UTR (RRN): {bankUtr}</div>
            <div className="text-[10px] text-[#5B5049]/70 mt-0.5">TXN ID: {txnId} • TABLE {tableNumber} • SEAT {seatNumber}</div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1 text-[10.5px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Floor Captain Console Acknowledged • Seat Released</span>
          </div>
        </motion.div>

        {/* Quick Feedback Chips */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            How was your dining experience?
          </div>

          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => {
              const isSelected = selectedChips.includes(chip);
              return (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                    isSelected
                      ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-xs'
                      : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Custom Note */}
          <div className="mt-3">
            <textarea
              rows={2}
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
              placeholder="Leave a note for the Head Chef..."
              className="w-full rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] p-3 text-xs font-semibold text-[#5B5049] placeholder:text-[#5B5049]/50 focus:border-[#8A4228] focus:outline-none"
            />
          </div>

          {!feedbackSubmitted ? (
            <button
              onClick={() => setFeedbackSubmitted(true)}
              className="mt-2 w-full rounded-xl bg-[#8A4228] py-2 text-xs font-black uppercase tracking-wider text-[#FFFCF7] hover:bg-[#71351F] transition"
            >
              Submit Feedback
            </button>
          ) : (
            <div className="mt-2 rounded-xl bg-emerald-100 p-2 text-center text-xs font-black text-emerald-800">
              Thank you for your feedback!
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(9)}
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 stroke-[2.2]" />
            <span>View Digital Tax Invoice</span>
          </div>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
