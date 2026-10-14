'use client';

import React from 'react';
import { X, TrendingUp, Users, DollarSign, Clock, CheckCircle2, Award } from 'lucide-react';
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
            className="relative w-[620px] max-w-full max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#9C3D1E] to-[#7D2F17] text-white flex items-center justify-center shadow-md shadow-[#9C3D1E]/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9C3D1E]">
                      Floor Captain Operations
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">
                    Shift Performance Summary
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white hover:bg-stone-100 border border-[#EAE5DF] rounded-xl transition cursor-pointer text-stone-500 hover:text-stone-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5.5">
              {/* Captain Identity & Status */}
              <div className="p-4 bg-gradient-to-r from-amber-50/90 via-[#FFFDF9] to-amber-50/50 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black font-mono text-sm shadow-2xs">
                    {captainName ? captainName.slice(0, 2).toUpperCase() : 'CP'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-amber-900 font-mono font-bold uppercase tracking-wider">
                        Active Floor Captain
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[9px] font-black">
                        Duty Active
                      </span>
                    </div>
                    <span className="text-base font-black text-stone-950 block leading-tight">
                      {captainName || 'Station Commander'}
                    </span>
                    <p className="text-[11px] text-stone-600 font-sans mt-0.5">
                      Overseeing 34 Dining Tables across all 5 operational dining halls.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-mono font-black uppercase tracking-wide inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    Shift Active
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block mt-1">
                    Terminal ID: TAB-CPT-01
                  </span>
                </div>
              </div>

              {/* Revenue & Collections Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-[#9C3D1E]" />
                    <span>Shift Revenue & Collections</span>
                  </p>
                  <span className="font-mono text-[10px] text-stone-500 font-medium">
                    Consolidated Gross Collections
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 font-mono">
                  {/* Total Revenue - Rich Terracotta Brand Card */}
                  <div className="p-3.5 bg-gradient-to-br from-[#9C3D1E] via-[#873216] to-[#702710] text-white rounded-2xl shadow-sm border border-[#9C3D1E]/30 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-3 -bottom-3 text-white/5 pointer-events-none">
                      <TrendingUp className="h-20 w-20" />
                    </div>
                    <div>
                      <span className="text-[9.5px] text-amber-200 font-bold uppercase tracking-wider block">
                        Total Revenue
                      </span>
                      <span className="text-xl font-black text-white mt-1 block tracking-tight">
                        ₹{shiftRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-white/15">
                      <span className="text-[9.5px] text-amber-100/90 block leading-tight">
                        {shiftOrders} settled orders
                      </span>
                    </div>
                  </div>

                  {/* UPI Digital */}
                  <div className="p-3.5 bg-white border border-[#EAE5DF] hover:border-emerald-300 rounded-2xl shadow-2xs flex flex-col justify-between transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wider block">
                          UPI Digital
                        </span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-lg font-black text-stone-900 mt-1 block">
                        ₹{upiTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-stone-100">
                      <span className="text-[9.5px] text-emerald-700 font-bold block leading-tight">
                        {Math.round((upiTotal / shiftRevenue) * 100)}% · QR & Instant Pay
                      </span>
                    </div>
                  </div>

                  {/* Cash Drawer */}
                  <div className="p-3.5 bg-white border border-[#EAE5DF] hover:border-amber-300 rounded-2xl shadow-2xs flex flex-col justify-between transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wider block">
                          Cash Drawer
                        </span>
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                      </div>
                      <span className="text-lg font-black text-stone-900 mt-1 block">
                        ₹{cashTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-stone-100">
                      <span className="text-[9.5px] text-stone-500 block leading-tight">
                        {Math.round((cashTotal / shiftRevenue) * 100)}% · Physical register
                      </span>
                    </div>
                  </div>

                  {/* Card POS */}
                  <div className="p-3.5 bg-white border border-[#EAE5DF] hover:border-blue-300 rounded-2xl shadow-2xs flex flex-col justify-between transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] text-stone-500 font-bold uppercase tracking-wider block">
                          Card / EDC
                        </span>
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                      <span className="text-lg font-black text-stone-900 mt-1 block">
                        ₹{cardTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-stone-100">
                      <span className="text-[9.5px] text-stone-500 block leading-tight">
                        {Math.round((cardTotal / shiftRevenue) * 100)}% · Swiped slips
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Floor Utilization */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#9C3D1E]" />
                    <span>Live Floor Occupancy & Turn Rate</span>
                  </p>
                  <span className="font-mono text-[10px] text-stone-500 font-medium">
                    Real-time Floor State
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono">
                  {/* Dining Tables */}
                  <div className="p-4 bg-gradient-to-br from-amber-50/70 to-white border border-amber-200 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Dining Tables
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px]">
                        {occupiedCount} / {totalTables}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-stone-950 mt-1.5">
                      {activeCovers} <span className="text-xs font-bold text-stone-500">Covers Seated</span>
                    </div>
                    <p className="text-[10.5px] text-amber-900 font-sans font-medium mt-1 leading-snug">
                      ₹{activeBillTotal.toLocaleString()} running bill currently active on tables.
                    </p>
                  </div>

                  {/* Billing State */}
                  <div className="p-4 bg-gradient-to-br from-purple-50/70 to-white border border-purple-200 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between text-purple-900 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-purple-500" />
                        Billing State
                      </span>
                      <span className="px-1.5 py-0.5 bg-purple-100 rounded text-[10px]">
                        {billingCount} Tables
                      </span>
                    </div>
                    <div className="text-2xl font-black text-stone-950 mt-1.5">
                      {billingCount} <span className="text-xs font-bold text-stone-500">Awaiting Pay</span>
                    </div>
                    <p className="text-[10.5px] text-purple-900 font-sans font-medium mt-1 leading-snug">
                      {billingCount > 0 ? 'Checks printed; ready for immediate cashier settlement.' : 'All checks settled; smooth floor turn.'}
                    </p>
                  </div>

                  {/* Vacant & Clean */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-200 rounded-2xl shadow-2xs">
                    <div className="flex items-center justify-between text-emerald-900 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Vacant & Clean
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 rounded text-[10px]">
                        {vacantCount} Tables
                      </span>
                    </div>
                    <div className="text-2xl font-black text-stone-950 mt-1.5">
                      {Math.round((vacantCount / totalTables) * 100)}% <span className="text-xs font-bold text-stone-500">Available</span>
                    </div>
                    <p className="text-[10.5px] text-emerald-900 font-sans font-medium mt-1 leading-snug">
                      Sanitized and immediately ready to seat waiting guests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Kitchen & Dispatch Velocity */}
              <div className="p-4 bg-gradient-to-r from-[#FAF8F5] to-white border border-[#EAE5DF] rounded-2xl flex items-center justify-between font-mono text-xs shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${
                    readyTickets.length > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {readyTickets.length}
                  </div>
                  <div>
                    <span className="font-black text-stone-900 block text-xs">
                      Dishes Ready at Pass Counter
                    </span>
                    <p className="text-stone-500 text-[11px] font-sans mt-0.5">
                      {readyTickets.length > 0
                        ? `${readyTickets.length} food items plated by kitchen chefs — awaiting runner delivery to tables.`
                        : 'Kitchen pass is completely clear. All hot dishes have been dispatched to dining tables.'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-black uppercase text-[10px] border shrink-0 ${
                  readyTickets.length > 0
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-2xs animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {readyTickets.length > 0 ? 'Dispatch Urgent' : 'Pass Clear'}
                </span>
              </div>

              {/* Service Velocity & Quality Insights */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl">
                  <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase">
                    <Clock className="h-3 w-3 text-stone-400" />
                    <span>Avg Turn Time</span>
                  </div>
                  <span className="text-base font-black text-stone-900 mt-1 block">
                    {shiftStats?.avgTurnaroundMinutes || 38} mins
                  </span>
                  <span className="text-[9.5px] text-stone-500 font-sans block mt-0.5">
                    Target: 35–45 mins per party
                  </span>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl">
                  <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase">
                    <Award className="h-3 w-3 text-stone-400" />
                    <span>Staff Tips Earned</span>
                  </div>
                  <span className="text-base font-black text-emerald-700 mt-1 block">
                    ₹{(shiftStats?.tipsEarned || 850).toLocaleString()}
                  </span>
                  <span className="text-[9.5px] text-stone-500 font-sans block mt-0.5">
                    Distributed post-shift
                  </span>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl">
                  <div className="flex items-center gap-1.5 text-stone-500 font-bold text-[10px] uppercase">
                    <CheckCircle2 className="h-3 w-3 text-stone-400" />
                    <span>Service Quality</span>
                  </div>
                  <span className="text-base font-black text-stone-900 mt-1 block">
                    99.4%
                  </span>
                  <span className="text-[9.5px] text-emerald-700 font-sans font-bold block mt-0.5">
                    Optimal guest satisfaction
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <p className="font-mono text-[10.5px] text-stone-500">
                Thoogudeepa Enterprise System · Shift Metrics Auto-Refreshed
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#9C3D1E] hover:bg-[#7D2F17] active:scale-95 text-white rounded-xl font-mono text-xs font-black shadow-xs transition cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
