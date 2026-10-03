'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, Tablet, ChevronRight, Utensils, Flame, Briefcase, QrCode } from 'lucide-react';

export default function WaiterIndexPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3.5 py-1 bg-orange-50 border border-orange-200 text-[#9C3D1E] font-mono text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xs">
            Floor Operations
          </div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 uppercase">
            Thoogudeepa Donne Biryani Mane
          </h1>
          <p className="text-stone-500 text-xs font-mono">
            Select your floor terminal station
          </p>
        </div>

        {/* Station Select Cards */}
        <div className="space-y-3.5">
          <Link
            href="/waiter/mobile"
            className="flex items-center justify-between p-5 bg-white border-2 border-[#EAE5DF] hover:border-[#9C3D1E] rounded-3xl transition group shadow-xs hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-13 w-13 rounded-2xl bg-orange-50 text-[#9C3D1E] flex items-center justify-center border border-orange-200 group-hover:bg-[#9C3D1E] group-hover:text-white transition">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-mono text-base font-black text-stone-900 group-hover:text-[#9C3D1E] transition">
                  Floor Steward Mobile
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  Handheld order taking, customer calls &amp; table vacate
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-[#9C3D1E] group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/waiter/tablet"
            className="flex items-center justify-between p-5 bg-white border-2 border-[#EAE5DF] hover:border-[#9C3D1E] rounded-3xl transition group shadow-xs hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-13 w-13 rounded-2xl bg-orange-50 text-[#9C3D1E] flex items-center justify-center border border-orange-200 group-hover:bg-[#9C3D1E] group-hover:text-white transition">
                <Tablet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-mono text-base font-black text-stone-900 group-hover:text-[#9C3D1E] transition">
                  Captain Tablet Cockpit
                </h2>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  Full 34-table floor plan, KOT tickets &amp; settlement pass
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-[#9C3D1E] group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Global Navigation Footer */}
        <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-center gap-2 font-mono text-xs font-bold">
          <Link href="/" className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl text-stone-600 transition shadow-2xs">
            Diner
          </Link>
          <Link href="/kitchen" className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl text-stone-600 transition shadow-2xs">
            KDS
          </Link>
          <Link href="/manager" className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#EAE5DF] rounded-xl text-stone-600 transition shadow-2xs">
            Manager
          </Link>
          <Link href="/qr-deck" className="px-3 py-1.5 bg-amber-500 text-stone-950 font-bold rounded-xl hover:bg-amber-400 transition shadow-2xs">
            QR Deck
          </Link>
        </div>
      </div>
    </main>
  );
}
