'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { vacateTablePod } from '../../../lib/db';
import {
  Tablet,
  Smartphone,
  Users,
  UtensilsCrossed,
  Flame,
  CheckCircle2,
  Trash2,
  Receipt,
  CreditCard,
  Briefcase,
  QrCode,
  Utensils,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WaiterTabletCockpitPage() {
  const {
    tables,
    pings,
    kdsTickets,
    waiterVacatesTable,
    waiterRecordsPayment,
    waiterResolvePing,
  } = useSharedBridge();

  const [selectedTableNum, setSelectedTableNum] = useState<string>('T-15');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  const selectedTable = tables.find((t) => t.number === selectedTableNum) || tables[0];
  const activeTicketsForTable = kdsTickets.filter((tk) => tk.tableNumber === selectedTable?.number);

  const sections = ['ALL', 'Family Section', 'Main Dining Hall', 'Express / Couple Hall', 'Courtyard Garden', 'Grand Feast Hall'];

  const filteredTables = tables.filter((t) => {
    if (selectedSection === 'ALL') return true;
    return t.section.toLowerCase().includes(selectedSection.toLowerCase());
  });

  const handleVacateTable = async (tableNum: string) => {
    // 1. Update shared bridge state
    waiterVacatesTable(tableNum);
    // 2. Update Supabase PostgreSQL database
    await vacateTablePod(tableNum);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OCCUPIED': return 'border-orange-500 bg-orange-50 text-orange-900';
      case 'BILLING': return 'border-purple-500 bg-purple-50 text-purple-900';
      case 'CLEANING': return 'border-amber-500 bg-amber-50 text-amber-900';
      case 'VACANT': return 'border-emerald-500 bg-emerald-50 text-emerald-900';
      default: return 'border-slate-300 bg-stone-50 text-slate-800';
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Cockpit Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/95 px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/30">
            <Tablet className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-wider text-orange-400">
              Captain Tablet Station
            </div>
            <h1 className="text-sm font-black tracking-tight uppercase text-white">
              Thoogudeepa Donne Biryani Mane
            </h1>
          </div>
        </div>

        {/* Global Multi-Portal Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>Customer (10)</span>
          </Link>
          <Link
            href="/kitchen"
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Kitchen (3)</span>
          </Link>
          <Link
            href="/waiter/mobile"
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Steward Mobile</span>
          </Link>
          <span className="rounded-xl bg-orange-600 text-white px-3 py-1.5 shadow-xs flex items-center gap-1">
            <Tablet className="h-3.5 w-3.5" />
            <span>Captain Tablet</span>
          </span>
          <Link
            href="/manager"
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Manager</span>
          </Link>
          <Link
            href="/qr-deck"
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Deck (34)</span>
          </Link>
        </div>
      </header>

      {/* Main 60 / 40 Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left 60%: Interactive Floor Matrix */}
        <div className="w-[60%] border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto bg-slate-900/40">
          <div>
            {/* Section Filters */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
              {sections.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition whitespace-nowrap ${
                    selectedSection === sec
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* 34 Tables Grid */}
            <div className="grid grid-cols-4 gap-3">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable?.number === tbl.number;
                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTableNum(tbl.number)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between min-h-[100px] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-950/40 shadow-md ring-2 ring-orange-500/30'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="font-mono text-sm font-black text-white">
                        {tbl.number}
                      </span>
                      <span className={`font-mono text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${getStatusColor(tbl.status)}`}>
                        {tbl.status}
                      </span>
                    </div>

                    <div className="my-1 font-mono text-xs font-bold text-slate-400">
                      <div>Cap: {tbl.capacity} Seats</div>
                      <div className="text-white text-sm mt-0.5">
                        ₹{tbl.currentBill || 0}
                      </div>
                    </div>

                    <div className="text-[9.5px] font-mono text-slate-500 truncate">
                      {tbl.section}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL TABLES: {tables.length}</span>
            <span className="text-emerald-400 font-bold">WEBSOCKETS REALTIME CONNECTED</span>
          </div>
        </div>

        {/* Right 40%: Active Table Cockpit Inspection */}
        <div className="w-[40%] bg-slate-900 p-5 flex flex-col justify-between overflow-y-auto">
          {selectedTable ? (
            <div>
              {/* Selected Table Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-orange-400">
                    Table Details
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    TABLE {selectedTable.number}
                  </h2>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedTable.section} • Capacity: {selectedTable.capacity} Seats
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${getStatusColor(selectedTable.status)}`}>
                    {selectedTable.status}
                  </span>
                  <div className="font-mono text-base font-black text-emerald-400 mt-1">
                    ₹{selectedTable.currentBill || 0}
                  </div>
                </div>
              </div>

              {/* Active KOTs for Table */}
              <div className="space-y-3 mb-6">
                <div className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active KOT Tickets ({activeTicketsForTable.length})
                </div>

                {activeTicketsForTable.length === 0 ? (
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center font-mono text-xs text-slate-500">
                    No active KOT tickets for {selectedTable.number}
                  </div>
                ) : (
                  activeTicketsForTable.map((tk) => (
                    <div
                      key={tk.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-orange-400">
                          #{tk.id} • {tk.serverName}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-300">
                          {tk.status}
                        </span>
                      </div>
                      <div className="space-y-1 pt-1 font-mono text-xs text-slate-300">
                        {tk.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="text-orange-300 font-bold">{it.stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Actions Bar */}
              <div className="space-y-2.5">
                <div className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Captain Floor Operations
                </div>

                <button
                  onClick={() => handleVacateTable(selectedTable.number)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-mono text-xs font-black uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>VACATE TABLE {selectedTable.number}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => waiterRecordsPayment(selectedTable.number, 'CASH', selectedTable.currentBill || 0)}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Record Cash</span>
                  </button>
                  <Link
                    href={`/?table=${selectedTable.number}&seat=1`}
                    target="_blank"
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Utensils className="h-3.5 w-3.5" />
                    <span>Open Seat 1</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 font-mono text-xs">
              Select a table from the matrix to inspect
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
