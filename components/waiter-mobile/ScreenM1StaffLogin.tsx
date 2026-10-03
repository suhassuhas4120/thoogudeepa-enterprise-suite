'use client';

import React, { useState, useRef } from 'react';
import {
  Utensils,
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
  onLogin: (name: string, section?: string) => void;
}

export function ScreenM1StaffLogin({ onLogin }: Props) {
  const [waiterName, setWaiterName] = useState('');
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
    const trimmedName = waiterName.trim();
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
    const trimmedName = waiterName.trim();
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
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none p-5">
      {/* Top Header with Authentic Hotel Logo & Name */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3.5 pb-3 border-b border-[#EAE5DF]">
          {/* Authentic Logo Icon */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#9C3D1E] to-[#7B2E15] flex items-center justify-center text-white shadow-md shadow-[#9C3D1E]/30 shrink-0 border border-[#D28835]/40">
            <Utensils className="h-6 w-6 text-amber-200" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/20 px-2 py-0.5 rounded-full inline-block">
                Floor Steward Console
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-600 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <h1 className="text-stone-900 text-sm font-black tracking-tight uppercase truncate mt-0.5">
              Thoogudeepa Donne Biryani Mane
            </h1>
            <p className="text-stone-500 text-[10.5px] font-mono truncate">
              Enterprise Dine-In Operations • 34 Tables
            </p>
          </div>
        </div>

        {/* Steward Name Input Field with Placeholder */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] font-black uppercase tracking-wider text-stone-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-stone-500" />
              Steward / Captain Name
            </span>
            <span className="text-[#9C3D1E] font-bold">Required</span>
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={waiterName}
              onChange={(e) => {
                setWaiterName(e.target.value);
                if (nameError && e.target.value.trim()) {
                  setNameError(false);
                }
              }}
              placeholder="Enter Captain / Steward Name"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none shadow-2xs transition ${
                nameError
                  ? 'border-rose-500 ring-2 ring-rose-200'
                  : 'border-[#EAE5DF] focus:border-[#9C3D1E] focus:ring-1 focus:ring-[#9C3D1E]'
              }`}
            />
          </div>
          {nameError && (
            <motion.p
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-600 font-mono text-[10px] font-bold flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
              <span>Please enter your name first before entering PIN</span>
            </motion.p>
          )}
        </div>

        {/* Assigned Dining Section Layout:
            Row 1: ALL (full width)
            Row 2: Section A & Section B
            Row 3: Section C & Section D */}
        <div className="space-y-1.5 pt-1">
          <label className="font-mono text-[10px] font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-stone-500" />
            <span>Assigned Floor Section</span>
          </label>

          <div className="space-y-1.5">
            {/* Row 1: ALL in 1 row */}
            <button
              type="button"
              onClick={() => setSelectedSection('ALL')}
              className={`w-full py-2 px-3 rounded-xl border font-mono text-xs font-black transition flex items-center justify-center gap-2 ${
                selectedSection === 'ALL'
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                  : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              <span>ALL</span>
              {selectedSection === 'ALL' && (
                <span className="text-[9.5px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                  Active
                </span>
              )}
            </button>

            {/* Row 2: Section A & Section B in 1 row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SEC_A', label: 'Section A' },
                { id: 'SEC_B', label: 'Section B' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSection(sec.id)}
                  className={`py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedSection === sec.id
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                      : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>

            {/* Row 3: Section C & Section D in 1 row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SEC_C', label: 'Section C' },
                { id: 'SEC_D', label: 'Section D' },
              ].map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSection(sec.id)}
                  className={`py-2 px-3 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedSection === sec.id
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                      : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PIN Verification & Touch Keypad */}
      <div className="space-y-4 my-auto pt-3">
        {/* Status display / 4 circular PIN dots */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#9C3D1E]" />
            <span className="font-mono text-xs font-black uppercase tracking-wider text-stone-700">
              {pinSuccess ? 'Access Granted' : pinError ? 'PIN Mismatch' : 'Enter 4-Digit Security PIN'}
            </span>
          </div>

          <motion.div
            animate={pinError ? { x: [0, -9, 9, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.35 }}
            className="flex justify-center gap-3.5 py-1"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full border-2 transition-all duration-150 ${
                  pinSuccess
                    ? 'bg-emerald-500 border-emerald-500 scale-110'
                    : pin.length > i
                    ? pinError
                    ? 'bg-rose-500 border-rose-500 scale-105'
                    : 'bg-[#9C3D1E] border-[#9C3D1E] scale-105'
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
                <span>PIN Verified — Unlocking Floor...</span>
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
              <p className="text-stone-400 font-mono text-[10px]">
                Standard Floor PIN: <strong className="text-stone-600">1234</strong>
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Numeric Keypad Buttons */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-white hover:bg-[#FFF8F5] active:bg-stone-100 border border-[#EAE5DF] text-stone-900 font-mono text-xl font-black shadow-xs flex items-center justify-center transition"
            >
              {digit}
            </motion.button>
          ))}

          {/* Clear Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-white hover:bg-stone-100 border border-[#EAE5DF] text-stone-600 font-mono text-xs font-black shadow-xs flex items-center justify-center gap-1 transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
            <span>CLR</span>
          </motion.button>

          {/* Zero Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-white hover:bg-[#FFF8F5] active:bg-stone-100 border border-[#EAE5DF] text-stone-900 font-mono text-xl font-black shadow-xs flex items-center justify-center transition"
          >
            0
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-white hover:bg-rose-50 border border-[#EAE5DF] text-stone-600 hover:text-rose-600 shadow-xs flex items-center justify-center transition"
          >
            <Delete className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Bottom Action CTA */}
      <div className="pt-3 border-t border-[#EAE5DF]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleUnlockClick}
          disabled={pin.length < 4 || !waiterName.trim() || pinSuccess}
          className={`w-full py-3.5 rounded-xl font-mono text-xs font-black shadow-md flex items-center justify-center gap-2 transition ${
            pin.length === 4 && waiterName.trim().length > 0 && !pinSuccess
              ? 'bg-[#9C3D1E] hover:bg-[#853216] text-white shadow-[#9C3D1E]/30 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Unlock Floor Terminal</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </main>
  );
}
