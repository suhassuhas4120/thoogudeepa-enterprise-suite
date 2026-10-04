'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import {
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Trash2,
  UtensilsCrossed,
  ChefHat,
  CookingPot,
  Sparkles,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen4Cart: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    updateCartQuantity,
    removeCartItem,
    orderSeparately,
    placeAllOrders,
    tableNumber,
    seatNumber,
    venueName,
  } = useCustomer();

  const [notice, setNotice] = useState<string | null>(null);
  const [cookingNote, setCookingNote] = useState<string>('');

  const handleSeparateOrder = (cartItemId: string, name: string) => {
    orderSeparately(cartItemId);
    setNotice(`Fired as priority starter for ${name}!`);
    setTimeout(() => setNotice(null), 2500);
  };

  const unplacedCount = cart.filter((c) => !c.isOrdered).length;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper for Indian FSSAI Veg / Non-Veg diet indicator
  const isVegItem = (name: string, category?: string) => {
    const lowerName = name.toLowerCase();
    const lowerCat = (category || '').toLowerCase();
    return lowerCat === 'desserts' || lowerName.includes('paneer') || lowerName.includes('veg');
  };

  return (
    <ScreenHousing screenNumber={4} screenTitle="ORDER REVIEW & CART">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Order Cart</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFCF7]">
        {/* Notice Banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-2xl bg-[#8A4228] px-3.5 py-2.5 text-xs font-black text-[#FFFCF7] shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 text-[#F3DFCC]" />
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dine-In Order Context Banner */}
        {cart.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-[#E8D5C3] bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3DFCC] text-[#8A4228]">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-black text-[#5B5049]">
                  Dine-In ({tableNumber} • Chair C-{String(seatNumber || 1).padStart(2, '0')})
                </div>
                <div className="text-[9.5px] font-bold text-[#8A4228] font-mono">
                  {totalItemCount} {totalItemCount === 1 ? 'Dish' : 'Dishes'} in Your Selection
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[9.5px] font-black text-emerald-800 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Table
            </span>
          </div>
        )}

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-8 text-center shadow-xs">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F3DFCC]/50 text-[#8A4228] mb-3">
              <ShoppingBag className="h-10 w-10 stroke-[1.6]" />
            </div>
            <div className="text-sm font-extrabold text-[#5B5049]">Your Cart Is Empty</div>
            <p className="mt-1 text-xs text-[#5B5049]/70 max-w-[240px]">
              Explore our authentic Donne Biryanis, military sides, and refreshing starters.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen(2)}
              className="mt-4 flex items-center gap-2 rounded-2xl bg-[#8A4228] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#FFFCF7] shadow-sm hover:bg-[#71351F] transition"
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Browse Authentic Menu</span>
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            {cart.map((ci) => {
              const isOrdered = !!ci.isOrdered;
              const isVeg = isVegItem(ci.menuItem.name, ci.menuItem.category);

              return (
                <motion.div
                  key={ci.cartItemId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col gap-2.5 rounded-[22px] border p-3.5 shadow-xs transition ${
                    isOrdered
                      ? 'border-[#E8D5C3] bg-[#FAF8F5]/80 opacity-80'
                      : 'border-[#E8D5C3] bg-[#FFFCF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {/* FSSAI Veg / Non-Veg Indicator */}
                        <div
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs border p-0.5 ${
                            isVeg
                              ? 'border-emerald-600 bg-emerald-50/50'
                              : 'border-rose-600 bg-rose-50/50'
                          }`}
                          title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>

                        <span className="text-xs font-black text-[#5B5049]">
                          {ci.menuItem.name}
                        </span>

                        {isOrdered && (
                          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-800">
                            Sent To Kitchen
                          </span>
                        )}
                      </div>

                      {/* Options & Addons */}
                      {(ci.selectedOption || (ci.selectedAddOns && ci.selectedAddOns.length > 0)) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {ci.selectedOption && (
                            <span className="rounded-md border border-[#E8D5C3] bg-[#F3DFCC]/60 px-1.5 py-0.5 text-[9.5px] font-bold text-[#8A4228]">
                              {ci.selectedOption}
                            </span>
                          )}
                          {ci.selectedAddOns?.map((addon) => (
                            <span
                              key={addon}
                              className="rounded-md border border-[#E8D5C3] bg-[#F3DFCC]/60 px-1.5 py-0.5 text-[9.5px] font-bold text-[#8A4228]"
                            >
                              +{addon}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="font-mono text-xs font-black text-[#8A4228]">
                          ₹{ci.totalPrice}
                        </span>
                        {ci.quantity > 1 && (
                          <span className="font-mono text-[10px] text-[#5B5049]/60">
                            (₹{Math.round(ci.totalPrice / ci.quantity)} each)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper or Ordered Badge */}
                    {!isOrdered ? (
                      <div className="flex items-center gap-1 rounded-full border border-[#8A4228] bg-[#F3DFCC] p-0.5 shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(ci.cartItemId, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F] transition"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 stroke-[3]" />
                        </button>
                        <span className="px-2 text-xs font-black text-[#8A4228] font-mono">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(ci.cartItemId, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F] transition"
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-xs font-black text-[#5B5049]">
                        Qty: {ci.quantity}
                      </span>
                    )}
                  </div>

                  {/* Actions for unplaced items */}
                  {!isOrdered && (
                    <div className="flex items-center justify-between border-t border-[#E8D5C3]/60 pt-2 text-[10px]">
                      <button
                        onClick={() => handleSeparateOrder(ci.cartItemId, ci.menuItem.name)}
                        className="font-bold text-[#D08A52] hover:underline flex items-center gap-1"
                      >
                        <Flame className="h-3 w-3" />
                        <span>Serve as Priority Starter</span>
                      </button>
                      <button
                        onClick={() => removeCartItem(ci.cartItemId)}
                        className="flex items-center gap-1 font-bold text-rose-500 hover:text-rose-700 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Add More Items Button */}
        {cart.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentScreen(2)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E8D5C3] bg-white py-3 text-xs font-black text-[#8A4228] hover:border-[#8A4228] hover:bg-[#F3DFCC]/30 transition shadow-2xs"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add More Dishes from Menu</span>
          </motion.button>
        )}

        {/* Special Cooking Instructions Card */}
        {cart.length > 0 && (
          <div className="rounded-[22px] border border-[#E8D5C3] bg-white p-3.5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#5B5049]">
              <ChefHat className="h-4 w-4 text-[#8A4228]" />
              <span>Special Cooking Instructions</span>
            </div>
            <input
              type="text"
              value={cookingNote}
              onChange={(e) => setCookingNote(e.target.value)}
              placeholder="e.g., Less spicy, extra salna, serve piping hot..."
              className="w-full rounded-xl border border-[#E8D5C3] bg-[#FFFCF7] px-3.5 py-2 text-xs font-semibold text-[#5B5049] placeholder:text-[#5B5049]/50 shadow-2xs focus:border-[#8A4228] focus:outline-none transition"
            />
          </div>
        )}

        {/* Fresh Preparation Guarantee Banner */}
        {cart.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] font-medium text-amber-900">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-700" />
            <span>Prepared fresh on firewood stoves. Transmitted directly to kitchen pass.</span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar (Cart Subtotal Removed) */}
      {cart.length > 0 && (
        <StickyBottomBar>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={placeAllOrders}
            className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
          >
            <div className="flex items-center gap-2">
              <CookingPot className="h-4 w-4 stroke-[2.2]" />
              <span>{unplacedCount > 0 ? 'Send Order to Kitchen' : 'Track Live Order'}</span>
            </div>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </motion.button>
        </StickyBottomBar>
      )}
    </ScreenHousing>
  );
};
