'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import {
  Banknote,
  IndianRupee,
  Gift,
  Coins,
  Check,
} from 'lucide-react';

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

  // Clean section name helper to adhere to standard Section A, B, C, D
  const getCleanSection = (section: string) => {
    if (!section) return '';
    const match = section.match(/SECTION\s+([A-D])/i);
    if (match) return `Section ${match[1].toUpperCase()}`;
    if (section.toLowerCase().includes('all')) return 'All Sections';
    return section.replace(/\s*\([^)]*\)/g, '').trim();
  };

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
      {/* ── TOP TITLE BANNER ── */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
              Waiter Cash &amp; Tips
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-emerald-950 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs">
            <Banknote className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <span>Till Safe Active</span>
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN SIDE-BY-SIDE LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN: WAITER CASH COUNTER (~60% / lg:col-span-7)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-3">
          {/* Header Box: Waiter Cash Counter */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Banknote className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Waiter Cash Counter
              </h2>
            </div>

            <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
              {cashStaffList.length} Active Staff
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
                  className={`p-4 rounded-xl border bg-white shadow-xs transition-all ${
                    isSettled
                      ? 'border-[#EAE5DF] bg-white'
                      : 'border-orange-200 bg-orange-50/15 ring-1 ring-orange-300/40'
                  }`}
                >
                  {/* Top: Staff Name & Section */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 text-base sm:text-lg">{st.name}</span>
                      <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-[#FAF8F5] text-slate-700 border border-slate-300">
                        {getCleanSection(st.assignedSection)}
                      </span>
                    </div>

                    {isSettled ? (
                      <span className="min-w-[110px] text-center px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                        <span>SETTLED</span>
                      </span>
                    ) : (
                      <span className="min-w-[145px] text-center px-3 py-1.5 rounded-lg text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs flex items-center justify-center">
                        PENDING HANDOVER
                      </span>
                    )}
                  </div>

                  {/* Amounts Row: Cash Collected, Handed Over, Pending Due + Input & Submit */}
                  <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Collected */}
                    <div className="sm:col-span-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Cash Collected
                      </div>
                      <div className="font-black text-slate-900 text-base sm:text-lg mt-1 flex items-center">
                        <IndianRupee className="h-4 w-4 mr-0.5 text-slate-600 shrink-0" />
                        <span>{st.cashCollected.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Handover */}
                    <div className="sm:col-span-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Handed Over
                      </div>
                      <div className="font-black text-emerald-700 text-base sm:text-lg mt-1 flex items-center">
                        <IndianRupee className="h-4 w-4 mr-0.5 text-emerald-600 shrink-0" />
                        <span>{st.cashHandedOver.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Outstanding */}
                    <div className="sm:col-span-3">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Pending Due
                      </div>
                      <div
                        className={`font-black text-base sm:text-lg mt-1 flex items-center ${
                          isSettled ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        <IndianRupee className={`h-4 w-4 mr-0.5 shrink-0 ${isSettled ? 'text-emerald-600' : 'text-rose-600'}`} />
                        <span>{amountDue === 0 ? '0' : amountDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action: [ ₹ Input ] + [ Handover Cash ] */}
                    <div className="sm:col-span-3 flex flex-col gap-2 items-end justify-center">
                      {!isSettled ? (
                        <>
                          <div className="flex items-center rounded-xl border-2 border-slate-300 focus-within:border-[#9C3D1E] focus-within:ring-2 focus-within:ring-orange-200 bg-white px-3 py-1.5 w-full shadow-2xs transition">
                            <IndianRupee className="h-3.5 w-3.5 text-slate-400 mr-1 select-none shrink-0" />
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={handoverAmounts[st.id] ?? ''}
                              placeholder="Amount"
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
                              className="w-full bg-transparent text-sm font-black text-slate-900 outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                            className="w-full bg-[#9C3D1E] hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 shadow-2xs text-center"
                          >
                            Handover Cash
                          </button>
                        </>
                      ) : (
                        <div
                          className="w-full bg-slate-100 border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-xs font-bold cursor-default flex items-center justify-center gap-1.5"
                          title="Handover settled in full"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Settled in Full</span>
                        </div>
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
          {/* Header Box: Captain Tips */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Gift className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Captain Tips
              </h2>
            </div>

            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
              Daily Tips Pool
            </span>
          </div>

          {/* Subheader Bar: Shift Tips & Total Tips Today */}
          <div className="bg-[#FAF8F5] border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="font-black text-slate-900 text-sm sm:text-base">Shift Tips</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Tips Today
              </span>
              <span className="font-black text-emerald-700 text-lg sm:text-xl flex items-center justify-end mt-0.5">
                <IndianRupee className="h-4.5 w-4.5 mr-0.5 text-emerald-600 shrink-0" />
                <span>{totalTipsToday.toLocaleString('en-IN')}</span>
              </span>
            </div>
          </div>

          {/* Captain Tips List */}
          <div className="space-y-3">
            {Object.entries(captainTips).map(([name, amount]) => {
              const isZero = amount === 0;

              return (
                <div
                  key={name}
                  className={`p-3.5 rounded-xl border bg-white shadow-2xs flex items-center justify-between gap-3 transition-all ${
                    isZero
                      ? 'border-slate-200 bg-slate-50/50 opacity-80'
                      : 'border-[#EAE5DF] hover:border-amber-300'
                  }`}
                >
                  <div>
                    <div className="font-black text-slate-900 text-sm sm:text-base">{name}</div>
                    <div
                      className={`text-sm sm:text-base font-black mt-1 flex items-center ${
                        isZero ? 'text-slate-400' : 'text-emerald-700'
                      }`}
                    >
                      <IndianRupee className={`h-4 w-4 mr-0.5 shrink-0 ${isZero ? 'text-slate-400' : 'text-emerald-600'}`} />
                      <span>{amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div>
                    {isZero ? (
                      <div
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-default min-w-[95px] text-center flex items-center justify-center gap-1.5"
                        title="Tip is ₹0 (Paid)"
                      >
                        <Check className="h-3.5 w-3.5 text-slate-400" />
                        <span>Paid</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePayTip(name, amount)}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-[#9C3D1E] hover:bg-orange-700 text-white transition shadow-2xs cursor-pointer active:scale-95 min-w-[95px] text-center"
                        title={`Pay ₹${amount} tip to ${name}`}
                      >
                        Pay Tip
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
