'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { WaiterPingType } from '../../types/customer';
import { Droplets, Scroll, Utensils, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen10WaiterCall: React.FC = () => {
  const { navigateTo, previousScreen, pingWaiter, waiterNotification, tableNumber } = useCustomer();
  const { pings } = useSharedBridge();
  const activePing = pings?.find((p) => p.tableNumber === tableNumber);
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

  const returnTarget = previousScreen && previousScreen !== 10 ? previousScreen : 2;

  return (
    <ScreenHousing screenNumber={10} screenTitle="Call Waiter">
      {/* Header */}
      <WireHeader
        title="Call Waiter"
        showBack={true}
        onBack={() => navigateTo(returnTarget)}
        showCallWaiter={false}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Active Ping Status Banner */}
        <AnimatePresence>
          {waiterNotification?.active && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 font-black text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                <span>Captain Summoned!</span>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-700">
                {waiterNotification.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Quick Ping Buttons */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            Quick Assistance Buttons
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pingButtons.map((btn) => (
              <motion.button
                key={btn.type}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePing(btn.type)}
                className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs transition hover:border-[#8A4228] hover:bg-[#F3DFCC]/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8D5C3] bg-[#F3DFCC]/50">
                  {btn.icon}
                </div>
                <span className="text-xs font-black text-[#5B5049] text-center">{btn.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Request Textbox */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            Custom Message to Captain
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Please bring extra lemon or mild raita..."
              className="w-full rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] p-3 text-xs font-semibold text-[#5B5049] placeholder:text-[#5B5049]/40 focus:border-[#8A4228] focus:outline-none"
            />
            <button
              onClick={handleSendCustomText}
              disabled={!customText.trim()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#8A4228] py-2.5 text-xs font-black uppercase tracking-wider text-[#FFFCF7] disabled:opacity-50 transition hover:bg-[#71351F]"
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
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <span>Return to Previous Screen</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
