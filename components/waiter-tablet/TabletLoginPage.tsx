'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  ChevronRight,
  Delete,
  CheckCircle2,
  AlertCircle,
  User,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface Props {
  onLogin: (captainName: string, section?: string) => void;
}

// Ready Steward Names requested by user: nayana, shiva, manja, suhas
const QUICK_STEWARDS = [
  { name: 'Nayana', sec: 'Section C', label: 'Nayana (Sec C)' },
  { name: 'Shiva', sec: 'Section A', label: 'Shiva (Sec A)' },
  { name: 'Manja', sec: 'Section B', label: 'Manja (Sec B)' },
  { name: 'Suhas', sec: 'Section D', label: 'Suhas (Sec D)' },
];

const SECTIONS = [
  { id: 'ALL', label: 'ALL SECTIONS' },
  { id: 'Section A', label: 'Section A (Express Hall)' },
  { id: 'Section B', label: 'Section B (Main Dining)' },
  { id: 'Section C', label: 'Section C (Family Section)' },
  { id: 'Section D', label: 'Section D (Courtyard Garden)' },
];

export function TabletLoginPage({ onLogin }: Props) {
  const [waiterName, setWaiterName] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectQuickSteward = (steward: typeof QUICK_STEWARDS[0]) => {
    // Autofill the name input section
    setWaiterName(steward.name);
    setSelectedSection(steward.sec);
    setError('');
  };

  const handleDigit = (d: string) => {
    if (pin.length >= 4 || success) return;
    const nextPin = pin + d;
    setPin(nextPin);
    setError('');
  };

  const handleDelete = () => {
    if (success) return;
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    if (success) return;
    setPin('');
    setError('');
  };

  const executeLogin = (finalPin: string) => {
    const trimmed = waiterName.trim();
    if (!trimmed) {
      setError('Please enter or select a captain name.');
      inputRef.current?.focus();
      return;
    }

    // Universal PIN 1234 or direct pins
    if (finalPin === '1234' || finalPin === '1111' || finalPin === '2222' || finalPin === '3333' || finalPin === '4444') {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        onLogin(trimmed, selectedSection);
      }, 700);
    } else {
      setError('Invalid PIN code. Use default 1234');
      setTimeout(() => {
        setPin('');
        setError('');
      }, 1200);
    }
  };

  // Auto-login when 4 digits entered
  React.useEffect(() => {
    if (pin.length === 4) {
      executeLogin(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const numpadDigits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <div className="w-full h-full flex overflow-hidden bg-[#FAF8F5] select-none">
      {/* ── Left Branding & Overview Panel (38%) ── */}
      <div className="w-[38%] h-full bg-[#1C1917] flex flex-col justify-between p-8 text-white relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#FFF 1px, transparent 1px), radial-gradient(#FFF 1px, #1C1917 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400">
              Live Terminal
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-stone-400 border border-stone-800 bg-stone-900/80 px-2.5 py-1 rounded-xl">
            Console v2.4
          </span>
        </div>

        {/* Center Hotel Identity */}
        <div className="relative z-10 space-y-4 my-auto">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#9C3D1E] to-[#7B2E15] flex items-center justify-center shadow-2xl border-2 border-[#D28835]/50">
            <Utensils className="h-10 w-10 text-amber-200 stroke-[2.2]" />
          </div>

          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-[#E07A5F]">
              Floor Captain Console
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight mt-1 leading-tight">
              Thoogudeepa<br />Donne Biryani Mane
            </h1>
            <p className="text-stone-400 text-xs font-mono mt-2 leading-relaxed">
              High-throughput table management, KDS ordering &amp; instant cashier terminal.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 pt-4">
            {[
              { label: 'Tables', val: '32' },
              { label: 'Sections', val: '4' },
              { label: 'Capacity', val: '138' },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 text-center"
              >
                <p className="text-xl font-black text-amber-400 font-mono">{m.val}</p>
                <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom PIN Hint */}
        <div className="relative z-10 pt-4 border-t border-stone-800 flex items-center justify-between text-stone-400 text-xs font-mono">
          <span>Standard Demo PIN:</span>
          <span className="font-black text-amber-400 bg-stone-900 px-2.5 py-1 rounded-xl border border-stone-800">
            1234
          </span>
        </div>
      </div>

      {/* ── Right Login Input Panel (62%) ── */}
      <div className="w-[62%] h-full flex flex-col justify-between p-8 overflow-y-auto">
        <div className="space-y-5 max-w-xl mx-auto w-full">
          {/* Section 1: Captain Name with Quick Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#9C3D1E]" />
                <span>Captain / Steward Name</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/20 px-2 py-0.5 rounded-md">
                Required
              </span>
            </div>

            {/* Quick Name Chips (Nayana, Shiva, Manja, Suhas) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {QUICK_STEWARDS.map((st) => {
                const isSelected = waiterName.toLowerCase() === st.name.toLowerCase();
                return (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => handleSelectQuickSteward(st)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border-2 transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span>{st.name}</span>
                    <span className={`text-[10px] opacity-80 ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                      ({st.sec.replace('Section ', '')})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manual Name Input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={waiterName}
                onChange={(e) => {
                  setWaiterName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type your name or tap a quick steward above"
                className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-[#9C3D1E] rounded-2xl text-sm font-mono font-black text-stone-900 placeholder:text-stone-400 focus:outline-none shadow-xs transition"
              />
            </div>
          </div>

          {/* Section 2: Assigned Floor Section (ALL, Sec A, Sec B, Sec C, Sec D) */}
          <div className="space-y-2">
            <label className="font-mono text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#9C3D1E]" />
              <span>Assigned Floor Section</span>
            </label>

            <div className="space-y-1.5">
              {/* Row 1: ALL Sections */}
              <button
                type="button"
                onClick={() => setSelectedSection('ALL')}
                className={`w-full py-2.5 px-4 rounded-xl border-2 font-mono text-xs font-black transition cursor-pointer flex items-center justify-between ${
                  selectedSection === 'ALL'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>ALL SECTIONS (Entire Restaurant Floor)</span>
                {selectedSection === 'ALL' && (
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </button>

              {/* Rows 2 & 3: Section A, B, C, D */}
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.filter((s) => s.id !== 'ALL').map((sec) => {
                  const isSecSelected = selectedSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setSelectedSection(sec.id)}
                      className={`py-2 px-3 rounded-xl border-2 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                        isSecSelected
                          ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{sec.label}</span>
                      {isSecSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Standard Clean 4-Digit PIN & Numpad */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-black uppercase tracking-wider text-stone-800">
                Security PIN Code
              </label>
              {error ? (
                <span className="text-xs font-mono font-bold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </span>
              ) : (
                <span className="text-xs font-mono text-stone-500 font-bold">
                  Enter 4 Digits
                </span>
              )}
            </div>

            {/* PIN Indicator Circles / Boxes */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <motion.div
                    key={idx}
                    animate={
                      pin.length === idx + 1
                        ? { scale: [1, 1.15, 1] }
                        : {}
                    }
                    className={`h-12 w-14 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-xl transition ${
                      filled
                        ? success
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : error
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-[#9C3D1E] bg-[#FFF8F5] text-[#9C3D1E]'
                        : 'border-stone-300 bg-white text-stone-400'
                    }`}
                  >
                    {filled ? '●' : ''}
                  </motion.div>
                );
              })}
            </div>

            {/* Standard Clean 3x4 Numpad */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-sm mx-auto">
              {numpadDigits.map((row, rIdx) =>
                row.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDigit(d)}
                    className="h-12 rounded-2xl bg-white border-2 border-stone-300 hover:border-stone-400 active:bg-stone-100 font-mono font-black text-lg text-stone-900 transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
                  >
                    {d}
                  </button>
                ))
              )}

              {/* Bottom Row: Clear, 0, Backspace */}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-2xl bg-stone-100 border-2 border-stone-300 hover:bg-stone-200 active:scale-95 font-mono font-bold text-xs text-stone-700 transition cursor-pointer flex items-center justify-center"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="h-12 rounded-2xl bg-white border-2 border-stone-300 hover:border-stone-400 active:bg-stone-100 font-mono font-black text-lg text-stone-900 transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="h-12 rounded-2xl bg-stone-100 border-2 border-stone-300 hover:bg-stone-200 active:scale-95 font-mono text-stone-700 transition cursor-pointer flex items-center justify-center"
              >
                <Delete className="h-5 w-5 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Start Shift CTA Button */}
        <div className="max-w-xl mx-auto w-full pt-4">
          <button
            type="button"
            onClick={() => executeLogin(pin || '1234')}
            disabled={success}
            className={`w-full py-4 rounded-2xl font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              success
                ? 'bg-emerald-600 text-white'
                : 'bg-[#9C3D1E] hover:bg-[#7d3018] text-white active:scale-98'
            }`}
          >
            {success ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Shift Started · Redirecting...</span>
              </>
            ) : (
              <>
                <span>Start Shift</span>
                <ChevronRight className="h-5 w-5 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
