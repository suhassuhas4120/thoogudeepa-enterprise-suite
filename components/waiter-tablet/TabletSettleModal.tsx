'use client';

import React, { useState } from 'react';
import { X, CreditCard, QrCode, Banknote, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

type PayMethod = 'CASH' | 'UPI' | 'CARD';
const CASH_PRESETS = [100, 200, 500, 1000, 2000];

export function TabletSettleModal({ tableNum, open, onClose, onDone }: Props) {
  const { tables, waiterRecordsPayment, waiterVacatesTable } = useSharedBridge();
  const table = tables.find((t) => t.number === tableNum);

  const [method, setMethod] = useState<PayMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [vacateAfter, setVacateAfter] = useState(true);
  const [settled, setSettled] = useState(false);

  if (!table) return null;

  const bill = table.currentBill || 0;
  const change =
    method === 'CASH' && typeof cashTendered === 'number' && cashTendered >= bill
      ? cashTendered - bill
      : null;

  const handleSettle = () => {
    waiterRecordsPayment(tableNum, method, bill);
    if (vacateAfter) {
      setTimeout(() => waiterVacatesTable(tableNum), 400);
    }
    setSettled(true);
    setTimeout(() => {
      setSettled(false);
      setCashTendered('');
      setMethod('CASH');
      onDone();
    }, 1600);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settle-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
          />

          {/* Modal card */}
          <motion.div
            key="settle-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-50 overflow-hidden"
          >
            {settled ? (
              <div className="p-10 flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                </div>
                <div>
                  <p className="font-mono text-xs font-black text-emerald-700 uppercase tracking-wider">
                    Payment Recorded
                  </p>
                  <h3 className="text-2xl font-black text-stone-900 mt-1">{tableNum}</h3>
                  <p className="font-mono text-lg font-bold text-stone-700 mt-1">
                    ₹{bill} via {method}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-[#EAE5DF] flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-widest">
                      Settle Bill
                    </p>
                    <h3 className="text-xl font-black text-stone-900 mt-0.5">{tableNum}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-stone-500">Total</p>
                    <p className="font-mono text-2xl font-black text-stone-900">₹{bill}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 bg-[#FAF8F5] hover:bg-stone-200 border border-[#EAE5DF] rounded-xl transition"
                  >
                    <X className="h-4 w-4 text-stone-500" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Payment method */}
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

                  {/* Cash tendered */}
                  {method === 'CASH' && (
                    <div className="space-y-2.5">
                      <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider">
                        Cash Tendered
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CASH_PRESETS.map((p) => (
                          <button
                            key={p}
                            onClick={() => setCashTendered(p)}
                            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition ${
                              cashTendered === p
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-[#FAF8F5] text-stone-700 border-[#EAE5DF] hover:bg-stone-200'
                            }`}
                          >
                            ₹{p}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        placeholder="Enter amount…"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-2.5 bg-white border border-[#EAE5DF] rounded-xl font-mono text-sm font-bold text-stone-900 focus:outline-none focus:border-[#9C3D1E] shadow-xs"
                      />
                      {change !== null && change >= 0 && (
                        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="font-mono text-xs font-bold text-emerald-800">Change</span>
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
                      Reset table after settlement
                    </span>
                  </label>

                  {/* Confirm */}
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
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
