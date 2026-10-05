'use client';

import React, { useState } from 'react';
import { useManagerStore, MANAGER_PROFILES, INITIAL_SHIFTS } from '../../store/useManagerStore';
import { Unlock, Clock, KeyRound, Printer, Edit2, Check, X, User } from 'lucide-react';

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

  // Float adjustment state
  const [adjustingFloat, setAdjustingFloat] = useState(false);
  const [floatInput, setFloatInput] = useState('');
  const [localFloat, setLocalFloat] = useState(openingFloat);

  // Other staff selection state
  const [selectedProfileId, setSelectedProfileId] = useState(activeManager.id);
  const [otherStaffName, setOtherStaffName] = useState('');
  const isOtherStaff = selectedProfileId === 'other';

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProfileId(val);
    if (val !== 'other') {
      const found = MANAGER_PROFILES.find((m) => m.id === val);
      if (found) setActiveManager(found);
    } else {
      setActiveManager({ id: 'other', name: otherStaffName.toUpperCase() || 'OTHER STAFF', role: 'Staff', pin: '1234' });
    }
  };

  const handleOtherNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOtherStaffName(name);
    setActiveManager({ id: 'other', name: name.toUpperCase() || 'OTHER STAFF', role: 'Staff', pin: '1234' });
  };

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

  const handleFloatSave = () => {
    const parsed = parseFloat(floatInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setLocalFloat(parsed);
    }
    setAdjustingFloat(false);
    setFloatInput('');
  };

  const handleFloatCancel = () => {
    setAdjustingFloat(false);
    setFloatInput('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
      {/* Left Control Column */}
      <div className="md:col-span-5 flex flex-col gap-4">
        {/* Terminal Header — [AUTH TERMINAL 01] removed */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-black text-slate-900 font-mono">
            THOOGUDEEPA DONNE BIRYANI MANE
          </h2>
        </div>

        {/* Shift Selection */}
        <div className="bg-[#FAF8F5] border border-slate-300 rounded-xl p-4">
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
                  sh.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FAF8F5] text-slate-500'
                }`}>
                  [{sh.status}]
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Opening Cash Float Box */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          {adjustingFloat ? (
            <div>
              <p className="text-xs font-mono font-bold text-slate-700 mb-2">ADJUST OPENING CASH FLOAT:</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-slate-700">₹</span>
                <input
                  type="number"
                  min="0"
                  autoFocus
                  value={floatInput}
                  onChange={(e) => setFloatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleFloatSave(); if (e.key === 'Escape') handleFloatCancel(); }}
                  placeholder={localFloat.toString()}
                  className="flex-1 bg-[#FAF8F5] border border-[#D28835] rounded-lg px-3 py-2 font-mono text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleFloatSave}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white rounded-lg py-2 font-mono text-xs font-black hover:bg-emerald-700 transition"
                >
                  <Check className="h-3.5 w-3.5" /> SAVE
                </button>
                <button
                  onClick={handleFloatCancel}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 rounded-lg py-2 font-mono text-xs font-black hover:bg-slate-200 transition"
                >
                  <X className="h-3.5 w-3.5" /> CANCEL
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                <span>OPENING CASH FLOAT:</span>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>
                  <button
                    onClick={() => { setAdjustingFloat(true); setFloatInput(localFloat.toString()); }}
                    className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded font-mono text-[10px] font-bold hover:bg-orange-100 transition"
                  >
                    <Edit2 className="h-3 w-3" />
                    ADJUST FLOAT
                  </button>
                </div>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₹ {localFloat.toLocaleString('en-IN')}.00
              </div>
              {/* "Counted in Till Safe..." subtext removed */}
            </>
          )}
        </div>

        {/* Hardware Status Preview */}
        <div className="bg-[#9C3D1E] text-white rounded-xl p-4 text-xs font-mono space-y-1.5">
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
      <div className="md:col-span-7 bg-white border border-[#EAE5DF] rounded-xl p-6 shadow-sm flex flex-col justify-between">
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

          {/* Profile Select — [ACTIVE PROFILE] label removed */}
          <div className="mt-4">
            <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
              Staff Profile:
            </label>
            <select
              value={selectedProfileId}
              onChange={handleProfileChange}
              className="w-full bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg p-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-none"
            >
              {MANAGER_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({p.role})
                </option>
              ))}
              <option value="other">OTHER STAFF — (Enter Name Below)</option>
            </select>

            {/* Other Staff Name Input */}
            {isOtherStaff && (
              <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                <User className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  maxLength={40}
                  value={otherStaffName}
                  onChange={handleOtherNameChange}
                  placeholder="Enter staff member name..."
                  className="flex-1 bg-transparent font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            )}
          </div>

          {/* PIN Indicators */}
          <div className="my-6 text-center">
            <div className="flex justify-center gap-4 mb-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full border border-[#EAE5DF] transition-all ${
                      isFilled ? 'bg-[#9C3D1E] scale-110' : 'bg-[#FAF8F5]'
                    }`}
                  />
                );
              })}
            </div>
            <div className="font-mono text-xs font-bold text-slate-500">
              {authError ? (
                <span className="text-rose-600 font-bold">INVALID PIN — PLEASE TRY AGAIN</span>
              ) : (
                <span>[{pinInput.length} OF 4 DIGITS ENTERED]</span>
              )}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePress(digit)}
                className="h-12 bg-white border border-[#EAE5DF] rounded-lg font-mono text-lg font-black text-slate-900 shadow-xs hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:bg-[#FAF8F5] transition"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={clearPin}
              className="h-12 bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg font-mono text-xs font-black text-rose-700 shadow-xs hover:bg-rose-50 transition"
            >
              CLR
            </button>
            <button
              onClick={() => handlePress('0')}
              className="h-12 bg-white border border-[#EAE5DF] rounded-lg font-mono text-lg font-black text-slate-900 shadow-xs hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:bg-[#FAF8F5] transition"
            >
              0
            </button>
            <button
              onClick={deletePinDigit}
              className="h-12 bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg font-mono text-xs font-black text-slate-700 shadow-xs hover:bg-stone-200 transition"
            >
              DEL
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={() => setCurrentScreen(2)}
            className="flex-1 bg-[#9C3D1E] text-white py-3 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:bg-orange-600 transition"
          >
            <Unlock className="h-4 w-4" />
            <span>VERIFY & UNLOCK DESK</span>
          </button>
        </div>
      </div>
    </div>
  );
}
