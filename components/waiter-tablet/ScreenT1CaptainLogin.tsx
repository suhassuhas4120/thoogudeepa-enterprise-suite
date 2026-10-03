'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Tablet,
  ShieldCheck,
  ArrowRight,
  Delete,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  User,
  Layers,
  Armchair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  onLogin: (name: string, section: string) => void;
}

export function ScreenT1CaptainLogin({ onLogin }: Props) {
  const { tables, kdsTickets } = useSharedBridge();
  const [captainName, setCaptainName] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || pinSuccess) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      verifyPin(next);
    }
  };

  const verifyPin = (code: string) => {
    const trimmedName = captainName.trim();
    if (!trimmedName) {
      setNameError(true);
      inputRef.current?.focus();
      return;
    }

    if (code === '1234') {
      setPinSuccess(true);
      setPinError(false);
      setNameError(false);
      setTimeout(() => {
        onLogin(trimmedName, selectedSection);
      }, 350);
    } else {
      setPinError(true);
      setTimeout(() => {
        setPin('');
        setPinError(false);
      }, 1000);
    }
  };

  const handleBackspace = () => {
    if (pinError || pinSuccess) return;
    setPin((p) => p.slice(0, -1));
  };

  const handleClear = () => {
    if (pinSuccess) return;
    setPin('');
    setPinError(false);
  };

  const handleUnlockClick = () => {
    const trimmedName = captainName.trim();
    if (!trimmedName) {
      setNameError(true);
      inputRef.current?.focus();
      return;
    }
    if (pin.length === 4) {
      verifyPin(pin);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between font-sans p-5 sm:p-8 select-none">
      {/* ── Top Header with Authentic Hotel Logo & Name ── */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#EAE5DF]">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#9C3D1E] to-[#7B2E15] flex items-center justify-center text-white shadow-md shadow-[#9C3D1E]/20 border border-[#D28835]/40 shrink-0">
            <Tablet className="h-6 w-6 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/20 px-2.5 py-0.5 rounded-full inline-block">
                Floor Captain Cockpit
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Terminal Online
              </span>
            </div>
            <h1 className="text-stone-900 text-base sm:text-lg font-black tracking-tight uppercase mt-0.5 font-mono truncate">
              Thoogudeepa Donne Biryani Mane
            </h1>
            <p className="text-stone-500 text-xs font-mono truncate">
              Captain Floor Terminal • 34 Tables • 133 Chairs
            </p>
          </div>
        </div>

        {/* Live Terminal Clock & Station Metadata */}
        <div className="hidden sm:flex flex-col items-end font-mono">
          <span className="text-xs font-black text-stone-900">{currentTime}</span>
          <span className="text-[10px] text-stone-500 font-bold">TERMINAL: #CPT-TAB-01</span>
        </div>
      </header>

      {/* ── Main Tablet 2-Column Split View ── */}
      <div className="max-w-5xl w-full mx-auto my-auto py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): Captain Profile, Section Selector & Live Pre-Flight Floor Stats */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {/* Captain Profile Card */}
          <div className="bg-white border border-[#EAE5DF] rounded-3xl p-6 shadow-xs space-y-4">
            {/* Captain Name Field */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-black uppercase tracking-wider text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#9C3D1E]" />
                  Captain / Steward Name
                </span>
                <span className="text-[#9C3D1E] text-[10px] font-bold">Required</span>
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={captainName}
                  onChange={(e) => {
                    setCaptainName(e.target.value);
                    if (nameError && e.target.value.trim()) setNameError(false);
                  }}
                  placeholder="Enter Captain / Steward Name"
                  className={`w-full px-4 py-3 bg-white border-2 rounded-2xl text-sm font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none shadow-2xs transition ${
                    nameError
                      ? 'border-rose-500 ring-2 ring-rose-200'
                      : 'border-[#EAE5DF] focus:border-[#9C3D1E] focus:ring-2 focus:ring-[#9C3D1E]/20'
                  }`}
                />
              </div>
              {nameError && (
                <motion.p
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-600 font-mono text-xs font-bold flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>Please enter Captain / Steward Name before entering PIN</span>
                </motion.p>
              )}
            </div>

            {/* Assigned Floor Section Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="font-mono text-xs font-black uppercase tracking-wider text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-stone-500" />
                  Assigned Floor Section
                </span>
                <span className="font-mono text-[10px] text-stone-400 font-bold lowercase">
                  (select coverage)
                </span>
              </label>

              <div className="space-y-2">
                {/* Row 1: ALL in 1 row */}
                <button
                  type="button"
                  onClick={() => setSelectedSection('ALL')}
                  className={`w-full py-2.5 px-4 rounded-2xl border-2 font-mono text-xs font-black transition flex items-center justify-between ${
                    selectedSection === 'ALL'
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                      : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>ALL FLOOR PLAN</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedSection === 'ALL'
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      34 Tables • 133 Chairs
                    </span>
                  </div>
                  {selectedSection === 'ALL' && <CheckCircle2 className="h-4 w-4" />}
                </button>

                {/* Row 2: Section A & Section B in 1 row */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'Section A', label: 'Section A', desc: 'T-01 to T-04 (Couple)' },
                    { id: 'Section B', label: 'Section B', desc: 'T-05 to T-14 (Main Hall)' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSection(sec.id)}
                      className={`py-2.5 px-3.5 rounded-2xl border-2 font-mono text-xs font-bold transition flex flex-col items-start justify-center gap-0.5 ${
                        selectedSection === sec.id
                          ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                          : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black">{sec.label}</span>
                        {selectedSection === sec.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span
                        className={`text-[9.5px] truncate ${
                          selectedSection === sec.id ? 'text-amber-200' : 'text-stone-400'
                        }`}
                      >
                        {sec.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Row 3: Section C & Section D in 1 row */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'Section C', label: 'Section C', desc: 'T-15 to T-24 (Family)' },
                    { id: 'Section D', label: 'Section D', desc: 'T-25 to T-34 (Garden/Feast)' },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSection(sec.id)}
                      className={`py-2.5 px-3.5 rounded-2xl border-2 font-mono text-xs font-bold transition flex flex-col items-start justify-center gap-0.5 ${
                        selectedSection === sec.id
                          ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                          : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black">{sec.label}</span>
                        {selectedSection === sec.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span
                        className={`text-[9.5px] truncate ${
                          selectedSection === sec.id ? 'text-amber-200' : 'text-stone-400'
                        }`}
                      >
                        {sec.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Pre-Flight Floor Status Card */}
          <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-3xl p-4 font-mono shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-stone-700">
              <span className="flex items-center gap-1.5">
                <Armchair className="h-4 w-4 text-[#9C3D1E]" />
                <span>Floor Live Overview</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Realtime CDC
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 bg-white border border-[#EAE5DF] rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Tables</span>
                <span className="text-base font-black text-stone-900">{tables.length}</span>
              </div>
              <div className="p-2.5 bg-white border border-[#EAE5DF] rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-amber-600 uppercase font-bold block">Dining</span>
                <span className="text-base font-black text-amber-700">
                  {tables.filter((t) => t.status === 'OCCUPIED').length}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-[#EAE5DF] rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">Vacant</span>
                <span className="text-base font-black text-emerald-700">
                  {tables.filter((t) => t.status === 'VACANT').length}
                </span>
              </div>
              <div className="p-2.5 bg-white border border-[#EAE5DF] rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-blue-600 uppercase font-bold block">Ready KOT</span>
                <span className="text-base font-black text-blue-700">
                  {kdsTickets.filter((tk) => tk.status === 'READY').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 4-Digit Security PIN Touch Keypad */}
        <div className="md:col-span-5 flex flex-col justify-between bg-white border border-[#EAE5DF] rounded-3xl p-6 shadow-xs space-y-4">
          {/* PIN Status Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#9C3D1E]" />
              <span className="font-mono text-xs font-black uppercase tracking-wider text-stone-700">
                {pinSuccess ? 'Security Access Granted' : pinError ? 'PIN Mismatch' : 'Captain Security PIN'}
              </span>
            </div>

            {/* 4 Circular PIN Dots */}
            <motion.div
              animate={pinError ? { x: [-10, 10, -7, 7, -3, 3, 0] } : {}}
              transition={{ duration: 0.35 }}
              className="flex justify-center gap-4 py-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-4.5 w-4.5 rounded-full border-2 transition-all duration-150 ${
                    pinSuccess
                      ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-sm'
                      : pin.length > i
                      ? pinError
                      ? 'bg-rose-500 border-rose-500 scale-105'
                      : 'bg-[#9C3D1E] border-[#9C3D1E] scale-105 shadow-xs'
                      : 'bg-white border-stone-300 shadow-2xs'
                  }`}
                />
              ))}
            </motion.div>

            <AnimatePresence>
              {pinSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-700 font-mono text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>PIN Verified — Loading Tablet Cockpit...</span>
                </motion.p>
              )}
              {pinError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-600 font-mono text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span>INVALID PIN — ENTER 1234</span>
                </motion.p>
              )}
              {!pinSuccess && !pinError && (
                <p className="text-stone-400 font-mono text-[10.5px]">
                  Universal Captain PIN: <strong className="text-stone-700">1234</strong>
                </p>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full my-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <motion.button
                key={digit}
                whileTap={{ scale: 0.93 }}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-13 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF8F5] active:bg-stone-200 border border-[#EAE5DF] text-stone-900 font-mono text-xl font-black shadow-2xs flex items-center justify-center transition cursor-pointer"
              >
                {digit}
              </motion.button>
            ))}

            {/* Clear Button */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={handleClear}
              className="h-13 rounded-2xl bg-white hover:bg-stone-100 border border-[#EAE5DF] text-stone-600 font-mono text-xs font-black shadow-2xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
              <span>CLR</span>
            </motion.button>

            {/* Zero Button */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={() => handleDigit('0')}
              className="h-13 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF8F5] active:bg-stone-200 border border-[#EAE5DF] text-stone-900 font-mono text-xl font-black shadow-2xs flex items-center justify-center transition cursor-pointer"
            >
              0
            </motion.button>

            {/* Delete Button */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={handleBackspace}
              className="h-13 rounded-2xl bg-white hover:bg-rose-50 border border-[#EAE5DF] text-stone-600 hover:text-rose-600 shadow-2xs flex items-center justify-center transition cursor-pointer"
            >
              <Delete className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Unlock CTA Button */}
          <div className="pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleUnlockClick}
              disabled={pin.length < 4 || !captainName.trim() || pinSuccess}
              className={`w-full py-4 rounded-2xl font-mono text-sm font-black shadow-md flex items-center justify-center gap-2 transition ${
                pin.length === 4 && captainName.trim().length > 0 && !pinSuccess
                  ? 'bg-[#9C3D1E] hover:bg-[#853216] text-white shadow-[#9C3D1E]/30 cursor-pointer active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Unlock Captain Cockpit</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="max-w-5xl w-full mx-auto pt-3 border-t border-[#EAE5DF] flex items-center justify-between text-xs font-mono text-stone-500">
        <span>Thoogudeepa Enterprise POS • Bengaluru Military Style</span>
        <span className="text-emerald-700 font-bold">🔒 Encrypted Captain Cockpit Session</span>
      </footer>
    </main>
  );
}
