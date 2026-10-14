'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2 } from 'lucide-react';
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

  // Kitchen Ready Notifications matching mobile waiter logic exactly
  interface ReadyItemNotif {
    type: 'SINGLE';
    id: string;
    ticketId: string;
    tableNumber: string;
    seatNumber?: number;
    serverName: string;
    timestamp: string;
    item: {
      id: string;
      name: string;
      quantity: number;
      options?: string;
    };
  }

  interface ReadyGroupNotif {
    type: 'COMBINED';
    id: string;
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

  type ReadyNotif = ReadyItemNotif | ReadyGroupNotif;

  const readyNotifications: ReadyNotif[] = [];

  kdsTickets.forEach((tk) => {
    if (tk.status === 'COMPLETED' || tk.status === 'SERVED') return;
    const unservedItems = (tk.items || []).filter((it) => it.stage !== 'SERVED');
    if (unservedItems.length === 0) return;

    // A ticket is considered ready if either tk.status === 'READY' OR all unserved items are PLATED
    const allReady = tk.status === 'READY' || unservedItems.every((it) => it.stage === 'PLATED');

    if (allReady) {
      readyNotifications.push({
        type: 'COMBINED',
        id: `group-${tk.id}`,
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
      unservedItems.forEach((it) => {
        if (it.stage === 'PLATED' || tk.status === 'READY') {
          readyNotifications.push({
            type: 'SINGLE',
            id: `item-${tk.id}-${it.id}`,
            ticketId: tk.id,
            tableNumber: tk.tableNumber,
            seatNumber: it.seatNumber || tk.seatNumber,
            serverName: tk.serverName,
            timestamp: tk.timestamp,
            item: {
              id: it.id,
              name: it.name,
              quantity: it.quantity,
              options: it.options,
            },
          });
        }
      });
    }
  });

  const handleServeSingleItem = (ticketId: string, itemId: string, tableNum: string, itemName: string) => {
    setFeedbackToast(`✓ Table ${tableNum}: ${itemName} served`);
    waiterMarkKitchenItemServed(ticketId, itemId);
  };

  const handleServeGroup = (ticketId: string, tableNum: string, items: Array<{ id: string }>) => {
    setFeedbackToast(`✓ Table ${tableNum}: All dishes served`);
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
                {readyNotifications.length > 0 && (
                  <span className="h-5 px-2 flex items-center bg-emerald-600 text-white font-mono text-xs font-black rounded-full animate-pulse">
                    {readyNotifications.length} READY
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

            {/* Ready Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
              {readyNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400 font-mono text-xs space-y-2">
                  <Clock className="h-10 w-10 text-emerald-500 opacity-60" />
                  <p className="font-bold text-stone-700 text-sm">Pass is clear</p>
                  <p className="text-stone-500">No plated dishes waiting at the kitchen counter</p>
                </div>
              ) : (
                <AnimatePresence>
                  {readyNotifications.map((notif) => {
                    if (notif.type === 'COMBINED') {
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 80, transition: { duration: 0.15 } }}
                          className="p-4 rounded-2xl shadow-xs space-y-2.5 bg-white border-2 border-emerald-400 ring-2 ring-emerald-400/20"
                        >
                          <div className="flex items-center justify-between font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-emerald-950 text-sm">
                                {notif.tableNumber}
                              </span>
                              {notif.seatNumber && (
                                <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                                  Chair {notif.seatNumber}
                                </span>
                              )}
                              <span className="text-stone-400 text-[10px]">
                                • KOT #{notif.ticketId.slice(-4)}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg animate-pulse">
                              ALL DISHES READY
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-0.5 border-y border-dashed border-stone-200 py-2">
                            {notif.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between font-mono text-xs text-stone-800">
                                <div>
                                  <strong>{it.quantity}×</strong> {it.name}
                                  {it.options && (
                                    <span className="text-[10px] text-stone-400 font-normal ml-1">
                                      ({it.options})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    READY
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleServeSingleItem(notif.ticketId, it.id, notif.tableNumber, it.name)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-mono text-[11px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                                    title="Serve item"
                                  >
                                    <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                                    <span>Serve</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <p className="font-mono text-[10px] text-stone-400">
                              {notif.serverName ? `Server: ${notif.serverName} · ` : ''}{notif.timestamp}
                            </p>
                            <div className="flex items-center gap-2">
                              {onFocusTable && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onFocusTable(notif.tableNumber);
                                    onClose();
                                  }}
                                  className="px-3 py-1.5 font-mono text-xs font-bold rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 transition cursor-pointer shadow-2xs active:scale-95"
                                >
                                  Open Table
                                </button>
                              )}
                              <motion.button
                                whileTap={{ scale: 0.93 }}
                                type="button"
                                onClick={() => handleServeGroup(notif.ticketId, notif.tableNumber, notif.items)}
                                className="px-3.5 py-1.5 font-mono text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Serve All to Table ✓</span>
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // Single item notification
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 80, transition: { duration: 0.15 } }}
                        className="p-3.5 rounded-2xl shadow-xs space-y-2.5 bg-white border-2 border-emerald-300"
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900 text-sm">
                              {notif.tableNumber}
                            </span>
                            {notif.seatNumber && (
                              <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                                Chair {notif.seatNumber}
                              </span>
                            )}
                            <span className="text-stone-400 text-[10px]">
                              • KOT #{notif.ticketId.slice(-4)}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg animate-pulse">
                            READY TO PASS
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-mono text-xs text-stone-900 py-1.5 border-y border-dashed border-stone-200">
                          <div className="font-black">
                            <span className="text-emerald-700 mr-1.5 font-black">{notif.item.quantity}×</span>
                            <span>{notif.item.name}</span>
                            {notif.item.options && (
                              <span className="text-[10px] text-stone-400 font-normal ml-1">
                                ({notif.item.options})
                              </span>
                            )}
                          </div>
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                            READY
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <p className="font-mono text-[10px] text-stone-400">
                            {notif.serverName ? `Server: ${notif.serverName} · ` : ''}{notif.timestamp}
                          </p>
                          <div className="flex items-center gap-2">
                            {onFocusTable && (
                              <button
                                type="button"
                                onClick={() => {
                                  onFocusTable(notif.tableNumber);
                                  onClose();
                                }}
                                className="px-3 py-1.5 font-mono text-xs font-bold rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 transition cursor-pointer shadow-2xs active:scale-95"
                              >
                                Open Table
                              </button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.93 }}
                              type="button"
                              onClick={() => handleServeSingleItem(notif.ticketId, notif.item.id, notif.tableNumber, notif.item.name)}
                              className="px-3 py-1.5 font-mono text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Serve to Table ✓</span>
                            </motion.button>
                          </div>
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
