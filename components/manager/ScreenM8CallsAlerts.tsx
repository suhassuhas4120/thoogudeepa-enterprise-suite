'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Bell, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function ScreenM8CallsAlerts() {
  const { pings, waiterResolvePing } = useSharedBridge();

  const handleApology = (tableNum: string) => {
    alert(`10% Apology Goodwill Discount added to Table ${tableNum} running bill!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded">
              [CUSTOMER CALLS DESK]
            </span>
            <span className="text-xs font-bold text-slate-500">REAL-TIME SERVICE ALERTS</span>
          </div>
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
              className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a] flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">Table {p.tableNumber}</span>
                    <span className="text-xs text-slate-600 font-bold">• {p.guestName || 'Dine-in Guest'}</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-bold">
                      {p.timestamp}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5">
                    REQUEST: <span className="font-black text-orange-600">{p.type}</span>
                    {p.message && <span className="text-slate-500 ml-1">— "{p.message}"</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApology(p.tableNumber)}
                  className="bg-amber-50 border border-amber-300 text-amber-900 py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-amber-100 transition"
                >
                  APOLOGY 10% OFF
                </button>
                <button
                  onClick={() => waiterResolvePing(p.id)}
                  className="bg-slate-900 text-white py-1.5 px-4 rounded-lg text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>RESOLVE CALL</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-xs text-slate-500 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_#0f172a]">
            No pending customer calls! All guest requests have been resolved by floor captains.
          </div>
        )}
      </div>
    </div>
  );
}
