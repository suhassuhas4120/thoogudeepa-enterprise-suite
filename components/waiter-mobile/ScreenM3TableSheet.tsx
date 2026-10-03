'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  CreditCard,
  Utensils,
  Trash2,
  CheckCircle2,
  Link2,
  Users,
  Armchair,
  Plus,
  FileText,
  Search,
  UtensilsCrossed,
  Split,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  initialSeat?: 'ALL' | number;
  onClose: () => void;
  onGoToOrder: (seatNum?: number) => void;
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

export function ScreenM3TableSheet({
  tableNum,
  initialSeat = 'ALL',
  onClose,
  onGoToOrder,
  onGoToSettle,
  onVacated,
}: Props) {
  const {
    tables,
    kdsTickets,
    waiterVacatesTable,
    waiterMergeTables,
    waiterUnmergeTable,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const [confirmVacate, setConfirmVacate] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<'ALL' | number | string>(initialSeat);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeTab, setMergeTab] = useState<'TABLE' | 'SEATS'>('TABLE');
  const [mergeSearch, setMergeSearch] = useState('');
  const [targetMergeTable, setTargetMergeTable] = useState('');
  const [selectedSeatsToMerge, setSelectedSeatsToMerge] = useState<number[]>([]);
  const [mergedSeatGroups, setMergedSeatGroups] = useState<Record<string, number[]>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const table = tables.find((t) => t.number === tableNum);
  if (!table) return null;

  const isMerged = Boolean(table.mergedWith);
  const partnerTable = isMerged ? tables.find((t) => t.number === table.mergedWith) : null;

  // Candidate tables for merging (exclude self and currently merged partner)
  const candidateTables = tables.filter(
    (t) => t.number !== tableNum && (!table.mergedWith || t.number !== table.mergedWith)
  );

  // Tickets for table (including merged partner table if merged)
  const tickets = kdsTickets.filter(
    (tk) => tk.tableNumber === tableNum || (table.mergedWith && tk.tableNumber === table.mergedWith)
  );

  // Dynamic capacity & bill calculations
  const totalChairs = (table.capacity || 4) + (partnerTable ? (partnerTable.capacity || 4) : 0);
  const subtotal = Math.max(table.currentBill || 0, partnerTable?.currentBill || 0);
  const occupiedChairsCount = Math.min(
    totalChairs,
    Math.max(
      table.guestCount || 0,
      partnerTable?.guestCount || 0,
      table.status === 'OCCUPIED' || table.status === 'BILLING' ? 2 : 0
    )
  );

  // Tax calculation
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const totalTax = cgst + sgst;
  const grandTotal = subtotal + totalTax;

  // Individual Chair Share calculation
  const perChairSubtotal = occupiedChairsCount > 0 ? Math.round(subtotal / occupiedChairsCount) : 0;
  const perChairTax = perChairSubtotal * 0.05;
  const perChairTotal = perChairSubtotal + perChairTax;

  // Check if any items are ready to serve
  const readyTickets = tickets.filter((tk) => tk.status === 'READY');
  const hasReadyFood = readyTickets.length > 0 || table.activeItems?.some((it) => it.status === 'Ready');

  const handleServeReadyFood = () => {
    readyTickets.forEach((tk) => {
      tk.items.forEach((it) => waiterMarkKitchenItemServed(tk.id, it.id));
    });
    setNotice('✓ Ready dishes marked as served to table');
    setTimeout(() => setNotice(null), 2000);
  };

  const handleVacate = () => {
    waiterVacatesTable(tableNum);
    setConfirmVacate(false);
    onVacated();
  };

  // ── Table Merge Logic ──
  const handleConfirmTableMerge = () => {
    if (!targetMergeTable) return;
    waiterMergeTables(tableNum, targetMergeTable);
    setShowMergeModal(false);
    setNotice(`Table ${tableNum} successfully merged with ${targetMergeTable}`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleConfirmTableUnmerge = () => {
    waiterUnmergeTable(tableNum);
    setNotice(`Table ${tableNum} unmerged successfully`);
    setTimeout(() => setNotice(null), 2500);
  };

  // ── Seat Merge Logic ──
  const handleToggleSeatForMerge = (seatNum: number) => {
    setSelectedSeatsToMerge((prev) =>
      prev.includes(seatNum) ? prev.filter((s) => s !== seatNum) : [...prev, seatNum]
    );
  };

  const handleApplySeatMerge = () => {
    if (selectedSeatsToMerge.length < 2) return;
    const sorted = [...selectedSeatsToMerge].sort((a, b) => a - b);
    const groupKey = `Chairs ${sorted.join(' & ')}`;
    setMergedSeatGroups((prev) => ({ ...prev, [groupKey]: sorted }));
    setShowMergeModal(false);
    setSelectedSeat(groupKey);
    setNotice(`${groupKey} combined into single check`);
    setSelectedSeatsToMerge([]);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleSplitSeatGroup = (groupKey: string) => {
    setMergedSeatGroups((prev) => {
      const next = { ...prev };
      delete next[groupKey];
      return next;
    });
    setSelectedSeat('ALL');
    setNotice(`${groupKey} split into individual billing`);
    setTimeout(() => setNotice(null), 2000);
  };

  // Check if current selected seat belongs to an active merged group
  const activeGroup = typeof selectedSeat === 'string' && selectedSeat.startsWith('Chairs ')
    ? { key: selectedSeat, seats: mergedSeatGroups[selectedSeat] || [] }
    : typeof selectedSeat === 'number'
    ? Object.entries(mergedSeatGroups).find(([_, seats]) => seats.includes(selectedSeat))
      ? {
          key: Object.entries(mergedSeatGroups).find(([_, seats]) => seats.includes(selectedSeat as number))![0],
          seats: Object.entries(mergedSeatGroups).find(([_, seats]) => seats.includes(selectedSeat as number))![1],
        }
      : null
    : null;

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">

      {/* Sticky Header: Back to Floor & Table Identity */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-xs font-black text-stone-700 hover:text-[#9C3D1E] py-1 px-2.5 -ml-1 rounded-xl bg-stone-50 hover:bg-[#FFF8F5] border border-[#EAE5DF] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Floor</span>
        </button>

        <div className="flex items-center gap-2">
          {isMerged && (
            <span className="font-mono text-[9.5px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Link2 className="h-3 w-3 text-indigo-700" />
              <span>+{table.mergedWith}</span>
            </span>
          )}
          <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge(table.status)}`}>
            {table.status}
          </span>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

        {/* Temporary Notice Toast */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold font-mono rounded-2xl flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Hero Card: Number, Section & Bill Total */}
        <div className="p-4 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                {table.section}
              </p>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                {table.number}
                {isMerged && <span className="text-stone-400 text-base font-bold ml-1.5">+ {table.mergedWith}</span>}
              </h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-bold block">
                Total Bill (Inc. GST)
              </span>
              <span className="font-mono text-2xl font-black text-stone-900">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between font-mono text-[10.5px] text-stone-500">
            <span>Food: ₹{subtotal.toFixed(2)} + GST: ₹{totalTax.toFixed(2)}</span>
            <span className="text-[#9C3D1E] font-bold">
              {occupiedChairsCount} / {totalChairs} Seats Occupied
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE CHAIR NAVIGATION (LARGE, PROMINENT CHAIRS) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Armchair className="h-4 w-4 text-[#9C3D1E]" />
              <span>Chair Navigation:</span>
            </span>
            <span className="text-stone-400 font-bold text-[10.5px]">
              Tap chair to focus
            </span>
          </div>

          {/* Horizontal Grid of Large Interactive Chair Cards */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none pt-0.5">
            {/* All Table Card */}
            <button
              type="button"
              onClick={() => setSelectedSeat('ALL')}
              className={`p-3 rounded-2xl font-mono text-xs font-black border-2 transition shrink-0 flex flex-col items-center justify-between min-w-[88px] h-[86px] shadow-xs active:scale-95 ${
                selectedSeat === 'ALL'
                  ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900/30'
                  : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              <FileText className="h-5 w-5 mb-0.5" />
              <span>All Table</span>
              <span className="text-[10px] opacity-80">₹{grandTotal.toFixed(0)}</span>
            </button>

            {/* Merged Group Cards (if any) */}
            {Object.entries(mergedSeatGroups).map(([groupKey, groupSeats]) => {
              const isSelected = selectedSeat === groupKey;
              const groupAmt = perChairTotal * groupSeats.length;

              return (
                <button
                  key={groupKey}
                  type="button"
                  onClick={() => setSelectedSeat(groupKey)}
                  className={`p-3 rounded-2xl font-mono text-xs font-black border-2 transition shrink-0 flex flex-col items-center justify-between min-w-[96px] h-[86px] active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                      : 'bg-indigo-50 text-indigo-950 border-indigo-300 hover:bg-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    <span>Group</span>
                  </div>
                  <span className="text-[10.5px] font-bold">₹{groupAmt.toFixed(0)}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-900'
                  }`}>
                    Chairs {groupSeats.join('&')}
                  </span>
                </button>
              );
            })}

            {/* Individual Chairs 1..N */}
            {Array.from({ length: totalChairs }).map((_, idx) => {
              const seatNum = idx + 1;
              const isSeated = seatNum <= occupiedChairsCount;
              const isSelected = selectedSeat === seatNum;
              const inGroup = Object.values(mergedSeatGroups).some((seats) => seats.includes(seatNum));

              return (
                <button
                  key={seatNum}
                  type="button"
                  onClick={() => setSelectedSeat(seatNum)}
                  className={`p-3 rounded-2xl font-mono text-xs font-black border-2 transition shrink-0 flex flex-col items-center justify-between min-w-[86px] h-[86px] active:scale-95 ${
                    isSelected
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-md ring-2 ring-[#9C3D1E]/40 scale-102'
                      : inGroup
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                      : isSeated
                      ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-stone-400 border-dashed border-stone-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Armchair className="h-4 w-4" />
                    <span>Chair {seatNum}</span>
                  </div>
                  <span className={`text-[10.5px] font-bold ${isSelected ? 'text-white' : isSeated ? 'text-[#9C3D1E]' : 'text-stone-400'}`}>
                    {isSeated ? `₹${perChairTotal.toFixed(0)}` : 'Vacant'}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : inGroup
                      ? 'bg-indigo-200 text-indigo-900'
                      : isSeated
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-stone-100 text-stone-400'
                  }`}>
                    {inGroup ? 'Merged' : isSeated ? 'Seated' : 'Empty'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DETAILS PANEL: DYNAMICALLY ISOLATED BY SEAT / GROUP / TABLE ── */}
        <div className="p-4 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs space-y-3 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-stone-900 uppercase">
                {activeGroup
                  ? `Combined Check: ${activeGroup.key}`
                  : selectedSeat === 'ALL'
                  ? 'Table Consolidated Check'
                  : `Chair ${selectedSeat} Breakdown`}
              </span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
              activeGroup
                ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                : selectedSeat === 'ALL'
                ? statusBadge(table.status)
                : Number(selectedSeat) <= occupiedChairsCount
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {activeGroup
                ? 'Combined Seats'
                : selectedSeat === 'ALL'
                ? table.status
                : Number(selectedSeat) <= occupiedChairsCount
                ? 'Seated'
                : 'Available'}
            </span>
          </div>

          {/* Details Breakdown */}
          {activeGroup ? (
            // Combined Seat Group View
            <div className="space-y-3 py-1">
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-indigo-900">
                  <span>Combined Chairs:</span>
                  <span className="font-black">Chairs {activeGroup.seats.join(' & ')}</span>
                </div>
                <div className="flex justify-between text-indigo-900">
                  <span>Food Subtotal ({activeGroup.seats.length} Chairs):</span>
                  <span className="font-bold">₹{(perChairSubtotal * activeGroup.seats.length).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-900">
                  <span>GST (5% Combined):</span>
                  <span>₹{(perChairTax * activeGroup.seats.length).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-950 font-black text-sm pt-1.5 border-t border-indigo-300">
                  <span>Group Total Due:</span>
                  <span className="text-[#9C3D1E]">₹{(perChairTotal * activeGroup.seats.length).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSplitSeatGroup(activeGroup.key)}
                className="w-full py-2.5 bg-white border border-indigo-300 text-indigo-800 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-indigo-50 transition"
              >
                <Split className="h-4 w-4" />
                <span>Split Seats Back to Individual Billing</span>
              </button>
            </div>
          ) : selectedSeat === 'ALL' ? (
            // All Table KOT Tickets & Items
            tickets.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {tickets.map((tk) => (
                  <div key={tk.id} className="p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-black text-[#9C3D1E]">
                      <span>Table {tk.tableNumber} • KOT #{tk.id.slice(-4)}</span>
                      <span className="text-stone-600 font-bold uppercase">{tk.status}</span>
                    </div>
                    {tk.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs text-stone-800">
                        <span><strong>{it.quantity}×</strong> {it.name}</span>
                        <span className="text-stone-500 font-bold text-[10.5px]">{it.stage}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty orders on table with proper icon and single line */
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="h-10 w-10 rounded-2xl bg-[#FFF8F5] border border-[#9C3D1E]/20 flex items-center justify-center text-[#9C3D1E]">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <p className="font-mono text-xs font-bold text-stone-600">
                  No active orders placed on this table yet.
                </p>
              </div>
            )
          ) : (
            // Dedicated Single Chair View
            <div className="space-y-3 py-1">
              {Number(selectedSeat) <= occupiedChairsCount ? (
                <>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-700">
                      <span>Assigned Guest:</span>
                      <span className="font-black text-stone-900">Seat {selectedSeat} Guest</span>
                    </div>
                    <div className="flex justify-between text-stone-700">
                      <span>Food Share (Dine-in):</span>
                      <span className="font-bold text-stone-900">₹{perChairSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-700">
                      <span>GST (5% split):</span>
                      <span>₹{perChairTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-950 font-black text-sm pt-1.5 border-t border-amber-300">
                      <span>Chair {selectedSeat} Total:</span>
                      <span className="text-[#9C3D1E]">₹{perChairTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty chair with proper icon and single line */
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                    <Armchair className="h-5 w-5" />
                  </div>
                  <p className="font-mono text-xs font-bold text-stone-600">
                    Chair {selectedSeat} is currently unoccupied with no orders.
                  </p>
                  <button
                    type="button"
                    onClick={() => onGoToOrder(Number(selectedSeat))}
                    className="px-4 py-2 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl font-mono text-xs font-black inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Seat Guest on Chair {selectedSeat}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subtotal & Due Row */}
          <div className="pt-2.5 border-t border-stone-200 flex justify-between items-center text-xs">
            <span className="text-stone-500">
              Subtotal: ₹{activeGroup
                ? (perChairSubtotal * activeGroup.seats.length).toFixed(2)
                : (selectedSeat === 'ALL' ? subtotal : perChairSubtotal).toFixed(2)}
            </span>
            <span className="font-black text-base text-[#9C3D1E]">
              Total Due: ₹{activeGroup
                ? (perChairTotal * activeGroup.seats.length).toFixed(2)
                : (selectedSeat === 'ALL' ? grandTotal : perChairTotal).toFixed(2)}
            </span>
          </div>
        </div>

        {/* ── TABLE MERGE & SEAT MERGE SECTION ── */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-black text-stone-700 uppercase tracking-wider">
            Merge Operations:
          </span>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
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

            <button
              type="button"
              onClick={() => { setMergeTab('SEATS'); setShowMergeModal(true); }}
              className="py-2.5 px-3 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
            >
              <Users className="h-3.5 w-3.5 text-indigo-700" />
              <span>Merge Seats</span>
            </button>
          </div>

          {/* Active Merged Seat Groups */}
          {Object.keys(mergedSeatGroups).length > 0 && (
            <div className="space-y-1.5 font-mono text-xs pt-1">
              {Object.entries(mergedSeatGroups).map(([k, group]) => (
                <div key={k} className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-indigo-900">
                    Combined Check: Chairs {group.join(' & ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSplitSeatGroup(k)}
                    className="px-2 py-1 bg-white border border-indigo-300 text-indigo-700 font-black rounded-lg text-[10px]"
                  >
                    Split Back
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── READY FOOD SERVE NOTIFICATION & ACTION ── */}
        {hasReadyFood && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleServeReadyFood}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Utensils className="h-4 w-4" />
            <span>🍽️ Serve Ready Food to Table</span>
          </motion.button>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="space-y-2.5 pt-1 pb-6">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onGoToOrder(typeof selectedSeat === 'number' ? selectedSeat : undefined)}
              className="py-3.5 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{selectedSeat === 'ALL' ? 'Add Dishes' : `Add for ${typeof selectedSeat === 'string' ? selectedSeat : `Chair ${selectedSeat}`}`}</span>
            </button>

            <button
              type="button"
              onClick={onGoToSettle}
              className="py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
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
              className="w-full py-2.5 bg-white hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vacate &amp; Clean {table.number}</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
              <p className="text-center font-mono text-xs font-bold text-rose-800">
                Confirm vacate and reset {table.number}?
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setConfirmVacate(false)}
                  className="py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVacate}
                  className="py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Yes, Vacate</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL: TABLE MERGE & SEAT MERGE (DYNAMIC & FULLY FUNCTIONAL) ── */}
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

              {/* Mode 1: Table Merge (Searchable and dynamic across all tables) */}
              {mergeTab === 'TABLE' && (
                <div className="space-y-3 py-1">
                  <p className="text-xs text-stone-600 font-semibold">
                    Merge {table.number} with candidate table:
                  </p>

                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search table (e.g. T-02, T-05)..."
                      value={mergeSearch}
                      onChange={(e) => setMergeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {candidateTables
                      .filter(
                        (ct) =>
                          !mergeSearch.trim() ||
                          ct.number.toLowerCase().includes(mergeSearch.toLowerCase()) ||
                          ct.section.toLowerCase().includes(mergeSearch.toLowerCase())
                      )
                      .map((ct) => (
                        <button
                          key={ct.id}
                          type="button"
                          onClick={() => setTargetMergeTable(ct.number)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-black border transition flex flex-col items-center justify-center ${
                            targetMergeTable === ct.number
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span>{ct.number}</span>
                          <span className={`text-[9px] font-mono mt-0.5 ${targetMergeTable === ct.number ? 'text-purple-200' : 'text-stone-400'}`}>
                            {ct.capacity}p
                          </span>
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

              {/* Mode 2: Seat Merge (Fully interactive chair selection & check combine) */}
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
                          className={`p-2.5 rounded-xl text-xs font-black border text-center transition flex flex-col items-center justify-center ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <Armchair className="h-3.5 w-3.5 mb-1" />
                          <span>Chair {seatNum}</span>
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

    </main>
  );
}
