'use client';

import React, { useState, useRef } from 'react';
import {
  Utensils,
  Delete,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onLogin: (name: string, section?: string) => void;
}

export const WAITER_NAMES: Record<string, string> = {
  '1111': 'Ramesh — Section A',
  '2222': 'Suresh — Section B',
  '3333': 'Nayana — Section C',
  '4444': 'Vennela — Section D',
};

const QUICK_STEWARDS = [
  { name: 'Ramesh', sec: 'SEC_A' },
  { name: 'Suresh', sec: 'SEC_B' },
  { name: 'Nayana', sec: 'SEC_C' },
  { name: 'Vennela', sec: 'SEC_D' },
];

export function ScreenM1StaffLogin({ onLogin }: Props) {
  const [waiterName, setWaiterName] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [dotsBounce, setDotsBounce] = useState(false);
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
    if (code in WAITER_NAMES) {
      const mapped = WAITER_NAMES[code];
      const [namePart, secPart] = mapped.split(' — ');
      const secCode = secPart.includes('A') ? 'SEC_A' : secPart.includes('B') ? 'SEC_B' : secPart.includes('C') ? 'SEC_C' : 'SEC_D';
      const effectiveName = waiterName.trim() || namePart;
      setWaiterName(effectiveName);
      setSelectedSection(secCode);
      setPinSuccess(true);
      setPinError(false);
      setNameError(false);
      setTimeout(() => { onLogin(effectiveName, secCode); }, 350);
      return;
    }
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
      setTimeout(() => { onLogin(trimmedName, selectedSection); }, 350);
    } else {
      setPinError(true);
      setDotsBounce(true);
      setTimeout(() => setDotsBounce(false), 400);
      setTimeout(() => { setPin(''); setPinError(false); }, 1000);
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
    <main className="h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-[#FAF8F5] to-[#FFF0E8] flex flex-col justify-between font-sans w-full relative select-none px-4 pt-4 overflow-hidden">

      {/* ── TOP SECTION ── */}
      <div className="shrink-0 space-y-4">

        {/* Brand header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#EAE5DF]">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#9C3D1E] to-[#7B2E15] flex items-center justify-center text-white shadow-md shadow-[#9C3D1E]/20 shrink-0 border border-[#D28835]/40">
            <Utensils className="h-5 w-5 text-amber-200" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-stone-900 text-sm font-black tracking-tight uppercase truncate">
              Thoogudeepa Donne Biryani Mane
            </h1>
          </div>
        </div>

        {/* Name picker + input */}
        <div className="space-y-2.5">
          <label className="font-mono text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-[#9C3D1E]" />
            <span>Name</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {QUICK_STEWARDS.map((st) => {
              const isSelected = waiterName.toLowerCase().trim() === st.name.toLowerCase();
              return (
                <button
                  key={st.name}
                  type="button"
                  onClick={() => { setWaiterName(st.name); setSelectedSection(st.sec); setNameError(false); }}
                  className={`py-3 px-1.5 rounded-xl font-mono text-xs font-black border-2 transition text-center truncate shadow-2xs ${
                    isSelected
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-sm'
                      : 'bg-white text-stone-800 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {st.name}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={waiterName}
              onChange={(e) => {
                setWaiterName(e.target.value);
                if (nameError && e.target.value.trim()) setNameError(false);
              }}
              placeholder="Enter name"
              className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none shadow-2xs transition ${
                waiterName.length > 0 ? 'pr-10' : ''
              } ${
                nameError
                  ? 'border-rose-500 ring-2 ring-rose-200'
                  : 'border-[#EAE5DF] focus:border-[#9C3D1E] focus:ring-1 focus:ring-[#9C3D1E]'
              }`}
            />
            {waiterName.length > 0 && (
              <button
                type="button"
                onClick={() => { setWaiterName(''); setNameError(false); inputRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-stone-200 hover:bg-stone-300 text-stone-500 hover:text-stone-700 transition active:scale-90"
                title="Clear name"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {nameError && (
            <motion.p
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-600 font-mono text-[10.5px] font-bold flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
              <span>Please enter your name first</span>
            </motion.p>
          )}
        </div>

        {/* Floor section selector */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setSelectedSection('ALL')}
            className={`w-full py-3.5 px-3 rounded-xl border-2 font-mono text-xs font-black transition flex items-center justify-center shadow-2xs ${
              selectedSection === 'ALL'
                ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                : 'bg-white text-stone-800 border-[#EAE5DF] hover:bg-[#FAF8F5]'
            }`}
          >
            ALL
          </button>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'SEC_A', label: 'Section A' },
              { id: 'SEC_B', label: 'Section B' },
              { id: 'SEC_C', label: 'Section C' },
              { id: 'SEC_D', label: 'Section D' },
            ].map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSection(sec.id)}
                className={`py-2.5 px-1 rounded-xl border-2 font-mono text-xs font-black transition text-center truncate shadow-2xs ${
                  selectedSection === sec.id
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-stone-800 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── NUMPAD SECTION ── */}
      <div className="shrink-0 space-y-3">

        {/* PIN dots */}
        <div className="text-center space-y-1">
          <motion.div
            animate={pinError ? { x: [0, -9, 9, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.35 }}
            className={`flex justify-center gap-5 py-1 ${dotsBounce ? 'animate-bounce' : ''}`}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-5 w-5 rounded-full border-2 border-[#9C3D1E] transition-all duration-150 ${
                  pinSuccess
                    ? 'bg-emerald-500 border-emerald-500 scale-110'
                    : pin.length > i
                    ? 'bg-[#9C3D1E] scale-105'
                    : 'bg-transparent'
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
                <span>Verified</span>
              </motion.p>
            )}
            {pinError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-600 font-mono text-xs font-black flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span>Invalid PIN</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Keypad grid */}
        <motion.div
          onPanEnd={(_, info) => { if (info.offset.x < -35) handleBackspace(); }}
          className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto px-1 touch-pan-y"
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <motion.button
              key={digit}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-16 w-full rounded-2xl bg-white border-2 border-[#EAE5DF] shadow-xs hover:border-[#9C3D1E] active:bg-stone-100 text-stone-900 font-mono font-black text-2xl flex items-center justify-center transition-all duration-150"
            >
              {digit}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleClear}
            className="h-16 w-full rounded-2xl bg-white border-2 border-[#EAE5DF] shadow-xs hover:border-[#9C3D1E] text-stone-600 font-mono text-xs font-black flex items-center justify-center gap-1 transition-all duration-150"
          >
            <RotateCcw className="h-4 w-4 text-stone-400" />
            <span>CLR</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => handleDigit('0')}
            className="h-16 w-full rounded-2xl bg-white border-2 border-[#EAE5DF] shadow-xs hover:border-[#9C3D1E] active:bg-stone-100 text-stone-900 font-mono font-black text-2xl flex items-center justify-center transition-all duration-150"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleBackspace}
            className="h-16 w-full rounded-2xl bg-white border-2 border-[#EAE5DF] shadow-xs hover:border-[#9C3D1E] text-stone-600 hover:text-rose-600 flex items-center justify-center transition-all duration-150"
          >
            <Delete className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* ── LOGIN BUTTON ── */}
      <div className="shrink-0 pt-3 pb-3 border-t border-[#EAE5DF]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleUnlockClick}
          disabled={pin.length < 4 || !waiterName.trim() || pinSuccess}
          className={`w-full py-3.5 rounded-xl font-mono text-sm font-black shadow-md flex items-center justify-center gap-2 transition ${
            pin.length === 4 && waiterName.trim().length > 0 && !pinSuccess
              ? 'bg-[#9C3D1E] hover:bg-[#853216] text-white shadow-[#9C3D1E]/20 cursor-pointer'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Login</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </main>
  );
}
