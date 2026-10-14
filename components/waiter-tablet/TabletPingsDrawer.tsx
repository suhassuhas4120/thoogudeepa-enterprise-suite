'use client';

import React from 'react';
import { Bell, CheckCircle2, Clock, X, Eye, Utensils, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectTable?: (tableNum: string) => void;
}

export function TabletPingsDrawer({ open, onClose, onSelectTable }: Props) {
  const { pings, waiterResolvePing } = useSharedBridge();
  const activePings = pings.filter((p) => p.status === 'PENDING');

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
            className="fixed inset-0 bg-stone-950/30 backdrop-blur-2xs z-40"
          />

          <motion.div
            key="pings-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-[#EAE5DF] z-50 flex flex-col shadow-2xl font-sans"
          >
            {/* Drawer header */}
            <div className="px-5 py-4 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 font-mono text-xs font-black text-stone-900">
                <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <span className="block">CUSTOMER ASSISTANCE</span>
                  <span className="text-[10px] text-stone-400 font-bold">
                    {activePings.length} urgent {activePings.length === 1 ? 'call' : 'calls'}
                  </span>
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

            {/* Pings list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
              {activePings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-stone-400 text-xs space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-stone-700 text-sm">All Calls Attended</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">No guests currently waiting for service</p>
                  </div>
                </div>
              ) : (
                activePings.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                        {p.tableNumber}
                      </span>
                      <span className="font-mono text-[10px] font-black text-stone-700 uppercase bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                        {p.type}
                      </span>
                    </div>

                    {p.guestName && (
                      <p className="text-[11px] text-stone-600 font-bold">
                        Guest: <span className="text-stone-900">{p.guestName}</span>
                      </p>
                    )}

                    {p.message && (
                      <div className="p-2.5 bg-white rounded-xl border border-rose-200/80 text-xs text-stone-800 italic font-sans flex items-start gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>&ldquo;{p.message}&rdquo;</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                      <span className="flex items-center gap-1 font-bold text-stone-500">
                        <Clock className="h-3 w-3 text-rose-500" /> {p.timestamp || 'Just now'}
                      </span>
                      <span className="text-rose-700 font-bold uppercase text-[9px]">
                        Urgent Action
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleFocusTable(p.tableNumber)}
                        className="py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5 text-stone-500" />
                        <span>Focus Table</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => waiterResolvePing(p.id)}
                        className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Attended</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
