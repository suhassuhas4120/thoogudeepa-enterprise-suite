'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types/customer';
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          />

          {/* In-Phone Bottom Sheet (locked strictly to phone container width) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[85%] w-full flex-col rounded-t-[28px] bg-white shadow-2xl border-t border-slate-200"
          >
            {/* Pull Bar */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-slate-300" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 pb-2 pt-1 border-b border-slate-100">
              <div className="min-w-0 pr-2">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-orange-600 font-mono">
                  {item.category} • {item.prepMode}
                </span>
                <h3 className="truncate text-sm font-extrabold text-slate-900">
                  {item.name}
                </h3>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">
              {/* Description */}
              <p className="text-[11.5px] leading-relaxed text-slate-600">
                {item.description}
              </p>

              {/* Option Group 1: Radio Choices */}
              <div className="rounded-2xl border border-slate-200 bg-stone-50/70 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-extrabold text-slate-900">
                    {item.optionsGroup1.title}
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-500">Choose 1</span>
                </div>
                <div className="space-y-1.5">
                  {item.optionsGroup1.choices.map((choice) => {
                    const isChecked = selectedOption === choice;
                    return (
                      <label
                        key={choice}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer border transition ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/70 text-orange-950 shadow-2xs'
                            : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{choice}</span>
                        <input
                          type="radio"
                          name="phone-sheet-opt1"
                          checked={isChecked}
                          onChange={() => setSelectedOption(choice)}
                          className="accent-orange-600 h-4 w-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Option Group 2: Add-Ons Checkboxes */}
              <div className="rounded-2xl border border-slate-200 bg-stone-50/70 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11.5px] font-extrabold text-slate-900">
                    {item.optionsGroup2.title}
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-500">Optional</span>
                </div>
                <div className="space-y-1.5">
                  {item.optionsGroup2.addOns.map((addon) => {
                    const isChecked = selectedAddOns.includes(addon.name);
                    return (
                      <label
                        key={addon.name}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer border transition ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/70 text-orange-950 shadow-2xs'
                            : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{addon.name}</span>
                          <span className="font-mono text-orange-600 font-bold">
                            (+₹ {addon.extraPrice})
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddOn(addon.name)}
                          className="accent-orange-600 h-4 w-4 rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="text-xs font-extrabold text-slate-900">Quantity</span>
                <div className="flex items-center gap-2.5">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-stone-50 font-bold text-slate-800 hover:bg-stone-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </motion.button>
                  <span className="min-w-5 text-center font-mono text-xs font-black text-slate-900">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-stone-50 font-bold text-slate-800 hover:bg-stone-100"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Sheet Bottom Action CTA */}
            <div className="border-t border-slate-100 bg-white p-3.5 shadow-md">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmAdd}
                className="flex w-full items-center justify-between rounded-xl bg-orange-600 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
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
