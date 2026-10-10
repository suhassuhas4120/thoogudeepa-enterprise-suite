'use client';

import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useCustomerStore } from '../store/useCustomerStore';
import { useSharedBridge } from '../store/useSharedBridge';
import { CustomerThemeProvider } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Screen1Welcome } from '../components/customer/Screen1Welcome';
import { Screen2Menu } from '../components/customer/Screen2Menu';
import { Screen3ItemDetail } from '../components/customer/Screen3ItemDetail';
import { Screen4Cart } from '../components/customer/Screen4Cart';
import { Screen5LiveTracking } from '../components/customer/Screen5LiveTracking';
import { Screen6PaymentBreakdown } from '../components/customer/Screen6PaymentBreakdown';
import { Screen7PaymentGateway } from '../components/customer/Screen7PaymentGateway';
import { Screen8Confirmation } from '../components/customer/Screen8Confirmation';
import { Screen10WaiterCall } from '../components/customer/Screen10WaiterCall';
import { ScreenId } from '../types/customer';
import { getSyncBroadcastChannel } from '../lib/supabase';
import { getOrCreateDeviceToken } from '../lib/device-fingerprint';
import { Armchair, AlertCircle, Sparkles, RefreshCw, Check } from 'lucide-react';

// Normalise a raw table param like "T-5", "T05", "5" → "T-05"
function normTableId(raw: string): string {
  const upper = raw.trim().toUpperCase();
  const m = upper.match(/^T-?(\d+)$/);
  if (m) return `T-${String(parseInt(m[1], 10)).padStart(2, '0')}`;
  return upper;
}

