'use client';

import React, { useState } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import { IndianRupee, Users, Utensils, AlertTriangle, TrendingUp, Clock, CheckCircle2, ArrowRight, Bell, BellRing, PhoneCall, Receipt, Star } from 'lucide-react';

export function ScreenM2LiveOverview() {
  const { tables, kdsTickets, shiftStats } = useSharedBridge();
  const { setCurrentScreen, setSelectedTableNumber } = useManagerStore();
  const [notificationsRead, setNotificationsRead] = useState(false);

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING');
  const totalSeated = occupiedTables.reduce((acc, t) => acc + (t.guestCount || 0), 0);
  const activeKdsCount = kdsTickets.filter((tk) => tk.status !== 'COMPLETED').length;
  const currentLiveBillSum = tables.reduce((acc, t) => acc + t.currentBill, 0);

  const handleTableClick = (tableNum: string) => {
    setSelectedTableNumber(tableNum);
    setCurrentScreen(3); // Floor plan
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 border border-[#D6D3D1] rounded-2xl bg-white shadow-sm">
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

      {/* Main Tables Status Matrix */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mt-4">
          {tables.map((tbl) => {
            const isOcc = tbl.status === 'OCCUPIED';
            const isBill = tbl.status === 'BILLING';
            return (
              <button
                key={tbl.id}
                onClick={() => handleTableClick(tbl.number)}
                className={`flex flex-col p-3 rounded-lg border-2 text-left font-mono transition ${
                  isOcc
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : isBill
                    ? 'bg-amber-50 text-amber-950 border-amber-500 shadow-[2px_2px_0px_#d97706]'
                    : 'bg-white text-slate-800 border-[#EAE5DF] hover:border-[#9C3D1E] shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{tbl.number}</span>
                  <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                    isOcc ? 'bg-slate-700 text-white' : 'bg-[#FAF8F5] text-slate-600'
                  }`}>
                    {tbl.capacity}P
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold">
                  {isOcc || isBill ? `₹ ${tbl.currentBill}` : 'VACANT'}
                </div>
                {isOcc && (
                  <div className="text-[10px] mt-0.5 truncate text-slate-300">
                    {tbl.guestCount} Pax • {tbl.kotCount} KOT
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Kitchen Bottlenecks & Fast Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kitchen Alerts */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono font-black text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>LIVE KITCHEN SPEED & BOTTLENECKS</span>
            </h4>
            <button
              onClick={() => setCurrentScreen(5)}
              className="text-[11px] font-mono font-bold text-orange-600 hover:underline flex items-center gap-1"
            >
              <span>VIEW KDS</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {activeKdsCount > 0 ? (
            <div className="space-y-2 mt-2">
              {kdsTickets.slice(0, 3).map((tk) => (
                <div key={tk.id} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900">Table {tk.tableNumber}</span>
                    <span className="text-slate-500 ml-2">({tk.items.length} items)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tk.status === 'READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {tk.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-mono text-slate-500 bg-[#FAF8F5] rounded-lg">
              No pending kitchen orders • Dum Pot cooking smoothly
            </div>
          )}
        </div>

        {/* Customer Notifications Panel */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono font-black text-slate-900 flex items-center gap-1.5">
              <BellRing className="h-4 w-4 text-[#9C3D1E]" />
              CUSTOMER NOTIFICATIONS
            </h4>
            <button
              onClick={() => setNotificationsRead(true)}
              className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>MARK ALL READ</span>
              <CheckCircle2 className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Waiter Call Alert */}
            <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${notificationsRead ? 'bg-[#FAF8F5] border-slate-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${notificationsRead ? 'bg-slate-100' : 'bg-red-100'}`}>
                <PhoneCall className="h-3.5 w-3.5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-black text-slate-900">Table T-07 — Waiter Call</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${notificationsRead ? 'text-slate-500 bg-slate-200' : 'text-red-600 bg-red-100'}`}>
                    {notificationsRead ? 'READ' : 'NEW'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">Guest requesting assistance • 2 mins ago</p>
              </div>
            </div>

            {/* Bill Request */}
            <div className={`flex items-start gap-3 p-2.5 rounded-lg border ${notificationsRead ? 'bg-[#FAF8F5] border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${notificationsRead ? 'bg-slate-100' : 'bg-amber-100'}`}>
                <Receipt className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-black text-slate-900">Table T-12 — Bill Request</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${notificationsRead ? 'text-slate-500 bg-slate-200' : 'text-amber-700 bg-amber-100'}`}>
                    {notificationsRead ? 'READ' : 'NEW'}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">Guest ready to pay • 4 mins ago</p>
              </div>
            </div>

            {/* Waiter Call — Acknowledged */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#FAF8F5] border border-slate-200">
              <div className="mt-0.5 p-1.5 rounded-full bg-slate-100 shrink-0">
                <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-black text-slate-500">Table T-03 — Waiter Call</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">DONE</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Acknowledged by Kiran K. • 9 mins ago</p>
              </div>
            </div>

            {/* Guest Feedback */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#FAF8F5] border border-slate-200">
              <div className="mt-0.5 p-1.5 rounded-full bg-slate-100 shrink-0">
                <Star className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-mono font-black text-slate-500">Table T-19 — Guest Feedback</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-200 px-1.5 py-0.5 rounded shrink-0">READ</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">⭐⭐⭐⭐⭐ Excellent biryani! • 15 mins ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
