'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { WaiterPingType } from '../../types/customer';
import { Droplets, Scroll, Utensils, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';
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
  const { pings } = useSharedBridge();
  // Check live shared bridge pings for this table
  const pendingPing = pings?.find(
    (p) => p.tableNumber === tableNumber && p.status === 'PENDING'
  );
  const resolvedPing = pings?.find(
    (p) => p.tableNumber === tableNumber && p.status === 'RESOLVED'
  );

  const isPending = Boolean(pendingPing || waiterNotification?.active);
  const isResolved = !pendingPing && Boolean(resolvedPing);

  const [customText, setCustomText] = useState('');

  const handlePing = (type: WaiterPingType) => {
    pingWaiter(type);
  };

  const handleSendCustomText = () => {
    if (!customText.trim()) return;
    pingWaiter('GENERAL CALL', customText.trim());
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
              {tableNumber} • C-{String(seatNumber || 1).padStart(2, '0')}
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
        {/* Active Ping Status Banner (Reactive to Waiter Acknowledgement) */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                <CheckCircle2 className="h-4 w-4 text-amber-600 animate-pulse" />
                <span>Captain Summoned! (Pending Acknowledgment)</span>
              </div>
              <p className="mt-1 text-xs font-medium text-amber-800">
                {pendingPing?.message || waiterNotification?.message || 'Floor Captain has been alerted.'}
              </p>
            </motion.div>
          )}

          {!isPending && isResolved && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 font-black text-xs text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Captain Attending Table {tableNumber}!</span>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-700">
                Floor Captain has acknowledged and attended your request for {resolvedPing?.type || 'Assistance'}.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Quick Ping Buttons */}
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
            {pingButtons.map((btn) => (
              <motion.button
                key={btn.type}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePing(btn.type)}
                className="flex flex-col items-center justify-center gap-2 rounded-[22px] border p-4 shadow-xs transition hover:opacity-90"
                style={{
                  backgroundColor: currentTheme.colors.bgSurface,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                  style={{
                    backgroundColor: currentTheme.colors.secondaryBg,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  {btn.icon}
                </div>
                <span
                  className="text-xs font-black text-center"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  {btn.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Request Textbox */}
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] font-mono"
            style={{ color: currentTheme.colors.textMuted }}
          >
            Custom Message to Captain
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Please bring extra lemon or mild raita..."
              className="w-full rounded-2xl border p-3 text-xs font-semibold focus:outline-none"
              style={{
                backgroundColor: currentTheme.colors.bgElevated,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
            />
            <button
              onClick={handleSendCustomText}
              disabled={!customText.trim()}
              style={{
                backgroundColor: currentTheme.colors.buttonBg,
                color: currentTheme.colors.buttonFg,
                boxShadow: currentTheme.colors.buttonShadow,
              }}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider disabled:opacity-50 transition hover:brightness-105"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Request to Waiter</span>
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
    </ScreenHousing>
  );
};
