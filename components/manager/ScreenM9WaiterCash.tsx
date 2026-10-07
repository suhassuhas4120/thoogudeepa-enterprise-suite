'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Banknote, IndianRupee } from 'lucide-react';

export function ScreenM9WaiterCash() {
  const { staffRoster, reconcileStaffCash } = useManagerStore();
  const [handoverAmounts, setHandoverAmounts] = useState<Record<string, string>>({});

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
      <div className="md:col-span-12 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
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
                  <div key={st.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-slate-300 text-xs">
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
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
}
