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
import { getSyncBroadcastChannel } from '../lib/supabase';

// Normalise a raw table param like "T-5", "T05", "5" → "T-05"
function normTableId(raw: string): string {
  const upper = raw.trim().toUpperCase();
  const m = upper.match(/^T-?(\d+)$/);
  if (m) return `T-${String(parseInt(m[1], 10)).padStart(2, '0')}`;
  return upper;
}

function CustomerJourneyContent() {
  const { currentScreen, setCurrentScreen, setTableNumber, setSeatNumber } = useCustomer();

  // Parsed once from URL; stable for the lifetime of this page load
  const tableRef = React.useRef('T-01');
  const seatRef = React.useRef(1);

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

    // Always wipe the OLD global (unscoped) key — it causes cross-seat contamination
    try {
      localStorage.removeItem('thoogudeepa_customer_session_v1');
    } catch {}

    // Step 1: Sync with the live bridge state for this specific table+seat
    useCustomerStore.getState().syncWithActiveSession(cleanTable, parsedSeat);

    // Step 2: If bridge sync left cart empty AND there is a table+seat specific saved session,
    // restore it — but ONLY if it belongs to THIS table and seat, and the table is not VACANT
    try {
      const scopedKey = `thoogudeepa_customer_session_${cleanTable}_s${parsedSeat}`;
      const saved = localStorage.getItem(scopedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const curStore = useCustomerStore.getState();

        // Check bridge: if the table is now VACANT, the saved session is stale — discard it
        const bridgeTables = useSharedBridge.getState().tables;
        const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
        const bridgeTbl = bridgeTables.find(
          (t) => cleanNum(t.number) === cleanNum(cleanTable)
        );
        const tableIsVacant = !bridgeTbl || bridgeTbl.status === 'VACANT';

        if (!tableIsVacant && curStore.cart.length === 0 && Array.isArray(parsed.cart) && parsed.cart.length > 0) {
          // Validate the saved session belongs to this exact table and seat
          const savedTable = parsed.tableNumber ? normTableId(parsed.tableNumber) : '';
          const savedSeat = parsed.seatNumber ?? 0;
          if (savedTable === cleanTable && savedSeat === parsedSeat) {
            useCustomerStore.setState({
              cart: parsed.cart,
              currentScreen: parsed.currentScreen || 1,
              orderStage: parsed.orderStage || 'PLACED',
              itemTracking: parsed.itemTracking || [],
              payment: parsed.payment || curStore.payment,
            });
          } else {
            // Stale entry for a different seat/table — discard
            try { localStorage.removeItem(scopedKey); } catch {}
          }
        } else if (tableIsVacant) {
          // Table vacated since this session was saved — wipe it
          try { localStorage.removeItem(scopedKey); } catch {}
        }
      }
    } catch {}
  }, [setTableNumber, setSeatNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Real-time vacate / settle listener ────────────────────────────────────
  // When the waiter vacates the table, we need to reset the customer session
  // immediately (on any device, including the customer's phone that already has
  // an open tab). This subscribes to the Supabase broadcast channel.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = getSyncBroadcastChannel();

    const handleBroadcast = (event: { payload: { reason?: string; payload?: unknown } }) => {
      const reason = event?.payload?.reason;
      if (reason !== 'tableVacated' && reason !== 'chairCleared') return;

      // Only act if our table is affected
      const tableId = tableRef.current;
      const seatId = seatRef.current;
      const bridgeState = useSharedBridge.getState();
      const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
      const bridgeTbl = bridgeState.tables.find(
        (t) => cleanNum(t.number) === cleanNum(tableId)
      );

      if (!bridgeTbl || bridgeTbl.status === 'VACANT') {
        // Our table got vacated — reset customer session completely
        const curStore = useCustomerStore.getState();
        // Only reset if the customer hasn't already settled (to avoid disrupting Screen 8)
        // Exception: if table is now VACANT, the session is definitively over even if isSettled=true
        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
        } catch {}
        curStore.resetSession();
      }
    };

    channel.on('broadcast', { event: 'STATE_CHANGED' }, handleBroadcast);

    // Also poll bridge every 4 seconds as a safety net for cross-device vacate
    const vacateCheckInterval = setInterval(() => {
      const tableId = tableRef.current;
      const seatId = seatRef.current;
      const curStore = useCustomerStore.getState();

      // If customer is already on screen 1 or settled, nothing to do
      if (curStore.currentScreen === 1 || curStore.currentScreen === 8) return;

      const bridgeState = useSharedBridge.getState();
      const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
      const bridgeTbl = bridgeState.tables.find(
        (t) => cleanNum(t.number) === cleanNum(tableId)
      );

      // If table is VACANT and customer still has an active session (screen 2-7, 9-10)
      if (bridgeTbl && bridgeTbl.status === 'VACANT') {
        const activeScreens = [2, 3, 4, 5, 6, 7, 9, 10];
        if (activeScreens.includes(curStore.currentScreen)) {
          try {
            localStorage.removeItem(`thoogudeepa_customer_session_${tableId}_s${seatId}`);
            localStorage.removeItem('thoogudeepa_customer_session_v1');
          } catch {}
          curStore.resetSession();
        }
      }
    }, 4000);

    return () => {
      clearInterval(vacateCheckInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
