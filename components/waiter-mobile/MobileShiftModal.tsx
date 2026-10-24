"use client";

import React from "react";
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
  LogOut,
  CheckCircle2,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSharedBridge } from "../../store/useSharedBridge";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  waiterName: string;
  assignedSection: string;
}

const SECTION_MATCH_MAP: Record<string, string[]> = {
  "SECTION A": ["Express / Couple Hall", "Section A", "SECTION A", "SEC_A"],
  "Section A": ["Express / Couple Hall", "Section A", "SECTION A", "SEC_A"],
  "SECTION B": ["Main Dining Hall", "Section B", "SECTION B", "SEC_B"],
  "Section B": ["Main Dining Hall", "Section B", "SECTION B", "SEC_B"],
  "SECTION C": ["Family Section", "Section C", "SECTION C", "SEC_C"],
  "Section C": ["Family Section", "Section C", "SECTION C", "SEC_C"],
  "SECTION D": [
    "Courtyard Garden",
    "Grand Feast Hall",
    "Section D",
    "SECTION D",
    "SEC_D",
  ],
  "Section D": [
    "Courtyard Garden",
    "Grand Feast Hall",
    "Section D",
    "SECTION D",
    "SEC_D",
  ],
};

export function MobileShiftModal({
  open,
  onClose,
  onLogout,
  waiterName,
  assignedSection,
}: Props) {
  const { tables, kdsTickets, shiftStats } = useSharedBridge();

  const currentSection = assignedSection || "ALL";

  const myTables = tables.filter((t) => {
    if (!currentSection || currentSection === "ALL") return true;
    const allowed = SECTION_MATCH_MAP[currentSection] || [currentSection];
    return allowed.some(
      (sec) =>
        t.section.toLowerCase().includes(sec.toLowerCase()) ||
        sec.toLowerCase().includes(t.section.toLowerCase()),
    );
  });

  const myOccupied = myTables.filter((t) => t.status === "OCCUPIED" || t.status === "BILLING").length;
  const myVacant = myTables.filter((t) => t.status === "VACANT").length;
  const myCovers = myTables.reduce(
    (acc, t) =>
      acc + (t.status === "OCCUPIED" || t.status === "BILLING" ? t.guestCount || t.capacity || 2 : 0),
    0,
  );
  const myTotalLiveBill = Math.round(
    myTables.reduce((acc, t) => acc + (t.currentBill || 0), 0) * 1.05
  );

  const readyTickets = kdsTickets.filter((tk) => tk.status === "READY");

  const shiftRevenue = shiftStats?.totalRevenue || 18450;
  const shiftOrders = shiftStats?.tablesServed || 42;
  const cashTotal = Math.round(shiftRevenue * 0.35);
  const upiTotal = Math.round(shiftRevenue * 0.55);
  const cardTotal = Math.round(shiftRevenue * 0.1);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-mono">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          {/* Modal Bottom Sheet / Dialog */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EAE5DF] max-h-[92vh] flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#EAE5DF] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-[#9C3D1E] border border-amber-300 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-stone-900 tracking-tight">
                    Shift Performance
                  </h2>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-bold">
                    <span>{waiterName}</span>
                    <span>•</span>
                    <span className="text-[#9C3D1E] uppercase">
                      {currentSection === "ALL" ? "All Sections" : currentSection}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 active:scale-90 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-3.5">
              {/* Primary Metric: Shift Revenue */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                      Shift Total Collected
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-[#9C3D1E] tracking-tight mt-0.5">
                      ₹{shiftRevenue.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{shiftOrders} Settled</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium block mt-1">
                      Avg ₹{Math.round(shiftRevenue / (shiftOrders || 1))} / order
                    </span>
                  </div>
                </div>

                {/* Payment Methods Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EAE5DF]">
                  <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DF] shadow-2xs">
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold">
                      <Smartphone className="h-3 w-3 text-emerald-600" />
                      <span>UPI</span>
                    </div>
                    <div className="text-xs font-black text-stone-900 mt-1">
                      ₹{upiTotal.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                      {Math.round((upiTotal / (shiftRevenue || 1)) * 100)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DF] shadow-2xs">
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold">
                      <Banknote className="h-3 w-3 text-amber-600" />
                      <span>Cash</span>
                    </div>
                    <div className="text-xs font-black text-stone-900 mt-1">
                      ₹{cashTotal.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9px] text-amber-600 font-bold block mt-0.5">
                      {Math.round((cashTotal / (shiftRevenue || 1)) * 100)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#EAE5DF] shadow-2xs">
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold">
                      <CreditCard className="h-3 w-3 text-blue-600" />
                      <span>Card</span>
                    </div>
                    <div className="text-xs font-black text-stone-900 mt-1">
                      ₹{cardTotal.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[9px] text-blue-600 font-bold block mt-0.5">
                      {Math.round((cardTotal / (shiftRevenue || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Floor / Section Status */}
              <div className="bg-white border border-[#EAE5DF] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#9C3D1E]" />
                    <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
                      Station Floor Summary
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-lg">
                    {myTables.length} Tables Assigned
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 block">Occupied</span>
                    <span className="text-base font-black text-amber-950 mt-0.5 block">{myOccupied}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 block">Vacant</span>
                    <span className="text-base font-black text-emerald-950 mt-0.5 block">{myVacant}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-600 block">Covers</span>
                    <span className="text-base font-black text-stone-900 mt-0.5 block">{myCovers}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-stone-500 font-medium">Running Floor Bill (Taxed):</span>
                  <span className="font-black text-stone-900">₹{myTotalLiveBill.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Kitchen Pace / Turnaround */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white border border-[#EAE5DF] rounded-xl flex items-center gap-2.5 shadow-2xs">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    readyTickets.length > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-stone-400 block uppercase">Kitchen Pass</span>
                    <span className="font-black text-stone-900 text-xs">
                      {readyTickets.length > 0 ? `${readyTickets.length} Ready` : "All Clear"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-[#EAE5DF] rounded-xl flex items-center gap-2.5 shadow-2xs">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-stone-400 block uppercase">Avg Turn Pace</span>
                    <span className="font-black text-stone-900 text-xs">
                      {shiftStats?.avgTurnaroundMinutes || 38} mins
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with End Shift / Log Out moved inside */}
            <div className="p-4 border-t border-[#EAE5DF] bg-[#FAF8F5] shrink-0 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-mono text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>End Shift &amp; Log Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-xs font-bold rounded-xl transition cursor-pointer"
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
