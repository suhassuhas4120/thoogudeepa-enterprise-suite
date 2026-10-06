'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types/customer';
import { Plus, Minus, X } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
          />

          {/* In-Phone Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[60vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl border-t border-stone-200"
          >
            {/* Pull Bar */}
            <div className="flex justify-center pt-2 pb-0.5">
              <div className="h-1.5 w-10 rounded-full bg-stone-300" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C3D1E] font-mono">
                  {item.category} • {item.prepMode || 'Special'}
                </span>
                <h3 className="truncate text-sm font-black text-stone-900 leading-tight">
                  {item.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Compact Options Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2.5 space-y-2.5 scrollbar-none">
              {/* Option Group 1: Radio Choices in 2-Col Grid */}
              {item.optionsGroup1 && item.optionsGroup1.choices?.length > 0 && (
                <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-stone-900 font-extrabold">
                      {item.optionsGroup1.title === 'Toss Style' ? 'Spice Level' : item.optionsGroup1.title}
                    </span>
                    <span className="text-[9.5px] font-mono font-bold text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/30 px-1.5 py-0.5 rounded">
                      Choose 1
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {item.optionsGroup1.choices.map((choice) => {
                      const isChecked = selectedOption === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setSelectedOption(choice)}
                          className={`px-2.5 py-2 rounded-lg text-xs font-bold text-left transition border flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-2xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span className="truncate">{choice}</span>
                          <div
                            className={`h-3.5 w-3.5 rounded-full border-2 ml-1 shrink-0 flex items-center justify-center ${
                              isChecked ? 'border-white bg-white' : 'border-stone-300'
                            }`}
                          >
                            {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-[#9C3D1E]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Option Group 2: Add-Ons in 2-Col Grid */}
              {item.optionsGroup2 && item.optionsGroup2.addOns?.length > 0 && (
                <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-stone-900 font-extrabold">{item.optionsGroup2.title}</span>
                    <span className="text-[9.5px] font-mono text-stone-500">Optional</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {item.optionsGroup2.addOns.map((addon) => {
                      const isChecked = selectedAddOns.includes(addon.name);
                      return (
                        <button
                          key={addon.name}
                          type="button"
                          onClick={() => toggleAddOn(addon.name)}
                          className={`px-2.5 py-2 rounded-lg text-xs font-bold text-left transition border flex items-center justify-between ${
                            isChecked
                              ? 'bg-[#9C3D1E]/10 text-[#9C3D1E] border-[#9C3D1E] font-black'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <span className="truncate">{addon.name}</span>
                          <span className="font-mono text-[10px] font-black shrink-0 ml-1">
                            +₹{addon.extraPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Bottom CTA Bar: Quantity + Add */}
            <div className="shrink-0 border-t border-stone-200 bg-white px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
              <div className="flex items-center gap-1 rounded-xl border-2 border-stone-200 bg-stone-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-7 w-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 font-bold active:scale-95 transition"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center font-mono text-xs font-black text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-7 w-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 font-bold active:scale-95 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmAdd}
                className="flex-1 flex items-center justify-between rounded-xl bg-[#9C3D1E] hover:bg-[#853216] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-98 transition"
              >
                <span>Add • {quantity} {quantity > 1 ? 'Items' : 'Item'}</span>
                <span className="font-mono text-sm font-black text-amber-200">₹{totalAmount}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
