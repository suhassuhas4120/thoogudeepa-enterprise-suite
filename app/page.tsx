'use client';

import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useCustomerStore } from '../store/useCustomerStore';
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

function CustomerJourneyContent() {
  const { currentScreen, setCurrentScreen, setTableNumber, setSeatNumber } = useCustomer();

  // Initialize table and seat from QR code scan query params (?table=T-05&seat=2)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tblParam = params.get('table') || params.get('t');
    const seatParam = params.get('seat') || params.get('chair') || params.get('s');

    let cleanTable = 'T-01';
    let parsedSeat = 1;

    if (tblParam) {
      let raw = tblParam.trim().toUpperCase();
      const match = raw.match(/^T-?(\d+)$/);
      if (match) {
        cleanTable = `T-${String(parseInt(match[1], 10)).padStart(2, '0')}`;
      } else {
        cleanTable = raw;
      }
      setTableNumber(cleanTable);
    }
    if (seatParam) {
      const s = parseInt(seatParam, 10);
      if (!isNaN(s) && s > 0) {
        parsedSeat = s;
        setSeatNumber(s);
      }
    }

    // Sync with live active session for this table & seat immediately
    useCustomerStore.getState().syncWithActiveSession(cleanTable, parsedSeat);

    // Also check table-specific localStorage as fallback if unplaced cart existed
    try {
      const key = `thoogudeepa_customer_session_${cleanTable}_s${parsedSeat}`;
      const raw = localStorage.getItem(key) || localStorage.getItem('thoogudeepa_customer_session_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        const curStore = useCustomerStore.getState();
        if (curStore.cart.length === 0 && Array.isArray(parsed.cart) && parsed.cart.length > 0) {
          useCustomerStore.setState({
            cart: parsed.cart,
            currentScreen: parsed.currentScreen || 1,
            orderStage: parsed.orderStage || 'PLACED',
            itemTracking: parsed.itemTracking || [],
            payment: parsed.payment || curStore.payment,
          });
        }
      }
    } catch {}
  }, [setTableNumber, setSeatNumber]);

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
