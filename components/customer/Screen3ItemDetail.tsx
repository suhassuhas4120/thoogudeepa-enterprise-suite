'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { ArrowRight, Check, UtensilsCrossed, Ban, Plus, Minus } from 'lucide-react';
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

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(item, selectedOption, selectedAddOns, quantity);
    setCurrentScreen(2);
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
        title={
          <span className="inline-flex items-center gap-2">
            <span>Item Details</span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black font-mono tracking-tight border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
              {tableNumber} • C-{String(seatNumber || 1).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName.toUpperCase()}
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-200"
        style={{ backgroundColor: currentTheme.colors.bgApp }}
      >
        {/* Dish Showcase Card */}
        <div
          className="relative flex h-52 w-full flex-col items-center justify-center rounded-[28px] overflow-hidden border p-4 shadow-sm text-center"
          style={{
            backgroundColor: currentTheme.colors.bgElevated,
            borderColor: currentTheme.colors.border,
          }}
        >
          {isSoldOut ? (
            <Ban className="h-16 w-16 text-stone-400" />
          ) : (
            <UtensilsCrossed className="h-16 w-16" style={{ color: currentTheme.colors.primary }} />
          )}
          <span
            className="mt-2 font-mono text-xs font-black uppercase tracking-wider"
            style={{ color: currentTheme.colors.primary }}
          >
            {item.prepMode || 'Traditional Military Dum'}
          </span>

          {item.badge && !isSoldOut && (
            <div
              className="absolute top-3 right-3 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider shadow-xs"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.primaryFg,
              }}
            >
              {item.badge}
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-sm font-black uppercase tracking-wider text-rose-300">
              Sold Out
            </div>
          )}
        </div>

        {/* Item Title & Pricing */}
        <div
          className="rounded-[24px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                className="text-base font-black"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                {item.name}
              </h2>
              <span
                className="mt-1 inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wide"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.secondaryFg,
                  borderColor: currentTheme.colors.border,
                }}
              >
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <span
                className="font-mono text-lg font-black"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                ₹{item.price}
              </span>
            </div>
          </div>
          <p
            className="mt-2 text-xs font-medium leading-relaxed"
            style={{ color: currentTheme.colors.textMuted }}
          >
            {item.description}
          </p>
        </div>

        {/* Flavours / Preparation Option */}
        {item.optionsGroup1?.choices?.length > 0 && (
          <div
            className="rounded-2xl border p-3 shadow-2xs"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11.5px] font-extrabold"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                {item.optionsGroup1.title === 'Toss Style' ? 'Flavours' : item.optionsGroup1.title}
              </span>
              <span
                className="text-[9.5px] font-bold border px-2 py-0.5 rounded-full font-mono"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.secondaryFg,
                  borderColor: currentTheme.colors.border,
                }}
              >
                Choose 1
              </span>
            </div>
            <div className="space-y-1.5">
              {item.optionsGroup1.choices.map((choice) => {
                const isSelected = selectedOption === choice;
                return (
                  <div
                    key={choice}
                    onClick={() => setSelectedOption(choice)}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer border transition"
                    style={
                      isSelected
                        ? {
                            borderColor: currentTheme.colors.pillActiveBorder,
                            backgroundColor: currentTheme.colors.pillActiveBg,
                            color: currentTheme.colors.pillActiveFg,
                          }
                        : {
                            borderColor: currentTheme.colors.pillInactiveBorder,
                            backgroundColor: currentTheme.colors.pillInactiveBg,
                            color: currentTheme.colors.pillInactiveFg,
                          }
                    }
                  >
                    <span className="font-bold">{choice}</span>
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                      style={{
                        borderColor: isSelected ? currentTheme.colors.pillActiveBorder : '#94A3B8',
                        backgroundColor: isSelected ? currentTheme.colors.pillActiveBorder : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {item.optionsGroup2?.addOns?.length > 0 && (
          <div
            className="rounded-2xl border p-3 shadow-2xs"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11.5px] font-extrabold"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                {item.optionsGroup2.title || 'Popular Add-Ons'}
              </span>
              <span
                className="text-[9.5px] font-bold font-mono"
                style={{ color: currentTheme.colors.textMuted }}
              >
                Optional
              </span>
            </div>
            <div className="space-y-1.5">
              {item.optionsGroup2.addOns.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.name);
                return (
                  <div
                    key={addon.name}
                    onClick={() => handleToggleAddOn(addon.name)}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer border transition"
                    style={
                      isSelected
                        ? {
                            borderColor: currentTheme.colors.pillActiveBorder,
                            backgroundColor: currentTheme.colors.pillActiveBg,
                            color: currentTheme.colors.pillActiveFg,
                          }
                        : {
                            borderColor: currentTheme.colors.pillInactiveBorder,
                            backgroundColor: currentTheme.colors.pillInactiveBg,
                            color: currentTheme.colors.pillInactiveFg,
                          }
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{addon.name}</span>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: isSelected ? currentTheme.colors.pillActiveFg : currentTheme.colors.textSecondary }}
                      >
                        (+₹ {addon.extraPrice})
                      </span>
                    </div>
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition"
                      style={{
                        borderColor: isSelected ? currentTheme.colors.pillActiveBorder : '#94A3B8',
                        backgroundColor: isSelected ? currentTheme.colors.pillActiveBorder : 'transparent',
                      }}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3] text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div
          className="flex items-center justify-between rounded-2xl border p-3 shadow-2xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <span
            className="text-xs font-extrabold"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            Quantity
          </span>
          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg font-bold transition active:scale-95 shadow-2xs"
              style={{
                backgroundColor: currentTheme.colors.buttonBg,
                color: currentTheme.colors.buttonFg,
              }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-3 w-3 stroke-[3]" />
            </motion.button>
            <span
              className="min-w-5 text-center font-mono text-xs font-black"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              {quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg font-bold transition active:scale-95 shadow-2xs"
              style={{
                backgroundColor: currentTheme.colors.buttonBg,
                color: currentTheme.colors.buttonFg,
              }}
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-3 w-3 stroke-[3]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="flex w-full items-center justify-between rounded-[20px] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] shadow-lg transition hover:brightness-105"
          style={
            isSoldOut
              ? {
                  backgroundColor: '#CBD5E1',
                  color: '#64748B',
                  cursor: 'not-allowed',
                }
              : {
                  backgroundColor: currentTheme.colors.buttonBg,
                  color: currentTheme.colors.buttonFg,
                  boxShadow: currentTheme.colors.buttonShadow,
                }
          }
        >
          <span>{isSoldOut ? 'Item Sold Out' : 'Add Item to Cart'}</span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-sm font-bold opacity-90"
            >
              ₹{currentTotal * quantity}
            </span>
            <Check className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
