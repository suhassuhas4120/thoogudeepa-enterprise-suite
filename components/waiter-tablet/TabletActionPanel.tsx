'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus, CreditCard, Split, Link2, UserX, Users,
  ChefHat, Clock, ArrowRight, Bell
} from 'lucide-react';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  selectedChair: 'ALL' | number;
  onAddDishes: (chairNum?: number) => void;
  onSettle: () => void;
  onSplitBill: () => void;
  onMerge: () => void;
  onVacate: () => void;
  onSeatGuests: () => void;
}

function statusBg(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED': return 'bg-amber-50 border-amber-200';
    case 'BILLING':  return 'bg-purple-50 border-purple-200';
    case 'CLEANING': return 'bg-stone-50 border-stone-200';
    default:         return 'bg-emerald-50 border-emerald-200';
  }
}

export function TabletActionPanel({
  tableNum,
  selectedChair,
  onAddDishes,
  onSettle,
  onSplitBill,
  onMerge,
  onVacate,
  onSeatGuests,
}: Props) {
  const { tables, kdsTickets, pings } = useSharedBridge();

  const table = tables.find((t) => t.number === tableNum);
  if (!table) return null;

  const isVacant = table.status === 'VACANT';
  const isBilling = table.status === 'BILLING';

  const groupPeers = table.mergeGroupPeers || (table.mergedWith ? [tableNum, table.mergedWith] : [tableNum]);
  const readyTickets = kdsTickets.filter((tk) =>
    groupPeers.includes(tk.tableNumber) && tk.status === 'READY'
  );
  const tablePings = pings.filter((p) => p.tableNumber === tableNum && p.status === 'PENDING');

  const gst = Math.round(table.currentBill * 0.05);
  const totalWithGst = table.currentBill + gst;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#FAF8F5]">

      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-[#EAE5DF] shrink-0">
        <p className="font-mono text-[9px] font-black uppercase tracking-widest text-[#9C3D1E]">
          Table Actions
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <h3 className="text-base font-black text-stone-900">
            {tableNum}
            {selectedChair !== 'ALL' && (
              <span className="ml-2 text-[12px] text-stone-500 font-bold">· Chair {selectedChair}</span>
            )}
          </h3>
          {!isVacant && (
            <div className="text-right font-mono">
              <p className="text-[9px] text-stone-400">Bill + GST</p>
              <p className="text-base font-black text-stone-900">₹{totalWithGst.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Urgent alerts: ready dishes + pings */}
        {(readyTickets.length > 0 || tablePings.length > 0) && (
          <div className="space-y-2">
            {readyTickets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-300 rounded-2xl"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <ChefHat className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-xs text-blue-900">
                    {readyTickets.length} KOT Ready at Pass
                  </p>
                  <p className="font-mono text-[10px] text-blue-600">
                    Food plated — dispatch to table immediately
                  </p>
                </div>
                <span className="font-mono text-[9px] font-black text-blue-700 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-lg animate-pulse">
                  URGENT
                </span>
              </motion.div>
            )}
            {tablePings.map((ping) => (
              <motion.div
                key={ping.id}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-300 rounded-2xl"
              >
                <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-xs text-rose-900">
                    Guest Call — {ping.type}
                  </p>
                  <p className="font-mono text-[10px] text-rose-600">
                    {ping.message || `${ping.guestName} needs attention`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Vacant state — seat guests CTA */}
        {isVacant && (
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
            <div className="h-16 w-16 rounded-3xl bg-emerald-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="font-black text-stone-900">Table is Vacant</p>
              <p className="font-mono text-[10px] text-stone-400 mt-1">Seat guests to begin service</p>
            </div>
            <button
              type="button"
              onClick={onSeatGuests}
              className="flex items-center gap-2 px-6 py-3 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-2xl font-mono font-black text-sm transition cursor-pointer shadow-sm"
            >
              <Users className="h-4 w-4" /> Seat Guests
            </button>
          </div>
        )}

        {/* Active table actions */}
        {!isVacant && (
          <div className="space-y-3">

            {/* PRIMARY: Add Dishes */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddDishes(selectedChair === 'ALL' ? undefined : selectedChair)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-2xl shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-black text-sm">Add Dishes</p>
                  <p className="text-[10px] text-white/70">
                    {selectedChair !== 'ALL' ? `For Chair ${selectedChair}` : 'For entire table'}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/60" />
            </motion.button>

            {/* Settle Bill */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onSettle}
              disabled={table.currentBill === 0}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition cursor-pointer ${
                table.currentBill === 0
                  ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-[#EAE5DF] hover:border-[#9C3D1E] hover:bg-[#FFF8F5]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <CreditCard className="h-4.5 w-4.5 text-purple-700" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-black text-sm text-stone-900">Settle Bill</p>
                  <p className="text-[10px] text-stone-400 font-mono">
                    {table.currentBill > 0 ? `₹${totalWithGst} incl. GST` : 'No bill yet'}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </motion.button>

            {/* Secondary row */}
            <div className="grid grid-cols-2 gap-2">

              {/* Split Bill */}
              <button
                type="button"
                onClick={onSplitBill}
                disabled={table.currentBill === 0}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border transition cursor-pointer ${
                  table.currentBill === 0
                    ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-[#EAE5DF] hover:border-stone-300'
                }`}
              >
                <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Split className="h-4 w-4 text-blue-600" />
                </div>
                <p className="font-mono font-black text-[11px] text-stone-800">Split Bill</p>
              </button>

              {/* Merge Tables */}
              <button
                type="button"
                onClick={onMerge}
                className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border border-[#EAE5DF] bg-white hover:border-stone-300 transition cursor-pointer"
              >
                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Link2 className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="font-mono font-black text-[11px] text-stone-800">
                  {table.mergedWith ? 'Unmerge' : 'Merge'}
                </p>
              </button>
            </div>

            {/* Vacate table */}
            <button
              type="button"
              onClick={onVacate}
              className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
            >
              <UserX className="h-4 w-4 text-rose-600" />
              <div className="text-left">
                <p className="font-mono font-black text-[11px] text-rose-700">Vacate Table</p>
                <p className="text-[9.5px] text-rose-500 font-mono">Clear table for next guests</p>
              </div>
            </button>
          </div>
        )}

        {/* Table info summary */}
        {!isVacant && (
          <div className="p-4 bg-white border border-[#EAE5DF] rounded-2xl space-y-2.5 font-mono text-[11px]">
            <p className="text-[9px] font-black uppercase tracking-wider text-stone-400">Bill Breakdown</p>
            <div className="flex justify-between text-stone-700">
              <span>Subtotal</span>
              <span className="font-bold">₹{table.currentBill.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>CGST (2.5%)</span>
              <span>₹{Math.round(table.currentBill * 0.025)}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>SGST (2.5%)</span>
              <span>₹{Math.round(table.currentBill * 0.025)}</span>
            </div>
            <div className="flex justify-between font-black text-stone-900 border-t border-dashed border-stone-200 pt-2">
              <span>Grand Total</span>
              <span>₹{totalWithGst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-400 text-[10px]">
              <span>KOTs fired</span>
              <span>{table.kotCount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
