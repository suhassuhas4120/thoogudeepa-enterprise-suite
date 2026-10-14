'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2, Eye } from 'lucide-react';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
  onFocusTable?: (num: string) => void;
}

export function TabletPickupDrawer({ open, onClose, onFocusTable }: Props) {
  const { kdsTickets, waiterMarkKitchenItemServed } = useSharedBridge();
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Auto-dismiss toast after 1.8s
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Aggregate ready tickets
  interface ReadyTicketGroup {
    ticketId: string;
    tableNumber: string;
    seatNumber?: number;
    serverName: string;
    timestamp: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      options?: string;
    }>;
  }

  const readyGroups: ReadyTicketGroup[] = [];

  kdsTickets.forEach((tk) => {
    if (tk.status === 'COMPLETED' || tk.status === 'SERVED') return;
    const unservedItems = (tk.items || []).filter((it) => it.stage !== 'SERVED');
    if (unservedItems.length === 0) return;

    // Ticket is ready if status is READY or all unserved items are PLATED
    const isReady = tk.status === 'READY' || unservedItems.every((it) => it.stage === 'PLATED');

    if (isReady) {
      readyGroups.push({
        ticketId: tk.id,
        tableNumber: tk.tableNumber,
        seatNumber: tk.seatNumber,
        serverName: tk.serverName,
        timestamp: tk.timestamp,
        items: unservedItems.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          options: it.options,
        })),
      });
    } else {
      // Also include individual plated items if partially ready
      const platedItems = unservedItems.filter((it) => it.stage === 'PLATED');
      if (platedItems.length > 0) {
        readyGroups.push({
          ticketId: tk.id,
          tableNumber: tk.tableNumber,
          seatNumber: tk.seatNumber,
          serverName: tk.serverName,
          timestamp: tk.timestamp,
          items: platedItems.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            options: it.options,
          })),
        });
      }
    }
  });

  const handleServeTicket = (
    ticketId: string,
    tableNum: string,
    items: Array<{ id: string; name: string }>
  ) => {
    const label = items.length > 1 ? 'All dishes' : items[0]?.name || 'Dish';
    setFeedbackToast(`✓ Table ${tableNum}: ${label} served`);
    items.forEach((it) => waiterMarkKitchenItemServed(ticketId, it.id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs z-50"
          />

          {/* Drawer slides in from right */}
          <motion.div
            key="pickup-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute right-0 top-0 h-full w-[400px] bg-white shadow-2xl border-l-2 border-stone-300 z-50 flex flex-col overflow-hidden font-sans select-none"
          >
            {/* Top Header with Title, Badge & Close Button */}
            <div className="px-6 py-4 border-b-2 border-stone-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <h2 className="text-lg font-black text-stone-950 tracking-tight font-mono">
                Kitchen Pickup
              </h2>
              <div className="flex items-center gap-2">
                {readyGroups.length > 0 && (
                  <span className="h-6 px-2.5 flex items-center bg-emerald-600 text-white font-mono text-xs font-black rounded-full animate-pulse">
                    {readyGroups.length} READY
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 border border-stone-300 rounded-xl transition cursor-pointer text-stone-600 hover:text-stone-900"
                >
                  <X className="h-5 w-5 stroke-[2.4]" />
                </button>
              </div>
            </div>

            {/* Ready List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-mono">
              {readyGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400 font-mono text-xs space-y-2">
                  <Clock className="h-10 w-10 text-emerald-500 opacity-60" />
                  <p className="font-bold text-stone-700 text-sm">Pass is clear</p>
                  <p className="text-stone-500">No plated dishes waiting at the kitchen counter</p>
                </div>
              ) : (
                <AnimatePresence>
                  {readyGroups.map((group) => {
                    const isMultiple = group.items.length > 1;

                    return (
                      <motion.div
                        key={group.ticketId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 80, transition: { duration: 0.15 } }}
                        className="p-4 rounded-2xl shadow-xs space-y-3 bg-white border-2 border-emerald-400 ring-2 ring-emerald-400/20"
                      >
                        {/* Table, Seat & Ticket Header */}
                        <div className="flex items-center justify-between font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-emerald-950 text-sm bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                              {group.tableNumber}
                            </span>
                            {group.seatNumber && (
                              <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                Chair {group.seatNumber}
                              </span>
                            )}
                            <span className="text-stone-400 text-xs font-semibold">
                              • KOT #{group.ticketId.slice(-4)}
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg animate-pulse">
                            {isMultiple ? 'ALL DISHES READY' : 'READY TO PASS'}
                          </span>
                        </div>

                        {/* Food Items List - clean & clear, NO per-item serve button */}
                        <div className="space-y-2 py-2.5 border-y border-dashed border-stone-200 font-mono">
                          {group.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs text-stone-900"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-xs shrink-0">
                                  {it.quantity}×
                                </span>
                                <span className="font-bold text-stone-900 truncate text-xs">
                                  {it.name}
                                </span>
                                {it.options && (
                                  <span className="text-[11px] text-stone-500 font-normal">
                                    ({it.options})
                                  </span>
                                )}
                              </div>
                              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                                READY
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Timestamp & Server */}
                        <div className="flex items-center justify-between text-xs font-mono text-stone-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                            <span>{group.timestamp || 'Just now'}</span>
                          </span>
                          {group.serverName && (
                            <span>
                              Server: <strong className="text-stone-700">{group.serverName}</strong>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons Row: Open Table & Serve All side-by-side in a proper row */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          {onFocusTable && (
                            <button
                              type="button"
                              onClick={() => {
                                onFocusTable(group.tableNumber);
                                onClose();
                              }}
                              className="h-10 px-3 bg-white hover:bg-stone-50 border-2 border-stone-300 text-stone-800 font-mono text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
                            >
                              <Eye className="h-4 w-4 text-stone-500" />
                              <span>Open Table</span>
                            </button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleServeTicket(group.ticketId, group.tableNumber, group.items)}
                            className={`h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                              !onFocusTable ? 'col-span-2' : ''
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{isMultiple ? 'Serve All ✓' : 'Serve to Table ✓'}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Tactile Feedback Toast */}
            <AnimatePresence>
              {feedbackToast && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.92 }}
                  transition={{ duration: 0.18 }}
                  className="absolute bottom-4 left-4 right-4 z-50 py-2.5 px-3 bg-stone-900/95 text-white rounded-xl shadow-2xl border border-stone-700 flex items-center justify-center gap-2 font-mono text-xs font-black backdrop-blur-md"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{feedbackToast}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
