'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Heart, ArrowRight, Receipt, Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen6PaymentBreakdown: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    payment,
    updateTip,
    setSplitMode,
  } = useCustomer();

  const [customTip, setCustomTip] = useState<string>('');
  const [splitPersons, setSplitPersons] = useState<number>(2);

  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
  const tax = Math.round(subtotal * 0.05); // 5% GST (2.5% CGST + 2.5% SGST)
  const grandTotal = subtotal + tax + payment.tipAmount;

  const handlePresetTip = (amount: number) => {
    setCustomTip('');
    updateTip(amount);
  };

  const handleCustomTipChange = (val: string) => {
    setCustomTip(val);
    const num = parseInt(val, 10);
    updateTip(isNaN(num) || num < 0 ? 0 : num);
  };

  const tipPresets = [30, 50, 100];

  return (
    <ScreenHousing screenNumber={6} screenTitle="Order Summary">
      {/* Header */}
      <WireHeader
        title="Order Summary"
        showBack={true}
        onBack={() => setCurrentScreen(5)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto bg-[#FFFCF7] p-4 space-y-4">
        {/* Bill Breakdown Card */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="mb-3 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            <Receipt className="h-3.5 w-3.5 text-[#8A4228]" />
            <span>Items &amp; Price Breakdown</span>
          </div>

          <div className="space-y-2 border-b border-dashed border-[#E8D5C3] pb-3 text-xs">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between text-[#5B5049]">
                  <span className="font-semibold">
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span className="font-mono font-black text-[#5B5049]">₹{item.totalPrice}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center text-[#5B5049]/60">
                <Receipt className="h-6 w-6 text-[#D08A52] mb-1" />
                <span className="text-xs font-black text-[#5B5049]">No Items In Cart</span>
                <span className="text-[10px] text-[#5B5049]/70">Add dishes from the menu to generate bill</span>
              </div>
            )}
          </div>

          {/* Subtotal, Tax, Tips, Total */}
          <div className="space-y-1.5 pt-3 text-xs">
            <div className="flex justify-between font-medium text-[#5B5049]/80">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between font-medium text-[#5B5049]/80">
              <span>Taxes &amp; Charges (5% GST)</span>
              <span className="font-mono">₹{tax}</span>
            </div>
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-bold text-[#8A4228]">
                <span>Staff Tip</span>
                <span className="font-mono">+₹{payment.tipAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[#E8D5C3] pt-2 text-sm font-black text-[#5B5049]">
              <span>Total Amount</span>
              <span className="font-mono text-base font-black text-[#8A4228]">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Tip Selector */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="mb-2.5 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            <Heart className="h-3.5 w-3.5 text-[#8A4228]" />
            <span>Add Tip for Restaurant Staff</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {tipPresets.map((amt) => {
              const isSelected = payment.tipAmount === amt && !customTip;
              return (
                <button
                  key={amt}
                  onClick={() => handlePresetTip(amt)}
                  className={`rounded-2xl border py-2 text-center text-xs font-black font-mono transition ${
                    isSelected
                      ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-xs'
                      : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
            <button
              onClick={() => handlePresetTip(0)}
              className={`rounded-2xl border py-2 text-center text-xs font-black font-mono transition ${
                payment.tipAmount === 0 && !customTip
                  ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228]'
                  : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
              }`}
            >
              None
            </button>
          </div>
        </div>

        {/* Split Bill Option */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-[#FFFCF7] p-4 shadow-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
              <Users className="h-3.5 w-3.5 text-[#8A4228]" />
              <span>Split Bill Among Friends</span>
            </div>
            <span className="font-mono text-xs font-black text-[#8A4228]">
              ₹{Math.ceil(grandTotal / splitPersons)} / person
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => {
                  setSplitPersons(count);
                  setSplitMode('PERSONS', count);
                }}
                className={`flex-1 rounded-2xl border py-2 text-center text-xs font-black transition ${
                  splitPersons === count
                    ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-xs'
                    : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
                }`}
              >
                {count} Way
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(7)}
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <span>Choose Payment Method</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#F3DFCC]">₹{grandTotal}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
