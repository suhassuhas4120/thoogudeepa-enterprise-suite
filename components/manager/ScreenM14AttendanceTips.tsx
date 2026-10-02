'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Clock, Gift, Users } from 'lucide-react';

export function ScreenM14AttendanceTips() {
  const { staffRoster } = useManagerStore();
  const { shiftStats } = useSharedBridge();

  const totalTipPool = Math.max(2850, shiftStats.tipsEarned || 2850);
  const serviceShare = Math.round(totalTipPool * 0.6);
  const kitchenShare = Math.round(totalTipPool * 0.4);

  const activeStaff = staffRoster.filter((s) => s.status === 'ACTIVE');
  const tipPerServer = Math.round(serviceShare / Math.max(1, activeStaff.length));

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-500">[STAFF ATTENDANCE &amp; REWARDS]</span>
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
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-orange-600" />
            <span>DAILY TIP SHARING ALGORITHM (60 / 40)</span>
          </h4>
          <div className="space-y-3 mt-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900">Front of House (Captains &amp; Waiters) - 60%</div>
                <div className="text-[11px] text-slate-500">Shared equally among {activeStaff.length} active servers</div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">₹ {serviceShare}</div>
                <div className="text-[11px] text-emerald-700 font-bold">≈ ₹ {tipPerServer} / staff</div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900">Back of House (Dum Cooks &amp; Dishwash) - 40%</div>
                <div className="text-[11px] text-slate-500">Distributed to kitchen helper pool</div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">₹ {kitchenShare}</div>
                <div className="text-[11px] text-slate-500">Kitchen Fund</div>
              </div>
            </div>

            <button
              onClick={() => alert('Tip payouts approved and logged to staff accounts!')}
              className="w-full mt-2 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition"
            >
              APPROVE &amp; DISBURSE TIP PAYOUTS ➔
            </button>
          </div>
        </div>

        {/* Staff Attendance Log */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-600" />
            <span>Shift Attendance Log</span>
          </h4>
          <div className="space-y-2 mt-3 text-xs max-h-56 overflow-y-auto pr-1">
            {staffRoster.map((st) => (
              <div key={st.id} className="flex justify-between items-center p-2 rounded bg-stone-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">{st.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({st.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">In: 17:45</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    st.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
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
