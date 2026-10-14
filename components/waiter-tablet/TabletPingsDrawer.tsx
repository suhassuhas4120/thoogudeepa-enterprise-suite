"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CreditCard,
  CheckCircle2,
  Clock,
  X,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSharedBridge } from "../../store/useSharedBridge";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectTable?: (tableNum: string) => void;
}

export function TabletPingsDrawer({ open, onClose, onSelectTable }: Props) {
  const { pings, waiterResolvePing } = useSharedBridge();
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const activePings = pings.filter((p) => p.status === "PENDING");

  // Auto-dismiss feedback toast after 1.8s
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

  const handleResolvePing = (pingId: string, tableNum: string) => {
    setFeedbackToast(`✓ Table ${tableNum} attended`);
    waiterResolvePing(pingId);
  };

  const handleFocusTable = (tblNum: string) => {
    if (onSelectTable) {
      onSelectTable(tblNum);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop on tablet for clean focus */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs z-50"
          />

          <motion.div
            key="pings-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="absolute right-0 top-0 h-full w-[400px] bg-white shadow-2xl border-l-2 border-stone-300 z-50 flex flex-col overflow-hidden font-sans select-none"
          >
            {/* Drawer header */}
            <div className="px-6 py-4 border-b-2 border-stone-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <h2 className="text-lg font-black text-stone-950 tracking-tight font-mono">
                Customer Calls
              </h2>
              <div className="flex items-center gap-2">
                {activePings.length > 0 && (
                  <span className="h-5 px-2 flex items-center bg-rose-600 text-white font-mono text-xs font-black rounded-full animate-pulse">
                    {activePings.length} CALLS
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

            {/* Pings list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
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
                        className={`p-3.5 rounded-2xl shadow-xs space-y-2.5 relative touch-pan-y ${
                          urgent
                            ? "bg-red-50/90 border-2 border-red-400 ring-2 ring-red-400/20"
                            : "bg-gradient-to-br from-amber-50/70 to-orange-50/50 border-2 border-orange-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg shadow-2xs ${
                                  urgent
                                    ? "text-red-950 bg-red-100 border border-red-300"
                                    : p.type === "PAYMENT"
                                    ? "text-purple-950 bg-purple-100 border border-purple-300"
                                    : "text-orange-950 bg-orange-100 border border-orange-300"
                                }`}
                              >
                                {p.tableNumber}
                              </span>
                              {p.seatNumber && (
                                <span className="font-mono text-[10px] font-black text-amber-950 bg-amber-200 border border-amber-400 px-1.5 py-0.5 rounded-md">
                                  Chair {p.seatNumber}
                                </span>
                              )}
                              {p.type === "PAYMENT" ? (
                                <span className="font-mono text-[10px] font-black uppercase text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <CreditCard className="h-2.5 w-2.5 text-purple-600" />
                                  <span>Bill & Payment</span>
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] font-black uppercase text-amber-900 bg-white border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <Bell className="h-2.5 w-2.5 text-amber-600" />
                                  <span>{p.type} Request</span>
                                </span>
                              )}
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
                              <Clock className="h-3 w-3" /> {p.timestamp || "Just now"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-orange-200/60">
                          {onSelectTable ? (
                            <button
                              type="button"
                              onClick={() => handleFocusTable(p.tableNumber)}
                              className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold font-mono rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
                            >
                              <Eye className="h-3.5 w-3.5 text-stone-500" />
                              <span>Focus Table</span>
                            </button>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.type === "PAYMENT" && onSelectTable && (
                              <motion.button
                                whileTap={{ scale: 0.93 }}
                                type="button"
                                onClick={() => {
                                  handleResolvePing(p.id, p.tableNumber);
                                  handleFocusTable(p.tableNumber);
                                }}
                                className="px-3.5 py-1.5 font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0 flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Settle Bill →</span>
                              </motion.button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.93 }}
                              type="button"
                              onClick={() => handleResolvePing(p.id, p.tableNumber)}
                              className="px-3.5 py-1.5 font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0 flex items-center gap-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Attended ✓</span>
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
