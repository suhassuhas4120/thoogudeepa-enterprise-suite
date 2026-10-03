'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Utensils,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Flame,
  Link2,
  Users,
  Armchair,
  Split,
  Plus,
  Receipt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  onClose: () => void;
  onGoToOrder: () => void;
  onGoToSettle: () => void;
  onVacated: () => void;
}

function statusBadge(status: string) {
  switch (status) {
    case 'OCCUPIED': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'BILLING':  return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'CLEANING': return 'bg-stone-200 text-stone-700 border-stone-300';
    default:         return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
}

export function ScreenM3TableSheet({ tableNum, onClose, onGoToOrder, onGoToSettle, onVacated }: Props) {
  const {
    tables,
    kdsTickets,
    waiterVacatesTable,
    waiterMergeTables,
    waiterUnmergeTable,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const [confirmVacate, setConfirmVacate] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<'ALL' | number>('ALL');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTab, setMergeTab] = useState<'TABLE' | 'SEATS'>('TABLE');
  const [targetMergeTable, setTargetMergeTable] = useState('');
  const [selectedSeatsToMerge, setSelectedSeatsToMerge] = useState<number[]>([]);
  const [mergedSeatGroups, setMergedSeatGroups] = useState<Record<string, number[]>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const table = tables.find((t) => t.number === tableNum);
  const tickets = kdsTickets.filter((tk) => tk.tableNumber === tableNum);
  const candidateTables = tables.filter((t) => t.number !== tableNum);

  if (!table) return null;

  const isMerged = Boolean(table.mergedWith);
  const totalChairs = table.capacity || 4;
  const occupiedChairsCount =
    table.status === 'OCCUPIED' || table.status === 'BILLING'
      ? Math.min(totalChairs, Math.max(1, table.guestCount || (table.activeItems && table.activeItems.length > 0 ? 2 : 1)))
      : 0;

  // Check if any items are ready to serve
  const readyTickets = tickets.filter((tk) => tk.status === 'READY');
  const hasReadyFood = readyTickets.length > 0 || table.activeItems?.some((it) => it.status === 'Ready');

  const handleServeReadyFood = () => {
    readyTickets.forEach((tk) => {
      tk.items.forEach((it) => waiterMarkKitchenItemServed(tk.id, it.id));
    });
    setNotice('✓ Ready dishes marked as served');
    setTimeout(() => setNotice(null), 2000);
  };

  const handleVacate = () => {
    waiterVacatesTable(tableNum);
    setConfirmVacate(false);
    onVacated();
  };

  const handleConfirmTableMerge = () => {
    if (!targetMergeTable) return;
    waiterMergeTables(tableNum, targetMergeTable);
    setShowMergeModal(false);
    setNotice(`Table ${tableNum} merged with ${targetMergeTable}`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleConfirmTableUnmerge = () => {
    waiterUnmergeTable(tableNum);
    setNotice(`Table ${tableNum} unmerged successfully`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleToggleSeatForMerge = (seatNum: number) => {
    setSelectedSeatsToMerge((prev) =>
      prev.includes(seatNum) ? prev.filter((s) => s !== seatNum) : [...prev, seatNum]
    );
  };

  const handleApplySeatMerge = () => {
    if (selectedSeatsToMerge.length < 2) return;
    const groupKey = `Group-${Date.now()}`;
    setMergedSeatGroups((prev) => ({ ...prev, [groupKey]: selectedSeatsToMerge }));
    setShowMergeModal(false);
    setNotice(`Seats ${selectedSeatsToMerge.join(' & ')} combined into single check`);
    setSelectedSeatsToMerge([]);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleSplitSeatGroup = (groupKey: string) => {
    setMergedSeatGroups((prev) => {
      const next = { ...prev };
      delete next[groupKey];
      return next;
    });
    setNotice('Seats split into individual billing');
    setTimeout(() => setNotice(null), 2000);
  };

  // Tax calculation
  const subtotal = table.currentBill || 0;
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const totalTax = cgst + sgst;
  const grandTotal = subtotal + totalTax;

  // Individual Chair Share (Estimate or equal split per occupied chair)
  const perChairSubtotal = occupiedChairsCount > 0 ? Math.round(subtotal / occupiedChairsCount) : 0;
  const perChairTax = perChairSubtotal * 0.05;
  const perChairTotal = perChairSubtotal + perChairTax;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-40 max-w-md mx-auto"
        />

        {/* Bottom Drawer Sheet */}
        <motion.div
          key="drawer"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50 bg-white rounded-t-3xl shadow-2xl border-t border-[#EAE5DF] max-h-[92vh] flex flex-col font-sans"
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-2.5 pb-1 shrink-0">
            <div className="h-1.5 w-12 bg-stone-300 rounded-full" />
          </div>

          <div className="px-5 pb-6 pt-1 space-y-3.5 overflow-y-auto flex-1">

            {/* Table Header Identity */}
            <div className="flex items-start justify-between pb-3 border-b border-[#EAE5DF]">
              <div>
                <p className="font-mono text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                  {table.section}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                    {table.number}
                  </h2>
                  {isMerged && (
                    <span className="font-mono text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <Link2 className="h-3 w-3 text-purple-700" />
                      <span>Merged with {table.mergedWith}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge(table.status)}`}>
                    {table.status}
                  </span>
                  <span className="font-mono text-base font-black text-stone-900">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    (Inc. 5% GST)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-[#FAF8F5] hover:bg-stone-200 rounded-xl transition cursor-pointer"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {/* Temporary Notice Banner */}
            {notice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold font-mono rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{notice}</span>
              </div>
            )}

            {/* ── CHAIR / SEAT SELECTOR CAROUSEL ── */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span className="font-black text-stone-600 uppercase tracking-wider flex items-center gap-1">
                  <Armchair className="h-3.5 w-3.5 text-[#9C3D1E]" />
                  <span>Chair &amp; Seat Navigation:</span>
                </span>
                <span className="text-stone-400 font-bold">
                  {occupiedChairsCount} / {totalChairs} Occupied
                </span>
              </div>

              {/* Horizontal Scroll of Chair Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Tab: All Chairs */}
                <button
                  type="button"
                  onClick={() => setSelectedSeat('ALL')}
                  className={`px-3 py-2 rounded-xl font-mono text-xs font-black border transition shrink-0 flex flex-col items-center min-w-[76px] ${
                    selectedSeat === 'ALL'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>All Table</span>
                  <span className="text-[9.5px] opacity-80 mt-0.5">₹{grandTotal.toFixed(0)}</span>
                </button>

                {/* Individual Chairs 1..N */}
                {Array.from({ length: totalChairs }).map((_, idx) => {
                  const seatNum = idx + 1;
                  const isSeated = seatNum <= occupiedChairsCount;
                  const isSelected = selectedSeat === seatNum;

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      onClick={() => setSelectedSeat(seatNum)}
                      className={`px-2.5 py-2 rounded-xl font-mono text-xs font-bold border transition shrink-0 flex flex-col items-center min-w-[70px] ${
                        isSelected
                          ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                          : isSeated
                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-stone-400 border-dashed border-stone-300 hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>Chair {seatNum}</span>
                        {isSeated && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                      </div>
                      <span className="text-[9px] font-mono mt-0.5">
                        {isSeated ? `₹${perChairTotal.toFixed(0)}` : 'Vacant'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── CHAIR-SPECIFIC OR TABLE-WIDE ORDER BREAKDOWN ── */}
            <div className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl space-y-2.5 font-mono">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                <span className="font-black text-xs text-stone-800 uppercase">
                  {selectedSeat === 'ALL' ? 'Table Consolidated Check' : `Individual Chair ${selectedSeat} Details`}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                  selectedSeat === 'ALL'
                    ? statusBadge(table.status)
                    : selectedSeat <= occupiedChairsCount
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {selectedSeat === 'ALL' ? table.status : selectedSeat <= occupiedChairsCount ? 'Seated' : 'Available'}
                </span>
              </div>

              {/* Items List */}
              {selectedSeat === 'ALL' ? (
                // All items across tickets
                tickets.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {tickets.map((tk) => (
                      <div key={tk.id} className="p-2 bg-white border border-stone-200 rounded-xl space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#9C3D1E]">
                          <span>KOT #{tk.id.slice(-4)}</span>
                          <span className="text-stone-500">{tk.status}</span>
                        </div>
                        {tk.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-xs text-stone-700">
                            <span>{it.quantity}× {it.name}</span>
                            <span className="text-stone-500">{it.stage}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-stone-400 text-xs">No active orders fired yet</p>
                )
              ) : (
                // Individual Chair breakdown
                <div className="space-y-2 py-1">
                  {selectedSeat <= occupiedChairsCount ? (
                    <>
                      <div className="flex justify-between text-xs text-stone-700">
                        <span>Guest Assigned:</span>
                        <span className="font-bold text-stone-900">Seat {selectedSeat} Guest</span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-700">
                        <span>Food Share:</span>
                        <span className="font-bold text-stone-900">₹{perChairSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-700">
                        <span>GST (5%):</span>
                        <span>₹{perChairTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-stone-900 pt-1 border-t border-stone-300">
                        <span>Chair {selectedSeat} Total:</span>
                        <span className="text-[#9C3D1E]">₹{perChairTotal.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-3 text-stone-400 text-xs">
                      Chair {selectedSeat} is currently unoccupied. Tap "Add Dishes" below to seat guests here.
                    </div>
                  )}
                </div>
              )}

              {/* Total Calculation Row */}
              <div className="pt-2 border-t border-stone-300 flex justify-between items-center text-xs">
                <span className="text-stone-500">Subtotal: ₹{(selectedSeat === 'ALL' ? subtotal : perChairSubtotal).toFixed(2)}</span>
                <span className="font-black text-sm text-[#9C3D1E]">
                  Due: ₹{(selectedSeat === 'ALL' ? grandTotal : perChairTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── DYNAMIC TABLE MERGE & SEAT MERGE CONTROLLER ── */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              {/* Table Merge / Unmerge */}
              {isMerged ? (
                <button
                  type="button"
                  onClick={handleConfirmTableUnmerge}
                  className="py-2.5 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                >
                  <Link2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Unmerge Table</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMergeTab('TABLE'); setShowMergeModal(true); }}
                  className="py-2.5 px-3 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                >
                  <Link2 className="h-3.5 w-3.5 text-purple-700" />
                  <span>Merge Table</span>
                </button>
              )}

              {/* Seat Merge / Split */}
              <button
                type="button"
                onClick={() => { setMergeTab('SEATS'); setShowMergeModal(true); }}
                className="py-2.5 px-3 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <Users className="h-3.5 w-3.5 text-indigo-700" />
                <span>Merge Seats</span>
              </button>
            </div>

            {/* Display Active Seat Groups if any */}
            {Object.keys(mergedSeatGroups).length > 0 && (
              <div className="space-y-1.5 font-mono text-xs">
                {Object.entries(mergedSeatGroups).map(([k, group]) => (
                  <div key={k} className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-indigo-900">
                      Combined Check: Chairs {group.join(' & ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSplitSeatGroup(k)}
                      className="px-2 py-0.5 bg-white border border-indigo-300 text-indigo-700 font-black rounded-lg text-[10px]"
                    >
                      Split Back
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── ACTION BUTTONS FOOTER ── */}
            <div className="space-y-2.5 pt-1">
              {/* Ready Food Serve Button (Pulsing Green) */}
              {hasReadyFood && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleServeReadyFood}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black shadow-md flex items-center justify-center gap-2 transition cursor-pointer animate-pulse"
                >
                  <Utensils className="h-4 w-4" />
                  <span>🍽️ Serve Ready Food to Table</span>
                </motion.button>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onGoToOrder}
                  className="py-3 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>{selectedSeat === 'ALL' ? 'Add Dishes' : `Add for Chair ${selectedSeat}`}</span>
                </button>

                <button
                  type="button"
                  onClick={onGoToSettle}
                  className="py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
                >
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span>Settle Bill</span>
                </button>
              </div>

              {/* Vacate Table Guard */}
              {!confirmVacate ? (
                <button
                  type="button"
                  onClick={() => setConfirmVacate(true)}
                  className="w-full py-2.5 bg-[#FAF8F5] hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Vacate &amp; Clean {table.number}</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
                  <p className="text-center font-mono text-xs font-bold text-rose-800">
                    Confirm vacate and reset {table.number}?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmVacate(false)}
                      className="py-2 bg-white border border-stone-300 text-stone-700 rounded-lg font-mono text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVacate}
                      className="py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Yes, Vacate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>

        {/* ── MERGE TABLE / MERGE SEATS MODAL ── */}
        <AnimatePresence>
          {showMergeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 flex items-end justify-center p-3 font-mono"
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="w-full max-w-sm bg-white rounded-3xl p-4 border border-[#EAE5DF] shadow-2xl space-y-3"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900 font-black text-sm">
                    <Link2 className="h-4 w-4 text-[#9C3D1E]" />
                    <span>{mergeTab === 'TABLE' ? 'Merge Tables' : 'Merge Seats'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMergeModal(false)}
                    className="h-7 w-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Sub Tab: Table vs Seats */}
                <div className="flex gap-2 p-1 bg-stone-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMergeTab('TABLE')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      mergeTab === 'TABLE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    Table Merge
                  </button>
                  <button
                    type="button"
                    onClick={() => setMergeTab('SEATS')}
                    className={`flex-1 py-1.5 rounded-lg transition ${
                      mergeTab === 'SEATS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    Seat Merge
                  </button>
                </div>

                {/* Mode 1: Table Merge */}
                {mergeTab === 'TABLE' && (
                  <div className="space-y-3 py-1">
                    <p className="text-xs text-stone-600 font-semibold">
                      Merge {table.number} with candidate table:
                    </p>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                      {candidateTables.slice(0, 15).map((ct) => (
                        <button
                          key={ct.id}
                          type="button"
                          onClick={() => setTargetMergeTable(ct.number)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-black border transition ${
                            targetMergeTable === ct.number
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {ct.number}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMergeModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmTableMerge}
                        disabled={!targetMergeTable}
                        className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black disabled:opacity-40"
                      >
                        Confirm Merge
                      </button>
                    </div>
                  </div>
                )}

                {/* Mode 2: Seat Merge */}
                {mergeTab === 'SEATS' && (
                  <div className="space-y-3 py-1">
                    <p className="text-xs text-stone-600 font-semibold">
                      Select chairs in {table.number} to combine on one check:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: totalChairs }).map((_, idx) => {
                        const seatNum = idx + 1;
                        const isChecked = selectedSeatsToMerge.includes(seatNum);
                        return (
                          <button
                            key={seatNum}
                            type="button"
                            onClick={() => handleToggleSeatForMerge(seatNum)}
                            className={`p-2.5 rounded-xl text-xs font-black border text-center transition ${
                              isChecked
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-stone-50 text-stone-800 border-stone-200'
                            }`}
                          >
                            Chair {seatNum}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMergeModal(false)}
                        className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplySeatMerge}
                        disabled={selectedSeatsToMerge.length < 2}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black disabled:opacity-40"
                      >
                        Combine ({selectedSeatsToMerge.length})
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </AnimatePresence>
  );
}
