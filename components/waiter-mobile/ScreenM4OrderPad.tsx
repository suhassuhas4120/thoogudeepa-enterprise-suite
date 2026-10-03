'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  Flame,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useWaiterStore } from '../../store/useWaiterStore';
import { MenuItem } from '../../types/customer';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

interface Props {
  tableNum: string;
  waiterName: string;
  onBack: () => void;
  onKOTFired: () => void;
}

const CATEGORIES = ['All', ...Array.from(new Set(INITIAL_MENU_ITEMS.map((m) => m.category)))];

export function ScreenM4OrderPad({ tableNum, waiterName, onBack, onKOTFired }: Props) {
  const { waiterFiresKOT, waiterSeatsGuests, tables } = useSharedBridge();
  const { orderCart, addToOrderCart, updateOrderCartQty, clearOrderCart } = useWaiterStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [modifierTarget, setModifierTarget] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const filteredItems =
    activeCategory === 'All'
      ? INITIAL_MENU_ITEMS
      : INITIAL_MENU_ITEMS.filter((m) => m.category === activeCategory);

  const cartTotal = orderCart.reduce((s, ci) => s + ci.totalPrice, 0);
  const cartQty = orderCart.reduce((s, ci) => s + ci.quantity, 0);

  const openModifier = (item: MenuItem) => {
    setModifierTarget(item);
    setSelectedOption(item.optionsGroup1.choices[0] ?? '');
    setSelectedAddOns([]);
  };

  const confirmAddToCart = () => {
    if (!modifierTarget) return;
    addToOrderCart(modifierTarget, selectedOption, 1);
    setModifierTarget(null);
  };

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const fireKOT = () => {
    if (!orderCart.length) return;
    const table = tables.find((t) => t.number === tableNum);
    // Seat guests if table is still vacant
    if (table && table.status === 'VACANT') {
      waiterSeatsGuests(tableNum, 1, waiterName);
    }
    waiterFiresKOT(
      tableNum,
      waiterName,
      orderCart.map((ci) => ({
        item: ci.menuItem,
        selectedOption: ci.selectedOption,
        quantity: ci.quantity,
      }))
    );
    clearOrderCart();
    onKOTFired();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] select-none font-sans">

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-600 font-mono text-xs font-bold"
        >
          <ChevronLeft className="h-4 w-4" />
          {tableNum}
        </button>
        <p className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-wider">
          Add Dishes
        </p>
        {orderCart.length > 0 && (
          <button
            onClick={clearOrderCart}
            className="font-mono text-[10px] text-rose-600 font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category scroller */}
      <div className="px-3.5 pt-3 pb-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap border transition ${
              activeCategory === cat
                ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                : 'bg-white text-stone-600 border-[#EAE5DF] hover:bg-[#FAF8F5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item matrix */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-32">
        <div className="space-y-2.5 pt-1">
          {filteredItems.map((item) => {
            const cartItem = orderCart.find(
              (ci) => ci.menuItem.id === item.id
            );
            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white border border-[#EAE5DF] rounded-2xl px-4 py-3 shadow-xs"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans text-sm font-bold text-stone-900 leading-tight">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="font-mono text-[9px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-stone-900">₹{item.price}</span>
                    <span className="font-mono text-[10px] text-stone-400">{item.prepMode}</span>
                  </div>
                </div>

                {cartItem ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateOrderCartQty(cartItem.cartItemId, -1)}
                      className="h-8 w-8 rounded-xl bg-[#FAF8F5] border border-[#EAE5DF] flex items-center justify-center text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </motion.button>
                    <span className="font-mono text-sm font-black text-stone-900 w-5 text-center">
                      {cartItem.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateOrderCartQty(cartItem.cartItemId, 1)}
                      className="h-8 w-8 rounded-xl bg-[#9C3D1E] flex items-center justify-center text-white hover:bg-[#853216] transition shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => openModifier(item)}
                    className="h-9 w-9 rounded-xl bg-[#9C3D1E] flex items-center justify-center text-white hover:bg-[#853216] transition shadow-xs shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fire KOT bottom bar */}
      {orderCart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto px-4 pb-5 pt-3 bg-white border-t border-[#EAE5DF] shadow-xl z-30">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={fireKOT}
            className="w-full py-4 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-2xl font-mono text-sm font-black flex items-center justify-between px-5 shadow-md transition"
          >
            <span className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-300" />
              Fire KOT to Kitchen
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-black">
                {cartQty} item{cartQty > 1 ? 's' : ''}
              </span>
              <span className="font-black">₹{cartTotal}</span>
            </span>
          </motion.button>
        </div>
      )}

      {/* Modifier modal */}
      <AnimatePresence>
        {modifierTarget && (
          <>
            <motion.div
              key="mod-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModifierTarget(null)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50"
            />
            <motion.div
              key="mod-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50 bg-white rounded-t-3xl shadow-2xl border-t border-[#EAE5DF] px-5 pb-8 pt-3"
            >
              <div className="flex justify-center mb-3">
                <div className="h-1.5 w-12 bg-stone-300 rounded-full" />
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-sans text-base font-black text-stone-900">
                    {modifierTarget.name}
                  </h3>
                  <p className="font-mono text-xs text-stone-500 mt-0.5">₹{modifierTarget.price}</p>
                </div>
                <button onClick={() => setModifierTarget(null)} className="p-1.5 hover:bg-[#FAF8F5] rounded-xl transition">
                  <X className="h-4 w-4 text-stone-500" />
                </button>
              </div>

              {/* Spice / option selector */}
              {modifierTarget.optionsGroup1.choices.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider mb-2">
                    {modifierTarget.optionsGroup1.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modifierTarget.optionsGroup1.choices.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSelectedOption(ch)}
                        className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition ${
                          selectedOption === ch
                            ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                            : 'bg-[#FAF8F5] text-stone-700 border-[#EAE5DF] hover:bg-stone-200'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {modifierTarget.optionsGroup2.addOns.length > 0 && (
                <div className="mb-5">
                  <p className="font-mono text-[10.5px] font-black text-stone-500 uppercase tracking-wider mb-2">
                    {modifierTarget.optionsGroup2.title}
                  </p>
                  <div className="space-y-1.5">
                    {modifierTarget.optionsGroup2.addOns.map((ao) => (
                      <button
                        key={ao.name}
                        onClick={() => toggleAddOn(ao.name)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border font-mono text-xs transition ${
                          selectedAddOns.includes(ao.name)
                            ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                            : 'bg-[#FAF8F5] border-[#EAE5DF] text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <span>{ao.name}</span>
                        <span className="font-bold">+₹{ao.extraPrice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={confirmAddToCart}
                className="w-full py-3.5 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-2xl font-mono text-sm font-black flex items-center justify-center gap-2 shadow-md transition"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Order
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
