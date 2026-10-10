'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { WaiterPingType } from '../../types/customer';
import { Droplets, Scroll, Utensils, Sparkles, Send, ArrowRight, CreditCard, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const activeItems = tableTickets.flatMap((t) => t.items);
  const currentTbl = tables.find((t) => isTableMatch(t.number, effectiveTable));

  // Strict check: only enabled when all ordered dishes are served
  const allDishesServed = useMemo(() => {
    if (!activeItems.length) return false;
    return activeItems.every((it) => {
      if (it.stage === 'SERVED') return true;
      const matched = currentTbl?.activeItems?.find(
        (ai) => ai.name.toLowerCase().includes(it.name.toLowerCase()) || it.name.toLowerCase().includes(ai.name.toLowerCase())
      );
      return matched?.status === 'Served';
    });
  }, [activeItems, currentTbl]);

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
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: currentTheme.colors.bgApp }}>
        {/* Active Ping Status Banner */}
        <AnimatePresence>
          {waiterNotification?.active && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm text-center"
            >
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
              const isPaymentDisabled = isPayment ? !allDishesServed : cooldownRemaining > 0;

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
                            ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
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
                      {!isPayment && cooldownRemaining > 0 ? `${btn.label} (${cooldownRemaining}s)` : btn.label}
                    </span>
                    {isPayment && isPaymentDisabled && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        (Unlocks once all dishes are served to your chair)
                      </span>
                    )}
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
              style={{
                backgroundColor: currentTheme.colors.buttonBg,
                color: currentTheme.colors.buttonFg,
                boxShadow: currentTheme.colors.buttonShadow,
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition hover:brightness-105 active:scale-98 cursor-pointer"
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
          style={{
            backgroundColor: currentTheme.colors.buttonBg,
            color: currentTheme.colors.buttonFg,
            boxShadow: currentTheme.colors.buttonShadow,
          }}
          className="flex w-full items-center justify-between rounded-[20px] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] shadow-lg transition hover:brightness-105"
        >
          <span>Return to Previous Screen</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>

      {/* Confirmation Modal for Calling Waiter for Payment */}
      <AnimatePresence>
        {showPaymentConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-stone-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-3 mx-auto">
                <CreditCard className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-black text-stone-900 text-center">
                Call Floor Captain for Payment?
              </h3>
              <p className="mt-1.5 text-xs text-stone-600 text-center leading-relaxed">
                Are you sure you want to call the Floor Captain for payment at <span className="font-bold text-stone-900">{effectiveTable} (Chair C-{String(effectiveSeat).padStart(2, '0')})</span>?
              </p>
              <p className="mt-1 text-[11px] text-stone-500 text-center">
                A captain will visit your seat with the payment terminal.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPaymentConfirmModal(false)}
                  className="rounded-2xl border border-stone-200 bg-stone-100 py-3 text-xs font-bold text-stone-700 transition hover:bg-stone-200 active:scale-95 cursor-pointer"
                >
                  No, Go Back
                </button>
                <button
                  onClick={handleConfirmPaymentCall}
                  className="rounded-2xl bg-[#9C3D1E] py-3 text-xs font-black text-white shadow-md transition hover:bg-[#853218] active:scale-95 cursor-pointer"
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
