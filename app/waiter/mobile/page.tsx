'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { Smartphone, Bell, UtensilsCrossed, Utensils, Flame, Briefcase, LogOut, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { ScreenM1StaffLogin } from '../../../components/waiter-mobile/ScreenM1StaffLogin';
import { ScreenM2FloorGrid } from '../../../components/waiter-mobile/ScreenM2FloorGrid';
import { ScreenM3TableSheet } from '../../../components/waiter-mobile/ScreenM3TableSheet';
import { ScreenM4OrderPad } from '../../../components/waiter-mobile/ScreenM4OrderPad';
import { ScreenM5Dispatch } from '../../../components/waiter-mobile/ScreenM5Dispatch';
import { ScreenM6Settlement } from '../../../components/waiter-mobile/ScreenM6Settlement';

type MainTab = 'TABLES' | 'CALLS' | 'READY';
type ActiveView =
  | { type: 'FLOOR' }
  | { type: 'SHEET'; tableNum: string }
  | { type: 'ORDER'; tableNum: string }
  | { type: 'SETTLE'; tableNum: string };

export default function WaiterMobilePage() {
  const { pings, kdsTickets } = useSharedBridge();

  const [loggedIn, setLoggedIn] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [mainTab, setMainTab] = useState<MainTab>('TABLES');
  const [view, setView] = useState<ActiveView>({ type: 'FLOOR' });
  const [toast, setToast] = useState<string | null>(null);

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogin = (name: string) => {
    setWaiterName(name);
    setLoggedIn(true);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return <ScreenM1StaffLogin onLogin={handleLogin} />;
  }

  // ── ORDER PAD (full screen takeover) ─────────────────────────────────────
  if (view.type === 'ORDER') {
    return (
      <ScreenM4OrderPad
        tableNum={view.tableNum}
        waiterName={waiterName}
        onBack={() => setView({ type: 'SHEET', tableNum: view.tableNum })}
        onKOTFired={() => {
          showToast('KOT sent to kitchen');
          setView({ type: 'FLOOR' });
          setMainTab('TABLES');
        }}
      />
    );
  }

  // ── SETTLE BILL (full screen takeover) ────────────────────────────────────
  if (view.type === 'SETTLE') {
    return (
      <ScreenM6Settlement
        tableNum={view.tableNum}
        onBack={() => setView({ type: 'SHEET', tableNum: view.tableNum })}
        onDone={() => {
          showToast('Payment recorded');
          setView({ type: 'FLOOR' });
          setMainTab('TABLES');
        }}
      />
    );
  }

  // ── Main tabbed shell ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white font-mono text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#9C3D1E] flex items-center justify-center text-white shadow-xs">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-wider text-[#9C3D1E]">
              {waiterName}
            </p>
            <h1 className="text-xs font-black tracking-tight text-stone-900 uppercase">
              Thoogudeepa Donne Biryani
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
          <Link
            href="/kitchen"
            className="px-2 py-1 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-md text-stone-600 transition"
          >
            KDS
          </Link>
          <Link
            href="/waiter/tablet"
            className="px-2 py-1 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-md text-stone-600 transition"
          >
            Tablet
          </Link>
          <Link
            href="/manager"
            className="px-2 py-1 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-md text-stone-600 transition"
          >
            Mgr
          </Link>
          <button
            onClick={() => { setLoggedIn(false); setWaiterName(''); setView({ type: 'FLOOR' }); }}
            className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md text-rose-700 transition"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Tab navigation: 3 Clean Dedicated Tabs */}
      <nav className="bg-white border-b border-[#EAE5DF] grid grid-cols-3 text-center font-mono text-xs font-black sticky top-[53px] z-30 shadow-2xs">
        <button
          type="button"
          onClick={() => { setMainTab('TABLES'); setView({ type: 'FLOOR' }); }}
          className={`py-3 border-b-2 transition flex items-center justify-center gap-1.5 ${
            mainTab === 'TABLES'
              ? 'border-[#9C3D1E] text-[#9C3D1E] bg-[#FFF8F5]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>TABLES</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('CALLS')}
          className={`py-3 border-b-2 transition flex items-center justify-center gap-1.5 relative ${
            mainTab === 'CALLS'
              ? 'border-orange-600 text-orange-700 bg-orange-50/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>CALLS</span>
          {activePings.length > 0 && (
            <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {activePings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('READY')}
          className={`py-3 border-b-2 transition flex items-center justify-center gap-1.5 relative ${
            mainTab === 'READY'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          <span>READY</span>
          {readyTickets.length > 0 && (
            <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full">
              {readyTickets.length}
            </span>
          )}
        </button>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {mainTab === 'TABLES' && (
          <ScreenM2FloorGrid
            waiterName={waiterName}
            onSelectTable={(num) => setView({ type: 'SHEET', tableNum: num })}
            onGoToPings={() => setMainTab('CALLS')}
            onGoToReady={() => setMainTab('READY')}
          />
        )}

        {mainTab === 'CALLS' && (
          <ScreenM5Dispatch
            initialTab="CALLS"
            onNavigateToTable={(num) => setView({ type: 'SHEET', tableNum: num })}
          />
        )}

        {mainTab === 'READY' && (
          <ScreenM5Dispatch
            initialTab="READY"
            onNavigateToTable={(num) => setView({ type: 'SHEET', tableNum: num })}
          />
        )}
      </div>

      {/* Table detail sheet (overlay, rendered above main content) */}
      {view.type === 'SHEET' && (
        <ScreenM3TableSheet
          tableNum={view.tableNum}
          onClose={() => setView({ type: 'FLOOR' })}
          onGoToOrder={() => setView({ type: 'ORDER', tableNum: view.tableNum })}
          onGoToSettle={() => setView({ type: 'SETTLE', tableNum: view.tableNum })}
          onVacated={() => {
            showToast(`${view.tableNum} reset for new guests`);
            setView({ type: 'FLOOR' });
          }}
        />
      )}
    </main>
  );
}
