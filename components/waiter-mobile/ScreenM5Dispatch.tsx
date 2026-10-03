'use client';

import React, { useState } from 'react';
import {
  Bell,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Flame,
  ChefHat,
  Briefcase,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  initialTab?: 'CALLS' | 'READY';
  onNavigateToTable?: (tableNum: string) => void;
}

type CallCategory = 'ALL' | 'CUSTOMER' | 'KITCHEN' | 'MANAGER';

export function ScreenM5Dispatch({ initialTab = 'CALLS', onNavigateToTable }: Props) {
  const { pings, kdsTickets, inventory86, waiterResolvePing, waiterMarkKitchenItemServed } = useSharedBridge();
  const [activeTab, setActiveTab] = useState<'CALLS' | 'READY'>(initialTab);
  const [callFilter, setCallFilter] = useState<CallCategory>('ALL');
  const [acknowledgedNotices, setAcknowledgedNotices] = useState<Record<string, boolean>>({});

  // 1. Customer Pings
  const activePings = pings.filter((p) => p.status === 'PENDING');

  // 2. Kitchen Ready Tickets
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  // 3. Kitchen Station Expedite / Urgent Cooking Calls (Tickets delayed > 15m)
  const kitchenUrgentCalls = kdsTickets.filter(
    (tk) => tk.status === 'PREP' && tk.elapsedMinutes >= 15
  );

  // 4. Manager Broadcast & 86 Notices
  const manager86Items = inventory86.filter((it) => it.is86 && !acknowledgedNotices[it.id]);

  // Total call count
  const totalCallsCount = activePings.length + kitchenUrgentCalls.length + manager86Items.length;

  const handleAcknowledge86 = (id: string) => {
    setAcknowledgedNotices((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 font-sans">

      {/* Main Tab Switcher: CALLS vs READY PASS */}
      <div className="px-3.5 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 p-1 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('CALLS')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition ${
              activeTab === 'CALLS'
                ? 'bg-gradient-to-r from-[#9C3D1E] to-[#C2410C] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Active Calls</span>
            {totalCallsCount > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'CALLS' ? 'bg-white/20 text-white' : 'bg-rose-600 text-white'
              }`}>
                {totalCallsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('READY')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition ${
              activeTab === 'READY'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>Kitchen Ready</span>
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

      {/* ── CALLS TAB VIEW ── */}
      {activeTab === 'CALLS' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sub-Filter Pills with Distinct Color Themes */}
          <div className="px-3.5 pb-2.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setCallFilter('ALL')}
              className={`px-3 py-1 rounded-xl font-mono text-[10.5px] font-black border transition shrink-0 ${
                callFilter === 'ALL'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-600 border-[#EAE5DF]'
              }`}
            >
              All Calls ({totalCallsCount})
            </button>

            {/* Customer Pill: Orange Theme */}
            <button
              type="button"
              onClick={() => setCallFilter('CUSTOMER')}
              className={`px-2.5 py-1 rounded-xl font-mono text-[10.5px] font-black border transition flex items-center gap-1 shrink-0 ${
                callFilter === 'CUSTOMER'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Bell className="h-3 w-3" />
              <span>Customer ({activePings.length})</span>
            </button>

            {/* Kitchen Pill: Emerald/Green Theme */}
            <button
              type="button"
              onClick={() => setCallFilter('KITCHEN')}
              className={`px-2.5 py-1 rounded-xl font-mono text-[10.5px] font-black border transition flex items-center gap-1 shrink-0 ${
                callFilter === 'KITCHEN'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <ChefHat className="h-3 w-3" />
              <span>Kitchen ({kitchenUrgentCalls.length})</span>
            </button>

            {/* Manager Pill: Purple/Indigo Theme */}
            <button
              type="button"
              onClick={() => setCallFilter('MANAGER')}
              className={`px-2.5 py-1 rounded-xl font-mono text-[10.5px] font-black border transition flex items-center gap-1 shrink-0 ${
                callFilter === 'MANAGER'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}
            >
              <Briefcase className="h-3 w-3" />
              <span>Manager ({manager86Items.length})</span>
            </button>
          </div>

          {/* Calls Feed Content */}
          <div className="flex-1 overflow-y-auto px-3.5 pb-6 space-y-3">
            {totalCallsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 opacity-60" />
                <p className="font-bold text-stone-700 text-sm">Floor in Harmony</p>
                <p>No pending customer calls, kitchen alerts, or manager notices</p>
              </div>
            ) : (
              <>
                {/* 1. CUSTOMER CALLS (Orange/Rose Theme) */}
                {(callFilter === 'ALL' || callFilter === 'CUSTOMER') &&
                  activePings.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-gradient-to-br from-amber-50/70 to-orange-50/50 border-2 border-orange-300 rounded-2xl shadow-xs space-y-2.5 relative"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-orange-950 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-lg shadow-2xs">
                              {p.tableNumber}
                            </span>
                            <span className="font-mono text-[10px] font-black uppercase text-amber-900 bg-white border border-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Bell className="h-2.5 w-2.5 text-amber-600" />
                              <span>{p.type} Request</span>
                            </span>
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
                          onClick={() => waiterResolvePing(p.id)}
                          className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0"
                        >
                          Attended ✓
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}

                {/* 2. KITCHEN CALLS (Emerald/Green/Blue Theme) */}
                {(callFilter === 'ALL' || callFilter === 'KITCHEN') &&
                  kitchenUrgentCalls.map((tk) => (
                    <motion.div
                      key={tk.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border-2 border-emerald-400 rounded-2xl shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs">
                              {tk.tableNumber}
                            </span>
                            <span className="font-mono text-[10px] font-black uppercase text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <ChefHat className="h-2.5 w-2.5 text-emerald-600" />
                              <span>Kitchen Expedite Call</span>
                            </span>
                          </div>
                          <p className="font-mono text-[11px] font-black text-stone-800">
                            Ticket #{tk.id.slice(-4)} • Cooking Time: {tk.elapsedMinutes} mins
                          </p>
                          <div className="text-[10.5px] font-mono text-stone-600">
                            {tk.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onNavigateToTable?.(tk.tableNumber)}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0 flex items-center gap-1"
                        >
                          <span>View</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                {/* 3. MANAGER CALLS & NOTICES (Purple/Indigo Theme) */}
                {(callFilter === 'ALL' || callFilter === 'MANAGER') &&
                  manager86Items.map((it) => (
                    <motion.div
                      key={it.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 border-2 border-purple-400 rounded-2xl shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-purple-950 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-purple-700" />
                              <span>Manager Notice</span>
                            </span>
                            <span className="font-mono text-[10px] font-black uppercase text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-lg">
                              86 SOLD OUT
                            </span>
                          </div>
                          <p className="font-mono text-xs font-black text-stone-900 mt-1">
                            {it.name}
                          </p>
                          <p className="text-[10px] font-mono text-stone-500">
                            Category: {it.category} • Inventory depleted for shift
                          </p>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => handleAcknowledge86(it.id)}
                          className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0"
                        >
                          Understood ✓
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── READY PASS TAB VIEW ── */}
      {activeTab === 'READY' && (
        <div className="flex-1 overflow-y-auto px-3.5 pb-6 space-y-3">
          {readyTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 font-mono text-xs space-y-2">
              <Clock className="h-10 w-10 text-blue-500 opacity-60" />
              <p className="font-bold text-stone-700 text-sm">Pass is clear</p>
              <p>No plated dishes waiting at the kitchen counter</p>
            </div>
          ) : (
            readyTickets.map((tk) => (
              <motion.div
                key={tk.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-white border-2 border-blue-300 rounded-2xl shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-black text-blue-900 text-sm">
                    {tk.tableNumber} — KOT #{tk.id.slice(-4)}
                  </span>
                  <span className="text-[10px] font-black text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-lg animate-pulse">
                    READY TO PASS
                  </span>
                </div>

                <div className="space-y-1.5 pt-0.5 border-y border-dashed border-stone-200 py-2">
                  {tk.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between font-mono text-xs text-stone-800">
                      <span><strong>{it.quantity}×</strong> {it.name}</span>
                      <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {it.stage}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="font-mono text-[10px] text-stone-400">
                    Server: {tk.serverName} · {tk.timestamp}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      tk.items.forEach((it) => waiterMarkKitchenItemServed(tk.id, it.id));
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-black rounded-xl shadow-xs transition"
                  >
                    Served to Table ✓
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
