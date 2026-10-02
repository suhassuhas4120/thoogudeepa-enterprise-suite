'use client';

import React, { useState, useEffect } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { Wifi, ArrowRight, Crown, CheckCircle2, Sparkles, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export const Screen1Welcome: React.FC = () => {
  const {
    setCurrentScreen,
    guestName,
    setGuestName,
    venueName,
    tableNumber,
    setTableNumber,
  } = useCustomer();

  const [wifiConnected, setWifiConnected] = useState(false);
  const [seatNumber, setSeatNumber] = useState<number>(1);
  const [activeOrderFound, setActiveOrderFound] = useState<any | null>(null);
  const [checkingSession, setCheckingSession] = useState(false);

  // 1. Read ?table=A-01&seat=1 from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tbl = (params.get('table') || tableNumber || 'A-01').toUpperCase();
    const seat = parseInt(params.get('seat') || '1', 10);
    setTableNumber(tbl);
    setSeatNumber(seat);

    // 2. The 80% Action: Zero Data Loss / Session Recovery Check
    // If the diner closed the browser, locked screen, or switched networks,
    // check if this table + seat has an active unpaid order in Supabase.
    async function checkExistingSeatSession() {
      try {
        setCheckingSession(true);
        const { data: tickets, error } = await supabase
          .from('kds_tickets')
          .select('*, order_items(*)')
          .eq('table_number', tbl)
          .neq('status', 'COMPLETED')
          .order('created_at', { ascending: false });

        if (!error && tickets && tickets.length > 0) {
          // Find any ticket with items matching this seat
          const seatMatch = tickets.find((t) =>
            t.server_name?.toLowerCase().includes(`seat ${seat}`) ||
            t.order_items?.some((it: any) => it.name.includes(`[Seat ${seat}]`))
          );
          if (seatMatch) {
            setActiveOrderFound(seatMatch);
          }
        }
      } catch (err) {
        console.warn('Session recovery check error:', err);
      } finally {
        setCheckingSession(false);
      }
    }

    checkExistingSeatSession();
  }, [setTableNumber]);

  const handleProceed = () => {
    if (!guestName.trim()) setGuestName(`Seat ${seatNumber}`);
    if (activeOrderFound) {
      setCurrentScreen(5); // Jump straight to Live Tracking
    } else {
      setCurrentScreen(2); // Fresh menu
    }
  };

  return (
    <ScreenHousing screenNumber={1} screenTitle="WELCOME & CONNECT">
      <div className="flex h-full min-h-[90vh] flex-col justify-between bg-[#FFFCF7] p-5 text-[#5B5049]">
        {/* Top: Venue Logo & Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-3 pt-6 text-center"
        >
          <motion.div
            initial={{ rotate: -8, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
            className="relative flex h-24 w-24 flex-col items-center justify-center rounded-[28px] border border-[#E8D5C3] bg-[#F3DFCC] p-2 shadow-sm"
          >
            <Crown className="relative h-10 w-10 text-[#8A4228] stroke-[1.8]" />
            <span className="relative mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#8A4228]">
              THOOGUDEEPA
            </span>
          </motion.div>

          <div className="mt-1 w-full">
            <div className="mt-2 rounded-[24px] border border-[#E8D5C3] bg-[#FFFCF7] px-4 py-3 shadow-xs">
              <h2 className="text-base font-black tracking-[0.08em] text-[#5B5049] uppercase">
                {venueName}
              </h2>
              <p className="mt-1 text-[11px] font-medium text-[#5B5049]/80 capitalize">
                Authentic Donne Biryani &amp; Military Flavours
              </p>
            </div>
          </div>

          {/* Tabletop Edge Physical Seat Badge */}
          <div className="flex items-center gap-2 rounded-full border border-[#E8D5C3] bg-[#F3DFCC]/80 px-3.5 py-1 text-[11px] font-black tracking-wide text-[#8A4228] shadow-xs">
            <MapPin className="h-3.5 w-3.5 text-[#8A4228]" />
            <span>TABLE {tableNumber}</span>
            <span className="text-[#8A4228]/40">•</span>
            <span>SEAT {seatNumber}</span>
          </div>

          {/* Zero Data Loss / Session Recovery Banner */}
          {activeOrderFound && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-2xl border border-emerald-300 bg-emerald-50/80 p-3 text-left shadow-xs"
            >
              <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Active Dine-In Session Restored!</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-emerald-700">
                Found your ongoing order. Tapping below resumes your live kitchen tracker and bill.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Middle: Wi-Fi + Mobile Data */}
        <div className="my-4 flex flex-col gap-3">
          {/* Wi-Fi Connect */}
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setWifiConnected(true)}
              className={`flex w-full items-center justify-center gap-2 rounded-[20px] border py-3.5 px-4 text-[11px] font-extrabold tracking-[0.12em] shadow-xs transition ${
                wifiConnected
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]'
              }`}
            >
              {wifiConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Wi-Fi Connected — Free High-Speed</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-[#8A4228] animate-pulse" />
                  <span>Connect To Restaurant Free Wi-Fi</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Continue with Mobile Data */}
          <div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleProceed}
              className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-[#8A4228] bg-[#8A4228] py-3.5 px-4 text-[11px] font-black tracking-[0.12em] text-[#FFFCF7] shadow-sm transition hover:bg-[#71351F]"
            >
              <span>🌐</span>
              <span className="capitalize">
                {activeOrderFound ? 'Resume Ongoing Order' : 'Continue With Mobile Data'}
              </span>
            </motion.button>
          </div>

          {/* Diner Name (Optional) */}
          <div className="mt-1">
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your Name (Optional)"
              className="w-full rounded-[20px] border border-[#E8D5C3] bg-[#FFFCF7] px-4 py-3 text-xs font-semibold text-[#5B5049] placeholder:text-[#5B5049]/40 focus:border-[#8A4228] focus:outline-none focus:ring-1 focus:ring-[#8A4228]/30 shadow-xs"
            />
          </div>
        </div>

        {/* Bottom: Direct Menu Proceed + Platform Badge */}
        <div className="flex flex-col items-center pb-4 pt-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleProceed}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-[#8A4228] bg-[#8A4228] py-3.5 px-4 text-[11px] font-black tracking-[0.12em] text-[#FFFCF7] shadow-md hover:bg-[#71351F] transition"
          >
            <span>{activeOrderFound ? 'VIEW LIVE ORDER TRACKER' : 'PROCEED TO MENU'}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </motion.button>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 rounded-full border border-[#E8D5C3] bg-[#FFFCF7] px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#5B5049] shadow-xs">
              <Sparkles className="h-3 w-3 text-[#D08A52]" />
              <span className="capitalize">Powered by Thoogudeepa SaaS</span>
            </div>
          </div>
        </div>
      </div>
    </ScreenHousing>
  );
};
