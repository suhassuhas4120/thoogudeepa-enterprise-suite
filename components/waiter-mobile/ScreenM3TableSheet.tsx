'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Utensils,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  onClose: () => void;
  onGoToOrder: () => void;
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

export function ScreenM3TableSheet({ tableNum, onClose, onGoToOrder, onGoToSettle, onVacated }: Props) {
  const { tables, kdsTickets, waiterVacatesTable } = useSharedBridge();
  const [confirmVacate, setConfirmVacate] = useState(false);

  const table = tables.find((t) => t.number === tableNum);
  const tickets = kdsTickets.filter((tk) => tk.tableNumber === tableNum);

  if (!table) return null;

  const handleVacate = () => {
    waiterVacatesTable(tableNum);
    setConfirmVacate(false);
    onVacated();
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-[2px] z-40 max-w-md mx-auto"
        />

        {/* Bottom drawer */}
        <motion.div
          key="drawer"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50 bg-white rounded-t-3xl shadow-2xl border-t border-[#EAE5DF]"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 bg-stone-300 rounded-full" />
          </div>

          <div className="px-5 pb-8 pt-2 space-y-4">

            {/* Table identity */}
            <div className="flex items-start justify-between pb-3 border-b border-[#EAE5DF]">
              <div>
                <p className="font-mono text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                  {table.section}
                </p>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                  {table.number}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge(table.status)}`}>
                    {table.status}
                  </span>
                  <span className="font-mono text-lg font-black text-stone-900">
                    ₹{table.currentBill || 0}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-[#FAF8F5] hover:bg-stone-200 rounded-xl transition"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {/* KOT timeline */}
            {tickets.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider">
                  Active Orders ({tickets.length})
                </p>
                {tickets.map((tk) => (
                  <div key={tk.id} className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-[#9C3D1E]">KOT #{tk.id.slice(-4)}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
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
                      <div key={idx} className="flex justify-between font-mono text-[11px] text-stone-700">
                        <span>{it.quantity}× {it.name}</span>
                        <span className="flex items-center gap-1 text-[#9C3D1E] font-bold">
                          {it.stage === 'PREP' && <Flame className="h-3 w-3 text-orange-500" />}
                          {it.stage === 'PLATED' && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                          {it.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {tickets.length === 0 && (
              <div className="py-6 text-center text-stone-400 font-mono text-xs">
                No active kitchen tickets for this table
              </div>
            )}

            {/* 4 quick action buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onGoToOrder}
                  className="py-3 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Utensils className="h-4 w-4" />
                  Add Dishes
                </button>

                <button
                  onClick={onGoToSettle}
                  className="py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  Settle Bill
                </button>
              </div>

              <Link
                href={`/?table=${table.number}&seat=1`}
                target="_blank"
                className="w-full py-3 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] text-stone-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <ChevronRight className="h-4 w-4 text-[#9C3D1E]" />
                Open Customer Order Screen
              </Link>

              {/* Two-step vacate guard */}
              {!confirmVacate ? (
                <button
                  onClick={() => setConfirmVacate(true)}
                  className="w-full py-3 bg-[#FAF8F5] hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Vacate &amp; Clean {table.number}
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2.5">
                  <p className="text-center font-mono text-xs font-bold text-rose-800">
                    Confirm vacate and reset {table.number}?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmVacate(false)}
                      className="py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-[#FAF8F5] rounded-lg font-mono text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVacate}
                      className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Yes, Vacate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
