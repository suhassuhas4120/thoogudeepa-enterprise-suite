'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Flame, Clock, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export function ScreenM5KitchenSpeed() {
  const { kdsTickets, kitchenBumpTable } = useSharedBridge();

  const activeTickets = kdsTickets.filter((tk) => tk.status !== 'COMPLETED');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 border border-[#D6D3D1] rounded-2xl bg-white shadow-sm">
      {/* Top Banner */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black font-mono text-slate-900 mt-1">
            DUM POT &amp; TANDOOR DISPATCH TRACKER
          </h3>
        </div>
        <button
          onClick={() => {
            activeTickets.forEach((t) => kitchenBumpTable(t.id));
            alert('Expedited all ready tickets to SERVED!');
          }}
          className="bg-[#9C3D1E] text-white py-2 px-4 rounded-xl font-mono text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-xs"
        >
          <Zap className="h-4 w-4 text-amber-400" />
          <span>EXPEDITE ALL READY DISHES</span>
        </button>
      </div>

      {/* 3 Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>STATION 1: DUM BIRYANI POT</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">NORMAL</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">6 Mins Avg Prep</div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>STATION 2: TANDOOR &amp; KEBABS</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">RUSH</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">14 Mins Avg Prep</div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>STATION 3: GRAVIES &amp; BREADS</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">NORMAL</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">5 Mins Avg Prep</div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm">
        <h4 className="text-xs font-mono font-black text-slate-900 uppercase mb-3">
          Active Kitchen Tickets ({activeTickets.length} orders in pipeline)
        </h4>

        {activeTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTickets.map((tk) => (
              <div key={tk.id} className="p-3 rounded-lg border border-[#EAE5DF] bg-[#FAF8F5] font-mono text-xs">
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
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end items-center">
                  <button
                    onClick={() => kitchenBumpTable(tk.id)}
                    className="bg-[#9C3D1E] text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-orange-600 transition"
                  >
                    BUMP TO READY
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center font-mono text-xs text-slate-500 bg-[#FAF8F5] rounded-xl">
            Kitchen queue is clear! All placed KOTs have been prepared and served.
          </div>
        )}
      </div>
    </div>
  );
}
