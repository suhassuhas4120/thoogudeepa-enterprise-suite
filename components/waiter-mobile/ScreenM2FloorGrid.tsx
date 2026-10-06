'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Utensils,
  Bell,
  Search,
  ChevronRight,
  AlertTriangle,
  Armchair,
  Link2,
  X,
  CheckCircle2,
  Unlink,
  Megaphone,
  Minus,
  Pencil,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  waiterName: string;
  assignedSection?: string;
  onSelectTable: (tableNum: string, chairNum?: number) => void;
  onGoToPings: () => void;
  onGoToReady: () => void;
  // tables.length invariant
}

function getTableCardStyle(tbl: SharedTable, isFull: boolean) {
  if (tbl.mergedWith) {
    return 'border-indigo-400 bg-indigo-50/50 text-indigo-950 shadow-xs';
  }
  if (tbl.status === 'BILLING') {
    return 'border-purple-300 bg-purple-50/60 text-purple-900 shadow-xs';
  }
  if (tbl.status === 'CLEANING') {
    return 'border-stone-300 bg-[#FAF8F5] text-stone-700 shadow-xs';
  }
  if (tbl.status === 'OCCUPIED') {
    if (isFull) {
      return 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-xs ring-1 ring-amber-300/60';
    }
    return 'border-amber-300 bg-amber-50/60 text-amber-900 shadow-xs';
  }
  // VACANT
  return 'border-emerald-200 bg-emerald-50/40 text-emerald-800 shadow-xs';
}

