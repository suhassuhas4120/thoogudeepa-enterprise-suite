'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
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
    syncWithActiveSession,
  } = useCustomer();

  const { currentTheme } = useCustomerTheme();
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
      try {
        const stored = sessionStorage.getItem('thoogudeepa_verified_session');
        const parsed = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem('thoogudeepa_verified_session', JSON.stringify({
          ...parsed,
          seat: newSeat,
        }));
      } catch {}
      window.history.replaceState({}, '', window.location.pathname || '/');
    }
    syncWithActiveSession(activeTable.number, newSeat);
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
      <div
        className="flex-1 overflow-y-auto flex flex-col items-center justify-between p-6 pb-10 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #241E17 0%, #12100E 50%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Soft Ambient Gold Backlight in Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[90px] opacity-25 pointer-events-none bg-amber-500" />

        {/* Top Header: Majestic Golden Brass Restaurant Monogram & Crest */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center pt-4 z-10"
        >
          {/* Antique Brass Monogram Frame */}
          <div className="relative mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-amber-950/40 text-amber-300 shadow-[0_8px_30px_rgba(217,119,6,0.25)] backdrop-blur-md">
              <span className="font-serif-luxury text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600">
                TH
              </span>
            </div>
            {/* Crown flourish */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-md">
              <Crown className="h-4 w-4 fill-current stroke-[1.5]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight font-serif-luxury text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
            Thoogudeepa
          </h1>
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-200/70 mt-0.5">
            Heritage 1978 &bull; Military Mane
          </span>
        </motion.div>

        {/* Centerpiece: Exquisite Curved Frosted Glass Table Sanctuary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-sm rounded-[36px] p-6 text-center relative border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl z-10 my-auto"
          style={{
            background: 'linear-gradient(145deg, rgba(42, 35, 27, 0.75) 0%, rgba(20, 17, 14, 0.85) 100%)',
          }}
        >
          {/* Subtle Botanical / Filigree Flourish Top */}
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-400/60">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-400/50" />
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-400/50" />
          </div>

          <div className="text-2xl font-bold font-serif-luxury text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 tracking-wide">
            {activeTable.number} &bull; Seat C-{String(currentSeat).padStart(2, '0')}
          </div>

          <p className="text-[11px] font-medium text-stone-400 mt-1">
            {activeTable.section} &bull; Verified Dine-In Sanctuary
          </p>

          {/* Chair Selector Matrix (Polished Gem Pills) */}
          <div className="mt-5 pt-4 border-t border-amber-500/20">
            <div className="flex items-center justify-between mb-2.5 px-1 text-[11px]">
              <span className="text-amber-200/80 font-medium">Select Position</span>
              <span className="text-stone-400">{tableCapacity} Seater</span>
            </div>
            <div className={`grid gap-2 ${tableCapacity <= 3 ? 'grid-cols-3' : tableCapacity <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {Array.from({ length: tableCapacity }, (_, i) => i + 1).map((chairNum) => {
                const isSelected = currentSeat === chairNum;
                return (
                  <button
                    key={chairNum}
                    type="button"
                    onClick={() => handleSelectSeat(chairNum)}
                    className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'border-amber-400 bg-gradient-to-b from-amber-500/30 to-amber-800/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'border-white/10 bg-white/5 text-stone-400 hover:border-amber-400/30'
                    }`}
                  >
                    Seat {chairNum}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Minimal Seamless Guest Name & Glowing Amber Button */}
        <div className="w-full max-w-sm space-y-4 z-10">
          {/* Seamless Minimal Input with Glowing Border */}
          <div className="relative">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest Name (Optional)"
              className="w-full rounded-2xl border border-amber-500/30 bg-black/40 px-5 py-3.5 text-xs font-medium text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(217,119,6,0.25)] transition backdrop-blur-md"
            />
            {guestName.trim() && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-xs font-bold">
                ✓
              </span>
            )}
          </div>

          {/* Majestic Glowing Amber-Gold Rounded Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            type="button"
            onClick={handleConnectWifi}
            className="w-full rounded-[24px] py-4 px-6 text-center shadow-[0_12px_32px_rgba(217,119,6,0.45)] transition-all font-serif-luxury text-base font-bold tracking-wide text-amber-950 border border-amber-300/60"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
            }}
          >
            Enter Dining Sanctuary
          </motion.button>
        </div>
      </div>
    </ScreenHousing>
  );
};
