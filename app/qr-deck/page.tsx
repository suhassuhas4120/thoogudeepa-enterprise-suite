'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Printer,
  ExternalLink,
  Users,
  UtensilsCrossed,
  Flame,
  UserCheck,
  Briefcase,
  Utensils,
  ChevronRight,
  Sparkles,
  Smartphone,
  Tablet,
} from 'lucide-react';

interface TableDefinition {
  number: string;
  capacity: number;
  section: string;
}

const ALL_TABLES: TableDefinition[] = [
  // 4x 2-Seaters
  { number: 'T-01', capacity: 2, section: 'Express Couple Pod' },
  { number: 'T-02', capacity: 2, section: 'Express Couple Pod' },
  { number: 'T-03', capacity: 2, section: 'Express Couple Pod' },
  { number: 'T-04', capacity: 2, section: 'Express Couple Pod' },

  // 10x 3-Seaters
  { number: 'T-05', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-06', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-07', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-08', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-09', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-10', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-11', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-12', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-13', capacity: 3, section: 'Main Dining Hall' },
  { number: 'T-14', capacity: 3, section: 'Main Dining Hall' },

  // 10x 4-Seaters
  { number: 'T-15', capacity: 4, section: 'Family Section' },
  { number: 'T-16', capacity: 4, section: 'Family Section' },
  { number: 'T-17', capacity: 4, section: 'Family Section' },
  { number: 'T-18', capacity: 4, section: 'Family Section' },
  { number: 'T-19', capacity: 4, section: 'Family Section' },
  { number: 'T-20', capacity: 4, section: 'Family Section' },
  { number: 'T-21', capacity: 4, section: 'Family Section' },
  { number: 'T-22', capacity: 4, section: 'Family Section' },
  { number: 'T-23', capacity: 4, section: 'Family Section' },
  { number: 'T-24', capacity: 4, section: 'Family Section' },

  // 5x 5-Seaters
  { number: 'T-25', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-26', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-27', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-28', capacity: 5, section: 'Courtyard Garden' },
  { number: 'T-29', capacity: 5, section: 'Courtyard Garden' },

  // 5x 6-Seaters
  { number: 'T-30', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-31', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-32', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-33', capacity: 6, section: 'Grand Feast Hall' },
  { number: 'T-34', capacity: 6, section: 'Grand Feast Hall' },
];

export default function QRDeckPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [activeTablePrint, setActiveTablePrint] = useState<TableDefinition | null>(null);

  const filteredTables = selectedCategory === 'ALL'
    ? ALL_TABLES
    : ALL_TABLES.filter((t) => t.capacity === selectedCategory);

  const getSeatUrl = (table: string, seat: number) => {
    return `/?table=${table}&seat=${seat}`;
  };

  const getQRImageUrl = (table: string, seat: number) => {
    const fullUrl = `https://thoogudeepa-develop.surge.sh/?table=${table}&seat=${seat}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(fullUrl)}&color=0F3A22`;
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      {/* Console Header */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-6 py-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm shadow-amber-500/30">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                Table QR Codes
              </span>
              <span className="font-mono text-[10px] text-slate-500 font-semibold">
                Thoogudeepa Donne Biryani Mane
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 mt-0.5">
              Table QR Directory and Cards
            </h1>
          </div>
        </div>

        {/* Global Multi-Portal Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-1 shadow-xs font-mono text-xs font-bold">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>CUSTOMER (10)</span>
            </Link>
            <Link
              href="/kitchen"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>KITCHEN (3)</span>
            </Link>
            <Link
              href="/waiter/mobile"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>WAITER MOBILE</span>
            </Link>
            <Link
              href="/waiter/tablet"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>CAPTAIN TABLET</span>
            </Link>
            <Link
              href="/manager"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>MANAGER (16)</span>
            </Link>
            <span className="rounded-xl bg-amber-600 text-white px-3 py-1.5 shadow-xs flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" />
              <span>QR DECK (34)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Filter Chips Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
            Filter Capacity:
          </span>
          {[
            { id: 'ALL', label: 'All 34 Tables (133 QRs)' },
            { id: 2, label: '2-Seaters (4 Tables / 8 QRs)' },
            { id: 3, label: '3-Seaters (10 Tables / 30 QRs)' },
            { id: 4, label: '4-Seaters (10 Tables / 40 QRs)' },
            { id: 5, label: '5-Seaters (5 Tables / 25 QRs)' },
            { id: 6, label: '6-Seaters (5 Tables / 30 QRs)' },
          ].map((cat) => (
            <button
              key={cat.id.toString()}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#9C3D1E] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-slate-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-mono text-xs font-bold shadow-xs transition shrink-0"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>PRINT ENTIRE FLOOR DECK</span>
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((tbl) => (
            <div
              key={tbl.number}
              className="bg-white rounded-2xl border border-[#EAE5DF] p-4 shadow-sm flex flex-col justify-between"
            >
              {/* Table Card Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-2 mb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                      [{tbl.section}]
                    </span>
                    <h2 className="text-lg font-black text-slate-900">
                      TABLE {tbl.number}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg font-mono text-xs font-black text-amber-900">
                    {tbl.capacity} SEATS
                  </span>
                </div>

                {/* Tabletop Edge Seat Grid */}
                <div className="grid grid-cols-2 gap-3 my-2">
                  {Array.from({ length: tbl.capacity }, (_, i) => i + 1).map((seat) => (
                    <div
                      key={seat}
                      className="border border-slate-300 rounded-xl p-2.5 bg-[#FAF8F5] flex flex-col items-center text-center shadow-2xs hover:bg-orange-50/50 transition group"
                    >
                      <span className="font-mono text-[10.5px] font-black text-slate-800 mb-1">
                        SEAT #{seat}
                      </span>

                      {/* Scannable QR Image */}
                      <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                        <img
                          src={getQRImageUrl(tbl.number, seat)}
                          alt={`QR for ${tbl.number} Seat ${seat}`}
                          className="h-24 w-24 object-contain"
                          loading="lazy"
                        />
                      </div>

                      <div className="mt-2 w-full flex items-center justify-between gap-1">
                        <a
                          href={getSeatUrl(tbl.number, seat)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1 py-1 px-1.5 bg-[#9C3D1E] hover:bg-[#7c3018] text-white rounded font-mono text-[9px] font-black uppercase tracking-wider transition"
                        >
                          <span>TEST SEAT</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>THOOGUDEEPA DONNE BIRYANI</span>
                <span className="font-bold text-emerald-700">PURE-UPI ANCHOR</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
