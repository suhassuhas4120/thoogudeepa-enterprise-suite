'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { useWaiterStore } from '../../../store/useWaiterStore';
import {
  Bell, TrendingUp, Search, X, CheckCircle2, ChevronRight,
  LogOut, Users, UtensilsCrossed, CreditCard, ChefHat
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Tablet components
import { TabletLoginPage } from '../../../components/waiter-tablet/TabletLoginPage';
import { TabletFloorMap, SECTIONS } from '../../../components/waiter-tablet/TabletFloorMap';
import { TabletTableDetail } from '../../../components/waiter-tablet/TabletTableDetail';
import { TabletPaymentPanel } from '../../../components/waiter-tablet/TabletPaymentPanel';
import { Screen2Menu } from '../../../components/customer/Screen2Menu';
import { TabletNotifDrawer } from '../../../components/waiter-tablet/TabletNotifDrawer';
import { TabletSplitModal } from '../../../components/waiter-tablet/TabletSplitModal';
import { TabletMergeModal } from '../../../components/waiter-tablet/TabletMergeModal';
import { TabletShiftModal } from '../../../components/waiter-tablet/TabletShiftModal';

// ── Tablet frame dimensions (iPad Pro 11" / Air Landscape resolution) ──────────
const TAB_W = 1194;
const TAB_H = 834;

// ── View state machine ─────────────────────────────────────────────────────
type AppView =
  | 'login'
  | 'floor'           // Left: floor grid   | Right: floor summary
  | 'table-detail';   // Left: table detail | Right: menu or payment panel

type RightPanelTab = 'menu' | 'payment';

// ── Seat guests mini-modal ─────────────────────────────────────────────────
function SeatGuestsModal({
  tableNum,
  onClose,
  onSeated,
}: {
  tableNum: string;
  onClose: () => void;
  onSeated: (n: number) => void;
}) {
  const { tables } = useSharedBridge();
  const table = tables.find((t) => t.number === tableNum);
  const [count, setCount] = useState(1);
  return (
    <div className="absolute inset-0 bg-stone-950/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-80 space-y-4"
      >
        <div className="text-center">
          <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9C3D1E]">
            Table Seating
          </p>
          <h3 className="font-black text-stone-900 text-lg mt-0.5">Seat Guests — {tableNum}</h3>
          <p className="font-mono text-xs text-stone-500 mt-1">
            Table Capacity: {table?.capacity || 4} Guests · {table?.section}
          </p>
        </div>

        <div className="flex items-center justify-center gap-6 py-2">
          <button
            type="button"
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="h-12 w-12 rounded-2xl bg-stone-100 hover:bg-stone-200 font-black text-2xl flex items-center justify-center cursor-pointer transition text-stone-700"
          >
            −
          </button>
          <div className="text-center">
            <span className="font-black text-4xl text-stone-900 font-mono">{count}</span>
            <p className="font-mono text-[9.5px] text-stone-400 font-bold uppercase mt-0.5">
              {count === 1 ? 'Guest' : 'Guests'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCount((c) => Math.min(table?.capacity || 8, c + 1))}
            className="h-12 w-12 rounded-2xl bg-stone-100 hover:bg-stone-200 font-black text-2xl flex items-center justify-center cursor-pointer transition text-stone-700"
          >
            +
          </button>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-stone-200 font-mono font-bold text-xs text-stone-600 cursor-pointer hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSeated(count)}
            className="flex-1 py-3 rounded-2xl bg-[#9C3D1E] hover:bg-[#7d3018] text-white font-mono font-black text-xs cursor-pointer transition shadow-xs"
          >
            Seat {count} Guests
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function WaiterTabletPage() {
  const { tables, pings, kdsTickets, shiftStats, waiterSeatsGuests } = useSharedBridge();
  const { activeCaptain, setActiveCaptain } = useWaiterStore();

  // ── App state ──────────────────────────────────────────────────────────
  const [view, setView] = useState<AppView>('login');
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('menu');
  const [selectedTableNum, setSelectedTableNum] = useState<string>(tables[0]?.number ?? 'T-01');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedChair, setSelectedChair] = useState<'ALL' | number | string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'calls' | 'kitchen'>('calls');
  const [splitOpen, setSplitOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [seatOpen, setSeatOpen] = useState(false);
  const [confirmVacate, setConfirmVacate] = useState(false);
  const [splitInfo, setSplitInfo] = useState<{ amount: number; label: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const openCallsDrawer = () => {
    setNotifTab('calls');
    setNotifOpen(true);
  };

  const openKitchenDrawer = () => {
    setNotifTab('kitchen');
    setNotifOpen(true);
  };

  // Scale-to-fit with tablet margin
  const [scale, setScale] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const recalc = () => {
      const paddingX = window.innerWidth > 1200 ? 32 : 0;
      const paddingY = window.innerWidth > 1200 ? 32 : 0;
      const availableW = window.innerWidth - paddingX;
      const availableH = window.innerHeight - paddingY;
      const s = Math.min(availableW / TAB_W, availableH / TAB_H, 1);
      setScale(Number(s.toFixed(4)));
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');
  const shiftRevenue = shiftStats?.totalRevenue || 0;

  // Chime + auto-open notif drawer on new ping strictly on calls tab
  const prevPingRef = useRef(activePings.length);
  useEffect(() => {
    if (activePings.length > prevPingRef.current) {
      setNotifTab('calls');
      setNotifOpen(true);
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          [0, 0.18].forEach((off) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(880, ctx.currentTime + off);
            g.gain.setValueAtTime(0.18, ctx.currentTime + off);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + off + 0.28);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(ctx.currentTime + off);
            o.stop(ctx.currentTime + off + 0.28);
          });
        }
      } catch {}
    }
    prevPingRef.current = activePings.length;
  }, [activePings.length]);

  // Right-edge swipe to open notif drawer (opens calls if calls exist, else kitchen)
  const touchStartX = useRef(0);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const dx = touchStartX.current - endX;
    const frameRect = frameRef.current?.getBoundingClientRect();
    const frameRight = frameRect?.right ?? window.innerWidth;
    const frameLeft = frameRect?.left ?? 0;

    // Swipe left from right edge (within 60px of frame right) -> open notif drawer
    if (touchStartX.current > frameRight - 60 && dx > 40) {
      setNotifTab(activePings.length > 0 ? 'calls' : 'kitchen');
      setNotifOpen(true);
    }
    // Swipe right from left edge (within 60px of frame left) -> back to floor map
    else if (touchStartX.current < frameLeft + 60 && dx < -40 && view === 'table-detail') {
      setView('floor');
      setConfirmVacate(false);
    }
  }, [activePings.length, view]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Navigation helpers ─────────────────────────────────────────────────
  const selectTable = (num: string) => {
    setSelectedTableNum(num);
    setSelectedChair('ALL');
    setConfirmVacate(false);
    setSplitInfo(null);

    const targetTable = tables.find((t) => t.number === num);
    if (!targetTable || targetTable.status === 'VACANT') {
      // 2. When empty table clicked: right side should be menu page by default!
      setRightPanelTab('menu');
    } else {
      // 5. When non-vacant table clicked: right side should be payment page by default!
      setRightPanelTab('payment');
    }
    setView('table-detail');
  };

  const handleLogin = (captainName: string, section?: string) => {
    setActiveCaptain(captainName);
    if (section && section !== 'ALL') {
      setSelectedSection(section);
    } else {
      setSelectedSection('ALL');
    }
    setView('floor');
    showToast(`Welcome ${captainName}! Shift active on ${section || 'All Sections'}`);
  };

  const handleVacate = () => {
    if (!confirmVacate) {
      setConfirmVacate(true);
      return;
    }
    useSharedBridge.getState().waiterVacatesTable(selectedTableNum);
    setConfirmVacate(false);
    setView('floor');
    showToast(`Table ${selectedTableNum} cleared and vacated`);
  };

  const handleSeatGuests = (count: number) => {
    waiterSeatsGuests(selectedTableNum, count, activeCaptain || 'Floor Captain');
    setSeatOpen(false);
    showToast(`${count} guests seated at ${selectedTableNum}`);
    // Keep on menu so waiter can immediately punch dishes
    setRightPanelTab('menu');
  };

  const stats = {
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    vacant: tables.filter((t) => t.status === 'VACANT').length,
    billing: tables.filter((t) => t.status === 'BILLING').length,
  };

  const currentTable = tables.find((t) => t.number === selectedTableNum);

  return (
    <div className="w-screen h-screen bg-[#18181B] flex flex-col items-center justify-center overflow-hidden select-none relative">
      {/* Tablet resolution indicator for desktop viewers */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 font-mono text-[10.5px] font-black text-stone-400 bg-stone-900/90 px-3.5 py-1 rounded-full border border-stone-800 shadow-md hidden lg:flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Tablet Viewport · iPad Pro 11&quot; Landscape (1194 × 834)</span>
      </div>

      {/* Tablet device frame with authentic tablet chassis */}
      <div
        ref={frameRef}
        style={{
          width: TAB_W,
          height: TAB_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 0 0 10px #27272A, 0 0 0 12px #3F3F46, 0 25px 65px -12px rgba(0, 0, 0, 0.75)',
          background: '#FAF8F5',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          position: 'relative',
          willChange: 'transform',
          WebkitFontSmoothing: 'antialiased',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* ── LOGIN VIEW ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50"
            >
              <TabletLoginPage onLogin={handleLogin} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN COCKPIT (shown for all non-login views) ──────────────── */}
        {view !== 'login' && (
          <>
            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#1C1917] text-white font-mono text-xs font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border-2 border-stone-700"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 stroke-[2.4]" />
                  <span>{toast}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── TOP NAVIGATION BAR - High Quality & Crisp ──────────── */}
            <header className="h-[56px] border-b-2 border-stone-200 bg-white px-5 flex items-center justify-between shrink-0 z-10 shadow-2xs">
              {/* Brand / Captain Identity */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-[#9C3D1E] flex items-center justify-center text-white font-black text-base shrink-0 shadow-xs border border-amber-400/40">
                  {(activeCaptain || 'F')[0]}
                </div>
                <div>
                  <p className="font-mono text-[9px] font-black uppercase tracking-widest text-[#9C3D1E] leading-none">
                    Floor Captain
                  </p>
                  <p className="text-sm font-black text-stone-950 leading-tight mt-0.5 font-mono">
                    {activeCaptain || 'Captain'}
                    <span className="font-mono font-bold text-stone-500 text-[10px] ml-2">
                      · {selectedSection === 'ALL' ? 'All Sections' : selectedSection}
                    </span>
                  </p>
                </div>
              </div>

              {/* Center switcher / search */}
              {view === 'floor' ? (
                <div className="relative w-64">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 stroke-[2.4]" />
                  <input
                    type="text"
                    placeholder="Search table number or section…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 border-2 border-stone-300 focus:border-[#9C3D1E] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none transition shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* In Table Detail view: Quick toggle between Menu and Payment tabs */
                <div className="flex items-center bg-stone-100 p-1 rounded-2xl border-2 border-stone-200 font-mono text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('menu')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition cursor-pointer ${
                      rightPanelTab === 'menu'
                        ? 'bg-[#9C3D1E] text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    <UtensilsCrossed className="h-4 w-4 stroke-[2.4]" />
                    <span>Customer Menu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('payment')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition cursor-pointer ${
                      rightPanelTab === 'payment'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 stroke-[2.4]" />
                    <span>Settle Bill / Payment</span>
                  </button>
                </div>
              )}

              {/* Right controls */}
              <div className="flex items-center gap-2.5">
                {/* Floor stats chips */}
                <div className="flex items-center gap-3 font-mono text-xs font-black bg-stone-50 px-3.5 py-2 rounded-xl border-2 border-stone-200 shadow-2xs">
                  <span className="flex items-center gap-1.5 text-amber-800" title="Occupied Dining">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>{stats.occupied}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-800" title="Vacant Ready">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>{stats.vacant}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-800" title="Billing Check">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                    <span>{stats.billing}</span>
                  </span>
                </div>

                {/* Shift revenue */}
                <button
                  type="button"
                  onClick={() => setShiftOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-xs font-black transition cursor-pointer shadow-xs border border-stone-700"
                >
                  <TrendingUp className="h-4 w-4 text-emerald-400 stroke-[2.4]" />
                  <span>₹{shiftRevenue > 0 ? shiftRevenue.toLocaleString() : '0'}</span>
                </button>

                {/* Separate Button 1: Customer Calls & Resolve */}
                <button
                  type="button"
                  onClick={openCallsDrawer}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-mono text-xs font-black transition cursor-pointer ${
                    activePings.length > 0
                      ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                      : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Resolve Customer Calls"
                >
                  <Bell className="h-4 w-4 stroke-[2.4]" />
                  <span>Calls</span>
                  {activePings.length > 0 && (
                    <span className="h-5 px-1.5 flex items-center justify-center bg-rose-600 text-white text-[10px] font-black rounded-full animate-pulse border border-white">
                      {activePings.length}
                    </span>
                  )}
                </button>

                {/* Separate Button 2: Kitchen Pickup Ready Pass */}
                <button
                  type="button"
                  onClick={openKitchenDrawer}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-mono text-xs font-black transition cursor-pointer ${
                    readyTickets.length > 0
                      ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                      : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Kitchen Pickup Ready"
                >
                  <ChefHat className="h-4 w-4 stroke-[2.4]" />
                  <span>Pickup</span>
                  {readyTickets.length > 0 && (
                    <span className="h-5 px-1.5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-black rounded-full animate-pulse border border-white">
                      {readyTickets.length}
                    </span>
                  )}
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCaptain('');
                    setView('login');
                  }}
                  className="p-2 hover:bg-stone-100 rounded-xl transition cursor-pointer text-stone-600 hover:text-stone-900 border border-stone-200"
                  title="End Shift"
                >
                  <LogOut className="h-4 w-4 stroke-[2.4]" />
                </button>
              </div>
            </header>

            {/* ── CONTENT AREA ────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">
              {/* ════════════════════════════════════════════════════════
                  FLOOR VIEW (Left: grid | Right: floor summary)
              ════════════════════════════════════════════════════════ */}
              {view === 'floor' && (
                <>
                  {/* Left: Floor grid with section pills */}
                  <div className="w-[62%] border-r-2 border-stone-200 flex flex-col overflow-hidden bg-[#FAF8F5]">
                    <div className="px-4 py-2.5 border-b-2 border-stone-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0 shadow-2xs">
                      {SECTIONS.map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSelectedSection(sec)}
                          className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black whitespace-nowrap border-2 transition cursor-pointer ${
                            selectedSection === sec
                              ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {sec === 'ALL' ? `All Tables (${tables.length})` : sec}
                        </button>
                      ))}
                    </div>
                    <TabletFloorMap
                      selectedTableNum={selectedTableNum}
                      selectedSection={selectedSection}
                      searchQuery={searchQuery}
                      onSelectTable={selectTable}
                      onSelectTableToPayment={(num) => {
                        setSelectedTableNum(num);
                        setSelectedChair('ALL');
                        setSplitInfo(null);
                        setRightPanelTab('payment');
                        setView('table-detail');
                      }}
                      onOpenMerge={(num) => {
                        setSelectedTableNum(num);
                        setMergeOpen(true);
                      }}
                    />
                  </div>

                  {/* Right: Floor summary */}
                  <div className="w-[38%] bg-white flex flex-col overflow-y-auto p-6 gap-4 font-sans">
                    <div>
                      <p className="font-mono text-xs font-black uppercase tracking-widest text-[#9C3D1E]">
                        Floor Overview
                      </p>
                      <h2 className="text-xl font-black text-stone-950 mt-1">
                        Select a table to begin
                      </h2>
                    </div>

                    {/* Status cards - Ultra Sharp */}
                    <div className="grid grid-cols-2 gap-3 font-mono">
                      {[
                        {
                          label: 'Dining',
                          count: stats.occupied,
                          color: 'bg-amber-50 border-amber-300 text-amber-950',
                          dot: 'bg-amber-500',
                        },
                        {
                          label: 'Vacant',
                          count: stats.vacant,
                          color: 'bg-emerald-50 border-emerald-300 text-emerald-950',
                          dot: 'bg-emerald-500',
                        },
                        {
                          label: 'Billing',
                          count: stats.billing,
                          color: 'bg-purple-50 border-purple-300 text-purple-950',
                          dot: 'bg-purple-600',
                        },
                        {
                          label: 'Ready Pass',
                          count: readyTickets.length,
                          color: 'bg-blue-50 border-blue-300 text-blue-950',
                          dot: 'bg-blue-600',
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className={`p-4 rounded-2xl border-2 ${s.color} flex flex-col gap-1 shadow-2xs`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                            <span className="text-xs font-black uppercase tracking-wider">
                              {s.label}
                            </span>
                          </div>
                          <span className="text-3xl font-black mt-1">{s.count}</span>
                          <span className="text-xs font-bold opacity-80">tables</span>
                        </div>
                      ))}
                    </div>

                    {/* Pending calls teaser */}
                    {activePings.length > 0 && (
                      <button
                        type="button"
                        onClick={openCallsDrawer}
                        className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-rose-300 bg-rose-50 text-left transition cursor-pointer hover:bg-rose-100 shadow-2xs"
                      >
                        <Bell className="h-6 w-6 text-rose-600 shrink-0 stroke-[2.4]" />
                        <div className="flex-1">
                          <p className="font-black text-sm text-rose-950">
                            {activePings.length} guest call(s) pending
                          </p>
                          <p className="font-mono text-xs text-rose-700 font-bold">
                            Tap to view and attend
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-rose-500 stroke-[3]" />
                      </button>
                    )}

                    {/* Ready food teaser */}
                    {readyTickets.length > 0 && (
                      <button
                        type="button"
                        onClick={openKitchenDrawer}
                        className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-blue-300 bg-blue-50 text-left transition cursor-pointer hover:bg-blue-100 shadow-2xs"
                      >
                        <span className="text-2xl">🍽</span>
                        <div className="flex-1">
                          <p className="font-black text-sm text-blue-950">
                            {readyTickets.length} dish(es) ready at pass
                          </p>
                          <p className="font-mono text-xs text-blue-700 font-bold">
                            Dispatch to tables now
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-blue-500 stroke-[3]" />
                      </button>
                    )}

                    {/* Swipe hint */}
                    <div className="mt-auto p-3.5 bg-stone-50 border-2 border-stone-200 rounded-2xl text-center font-mono text-xs text-stone-600 font-bold">
                      ← Swipe right edge to open calls &amp; dispatch
                    </div>
                  </div>
                </>
              )}



              {/* ════════════════════════════════════════════════════════
                  TABLE DETAIL (Left: Table Detail | Right: Customer Menu or Settle)
              ════════════════════════════════════════════════════════ */}
              {view === 'table-detail' && (
                <>
                  {/* Left (52%): Table detail panel */}
                  <div className="w-[52%] border-r border-[#EAE5DF] flex flex-col overflow-hidden">
                    <TabletTableDetail
                      tableNum={selectedTableNum}
                      selectedChair={selectedChair}
                      onSelectChair={setSelectedChair}
                      onBackToFloor={() => {
                        setView('floor');
                        setConfirmVacate(false);
                      }}
                      onAddDishes={() => setRightPanelTab('menu')}
                      onSettle={() => {
                        setSplitInfo(null);
                        setRightPanelTab('payment');
                      }}
                      onSeatGuests={() => {
                        if (selectedChair !== 'ALL') {
                          waiterSeatsGuests(selectedTableNum, 1, activeCaptain || 'Floor Captain');
                          showToast(`Chair ${selectedChair} seated at ${selectedTableNum}`);
                          setRightPanelTab('menu');
                        } else {
                          setSeatOpen(true);
                        }
                      }}
                      onSplit={() => setSplitOpen(true)}
                      onMerge={() => setMergeOpen(true)}
                      onVacate={handleVacate}
                      activePanelTab={rightPanelTab}
                    />
                  </div>

                  {/* Right (48%): Menu or Payment panel */}
                  <div className="w-[48%] flex flex-col overflow-hidden relative bg-white">
                    <AnimatePresence mode="wait">
                      {rightPanelTab === 'menu' && (
                        <motion.div
                          key="customer-menu"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-0"
                        >
                          <Screen2Menu
                            isWaiterMode={true}
                            tabletMode={true}
                            tableNum={selectedTableNum}
                            seatNum={typeof selectedChair === 'number' ? selectedChair : undefined}
                            waiterName={activeCaptain || 'Floor Captain'}
                            onBack={() => setView('floor')}
                            onKOTFired={() => {
                              showToast(`KOT fired for ${selectedTableNum}!`);
                              setRightPanelTab('payment');
                            }}
                            onSwitchToPayment={() => setRightPanelTab('payment')}
                          />
                        </motion.div>
                      )}

                      {rightPanelTab === 'payment' && (
                        <motion.div
                          key="payment-settlement"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.15 }}
                          className="absolute inset-0"
                        >
                          <TabletPaymentPanel
                            tableNum={selectedTableNum}
                            selectedChair={selectedChair}
                            onSwitchToMenu={() => setRightPanelTab('menu')}
                            onDone={() => {
                              showToast(`Settlement completed for ${selectedTableNum}`);
                              setView('floor');
                            }}
                            onOpenSplit={() => setSplitOpen(true)}
                            splitAmount={splitInfo?.amount}
                            splitLabel={splitInfo?.label}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Vacate confirm overlay */}
                    {confirmVacate && (
                      <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center z-50">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white rounded-3xl shadow-2xl p-6 w-72 space-y-4 text-center font-mono"
                        >
                          <p className="font-black text-stone-900 text-base">
                            Vacate {selectedTableNum}?
                          </p>
                          <p className="text-xs text-stone-500">
                            This clears active orders and resets the table status to vacant.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmVacate(false)}
                              className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-xs text-stone-600 cursor-pointer hover:bg-stone-50 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleVacate}
                              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer transition shadow-xs"
                            >
                              Vacate
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── Modals / Drawers ───────────────────────────────────── */}
            {/* Live Notifications Drawer (Calls & Ready Dispatch strictly separated) */}
            <TabletNotifDrawer
              open={notifOpen}
              activeTab={notifTab}
              onTabChange={setNotifTab}
              onClose={() => setNotifOpen(false)}
              onFocusTable={(num) => {
                selectTable(num);
              }}
            />

            {/* Seat Guests Mini-Modal */}
            {seatOpen && (
              <SeatGuestsModal
                tableNum={selectedTableNum}
                onClose={() => setSeatOpen(false)}
                onSeated={handleSeatGuests}
              />
            )}

            {/* Split Bill Modal */}
            <TabletSplitModal
              tableNum={selectedTableNum}
              open={splitOpen}
              onClose={() => setSplitOpen(false)}
              onSelectSplit={(amount, label) => {
                setSplitInfo({ amount, label });
                setRightPanelTab('payment');
              }}
            />

            {/* Merge / Unmerge Modal */}
            <TabletMergeModal
              tableNum={selectedTableNum}
              open={mergeOpen}
              onClose={() => setMergeOpen(false)}
              onMergedSuccess={(msg) => showToast(msg)}
            />

            {/* Shift Metrics Modal */}
            <TabletShiftModal
              open={shiftOpen}
              onClose={() => setShiftOpen(false)}
              captainName={activeCaptain || 'Floor Captain'}
            />
          </>
        )}
      </div>
    </div>
  );
}
