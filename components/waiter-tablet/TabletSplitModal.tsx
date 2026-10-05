'use client';

import React, { useState } from 'react';
import { X, Split, Users, Armchair, Link2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
  tableNum: string;
  onSelectSplit: (splitAmount: number, splitLabel: string) => void;
}

export function TabletSplitModal({ open, onClose, tableNum, onSelectSplit }: Props) {
  const { tables, kdsTickets } = useSharedBridge();
  const table = tables.find((t) => t.number === tableNum);

  const [splitMethod, setSplitMethod] = useState<'PERSONS' | 'CHAIRS'>('PERSONS');
  const [splitCoverCount, setSplitCoverCount] = useState<number>(() => {
    return Math.max(2, table?.guestCount || 2);
  });

  if (!table) return null;

  const isVacant = table.status === 'VACANT';
  const groupPeers = table.mergeGroupPeers || (table.mergedWith ? [tableNum, table.mergedWith] : [tableNum]);
  const tickets = isVacant ? [] : kdsTickets.filter((tk) => groupPeers.includes(tk.tableNumber));

  // Gather all ordered items
  const allOrderedItems: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    seatNumber?: number;
  }[] = [];

  if (!isVacant) {
    tickets.forEach((tk) => {
      tk.items.forEach((it) => {
        const unitPrice = it.price && it.price > 0 ? it.price : 220;
        allOrderedItems.push({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: unitPrice,
          totalPrice: unitPrice * it.quantity,
          seatNumber: it.seatNumber || tk.seatNumber,
        });
      });
    });

    if (allOrderedItems.length === 0 && table.activeItems && table.activeItems.length > 0) {
      table.activeItems.forEach((ai, idx) => {
        const unitPrice = ai.price && ai.price > 0 ? ai.price : 220;
        allOrderedItems.push({
          id: ai.id || `ai-${idx}`,
          name: ai.name,
          quantity: ai.quantity,
          price: unitPrice,
          totalPrice: unitPrice * ai.quantity,
          seatNumber: ai.seatNumber,
        });
      });
    }
  }

  const itemsSubtotal = allOrderedItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const subtotal = Math.max(table.currentBill || 0, itemsSubtotal);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = isVacant ? 0 : subtotal + tax;

  const totalChairs = table.capacity || 4;
  const occupiedChairsCount = Math.max(table.guestCount || 0, allOrderedItems.length > 0 ? 1 : 0);

  // Per chair breakdown helper
  const getChairDue = (seat: number) => {
    if (isVacant || allOrderedItems.length === 0) return 0;
    const directItems = allOrderedItems.filter((i) => i.seatNumber === seat);
    const directSub = directItems.reduce((s, i) => s + i.totalPrice, 0);

    if (directItems.length > 0) {
      const sharedItems = allOrderedItems.filter((i) => !i.seatNumber);
      const sharedPerPerson =
        occupiedChairsCount > 0
          ? sharedItems.reduce((s, i) => s + i.totalPrice, 0) / occupiedChairsCount
          : 0;
      const totalSub = directSub + sharedPerPerson;
      return Math.round(totalSub * 1.05);
    } else {
      return occupiedChairsCount > 0 ? Math.round((grandTotal / occupiedChairsCount)) : 0;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-[560px] max-w-full max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
                  <Split className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-900">
                    Floor Captain Cashier
                  </p>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">
                    Split Bill — Table {table.number}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white hover:bg-stone-200 border border-[#EAE5DF] rounded-xl transition cursor-pointer"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {/* Total summary bar */}
            <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between font-mono shrink-0">
              <div>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                  Consolidated Bill Total
                </span>
                <span className="text-xl font-black text-stone-950">₹{grandTotal.toFixed(2)}</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2.5 py-1 rounded-lg">
                Includes 5% GST
              </span>
            </div>

            {/* Method Tabs */}
            <div className="px-6 pt-4 pb-2 shrink-0">
              <div className="flex gap-2 p-1 bg-stone-100 rounded-xl text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setSplitMethod('PERSONS')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    splitMethod === 'PERSONS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  By Number of Guests (Equal)
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMethod('CHAIRS')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    splitMethod === 'CHAIRS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  By Chairs / Seats (Itemized)
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto space-y-4 font-mono">
              {splitMethod === 'PERSONS' ? (
                <div className="space-y-4">
                  {/* Stepper */}
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-700 block">Number of Paying Guests:</span>
                      <span className="text-[11px] text-stone-500">
                        ₹{Math.round(grandTotal / splitCoverCount)} per guest share
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSplitCoverCount((c) => Math.max(2, c - 1))}
                        disabled={splitCoverCount <= 2}
                        className="h-9 w-9 rounded-xl bg-white border border-stone-300 font-black text-stone-700 disabled:opacity-40 flex items-center justify-center active:scale-90 transition shadow-2xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-lg font-black text-stone-900 min-w-[24px] text-center">
                        {splitCoverCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSplitCoverCount((c) => Math.min(20, c + 1))}
                        disabled={splitCoverCount >= 20}
                        className="h-9 w-9 rounded-xl bg-white border border-stone-300 font-black text-stone-700 disabled:opacity-40 flex items-center justify-center active:scale-90 transition shadow-2xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* List of Persons */}
                  <div className="space-y-2">
                    <p className="text-xs font-black text-stone-600 uppercase tracking-wider">
                      Individual Share Invoices ({splitCoverCount}):
                    </p>
                    {Array.from({ length: splitCoverCount }).map((_, idx) => {
                      const personNum = idx + 1;
                      const baseAmt = Math.round(grandTotal / splitCoverCount);
                      const isLast = personNum === splitCoverCount;
                      const personAmt = isLast ? grandTotal - baseAmt * (splitCoverCount - 1) : baseAmt;

                      return (
                        <div
                          key={personNum}
                          className="p-3.5 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="font-black text-stone-900 text-xs block">
                              Guest #{personNum}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              Equal share (1 of {splitCoverCount})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-base text-stone-950">
                              ₹{personAmt.toFixed(0)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectSplit(Math.round(personAmt), `Guest ${personNum} of ${splitCoverCount}`);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Settle Share</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Itemized Chairs */
                <div className="space-y-2.5">
                  <p className="text-xs font-black text-stone-600 uppercase tracking-wider">
                    Chair Breakdown Invoices ({totalChairs} Chairs):
                  </p>
                  {Array.from({ length: totalChairs }).map((_, idx) => {
                    const seatNum = idx + 1;
                    const directCount = allOrderedItems.filter((i) => i.seatNumber === seatNum).length;
                    const chairAmt = getChairDue(seatNum);

                    return (
                      <div
                        key={seatNum}
                        className="p-3.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600">
                            <Armchair className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-black text-stone-900 text-xs block">
                              Chair {seatNum}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {directCount > 0 ? `${directCount} dishes ordered` : 'Shared table orders'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-base text-stone-950">
                            ₹{chairAmt.toFixed(0)}
                          </span>
                          <button
                            type="button"
                            disabled={chairAmt <= 0}
                            onClick={() => {
                              onClose();
                              onSelectSplit(chairAmt, `Chair ${seatNum}`);
                            }}
                            className="px-4 py-2 bg-[#9C3D1E] hover:bg-[#853216] disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Settle Chair</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#EAE5DF] bg-[#FAF8F5] flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-mono text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
