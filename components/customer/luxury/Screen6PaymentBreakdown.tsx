'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge, SettledBillSnapshot } from '../../../store/useSharedBridge';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { StickyBottomBar } from '../../ui/StickyBottomBar';
import { Receipt, Heart, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Screen6PaymentBreakdown: React.FC = () => {
  const { currentTheme } = useCustomerTheme();
  const {
    setCurrentScreen,
    cart,
    payment,
    updateTip,
    setSplitMode,
    tableNumber,
    seatNumber,
    venueName,
    orderPlacedAt,
  } = useCustomer();

  const { settledBills, kdsTickets, tables } = useSharedBridge();

  const [customTip, setCustomTip] = useState<string>('');
  const [splitPersons, setSplitPersons] = useState<number>(2);
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Auto-transition to Screen 8 only if waiter just settled this specific chair right now
  useEffect(() => {
    if (!settledBills || !orderPlacedAt || orderPlacedAt <= 0) return;
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const tNum = cleanNum(effectiveTable);
    const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
    const chairKey = `${normTable}-CHAIR-${effectiveSeat}`;

    let matchingSnapshot: SettledBillSnapshot | null = null;
    if (settledBills[chairKey]) {
      const b = settledBills[chairKey];
      const seatNum = typeof b.seatNumber === 'number'
        ? b.seatNumber
        : (b.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(b.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
      if (seatNum === effectiveSeat) {
        matchingSnapshot = b;
      }
    } else if (settledBills[normTable]) {
      const b = settledBills[normTable];
      const seatNum = typeof b.seatNumber === 'number'
        ? b.seatNumber
        : (b.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(b.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
      if (seatNum === effectiveSeat) {
        matchingSnapshot = b;
      }
    }

    if (matchingSnapshot && matchingSnapshot.timestamp) {
      const now = Date.now();
      const isRecent = Math.abs(now - matchingSnapshot.timestamp) < 1800000;
      const isAfterOrder = matchingSnapshot.timestamp > orderPlacedAt + 500;
      if (isRecent && isAfterOrder) {
        useCustomerStore.getState().handleBillSettledByWaiter(matchingSnapshot);
      }
    }
  }, [settledBills, effectiveTable, effectiveSeat, orderPlacedAt]);

  // Dismiss any lingering waiter summons when on self-pay breakdown
  useEffect(() => {
    useCustomerStore.getState().dismissWaiterNotification();
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const bridgeState = useSharedBridge.getState();
    const paymentPing = bridgeState.pings.find(
      (p) =>
        cleanNum(p.tableNumber) === cleanNum(effectiveTable) &&
        p.type === 'PAYMENT' &&
        p.seatNumber === effectiveSeat &&
        p.status === 'PENDING'
    );
    if (paymentPing) {
      bridgeState.waiterResolvePing(paymentPing.id);
    }
  }, [effectiveTable, effectiveSeat]);

  // Authentic items from cart, bridge tickets, or settled items (no fake/random data)
  const activeCart = useMemo(() => {
    const chairCart = (cart || []).filter((ci) => !ci.seatNumber || ci.seatNumber === effectiveSeat);
    if (chairCart.length > 0) return chairCart;

    // Check if table has items in bridge tickets strictly for this chair
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const myTickets = kdsTickets.filter(
      (tk) => cleanNum(tk.tableNumber) === cleanNum(effectiveTable) &&
              tk.status !== 'COMPLETED' &&
              (tk.seatNumber === effectiveSeat || tk.items.some((i) => i.seatNumber === effectiveSeat))
    );
    if (myTickets.length > 0) {
      return myTickets.flatMap((tk) =>
        tk.items
          .filter((it) => it.seatNumber === effectiveSeat || (!it.seatNumber && tk.seatNumber === effectiveSeat))
          .map((it) => ({
            cartItemId: it.id,
            menuItem: { id: it.id, name: it.name, price: it.price || 0 } as any,
            selectedOption: it.options || '',
            selectedAddOns: it.addOns || [],
            quantity: it.quantity,
            totalPrice: (it.price || 0) * it.quantity,
            prepMode: it.prepMode || '',
            isOrdered: true,
            seatNumber: effectiveSeat,
          }))
      );
    }

    return [];
  }, [cart, kdsTickets, effectiveTable, effectiveSeat]);

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
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black font-mono tracking-tight border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
              {effectiveTable} • C-{String(effectiveSeat).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName.toUpperCase()}
        showBack={true}
        onBack={() => {
          useCustomerStore.getState().dismissWaiterNotification();
          const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
          const bridgeState = useSharedBridge.getState();
          const paymentPing = bridgeState.pings.find(
            (p) =>
              cleanNum(p.tableNumber) === cleanNum(effectiveTable) &&
              p.type === 'PAYMENT' &&
              p.seatNumber === effectiveSeat &&
              p.status === 'PENDING'
          );
          if (paymentPing) {
            bridgeState.waiterResolvePing(paymentPing.id);
          }
          setCurrentScreen(5);
        }}
        showCallWaiter={true}
        showCart={false}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Bill Breakdown Card */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
              <Receipt className="h-4 w-4 text-amber-400" />
              <span>Items &amp; Price Breakdown</span>
            </div>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 font-mono">
              {activeCart.length} {activeCart.length === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2.5 border-b border-white/10 pb-3.5 text-xs">
            {activeCart.length === 0 ? (
              <div className="py-4 text-center text-xs font-serif-luxury text-stone-400">
                No active items placed yet
              </div>
            ) : (
              activeCart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between text-stone-200"
                >
                  <span className="font-serif-luxury text-sm font-medium">
                    {item.menuItem.name} &times; {item.quantity}
                  </span>
                  <span className="font-mono font-bold text-amber-300">₹{item.totalPrice}</span>
                </div>
              ))
            )}
          </div>

          {/* Subtotal, Tax, Tip, Total */}
          <div className="space-y-2 pt-3 text-xs">
            <div className="flex justify-between items-center text-stone-300">
              <span className="font-medium">Item Subtotal</span>
              <span className="font-mono font-bold text-stone-100">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-stone-300">
              <span className="font-medium">Taxes &amp; Charges (GST 5%)</span>
              <span className="font-mono font-bold text-stone-100">₹{tax}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center font-bold text-emerald-400">
                <span>Loyalty Reward Discount</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}
            {payment.tipAmount > 0 && (
              <div className="flex justify-between items-center font-bold text-amber-300">
                <span>Staff Tip</span>
                <span className="font-mono">+₹{payment.tipAmount}</span>
              </div>
            )}

            {/* Prominently Highlighted Grand Total Container (Obsidian Gold Perfection) */}
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-black/90 p-3.5 shadow-[0_4px_20px_rgba(217,119,6,0.18)] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md">
                  <Receipt className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider font-serif-luxury text-amber-100">
                    Total Payable
                  </div>
                  <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                    All taxes & charges included
                  </div>
                </div>
              </div>

              <div className="shrink-0 rounded-xl px-3.5 py-1.5 border border-amber-400/60 bg-black/80 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-right">
                <div className="text-[9px] font-black uppercase tracking-wider font-mono text-amber-400/80">
                  Grand Total
                </div>
                <div className="font-mono text-xl font-black text-amber-300 tracking-tight leading-none mt-0.5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                  ₹{grandTotal}
                </div>
                {isSplitEnabled && (
                  <div className="text-[9px] font-bold text-amber-400 font-mono mt-1">
                    ₹{perPersonAmount} each
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tip Selector */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
              <Heart className="h-4 w-4 text-amber-400" />
              <span>Add Tip for Restaurant Staff</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
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
                  className={`rounded-2xl border py-2.5 text-center text-xs font-black font-mono transition shadow-2xs active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-r from-amber-500/30 to-amber-600/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-stone-100'
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
            <button
              onClick={() => handlePresetTip(0)}
              className={`rounded-2xl border py-2.5 text-center text-xs font-black font-mono transition shadow-2xs active:scale-95 cursor-pointer ${
                payment.tipAmount === 0 && !customTip
                  ? 'border-amber-400 bg-gradient-to-r from-amber-500/30 to-amber-600/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-stone-100'
              }`}
            >
              None
            </button>
          </div>
        </div>

        {/* Split Bill Option */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
              <Users className="h-4 w-4 text-amber-400" />
              <span>Split Bill Among Diners</span>
            </div>
            <button
              onClick={() => setIsSplitEnabled(!isSplitEnabled)}
              className={`rounded-full px-3 py-1 text-[10.5px] font-bold border transition shadow-2xs cursor-pointer ${
                isSplitEnabled
                  ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'border-white/10 bg-white/5 text-stone-300 hover:bg-white/10'
              }`}
            >
              {isSplitEnabled ? 'Enabled' : 'Enable Split'}
            </button>
          </div>

          {isSplitEnabled && (
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setSplitPersons(count);
                      setSplitMode('PERSONS', count);
                    }}
                    className={`flex-1 rounded-2xl border py-2 text-center text-xs font-black transition shadow-2xs active:scale-95 cursor-pointer ${
                      splitPersons === count
                        ? 'border-amber-400 bg-gradient-to-r from-amber-500/30 to-amber-600/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'border-white/10 bg-white/5 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {count} Diners
                  </button>
                ))}
              </div>
              <div className="text-center font-mono text-[11px] font-bold text-amber-300 bg-amber-950/40 rounded-xl py-2 border border-amber-500/30">
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
          className="flex w-full items-center justify-between rounded-[22px] px-6 py-4 shadow-[0_12px_32px_rgba(217,119,6,0.45)] transition hover:brightness-105 border border-amber-300/60 font-serif-luxury text-base font-bold tracking-wide text-amber-950"
          style={{
            background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
          }}
        >
          <span>Proceed to Payment</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-extrabold">₹{grandTotal}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
