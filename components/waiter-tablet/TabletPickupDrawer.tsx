'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, AlertCircle, Check } from 'lucide-react';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
  onFocusTable?: (num: string) => void;
}

export function TabletPickupDrawer({ open, onClose, onFocusTable }: Props) {
  const { kdsTickets, waiterMarkKitchenItemServed } = useSharedBridge();

  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

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
                {readyTickets.length > 0 && (
                  <span className="h-5 px-2 flex items-center bg-blue-600 text-white font-mono text-xs font-black rounded-full animate-pulse">
                    {readyTickets.length} READY
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

            {/* Ready Tickets List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {readyTickets.length === 0 ? (
                <div className="p-8 bg-stone-50 border-2 border-stone-200 rounded-3xl text-center space-y-2 mt-8">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
                    <ChefHat className="h-8 w-8 stroke-[2.2]" />
                  </div>
                  <h4 className="font-black text-stone-950 text-base mt-2">Pass is Clear</h4>
                  <p className="font-mono text-xs text-stone-600 font-bold">
                    No food waiting at the kitchen pickup counter.
                  </p>
                </div>
              ) : (
                readyTickets.map((tk) => (
                  <motion.div
                    key={tk.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border-2 border-blue-300 bg-blue-50/70 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-sm text-stone-950 font-mono">
                          Table {tk.tableNumber}
                        </p>
                        <p className="font-mono text-xs text-stone-600 font-bold mt-0.5">
                          {tk.items.length} item(s) · Ticket #{tk.id.slice(-4)}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-mono text-xs font-black animate-pulse">
                        READY
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono">
                      {tk.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-blue-200"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-black text-stone-900 leading-tight">
                              {item.name}
                            </p>
                            {item.options && (
                              <p className="text-[10px] text-stone-500">{item.options}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                              x{item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => waiterMarkKitchenItemServed(tk.id, item.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-mono text-[11px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              <span>Served</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {onFocusTable && (
                      <button
                        type="button"
                        onClick={() => {
                          onFocusTable(tk.tableNumber);
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black font-mono transition cursor-pointer shadow-xs active:scale-98"
                      >
                        Open Table {tk.tableNumber}
                      </button>
                    )}
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
