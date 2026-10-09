'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Bell, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function ScreenM8CallsAlerts() {
  const { pings, waiterResolvePing } = useSharedBridge();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono border border-[#D6D3D1] rounded-2xl bg-white shadow-sm">
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-slate-900 mt-1">
            TABLE SERVICE CALLS &amp; ESCALATIONS
          </h3>
        </div>
        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-lg text-xs font-bold">
          {pings.length} PENDING CALLS
        </span>
      </div>

      <div className="space-y-3">
        {pings.length > 0 ? (
          pings.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">Table {p.tableNumber}</span>
                    <span className="text-xs text-slate-600 font-bold">• {p.guestName || 'Dine-in Guest'}</span>
                    <span className="bg-[#FAF8F5] text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      {p.timestamp}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5">
                    REQUEST: <span className="font-black text-orange-600">{p.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => waiterResolvePing(p.id)}
                  className="bg-[#9C3D1E] text-white py-1.5 px-4 rounded-lg text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>RESOLVE CALL</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-xs text-slate-500 bg-white border border-[#EAE5DF] rounded-xl shadow-xs">
            No pending customer calls! All guest requests have been resolved by floor captains.
          </div>
        )}
      </div>
    </div>
  );
}
