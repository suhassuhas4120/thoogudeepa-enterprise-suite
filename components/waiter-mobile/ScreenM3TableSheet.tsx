'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

interface Props {
  tableNum: string;
  initialSeat?: 'ALL' | number;
  onClose: () => void;
  onGoToOrder: (seatNum?: number) => void;
  onGoToSettle: (splitAmount?: number, splitLabel?: string) => void;
  onVacated: () => void;
  onGoToPings?: () => void;
}

function statusBadge(status: string) {
  switch (status) {
    case 'OCCUPIED': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'BILLING':  return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'CLEANING': return 'bg-stone-200 text-stone-700 border-stone-300';
    default:         return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
}

function StagePill({ stage, onServe }: { stage: string; onServe?: () => void }) {
  if (stage === 'Received') {
    return (
      <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-sky-100 text-sky-800 border border-sky-300">
        Received
      </span>
    );
  }
  if (stage === 'Cooking' || stage === 'PREP' || stage === 'Preparing') {
    return (
      <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
        Preparing
      </span>
    );
  }
  if (stage === 'Ready' || stage === 'PLATED') {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.stopPropagation();
          onServe?.();
        }}
        className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
      >
        <span className="text-white">●</span>
        <span>Serve</span>
      </motion.button>
    );
  }
  if (stage === 'Served' || stage === 'SERVED') {
    return (
      <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
        <span className="text-emerald-600 font-bold">✓</span>
        <span>Served</span>
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-stone-100 text-stone-600 border border-stone-200">
      Placed
    </span>
  );
}

export function ScreenM3TableSheet({
  tableNum,
  initialSeat = 'ALL',
  onClose,
  onGoToOrder,
  onGoToSettle,
  onVacated,
  onGoToPings,
}: Props) {
  const {
    tables,
    pings,
    kdsTickets,
    waiterVacatesTable,
    waiterMergeTables,
    waiterUnmergeTable,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const [confirmVacate, setConfirmVacate] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<'ALL' | number | string>(initialSeat);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCoverCount, setSplitCoverCount] = useState(2);
  const [splitMethod, setSplitMethod] = useState<'PERSONS' | 'CHAIRS'>('PERSONS');
  const [mergeTab, setMergeTab] = useState<'TABLE' | 'SEATS'>('TABLE');
  const [mergeSearch, setMergeSearch] = useState('');
  const [targetMergeTable, setTargetMergeTable] = useState('');
  const [selectedSeatsToMerge, setSelectedSeatsToMerge] = useState<number[]>([]);
  const [mergedSeatGroups, setMergedSeatGroups] = useState<Record<string, number[]>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const holdChairTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedChairsForMerge, setSelectedChairsForMerge] = useState<number[]>([]);

  const activePings = pings?.filter((p) => p.status === 'PENDING') || [];

  // Modal scroll lock: prevent background page scroll while modals are active
  useEffect(() => {
    if (showMergeModal || confirmVacate || showSplitModal) {
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showMergeModal, confirmVacate, showSplitModal]);

  useEffect(() => {
    if (initialSeat !== undefined) {
      setSelectedSeat(initialSeat);
    }
  }, [initialSeat]);

  const table = tables.find((t) => t.number === tableNum);
  if (!table) return null;

  const isMerged = Boolean(table.mergedWith);
  const partnerTable = isMerged ? tables.find((t) => t.number === table.mergedWith) : null;

  // Candidate tables for merging (exclude self and currently merged partner)
  const candidateTables = tables.filter(
    (t) => t.number !== tableNum && (!table.mergedWith || t.number !== table.mergedWith)
  );

  // All group member numbers (includes self; falls back to just this table if not merged)
  const groupPeers: string[] = table.mergeGroupPeers ?? [tableNum];
  const groupTables = groupPeers.map((n) => tables.find((t) => t.number === n)).filter(Boolean) as typeof tables;

  const isVacant = table.status === 'VACANT';
  const inMergeGroup = groupPeers.length > 1;
  const mergePeerLabel = groupPeers.filter((n) => n !== tableNum).join(', ');

  // Tickets for table — exclude COMPLETED (settled/archived) and vacant table tickets
  const cleanTableNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '');
  const tickets = isVacant
    ? []
    : kdsTickets.filter((tk) =>
        groupPeers.some((peer) => cleanTableNum(peer) === cleanTableNum(tk.tableNumber)) &&
        tk.status !== 'COMPLETED'
      );

  // Unified collection of all ordered items on this table (from KDS tickets and table.activeItems)
  const allTableOrderedItems: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    options?: string;
    addOns?: string[];
    stage: string;
    seatNumber?: number;
    ticketId: string;
    ticketNumber: string;
  }[] = [];

  if (!isVacant) {
    tickets.forEach((tk) => {
      tk.items.forEach((it) => {
        const fallbackPrice =
          INITIAL_MENU_ITEMS.find(
            (m) =>
              m.name.toLowerCase() === it.name.toLowerCase() ||
              m.name.toLowerCase().includes(it.name.toLowerCase()) ||
              it.name.toLowerCase().includes(m.name.toLowerCase())
          )?.price || 220;
        const unitPrice = it.price && it.price > 0 ? it.price : fallbackPrice;
        const stageLabel =
          it.stage === 'SERVED'
            ? 'Served'
            : it.stage === 'PLATED'
            ? 'Ready'
            : it.stage === 'PREP'
            ? 'Cooking'
            : it.stage === 'RECEIVED'
            ? 'Received'
            : 'Placed';
        allTableOrderedItems.push({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: unitPrice,
          totalPrice: unitPrice * it.quantity,
          options: it.options,
          addOns: it.addOns || [],
          stage: stageLabel,
          seatNumber: it.seatNumber || tk.seatNumber,
          ticketId: tk.id,
          ticketNumber: tk.id.slice(-4),
        });
      });
    });

    if (allTableOrderedItems.length === 0) {
      // Pull activeItems from ALL group members (since each table keeps its own items now)
      groupTables.forEach((gt) => {
        if (gt.activeItems && gt.activeItems.length > 0) {
          gt.activeItems.forEach((ai, idx) => {
            const fallbackPrice =
              INITIAL_MENU_ITEMS.find(
                (m) =>
                  m.name.toLowerCase() === ai.name.toLowerCase() ||
                  m.name.toLowerCase().includes(ai.name.toLowerCase()) ||
                  ai.name.toLowerCase().includes(m.name.toLowerCase())
              )?.price || 220;
            const unitPrice = ai.price && ai.price > 0 ? ai.price : fallbackPrice;
            allTableOrderedItems.push({
              id: ai.id || `ai-${gt.number}-${idx}`,
              name: ai.name,
              quantity: ai.quantity,
              price: unitPrice,
              totalPrice: unitPrice * ai.quantity,
              options: ai.options,
              stage: ai.status || 'Placed',
              seatNumber: ai.seatNumber,
              ticketId: 'tbl-direct',
              ticketNumber: 'TBL',
            });
          });
        }
      });
    }
  }

  const chairsWithOrders = new Set<number>();
  allTableOrderedItems.forEach((it) => {
    if (it.seatNumber) chairsWithOrders.add(it.seatNumber);
  });

  // Dynamic capacity & bill calculations — sum across ALL group members
  const totalChairs = groupTables.reduce((sum, t) => sum + (t.capacity || 4), 0) || (table.capacity || 4);
  const itemsSubtotal = allTableOrderedItems.reduce((sum, it) => sum + it.totalPrice, 0);
  // Sum bills across ALL group members (each table keeps its own bill now)
  const groupBill = isVacant ? 0 : groupTables.reduce((s, t) => s + (t.currentBill || 0), 0);

  // Clean, consistent, zero double-tax pricing:
  // When ordered items are listed, subtotal is strictly the pre-tax dishes total (itemsSubtotal).
  // If no items are listed yet table has a groupBill, derive subtotal from the inclusive groupBill.
  const subtotal = isVacant
    ? 0
    : itemsSubtotal > 0
    ? itemsSubtotal
    : Math.round(groupBill / 1.05);

  const occupiedChairsCount = (isVacant || allTableOrderedItems.length === 0)
    ? 0
    : Math.min(
        totalChairs,
        Math.max(
          chairsWithOrders.size,
          table.guestCount || 0,
          1
        )
      );

  // Tax calculation (5% GST total = 2.5% CGST + 2.5% SGST)
  const totalTax = isVacant
    ? 0
    : itemsSubtotal > 0
    ? Math.round(subtotal * 0.05)
    : groupBill - subtotal;
  const cgst = totalTax / 2;
  const sgst = totalTax - cgst;
  const grandTotal = isVacant ? 0 : subtotal + totalTax;

  // Individual Chair Share calculation
  const perChairSubtotal = occupiedChairsCount > 0 ? Math.round(subtotal / occupiedChairsCount) : 0;
  const perChairTax = Math.round(perChairSubtotal * 0.05);
  const perChairTotal = perChairSubtotal + perChairTax;

  // ── Exact Chair / Group Bill Breakdown Helper ──
