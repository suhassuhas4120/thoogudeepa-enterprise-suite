'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Flame, Clock, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export function ScreenM5KitchenSpeed() {
  const { kdsTickets, kitchenBumpTable } = useSharedBridge();

  const activeTickets = kdsTickets.filter((tk) => tk.status !== 'COMPLETED');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5">
      {/* Top Banner */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
              [KITCHEN SPEED MONITOR]
            </span>
            <span className="font-mono text-xs font-bold text-slate-500">REAL-TIME KDS AUDIT</span>
          </div>
          <h3 className="text-base font-black font-mono text-slate-900 mt-1">
            DUM POT &amp; TANDOOR DISPATCH TRACKER
          </h3>
        </div>
        <button
          onClick={() => {
            activeTickets.forEach((t) => kitchenBumpTable(t.id));
            alert('Expedited all ready tickets to SERVED!');
          }}
          className="bg-slate-900 text-white py-2 px-4 rounded-xl font-mono text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-[2px_2px_0px_#0f172a]"
        >
          <Zap className="h-4 w-4 text-amber-400" />
          <span>EXPEDITE ALL READY DISHES</span>
        </button>
      </div>

      {/* 3 Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-stone-50 border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>STATION 1: DUM BIRYANI POT</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">NORMAL</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">6 Mins Avg Prep</div>
          <p className="text-[11px] text-slate-500 mt-1">Pot 3 (Mutton) • Pot 4 (Chicken) Open</p>
        </div>

        <div className="bg-stone-50 border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>STATION 2: TANDOOR &amp; KEBABS</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">RUSH</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">14 Mins Avg Prep</div>
          <p className="text-[11px] text-slate-500 mt-1">8 skewers active • Charcoal heated</p>
        </div>

        <div className="bg-stone-50 border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>STATION 3: GRAVIES &amp; BREADS</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">NORMAL</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">5 Mins Avg Prep</div>
          <p className="text-[11px] text-slate-500 mt-1">Parotta hot press running</p>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a]">
        <h4 className="text-xs font-mono font-black text-slate-900 uppercase mb-3">
          Active Kitchen Tickets ({activeTickets.length} orders in pipeline)
        </h4>

        {activeTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTickets.map((tk) => (
              <div key={tk.id} className="p-3 rounded-lg border-2 border-slate-900 bg-stone-50 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-900">
                    Table {tk.tableNumber} • {tk.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tk.status === 'READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    [{tk.status}]
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {tk.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-slate-700">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-bold text-slate-500">{it.stage}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Server: {tk.serverName}</span>
                  <button
                    onClick={() => kitchenBumpTable(tk.id)}
                    className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-orange-600 transition"
                  >
                    BUMP TO READY ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center font-mono text-xs text-slate-500 bg-stone-50 rounded-xl">
            Kitchen queue is clear! All placed KOTs have been prepared and served.
          </div>
        )}
      </div>
    </div>
  );
}
