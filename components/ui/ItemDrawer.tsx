'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types/customer';
import { useCustomerTheme } from '../../context/ThemeContext';
import { Plus, Minus, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  onAddToCart: (item: MenuItem, selectedOption: string, selectedAddOns: string[], quantity: number) => void;
}

export const ItemDrawer: React.FC<ItemDrawerProps> = ({
  open,
  onOpenChange,
  item,
  onAddToCart,
}) => {
  const { currentTheme } = useCustomerTheme();
  const [selectedOption, setSelectedOption] = useState<string>('Standard');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // Sync state whenever active item changes
  useEffect(() => {
    if (item) {
      setSelectedOption(item.optionsGroup1?.choices?.[0] || 'Standard');
      setSelectedAddOns([]);
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  const toggleAddOn = (addonName: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  let unitPrice = item.price;
  selectedAddOns.forEach((addonName) => {
    const found = item.optionsGroup2?.addOns?.find((a) => a.name === addonName);
    if (found) unitPrice += found.extraPrice;
  });
  const totalAmount = unitPrice * quantity;

  const handleConfirmAdd = () => {
    onAddToCart(item, selectedOption, selectedAddOns, quantity);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
          {/* Backdrop Overlay (restricted to the phone chassis) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
          />

          {/* In-Phone Bottom Sheet (locked strictly to phone container width) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[85%] w-full flex-col rounded-t-[28px] shadow-2xl border-t transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            {/* Pull Bar */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div
                className="h-1.5 w-10 rounded-full"
                style={{ backgroundColor: currentTheme.colors.border }}
              />
            </div>

            {/* Sheet Header */}
            <div
              className="flex items-center justify-between px-4 pb-2 pt-1 border-b"
              style={{ borderColor: currentTheme.colors.borderLight }}
            >
              <div className="min-w-0 pr-2">
                <span
                  className="text-[9.5px] font-bold uppercase tracking-wider font-mono truncate block"
                  style={{ color: currentTheme.colors.primary }}
                >
                  {item.category} • {item.prepMode}
                </span>
                <h3
                  className="truncate text-sm font-extrabold"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  {item.name}
                </h3>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.secondaryFg,
                }}
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Flavour / Toss style group */}
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
                      className="text-[9.5px] font-bold px-2 py-0.5 rounded-full font-mono border"
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
                          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer border transition"
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
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition"
                            style={{
                              borderColor: isSelected ? currentTheme.colors.pillActiveBorder : '#CBD5E1',
                              backgroundColor: isSelected ? currentTheme.colors.pillActiveBorder : 'transparent',
                            }}
                          >
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons group */}
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
                      {item.optionsGroup2.title || 'Add-Ons'}
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
                          onClick={() => toggleAddOn(addon.name)}
                          className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer border transition"
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
                              style={{ color: currentTheme.colors.primary }}
                            >
                              (+₹{addon.extraPrice})
                            </span>
                          </div>
                          <div
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition"
                            style={{
                              borderColor: isSelected ? currentTheme.colors.pillActiveBorder : '#CBD5E1',
                              backgroundColor: isSelected ? currentTheme.colors.pillActiveBorder : 'transparent',
                            }}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3] text-white" />}
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
                    className="flex h-7 w-7 items-center justify-center rounded-lg border font-bold transition shadow-2xs"
                    style={{
                      backgroundColor: currentTheme.colors.buttonBg,
                      borderColor: currentTheme.colors.buttonBg,
                      color: currentTheme.colors.buttonFg,
                    }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </motion.button>
                  <span
                    className="min-w-5 text-center font-mono text-xs font-black"
                    style={{ color: currentTheme.colors.textPrimary }}
                  >
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border font-bold transition shadow-2xs"
                    style={{
                      backgroundColor: currentTheme.colors.buttonBg,
                      borderColor: currentTheme.colors.buttonBg,
                      color: currentTheme.colors.buttonFg,
                    }}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Sheet Bottom Action CTA (Harmonized with Theme Button Color) */}
            <div
              className="border-t p-3.5 shadow-md"
              style={{
                backgroundColor: currentTheme.colors.bottomBg,
                borderColor: currentTheme.colors.border,
              }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmAdd}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-wider shadow-md transition"
                style={{
                  backgroundColor: currentTheme.colors.buttonBg,
                  color: currentTheme.colors.buttonFg,
                  boxShadow: currentTheme.colors.buttonShadow,
                }}
              >
                <span>Add • {quantity} Item{quantity > 1 ? 's' : ''}</span>
                <span className="font-mono text-sm font-black">₹ {totalAmount}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
