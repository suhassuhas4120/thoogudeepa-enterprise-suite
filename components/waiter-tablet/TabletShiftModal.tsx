'use client';

import React from 'react';
import {
  X,
  TrendingUp,
  Users,
  IndianRupee,
  Clock,
  Smartphone,
  Banknote,
  CreditCard,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useWaiterStore } from '../../store/useWaiterStore';

interface Props {
  open: boolean;
  onClose: () => void;
  captainName: string;
  sectionName?: string;
}

const SECTION_MATCH_MAP: Record<string, string[]> = {
  'SECTION A': ['Express / Couple Hall', 'Section A', 'SECTION A'],
  'Section A': ['Express / Couple Hall', 'Section A', 'SECTION A'],
  'SECTION B': ['Main Dining Hall', 'Section B', 'SECTION B'],
  'Section B': ['Main Dining Hall', 'Section B', 'SECTION B'],
  'SECTION C': ['Family Section', 'Section C', 'SECTION C'],
  'Section C': ['Family Section', 'Section C', 'SECTION C'],
  'SECTION D': ['Courtyard Garden', 'Section D', 'SECTION D'],
  'Section D': ['Courtyard Garden', 'Section D', 'SECTION D'],
  'SECTION E': ['Grand Feast Hall', 'Section E', 'SECTION E'],
  'Section E': ['Grand Feast Hall', 'Section E', 'SECTION E'],
};