function getTableBadge(tbl: SharedTable, isFull: boolean, occupiedChairs: number, totalChairs: number) {
  if (tbl.status === 'BILLING') {
    return { text: 'BILLING', style: 'bg-purple-100 text-purple-800 border-purple-300' };
  }
  if (tbl.status === 'CLEANING') {
    return { text: 'CLEANING', style: 'bg-stone-200 text-stone-700 border-stone-300' };
  }
  if (tbl.status === 'OCCUPIED') {
    if (isFull) {
      return { text: `FULL (${totalChairs}/${totalChairs})`, style: 'bg-amber-600 text-white border-amber-600 font-black' };
    }
    return { text: `${occupiedChairs}/${totalChairs} SEATED`, style: 'bg-amber-100 text-amber-800 border-amber-300' };
  }
  return { text: 'VACANT', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}

type SectionFilter = 'MY' | 'ALL';

const SECTION_CODE_MAP: Record<string, string> = {
  'SEC_A': 'Express / Couple Hall',
  'SEC_B': 'Main Dining Hall',
  'SEC_C': 'Family Section',
  'SEC_D': 'Grand Feast Hall',
};

const SECTION_MAP: Record<string, string> = {
  '1111': 'Express / Couple Hall',
  '2222': 'Main Dining Hall',
  '3333': 'Family Section',
  '4444': 'Grand Feast Hall',
};

function calculateElapsedMinutes(timeStr: string): number | null {
  if (!timeStr || timeStr === '--') return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  const now = new Date();
  const seated = new Date();
  seated.setHours(h, m, 0, 0);
  let diffMs = now.getTime() - seated.getTime();
  if (diffMs < 0) {
    // Crossed midnight
    diffMs += 24 * 60 * 60 * 1000;
  }
  return Math.max(0, Math.floor(diffMs / 60000));
}

type StatusFilter = 'ALL' | 'OCCUPIED' | 'VACANT' | 'BILLING';

function formatElapsed(mins: number): string {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function ScreenM2FloorGrid({ waiterName, assignedSection, onSelectTable, onGoToPings, onGoToReady }: Props) {
  const {
    tables,
    pings,
    kdsTickets,
    waiterVacatesTable,
    waiterMergeTables,
    waiterConfirmMerge,
    waiterRemoveChair,
    waiterUnmergeTable,
    waiterRemoveTableFromGroup,
  } = useSharedBridge();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showAlert, setShowAlert] = useState(true);
  const [holdingTable, setHoldingTable] = useState<string | null>(null);
  const [managerNoticeOpen, setManagerNoticeOpen] = useState(false);
  const [editingTables, setEditingTables] = useState<Set<string>>(new Set());

  const handleRemoveChair = (tableNum: string, chairIdx: number) => {
    waiterRemoveChair(tableNum, chairIdx);
  };

  const handleRemoveTableFromGroup = (primaryNum: string, memberNum: string, totalMembers: number) => {
    if (totalMembers <= 2) {
      waiterUnmergeTable(primaryNum);
      setEditingTables((prev) => {
        const next = new Set(prev);
        next.delete(primaryNum);
        return next;
      });
    } else {
      waiterRemoveTableFromGroup(memberNum);
    }
  };
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdingTableRef = useRef<string | null>(null);   // ref copy so window closures see latest
  const activePidRef = useRef<number | null>(null);      // pointer ID being tracked
  const dragStartPos = useRef({ x: 0, y: 0 });          // where pointer was when hold fired
  const cardDragX = useMotionValue(0);                   // shared X offset for the held card
  const cardDragY = useMotionValue(0);                   // shared Y offset for the held card

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');
  const urgentPingTables = new Set(activePings.map((p) => p.tableNumber));

  // Auto-dismiss alert notification after 4.5 seconds
  useEffect(() => {
    if (activePings.length > 0) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activePings.length]);

  // Floor Chair / Seat Statistics Calculation
  const totalFloorChairs = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const totalOccupiedChairs = tables.reduce((acc, t) => {
    if (t.status === 'OCCUPIED' || t.status === 'BILLING') {
      const occ = Math.min(t.capacity, Math.max(1, t.guestCount || (t.activeItems && t.activeItems.length > 0 ? 2 : 1)));
      return acc + occ;
    }
    return acc;
  }, 0);
  const totalAvailableChairs = totalFloorChairs - totalOccupiedChairs;

  // Derive waiter's assigned section from assignedSection prop, name, or default to Main Dining Hall
  const effectiveSection =
    (assignedSection && SECTION_CODE_MAP[assignedSection]) ||
    (assignedSection && assignedSection !== 'ALL' ? assignedSection : null) ||
    (Object.entries(SECTION_MAP).find(
      ([, sec]) => waiterName.toLowerCase().includes(sec.split(' ')[0].toLowerCase())
    )?.[1] ?? 'Main Dining Hall');

  const filtered = tables.filter((t) => {
    const matchSearch =
      t.number.toLowerCase().includes(search.toLowerCase()) ||
      t.section.toLowerCase().includes(search.toLowerCase());
    const matchSection =
      sectionFilter === 'ALL'
        ? true
        : t.section.toLowerCase().includes(effectiveSection.toLowerCase()) ||
          (effectiveSection === 'Grand Feast Hall' && t.section === 'Courtyard Garden');
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchSection && matchStatus;
  });

  // ── Unified Tables Computation ──
  // Each merge group appears as ONE card (only the primary is rendered; secondaries are skipped).
  // Primary = the table in the group with the lowest number (stable, chosen by store too).
  const seenGroupIds = new Set<string>();

  const unifiedTables: Array<{
    id: string;
    primary: SharedTable;
    allMembers: SharedTable[];        // primary + all secondaries
    isMerged: boolean;
    displayNumber: string;
    totalChairs: number;
    occupiedChairs: number;
    availableChairs: number;
    totalBill: number;
    kotCount: number;
    status: SharedTable['status'];
    section: string;
    hasPing: boolean;
    elapsedMins: number | null;
  }> = [];

  for (const tbl of filtered) {
    // Is this table in a merge group?
    const peers = tbl.mergeGroupPeers;
    const isMerged = Boolean(peers && peers.length > 1);

    if (isMerged && peers) {
      // Use sorted first member as group key — skip if we already processed this group
      const groupKey = peers.slice().sort()[0];
      if (seenGroupIds.has(groupKey)) continue;
      seenGroupIds.add(groupKey);

      // Primary = the table in this group with the lowest number
      const primaryNum = groupKey;

      // Skip this group if the primary table is not in filtered (e.g. search/section filtered out)
      const primaryTbl = filtered.find((t) => t.number === primaryNum);
      if (!primaryTbl) continue;

      // Gather all member tables (from full tables list, not just filtered)
      const allMembers = peers
        .map((num) => tables.find((t) => t.number === num))
        .filter(Boolean) as SharedTable[];

      const totalChairs = allMembers.reduce((s, t) => {
        const removed = t.removedChairs?.length || 0;
        return s + Math.max(0, t.capacity - removed);
      }, 0);
      const occupiedChairs = allMembers.reduce((s, t) => {
        if (t.status === 'OCCUPIED' || t.status === 'BILLING') {
          return s + Math.min(t.capacity, Math.max(0, t.guestCount || (t.activeItems && t.activeItems.length > 0 ? 1 : 0)));
        }
        return s;
      }, 0);
      const kotCount = allMembers.reduce((s, t) => {
        return s + kdsTickets.filter((tk) => tk.tableNumber === t.number).length;
      }, 0);
      const hasPing = allMembers.some((t) => urgentPingTables.has(t.number));
      const elapsedMins = calculateElapsedMinutes(primaryTbl.seatedTime);

      unifiedTables.push({
        id: peers.slice().sort().join('-'),
        primary: primaryTbl,
        allMembers,
        isMerged: true,
        displayNumber: peers.slice().sort().join(' + '),
        totalChairs,
        occupiedChairs,
        availableChairs: Math.max(0, totalChairs - occupiedChairs),
        totalBill: primaryTbl.currentBill || 0,   // primary holds combined bill in store
        kotCount,
        status: primaryTbl.status,
        section: primaryTbl.section,
        hasPing,
        elapsedMins,
      });

    } else {
      // Solo table — not in any merge group
      if (seenGroupIds.has(tbl.number)) continue;
      seenGroupIds.add(tbl.number);

      const totalChairs = tbl.capacity;
      const occupiedChairs = (tbl.status === 'OCCUPIED' || tbl.status === 'BILLING')
        ? Math.min(totalChairs, Math.max(1, tbl.guestCount || (tbl.activeItems && tbl.activeItems.length > 0 ? 2 : 1)))
        : 0;
      const kotCount = kdsTickets.filter((tk) => tk.tableNumber === tbl.number).length;
      const hasPing = urgentPingTables.has(tbl.number);
      const elapsedMins = calculateElapsedMinutes(tbl.seatedTime);

      unifiedTables.push({
        id: tbl.id,
        primary: tbl,
        allMembers: [tbl],
        isMerged: false,
        displayNumber: tbl.number,
        totalChairs,
        occupiedChairs,
        availableChairs: Math.max(0, totalChairs - occupiedChairs),
        totalBill: tbl.currentBill || 0,
        kotCount,
        status: tbl.status,
        section: tbl.section,
        hasPing,
        elapsedMins,
      });
    }
  }

  // Urgency order: BILLING, OCCUPIED with pending calls, OCCUPIED, VACANT, CLEANING
  const urgencyRank = (e: { status: SharedTable['status']; hasPing: boolean }): number => {
    if (e.status === 'BILLING') return 0;
    if (e.status === 'OCCUPIED') return e.hasPing ? 1 : 2;
    if (e.status === 'VACANT') return 3;
    return 4;
  };
  unifiedTables.sort((a, b) => urgencyRank(a) - urgencyRank(b));

  // Live floor figures for the summary bar
  const floorOccupiedCount = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING').length;
  const floorLiveBill = tables.reduce((s, t) => s + (t.currentBill || 0), 0);

  // Shared spring-back helper — called after drag ends or is cancelled
  const springBack = () => {
    animate(cardDragX, 0, { type: 'spring', stiffness: 500, damping: 35 });
    animate(cardDragY, 0, { type: 'spring', stiffness: 500, damping: 35 });
  };

  // startTableHold — call on pointerDown on a card.
  // After 550ms (without lifting), activates drag tracking on window so the
  // user can continue holding and immediately start moving the card.
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
        ev.preventDefault(); // stop the browser from treating this as a scroll gesture
        cardDragX.set(ev.clientX - dragStartPos.current.x);
        cardDragY.set(ev.clientY - dragStartPos.current.y);
      };

      const onEnd = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);

        if (ev.type === 'pointerup') {
          // Collision detect — elementsFromPoint skips the held card on top
          const allEls = document.elementsFromPoint(ev.clientX, ev.clientY);
          const targetEl = allEls.find((el) => {
            const num = el.getAttribute('data-tablenum');
            return num && !allMemberNums.includes(num);
          });
          if (targetEl) {
            const targetNum = targetEl.getAttribute('data-tablenum')!;
            waiterMergeTables(tableNum, targetNum);
          }
        }

        springBack();
        setHoldingTable(null);
        holdingTableRef.current = null;
        activePidRef.current = null;
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onEnd);
      window.addEventListener('pointercancel', onEnd);
    }, 550);
  };

  const cancelTableHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };


  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* 50/50 Sticky Toolbar: Left 50% Section Filter (MY SECTION / ALL) | Right 50% Search Input */}
      <div className="sticky top-[108px] z-30 shrink-0 bg-white/95 backdrop-blur-md border-b border-[#EAE5DF] px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
        {/* Left 50%: MY SECTION & ALL */}
        <div className="w-1/2 flex items-center gap-1.5 font-mono text-[11px] font-black">
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => setSectionFilter('MY')}
            className={`flex-1 py-2 px-1 rounded-xl border transition-all duration-150 text-center truncate shadow-2xs ${
              sectionFilter === 'MY'
                ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
            }`}
            title={`Assigned Section: ${effectiveSection}`}
          >
            MY SECTION
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => setSectionFilter('ALL')}
            className={`flex-1 py-2 px-1 rounded-xl border transition-all duration-150 text-center truncate shadow-2xs ${
              sectionFilter === 'ALL'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
            }`}
          >
            ALL
          </motion.button>
        </div>

        {/* Right 50%: Search */}
        <div className="w-1/2 relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search table…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9C3D1E] shadow-2xs"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Urgent alert banner if pending calls exist — temporary notification, auto-dismisses */}
      <AnimatePresence>
        {showAlert && activePings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-3.5 mt-2.5 overflow-hidden shrink-0"
          >
            <div className="px-3.5 py-2.5 bg-rose-600 text-white rounded-2xl flex items-center justify-between shadow-sm">
              <button
                type="button"
                onClick={onGoToPings}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200" />
                <span className="font-mono text-xs font-black">
                  {activePings.length} assistance call{activePings.length > 1 ? 's' : ''} pending — tap to attend
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition ml-2 shrink-0"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counters strip — enlarged filter chips + Manager Notice icon with proper spacing */}
      <div className="px-3.5 pt-3 pb-2 flex items-center gap-2 font-mono shrink-0 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition active:scale-95 ${
            statusFilter === 'OCCUPIED'
              ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs ring-1 ring-amber-300'
              : 'bg-white text-amber-800 border-[#EAE5DF] hover:bg-amber-50/50'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>{tables.filter(t => t.status === 'OCCUPIED').length} Occupied</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'VACANT' ? 'ALL' : 'VACANT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition active:scale-95 ${
            statusFilter === 'VACANT'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs ring-1 ring-emerald-300'
              : 'bg-white text-emerald-800 border-[#EAE5DF] hover:bg-emerald-50/50'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{tables.filter(t => t.status === 'VACANT').length} Vacant</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'BILLING' ? 'ALL' : 'BILLING')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition active:scale-95 ${
            statusFilter === 'BILLING'
              ? 'bg-purple-100 text-purple-900 border-purple-400 shadow-2xs ring-1 ring-purple-300'
              : 'bg-white text-purple-800 border-[#EAE5DF] hover:bg-purple-50/50'
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
          <span>{tables.filter(t => t.status === 'BILLING').length} Billing</span>
        </button>

        {statusFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="px-2 py-1 text-[10px] font-black text-stone-500 hover:text-stone-800 underline active:scale-95"
          >
            Reset
          </button>
        )}

        {/* Manager Notification Icon Button */}
        <button
          type="button"
          onClick={() => setManagerNoticeOpen(true)}
          className="ml-auto flex items-center justify-center p-2 rounded-xl bg-white hover:bg-amber-50 text-stone-700 hover:text-[#9C3D1E] border border-[#EAE5DF] hover:border-amber-300 shadow-2xs active:scale-95 transition shrink-0"
          title="Manager Broadcasts & Notices"
        >
          <Megaphone className="h-4 w-4 text-[#9C3D1E]" />
        </button>
      </div>

      {/* 2-column responsive table grid — merged pairs become ONE unified card */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {unifiedTables.map((entry) => {
            const isFull = entry.occupiedChairs >= entry.totalChairs && entry.totalChairs > 0;
            const badge = getTableBadge(entry.primary, isFull, entry.occupiedChairs, entry.totalChairs);
            const isBeingHeld = holdingTable === entry.primary.number;
            const allMemberNums = entry.allMembers.map((m) => m.number);
            const readyCount = kdsTickets.filter(
              (tk) => tk.status === 'READY' && allMemberNums.includes(tk.tableNumber)
            ).length;
            const pendingPingCount = pings.filter(
              (p) => p.status === 'PENDING' && allMemberNums.includes(p.tableNumber)
            ).length;
            const showBill = (entry.status === 'OCCUPIED' || entry.status === 'BILLING') && entry.totalBill > 0;

            // Distinct colors per table-member in merged group (primary = terracotta, rest = indigo shades)
            const memberColors = [
              { occ: 'bg-[#9C3D1E] text-white', empty: 'border-2 border-dashed border-stone-300 bg-white text-stone-500' },
              { occ: 'bg-indigo-700 text-white', empty: 'border-2 border-dashed border-indigo-300 bg-indigo-50 text-indigo-600' },
              { occ: 'bg-violet-700 text-white', empty: 'border-2 border-dashed border-violet-300 bg-violet-50 text-violet-600' },
              { occ: 'bg-teal-700 text-white', empty: 'border-2 border-dashed border-teal-300 bg-teal-50 text-teal-600' },
            ];

            return (
              <motion.div
                key={entry.id}
                data-tablenum={entry.primary.number}
                style={{
                  x: isBeingHeld ? cardDragX : 0,
                  y: isBeingHeld ? cardDragY : 0,
                }}
                animate={isBeingHeld ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  startTableHold(
                    entry.primary.number,
                    e.pointerId,
                    e.clientX,
                    e.clientY,
                    allMemberNums,
                  );
                }}
                onPointerUp={cancelTableHold}
                onPointerCancel={cancelTableHold}
                onClick={() => {
                  // Only navigate if hold never fired
                  if (!holdingTableRef.current) onSelectTable(entry.primary.number);
                }}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between min-h-[178px] relative touch-pan-y cursor-pointer select-none ${getTableCardStyle(entry.primary, isFull)} ${
                  isBeingHeld ? 'shadow-2xl' : ''
                } ${entry.isMerged ? 'border-indigo-400 bg-indigo-50/60 col-span-2' : ''}`}
              >
                <div>
                  {/* Card Header: Table Number(s) (left) & Status Badge + Notification (right) */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-current/15 gap-1.5">
                    {entry.isMerged ? (
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {entry.allMembers.map((member, idx) => (
                          <React.Fragment key={member.number}>
                            <span className="inline-flex items-center gap-1 font-mono text-sm font-black text-stone-900 bg-white/95 border border-stone-300 px-2 py-0.5 rounded-lg shadow-2xs">
                              <span>{member.number}</span>
                              {entry.isMerged && (entry.primary.isMergeConfirmed === false || editingTables.has(entry.primary.number)) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTableFromGroup(entry.primary.number, member.number, entry.allMembers.length);
                                  }}
                                  className="ml-0.5 h-3.5 w-3.5 rounded-full hover:bg-rose-100 text-stone-400 hover:text-rose-600 flex items-center justify-center transition active:scale-90"
                                  title={`Remove Table ${member.number}`}
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </span>
                            {idx < entry.allMembers.length - 1 && (
                              <span className="font-mono text-xs font-bold text-stone-400 select-none">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-base font-black text-stone-900 truncate">
                          {entry.displayNumber}
                        </span>
                      </div>
                    )}

                    {/* Right: Status Badge or Unmerge (if confirmed merged) & Notification Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded border truncate ${badge.style}`}>
                        {badge.text}
                      </span>

                      {/* Notification badge placed on the right of the seated badge */}
                      {pendingPingCount > 0 && (
                        <span className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-md bg-red-600 text-white font-mono text-[9.5px] font-black animate-pulse shadow-2xs">
                          <Bell className="h-2.5 w-2.5" />
                          <span>{pendingPingCount}</span>
                        </span>
                      )}

                      {entry.isMerged && (
                        (entry.primary.isMergeConfirmed === false || editingTables.has(entry.primary.number)) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              waiterUnmergeTable(entry.primary.number);
                              setEditingTables((prev) => {
                                const next = new Set(prev);
                                next.delete(entry.primary.number);
                                return next;
                              });
                            }}
                            className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-mono text-[9px] font-black flex items-center gap-1 active:scale-90 transition shadow-2xs shrink-0"
                            title="Unmerge tables"
                          >
                            <Unlink className="h-3 w-3" />
                            <span>Unmerge</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTables((prev) => new Set(prev).add(entry.primary.number));
                            }}
                            className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 shadow-2xs active:scale-90 transition flex items-center justify-center shrink-0"
                            title="Edit merged tables & chairs"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Combined Bill + Small Merged Icon + Ready Notification side-by-side */}
                  <div className="flex items-center justify-between gap-2 mt-2 font-mono">
                    <span className={`text-stone-900 font-mono ${showBill ? 'text-xs font-bold' : 'font-black text-base'}`}>
                      ₹{(entry.totalBill || 0).toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {entry.isMerged && (
                        <span
                          className="p-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs flex items-center justify-center"
                          title="Merged Tables"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {readyCount > 0 && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-mono text-[9.5px] font-black shrink-0 shadow-2xs">
                          <span className="text-emerald-600 animate-pulse text-[8px]">●</span>
                          <span>{readyCount} READY</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chair Matrix — 4 chairs per row with compact, clean spacing */}
                  {(() => {
                    const isEditing = entry.isMerged && (entry.primary.isMergeConfirmed === false || editingTables.has(entry.primary.number));
                    const effectiveChairs = entry.allMembers.reduce((sum, member) => {
                      const removedCount = member.removedChairs?.length || 0;
                      return sum + Math.max(0, member.capacity - removedCount);
                    }, 0);

                    const chairGridCols =
                      effectiveChairs >= 4
                        ? 'grid-cols-4'
                        : effectiveChairs === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2';

                    return (
                      <div className="my-1.5 p-1.5 rounded-xl bg-white/95 border border-stone-200/80 shadow-2xs">
                        <div className={`grid ${chairGridCols} gap-1.5 w-full`}>
                          {entry.allMembers.map((member, memberIdx) => {
                            const colors = memberColors[memberIdx % memberColors.length];
                            const memberOccupied = (member.status === 'OCCUPIED' || member.status === 'BILLING')
                              ? Math.min(member.capacity, Math.max(0, member.guestCount || 0))
                              : 0;

                            return Array.from({ length: member.capacity }).map((_, idx) => {
                              if (member.removedChairs?.includes(idx)) return null;

                              const isOccupied = idx < memberOccupied;
                              const seatNum = idx + 1;
                              return (
                                <div key={`m${memberIdx}-s${idx}`} className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onSelectTable(member.number, seatNum); }}
                                    className={`w-full ${chairGridCols === 'grid-cols-2' ? 'py-1.5 px-2 gap-1.5' : 'py-1 px-1 gap-1'} rounded-lg flex items-center justify-center font-mono transition-all duration-150 active:scale-90 ${
                                      isOccupied ? colors.occ : colors.empty
                                    }`}
                                    title={`Seat ${seatNum} — ${isOccupied ? 'Occupied' : 'Vacant'}`}
                                  >
                                    <Armchair className={`${chairGridCols === 'grid-cols-2' ? 'h-4 w-4' : 'h-3.5 w-3.5'} shrink-0 ${isOccupied ? 'text-amber-200' : 'text-stone-400'}`} />
                                    <span className={`${chairGridCols === 'grid-cols-2' ? 'text-xs' : 'text-[11px]'} font-black`}>{seatNum}</span>
                                  </button>
                                  {isEditing && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveChair(member.number, idx);
                                      }}
                                      className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition active:scale-75 z-10"
                                      title={`Remove Seat ${seatNum}`}
                                    >
                                      <Minus className="h-2 w-2 stroke-[3]" />
                                    </button>
                                  )}
                                </div>
                              );
                            });
                          })}
                        </div>
                        <div className="text-[9.5px] font-mono font-bold flex items-center justify-between text-stone-600 pt-1.5 border-t border-stone-100 mt-1.5 px-0.5">
                          <span className={entry.occupiedChairs > 0 ? (entry.status === 'BILLING' ? 'text-purple-700 font-black' : 'text-[#9C3D1E] font-black') : 'text-emerald-700 font-bold'}>
                            {entry.occupiedChairs > 0 ? `${entry.occupiedChairs} Occupied` : 'Vacant'}
                          </span>
                          <span className="text-stone-400 font-medium">{entry.availableChairs} Free</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Merge Confirmation Button (shown inside the card only while editing/unconfirmed) */}
                  {entry.isMerged && (entry.primary.isMergeConfirmed === false || editingTables.has(entry.primary.number)) && (
                    <div className="pb-2 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          waiterConfirmMerge(entry.primary.number);
                          setEditingTables((prev) => {
                            const next = new Set(prev);
                            next.delete(entry.primary.number);
                            return next;
                          });
                        }}
                        className="w-full py-2 bg-[#9C3D1E] hover:bg-[#853216] active:bg-[#6e2912] text-white font-mono text-xs font-black rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>Merge Tables</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-1 border-t border-current/10 flex items-center justify-between font-mono text-[9.5px] text-stone-500">
                  <span>{entry.totalChairs} Seats{entry.isMerged ? ' (Combined)' : ''}</span>
                  <span className="flex items-center gap-1">
                    {entry.kotCount > 0 && <span className="text-[#9C3D1E] font-bold">{entry.kotCount} KOT</span>}
                    {entry.status === 'OCCUPIED' && entry.elapsedMins !== null && (
                      <span className="font-mono font-bold text-stone-600">{formatElapsed(entry.elapsedMins)}</span>
                    )}
                    {entry.status !== 'OCCUPIED' && entry.elapsedMins !== null && entry.elapsedMins > 0 && (
                      <span className={
                        entry.elapsedMins > 45
                          ? 'text-rose-600 font-black'
                          : entry.elapsedMins >= 25
                          ? 'text-amber-600 font-bold'
                          : 'text-stone-400 font-medium'
                      }>
                        {entry.elapsedMins}m
                      </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-stone-400" />
                  </span>
                </div>
              </motion.div>
            );
          })}

        </div>

        {unifiedTables.length === 0 && (
          <div className="text-center py-16 text-stone-400 font-mono text-xs">
            No tables match your filter
          </div>
        )}
      </div>

      {/* Floor summary bar */}
      <div className="sticky bottom-0 z-30 shrink-0 bg-white/95 backdrop-blur-md border-t border-[#EAE5DF] px-4 pt-2 pb-6 flex items-center justify-center gap-2 font-mono text-xs font-black text-stone-800">
        <span>{floorOccupiedCount} Occupied</span>
        <span className="text-stone-300">·</span>
        <span className="text-[#9C3D1E]">₹{floorLiveBill.toLocaleString('en-IN')} live</span>
      </div>




      {/* Manager Broadcast / Operations Notice Modal */}
      <AnimatePresence>
        {managerNoticeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setManagerNoticeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-4 border border-[#EAE5DF] shadow-2xl space-y-3 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-amber-100 text-[#9C3D1E] flex items-center justify-center border border-amber-300">
                    <Megaphone className="h-4 w-4 text-[#9C3D1E]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-stone-900 uppercase">Manager Notice</h3>
                    <p className="text-[10px] text-stone-500 font-bold">Floor Operations Broadcast</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManagerNoticeOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-stone-800">
                  <p className="font-black text-[11px] text-[#9C3D1E] mb-0.5">Kitchen Priority Batch</p>
                  <p className="text-[10.5px] leading-relaxed text-stone-700">Mutton Donne Biryani fresh pot opened. Suggest to tables ordering starters.</p>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700">
                  <p className="font-black text-[11px] text-stone-800 mb-0.5">Floor Cover Advisory</p>
                  <p className="text-[10.5px] leading-relaxed text-stone-600">Peak dining rush underway. Keep billing tables vacated promptly.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setManagerNoticeOpen(false)}
                className="w-full py-2.5 bg-[#9C3D1E] text-white rounded-xl text-xs font-black shadow-sm hover:bg-[#853216] transition active:scale-95"
              >
                Acknowledge Notice
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
