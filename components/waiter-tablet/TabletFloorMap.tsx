'use client';

import React from 'react';
import { Users, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  selectedTableNum: string;
  selectedSection: string;
  onSelectTable: (num: string) => void;
}

function tileStyle(status: SharedTable['status'], isSelected: boolean) {
  if (isSelected) return 'border-[#9C3D1E] bg-[#FFF8F5] ring-2 ring-[#9C3D1E]/20 shadow-md';
  switch (status) {
    case 'OCCUPIED': return 'border-amber-300 bg-amber-50/50 hover:border-amber-400 shadow-xs';
    case 'BILLING':  return 'border-purple-300 bg-purple-50/50 hover:border-purple-400 shadow-xs';
    case 'CLEANING': return 'border-stone-300 bg-[#FAF8F5] hover:border-stone-400 shadow-xs';
    default:         return 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 shadow-xs';
  }
}

function badgeStyle(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED': return 'text-amber-800 bg-amber-100/80 border-amber-300';
    case 'BILLING':  return 'text-purple-800 bg-purple-100/80 border-purple-300';
    case 'CLEANING': return 'text-stone-700 bg-[#FAF8F5] border-stone-300';
    default:         return 'text-emerald-800 bg-emerald-100/80 border-emerald-300';
  }
}

const SECTION_MATCH: Record<string, string[]> = {
  'ALL': [],
  'Section A': ['Express / Couple Hall'],
  'Section B': ['Main Dining Hall'],
  'Section C': ['Family Section'],
  'Section D': ['Courtyard Garden', 'Grand Feast Hall'],
  'Express / Couple Hall': ['Express / Couple Hall'],
  'Main Dining Hall': ['Main Dining Hall'],
  'Family Section': ['Family Section'],
  'Courtyard Garden': ['Courtyard Garden'],
  'Grand Feast Hall': ['Grand Feast Hall'],
};

const SECTIONS = [
  'ALL',
  'Section A',
  'Section B',
  'Section C',
  'Section D',
];

export function TabletFloorMap({ selectedTableNum, selectedSection, onSelectTable }: Props) {
  const { tables, pings, kdsTickets } = useSharedBridge();
  const activePings = pings.filter((p) => p.status === 'PENDING');
  const urgentSet = new Set(activePings.map((p) => p.tableNumber));

  const visible = tables.filter((t) => {
    if (selectedSection === 'ALL') return true;
    const mapped = SECTION_MATCH[selectedSection];
    if (mapped) return mapped.includes(t.section);
    return t.section === selectedSection;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-4 gap-3">
        {visible.map((tbl) => {
          const isSelected = tbl.number === selectedTableNum;
          const hasPing = urgentSet.has(tbl.number);
          const tblKOTs = kdsTickets.filter((tk) => tk.tableNumber === tbl.number);
          const readyCount = tblKOTs.filter((tk) => tk.status === 'READY').length;

          return (
            <motion.div
              key={tbl.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectTable(tbl.number)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between min-h-[104px] relative ${tileStyle(tbl.status, isSelected)}`}
            >
              {hasPing && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 rounded-full animate-pulse border-2 border-white shadow-xs" />
              )}
              {readyCount > 0 && (
                <span className="absolute top-1.5 left-1.5 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center border border-white shadow-xs">
                  <UtensilsCrossed className="h-2.5 w-2.5 text-white" />
                </span>
              )}

              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                <span className="font-mono text-base font-black text-stone-900">{tbl.number}</span>
                <span className={`font-mono text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${badgeStyle(tbl.status)}`}>
                  {tbl.status}
                </span>
              </div>

              <div className="my-1.5 font-mono">
                <div className="text-stone-900 font-black text-base">₹{tbl.currentBill || 0}</div>
                <div className="text-stone-500 text-[10px] truncate mt-0.5">{tbl.section}</div>
              </div>

              <div className="pt-1.5 border-t border-stone-200/40 flex items-center justify-between font-mono text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {tbl.capacity}
                </span>
                {tbl.status === 'OCCUPIED' && tblKOTs.length > 0 && (
                  <span className="text-[#9C3D1E] font-bold">{tblKOTs.length} KOT</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Re-export section list so the parent doesn't need to redefine it
export { SECTIONS };
