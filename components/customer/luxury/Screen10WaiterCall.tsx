'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { StickyBottomBar } from '../../ui/StickyBottomBar';
import { WaiterPingType } from '../../../types/customer';
import { Droplets, Scroll, Utensils, Sparkles, Send, ArrowRight, CreditCard, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore } from '../../../store/useCustomerStore';

export const Screen10WaiterCall: React.FC = () => {
  const { currentTheme } = useCustomerTheme();
  const {
    navigateTo,
    previousScreen,
    pingWaiter,
    waiterNotification,
    tableNumber,
    seatNumber,
    venueName,
  } = useCustomer();
  const { pings, kdsTickets, tables } = useSharedBridge();
  const [customText, setCustomText] = useState('');
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  const isTableMatch = (a?: string, b?: string) => {
    if (!a || !b) return false;
    const normA = a.toUpperCase().replace(/\s+/g, '').replace('TABLE', '').replace('T-', '');
    const normB = b.toUpperCase().replace(/\s+/g, '').replace('TABLE', '').replace('T-', '');
    return normA === normB || (parseInt(normA, 10) > 0 && parseInt(normA, 10) === parseInt(normB, 10));
  };

  const tableTickets = kdsTickets.filter((tk) => isTableMatch(tk.tableNumber, effectiveTable));
  const currentTbl = tables.find((t) => isTableMatch(t.number, effectiveTable));

  // Latch served status so transient reconciliation frames never cause payment options to flicker
  const [hasEverBeenFullyServed, setHasEverBeenFullyServed] = useState(false);

  const rawAllDishesServed = useMemo(() => {
    const chairTickets = kdsTickets.filter(
      (tk) => isTableMatch(tk.tableNumber, effectiveTable) &&
              (tk.seatNumber === effectiveSeat || tk.items.some((i) => i.seatNumber === effectiveSeat))
    );
    const chairItems = chairTickets.flatMap((t) => t.items).filter(
      (it) => it.seatNumber === effectiveSeat || !it.seatNumber
    );
    if (!chairItems.length) return false;
    return chairItems.every((it) => it.stage === 'SERVED');
  }, [kdsTickets, effectiveTable, effectiveSeat]);

  useEffect(() => {
    if (rawAllDishesServed) {
      setHasEverBeenFullyServed(true);
    } else {
      const chairTickets = kdsTickets.filter(
        (tk) => isTableMatch(tk.tableNumber, effectiveTable) &&
                (tk.seatNumber === effectiveSeat || tk.items.some((i) => i.seatNumber === effectiveSeat))
      );
      const chairItems = chairTickets.flatMap((t) => t.items).filter(
        (it) => it.seatNumber === effectiveSeat || !it.seatNumber
      );
      if (chairItems.some((it) => it.stage !== 'SERVED')) {
        setHasEverBeenFullyServed(false);
      }
    }
  }, [rawAllDishesServed, kdsTickets, effectiveTable, effectiveSeat]);

  const allDishesServed = rawAllDishesServed || hasEverBeenFullyServed;

  // Check if payment ping is active for this chair to prevent spamming
  const hasActivePaymentPing = useMemo(() => {
    return (
      (waiterNotification?.active && waiterNotification.type === 'PAYMENT') ||
      pings.some(
        (p) =>
          isTableMatch(p.tableNumber, effectiveTable) &&
          p.type === 'PAYMENT' &&
          p.status === 'PENDING' &&
          p.seatNumber === effectiveSeat
      )
    );
  }, [pings, effectiveTable, effectiveSeat, waiterNotification]);

  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handlePing = (type: WaiterPingType) => {
    if (type === 'PAYMENT') {
      if (!allDishesServed) return;
      setShowPaymentConfirmModal(true);
      return;
    }
    if (cooldownRemaining > 0) return;
    setCooldownRemaining(45);
    pingWaiter(type, customText.trim() || undefined);
    if (customText.trim()) setCustomText('');
  };

  const handleConfirmPaymentCall = () => {
    setShowPaymentConfirmModal(false);
    pingWaiter('PAYMENT', `Customer requested bill settlement at Table ${effectiveTable} (Chair ${effectiveSeat})`);
    // Navigate to Screen 5 Live Tracking where the message is displayed
    navigateTo(5);
  };

  const handleSendCustomText = () => {
    const textToSend = customText.trim() || 'Floor Captain assistance requested at table';
    pingWaiter('GENERAL CALL', textToSend);
    setCustomText('');
  };

  const pingButtons: { type: WaiterPingType; label: string; icon: React.ReactNode }[] = [
    {
      type: 'WATER',
      label: 'Drinking Water',
      icon: <Droplets className="h-6 w-6 text-[#2563EB]" />,
    },
    {
      type: 'TISSUE',
      label: 'Extra Tissues',
      icon: <Scroll className="h-6 w-6 text-[#5B5049]" />,
    },
    {
      type: 'CUTLERY',
      label: 'Cutlery & Salad',
      icon: <Utensils className="h-6 w-6 text-[#D08A52]" />,
    },
    {
      type: 'TABLE CLEAN',
      label: 'Table Cleaning',
      icon: <Sparkles className="h-6 w-6 text-[#198754]" />,
    },
    {
      type: 'PAYMENT',
      label: 'Bill & Payment Settlement',
      icon: <CreditCard className="h-6 w-6 text-[#9C3D1E]" />,
    },
  ];

  const returnTarget = previousScreen && previousScreen !== 10 && previousScreen !== 9 ? previousScreen : 2;

  return (
    <ScreenHousing screenNumber={9} screenTitle="CALL WAITER">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Call Waiter</span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black font-mono tracking-tight border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
              {effectiveTable} • C-{String(effectiveSeat).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName?.toUpperCase()}
        showBack={true}
        onBack={() => navigateTo(returnTarget)}
        showCallWaiter={false}
        showCart={false}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Active Ping Status Banner */}
        <AnimatePresence>
          {waiterNotification?.active && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-[24px] border p-4 shadow-lg backdrop-blur-md text-center ${
                waiterNotification.attended
                  ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-stone-900/80 to-emerald-950/70'
                  : 'border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-stone-900/80 to-amber-950/70'
              }`}
            >
              {waiterNotification.attended ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-200 font-serif-luxury">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Request Attended!</span>
                    </div>
                    <button
                      onClick={() => useCustomerStore.getState().dismissWaiterNotification()}
                      className="text-stone-400 hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-emerald-100/90 text-left leading-relaxed">
                    {waiterNotification.message || 'Floor Captain has attended to your request.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 font-bold text-xs text-amber-200 font-serif-luxury mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Floor Captain notified. Please wait at your seat.</span>
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  {waiterNotification.message && (
                    <p className="text-xs font-normal text-stone-300 leading-relaxed">
                      {waiterNotification.message}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heritage Concierge Table Chime */}
        <div className="relative overflow-hidden rounded-[30px] border border-amber-500/35 bg-gradient-to-br from-amber-950/50 via-stone-900/90 to-black/95 p-5 text-center shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center">
            <motion.button
              whileTap={{ scale: 0.92, rotate: -2 }}
              onClick={() => handlePing('GENERAL CALL')}
              className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-400/50 bg-gradient-to-b from-amber-500/30 to-amber-950/60 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all cursor-pointer hover:border-amber-300"
            >
              <Sparkles className="h-7 w-7 text-amber-300 drop-shadow-sm animate-pulse" />
              <div className="absolute inset-0 rounded-3xl border border-amber-300/30 animate-ping pointer-events-none opacity-40" />
            </motion.button>
            <h3 className="mt-3 text-sm font-bold font-serif-luxury text-amber-100">
              Heritage Service Chime
            </h3>
            <p className="text-[10.5px] text-stone-400 max-w-[240px] mt-0.5">
              Tap chime to ring table bell for Floor Captain Suresh
            </p>
          </div>

          {/* Contextual Rapid Assistance Chips */}
          <div className="mt-4 pt-3.5 border-t border-amber-500/15 flex flex-wrap gap-1.5 justify-center">
            {[
              'Extra Biryani Sherva',
              'Sliced Lime & Onion',
              'Warm Finger Bowl',
              'Banana Leaf Change',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setCustomText(chip);
                  pingWaiter('GENERAL CALL', chip);
                }}
                className="rounded-full px-2.5 py-1 text-[10px] font-bold border border-amber-500/30 bg-black/40 text-amber-200/90 hover:border-amber-400 hover:text-amber-100 transition active:scale-95"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ping Buttons */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/80 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
            Quick Assistance Buttons
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pingButtons.map((btn) => {
              const isPayment = btn.type === 'PAYMENT';
              const isPaymentDisabled = isPayment
                ? !allDishesServed || hasActivePaymentPing
                : cooldownRemaining > 0;

              return (
                <motion.button
                  key={btn.type}
                  disabled={isPaymentDisabled}
                  whileTap={!isPaymentDisabled ? { scale: 0.95 } : undefined}
                  onClick={() => handlePing(btn.type)}
                  className={`flex ${
                    isPayment
                      ? `col-span-2 flex-row items-center justify-center gap-3 p-4 border ${
                          isPaymentDisabled
                            ? hasActivePaymentPing
                              ? 'bg-amber-950/30 border-amber-500/30 text-amber-300 opacity-80 cursor-not-allowed'
                              : 'bg-stone-900/40 border-white/5 opacity-50 cursor-not-allowed text-stone-500'
                            : 'bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-amber-500/20 border-amber-400/40 cursor-pointer hover:border-amber-400 shadow-lg'
                        }`
                      : `flex-col items-center justify-center gap-2.5 p-4 border border-white/10 bg-white/5 hover:border-amber-400/30 ${
                          !isPayment && cooldownRemaining > 0
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`
                  } rounded-[24px] shadow-sm transition backdrop-blur-md`}
                >
                  <div className={`flex ${isPayment ? 'h-10 w-10' : 'h-12 w-12'} items-center justify-center rounded-2xl border border-amber-400/30 bg-black/40`}>
                    {btn.icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-serif-luxury text-sm font-bold ${isPayment ? 'text-amber-200' : 'text-center text-amber-100'}`}>
                      {isPayment && hasActivePaymentPing
                        ? 'Captain Summoned'
                        : !isPayment && cooldownRemaining > 0
                        ? `${btn.label} (${cooldownRemaining}s)`
                        : btn.label}
                    </span>
                    {isPayment && hasActivePaymentPing ? (
                      <span className="text-[10px] text-amber-400/80 font-medium">
                        (Captain on the way to Chair {effectiveSeat})
                      </span>
                    ) : isPayment && !allDishesServed ? (
                      <span className="text-[10px] text-stone-400 font-medium">
                        (Unlocks once all dishes are served to your chair)
                      </span>
                    ) : null}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Custom Request Textbox (Optional) */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/80 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury flex items-center justify-between">
            <span>Custom Message to Captain</span>
            <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono">Optional</span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Please bring extra lemon or mild raita (optional)..."
              className="w-full rounded-2xl border border-amber-500/30 bg-black/40 p-3.5 text-xs font-medium text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(217,119,6,0.25)] transition backdrop-blur-md"
            />
            <button
              onClick={handleSendCustomText}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[20px] py-3 text-xs font-bold font-serif-luxury uppercase tracking-wider transition hover:brightness-105 active:scale-98 cursor-pointer text-stone-950 border border-amber-300/60 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
              }}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{customText.trim() ? 'Send Message to Waiter' : 'Call Waiter to Table'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo(returnTarget)}
          className="flex w-full items-center justify-between rounded-[22px] px-5 py-3.5 text-xs font-bold font-serif-luxury uppercase tracking-wider shadow-lg transition hover:brightness-105 text-stone-950 border border-amber-300/60"
          style={{
            background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
          }}
        >
          <span>Return to Previous Screen</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>

      {/* Confirmation Modal for Calling Waiter for Payment */}
      <AnimatePresence>
        {showPaymentConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#1C1610] to-[#0E0B08] p-6 shadow-2xl border border-amber-500/40 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 mb-3 mx-auto">
                <CreditCard className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-amber-100 font-serif-luxury">
                Call Floor Captain for Payment?
              </h3>
              <p className="mt-2 text-xs text-stone-300 leading-relaxed font-normal">
                Are you sure you want to call the Floor Captain for payment at <span className="font-bold text-amber-300">{effectiveTable} (Chair C-{String(effectiveSeat).padStart(2, '0')})</span>?
              </p>
              <p className="mt-1 text-[11px] text-stone-400 font-normal">
                A captain will visit your seat with the payment terminal.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPaymentConfirmModal(false)}
                  className="rounded-[20px] border border-white/10 bg-white/5 py-3 text-xs font-bold text-stone-300 transition hover:bg-white/10 active:scale-95 cursor-pointer"
                >
                  No, Go Back
                </button>
                <button
                  onClick={handleConfirmPaymentCall}
                  className="rounded-[20px] py-3 text-xs font-bold text-stone-950 shadow-md transition hover:brightness-105 active:scale-95 cursor-pointer font-serif-luxury border border-amber-300/60"
                  style={{
                    background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
                  }}
                >
                  Yes, Call Captain
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ScreenHousing>
  );
};
