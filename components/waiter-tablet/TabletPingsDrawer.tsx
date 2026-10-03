'use client';

import React from 'react';
import { Bell, CheckCircle2, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TabletPingsDrawer({ open, onClose }: Props) {
  const { pings, waiterResolvePing } = useSharedBridge();
  const activePings = pings.filter((p) => p.status === 'PENDING');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pings-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="fixed right-0 top-[60px] bottom-0 w-80 bg-white border-l border-[#EAE5DF] z-40 flex flex-col shadow-2xl"
        >
          {/* Drawer header */}
          <div className="px-5 py-4 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-black text-stone-900">
              <Bell className="h-4 w-4 text-rose-600" />
              <span>CUSTOMER CALLS</span>
              {activePings.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {activePings.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white hover:bg-stone-200 border border-[#EAE5DF] rounded-lg transition"
            >
              <X className="h-4 w-4 text-stone-500" />
            </button>
          </div>

          {/* Pings list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activePings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-400 font-mono text-xs space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 opacity-50" />
                <p className="font-bold text-stone-600">All calls attended</p>
                <p>No pending table requests</p>
              </div>
            ) : (
              activePings.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                      {p.tableNumber}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-stone-600 uppercase">
                      {p.type}
                    </span>
                  </div>

                  {p.guestName && (
                    <p className="font-mono text-[10px] text-stone-500">
                      Guest: {p.guestName}
                    </p>
                  )}

                  {p.message && (
                    <p className="text-xs text-stone-700 italic font-sans leading-relaxed">
                      &ldquo;{p.message}&rdquo;
                    </p>
                  )}

                  <p className="font-mono text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.timestamp}
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => waiterResolvePing(p.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Mark Attended
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
