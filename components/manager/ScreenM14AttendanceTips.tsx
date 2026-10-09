'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Clock, Gift, Users } from 'lucide-react';

export function ScreenM14AttendanceTips() {
  const { staffRoster } = useManagerStore();
  const { shiftStats } = useSharedBridge();

  const totalTipPool = Math.max(2850, shiftStats.tipsEarned || 2850);
  const activeStaff = staffRoster.filter((s) => s.status === 'ACTIVE');
  const tipPerStaff = Math.round(totalTipPool / Math.max(1, activeStaff.length));

  const handleIndividualTipPayout = (staffName: string) => {
    alert(`₹${tipPerStaff} tip payout approved for ${staffName}!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono border border-[#D6D3D1] rounded-2xl bg-white shadow-sm">
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            SHIFT CHECK-IN &amp; DAILY TIP POOL DISTRIBUTION
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-bold">TOTAL TIP POOL TODAY:</span>
          <div className="text-2xl font-black text-emerald-700">₹ {totalTipPool.toLocaleString('en-IN')}.00</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tip Pool Split Formula */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-orange-600" />
            <span>INDIVIDUAL TIP PAYOUTS</span>
          </h4>
          <div className="space-y-3 mt-4 text-xs">
            <div className="space-y-2">
              {activeStaff.map((st) => (
                <div key={st.id} className="flex items-center justify-between gap-3 p-2 bg-[#FAF8F5] rounded-lg border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-emerald-700 font-bold">₹ {tipPerStaff}</div>
                  </div>
                  <button
                    onClick={() => handleIndividualTipPayout(st.name)}
                    className="bg-[#9C3D1E] text-white py-1.5 px-3 rounded-lg text-[11px] font-bold hover:bg-emerald-600 transition"
                  >
                    PAY TIP
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Attendance Log */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-600" />
            <span>Shift Attendance Log</span>
          </h4>
          <div className="space-y-2 mt-3 text-xs max-h-56 overflow-y-auto pr-1">
            {staffRoster.map((st) => (
              <div key={st.id} className="flex justify-between items-center p-2 rounded bg-[#FAF8F5] border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">{st.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    st.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FAF8F5] text-slate-600'
                  }`}>
                    [{st.status}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
