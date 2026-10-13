'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { WaiterPingType } from '../../types/customer';
import { Droplets, Scroll, Utensils, Sparkles, Send, CreditCard, AlertCircle, CheckCircle2, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore } from '../../store/useCustomerStore';

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
    if (cooldownRemaining > 0) return;
    const textToSend = customText.trim() || 'Floor Captain assistance requested at table';
    setCooldownRemaining(45);
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
    <ScreenHousing screenNumber={10} screenTitle="CALL WAITER">
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
              {effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`} • C-{String(effectiveSeat).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName?.toUpperCase()}
        showBack={true}
        onBack={() => navigateTo(returnTarget)}
        showCallWaiter={false}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4" style={{ backgroundColor: currentTheme.colors.bgApp }}>
        {/* Active Ping Status Banner */}
        <AnimatePresence>
          {waiterNotification?.active && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-2xl border p-4 shadow-sm text-center ${
                waiterNotification.attended
                  ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              {waiterNotification.attended ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-black text-xs text-emerald-950">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Request Attended!</span>
                    </div>
                    <button
                      onClick={() => useCustomerStore.getState().dismissWaiterNotification()}
                      className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-emerald-800 text-left leading-relaxed">
                    {waiterNotification.message || 'Floor Captain has attended to your request.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 font-black text-xs text-amber-900 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span>Floor Captain notified. Please wait at your seat.</span>
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  </div>
                  {waiterNotification.message && (
                    <p className="text-xs font-medium text-amber-800 leading-relaxed">
                      {waiterNotification.message}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Ping Buttons */}
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] font-mono"
            style={{ color: currentTheme.colors.textMuted }}
          >
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
                      ? `col-span-2 flex-row items-center justify-center gap-3 p-3.5 border ${
                          isPaymentDisabled
                            ? hasActivePaymentPing
                              ? 'bg-amber-50 border-amber-300 text-amber-800 opacity-80 cursor-not-allowed'
                              : 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 cursor-pointer hover:opacity-90'
                        }`
                      : `flex-col items-center justify-center gap-2 p-4 ${
                          !isPayment && cooldownRemaining > 0
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:opacity-90'
                        }`
                  } rounded-[22px] border shadow-xs transition`}
                  style={
                    !isPayment
                      ? {
                          backgroundColor: currentTheme.colors.bgSurface,
                          borderColor: currentTheme.colors.border,
                        }
                      : undefined
                  }
                >
                  <div
                    className={`flex ${isPayment ? 'h-10 w-10' : 'h-12 w-12'} items-center justify-center rounded-2xl border`}
                    style={{
                      backgroundColor: currentTheme.colors.secondaryBg,
                      borderColor: currentTheme.colors.border,
                    }}
                  >
                    {btn.icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <span
                      className={`font-black ${isPayment ? 'text-xs text-[#9C3D1E]' : 'text-xs text-center'}`}
                      style={!isPayment ? { color: currentTheme.colors.textPrimary } : undefined}
                    >
                      {isPayment && hasActivePaymentPing
                        ? 'Captain Summoned'
                        : !isPayment && cooldownRemaining > 0
                        ? `${btn.label} (${cooldownRemaining}s)`
                        : btn.label}
                    </span>
                    {isPayment && hasActivePaymentPing ? (
                      <span className="text-[10px] text-amber-700 font-medium">
                        (Captain on the way to Chair {effectiveSeat})
                      </span>
                    ) : isPayment && !allDishesServed ? (
                      <span className="text-[10px] text-stone-500 font-medium">
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
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] font-mono flex items-center justify-between"
            style={{ color: currentTheme.colors.textMuted }}
          >
            <span>Custom Message to Captain</span>
            <span className="text-[9px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">Optional</span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Please bring extra lemon or mild raita (optional)..."
              className="w-full rounded-2xl border p-3 text-xs font-semibold focus:outline-none"
              style={{
                backgroundColor: currentTheme.colors.bgElevated,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            />
            <button
              onClick={handleSendCustomText}
              disabled={cooldownRemaining > 0}
              style={{
                backgroundColor: currentTheme.colors.buttonBg,
                color: currentTheme.colors.buttonFg,
                boxShadow: currentTheme.colors.buttonShadow,
              }}
              className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition active:scale-98 ${
                cooldownRemaining > 0
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:brightness-105 cursor-pointer'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {cooldownRemaining > 0
                  ? `Please wait (${cooldownRemaining}s)`
                  : customText.trim()
                  ? 'Send Message to Waiter'
                  : 'Call Waiter to Table'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Calling Waiter for Payment */}
      <AnimatePresence>
        {showPaymentConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-[28px] p-5 shadow-2xl border transition-colors duration-200"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border mb-3 mx-auto shadow-xs"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.buttonBg,
                }}
              >
                <CreditCard className="h-6 w-6 stroke-[2]" />
              </div>

              <h3
                className="text-base font-extrabold text-center"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Call Waiter for Payment
              </h3>

              {/* Table & Chair location chip */}
              <div className="mt-2 flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black font-mono border"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    color: currentTheme.colors.textPrimary,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <span>{effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`}</span>
                  <span>•</span>
                  <span>Chair C-{String(effectiveSeat).padStart(2, '0')}</span>
                </span>
              </div>

              {/* Simple Info Note */}
              <div
                className="mt-3.5 flex items-center gap-2.5 rounded-2xl p-3 text-left border"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.borderLight,
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: currentTheme.colors.secondaryBg,
                    color: currentTheme.colors.buttonBg,
                  }}
                >
                  <Info className="h-4 w-4" />
                </div>
                <p
                  className="text-xs leading-snug font-medium"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  A waiter will bring the bill to your chair for payment settlement.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPaymentConfirmModal(false)}
                  className="rounded-2xl border py-3 text-xs font-bold transition active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPaymentCall}
                  className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
                  style={{
                    backgroundColor: currentTheme.colors.buttonBg,
                    color: currentTheme.colors.buttonFg,
                    boxShadow: currentTheme.colors.buttonShadow,
                  }}
                >
                  Call Waiter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ScreenHousing>
  );
};
