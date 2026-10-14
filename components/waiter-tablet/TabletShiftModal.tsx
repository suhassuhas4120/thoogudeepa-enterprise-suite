'use client';

import React from 'react';
import {
  X,
  TrendingUp,
  IndianRupee,
  Clock,
  Smartphone,
  Banknote,
  CreditCard,
  Layers,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useWaiterStore } from '../../store/useWaiterStore';
import { formatSectionName } from './TabletFloorMap';

interface Props {
  open: boolean;
  onClose: () => void;
  captainName: string;
  sectionName?: string;
}

const SECTION_MATCH_MAP: Record<string, string[]> = {
  'SECTION A': ['Express / Couple Hall', 'Section A', 'SECTION A', 'SEC_A'],
  'Section A': ['Express / Couple Hall', 'Section A', 'SECTION A', 'SEC_A'],
  'SECTION B': ['Main Dining Hall', 'Section B', 'SECTION B', 'SEC_B'],
  'Section B': ['Main Dining Hall', 'Section B', 'SECTION B', 'SEC_B'],
  'SECTION C': ['Family Section', 'Section C', 'SECTION C', 'SEC_C'],
  'Section C': ['Family Section', 'Section C', 'SECTION C', 'SEC_C'],
  'SECTION D': ['Courtyard Garden', 'Grand Feast Hall', 'Section D', 'SECTION D', 'SEC_D'],
  'Section D': ['Courtyard Garden', 'Grand Feast Hall', 'Section D', 'SECTION D', 'SEC_D'],
};

