'use client';

import React from 'react';
import {
  Users,
  Utensils,
  CreditCard,
  Trash2,
  Flame,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  selectedTableNum: string;
  confirmVacate: boolean;
  onSetConfirmVacate: (v: boolean) => void;
  onGoToOrder: () => void;
  onGoToSettle: () => void;
  onVacated: () => void;
}

function badgeStyle(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED': return 'text-amber-800 bg-amber-100/80 border-amber-300';
    case 'BILLING':  return 'text-purple-800 bg-purple-100/80 border-purple-300';
    case 'CLEANING': return 'text-stone-700 bg-[#FAF8F5] border-stone-300';
    default:         return 'text-emerald-800 bg-emerald-100/80 border-emerald-300';
  }
}

export function TabletTableCockpit({
  selectedTableNum,
  confirmVacate,
  onSetConfirmVacate,
  onGoToOrder,
  onGoToSettle,
  onVacated,
}: Props) {
  const { tables, kdsTickets, waiterVacatesTable, waiterUnmergeTable } = useSharedBridge();

  const table = tables.find((t) => t.number === selectedTableNum);
  const tickets = kdsTickets.filter((tk) => tk.tableNumber === selectedTableNum);

  if (!table) {
    return (
      <div className="flex-1 flex items-center justify-center text-stone-400 font-mono text-xs">
        Select a table from the floor map
      </div>
    );
  }

  const handleVacate = () => {
    waiterVacatesTable(selectedTableNum);
    onSetConfirmVacate(false);
    onVacated();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Table identity header */}
      <div className="px-6 py-5 border-b border-[#EAE5DF] bg-[#FAF8F5] shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-widest">
              {table.section}
            </p>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              TABLE {table.number}
            </h2>
            <div className="flex items-center gap-2 text-stone-500 font-mono text-xs mt-1">
              <Users className="h-3.5 w-3.5 text-stone-400" />
              <span>{table.capacity} seats</span>
              {table.guestCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-stone-700 font-bold">{table.guestCount} guests</span>
                </>
              )}
              {table.serverName && (
                <>
                  <span>·</span>
                  <span>{table.serverName}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${badgeStyle(table.status)}`}>
              {table.status}
            </span>
            <div className="font-mono text-2xl font-black text-emerald-700 mt-1.5">
              ₹{table.currentBill || 0}
            </div>
          </div>
        </div>
      </div>

      {/* KOT ticket list */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-xs font-black text-stone-600 uppercase tracking-wider">
            Kitchen Orders ({tickets.length})
          </p>
          {tickets.length > 0 && (
            <span className="font-mono text-[11px] text-stone-400">Live KDS</span>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className="py-10 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl text-center font-mono text-xs text-stone-500 space-y-1.5">
            <Utensils className="h-6 w-6 mx-auto text-stone-400 opacity-60 mb-2" />
            <p className="font-bold text-stone-700">No active kitchen tickets</p>
            <p>Use &ldquo;Add Dishes&rdquo; below to place an order</p>
          </div>
        ) : (
          tickets.map((tk) => (
            <div key={tk.id} className="p-4 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-[#EAE5DF]">
                <span className="font-black text-[#9C3D1E]">
                  KOT #{tk.id.slice(-4)} · {tk.serverName}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  tk.status === 'READY'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : tk.status === 'PREP'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-stone-200 text-stone-700 border-stone-300'
                }`}>
                  {tk.status}
                </span>
              </div>
              {tk.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center font-mono text-xs">
                  <span className="text-stone-800">
                    <strong className="text-stone-900">{it.quantity}×</strong> {it.name}
                  </span>
                  <span className="flex items-center gap-1 text-[#9C3D1E] font-bold text-[10px] bg-white border border-[#EAE5DF] px-2 py-0.5 rounded-md">
                    {it.stage === 'PREP' && <Flame className="h-3 w-3 text-orange-500" />}
                    {it.stage === 'PLATED' && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                    {it.stage}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Captain action buttons */}
      <div className="px-6 pb-6 pt-4 border-t border-[#EAE5DF] bg-white space-y-2.5 shrink-0">
        <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider mb-1">
          Captain Operations
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onGoToOrder}
            className="py-3 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Utensils className="h-4 w-4" />
            Add Dishes
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onGoToSettle}
            className="py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <CreditCard className="h-4 w-4 text-emerald-400" />
            Settle Bill
          </motion.button>
        </div>

        {table.mergedWith && (
          <button
            type="button"
            onClick={() => waiterUnmergeTable(table.number)}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-2 transition"
          >
            <span>Unmerge Table (Split from {table.mergedWith})</span>
          </button>
        )}

        <Link
          href={`/?table=${table.number}&seat=1`}
          target="_blank"
          className="w-full py-3 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] text-stone-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <ChevronRight className="h-4 w-4 text-[#9C3D1E]" />
          Open Customer Order Screen
        </Link>

        {/* Two-step vacate */}
        {!confirmVacate ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSetConfirmVacate(true)}
            className="w-full py-3 bg-[#FAF8F5] hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Trash2 className="h-4 w-4" />
            Vacate Table {table.number}
          </motion.button>
        ) : (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
            <p className="text-center font-mono text-xs font-bold text-rose-800">
              Confirm vacate and clean {table.number}?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSetConfirmVacate(false)}
                className="py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-[#FAF8F5] rounded-lg font-mono text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVacate}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Vacate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
