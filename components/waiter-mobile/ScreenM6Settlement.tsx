'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  onBack: () => void;
  onDone: () => void;
}

type PayMethod = 'CASH' | 'UPI' | 'CARD';

const CASH_PRESETS = [100, 200, 500, 1000, 2000];

export function ScreenM6Settlement({ tableNum, onBack, onDone }: Props) {
  const { tables, waiterRecordsPayment, waiterVacatesTable } = useSharedBridge();
  const table = tables.find((t) => t.number === tableNum);

  const [method, setMethod] = useState<PayMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [vacateAfter, setVacateAfter] = useState(true);
  const [settled, setSettled] = useState(false);

  if (!table) return null;

  const bill = table.currentBill || 0;
  const change = typeof cashTendered === 'number' && cashTendered >= bill
    ? cashTendered - bill
    : null;

  const handleSettle = () => {
    waiterRecordsPayment(tableNum, method, bill);
    if (vacateAfter) {
      setTimeout(() => waiterVacatesTable(tableNum), 400);
    }
    setSettled(true);
    setTimeout(() => onDone(), 1800);
  };

  if (settled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="h-16 w-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <div>
          <p className="font-mono text-xs font-black text-emerald-700 uppercase tracking-wider">
            Payment Recorded
          </p>
          <h2 className="text-2xl font-black text-stone-900 mt-0.5">{tableNum}</h2>
          <p className="font-mono text-lg font-bold text-stone-700 mt-1">
            ₹{bill} via {method}
          </p>
          {vacateAfter && (
            <p className="font-mono text-[10px] text-stone-500 mt-1">
              Table reset for new guests
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] select-none font-sans">

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center gap-3 shadow-2xs backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-600 font-mono text-xs font-bold"
        >
          <ChevronLeft className="h-4 w-4" />
          {tableNum}
        </button>
        <span className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-wider flex-1 text-center">
          Settle Bill
        </span>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* Bill summary */}
        <div className="bg-white border border-[#EAE5DF] rounded-2xl p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-stone-500">Table</span>
            <span className="font-mono text-xs font-black text-stone-900">{tableNum}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-stone-500">Section</span>
            <span className="font-mono text-xs text-stone-700">{table.section}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#EAE5DF] pt-2 mt-1">
            <span className="font-mono text-sm font-black text-stone-900">Total Bill</span>
            <span className="font-mono text-2xl font-black text-stone-900">₹{bill}</span>
          </div>
        </div>

        {/* Payment method selector */}
        <div>
          <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider mb-2">
            Payment Method
          </p>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'CASH', icon: <Banknote className="h-4 w-4" />, label: 'Cash' },
              { id: 'UPI',  icon: <QrCode className="h-4 w-4" />,   label: 'UPI' },
              { id: 'CARD', icon: <CreditCard className="h-4 w-4" />, label: 'Card' },
            ] as { id: PayMethod; icon: React.ReactNode; label: string }[]).map(({ id, icon, label }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMethod(id)}
                className={`py-3 rounded-2xl border-2 font-mono text-xs font-black flex flex-col items-center gap-1.5 transition ${
                  method === id
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-sm'
                    : 'bg-white text-stone-700 border-[#EAE5DF] hover:border-stone-300'
                }`}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cash-tendered section */}
        {method === 'CASH' && (
          <div className="space-y-3">
            <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider">
              Cash Tendered
            </p>
            <div className="flex flex-wrap gap-2">
              {CASH_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCashTendered(preset)}
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition ${
                    cashTendered === preset
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Enter amount…"
              value={cashTendered}
              onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 bg-white border border-[#EAE5DF] rounded-xl font-mono text-sm font-bold text-stone-900 focus:outline-none focus:border-[#9C3D1E] shadow-xs"
            />
            {change !== null && change >= 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="font-mono text-xs font-bold text-emerald-800">Change to return</span>
                <span className="font-mono text-lg font-black text-emerald-700">₹{change}</span>
              </div>
            )}
          </div>
        )}

        {/* Vacate checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={vacateAfter}
            onChange={(e) => setVacateAfter(e.target.checked)}
            className="h-4 w-4 rounded accent-[#9C3D1E]"
          />
          <span className="font-mono text-xs font-bold text-stone-700">
            Vacate &amp; reset table after settlement
          </span>
        </label>

        {/* Confirm button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSettle}
          disabled={bill === 0}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-mono text-sm font-black flex items-center justify-center gap-2 shadow-md transition"
        >
          <CheckCircle2 className="h-5 w-5" />
          Confirm ₹{bill} via {method}
        </motion.button>
      </div>
    </div>
  );
}
