'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSharedBridge, cleanTableNum } from '../../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../../data/menuItems';
import { useWaiterStore } from '../../../store/useWaiterStore';
import { Smartphone, Bell, UtensilsCrossed, Utensils, Flame, Briefcase, LogOut, CheckCircle2, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { waiterLocalOutbox, QueuedAction } from '../../../lib/waiterOutbox';

import { ScreenM1StaffLogin } from '../../../components/waiter-mobile/ScreenM1StaffLogin';
import { ScreenM2FloorGrid } from '../../../components/waiter-mobile/ScreenM2FloorGrid';
import { ScreenM3TableSheet } from '../../../components/waiter-mobile/ScreenM3TableSheet';
import { ScreenM4OrderPad } from '../../../components/waiter-mobile/ScreenM4OrderPad';
import { ScreenM5Dispatch } from '../../../components/waiter-mobile/ScreenM5Dispatch';
import { ScreenM6Settlement } from '../../../components/waiter-mobile/ScreenM6Settlement';
import { MobileShiftModal } from '../../../components/waiter-mobile/MobileShiftModal';

type MainTab = 'TABLES' | 'CALLS' | 'READY';
type ActiveView =
  | { type: 'FLOOR' }
  | { type: 'SHEET'; tableNum: string; initialSeat?: 'ALL' | number }
  | { type: 'ORDER'; tableNum: string; seatNum?: number }
  | { type: 'SETTLE'; tableNum: string; splitAmount?: number; splitLabel?: string };

export default function WaiterMobilePage() {
  const { pings, kdsTickets, tables } = useSharedBridge();

  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [waiterName, setWaiterName] = useState('');
  const [assignedSection, setAssignedSection] = useState('ALL');
  const [mainTab, setMainTab] = useState<MainTab>('TABLES');
  const [view, setView] = useState<ActiveView>({ type: 'FLOOR' });

  // Restore session & persisted state on mount safely without SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('thoogudeepa_waiter_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.waiterName) {
          setLoggedIn(true);
          setWaiterName(parsed.waiterName);
          if (parsed.assignedSection) {
            setAssignedSection(parsed.assignedSection);
          }
          useWaiterStore.getState().setActiveCaptain(parsed.waiterName);
        }
      }
      const savedTab = sessionStorage.getItem('thoogudeepa_waiter_tab');
      if (savedTab === 'TABLES' || savedTab === 'CALLS' || savedTab === 'READY') {
        setMainTab(savedTab as MainTab);
      }
      const savedView = sessionStorage.getItem('thoogudeepa_waiter_view');
      let initialView: ActiveView = { type: 'FLOOR' };
      if (savedView) {
        const parsed = JSON.parse(savedView);
        if (parsed && typeof parsed === 'object' && parsed.type) {
          initialView = parsed as ActiveView;
          setView(initialView);
        }
      }
      if (typeof window !== 'undefined' && !window.history.state?.view) {
        window.history.replaceState({ view: initialView }, '');
      }
    } catch {}
    setMounted(true);
  }, []);

  const [toast, setToast] = useState<string | null>(null);
  const [outboxPendingCount, setOutboxPendingCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showShiftPerformance, setShowShiftPerformance] = useState(false);

  // Subscribe to persistent local outbox queue updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      const unsubscribe = waiterLocalOutbox.subscribe((queue: QueuedAction[]) => {
        setOutboxPendingCount(queue.length);
      });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        unsubscribe();
      };
    }
  }, []);

  // Synchronize SPA navigation with native browser/device history & gesture navigation
  const navigateView = (nextView: ActiveView, replace = false) => {
    setView(nextView);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('thoogudeepa_waiter_view', JSON.stringify(nextView));
        if (replace) {
          window.history.replaceState({ view: nextView }, '');
        } else {
          window.history.pushState({ view: nextView }, '');
        }
      } catch {}
    }
  };

  const changeMainTab = (tab: MainTab) => {
    setMainTab(tab);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('thoogudeepa_waiter_tab', tab);
      } catch {}
    }
  };

  const goBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.state?.view && window.history.state.view.type !== 'FLOOR') {
        window.history.back();
        return;
      }
    }
    if (view.type === 'ORDER') {
      navigateView({ type: 'SHEET', tableNum: view.tableNum, initialSeat: view.seatNum });
    } else if (view.type === 'SETTLE') {
      navigateView({ type: 'SHEET', tableNum: view.tableNum });
    } else {
      navigateView({ type: 'FLOOR' });
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Ensure history stack is populated without blowing away restored view
    if (!window.history.state?.view) {
      window.history.replaceState({ view }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setView(e.state.view);
        try {
          sessionStorage.setItem('thoogudeepa_waiter_view', JSON.stringify(e.state.view));
        } catch {}
      } else {
        setView({ type: 'FLOOR' });
        try {
          sessionStorage.setItem('thoogudeepa_waiter_view', JSON.stringify({ type: 'FLOOR' }));
        } catch {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mounted, view]);

  const activePings = pings.filter((p) => p.status === 'PENDING');
  const readyTickets = kdsTickets.filter((tk) => tk.status === 'READY');

  // Audio chime on new ping — reuse AudioContext singleton
  const chimedPingIdsRef = useRef<Set<string>>(new Set());
  const prevPingCountRef = useRef(activePings.length);
  const audioCtxRef = useRef<any>(null);

  useEffect(() => {
    const cleanT = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const unchimedPings = activePings.filter((p) => {
      const semanticKey = `${cleanT(p.tableNumber)}-S${p.seatNumber || 1}-${p.type}`;
      return !chimedPingIdsRef.current.has(p.id) && !chimedPingIdsRef.current.has(semanticKey);
    });

    if (unchimedPings.length > 0 && activePings.length > prevPingCountRef.current) {
      unchimedPings.forEach((p) => {
        chimedPingIdsRef.current.add(p.id);
        const semanticKey = `${cleanT(p.tableNumber)}-S${p.seatNumber || 1}-${p.type}`;
        chimedPingIdsRef.current.add(semanticKey);
      });
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
    } else {
      unchimedPings.forEach((p) => {
        chimedPingIdsRef.current.add(p.id);
        const semanticKey = `${cleanT(p.tableNumber)}-S${p.seatNumber || 1}-${p.type}`;
        chimedPingIdsRef.current.add(semanticKey);
      });
    }
    prevPingCountRef.current = activePings.length;
  }, [activePings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogin = (name: string, section?: string) => {
    const sec = section || 'ALL';
    setWaiterName(name);
    setAssignedSection(sec);
    try {
      sessionStorage.setItem('thoogudeepa_waiter_session', JSON.stringify({ waiterName: name, assignedSection: sec }));
      sessionStorage.setItem('thoogudeepa_waiter_view', JSON.stringify({ type: 'FLOOR' }));
      sessionStorage.setItem('thoogudeepa_waiter_tab', 'TABLES');
      useWaiterStore.getState().setActiveCaptain(name);
    } catch {}
    setLoggedIn(true);
    setMainTab('TABLES');
    setView({ type: 'FLOOR' });
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('thoogudeepa_waiter_session');
      sessionStorage.removeItem('thoogudeepa_waiter_view');
      sessionStorage.removeItem('thoogudeepa_waiter_tab');
    } catch {}
    setLoggedIn(false);
    setWaiterName('');
    setAssignedSection('ALL');
    setMainTab('TABLES');
    navigateView({ type: 'FLOOR' }, true);
  };

  // ── Render matching loading shell on SSR & initial client render to prevent hydration mismatch ───
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center font-sans w-full">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/thoogudeepa-logo.png"
            alt="Thoogudeepa Donne Biryani"
            className="h-12 w-12 rounded-full object-cover animate-pulse shadow-md border border-[#D28835]/40"
          />
          <div className="h-1.5 w-24 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#D28835] rounded-full animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

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
            <img
              src="/assets/thoogudeepa-logo.png"
              alt="Thoogudeepa Donne Biryani"
              className="h-9 w-9 rounded-full object-cover shadow-xs border border-[#D28835]/40"
            />
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-wider text-[#9C3D1E]">
                {waiterName}
              </p>
              <h1 className="text-sm font-black tracking-tight text-stone-900 uppercase">
                Thoogudeepa Donne Biryani
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
            {/* Local-First Outbox Synchronization Badge */}
            <div
              className={`px-2 py-1 rounded-xl flex items-center gap-1 border shadow-2xs transition-colors ${
                !isOnline
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : outboxPendingCount > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title={
                !isOnline
                  ? 'Device Offline: Orders saved locally'
                  : outboxPendingCount > 0
                  ? `${outboxPendingCount} actions pending sync`
                  : 'All orders synced to cloud'
              }
            >
              {!isOnline ? (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>OFFLINE</span>
                </>
              ) : outboxPendingCount > 0 ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span>SYNCING ({outboxPendingCount})</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3 w-3 text-emerald-600" />
                  <span>SYNCED</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowShiftPerformance(true)}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-[#9C3D1E] transition flex items-center gap-1.5 active:scale-95 shadow-2xs font-mono font-bold"
              title="Shift Performance & Account"
            >
              <TrendingUp className="h-4 w-4 text-[#9C3D1E]" />
              <span className="hidden sm:inline">Shift Performance</span>
            </button>
          </div>
        </header>

        {/* Tab navigation: 3 Clean Dedicated Tabs */}
        <nav className="bg-white border-b border-[#EAE5DF] grid grid-cols-3 text-center font-mono text-[13px] font-black shadow-2xs">
          <button
            type="button"
            onClick={() => { changeMainTab('TABLES'); navigateView({ type: 'FLOOR' }, true); }}
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
            onClick={() => changeMainTab('CALLS')}
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
            onClick={() => changeMainTab('READY')}
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
            onSettleTable={(num, chair) => {
              const clean = cleanTableNum(num);
              const tbl = (tables || []).find((t) => cleanTableNum(t.number) === clean);
              const groupTables = (tables || []).filter((t) => {
                if (cleanTableNum(t.number) === clean) return true;
                if (tbl?.mergeGroupPeers?.some((p) => cleanTableNum(p) === cleanTableNum(t.number))) return true;
                if (tbl?.mergedWith && cleanTableNum(tbl.mergedWith) === cleanTableNum(t.number)) return true;
                return false;
              });
              const groupNums = new Set(groupTables.map((t) => cleanTableNum(t.number)));
              const tks = (kdsTickets || []).filter(
                (tk) => groupNums.has(cleanTableNum(tk.tableNumber)) && tk.status !== 'COMPLETED'
              );

              // Gather unique ordered items from KDS tickets and groupTables activeItems
              const tableItems: Array<{ price: number; quantity: number; seatNumber?: number }> = [];
              const seenItemKeys = new Set<string>();

              tks.forEach((tk) => {
                tk.items.forEach((it) => {
                  const itName = (it.name || '').toLowerCase();
                  const fallbackPrice =
                    INITIAL_MENU_ITEMS.find((m) => {
                      const mName = (m.name || '').toLowerCase();
                      return (
                        (itName && mName === itName) ||
                        (itName && mName.includes(itName)) ||
                        (itName && itName.includes(mName)) ||
                        (it.id && m.id === it.id)
                      );
                    })?.price || 220;
                  const unitPrice = it.price && it.price > 0 ? it.price : fallbackPrice;
                  const s = it.seatNumber !== undefined && it.seatNumber !== null
                    ? Number(it.seatNumber)
                    : (it as any).seat_number !== undefined && (it as any).seat_number !== null
                    ? Number((it as any).seat_number)
                    : (tk.seatNumber ? Number(tk.seatNumber) : undefined);
                  const itemKey = it.id || `${it.name}-${s}-${unitPrice}`;
                  seenItemKeys.add(itemKey);
                  tableItems.push({
                    price: unitPrice,
                    quantity: it.quantity || 1,
                    seatNumber: s,
                  });
                });
              });

              groupTables.forEach((gt) => {
                if (gt.activeItems && gt.activeItems.length > 0) {
                  gt.activeItems.forEach((ai, idx) => {
                    const aiName = (ai.name || '').toLowerCase();
                    const fallbackPrice =
                      INITIAL_MENU_ITEMS.find((m) => {
                        const mName = (m.name || '').toLowerCase();
                        return (
                          (aiName && mName === aiName) ||
                          (aiName && mName.includes(aiName)) ||
                          (aiName && aiName.includes(mName)) ||
                          (ai.id && m.id === ai.id)
                        );
                      })?.price || 220;
                    const unitPrice = ai.price && ai.price > 0 ? ai.price : fallbackPrice;
                    const s = ai.seatNumber !== undefined && ai.seatNumber !== null
                      ? Number(ai.seatNumber)
                      : (ai as any).seat_number !== undefined && (ai as any).seat_number !== null
                      ? Number((ai as any).seat_number)
                      : undefined;
                    const itemKey = ai.id || `${ai.name}-${s}-${unitPrice}-${idx}`;
                    if (!seenItemKeys.has(itemKey)) {
                      seenItemKeys.add(itemKey);
                      tableItems.push({
                        price: unitPrice,
                        quantity: ai.quantity || 1,
                        seatNumber: s,
                      });
                    }
                  });
                }
              });

              const chairsWithOrders = new Set<number>();
              tableItems.forEach((it) => {
                if (it.seatNumber) chairsWithOrders.add(it.seatNumber);
              });
              const totalChairs = groupTables.reduce((sum, t) => sum + (t.capacity || 4), 0) || (tbl?.capacity || 4);
              const occupiedChairsCount = Math.min(
                totalChairs,
                Math.max(chairsWithOrders.size, tbl?.guestCount || 0, 1)
              );

              let chairDue: number | undefined;
              if (typeof chair === 'number') {
                const anyChairHasSpecificOrders = tableItems.some((i) => !!i.seatNumber);
                const directItems = tableItems.filter((i) => i.seatNumber === chair);
                const fallbackChair1Direct = (chair === 1 && directItems.length === 0 && (!anyChairHasSpecificOrders || (chairsWithOrders.size === 1 && chairsWithOrders.has(1))))
                  ? tableItems
                  : [];
                const effectiveDirectItems = directItems.length > 0 ? directItems : fallbackChair1Direct;
                const sharedItems = tableItems.filter((i) => !i.seatNumber);
                const directSub = effectiveDirectItems.reduce((s, i) => s + i.price * i.quantity, 0);

                let calculatedSub = 0;
                if (effectiveDirectItems.length > 0) {
                  const sharedPerPerson = occupiedChairsCount > 0
                    ? sharedItems.reduce((s, i) => s + i.price * i.quantity, 0) / occupiedChairsCount
                    : 0;
                  calculatedSub = directSub + (effectiveDirectItems === tableItems ? 0 : sharedPerPerson);
                } else if (!anyChairHasSpecificOrders && sharedItems.length > 0) {
                  calculatedSub = occupiedChairsCount > 0
                    ? (sharedItems.reduce((s, i) => s + i.price * i.quantity, 0) / occupiedChairsCount)
                    : 0;
                } else if (sharedItems.length > 0) {
                  calculatedSub = occupiedChairsCount > 0
                    ? (sharedItems.reduce((s, i) => s + i.price * i.quantity, 0) / occupiedChairsCount)
                    : 0;
                }

                if (calculatedSub > 0) {
                  chairDue = Math.round(calculatedSub * 1.05);
                }
              }

              navigateView({
                type: 'SETTLE',
                tableNum: tbl?.number || num,
                splitLabel: typeof chair === 'number' ? `Chair ${chair}` : undefined,
                splitAmount: chairDue,
              });
            }}
          />
        )}

        {mainTab === 'READY' && (
          <ScreenM5Dispatch
            mode="READY"
            onNavigateToTable={(num) => navigateView({ type: 'SHEET', tableNum: num, initialSeat: 'ALL' })}
          />
        )}
      </div>

      <MobileShiftModal
        open={showShiftPerformance}
        onClose={() => setShowShiftPerformance(false)}
        onLogout={handleLogout}
        waiterName={waiterName}
        assignedSection={assignedSection}
      />
    </main>
  );
}
