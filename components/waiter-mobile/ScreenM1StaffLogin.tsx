'use client';

import React, { useRef } from 'react';
import { Smartphone, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PINS = ['1111', '2222', '3333', '4444'];
export const WAITER_NAMES: Record<string, string> = {
  '1111': 'Ramesh — Section A',
  '2222': 'Suresh — Section B',
  '3333': 'Nayana — Section C',
  '4444': 'Vennela — Section D',
};

interface Props {
  onLogin: (name: string) => void;
}

export function ScreenM1StaffLogin({ onLogin }: Props) {
  const [pin, setPin] = React.useState('');
  const [pinError, setPinError] = React.useState(false);
  const shakeRef = useRef(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (PINS.includes(next)) {
        setTimeout(() => onLogin(WAITER_NAMES[next]), 160);
      } else {
        shakeRef.current = true;
        setPinError(true);
        setTimeout(() => {
          setPin('');
          setPinError(false);
          shakeRef.current = false;
        }, 820);
      }
    }
  };

  const handleBackspace = () => {
    if (pinError) return;
    setPin((p) => p.slice(0, -1));
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 select-none font-sans">
      <div className="w-full max-w-xs space-y-7">

        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="h-16 w-16 rounded-3xl bg-[#9C3D1E] flex items-center justify-center mx-auto shadow-lg shadow-[#9C3D1E]/25 text-white">
            <Smartphone className="h-8 w-8" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9C3D1E]">
              Floor Steward Terminal
            </p>
            <h1 className="text-stone-900 text-xl font-black tracking-tight uppercase mt-0.5">
              Thoogudeepa Donne Biryani
            </h1>
            <p className="text-stone-500 text-xs font-mono mt-1">
              Enter your 4-digit steward PIN
            </p>
          </div>
        </div>

        {/* PIN dot indicators */}
        <motion.div
          animate={pinError ? { x: [0, -9, 9, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.42 }}
          className="flex justify-center gap-3.5 py-1"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > i
                  ? pinError
                    ? 'bg-rose-500 border-rose-500'
                    : 'bg-[#9C3D1E] border-[#9C3D1E]'
                  : 'bg-white border-stone-300 shadow-2xs'
              }`}
            />
          ))}
        </motion.div>

        {/* PIN keypad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleDigit(d)}
              className="h-[60px] rounded-2xl bg-white hover:bg-[#FFF8F5] border border-[#EAE5DF] text-stone-900 font-mono text-2xl font-black shadow-xs flex items-center justify-center transition"
            >
              {d}
            </motion.button>
          ))}
          {/* bottom row */}
          <div />
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => handleDigit('0')}
            className="h-[60px] rounded-2xl bg-white hover:bg-[#FFF8F5] border border-[#EAE5DF] text-stone-900 font-mono text-2xl font-black shadow-xs flex items-center justify-center transition"
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleBackspace}
            className="h-[60px] rounded-2xl bg-white hover:bg-rose-50 border border-[#EAE5DF] text-stone-500 hover:text-rose-600 shadow-xs flex items-center justify-center transition"
            aria-label="Backspace"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Error message */}
        {pinError && (
          <p className="text-center text-rose-600 font-mono text-xs font-bold animate-pulse">
            Invalid PIN — try again
          </p>
        )}

        {/* Quick reference hint */}
        <p className="text-center text-stone-400 font-mono text-[10px] leading-relaxed">
          1111 · Ramesh (Sec A) &nbsp;|&nbsp; 2222 · Suresh (Sec B)
          <br />
          3333 · Nayana (Sec C) &nbsp;|&nbsp; 4444 · Vennela (Sec D)
        </p>
      </div>
    </main>
  );
}
