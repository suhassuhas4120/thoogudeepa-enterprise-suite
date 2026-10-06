'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
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
  CookingPot,
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

  const { currentTheme } = useCustomerTheme();
  const [notice, setNotice] = useState<string | null>(null);

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
        className="flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-200"
        style={{ backgroundColor: currentTheme.colors.bgApp }}
      >
        {/* Notice Banner */}
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-black shadow-md"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.primaryFg,
              }}
            >
              <CheckCircle2 className="h-4 w-4 text-amber-200" />
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dine-In Order Context Banner */}
        {cart.length > 0 && (
          <div
            className="flex items-center justify-between rounded-2xl border p-3 shadow-2xs"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.primary,
                }}
              >
                <UtensilsCrossed className="h-4 w-4" />
              </div>
              <div>
                <div
                  className="text-[11px] font-black"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  Dine-In ({tableNumber} • Chair C-{String(seatNumber || 1).padStart(2, '0')})
                </div>
                <div
                  className="text-[9.5px] font-bold font-mono"
                  style={{ color: currentTheme.colors.primary }}
                >
                  {totalItemCount} {totalItemCount === 1 ? 'Dish' : 'Dishes'} in Your Selection
                </div>
              </div>
            </div>
            <span
              className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold font-mono border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
              Table Ready
            </span>
          </div>
        )}

        {/* Cart Items List */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center my-auto space-y-3">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-3xl"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.primary,
              }}
            >
              <ShoppingBag className="h-8 w-8 stroke-[1.8]" />
            </div>
            <h4
              className="text-sm font-black"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              Your Cart is Empty
            </h4>
            <p
              className="text-xs max-w-[200px]"
              style={{ color: currentTheme.colors.textMuted }}
            >
              Discover authentic Donne Dum Biryanis and nati military dishes.
            </p>
            <button
              onClick={() => setCurrentScreen(2)}
              className="mt-2 rounded-2xl px-4 py-2 text-xs font-black shadow-sm transition"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.primaryFg,
                boxShadow: currentTheme.colors.primaryShadow,
              }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
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
                  className="rounded-2xl border p-3.5 shadow-xs space-y-2.5 transition-colors duration-200"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs bg-white p-0.5 shadow-2xs border border-slate-200">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              isVeg ? 'bg-emerald-600' : 'bg-rose-700'
                            }`}
                          />
                        </div>
                        <h4
                          className="truncate text-xs font-black"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          {ci.menuItem.name}
                        </h4>
                      </div>

                      {/* Flavour & Add-ons Badges */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {ci.selectedOption && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold font-mono border"
                            style={{
                              backgroundColor: currentTheme.colors.secondaryBg,
                              color: currentTheme.colors.secondaryFg,
                              borderColor: currentTheme.colors.borderLight,
                            }}
                          >
                            {ci.selectedOption}
                          </span>
                        )}
                        {ci.selectedAddOns?.map((add) => (
                          <span
                            key={add}
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold border"
                            style={{
                              backgroundColor: currentTheme.colors.bgElevated,
                              color: currentTheme.colors.primary,
                              borderColor: currentTheme.colors.borderLight,
                            }}
                          >
                            + {add}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isOrdered ? (
                      <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9.5px] font-black text-emerald-800 font-mono">
                        Sent to Kitchen
                      </span>
                    ) : (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9.5px] font-bold font-mono border"
                        style={{
                          backgroundColor: currentTheme.colors.secondaryBg,
                          color: currentTheme.colors.secondaryFg,
                          borderColor: currentTheme.colors.border,
                        }}
                      >
                        Ready to Fire
                      </span>
                    )}
                  </div>

                  {/* Quantity and Price Bar */}
                  <div
                    className="flex items-center justify-between border-t pt-2"
                    style={{ borderColor: currentTheme.colors.borderLight }}
                  >
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="font-mono text-sm font-black"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          ₹{ci.totalPrice}
                        </span>
                        {ci.quantity > 1 && (
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: currentTheme.colors.textMuted }}
                          >
                            (₹{Math.round(ci.totalPrice / ci.quantity)} each)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper or Ordered Badge (Harmonized with Theme Button Color) */}
                    {!isOrdered ? (
                      <div
                        className="flex items-center gap-1 rounded-xl border p-0.5 shadow-2xs"
                        style={{
                          backgroundColor: currentTheme.colors.bgElevated,
                          borderColor: currentTheme.colors.border,
                        }}
                      >
                        <button
                          onClick={() => updateCartQuantity(ci.cartItemId, -1)}
                          className="flex h-5 w-5 items-center justify-center rounded-lg transition hover:brightness-110 active:scale-90"
                          style={{ backgroundColor: currentTheme.colors.buttonBg, color: currentTheme.colors.buttonFg }}
                          title="Decrease quantity"
                        >
                          <Minus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                        <span
                          className="px-1.5 text-xs font-black font-mono"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(ci.cartItemId, 1)}
                          className="flex h-5 w-5 items-center justify-center rounded-lg transition hover:brightness-110 active:scale-90"
                          style={{ backgroundColor: currentTheme.colors.buttonBg, color: currentTheme.colors.buttonFg }}
                          title="Increase quantity"
                        >
                          <Plus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="font-mono text-xs font-black"
                        style={{ color: currentTheme.colors.textPrimary }}
                      >
                        Qty: {ci.quantity}
                      </span>
                    )}
                  </div>

                  {/* Actions for unplaced items */}
                  {!isOrdered && (
                    <div
                      className="flex items-center justify-between border-t pt-2 text-[10px]"
                      style={{ borderColor: currentTheme.colors.borderLight }}
                    >
                      <button
                        onClick={() => handleSeparateOrder(ci.cartItemId, ci.menuItem.name)}
                        className="font-bold hover:underline flex items-center gap-1"
                        style={{ color: currentTheme.colors.buttonBg }}
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-xs font-black transition shadow-2xs hover:brightness-105"
            style={{
              borderColor: currentTheme.colors.border,
              backgroundColor: currentTheme.colors.bgSurface,
              color: currentTheme.colors.buttonBg,
            }}
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add More Dishes from Menu</span>
          </motion.button>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      {cart.length > 0 && (
        <StickyBottomBar>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={placeAllOrders}
            className="flex w-full items-center justify-between rounded-[20px] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] shadow-lg transition hover:brightness-105"
            style={{
              backgroundColor: currentTheme.colors.buttonBg,
              color: currentTheme.colors.buttonFg,
              boxShadow: currentTheme.colors.buttonShadow,
            }}
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
