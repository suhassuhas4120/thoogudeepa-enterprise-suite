'use client';

import React from 'react';
import { X, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
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
            <div className="px-6 py-4.5 bg-[#FAF8F5] border-b border-[#EAE5DF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-sm shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-stone-900 tracking-tight">Shift Performance</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Shift
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 truncate">
                    Captain {captainName || 'Floor Captain'} · Terminal TAB-CPT-01 · 34 Tables
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white hover:bg-stone-100 border border-[#EAE5DF] text-stone-500 hover:text-stone-800 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4.5">

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
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>UPI Digital</span>
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
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Cash Drawer</span>
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
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <span>Card / POS</span>
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

              {/* Full-Width Unified Floor Dynamics Card */}
              <div className="bg-white border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs space-y-4">
                {/* Header with Title and Status */}
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Floor Occupancy & Table Dynamics
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Real-time cover velocity across all 5 dining zones
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-900 block">
                      {occupiedCount} / {totalTables} Tables Active
                    </span>
                    <p className="text-[11px] font-medium text-amber-800">
                      ₹{activeBillTotal.toLocaleString()} running bill
                    </p>
                  </div>
                </div>

                {/* Sleek Segmented Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-800 font-bold flex items-center gap-1.5">
                      <span>Floor Capacity</span>
                      <span className="text-stone-400 font-normal">({occupancyRate}% utilized)</span>
                    </span>
                    <span className="text-stone-600 font-semibold text-[11px]">
                      {activeCovers} covers seated
                    </span>
                  </div>

                  {/* Visual Bar: Occupied (Amber), Billing (Purple), Vacant (Emerald) */}
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-stone-200/60">
                    <div
                      className="h-full bg-amber-500 rounded-l-full transition-all duration-500"
                      style={{ width: `${Math.max(occupiedCount > 0 ? 5 : 0, Math.round((occupiedCount / totalTables) * 100))}%` }}
                      title={`${occupiedCount} Occupied`}
                    />
                    {billingCount > 0 && (
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, Math.round((billingCount / totalTables) * 100))}%` }}
                        title={`${billingCount} Billing`}
                      />
                    )}
                    <div
                      className="h-full bg-emerald-500 rounded-r-full transition-all duration-500 flex-1"
                      title={`${vacantCount} Vacant`}
                    />
                  </div>

                  {/* Legend Cards below Progress Bar */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-amber-900 font-bold uppercase leading-tight truncate">Occupied</p>
                        <p className="text-xs font-extrabold text-stone-900 mt-0.5">{occupiedCount} Tables</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-purple-900 font-bold uppercase leading-tight truncate">Billing</p>
                        <p className="text-xs font-extrabold text-stone-900 mt-0.5">{billingCount} Tables</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-emerald-900 font-bold uppercase leading-tight truncate">Vacant Ready</p>
                        <p className="text-xs font-extrabold text-stone-900 mt-0.5">{vacantCount} Tables</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Turnaround Insight Row */}
                <div className="pt-3 border-t border-[#EAE5DF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>Avg Turnaround:</span>
                    <span className="font-bold text-stone-900">{shiftStats?.avgTurnaroundMinutes || 38} mins</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Target: 35–45m / party
                  </span>
                </div>
              </div>

              {/* Kitchen Pass & Service Dispatch */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    readyTickets.length > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {readyTickets.length}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-stone-900">
                        Kitchen Pass Counter
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        readyTickets.length > 0
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {readyTickets.length > 0 ? 'Urgent Runner Dispatch' : 'Pass Clear'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      {readyTickets.length > 0
                        ? `${readyTickets.length} hot dish tickets plated and awaiting runner dispatch.`
                        : 'All hot orders cleared and served to tables.'}
                    </p>
                  </div>
                </div>

                <div className="text-right pl-4 border-l border-[#EAE5DF] shrink-0">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                    Staff Tips
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">
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
