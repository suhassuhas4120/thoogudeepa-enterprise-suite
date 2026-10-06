'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { Receipt, Heart, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen6PaymentBreakdown: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    payment,
    updateTip,
    setSplitMode,
    tableNumber,
    seatNumber,
    venueName,
  } = useCustomer();

  const [customTip, setCustomTip] = useState<string>('');
  const [splitPersons, setSplitPersons] = useState<number>(2);
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Bill calculations (use live cart or authentic preview dishes)
  const previewDishes = [
    { cartItemId: 'sample-1', menuItem: { name: 'Special Mutton Donne Biryani' } as any, quantity: 2, totalPrice: 680 },
    { cartItemId: 'sample-2', menuItem: { name: 'Chicken Ghee Roast' } as any, quantity: 1, totalPrice: 280 },
    { cartItemId: 'sample-3', menuItem: { name: 'Mutton Nalli Fry' } as any, quantity: 1, totalPrice: 220 },
  ];
  const activeCart = cart.length > 0 ? cart : previewDishes;
  const subtotal = activeCart.reduce((s, i) => s + i.totalPrice, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST (2.5% CGST + 2.5% SGST)
  const discount = payment.discount || (payment.redeemPoints ? Math.min(50, subtotal + tax) : 0);
  const grandTotal = Math.max(0, subtotal + tax + payment.tipAmount - discount);
  const perPersonAmount = isSplitEnabled ? Math.ceil(grandTotal / splitPersons) : grandTotal;

  const tipPresets = [30, 50, 100];

  const handlePresetTip = (amount: number) => {
    setCustomTip('');
    updateTip(amount);
  };

  const handleCustomTipChange = (val: string) => {
    setCustomTip(val);
    const num = parseInt(val, 10);
    updateTip(isNaN(num) || num < 0 ? 0 : num);
  };

  return (
    <ScreenHousing screenNumber={6} screenTitle="ORDER SUMMARY & BILL">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Order Summary &amp; Bill</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
              {effectiveTable} • C-{String(effectiveSeat).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName.toUpperCase()}
        showBack={true}
        onBack={() => setCurrentScreen(5)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="flex-1 overflow-y-auto bg-[#FFFCF7] p-4 space-y-4">
        {/* Bill Breakdown Card */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
              <Receipt className="h-3.5 w-3.5 text-[#8A4228]" />
              <span>Items &amp; Price Breakdown</span>
            </div>
            <span className="text-[10px] font-bold text-[#8A4228] font-mono">
              {activeCart.length} {activeCart.length === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 border-b border-dashed border-[#E8D5C3] pb-3 text-xs">
            {activeCart.map((item) => (
              <div key={item.cartItemId} className="flex items-center justify-between text-[#5B5049]">
                <span className="font-semibold">
                  {item.menuItem.name} × {item.quantity}
                </span>
                <span className="font-mono font-black text-[#5B5049]">₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          {/* Subtotal, Tax, Tip, Total */}
          <div className="space-y-1.5 pt-3 text-xs">
            <div className="flex justify-between font-medium text-[#5B5049]/80">
              <span>Item Subtotal</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between font-medium text-[#5B5049]/80">
              <span>Taxes &amp; Charges (5% GST: 2.5% CGST + 2.5% SGST)</span>
              <span className="font-mono">₹{tax}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Loyalty Reward Discount</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}
            {payment.tipAmount > 0 && (
              <div className="flex justify-between font-bold text-[#8A4228]">
                <span>Staff Tip</span>
                <span className="font-mono">+₹{payment.tipAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[#E8D5C3] pt-2.5 text-sm font-black text-[#5B5049]">
              <span>Total Payable</span>
              <div className="text-right">
                <div className="font-mono text-xl font-black text-[#8A4228]">₹{grandTotal}</div>
                {isSplitEnabled && (
                  <div className="text-[10px] font-bold text-emerald-800 font-mono">
                    (₹{perPersonAmount} each for {splitPersons} diners)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tip Selector */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-4 shadow-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
              <Heart className="h-3.5 w-3.5 text-[#8A4228]" />
              <span>Add Tip for Restaurant Staff</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#8A4228]">
              {payment.tipAmount > 0 ? `₹${payment.tipAmount}` : 'No Tip'}
            </span>
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
                      ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-2xs'
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
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-4 shadow-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
              <Users className="h-3.5 w-3.5 text-[#8A4228]" />
              <span>Split Bill Among Diners</span>
            </div>
            <button
              onClick={() => setIsSplitEnabled(!isSplitEnabled)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                isSplitEnabled
                  ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228]'
                  : 'border-[#E8D5C3] bg-[#FAF8F5] text-[#5B5049]'
              }`}
            >
              {isSplitEnabled ? 'Enabled' : 'Enable Split'}
            </button>
          </div>

          {isSplitEnabled && (
            <div className="mt-2 space-y-2">
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
                        ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-2xs'
                        : 'border-[#E8D5C3] bg-[#FFFCF7] text-[#5B5049] hover:bg-[#F3DFCC]/40'
                    }`}
                  >
                    {count} Diners
                  </button>
                ))}
              </div>
              <div className="text-center font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 rounded-xl py-1.5 border border-emerald-200">
                ₹{perPersonAmount} each for {splitPersons} diners
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar — Proceed to Payment Options (Screen 7) */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(7)}
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-5 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <span>Proceed to Payment</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#F3DFCC]">₹{grandTotal}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
