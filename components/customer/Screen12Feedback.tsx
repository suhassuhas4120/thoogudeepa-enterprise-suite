'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Star, Heart, CheckCircle2, MessageSquare, UtensilsCrossed, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen12Feedback: React.FC = () => {
  const { navigateTo, tableNumber } = useCustomer();
  const [tasteRating, setTasteRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [selectedChips, setSelectedChips] = useState<string[]>(['Piping Hot Biryani', 'Tender Mutton']);
  const [reviewNote, setReviewNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const complimentChips = [
    'Piping Hot Biryani',
    'Tender Mutton',
    'Spicy Donne Salna',
    'Super Fast Waiter',
    'Crispy Kebabs',
    'Hygiene 10/10',
  ];

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const renderStars = (rating: number, setRating: (n: number) => void) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="p-1 hover:scale-110 transition"
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <ScreenHousing
      screenNumber={12}
      screenTitle="DINING FEEDBACK & DISH REVIEW"
    >
      <div className="p-4 space-y-4 pb-28 text-slate-800">
        {!submitted ? (
          <>
            {/* Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-2">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-black text-slate-900">How was your meal today?</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Table {tableNumber} • Chef Manjunath would love your feedback!
              </p>
            </div>

            {/* Rating Criteria */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Donne Biryani Taste & Aroma</div>
                  <div className="text-[10px] text-slate-400">Authentic seeraga samba flavour</div>
                </div>
                {renderStars(tasteRating, setTasteRating)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div>
                  <div className="text-xs font-bold text-slate-900">Kitchen Speed & Prep Time</div>
                  <div className="text-[10px] text-slate-400">Fresh and piping hot service</div>
                </div>
                {renderStars(speedRating, setSpeedRating)}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div>
                  <div className="text-xs font-bold text-slate-900">Table Service & Courtesy</div>
                  <div className="text-[10px] text-slate-400">Attentive captain care</div>
                </div>
                {renderStars(serviceRating, setServiceRating)}
              </div>
            </div>

            {/* Compliment Chips */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-2">
                What did you love most?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {complimentChips.map((chip) => {
                  const active = selectedChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                        active
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chef Note Textarea */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                Note to Master Chef (Optional)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Tell us any suggestions or your favourite dish..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:outline-none min-h-[75px]"
              />
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-md space-y-3"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-base font-black text-emerald-950">Thank You, Biryani Lover!</h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your feedback has been delivered directly to Master Chef Manjunath and Manager Vijay.
              We credited <span className="font-bold">+50 Loyalty Points</span> to your account!
            </p>
            <button
              onClick={() => navigateTo(2)}
              className="mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-emerald-700"
            >
              Order More Items ➔
            </button>
          </motion.div>
        )}
      </div>

      <StickyBottomBar>
        <div className="flex gap-2">
          <button
            onClick={() => navigateTo(11)}
            className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Loyalty (11)</span>
          </button>
          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Review</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo(1)}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
            >
              <span>Done (Back to Start)</span>
            </button>
          )}
        </div>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
