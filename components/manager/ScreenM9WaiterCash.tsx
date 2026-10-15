'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import {
  Banknote,
  IndianRupee,
  Gift,
  CheckCircle2,
  Coins,
  Receipt,
  UserCheck,
  Check,
} from 'lucide-react';

interface CaptainTipRecord {
  name: string;
  role: string;
  amount: number;
}

export function ScreenM9WaiterCash() {
  const { staffRoster, reconcileStaffCash } = useManagerStore();
  const { shiftStats } = useSharedBridge();

  // Handover amounts input for each staff
  const [handoverAmounts, setHandoverAmounts] = useState<Record<string, string>>({});

  // Individual Captain tips state (initialized matching user's sketch)
  const [captainTips, setCaptainTips] = useState<Record<string, number>>({
    'Captain Ramesh': 570,
    'Captain Suresh': 0,
    'Captain Vijay': 300,
    'Captain Nayana': 0,
    'Kiran K.': 450,
    'Anand R.': 200,
  });

  // Calculate dynamic Total Tips Today
  const totalTipsToday = Object.values(captainTips).reduce((sum, val) => sum + val, 0);

  // Handle Cash Handover Submit
  const handleHandoverSubmit = (
    staffId: string,
    staffName: string,
    cashCollected: number,
    cashHandedOver: number
  ) => {
    const amountDue = Math.max(0, cashCollected - cashHandedOver);
    const amount = Number(handoverAmounts[staffId] ?? '');

    if (!Number.isFinite(amount) || amount <= 0 || amount > amountDue) {
      alert(`Enter an amount between ₹1 and ₹${amountDue.toLocaleString('en-IN')} for ${staffName}.`);
      return;
    }

    const updatedHandedOver = cashHandedOver + amount;
    reconcileStaffCash(staffId, updatedHandedOver);
    setHandoverAmounts((current) => ({ ...current, [staffId]: '' }));
    alert(`₹${amount.toLocaleString('en-IN')} received from ${staffName} into Till Safe.`);
  };

  // Handle Pay Tip
  const handlePayTip = (captainName: string, amount: number) => {
    if (amount <= 0) return;
    setCaptainTips((prev) => ({
      ...prev,
      [captainName]: 0,
    }));
    alert(`₹${amount.toLocaleString('en-IN')} tip paid to ${captainName}!`);
  };

  // Filter staff who handle cash or are captains
  const cashStaffList = staffRoster.filter(
    (st) => st.cashCollected > 0 || st.role.includes('Captain') || st.role.includes('Waiter')
  );

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* ── TOP TITLE BANNER (Waiter cash & Tips) ── */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              RECONCILIATION &amp; AUDIT
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Waiter Cash &amp; Tips
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-[#FAF8F5] border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Banknote className="h-4 w-4 text-emerald-600" />
            <span>Till Safe Active</span>
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN SIDE-BY-SIDE LAYOUT (MATCHING USER SKETCH) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN: WAITER CASH COUNTER (~60% / lg:col-span-7)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-3">
          {/* Header Box: Waiter cash counter */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  Waiter cash counter
                </h2>
                <div className="text-[10px] text-slate-400 font-bold">
                  Floor Captain table-side collections &amp; till handovers
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              {cashStaffList.length} Staff
            </span>
          </div>

          {/* Captain Cash Cards List */}
          <div className="space-y-3">
            {cashStaffList.map((st) => {
              const amountDue = Math.max(0, st.cashCollected - st.cashHandedOver);
              const isSettled = amountDue === 0;

              return (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-xl border bg-white shadow-xs transition-all ${
                    isSettled
                      ? 'border-[#EAE5DF] bg-white'
                      : 'border-orange-200 bg-orange-50/15 ring-1 ring-orange-300/40'
                  }`}
                >
                  {/* Top: Staff Name & Section */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{st.name}</span>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded font-bold bg-[#FAF8F5] text-slate-500 border border-slate-200">
                        {st.assignedSection}
                      </span>
                    </div>

                    {isSettled ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>SETTLED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        PENDING HANDOVER
                      </span>
                    )}
                  </div>

                  {/* Amounts Row: collected, Handover, outstanding + Input & Submit */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Collected */}
                    <div className="sm:col-span-3">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        collected
                      </div>
                      <div className="font-black text-slate-900 text-sm mt-0.5">
                        ₹ {st.cashCollected.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Handover */}
                    <div className="sm:col-span-3">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Handover
                      </div>
                      <div className="font-black text-emerald-700 text-sm mt-0.5">
                        ₹ {st.cashHandedOver.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Outstanding */}
                    <div className="sm:col-span-3">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        outstanding
                      </div>
                      <div
                        className={`font-black text-sm mt-0.5 ${
                          isSettled ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        ₹ {amountDue === 0 ? '0.00' : amountDue.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Action: [ ₹ Add ] + [ Submit ] */}
                    <div className="sm:col-span-3 flex flex-col gap-1.5 items-end justify-center">
                      {!isSettled ? (
                        <>
                          <div className="flex items-center rounded-lg border-2 border-slate-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 bg-white px-2.5 py-1 w-full shadow-2xs transition">
                            <span className="text-xs font-black text-slate-500 mr-1 select-none">₹</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={handoverAmounts[st.id] ?? ''}
                              placeholder="Enter amount"
                              onChange={(e) => {
                                const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                                setHandoverAmounts((prev) => ({
                                  ...prev,
                                  [st.id]: cleanVal,
                                }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleHandoverSubmit(
                                    st.id,
                                    st.name,
                                    st.cashCollected,
                                    st.cashHandedOver
                                  );
                                }
                              }}
                              className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              aria-label={`Enter cash handover amount for ${st.name}`}
                            />
                          </div>

                          <button
                            onClick={() =>
                              handleHandoverSubmit(
                                st.id,
                                st.name,
                                st.cashCollected,
                                st.cashHandedOver
                              )
                            }
                            className="w-full bg-[#9C3D1E] hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs text-center"
                          >
                            Submit
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-slate-100 border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-black cursor-not-allowed flex items-center justify-center gap-1"
                          title="Handover settled in full"
                        >
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Submit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT COLUMN: TIPS (~40% / lg:col-span-5)
            Separated by vertical border line (lg:border-l lg:border-slate-200 lg:pl-6)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 lg:border-l lg:border-slate-200 lg:pl-6 space-y-3">
          {/* Header Box: Tips */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Tips</h2>
                <div className="text-[10px] text-slate-400 font-bold">
                  Shift Tip Pool &amp; Captain Payouts
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
              Daily Distribution
            </span>
          </div>

          {/* Subheader Bar: Daily Tips & Total tips Today */}
          <div className="bg-[#FAF8F5] border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="font-black text-slate-900 text-xs sm:text-sm">Daily Tips</span>
              <div className="text-[10px] text-slate-400">Shift tip pool today</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total tips Today:
              </span>
              <span className="font-black text-emerald-700 text-base sm:text-lg">
                ₹ {totalTipsToday.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Captain Tips List (Matching Sketch) */}
          <div className="space-y-2.5">
            {Object.entries(captainTips).map(([name, amount]) => {
              const isZero = amount === 0;

              return (
                <div
                  key={name}
                  className={`p-3 rounded-xl border bg-white shadow-2xs flex items-center justify-between gap-3 transition-all ${
                    isZero
                      ? 'border-slate-200 bg-slate-50/50 opacity-75'
                      : 'border-[#EAE5DF] hover:border-amber-300'
                  }`}
                >
                  <div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm">{name}</div>
                    <div
                      className={`text-xs font-black mt-0.5 ${
                        isZero ? 'text-slate-400' : 'text-emerald-700'
                      }`}
                    >
                      ₹ {amount}
                    </div>
                  </div>

                  <div>
                    {isZero ? (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg text-xs font-black bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed transition"
                        title="Tip is ₹0 (Disabled)"
                      >
                        pay tip
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayTip(name, amount)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[#9C3D1E] hover:bg-emerald-600 text-white transition shadow-2xs cursor-pointer active:scale-95"
                        title={`Pay ₹${amount} tip to ${name}`}
                      >
                        pay tip
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
