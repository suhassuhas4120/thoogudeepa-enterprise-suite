'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSharedBridge } from '../../../store/useSharedBridge';
import {
  Smartphone,
  Bell,
  Clock,
  CheckCircle2,
  Utensils,
  Flame,
  Search,
  X,
  ChevronRight,
  CreditCard,
  Trash2,
  AlertCircle,
  UtensilsCrossed,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PINS = ['1111', '2222', '3333', '4444'];
const WAITER_NAMES: Record<string, string> = {
  '1111': 'Ramesh (Section A)',
  '2222': 'Suresh (Section B)',
  '3333': 'Nayana (Section C)',
  '4444': 'Vennela (Section D)',
};

export default function WaiterMobilePage() {
  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterVacatesTable,
    waiterRecordsPayment,
  } = useSharedBridge();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [activeTab, setActiveTab] = useState<'TABLES' | 'PINGS' | 'READY'>('TABLES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableNum, setSelectedTableNum] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const shakeRef = useRef(false);

  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');
  const activePings = pings.filter((p) => p.status === 'PENDING');

  const filteredTables = tables.filter((t) =>
    t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTable = selectedTableNum
    ? tables.find((t) => t.number === selectedTableNum)
    : null;

  const tableTickets = kdsTickets.filter(
    (tk) => tk.tableNumber === selectedTable?.number
  );

  // Audio chime on new ping
  const prevPingCountRef = useRef(activePings.length);
  useEffect(() => {
    if (activePings.length > prevPingCountRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch {}
    }
    prevPingCountRef.current = activePings.length;
  }, [activePings.length]);

  const handlePinEntry = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (PINS.includes(next)) {
        setWaiterName(WAITER_NAMES[next]);
        setTimeout(() => setLoggedIn(true), 200);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
        }, 900);
      }
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleResolvePing = (id: string) => {
    waiterResolvePing(id);
    showFeedback('Customer call resolved');
  };

  const handleVacate = (num: string) => {
    waiterVacatesTable(num);
    setSelectedTableNum(null);
    showFeedback(`Table ${num} vacated`);
  };

  const handleCash = (num: string, bill: number) => {
    waiterRecordsPayment(num, 'CASH', bill);
    showFeedback(`Cash payment recorded for ${num}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OCCUPIED': return 'border-orange-500 bg-orange-50';
      case 'BILLING':  return 'border-purple-500 bg-purple-50';
      case 'CLEANING': return 'border-amber-500 bg-amber-50';
      case 'VACANT':   return 'border-emerald-500 bg-emerald-50';
      default:         return 'border-slate-300 bg-stone-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OCCUPIED': return 'text-orange-800';
      case 'BILLING':  return 'text-purple-800';
      case 'CLEANING': return 'text-amber-800';
      case 'VACANT':   return 'text-emerald-700';
      default:         return 'text-slate-700';
    }
  };

  // ─── Login Screen ───────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans px-6">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-600/30">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div className="font-mono text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">
              Floor Steward
            </div>
            <h1 className="text-white text-xl font-black tracking-tight">
              Thoogudeepa Donne Biryani
            </h1>
            <p className="text-slate-400 text-xs font-mono mt-1">Enter your 4-digit steward PIN</p>
          </div>

          {/* PIN Display */}
          <motion.div
            animate={pinError ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex justify-center gap-3 mb-8 ${pinError ? 'opacity-80' : ''}`}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-3.5 w-3.5 rounded-full border-2 transition-all ${
                  pin.length > i
                    ? pinError
                      ? 'bg-rose-500 border-rose-500'
                      : 'bg-orange-500 border-orange-500'
                    : 'bg-transparent border-slate-600'
                }`}
              />
            ))}
          </motion.div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handlePinEntry(d)}
                className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono text-xl font-black transition shadow-xs border border-slate-700"
              >
                {d}
              </button>
            ))}
            <div />
            <button
              onClick={() => handlePinEntry('0')}
              className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-mono text-xl font-black transition shadow-xs border border-slate-700"
            >
              0
            </button>
            <button
              onClick={() => setPin((p) => p.slice(0, -1))}
              className="h-14 rounded-2xl bg-slate-800 hover:bg-rose-900 active:bg-rose-800 text-slate-300 font-mono text-sm font-black transition shadow-xs border border-slate-700 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {pinError && (
            <p className="text-center text-rose-400 font-mono text-xs font-bold mt-4 animate-pulse">
              Invalid PIN. Try again.
            </p>
          )}

          <div className="mt-8 text-center text-slate-600 font-mono text-[10px]">
            PINs: 1111 • 2222 • 3333 • 4444
          </div>
        </div>
      </main>
    );
  }

  // ─── Main App ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-stone-100 flex flex-col font-sans max-w-md mx-auto border-x border-slate-300 shadow-2xl relative">

      {/* Feedback Toast */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white font-mono text-xs font-black px-4 py-2 rounded-xl shadow-lg"
          >
            {actionFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-orange-600 flex items-center justify-center shadow-xs">
            <Smartphone className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-wider text-orange-400">
              {waiterName}
            </div>
            <h1 className="text-xs font-black tracking-tight uppercase">
              Thoogudeepa Donne Biryani
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9.5px]">
          <Link href="/kitchen" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">KDS</Link>
          <Link href="/waiter/tablet" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-orange-400 font-bold">Tablet</Link>
          <button
            onClick={() => { setLoggedIn(false); setPin(''); }}
            className="px-2 py-1 bg-rose-900 hover:bg-rose-800 rounded text-rose-300 font-bold"
          >
            Out
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="bg-white border-b border-slate-200 grid grid-cols-3 text-center font-mono text-[11px] font-black sticky top-[52px] z-30 shadow-sm">
        <button
          onClick={() => setActiveTab('TABLES')}
          className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'TABLES'
              ? 'border-orange-600 text-orange-700 bg-orange-50/60'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>TABLES</span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-px rounded-full">{tables.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('PINGS')}
          className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1.5 relative ${
            activeTab === 'PINGS'
              ? 'border-rose-600 text-rose-700 bg-rose-50/60'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>PINGS</span>
          {activePings.length > 0 && (
            <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-px rounded-full animate-pulse">
              {activePings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('READY')}
          className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1.5 relative ${
            activeTab === 'READY'
              ? 'border-blue-600 text-blue-700 bg-blue-50/60'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          <span>READY</span>
          {readyTickets.length > 0 && (
            <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-px rounded-full">
              {readyTickets.length}
            </span>
          )}
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 pb-6">

        {/* ── TABLES TAB ── */}
        {activeTab === 'TABLES' && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search table or section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-orange-500 shadow-xs"
              />
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredTables.map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTableNum(tbl.number)}
                  className={`p-3 rounded-xl border-2 shadow-xs text-left transition active:scale-95 ${getStatusStyle(tbl.status)}`}
                >
                  <div className={`flex items-center justify-between pb-1.5 border-b border-current/20 ${getStatusText(tbl.status)}`}>
                    <span className="font-mono text-sm font-black">{tbl.number}</span>
                    <span className="font-mono text-[9px] font-black uppercase">{tbl.status}</span>
                  </div>
                  <div className={`mt-2 font-mono text-[10.5px] ${getStatusText(tbl.status)}`}>
                    <div className="text-slate-500 truncate text-[10px]">{tbl.section}</div>
                    <div className="font-black text-slate-900 mt-0.5">₹{tbl.currentBill || 0}</div>
                    <div className="text-slate-500 text-[9px] mt-0.5">Cap: {tbl.capacity}</div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-end">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>

            {filteredTables.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-mono text-xs">
                No tables match your search
              </div>
            )}
          </>
        )}

        {/* ── PINGS TAB ── */}
        {activeTab === 'PINGS' && (
          <>
            {activePings.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-mono text-xs">
                <CheckCircle2 className="h-9 w-9 mx-auto text-emerald-500 mb-3 opacity-40" />
                <div>All clear — no pending customer calls</div>
              </div>
            ) : (
              activePings.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-white border-2 border-rose-500 rounded-xl shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {p.tableNumber} · SEAT {(p as any).seatNumber || 1}
                        </span>
                        <span className="font-mono text-[10px] font-black text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded">
                          {p.type}
                        </span>
                      </div>
                      {p.message && (
                        <p className="text-xs font-sans text-slate-600 mt-1.5 italic leading-relaxed">
                          "{p.message}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleResolvePing(p.id)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-black rounded-lg shadow-xs transition shrink-0"
                    >
                      DONE
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {/* ── READY DISHES TAB ── */}
        {activeTab === 'READY' && (
          <>
            {readyTickets.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-mono text-xs">
                <Clock className="h-9 w-9 mx-auto text-blue-500 mb-3 opacity-40" />
                <div>No dishes waiting at the pass</div>
              </div>
            ) : (
              readyTickets.map((tk) => (
                <div
                  key={tk.id}
                  className="p-3.5 bg-white border-2 border-blue-500 rounded-xl shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-blue-800">
                      {tk.tableNumber} · KOT #{tk.id.slice(-4)}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      READY TO PASS
                    </span>
                  </div>
                  <div className="space-y-1">
                    {tk.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-800 font-bold">{it.quantity}x {it.name}</span>
                        <span className="text-emerald-700 font-black text-[10px] bg-emerald-50 px-1.5 py-px rounded">
                          {it.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Table Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-12 bg-slate-300 rounded-full" />
            </div>

            <div className="px-4 pb-6">
              {/* Table Header */}
              <div className="flex items-start justify-between py-3 border-b border-slate-100 mb-3">
                <div>
                  <div className="font-mono text-[10px] text-orange-600 font-black uppercase tracking-wider">
                    {selectedTable.section}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {selectedTable.number}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${getStatusStyle(selectedTable.status)} ${getStatusText(selectedTable.status)}`}>
                      {selectedTable.status}
                    </span>
                    <span className="font-mono text-sm font-black text-slate-900">
                      ₹{selectedTable.currentBill || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTableNum(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>

              {/* Active KOTs */}
              {tableTickets.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="font-mono text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Active Orders ({tableTickets.length})
                  </div>
                  {tableTickets.map((tk) => (
                    <div key={tk.id} className="p-2.5 bg-stone-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-orange-700">KOT #{tk.id.slice(-4)}</span>
                        <span className="px-1.5 py-px bg-slate-200 text-slate-700 rounded font-bold">{tk.status}</span>
                      </div>
                      {tk.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-mono text-[10px] text-slate-700">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="text-orange-600 font-bold">{it.stage}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCash(selectedTable.number, selectedTable.currentBill || 0)}
                    className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    Record Cash
                  </button>
                  <Link
                    href={`/?table=${selectedTable.number}&seat=1`}
                    target="_blank"
                    className="py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-mono text-xs font-black flex items-center justify-center gap-1.5 transition"
                  >
                    <Utensils className="h-3.5 w-3.5" />
                    Open Order
                  </Link>
                </div>

                <button
                  onClick={() => handleVacate(selectedTable.number)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-mono text-xs font-black flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Vacate {selectedTable.number}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for drawer */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTableNum(null)}
            className="fixed inset-0 bg-black/30 z-40 max-w-md mx-auto"
          />
        )}
      </AnimatePresence>
    </main>
  );
}
