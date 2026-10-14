'use client';

import React, { useState } from 'react';
import {
  Users,
  Utensils,
  CreditCard,
  Trash2,
  Flame,
  CheckCircle2,
  ChevronRight,
  Split,
  Link2,
  Armchair,
  FileText,
  UtensilsCrossed,
  Sparkles,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';

interface Props {
  selectedTableNum: string;
  confirmVacate: boolean;
  onSetConfirmVacate: (v: boolean) => void;
  onGoToOrder: (chairNum?: number) => void;
  onGoToSettle: (splitAmt?: number, splitLabel?: string) => void;
  onOpenSplitModal: () => void;
  onOpenMergeModal: () => void;
  onVacated: () => void;
}

function badgeStyle(status: SharedTable['status']) {
  switch (status) {
    case 'OCCUPIED': return 'text-amber-800 bg-amber-100/90 border-amber-300';
    case 'BILLING':  return 'text-purple-800 bg-purple-100/90 border-purple-300';
    case 'CLEANING': return 'text-stone-700 bg-stone-100 border-stone-300';
    default:         return 'text-emerald-800 bg-emerald-100/90 border-emerald-300';
  }
}

export function TabletTableCockpit({
  selectedTableNum,
  confirmVacate,
  onSetConfirmVacate,
  onGoToOrder,
  onGoToSettle,
  onOpenSplitModal,
  onOpenMergeModal,
  onVacated,
}: Props) {
  const { tables, kdsTickets, waiterVacatesTable, waiterUnmergeTable, waiterMarkKitchenItemServed } = useSharedBridge();
  const [selectedChair, setSelectedChair] = useState<'ALL' | number>('ALL');

  const table = tables.find((t) => t.number === selectedTableNum);
  if (!table) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-stone-400 font-mono text-xs space-y-2">
        <Utensils className="h-8 w-8 opacity-40 text-stone-300" />
        <span>Select a table from the floor map to view details</span>
      </div>
    );
  }

  const isVacant = table.status === 'VACANT';
  const groupPeers = table.mergeGroupPeers || (table.mergedWith ? [selectedTableNum, table.mergedWith] : [selectedTableNum]);
  const isMerged = Boolean(table.mergedWith);

  // Tickets for table — strictly empty if vacant
  const tickets = isVacant ? [] : kdsTickets.filter((tk) => groupPeers.includes(tk.tableNumber));

  // Consolidated items
  const allOrderedItems: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    stage: string;
    seatNumber?: number;
    ticketNumber: string;
  }[] = [];

  if (!isVacant) {
    tickets.forEach((tk) => {
      tk.items.forEach((it) => {
        const unitPrice = it.price && it.price > 0 ? it.price : 220;
        const stageLabel =
          it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed';
        allOrderedItems.push({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: unitPrice,
          totalPrice: unitPrice * it.quantity,
          stage: stageLabel,
          seatNumber: it.seatNumber || tk.seatNumber,
          ticketNumber: tk.id.slice(-4),
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
          stage: ai.status || 'Placed',
          seatNumber: ai.seatNumber,
          ticketNumber: 'TBL',
        });
      });
    }
  }

  const itemsSubtotal = allOrderedItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const subtotal = Math.max(table.currentBill || 0, itemsSubtotal);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = isVacant ? 0 : subtotal + tax;

  const totalChairs = table.capacity || 4;
  const occupiedChairsCount = Math.max(table.guestCount || 0, allOrderedItems.length > 0 ? 1 : 0);

  // Ready food check
  const readyTickets = tickets.filter((tk) => tk.status === 'READY');
  const hasReadyFood = readyTickets.length > 0 || table.activeItems?.some((it) => it.status === 'Ready');

  const handleServeReady = () => {
    readyTickets.forEach((tk) => {
      tk.items.forEach((it) => {
        waiterMarkKitchenItemServed(tk.id, it.id);
      });
    });
  };

  const handleVacate = () => {
    waiterVacatesTable(selectedTableNum);
    onSetConfirmVacate(false);
    onVacated();
  };

  // Chair items breakdown
  const displayedItems =
    selectedChair === 'ALL'
      ? allOrderedItems
      : allOrderedItems.filter((i) => i.seatNumber === selectedChair);

  return (
    <div className="flex flex-col h-full overflow-hidden select-none font-sans">

      {/* Table Identity Header */}
      <div className="px-6 py-4 border-b border-[#EAE5DF] bg-[#FAF8F5] shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-widest">
                {table.section}
              </span>
              {isMerged && (
                <span className="font-mono text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Link2 className="h-2.5 w-2.5" />
                  Merged: {groupPeers.join(' + ')}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              TABLE {table.number}
            </h2>

            <div className="flex items-center gap-2 text-stone-500 font-mono text-xs mt-1">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-stone-400" />
                {table.capacity} seats
              </span>
              <span>·</span>
              <span className="text-stone-700 font-bold">
                {isVacant ? '0 guests' : `${table.guestCount || occupiedChairsCount} guests`}
              </span>
              {table.serverName && (
                <>
                  <span>·</span>
                  <span className="text-stone-600 font-bold">Steward: {table.serverName}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className={`font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${badgeStyle(table.status)}`}>
              {table.status}
            </span>
            <div className="font-mono text-2xl font-black text-stone-900 mt-1.5">
              ₹{grandTotal.toFixed(0)}
            </div>
            {grandTotal > 0 && (
              <span className="text-[10px] font-mono text-stone-500 block">
                ₹{subtotal.toFixed(0)} + ₹{tax} GST
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chair Selector Rail */}
      <div className="px-6 py-2.5 border-b border-[#EAE5DF] bg-white flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
        <button
          type="button"
          onClick={() => setSelectedChair('ALL')}
          className={`px-3 py-1.5 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 border ${
            selectedChair === 'ALL'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-[#FAF8F5] text-stone-700 border-[#EAE5DF] hover:bg-stone-100'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>All Table ({allOrderedItems.length})</span>
        </button>

        {Array.from({ length: totalChairs }).map((_, idx) => {
          const seatNum = idx + 1;
          const chairItems = allOrderedItems.filter((i) => i.seatNumber === seatNum);
          const isSelected = selectedChair === seatNum;
          return (
            <button
              key={seatNum}
              type="button"
              onClick={() => setSelectedChair(seatNum)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 shrink-0 border ${
                isSelected
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                  : chairItems.length > 0
                  ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-stone-500 border-dashed border-stone-300 hover:bg-[#FAF8F5]'
              }`}
            >
              <Armchair className="h-3 w-3" />
              <span>Chair {seatNum}</span>
              {chairItems.length > 0 && (
                <span className={`text-[9px] font-black px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
                  {chairItems.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Order & Food Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 font-mono">
        {/* Ready Food Callout */}
        {hasReadyFood && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div>
                <span className="font-black text-blue-950 text-xs block">
                  Dishes Plated &amp; Ready at Pass
                </span>
                <span className="text-[10px] text-blue-700">
                  Ready for Captain or Runner to deliver
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleServeReady}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer"
            >
              Mark Served
            </button>
          </motion.div>
        )}

        {/* Empty States */}
        {isVacant ? (
          <div className="py-12 bg-white border border-[#EAE5DF] rounded-2xl text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-sm text-stone-900">Table {table.number} is Vacant &amp; Clean</p>
              <p className="text-xs text-stone-500 mt-1">Ready to seat waiting guests and take new orders.</p>
            </div>
            <button
              type="button"
              onClick={() => onGoToOrder()}
              className="mt-2 px-5 py-2.5 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>Seat Guests &amp; Take Order</span>
            </button>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-12 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl text-center space-y-2">
            <Utensils className="h-8 w-8 mx-auto text-stone-400 opacity-50" />
            <p className="font-bold text-stone-700 text-xs">
              {selectedChair === 'ALL' ? 'No active orders placed on this table yet' : `No dishes assigned specifically to Chair ${selectedChair}`}
            </p>
            <p className="text-[11px] text-stone-500">
              Tap &ldquo;Add Dishes&rdquo; below to send a KOT to kitchen
            </p>
          </div>
        ) : (
          /* Ordered Dishes List */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-stone-600 uppercase tracking-wider px-1">
              <span>{selectedChair === 'ALL' ? `Ordered Dishes (${allOrderedItems.length})` : `Chair ${selectedChair} Dishes (${displayedItems.length})`}</span>
              <span>₹{displayedItems.reduce((acc, i) => acc + i.totalPrice, 0).toFixed(0)}</span>
            </div>

            <div className="space-y-2">
              {displayedItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="font-black text-stone-900 text-xs flex items-center gap-1.5">
                      {item.seatNumber && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9.5px] font-bold">
                          Chair {item.seatNumber}
                        </span>
                      )}
                      <span className="text-[#9C3D1E]">{item.quantity}×</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      KOT #{item.ticketNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] border ${
                      item.stage === 'Ready'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : item.stage === 'Cooking'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : item.stage === 'Served'
                        ? 'bg-stone-100 text-stone-700 border-stone-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {item.stage}
                    </span>
                    <span className="font-black text-stone-900 text-xs min-w-[50px] text-right">
                      ₹{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Captain Action Deck */}
      <div className="px-6 py-4 border-t border-[#EAE5DF] bg-white space-y-2 shrink-0 font-mono">
        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onGoToOrder(typeof selectedChair === 'number' ? selectedChair : undefined)}
            className="py-3 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Utensils className="h-4 w-4" />
            <span>{selectedChair === 'ALL' ? 'Add Dishes' : `Add for Chair ${selectedChair}`}</span>
          </motion.button>

          {grandTotal > 0 && !isVacant ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onGoToSettle()}
              className="py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>Settle Full Bill</span>
            </motion.button>
          ) : (
            <button
              type="button"
              disabled
              className="py-3 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-200 cursor-not-allowed"
            >
              <CreditCard className="h-4 w-4" />
              <span>No Bill Due</span>
            </button>
          )}
        </div>

        {/* Secondary Operations: Split Bill & Merge Table */}
        <div className="grid grid-cols-2 gap-2">
          {grandTotal > 0 && !isVacant ? (
            <button
              type="button"
              onClick={onOpenSplitModal}
              className="py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Split className="h-3.5 w-3.5 text-amber-700" />
              <span>Split Bill</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="py-2.5 bg-stone-50 border border-stone-200 text-stone-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Split className="h-3.5 w-3.5" />
              <span>Split Bill</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenMergeModal}
            className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border ${
              isMerged
                ? 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
            }`}
          >
            <Link2 className="h-3.5 w-3.5 text-purple-700" />
            <span>{isMerged ? 'Manage Merge' : 'Merge Table'}</span>
          </button>
        </div>

        {/* Two-step Vacate & Reset */}
        {!confirmVacate ? (
          <button
            type="button"
            onClick={() => onSetConfirmVacate(true)}
            className="w-full py-2.5 bg-[#FAF8F5] hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Vacate &amp; Clean Table {table.number}</span>
          </button>
        ) : (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
            <p className="text-center text-xs font-bold text-rose-800">
              Confirm vacate and clean {table.number}?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSetConfirmVacate(false)}
                className="py-2 bg-white border border-stone-300 text-stone-700 hover:bg-[#FAF8F5] rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVacate}
                className="py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Yes, Vacate</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
