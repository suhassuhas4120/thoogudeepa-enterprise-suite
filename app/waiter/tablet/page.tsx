'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { useWaiterStore } from '../../../store/useWaiterStore';
import {
  Tablet,
  Smartphone,
  Utensils,
  Flame,
  Bell,
  Briefcase,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { TabletFloorMap, SECTIONS } from '../../../components/waiter-tablet/TabletFloorMap';
import { TabletTableCockpit } from '../../../components/waiter-tablet/TabletTableCockpit';
import { TabletPingsDrawer } from '../../../components/waiter-tablet/TabletPingsDrawer';
import { TabletSettleModal } from '../../../components/waiter-tablet/TabletSettleModal';
import { ScreenM4OrderPad } from '../../../components/waiter-mobile/ScreenM4OrderPad';
import { ScreenT1CaptainLogin } from '../../../components/waiter-tablet/ScreenT1CaptainLogin';
import { User, LogOut } from 'lucide-react';

export default function WaiterTabletCockpitPage() {
  const { tables, pings, kdsTickets } = useSharedBridge();
  const { activeCaptain, setActiveCaptain, setActiveSection } = useWaiterStore();

  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedTableNum, setSelectedTableNum] = useState<string>(tables[0]?.number ?? 'T-01');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [pingsOpen, setPingsOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [confirmVacate, setConfirmVacate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleLogin = (name: string, section: string) => {
    setActiveCaptain(name);
    setActiveSection(section);
    setSelectedSection(section);
    setLoggedIn(true);
    showToast(`✓ Welcome Captain ${name}`);
  };

  const handleLogout = () => {
    setActiveCaptain('');
    setLoggedIn(false);
  };

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  const stats = {
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    vacant:   tables.filter((t) => t.status === 'VACANT').length,
    billing:  tables.filter((t) => t.status === 'BILLING').length,
  };

  // Auto-open pings drawer when a new ping arrives
  const prevPingCountRef = useRef(activePings.length);
  useEffect(() => {
    if (activePings.length > prevPingCountRef.current) {
      setPingsOpen(true);
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return <ScreenT1CaptainLogin onLogin={handleLogin} />;
  }

  // ── Full-screen order pad overlay ────────────────────────────────────────
  if (orderOpen) {
    return (
      <ScreenM4OrderPad
        tableNum={selectedTableNum}
        waiterName={activeCaptain || 'Floor Captain'}
        onBack={() => setOrderOpen(false)}
        onKOTFired={() => {
          setOrderOpen(false);
          showToast('KOT sent to kitchen');
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans select-none">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1917] text-white font-mono text-xs font-bold px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-stone-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-[60px] border-b border-[#EAE5DF] bg-white/95 px-6 flex items-center justify-between shrink-0 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#9C3D1E] flex items-center justify-center text-white shadow-sm shadow-[#9C3D1E]/20">
            <Tablet className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[9.5px] font-black uppercase tracking-widest text-[#9C3D1E]">
              Floor Captain Terminal
            </p>
            <h1 className="text-sm font-black tracking-tight text-stone-900 uppercase">
              Thoogudeepa Donne Biryani Mane
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition">
            <Utensils className="h-3.5 w-3.5 text-[#9C3D1E]" />
            Customer
          </Link>
          <Link href="/kitchen" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition">
            <Flame className="h-3.5 w-3.5 text-orange-600" />
            Kitchen KDS
          </Link>
          <Link href="/waiter/mobile" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition">
            <Smartphone className="h-3.5 w-3.5 text-blue-600" />
            Steward Mobile
          </Link>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#9C3D1E] text-white rounded-xl shadow-xs">
            <Tablet className="h-3.5 w-3.5" />
            Captain Cockpit
          </span>
          <Link href="/manager" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl text-stone-600 transition">
            <Briefcase className="h-3.5 w-3.5 text-slate-700" />
            Manager
          </Link>
          <Link href="/qr-deck" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold shadow-xs transition">
            <QrCode className="h-3.5 w-3.5" />
            QR Deck (34)
          </Link>

          {/* Assistance bell */}
          <button
            onClick={() => setPingsOpen((v) => !v)}
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

          {/* Active Captain profile badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-stone-800">
            <User className="h-3.5 w-3.5 text-[#9C3D1E]" />
            <span>Captain: <strong className="text-stone-900">{activeCaptain || 'Floor Captain'}</strong></span>
            <span className="text-amber-300">•</span>
            <span className="text-[10px] text-[#9C3D1E] font-black uppercase">{selectedSection}</span>
          </div>

          {/* Sign out button */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-700 transition cursor-pointer"
            title="Sign out of Captain Cockpit"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Floor overview strip */}
      <div className="bg-white border-b border-[#EAE5DF] px-6 py-2 flex items-center gap-6 shrink-0 text-xs font-mono font-bold">
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs" />
          {stats.occupied} Dining
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
          {stats.vacant} Vacant
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-xs" />
          {stats.billing} Billing
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs" />
          {readyTickets.length} Ready at Pass
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Realtime Active
        </div>
      </div>

      {/* Main 60/40 layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left 60% — floor map */}
        <div className="w-[60%] border-r border-[#EAE5DF] flex flex-col overflow-hidden bg-[#FAF8F5]">
          {/* Section filter pills */}
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

          <TabletFloorMap
            selectedTableNum={selectedTableNum}
            selectedSection={selectedSection}
            onSelectTable={(num) => {
              setSelectedTableNum(num);
              setConfirmVacate(false);
            }}
          />
        </div>

        {/* Right 40% — table cockpit */}
        <div className="w-[40%] bg-white flex flex-col overflow-hidden shadow-xs">
          <TabletTableCockpit
            selectedTableNum={selectedTableNum}
            confirmVacate={confirmVacate}
            onSetConfirmVacate={setConfirmVacate}
            onGoToOrder={() => setOrderOpen(true)}
            onGoToSettle={() => setSettleOpen(true)}
            onVacated={() => showToast(`${selectedTableNum} reset for new guests`)}
          />
        </div>
      </div>

      {/* Pings side drawer */}
      <TabletPingsDrawer
        open={pingsOpen}
        onClose={() => setPingsOpen(false)}
      />

      {/* Settle modal */}
      <TabletSettleModal
        tableNum={selectedTableNum}
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        onDone={() => {
          setSettleOpen(false);
          showToast('Payment recorded');
        }}
      />
    </main>
  );
}
