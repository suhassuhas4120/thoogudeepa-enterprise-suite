'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Users, UtensilsCrossed, Link2, Unlink, Clock, AlertCircle, Utensils, CreditCard, UserX } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  selectedTableNum: string;
  selectedSection: string;
  searchQuery?: string;
  onSelectTable: (num: string) => void;
  /** Double-tap on an occupied table → go straight to payment panel */
  onSelectTableToPayment?: (num: string) => void;
  /** Opens the merge modal directly for this table */
  onOpenMerge?: (num: string) => void;
}

function tileStyle(status: SharedTable['status'], isSelected: boolean) {
  if (isSelected) {
    return 'border-2 border-[#9C3D1E] bg-[#FFF8F5] ring-4 ring-[#9C3D1E]/20 shadow-lg scale-[1.02]';
  }
  switch (status) {
    case 'OCCUPIED':
      return 'border-2 border-amber-400 bg-white hover:border-amber-500 hover:shadow-md';
    case 'BILLING':
      return 'border-2 border-purple-400 bg-white hover:border-purple-500 hover:shadow-md';
    case 'CLEANING':
      return 'border-2 border-stone-400 bg-stone-100 hover:border-stone-500 hover:shadow-md';
    default:
      return 'border-2 border-emerald-400 bg-white hover:border-emerald-500 hover:shadow-md';
  }
}

function badgeStyle(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED':
      return 'text-white bg-amber-600 border-amber-700 shadow-2xs';
    case 'BILLING':
      return 'text-white bg-purple-700 border-purple-800 shadow-2xs';
    case 'CLEANING':
      return 'text-stone-900 bg-stone-300 border-stone-400 shadow-2xs';
    default:
      return 'text-white bg-emerald-600 border-emerald-700 shadow-2xs';
  }
}

const SECTIONS = [
  'ALL',
  'Express / Couple Hall',
  'Main Dining Hall',
  'Family Section',
  'Courtyard Garden',
  'Grand Feast Hall',
];

