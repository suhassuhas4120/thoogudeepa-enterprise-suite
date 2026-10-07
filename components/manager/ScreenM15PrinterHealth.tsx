'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Printer, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';

export function ScreenM15PrinterHealth() {
  const { hardwareDevices, toggleHardwareStatus } = useManagerStore();

  const handleTestPrint = (name: string) => {
    alert(`[TEST TICKET PRINTED]\nDevice: ${name}\nHardware: Thermal 80mm ESC/POS\nStatus: Test pattern OK!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            THERMAL PRINTERS, POS EDC SWIPES &amp; SOUNDBOX
          </h3>
        </div>
        <button
          onClick={() => alert('Spooler restarted! All 6 devices queried and responding.')}
          className="bg-[#9C3D1E] text-white py-2 px-4 rounded-xl text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>RESTART PRINT SPOOLER</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hardwareDevices.map((dev) => (
          <div key={dev.id} className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] bg-[#9C3D1E] text-white font-black px-1.5 py-0.5 rounded">
                  {dev.type}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  dev.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  [{dev.status}]
                </span>
              </div>

              <h4 className="font-black text-sm text-slate-900 mt-2">{dev.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Location: {dev.location}</p>
              <div className="mt-2 p-2 bg-[#FAF8F5] rounded border border-slate-200 text-[11px] text-slate-600">
                {dev.details}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => handleTestPrint(dev.name)}
                className="flex-1 bg-[#FAF8F5] border border-slate-300 py-1.5 rounded text-xs font-bold text-slate-700 hover:bg-stone-200 transition text-center"
              >
                TEST PRINT SLIP
              </button>
              <button
                onClick={() => toggleHardwareStatus(dev.id)}
                className="bg-[#9C3D1E] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition"
              >
                PING
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
