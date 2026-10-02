'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, Tablet, ChevronRight, Utensils, Flame, Briefcase, QrCode } from 'lucide-react';

export default function WaiterIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 bg-orange-600/20 border border-orange-500/30 text-orange-400 font-mono text-xs font-black uppercase tracking-widest rounded-full">
            Floor Operations
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase">
            Thoogudeepa Donne Biryani Mane
          </h1>
          <p className="text-slate-400 text-xs font-mono">
            Select your floor terminal station
          </p>
        </div>

        {/* Station Select Cards */}
        <div className="space-y-3">
          <Link
            href="/waiter/mobile"
            className="flex items-center justify-between p-4 bg-slate-900 border-2 border-slate-800 hover:border-orange-500 rounded-2xl transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-600 group-hover:text-white transition">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-mono text-sm font-black text-white group-hover:text-orange-400 transition">
                  Floor Steward Mobile
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Handheld order taking, customer calls & table vacate
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition" />
          </Link>

          <Link
            href="/waiter/tablet"
            className="flex items-center justify-between p-4 bg-slate-900 border-2 border-slate-800 hover:border-orange-500 rounded-2xl transition group shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30 group-hover:bg-orange-600 group-hover:text-white transition">
                <Tablet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-mono text-sm font-black text-white group-hover:text-orange-400 transition">
                  Captain Tablet Cockpit
                </h2>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Full 34-table floor plan, KOT tickets & settlement pass
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition" />
          </Link>
        </div>

        {/* Global Navigation Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 font-mono text-xs">
          <Link href="/" className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
            Diner
          </Link>
          <Link href="/kitchen" className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
            KDS
          </Link>
          <Link href="/manager" className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200">
            Manager
          </Link>
          <Link href="/qr-deck" className="px-2.5 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400">
            QR Deck
          </Link>
        </div>
      </div>
    </main>
  );
}
