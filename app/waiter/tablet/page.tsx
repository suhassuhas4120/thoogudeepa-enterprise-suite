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
  RefreshCw,
  Bell,
  UtensilsCrossed,
  Clock,
  Briefcase,
  X,
  Users,
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

  // Audio chime on new ping
  const prevPingCountRef = useRef(activePings.length);
  useEffect(() => {
    if (activePings.length > prevPingCountRef.current) {
      setActivePingsPanel(true);
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          [0, 0.2].forEach((offset) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
            gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + offset);
            osc.stop(ctx.currentTime + offset + 0.3);
          });
        }
      } catch {}
    }
    prevPingCountRef.current = activePings.length;
  }, [activePings.length]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleVacate = async (num: string) => {
    waiterVacatesTable(num);
    await vacateTablePod(num);
    setConfirmVacate(false);
    showFeedback(`Table ${num} vacated and reset`);
  };

  const handleCash = (num: string, bill: number) => {
    waiterRecordsPayment(num, 'CASH', bill);
    showFeedback(`Cash payment of ₹${bill} recorded for ${num}`);
  };

  const getStatusBg = (status: string, selected = false) => {
    if (selected) return 'border-orange-500 bg-orange-950/60 ring-2 ring-orange-500/30';
    switch (status) {
      case 'OCCUPIED': return 'border-orange-600/60 bg-orange-950/30 hover:border-orange-500';
      case 'BILLING':  return 'border-purple-500/60 bg-purple-950/30 hover:border-purple-400';
      case 'CLEANING': return 'border-amber-500/60 bg-amber-950/30 hover:border-amber-400';
      case 'VACANT':   return 'border-emerald-600/40 bg-emerald-950/20 hover:border-emerald-500';
      default:         return 'border-slate-700 bg-slate-900/40 hover:border-slate-600';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'OCCUPIED': return 'text-orange-400 border-orange-600/50 bg-orange-950/60';
      case 'BILLING':  return 'text-purple-400 border-purple-600/50 bg-purple-950/60';
      case 'CLEANING': return 'text-amber-400 border-amber-600/50 bg-amber-950/60';
      case 'VACANT':   return 'text-emerald-400 border-emerald-600/50 bg-emerald-950/60';
      default:         return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  const stats = {
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    vacant: tables.filter((t) => t.status === 'VACANT').length,
    billing: tables.filter((t) => t.status === 'BILLING').length,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

      {/* Feedback Toast */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white font-mono text-xs font-black px-5 py-2.5 rounded-xl shadow-lg"
          >
            ✓ {actionFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 px-5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/20">
            <Tablet className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-widest text-orange-400">
              Captain Tablet Station
            </div>
            <h1 className="text-sm font-black tracking-tight text-white uppercase">
              Thoogudeepa Donne Biryani Mane
            </h1>
          </div>
        </div>

        {/* Multi-Portal Nav */}
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
          <Link href="/" className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition">
            <Utensils className="h-3.5 w-3.5" /><span>Customer</span>
          </Link>
          <Link href="/kitchen" className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition">
            <Flame className="h-3.5 w-3.5" /><span>Kitchen</span>
          </Link>
          <Link href="/waiter/mobile" className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition">
            <Smartphone className="h-3.5 w-3.5" /><span>Mobile</span>
          </Link>
          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-600 rounded-xl text-white shadow-xs">
            <Tablet className="h-3.5 w-3.5" /><span>Tablet</span>
          </span>
          <Link href="/manager" className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition">
            <Briefcase className="h-3.5 w-3.5" /><span>Manager</span>
          </Link>
          <Link href="/qr-deck" className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-xl text-slate-950 font-bold transition">
            <QrCode className="h-3.5 w-3.5" /><span>QR Deck</span>
          </Link>

          {/* Ping Bell */}
          <button
            onClick={() => setActivePingsPanel((v) => !v)}
            className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition ${
              activePings.length > 0 ? 'bg-rose-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            {activePings.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse">
                {activePings.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Status Strip ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-2 flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>{stats.occupied} Occupied</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{stats.vacant} Vacant</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          <span>{stats.billing} Billing</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400">
          <UtensilsCrossed className="h-3 w-3 text-blue-400" />
          <span>{readyTickets.length} Ready at Pass</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Sync Active
        </div>
      </div>

      {/* ── Body: 60/40 Split ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left 60%: Floor Matrix */}
        <div className="w-[60%] border-r border-slate-800 flex flex-col overflow-hidden bg-slate-950/60">
          {/* Section Filters */}
          <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold transition whitespace-nowrap ${
                  selectedSection === sec
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {sec === 'ALL' ? `All (${tables.length})` : sec}
              </button>
            ))}
          </div>

          {/* 34-Table Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-3">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable?.number === tbl.number;
                const hasPing = activePings.some((p) => p.tableNumber === tbl.number);
                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTableNum(tbl.number)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between min-h-[90px] relative ${getStatusBg(tbl.status, isSelected)}`}
                  >
                    {hasPing && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full animate-pulse border-2 border-slate-950" />
                    )}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/50">
                      <span className="font-mono text-[13px] font-black text-white">{tbl.number}</span>
                      <span className={`font-mono text-[8px] font-black uppercase px-1.5 py-px rounded border ${getStatusBadgeStyle(tbl.status)}`}>
                        {tbl.status}
                      </span>
                    </div>
                    <div className="mt-1.5 font-mono">
                      <div className="text-white font-black text-sm">₹{tbl.currentBill || 0}</div>
                      <div className="text-slate-500 text-[9px] mt-0.5 truncate">{tbl.section}</div>
                      <div className="text-slate-600 text-[9px] flex items-center gap-1">
                        <Users className="h-2.5 w-2.5" />
                        {tbl.capacity} seats
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 40%: Table Detail Cockpit */}
        <div className="w-[40%] bg-slate-900 flex flex-col overflow-hidden">
          {selectedTable ? (
            <>
              {/* Table Header */}
              <div className="px-5 py-4 border-b border-slate-800 shrink-0">
                <div className="font-mono text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  {selectedTable.section}
                </div>
                <h2 className="text-2xl font-black text-white mt-0.5">
                  {selectedTable.number}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${getStatusBadgeStyle(selectedTable.status)}`}>
                    {selectedTable.status}
                  </span>
                  <span className="font-mono text-lg font-black text-emerald-400">
                    ₹{selectedTable.currentBill || 0}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-xs mt-1">
                  Capacity: {selectedTable.capacity} seats
                </div>
              </div>

              {/* KOT Tickets */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Active KOT Tickets ({tableTickets.length})
                </div>
                {tableTickets.length === 0 ? (
                  <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl text-center font-mono text-xs text-slate-500">
                    No active tickets for {selectedTable.number}
                  </div>
                ) : (
                  tableTickets.map((tk) => (
                    <div key={tk.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-black text-orange-400">
                          KOT #{tk.id.slice(-4)} · {tk.serverName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tk.status === 'READY'
                            ? 'bg-blue-950/60 text-blue-400 border-blue-700/50'
                            : tk.status === 'PREP'
                            ? 'bg-orange-950/60 text-orange-400 border-orange-700/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {tk.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {tk.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-300">{it.quantity}x {it.name}</span>
                            <span className="text-orange-400 font-bold">{it.stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-5 space-y-2.5 shrink-0 border-t border-slate-800 pt-4">
                <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Floor Operations
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCash(selectedTable.number, selectedTable.currentBill || 0)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    Record Cash
                  </button>
                  <Link
                    href={`/?table=${selectedTable.number}&seat=1`}
                    target="_blank"
                    className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <Utensils className="h-3.5 w-3.5" />
                    Open Seat 1
                  </Link>
                </div>

                {!confirmVacate ? (
                  <button
                    onClick={() => setConfirmVacate(true)}
                    className="w-full py-3 bg-slate-800 hover:bg-rose-900 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Vacate Table
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <div className="text-center font-mono text-[10px] text-rose-400 font-bold">
                      Confirm vacate {selectedTable.number}?
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setConfirmVacate(false)}
                        className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-mono text-xs font-black transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleVacate(selectedTable.number)}
                        className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 font-mono text-xs">
              Select a table from the floor map
            </div>
          )}
        </div>
      </div>

      {/* Pings Side Panel */}
      <AnimatePresence>
        {activePingsPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-14 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-40 flex flex-col shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="font-mono text-xs font-black text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-rose-500" />
                CUSTOMER CALLS
                {activePings.length > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-px rounded-full">
                    {activePings.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setActivePingsPanel(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {activePings.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 mb-2 opacity-40" />
                  No pending calls
                </div>
              ) : (
                activePings.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-950/60 border border-rose-700/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-rose-400 bg-rose-950/60 border border-rose-700/40 px-2 py-0.5 rounded">
                        {p.tableNumber}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-300 uppercase">{p.type}</span>
                    </div>
                    {p.message && (
                      <p className="text-xs text-slate-400 italic">"{p.message}"</p>
                    )}
                    <button
                      onClick={() => {
                        waiterResolvePing(p.id);
                        showFeedback(`Ping from ${p.tableNumber} resolved`);
                      }}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] font-black rounded-lg transition"
                    >
                      MARK ATTENDED
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
