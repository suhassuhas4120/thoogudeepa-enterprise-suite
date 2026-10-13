'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { StickyBottomBar } from '../../ui/StickyBottomBar';
import { ArrowRight, Check, UtensilsCrossed, Ban, Plus, Minus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen3ItemDetail: React.FC = () => {
  const {
    setCurrentScreen,
    selectedDetailItem,
    addToCart,
    venueName,
    tableNumber,
    seatNumber,
  } = useCustomer();

  const { currentTheme } = useCustomerTheme();
  const { inventory86 } = useSharedBridge();

  const item = selectedDetailItem;
  const item86 = inventory86?.find((i) => i.id === item.id);
  const isSoldOut = !!item86?.is86;

  const [selectedOption, setSelectedOption] = useState<string>(
    item.optionsGroup1?.choices[0] || 'Standard'
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const handleToggleAddOn = (addonName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  const handleAddAndGoToCart = () => {
    if (isSoldOut) return;
    addToCart(item, selectedOption, selectedAddOns, quantity);
    setCurrentScreen(4);
  };

  let currentTotal = item.price;
  selectedAddOns.forEach((addonName) => {
    const found = item.optionsGroup2?.addOns.find((a) => a.name === addonName);
    if (found) currentTotal += found.extraPrice;
  });

  return (
    <ScreenHousing screenNumber={3} screenTitle="ITEM DETAILS">
      {/* Header */}
      <WireHeader
        title={<span>Delicacy Details</span>}
        leftSubtitle={venueName.toUpperCase()}
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Dish Showcase Card */}
        <div className="relative flex h-64 w-full flex-col items-center justify-center rounded-[32px] overflow-hidden border border-amber-500/30 shadow-[0_16px_36px_rgba(0,0,0,0.6)] text-center bg-stone-950">
          {item.image ? (
            <div className="relative h-full w-full">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, 420px"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#110F0D] via-black/30 to-black/10" />
              <div className="absolute bottom-4 left-5 right-5 text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  {item.prepMode || 'Traditional Military Dum'}
                </span>
                <h3 className="truncate text-2xl font-bold text-white drop-shadow-md font-serif-luxury mt-0.5">
                  {item.name}
                </h3>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 bg-stone-900/60">
              {isSoldOut ? (
                <Ban className="h-16 w-16 text-stone-500" />
              ) : (
                <UtensilsCrossed className="h-16 w-16 text-amber-500" />
              )}
              <span className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                {item.prepMode || 'Traditional Military Dum'}
              </span>
            </div>
          )}

          {item.badge && !isSoldOut && (
            <div className="absolute top-3.5 right-3.5 z-10 rounded-full px-3 py-1 text-[9.5px] font-extrabold uppercase tracking-wider shadow-lg border border-amber-400/50 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-mono">
              {item.badge}
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 font-mono text-sm font-black uppercase tracking-widest text-rose-300">
              Sold Out
            </div>
          )}
        </div>

        {/* Item Title & Pricing */}
        <div className="rounded-[28px] p-5 border border-amber-500/25 bg-gradient-to-b from-stone-900/80 to-black/90 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold font-serif-luxury text-amber-100">
                {item.name}
              </h2>
              <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-2xl px-3.5 py-1 text-lg font-black font-mono border border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-amber-950/40 text-amber-300 shadow-sm">
                ₹{item.price}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs font-normal leading-relaxed text-stone-300">
            {item.description}
          </p>
        </div>

        {/* Radiant Gem Spice / Preparation Selector */}
        {item.optionsGroup1?.choices?.length > 0 && (
          <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/80 to-black/90 p-4 shadow-inner backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-widest font-serif-luxury">
                {item.optionsGroup1.title === 'Toss Style' ? 'Spice & Style' : item.optionsGroup1.title}
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
                Select 1
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {item.optionsGroup1.choices.map((choice) => {
                const isSelected = selectedOption === choice;
                const lowerChoice = choice.toLowerCase();
                const groupTitle = (item.optionsGroup1?.title || '').toLowerCase();
                const isSpiceOrHeat = groupTitle.includes('spice') || groupTitle.includes('pepper') || groupTitle.includes('heat') || groupTitle.includes('chilli');

                // Determine subtle culinary indicator
                const isFiery = lowerChoice.includes('hot') || lowerChoice.includes('fiery') || lowerChoice.includes('guntur') || lowerChoice.includes('extra') || lowerChoice.includes('high');
                const isMild = lowerChoice.includes('mild') || lowerChoice.includes('warm') || lowerChoice.includes('balanced') || lowerChoice.includes('medium');

                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelectedOption(choice)}
                    className={`relative flex flex-col items-start justify-center p-3.5 rounded-2xl cursor-pointer border text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-amber-400/90 bg-gradient-to-b from-amber-500/15 via-amber-950/25 to-stone-900/90 shadow-[0_0_20px_rgba(245,158,11,0.22)]'
                        : 'border-white/10 bg-stone-900/40 hover:border-amber-400/30 hover:bg-stone-900/60'
                    }`}
                  >
                    {/* Header line with radio dot and optional spice flame tier */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {isSpiceOrHeat && (
                          <span className="flex items-center text-xs tracking-tight" aria-hidden="true">
                            {isFiery ? (
                              <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">🔥🔥🔥</span>
                            ) : isMild ? (
                              <span className="text-amber-500/80">🔥</span>
                            ) : (
                              <span className="text-amber-400/90">🔥🔥</span>
                            )}
                          </span>
                        )}
                        {!isSpiceOrHeat && (
                          <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? 'text-amber-300' : 'text-stone-400'}`}>
                            Option
                          </span>
                        )}
                      </div>

                      {/* Bespoke Radio Disc */}
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'border-stone-600/60 bg-transparent'
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_#fde68a]" />
                        )}
                      </div>
                    </div>

                    {/* Choice Title */}
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        isSelected ? 'text-amber-100 font-serif-luxury' : 'text-stone-300'
                      }`}
                    >
                      {choice}
                    </span>

                    {/* Subtitle explaining the choice clearly */}
                    <span className="mt-1 text-[10px] font-mono text-stone-400/90">
                      {isSpiceOrHeat
                        ? isFiery
                          ? 'High Heat • Military Spiced'
                          : isMild
                          ? 'Mild & Balanced Masala'
                          : 'Traditional Heritage Spice'
                        : isSelected
                        ? 'Selected Choice'
                        : 'Tap to Choose'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Accompaniments (Circular Pill Tags) */}
        {item.optionsGroup2?.addOns?.length > 0 && (
          <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/80 to-black/90 p-4 shadow-inner backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-widest font-serif-luxury">
                {item.optionsGroup2.title || 'Accompaniments'}
              </span>
              <span className="text-[10px] font-semibold text-stone-400 font-mono">
                Optional
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {item.optionsGroup2.addOns.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.name);
                return (
                  <div
                    key={addon.name}
                    onClick={() => handleToggleAddOn(addon.name)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 to-amber-900/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-white/10 bg-white/5 text-stone-300 hover:border-amber-400/30'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-bold truncate">{addon.name}</div>
                      <div className="text-[10px] font-extrabold text-amber-400 font-mono">
                        +₹{addon.extraPrice}
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-amber-950 font-bold' : 'border-stone-600'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Master Culinary Pairing Recommendation */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-r from-amber-950/40 via-stone-900/80 to-black/90 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-300 font-mono">
              Chef's Recommended Harmony
            </span>
          </div>
          <p className="text-xs text-stone-300 font-medium leading-relaxed">
            {item.name.toLowerCase().includes('soup')
              ? 'Traditional Pair: Savor piping-hot alongside 2 Steamed Rice Idlis or hot Kuska Rice for authentic bone marrow infusion.'
              : item.name.toLowerCase().includes('biryani')
              ? 'Traditional Pair: Best savored with hot Boti Gojju or refreshing curd pachadi to balance rich woodsmoke spices.'
              : 'Traditional Pair: Pair with slow-simmered Donne Biryani Rice and cold spiced buttermilk.'}
          </p>
        </div>

        {/* Quantity Stepper (Brass Stepper Counter) */}
        <div className="flex items-center justify-between rounded-[24px] border border-amber-500/25 bg-black/40 p-4 backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-200 font-serif-luxury">
            Servings
          </span>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition active:scale-90"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
            </motion.button>
            <span className="min-w-6 text-center font-mono text-base font-black text-amber-200">
              {quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition active:scale-90"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar with Sculpted Gold Floating Button */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddAndGoToCart}
          disabled={isSoldOut}
          className="flex w-full items-center justify-between rounded-[24px] px-6 py-4 shadow-[0_12px_32px_rgba(217,119,6,0.45)] transition hover:brightness-105 border border-amber-300/60 font-serif-luxury text-base font-bold tracking-wide text-amber-950"
          style={
            isSoldOut
              ? {
                  backgroundColor: '#44403C',
                  color: '#A8A29E',
                  cursor: 'not-allowed',
                  border: '1px solid #78716C',
                }
              : {
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
                }
          }
        >
          <span>{isSoldOut ? 'Sold Out' : 'Add to Dining Order'} &bull; {quantity} Serving{quantity > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-extrabold font-mono">
              ₹{currentTotal * quantity}
            </span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
