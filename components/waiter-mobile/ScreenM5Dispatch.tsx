'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  mode?: 'CALLS' | 'READY';
  initialTab?: 'CALLS' | 'READY';
  onNavigateToTable?: (tableNum: string) => void;
}

export function ScreenM5Dispatch({ mode = 'CALLS', initialTab, onNavigateToTable }: Props) {
  const effectiveMode = initialTab ?? mode;
  const { pings, kdsTickets, waiterResolvePing, waiterMarkKitchenItemServed } = useSharedBridge();

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // 1. Customer Pings (Dedicated Customer Notifications)
  const activePings = pings.filter((p) => p.status === 'PENDING');

  // 2. Kitchen Ready Notifications: per-item when individual items ready, combined when all dishes of order ready
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
    if (tk.status === 'COMPLETED') return;
    const unservedItems = (tk.items || []).filter((it) => it.stage !== 'SERVED');
    if (unservedItems.length === 0) return;

    const allReady = unservedItems.every((it) => it.stage === 'PLATED');

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
        if (it.stage === 'PLATED') {
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

  // Auto-dismiss toast after 1.8s
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Helper: Pings older than 2 minutes are highlighted as URGENT
  const isPingUrgent = (ts: string) => {
    try {
      const pingTime = new Date(ts).getTime();
      return !isNaN(pingTime) && Date.now() - pingTime > 120000;
    } catch {
      return false;
    }
  };

  // Direct resolution with clean toast
  const handleResolvePing = (pingId: string, tableNum: string) => {
    setFeedbackToast(`✓ Table ${tableNum} attended`);
    waiterResolvePing(pingId);
  };

  const handleServeSingleItem = (ticketId: string, itemId: string, tableNum: string, itemName: string) => {
    setFeedbackToast(`✓ Table ${tableNum}: ${itemName} served`);
    waiterMarkKitchenItemServed(ticketId, itemId);
  };

  const handleServeGroup = (ticketId: string, tableNum: string, items: Array<{ id: string }>) => {
    setFeedbackToast(`✓ Table ${tableNum}: All dishes served`);
    items.forEach((it) => waiterMarkKitchenItemServed(ticketId, it.id));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 font-sans relative">

      {/* ── CALLS VIEW (Dedicated to Customer Notifications) ── */}
      {effectiveMode === 'CALLS' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-8 space-y-3">
            {activePings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-stone-400 font-mono text-xs space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 opacity-60" />
                <p className="font-bold text-stone-700 text-sm">All Calls Attended</p>
                <p className="text-stone-500">No active customer assistance requests</p>
              </div>
            ) : (
              <AnimatePresence>
                {activePings.map((p) => {
                  const urgent = isPingUrgent(p.timestamp);

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 80, transition: { duration: 0.15 } }}
                      drag="x"
                      dragDirectionLock
                      dragConstraints={{ left: 0, right: 260 }}
                      dragElastic={0.15}
                      onDragEnd={(_, info) => {
                        const dx = info.offset.x;
                        const dy = Math.abs(info.offset.y);
                        if (dx > 85 && dx > dy * 1.8) {
                          handleResolvePing(p.id, p.tableNumber);
                        }
                      }}
                      className={`p-3.5 rounded-2xl shadow-xs space-y-2.5 relative touch-pan-y ${
                        urgent
                          ? 'bg-red-50/90 border-2 border-red-400 ring-2 ring-red-400/20'
                          : 'bg-gradient-to-br from-amber-50/70 to-orange-50/50 border-2 border-orange-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg shadow-2xs ${
                                urgent
                                  ? 'text-red-950 bg-red-100 border border-red-300'
                                  : 'text-orange-950 bg-orange-100 border border-orange-300'
                              }`}
                            >
                              {p.tableNumber}
                            </span>
                            <span className="font-mono text-[10px] font-black uppercase text-amber-900 bg-white border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Bell className="h-2.5 w-2.5 text-amber-600" />
                              <span>{p.type} Request</span>
                            </span>
                            {urgent && (
                              <span className="font-mono text-[9px] font-black uppercase text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full animate-pulse">
                                URGENT (&gt;2m)
                              </span>
                            )}
                          </div>
                          {p.guestName && (
                            <p className="font-mono text-[10.5px] font-bold text-stone-800">
                              Guest: {p.guestName}
                            </p>
                          )}
                          {p.message && (
                            <p className="text-xs text-stone-700 italic font-sans bg-white/70 p-1.5 rounded-lg border border-orange-200">
                              &ldquo;{p.message}&rdquo;
                            </p>
                          )}
                          <p className="font-mono text-[9.5px] text-stone-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {p.timestamp}
                          </p>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => handleResolvePing(p.id, p.tableNumber)}
                          className="px-3.5 py-2 font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0 flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Attended ✓</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {/* ── READY VIEW ── */}
      {effectiveMode === 'READY' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-3.5 pt-3 pb-2.5 flex items-center justify-between border-b border-[#EAE5DF] shrink-0">
            <span className="font-mono text-xs font-black uppercase text-stone-700 flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
              <span>Kitchen Ready Pass</span>
            </span>
            <span className="font-mono text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl">
              {readyNotifications.length} {readyNotifications.length === 1 ? 'Ready Notification' : 'Ready Notifications'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-8 space-y-3">
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
                        drag="x"
                        dragDirectionLock
                        dragConstraints={{ left: 0, right: 260 }}
                        dragElastic={0.15}
                        onDragEnd={(_, info) => {
                          const dx = info.offset.x;
                          const dy = Math.abs(info.offset.y);
                          if (dx > 85 && dx > dy * 1.8) {
                            handleServeGroup(notif.ticketId, notif.tableNumber, notif.items);
                          }
                        }}
                        className="p-4 rounded-2xl shadow-xs space-y-2.5 touch-pan-y bg-white border-2 border-emerald-400 ring-2 ring-emerald-400/20"
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
                              <span><strong>{it.quantity}×</strong> {it.name}</span>
                              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                READY
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <p className="font-mono text-[10px] text-stone-400">
                            {notif.serverName ? `Server: ${notif.serverName} · ` : ''}{notif.timestamp}
                          </p>
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
                      drag="x"
                      dragDirectionLock
                      dragConstraints={{ left: 0, right: 260 }}
                      dragElastic={0.15}
                      onDragEnd={(_, info) => {
                        const dx = info.offset.x;
                        const dy = Math.abs(info.offset.y);
                        if (dx > 85 && dx > dy * 1.8) {
                          handleServeSingleItem(notif.ticketId, notif.item.id, notif.tableNumber, notif.item.name);
                        }
                      }}
                      className="p-3.5 rounded-2xl shadow-xs space-y-2.5 touch-pan-y bg-white border-2 border-emerald-300"
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
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {/* Minimal Tactile Swipe Feedback Toast */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 left-6 right-6 z-50 py-3 px-4 bg-stone-900/95 text-white rounded-2xl shadow-2xl border border-stone-700 flex items-center justify-center gap-2 font-mono text-xs font-black backdrop-blur-md"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