export function TabletFloorMap({
  selectedTableNum,
  selectedSection,
  searchQuery = '',
  onSelectTable,
  onSelectTableToPayment,
  onOpenMerge,
}: Props) {
  const { tables, pings, kdsTickets, waiterSeatsGuests, waiterVacatesTable, waiterMergeTables, waiterUnmergeTable } = useSharedBridge();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OCCUPIED' | 'VACANT' | 'BILLING' | 'READY'>('ALL');

  // ── Drag & Drop table merging via Framer Motion pointer gestures (smooth 60fps, zero flickering) ──
  const cardDragX = useMotionValue(0);
  const cardDragY = useMotionValue(0);
  const [holdingTable, setHoldingTable] = useState<string | null>(null);
  const holdingTableRef = useRef<string | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const activePidRef = useRef<number | null>(null);
  const [mergeToast, setMergeToast] = useState<string | null>(null);

  const springBack = () => {
    animate(cardDragX, 0, { type: 'spring', stiffness: 500, damping: 35 });
    animate(cardDragY, 0, { type: 'spring', stiffness: 500, damping: 35 });
  };

  const startTableHold = (
    tableNum: string,
    pointerId: number,
    startX: number,
    startY: number,
    allMemberNums: string[],
  ) => {
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      cardDragX.set(0);
      cardDragY.set(0);
      dragStartPos.current = { x: startX, y: startY };
      setHoldingTable(tableNum);
      holdingTableRef.current = tableNum;
      activePidRef.current = pointerId;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(35); } catch {}
      }

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        ev.preventDefault();
        cardDragX.set(ev.clientX - dragStartPos.current.x);
        cardDragY.set(ev.clientY - dragStartPos.current.y);
      };

      const onEnd = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);

        if (ev.type === 'pointerup') {
          const allEls = document.elementsFromPoint(ev.clientX, ev.clientY);
          const targetEl = allEls.find((el) => {
            const num = el.getAttribute('data-tablenum');
            return num && !allMemberNums.includes(num);
          });
          if (targetEl) {
            const targetNum = targetEl.getAttribute('data-tablenum')!;
            waiterMergeTables(tableNum, targetNum);
            setMergeToast(`Table ${tableNum} merged with Table ${targetNum}`);
            setTimeout(() => setMergeToast(null), 2500);
          }
        }

        springBack();
        setHoldingTable(null);
        setTimeout(() => {
          holdingTableRef.current = null;
          activePidRef.current = null;
        }, 50);
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onEnd);
      window.addEventListener('pointercancel', onEnd);
    }, 450);
  };

  const cancelTableHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // ── Long-press context bubble state ──
  const [bubbleTable, setBubbleTable] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ── Double-tap detection ──
  const lastTapRef = useRef<{ num: string; time: number } | null>(null);

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const urgentSet = new Set(activePings.map((p) => p.tableNumber));

  // Compute elapsed minutes safely (avoid negative time post-midnight)
  const getElapsedMins = (seatedAt?: string) => {
    if (!seatedAt || seatedAt === '--') return 0;
    const parts = seatedAt.split(':');
    if (parts.length >= 2) {
      const now = new Date();
      const seatedTime = new Date();
      seatedTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      let diffMs = now.getTime() - seatedTime.getTime();
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
      return Math.max(1, Math.round(diffMs / 60000));
    }
    return 0;
  };

  const visible = tables.filter((t) => {
    // Section match
    if (selectedSection !== 'ALL' && t.section !== selectedSection) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = t.number.toLowerCase().includes(q);
      const matchSec = t.section.toLowerCase().includes(q);
      const matchServer = t.serverName?.toLowerCase().includes(q);
      if (!matchNum && !matchSec && !matchServer) return false;
    }

    // Status filter
    if (statusFilter === 'READY') {
      const tblKOTs = kdsTickets.filter((tk) => tk.tableNumber === t.number);
      return tblKOTs.some((tk) => tk.status === 'READY');
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

    return true;
  });

  // ── Unified Tables Computation (Merged tables form ONE single card) ──
  const seenGroupIds = new Set<string>();

  interface UnifiedTableEntry {
    id: string;
    primary: SharedTable;
    allMembers: SharedTable[];
    isMerged: boolean;
    displayNumber: string;
    totalCapacity: number;
    totalBill: number;
    kotCount: number;
    readyCount: number;
    status: SharedTable['status'];
    section: string;
    hasPing: boolean;
    elapsedMins: number;
    memberNumbers: string[];
    isSelected: boolean;
  }

  const unifiedList: UnifiedTableEntry[] = [];

  for (const tbl of visible) {
    const peers = tbl.mergeGroupPeers;
    const isMerged = Boolean(peers && peers.length > 1);

    if (isMerged && peers) {
      const groupKey = peers.slice().sort().join('+');
      if (seenGroupIds.has(groupKey)) continue;
      seenGroupIds.add(groupKey);

      const primaryNum = peers.slice().sort()[0];
      const primaryTbl = tables.find((t) => t.number === primaryNum) || tbl;
      const allMembers = peers
        .map((p) => tables.find((t) => t.number === p))
        .filter(Boolean) as SharedTable[];

      const totalCapacity = allMembers.reduce((sum, m) => sum + (m.capacity || 2), 0);
      const totalBill = primaryTbl.currentBill || allMembers.reduce((sum, m) => sum + (m.currentBill || 0), 0);
      const kotCount = allMembers.reduce(
        (sum, m) => sum + kdsTickets.filter((tk) => tk.tableNumber === m.number).length,
        0
      );
      const readyCount = allMembers.reduce(
        (sum, m) => sum + kdsTickets.filter((tk) => tk.tableNumber === m.number && tk.status === 'READY').length,
        0
      );
      const hasPing = allMembers.some((m) => urgentSet.has(m.number));
      const elapsedMins = getElapsedMins(primaryTbl.seatedTime);

      unifiedList.push({
        id: groupKey,
        primary: primaryTbl,
        allMembers,
        isMerged: true,
        displayNumber: peers.slice().sort().join(' + '),
        totalCapacity,
        totalBill,
        kotCount,
        readyCount,
        status: primaryTbl.status,
        section: primaryTbl.section,
        hasPing,
        elapsedMins,
        memberNumbers: peers,
        isSelected: peers.includes(selectedTableNum),
      });
    } else {
      if (seenGroupIds.has(tbl.number)) continue;
      seenGroupIds.add(tbl.number);

      const tblKOTs = kdsTickets.filter((tk) => tk.tableNumber === tbl.number);
      const readyCount = tblKOTs.filter((tk) => tk.status === 'READY').length;

      unifiedList.push({
        id: tbl.number,
        primary: tbl,
        allMembers: [tbl],
        isMerged: false,
        displayNumber: tbl.number,
        totalCapacity: tbl.capacity,
        totalBill: tbl.currentBill || 0,
        kotCount: tblKOTs.length,
        readyCount,
        status: tbl.status,
        section: tbl.section,
        hasPing: urgentSet.has(tbl.number),
        elapsedMins: getElapsedMins(tbl.seatedTime),
        memberNumbers: [tbl.number],
        isSelected: tbl.number === selectedTableNum,
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none font-sans">
      {/* Quick Status Filter Toolbar - High Contrast & Sharp */}
      <div className="px-5 py-3 bg-white border-b-2 border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
        <span className="text-xs font-black text-stone-700 uppercase tracking-wider mr-1">
          Status:
        </span>

        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer border-2 ${
            statusFilter === 'ALL'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
          }`}
        >
          All ({tables.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('OCCUPIED')}
          className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer border-2 ${
            statusFilter === 'OCCUPIED'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
        >
          Dining ({tables.filter((t) => t.status === 'OCCUPIED').length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('VACANT')}
          className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer border-2 ${
            statusFilter === 'VACANT'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          Vacant ({tables.filter((t) => t.status === 'VACANT').length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('BILLING')}
          className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer border-2 ${
            statusFilter === 'BILLING'
              ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
              : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
          }`}
        >
          Billing ({tables.filter((t) => t.status === 'BILLING').length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('READY')}
          className={`px-3.5 py-1.5 rounded-xl font-black transition cursor-pointer border-2 ${
            statusFilter === 'READY'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
          }`}
        >
          Ready at Pass ({kdsTickets.filter((tk) => tk.status === 'READY').length})
        </button>
      </div>

      {/* Grid of Tables - Ultra Sharp, High Quality Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        {unifiedList.length === 0 ? (
          <div className="py-16 text-center font-mono text-sm text-stone-500 space-y-3">
            <AlertCircle className="h-10 w-10 mx-auto text-stone-400 stroke-[2.2]" />
            <p className="font-black text-stone-700">No tables found matching active filter</p>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-stone-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-4 gap-3.5"
            onClick={() => { if (bubbleTable) setBubbleTable(null); }}
          >
            {unifiedList.map((entry) => {
              const tbl = entry.primary;
              const isSelected = entry.isSelected;
              const hasPing = entry.hasPing;
              const readyCount = entry.readyCount;
              const isMerged = entry.isMerged;
              const groupPeers = entry.memberNumbers;
              const elapsedMins = entry.elapsedMins;
              const isOccupied = tbl.status === 'OCCUPIED' || tbl.status === 'BILLING';
              const showBubble = bubbleTable === tbl.number;
              const isBeingHeld = holdingTable === tbl.number;

              // ── Tap handler (single vs double tap) ──
              const onCardClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (showBubble) { setBubbleTable(null); return; }
                const now = Date.now();
                const last = lastTapRef.current;
                if (last && last.num === tbl.number && now - last.time < 350 && isOccupied) {
                  // Double-tap → go straight to payment
                  lastTapRef.current = null;
                  onSelectTableToPayment?.(tbl.number);
                } else {
                  lastTapRef.current = { num: tbl.number, time: now };
                  onSelectTable(tbl.number);
                }
              };

              return (
                <div
                  key={entry.id}
                  className={`relative ${isMerged ? 'col-span-2' : 'col-span-1'}`}
                >
                  <motion.div
                    data-tablenum={tbl.number}
                    style={{
                      x: isBeingHeld ? cardDragX : 0,
                      y: isBeingHeld ? cardDragY : 0,
                      zIndex: isBeingHeld ? 50 : 1,
                    }}
                    animate={isBeingHeld ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.12 }}
                    onPointerDown={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      startTableHold(
                        tbl.number,
                        e.pointerId,
                        e.clientX,
                        e.clientY,
                        groupPeers,
                      );
                      longPressTimer.current = setTimeout(() => {
                        if (!holdingTableRef.current) {
                          setBubbleTable(tbl.number);
                        }
                      }, 500);
                    }}
                    onPointerUp={() => {
                      cancelTableHold();
                      if (longPressTimer.current) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                      }
                    }}
                    onPointerLeave={() => {
                      cancelTableHold();
                      if (longPressTimer.current) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                      }
                    }}
                    onPointerCancel={() => {
                      cancelTableHold();
                      if (longPressTimer.current) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                      }
                    }}
                    onClick={(e) => {
                      if (holdingTableRef.current) return;
                      onCardClick(e);
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between min-h-[128px] relative shadow-xs select-none touch-none ${
                      isBeingHeld
                        ? 'border-2 border-indigo-600 bg-indigo-50/95 ring-4 ring-indigo-400 shadow-2xl cursor-grabbing'
                        : isMerged
                        ? isSelected
                          ? 'border-2 border-indigo-600 bg-indigo-50 ring-4 ring-indigo-300/40 shadow-lg'
                          : 'border-2 border-indigo-400 bg-indigo-50/50 hover:border-indigo-500 hover:shadow-md'
                        : tileStyle(tbl.status, isSelected)
                    }`}
                  >
                    {/* Floating Hold Overlay */}
                    {isBeingHeld && (
                      <div className="absolute inset-0 bg-indigo-600/15 rounded-2xl flex items-center justify-center pointer-events-none border-2 border-indigo-600 z-20">
                        <span className="bg-indigo-700 text-white text-[10.5px] font-black px-3 py-1 rounded-xl shadow-lg font-mono">
                          Drop on table to merge
                        </span>
                      </div>
                    )}

                    {/* Ping Indicator */}
                    {hasPing && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-rose-600 rounded-full animate-ping border-2 border-white shadow-md z-10" />
                    )}
                    {hasPing && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-rose-600 rounded-full border-2 border-white shadow-md z-10 flex items-center justify-center text-white text-[9px] font-black font-mono">
                        !
                      </span>
                    )}

                    {/* Ready food badge */}
                    {readyCount > 0 && (
                      <span className="absolute top-2 right-2 h-6 px-2 bg-blue-600 text-white rounded-full flex items-center gap-1 border-2 border-white shadow-xs font-mono text-[10px] font-black z-10 animate-pulse">
                        <UtensilsCrossed className="h-3 w-3" />
                        <span>{readyCount}</span>
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b-2 border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-black text-stone-950">
                          {entry.displayNumber}
                        </span>
                        {isMerged && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-mono text-[10px] font-black uppercase shadow-2xs">
                            <Link2 className="h-3 w-3" />
                            <span>MERGED</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono text-[10.5px] font-black uppercase px-2 py-0.5 rounded-lg border ${badgeStyle(
                          tbl.status
                        )}`}
                      >
                        {tbl.status}
                      </span>
                    </div>

                    {/* Middle: Bill & Section */}
                    <div className="my-2 font-mono">
                      <div className="flex items-baseline justify-between">
                        <div className="text-xl font-black text-[#9C3D1E]">
                          ₹{entry.totalBill.toLocaleString()}
                        </div>
                        {isMerged && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              waiterUnmergeTable(tbl.number);
                              setMergeToast(`Table ${entry.displayNumber} unmerged`);
                              setTimeout(() => setMergeToast(null), 2000);
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-[10.5px] font-black font-mono cursor-pointer transition active:scale-95 flex items-center gap-1 shadow-2xs"
                          >
                            <Unlink className="h-3 w-3" />
                            <span>Unmerge</span>
                          </button>
                        )}
                      </div>
                      <div className="text-stone-700 text-xs font-bold truncate mt-0.5">
                        {entry.section} {isMerged ? `· ${groupPeers.join(' + ')}` : ''}
                      </div>
                    </div>

                    {/* Bottom: Capacity & Time */}
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-mono text-xs text-stone-700 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-stone-600 stroke-[2.2]" />
                        <span>
                          {entry.totalCapacity} seats {isMerged ? '(Combined)' : ''}
                        </span>
                      </span>
                      {tbl.status === 'OCCUPIED' ? (
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-black text-[11px] ${
                            elapsedMins > 55
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                              : elapsedMins > 35
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{elapsedMins}m</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Vacant
                        </span>
                      )}
                    </div>
                  </motion.div>

                  {/* ── Long-press Context Bubble ── */}
                  <AnimatePresence>
                    {showBubble && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 6 }}
                        transition={{ duration: 0.14 }}
                        className="absolute bottom-[calc(100%+8px)] left-0 z-40 flex gap-1.5 bg-white border-2 border-stone-200 rounded-2xl shadow-xl p-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isOccupied && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setBubbleTable(null);
                                onSelectTableToPayment?.(tbl.number);
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white cursor-pointer transition shadow-xs"
                            >
                              <CreditCard className="h-4 w-4 stroke-[2.4]" />
                              <span className="text-[10px] font-black font-mono whitespace-nowrap">
                                Settle
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBubbleTable(null);
                                onSelectTable(tbl.number);
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer transition border border-stone-300"
                            >
                              <Utensils className="h-4 w-4 stroke-[2.4]" />
                              <span className="text-[10px] font-black font-mono whitespace-nowrap">
                                View
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBubbleTable(null);
                                onOpenMerge?.(tbl.number);
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition shadow-xs"
                            >
                              <Link2 className="h-4 w-4 stroke-[2.4]" />
                              <span className="text-[10px] font-black font-mono whitespace-nowrap">
                                Merge
                              </span>
                            </button>
                            {isMerged && (
                              <button
                                type="button"
                                onClick={() => {
                                  setBubbleTable(null);
                                  waiterUnmergeTable(tbl.number);
                                }}
                                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition shadow-xs"
                              >
                                <Unlink className="h-4 w-4 stroke-[2.4]" />
                                <span className="text-[10px] font-black font-mono whitespace-nowrap">
                                  Unmerge
                                </span>
                              </button>
                            )}
                          </>
                        )}
                        {!isOccupied && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setBubbleTable(null);
                                waiterSeatsGuests(tbl.number, 1, 'Floor Captain');
                                onSelectTable(tbl.number);
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-[#9C3D1E] hover:bg-[#7d3018] text-white cursor-pointer transition"
                            >
                              <Users className="h-4 w-4 stroke-[2.4]" />
                              <span className="text-[10px] font-black font-mono whitespace-nowrap">
                                Seat
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBubbleTable(null);
                                onOpenMerge?.(tbl.number);
                              }}
                              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition shadow-xs"
                            >
                              <Link2 className="h-4 w-4 stroke-[2.4]" />
                              <span className="text-[10px] font-black font-mono whitespace-nowrap">
                                Merge
                              </span>
                            </button>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Floating Merge Notification Toast ── */}
      <AnimatePresence>
        {mergeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white font-mono text-xs font-black px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2.5"
          >
            <Link2 className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
            <span>{mergeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { SECTIONS };

