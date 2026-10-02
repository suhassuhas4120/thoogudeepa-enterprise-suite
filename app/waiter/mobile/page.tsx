'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSharedBridge } from '../../../store/useSharedBridge';
import {
  Smartphone,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Flame,
  UserCheck,
  Tablet,
  Briefcase,
  QrCode,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaiterMobilePage() {
  const {
    tables,
    pings,
    kdsTickets,
    waiterResolvePing,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const [activeTab, setActiveTab] = useState<'TABLES' | 'PINGS' | 'READY'>('TABLES');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const readyItems = kdsTickets.filter((tk) => tk.status === 'READY');
  const activePings = pings.filter((p) => p.status === 'PENDING');

  const filteredTables = tables.filter((t) => {
    const matchesSection = selectedSection === 'ALL' || t.section.toLowerCase().includes(selectedSection.toLowerCase());
    const matchesSearch = t.number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OCCUPIED': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'BILLING': return 'border-purple-500 bg-purple-50 text-purple-800';
      case 'CLEANING': return 'border-amber-500 bg-amber-50 text-amber-800';
      case 'VACANT': return 'border-emerald-500 bg-emerald-50 text-emerald-800';
      default: return 'border-slate-300 bg-stone-50 text-slate-700';
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col font-sans max-w-md mx-auto border-x border-slate-300 shadow-2xl">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white p-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <div className="font-mono text-[9px] font-black uppercase tracking-wider text-orange-400">
              FLOOR STEWARD MOBILE
            </div>
            <h1 className="text-xs font-black tracking-tight uppercase">
              Thoogudeepa Donne Biryani
            </h1>
          </div>
        </div>

        {/* Multi-Portal Links */}
        <div className="flex items-center gap-1 font-mono text-[9.5px]">
          <Link href="/" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
            Diner
          </Link>
          <Link href="/kitchen" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
            KDS
          </Link>
          <Link href="/waiter/tablet" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-orange-400 font-bold">
            Tablet
          </Link>
          <Link href="/qr-deck" className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded">
            QRs
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-slate-200 grid grid-cols-3 text-center font-mono text-xs font-black sticky top-[57px] z-30 shadow-2xs">
        <button
          onClick={() => setActiveTab('TABLES')}
          className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1 ${
            activeTab === 'TABLES'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>TABLES</span>
          <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full">
            {tables.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PINGS')}
          className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1 relative ${
            activeTab === 'PINGS'
              ? 'border-rose-600 text-rose-600 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>PINGS</span>
          {activePings.length > 0 && (
            <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {activePings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('READY')}
          className={`py-2.5 border-b-2 transition flex items-center justify-center gap-1 relative ${
            activeTab === 'READY'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>READY DISHES</span>
          {readyItems.length > 0 && (
            <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded-full">
              {readyItems.length}
            </span>
          )}
        </button>
      </nav>

      {/* Main Tab Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Tab 1: Tables Matrix */}
        {activeTab === 'TABLES' && (
          <div className="space-y-3">
            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search table (e.g. T-15)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {filteredTables.map((tbl) => (
                <div
                  key={tbl.id}
                  className={`p-3 rounded-xl border-2 shadow-xs flex flex-col justify-between ${getStatusColor(tbl.status)}`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-current/20">
                    <span className="font-mono text-sm font-black">
                      {tbl.number}
                    </span>
                    <span className="font-mono text-[9px] font-black uppercase">
                      {tbl.status}
                    </span>
                  </div>

                  <div className="my-2 font-mono text-[10.5px]">
                    <div className="text-slate-600 truncate">{tbl.section}</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      ₹{tbl.currentBill || 0}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-current/20 flex items-center justify-between font-mono text-[9px]">
                    <span>Cap: {tbl.capacity}</span>
                    <Link
                      href={`/?table=${tbl.number}&seat=1`}
                      target="_blank"
                      className="text-orange-950 font-black underline"
                    >
                      Diner View ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Live Pings */}
        {activeTab === 'PINGS' && (
          <div className="space-y-2.5">
            {activePings.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-mono text-xs">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-50" />
                <div>NO PENDING CUSTOMER CALLS</div>
              </div>
            ) : (
              activePings.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-white border-2 border-rose-600 rounded-xl shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {p.tableNumber} • SEAT {(p as any).seatNumber || 1}
                      </span>
                      <span className="font-mono text-[10px] font-black uppercase text-slate-900">
                        {p.type} REQUESTED
                      </span>
                    </div>
                    {p.message && (
                      <div className="text-xs font-sans text-slate-600 mt-1 italic">
                        "{p.message}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => waiterResolvePing(p.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-lg shadow-xs transition"
                  >
                    RESOLVE
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Ready Dishes */}
        {activeTab === 'READY' && (
          <div className="space-y-2.5">
            {readyItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-mono text-xs">
                <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2 opacity-50" />
                <div>NO DISHES WAITING AT PASS</div>
              </div>
            ) : (
              readyItems.map((tk) => (
                <div
                  key={tk.id}
                  className="p-3 bg-white border-2 border-blue-600 rounded-xl shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-black text-blue-800">
                      {tk.tableNumber} (KOT #{tk.id.slice(-4)})
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                      {tk.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => waiterMarkKitchenItemServed(tk.id, tk.items[0]?.id || '')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-black rounded-lg shadow-xs transition"
                  >
                    MARK SERVED
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
