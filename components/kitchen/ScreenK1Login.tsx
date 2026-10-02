'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import { KITCHEN_MASTER_PIN } from '../../types/kitchen';
import { ChefHat, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenK1Login: React.FC = () => {
  const { setCurrentScreen, setActiveStation } = useKitchenStore();
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin((prev) => prev + num);
      setError('');
    }
  };

  const handleClear = () => {
    setEnteredPin('');
    setError('');
  };
  const handleBackspace = () => setEnteredPin((prev) => prev.slice(0, -1));

  const handleLogin = () => {
    if (enteredPin === KITCHEN_MASTER_PIN) {
      setActiveStation('MASTER_DISPATCH');
      setError('');
      setCurrentScreen(2);
    } else {
      setError('❌ WRONG PIN — Please enter the correct kitchen PIN');
      setEnteredPin('');
    }
  };

  React.useEffect(() => {
    if (enteredPin.length === 4) {
      const t = setTimeout(() => handleLogin(), 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredPin]);

  return (
    <KitchenTabletHousing screenNumber={1} screenTitle="KDS KITCHEN LOGIN">
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-8 overflow-y-auto bg-stone-100/50">
        {/* Left Card: Logo + Venue name */}
        <div className="w-full md:w-[440px] bg-white rounded-3xl border-2 border-slate-900 p-8 shadow-[4px_4px_0px_#0f172a] flex flex-col items-center justify-between text-center min-h-[440px]">
          <div className="flex flex-col items-center my-auto">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-amber-50 to-orange-100 shadow-[3px_3px_0px_#0f172a] mb-5">
              <span className="text-5xl">🥘</span>
              <div className="absolute -bottom-2 -right-2 rounded-full border border-slate-900 bg-orange-600 p-1.5 text-white shadow-xs">
                <ChefHat className="h-4 w-4" />
              </div>
            </div>

            <h1 className="mt-1.5 text-xl font-black text-slate-900 uppercase tracking-tight">
              Thoogudeepa Donne Biryani Mane
            </h1>
            <p className="mt-1 text-md font-mono font-bold text-slate-600">
              KITCHEN LOGIN
            </p>
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[10.5px] font-mono font-bold text-orange-800">
              🔑 DEMO PIN: <strong>1234</strong>
            </div>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>VENUE: THOOGUDEEPA DONNE BIRYANI MANE</span>
            <span className="text-emerald-600 font-bold">KDS v3.0 ONLINE</span>
          </div>
        </div>

        {/* Right Card: PIN pad only */}
        <div className="w-full md:w-80 bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="text-md font-bold font-mono uppercase tracking-wider pl-[45px] pb-[20px] text-slate-600 ">
              ENTER PIN TO LOGIN
            </div>

            {/* PIN Dots */}
            <div className="h-11 rounded-xl bg-stone-100 border border-slate-200 flex items-center justify-center gap-3 mb-7">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-full border-2 border-slate-800 transition ${
                    enteredPin.length > idx ? 'bg-slate-900' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-2 flex items-start gap-1.5 rounded-lg bg-rose-50 border border-rose-300 p-2 text-[10px] font-bold text-rose-700">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-10 rounded-lg border border-slate-200 bg-stone-50 hover:bg-stone-100 font-mono text-sm font-bold text-slate-800 transition active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-10 rounded-lg border border-slate-200 bg-stone-100 hover:bg-stone-200 font-mono text-[10px] font-bold text-slate-600 transition"
              >
                CLR
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-10 rounded-lg border border-slate-200 bg-stone-50 hover:bg-stone-100 font-mono text-sm font-bold text-slate-800 transition active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-10 rounded-lg border border-slate-200 bg-stone-100 hover:bg-stone-200 font-mono text-[10px] font-bold text-slate-600 transition"
              >
                DEL
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={enteredPin.length < 4}
            className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition ${
              enteredPin.length === 4
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 hover:bg-orange-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
            <span>LOGIN</span>
          </motion.button>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};