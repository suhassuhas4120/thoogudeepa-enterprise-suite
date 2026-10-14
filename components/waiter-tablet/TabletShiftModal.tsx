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

  const occupancyRate = Math.round((occupiedCount / totalTables) * 100);

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
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-[620px] max-w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#EAE5DF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-stone-900 tracking-tight">Shift Performance</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Shift
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Captain {captainName || 'Floor Captain'} · Terminal TAB-CPT-01 · 34 Tables
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white hover:bg-stone-100 border border-[#EAE5DF] text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5">

              {/* Consolidated Revenue & Collections Card */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DF]">
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                      Total Shift Revenue
                    </span>
                    <div className="text-3xl font-extrabold text-[#9C3D1E] tracking-tight mt-1">
                      ₹{shiftRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-white border border-[#EAE5DF] rounded-xl text-xs font-bold text-stone-800 shadow-2xs">
                      {shiftOrders} Orders Settled
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Avg ₹{Math.round(shiftRevenue / (shiftOrders || 1))} per order
                    </p>
                  </div>
                </div>

                {/* 3 Payment Breakdown Columns */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="bg-white p-3 rounded-xl border border-[#EAE5DF]">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        UPI Digital
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {Math.round((upiTotal / shiftRevenue) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold text-stone-900 mt-1">
                      ₹{upiTotal.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      QR & Instant Online
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#EAE5DF]">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Cash Drawer
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {Math.round((cashTotal / shiftRevenue) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold text-stone-900 mt-1">
                      ₹{cashTotal.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Physical Register
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-[#EAE5DF]">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Card / POS
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {Math.round((cardTotal / shiftRevenue) * 100)}%
                      </span>
                    </div>
                    <div className="text-base font-bold text-stone-900 mt-1">
                      ₹{cardTotal.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Swiped EDC Slips
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-Column Clean Floor Analytics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Dining Floor Status */}
                <div className="bg-white border border-[#EAE5DF] rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#9C3D1E]" />
                      Floor Occupancy
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {occupiedCount} / {totalTables} Tables
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-stone-900">
                      {activeCovers} <span className="text-xs font-medium text-stone-500">Guests Seated</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      ₹{activeBillTotal.toLocaleString()} active running bill on dining tables
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                      <span>{occupancyRate}% occupied</span>
                      <span>{vacantCount} vacant tables</span>
                    </div>
                  </div>
                </div>

                {/* Table Turn & Settlement Status */}
                <div className="bg-white border border-[#EAE5DF] rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#9C3D1E]" />
                      Turnaround & Billing
                    </span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                      {billingCount} Billing
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-stone-900">
                      {shiftStats?.avgTurnaroundMinutes || 38} <span className="text-xs font-medium text-stone-500">Mins Avg Turn</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {billingCount > 0
                        ? `${billingCount} tables awaiting settlement check`
                        : 'All active tables enjoying meal service'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-stone-200/60 flex items-center justify-between text-xs">
                    <span className="text-stone-600 font-medium">Ready Vacant Tables</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {vacantCount} Ready to Seat
                    </span>
                  </div>
                </div>
              </div>

              {/* Kitchen Pass Status Bar */}
              <div className="bg-white border border-[#EAE5DF] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    readyTickets.length > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {readyTickets.length}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        Kitchen Pass Counter
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        readyTickets.length > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {readyTickets.length > 0 ? 'Urgent Pickup' : 'Pass Clear'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {readyTickets.length > 0
                        ? `${readyTickets.length} dish tickets plated and awaiting runner dispatch.`
                        : 'All hot orders cleared and served to tables.'}
                    </p>
                  </div>
                </div>

                <div className="text-right pl-4 border-l border-stone-100">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                    Staff Tips
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    ₹{(shiftStats?.tipsEarned || 850).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#EAE5DF] flex items-center justify-between shrink-0">
              <span className="text-xs text-stone-400 font-medium">
                Thoogudeepa Enterprise System · Auto-synced with floor
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#9C3D1E] hover:bg-[#7D2F17] active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
