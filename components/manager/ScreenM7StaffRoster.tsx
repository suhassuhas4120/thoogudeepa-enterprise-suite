'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Users, Phone, Radio, CheckCircle, Clock } from 'lucide-react';

export function ScreenM7StaffRoster() {
  const { staffRoster, updateStaffStatus } = useManagerStore();

  const handleBroadcast = () => {
    alert('BEEP! Broadcast Paged to All Waiter Handhelds: All Captains report to Billing Counter 01!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono">
      {/* Top Banner */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
              [STAFF ROSTER DESK]
            </span>
            <span className="text-xs font-bold text-slate-500">DINNER SERVICE SQUAD</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1">
            FLOOR CAPTAINS &amp; TABLE ASSIGNMENTS
          </h3>
        </div>
        <button
          onClick={handleBroadcast}
          className="bg-slate-900 text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-[2px_2px_0px_#0f172a]"
        >
          <Radio className="h-4 w-4 text-emerald-400" />
          <span>PAGE ALL CAPTAINS TO TILL</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffRoster.map((st) => (
          <div key={st.id} className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm text-slate-900">{st.name}</h4>
                  <span className="text-xs text-orange-600 font-bold">{st.role}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  st.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : st.status === 'ON BREAK'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  [{st.status}]
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Assigned Section:</span>
                  <span className="font-bold text-slate-900">{st.assignedSection}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Tables:</span>
                  <span className="font-bold text-slate-900">{st.tablesCount} Tables</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile Phone:</span>
                  <span className="text-slate-800">{st.phone}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-100">
                  <span>Cash in Hand:</span>
                  <span>₹ {st.cashCollected.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => updateStaffStatus(st.id, st.status === 'ACTIVE' ? 'ON BREAK' : 'ACTIVE')}
                className="flex-1 bg-stone-100 border border-slate-300 py-1.5 rounded text-xs font-bold text-slate-700 hover:bg-stone-200 transition text-center"
              >
                {st.status === 'ACTIVE' ? 'MARK ON BREAK' : 'SET ACTIVE'}
              </button>
              <button
                onClick={() => alert(`Vibrating smartwatch & handheld of ${st.name}!`)}
                className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition"
              >
                PAGE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