export function TabletShiftModal({ open, onClose, captainName, sectionName }: Props) {
  const { tables, kdsTickets, shiftStats } = useSharedBridge();
  const { activeSection } = useWaiterStore();

  const currentSection = sectionName || activeSection || 'Section A';

  // Waiter's assigned tables (Station Tables in Section A, B, C, or D)
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

  // Ready food tickets waiting at pass
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  const shiftRevenue = shiftStats?.totalRevenue || 18450;
  const shiftOrders = shiftStats?.tablesServed || 42;
  const cashTotal = Math.round(shiftRevenue * 0.35);
  const upiTotal = Math.round(shiftRevenue * 0.55);
  const cardTotal = Math.round(shiftRevenue * 0.10);

  const displaySectionTitle = formatSectionName(currentSection);

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

          {/* Modal Card - Constrained height so it stays within viewport with smooth inner scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative w-[620px] max-w-full h-[710px] max-h-[86vh] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#EAE5DF] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-md shadow-[#9C3D1E]/20 shrink-0">
                  <TrendingUp className="h-5.5 w-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-stone-900 tracking-tight">Shift Performance</h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Duty
                    </span>
                  </div>
                  <p className="text-xs font-medium text-stone-600 mt-0.5 truncate">
                    Steward: <span className="font-bold text-stone-900">{captainName || 'Floor Steward'}</span> · {displaySectionTitle}
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

            {/* Content Body tailored specifically for the waiter */}
            <div className="p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-4">

              {/* 1. Waiter's Personal Revenue & Collections */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs shrink-0 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-md shadow-[#9C3D1E]/20 shrink-0">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        My Total Shift Revenue
                      </span>
                      <div className="text-3xl font-black text-[#9C3D1E] tracking-tight mt-0.5">
                        ₹{shiftRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-white border border-[#EAE5DF] rounded-xl text-xs font-bold text-stone-800 shadow-2xs">
                      {shiftOrders} Orders Settled
                    </span>
                    <p className="text-xs font-medium text-stone-500 mt-1">
                      Avg ₹{Math.round(shiftRevenue / (shiftOrders || 1))} / order
                    </p>
                  </div>
                </div>

                {/* 3 Payment Modes Breakdown with large readable text */}
                <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-[#EAE5DF]">
                  {/* UPI */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                        <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>UPI Digital</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {Math.round((upiTotal / shiftRevenue) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-stone-900 mt-1.5 font-mono">
                      ₹{upiTotal.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      QR / Instant Pay
                    </span>
                  </div>

                  {/* Cash */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                        <Banknote className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Cash Drawer</span>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {Math.round((cashTotal / shiftRevenue) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-stone-900 mt-1.5 font-mono">
                      ₹{cashTotal.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Physical Register
                    </span>
                  </div>

                  {/* Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                        <CreditCard className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>Card / EDC</span>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {Math.round((cardTotal / shiftRevenue) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-black text-stone-900 mt-1.5 font-mono">
                      ₹{cardTotal.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Swiped EDC Slips
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Waiter's Assigned Section (4 Tables) */}
              <div className="bg-white border border-[#EAE5DF] rounded-2xl p-5 shadow-2xs space-y-4 shrink-0">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-stone-900">
                          My Assigned Tables ({myTables.length} Tables)
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {displaySectionTitle}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Tables {myTables.map((t) => t.number).join(', ')} assigned to your station
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-stone-900 block">
                      {myOccupied} / {myTables.length} Seated
                    </span>
                    <p className="text-xs font-bold text-amber-800">
                      ₹{myBill.toLocaleString()} active bill
                    </p>
                  </div>
                </div>

                {/* Progress Bar for Section Occupancy */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-800 font-bold">
                      Section Capacity: {myOccupancyRate}% Occupied
                    </span>
                    <span className="text-stone-600 font-semibold">
                      {myCovers} guests currently seated
                    </span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-stone-200/60">
                    <div
                      className="h-full bg-amber-500 rounded-l-full transition-all duration-500"
                      style={{
                        width: `${Math.max(myOccupied > 0 ? 10 : 0, Math.round((myOccupied / (myTables.length || 1)) * 100))}%`,
                      }}
                      title={`${myOccupied} Occupied`}
                    />
                    {myBilling > 0 && (
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{
                          width: `${Math.max(10, Math.round((myBilling / (myTables.length || 1)) * 100))}%`,
                        }}
                        title={`${myBilling} Billing`}
                      />
                    )}
                    <div
                      className="h-full bg-emerald-500 rounded-r-full transition-all duration-500 flex-1"
                      title={`${myVacant} Vacant`}
                    />
                  </div>
                </div>

                {/* 2x2 Grid for the 4 Assigned Tables - Clean, spacious, and large text */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {myTables.map((tbl) => (
                    <div
                      key={tbl.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        tbl.status === 'OCCUPIED'
                          ? 'bg-amber-50/80 border-amber-300'
                          : tbl.status === 'BILLING'
                          ? 'bg-purple-50/80 border-purple-300'
                          : 'bg-emerald-50/80 border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-mono text-sm font-black text-stone-900 shadow-2xs">
                          {tbl.number}
                        </span>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                            tbl.status === 'OCCUPIED'
                              ? 'bg-amber-600 text-white'
                              : tbl.status === 'BILLING'
                              ? 'bg-purple-700 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {tbl.status === 'OCCUPIED'
                              ? `${tbl.guestCount || 2} Guests`
                              : tbl.status === 'BILLING'
                              ? 'Bill Printed'
                              : 'Vacant Ready'}
                          </span>
                          <p className="text-xs text-stone-600 font-medium mt-0.5">
                            Capacity: {tbl.capacity || 2} Chairs
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-stone-900 block font-mono">
                          {tbl.currentBill > 0 ? `₹${tbl.currentBill}` : '₹0'}
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {tbl.currentBill > 0 ? 'Current Bill' : 'Ready'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Waiter Speed & Tips Intelligence */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-4.5 shadow-2xs shrink-0">
                <div className="grid grid-cols-3 gap-3">
                  {/* Tips */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] flex items-center gap-3 shadow-2xs">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        My Tips Earned
                      </span>
                      <div className="text-lg font-black text-emerald-700 mt-0.5 font-mono">
                        ₹{(shiftStats?.tipsEarned || 850).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Kitchen Pass */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] flex items-center gap-3 shadow-2xs">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      readyTickets.length > 0
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      <span className="font-black text-sm font-mono">{readyTickets.length}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        Kitchen Pass
                      </span>
                      <div className="text-xs font-bold text-stone-900 mt-0.5 truncate">
                        {readyTickets.length > 0 ? `${readyTickets.length} Dishes Ready` : 'All Clear'}
                      </div>
                    </div>
                  </div>

                  {/* Turnaround Pace */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#EAE5DF] flex items-center gap-3 shadow-2xs">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                        Avg Turn Time
                      </span>
                      <div className="text-lg font-black text-stone-900 mt-0.5 font-mono">
                        {shiftStats?.avgTurnaroundMinutes || 38} mins
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EAE5DF] flex items-center justify-between shrink-0">
              <span className="text-xs text-stone-400 font-medium">
                Thoogudeepa Enterprise System · Auto-synced with floor
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#9C3D1E] hover:bg-[#7D2F17] active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
