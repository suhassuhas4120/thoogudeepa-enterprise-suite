'use client';

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { motion } from 'framer-motion';

export const Screen1Welcome: React.FC = () => {
  const {
    setCurrentScreen,
    guestName,
    setGuestName,
    tableNumber,
    seatNumber,
    setTableNumber,
    setSeatNumber,
    syncWithActiveSession,
  } = useCustomer();

  const { tables } = useSharedBridge();

  // Read ?table=T-01&seat=1 from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tblParam = params.get('table') || params.get('t') || tableNumber || 'T-01';
    const seatParam = params.get('seat') || params.get('chair') || params.get('s') || String(seatNumber || 1);

    let cleanTable = tblParam.trim().toUpperCase();
    const match = cleanTable.match(/^T-?(\d+)$/);
    if (match) {
      cleanTable = `T-${String(parseInt(match[1], 10)).padStart(2, '0')}`;
    }
    setTableNumber(cleanTable);

    const parsedSeat = parseInt(seatParam, 10);
    setSeatNumber(!isNaN(parsedSeat) && parsedSeat > 0 ? parsedSeat : 1);
  }, [setTableNumber, setSeatNumber]);

  // Formatted display values
  const displayTable = useMemo(() => {
    const rawNum = parseInt(tableNumber.replace(/[^0-9]/g, ''), 10) || 1;
    return `Table ${String(rawNum).padStart(2, '0')}`;
  }, [tableNumber]);

  const displaySeat = useMemo(() => {
    return `Seat ${String(seatNumber || 1).padStart(2, '0')}`;
  }, [seatNumber]);

  const handleEnterSanctuary = () => {
    setCurrentScreen(2);
  };

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] overflow-hidden select-none flex flex-col justify-between items-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #291B0F 0%, #15100B 45%, #0B0806 80%, #050403 100%)',
      }}
    >
      {/* Top Ambient Golden Glow behind Crest */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[300px] rounded-full blur-[100px] opacity-25 pointer-events-none bg-amber-500" />

      {/* Subtle Warm Amber Center Lamp Glow */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[380px] h-[300px] rounded-full blur-[120px] opacity-20 pointer-events-none bg-amber-600" />

      {/* Content wrapper with strictly bounded 100% viewport and zero vertical overflow */}
      <div className="relative z-10 w-full max-w-[400px] h-full mx-auto px-5 py-4 flex flex-col justify-between items-center">
        
        {/* TOP SECTION: Golden Crest Monogram & Brand Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center pt-1 w-full shrink-0"
        >
          {/* Authentic Metallic Gold Monogram Crest with Wreath */}
          <div className="relative w-32 h-20 mb-0.5 flex items-center justify-center">
            <Image
              src="/images/thoogudeepa_crest_transparent.png"
              alt="Thoogudeepa Monogram"
              width={140}
              height={85}
              priority
              className="object-contain drop-shadow-[0_4px_14px_rgba(217,119,6,0.35)]"
            />
          </div>

          {/* Restaurant Title: Thoogudeepa */}
          <h1
            className="text-[30px] sm:text-[32px] font-normal tracking-wide text-transparent bg-clip-text leading-tight"
            style={{
              backgroundImage: 'linear-gradient(180deg, #FDE68A 0%, #E6C280 50%, #B88E4B 100%)',
              fontFamily: "'Playfair Display', 'Cinzel', 'Garamond', 'Georgia', serif",
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Thoogudeepa
          </h1>

          {/* Subtitle: Donne Biryani Mane */}
          <h2
            className="text-[14px] sm:text-[15px] font-normal tracking-wider text-transparent bg-clip-text mt-0.5"
            style={{
              backgroundImage: 'linear-gradient(180deg, #EAD09E 0%, #D4AF67 60%, #9E7A38 100%)',
              fontFamily: "'Playfair Display', 'Cinzel', 'Garamond', 'Georgia', serif",
            }}
          >
            Donne Biryani Mane
          </h2>
        </motion.div>

        {/* MIDDLE SECTION: Frosted Glass Sanctuary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="w-full shrink-0 my-auto py-2"
        >
          <div
            className="relative w-full rounded-[34px] px-6 py-6 text-center border shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            style={{
              background: 'linear-gradient(145deg, rgba(62, 45, 28, 0.45) 0%, rgba(35, 25, 17, 0.55) 50%, rgba(20, 15, 11, 0.65) 100%)',
              borderColor: 'rgba(217, 160, 80, 0.45)',
              boxShadow: '0 0 25px rgba(217, 119, 6, 0.12), inset 0 1px 2px rgba(253, 230, 138, 0.3)',
            }}
          >
            {/* Top Botanical Filigree Flourish */}
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-400/60 to-amber-300" />
              <svg className="w-8 h-4 text-amber-300/80 fill-current" viewBox="0 0 40 20">
                <path d="M20 2 C16 8 8 10 2 12 C10 12 16 14 20 18 C24 14 30 12 38 12 C32 10 24 8 20 2 Z" opacity="0.85" />
              </svg>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent via-amber-400/60 to-amber-300" />
            </div>

            {/* Live Real-time Dynamic Table & Seat Typography */}
            <div
              className="text-[25px] sm:text-[28px] font-normal tracking-wide text-transparent bg-clip-text my-1.5"
              style={{
                backgroundImage: 'linear-gradient(180deg, #FFF0D0 0%, #E6C280 45%, #C2964F 100%)',
                fontFamily: "'Playfair Display', 'Cinzel', 'Garamond', 'Georgia', serif",
                textShadow: '0 2px 14px rgba(0,0,0,0.6)',
              }}
            >
              {displayTable} &bull; {displaySeat}
            </div>

            {/* Bottom Botanical Filigree Flourish */}
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent via-amber-400/60 to-amber-300" />
              <svg className="w-8 h-4 text-amber-300/80 fill-current rotate-180" viewBox="0 0 40 20">
                <path d="M20 2 C16 8 8 10 2 12 C10 12 16 14 20 18 C24 14 30 12 38 12 C32 10 24 8 20 2 Z" opacity="0.85" />
              </svg>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent via-amber-400/60 to-amber-300" />
            </div>
          </div>
        </motion.div>

        {/* BOTTOM SECTION: Guest Input (positioned directly below card) & CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full space-y-3 pb-2 shrink-0"
        >
          {/* Seamless Input Field with Glowing Gold Border */}
          <div className="relative w-full">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest Name"
              className="w-full text-center rounded-[20px] border bg-[#14100D]/90 py-3.5 px-5 text-base font-normal tracking-wide text-amber-100 placeholder:text-stone-500/80 focus:outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
              style={{
                borderColor: 'rgba(217, 160, 80, 0.5)',
                boxShadow: '0 0 16px rgba(217, 119, 6, 0.18), inset 0 1px 3px rgba(0,0,0,0.8)',
                fontFamily: "'Playfair Display', 'Cinzel', 'Garamond', 'Georgia', serif",
              }}
            />
          </div>

          {/* Majestic Embossed Amber-Gold Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            type="button"
            onClick={handleEnterSanctuary}
            className="relative w-full rounded-[32px] py-3.5 px-6 text-center shadow-[0_12px_32px_rgba(180,83,9,0.45)] border transition-all cursor-pointer overflow-hidden active:brightness-95"
            style={{
              background: 'linear-gradient(180deg, #FAD078 0%, #D48C28 45%, #9E5B10 100%)',
              borderColor: 'rgba(253, 230, 138, 0.7)',
              boxShadow: '0 8px 26px rgba(217, 119, 6, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.4)',
            }}
          >
            <span
              className="text-base sm:text-lg font-bold tracking-wide text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
              style={{
                fontFamily: "'Playfair Display', 'Cinzel', 'Garamond', 'Georgia', serif",
              }}
            >
              Enter Dining Sanctuary
            </span>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
};