// ── Exact Chair / Group Bill Breakdown Helper ──
  const getChairBillBreakdown = (seat: 'ALL' | number | string) => {
    if (isVacant || allTableOrderedItems.length === 0) {
      return {
        label: typeof seat === 'number' ? `Chair ${seat}` : seat === 'ALL' ? 'All Table' : seat,
        directItems: [],
        sharedItems: [],
        subtotal: 0,
        tax: 0,
        totalDue: 0,
      };
    }

    if (seat === 'ALL') {
      return {
        label: 'All Table',
        directItems: allTableOrderedItems,
        sharedItems: [],
        subtotal,
        tax: totalTax,
        totalDue: grandTotal,
      };
    }

    const seatsInTarget: number[] =
      typeof seat === 'number'
        ? [seat]
        : typeof seat === 'string' && mergedSeatGroups[seat]
        ? mergedSeatGroups[seat]
        : [];

    const anyChairHasSpecificOrders = allTableOrderedItems.some((i) => !!i.seatNumber);
    const directItems = allTableOrderedItems.filter(
      (i) => i.seatNumber && seatsInTarget.includes(i.seatNumber)
    );
    const sharedItems = allTableOrderedItems.filter((i) => !i.seatNumber);

    const directSub = directItems.reduce((s, i) => s + i.totalPrice, 0);

    let calculatedSub = 0;
    if (directItems.length > 0) {
      const sharedPerPerson =
        occupiedChairsCount > 0
          ? sharedItems.reduce((s, i) => s + i.totalPrice, 0) / occupiedChairsCount
          : 0;
      calculatedSub = directSub + sharedPerPerson * Math.max(1, seatsInTarget.length);
    } else if (!anyChairHasSpecificOrders && sharedItems.length > 0) {
      // ONLY when orders were placed by entire table (no chair-specific items on table)
      // then table amount is split equally across occupied chairs
      calculatedSub =
        occupiedChairsCount > 0
          ? (subtotal / occupiedChairsCount) * Math.max(1, seatsInTarget.length)
          : 0;
    } else if (sharedItems.length > 0) {
      // General shared items exist alongside chair items, this chair shares only the shared portion
      calculatedSub =
        occupiedChairsCount > 0
          ? (sharedItems.reduce((s, i) => s + i.totalPrice, 0) / occupiedChairsCount) * Math.max(1, seatsInTarget.length)
          : 0;
    } else {
      // Chair with no specific items placed no orders
      calculatedSub = 0;
    }

    const calculatedTax = Math.round(calculatedSub * 0.05);
    const calculatedTotal = calculatedSub + calculatedTax;

    return {
      label: typeof seat === 'number' ? `Chair ${seat}` : seat,
      directItems,
      sharedItems: directItems.length > 0 && sharedItems.length > 0 ? sharedItems : [],
      subtotal: calculatedSub,
      tax: calculatedTax,
      totalDue: calculatedTotal,
    };
  };

  // Check if any items are ready to serve
  const readyOrderedItems = allTableOrderedItems.filter((i) => i.stage === 'Ready');
  const hasReadyFood = readyOrderedItems.length > 0 || (table.activeItems || []).some((it) => it.status === 'Ready');

  const handleServeReadyFood = () => {
    readyOrderedItems.forEach((it) => {
      waiterMarkKitchenItemServed(it.ticketId, it.id);
    });
    (table.activeItems || []).forEach((ai) => {
      if (ai.status === 'Ready' && ai.id) {
        waiterMarkKitchenItemServed('tbl-direct', ai.id);
      }
    });
    setNotice('✓ Ready dishes marked as served to table');
    setTimeout(() => setNotice(null), 2000);
  };

  // ── Settle Button Validation (Require all dishes to be SERVED) ──
  const hasTableOrders = allTableOrderedItems.length > 0;
  const hasUnservedTableItems = !hasTableOrders || allTableOrderedItems.some((it) => it.stage !== 'Served');

  let isCurrentSelectionSettleDisabled = false;
  let currentSelectionSettleReason = '';

  if (selectedSeat === 'ALL') {
    isCurrentSelectionSettleDisabled = isVacant || grandTotal <= 0 || !hasTableOrders || hasUnservedTableItems;
    currentSelectionSettleReason = !hasTableOrders
      ? 'No orders placed'
      : hasUnservedTableItems
      ? 'Serve all table items to settle'
      : '';
  } else if (typeof selectedSeat === 'number') {
    const chairDirectItems = allTableOrderedItems.filter((i) => i.seatNumber === selectedSeat);
    const tableSharedItems = allTableOrderedItems.filter((i) => !i.seatNumber);
    const chairTargetItems = chairDirectItems.length > 0 ? chairDirectItems : tableSharedItems;
    const hasChairItems = chairTargetItems.length > 0;
    const hasUnservedChair = !hasChairItems || chairTargetItems.some((i) => i.stage !== 'Served');
    const chairBreakdown = getChairBillBreakdown(selectedSeat);
    isCurrentSelectionSettleDisabled = isVacant || chairBreakdown.totalDue <= 0 || !hasChairItems || hasUnservedChair;
    currentSelectionSettleReason = !hasChairItems
      ? 'No orders for this chair'
      : hasUnservedChair
      ? `Serve all items for Chair ${selectedSeat} to settle`
      : '';
  } else if (typeof selectedSeat === 'string' && mergedSeatGroups[selectedSeat]) {
    const groupSeats = mergedSeatGroups[selectedSeat];
    const groupDirectItems = allTableOrderedItems.filter((i) => i.seatNumber && groupSeats.includes(i.seatNumber));
    const tableSharedItems = allTableOrderedItems.filter((i) => !i.seatNumber);
    const groupTargetItems = groupDirectItems.length > 0 ? groupDirectItems : tableSharedItems;
    const hasGroupItems = groupTargetItems.length > 0;
    const hasUnservedGroup = !hasGroupItems || groupTargetItems.some((i) => i.stage !== 'Served');
    const groupBreakdown = getChairBillBreakdown(selectedSeat);
    isCurrentSelectionSettleDisabled = isVacant || groupBreakdown.totalDue <= 0 || !hasGroupItems || hasUnservedGroup;
    currentSelectionSettleReason = !hasGroupItems
      ? 'No orders for this group'
      : hasUnservedGroup
      ? 'Serve all group items to settle'
      : '';
  }

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

  // Removes one chair from a group while keeping the remaining chairs merged.
  // For 2-chair groups this dissolves the pair entirely (no single-chair group exists).
  // For 3+ chair groups it rebuilds the group without the removed chair.
  const removeChairFromGroup = (seatNum: number, groupKey: string) => {
    const currentGroup = mergedSeatGroups[groupKey];
    if (!currentGroup) return;

    if (currentGroup.length <= 2) {
      // Pair: dissolve entirely
      handleSplitSeatGroup(groupKey);
      return;
    }

    // 3+ chairs: remove only this one, keep the rest merged
    const remaining = currentGroup.filter((s) => s !== seatNum).sort((a, b) => a - b);
    const newKey = `Chairs ${remaining.join(' & ')}`;

    setMergedSeatGroups((prev) => {
      const next = { ...prev };
      delete next[groupKey];
      next[newKey] = remaining;
      return next;
    });

    // Keep viewing the group (with updated key) so selected seat doesn't jump away
    if (selectedSeat === groupKey) setSelectedSeat(newKey);

    setNotice(`Chair ${seatNum} removed from group`);
    setTimeout(() => setNotice(null), 2000);
  };

  // Merges all chairs currently highlighted in selectedChairsForMerge into one group.
  // If any selected chair already belongs to an existing group, that whole group is absorbed.
  const mergeSelectedChairs = () => {
    if (selectedChairsForMerge.length < 2) return;

    setMergedSeatGroups((prev) => {
      const newGroups: Record<string, number[]> = {};
      const allSeats = new Set<number>(selectedChairsForMerge);

      // Absorb existing groups that overlap with selection
      Object.entries(prev).forEach(([key, seats]) => {
        if (seats.some((s) => selectedChairsForMerge.includes(s))) {
          seats.forEach((s) => allSeats.add(s));
          // drop this old group — it will be recreated in the combined key
        } else {
          newGroups[key] = seats; // unrelated group: keep as-is
        }
      });

      const sorted = Array.from(allSeats).sort((a, b) => a - b);
      const groupKey = `Chairs ${sorted.join(' & ')}`;
      newGroups[groupKey] = sorted;
      return newGroups;
    });

    setSelectedSeat(`Chairs ${[...selectedChairsForMerge].sort((a, b) => a - b).join(' & ')}`);
    setSelectedChairsForMerge([]);
    setNotice(`Chairs merged into one group`);
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

  const unmergedChairsCount = Array.from({ length: totalChairs }).filter(
    (_, idx) => !Object.values(mergedSeatGroups).some((seats) => seats.includes(idx + 1))
  ).length;
  const totalRailCardsCount = 1 + Object.keys(mergedSeatGroups).length + unmergedChairsCount;
  const isCompactRail = totalRailCardsCount <= 4;

  return (
    <main className="h-[100dvh] bg-[#FAF8F5] flex flex-col font-sans w-full relative select-none overflow-hidden">

      {/* Sticky Header: Back to Floor & Table Identity */}
      <header className="shrink-0 bg-white/95 border-b border-[#EAE5DF] px-4 py-2.5 flex items-center justify-between shadow-2xs backdrop-blur-md z-40">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-xs font-black text-stone-700 hover:text-[#9C3D1E] py-1 px-2.5 -ml-1 rounded-xl bg-stone-50 hover:bg-[#FFF8F5] border border-[#EAE5DF] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Floor</span>
        </button>

        <div className="flex items-center gap-1.5">
          {activePings.length > 0 && (
            <button
              type="button"
              onClick={onGoToPings || onClose}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse active:scale-95 transition"
              title={`${activePings.length} assistance call(s) pending — tap to view`}
            >
              <Bell className="h-2.5 w-2.5" />
              <span>{activePings.length}</span>
            </button>
          )}
          <span className="font-mono text-[10.5px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-[#9C3D1E] border border-amber-200">
            {occupiedChairsCount} / {totalChairs} Seats Occupied
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-2.5 pb-0 flex flex-col gap-2.5">

        {/* Temporary Notice Toast */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold font-mono rounded-2xl flex items-center gap-2 shadow-xs shrink-0"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Hero Card: Number, Section & Bill Total */}
        <div className="shrink-0 p-3.5 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                {table.section}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  {table.number}
                </h1>
                <Armchair className="h-5 w-5 text-[#9C3D1E]" />
                {inMergeGroup && (
                  <span className="font-mono text-[9.5px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <Link2 className="h-3 w-3 text-indigo-700" />
                    <span>Merged{mergePeerLabel ? ` (+${mergePeerLabel})` : ''}</span>
                  </span>
                )}
              </div>
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
        </div>

        {/* ── INTERACTIVE CHAIR NAVIGATION (LARGE, PROMINENT CHAIRS) ── */}
        <div className="shrink-0 space-y-1.5">

          {/* Merge action bar — slides in when ≥1 chair is selected, providing immediate cancel option */}
          <AnimatePresence>
            {selectedChairsForMerge.length >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-2xl">
                  <span className="font-mono text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {selectedChairsForMerge.length === 1
                        ? `Chair ${selectedChairsForMerge[0]} selected (tap another to merge)`
                        : `Chairs ${selectedChairsForMerge.slice().sort((a, b) => a - b).join(', ')} selected`}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedChairsForMerge([])}
                      className="font-mono text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-white border border-emerald-200 px-2.5 py-1 rounded-xl active:scale-90 transition shadow-2xs"
                    >
                      Cancel
                    </button>
                    {selectedChairsForMerge.length >= 2 && (
                      <button
                        type="button"
                        onClick={mergeSelectedChairs}
                        className="font-mono text-[11px] font-black text-white bg-emerald-600 px-3 py-1 rounded-xl flex items-center gap-1 active:scale-90 transition shadow-xs"
                      >
                        <Link2 className="h-3 w-3" />
                        Merge
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal Grid of Large Interactive Chair Cards */}
          <div className={`flex items-center gap-2 pt-2 pb-0.5 px-0.5 ${isCompactRail ? 'w-full' : 'overflow-x-auto scrollbar-none'}`}>
            {/* All Table Card */}
            <button
              type="button"
              onClick={() => setSelectedSeat('ALL')}
              className={`p-2.5 rounded-2xl font-mono text-xs font-black border-2 transition flex flex-col items-center justify-between h-[84px] shadow-xs active:scale-95 ${
                isCompactRail ? 'flex-1 min-w-0' : 'shrink-0 min-w-[88px]'
              } ${
                selectedSeat === 'ALL'
                  ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900/30'
                  : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              <FileText className="h-4.5 w-4.5 mb-0.5 shrink-0" />
              <span className="truncate w-full text-center">All Table</span>
              <span className="text-[10px] opacity-80 shrink-0">₹{grandTotal.toFixed(0)}</span>
            </button>

            {/* Merged Group Cards (if any) — each shows a direct Split × button */}
            {Object.entries(mergedSeatGroups).map(([groupKey, groupSeats]) => {
              const isSelected = selectedSeat === groupKey;
              const breakdown = getChairBillBreakdown(groupKey);
              const groupAmt = breakdown.totalDue;

              return (
                <div key={groupKey} className={`relative ${isCompactRail ? 'flex-1 min-w-0' : 'shrink-0'}`}>
                  {groupSeats.length <= 2 ? (
                    /* 2-chair group: single outer button, no inner buttons, split × is sibling */
                    <button
                      type="button"
                      onClick={() => setSelectedSeat(groupKey)}
                      className={`w-full p-2.5 rounded-2xl font-mono text-xs font-black border-2 transition flex flex-col items-start justify-between active:scale-95 h-[84px] ${
                        !isCompactRail ? 'min-w-[96px]' : ''
                      } ${
                        isSelected
                          ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                          : 'bg-indigo-50 text-indigo-950 border-indigo-300 hover:bg-indigo-100'
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full min-w-0">
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-black truncate">Group</span>
                        <span className={`ml-auto text-[10px] font-bold shrink-0 ${isSelected ? 'opacity-80' : 'text-indigo-600'}`}>
                          ₹{groupAmt.toFixed(0)}
                        </span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-900'
                      }`}>
                        Chairs {groupSeats.join(' & ')}
                      </span>
                    </button>
                  ) : (
                    /* 3+ chair group: outer is a div so inner remove-chip buttons are valid HTML */
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSeat(groupKey)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedSeat(groupKey); }}
                      className={`w-full p-2.5 rounded-2xl font-mono text-xs font-black border-2 transition flex flex-col items-start justify-between cursor-pointer active:scale-95 h-[84px] ${
                        !isCompactRail ? 'min-w-[130px]' : ''
                      } ${
                        isSelected
                          ? 'bg-indigo-700 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                          : 'bg-indigo-50 text-indigo-950 border-indigo-300 hover:bg-indigo-100'
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-center gap-1 w-full min-w-0">
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-black truncate">Group</span>
                        <span className={`ml-auto text-[10px] font-bold shrink-0 ${isSelected ? 'opacity-80' : 'text-indigo-600'}`}>
                          ₹{groupAmt.toFixed(0)}
                        </span>
                      </div>

                      {/* Per-chair removal chips */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {groupSeats.map((seat) => (
                          <button
                            key={seat}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeChairFromGroup(seat, groupKey);
                            }}
                            className={`flex items-center gap-0.5 px-1 py-0.5 rounded-md border font-mono text-[8.5px] font-black active:scale-90 transition ${
                              isSelected
                                ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            }`}
                            title={`Remove Chair ${seat} from group`}
                          >
                            C{seat}
                            <X className="h-2.5 w-2.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2-chair group only: quick × badge to split the pair */}
                  {groupSeats.length <= 2 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSplitSeatGroup(groupKey); }}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white active:scale-90 z-20 cursor-pointer"
                      title={`Split ${groupKey}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Individual Chairs 1..N — chairs already in a merged group are hidden here (shown in group card) */}
            {Array.from({ length: totalChairs }).map((_, idx) => {
              const seatNum = idx + 1;
              const inGroup = Object.values(mergedSeatGroups).some((seats) => seats.includes(seatNum));
              if (inGroup) return null;

              const isSelected = selectedSeat === seatNum;
              const chairBreakdown = getChairBillBreakdown(seatNum);
              const hasOrders = chairBreakdown.directItems.length > 0;
              const isSeated = hasOrders || chairsWithOrders.has(seatNum) || (chairsWithOrders.size === 0 && seatNum <= occupiedChairsCount);
              const seatCardTotal = chairBreakdown.totalDue;
              const isSelectedForMerge = selectedChairsForMerge.includes(seatNum);
              const seatHasReady = allTableOrderedItems.some(
                (i) => i.seatNumber === seatNum && i.stage === 'Ready'
              );

              return (
                <button
                  key={seatNum}
                  type="button"
                  data-chairnum={seatNum}
                  onPointerDown={() => {
                    // 550ms long-press → enter selection mode, select this chair
                    holdChairTimerRef.current = setTimeout(() => {
                      holdChairTimerRef.current = null;
                      setSelectedChairsForMerge((prev) =>
                        prev.includes(seatNum) ? prev : [...prev, seatNum]
                      );
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        try { navigator.vibrate(35); } catch {}
                      }
                    }, 550);
                  }}
                  onPointerUp={() => {
                    if (holdChairTimerRef.current) {
                      clearTimeout(holdChairTimerRef.current);
                      holdChairTimerRef.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    if (holdChairTimerRef.current) {
                      clearTimeout(holdChairTimerRef.current);
                      holdChairTimerRef.current = null;
                    }
                  }}
                  onClick={() => {
                    if (selectedChairsForMerge.length > 0) {
                      // In selection mode: tap toggles this chair in/out
                      setSelectedChairsForMerge((prev) =>
                        prev.includes(seatNum)
                          ? prev.filter((s) => s !== seatNum)
                          : [...prev, seatNum]
                      );
                    } else {
                      // Normal tap: navigate to chair details
                      setSelectedSeat(seatNum);
                    }
                  }}
                  className={`p-2.5 rounded-2xl font-mono text-xs font-black border-2 transition-all active:scale-95 flex flex-col items-center justify-between h-[84px] relative select-none ${
                    isCompactRail ? 'flex-1 min-w-0' : 'shrink-0 min-w-[86px]'
                  } ${
                    isSelectedForMerge
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400 shadow-md'
                      : isSelected
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-md ring-2 ring-[#9C3D1E]/40 scale-102'
                      : hasOrders
                      ? 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200'
                      : isSeated
                      ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-stone-400 border-dashed border-stone-300 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {seatHasReady && (
                    <span className="absolute -top-1 -left-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                  )}
                  {/* Tick badge when selected for merge */}
                  {isSelectedForMerge && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <div className="flex items-center gap-1 truncate w-full justify-center">
                    <Armchair className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Chair {seatNum}</span>
                  </div>
                  <span className={`text-[10px] font-bold truncate ${isSelectedForMerge ? 'text-emerald-700' : isSelected ? 'text-white' : isSeated && seatCardTotal > 0 ? 'text-[#9C3D1E]' : 'text-stone-400'}`}>
                    {hasOrders ? `₹${seatCardTotal.toFixed(0)}` : isSeated && seatCardTotal > 0 ? `₹${seatCardTotal.toFixed(0)}` : isVacant ? 'Vacant' : '₹0'}
                  </span>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase truncate max-w-full ${
                    isSelectedForMerge
                      ? 'bg-emerald-200 text-emerald-800'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : hasOrders
                      ? 'bg-amber-300 text-amber-950'
                      : isSeated
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-stone-100 text-stone-400'
                  }`}>
                    {isSelectedForMerge ? 'Selected' : hasOrders ? `${chairBreakdown.directItems.reduce((s, i) => s + i.quantity, 0)} Items` : isSeated ? 'Seated' : 'Empty'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
        <div className="flex-1 min-h-0 flex flex-col pb-2.5 gap-2 overflow-hidden">

        <div className="flex-1 min-h-0 flex flex-col">
        <motion.div
          onPanEnd={(_, info) => {
            if (info.offset.x < -60) {
              // Swipe left -> next chair
              if (selectedSeat === 'ALL') {
                setSelectedSeat(1);
              } else if (typeof selectedSeat === 'number' && selectedSeat < totalChairs) {
                setSelectedSeat(selectedSeat + 1);
              }
            } else if (info.offset.x > 60) {
              // Swipe right -> prev chair
              if (typeof selectedSeat === 'number') {
                if (selectedSeat > 1) {
                  setSelectedSeat(selectedSeat - 1);
                } else {
                  setSelectedSeat('ALL');
                }
              }
            }
          }}
          className="h-full flex flex-col px-4 pt-3 pb-1 bg-white border-t border-[#EAE5DF] font-mono touch-pan-y overflow-hidden"
        >
          <div className="shrink-0 flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
            <div className="min-w-0 flex items-center gap-1.5 flex-1">
              <span className="font-black text-sm text-stone-900 uppercase tracking-wide">
                {activeGroup
                  ? `Chairs ${activeGroup.seats.join(', ')}`
                  : selectedSeat === 'ALL'
                  ? `Table Orders (${tickets.length || 1} KOT)`
                  : `Chair ${selectedSeat} Breakdown`}
              </span>
              {selectedSeat === 'ALL' && allTableOrderedItems.length > 0 && (
                <span className="text-[11px] font-bold text-stone-400 shrink-0">
                  • {allTableOrderedItems.reduce((s, i) => s + i.quantity, 0)} Items
                </span>
              )}
            </div>
            {!activeGroup && (
              <span className={`shrink-0 whitespace-nowrap text-[9.5px] font-mono font-black uppercase px-2.5 py-1 rounded-full border shadow-2xs ${
                selectedSeat === 'ALL'
                  ? table.status === 'BILLING' || (table.currentBill === 0 && !isVacant)
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                  : allTableOrderedItems.some((i) => i.seatNumber === Number(selectedSeat))
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : Number(selectedSeat) <= occupiedChairsCount
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {selectedSeat === 'ALL'
                  ? table.status === 'BILLING' || (table.currentBill === 0 && !isVacant)
                    ? 'PAID'
                    : 'UNPAID'
                  : allTableOrderedItems.some((i) => i.seatNumber === Number(selectedSeat))
                  ? 'Active Orders'
                  : chairsWithOrders.size === 0 && Number(selectedSeat) <= occupiedChairsCount
                  ? 'Seated'
                  : 'Available'}
              </span>
            )}
          </div>

          {/* Details Breakdown */}
          {activeGroup ? (
            // Combined Seat Group View
            (() => {
              const groupItems = allTableOrderedItems.filter(
                (it) => it.seatNumber && activeGroup.seats.includes(it.seatNumber)
              );
              const groupItemsSubtotal = groupItems.reduce((sum, it) => sum + it.totalPrice, 0);
              const groupSubtotal = groupItems.length > 0 ? groupItemsSubtotal : perChairSubtotal * activeGroup.seats.length;
              const groupTax = Math.round(groupSubtotal * 0.05);
              const groupTotal = groupSubtotal + groupTax;

              return (
                <div className="flex-1 min-h-0 flex flex-col space-y-2 py-1">
                  {groupItems.length > 0 ? (
                    <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
                      <div className="shrink-0 flex items-center justify-between text-xs font-bold text-indigo-950 uppercase tracking-wider px-1">
                        <span>Combined Ordered Dishes</span>
                        <span>{groupItems.reduce((s, i) => s + i.quantity, 0)} Items</span>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
                        {groupItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-2.5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-black text-stone-900">
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] mr-1.5 font-bold">
                                    Chair {item.seatNumber}
                                  </span>
                                  <span className="text-[#9C3D1E] mr-1">{item.quantity}×</span>
                                  <span>{item.name}</span>
                                </div>
                                {item.options && (
                                  <div className="text-[10px] text-stone-500 mt-0.5">
                                    {item.options}
                                  </div>
                                )}
                                {item.addOns && item.addOns.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.addOns.map((ao, aIdx) => (
                                      <span key={aIdx} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                        + {ao}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-black text-stone-900">
                                  ₹{item.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-indigo-100 text-[10px]">
                              <span className="text-stone-400">KOT #{item.ticketNumber}</span>
                              <StagePill
                                stage={item.stage}
                                onServe={() => waiterMarkKitchenItemServed(item.ticketId, item.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 text-center space-y-2">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                        <Users className="h-5 w-5" />
                      </div>
                      <p className="font-mono text-xs font-bold text-indigo-950">
                        Combined group active — no dishes ordered yet.
                      </p>
                    </div>
                  )}

                  <div className="shrink-0 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between text-indigo-900">
                      <span>Food Subtotal ({activeGroup.seats.length} Chairs):</span>
                      <span className="font-bold">₹{groupSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-900">
                      <span>GST (5% Combined):</span>
                      <span>₹{groupTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-950 font-black text-sm pt-1.5 border-t border-indigo-300">
                      <span>Group Total Due:</span>
                      <span className="text-[#9C3D1E]">₹{groupTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : selectedSeat === 'ALL' ? (
            // All Table KOT Tickets & Items
            allTableOrderedItems.length > 0 ? (
              <div className="flex-1 min-h-0 flex flex-col space-y-2.5 py-1">
                {(() => {
                  const readyToServeItems = allTableOrderedItems.filter((i) => i.stage === 'Ready');
                  if (readyToServeItems.length <= 1) return null;
                  return (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-xs shadow-2xs shrink-0">
                      <div className="flex items-center gap-1.5 font-black">
                        <span className="text-emerald-600 animate-pulse text-sm">●</span>
                        <span>{readyToServeItems.length} Dishes Ready at Pass</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          readyToServeItems.forEach((it) =>
                            waiterMarkKitchenItemServed(it.ticketId, it.id)
                          );
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        Serve All ({readyToServeItems.length}) ✓
                      </button>
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
                  {allTableOrderedItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-black text-stone-900">
                            {item.seatNumber ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900 text-amber-200 text-[10px] mr-1.5 font-black font-mono shadow-2xs">
                                <Armchair className="h-3 w-3 text-amber-300" />
                                <span>Chair {item.seatNumber}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF8F5] text-[#9C3D1E] border border-[#9C3D1E]/30 text-[10px] mr-1.5 font-black font-mono">
                                <span>All Table</span>
                              </span>
                            )}
                            <span className="text-[#9C3D1E] mr-1">{item.quantity}×</span>
                            <span>{item.name}</span>
                          </div>
                          {item.options && (
                            <div className="text-[10px] text-stone-500 mt-0.5">
                              {item.options}
                            </div>
                          )}
                          {item.addOns && item.addOns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.addOns.map((ao, aIdx) => (
                                <span key={aIdx} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                  + {ao}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-stone-900">
                            ₹{item.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                        <span className="text-stone-400">KOT #{item.ticketNumber}</span>
                        <StagePill
                          stage={item.stage}
                          onServe={() => waiterMarkKitchenItemServed(item.ticketId, item.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Cost Summary */}
                <div className="shrink-0 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-stone-700">
                    <span>Food Subtotal ({allTableOrderedItems.length} items):</span>
                    <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span>CGST (2.5%):</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span>SGST (2.5%):</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-950 font-black text-sm pt-1.5 border-t border-stone-300">
                    <span>Grand Total:</span>
                    <span className="text-[#9C3D1E]">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty orders on table with proper icon and single line */
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-8 text-center space-y-2">
                <div className="h-11 w-11 rounded-2xl bg-[#FFF8F5] border border-[#9C3D1E]/20 flex items-center justify-center text-[#9C3D1E]">
                  <UtensilsCrossed className="h-5.5 w-5.5" />
                </div>
                <p className="font-mono text-xs font-bold text-stone-600">
                  No active orders placed on this table yet.
                </p>
              </div>
            )
          ) : (
            // Dedicated Single Chair View
            (() => {
              const thisSeatNum = Number(selectedSeat);
              const thisSeatItems = allTableOrderedItems.filter((i) => i.seatNumber === thisSeatNum);
              const hasSeatItems = thisSeatItems.length > 0;
              const isSeatOccupied = hasSeatItems || chairsWithOrders.has(thisSeatNum) || (chairsWithOrders.size === 0 && thisSeatNum <= occupiedChairsCount);
              const thisSeatSubtotal = thisSeatItems.reduce((sum, i) => sum + i.totalPrice, 0);
              const thisSeatTax = Math.round(thisSeatSubtotal * 0.05);
              const thisSeatCgst = thisSeatTax / 2;
              const thisSeatSgst = thisSeatTax - thisSeatCgst;
              const thisSeatTotal = thisSeatSubtotal + thisSeatTax;

              if (hasSeatItems) {
                return (
                  <div className="flex-1 min-h-0 flex flex-col space-y-2 py-1">
                    {/* Ordered Dishes List for this Chair */}
                    <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
                      <div className="shrink-0 flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-wider px-1">
                        <span>Chair {thisSeatNum} Ordered Dishes</span>
                        <span>{thisSeatItems.reduce((s, i) => s + i.quantity, 0)} Items</span>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
                        {thisSeatItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3 bg-white border border-stone-200 rounded-xl shadow-2xs space-y-1.5 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-black text-stone-900">
                                  <span className="text-[#9C3D1E] mr-1">{item.quantity}×</span>
                                  <span>{item.name}</span>
                                </div>
                                {item.options && (
                                  <div className="text-[10px] text-stone-500 mt-0.5">
                                    {item.options}
                                  </div>
                                )}
                                {item.addOns && item.addOns.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.addOns.map((ao, aIdx) => (
                                      <span key={aIdx} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black border border-amber-300">
                                        + {ao}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-black text-stone-900">
                                  ₹{item.totalPrice.toFixed(2)}
                                </div>
                                {item.quantity > 1 && (
                                  <div className="text-[9.5px] text-stone-400">
                                    ₹{item.price} each
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                              <span className="text-stone-400">KOT #{item.ticketNumber}</span>
                              <StagePill
                                stage={item.stage}
                                onServe={() => waiterMarkKitchenItemServed(item.ticketId, item.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chair Cost Breakdown Card */}
                    <div className="shrink-0 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-700">
                        <span>Assigned Guest:</span>
                        <span className="font-black text-stone-900">Seat {thisSeatNum} Guest</span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span>Dishes Subtotal ({thisSeatItems.length} items):</span>
                        <span className="font-bold text-stone-900">₹{thisSeatSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>CGST (2.5%):</span>
                        <span>₹{thisSeatCgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>SGST (2.5%):</span>
                        <span>₹{thisSeatSgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-950 font-black text-sm pt-1.5 border-t border-amber-300">
                        <span>Chair {thisSeatNum} Total:</span>
                        <span className="text-[#9C3D1E]">₹{thisSeatTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              const anyChairHasSpecificOrders = allTableOrderedItems.some((i) => !!i.seatNumber);
              const tableSharedItems = allTableOrderedItems.filter((i) => !i.seatNumber);
              const isEntireTableOrder = !anyChairHasSpecificOrders && tableSharedItems.length > 0;

              if (isSeatOccupied && isEntireTableOrder) {
                return (
                  <div className="flex-1 min-h-0 flex flex-col space-y-2 py-1">
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-6 text-center space-y-1">
                      <p className="text-xs font-bold text-stone-700">
                        Seat {thisSeatNum} Guest
                      </p>
                      <p className="text-[11px] text-stone-500 max-w-[280px]">
                        Chair {thisSeatNum} is sharing general table orders (order placed for entire table).
                      </p>
                    </div>
                    <div className="shrink-0 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-700">
                        <span>Assigned Guest:</span>
                        <span className="font-black text-stone-900">Seat {thisSeatNum} Guest</span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span>Equal Table Share:</span>
                        <span className="font-bold text-stone-900">₹{perChairSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span>GST (5% split):</span>
                        <span>₹{perChairTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-950 font-black text-sm pt-1.5 border-t border-stone-300">
                        <span>Chair {thisSeatNum} Share Total:</span>
                        <span className="text-[#9C3D1E]">₹{perChairTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-8 text-center space-y-2.5">
                  <div className="h-11 w-11 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                    <Armchair className="h-5.5 w-5.5" />
                  </div>
                  <p className="font-mono text-xs font-bold text-stone-600">
                    {isVacant ? `Table is Vacant — Chair ${thisSeatNum} is empty.` : `Chair ${thisSeatNum} has no orders placed yet.`}
                  </p>
                </div>
              );
            })()
          )}

        </motion.div>
        </div>

        {/* Quick Operations: Merge Seats / Split Back & Serve Food */}
        <div className="shrink-0 space-y-2 px-4">
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            {Object.keys(mergedSeatGroups).length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  const targetKey = activeGroup ? activeGroup.key : Object.keys(mergedSeatGroups)[0];
                  if (targetKey) handleSplitSeatGroup(targetKey);
                }}
                className="min-h-[44px] py-2.5 px-3 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <Split className="h-4 w-4 text-rose-600" />
                <span>Split Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMergeTab('SEATS'); setShowMergeModal(true); }}
                className="min-h-[44px] py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <Users className="h-4 w-4 text-indigo-700" />
                <span>Merge Seats</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleServeReadyFood}
              disabled={!hasReadyFood}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-mono text-xs font-black shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                hasReadyFood
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
                  : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-60'
              }`}
            >
              <Utensils className="h-4 w-4" />
              <span>Serve Food</span>
            </button>
          </div>
        </div>

        {/* ── VACATE TABLE CONFIRMATION MODAL ── */}
        <AnimatePresence>
          {confirmVacate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
              onClick={() => setConfirmVacate(false)}
            >
              <motion.div
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                exit={{ y: 200 }}
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-x-0 bottom-0 mx-auto max-w-sm rounded-t-3xl bg-white p-5 pb-6 border-t border-x border-[#EAE5DF] shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-black text-stone-900">
                      Vacate {table.number}?
                    </h3>
                    <p className="font-mono text-xs text-stone-500">
                      All guests must have paid.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono pt-1">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    type="button"
                    onClick={() => setConfirmVacate(false)}
                    className="min-h-[48px] rounded-xl border border-stone-200 font-bold text-stone-700 hover:bg-stone-50 transition-all duration-150"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    type="button"
                    onClick={handleVacate}
                    className="min-h-[48px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition-all duration-150 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Vacate</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </div>

      {/* Sticky footer: Add Dishes & Settle */}
      <footer className="shrink-0 bg-white/95 backdrop-blur-md border-t border-[#EAE5DF] px-4 py-2.5 pb-5 z-30">
        <div className="grid grid-cols-2 gap-2.5 font-mono text-xs font-black">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => onGoToOrder(typeof selectedSeat === 'number' ? selectedSeat : undefined)}
            className="min-h-[48px] rounded-xl bg-[#9C3D1E] hover:bg-[#853318] text-white flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Dishes</span>
          </motion.button>
          <motion.button
            whileTap={!isCurrentSelectionSettleDisabled ? { scale: 0.95 } : undefined}
            type="button"
            disabled={isCurrentSelectionSettleDisabled}
            onClick={() => {
              if (typeof selectedSeat === 'number') {
                const bd = getChairBillBreakdown(selectedSeat);
                onGoToSettle(Math.round(bd.totalDue), `Chair ${selectedSeat}`);
              } else if (typeof selectedSeat === 'string' && mergedSeatGroups[selectedSeat]) {
                const bd = getChairBillBreakdown(selectedSeat);
                onGoToSettle(Math.round(bd.totalDue), `Chairs ${mergedSeatGroups[selectedSeat].join(' & ')}`);
              } else {
                onGoToSettle();
              }
            }}
            title={currentSelectionSettleReason || 'Proceed to payment settlement'}
            className={`min-h-[48px] rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs ${
              isCurrentSelectionSettleDisabled
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>{isCurrentSelectionSettleDisabled && hasTableOrders ? 'Serve to Settle' : 'Settle'}</span>
          </motion.button>
        </div>
      </footer>

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

      {/* ── MODAL: SPLIT BILL (BY PERSONS OR BY CHAIRS) ── */}
      <AnimatePresence>
        {showSplitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 flex items-end justify-center p-3 font-mono"
            onClick={() => setShowSplitModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-4 border border-[#EAE5DF] shadow-2xl space-y-3.5 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 shrink-0">
                <div className="flex items-center gap-2 text-stone-900 font-black text-sm">
                  <Split className="h-4 w-4 text-amber-700" />
                  <span>Split Bill — Table {table.number}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  className="h-7 w-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer active:scale-90 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Total Summary Banner */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between shrink-0">
                <div>
                  <div className="text-[10px] font-bold text-amber-800 uppercase">Table Total Bill</div>
                  <div className="text-lg font-black text-stone-950">₹{grandTotal.toFixed(2)}</div>
                </div>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Incl. 5% GST
                </span>
              </div>

              {/* Tab Selector: Persons vs Chairs */}
              <div className="flex gap-2 p-1 bg-stone-100 rounded-xl text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setSplitMethod('PERSONS')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    splitMethod === 'PERSONS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  By Persons (Equal)
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMethod('CHAIRS')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    splitMethod === 'CHAIRS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  By Chairs / Groups
                </button>
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto space-y-3 pr-0.5 flex-1">
                {splitMethod === 'PERSONS' ? (
                  <div className="space-y-3">
                    {/* Stepper for number of persons */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-700 block">Number of Guests:</span>
                        <span className="text-[10px] text-stone-500">
                          ₹{Math.round(grandTotal / splitCoverCount)} per person
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSplitCoverCount((c) => Math.max(2, c - 1))}
                          disabled={splitCoverCount <= 2}
                          className="h-8 w-8 rounded-xl bg-white border border-stone-300 font-black text-stone-700 disabled:opacity-40 flex items-center justify-center active:scale-90 transition shadow-2xs"
                        >
                          -
                        </button>
                        <span className="font-mono text-base font-black text-stone-900 min-w-[20px] text-center">
                          {splitCoverCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSplitCoverCount((c) => Math.min(20, c + 1))}
                          disabled={splitCoverCount >= 20}
                          className="h-8 w-8 rounded-xl bg-white border border-stone-300 font-black text-stone-700 disabled:opacity-40 flex items-center justify-center active:scale-90 transition shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Breakdown list of equal split persons */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider px-1">
                        Individual Share Slips ({splitCoverCount}):
                      </div>
                      {Array.from({ length: splitCoverCount }).map((_, idx) => {
                        const personNum = idx + 1;
                        const perPersonBase = Math.round(grandTotal / splitCoverCount);
                        // Make sure last person captures rounding diff
                        const thisPersonAmt =
                          personNum === splitCoverCount
                            ? grandTotal - perPersonBase * (splitCoverCount - 1)
                            : perPersonBase;

                        return (
                          <div
                            key={personNum}
                            className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs"
                          >
                            <div>
                              <div className="font-black text-stone-900 text-xs">
                                Guest #{personNum}
                              </div>
                              <div className="text-[10px] text-stone-500">
                                1 of {splitCoverCount} equal parts
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-stone-900 text-xs">
                                ₹{thisPersonAmt.toFixed(0)}
                              </span>
                              {(() => {
                                const canSettleCover = !hasUnservedTableItems && grandTotal > 0 && thisPersonAmt > 0;
                                return (
                                  <button
                                    type="button"
                                    disabled={!canSettleCover}
                                    onClick={() => {
                                      setShowSplitModal(false);
                                      onGoToSettle(
                                        Math.round(thisPersonAmt),
                                        `Guest ${personNum} of ${splitCoverCount}`
                                      );
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-2xs transition ${
                                      canSettleCover
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer'
                                        : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                                    }`}
                                    title={!canSettleCover ? 'All table dishes must be served first' : undefined}
                                  >
                                    {canSettleCover ? 'Settle' : 'Serve First'}
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider px-1">
                      Itemized Chair Bills:
                    </div>

                    {/* Merged Groups */}
                    {Object.entries(mergedSeatGroups).map(([groupKey, groupSeats]) => {
                      const breakdown = getChairBillBreakdown(groupKey);
                      const groupDirect = allTableOrderedItems.filter((i) => i.seatNumber && groupSeats.includes(i.seatNumber));
                      const groupTarget = groupDirect.length > 0 ? groupDirect : allTableOrderedItems.filter((i) => !i.seatNumber);
                      const canSettleGroup = breakdown.totalDue > 0 && groupTarget.length > 0 && groupTarget.every((i) => i.stage === 'Served');
                      return (
                        <div
                          key={groupKey}
                          className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between"
                        >
                          <div>
                            <div className="font-black text-indigo-950 text-xs flex items-center gap-1">
                              <Link2 className="h-3 w-3 text-indigo-600" />
                              <span>Combined Chairs {groupSeats.join(' & ')}</span>
                            </div>
                            <div className="text-[10px] text-indigo-700">
                              {breakdown.directItems.length} items ordered
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-indigo-950 text-xs">
                              ₹{breakdown.totalDue.toFixed(0)}
                            </span>
                            <button
                              type="button"
                              disabled={!canSettleGroup}
                              onClick={() => {
                                setShowSplitModal(false);
                                onGoToSettle(
                                  Math.round(breakdown.totalDue),
                                  `Chairs ${groupSeats.join(' & ')} Group`
                                );
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-2xs transition ${
                                canSettleGroup
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                              }`}
                              title={!canSettleGroup ? 'All group dishes must be served first' : undefined}
                            >
                              {canSettleGroup ? 'Settle' : 'Serve First'}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Individual chairs not in merged groups */}
                    {Array.from({ length: totalChairs }).map((_, idx) => {
                      const seatNum = idx + 1;
                      const inGroup = Object.values(mergedSeatGroups).some((seats) =>
                        seats.includes(seatNum)
                      );
                      if (inGroup) return null;
                      const breakdown = getChairBillBreakdown(seatNum);
                      if (breakdown.totalDue <= 0 && isVacant) return null;

                      const chairDirect = allTableOrderedItems.filter((i) => i.seatNumber === seatNum);
                      const chairTarget = chairDirect.length > 0 ? chairDirect : allTableOrderedItems.filter((i) => !i.seatNumber);
                      const canSettleChair = breakdown.totalDue > 0 && chairTarget.length > 0 && chairTarget.every((i) => i.stage === 'Served');

                      return (
                        <div
                          key={seatNum}
                          className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between"
                        >
                          <div>
                            <div className="font-black text-stone-900 text-xs flex items-center gap-1">
                              <Armchair className="h-3 w-3 text-stone-600" />
                              <span>Chair {seatNum}</span>
                            </div>
                            <div className="text-[10px] text-stone-500">
                              {breakdown.directItems.length > 0
                                ? `${breakdown.directItems.length} direct items`
                                : 'Table share'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900 text-xs">
                              ₹{breakdown.totalDue.toFixed(0)}
                            </span>
                            <button
                              type="button"
                              disabled={!canSettleChair}
                              onClick={() => {
                                setShowSplitModal(false);
                                onGoToSettle(
                                  Math.round(breakdown.totalDue),
                                  `Chair ${seatNum}`
                                );
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-2xs transition ${
                                canSettleChair
                                  ? 'bg-[#9C3D1E] hover:bg-[#853216] text-white active:scale-95 cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                              }`}
                              title={!canSettleChair ? `All dishes for Chair ${seatNum} must be served first` : undefined}
                            >
                              {canSettleChair ? 'Settle' : 'Serve First'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-stone-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
