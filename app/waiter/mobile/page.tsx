'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { useWaiterStore } from '../../../store/useWaiterStore';
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
  | { type: 'SHEET'; tableNum: string; initialSeat?: 'ALL' | number }
  | { type: 'ORDER'; tableNum: string; seatNum?: number }
  | { type: 'SETTLE'; tableNum: string; splitAmount?: number; splitLabel?: string };

export default function WaiterMobilePage() {
  const { pings, kdsTickets } = useSharedBridge();

  const [loggedIn, setLoggedIn] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [mainTab, setMainTab] = useState<MainTab>('TABLES');
  const [view, setView] = useState<ActiveView>({ type: 'FLOOR' });
  const [toast, setToast] = useState<string | null>(null);

  // Synchronize SPA navigation with native browser/device history & gesture navigation
  const navigateView = (nextView: ActiveView, replace = false) => {
    setView(nextView);
    if (typeof window !== 'undefined') {
      try {
        if (replace) {
          window.history.replaceState({ view: nextView }, '');
        } else {
          window.history.pushState({ view: nextView }, '');
        }
      } catch {}
    }
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.state?.view && window.history.state.view.type !== 'FLOOR') {
      window.history.back();
    } else {
      if (view.type === 'ORDER') {
        navigateView({ type: 'SHEET', tableNum: view.tableNum, initialSeat: view.seatNum });
      } else if (view.type === 'SETTLE') {
        navigateView({ type: 'SHEET', tableNum: view.tableNum });
      } else {
        navigateView({ type: 'FLOOR' });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.history.state?.view) {
        window.history.replaceState({ view: { type: 'FLOOR' } }, '');
      }

      const handlePopState = (e: PopStateEvent) => {
        if (e.state && e.state.view) {
          setView(e.state.view);
        } else {
          setView({ type: 'FLOOR' });
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  // Audio chime on new ping — reuse AudioContext singleton
  const prevPingCountRef = useRef(activePings.length);
  const audioCtxRef = useRef<any>(null);

  useEffect(() => {
    if (activePings.length > prevPingCountRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new AudioCtx();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
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

  const [assignedSection, setAssignedSection] = useState('ALL');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogin = (name: string, section?: string) => {
    setWaiterName(name);
    if (section) setAssignedSection(section);
    try {
      useWaiterStore.getState().setActiveCaptain(name);
    } catch {}
    setLoggedIn(true);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return <ScreenM1StaffLogin onLogin={handleLogin} />;
  }

  // ── TABLE DETAILS (Screen 3 - Full Screen Takeover with Edge-Swipe Back) ───
  if (view.type === 'SHEET') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 15 }}
        // NO drag prop — manual left-edge-only swipe back so horizontal
        // scroll areas (chair rail, carousels) are never blocked.
        onPointerDown={(e) => {
          // Only track swipes that START within the left 40 px edge
          if (e.clientX > 40) return;
          const startX = e.clientX;
          const startY = e.clientY;
          const pid = e.pointerId;

          const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pid) return;
            const dx = ev.clientX - startX;
            const dy = Math.abs(ev.clientY - startY);
            // Require clearly horizontal swipe (dx > dy) and 70+ px travel
            if (dx > 70 && dx > dy * 1.5) {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
              goBack();
            }
          };
          const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pid) return;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
        className="flex-1 flex flex-col h-screen h-[100dvh] max-h-screen bg-[#FAF8F5] touch-pan-y overflow-hidden"
      >
        <ScreenM3TableSheet
          tableNum={view.tableNum}
          initialSeat={view.initialSeat}
          onClose={goBack}
          onGoToOrder={(seatNum) => navigateView({ type: 'ORDER', tableNum: view.tableNum, seatNum })}
          onGoToSettle={(amt, lbl) => navigateView({ type: 'SETTLE', tableNum: view.tableNum, splitAmount: amt, splitLabel: lbl })}
          onGoToPings={() => {
            setMainTab('CALLS');
            navigateView({ type: 'FLOOR' });
          }}
          onVacated={() => {
            showToast(`${view.tableNum} reset for new guests`);
            navigateView({ type: 'FLOOR' });
          }}
        />
      </motion.div>
    );
  }

  // ── ORDER PAD (full screen takeover with Edge-Swipe Back) ──────────────────
  if (view.type === 'ORDER') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 15 }}
        onPointerDown={(e) => {
          if (e.clientX > 40) return;
          const startX = e.clientX;
          const startY = e.clientY;
          const pid = e.pointerId;
          const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pid) return;
            const dx = ev.clientX - startX;
            const dy = Math.abs(ev.clientY - startY);
            if (dx > 70 && dx > dy * 1.5) {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
              goBack();
            }
          };
          const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pid) return;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
        className="flex-1 flex flex-col h-screen h-[100dvh] max-h-screen bg-[#FAF8F5] touch-pan-y overflow-hidden"
      >
        <ScreenM4OrderPad
          tableNum={view.tableNum}
          seatNum={view.seatNum}
          waiterName={waiterName}
          onBack={goBack}
          onKOTFired={() => {
            showToast('✓ KOT fired to kitchen');
            goBack();
          }}
        />
      </motion.div>
    );
  }

  // ── SETTLE BILL (full screen takeover with Edge-Swipe Back) ─────────────────
  if (view.type === 'SETTLE') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 15 }}
        onPointerDown={(e) => {
          if (e.clientX > 40) return;
          const startX = e.clientX;
          const startY = e.clientY;
          const pid = e.pointerId;
          const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pid) return;
            const dx = ev.clientX - startX;
            const dy = Math.abs(ev.clientY - startY);
            if (dx > 70 && dx > dy * 1.5) {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
              goBack();
            }
          };
          const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pid) return;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
        className="flex-1 flex flex-col min-h-screen bg-[#FAF8F5] touch-pan-y"
      >
        <ScreenM6Settlement
          tableNum={view.tableNum}
          splitAmount={view.splitAmount}
          splitLabel={view.splitLabel}
          waiterName={waiterName}
          onBack={goBack}
          onDone={() => {
            showToast('Payment recorded');
            navigateView({ type: 'FLOOR' });
            setMainTab('TABLES');
          }}
        />
      </motion.div>
    );
  }

  // ── Main tabbed shell ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans w-full relative select-none">

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

      {/* Sticky Top Header & Tab Navigation Stack */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
        {/* Header */}
        <header className="border-b border-[#EAE5DF] px-4 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#9C3D1E] flex items-center justify-center text-white shadow-xs">
              <Smartphone className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-wider text-[#9C3D1E]">
                {waiterName}
              </p>
              <h1 className="text-sm font-black tracking-tight text-stone-900 uppercase">
                Thoogudeepa Donne Biryani
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
            <button
              onClick={() => { setLoggedIn(false); setWaiterName(''); setAssignedSection('ALL'); navigateView({ type: 'FLOOR' }, true); }}
              className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-700 transition flex items-center gap-1 active:scale-95 shadow-2xs"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Tab navigation: 3 Clean Dedicated Tabs */}
        <nav className="bg-white border-b border-[#EAE5DF] grid grid-cols-3 text-center font-mono text-[13px] font-black shadow-2xs">
          <button
            type="button"
            onClick={() => { setMainTab('TABLES'); navigateView({ type: 'FLOOR' }, true); }}
            className={`py-3.5 border-b-2 transition flex items-center justify-center gap-2 ${
              mainTab === 'TABLES'
                ? 'border-[#9C3D1E] text-[#9C3D1E] bg-[#FFF8F5]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>TABLES</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('CALLS')}
            className={`py-3.5 border-b-2 transition flex items-center justify-center gap-2 relative ${
              mainTab === 'CALLS'
                ? 'border-orange-600 text-orange-700 bg-orange-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>CALLS</span>
            {activePings.length > 0 && (
              <span className="text-[10.5px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {activePings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMainTab('READY')}
            className={`py-3.5 border-b-2 transition flex items-center justify-center gap-2 relative ${
              mainTab === 'READY'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>READY</span>
            {readyTickets.length > 0 && (
              <span className="text-[10.5px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full">
                {readyTickets.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0">
        {mainTab === 'TABLES' && (
          <ScreenM2FloorGrid
            waiterName={waiterName}
            assignedSection={assignedSection}
            onSelectTable={(num, chair) => navigateView({ type: 'SHEET', tableNum: num, initialSeat: chair })}
            onGoToPings={() => setMainTab('CALLS')}
            onGoToReady={() => setMainTab('READY')}
          />
        )}

        {mainTab === 'CALLS' && (
          <ScreenM5Dispatch
            mode="CALLS"
            onNavigateToTable={(num) => navigateView({ type: 'SHEET', tableNum: num, initialSeat: 'ALL' })}
            onSettleTable={(num, chair) =>
              navigateView({
                type: 'SETTLE',
                tableNum: num,
                splitLabel: chair ? `Chair ${chair}` : undefined,
              })
            }
          />
        )}

        {mainTab === 'READY' && (
          <ScreenM5Dispatch
            mode="READY"
            onNavigateToTable={(num) => navigateView({ type: 'SHEET', tableNum: num, initialSeat: 'ALL' })}
          />
        )}
      </div>
    </main>
  );
}
