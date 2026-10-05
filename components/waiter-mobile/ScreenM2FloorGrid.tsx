'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Utensils,
  Bell,
  UtensilsCrossed,
  Search,
  ChevronRight,
  AlertTriangle,
  Users,
  Armchair,
  Link2,
  X,
  Trash2,
  CheckCircle2,
  Unlink,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  waiterName: string;
  assignedSection?: string;
  onSelectTable: (tableNum: string, chairNum?: number) => void;
  onGoToPings: () => void;
  onGoToReady: () => void;
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

export function ScreenM2FloorGrid({ waiterName, assignedSection, onSelectTable, onGoToPings, onGoToReady }: Props) {
  const { tables, pings, kdsTickets, waiterVacatesTable, waiterMergeTables, waiterUnmergeTable, waiterRemoveTableFromGroup } = useSharedBridge();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showAlert, setShowAlert] = useState(true);
  const [holdingTable, setHoldingTable] = useState<string | null>(null);
  const [mergeToast, setMergeToast] = useState<string | null>(null);
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

      const totalChairs = allMembers.reduce((s, t) => s + t.capacity, 0);
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
            setMergeToast(`Table ${tableNum} merged with Table ${targetNum}`);
            setTimeout(() => setMergeToast(null), 2500);
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

      {/* Section toggle + search */}
      <div className="px-3.5 pt-3 pb-2 space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-black">
            <button
              type="button"
              onClick={() => setSectionFilter('MY')}
              className={`px-3 py-1.5 rounded-xl border transition ${
                sectionFilter === 'MY'
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                  : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
              title={`Assigned Section: ${effectiveSection}`}
            >
              My Section ({effectiveSection.split(' ')[0]})
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl border transition ${
                sectionFilter === 'ALL'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              Full Floor ({tables.length})
            </button>
          </div>

          {/* Clean Hotel Capacity / Cover calculation badge */}
          <div className="ml-auto font-mono text-[10.5px] font-bold bg-white border border-[#EAE5DF] px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1.5 text-stone-700">
            <Armchair className="h-3.5 w-3.5 text-[#9C3D1E]" />
            {totalOccupiedChairs > 0 ? (
              <>
                <span className="font-black text-[#9C3D1E]">{totalOccupiedChairs}</span>
                <span>Seated</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">{totalAvailableChairs} Available</span>
              </>
            ) : (
              <span className="text-stone-500">All {totalFloorChairs} Seats Available</span>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search table number or section…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9C3D1E] shadow-2xs"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Counters strip — interactive filter chips */}
      <div className="px-3.5 pb-2 flex items-center gap-2 font-mono text-[10px] font-bold shrink-0 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition active:scale-95 ${
            statusFilter === 'OCCUPIED'
              ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-2xs ring-1 ring-amber-300'
              : 'bg-white text-amber-800 border-[#EAE5DF] hover:bg-amber-50/50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>{tables.filter(t => t.status === 'OCCUPIED').length} Occupied</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'VACANT' ? 'ALL' : 'VACANT')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition active:scale-95 ${
            statusFilter === 'VACANT'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs ring-1 ring-emerald-300'
              : 'bg-white text-emerald-800 border-[#EAE5DF] hover:bg-emerald-50/50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{tables.filter(t => t.status === 'VACANT').length} Vacant</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'BILLING' ? 'ALL' : 'BILLING')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition active:scale-95 ${
            statusFilter === 'BILLING'
              ? 'bg-purple-100 text-purple-900 border-purple-400 shadow-2xs ring-1 ring-purple-300'
              : 'bg-white text-purple-800 border-[#EAE5DF] hover:bg-purple-50/50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          <span>{tables.filter(t => t.status === 'BILLING').length} Billing</span>
        </button>

        {statusFilter !== 'ALL' && (
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className="px-2 py-0.5 text-[9px] font-black text-stone-500 hover:text-stone-800 underline active:scale-95"
          >
            Reset
          </button>
        )}

        {readyTickets.length > 0 && (
          <button
            type="button"
            onClick={onGoToReady}
            className="ml-auto flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-xl shadow-2xs active:scale-95 transition shrink-0"
          >
            <UtensilsCrossed className="h-3 w-3" />
            <span>{readyTickets.length} Ready</span>
          </button>
        )}
      </div>

      {/* 2-column responsive table grid — merged pairs become ONE unified card */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {unifiedTables.map((entry) => {
            const isFull = entry.occupiedChairs >= entry.totalChairs && entry.totalChairs > 0;
            const badge = getTableBadge(entry.primary, isFull, entry.occupiedChairs, entry.totalChairs);
            const isBeingHeld = holdingTable === entry.primary.number;
            const allMemberNums = entry.allMembers.map((m) => m.number);

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
                {/* Ping indicator dot */}
                {entry.hasPing && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 rounded-full animate-pulse border-2 border-white shadow-xs" />
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-current/15 gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-base font-black text-stone-900 truncate">
                        {entry.displayNumber}
                      </span>
                      {entry.isMerged && (
                        <span className="font-mono text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-600 text-white flex items-center gap-0.5 shadow-2xs shrink-0">
                          <Link2 className="h-2 w-2" />
                          MERGED
                        </span>
                      )}
                    </div>

                    {/* Inline unmerge — "Unmerge" for 2-table pair; per-table chips for 3+ groups */}
                    {entry.isMerged ? (
                      entry.allMembers.length <= 2 ? (
                        /* 2-table group: single Unmerge button splits the pair */
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            waiterUnmergeTable(entry.primary.number);
                            const others = entry.allMembers.filter(m => m.number !== entry.primary.number).map(m => m.number).join(' & ');
                            setMergeToast(`Tables ${entry.primary.number} & ${others} separated`);
                            setTimeout(() => setMergeToast(null), 2500);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-mono text-[9px] font-black flex items-center gap-1 active:scale-90 transition shrink-0"
                        >
                          <Unlink className="h-3 w-3" />
                          Unmerge
                        </button>
                      ) : (
                        /* 3–4 table group: show each table chip with individual × remove */
                        <div className="flex flex-wrap gap-1 items-center justify-end">
                          {entry.allMembers.map((member) => (
                            <button
                              key={member.number}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                waiterRemoveTableFromGroup(member.number);
                                setMergeToast(`Table ${member.number} removed from group`);
                                setTimeout(() => setMergeToast(null), 2500);
                              }}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-mono text-[9px] font-black active:scale-90 transition"
                              title={`Remove Table ${member.number} from group`}
                            >
                              {member.number}
                              <X className="h-2.5 w-2.5" />
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              waiterUnmergeTable(entry.primary.number);
                              setMergeToast(`All tables separated`);
                              setTimeout(() => setMergeToast(null), 2500);
                            }}
                            className="font-mono text-[8px] font-black text-rose-500 underline underline-offset-2 active:scale-90 transition"
                          >
                            Split All
                          </button>
                        </div>
                      )
                    ) : (
                      <span className={`font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded border truncate ${badge.style}`}>
                        {badge.text}
                      </span>
                    )}
                  </div>

                  {/* Section & combined bill */}
                  <div className="mt-1 font-mono">
                    <div className="text-stone-500 text-[10px] truncate">{entry.section}</div>
                    <div className="text-stone-900 font-black text-base mt-0.5">
                      ₹{entry.totalBill || 0}
                    </div>
                  </div>

                  {/* Chair matrix — one color band per table in the group */}
                  <div className="my-2.5 p-2 rounded-xl bg-white/85 border border-current/15 min-h-[56px] flex flex-col justify-between shadow-2xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {entry.allMembers.map((member, memberIdx) => {
                        const colors = memberColors[memberIdx % memberColors.length];
                        const memberOccupied = (member.status === 'OCCUPIED' || member.status === 'BILLING')
                          ? Math.min(member.capacity, Math.max(0, member.guestCount || 0))
                          : 0;
                        return Array.from({ length: member.capacity }).map((_, idx) => {
                          const isOccupied = idx < memberOccupied;
                          const seatNum = idx + 1;
                          return (
                            <button
                              key={`m${memberIdx}-s${idx}`}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onSelectTable(member.number, seatNum); }}
                              className={`${
                                entry.isMerged ? 'h-8.5 w-8.5 text-xs' : 'h-7.5 w-7.5 text-[11px]'
                              } rounded-xl flex items-center justify-center font-mono font-black transition-all active:scale-90 ${
                                isOccupied ? colors.occ : colors.empty
                              }`}
                            >
                              {seatNum}
                            </button>
                          );
                        });
                      })}
                    </div>
                    <div className="text-[9.5px] font-mono font-bold flex items-center justify-between text-stone-600 pt-1.5 border-t border-stone-200/50 mt-1">
                      <span className={entry.occupiedChairs > 0 ? (entry.status === 'BILLING' ? 'text-purple-700 font-black' : 'text-[#9C3D1E] font-black') : 'text-emerald-700 font-bold'}>
                        {entry.occupiedChairs > 0 ? `${entry.occupiedChairs} Occupied` : 'Vacant'}
                      </span>
                      <span className="text-stone-400 font-medium">{entry.availableChairs} Free</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-1 border-t border-current/10 flex items-center justify-between font-mono text-[9.5px] text-stone-500">
                  <span>{entry.totalChairs} Seats{entry.isMerged ? ' (Combined)' : ''}</span>
                  <span className="flex items-center gap-1">
                    {entry.kotCount > 0 && <span className="text-[#9C3D1E] font-bold">{entry.kotCount} KOT</span>}
                    {entry.elapsedMins !== null && entry.elapsedMins > 0 && (
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

      {/* Floating hint shown while user is holding a table ready to drag — positioned at top so it is never obscured by finger */}
      <AnimatePresence>
        {holdingTable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-6 right-6 z-50 p-3.5 rounded-2xl bg-stone-900/95 text-white border border-amber-400/50 flex items-center justify-center gap-2 font-mono text-xs font-bold shadow-2xl backdrop-blur-md"
          >
            <Link2 className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>Drag Table {holdingTable} onto another table to merge</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Merge / Unmerge Feedback Toast */}
      <AnimatePresence>
        {mergeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-6 right-6 z-50 p-3.5 bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2.5 font-mono text-xs font-bold"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{mergeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
