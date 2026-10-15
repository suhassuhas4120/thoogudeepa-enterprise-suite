'use client';

import React, { useState } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import {
  UtensilsCrossed,
  Tag,
  Search,
  Lock,
  CheckCircle2,
  Clock,
  Plus,
  Percent,
  RotateCcw,
  RefreshCw,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';

export function ScreenM10Menu86Stock() {
  const { inventory86, kitchenToggle86, kitchenUpdatePrepDelay } = useSharedBridge();
  const { promos, togglePromo, addPromo } = useManagerStore();

  // Search filter for Dish availability
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for "Add offers"
  const [offerName, setOfferName] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [timing, setTiming] = useState('');
  const [minOrder, setMinOrder] = useState('');

  // Filtered dish inventory
  const filteredDishes = inventory86.filter(
    (it) =>
      it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Add Offer Submit
  const handleAddOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerName.trim() || !promoCode.trim()) {
      alert('Please enter an Offer Name and Promo Code.');
      return;
    }

    const numericDiscount = parseInt(discountText.replace(/[^0-9]/g, ''), 10) || 15;
    const numericMinOrder = parseInt(minOrder.replace(/[^0-9]/g, ''), 10) || 500;

    addPromo({
      title: offerName.trim(),
      code: promoCode.trim().toUpperCase(),
      description: discountText.trim() || 'Special promotional discount',
      discountPercent: numericDiscount,
      minBillAmount: numericMinOrder,
      isActive: true,
      timing: timing.trim() || 'All Day',
      dateRange: dateRange.trim() || 'Ongoing',
    });

    alert(`Offer "${offerName.trim()}" added successfully with code ${promoCode.trim().toUpperCase()}!`);

    // Reset form fields
    setOfferName('');
    setDateRange('');
    setDiscountText('');
    setPromoCode('');
    setTiming('');
    setMinOrder('');
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* ── TOP HEADER BANNER (Menu Stocks and Offers) ── */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 rounded px-1.5 py-0.5">
              INVENTORY &amp; DISCOUNTS
            </span>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1">
              Menu Stocks and Offers
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-[#FAF8F5] border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-orange-600" />
            <span>{promos.filter((p) => p.isActive).length} Active Campaigns</span>
          </span>
          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span>{inventory86.filter((i) => i.is86).length} Sold Out (86)</span>
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN SIDE-BY-SIDE LAYOUT (MATCHING USER SKETCH) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN: REAL TIME DISH AVAILABILITY (~50% / lg:col-span-6)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Header Box: Real time Dish availability */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  Real time Dish availability
                </h2>
                <div className="text-[10px] text-slate-400 font-bold">
                  Instant stock toggles &amp; prep delay adjustments
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
              {inventory86.length} Dishes
            </span>
          </div>

          {/* Search Bar + Lock / Admin Icon Box */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search item from menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-2xs"
              />
            </div>

            <button
              onClick={() => alert('Dish Availability Master Locked by Manager PIN')}
              className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-stone-100 text-slate-600 transition shadow-2xs cursor-pointer"
              title="Manager Security Lock"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>

          {/* 2-Column Dish Cards Grid (Matching Sketch) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredDishes.map((it) => {
              const isOut = it.is86;

              return (
                <div
                  key={it.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all shadow-2xs ${
                    isOut
                      ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300/40'
                      : 'bg-white border-[#EAE5DF] hover:border-orange-300'
                  }`}
                >
                  <div>
                    {/* Top: Category & Stock Status Badge */}
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase truncate">
                        {it.category}
                      </span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-black border ${
                          isOut
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Dish Name */}
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 mt-1 line-clamp-1">
                      {it.name}
                    </h3>

                    {/* Active Prep Delay if any */}
                    {it.prepDelayMinutes > 0 && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                        <Clock className="h-3 w-3" />
                        <span>+{it.prepDelayMinutes}m prep delay</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Action Toggle Button + Delay adjust */}
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                    <button
                      onClick={() => kitchenToggle86(it.id)}
                      className={`w-full py-1.5 rounded-lg text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs text-center ${
                        isOut
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {isOut ? 'Available' : 'Sold out'}
                    </button>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Delay:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => kitchenUpdatePrepDelay(it.id, 5)}
                          className="bg-slate-100 hover:bg-stone-200 px-1.5 py-0.5 rounded font-bold text-slate-700 text-[9px] cursor-pointer"
                          title="Add 5 min prep delay"
                        >
                          +5m
                        </button>
                        <button
                          onClick={() => kitchenUpdatePrepDelay(it.id, -5)}
                          className="bg-slate-100 hover:bg-stone-200 px-1.5 py-0.5 rounded font-bold text-slate-700 text-[9px] cursor-pointer"
                          title="Reduce 5 min prep delay"
                        >
                          -5m
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Left Buttons: [ Reset ] and [ Update ] (As Drawn in Sketch) */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                setSearchTerm('');
                alert('Search filter reset.');
              }}
              className="flex-1 bg-white hover:bg-[#FAF8F5] border border-slate-300 text-slate-700 py-2 px-4 rounded-xl text-xs font-black transition shadow-2xs cursor-pointer text-center"
            >
              Reset
            </button>

            <button
              onClick={() =>
                alert('Real-time dish availability updated and synced across all devices!')
              }
              className="flex-1 bg-[#9C3D1E] hover:bg-orange-700 text-white py-2 px-4 rounded-xl text-xs font-black transition shadow-2xs cursor-pointer text-center"
            >
              Update
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT COLUMN: OFFERS AND DISCOUNTS (~50% / lg:col-span-6)
            Separated by vertical divider line (lg:border-l lg:border-slate-200 lg:pl-6)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 lg:border-l lg:border-slate-200 lg:pl-6 space-y-4">
          {/* Header Box: Offers and Discounts */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 tracking-tight">
                  Offers and Discounts
                </h2>
                <div className="text-[10px] text-slate-400 font-bold">
                  Active campaigns &amp; promotion creation
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
              {promos.length} Campaigns
            </span>
          </div>

          {/* ── UPPER HALF: ACTIVE OFFERS GRID (2 COLUMNS) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {promos.map((p) => (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all shadow-2xs ${
                  p.isActive
                    ? 'bg-white border-[#EAE5DF] hover:border-amber-300'
                    : 'bg-[#FAF8F5] border-slate-200 opacity-60'
                }`}
              >
                <div>
                  {/* Top: Title & Status Badge */}
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                      {p.title}
                    </h3>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded font-black border ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Timing & Dates */}
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {p.timing || '5 AM - 12 PM'}
                    {p.dateRange ? ` • ${p.dateRange}` : ''}
                  </div>

                  {/* Description / Discount text */}
                  <div className="text-xs font-bold text-slate-700 mt-1 line-clamp-1">
                    {p.description}
                  </div>

                  {/* Promo Code Pill & Minimum Order */}
                  <div className="mt-2 flex items-center justify-between gap-1 text-[10px]">
                    <span className="bg-[#9C3D1E] text-white font-black px-1.5 py-0.5 rounded">
                      {p.code} code
                    </span>
                    <span className="text-slate-400 font-bold">
                      Min: ₹ {p.minBillAmount}
                    </span>
                  </div>
                </div>

                {/* Bottom Toggle Action */}
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => togglePromo(p.id)}
                    className={`w-full py-1 rounded-lg text-[10px] font-black transition cursor-pointer active:scale-95 ${
                      p.isActive
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {p.isActive ? 'pause promotion' : 'enable promotion'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── LOWER HALF: "Add offers" FORM BOX (MATCHING SKETCH) ── */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Plus className="h-4 w-4 text-[#9C3D1E]" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                Add offers
              </h3>
            </div>

            <form onSubmit={handleAddOfferSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Field 1: Offer Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Offer Name
                  </label>
                  <input
                    type="text"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    placeholder="e.g. Sunday Special"
                    className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400"
                    required
                  />
                </div>

                {/* Field 2: Date (From to End) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date (From to End)
                  </label>
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    placeholder="15 Oct 2026 - 16 Oct 2026"
                    className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400"
                  />
                </div>

                {/* Field 3: Discount / offer */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Discount / offer
                  </label>
                  <input
                    type="text"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    placeholder="Buy 1 Get 1 Free (or 20% OFF)"
                    className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400"
                  />
                </div>

                {/* Field 4: Code to get offer */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Code to get offer
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="B1G1"
                    className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400 uppercase"
                    required
                  />
                </div>

                {/* Field 5: Time (4PM - 8PM) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Time (4PM - 8PM)
                  </label>
                  <input
                    type="text"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    placeholder="5 AM - 12 PM"
                    className="w-full bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400"
                  />
                </div>

                {/* Field 6: Minimum order */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Minimum order
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-[#FAF8F5] px-2 py-1">
                    <span className="text-xs font-bold text-slate-400 mr-1">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1500"
                      className="w-full bg-transparent text-xs font-bold text-slate-900 outline-none placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#9C3D1E] hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
