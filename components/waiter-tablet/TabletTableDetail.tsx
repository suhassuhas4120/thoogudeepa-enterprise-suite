'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  Clock,
  Armchair,
  Utensils,
  Flame,
  ShoppingBag,
  Plus,
  CreditCard,
  Link2,
  UserX,
  Split,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';
import { useCustomer } from '../../context/CustomerContext';

interface Props {
  tableNum: string;
  selectedChair: 'ALL' | number | string;
  onSelectChair: (c: 'ALL' | number | string) => void;
  onBackToFloor: () => void;
  onAddDishes: (chairNum?: number) => void;
  onSettle: () => void;
  onSeatGuests: () => void;
  onSplit: () => void;
  onMerge: () => void;
  onVacate: () => void;
  /** Which right panel is currently active — hides the redundant action button */
  activePanelTab?: 'menu' | 'payment';
}

function statusBadge(status: SharedTable['status']) {
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

function itemStagePill(stage: string) {
  if (stage === 'PLATED')
    return 'bg-blue-600 text-white border-blue-700 shadow-2xs animate-pulse';
  if (stage === 'PREP')
    return 'bg-amber-600 text-white border-amber-700 shadow-2xs';
  if (stage === 'SERVED')
    return 'bg-emerald-600 text-white border-emerald-700 shadow-2xs';
  return 'bg-stone-200 text-stone-800 border-stone-300 font-bold';
}

function getElapsed(seatedTime: string): number {
  if (!seatedTime || seatedTime === '--') return 0;
  const parts = seatedTime.split(':');
  if (parts.length < 2) return 0;
  const now = new Date();
  const seated = new Date();
  seated.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  let diff = now.getTime() - seated.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round(diff / 60000));
}

function elapsedColor(mins: number) {
  if (mins < 35) return 'text-emerald-900 bg-emerald-100 border-emerald-300';
  if (mins < 55) return 'text-amber-900 bg-amber-100 border-amber-300';
  return 'text-rose-900 bg-rose-100 border-rose-300 animate-pulse font-black';
}

