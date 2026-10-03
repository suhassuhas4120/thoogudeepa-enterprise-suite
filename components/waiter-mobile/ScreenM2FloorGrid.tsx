'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  waiterName: string;
  onSelectTable: (tableNum: string) => void;
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

const SECTION_MAP: Record<string, string> = {
  '1111': 'Express / Couple Hall',
  '2222': 'Main Dining Hall',
  '3333': 'Family Section',
  '4444': 'Grand Feast Hall',
};

export function ScreenM2FloorGrid({ waiterName, onSelectTable, onGoToPings, onGoToReady }: Props) {
  const { tables, pings, kdsTickets } = useSharedBridge();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('ALL');
  const [showAlert, setShowAlert] = useState(true);

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

  // Derive waiter's assigned section from name
  const assignedSection = Object.entries(SECTION_MAP).find(
    ([, sec]) => waiterName.toLowerCase().includes(sec.split(' ')[0].toLowerCase())
  )?.[1] ?? null;

  const filtered = tables.filter((t) => {
    const matchSearch =
      t.number.toLowerCase().includes(search.toLowerCase()) ||
      t.section.toLowerCase().includes(search.toLowerCase());
    const matchSection =
      sectionFilter === 'ALL' || !assignedSection || t.section === assignedSection;
    return matchSearch && matchSection;
  });

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
          {assignedSection && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-black">
              <button
                type="button"
                onClick={() => setSectionFilter('MY')}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  sectionFilter === 'MY'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                }`}
              >
                My Section
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
          )}

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
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9C3D1E] shadow-2xs"
          />
        </div>
      </div>

      {/* Counters strip */}
      <div className="px-3.5 pb-2 flex items-center gap-3 font-mono text-[10px] font-bold shrink-0">
        <span className="flex items-center gap-1 text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {tables.filter(t => t.status === 'OCCUPIED').length} Occupied
        </span>
        <span className="flex items-center gap-1 text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {tables.filter(t => t.status === 'VACANT').length} Vacant
        </span>
        <span className="flex items-center gap-1 text-purple-700">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          {tables.filter(t => t.status === 'BILLING').length} Billing
        </span>
        {readyTickets.length > 0 && (
          <button
            type="button"
            onClick={onGoToReady}
            className="ml-auto flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg shadow-2xs active:scale-95 transition"
          >
            <UtensilsCrossed className="h-3 w-3" />
            <span>{readyTickets.length} Ready</span>
          </button>
        )}
      </div>

      {/* 2-column responsive table grid with PROPORTIONAL CHAIR VISUALIZATION */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((tbl) => {
            const hasPing = urgentPingTables.has(tbl.number);
            const tblTickets = kdsTickets.filter(tk => tk.tableNumber === tbl.number);
            const elapsedMins = tbl.seatedTime !== '--'
              ? Math.floor((Date.now() - new Date().setHours(
                  parseInt(tbl.seatedTime.split(':')[0]),
                  parseInt(tbl.seatedTime.split(':')[1])
                )) / 60000)
              : null;

            // Accurate Chair / Seat calculations for this specific table
            const totalChairs = tbl.capacity;
            const occupiedChairs = (tbl.status === 'OCCUPIED' || tbl.status === 'BILLING')
              ? Math.min(totalChairs, Math.max(1, tbl.guestCount || (tbl.activeItems && tbl.activeItems.length > 0 ? 2 : 1)))
              : 0;
            const availableChairs = Math.max(0, totalChairs - occupiedChairs);
            const isFull = occupiedChairs >= totalChairs && totalChairs > 0;
            const badge = getTableBadge(tbl, isFull, occupiedChairs, totalChairs);

            return (
              <motion.button
                key={tbl.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectTable(tbl.number)}
                className={`p-3 rounded-2xl border-2 text-left transition shadow-xs flex flex-col justify-between min-h-[172px] relative ${getTableCardStyle(tbl, isFull)}`}
              >
                {/* Ping indicator dot */}
                {hasPing && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 rounded-full animate-pulse border-2 border-white shadow-xs" />
                )}

                <div>
                  {/* Card Header: Table Number, Merged Badge, & Status */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-current/15 gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-base font-black text-stone-900">{tbl.number}</span>
                      {tbl.mergedWith && (
                        <span className="font-mono text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-0.5 shadow-2xs shrink-0">
                          <Link2 className="h-2.5 w-2.5" />
                          +{tbl.mergedWith}
                        </span>
                      )}
                    </div>
                    <span className={`font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded border truncate ${badge.style}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Section name & current running bill */}
                  <div className="mt-1 font-mono">
                    <div className="text-stone-500 text-[10px] truncate">{tbl.section}</div>
                    <div className="text-stone-900 font-black text-base mt-0.5">
                      ₹{tbl.currentBill || 0}
                    </div>
                  </div>

                  {/* Enhanced Proportional 4-Chair / Seat Matrix */}
                  <div className="my-2.5 p-2 rounded-xl bg-white/80 border border-current/15 min-h-[62px] flex flex-col justify-between shadow-2xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.from({ length: totalChairs }).map((_, idx) => {
                        const isOccupied = idx < occupiedChairs;
                        return (
                          <div
                            key={idx}
                            title={`Seat ${idx + 1}: ${isOccupied ? 'Occupied' : 'Available'}`}
                            className={`h-6.5 w-6.5 rounded-lg flex items-center justify-center font-mono text-[9.5px] font-black transition-all ${
                              isOccupied
                                ? tbl.status === 'BILLING'
                                  ? 'bg-purple-700 text-white shadow-2xs'
                                  : 'bg-[#9C3D1E] text-white shadow-2xs'
                                : 'border-2 border-dashed border-stone-300 bg-white text-stone-400'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[9.5px] font-mono font-bold flex items-center justify-between text-stone-600 pt-1.5 border-t border-stone-200/50 mt-1">
                      <span className={occupiedChairs > 0 ? (tbl.status === 'BILLING' ? 'text-purple-700 font-black' : 'text-[#9C3D1E] font-black') : 'text-emerald-700 font-bold'}>
                        {occupiedChairs > 0 ? `${occupiedChairs} Occupied` : 'Vacant'}
                      </span>
                      <span className="text-stone-400 font-medium">
                        {availableChairs} Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: KOT count, timer, chevron */}
                <div className="pt-1 border-t border-current/10 flex items-center justify-between font-mono text-[9.5px] text-stone-500">
                  <span>{tbl.capacity} Seats</span>
                  <span className="flex items-center gap-1">
                    {tblTickets.length > 0 && (
                      <span className="text-[#9C3D1E] font-bold">{tblTickets.length} KOT</span>
                    )}
                    {elapsedMins !== null && elapsedMins > 0 && (
                      <span className={elapsedMins > 45 ? 'text-rose-600 font-bold' : 'text-stone-400'}>
                        {elapsedMins}m
                      </span>
                    )}
                    <ChevronRight className="h-3 w-3 text-stone-400" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 font-mono text-xs">
            No tables match your filter
          </div>
        )}
      </div>
    </div>
  );
}
