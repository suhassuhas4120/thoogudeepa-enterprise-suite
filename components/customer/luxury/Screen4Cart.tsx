'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { StickyBottomBar } from '../../ui/StickyBottomBar';
import {
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Trash2,
  UtensilsCrossed,
  CookingPot,
  Flame,
  Loader2,
  Receipt,
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

  const { currentTheme } = useCustomerTheme();
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSeparateOrder = (cartItemId: string, name: string) => {
    orderSeparately(cartItemId);
    setNotice(`Fired as priority starter for ${name}!`);
    setTimeout(() => setNotice(null), 2500);
  };

  const handlePlaceOrders = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      placeAllOrders();
    } finally {
      setTimeout(() => setIsSubmitting(false), 2000);
    }
  };

  const unplacedCount = cart.filter((c) => !c.isOrdered).length;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper for Indian FSSAI Veg / Non-Veg diet indicator
  const isVegItem = (name: string, category?: string) => {
    const lowerName = name.toLowerCase();
    const lowerCat = (category || '').toLowerCase();
    if (lowerName.includes('chicken') || lowerName.includes('mutton') || lowerName.includes('booti') || lowerName.includes('keema') || lowerName.includes('kaalu') || lowerName.includes('kabab') || lowerName.includes('liver')) {
      return false;
    }
    return lowerCat === 'desserts' || lowerCat === 'beverages' || lowerName.includes('paneer') || lowerName.includes('idli') || lowerName.includes('dosa') || lowerName.includes('veg');
  };

  return (
    <ScreenHousing screenNumber={4} screenTitle="ORDER REVIEW & CART">
      {/* Header */}
      <WireHeader
        title={<span>Order Cart</span>}
        leftSubtitle={venueName.toUpperCase()}
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      <div
        className="flex-1 overflow-y-auto p-5 space-y-4 pb-8 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Notice Banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-2xl p-3 text-xs font-bold border border-amber-400/40 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 shadow-lg backdrop-blur-md"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exquisite Minimal Summary Card with Delicate Gold Borders */}
        {cart.length > 0 && (
          <div className="rounded-[28px] p-5 border border-amber-500/30 bg-gradient-to-r from-stone-900/90 to-black/90 shadow-[0_12px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold font-serif-luxury text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
                  Table {tableNumber} &bull; Seat {seatNumber || 1}
                </div>
                <div className="text-[10px] font-medium tracking-widest uppercase text-stone-400 mt-0.5">
                  Gourmet Dining Selection &bull; {totalItemCount} {totalItemCount === 1 ? 'Dish' : 'Dishes'}
                </div>
              </div>
              <span className="rounded-full px-3 py-1 text-[10px] font-bold border border-amber-400/40 bg-amber-500/10 text-amber-300">
                Active Order
              </span>
            </div>

            {/* Fine Dining Table Distinction */}
            <div className="mt-3.5 pt-3 border-t border-amber-500/15 flex items-center justify-between text-[10.5px]">
              <span className="flex items-center gap-1.5 text-stone-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span>Preparation Mode:</span>
              </span>
              <span className="font-serif-luxury font-bold text-amber-300">
                Fresh Military Deg & Handi
              </span>
            </div>
          </div>
        )}

        {/* Dish Order List Header */}
        {cart.length > 0 && (
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-sm font-bold font-serif-luxury text-amber-200 tracking-wide">
              Dish Order List
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              Fine Dining Ledger
            </span>
          </div>
        )}

        {/* Cart Items List */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 text-center my-auto space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-400/20 shadow-inner">
              <ShoppingBag className="h-8 w-8 stroke-[1.8]" />
            </div>
            <h4 className="text-lg font-bold font-serif-luxury text-amber-100">
              Your Selection is Empty
            </h4>
            <p className="text-xs max-w-[220px] text-stone-400 font-normal">
              Discover authentic Donne Dum Biryanis and military cuisine.
            </p>
            <button
              onClick={() => setCurrentScreen(2)}
              className="mt-3 rounded-2xl px-6 py-3 text-xs font-bold text-amber-950 shadow-lg transition"
              style={{
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
              }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {cart.map((ci) => {
                const isOrdered = ci.isOrdered;
                const isVeg = isVegItem(ci.menuItem.name, ci.menuItem.category);

                return (
                  <motion.div
                    key={ci.cartItemId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-[28px] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] space-y-3.5 transition-all border border-amber-500/20 bg-gradient-to-b from-stone-900/80 to-black/90 backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs bg-black/60 p-0.5 border border-white/20">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                isVeg ? 'bg-emerald-400' : 'bg-rose-500'
                              }`}
                            />
                          </div>
                          <h4 className="truncate text-base font-bold font-serif-luxury text-amber-100">
                            {ci.menuItem.name}
                          </h4>
                        </div>

                        {/* Flavour & Add-ons Badges */}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {ci.selectedOption && (
                            <span className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-300">
                              {ci.selectedOption}
                            </span>
                          )}
                          {ci.selectedAddOns?.map((add) => (
                            <span
                              key={add}
                              className="rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold border border-white/10 bg-white/5 text-stone-300"
                            >
                              + {add}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Stepper or Add More Option */}
                      {!isOrdered ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-black/60 p-1 shadow-inner">
                          <button
                            onClick={() => updateCartQuantity(ci.cartItemId, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 transition active:scale-90 cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                          <span className="font-mono text-xs font-black text-amber-200 px-1 text-center min-w-[20px]">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(ci.cartItemId, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:brightness-110 transition active:scale-90 shadow-xs cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-200">
                            Qty: {ci.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(ci.cartItemId, 1)}
                            className="flex items-center gap-1 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-amber-600/35 px-2.5 py-1 text-[10.5px] font-bold text-amber-300 hover:bg-amber-500/40 transition active:scale-95 shadow-xs cursor-pointer"
                            title="Add another serving to order"
                          >
                            <Plus className="h-3 w-3 stroke-[2.5]" />
                            <span>Add More</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Price & Priority Starter Row */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <div>
                        <span className="text-base font-extrabold text-amber-300 font-mono">
                          ₹{ci.totalPrice}
                        </span>
                        {ci.quantity > 1 && (
                          <span className="text-[10px] text-stone-400 font-medium ml-1.5">
                            (₹{Math.round(ci.totalPrice / ci.quantity)} each)
                          </span>
                        )}
                      </div>

                      {!isOrdered && (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => removeCartItem(ci.cartItemId)}
                            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Itemized Subtotal Breakdown with Thin Gold Separator Lines & Highlighted Grand Total */}
            <div className="rounded-[28px] p-5 border border-amber-500/30 bg-black/75 shadow-xl backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="font-medium">
                  Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'dish' : 'dishes'})
                </span>
                <span className="font-mono font-bold text-stone-100">
                  ₹{cart.reduce((sum, item) => sum + item.totalPrice, 0)}
                </span>
              </div>
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="font-medium">Taxes & Service (GST 5%)</span>
                <span className="font-mono font-bold text-stone-100">
                  ₹{Math.round(cart.reduce((sum, item) => sum + item.totalPrice, 0) * 0.05)}
                </span>
              </div>

              {/* Prominently Highlighted Grand Total Container */}
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-black/90 p-3.5 shadow-[0_4px_20px_rgba(217,119,6,0.18)] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md">
                    <Receipt className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider font-serif-luxury text-amber-100">
                      Total Amount
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                      All taxes & charges included
                    </div>
                  </div>
                </div>
                <div className="shrink-0 rounded-xl px-3.5 py-1.5 border border-amber-400/60 bg-black/80 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-right">
                  <div className="text-[9px] font-black uppercase tracking-wider font-mono text-amber-400/80">
                    To Pay
                  </div>
                  <div className="font-mono text-xl font-black text-amber-300 tracking-tight leading-none mt-0.5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                    ₹{Math.round(cart.reduce((sum, item) => sum + item.totalPrice, 0) * 1.05)}
                  </div>
                </div>
              </div>
            </div>

            {/* Add More Items Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(2)}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-dashed border-amber-500/30 py-3.5 text-xs font-bold text-amber-300/80 bg-white/5 hover:bg-white/10 transition"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add More Delicacies from Menu</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar: Expansive Glowing Terracotta-Gold CTA Bar */}
      {cart.length > 0 && (
        <StickyBottomBar>
          <motion.button
            whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
            onClick={handlePlaceOrders}
            disabled={isSubmitting}
            className="flex w-full items-center justify-between rounded-[24px] px-6 py-4 text-center shadow-[0_12px_36px_rgba(217,119,6,0.5)] transition hover:brightness-105 disabled:opacity-75 disabled:cursor-not-allowed border border-amber-300/60 font-serif-luxury text-base font-bold tracking-wide text-amber-950"
            style={{
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
            }}
          >
            <div className="flex items-center gap-2.5">
              {isSubmitting ? (
                <Loader2 className="h-4.5 w-4.5 stroke-[2.5] animate-spin" />
              ) : (
                <CookingPot className="h-4.5 w-4.5 stroke-[2.2]" />
              )}
              <span>
                {isSubmitting
                  ? 'Dispatching to Kitchen...'
                  : unplacedCount > 0
                  ? 'Dispatch Order to Kitchen'
                  : 'Track Live Order'}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </motion.button>
        </StickyBottomBar>
      )}
    </ScreenHousing>
  );
};
