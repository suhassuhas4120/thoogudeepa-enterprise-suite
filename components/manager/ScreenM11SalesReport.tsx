'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { TrendingUp, PieChart, IndianRupee, Trophy } from 'lucide-react';

export function ScreenM11SalesReport() {
  const { shiftStats, settledBills } = useSharedBridge();

  const bills = Array.from(
    new Map(
      Object.values(settledBills).map((bill) => [bill.invoiceNumber, bill])
    ).values()
  );
  const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0) || shiftStats.totalRevenue;

  const categories = [
    { name: 'UPI', amount: bills.filter((bill) => bill.method === 'UPI').reduce((sum, bill) => sum + bill.grandTotal, 0) },
    { name: 'Cash', amount: bills.filter((bill) => bill.method === 'CASH').reduce((sum, bill) => sum + bill.grandTotal, 0) },
  ].map((category) => ({
    ...category,
    share: totalSales > 0 ? Math.round((category.amount / totalSales) * 100) : 0,
  }));

  const channels = categories.map((category) => ({
    name: category.name,
    percent: category.share,
    amount: category.amount,
  }));

  const dishTotals = new Map<string, { count: number; revenue: number }>();
  bills.forEach((bill) => {
    bill.items.forEach((item) => {
      const current = dishTotals.get(item.name) || { count: 0, revenue: 0 };
      dishTotals.set(item.name, {
        count: current.count + item.quantity,
        revenue: current.revenue + item.totalPrice,
      });
    });
  });
  const topDishes = Array.from(dishTotals.entries())
    .map(([name, totals]) => ({ name, ...totals }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono border border-[#D6D3D1] rounded-2xl bg-white shadow-sm">
      {/* Top Total */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            TODAY SHIFT SALES &amp; REVENUE REPORT
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-bold">GROSS SHIFT TURNOVER:</span>
          <div className="text-2xl font-black text-slate-900">₹ {totalSales.toLocaleString('en-IN')}.00</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200">
            Recorded Settlement Totals
          </h4>
          <div className="space-y-3 mt-4">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-slate-900">₹ {cat.amount.toLocaleString('en-IN')} ({cat.share}%)</span>
                </div>
                <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#9C3D1E] h-full rounded-full"
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels */}
        <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200">
            Settlement Method Split
          </h4>
          <div className="space-y-3 mt-4">
            {channels.map((ch) => (
              <div key={ch.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">{ch.name}</span>
                  <span className="text-slate-900">₹ {ch.amount.toLocaleString('en-IN')} ({ch.percent}%)</span>
                </div>
                <div className="w-full bg-[#FAF8F5] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${ch.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Leaderboard */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-xs">
        <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span>TOP 5 BEST-SELLING DISHES (TODAY DINNER)</span>
        </h4>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="pb-2">RANK</th>
                <th className="pb-2">DISH NAME</th>
                <th className="pb-2 text-center">PORTIONS SOLD</th>
                <th className="pb-2 text-right">TOTAL REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topDishes.length > 0 ? topDishes.map((dish, i) => (
                <tr key={dish.name} className="hover:bg-[#FAF8F5]">
                  <td className="py-2.5 font-black text-slate-900">#{i + 1}</td>
                  <td className="py-2.5 font-bold text-slate-800">{dish.name}</td>
                  <td className="py-2.5 text-center font-black text-slate-900">{dish.count} pots/plates</td>
                  <td className="py-2.5 text-right font-black text-emerald-800">
                    ₹ {dish.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">No settled bills for this shift.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
