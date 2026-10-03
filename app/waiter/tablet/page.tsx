'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { vacateTablePod } from '../../../lib/db';
import {
  Tablet,
  Smartphone,
  Utensils,
  Flame,
  CheckCircle2,
  Trash2,
  CreditCard,
  QrCode,
  Bell,
  UtensilsCrossed,
  Clock,
  Briefcase,
  X,
  Users,
  ChevronRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  'ALL',
  'Family Section',
  'Main Dining Hall',
  'Express / Couple Hall',
  'Courtyard Garden',
  'Grand Feast Hall',
];

export default function WaiterTabletCockpitPage() {
  const {
    tables,
    pings,
    kdsTickets,
    waiterVacatesTable,
    waiterRecordsPayment,
    waiterResolvePing,
  } = useSharedBridge();

  const [selectedTableNum, setSelectedTableNum] = useState<string>('T-15');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [activePingsPanel, setActivePingsPanel] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [confirmVacate, setConfirmVacate] = useState(false);

  const selectedTable = tables.find((t) => t.number === selectedTableNum) || tables[0];
  const tableTickets = kdsTickets.filter((tk) => tk.tableNumber === selectedTable?.number);
  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  const filteredTables = tables.filter((t) => {
    if (selectedSection === 'ALL') return true;
    return t.section.toLowerCase().includes(selectedSection.toLowerCase());
  });

  // Audio notification on customer assistance ping
  const prevPingCountRef = useRef(activePings.length);
  useEffect(() => {
    if (activePings.length > prevPingCountRef.current) {
      setActivePingsPanel(true);
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          [0, 0.18].forEach((offset) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
            gain.gain.setValueAtTime(0.18, ctx.currentTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + offset);
            osc.stop(ctx.currentTime + offset + 0.28);
          });
        }
      } catch {}
    }
    prevPingCountRef.current = activePings.length;
  }, [activePings.length]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2200);
  };

  const handleVacate = async (num: string) => {
    waiterVacatesTable(num);
    await vacateTablePod(num);
    setConfirmVacate(false);
    showFeedback(`Table ${num} reset and ready for guests`);
  };

  const handleCash = (num: string, bill: number) => {
    waiterRecordsPayment(num, 'CASH', bill);
    showFeedback(`Cash settlement ₹${bill} recorded for ${num}`);
  };

  const getStatusTileStyle = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-[#9C3D1E] bg-[#FFF8F5] ring-2 ring-[#9C3D1E]/20 shadow-md';
    }
    switch (status) {
      case 'OCCUPIED':
        return 'border-amber-300 bg-amber-50/50 hover:border-amber-400 shadow-xs';
      case 'BILLING':
        return 'border-purple-300 bg-purple-50/50 hover:border-purple-400 shadow-xs';
      case 'CLEANING':
        return 'border-stone-300 bg-[#FAF8F5] hover:border-stone-400 shadow-xs';
      case 'VACANT':
      default:
        return 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 shadow-xs';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'text-amber-800 bg-amber-100/80 border-amber-300';
      case 'BILLING':
        return 'text-purple-800 bg-purple-100/80 border-purple-300';
      case 'CLEANING':
        return 'text-stone-700 bg-[#FAF8F5] border-stone-300';
      case 'VACANT':
      default:
        return 'text-emerald-800 bg-emerald-100/80 border-emerald-300';
    }
  };

  const stats = {
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    vacant: tables.filter((t) => t.status === 'VACANT').length,
    billing: tables.filter((t) => t.status === 'BILLING').length,
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans select-none">

      {/* Floating Action Feedback Toast */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white font-mono text-xs font-bold px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Console */}
      <header className="h-15 border-b border-[#EAE5DF] bg-white/95 px-6 flex items-center justify-between shrink-0 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#9C3D1E] flex items-center justify-center text-white shadow-sm shadow-[#9C3D1E]/20">
            <Tablet className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-[9.5px] font-black uppercase tracking-widest text-[#9C3D1E]">
              Floor Captain Terminal
            </div>
            <h1 className="text-sm font-black tracking-tight text-stone-900 uppercase">
              Thoogudeepa Donne Biryani Mane
            </h1>
          </div>
        </div>

        {/* Global Multi-Portal Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition"
          >
            <Utensils className="h-3.5 w-3.5 text-[#9C3D1E]" />
            <span>Customer</span>
          </Link>
          <Link
            href="/kitchen"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition"
          >
            <Flame className="h-3.5 w-3.5 text-orange-600" />
            <span>Kitchen KDS</span>
          </Link>
          <Link
            href="/waiter/mobile"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition"
          >
            <Smartphone className="h-3.5 w-3.5 text-blue-600" />
            <span>Steward Mobile</span>
          </Link>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9C3D1E] text-white rounded-xl shadow-xs">
            <Tablet className="h-3.5 w-3.5" />
            <span>Captain Cockpit</span>
          </span>
          <Link
            href="/manager"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition"
          >
            <Briefcase className="h-3.5 w-3.5 text-slate-700" />
            <span>Manager</span>
          </Link>
          <Link
            href="/qr-deck"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold transition shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Deck (34)</span>
          </Link>

          {/* Assistance Alerts Bell */}
          <button
            onClick={() => setActivePingsPanel((v) => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
              activePings.length > 0
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-[#FAF8F5] border-[#EAE5DF] text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Calls</span>
            {activePings.length > 0 && (
              <span className="h-5 w-5 flex items-center justify-center bg-rose-600 text-white text-[10px] font-black rounded-full shadow-xs animate-pulse">
                {activePings.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Floor Overview Status Strip */}
      <div className="bg-white border-b border-[#EAE5DF] px-6 py-2 flex items-center gap-6 shrink-0 text-xs font-mono font-bold">
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span>{stats.occupied} Dining</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span>{stats.vacant} Clean &amp; Vacant</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-xs" />
          <span>{stats.billing} Settling Bill</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <UtensilsCrossed className="h-3.5 w-3.5 text-blue-600" />
          <span>{readyTickets.length} Ready at Pass</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Realtime Active</span>
        </div>
      </div>

      {/* Main 60 / 40 Interactive Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left 60%: Floor Plan Grid */}
        <div className="w-[60%] border-r border-[#EAE5DF] flex flex-col overflow-hidden bg-[#FAF8F5]">
          {/* Section Filter Pills */}
          <div className="px-5 py-3 border-b border-[#EAE5DF] bg-white flex items-center gap-2 overflow-x-auto shrink-0 shadow-2xs">
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition whitespace-nowrap border ${
                  selectedSection === sec
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-600 border-[#EAE5DF] hover:bg-stone-200'
                }`}
              >
                {sec === 'ALL' ? `All Floor (${tables.length})` : sec}
              </button>
            ))}
          </div>

          {/* 34-Table Interactive Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-4 gap-3.5">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable?.number === tbl.number;
                const hasPing = activePings.some((p) => p.tableNumber === tbl.number);
                return (
                  <motion.div
                    key={tbl.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedTableNum(tbl.number);
                      setConfirmVacate(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between min-h-[104px] relative ${getStatusTileStyle(tbl.status, isSelected)}`}
                  >
                    {hasPing && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 rounded-full animate-pulse border-2 border-white shadow-xs" />
                    )}

                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                      <span className="font-mono text-base font-black text-stone-900 tracking-tight">
                        {tbl.number}
                      </span>
                      <span className={`font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusBadge(tbl.status)}`}>
                        {tbl.status}
                      </span>
                    </div>

                    <div className="my-1.5 font-mono">
                      <div className="text-stone-900 font-black text-base tracking-tight">
                        ₹{tbl.currentBill || 0}
                      </div>
                      <div className="text-stone-500 text-[10px] truncate mt-0.5">
                        {tbl.section}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-stone-200/40 flex items-center justify-between font-mono text-[10px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-stone-400" />
                        {tbl.capacity} seats
                      </span>
                      {tbl.status === 'OCCUPIED' && (
                        <span className="text-amber-700 font-bold">Active</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 40%: Active Table Cockpit Panel */}
        <div className="w-[40%] bg-white flex flex-col overflow-hidden shadow-xs">
          {selectedTable ? (
            <>
              {/* Selected Table Identity Header */}
              <div className="px-6 py-5 border-b border-[#EAE5DF] bg-[#FAF8F5] shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-widest">
                      {selectedTable.section}
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                      TABLE {selectedTable.number}
                    </h2>
                    <div className="text-stone-500 font-mono text-xs mt-1 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-stone-400" />
                      <span>Capacity: {selectedTable.capacity} guests</span>
                      <span>•</span>
                      <span>Server: Captain Ramesh</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${getStatusBadge(selectedTable.status)}`}>
                      {selectedTable.status}
                    </span>
                    <div className="font-mono text-xl font-black text-emerald-700 mt-1.5">
                      ₹{selectedTable.currentBill || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* KOT Tickets & Items Breakdown */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-black text-stone-700 uppercase tracking-wider">
                    Active Kitchen Orders ({tableTickets.length})
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Live KDS Stepper</span>
                </div>

                {tableTickets.length === 0 ? (
                  <div className="p-8 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl text-center font-mono text-xs text-stone-500 space-y-1">
                    <Utensils className="h-6 w-6 mx-auto text-stone-400 opacity-60 mb-2" />
                    <div className="font-bold text-stone-700">No active kitchen tickets</div>
                    <div>Use "Open Seat 1" below to place an order</div>
                  </div>
                ) : (
                  tableTickets.map((tk) => (
                    <div
                      key={tk.id}
                      className="p-4 bg-[#FAF8F5] border border-[#EAE5DF] rounded-2xl space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-[#EAE5DF]">
                        <span className="font-black text-[#9C3D1E]">
                          KOT #{tk.id.slice(-4)} • {tk.serverName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          tk.status === 'READY'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : tk.status === 'PREP'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-stone-200 text-stone-700 border-stone-300'
                        }`}>
                          {tk.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {tk.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center font-mono text-xs">
                            <span className="text-stone-800 font-medium">
                              <strong className="text-stone-900">{it.quantity}x</strong> {it.name}
                            </span>
                            <span className="text-[#9C3D1E] font-bold text-[11px] bg-white border border-[#EAE5DF] px-2 py-0.5 rounded-md">
                              {it.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Floor Captain Operational Actions */}
              <div className="px-6 pb-6 pt-4 border-t border-[#EAE5DF] bg-white space-y-3 shrink-0">
                <div className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider">
                  Captain Operations
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleCash(selectedTable.number, selectedTable.currentBill || 0)}
                    className="py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <span>Record Cash</span>
                  </button>

                  <Link
                    href={`/?table=${selectedTable.number}&seat=1`}
                    target="_blank"
                    className="py-3 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] text-[#9C3D1E] rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>Open Seat 1</span>
                  </Link>
                </div>

                {/* Two-Step Vacate Confirmation Guard */}
                {!confirmVacate ? (
                  <button
                    onClick={() => setConfirmVacate(true)}
                    className="w-full py-3 bg-[#FAF8F5] hover:bg-rose-50 border border-stone-300 hover:border-rose-300 text-stone-700 hover:text-rose-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Vacate Table {selectedTable.number}</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
                    <div className="text-center font-mono text-xs font-bold text-rose-800">
                      Confirm vacate and clean {selectedTable.number}?
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setConfirmVacate(false)}
                        className="py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-[#FAF8F5] rounded-lg font-mono text-xs font-bold transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleVacate(selectedTable.number)}
                        className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Yes, Vacate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400 font-mono text-xs">
              Select a table from the floor map
            </div>
          )}
        </div>
      </div>

      {/* Assistance Alerts Side Drawer */}
      <AnimatePresence>
        {activePingsPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-15 bottom-0 w-84 bg-white border-l border-[#EAE5DF] z-40 flex flex-col shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between">
              <div className="font-mono text-xs font-black text-stone-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-rose-600" />
                <span>CUSTOMER CALLS</span>
                {activePings.length > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {activePings.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActivePingsPanel(false)}
                className="p-1.5 bg-white hover:bg-stone-200 border border-[#EAE5DF] rounded-lg transition"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activePings.length === 0 ? (
                <div className="text-center py-16 text-stone-400 font-mono text-xs space-y-2">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 opacity-50" />
                  <div className="font-bold text-stone-600">All calls attended</div>
                  <div>No pending table requests</div>
                </div>
              ) : (
                activePings.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                        {p.tableNumber} • SEAT {(p as any).seatNumber || 1}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-stone-600 uppercase">
                        {p.type}
                      </span>
                    </div>

                    {p.message && (
                      <p className="text-xs text-stone-700 italic font-sans leading-relaxed">
                        "{p.message}"
                      </p>
                    )}

                    <button
                      onClick={() => {
                        waiterResolvePing(p.id);
                        showFeedback(`Assistance to ${p.tableNumber} completed`);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Mark Attended
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
