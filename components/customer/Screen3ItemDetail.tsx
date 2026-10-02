'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { ArrowRight, Check, UtensilsCrossed, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen3ItemDetail: React.FC = () => {
  const { setCurrentScreen, selectedDetailItem, addToCart } = useCustomer();
  const { inventory86 } = useSharedBridge();

  const item = selectedDetailItem;
  const item86 = inventory86?.find((i) => i.id === item.id);
  const isSoldOut = !!item86?.is86;

  const [selectedOption, setSelectedOption] = useState<string>(
    item.optionsGroup1?.choices[0] || 'Standard'
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const handleToggleAddOn = (addonName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  const handleAddAndGoToCart = () => {
    if (isSoldOut) return;
    addToCart(item, selectedOption, selectedAddOns, 1);
    setCurrentScreen(4);
  };

  let currentTotal = item.price;
  selectedAddOns.forEach((addonName) => {
    const found = item.optionsGroup2?.addOns.find((a) => a.name === addonName);
    if (found) currentTotal += found.extraPrice;
  });

  return (
    <ScreenHousing screenNumber={3} screenTitle="DETAILED ITEM PAGE">
      {/* Header */}
      <WireHeader
        title="Item Details"
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Dish Showcase Card */}
        <div className="relative flex h-52 w-full flex-col items-center justify-center rounded-[28px] overflow-hidden border border-[#E8D5C3] bg-[#F3DFCC]/60 p-4 shadow-sm text-center">
          {isSoldOut ? (
            <Ban className="h-16 w-16 text-stone-400" />
          ) : (
            <UtensilsCrossed className="h-16 w-16 text-[#8A4228]" />
          )}
          <span className="mt-2 font-mono text-xs font-black uppercase tracking-wider text-[#8A4228]">
            {item.prepMode || 'Traditional Military Dum'}
          </span>

          {item.badge && !isSoldOut && (
            <div className="absolute top-3 right-3 rounded-full bg-[#8A4228] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#FFFCF7] shadow-xs">
              {item.badge}
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-sm font-black uppercase tracking-wider text-rose-300">
              Sold Out (86)
            </div>
          )}
        </div>

        {/* Item Title & Pricing */}
        <div className="rounded-[24px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#5B5049]">{item.name}</h2>
              <span className="mt-1 inline-block rounded-md border border-[#E8D5C3] bg-[#F3DFCC]/80 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wide text-[#8A4228]">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-black text-[#8A4228]">₹{item.price}</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-[#5B5049]/80 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Portion / Preparation Option */}
        {item.optionsGroup1?.choices?.length > 0 && (
          <div className="rounded-[24px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
            <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#5B5049]/70 font-mono">
              {item.optionsGroup1.title || 'Select Portion / Style'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {item.optionsGroup1.choices.map((choice) => {
                const isSelected = selectedOption === choice;
                return (
                  <button
                    key={choice}
                    onClick={() => setSelectedOption(choice)}
                    className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-black transition ${
                      isSelected
                        ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-xs'
                        : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
                    }`}
                  >
                    <span>{choice}</span>
                    {isSelected && <Check className="h-4 w-4 stroke-[3] text-[#8A4228]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {item.optionsGroup2?.addOns?.length > 0 && (
          <div className="rounded-[24px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
            <div className="mb-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#5B5049]/70 font-mono">
              {item.optionsGroup2.title || 'Popular Add-Ons'}
            </div>
            <div className="space-y-2">
              {item.optionsGroup2.addOns.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.name);
                return (
                  <button
                    key={addon.name}
                    onClick={() => handleToggleAddOn(addon.name)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-3 text-xs font-black transition ${
                      isSelected
                        ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228]'
                        : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                          isSelected ? 'border-[#8A4228] bg-[#8A4228] text-white' : 'border-[#E8D5C3]'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span>{addon.name}</span>
                    </div>
                    <span className="font-mono text-xs text-[#8A4228]">+₹{addon.extraPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddAndGoToCart}
          disabled={isSoldOut}
          className={`flex w-full items-center justify-between rounded-[20px] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] shadow-lg transition ${
            isSoldOut
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-[#8A4228] text-[#FFFCF7] hover:bg-[#71351F]'
          }`}
        >
          <span>{isSoldOut ? 'Item Sold Out' : 'Add to Cart & Review'}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#F3DFCC]">₹{currentTotal}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
