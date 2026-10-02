'use client';

import React, { useState } from 'react';
import { useManagerStore, MANAGER_PROFILES, INITIAL_SHIFTS } from '../../store/useManagerStore';
import { ShieldCheck, Lock, Unlock, Clock, AlertCircle, CheckCircle2, RefreshCw, KeyRound, Printer } from 'lucide-react';

export function ScreenM1Login() {
  const {
    activeManager,
    setActiveManager,
    activeShift,
    setActiveShift,
    pinInput,
    enterPinDigit,
    clearPin,
    deletePinDigit,
    verifyPin,
    isAuthenticated,
    openingFloat,
    setCurrentScreen,
  } = useManagerStore();

  const [authError, setAuthError] = useState(false);

  const handlePress = (d: string) => {
    setAuthError(false);
    enterPinDigit(d);
  };

  const handleUnlock = () => {
    const ok = verifyPin();
    if (!ok) {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
      {/* Left Control Column */}
      <div className="md:col-span-5 flex flex-col gap-4">
        {/* Terminal Header */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a]">
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
            <span className="bg-slate-900 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
              [AUTH TERMINAL 01]
            </span>
            <span className="font-mono text-xs text-slate-500 font-semibold">POS v4.2 PRO</span>
          </div>
          <h2 className="text-base font-black text-slate-900 mt-3 font-mono">
            THOOGUDEEPA DONNE BIRYANI MANE
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Command Center • Shift Cashier & Floor Management
          </p>
        </div>

        {/* Shift Selection */}
        <div className="bg-stone-50 border border-slate-300 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-orange-600" />
            <h3 className="font-mono text-xs font-black uppercase text-slate-900">
              Select Restaurant Shift
            </h3>
          </div>
          <div className="space-y-2">
            {INITIAL_SHIFTS.map((sh) => (
              <label
                key={sh.name}
                onClick={() => setActiveShift(sh)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition ${
                  activeShift.name === sh.name
                    ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{sh.name} ({sh.timeRange})</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  sh.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  [{sh.status}]
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Opening Float Box */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex justify-between items-center text-xs font-mono text-slate-500">
            <span>OPENING CASH FLOAT:</span>
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ₹ {openingFloat.toLocaleString('en-IN')}.00
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Counted in Till Safe • Ready for change distribution
          </p>
        </div>

        {/* Hardware Status Preview */}
        <div className="bg-slate-900 text-white rounded-xl p-4 text-xs font-mono space-y-1.5">
          <div className="text-slate-400 font-bold mb-2 flex items-center gap-1.5">
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            <span>PERIPHERALS READY:</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Thermal Bill Printer (80mm)</span>
            <span className="text-emerald-400 font-bold">[ONLINE]</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Dum Kitchen KDS Display</span>
            <span className="text-emerald-400 font-bold">[ONLINE]</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Automatic Cash Drawer Kick</span>
            <span className="text-emerald-400 font-bold">[LOCKED]</span>
          </div>
        </div>
      </div>

      {/* Right PIN Pad Column */}
      <div className="md:col-span-7 bg-white border-2 border-slate-900 rounded-xl p-6 shadow-[5px_5px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="text-center pb-4 border-b border-slate-200">
            <div className="inline-flex p-2.5 rounded-full bg-orange-100 text-orange-600 mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black font-mono text-slate-900">
              MANAGER / CASHIER AUTHENTICATION
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Select your staff profile and enter your 4-digit security PIN
            </p>
          </div>

          {/* Profile Select */}
          <div className="mt-4">
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
              [ACTIVE PROFILE]:
            </label>
            <select
              value={activeManager.id}
              onChange={(e) => {
                const found = MANAGER_PROFILES.find((m) => m.id === e.target.value);
                if (found) setActiveManager(found);
              }}
              className="w-full bg-stone-50 border-2 border-slate-900 rounded-lg p-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-none"
            >
              {MANAGER_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* PIN Indicators */}
          <div className="my-6 text-center">
            <div className="flex justify-center gap-4 mb-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border-2 border-slate-900 transition-all ${
                      isFilled ? 'bg-slate-900 scale-110' : 'bg-stone-100'
                    }`}
                  />
                );
              })}
            </div>
            <div className="font-mono text-xs font-bold text-slate-500">
              {authError ? (
                <span className="text-rose-600 font-black">❌ INVALID PIN — TRY DEFAULT 1234</span>
              ) : (
                <span>[{pinInput.length} OF 4 DIGITS ENTERED • DEFAULT PIN: 1234]</span>
              )}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePress(digit)}
                className="h-12 bg-white border-2 border-slate-900 rounded-lg font-mono text-lg font-black text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:bg-stone-100 transition"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={clearPin}
              className="h-12 bg-stone-100 border-2 border-slate-900 rounded-lg font-mono text-xs font-black text-rose-700 shadow-[2px_2px_0px_#0f172a] hover:bg-rose-50 transition"
            >
              CLR
            </button>
            <button
              onClick={() => handlePress('0')}
              className="h-12 bg-white border-2 border-slate-900 rounded-lg font-mono text-lg font-black text-slate-900 shadow-[2px_2px_0px_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:bg-stone-100 transition"
            >
              0
            </button>
            <button
              onClick={deletePinDigit}
              className="h-12 bg-stone-100 border-2 border-slate-900 rounded-lg font-mono text-xs font-black text-slate-700 shadow-[2px_2px_0px_#0f172a] hover:bg-stone-200 transition"
            >
              DEL
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={() => setCurrentScreen(2)}
            className="flex-1 bg-slate-900 text-white py-3 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0f172a] hover:bg-orange-600 transition"
          >
            <Unlock className="h-4 w-4" />
            <span>VERIFY & UNLOCK DESK ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
