'use client';

import React, { useState, useRef } from 'react';
import {
  Crown,
  ShieldCheck,
  ArrowRight,
  Delete,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  User,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onLogin: (name: string, section: string) => void;
}

export function ScreenT1CaptainLogin({ onLogin }: Props) {
  const [captainName, setCaptainName] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="w-full max-w-md bg-white border border-[#EAE5DF] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {/* ── 1. Top: Proper Hotel Logo in 1 Row ── */}
        <div className="flex justify-center pt-1">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#9C3D1E] to-[#7B2E15] border-2 border-[#D28835]/40 flex flex-col items-center justify-center shadow-md shadow-[#9C3D1E]/20 text-white">
            <Crown className="h-7 w-7 text-amber-200 stroke-[1.8]" />
            <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-200 mt-0.5">
              ESTD 1994
            </span>
          </div>
        </div>

        {/* ── 2. Below Logo: Hotel Name & Subtitle ── */}
        <div className="text-center space-y-1">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-stone-900 uppercase font-mono">
            Thoogudeepa Donne Biryani Mane
          </h1>
          <p className="text-xs text-stone-500 font-mono font-bold">
            Floor Captain Cockpit
          </p>
        </div>

        {/* ── 3. Captain Name Input (Interactive, No Hardcoding) ── */}
        <div className="space-y-1.5 font-mono">
          <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#9C3D1E]" />
              <span>Captain Name</span>
            </span>
            <span className="text-[#9C3D1E] text-[10px] font-bold">Required</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={captainName}
            onChange={(e) => {
              setCaptainName(e.target.value);
              if (nameError && e.target.value.trim()) setNameError(false);
            }}
            placeholder="Enter Captain Name"
            className={`w-full px-4 py-2.5 bg-[#FAF8F5] border-2 rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:bg-white shadow-2xs transition ${
              nameError
                ? 'border-rose-500 ring-2 ring-rose-200'
                : 'border-[#EAE5DF] focus:border-[#9C3D1E]'
            }`}
          />
          {nameError && (
            <motion.p
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-600 font-mono text-[10.5px] font-bold flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
              <span>Please enter Captain Name before entering PIN</span>
            </motion.p>
          )}
        </div>

        {/* ── 4. Assigned Section:
            Row 1: ALL in 1 row
            Row 2: Section A & Section B in 1 row
            Row 3: Section C & Section D in 1 row ── */}
        <div className="space-y-1.5 font-mono">
          <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-stone-500" />
            <span>Assigned Section</span>
          </label>

          <div className="space-y-1.5">
            {/* Row 1: ALL in 1 row */}
            <button
              type="button"
              onClick={() => setSelectedSection('ALL')}
              className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedSection === 'ALL'
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                  : 'bg-[#FAF8F5] text-stone-700 border-[#EAE5DF] hover:bg-white'
              }`}
            >
              <span>ALL</span>
              {selectedSection === 'ALL' && (
                <span className="text-[9.5px] bg-white/20 text-white px-1.5 py-0.2 rounded font-bold">
                  Active
                </span>
              )}
            </button>

            {/* Row 2: Section A & Section B in 1 row */}
            <div className="grid grid-cols-2 gap-2">
              {['Section A', 'Section B'].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-700 border-[#EAE5DF] hover:bg-white'
                  }`}
                >
                  <span>{sec}</span>
                </button>
              ))}
            </div>

            {/* Row 3: Section C & Section D in 1 row */}
            <div className="grid grid-cols-2 gap-2">
              {['Section C', 'Section D'].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSection === sec
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-700 border-[#EAE5DF] hover:bg-white'
                  }`}
                >
                  <span>{sec}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. Security PIN Pad & Dots ── */}
        <div className="space-y-3 pt-1">
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#9C3D1E]" />
              <span className="font-mono text-xs font-black uppercase tracking-wider text-stone-700">
                {pinSuccess ? 'Access Granted' : pinError ? 'PIN Mismatch' : 'Enter 4-Digit Security PIN'}
              </span>
            </div>

            {/* 4 Circular PIN Dots */}
            <motion.div
              animate={pinError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.35 }}
              className="flex justify-center gap-3 py-1"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-150 ${
                    pinSuccess
                      ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-xs'
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
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-700 font-mono text-xs font-bold flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>PIN Verified — Unlocking Cockpit...</span>
                </motion.p>
              )}
              {pinError && (
                <motion.p
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-600 font-mono text-xs font-bold flex items-center justify-center gap-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>INVALID PIN — ENTER 1234</span>
                </motion.p>
              )}
              {!pinSuccess && !pinError && (
                <p className="text-stone-400 font-mono text-[10px]">
                  Standard Floor PIN: <strong className="text-stone-600">1234</strong>
                </p>
              )}
            </AnimatePresence>
          </div>

          {/* Tactile Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <motion.button
                key={digit}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-11 rounded-xl bg-[#FAF8F5] hover:bg-white active:bg-stone-100 border border-[#EAE5DF] text-stone-900 font-mono text-lg font-black shadow-2xs flex items-center justify-center transition cursor-pointer"
              >
                {digit}
              </motion.button>
            ))}

            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleClear}
              className="h-11 rounded-xl bg-white hover:bg-stone-100 border border-[#EAE5DF] text-stone-600 font-mono text-xs font-black shadow-2xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
              <span>CLR</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => handleDigit('0')}
              className="h-11 rounded-xl bg-[#FAF8F5] hover:bg-white active:bg-stone-100 border border-[#EAE5DF] text-stone-900 font-mono text-lg font-black shadow-2xs flex items-center justify-center transition cursor-pointer"
            >
              0
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleBackspace}
              className="h-11 rounded-xl bg-white hover:bg-rose-50 border border-[#EAE5DF] text-stone-600 hover:text-rose-600 shadow-2xs flex items-center justify-center transition cursor-pointer"
            >
              <Delete className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* ── 6. Unlock CTA Button ── */}
        <div className="pt-2 border-t border-stone-100">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleUnlockClick}
            disabled={pin.length < 4 || !captainName.trim() || pinSuccess}
            className={`w-full py-3.5 rounded-xl font-mono text-xs font-black shadow-md flex items-center justify-center gap-2 transition ${
              pin.length === 4 && captainName.trim().length > 0 && !pinSuccess
                ? 'bg-[#9C3D1E] hover:bg-[#853216] text-white shadow-[#9C3D1E]/20 cursor-pointer active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Unlock Captain Cockpit</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </main>
  );
}
