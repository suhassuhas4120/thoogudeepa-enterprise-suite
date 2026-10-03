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
  Users,
  UtensilsCrossed,
  LogOut,
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
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
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
        }, 800);
      }
    }
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleResolvePing = (id: string) => {
    waiterResolvePing(id);
    showFeedback('Assistance call resolved');
  };

  const handleVacate = (num: string) => {
    waiterVacatesTable(num);
    setSelectedTableNum(null);
    showFeedback(`Table ${num} reset for new guests`);
  };

  const handleCash = (num: string, bill: number) => {
    waiterRecordsPayment(num, 'CASH', bill);
    showFeedback(`Cash settlement recorded for ${num}`);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'border-amber-300 bg-amber-50/60 text-amber-900';
      case 'BILLING':
        return 'border-purple-300 bg-purple-50/60 text-purple-900';
      case 'CLEANING':
        return 'border-stone-300 bg-[#FAF8F5] text-stone-700';
      case 'VACANT':
      default:
        return 'border-emerald-200 bg-emerald-50/40 text-emerald-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'BILLING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CLEANING':
        return 'bg-stone-200 text-stone-700 border-stone-300';
      case 'VACANT':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  // ── PIN Authentication View ──────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center font-sans px-6 select-none">
        <div className="w-full max-w-xs space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 rounded-3xl bg-[#9C3D1E] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9C3D1E]/20 text-white">
              <Smartphone className="h-8 w-8" />
            </div>
            <div className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9C3D1E] mb-1">
              Floor Steward Terminal
            </div>
            <h1 className="text-stone-900 text-xl font-black tracking-tight uppercase">
              Thoogudeepa Donne Biryani
            </h1>
            <p className="text-stone-500 text-xs font-mono mt-1">Enter your 4-digit steward PIN</p>
          </div>

          {/* PIN Indicators */}
          <motion.div
            animate={pinError ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-3 py-2"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full border-2 transition-all ${
                  pin.length > i
                    ? pinError
                      ? 'bg-rose-500 border-rose-500'
                      : 'bg-[#9C3D1E] border-[#9C3D1E]'
                    : 'bg-white border-stone-300 shadow-2xs'
                }`}
              />
            ))}
          </motion.div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.94 }}
                onClick={() => handlePinEntry(d)}
                className="h-15 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#EAE5DF] text-stone-900 font-mono text-2xl font-black shadow-xs flex items-center justify-center transition"
              >
                {d}
              </motion.button>
            ))}
            <div />
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handlePinEntry('0')}
              className="h-15 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#EAE5DF] text-stone-900 font-mono text-2xl font-black shadow-xs flex items-center justify-center transition"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setPin((p) => p.slice(0, -1))}
              className="h-15 rounded-2xl bg-white hover:bg-rose-50 border border-[#EAE5DF] text-stone-500 hover:text-rose-600 shadow-xs flex items-center justify-center transition"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {pinError && (
            <p className="text-center text-rose-600 font-mono text-xs font-bold animate-pulse">
              Invalid PIN. Try again.
            </p>
          )}

          <div className="pt-2 text-center text-stone-400 font-mono text-[10.5px]">
            PINs: 1111 (Sec A) • 2222 (Sec B) • 3333 (Sec C) • 4444 (Sec D)
          </div>
        </div>
      </main>
    );
  }

  // ── Main Mobile Dashboard ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">

      {/* Floating Action Feedback Toast */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white font-mono text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#9C3D1E] flex items-center justify-center text-white shadow-xs">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-wider text-[#9C3D1E]">
              {waiterName}
            </div>
            <h1 className="text-xs font-black tracking-tight text-stone-900 uppercase">
              Thoogudeepa Donne Biryani
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
          <Link href="/kitchen" className="px-2 py-1 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-md text-stone-600">
            KDS
          </Link>
          <Link href="/waiter/tablet" className="px-2 py-1 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-md text-stone-600">
            Tablet
          </Link>
          <button
            onClick={() => { setLoggedIn(false); setPin(''); }}
            className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md text-rose-700"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-[#EAE5DF] grid grid-cols-3 text-center font-mono text-xs font-black sticky top-[53px] z-30 shadow-2xs">
        <button
          onClick={() => setActiveTab('TABLES')}
          className={`py-3 border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'TABLES'
              ? 'border-[#9C3D1E] text-[#9C3D1E] bg-[#FFF8F5]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>TABLES</span>
          <span className="text-[10px] bg-[#FAF8F5] text-stone-700 px-1.5 py-0.5 rounded-full">
            {tables.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PINGS')}
          className={`py-3 border-b-2 transition flex items-center justify-center gap-1.5 relative ${
            activeTab === 'PINGS'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>CALLS</span>
          {activePings.length > 0 && (
            <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.5 rounded-full animate-pulse">
              {activePings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('READY')}
          className={`py-3 border-b-2 transition flex items-center justify-center gap-1.5 relative ${
            activeTab === 'READY'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          <span>READY</span>
          {readyTickets.length > 0 && (
            <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded-full">
              {readyTickets.length}
            </span>
          )}
        </button>
      </nav>

      {/* Main Tab Content */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 pb-8">

        {/* ── TABLES TAB ── */}
        {activeTab === 'TABLES' && (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search table or section (e.g. T-15)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-[#9C3D1E] shadow-2xs placeholder:text-stone-400"
              />
            </div>

            {/* 2-Column Tables Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredTables.map((tbl) => (
                <motion.button
                  key={tbl.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTableNum(tbl.number)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition shadow-xs flex flex-col justify-between ${getStatusStyle(tbl.status)}`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-current/15">
                    <span className="font-mono text-base font-black text-stone-900">
                      {tbl.number}
                    </span>
                    <span className={`font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getStatusBadge(tbl.status)}`}>
                      {tbl.status}
                    </span>
                  </div>

                  <div className="my-2 font-mono">
                    <div className="text-stone-500 text-[10px] truncate">{tbl.section}</div>
                    <div className="text-stone-900 font-black text-base mt-0.5">
                      ₹{tbl.currentBill || 0}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-current/10 flex items-center justify-between font-mono text-[10px] text-stone-500">
                    <span>{tbl.capacity} seats</span>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredTables.length === 0 && (
              <div className="text-center py-16 text-stone-400 font-mono text-xs">
                No tables match your search query
              </div>
            )}
          </>
        )}

        {/* ── PINGS TAB ── */}
        {activeTab === 'PINGS' && (
          <>
            {activePings.length === 0 ? (
              <div className="text-center py-20 text-stone-400 font-mono text-xs space-y-2">
                <CheckCircle2 className="h-9 w-9 mx-auto text-emerald-600 opacity-50" />
                <div className="font-bold text-stone-700">All calls attended</div>
                <div>No pending assistance requests</div>
              </div>
            ) : (
              activePings.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-white border border-rose-300 rounded-2xl shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          {p.tableNumber} • SEAT {(p as any).seatNumber || 1}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-stone-700 uppercase bg-[#FAF8F5] px-2 py-0.5 rounded">
                          {p.type}
                        </span>
                      </div>
                      {p.message && (
                        <p className="text-xs font-sans text-stone-600 italic leading-relaxed">
                          "{p.message}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleResolvePing(p.id)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-xl shadow-xs transition shrink-0"
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
              <div className="text-center py-20 text-stone-400 font-mono text-xs space-y-2">
                <Clock className="h-9 w-9 mx-auto text-blue-500 opacity-50" />
                <div className="font-bold text-stone-700">Pass is clear</div>
                <div>No plated dishes waiting at the counter</div>
              </div>
            ) : (
              readyTickets.map((tk) => (
                <div
                  key={tk.id}
                  className="p-4 bg-white border border-blue-200 rounded-2xl shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-black text-blue-900">
                      {tk.tableNumber} • KOT #{tk.id.slice(-4)}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      READY TO PASS
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {tk.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between font-mono text-xs text-stone-800">
                        <span><strong>{it.quantity}x</strong> {it.name}</span>
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
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

      {/* Table Detail Bottom Sheet Drawer */}
      <AnimatePresence>
        {selectedTable && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTableNum(null)}
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-2xs z-40 max-w-md mx-auto"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50 bg-white rounded-t-3xl shadow-2xl border-t border-[#EAE5DF]"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1.5 w-12 bg-stone-300 rounded-full" />
              </div>

              <div className="px-5 pb-7 pt-2 space-y-4">
                {/* Table Identity Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[#EAE5DF]">
                  <div>
                    <div className="font-mono text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                      {selectedTable.section}
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                      {selectedTable.number}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getStatusBadge(selectedTable.status)}`}>
                        {selectedTable.status}
                      </span>
                      <span className="font-mono text-base font-black text-stone-900">
                        ₹{selectedTable.currentBill || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTableNum(null)}
                    className="p-2 bg-[#FAF8F5] hover:bg-stone-200 rounded-xl transition"
                  >
                    <X className="h-4 w-4 text-stone-600" />
                  </button>
                </div>

                {/* Active KOTs */}
                {tableTickets.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider">
                      Active Orders ({tableTickets.length})
                    </div>
                    {tableTickets.map((tk) => (
                      <div key={tk.id} className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-[#9C3D1E]">KOT #{tk.id.slice(-4)}</span>
                          <span className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] font-bold">{tk.status}</span>
                        </div>
                        {tk.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between font-mono text-[11px] text-stone-700">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="text-[#9C3D1E] font-bold">{it.stage}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleCash(selectedTable.number, selectedTable.currentBill || 0)}
                      className="py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      <span>Record Cash</span>
                    </button>
                    <Link
                      href={`/?table=${selectedTable.number}&seat=1`}
                      target="_blank"
                      className="py-3 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Utensils className="h-4 w-4" />
                      <span>Open Order</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleVacate(selectedTable.number)}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Vacate {selectedTable.number}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
