'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer, useCustomerStore } from '../../context/CustomerContext';
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
  ChevronDown,
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
  const [showTablePicker, setShowTablePicker] = useState(false);

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
        serverName: 'Captain Ramesh',
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

  const handleSelectTable = (newTableNum: string) => {
    setTableNumber(newTableNum);
    setSeatNumber(1);
    setShowTablePicker(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('table', newTableNum);
      url.searchParams.set('seat', '1');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Connection Handlers: directly advance to Cart as requested
  const handleConnectWifi = () => {
    setCurrentScreen(4);
  };

  const handleContinueMobileData = () => {
    setCurrentScreen(4);
  };

  return (
    <ScreenHousing screenNumber={1} screenTitle="WELCOME & CONNECT">
      <div className="flex flex-col min-h-full bg-gradient-to-b from-[#fffbf7] via-white to-[#fff8f2] p-4 space-y-3 pb-6">
        {/* Row 1: Restaurant Emblem & Venue Header */}
        <div className="flex items-center gap-3 rounded-2xl border border-orange-200/80 bg-white/95 p-3 shadow-xs">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white shadow-md shadow-orange-500/25">
            <Crown className="h-6 w-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                DINE-IN
              </span>
              <span className="text-[10px] font-bold text-slate-400">#BLR-CENTRAL</span>
            </div>
            <h1 className="truncate text-xs font-black tracking-tight text-slate-900 uppercase mt-0.5">
              {venueName}
            </h1>
            <p className="truncate text-[10.5px] font-medium text-slate-500">
              Military Flavours &amp; Seeraga Samba Biryani
            </p>
          </div>
        </div>

        {/* Card 2: Scanned QR Code Verified Table */}
        <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-[10px] font-extrabold uppercase tracking-wide">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <QrCode className="h-3.5 w-3.5 text-emerald-600" />
              <span>QR Code Verified Table</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTablePicker(!showTablePicker)}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-800 hover:bg-emerald-200 transition"
              title="Change table"
            >
              <span>{activeTable.number}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Quick Table Switcher Drawer */}
          {showTablePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm space-y-1.5"
            >
              <div className="text-[9.5px] font-mono font-bold text-slate-500 uppercase">
                Select Restaurant Table:
              </div>
              <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTable(t.number)}
                    className={`rounded-lg py-1 text-center font-mono text-[11px] font-bold border transition ${
                      t.number.toUpperCase() === tableNumber.toUpperCase()
                        ? 'border-orange-500 bg-orange-600 text-white shadow-xs'
                        : 'border-slate-200 bg-stone-50 text-slate-700 hover:bg-orange-50'
                    }`}
                  >
                    {t.number}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="mt-2.5 flex items-center justify-between border-t border-emerald-100/80 pt-2 text-xs">
            <div>
              <div className="text-[9.5px] font-bold text-slate-400 font-mono uppercase">TABLE &amp; SECTION</div>
              <div className="text-sm font-black text-slate-900 font-mono">
                {activeTable.number}
              </div>
              <div className="text-[10.5px] font-semibold text-slate-500">
                {activeTable.section} • {tableCapacity} Chairs
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9.5px] font-bold text-slate-400 font-mono uppercase">ASSIGNED CAPTAIN</div>
              <div className="text-xs font-black text-slate-800">
                {activeTable.serverName || 'Captain Ramesh'}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">Ready to serve</div>
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic Chair / Seat Matrix */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Armchair className="h-4 w-4 text-orange-600" />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-700">
                CHAIR / SEAT ALLOCATION
              </span>
            </div>
            <span className="rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 font-mono text-[10px] font-black text-orange-800">
              CHAIR #{currentSeat}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Scanned QR assigned you to <strong className="text-slate-900 font-bold">Chair #{currentSeat}</strong>. Tap below if seated on another chair:
          </p>

          {/* Chair Buttons */}
          <div className={`grid gap-1.5 pt-0.5 ${tableCapacity <= 3 ? 'grid-cols-3' : tableCapacity <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {Array.from({ length: tableCapacity }, (_, i) => i + 1).map((chairNum) => {
              const isSelected = currentSeat === chairNum;

              return (
                <button
                  key={chairNum}
                  type="button"
                  onClick={() => handleSelectSeat(chairNum)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 transition text-center ${
                    isSelected
                      ? 'border-orange-500 bg-gradient-to-b from-orange-50 to-orange-100/80 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
                  }`}
                >
                  <span className="text-sm">🪑</span>
                  <span className={`font-mono text-[11px] font-black mt-0.5 ${isSelected ? 'text-orange-950' : 'text-slate-800'}`}>
                    Chair {chairNum}
                  </span>
                  <span className={`text-[9px] font-bold mt-0.5 ${
                    isSelected ? 'text-orange-700 font-mono' : 'text-emerald-600'
                  }`}>
                    {isSelected ? '✓ Active' : 'Available'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 4: Diner Name Placeholder (Clean, Optional, Placed Directly ABOVE Connections) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <label className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-700">
                YOUR NAME (OPTIONAL)
              </label>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Optional</span>
          </div>

          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name (Optional)"
            className="w-full rounded-xl border border-slate-200 bg-stone-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none transition shadow-2xs"
          />
        </div>

        {/* Card 5: Connections (Action buttons that directly advance to Cart) */}
        <div className="space-y-2 pt-0.5">
          <div className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
            SELECT NETWORK TO CONTINUE
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleConnectWifi}
            className="flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50/90 to-amber-50/70 p-3.5 shadow-xs hover:border-orange-300 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition">
                <Wifi className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">
                  Connect With Free Restaurant Wi-Fi
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  High-Speed 5G Dining Internet • 0 Data Cost
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-orange-600 group-hover:translate-x-0.5 transition shrink-0" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleContinueMobileData}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-slate-300 hover:bg-slate-50/70 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm group-hover:scale-105 transition">
                <Smartphone className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">
                  Continue With Mobile Data
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  Use Your Own Cellular Network (5G / 4G)
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-700 group-hover:translate-x-0.5 transition shrink-0" />
          </motion.button>
        </div>

        {/* Footer: Powered by Nelja */}
        <div className="flex items-center justify-center gap-1.5 text-center pt-3 pb-1">
          <Sparkles className="h-3 w-3 text-orange-500" />
          <span className="font-mono text-[10px] font-bold text-slate-500 tracking-wider">
            Powered by Nelja
          </span>
        </div>
      </div>
    </ScreenHousing>
  );
};
