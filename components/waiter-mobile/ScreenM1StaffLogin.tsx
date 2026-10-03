'use client';

import React, { useState, useRef } from 'react';
import { Utensils, ShieldCheck, ArrowRight, Delete, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DEFAULT_PINS: Record<string, string> = {
  '1234': 'Captain Ramesh — Floor Lead',
  '1111': 'Ramesh — Section A (Couple)',
  '2222': 'Suresh — Section B (Main Hall)',
  '3333': 'Nayana — Section C (Family)',
  '4444': 'Vennela — Section D (Garden)',
};

interface Props {
  onLogin: (name: string) => void;
}

export function ScreenM1StaffLogin({ onLogin }: Props) {
  const [waiterName, setWaiterName] = useState('Captain Ramesh');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  const sections = [
    { id: 'ALL', label: 'All Zones' },
    { id: 'SEC_A', label: 'Couple (Sec A)' },
    { id: 'SEC_B', label: 'Main (Sec B)' },
    { id: 'SEC_C', label: 'Family (Sec C)' },
    { id: 'SEC_D', label: 'Garden (Sec D)' },
  ];

  const quickStaff = [
    { name: 'Captain Ramesh', section: 'SEC_A', pin: '1111' },
    { name: 'Captain Suresh', section: 'SEC_B', pin: '2222' },
    { name: 'Captain Nayana', section: 'SEC_C', pin: '3333' },
    { name: 'Captain Vennela', section: 'SEC_D', pin: '4444' },
  ];

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || pinSuccess) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      verifyPin(next);
    }
  };

  const verifyPin = (code: string) => {
    const isValid = code === '1234' || Boolean(DEFAULT_PINS[code]);
    if (isValid) {
      setPinSuccess(true);
      setPinError(false);
      const assignedName = waiterName.trim() || DEFAULT_PINS[code] || 'Captain Ramesh';
      setTimeout(() => {
        onLogin(assignedName);
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

  const handleQuickSelect = (staff: typeof quickStaff[0]) => {
    setWaiterName(staff.name);
    setSelectedSection(staff.section);
    setPin(staff.pin);
    verifyPin(staff.pin);
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
            <span className="font-mono text-[9.5px] font-black uppercase tracking-widest text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/20 px-2 py-0.5 rounded-full inline-block">
              Floor Steward Console
            </span>
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
          <label className="font-mono text-[10px] font-black uppercase tracking-wider text-stone-500 flex items-center justify-between">
            <span>Steward / Captain Name</span>
            <span className="text-[#9C3D1E] font-bold">Shift A</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
              placeholder="e.g. Captain Ramesh"
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-xs font-mono font-bold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-[#9C3D1E] shadow-2xs transition"
            />
          </div>
        </div>

        {/* Quick Staff Selection Chips */}
        <div className="space-y-1">
          <span className="font-mono text-[9px] font-bold uppercase text-stone-400 tracking-wider">
            Quick Roster Profiles:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {quickStaff.map((st) => (
              <button
                key={st.pin}
                type="button"
                onClick={() => handleQuickSelect(st)}
                className={`px-2.5 py-1.5 rounded-lg border text-[10.5px] font-mono font-bold text-left transition flex items-center justify-between ${
                  waiterName === st.name
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                }`}
              >
                <span className="truncate">{st.name.replace('Captain ', '')}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  waiterName === st.name ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {st.pin}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Assigned Dining Section Pills */}
        <div className="space-y-1.5 pt-1">
          <label className="font-mono text-[10px] font-black uppercase tracking-wider text-stone-500">
            Assigned Floor Section:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSection(sec.id)}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition ${
                  selectedSection === sec.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                }`}
              >
                {sec.label}
              </button>
            ))}
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
          onClick={() => verifyPin(pin)}
          disabled={pin.length < 4 || pinSuccess}
          className={`w-full py-3.5 rounded-xl font-mono text-xs font-black shadow-md flex items-center justify-center gap-2 transition cursor-pointer ${
            pin.length === 4
              ? 'bg-[#9C3D1E] hover:bg-[#853216] text-white shadow-[#9C3D1E]/30'
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
