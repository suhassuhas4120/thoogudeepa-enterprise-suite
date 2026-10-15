'use client';

import React, { useState, useEffect } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import {
  Lock,
  Unlock,
  Receipt,
  IndianRupee,
  ShieldCheck,
  Check,
} from 'lucide-react';

export function ScreenM13PettyExpenses() {
  const {
    pettyExpenses,
    addPettyExpense,
    openingFloat,
    activeManager,
  } = useManagerStore();

  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<
    'Dairy & Fresh' | 'Kitchen Supplies' | 'Fuel/Gas' | 'Emergency Maintenance' | 'Miscellaneous'
  >('Dairy & Fresh');
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [isCounterLocked, setIsCounterLocked] = useState(false);
  const [showLockSuccess, setShowLockSuccess] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('03:00 AM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // 1. Calculations matching sketch logic
  const morningCash = openingFloat || 50000;
  const totalOutflow = pettyExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalRemaining = morningCash - totalOutflow;
  const currentCash = totalRemaining; // In till after petty deductions
  const cashClearedTonight = isCounterLocked ? currentCash : currentCash;
  const physicalCashAfterClosing = isCounterLocked ? 0 : 0;

  // 2. Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    if (isCounterLocked) {
      alert('Cash counter is currently LOCKED! Please unlock the counter to record new vouchers.');
      return;
    }
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    addPettyExpense(desc.trim(), category, numAmount, paidTo.trim() || 'Vendor');
    setDesc('');
    setAmount('');
    setPaidTo('');
  };

  // 3. Counter Lock handler
  const handleToggleLockCounter = () => {
    if (!isCounterLocked) {
      setIsCounterLocked(true);
      setShowLockSuccess(true);
      setTimeout(() => setShowLockSuccess(false), 3500);
    } else {
      setIsCounterLocked(false);
    }
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* Top Title Banner */}
      <div className="pb-3 border-b border-[#EAE5DF] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Petty Expenses &amp; Cash Counter
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-2xs ${
              isCounterLocked
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
            }`}
          >
            {isCounterLocked ? <Lock className="h-4 w-4 text-rose-700" /> : <ShieldCheck className="h-4 w-4 text-emerald-700" />}
            <span>{isCounterLocked ? 'COUNTER LOCKED' : 'TILL OPEN & BALANCED'}</span>
          </span>
        </div>
      </div>

      {/* Main Content: 65% Left Column | 35% Right Column */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* =========================================================================
            LEFT COLUMN (65% width):
            1. Expenses list (with Total outflow & Total remaining)
            2. Record new Expense form
            ========================================================================= */}
        <div className="w-full lg:w-[65%] space-y-4 flex flex-col justify-between">
          {/* TOP BOX: Expenses */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              {/* Header with Title and Outflow/Remaining numbers */}
              <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-200 gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Expenses
                </h3>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Total Outflow
                    </span>
                    <span className="font-black text-rose-600 text-base sm:text-lg flex items-center justify-end">
                      <IndianRupee className="h-4 w-4 mr-0.5 text-rose-600 shrink-0" />
                      {totalOutflow.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Total Remaining
                    </span>
                    <span className="font-black text-emerald-700 text-base sm:text-lg flex items-center justify-end">
                      <IndianRupee className="h-4 w-4 mr-0.5 text-emerald-600 shrink-0" />
                      {totalRemaining.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vouchers list */}
              <div className="space-y-3 mt-4 max-h-[320px] overflow-y-auto pr-1">
                {pettyExpenses.map((pe, idx) => (
                  <div
                    key={pe.id}
                    className="p-3.5 bg-white border-2 border-slate-200 rounded-xl flex justify-between items-center hover:border-orange-300 transition shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                      <div className="font-black text-slate-950 text-sm sm:text-base truncate">
                        Exp {idx + 1}: {pe.description}
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {pe.category}
                        </span>
                        <span>
                          To: <strong className="text-slate-900 font-black">{pe.paidTo}</strong>
                        </span>
                        <span>
                          Paid by: <strong className="text-slate-900 font-black">{pe.paidBy}</strong>
                        </span>
                        <span className="text-slate-400 font-medium">({pe.time})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-base sm:text-lg text-rose-600 flex items-center justify-end">
                        - <IndianRupee className="h-4 w-4 mx-0.5 text-rose-600 shrink-0" />
                        {pe.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}

                {pettyExpenses.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs sm:text-sm font-bold bg-[#FAF8F5] rounded-xl border border-slate-200">
                    No petty expense vouchers recorded for this shift yet.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>{pettyExpenses.length} Total vouchers recorded</span>
              <span className="text-emerald-700 font-black">All vouchers recorded</span>
            </div>
          </div>

          {/* BOTTOM BOX: Record new Expense */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 pb-3 border-b border-slate-200 uppercase tracking-tight">
              Record new Expense
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Expense Description */}
              <div>
                <label className="block font-black text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                  Expense Description
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Fresh curd & Nandini Milk, Banana leaves, Cylinder refill..."
                  required
                  disabled={isCounterLocked}
                  className="w-full h-11 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-950 font-bold focus:outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 disabled:opacity-50 placeholder:text-slate-400 shadow-2xs transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-black text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  disabled={isCounterLocked}
                  className="w-full h-11 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-950 font-black focus:outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 disabled:opacity-50 shadow-2xs transition"
                >
                  <option value="Dairy & Fresh">Dairy &amp; Fresh</option>
                  <option value="Kitchen Supplies">Kitchen Supplies</option>
                  <option value="Fuel/Gas">Fuel/Gas</option>
                  <option value="Emergency Maintenance">Emergency Maintenance</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              {/* Two fields row matching sketch: Amount ₹ | Paid to: vendor name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-black text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                    Amount ₹
                  </label>
                  <div className="flex items-center h-11 rounded-xl border-2 border-slate-300 bg-[#FAF8F5] px-3 focus-within:border-[#9C3D1E] focus-within:ring-1 focus-within:ring-orange-200 shadow-2xs transition">
                    <IndianRupee className="h-4 w-4 text-slate-400 mr-1.5 select-none shrink-0" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 540"
                      required
                      min="1"
                      disabled={isCounterLocked}
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-950 font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                    Paid To: vendor name
                  </label>
                  <input
                    type="text"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="e.g. Nandini Dairy, Gandhi Bazaar Mandi"
                    disabled={isCounterLocked}
                    className="w-full h-11 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-950 font-bold focus:outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 disabled:opacity-50 placeholder:text-slate-400 shadow-2xs transition"
                  />
                </div>
              </div>

              {/* Submit button: [ Pay Expense ] */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCounterLocked}
                  className="h-11 bg-[#9C3D1E] hover:bg-orange-700 text-white transition px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Receipt className="h-4 w-4" />
                  <span>Pay Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (35% width):
            Cash counter status card
            ========================================================================= */}
        <div className="w-full lg:w-[35%] bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header: cash counter status & Active badge with lock icon */}
            <div className="pb-3.5 border-b border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Cash Counter Status
                </h3>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs ${
                    isCounterLocked
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  }`}
                >
                  <span>{isCounterLocked ? 'Locked' : 'Active'}</span>
                  <Lock className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Manager name, Date, Time */}
              <div className="mt-3 text-xs sm:text-sm font-bold text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Manager Name:</span>
                  <span className="font-black text-slate-950">
                    {activeManager.name.split(' ')[0]} (Duty Lead)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Date:</span>
                  <span className="text-slate-800">15 Oct 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Time:</span>
                  <span className="text-slate-800">{currentTimeStr}</span>
                </div>
              </div>
            </div>

            {/* Audit Figures */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-bold">Opening Cash Float:</span>
                <span className="font-black text-slate-950 text-sm sm:text-base flex items-center">
                  <IndianRupee className="h-4 w-4 mr-0.5 text-slate-600 shrink-0" />
                  {morningCash.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-bold">Petty Cash Outflows:</span>
                <span className="font-black text-rose-600 text-sm sm:text-base flex items-center">
                  - <IndianRupee className="h-4 w-4 mx-0.5 text-rose-600 shrink-0" />
                  {totalOutflow.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-orange-50/70 border-2 border-orange-200 rounded-xl shadow-2xs">
                <span className="text-slate-950 font-black">Current Cash in Till:</span>
                <span className="font-black text-slate-950 text-base sm:text-lg flex items-center">
                  <IndianRupee className="h-4.5 w-4.5 mr-0.5 text-[#9C3D1E] shrink-0" />
                  {currentCash.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-bold">Cash Cleared for Safe:</span>
                <span className="font-black text-emerald-800 text-sm sm:text-base flex items-center">
                  <IndianRupee className="h-4 w-4 mr-0.5 text-emerald-700 shrink-0" />
                  {cashClearedTonight.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-bold">
                  Physical Cash After Closing:
                </span>
                <span className="font-black text-slate-950 text-sm sm:text-base flex items-center">
                  <IndianRupee className="h-4 w-4 mr-0.5 text-slate-600 shrink-0" />
                  {physicalCashAfterClosing}
                </span>
              </div>
            </div>

            {/* Success toast upon locking */}
            {showLockSuccess && (
              <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2 animate-in fade-in shadow-2xs">
                <Check className="h-4 w-4 text-rose-700 shrink-0" />
                <span>Cash drawer closed, locked, and registered for night deposit!</span>
              </div>
            )}
          </div>

          {/* Action Button: Lock and Close Counter */}
          <div className="mt-6 pt-3.5 border-t border-slate-200">
            <button
              onClick={handleToggleLockCounter}
              className={`w-full h-12 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                isCounterLocked
                  ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border-2 border-slate-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800 border-2 border-slate-900'
              }`}
            >
              {isCounterLocked ? (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Unlock Counter (Re-Open Drawer)</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Lock and Close Counter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