// Compact table number extractor: "T-05" → "5", "TABLE 5" → "5"
function cleanTableNum(s: string): string {
  return (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
}

function CustomerJourneyContent() {
  const { currentScreen, setTableNumber, setSeatNumber } = useCustomer();

  // Parsed once from URL; stable for the lifetime of this page load
  const tableRef = React.useRef('T-01');
  const seatRef = React.useRef(1);

  // Track whether the customer has placed at least one order (sent to kitchen).
  // Only after this point should a table VACANT status trigger a session reset.
  const hasPlacedOrderRef = React.useRef(false);

  // ─── One-time QR init ───────────────────────────────────────────────────────
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tblParam = params.get('table') || params.get('t');
    const seatParam = params.get('seat') || params.get('chair') || params.get('s');

    let cleanTable = 'T-01';
    let parsedSeat = 1;

    if (tblParam) {
      cleanTable = normTableId(tblParam);
      setTableNumber(cleanTable);
    }
    if (seatParam) {
      const s = parseInt(seatParam, 10);
      if (!isNaN(s) && s > 0) {
        parsedSeat = s;
        setSeatNumber(s);
      }
    }

    tableRef.current = cleanTable;
    seatRef.current = parsedSeat;

    const curStoreState = useCustomerStore.getState();
    const tableOrSeatChanged =
      curStoreState.tableNumber !== cleanTable ||
      curStoreState.seatNumber !== parsedSeat ||
      curStoreState.isSettled;

    if (tableOrSeatChanged) {
      curStoreState.resetSession();
      hasPlacedOrderRef.current = false;
    }

    // Always wipe the OLD global (unscoped) key — it causes cross-seat contamination
    try {
      localStorage.removeItem('thoogudeepa_customer_session_v1');
    } catch {}

    // Step 1: Sync with the live bridge state for this specific table+seat
    useCustomerStore.getState().syncWithActiveSession(cleanTable, parsedSeat);

    // Step 2: Restore a table+seat specific saved session only if:
    //   a) The bridge sync left the cart empty
    //   b) The saved payload belongs to THIS exact table AND seat
    //   c) The saved session actually has placed orders (isOrdered items) —
    //      meaning it's a mid-session restore, not a stale pre-order browsing state.
    //      If no placed orders exist, the customer should just start fresh on Screen 1.
    try {
      const scopedKey = `thoogudeepa_customer_session_${cleanTable}_s${parsedSeat}`;
      const saved = localStorage.getItem(scopedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const curStore = useCustomerStore.getState();

        const savedTable = parsed.tableNumber ? normTableId(parsed.tableNumber) : '';
        const savedSeat = parsed.seatNumber ?? 0;
        const hasSavedCart = Array.isArray(parsed.cart) && parsed.cart.length > 0;
        const tableMatches = savedTable === cleanTable && savedSeat === parsedSeat;

        if (!tableMatches) {
          // Stale entry for a different table/seat — discard silently
          try { localStorage.removeItem(scopedKey); } catch {}
        } else if (tableMatches && curStore.cart.length === 0 && hasSavedCart) {
          if (parsed.isSettled || parsed.currentScreen === 8) {
            // Already paid/settled in previous customer session — wipe so new customer starts fresh
            try { localStorage.removeItem(scopedKey); } catch {}
          } else {
            // Check if there are any placed orders in the saved cart
            const hasPlacedOrders = parsed.cart.some((ci: { isOrdered?: boolean }) => ci.isOrdered === true);

            if (hasPlacedOrders) {
              // Check bridge — verify if THIS specific chair has active orders in bridge
              const bridgeState = useSharedBridge.getState();
              const bridgeTbl = bridgeState.tables.find(
                (t) => cleanTableNum(t.number) === cleanTableNum(cleanTable)
              );
              const seatActiveItems = (bridgeTbl?.activeItems || []).filter(
                (ai) => ai.seatNumber === parsedSeat
              );
              const seatTickets = bridgeState.kdsTickets.filter(
                (tk) => cleanTableNum(tk.tableNumber) === cleanTableNum(cleanTable) &&
                        tk.status !== 'COMPLETED' &&
                        (tk.seatNumber === parsedSeat || tk.items.some((i) => i.seatNumber === parsedSeat))
              );
              const chairHasActiveOrdersInBridge = seatActiveItems.length > 0 || seatTickets.length > 0;

              if (chairHasActiveOrdersInBridge) {
                // Restore the active mid-session
                useCustomerStore.setState({
                  cart: parsed.cart,
                  currentScreen: parsed.currentScreen || 1,
                  orderStage: parsed.orderStage || 'PLACED',
                  itemTracking: parsed.itemTracking || [],
                  payment: parsed.payment || curStore.payment,
                  orderPlacedAt: parsed.orderPlacedAt || Date.now(),
                });
                hasPlacedOrderRef.current = true;
              } else {
                // Chair was vacated or finished in kitchen/bridge — wipe stale session
                try { localStorage.removeItem(scopedKey); } catch {}
              }
            } else {
              // Only unplaced browsing state — don't restore; let them start fresh
              try { localStorage.removeItem(scopedKey); } catch {}
            }
          }
        }
      }
    } catch {}

    // Also track if there are already placed orders in the current store (restored from syncWithActiveSession)
    const storeAfterSync = useCustomerStore.getState();
    if (storeAfterSync.cart.some((ci) => ci.isOrdered)) {
      hasPlacedOrderRef.current = true;
    }

    // Chair Device Lock Check: verify if this chair is already occupied by a different device
    const devToken = getOrCreateDeviceToken();
    fetch(`/api/session/verify?table=${encodeURIComponent(cleanTable)}&seat=${parsedSeat}&deviceToken=${encodeURIComponent(devToken)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.isOccupiedByOtherDevice) {
          setChairConflict({
            isOpen: true,
            occupiedSeat: parsedSeat,
            table: cleanTable,
            vacantSeats: data.vacantSeats || [],
          });
        }
      })
      .catch(() => {});
  }, [setTableNumber, setSeatNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Chair Device Lock Conflict State & Listener ────────────────────────────
  const [chairConflict, setChairConflict] = React.useState<{
    isOpen: boolean;
    occupiedSeat: number;
    table: string;
    vacantSeats: number[];
  } | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleConflict = (e: Event) => {
      const customEvent = e as CustomEvent<{ vacantSeats?: number[] }>;
      const detail = customEvent.detail || {};
      const curStore = useCustomerStore.getState();
      setChairConflict({
        isOpen: true,
        occupiedSeat: curStore.seatNumber || seatRef.current,
        table: curStore.tableNumber || tableRef.current,
        vacantSeats: detail.vacantSeats || [],
      });
    };

    window.addEventListener('chairConflictDetected', handleConflict);
    return () => window.removeEventListener('chairConflictDetected', handleConflict);
  }, []);

  const handleSwitchChair = (newSeat: number) => {
    seatRef.current = newSeat;
    setSeatNumber(newSeat);
    setChairConflict(null);

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('seat', String(newSeat));
        window.history.replaceState({ screen: useCustomerStore.getState().currentScreen }, '', url.toString());
      } catch {}
    }

    const cleanTable = tableRef.current;
    const curStore = useCustomerStore.getState();
    curStore.setSeatNumber(newSeat);
    curStore.resetSession();
    curStore.syncWithActiveSession(cleanTable, newSeat);
  };


  // ─── Native Hardware / Browser Back & Swipe Navigation Sync ─────────────────
  const isPopNavigatingRef = React.useRef(false);
  const historyDepthRef = React.useRef(1);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialScreen = useCustomerStore.getState().currentScreen;
    if (!window.history.state?.screen) {
      window.history.replaceState({ screen: initialScreen, depth: 1 }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      const curStore = useCustomerStore.getState();
      const currentScrn = curStore.currentScreen;
      const targetScreen = e.state?.screen as ScreenId | undefined;

      if (targetScreen && targetScreen !== currentScrn) {
        isPopNavigatingRef.current = true;
        historyDepthRef.current = Math.max(1, e.state?.depth || 1);
        curStore.setCurrentScreen(targetScreen);
        setTimeout(() => {
          isPopNavigatingRef.current = false;
        }, 80);
      } else if (!targetScreen) {
        // Fallback backward mapping if browser popped to root
        let fallbackScreen: ScreenId = 1;
        if (currentScrn === 3 || currentScrn === 4) fallbackScreen = 2; // details / cart -> menu
        else if (currentScrn === 7) fallbackScreen = 6; // gateway -> breakdown
        else if (currentScrn === 6) fallbackScreen = 5; // breakdown -> live tracking
        else if (currentScrn === 10) fallbackScreen = hasPlacedOrderRef.current ? 5 : 2; // waiter call
        else if (currentScrn === 2 && hasPlacedOrderRef.current) fallbackScreen = 5; // menu -> tracking
        else if (currentScrn === 5 || currentScrn === 8) fallbackScreen = currentScrn; // stay on active tracking or paid invoice

        isPopNavigatingRef.current = true;
        curStore.setCurrentScreen(fallbackScreen);
        window.history.replaceState({ screen: fallbackScreen, depth: 1 }, '');
        setTimeout(() => {
          isPopNavigatingRef.current = false;
        }, 80);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize in-app screen changes with browser history stack
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isPopNavigatingRef.current) return;

    const currentState = window.history.state;
    if (currentState?.screen !== currentScreen) {
      const prev = currentState?.screen;
      const isStepBack =
        (prev === 3 && currentScreen === 2) ||
        (prev === 4 && currentScreen === 2) ||
        (prev === 6 && currentScreen === 5) ||
        (prev === 7 && currentScreen === 6) ||
        (prev === 10 && (currentScreen === 2 || currentScreen === 5));

      if (isStepBack && historyDepthRef.current > 1) {
        isPopNavigatingRef.current = true;
        historyDepthRef.current -= 1;
        window.history.back();
        setTimeout(() => {
          isPopNavigatingRef.current = false;
        }, 80);
      } else {
        historyDepthRef.current += 1;
        window.history.pushState({ screen: currentScreen, depth: historyDepthRef.current }, '');
      }
    }
  }, [currentScreen]);

  // ─── Keep refs and hasPlacedOrderRef in sync with store state ──────────
  React.useEffect(() => {
    const unsubscribe = useCustomerStore.subscribe((state) => {
      if (state.tableNumber) tableRef.current = normTableId(state.tableNumber);
      if (state.seatNumber) seatRef.current = state.seatNumber;

      if (!hasPlacedOrderRef.current && state.cart.some((ci) => ci.isOrdered)) {
        hasPlacedOrderRef.current = true;
      }
      // If session was fully reset (screen 1, empty cart), clear the flag
      if (state.currentScreen === 1 && state.cart.length === 0) {
        hasPlacedOrderRef.current = false;
      }
    });
    return unsubscribe;
  }, []);

  // ─── Real-time vacate listener ──────────────────────────────────────────────
  // Listens for the waiter's "tableVacated" broadcast on the Supabase channel.
  // Only resets the customer session if they had already placed an order —
  // browsing customers (screen 2/3/4 with no placed order) are never interrupted.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = getSyncBroadcastChannel();

    const handleBroadcast = (event: { payload?: { reason?: string; tableNumber?: string; seatNumber?: number } }) => {
      const reason = event?.payload?.reason;
      if (reason !== 'tableVacated' && reason !== 'chairCleared') return;

      // Only act if the customer has already placed an order
      // (pre-order browsing must never be disrupted by unrelated vacate events)
      if (!hasPlacedOrderRef.current) return;

      const curStore = useCustomerStore.getState();
      const tableId = curStore.tableNumber || tableRef.current;
      const seatId = curStore.seatNumber || seatRef.current;

      // Don't interrupt Screen 8 (confirmation) — payment already shown
      if (curStore.currentScreen === 8) return;

      // If this is a chairCleared event for a different chair or table, ignore it completely
      if (reason === 'chairCleared') {
        const evtTable = event?.payload?.tableNumber;
        const evtSeat = event?.payload?.seatNumber;
        if (evtTable && cleanTableNum(evtTable) !== cleanTableNum(tableId)) return;
        if (typeof evtSeat === 'number' && evtSeat !== seatId) return;
      }

      const bridgeState = useSharedBridge.getState();

      // Check bridge — reset if our specific chair is now cleared or entire table is VACANT
      const bridgeTbl = bridgeState.tables.find(
        (t) => cleanTableNum(t.number) === cleanTableNum(tableId)
      );
      const seatActiveItems = (bridgeTbl?.activeItems || []).filter(
        (ai) => ai.seatNumber === seatId
      );
      const seatTickets = bridgeState.kdsTickets.filter(
        (tk) => cleanTableNum(tk.tableNumber) === cleanTableNum(tableId) &&
                tk.status !== 'COMPLETED' &&
                (tk.seatNumber === seatId || tk.items.some((i) => i.seatNumber === seatId))
      );
      const chairHasRemainingOrders = seatActiveItems.length > 0 || seatTickets.length > 0;

      if (!chairHasRemainingOrders || (bridgeTbl && bridgeTbl.status === 'VACANT')) {
        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
        } catch {}
        curStore.resetSession();
        hasPlacedOrderRef.current = false;
      }
    };

    channel.on('broadcast', { event: 'STATE_CHANGED' }, handleBroadcast);

    // Safety-net poll every 8 seconds — only acts if:
    //   1. Customer has placed an order (not pre-order browsing)
    //   2. Table or chair is confirmed cleared/VACANT in bridge (not just absent)
    //   3. Customer is on an active post-order screen (5, 6, 7, 9, 10)
    const vacateCheckInterval = setInterval(() => {
      if (!hasPlacedOrderRef.current) return;

      const curStore = useCustomerStore.getState();
      const tableId = curStore.tableNumber || tableRef.current;
      const seatId = curStore.seatNumber || seatRef.current;

      // Only relevant for post-order screens; never interrupt browsing or confirmation
      const postOrderScreens = [5, 6, 7, 9, 10];
      if (!postOrderScreens.includes(curStore.currentScreen)) return;

      const bridgeState = useSharedBridge.getState();

      const bridgeTbl = bridgeState.tables.find(
        (t) => cleanTableNum(t.number) === cleanTableNum(tableId)
      );
      const seatActiveItems = (bridgeTbl?.activeItems || []).filter(
        (ai) => ai.seatNumber === seatId
      );
      const seatTickets = bridgeState.kdsTickets.filter(
        (tk) => cleanTableNum(tk.tableNumber) === cleanTableNum(tableId) &&
                tk.status !== 'COMPLETED' &&
                (tk.seatNumber === seatId || tk.items.some((i) => i.seatNumber === seatId))
      );
      const chairHasRemainingOrders = seatActiveItems.length > 0 || seatTickets.length > 0;

      // Reset if chair has no active orders in bridge or table is explicitly VACANT
      if (!chairHasRemainingOrders || (bridgeTbl && bridgeTbl.status === 'VACANT')) {
        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
        } catch {}
        curStore.resetSession();
        hasPlacedOrderRef.current = false;
      }
    }, 8000);

    return () => {
      clearInterval(vacateCheckInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerDown = (e: React.PointerEvent) => {
    // Left-edge swipe back gesture (35px left boundary)
    if (e.clientX > 35) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const pid = e.pointerId;

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      const dx = ev.clientX - startX;
      const dy = Math.abs(ev.clientY - startY);
      if (dx > 65 && dx > dy * 1.5) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      }
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 1: return <Screen1Welcome />;
      case 2: return <Screen2Menu />;
      case 3: return <Screen3ItemDetail />;
      case 4: return <Screen4Cart />;
      case 5: return <Screen5LiveTracking />;
      case 6: return <Screen6PaymentBreakdown />;
      case 7: return <Screen7PaymentGateway />;
      case 8: return <Screen8Confirmation />;
      case 9:
      case 10: return <Screen10WaiterCall />;
      default: return <Screen1Welcome />;
    }
  };

  return (
    <main
      onPointerDown={handlePointerDown}
      className="w-full select-none"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          {renderActiveScreen()}
        </motion.div>
      </AnimatePresence>

      {/* ── Chair Device Lock Conflict Modal ── */}
      <AnimatePresence>
        {chairConflict?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-[#1C1917] text-white border border-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Armchair className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white uppercase">
                    Chair Currently Occupied
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    Table {chairConflict.table} • Chair {chairConflict.occupiedSeat}
                  </p>
                </div>
              </div>

              <div className="bg-stone-900/80 rounded-2xl p-4 border border-stone-800 text-sm text-stone-300 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    <strong className="text-white">Chair {chairConflict.occupiedSeat}</strong> is currently in use by an active guest with an ongoing dining session.
                  </p>
                </div>
              </div>

              {chairConflict.vacantSeats && chairConflict.vacantSeats.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-stone-300 font-medium text-center">
                    Please select an open chair to begin ordering:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    {chairConflict.vacantSeats.map((seatNum) => (
                      <button
                        key={seatNum}
                        onClick={() => handleSwitchChair(seatNum)}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-amber-900/30 border border-amber-500/30"
                      >
                        <Armchair className="h-4 w-4" />
                        <span>Chair {seatNum}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!chairConflict.vacantSeats || chairConflict.vacantSeats.length === 0) && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                    All seats at Table {chairConflict.table} are currently occupied. Please notify your waiter.
                  </div>
                  <button
                    onClick={() => {
                      setChairConflict(null);
                      useCustomerStore.getState().setCurrentScreen(10);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
                  >
                    Call Waiter For Help
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function CustomerJourneyPage() {
  return (
    <CustomerThemeProvider>
      <CustomerJourneyContent />
    </CustomerThemeProvider>
  );
}
