'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ChefHat, CheckCheck, AlertCircle, Clock, UtensilsCrossed } from 'lucide-react';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  activeTab: 'calls' | 'kitchen';
  onTabChange: (tab: 'calls' | 'kitchen') => void;
  onClose: () => void;
  onFocusTable: (num: string) => void;
}

export function TabletNotifDrawer({
  open,
  activeTab,
  onTabChange,
  onClose,
  onFocusTable,
}: Props) {
  const { pings, kdsTickets, waiterResolvePing, waiterMarkKitchenItemServed } = useSharedBridge();

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  const pingTypeColor = (type: string) => {
    if (type === 'Bill' || type === 'BILL')
      return 'text-purple-950 bg-purple-50 border-purple-300';
    if (type === 'Water' || type === 'WATER')
      return 'text-blue-950 bg-blue-50 border-blue-300';
    return 'text-rose-950 bg-rose-50 border-rose-300';
  };

  const pingTypeIcon = (type: string) => {
    if (type === 'Bill' || type === 'BILL') return '💳';
    if (type === 'Water' || type === 'WATER') return '💧';
    return '🔔';
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute right-0 top-0 h-full w-[400px] bg-white shadow-2xl border-l-2 border-stone-300 z-50 flex flex-col overflow-hidden font-sans select-none"
          >
            {/* ── Top Header with Clean Title & Close Button ── */}
            <div className="px-6 py-4 border-b-2 border-stone-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-widest text-[#9C3D1E]">
                  {activeTab === 'calls' ? 'Customer Call Service' : 'Kitchen Dispatch Pass'}
                </p>
                <h2 className="text-xl font-black text-stone-950 tracking-tight mt-0.5">
                  {activeTab === 'calls' ? 'Resolve Customer Calls' : 'Kitchen Pickup Ready'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-stone-100 border border-stone-300 rounded-xl transition cursor-pointer text-stone-600 hover:text-stone-900"
              >
                <X className="h-5 w-5 stroke-[2.4]" />
              </button>
            </div>

            {/* ── Segmented Switcher Bar (Ensures User can toggle or see separate sections) ── */}
            <div className="px-5 py-2.5 bg-stone-100 border-b-2 border-stone-200 grid grid-cols-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onTabChange('calls')}
                className={`py-2 px-3 rounded-xl font-mono text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 border-2 ${
                  activeTab === 'calls'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Guest Calls</span>
                {activePings.length > 0 && (
                  <span
                    className={`h-4.5 px-1.5 rounded-full text-[10px] font-black font-mono flex items-center justify-center ${
                      activeTab === 'calls'
                        ? 'bg-white text-[#9C3D1E]'
                        : 'bg-rose-600 text-white animate-pulse'
                    }`}
                  >
                    {activePings.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onTabChange('kitchen')}
                className={`py-2 px-3 rounded-xl font-mono text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 border-2 ${
                  activeTab === 'kitchen'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <ChefHat className="h-4 w-4" />
                <span>Kitchen Pickup</span>
                {readyTickets.length > 0 && (
                  <span
                    className={`h-4.5 px-1.5 rounded-full text-[10px] font-black font-mono flex items-center justify-center ${
                      activeTab === 'kitchen'
                        ? 'bg-white text-blue-700'
                        : 'bg-blue-600 text-white animate-pulse'
                    }`}
                  >
                    {readyTickets.length}
                  </span>
                )}
              </button>
            </div>

            {/* ── Drawer Body - Strictly Separated (No Mixing) ── */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ════════════════════════════════════════════════════════
                  SECTION 1: CUSTOMER CALLS ONLY (Never mixed with kitchen)
              ════════════════════════════════════════════════════════ */}
              {activeTab === 'calls' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-rose-600 stroke-[2.4]" />
                      <p className="font-mono text-xs font-black uppercase tracking-wider text-stone-800">
                        Pending Customer Assistance
                      </p>
                    </div>
                    {activePings.length > 0 && (
                      <span className="h-5 px-2 flex items-center bg-rose-600 text-white font-mono text-xs font-black rounded-full animate-pulse">
                        {activePings.length} CALLS
                      </span>
                    )}
                  </div>

                  {activePings.length === 0 ? (
                    <div className="p-8 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-center space-y-2 mt-4">
                      <CheckCheck className="h-10 w-10 text-emerald-600 mx-auto stroke-[2.4]" />
                      <h4 className="font-black text-stone-950 text-base">All Calls Attended</h4>
                      <p className="font-mono text-xs text-stone-600 font-bold">
                        No pending guest calls or waiter rings right now.
                      </p>
                    </div>
                  ) : (
                    activePings.map((ping) => (
                      <motion.div
                        key={ping.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border-2 ${pingTypeColor(
                          ping.type
                        )} space-y-3 shadow-2xs`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{pingTypeIcon(ping.type)}</span>
                            <div>
                              <p className="font-black text-sm text-stone-950">
                                Table {ping.tableNumber} · {ping.type}
                              </p>
                              <p className="font-mono text-xs text-stone-600 font-bold mt-0.5">
                                {ping.guestName || 'Guest'} · {ping.timestamp}
                              </p>
                            </div>
                          </div>
                          <Clock className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
                        </div>
                        {ping.message && (
                          <p className="text-xs text-stone-800 bg-white/80 rounded-xl px-3.5 py-2 border border-stone-200 font-medium">
                            "{ping.message}"
                          </p>
                        )}
                        <div className="flex gap-2 font-mono text-xs font-bold pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onFocusTable(ping.tableNumber);
                              onClose();
                            }}
                            className="flex-1 py-2 rounded-xl bg-white border-2 border-stone-300 text-stone-800 hover:bg-stone-50 transition cursor-pointer"
                          >
                            Focus Table
                          </button>
                          <button
                            type="button"
                            onClick={() => waiterResolvePing(ping.id)}
                            className="flex-1 py-2 rounded-xl bg-[#9C3D1E] hover:bg-[#7d3018] text-white transition cursor-pointer shadow-xs font-black"
                          >
                            <span>✓ Resolve Call</span>
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════════════════
                  SECTION 2: KITCHEN PICKUP ONLY (Never mixed with customer calls)
              ════════════════════════════════════════════════════════ */}
              {activeTab === 'kitchen' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-blue-600 stroke-[2.4]" />
                      <p className="font-mono text-xs font-black uppercase tracking-wider text-stone-800">
                        Dishes Ready at Pass
                      </p>
                    </div>
                    {readyTickets.length > 0 && (
                      <span className="h-5 px-2 flex items-center bg-blue-600 text-white font-mono text-xs font-black rounded-full animate-pulse">
                        {readyTickets.length} READY
                      </span>
                    )}
                  </div>

                  {readyTickets.length === 0 ? (
                    <div className="p-8 bg-stone-50 border-2 border-stone-200 rounded-3xl text-center space-y-2 mt-4">
                      <ChefHat className="h-10 w-10 text-stone-400 mx-auto stroke-[2.2]" />
                      <h4 className="font-black text-stone-950 text-base">Pass is Clear</h4>
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
                              🍽 Table {tk.tableNumber}
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
                                  ×{item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => waiterMarkKitchenItemServed(tk.id, item.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-mono text-[11px] font-black transition cursor-pointer"
                                >
                                  Served
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onFocusTable(tk.tableNumber);
                            onClose();
                          }}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black font-mono transition cursor-pointer shadow-xs"
                        >
                          Open Table {tk.tableNumber}
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t-2 border-stone-200 bg-stone-50 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-600 font-bold">
                <AlertCircle className="h-4 w-4 text-[#9C3D1E] stroke-[2.4]" />
                <span>
                  {activeTab === 'calls'
                    ? 'Managing customer assistance calls'
                    : 'Managing kitchen pass pickup items'}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
