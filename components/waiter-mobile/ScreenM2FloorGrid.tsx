'use client';

import React, { useState } from 'react';
import {
  Utensils,
  Bell,
  UtensilsCrossed,
  Search,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  waiterName: string;
  onSelectTable: (tableNum: string) => void;
  onGoToPings: () => void;
  onGoToReady: () => void;
}

function statusStyle(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED': return 'border-amber-300 bg-amber-50/60 text-amber-900';
    case 'BILLING':  return 'border-purple-300 bg-purple-50/60 text-purple-900';
    case 'CLEANING': return 'border-stone-300 bg-[#FAF8F5] text-stone-700';
    default:         return 'border-emerald-200 bg-emerald-50/40 text-emerald-800';
  }
}

function statusBadge(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'BILLING':  return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'CLEANING': return 'bg-stone-200 text-stone-700 border-stone-300';
    default:         return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
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

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');
  const urgentPingTables = new Set(activePings.map((p) => p.tableNumber));

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

      {/* Urgent alert banner */}
      {activePings.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onGoToPings}
          className="mx-3.5 mt-3 px-4 py-2.5 bg-rose-600 text-white rounded-2xl flex items-center gap-2 shadow-sm shrink-0"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-mono text-xs font-black flex-1 text-left">
            {activePings.length} assistance call{activePings.length > 1 ? 's' : ''} pending — tap to attend
          </span>
        </motion.button>
      )}

      {/* Section toggle + search */}
      <div className="px-3.5 pt-3 pb-2 space-y-2.5 shrink-0">
        {assignedSection && (
          <div className="flex items-center gap-2 font-mono text-[11px] font-black">
            <button
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

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search table or section…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9C3D1E] shadow-2xs"
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
            onClick={onGoToReady}
            className="ml-auto flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg"
          >
            <UtensilsCrossed className="h-3 w-3" />
            {readyTickets.length} Ready
          </button>
        )}
      </div>

      {/* 2-column table grid */}
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

            return (
              <motion.button
                key={tbl.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectTable(tbl.number)}
                className={`p-3.5 rounded-2xl border-2 text-left transition shadow-xs flex flex-col justify-between min-h-[108px] relative ${statusStyle(tbl.status)}`}
              >
                {/* Ping indicator dot */}
                {hasPing && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 rounded-full animate-pulse border-2 border-white shadow-xs" />
                )}

                <div className="flex items-center justify-between pb-1.5 border-b border-current/15">
                  <span className="font-mono text-base font-black text-stone-900">{tbl.number}</span>
                  <span className={`font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge(tbl.status)}`}>
                    {tbl.status}
                  </span>
                </div>

                <div className="my-2 font-mono">
                  <div className="text-stone-500 text-[10px] truncate">{tbl.section}</div>
                  <div className="text-stone-900 font-black text-base mt-0.5">
                    ₹{tbl.currentBill || 0}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-current/10 flex items-center justify-between font-mono text-[10px] text-stone-500">
                  <span>{tbl.capacity} seats</span>
                  <span className="flex items-center gap-1">
                    {tblTickets.length > 0 && (
                      <span className="text-[#9C3D1E] font-bold">{tblTickets.length} KOT</span>
                    )}
                    {elapsedMins !== null && elapsedMins > 0 && (
                      <span className={`${elapsedMins > 45 ? 'text-rose-600' : 'text-stone-400'}`}>
                        {elapsedMins}m
                      </span>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
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
