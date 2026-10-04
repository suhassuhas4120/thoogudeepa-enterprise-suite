'use client';

import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { OrderStage } from '../../types/customer';
import { Check, Clock, ChefHat, Plus, ArrowRight, Wifi, ClipboardList, Flame, UtensilsCrossed, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderTrackingQuery } from '../../hooks/useOrderTrackingQuery';

export const Screen5LiveTracking: React.FC = () => {
  const { setCurrentScreen, orderStage, venueName } = useCustomer();

  // Supabase Realtime — all live stage data comes from here
  const {
    tickets,
    overallStage,
    stageHash,
    isLoading,
    tableId,
    seatNumber,
  } = useOrderTrackingQuery();

  // Suppress unused linter warning (stageHash triggers re-render via dep array in hook)
  void stageHash;

  // Flatten all items across active tickets for this seat
  const allMyItems = tickets.flatMap(t => t.items);

  // Use Supabase-derived stage if items exist, otherwise local orderStage
  const currentStage: OrderStage =
    allMyItems.length > 0 ? (overallStage as OrderStage) : orderStage;

  const stages: { key: OrderStage; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'PLACED', label: 'ORDER PLACED',   icon: <ClipboardList className="h-3.5 w-3.5" />, desc: 'Your order has been received by the kitchen.' },
    { key: 'PREP',   label: 'PREPARING',      icon: <Flame className="h-3.5 w-3.5" />, desc: 'Chefs are cooking your food right now.' },
    { key: 'PLATED', label: 'READY TO SERVE', icon: <UtensilsCrossed className="h-3.5 w-3.5" />, desc: 'Food is plated and ready at the pass.' },
    { key: 'SERVED', label: 'SERVED',         icon: <CheckCheck className="h-3.5 w-3.5" />, desc: 'Your food has been delivered. Enjoy!' },
  ];

  const stageKeyToIdx: Record<OrderStage, number> = {
    PLACED: 0, PREP: 1, PLATED: 2, SERVED: 3,
  };
  const currentIdx = stageKeyToIdx[currentStage] ?? 0;

  const itemStageConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
    PLACED: { label: 'ORDER PLACED', color: 'bg-[#FAF8F5] text-slate-700 border-slate-200', pulse: false },
    PREP:   { label: 'PREPARING',    color: 'bg-amber-50 text-amber-800 border-amber-200',  pulse: true  },
    PLATED: { label: 'READY TO RUN', color: 'bg-blue-50 text-blue-800 border-blue-200',     pulse: true  },
    SERVED: { label: 'SERVED',       color: 'bg-emerald-50 text-emerald-800 border-emerald-200', pulse: false },
  };

  return (
    <ScreenHousing screenNumber={5} screenTitle="LIVE ORDER TRACKING">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Live Order Tracking</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
              {tableId} • C-{String(seatNumber || 1).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName?.toUpperCase()}
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            TABLE {tableId} · SEAT {seatNumber} · LIVE
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            {isLoading ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <Wifi className="h-3 w-3" />
                Live
              </>
            )}
          </span>
        </div>

        
        <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
            Overall Order Stage
          </div>

          <div className="relative flex justify-between px-2 pt-2 pb-1">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-[#FAF8F5] -z-0" />
            {/* Active Progress Line */}
            <motion.div
              className="absolute top-6 left-6 h-1 bg-orange-500 -z-0"
              initial={false}
              animate={{ width: `${(currentIdx / (stages.length - 1)) * 83}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />

            {stages.map((st, i) => {
              const isPast    = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={st.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all shadow-xs ${
                      isPast
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100 animate-pulse'
                        : 'border-2 border-slate-200 bg-white text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4 stroke-[3]" /> : st.icon}
                  </motion.div>
                  <span
                    className={`text-[9px] font-mono tracking-tight font-extrabold text-center leading-tight ${
                      isCurrent ? 'text-orange-600' : isPast ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current stage description */}
          <div className="mt-3 text-center font-mono text-[10.5px] text-slate-600 font-medium bg-[#FAF8F5] rounded-xl py-2 px-3 border border-slate-100">
            {stages[currentIdx]?.desc}
          </div>
        </div>

        
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Item-by-Item Status
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {allMyItems.length > 0 ? (
                allMyItems.map((it) => {
                  const cfg = itemStageConfig[it.stage] || itemStageConfig['PLACED'];
                  const cleanName = it.name
                    .replace(/\s*\[Seat \d+\]/gi, '')
                    .replace(/\s*\[Table [^\]]+\]/gi, '')
                    .trim();
                  return (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-slate-100 bg-[#FAF8F5]/60 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {it.quantity}× {cleanName}
                        </span>
                        <span className={`rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold whitespace-nowrap ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {it.notes && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 font-mono">
                          <ChefHat className="h-3.5 w-3.5 text-orange-500" />
                          <span>{it.notes}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : isLoading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-slate-400">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span className="text-xs font-bold">Connecting to kitchen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-[#FAF8F5]/50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-bold text-slate-700">Waiting for kitchen update</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    Your order was placed. Kitchen will update stages in real time.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(2)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50/60 py-3 text-xs font-extrabold text-orange-700 hover:bg-orange-100 transition shadow-xs"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add More Items to Same Bill</span>
        </motion.button>
      </div>

      {/* Bottom Sticky: Payment */}
      <StickyBottomBar label="Go to Payment">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(6)}
          className="flex w-full items-center justify-between rounded-2xl bg-[#1C1917] px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:bg-slate-800"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
