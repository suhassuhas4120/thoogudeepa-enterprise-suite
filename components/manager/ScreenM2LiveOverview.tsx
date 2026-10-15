'use client';

import React, { useState } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import { TableChairsSheet } from './TableChairsSheet';
import { Users, Utensils, TrendingUp, Clock } from 'lucide-react';

export function ScreenM2LiveOverview() {
  const { tables, kdsTickets, shiftStats, pings } = useSharedBridge();
  const { selectedTableNumber, setSelectedTableNumber, setCurrentScreen } = useManagerStore();

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING');
  const totalSeated = occupiedTables.reduce((acc, t) => acc + (t.guestCount || 0), 0);
  const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
  const activeTickets = kdsTickets.filter((tk) => {
    if (!tk.items || tk.items.length === 0) return false;
    if (tk.status === 'COMPLETED') return false;
    const isOccupiedOrBilling = tables.some(
      (t) => (t.status === 'OCCUPIED' || t.status === 'BILLING') && cleanNum(t.number) === cleanNum(tk.tableNumber)
    );
    const hasUnservedItem = tk.items.some((it) => it.stage !== 'SERVED');
    return isOccupiedOrBilling || hasUnservedItem;
  });
  const activeKdsCount = activeTickets.length;
  const currentLiveBillSum = tables.reduce((acc, t) => acc + t.currentBill, 0);

  const activeTableNum = selectedTableNumber || tables.find((t) => t.status === 'OCCUPIED')?.number || tables[0]?.number || 'T-01';

  const handleTableClick = (tableNum: string) => {
    setSelectedTableNumber(tableNum);
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>TODAY SALES (LIVE)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            ₹ {(shiftStats.totalRevenue + currentLiveBillSum).toLocaleString('en-IN')}.00
          </div>
        </div>

        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>GUESTS SEATED</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            {totalSeated} Guests
          </div>
        </div>

        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>ACTIVE KITCHEN KOTS</span>
            <Utensils className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            {activeKdsCount} Orders
          </div>
        </div>

        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>TABLE OCCUPANCY</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 mt-1">
            {occupiedTables.length}/{tables.length} Tables
          </div>
        </div>
      </div>

      {/* Main Tables Status Matrix (5 Cols) + Chairs Section (3 Cols) Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-start">
        {/* Left: 5 Columns for Restaurant Tables Live Status Matrix */}
        <div className="lg:col-span-5 bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-sm flex flex-col min-h-[650px]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-black font-mono text-slate-900">
                RESTAURANT TABLES LIVE STATUS MATRIX
              </h3>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 font-mono text-[11px] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9C3D1E]"></span> OCCUPIED</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> BILLING</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-[#EAE5DF]"></span> VACANT</span>
            </div>
          </div>

          {/* Exactly 5 Columns Grid of Tables */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3.5">
            {tables.map((tbl) => {
              const isSelected = tbl.number === activeTableNum;
              const isOcc = tbl.status === 'OCCUPIED';
              const isBill = tbl.status === 'BILLING';
              return (
                <button
                  key={tbl.id}
                  onClick={() => handleTableClick(tbl.number)}
                  className={`flex flex-col p-2.5 rounded-lg border-2 text-left font-mono transition relative cursor-pointer ${
                    isOcc
                      ? isSelected
                        ? 'bg-[#9C3D1E] text-white border-yellow-400 shadow-sm z-10'
                        : 'bg-[#9C3D1E] text-white border-[#9C3D1E] hover:border-yellow-400/50 shadow-2xs'
                      : isBill
                      ? isSelected
                        ? 'bg-amber-100 text-amber-950 border-amber-600 shadow-sm z-10'
                        : 'bg-amber-100 text-amber-950 border-amber-400 hover:border-amber-500 shadow-2xs'
                      : isSelected
                      ? 'bg-white text-slate-900 border-[#9C3D1E] shadow-sm z-10'
                      : 'bg-white text-slate-900 border-[#EAE5DF] hover:border-[#9C3D1E] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isOcc ? 'text-white' : 'text-slate-900'}`}>
                      {tbl.number}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded font-black ${
                        isOcc ? 'bg-black/30 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tbl.capacity}P
                    </span>
                  </div>
                  <div
                    className={`mt-1.5 text-xs font-black truncate ${
                      isOcc ? 'text-white' : isBill ? 'text-amber-900' : 'text-slate-800'
                    }`}
                  >
                    {isOcc || isBill ? `₹ ${tbl.currentBill}` : 'VACANT'}
                  </div>
                  {isOcc && (
                    <div className="text-[10px] mt-0.5 truncate text-white/80 font-bold">
                      {tbl.guestCount} Pax • {tbl.kotCount} KOT
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Remaining 3 Columns for Chairs Section of that particular table */}
        <div className="lg:col-span-3 flex flex-col h-[650px] sticky top-20">
          <TableChairsSheet
            tableNumber={activeTableNum}
            isModal={false}
          />
        </div>
      </div>
    </div>
  );
}
