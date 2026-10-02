'use client';

import React, { useState } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import { LayoutGrid, Printer, ArrowRightLeft, Users, CheckCircle, IndianRupee, ArrowRight, Utensils } from 'lucide-react';

export function ScreenM3FloorPlan() {
  const { tables, waiterVacatesTable } = useSharedBridge();
  const { selectedTableNumber, setSelectedTableNumber, setCurrentScreen } = useManagerStore();
  const [activeSection, setActiveSection] = useState('ALL');

  const sections = ['ALL', 'SECTION A', 'SECTION B', 'SECTION C'];
  const filteredTables = activeSection === 'ALL' ? tables : tables.filter((t) => t.section.includes(activeSection));

  const selectedTable = tables.find((t) => t.number === selectedTableNumber) || tables[0];

  const handleVacate = () => {
    if (selectedTable) {
      waiterVacatesTable(selectedTable.number);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Left Main Tables Canvas */}
      <div className="md:col-span-8 flex flex-col gap-4">
        {/* Section Tabs */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[3px_3px_0px_#0f172a]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black font-mono text-slate-900">FLOOR SECTIONS &amp; TABLES</h3>
              <p className="text-xs text-slate-500 font-mono">Select table to view running orders or settle bill</p>
            </div>
            <div className="flex gap-1.5">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition ${
                    activeSection === sec
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-stone-50 text-slate-600 border-slate-200 hover:bg-stone-100'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredTables.map((tbl) => {
            const isSelected = tbl.number === selectedTableNumber;
            const isOcc = tbl.status === 'OCCUPIED';
            const isBill = tbl.status === 'BILLING';
            return (
              <button
                key={tbl.id}
                onClick={() => setSelectedTableNumber(tbl.number)}
                className={`p-4 rounded-xl border-2 text-left font-mono transition relative ${
                  isSelected
                    ? 'border-orange-600 ring-2 ring-orange-500/30 shadow-[3px_3px_0px_#ea580c]'
                    : 'border-slate-900 shadow-[3px_3px_0px_#0f172a]'
                } ${
                  isOcc
                    ? 'bg-slate-900 text-white'
                    : isBill
                    ? 'bg-amber-50 text-amber-950 border-amber-600'
                    : 'bg-white text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-black">{tbl.number}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isOcc ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tbl.capacity} Pax
                  </span>
                </div>
                <div className="mt-3 text-sm font-black">
                  {isOcc || isBill ? `₹ ${tbl.currentBill}` : 'VACANT'}
                </div>
                <div className={`text-[11px] mt-1 truncate ${isOcc ? 'text-slate-300' : 'text-slate-500'}`}>
                  {tbl.serverName}
                </div>
                {tbl.kotCount > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                    <Utensils className="h-2.5 w-2.5" />
                    <span>{tbl.kotCount} KOT Active</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Table Detail Sidebar */}
      <div className="md:col-span-4 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono font-bold text-slate-500">SELECTED TABLE</span>
              <h3 className="text-xl font-black font-mono text-slate-900">
                Table {selectedTable?.number}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              selectedTable?.status === 'OCCUPIED'
                ? 'bg-slate-900 text-white'
                : selectedTable?.status === 'BILLING'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              [{selectedTable?.status}]
            </span>
          </div>

          <div className="space-y-2 mt-4 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Captain / Server:</span>
              <span className="font-bold text-slate-900">{selectedTable?.serverName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Seated Guests:</span>
              <span className="font-bold text-slate-900">{selectedTable?.guestCount} Guests</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Capacity:</span>
              <span className="font-bold text-slate-900">{selectedTable?.capacity} Persons</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Section:</span>
              <span className="font-bold text-slate-900">{selectedTable?.section}</span>
            </div>
          </div>

          {/* Running Items Preview */}
          <div className="mt-5">
            <h4 className="text-xs font-mono font-black text-slate-900 uppercase mb-2">
              Running Order Items:
            </h4>
            {selectedTable?.activeItems && selectedTable.activeItems.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedTable.activeItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-stone-50 border border-slate-200 text-xs font-mono">
                    <span className="font-bold text-slate-800">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-stone-50 rounded border border-slate-200 text-center text-xs font-mono text-slate-400">
                No active food items on this table
              </div>
            )}
          </div>

          {/* Current Bill Total */}
          <div className="mt-4 p-3 bg-stone-100 rounded-lg border border-slate-300 flex justify-between items-center font-mono">
            <span className="text-xs font-bold text-slate-600">CURRENT RUNNING BILL:</span>
            <span className="text-lg font-black text-slate-900">
              ₹ {selectedTable?.currentBill.toLocaleString('en-IN')}.00
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={() => setCurrentScreen(4)}
            className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-xl font-mono text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition shadow-[2px_2px_0px_#0f172a]"
          >
            <span>OPEN BILLING / POS ➔</span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => alert(`Thermal Running KOT Printed for Table ${selectedTable?.number}`)}
              className="bg-stone-100 border border-slate-300 py-2 px-3 rounded-lg font-mono text-xs font-bold text-slate-700 hover:bg-stone-200 transition text-center"
            >
              PRINT KOT
            </button>
            <button
              onClick={handleVacate}
              className="bg-rose-50 border border-rose-200 py-2 px-3 rounded-lg font-mono text-xs font-bold text-rose-700 hover:bg-rose-100 transition text-center"
            >
              VACATE TABLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
