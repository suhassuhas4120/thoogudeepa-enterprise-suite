'use client';

import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useCustomerStore } from '../store/useCustomerStore';
import { useSharedBridge } from '../store/useSharedBridge';
import { CustomerThemeProvider, useCustomerTheme } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

// Classic Heritage Light Screens
import { Screen1Welcome } from '../components/customer/Screen1Welcome';
import { Screen2Menu } from '../components/customer/Screen2Menu';
import { Screen3ItemDetail } from '../components/customer/Screen3ItemDetail';
import { Screen4Cart } from '../components/customer/Screen4Cart';
import { Screen5LiveTracking } from '../components/customer/Screen5LiveTracking';
import { Screen6PaymentBreakdown } from '../components/customer/Screen6PaymentBreakdown';
import { Screen7PaymentGateway } from '../components/customer/Screen7PaymentGateway';
import { Screen8Confirmation } from '../components/customer/Screen8Confirmation';
import { Screen9DigitalBill } from '../components/customer/Screen9DigitalBill';
import { Screen10WaiterCall } from '../components/customer/Screen10WaiterCall';

// Ultra Luxury Obsidian Gold Screens
import { Screen1Welcome as Screen1WelcomeLuxury } from '../components/customer/luxury/Screen1Welcome';
import { Screen2Menu as Screen2MenuLuxury } from '../components/customer/luxury/Screen2Menu';
import { Screen3ItemDetail as Screen3ItemDetailLuxury } from '../components/customer/luxury/Screen3ItemDetail';
import { Screen4Cart as Screen4CartLuxury } from '../components/customer/luxury/Screen4Cart';
import { Screen5LiveTracking as Screen5LiveTrackingLuxury } from '../components/customer/luxury/Screen5LiveTracking';
import { Screen6PaymentBreakdown as Screen6PaymentBreakdownLuxury } from '../components/customer/luxury/Screen6PaymentBreakdown';
import { Screen7PaymentGateway as Screen7PaymentGatewayLuxury } from '../components/customer/luxury/Screen7PaymentGateway';
import { Screen8Confirmation as Screen8ConfirmationLuxury } from '../components/customer/luxury/Screen8Confirmation';
import { Screen9DigitalBill as Screen9DigitalBillLuxury } from '../components/customer/luxury/Screen9DigitalBill';
import { Screen10WaiterCall as Screen10WaiterCallLuxury } from '../components/customer/luxury/Screen10WaiterCall';
import { ScreenId } from '../types/customer';
import { getSyncBroadcastChannel } from '../lib/supabase';
import { getOrCreateDeviceToken } from '../lib/device-fingerprint';
import { useTabLifecycleSync } from '../hooks/useTabLifecycleSync';
import { Armchair, AlertCircle, Sparkles, RefreshCw, Check, ArrowRight, ShieldAlert, QrCode } from 'lucide-react';

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

function NetworkConnectivityPill() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [showRestored, setShowRestored] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 2500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
      {!isOnline ? (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/95 border border-amber-500/50 text-amber-200 text-[10.5px] font-bold shadow-lg backdrop-blur-md animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Reconnecting to restaurant network...</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/95 border border-emerald-500/50 text-emerald-200 text-[10.5px] font-bold shadow-lg backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Connection Restored • Synchronized</span>
        </div>
      )}
    </div>
  );
}

