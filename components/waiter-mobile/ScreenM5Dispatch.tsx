'use client';

import React, { useState } from 'react';
import { Bell, UtensilsCrossed, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  initialTab?: 'PINGS' | 'READY';
}

export function ScreenM5Dispatch({ initialTab = 'PINGS' }: Props) {
  const { pings, kdsTickets, waiterResolvePing } = useSharedBridge();
  const [activeTab, setActiveTab] = useState<'PINGS' | 'READY'>(initialTab);

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Tab toggle */}
      <div className="px-3.5 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 p-1 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveTab('PINGS')}
            className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'PINGS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Customer Calls</span>
            {activePings.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'PINGS' ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
              }`}>
                {activePings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('READY')}
            className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'READY'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>Kitchen Pass</span>
            {readyTickets.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'READY' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
              }`}>
                {readyTickets.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-6 space-y-3">

        {/* ── CUSTOMER PINGS ── */}
        {activeTab === 'PINGS' && (
          activePings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 opacity-50" />
              <p className="font-bold text-stone-700">All calls attended</p>
              <p>No pending assistance requests</p>
            </div>
          ) : (
            activePings.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-white border border-rose-300 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        {p.tableNumber}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-stone-700 uppercase bg-[#FAF8F5] border border-[#EAE5DF] px-2 py-0.5 rounded">
                        {p.type}
                      </span>
                    </div>
                    {p.guestName && (
                      <p className="font-mono text-[10px] text-stone-500">
                        Guest: {p.guestName}
                      </p>
                    )}
                    {p.message && (
                      <p className="text-xs font-sans text-stone-600 italic leading-relaxed">
                        &ldquo;{p.message}&rdquo;
                      </p>
                    )}
                    <p className="font-mono text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {p.timestamp}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => waiterResolvePing(p.id)}
                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0"
                  >
                    Done
                  </motion.button>
                </div>
              </motion.div>
            ))
          )
        )}

        {/* ── KITCHEN PASS READY ── */}
        {activeTab === 'READY' && (
          readyTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs space-y-2">
              <Clock className="h-10 w-10 text-blue-500 opacity-50" />
              <p className="font-bold text-stone-700">Pass is clear</p>
              <p>No plated dishes waiting at the counter</p>
            </div>
          ) : (
            readyTickets.map((tk) => (
              <motion.div
                key={tk.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-white border border-blue-200 rounded-2xl shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-black text-blue-900">
                    {tk.tableNumber} — KOT #{tk.id.slice(-4)}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    READY TO PASS
                  </span>
                </div>
                <div className="space-y-1 pt-0.5">
                  {tk.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between font-mono text-xs text-stone-800">
                      <span><strong>{it.quantity}×</strong> {it.name}</span>
                      <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {it.stage}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[10px] text-stone-400 pt-0.5">
                  Server: {tk.serverName} · {tk.timestamp}
                </p>
              </motion.div>
            ))
          )
        )}
      </div>
    </div>
  );
}
