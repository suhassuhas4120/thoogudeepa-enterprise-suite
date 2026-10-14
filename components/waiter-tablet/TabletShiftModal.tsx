'use client';

import React from 'react';
import { X, TrendingUp, Users, DollarSign, Clock, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
  captainName: string;
}

export function TabletShiftModal({ open, onClose, captainName }: Props) {
  const { tables, kdsTickets, shiftStats } = useSharedBridge();

  const totalTables = tables.length;
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const billingCount = tables.filter((t) => t.status === 'BILLING').length;
  const vacantCount = tables.filter((t) => t.status === 'VACANT').length;
  const activeCovers = tables.reduce((acc, t) => acc + (t.status === 'OCCUPIED' ? (t.guestCount || t.capacity || 2) : 0), 0);

  // Active pending bill sum on floor
  const activeBillTotal = tables.reduce((acc, t) => acc + (t.currentBill || 0), 0);

  // Ready food tickets waiting at pass
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  const shiftRevenue = shiftStats?.totalRevenue || 18450;
  const shiftOrders = shiftStats?.tablesServed || 42;
  const cashTotal = Math.round(shiftRevenue * 0.35);
  const upiTotal = Math.round(shiftRevenue * 0.55);
  const cardTotal = Math.round(shiftRevenue * 0.10);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-[620px] max-w-full max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9C3D1E]">
                    Floor Captain Shift Metrics
                  </p>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">
                    Shift Performance Summary
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white hover:bg-stone-200 border border-[#EAE5DF] rounded-xl transition cursor-pointer"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Captain Identity & Station */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                    Active Floor Captain
                  </span>
                  <span className="text-base font-black text-stone-950">
                    {captainName || 'Station Commander'}
                  </span>
                  <span className="text-xs text-amber-900 block mt-0.5">
                    Terminal ID: TAB-CPT-01 · All 5 Sections Active
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-black uppercase">
                    Shift Active
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-1">
                    Live Real-Time Bridge
                  </span>
                </div>
              </div>

              {/* Revenue & Collections Grid */}
              <div className="space-y-2">
                <p className="font-mono text-xs font-black text-stone-700 uppercase tracking-wider">
                  Payment Collections
                </p>
                <div className="grid grid-cols-4 gap-3 font-mono">
                  <div className="p-3.5 bg-stone-900 text-white rounded-2xl shadow-xs">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Total Revenue
                    </span>
                    <span className="text-xl font-black text-emerald-400 mt-1 block">
                      ₹{shiftRevenue.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] text-stone-400 mt-0.5 block">
                      {shiftOrders} settled bills
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">
                      UPI Digital
                    </span>
                    <span className="text-lg font-black text-stone-900 mt-1 block">
                      ₹{upiTotal.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] text-emerald-700 font-bold mt-0.5 block">
                      {Math.round((upiTotal / shiftRevenue) * 100)}% share
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">
                      Cash Drawer
                    </span>
                    <span className="text-lg font-black text-stone-900 mt-1 block">
                      ₹{cashTotal.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] text-stone-500 mt-0.5 block">
                      In physical register
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl">
                    <span className="text-[10px] text-stone-500 font-bold uppercase block">
                      Card POS
                    </span>
                    <span className="text-lg font-black text-stone-900 mt-1 block">
                      ₹{cardTotal.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] text-stone-500 mt-0.5 block">
                      Verified slips
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Floor Utilization */}
              <div className="space-y-2">
                <p className="font-mono text-xs font-black text-stone-700 uppercase tracking-wider">
                  Live Floor Occupancy &amp; Turn Rate
                </p>
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                    <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
                      <span>Dining Tables</span>
                      <span>{occupiedCount} / {totalTables}</span>
                    </div>
                    <div className="text-2xl font-black text-stone-950 mt-1">
                      {activeCovers} <span className="text-sm font-normal text-stone-500">Covers Seated</span>
                    </div>
                    <div className="text-[10.5px] text-amber-800 font-bold mt-1">
                      ₹{activeBillTotal.toLocaleString()} pending on floor
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl">
                    <div className="flex items-center justify-between text-purple-900 text-xs font-bold">
                      <span>Billing State</span>
                      <span>{billingCount} Tables</span>
                    </div>
                    <div className="text-2xl font-black text-stone-950 mt-1">
                      {billingCount} <span className="text-sm font-normal text-stone-500">Awaiting Pay</span>
                    </div>
                    <div className="text-[10.5px] text-purple-800 font-bold mt-1">
                      Ready for immediate settlement
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center justify-between text-emerald-900 text-xs font-bold">
                      <span>Vacant &amp; Clean</span>
                      <span>{vacantCount} Tables</span>
                    </div>
                    <div className="text-2xl font-black text-stone-950 mt-1">
                      {Math.round((vacantCount / totalTables) * 100)}% <span className="text-sm font-normal text-stone-500">Available</span>
                    </div>
                    <div className="text-[10.5px] text-emerald-800 font-bold mt-1">
                      Ready to seat waiting guests
                    </div>
                  </div>
                </div>
              </div>

              {/* Kitchen & Dispatch Velocity */}
              <div className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                    {readyTickets.length}
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block">
                      Dishes Ready at Pass
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      {readyTickets.length > 0 ? 'Food plated and waiting for runners' : 'All plated dishes cleared to tables'}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-black uppercase text-[10px] border ${
                  readyTickets.length > 0 ? 'bg-blue-600 text-white border-blue-600 animate-pulse' : 'bg-stone-100 text-stone-600 border-stone-300'
                }`}>
                  {readyTickets.length > 0 ? 'Dispatch Urgent' : 'Pass Clear'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#EAE5DF] bg-[#FAF8F5] flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-black shadow-xs active:scale-95 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