function CustomerJourneyContent() {
  const { currentScreen, setTableNumber, setSeatNumber } = useCustomer();
  const { currentThemeId } = useCustomerTheme();
  const isLuxuryDark = currentThemeId === 'obsidian-gold';

  // Parsed once from URL; stable for the lifetime of this page load
  const tableRef = React.useRef('T-01');
  const seatRef = React.useRef(1);

  // Enterprise Tab Lifecycle Sync: Automatically re-syncs state when diner unlocks phone
  useTabLifecycleSync(tableRef.current);

  // Track whether the customer has placed at least one order (sent to kitchen).
  // Only after this point should a table VACANT status trigger a session reset.
  const hasPlacedOrderRef = React.useRef(false);

  // ─── One-time QR init ───────────────────────────────────────────────────────
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    let tblParam = params.get('table') || params.get('t');
    let seatParam = params.get('seat') || params.get('chair') || params.get('s');
    let sigParam = params.get('sig') || params.get('token');

    // If query string is masked/empty, restore verified session from sessionStorage
    let storedSession: any = null;
    try {
      const raw = sessionStorage.getItem('thoogudeepa_verified_session');
      if (raw) storedSession = JSON.parse(raw);
    } catch {}

    if (!tblParam && storedSession?.table) {
      tblParam = storedSession.table;
      seatParam = String(storedSession.seat || 1);
      sigParam = storedSession.sig;
    }

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
    //   c) The saved session actually has placed orders (isOrdered items)
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
          try { localStorage.removeItem(scopedKey); } catch {}
        } else if (tableMatches && curStore.cart.length === 0 && hasSavedCart) {
          if (parsed.isSettled || parsed.currentScreen === 8) {
            try { localStorage.removeItem(scopedKey); } catch {}
          } else {
            const hasPlacedOrders = parsed.cart.some((ci: { isOrdered?: boolean }) => ci.isOrdered === true);

            if (hasPlacedOrders) {
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
                try { localStorage.removeItem(scopedKey); } catch {}
              }
            } else {
              // Restore unplaced draft items so accidental page refresh doesn't lose diner's configured dishes
              useCustomerStore.setState({
                cart: parsed.cart,
                currentScreen: parsed.currentScreen && parsed.currentScreen <= 4 ? parsed.currentScreen : 2,
                payment: parsed.payment || curStore.payment,
              });
            }
          }
        }
      }
    } catch {}

    const storeAfterSync = useCustomerStore.getState();
    if (storeAfterSync.cart.some((ci) => ci.isOrdered)) {
      hasPlacedOrderRef.current = true;
    }

    // Chair Device Lock & Cryptographic Anti-Tampering Check
    const devToken = getOrCreateDeviceToken();
    const queryParts = [
      `table=${encodeURIComponent(cleanTable)}`,
      `seat=${parsedSeat}`,
      `deviceToken=${encodeURIComponent(devToken)}`,
    ];
    if (sigParam) {
      queryParts.push(`sig=${encodeURIComponent(sigParam)}`);
    }

    fetch(`/api/session/verify?${queryParts.join('&')}`)
      .then((res) => res.json())
      .then((data) => {
        // Tamper or Invalid Signature Detection
        if (
          data.isTampered ||
          data.error === 'SIGNATURE_REQUIRED' ||
          data.error === 'INVALID_SIGNATURE' ||
          data.error === 'INVALID_TABLE' ||
          data.error === 'INVALID_SEAT'
        ) {
          setTamperConflict({
            isOpen: true,
            table: cleanTable,
            seat: parsedSeat,
            message: data.message || 'Physical table QR verification required.',
          });
          return;
        }

        if (data.hasActiveOrderElsewhere && data.existingOrder) {
          setCrossSeatConflict({
            isOpen: true,
            currentTable: cleanTable,
            currentSeat: parsedSeat,
            existingOrder: data.existingOrder,
          });
          return;
        }

        if (data.isOccupiedByOtherDevice) {
          setChairConflict({
            isOpen: true,
            occupiedSeat: parsedSeat,
            table: cleanTable,
            vacantSeats: data.vacantSeats || [],
          });
          return;
        }

        // Successfully verified authentic table session!
        try {
          sessionStorage.setItem(
            'thoogudeepa_verified_session',
            JSON.stringify({
              table: cleanTable,
              seat: parsedSeat,
              sig: sigParam || data.sessionToken,
              timestamp: Date.now(),
            })
          );
        } catch {}

        // Mask address bar: remove raw query params so URL cannot be tampered in browser
        // On localhost, preserve table/seat params for multi-tab development
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (!isLocalDev) {
            window.history.replaceState(
              { screen: useCustomerStore.getState().currentScreen || 1 },
              document.title,
              window.location.pathname || '/'
            );
          }
        }
      })
      .catch(() => {});
  }, [setTableNumber, setSeatNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Tamper Protection Conflict State ───────────────────────────────────────
  const [tamperConflict, setTamperConflict] = React.useState<{
    isOpen: boolean;
    table: string;
    seat: number;
    message?: string;
  } | null>(null);

  // ─── Cross-Seat Active Order State & Handlers ───────────────────────────────
  const [crossSeatConflict, setCrossSeatConflict] = React.useState<{
    isOpen: boolean;
    currentTable: string;
    currentSeat: number;
    existingOrder: {
      id: string;
      tableNumber: string;
      seatNumber: number;
      total: number;
    };
  } | null>(null);

  const handleReturnToExistingSeat = () => {
    if (!crossSeatConflict) return;
    const { tableNumber, seatNumber } = crossSeatConflict.existingOrder;
    setCrossSeatConflict(null);
    if (typeof window !== 'undefined') {
      window.location.href = `/?table=${encodeURIComponent(tableNumber)}&seat=${seatNumber}`;
    }
  };

  // ─── Chair Device Lock Conflict State & Listener ────────────────────────────
  const [chairConflict, setChairConflict] = React.useState<{
    isOpen: boolean;
    occupiedSeat: number;
    table: string;
    vacantSeats: number[];
  } | null>(null);

  const [chairTakenNotice, setChairTakenNotice] = React.useState<{
    seat: number;
    message: string;
    shakeKey: number;
  } | null>(null);

  const [isCheckingSeat, setIsCheckingSeat] = React.useState<number | null>(null);

  const getOccupiedSeatsFromBridge = (targetTable: string): Set<number> => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetClean = cleanNum(targetTable);
    const bridge = useSharedBridge.getState();
    const occupied = new Set<number>();

    const tbl = bridge.tables.find((t) => cleanNum(t.number) === targetClean);
    if (tbl?.activeItems) {
      for (const item of tbl.activeItems) {
        if (item.seatNumber && item.seatNumber >= 1 && item.seatNumber <= 6) {
          occupied.add(item.seatNumber);
        }
      }
    }

    const tickets = bridge.kdsTickets.filter(
      (tk) => cleanNum(tk.tableNumber) === targetClean && tk.status !== 'COMPLETED'
    );
    for (const tk of tickets) {
      if (tk.seatNumber && tk.seatNumber >= 1 && tk.seatNumber <= 6) {
        occupied.add(tk.seatNumber);
      }
      for (const item of tk.items || []) {
        const s = item.seatNumber || (item as any).seat_number;
        if (s && s >= 1 && s <= 6) {
          occupied.add(s);
        }
      }
    }
    return occupied;
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleConflict = (e: Event) => {
      const customEvent = e as CustomEvent<{ vacantSeats?: number[] }>;
      const detail = customEvent.detail || {};
      const curStore = useCustomerStore.getState();
      curStore.rollBackUnplacedOrders();
      const currentTable = curStore.tableNumber || tableRef.current;
      const occupiedInBridge = getOccupiedSeatsFromBridge(currentTable);
      const incomingVacant = (detail.vacantSeats || []).filter((s) => !occupiedInBridge.has(s));

      setChairTakenNotice(null);
      setChairConflict({
        isOpen: true,
        occupiedSeat: curStore.seatNumber || seatRef.current,
        table: currentTable,
        vacantSeats: incomingVacant,
      });
    };

    const handleRealtimeSeatOccupied = (e: Event) => {
      const customEvent = e as CustomEvent<{ tableNumber?: string; seatNumber?: number }>;
      const { tableNumber, seatNumber } = customEvent.detail || {};
      if (!tableNumber || !seatNumber) return;

      const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
      setChairConflict((prev) => {
        if (!prev || !prev.isOpen) return prev;
        if (cleanNum(prev.table) !== cleanNum(tableNumber)) return prev;

        const updatedVacant = prev.vacantSeats.filter((s) => s !== seatNumber);

        if (prev.vacantSeats.includes(seatNumber)) {
          let noticeText = '';
          if (updatedVacant.length === 0) {
            noticeText = `Chair ${seatNumber} just taken. All seats at Table ${tableNumber} are currently occupied.`;
          } else if (updatedVacant.length === 1) {
            noticeText = `Chair ${seatNumber} just taken, please tap ${updatedVacant[0]}`;
          } else if (updatedVacant.length === 2) {
            noticeText = `Chair ${seatNumber} just taken, please tap ${updatedVacant[0]} or ${updatedVacant[1]}`;
          } else {
            const last = updatedVacant[updatedVacant.length - 1];
            const rest = updatedVacant.slice(0, -1).join(', ');
            noticeText = `Chair ${seatNumber} just taken, please tap ${rest} or ${last}`;
          }
          setChairTakenNotice({
            seat: seatNumber,
            message: noticeText,
            shakeKey: Date.now(),
          });
        }

        return {
          ...prev,
          vacantSeats: updatedVacant,
        };
      });
    };

    window.addEventListener('chairConflictDetected', handleConflict);
    window.addEventListener('seatOccupiedRealtime', handleRealtimeSeatOccupied);
    return () => {
      window.removeEventListener('chairConflictDetected', handleConflict);
      window.removeEventListener('seatOccupiedRealtime', handleRealtimeSeatOccupied);
    };
  }, []);

  // Real-time sync listener while conflict modal is actively open
  React.useEffect(() => {
    if (!chairConflict?.isOpen) return;

    const unsubscribe = useSharedBridge.subscribe(() => {
      const occupiedInBridge = getOccupiedSeatsFromBridge(chairConflict.table);
      setChairConflict((prev) => {
        if (!prev || !prev.isOpen) return prev;
        const remainingVacant = prev.vacantSeats.filter((s) => !occupiedInBridge.has(s));
        if (remainingVacant.length !== prev.vacantSeats.length) {
          return { ...prev, vacantSeats: remainingVacant };
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [chairConflict?.isOpen, chairConflict?.table]);

  const handleSwitchChair = async (newSeat: number) => {
    if (isCheckingSeat !== null) return;
    setIsCheckingSeat(newSeat);

    const cleanTable = tableRef.current || (chairConflict?.table ?? '');
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const normTable = `T-${String(parseInt(cleanNum(cleanTable), 10) || 1).padStart(2, '0')}`;

    // 1. Instant check against local shared bridge state
    const occupiedSeats = getOccupiedSeatsFromBridge(normTable);
    const isTakenLocally = occupiedSeats.has(newSeat);

    // 2. Fast check against server endpoint
    let isTakenOnServer = false;
    let latestServerVacant: number[] | null = null;

    if (!isTakenLocally) {
      try {
        const token = getOrCreateDeviceToken();
        const res = await fetch(
          `/api/session/verify?table=${encodeURIComponent(normTable)}&seat=${newSeat}&deviceToken=${encodeURIComponent(token)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.isOccupiedByOtherDevice || (data.active && data.order && data.order.items?.length > 0)) {
            isTakenOnServer = true;
          }
          if (Array.isArray(data.vacantSeats)) {
            latestServerVacant = data.vacantSeats;
          }
        }
      } catch {}
    }

    const isSeatTaken = isTakenLocally || isTakenOnServer;

    if (isSeatTaken) {
      setIsCheckingSeat(null);
      const currentVacant = latestServerVacant || (chairConflict?.vacantSeats || []);
      const remaining = currentVacant.filter((s) => s !== newSeat && !occupiedSeats.has(s));

      let noticeText = '';
      if (remaining.length === 0) {
        noticeText = `Chair ${newSeat} just taken. All seats at Table ${normTable} are currently occupied.`;
      } else if (remaining.length === 1) {
        noticeText = `Chair ${newSeat} just taken, please tap ${remaining[0]}`;
      } else if (remaining.length === 2) {
        noticeText = `Chair ${newSeat} just taken, please tap ${remaining[0]} or ${remaining[1]}`;
      } else {
        const last = remaining[remaining.length - 1];
        const rest = remaining.slice(0, -1).join(', ');
        noticeText = `Chair ${newSeat} just taken, please tap ${rest} or ${last}`;
      }

      setChairConflict((prev) => (prev ? { ...prev, vacantSeats: remaining } : null));
      setChairTakenNotice({
        seat: newSeat,
        message: noticeText,
        shakeKey: Date.now(),
      });
      return;
    }

    // Seat is confirmed open!
    setIsCheckingSeat(null);
    setChairTakenNotice(null);
    seatRef.current = newSeat;
    setSeatNumber(newSeat);
    setChairConflict(null);

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('seat', String(newSeat));
        window.history.replaceState({ screen: useCustomerStore.getState().currentScreen }, '', url.toString());
      } catch {}
      try {
        const raw = sessionStorage.getItem('thoogudeepa_verified_session');
        if (raw) {
          const sess = JSON.parse(raw);
          sess.seat = newSeat;
          sessionStorage.setItem('thoogudeepa_verified_session', JSON.stringify(sess));
        }
      } catch {}
    }

    const curStore = useCustomerStore.getState();
    curStore.setSeatNumber(newSeat);
    curStore.resetSession();
    curStore.syncWithActiveSession(normTable, newSeat);
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

    const handleBroadcast = (event: any) => {
      const reason = event?.payload?.reason;
      if (reason === 'VENUE_CLEAN_RESET') {
        const curStore = useCustomerStore.getState();
        const tableId = curStore.tableNumber || tableRef.current;
        const seatId = curStore.seatNumber || seatRef.current;
        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
          sessionStorage.removeItem('thoogudeepa_verified_session');
        } catch {}
        curStore.resetSession();
        hasPlacedOrderRef.current = false;
        return;
      }

      if (
        reason !== 'tableVacated' &&
        reason !== 'chairCleared' &&
        reason !== 'billSettled' &&
        reason !== 'settledBillRecorded'
      ) return;

      const curStore = useCustomerStore.getState();
      const tableId = curStore.tableNumber || tableRef.current;
      const seatId = curStore.seatNumber || seatRef.current;

      // Only act if the customer has already placed an order or is currently on tracking/payment
      // (pre-order browsing must never be disrupted by unrelated events)
      if (!hasPlacedOrderRef.current) {
        if (curStore.currentScreen >= 5 && curStore.currentScreen <= 7) {
          hasPlacedOrderRef.current = true;
        } else {
          return;
        }
      }

      // Extract inner payload defensively across direct and wrapped structures
      const inner = (event?.payload?.payload || event?.payload || {}) as Record<string, any>;
      const rawTable = inner.tableNumber || inner.tableName || event?.payload?.tableNumber;
      const evtTable = typeof rawTable === 'string' ? rawTable : undefined;
      const rawSeat = inner.seatNumber !== undefined ? inner.seatNumber : event?.payload?.seatNumber;
      const evtSeat = rawSeat !== undefined && rawSeat !== null ? Number(rawSeat) : undefined;

      // If the event targets a specific table that is not ours, ignore it
      if (evtTable && cleanTableNum(evtTable) !== cleanTableNum(tableId)) return;

      // ── SETTLEMENT BILL ARRIVED: Show Screen 8 directly ──
      if (reason === 'billSettled' || reason === 'settledBillRecorded') {
        const snapshot = (event?.payload?.payload || event?.payload) as any;
        if (!snapshot || !snapshot.invoiceNumber) return;
        const snapSeat = typeof snapshot.seatNumber === 'number'
          ? snapshot.seatNumber
          : (snapshot.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(snapshot.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);

        // Transition to confirmation invoice screen if this bill is for our seat or entire table
        if (snapSeat === undefined || snapSeat === seatId) {
          if (curStore.currentScreen !== 8) {
            curStore.handleBillSettledByWaiter(snapshot);
          }
        }
        return;
      }

      // Don't interrupt Screen 8 (confirmation) — payment invoice is already actively displayed
      if (curStore.currentScreen === 8) return;

      // ── CHAIR CLEARED EVENT ──
      if (reason === 'chairCleared') {
        // If seat number is provided and does NOT match our seat, IGNORE completely!
        if (typeof evtSeat === 'number' && evtSeat !== seatId) return;

        // If seat number is not a number, DO NOT reset our session if we have active ordered items
        if (typeof evtSeat !== 'number') return;

        // If this IS our seat: check if there is an active settled bill snapshot to display Screen 8
        const bridgeState = useSharedBridge.getState();
        const cleanT = cleanTableNum(tableId);
        const normTbl = `T-${String(parseInt(cleanT, 10) || 1).padStart(2, '0')}`;
        const chairBill = bridgeState.settledBills?.[`${normTbl}-CHAIR-${seatId}`] || bridgeState.settledBills?.[normTbl];

        if (chairBill) {
          curStore.handleBillSettledByWaiter(chairBill);
          return;
        }

        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
        } catch {}
        curStore.resetSession();
        hasPlacedOrderRef.current = false;
        return;
      }

      // ── TABLE VACATED EVENT ──
      if (reason === 'tableVacated') {
        // Multi-seat protection: If this customer holds ordered dishes in their cart,
        // do not reset unless the bridge table status is truly VACANT and no active items remain
        const hasActiveOrderedItems = curStore.cart.some((ci) => ci && ci.isOrdered);

        const bridgeState = useSharedBridge.getState();
        const bridgeTbl = bridgeState.tables.find(
          (t) => cleanTableNum(t.number) === cleanTableNum(tableId)
        );

        if (hasActiveOrderedItems && bridgeTbl && bridgeTbl.status !== 'VACANT') {
          return; // Another chair was vacated or partial vacate; keep this customer active
        }

        if (bridgeTbl && bridgeTbl.status === 'VACANT' && !hasActiveOrderedItems) {
          try {
            localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
            localStorage.removeItem('thoogudeepa_customer_session_v1');
          } catch {}
          curStore.resetSession();
          hasPlacedOrderRef.current = false;
        }
        return;
      }
    };

    channel.on('broadcast', { event: 'STATE_CHANGED' }, handleBroadcast);

    // Safety-net poll: verifies with server endpoint so other chairs' sessions are never interrupted
    const vacateCheckInterval = setInterval(async () => {
      if (!hasPlacedOrderRef.current) return;

      const curStore = useCustomerStore.getState();
      const tableId = curStore.tableNumber || tableRef.current;
      const seatId = curStore.seatNumber || seatRef.current;

      // Only relevant for post-order screens; never interrupt browsing or confirmation
      const postOrderScreens = [5, 6, 7, 9, 10];
      if (!postOrderScreens.includes(curStore.currentScreen)) return;

      try {
        const token = getOrCreateDeviceToken();
        const res = await fetch(
          `/api/session/verify?table=${encodeURIComponent(tableId)}&seat=${seatId}&deviceToken=${encodeURIComponent(token)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'VACANT' && !data.active && (!data.order || !data.order.items || data.order.items.length === 0)) {
            try {
              localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
              localStorage.removeItem('thoogudeepa_customer_session_v1');
            } catch {}
            curStore.resetSession();
            hasPlacedOrderRef.current = false;
          }
        }
      } catch {}
    }, 12000);

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

  // Memoised screen element — only recomputes when screen or theme actually changes.
  // Prevents expensive child tree teardown on unrelated parent re-renders.
  const activeScreen = React.useMemo(() => {
    if (isLuxuryDark) {
      switch (currentScreen) {
        case 1: return <Screen1WelcomeLuxury />;
        case 2: return <Screen2MenuLuxury />;
        case 3: return <Screen3ItemDetailLuxury />;
        case 4: return <Screen4CartLuxury />;
        case 5: return <Screen5LiveTrackingLuxury />;
        case 6: return <Screen6PaymentBreakdownLuxury />;
        case 7: return <Screen7PaymentGatewayLuxury />;
        case 8: return <Screen8ConfirmationLuxury />;
        case 9: return <Screen9DigitalBillLuxury />;
        case 10: return <Screen10WaiterCallLuxury />;
        default: return <Screen1WelcomeLuxury />;
      }
    }
    switch (currentScreen) {
      case 1: return <Screen1Welcome />;
      case 2: return <Screen2Menu />;
      case 3: return <Screen3ItemDetail />;
      case 4: return <Screen4Cart />;
      case 5: return <Screen5LiveTracking />;
      case 6: return <Screen6PaymentBreakdown />;
      case 7: return <Screen7PaymentGateway />;
      case 8: return <Screen8Confirmation />;
      case 9: return <Screen9DigitalBill />;
      case 10: return <Screen10WaiterCall />;
      default: return <Screen1Welcome />;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen, isLuxuryDark]);

  // Composite key: animate transition when EITHER screen OR theme changes.
  const motionKey = `${currentScreen}-${isLuxuryDark ? 'lux' : 'cls'}`;

  return (
    <main
      onPointerDown={handlePointerDown}
      className="w-full select-none"
      style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <NetworkConnectivityPill />
      <AnimatePresence mode="wait">
        <motion.div
          key={motionKey}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          {activeScreen}
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

              {chairTakenNotice && (
                <motion.div
                  key={chairTakenNotice.shakeKey}
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: [-10, 10, -7, 7, -3, 3, 0], opacity: 1 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="p-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500/80 text-amber-200 text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-amber-950/40"
                >
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                  <span className="flex-1 font-mono tracking-tight text-amber-100">
                    {chairTakenNotice.message}
                  </span>
                </motion.div>
              )}

              {chairConflict.vacantSeats && chairConflict.vacantSeats.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-stone-300 font-medium text-center">
                    Please select an open chair to begin ordering:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    {chairConflict.vacantSeats.map((seatNum) => (
                      <button
                        key={seatNum}
                        disabled={isCheckingSeat !== null}
                        onClick={() => handleSwitchChair(seatNum)}
                        className={`py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-amber-900/30 border border-amber-500/30 ${
                          isCheckingSeat === seatNum ? 'opacity-70 cursor-wait' : ''
                        }`}
                      >
                        {isCheckingSeat === seatNum ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Armchair className="h-4 w-4" />
                        )}
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

      {/* ── Tamper Protection / Physical QR Required Modal ── */}
      <AnimatePresence>
        {tamperConflict?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-[#1C1917] text-white border border-rose-900/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white uppercase">
                    Physical QR Scan Required
                  </h3>
                  <p className="text-xs text-rose-400 font-mono font-bold">
                    Anti-Tampering Active
                  </p>
                </div>
              </div>

              <div className="bg-stone-900/80 rounded-2xl p-4 border border-stone-800 text-sm text-stone-300 space-y-2">
                <p className="leading-snug text-xs text-stone-300">
                  {tamperConflict.message ||
                    'Manual editing or direct URL entry of table and seat parameters is blocked to protect guest dining sessions.'}
                </p>
                <div className="rounded-xl bg-stone-950 p-2.5 border border-stone-800/80 text-[11px] font-mono text-stone-400">
                  Please scan the authentic physical QR code placed on your dining table tent or coaster to begin.
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => {
                    setTamperConflict(null);
                    if (typeof window !== 'undefined') {
                      try {
                        sessionStorage.removeItem('thoogudeepa_verified_session');
                      } catch {}
                      window.location.href = '/';
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg border border-rose-500/30"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Return to Welcome Screen</span>
                </button>

                <a
                  href="/qr-deck"
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Open Table QR Directory</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cross-Seat Active Order Conflict Modal ── */}
      <AnimatePresence>
        {crossSeatConflict?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
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
                    Active Order Detected
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    Table {crossSeatConflict.existingOrder.tableNumber} • Chair {crossSeatConflict.existingOrder.seatNumber}
                  </p>
                </div>
              </div>

              <div className="bg-stone-900/80 rounded-2xl p-4 border border-stone-800 text-sm text-stone-300 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="leading-snug">
                    Your phone has an active dining session with an unpaid order of <strong className="text-white">₹{crossSeatConflict.existingOrder.total}</strong> at <strong className="text-white">Table {crossSeatConflict.existingOrder.tableNumber} Chair {crossSeatConflict.existingOrder.seatNumber}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleReturnToExistingSeat}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-amber-900/30 border border-amber-500/30"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Return to My Order (Chair {crossSeatConflict.existingOrder.seatNumber})</span>
                </button>
              </div>
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
