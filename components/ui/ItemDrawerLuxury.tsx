'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      setSelectedOption(item.optionsGroup1?.choices?.[0] ?? '');
      setSelectedAddOns([]);
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const unitPrice =
    item.price +
    selectedAddOns.reduce((sum, name) => {
      const found = item.optionsGroup2?.addOns?.find((a) => a.name === name);
      return sum + (found?.extraPrice ?? 0);
    }, 0);

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

          {/* In-Phone Bottom Sheet (Dark Amber Frosted Glass Sheet) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex max-h-[88%] w-full flex-col overflow-hidden rounded-t-[36px] shadow-[0_-20px_60px_rgba(0,0,0,0.85)] border-t border-amber-500/40 backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(28, 22, 16, 0.96) 0%, rgba(14, 11, 8, 0.98) 100%)',
              color: '#FAF7F2',
            }}
          >
            {/* Food Hero Image Banner */}
            {item.image && (
              <div className="relative w-full h-48 bg-stone-950 shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1610] via-black/40 to-transparent" />
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition shadow-md border border-white/10 cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 left-5 right-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                    {item.category} &bull; {item.prepMode || 'Traditional Dum'}
                  </span>
                  <h3 className="truncate text-xl font-bold text-white drop-shadow-md font-serif-luxury mt-0.5">
                    {item.name}
                  </h3>
                </div>
              </div>
            )}

            {/* Pull Bar & Header (when no image available) */}
            {!item.image && (
              <>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1.5 w-12 rounded-full bg-amber-500/30" />
                </div>

                <div className="flex items-center justify-between px-5 pb-2.5 pt-1 border-b border-amber-500/20">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {item.category} &bull; {item.prepMode || 'Traditional Dum'}
                    </span>
                    <h3 className="truncate text-lg font-bold text-amber-100 font-serif-luxury">
                      {item.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-stone-300 hover:bg-white/20 cursor-pointer"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            {/* Scrollable Sheet Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Description */}
              <p className="text-xs leading-relaxed text-stone-300 font-normal">
                {item.description}
              </p>

              {/* Option Group 1: Spice Level / Choices (1 Row 1 Option) */}
              {item.optionsGroup1?.choices?.length > 0 && (
                <div className="rounded-[24px] border border-amber-500/30 bg-black/40 p-3.5 shadow-inner backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-widest font-serif-luxury">
                      {item.optionsGroup1.title}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
                      Choose 1
                    </span>
                  </div>
                  <div className="space-y-2">
                    {item.optionsGroup1.choices.map((choice) => {
                      const isChecked = selectedOption === choice;
                      return (
                        <div
                          key={choice}
                          onClick={() => setSelectedOption(choice)}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer border transition-all ${
                            isChecked
                              ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 to-amber-900/30 text-amber-200 shadow-xs'
                              : 'border-white/10 bg-white/5 text-stone-300 hover:border-amber-400/30 hover:bg-white/10'
                          }`}
                        >
                          <span className="font-bold">{choice}</span>
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                              isChecked
                                ? 'border-amber-400 bg-amber-400 text-amber-950 font-bold'
                                : 'border-stone-600 bg-transparent'
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Option Group 2: Add-Ons (1 Row 1 Option) */}
              {item.optionsGroup2?.addOns?.length > 0 && (
                <div className="rounded-[24px] border border-amber-500/30 bg-black/40 p-3.5 shadow-inner backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-amber-200 uppercase tracking-widest font-serif-luxury">
                      Add-Ons
                    </span>
                    <span className="text-[10px] font-semibold text-stone-400 font-mono">
                      Optional
                    </span>
                  </div>
                  <div className="space-y-2">
                    {item.optionsGroup2.addOns.map((addon) => {
                      const isChecked = selectedAddOns.includes(addon.name);
                      return (
                        <div
                          key={addon.name}
                          onClick={() => toggleAddOn(addon.name)}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer border transition-all ${
                            isChecked
                              ? 'border-amber-400 bg-gradient-to-r from-amber-500/20 to-amber-900/30 text-amber-200 shadow-xs'
                              : 'border-white/10 bg-white/5 text-stone-300 hover:border-amber-400/30 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{addon.name}</span>
                            <span className="font-mono text-xs font-bold text-amber-400">
                              (+₹ {addon.extraPrice})
                            </span>
                          </div>
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                              isChecked
                                ? 'border-amber-400 bg-amber-400 text-amber-950 font-bold'
                                : 'border-stone-600 bg-transparent'
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chef Pairing Tip in Drawer */}
              <div className="rounded-[24px] border border-amber-500/20 bg-amber-950/30 p-3 text-stone-300 text-[11px] leading-relaxed">
                <span className="font-extrabold text-amber-300 font-mono text-[9.5px] uppercase tracking-wider block mb-0.5">
                  Chef's Pairing Note
                </span>
                {item.name.toLowerCase().includes('soup')
                  ? 'Pair with steamed idli or hot plain kuska for authentic marrow richness.'
                  : 'Savor piping hot with sliced red shallots & fresh squeezed country lime.'}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between rounded-[24px] border border-amber-500/30 bg-black/40 p-3.5 backdrop-blur-md">
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider font-serif-luxury">Servings</span>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-white/5 font-bold text-amber-200 hover:bg-white/10 transition"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                  </motion.button>
                  <span className="min-w-6 text-center font-mono text-base font-black text-amber-300">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-500/30 bg-white/5 font-bold text-amber-200 hover:bg-white/10 transition"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Sheet Bottom Action CTA: Sculpted Dark Gold Floating Button */}
            <div className="border-t border-amber-500/30 bg-black/60 p-4 pb-6 backdrop-blur-xl">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmAdd}
                className="flex w-full items-center justify-between rounded-[24px] px-6 py-4 text-center shadow-[0_12px_32px_rgba(217,119,6,0.45)] transition hover:brightness-105 border border-amber-300/60 font-serif-luxury text-base font-bold tracking-wide text-amber-950"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
                }}
              >
                <span>Add Item to Cart • {quantity} Serving{quantity > 1 ? 's' : ''}</span>
                <span className="text-base font-extrabold font-mono">₹{totalAmount}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
