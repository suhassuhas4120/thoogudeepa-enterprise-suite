'use client';

import React, { useState } from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { Receipt, Plus, IndianRupee } from 'lucide-react';

export function ScreenM13PettyExpenses() {
  const { pettyExpenses, addPettyExpense } = useManagerStore();

  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<'Kitchen Supplies' | 'Dairy & Fresh' | 'Fuel/Gas' | 'Emergency Maintenance' | 'Miscellaneous'>('Kitchen Supplies');
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');

  const totalPetty = pettyExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    addPettyExpense(desc, category, Number(amount) || 0, paidTo || 'Vendor');
    setDesc('');
    setAmount('');
    setPaidTo('');
    alert('Petty Expense Voucher recorded & deducted from Cash Drawer Till!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-5 font-mono">
      {/* Left Expense Log */}
      <div className="md:col-span-7 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500">[PETTY CASH DESK]</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                DAILY TILL OUTFLOW VOUCHERS
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">TOTAL OUTFLOW:</span>
              <div className="text-lg font-black text-rose-700">₹ {totalPetty.toLocaleString('en-IN')}.00</div>
            </div>
          </div>

          <div className="space-y-2.5 mt-4">
            {pettyExpenses.map((pe) => (
              <div key={pe.id} className="p-3 bg-stone-50 border border-slate-300 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{pe.voucherNumber}</span>
                    <span className="font-bold text-slate-800">{pe.description}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Category: {pe.category} • Paid To: {pe.paidTo} • Paid By: {pe.paidBy} ({pe.time})
                  </div>
                </div>
                <div className="font-black text-sm text-slate-900">
                  - ₹ {pe.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-stone-100 rounded-lg border border-slate-300 text-xs text-slate-600">
          All vouchers require physical receipt attachment before shift closing Z-Report.
        </div>
      </div>

      {/* Right Add Voucher Form */}
      <div className="md:col-span-5 bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-200 uppercase">
            Record New Cash Voucher
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">EXPENSE DESCRIPTION:</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Fresh Curd 10L, Banana leaves"
                required
                className="w-full bg-stone-50 border border-slate-900 rounded-lg p-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">CATEGORY:</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-slate-900 rounded-lg p-2 focus:outline-none font-bold"
              >
                <option value="Kitchen Supplies">Kitchen Supplies</option>
                <option value="Dairy & Fresh">Dairy & Fresh</option>
                <option value="Fuel/Gas">Fuel/Gas</option>
                <option value="Emergency Maintenance">Emergency Maintenance</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">AMOUNT (₹):</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹ 500"
                  required
                  className="w-full bg-stone-50 border border-slate-900 rounded-lg p-2 focus:outline-none font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">PAID TO:</label>
                <input
                  type="text"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  placeholder="Vendor name"
                  className="w-full bg-stone-50 border border-slate-900 rounded-lg p-2 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition shadow-[3px_3px_0px_#0f172a]"
            >
              + RECORD CASH VOUCHER
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
