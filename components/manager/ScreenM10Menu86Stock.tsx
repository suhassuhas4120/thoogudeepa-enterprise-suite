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
  RotateCcw,
  RefreshCw,
  Sparkles,
  Calendar,
  IndianRupee,
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
      {/* ── TOP HEADER BANNER ── */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
              Menu Stocks and Offers
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs sm:text-sm font-black text-amber-950 bg-amber-50 border border-amber-300 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs">
            <Tag className="h-4.5 w-4.5 text-amber-700 shrink-0" />
            <span>{promos.filter((p) => p.isActive).length} Active Campaigns</span>
          </span>
          <span className="text-xs sm:text-sm font-black text-rose-950 bg-rose-50 border border-rose-300 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs">
            <span>{inventory86.filter((i) => i.is86).length} Sold Out (86)</span>
          </span>
        </div>
      </div>

      {/* ── 2-COLUMN SIDE-BY-SIDE LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN: REAL TIME DISH AVAILABILITY (~50% / lg:col-span-6)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* Header Box: Real time Dish availability */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Real time Dish availability
              </h2>
            </div>

            <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
              {inventory86.length} Total Dishes
            </span>
          </div>

          {/* Search Bar + Security Lock */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search dish name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 shadow-2xs"
              />
            </div>

            <button
              onClick={() => alert('Dish Availability Master Locked by Manager PIN')}
              className="h-11 px-3.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-stone-100 text-slate-700 transition shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              title="Manager Security Lock"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>

          {/* Dish Cards List with Right-Aligned Simple Buttons */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredDishes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs font-bold bg-white rounded-xl border border-slate-200">
                No dishes found matching "{searchTerm}"
              </div>
            ) : null}

            {filteredDishes.map((it) => {
              const isOut = it.is86;

              return (
                <div
                  key={it.id}
                  className={`p-3.5 rounded-xl border-2 flex items-center justify-between gap-3.5 transition-all shadow-2xs ${
                    isOut
                      ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-300/40'
                      : 'bg-white border-slate-200 hover:border-orange-400'
                  }`}
                >
                  {/* Left: Dish Information, Badges & Prep Stepper */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {it.category}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-md font-black border shadow-2xs ${
                          isOut
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        }`}
                      >
                        {isOut ? 'Sold Out (86)' : 'In Stock'}
                      </span>
                    </div>

                    {/* Dish Name: Highlighting & properly sized */}
                    <h3 className="font-black text-sm sm:text-base text-slate-950 mt-1.5 leading-snug truncate">
                      {it.name}
                    </h3>

                    {/* Prep Delay display & controls */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {it.prepDelayMinutes > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold shadow-2xs">
                          <Clock className="h-3.5 w-3.5 text-amber-700" />
                          <span>+{it.prepDelayMinutes}m Delay</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">Standard Prep</span>
                      )}

                      {/* Delay adjust stepper */}
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden text-xs shadow-2xs">
                        <button
                          onClick={() => kitchenUpdatePrepDelay(it.id, 5)}
                          className="px-2 py-0.5 hover:bg-slate-200 text-slate-800 font-black transition cursor-pointer"
                          title="Add 5 min delay"
                        >
                          +5m
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => kitchenUpdatePrepDelay(it.id, -5)}
                          className="px-2 py-0.5 hover:bg-slate-200 text-slate-800 font-black transition cursor-pointer"
                          title="Reduce 5 min delay"
                        >
                          -5m
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Simple Toggle Action Button */}
                  <div className="shrink-0 flex flex-col items-end justify-center">
                    <button
                      onClick={() => kitchenToggle86(it.id)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 shadow-2xs text-center min-w-[100px] ${
                        isOut
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      {isOut ? 'Available' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Left Buttons: [ Reset ] and [ Update ] */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
              }}
              className="flex-1 h-11 bg-white hover:bg-stone-100 border-2 border-slate-300 text-slate-700 px-5 rounded-xl text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-95"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              <span>Reset</span>
            </button>

            <button
              onClick={() =>
                alert('Real-time dish availability updated and synced across all devices!')
              }
              className="flex-1 h-11 bg-[#9C3D1E] hover:bg-orange-700 text-white px-5 rounded-xl text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Update Stock</span>
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
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Tag className="h-5 w-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Offers and Discounts
              </h2>
            </div>

            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
              {promos.length} Campaigns
            </span>
          </div>

          {/* ── UPPER HALF: ACTIVE OFFERS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
            {promos.map((p) => (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border-2 flex flex-col justify-between transition-all shadow-2xs ${
                  p.isActive
                    ? 'bg-white border-amber-200/90 hover:border-amber-400'
                    : 'bg-[#FAF8F5] border-slate-200 opacity-65'
                }`}
              >
                <div>
                  {/* Top: Title & Status Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-sm sm:text-base text-slate-950 truncate flex-1">
                      {p.title}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-black border shrink-0 shadow-2xs flex items-center gap-1 ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {p.isActive && <CheckCircle2 className="h-3 w-3 text-emerald-700 shrink-0" />}
                      <span>{p.isActive ? 'Active' : 'Paused'}</span>
                    </span>
                  </div>

                  {/* Timing & Dates */}
                  <div className="text-xs text-slate-500 font-bold mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{p.timing || 'All Day'}</span>
                    </span>
                    {p.dateRange && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{p.dateRange}</span>
                      </span>
                    )}
                  </div>

                  {/* Highlighted Discount Tag */}
                  <div className="mt-2.5 inline-block text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg shadow-2xs">
                    {p.description}
                  </div>

                  {/* Promo Code Pill & Minimum Order */}
                  <div className="mt-3 flex items-center justify-between gap-1 text-xs">
                    <span className="bg-[#9C3D1E] text-white font-black px-2.5 py-1 rounded-lg shadow-2xs">
                      {p.code}
                    </span>
                    <span className="text-slate-600 font-bold flex items-center">
                      Min: <IndianRupee className="h-3.5 w-3.5 text-slate-500 mx-0.5" />
                      {p.minBillAmount}
                    </span>
                  </div>
                </div>

                {/* Bottom Toggle Action Button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => togglePromo(p.id)}
                    className={`w-full h-9 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 shadow-2xs flex items-center justify-center gap-1.5 ${
                      p.isActive
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <span>{p.isActive ? 'Pause Offer' : 'Activate Offer'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── LOWER HALF: "Add offers" FORM CONTAINER ── */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#9C3D1E]" />
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Add offers
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-orange-100 text-[#9C3D1E] border border-orange-200">
                New Campaign
              </span>
            </div>

            <form onSubmit={handleAddOfferSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field 1: Offer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Offer Name
                  </label>
                  <input
                    type="text"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    placeholder="e.g. Sunday Special"
                    className="w-full h-10 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 placeholder-slate-400 shadow-2xs transition"
                    required
                  />
                </div>

                {/* Field 2: Date (From to End) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Date (From to End)
                  </label>
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    placeholder="15 Oct 2026 - 16 Oct 2026"
                    className="w-full h-10 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 placeholder-slate-400 shadow-2xs transition"
                  />
                </div>

                {/* Field 3: Discount / offer */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Discount / offer
                  </label>
                  <input
                    type="text"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    placeholder="Buy 1 Get 1 Free (or 20% OFF)"
                    className="w-full h-10 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 placeholder-slate-400 shadow-2xs transition"
                  />
                </div>

                {/* Field 4: Code to get offer */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Code to get offer
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="B1G1"
                    className="w-full h-10 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 placeholder-slate-400 uppercase shadow-2xs transition"
                    required
                  />
                </div>

                {/* Field 5: Time (4PM - 8PM) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Time (4PM - 8PM)
                  </label>
                  <input
                    type="text"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    placeholder="5 AM - 12 PM"
                    className="w-full h-10 bg-[#FAF8F5] border-2 border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-950 outline-none focus:border-[#9C3D1E] focus:ring-1 focus:ring-orange-200 placeholder-slate-400 shadow-2xs transition"
                  />
                </div>

                {/* Field 6: Minimum order */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Minimum order
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-slate-300 bg-[#FAF8F5] px-3 h-10 focus-within:border-[#9C3D1E] focus-within:ring-1 focus-within:ring-orange-200 shadow-2xs transition">
                    <IndianRupee className="h-4 w-4 text-slate-400 mr-1 select-none shrink-0" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1500"
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-950 outline-none placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#9C3D1E] hover:bg-orange-700 text-white px-6 py-2.5 h-11 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer active:scale-95 shadow-2xs flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Create Offer Campaign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
