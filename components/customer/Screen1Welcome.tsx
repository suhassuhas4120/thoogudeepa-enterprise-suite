'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
// Thoogudeepa Donne Biryani Mane #8A4228 #9C3D1E
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import {
  Crown,
  Wifi,
  QrCode,
  Sparkles,
  ArrowRight,
  User,
  Armchair,
  Smartphone,
  Flame,
  CookingPot,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen1Welcome: React.FC = () => {
  const {
    setCurrentScreen,
    guestName,
    setGuestName,
    venueName,
    tableNumber,
    seatNumber,
    setTableNumber,
    setSeatNumber,
  } = useCustomer();

  const { tables } = useSharedBridge();

  // Dynamic time-based human greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🍛';
    return 'Good Evening 🌙';
  }, []);

  // 1. Read ?table=T-01&seat=1 from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tblParam = params.get('table') || params.get('t') || tableNumber || 'T-01';
    const seatParam = params.get('seat') || params.get('chair') || params.get('s') || String(seatNumber || 1);

    // Normalize table string (e.g. T-1, T1 -> T-01)
    let cleanTable = tblParam.trim().toUpperCase();
    const match = cleanTable.match(/^T-?(\d+)$/);
    if (match) {
      cleanTable = `T-${String(parseInt(match[1], 10)).padStart(2, '0')}`;
    }
    setTableNumber(cleanTable);

    const parsedSeat = parseInt(seatParam, 10);
    setSeatNumber(!isNaN(parsedSeat) && parsedSeat > 0 ? parsedSeat : 1);
  }, [setTableNumber, setSeatNumber]);

  // Dynamically resolve real table data from the shared bridge
  const activeTable = useMemo(() => {
    return (
      tables.find((t) => t.number.toUpperCase() === tableNumber.toUpperCase()) ||
      tables[0] || {
        id: 'tbl-1',
        number: tableNumber || 'T-01',
        section: 'Ground Floor',
        capacity: 4,
        serverName: 'Floor Captain',
      }
    );
  }, [tables, tableNumber]);

  const currentSeat = seatNumber || 1;
  const tableCapacity = activeTable?.capacity || 4;

  const handleSelectSeat = (newSeat: number) => {
    setSeatNumber(newSeat);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('table', activeTable.number);
      url.searchParams.set('seat', newSeat.toString());
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Connection Handlers: advance to Authentic Menu
  const handleConnectWifi = () => {
    setCurrentScreen(2);
  };

  const handleContinueMobileData = () => {
    setCurrentScreen(2);
  };

  return (
    <ScreenHousing screenNumber={1} screenTitle="WELCOME & CONNECT">
      <div className="flex flex-col min-h-full bg-gradient-to-b from-[#fffaf4] via-white to-[#fff8f2] p-4 space-y-3 pb-6">
        {/* Card 1: Restaurant Brand Header - Logo in Row 1, Hotel Name in Row 2 */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-orange-200/90 bg-gradient-to-b from-orange-50/80 via-white to-amber-50/60 p-4 shadow-xs text-center flex flex-col items-center"
        >
          {/* Row 1: Dedicated Hotel Logo Icon (Crafted Culinary Crest with Biryani Pot & Royal Crown) */}
          <div className="relative mb-2">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/30">
              <CookingPot className="h-7 w-7 stroke-[2]" />
              <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-xs ring-2 ring-white">
                <Crown className="h-3 w-3 fill-amber-950 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Row 2: Human Time Greeting, Hotel Name & Tagline */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/90 border border-orange-200/80 px-2.5 py-0.5 text-[9.5px] font-bold text-orange-800 mb-1">
            <span>{timeGreeting}</span>
          </div>

          <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
            {venueName}
          </h1>

          <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[10.5px] font-semibold text-slate-600">
            <Flame className="h-3 w-3 text-orange-600" />
            <span>Authentic Military Donne Biryani</span>
          </div>
        </motion.div>

        {/* Card 2: Scanned Table Information (Clean, Highlighted, Professional) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 font-mono">
                  {activeTable.number} • C-{String(currentSeat).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold text-emerald-700">
                  {activeTable.section} • Dine-In Verified
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-[10px] font-black text-emerald-800 font-mono shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              VERIFIED
            </span>
          </div>
        </motion.div>

        {/* Card 3: Interactive Chair / Seat Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Armchair className="h-4 w-4 text-orange-600" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-800">
                SELECT YOUR CHAIR
              </span>
            </div>
            <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 font-mono text-[10px] font-black text-orange-800">
              C-{String(currentSeat).padStart(2, '0')}
            </span>
          </div>

          {/* Interactive Chair Buttons */}
          <div className={`grid gap-2 pt-0.5 ${tableCapacity <= 3 ? 'grid-cols-3' : tableCapacity <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {Array.from({ length: tableCapacity }, (_, i) => i + 1).map((chairNum) => {
              const isSelected = currentSeat === chairNum;

              return (
                <motion.button
                  key={chairNum}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => handleSelectSeat(chairNum)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 transition-all text-center relative ${
                    isSelected
                      ? 'border-orange-500 bg-gradient-to-b from-orange-50 to-orange-100/90 ring-2 ring-orange-500/25 shadow-xs text-orange-950 font-bold'
                      : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30 text-slate-700'
                  }`}
                >
                  <span className="text-base">🪑</span>
                  <span className={`font-mono text-[11px] font-black mt-0.5 ${isSelected ? 'text-orange-950' : 'text-slate-800'}`}>
                    C-{String(chairNum).padStart(2, '0')}
                  </span>
                  <span className={`text-[9.5px] font-bold mt-0.5 ${
                    isSelected ? 'text-orange-700 font-mono' : 'text-emerald-600'
                  }`}>
                    {isSelected ? '✓ Your Seat' : 'Available'}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Card 4: Diner Name (Clean, Placed Above Connections, NO 'Optional' on right side) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2"
        >
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-orange-600" />
            <label className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-800">
              YOUR NAME
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name (Optional)"
              className="w-full rounded-xl border border-slate-200 bg-stone-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none transition shadow-2xs"
            />
            {guestName.trim() && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                ✓
              </span>
            )}
          </div>
        </motion.div>

        {/* Card 5: Connections (Tactile, High-Conversion Action Cards that directly advance to Cart, NO subtext) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2.5 pt-1"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            type="button"
            onClick={handleConnectWifi}
            className="flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50/80 p-3.5 shadow-xs hover:border-orange-300 hover:shadow-sm transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/25 group-hover:scale-105 transition">
                <Wifi className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-slate-900">
                Connect With Free Restaurant Wi-Fi
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-600 group-hover:translate-x-0.5 transition shrink-0" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            type="button"
            onClick={handleContinueMobileData}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-sm transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8A4228] text-white shadow-sm group-hover:scale-105 transition">
                <Smartphone className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-slate-900">
                Continue With Mobile Data
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-700 group-hover:translate-x-0.5 transition shrink-0" />
          </motion.button>
        </motion.div>

        {/* Footer: Properly Enclosed Badge Container for "Powered by Nelja" */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/95 px-4 py-1.5 shadow-xs backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 font-mono tracking-wider">
              Powered by <span className="font-black text-orange-600">Nelja</span>
            </span>
          </div>
        </div>
      </div>
    </ScreenHousing>
  );
};
