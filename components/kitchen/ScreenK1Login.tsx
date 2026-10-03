'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import { KITCHEN_MASTER_PIN } from '../../types/kitchen';
import { ChefHat, ShieldCheck, AlertCircle, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScreenK1Login: React.FC = () => {
  const { setCurrentScreen, setActiveStation } = useKitchenStore();
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);

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
      setError('Invalid PIN. Universal Master PIN is 1234');
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-8 overflow-y-auto bg-[#FAF8F5]/50">
        {/* Left Card: Logo + Venue name */}
        <div className="w-full md:w-[440px] bg-white rounded-3xl border border-[#EAE5DF] p-8 shadow-sm flex flex-col items-center justify-between text-center min-h-[440px]">
          <div className="flex flex-col items-center my-auto">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-[#EAE5DF] bg-gradient-to-br from-amber-50 to-orange-100 shadow-xs mb-5">
              <UtensilsCrossed className="h-12 w-12 text-amber-700" />
              <div className="absolute -bottom-2 -right-2 rounded-full border border-[#EAE5DF] bg-orange-600 p-1.5 text-white shadow-xs">
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
              PIN: <strong>1234</strong>
            </div>
          </div>

          <div className="w-full mt-6 pt-4 border-t border-slate-200 flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>VENUE: THOOGUDEEPA DONNE BIRYANI MANE</span>
            <span className="text-emerald-600 font-bold">KDS v3.0 ONLINE</span>
          </div>
        </div>

        {/* Right Card: PIN pad only */}
        <motion.div
          animate={shake ? { x: [-12, 12, -10, 10, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full md:w-80 bg-white rounded-3xl border border-[#EAE5DF] p-6 shadow-sm flex flex-col justify-between min-h-[440px]"
        >
          <div>
            <div className="text-md font-bold font-mono uppercase tracking-wider pl-[45px] pb-[20px] text-slate-600 ">
              ENTER PIN TO LOGIN
            </div>

            {/* PIN Dots */}
            <motion.div
              animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className={`h-11 rounded-xl bg-[#FAF8F5] border transition flex items-center justify-center gap-3 mb-7 ${
                shake ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
              }`}
            >
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-full border border-[#EAE5DF] transition ${
                    enteredPin.length > idx ? 'bg-[#9C3D1E]' : 'bg-transparent'
                  }`}
                />
              ))}
            </motion.div>

            {error && (
              <div className="mb-2 flex items-start gap-1.5 rounded-lg bg-rose-50 border border-rose-300 p-2 text-[10px] font-bold text-rose-700 animate-in fade-in">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-10 rounded-lg border border-slate-200 bg-[#FAF8F5] hover:bg-[#FAF8F5] font-mono text-sm font-bold text-slate-800 transition active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-10 rounded-lg border border-slate-200 bg-[#FAF8F5] hover:bg-stone-200 font-mono text-[10px] font-bold text-slate-600 transition"
              >
                CLR
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-10 rounded-lg border border-slate-200 bg-[#FAF8F5] hover:bg-[#FAF8F5] font-mono text-sm font-bold text-slate-800 transition active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-10 rounded-lg border border-slate-200 bg-[#FAF8F5] hover:bg-stone-200 font-mono text-[10px] font-bold text-slate-600 transition"
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
        </motion.div>
      </div>
    </KitchenTabletHousing>
  );
};