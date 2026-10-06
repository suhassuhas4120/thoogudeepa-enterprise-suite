'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Banknote, Calculator, IndianRupee } from 'lucide-react';

export function ScreenM9WaiterCash() {
  const { staffRoster, reconcileStaffCash } = useManagerStore();
  const [handoverAmounts, setHandoverAmounts] = useState<Record<string, string>>({});

  // Denominations
  const [counts, setCounts] = useState<{ [denom: number]: number }>({
    500: 12,
    200: 8,
    100: 25,
    50: 10,
    20: 15,
    10: 20,
  });

  const totalCalculated = Object.entries(counts).reduce(
    (acc, [denom, qty]) => acc + Number(denom) * qty,
    0
  );

  const handleQtyChange = (denom: number, val: string) => {
    const n = Math.max(0, parseInt(val, 10) || 0);
    setCounts((prev) => ({ ...prev, [denom]: n }));
  };

  const handleHandover = (staffId: string, staffName: string, cashCollected: number, cashHandedOver: number) => {
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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-5 font-mono">
      {/* Left Captain Cash Balance */}
      <div className="md:col-span-6 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500">[CASH SETTLEMENT DESK]</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                CAPTAIN TABLE-SIDE CASH RECONCILIATION
              </h3>
            </div>
            <Banknote className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="space-y-3 mt-4">
            {staffRoster
              .filter((st) => st.cashCollected > 0)
              .map((st) => {
                const amountDue = Math.max(0, st.cashCollected - st.cashHandedOver);
                const isSettled = amountDue === 0;
                return (
                  <div key={st.id} className="p-3 bg-stone-50 rounded-xl border border-slate-300 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900">{st.name}</span>
                      <span className="text-slate-500">{st.assignedSection}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-400">COLLECTED</div>
                        <div className="font-bold text-slate-800">₹ {st.cashCollected}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">HANDED OVER</div>
                        <div className="font-bold text-emerald-700">₹ {st.cashHandedOver}</div>
                        {!isSettled && (
                          <div className="mt-1 flex items-center rounded border border-slate-300 bg-white px-1.5">
                            <IndianRupee className="h-3 w-3 text-slate-400" />
                            <input
                              id={`handover-${st.id}`}
                              type="number"
                              min="1"
                              max={amountDue}
                              step="1"
                              value={handoverAmounts[st.id] ?? ''}
                              placeholder="Add"
                              onChange={(event) => setHandoverAmounts((current) => ({
                                ...current,
                                [st.id]: event.target.value,
                              }))}
                              className="w-full min-w-0 bg-transparent px-1 py-1 text-xs font-bold outline-none"
                              aria-label={`Additional cash handed over by ${st.name}`}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">OUTSTANDING DUE</div>
                        <div className={`font-black ${isSettled ? 'text-emerald-700' : 'text-rose-600'}`}>
                          ₹ {amountDue}
                        </div>
                      </div>
                    </div>
                    {isSettled ? (
                      <div className="mt-2 text-center text-[11px] font-bold text-emerald-700">
                        HANDED OVER IN FULL
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleHandover(st.id, st.name, st.cashCollected, st.cashHandedOver)}
                          className="bg-[#9C3D1E] text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-emerald-600 transition text-center whitespace-nowrap"
                        >
                          RECORD HANDOVER
                        </button>
                        <button
                          onClick={() => {
                            reconcileStaffCash(st.id, st.cashCollected);
                            alert(`Collected full ₹${st.cashCollected} from ${st.name} into Till Safe!`);
                          }}
                          className="bg-slate-900 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-slate-800 transition text-center whitespace-nowrap"
                        >
                          ALL
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="mt-4 p-3 bg-stone-100 rounded-lg border border-slate-300 text-xs text-slate-600">
          All table-side cash collections must be deposited into till before shift handover.
        </div>
      </div>

      {/* Right Denomination Counter */}
      <div className="md:col-span-6 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Physical Cash Denomination Counter
            </h3>
            <Calculator className="h-5 w-5 text-slate-600" />
          </div>

          <div className="space-y-2 mt-4 text-xs">
            {[500, 200, 100, 50, 20, 10].map((denom) => (
              <div key={denom} className="flex items-center justify-between p-2 rounded bg-stone-50 border border-slate-200">
                <span className="font-black text-slate-800 w-16">₹ {denom} x</span>
                <input
                  type="number"
                  min="0"
                  value={counts[denom]}
                  onChange={(e) => handleQtyChange(denom, e.target.value)}
                  className="w-20 text-center bg-white border border-slate-900 rounded p-1 font-bold"
                />
                <span className="font-black text-slate-900 w-24 text-right">
                  = ₹ {(denom * (counts[denom] || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-slate-900">
          <div className="flex justify-between items-center text-sm font-black">
            <span>TOTAL PHYSICAL CASH IN TILL:</span>
            <span className="text-xl text-emerald-700">₹ {totalCalculated.toLocaleString('en-IN')}.00</span>
          </div>
          <button
            onClick={() => alert(`Physical Cash Count ₹${totalCalculated} locked into Master Shift Audit!`)}
            className="w-full mt-4 bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition shadow-[3px_3px_0px_#0f172a]"
          >
            CONFIRM &amp; LOCK TILL BALANCE
          </button>
        </div>
      </div>
    </div>
  );
}
