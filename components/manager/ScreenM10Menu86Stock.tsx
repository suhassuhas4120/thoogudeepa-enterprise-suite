'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Flame, Ban, CheckCircle, Clock } from 'lucide-react';

export function ScreenM10Menu86Stock() {
  const { inventory86, kitchenToggle86, kitchenUpdatePrepDelay } = useSharedBridge();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded">
              [ITEM 86 STOCK CONTROLLER]
            </span>
            <span className="text-xs font-bold text-slate-500">LIVE MENU KILL-SWITCH</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1">
            REAL-TIME DISH AVAILABILITY &amp; PREP DELAYS
          </h3>
          <p className="text-xs text-slate-500">
            Toggling 86 instantly disables the dish on Customer QR Menus and Waiter Captain Handhelds!
          </p>
        </div>
        <span className="bg-stone-100 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold">
          {inventory86.filter((i) => i.is86).length} ITEMS SOLD OUT (86)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory86.map((it) => (
          <div
            key={it.id}
            className={`p-4 rounded-xl border-2 transition flex flex-col justify-between ${
              it.is86
                ? 'bg-rose-50/70 border-rose-600 shadow-[3px_3px_0px_#e11d48]'
                : 'bg-white border-slate-900 shadow-[3px_3px_0px_#0f172a]'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {it.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  it.is86 ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {it.is86 ? '86 SOLD OUT' : 'IN STOCK'}
                </span>
              </div>

              <h4 className="font-black text-sm text-slate-900 mt-1">{it.name}</h4>

              {it.prepDelayMinutes > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                  <Clock className="h-3 w-3" />
                  <span>+{it.prepDelayMinutes} mins prep delay active</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={() => kitchenToggle86(it.id)}
                className={`w-full py-2 rounded-lg text-xs font-black uppercase transition ${
                  it.is86
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {it.is86 ? '✓ RESTORE DISH (IN STOCK)' : '✕ 86 DISH (SOLD OUT)'}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Delay:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => kitchenUpdatePrepDelay(it.id, 5)}
                    className="bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded font-bold text-slate-700"
                  >
                    +5m
                  </button>
                  <button
                    onClick={() => kitchenUpdatePrepDelay(it.id, -5)}
                    className="bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded font-bold text-slate-700"
                  >
                    -5m
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
