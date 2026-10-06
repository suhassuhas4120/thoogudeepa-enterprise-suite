'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Plus, Minus, ArrowRight, ShoppingBag, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen4Cart: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    updateCartQuantity,
    removeCartItem,
    orderSeparately,
    placeAllOrders,
  } = useCustomer();

  const [notice, setNotice] = useState<string | null>(null);

  const handleSeparateOrder = (cartItemId: string, name: string) => {
    orderSeparately(cartItemId);
    setNotice(`Fired separately for ${name}!`);
    setTimeout(() => setNotice(null), 2500);
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const unplacedCount = cart.filter((c) => !c.isOrdered).length;

  return (
    <ScreenHousing screenNumber={4} screenTitle="CART">
      {/* Header */}
      <WireHeader
        title="Cart"
        showBack={true}
        onBack={() => setCurrentScreen(2)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFCF7]">
        {/* Notice */}
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

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-8 text-center shadow-xs">
            <ShoppingBag className="h-12 w-12 text-[#E8D5C3] stroke-[1.5]" />
            <div className="mt-3 text-sm font-extrabold text-[#5B5049]">Your Cart Is Empty</div>
            <p className="mt-1 text-xs text-[#5B5049]/70">Explore our delicious authentic Donne Biryanis &amp; Starters</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen(2)}
              className="mt-4 rounded-2xl bg-[#8A4228] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#FFFCF7] shadow-sm hover:bg-[#71351F] transition"
            >
              Browse Menu
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            {cart.map((ci) => {
              const isOrdered = !!ci.isOrdered;
              return (
                <motion.div
                  key={ci.cartItemId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col gap-2.5 rounded-[22px] border p-3.5 shadow-xs transition ${
                    isOrdered
                      ? 'border-[#E8D5C3] bg-stone-50/80 opacity-80'
                      : 'border-[#E8D5C3] bg-[#FFFCF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#5B5049]">
                          {ci.menuItem.name}
                        </span>
                        {isOrdered && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-800">
                            Sent To Kitchen
                          </span>
                        )}
                      </div>

                      {/* Options & Addons */}
                      {(ci.selectedOption || ci.selectedAddOns?.length > 0) && (
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

                      <div className="mt-1.5 font-mono text-xs font-black text-[#8A4228]">
                        ₹{ci.totalPrice}
                      </div>
                    </div>

                    {/* Stepper or Ordered Badge */}
                    {!isOrdered ? (
                      <div className="flex items-center gap-1 rounded-full border border-[#8A4228] bg-[#F3DFCC] p-0.5 shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(ci.cartItemId, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F]"
                        >
                          <Minus className="h-3 w-3 stroke-[3]" />
                        </button>
                        <span className="px-2 text-xs font-black text-[#8A4228] font-mono">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(ci.cartItemId, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F]"
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
                        className="font-bold text-[#D08A52] hover:underline"
                      >
                        Order Separately
                      </button>
                      <button
                        onClick={() => removeCartItem(ci.cartItemId)}
                        className="flex items-center gap-1 font-bold text-rose-500 hover:text-rose-700"
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
      </div>

      {/* Sticky Bottom Bar */}
      {cart.length > 0 && (
        <StickyBottomBar>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-[#5B5049]">
              <span>Cart Subtotal</span>
              <span className="font-mono text-sm text-[#8A4228]">₹{totalCartAmount}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={placeAllOrders}
              className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
            >
              <span>{unplacedCount > 0 ? 'Place Order (Send to Kitchen)' : 'View Live Tracking'}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
          </div>
        </StickyBottomBar>
      )}
    </ScreenHousing>
  );
};