export function TabletShiftModal({ open, onClose, captainName, sectionName }: Props) {
  const { tables, kdsTickets, shiftStats } = useSharedBridge();
  const { activeSection } = useWaiterStore();

  const currentSection = sectionName || activeSection || 'Section A';

  // Section-specific tables (typically 4 tables in Section A / Express Hall)
  const myTables = tables.filter((t) => {
    if (!currentSection || currentSection === 'ALL') return true;
    const allowed = SECTION_MATCH_MAP[currentSection] || [currentSection];
    return allowed.some(
      (sec) =>
        t.section.toLowerCase().includes(sec.toLowerCase()) ||
        sec.toLowerCase().includes(t.section.toLowerCase())
    );
  });

  const myOccupied = myTables.filter((t) => t.status === 'OCCUPIED').length;
  const myBilling = myTables.filter((t) => t.status === 'BILLING').length;
  const myVacant = myTables.filter((t) => t.status === 'VACANT').length;
  const myCovers = myTables.reduce(
    (acc, t) => acc + (t.status === 'OCCUPIED' ? (t.guestCount || t.capacity || 2) : 0),
    0
  );
  const myBill = myTables.reduce((acc, t) => acc + (t.currentBill || 0), 0);
  const myOccupancyRate = Math.round((myOccupied / (myTables.length || 1)) * 100);

  // Overall restaurant metrics (34 tables across all 5 zones)
  const totalTables = tables.length;
  const totalOccupied = tables.filter((t) => t.status === 'OCCUPIED').length;
  const totalBilling = tables.filter((t) => t.status === 'BILLING').length;
  const totalVacant = tables.filter((t) => t.status === 'VACANT').length;
  const totalActiveBill = tables.reduce((acc, t) => acc + (t.currentBill || 0), 0);

  // Ready food tickets waiting at pass
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  const shiftRevenue = shiftStats?.totalRevenue || 18450;
  const shiftOrders = shiftStats?.tablesServed || 42;
  const cashTotal = Math.round(shiftRevenue * 0.35);
  const upiTotal = Math.round(shiftRevenue * 0.55);
  const cardTotal = Math.round(shiftRevenue * 0.10);

  const displaySectionTitle =
    currentSection === 'Section A' || currentSection === 'SECTION A'
      ? 'Express / Couple Hall (Section A)'
      : currentSection;

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
                    Captain {captainName || 'Floor Captain'} · Terminal TAB-CPT-01
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

            {/* Content Body with clean vertical gap between all cards */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4">

              {/* 1. Total Shift Revenue Card with Highlighted Icons */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-md shadow-[#9C3D1E]/20 shrink-0">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        Total Shift Revenue
                      </span>
                      <div className="text-3xl font-extrabold text-[#9C3D1E] tracking-tight mt-0.5">
                        ₹{shiftRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-white border border-[#EAE5DF] rounded-xl text-xs font-bold text-stone-800 shadow-2xs">
                      {shiftOrders} Orders Settled
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Avg ₹{Math.round(shiftRevenue / (shiftOrders || 1))} / table
                    </p>
                  </div>
                </div>

                {/* 3 Highlighted Payment Collection Cards */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#EAE5DF]">
                  {/* UPI */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] flex items-center gap-3 shadow-2xs">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <Smartphone className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">UPI</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {Math.round((upiTotal / shiftRevenue) * 100)}%
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">
                        ₹{upiTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Cash */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] flex items-center gap-3 shadow-2xs">
                    <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <Banknote className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">Cash</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                          {Math.round((cashTotal / shiftRevenue) * 100)}%
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">
                        ₹{cashTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] flex items-center gap-3 shadow-2xs">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">Card</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                          {Math.round((cardTotal / shiftRevenue) * 100)}%
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">
                        ₹{cardTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Captain's Assigned Section (4 Tables) Card */}
              <div className="bg-white border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                          {displaySectionTitle}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {myTables.length} Tables Assigned
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {myTables.map((t) => t.number).join(', ')} · Floor station assigned to {captainName || 'Captain'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-900 block">
                      {myOccupied} / {myTables.length} Tables Active
                    </span>
                    <p className="text-[11px] font-medium text-amber-800">
                      ₹{myBill.toLocaleString()} running bill
                    </p>
                  </div>
                </div>

                {/* Section Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-800 font-bold flex items-center gap-1.5">
                      <span>Section Capacity Utilization</span>
                      <span className="text-stone-400 font-normal">({myOccupancyRate}%)</span>
                    </span>
                    <span className="text-stone-600 font-semibold text-[11px]">
                      {myCovers} covers seated
                    </span>
                  </div>

                  {/* Segmented Bar for Section Tables */}
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-stone-200/60">
                    <div
                      className="h-full bg-amber-500 rounded-l-full transition-all duration-500"
                      style={{
                        width: `${Math.max(myOccupied > 0 ? 8 : 0, Math.round((myOccupied / (myTables.length || 1)) * 100))}%`,
                      }}
                      title={`${myOccupied} Occupied`}
                    />
                    {myBilling > 0 && (
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(8, Math.round((myBilling / (myTables.length || 1)) * 100))}%`,
                        }}
                        title={`${myBilling} Billing`}
                      />
                    )}
                    <div
                      className="h-full bg-emerald-500 rounded-r-full transition-all duration-500 flex-1"
                      title={`${myVacant} Vacant`}
                    />
                  </div>

                  {/* Section 4-table interactive cards */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {myTables.map((tbl) => (
                      <div
                        key={tbl.id}
                        className={`p-2.5 rounded-xl border text-center transition ${
                          tbl.status === 'OCCUPIED'
                            ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                            : tbl.status === 'BILLING'
                            ? 'bg-purple-50/80 border-purple-300 text-purple-900'
                            : 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                        }`}
                      >
                        <span className="font-mono text-xs font-black block">{tbl.number}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                          {tbl.status === 'OCCUPIED'
                            ? `${tbl.guestCount || 2} Guests`
                            : tbl.status === 'BILLING'
                            ? 'Billing'
                            : 'Vacant'}
                        </span>
                        <span className="text-[9.5px] font-mono text-stone-500 block mt-0.5">
                          {tbl.currentBill > 0 ? `₹${tbl.currentBill}` : 'Ready'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Restaurant-Wide Floor Scope (34 Tables) & Kitchen Speed */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs space-y-3.5">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-[#9C3D1E]/10 text-[#9C3D1E] flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                        Entire Restaurant Floor Scope
                      </span>
                      <p className="text-[11px] text-stone-500">
                        All 34 tables across 5 dining zones
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-[#9C3D1E] block">
                      ₹{totalActiveBill.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Active floor bill
                    </span>
                  </div>
                </div>

                {/* 3 Balanced Summary Pills: Total Occupied, Total Billing, Total Vacant */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE5DF] flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">Occupied</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {totalOccupied} Tables
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE5DF] flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">Billing</span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {totalBilling} Tables
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE5DF] flex items-center justify-between">
                    <span className="text-[11px] text-stone-500 font-medium">Vacant</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {totalVacant} Tables
                    </span>
                  </div>
                </div>

                {/* Kitchen Pass & Staff Tips Sub-bar */}
                <div className="pt-3 border-t border-[#EAE5DF] flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        readyTickets.length > 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {readyTickets.length}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">Kitchen Pass</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            readyTickets.length > 0
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {readyTickets.length > 0 ? `${readyTickets.length} Dishes Ready` : 'Pass Clear'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                        Avg table turnaround: {shiftStats?.avgTurnaroundMinutes || 38} mins
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