export function TabletTableDetail({
  tableNum,
  selectedChair,
  onSelectChair,
  onBackToFloor,
  onAddDishes,
  onSettle,
  onSeatGuests,
  onSplit,
  onMerge,
  onVacate,
  activePanelTab,
}: Props) {
  const { tables, kdsTickets, waiterMergeChairs, waiterMergeSeatGroup, waiterUnmergeSeatGroup, waiterSeatsGuests } = useSharedBridge();
  const { cart, addToCart } = useCustomer();

  // ── Drag & Drop & Chair Merging State ──
  const [dragOverTarget, setDragOverTarget] = useState<'ALL' | number | string | null>(null);
  const [dragType, setDragType] = useState<'dish' | 'chair' | null>(null);
  const [isPanelDragOver, setIsPanelDragOver] = useState(false);
  const [mergeChairMode, setMergeChairMode] = useState(false);
  const [chairsSelectedForMerge, setChairsSelectedForMerge] = useState<number[]>([]);

  const table = tables.find((t) => t.number === tableNum);
  if (!table) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-stone-500 font-mono text-sm">
        <Utensils className="h-10 w-10 opacity-40 mb-2 stroke-[2.2]" />
        <span className="font-bold">Table not found</span>
      </div>
    );
  }

  const isVacant = table.status === 'VACANT';
  const elapsed = getElapsed(table.seatedTime);
  const groupPeers =
    table.mergeGroupPeers || (table.mergedWith ? [tableNum, table.mergedWith] : [tableNum]);
  const totalCapacity = groupPeers.reduce(
    (s, p) => s + (tables.find((t) => t.number === p)?.capacity || 2),
    0
  );
  const tickets = isVacant
    ? []
    : kdsTickets.filter((tk) => groupPeers.includes(tk.tableNumber));

  const allItems = tickets.flatMap((tk) =>
    tk.items.map((item) => ({ ...item, tableNum: tk.tableNumber }))
  );

  const mergedSeatGroups = table.mergedSeatGroups || {};
  const groupSeats = Object.values(mergedSeatGroups).flat();

  // Chairs available
  const chairs = Array.from(
    { length: Math.max(totalCapacity, table.guestCount || 1) },
    (_, i) => i + 1
  );

  // Scoped draft items from live cart for this table
  const allTableDraftItems = cart.filter(
    (c) => !c.tableNumber || groupPeers.includes(c.tableNumber)
  );
  const allTableDraftSubtotal = allTableDraftItems.reduce((s, it) => s + it.totalPrice, 0);

  // Table total bill
  const firedSubtotal = allItems.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
  const totalTableBill = Math.max(table.currentBill || 0, firedSubtotal) + allTableDraftSubtotal;

  // Selected chair's target seats
  const targetSeats: number[] =
    selectedChair === 'ALL'
      ? []
      : typeof selectedChair === 'number'
      ? [selectedChair]
      : typeof selectedChair === 'string' && mergedSeatGroups[selectedChair]
      ? mergedSeatGroups[selectedChair]
      : [];

  const displayItems =
    selectedChair === 'ALL'
      ? allItems
      : allItems.filter((it) => it.seatNumber && targetSeats.includes(it.seatNumber));

  const draftItems =
    selectedChair === 'ALL'
      ? allTableDraftItems
      : allTableDraftItems.filter((c) => c.seatNumber && targetSeats.includes(c.seatNumber));
  const draftSubtotal = draftItems.reduce((s, it) => s + it.totalPrice, 0);

  // Target chair bill
  let targetChairBill = 0;
  let chairLabel = 'Total Bill Due';
  if (selectedChair === 'ALL') {
    targetChairBill = totalTableBill;
    chairLabel = 'Total Bill Due';
  } else {
    chairLabel =
      typeof selectedChair === 'number'
        ? `Chair ${selectedChair} Bill`
        : `${selectedChair} Bill`;
    const chairFiredSub = displayItems.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
    const chairTotal = chairFiredSub + draftSubtotal;
    if (chairTotal > 0) {
      targetChairBill = chairTotal;
    } else if (totalTableBill > 0 && allItems.length === 0 && allTableDraftSubtotal === 0) {
      const guestCount = Math.max(1, table.guestCount || totalCapacity);
      targetChairBill = Math.round(totalTableBill / guestCount);
    } else {
      targetChairBill = 0;
    }
  }

  const handleConfirmMergeSelectedChairs = () => {
    if (chairsSelectedForMerge.length < 2) return;
    const sorted = [...chairsSelectedForMerge].sort((a, b) => a - b);
    const groupKey = `Chairs ${sorted.join(' & ')}`;
    waiterMergeSeatGroup(tableNum, groupKey, sorted);
    setMergeChairMode(false);
    setChairsSelectedForMerge([]);
    onSelectChair(groupKey);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if ((window as any).__draggedMenuItem) {
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
          if (!isPanelDragOver) setIsPanelDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsPanelDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsPanelDragOver(false);
        const item = (window as any).__draggedMenuItem;
        if (item) {
          (window as any).__draggedMenuItem = null;
          const targetSeat =
            typeof selectedChair === 'number'
              ? selectedChair
              : targetSeats.length > 0
              ? targetSeats[0]
              : undefined;
          addToCart(item, undefined, undefined, 1);
          if (isVacant) {
            waiterSeatsGuests(tableNum, 1, 'Floor Captain');
          }
        }
      }}
      className="flex flex-col h-full overflow-hidden bg-[#FAF8F5] select-none font-sans relative"
    >
      {/* ── Full Panel Drop Indicator when dragging any dish from Menu ── */}
      {isPanelDragOver && (
        <div className="absolute inset-0 bg-amber-500/15 border-4 border-dashed border-[#9C3D1E] z-40 rounded-none pointer-events-none flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white/95 px-7 py-5 rounded-3xl shadow-2xl border-2 border-[#9C3D1E] flex items-center gap-4 font-mono text-stone-900 animate-pulse">
            <div className="h-12 w-12 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center font-black text-2xl shadow-sm">
              +
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#9C3D1E]">
                Drop anywhere to add dish
              </p>
              <p className="text-base font-black text-stone-900 mt-0.5">
                Adding to {selectedChair === 'ALL' ? `Table ${tableNum} (General)` : `${chairLabel}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header with Large Icons & High Visibility ── */}
      <div className="px-5 pt-3.5 pb-3 bg-white border-b-2 border-stone-200 shrink-0 shadow-2xs">
        <button
          type="button"
          onClick={onBackToFloor}
          className="flex items-center gap-1.5 font-mono text-xs font-black text-stone-600 hover:text-[#9C3D1E] transition cursor-pointer mb-2.5 py-1 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 w-fit"
        >
          <ChevronLeft className="h-4 w-4 stroke-[3]" />
          <span>All Tables</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Prominent High-Def Table Icon Badge */}
            <div className="h-13 w-13 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-md shrink-0 border border-amber-400/40">
              <Utensils className="h-7 w-7 text-amber-200 stroke-[2.4]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-3xl font-black text-stone-950 tracking-tight font-mono">
                  {groupPeers.length > 1 ? groupPeers.join(' + ') : tableNum}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-xl border text-xs font-black font-mono uppercase tracking-wider ${statusBadge(
                    table.status
                  )}`}
                >
                  {table.status}
                </span>
                {groupPeers.length > 1 && (
                  <span className="px-2.5 py-0.5 rounded-xl bg-indigo-600 text-white text-xs font-black font-mono flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    MERGED TABLE
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-stone-700 mt-1 font-bold">
                {table.section} · Maximum Capacity: {totalCapacity} Seats
              </p>
            </div>
          </div>

          {!isVacant && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-stone-900 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-300 font-bold">
                <Users className="h-4 w-4 text-stone-700 stroke-[2.2]" />
                <span>{table.guestCount || totalCapacity} guests</span>
              </div>
              {elapsed > 0 && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${elapsedColor(
                    elapsed
                  )}`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{elapsed}m</span>
                </div>
              )}
              <div className="text-right pl-2">
                <p className="text-[10px] text-stone-500 uppercase font-black tracking-wider">
                  Total Bill
                </p>
                <p className="font-black text-stone-950 text-xl font-mono">
                  ₹{totalTableBill.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── High Visibility Chair Selector Rail ── */}
      <div className="px-5 py-3 bg-white border-b-2 border-stone-200 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-xs font-black uppercase tracking-wider text-stone-700">
            Select Chair · {totalCapacity} Seats Available
          </p>

          <button
            type="button"
            onClick={() => {
              setMergeChairMode(!mergeChairMode);
              setChairsSelectedForMerge([]);
            }}
            className={`font-mono text-[11px] font-black px-3 py-1 rounded-xl border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              mergeChairMode
                ? 'bg-purple-700 text-white border-purple-800'
                : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
            }`}
          >
            <Link2 className="h-3 w-3" />
            <span>{mergeChairMode ? 'Cancel Merge' : 'Merge Chairs'}</span>
          </button>
        </div>

        {/* Merge Chair Action Banner */}
        {mergeChairMode && (
          <div className="mb-2.5 p-2.5 bg-purple-50 border-2 border-purple-300 rounded-2xl flex items-center justify-between font-mono text-xs">
            <span className="text-purple-950 font-bold">
              {chairsSelectedForMerge.length === 0
                ? 'Tap 2 or more chairs to combine their checks:'
                : `Selected Chairs: ${chairsSelectedForMerge.join(', ')}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChairsSelectedForMerge([])}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-purple-200 font-bold"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={chairsSelectedForMerge.length < 2}
                onClick={handleConfirmMergeSelectedChairs}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-lg font-black shadow-xs flex items-center gap-1"
              >
                <Link2 className="h-3 w-3" />
                <span>Merge ({chairsSelectedForMerge.length})</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {/* ALL Seats Button — supports dropping menu dish */}
          <button
            type="button"
            onClick={() => onSelectChair('ALL')}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if ((window as any).__draggedMenuItem) {
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                if (dragOverTarget !== 'ALL') {
                  setDragOverTarget('ALL');
                  setDragType('dish');
                }
              }
            }}
            onDragLeave={() => {
              setDragOverTarget(null);
              setDragType(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPanelDragOver(false);
              setDragOverTarget(null);
              setDragType(null);
              const draggedItem = (window as any).__draggedMenuItem;
              if (draggedItem) {
                (window as any).__draggedMenuItem = null;
                addToCart(draggedItem, undefined, undefined, 1);
                if (isVacant) {
                  waiterSeatsGuests(tableNum, 1, 'Floor Captain');
                }
                onSelectChair('ALL');
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-3 min-w-[80px] rounded-2xl border-2 font-mono font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
              dragOverTarget === 'ALL'
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-4 ring-emerald-300 scale-105 shadow-md'
                : selectedChair === 'ALL'
                ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-sm'
                : 'bg-stone-50 text-stone-800 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Users className="h-6 w-6 stroke-[2.4]" />
            <span className="text-xs">
              {dragOverTarget === 'ALL' ? '+ Drop Dish' : 'All Seats'}
            </span>
          </button>

          {/* Merged Chair Groups */}
          {Object.entries(mergedSeatGroups).map(([groupKey, seats]) => {
            const isSelected = selectedChair === groupKey;
            const groupFired = allItems.filter(
              (it) => it.seatNumber && seats.includes(it.seatNumber)
            );
            const groupDraft = allTableDraftItems.filter(
              (c) => c.seatNumber && seats.includes(c.seatNumber)
            );
            const groupSubtotal =
              groupFired.reduce((s, it) => s + (it.price || 0) * it.quantity, 0) +
              groupDraft.reduce((s, it) => s + it.totalPrice, 0);

            return (
              <div key={groupKey} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectChair(groupKey)}
                  className={`flex flex-col items-start justify-between px-3.5 py-2.5 min-w-[105px] h-[82px] rounded-2xl border-2 font-mono font-black transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                      : 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1 text-[11px] font-black">
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Group</span>
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'opacity-90' : 'text-purple-800'}`}>
                      ₹{groupSubtotal}
                    </span>
                  </div>

                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold uppercase truncate max-w-[95px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-900'
                    }`}
                  >
                    {groupKey}
                  </span>
                </button>

                {/* Unmerge chip button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    waiterUnmergeSeatGroup(tableNum, groupKey);
                    onSelectChair('ALL');
                  }}
                  title="Unmerge Chairs"
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xs cursor-pointer"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Individual Chairs (excluding those in merged groups) */}
          {chairs.map((ch) => {
            if (groupSeats.includes(ch)) return null;

            const hasItems = allItems.some((it) => it.seatNumber === ch);
            const hasDraft = allTableDraftItems.some((c) => c.seatNumber === ch);
            const hasReady = allItems.some(
              (it) => it.seatNumber === ch && it.stage === 'PLATED'
            );
            const isSelected = selectedChair === ch;
            const isDragTarget = dragOverTarget === ch;
            const isMarkedForMerge = chairsSelectedForMerge.includes(ch);

            return (
              <button
                key={ch}
                type="button"
                draggable={!mergeChairMode}
                onDragStart={(e) => {
                  (window as any).__draggedChair = ch;
                  (window as any).__draggedChairTable = tableNum;
                  try {
                    e.dataTransfer?.setData('text/plain', String(ch));
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
                  } catch {}
                }}
                onDragEnd={() => {
                  (window as any).__draggedChair = null;
                  (window as any).__draggedChairTable = null;
                  setDragOverTarget(null);
                  setDragType(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const draggedCh = (window as any).__draggedChair;
                  const draggedItem = (window as any).__draggedMenuItem;
                  if (draggedCh && draggedCh !== ch) {
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                    if (dragOverTarget !== ch) {
                      setDragOverTarget(ch);
                      setDragType('chair');
                    }
                  } else if (draggedItem) {
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                    if (dragOverTarget !== ch) {
                      setDragOverTarget(ch);
                      setDragType('dish');
                    }
                  }
                }}
                onDragLeave={() => {
                  setDragOverTarget(null);
                  setDragType(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPanelDragOver(false);
                  setDragOverTarget(null);
                  setDragType(null);

                  const fromChair = (window as any).__draggedChair;
                  const draggedItem = (window as any).__draggedMenuItem;

                  if (fromChair && fromChair !== ch) {
                    (window as any).__draggedChair = null;
                    (window as any).__draggedChairTable = null;
                    const sorted = [Math.min(fromChair, ch), Math.max(fromChair, ch)];
                    const groupKey = `Chairs ${sorted.join(' & ')}`;
                    waiterMergeSeatGroup(tableNum, groupKey, sorted);
                    onSelectChair(groupKey);
                    return;
                  }

                  if (draggedItem) {
                    (window as any).__draggedMenuItem = null;
                    addToCart(draggedItem, undefined, undefined, 1);
                    if (isVacant) {
                      waiterSeatsGuests(tableNum, 1, 'Floor Captain');
                    }
                    onSelectChair(ch);
                  }
                }}
                onClick={() => {
                  if (mergeChairMode) {
                    setChairsSelectedForMerge((prev) =>
                      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
                    );
                    return;
                  }
                  if (isSelected) {
                    onSelectChair('ALL');
                  } else {
                    onSelectChair(ch);
                    if (isVacant) {
                      waiterSeatsGuests(tableNum, 1, 'Floor Captain');
                    }
                  }
                }}
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-3 min-w-[80px] rounded-2xl border-2 font-mono font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isMarkedForMerge
                    ? 'border-purple-600 bg-purple-100 text-purple-950 ring-4 ring-purple-300 scale-105 shadow-md'
                    : isDragTarget && dragType === 'chair'
                    ? 'border-purple-600 bg-purple-100 text-purple-950 ring-4 ring-purple-300 scale-105 shadow-md'
                    : isDragTarget && dragType === 'dish'
                    ? 'border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-300 scale-105 shadow-md'
                    : isSelected
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : hasItems || hasDraft
                    ? 'bg-amber-50 text-amber-950 border-amber-400'
                    : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <Armchair className="h-6 w-6 stroke-[2.4]" />
                <span className="text-xs">
                  {isMarkedForMerge
                    ? `✓ Chair ${ch}`
                    : isDragTarget && dragType === 'chair'
                    ? `Merge Into ${ch}`
                    : isDragTarget && dragType === 'dish'
                    ? `+ Add to ${ch}`
                    : `Chair ${ch}`}
                </span>
                {/* Food Ready Dot */}
                {hasReady && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 border-2 border-white animate-pulse" />
                )}
                {/* Active Items Dot */}
                {hasItems && !hasReady && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 border-2 border-white" />
                )}
                {/* Draft Items Dot */}
                {hasDraft && !hasItems && !hasReady && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-white animate-bounce" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area: Vacant Empty Space or Active Orders List ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* VACANT: Prominent Card in the Empty Space if no draft items */}
        {isVacant && draftItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-5 p-8 bg-white border-2 border-stone-200 rounded-3xl text-center shadow-xs mt-4 max-w-md mx-auto"
          >
            <div className="h-20 w-20 rounded-3xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shadow-xs">
              <Users className="h-10 w-10 text-emerald-700 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-black text-stone-950 text-xl font-mono">
                Table {tableNum} is Vacant
              </h3>
              <p className="font-mono text-xs text-stone-600 mt-1 font-bold">
                Capacity: {table.capacity} Guests · {table.section}
              </p>
              <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed">
                {selectedChair !== 'ALL'
                  ? `Chair ${selectedChair} selected. Tap below to seat 1 guest and start punching items from the right panel.`
                  : 'Seat arriving customers to start service, then use the customer menu on the right panel to punch in food.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedChair !== 'ALL') {
                  useSharedBridge.getState().waiterSeatsGuests(tableNum, 1, 'Floor Captain');
                } else {
                  onSeatGuests();
                }
              }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-2xl font-mono font-black text-sm uppercase tracking-wider transition cursor-pointer shadow-md active:scale-98"
            >
              <Users className="h-5 w-5 stroke-[2.4]" />
              <span>
                {selectedChair === 'ALL' ? 'Seat Table Guests' : `Seat Chair ${selectedChair} (1 Guest)`}
              </span>
            </button>
          </motion.div>
        )}

        {/* ── LIVE UNFIRED DRAFT / CART ITEMS SECTION ── */}
        {draftItems.length > 0 && (
          <div className="space-y-2 bg-amber-50/80 p-3.5 rounded-2xl border-2 border-amber-300 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-amber-700 stroke-[2.4]" />
                <span className="font-mono text-xs font-black text-amber-950 uppercase tracking-wider">
                  🛒 Unfired Draft Order · {selectedChair === 'ALL' ? 'All Table' : `Chair ${selectedChair}`}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider text-amber-900 bg-amber-200 border-amber-300 animate-pulse">
                In Cart · Pending KOT
              </span>
            </div>

            {draftItems.map((ci, cIdx) => (
              <div
                key={ci.cartItemId || `draft-${cIdx}`}
                className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-stone-950 leading-tight">
                      {ci.menuItem.name}
                    </p>
                    {ci.seatNumber && (
                      <span className="text-[10px] font-black font-mono text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-300">
                        Chair {ci.seatNumber}
                      </span>
                    )}
                  </div>
                  {ci.selectedOption && (
                    <p className="text-[10px] text-stone-600 font-mono mt-0.5 font-medium">
                      {ci.selectedOption}
                      {ci.selectedAddOns && ci.selectedAddOns.length > 0 && ` + ${ci.selectedAddOns.join(', ')}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2.5 shrink-0 font-mono">
                  <span className="text-xs font-black text-amber-950 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">
                    ×{ci.quantity}
                  </span>
                  <span className="text-xs font-black text-[#9C3D1E]">
                    ₹{ci.totalPrice}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider bg-white text-amber-800 border-amber-200">
                    Draft
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-amber-200 flex items-center justify-between font-mono text-xs">
              <span className="text-amber-900 font-bold text-[11px]">
                👉 Tap &quot;Fire KOT to Kitchen&quot; on the right panel to send to chef
              </span>
              <span className="font-black text-[#9C3D1E]">
                Draft Subtotal: ₹{draftSubtotal}
              </span>
            </div>
          </div>
        )}

        {/* OCCUPIED: Empty state if no orders and no draft */}
        {!isVacant && displayItems.length === 0 && draftItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-36 text-stone-500 font-mono text-xs text-center gap-2">
            <ShoppingBag className="h-8 w-8 opacity-40 stroke-[2.2]" />
            <p className="font-bold text-stone-700">
              No dishes ordered yet for {selectedChair === 'ALL' ? 'this table' : `Chair ${selectedChair}`}
            </p>
            <p className="text-xs text-stone-400">
              Tap &quot;Add Dishes&quot; below or pick dishes on the right to start ordering
            </p>
          </div>
        )}

        {!isVacant && displayItems.length > 0 && (
          tickets.map((tk, tkIdx) => {
            const tkItems = tk.items.filter(
              (it) => selectedChair === 'ALL' || it.seatNumber === selectedChair
            );
            if (tkItems.length === 0) return null;
            return (
              <div key={tk.id ? `${tk.id}-${tkIdx}` : `kot-${tkIdx}`} className="space-y-2 bg-white p-3.5 rounded-2xl border-2 border-stone-200">
                {/* KOT Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-600 stroke-[2.4]" />
                    <span className="font-mono text-xs font-black text-stone-900 uppercase tracking-wider">
                      KOT #{tk.id ? tk.id.slice(-4) : String(tkIdx + 1)} · {tk.timestamp}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider ${
                      tk.status === 'READY'
                        ? 'text-white bg-blue-600 border-blue-700 animate-pulse'
                        : tk.status === 'PREP'
                        ? 'text-white bg-amber-600 border-amber-700'
                        : tk.status === 'COMPLETED'
                        ? 'text-white bg-emerald-600 border-emerald-700'
                        : 'text-stone-800 bg-stone-200 border-stone-300'
                    }`}
                  >
                    {tk.status}
                  </span>
                </div>

                {tkItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-black text-stone-950 leading-tight">
                        {item.name}
                      </p>
                      {item.options && (
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                          {item.options}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 font-mono">
                      <span className="text-xs font-black text-stone-700 bg-stone-100 px-2 py-1 rounded-lg">
                        ×{item.quantity}
                      </span>
                      {item.price && (
                        <span className="text-xs font-black text-[#9C3D1E]">
                          ₹{item.price * item.quantity}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${itemStagePill(
                          item.stage
                        )}`}
                      >
                        {item.stage === 'PLATED'
                          ? 'Ready'
                          : item.stage === 'SERVED'
                          ? 'Served'
                          : item.stage === 'PREP'
                          ? 'Cooking'
                          : 'Placed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* ── High-Contrast Bottom Action Bar for Occupied Tables ── */}
      {!isVacant && (
        <div className="shrink-0 bg-white border-t-2 border-stone-200 px-5 py-3.5 space-y-3 shadow-sm">
          {/* Bill Summary Row */}
          <div className="flex items-center justify-between font-mono">
            <span className="text-stone-700 font-black text-xs uppercase tracking-wider">
              {chairLabel}
            </span>
            <span className="font-black text-stone-950 text-2xl">
              ₹{targetChairBill.toLocaleString()}
            </span>
          </div>

          {/* Primary Action Buttons — hide the button whose panel is already open */}
          <div className={`grid gap-2.5 ${
            activePanelTab === 'menu' || activePanelTab === 'payment'
              ? 'grid-cols-1'
              : 'grid-cols-2'
          }`}>
            {activePanelTab !== 'menu' && (
              <button
                type="button"
                onClick={() => onAddDishes(typeof selectedChair === 'number' ? selectedChair : targetSeats[0])}
                className="py-3 px-4 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-2xl font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-98"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add More Items</span>
              </button>
            )}
            {activePanelTab !== 'payment' && (
              <button
                type="button"
                onClick={onSettle}
                disabled={targetChairBill === 0 && totalTableBill === 0}
                className="py-3 px-4 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center justify-center gap-2 active:scale-98"
              >
                <CreditCard className="h-4 w-4 stroke-[2.4]" />
                <span>Settle {selectedChair === 'ALL' ? 'Bill' : chairLabel}</span>
              </button>
            )}
          </div>

          {/* Secondary Action Buttons */}
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={onSplit}
              disabled={table.currentBill === 0}
              className="py-2.5 rounded-xl border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 font-bold text-stone-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Split className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={onMerge}
              className="py-2.5 rounded-xl border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 font-bold text-stone-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>{table.mergedWith ? 'Unmerge' : 'Merge'}</span>
            </button>
            <button
              type="button"
              onClick={onVacate}
              className="py-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 font-bold text-rose-700 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Vacate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
