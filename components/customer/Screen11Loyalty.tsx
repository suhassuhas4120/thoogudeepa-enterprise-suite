'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Crown, Sparkles, Gift, ArrowRight, ArrowLeft, CheckCircle2, Award, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen11Loyalty: React.FC = () => {
  const { navigateTo, tableNumber } = useCustomer();
  const [scratched, setScratched] = useState(false);
  const [redeemed, setRedeemed] = useState<string | null>(null);

  const rewards = [
    { id: 'R1', title: 'Free Boiled Egg & Salna', points: 300, desc: 'Authentic Donne Biryani accompaniment' },
    { id: 'R2', title: 'Guntur Chicken (Half)', points: 650, desc: 'Crispy spicy Andhra style starter' },
    { id: 'R3', title: 'Donne Mutton Biryani (Reg)', points: 1200, desc: 'Tender mutton cooked in seeraga samba' },
  ];

  return (
    <ScreenHousing
      screenNumber={11}
      screenTitle="LOYALTY CLUB & REWARDS"
    >
      <div className="p-4 space-y-4 pb-28 text-slate-800">
        {/* VIP Gold Membership Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-5 text-white shadow-xl shadow-orange-500/20">
          <div className="absolute -right-6 -bottom-6 opacity-15">
            <Crown className="h-36 w-36 text-white" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-200 fill-amber-200" />
              <span className="font-mono text-xs font-black tracking-widest text-amber-100 uppercase">
                BIRYANI RAJA • LEVEL 3
              </span>
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm">
              TABLE {tableNumber}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-medium text-amber-100/90">AVAILABLE REWARD POINTS</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">1,450</span>
              <span className="text-xs font-bold text-amber-200">PTS (Worth ₹145)</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[11px]">
            <span className="font-mono text-white/90">MEMBER: TDB-9924-BLR</span>
            <span className="text-amber-200 font-bold">50 Pts earned today</span>
          </div>
        </div>

        {/* Scratch Card Mystery Reward */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-amber-600" />
            <span className="font-black text-xs uppercase tracking-wider text-amber-900">
              Dine-In Mystery Surprise
            </span>
          </div>

          {!scratched ? (
            <button
              onClick={() => setScratched(true)}
              className="w-full h-24 rounded-xl border-2 border-dashed border-amber-400 bg-amber-100 flex flex-col items-center justify-center gap-1.5 text-amber-800 hover:bg-amber-200/70 transition cursor-pointer"
            >
              <Sparkles className="h-6 w-6 text-amber-600 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider">TAP TO SCRATCH & REVEAL</span>
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full h-24 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center p-3 text-center shadow-md"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">YOU UNLOCKED</span>
              <span className="text-sm font-black">FREE DONNE GULAB JAMUN (2 PCS)</span>
              <span className="text-[10px] text-emerald-100/90 mt-0.5">Applied to your current table bill!</span>
            </motion.div>
          )}
        </div>

        {/* Redeemable Rewards List */}
        <div>
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-orange-600" />
            <span>Redeemable Club Items</span>
          </h3>

          <div className="space-y-2">
            {rewards.map((r) => {
              const isRedeemed = redeemed === r.id;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{r.title}</div>
                    <div className="text-[10.5px] text-slate-500">{r.desc}</div>
                    <div className="mt-1 font-mono text-[10px] font-extrabold text-orange-600">
                      {r.points} POINTS
                    </div>
                  </div>

                  <button
                    onClick={() => setRedeemed(r.id)}
                    disabled={isRedeemed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                      isRedeemed
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-900 text-white hover:bg-orange-600'
                    }`}
                  >
                    {isRedeemed ? 'REDEEMED' : 'REDEEM'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StickyBottomBar>
        <div className="flex gap-2">
          <button
            onClick={() => navigateTo(10)}
            className="flex-1 py-3 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Call Waiter</span>
          </button>
          <button
            onClick={() => navigateTo(12)}
            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 hover:bg-orange-700"
          >
            <span>Rate Experience (12)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
