'use client';

import React from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { TrendingUp, PieChart, IndianRupee, Trophy } from 'lucide-react';

export function ScreenM11SalesReport() {
  const { shiftStats } = useSharedBridge();

  const totalSales = Math.max(38400, shiftStats.totalRevenue);

  const categories = [
    { name: 'Donne Biryani (Dum Pots)', share: 58, amount: Math.round(totalSales * 0.58) },
    { name: 'Starters & Kebabs', share: 22, amount: Math.round(totalSales * 0.22) },
    { name: 'Gravies & Breads', share: 12, amount: Math.round(totalSales * 0.12) },
    { name: 'Beverages & Desserts', share: 8, amount: Math.round(totalSales * 0.08) },
  ];

  const channels = [
    { name: 'UPI Dynamic QR (PhonePe / GPay)', percent: 54, amount: Math.round(totalSales * 0.54) },
    { name: 'Cash Counter Till', percent: 26, amount: Math.round(totalSales * 0.26) },
    { name: 'Card EDC Swipe (HDFC POS)', percent: 14, amount: Math.round(totalSales * 0.14) },
    { name: 'Online Aggregator (Swiggy/Zomato)', percent: 6, amount: Math.round(totalSales * 0.06) },
  ];

  const topDishes = [
    { name: 'Special Chicken Donne Biryani', count: 68, revenue: 19720 },
    { name: 'Mutton Donne Biryani', count: 42, revenue: 15120 },
    { name: 'Mutton Chops Fry (Dry)', count: 28, revenue: 9520 },
    { name: 'Guntur Chicken Wings', count: 24, revenue: 6240 },
    { name: 'Special Filter Coffee', count: 52, revenue: 2080 },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-5 font-mono">
      {/* Top Total */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[4px_4px_0px_#0f172a] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-500">[ANALYTICS DESK]</span>
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
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200">
            Category-Wise Sales Distribution
          </h4>
          <div className="space-y-3 mt-4">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-slate-900">₹ {cat.amount.toLocaleString('en-IN')} ({cat.share}%)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-900 h-full rounded-full"
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
          <h4 className="text-xs font-black text-slate-900 uppercase pb-3 border-b border-slate-200">
            Payment Mode Settlement Split
          </h4>
          <div className="space-y-3 mt-4">
            {channels.map((ch) => (
              <div key={ch.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">{ch.name}</span>
                  <span className="text-slate-900">₹ {ch.amount.toLocaleString('en-IN')} ({ch.percent}%)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
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
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-[3px_3px_0px_#0f172a]">
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
              {topDishes.map((dish, i) => (
                <tr key={dish.name} className="hover:bg-stone-50">
                  <td className="py-2.5 font-black text-slate-900">#{i + 1}</td>
                  <td className="py-2.5 font-bold text-slate-800">{dish.name}</td>
                  <td className="py-2.5 text-center font-black text-slate-900">{dish.count} pots/plates</td>
                  <td className="py-2.5 text-right font-black text-emerald-800">
                    ₹ {dish.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
