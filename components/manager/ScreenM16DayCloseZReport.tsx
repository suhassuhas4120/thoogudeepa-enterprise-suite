'use client';

import React, { useState } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import { FileText, Printer, Lock, AlertTriangle, CheckCircle2, IndianRupee } from 'lucide-react';

export function ScreenM16DayCloseZReport() {
  const { shiftStats } = useSharedBridge();
  const { openingFloat, pettyExpenses, activeManager } = useManagerStore();

  const totalPetty = pettyExpenses.reduce((acc, pe) => acc + pe.amount, 0);
  const grossSales = Math.max(48250, shiftStats.totalRevenue);
  const discountTotal = 1650;
  const taxable = grossSales - discountTotal;
  const cgst = Math.round(taxable * 0.025);
  const sgst = Math.round(taxable * 0.025);
  const netRevenue = taxable + cgst + sgst;

  // Expected cash
  const cashSales = Math.round(grossSales * 0.26);
  const expectedCashInTill = openingFloat + cashSales - totalPetty;

  const [actualCashCounted, setActualCashCounted] = useState(String(expectedCashInTill));
  const [shiftLocked, setShiftLocked] = useState(false);

  const variance = (Number(actualCashCounted) || 0) - expectedCashInTill;

  const handlePrintZ = () => {
    alert(`[MASTER Z-REPORT TAX SLIP PRINTED]\nThoogudeepa Donne Biryani Mane\nGross: ₹${grossSales}\nCGST: ₹${cgst} | SGST: ₹${sgst}\nNet: ₹${netRevenue}\nCash Expected: ₹${expectedCashInTill}\nCash Counted: ₹${actualCashCounted}\nVariance: ₹${variance}`);
  };

  const handleLockShift = () => {
    setShiftLocked(true);
    alert('NIGHT SHIFT OFFICIALLY CLOSED & LOCKED! Master Z-Report filed.');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-5 font-mono">
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
            [DAY CLOSE NIGHT Z-REPORT]
          </span>
          <h3 className="text-base font-black text-slate-900 mt-1">
            END-OF-DAY FINANCIAL AUDIT &amp; DRAWER RECONCILIATION
          </h3>
          <p className="text-xs text-slate-500">
            Manager: {activeManager.name} • Shift: DINNER SERVICE (18:00 - 24:00)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrintZ}
            className="bg-stone-100 border border-slate-300 py-2 px-3 rounded-lg text-xs font-bold text-slate-700 hover:bg-stone-200 transition flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            <span>PRINT Z-SLIP</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sales & Tax Audit */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a] space-y-2 text-xs">
          <h4 className="font-black text-slate-900 uppercase pb-2 border-b border-slate-200">
            Sales &amp; Government Tax Audit
          </h4>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Gross Shift Sales:</span>
            <span className="font-bold">₹ {grossSales.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
            <span>Total Discounts Given:</span>
            <span className="font-bold">- ₹ {discountTotal.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Taxable Turnover:</span>
            <span className="font-bold">₹ {taxable.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>CGST @ 2.5%:</span>
            <span className="font-bold">₹ {cgst.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>SGST @ 2.5%:</span>
            <span className="font-bold">₹ {sgst.toLocaleString('en-IN')}.00</span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
            <span>NET COLLECTED REVENUE:</span>
            <span>₹ {netRevenue.toLocaleString('en-IN')}.00</span>
          </div>
        </div>

        {/* Till Cash Reconciliation */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a] space-y-2 text-xs flex flex-col justify-between">
          <div>
            <h4 className="font-black text-slate-900 uppercase pb-2 border-b border-slate-200">
              Till Drawer Cash Reconciliation
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Opening Float:</span>
              <span className="font-bold">+ ₹ {openingFloat.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Shift Cash Sales:</span>
              <span className="font-bold">+ ₹ {cashSales.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
              <span>Petty Cash Outflows:</span>
              <span className="font-bold">- ₹ {totalPetty.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-300 font-black text-slate-800">
              <span>EXPECTED CASH IN SAFE:</span>
              <span>₹ {expectedCashInTill.toLocaleString('en-IN')}.00</span>
            </div>

            <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">ACTUAL PHYSICAL CASH:</span>
                <input
                  type="number"
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(e.target.value)}
                  className="w-28 text-right bg-white border border-slate-900 rounded p-1 font-mono font-bold"
                />
              </div>
              <div className="flex justify-between font-black pt-1 border-t border-slate-200">
                <span>CASH VARIANCE:</span>
                <span className={variance === 0 ? 'text-emerald-700' : 'text-rose-600'}>
                  {variance === 0 ? '₹ 0.00 (PERFECT)' : `₹ ${variance}.00 (${variance > 0 ? 'OVER' : 'SHORT'})`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            {shiftLocked ? (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-xl text-center font-bold text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>SHIFT CLOSED &amp; ARCHIVED SECURELY</span>
              </div>
            ) : (
              <button
                onClick={handleLockShift}
                className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0f172a]"
              >
                <Lock className="h-4 w-4" />
                <span>LOCK NIGHT SHIFT &amp; CLOSE REGISTER ➔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
