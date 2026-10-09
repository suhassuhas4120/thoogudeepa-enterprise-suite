'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useCustomerStore } from '../../store/useCustomerStore';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
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

    const matchingSnapshot = settledBills[chairKey];
    if (matchingSnapshot && matchingSnapshot.timestamp) {
      const seatNum = typeof matchingSnapshot.seatNumber === 'number'
        ? matchingSnapshot.seatNumber
        : (matchingSnapshot.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(matchingSnapshot.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
      const now = Date.now();
      const isRecent = Math.abs(now - matchingSnapshot.timestamp) < 1800000;
      const isAfterOrder = matchingSnapshot.timestamp > orderPlacedAt + 500;
      if (seatNum === effectiveSeat && isRecent && isAfterOrder) {
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: currentTheme.colors.bgApp }}>
        {/* Bill Breakdown Card */}
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] font-mono"
              style={{ color: currentTheme.colors.textMuted }}
            >
              <Receipt className="h-3.5 w-3.5" style={{ color: currentTheme.colors.buttonBg }} />
              <span>Items &amp; Price Breakdown</span>
            </div>
            <span className="text-[10px] font-bold font-mono" style={{ color: currentTheme.colors.buttonBg }}>
              {activeCart.length} {activeCart.length === 1 ? 'Dish' : 'Dishes'}
            </span>
          </div>

          {/* Itemized Table */}
          <div
            className="space-y-2 border-b border-dashed pb-3 text-xs"
            style={{ borderColor: currentTheme.colors.borderLight }}
          >
            {activeCart.length === 0 ? (
              <div className="py-4 text-center text-xs font-mono" style={{ color: currentTheme.colors.textMuted }}>
                No active items placed yet
              </div>
            ) : (
              activeCart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  <span className="font-semibold">
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span className="font-mono font-black">₹{item.totalPrice}</span>
                </div>
              ))
            )}
          </div>

          {/* Subtotal, Tax, Tip, Total */}
          <div className="space-y-1.5 pt-3 text-xs">
            <div
              className="flex justify-between font-medium"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              <span>Item Subtotal</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div
              className="flex justify-between font-medium"
              style={{ color: currentTheme.colors.textSecondary }}
            >
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
              <div
                className="flex justify-between font-bold"
                style={{ color: currentTheme.colors.buttonBg }}
              >
                <span>Staff Tip</span>
                <span className="font-mono">+₹{payment.tipAmount}</span>
              </div>
            )}
            <div
              className="flex items-center justify-between border-t pt-2.5 text-sm font-black"
              style={{
                borderColor: currentTheme.colors.borderLight,
                color: currentTheme.colors.textPrimary,
              }}
            >
              <span>Total Payable</span>
              <div className="text-right">
                <div
                  className="font-mono text-xl font-black"
                  style={{ color: currentTheme.colors.textPrimary }}
                >
                  ₹{grandTotal}
                </div>
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
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] font-mono"
              style={{ color: currentTheme.colors.textMuted }}
            >
              <Heart className="h-3.5 w-3.5" style={{ color: currentTheme.colors.buttonBg }} />
              <span>Add Tip for Restaurant Staff</span>
            </div>
            <span className="font-mono text-xs font-bold" style={{ color: currentTheme.colors.buttonBg }}>
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
                  style={
                    isSelected
                      ? {
                          borderColor: currentTheme.colors.pillActiveBorder,
                          backgroundColor: currentTheme.colors.pillActiveBg,
                          color: currentTheme.colors.pillActiveFg,
                        }
                      : {
                          borderColor: currentTheme.colors.pillInactiveBorder,
                          backgroundColor: currentTheme.colors.pillInactiveBg,
                          color: currentTheme.colors.pillInactiveFg,
                        }
                  }
                  className="rounded-2xl border py-2 text-center text-xs font-black font-mono transition shadow-2xs active:scale-95"
                >
                  ₹{amt}
                </button>
              );
            })}
            <button
              onClick={() => handlePresetTip(0)}
              style={
                payment.tipAmount === 0 && !customTip
                  ? {
                      borderColor: currentTheme.colors.pillActiveBorder,
                      backgroundColor: currentTheme.colors.pillActiveBg,
                      color: currentTheme.colors.pillActiveFg,
                    }
                  : {
                      borderColor: currentTheme.colors.pillInactiveBorder,
                      backgroundColor: currentTheme.colors.pillInactiveBg,
                      color: currentTheme.colors.pillInactiveFg,
                    }
              }
              className="rounded-2xl border py-2 text-center text-xs font-black font-mono transition shadow-2xs active:scale-95"
            >
              None
            </button>
          </div>
        </div>

        {/* Split Bill Option */}
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] font-mono"
              style={{ color: currentTheme.colors.textMuted }}
            >
              <Users className="h-3.5 w-3.5" style={{ color: currentTheme.colors.buttonBg }} />
              <span>Split Bill Among Diners</span>
            </div>
            <button
              onClick={() => setIsSplitEnabled(!isSplitEnabled)}
              style={
                isSplitEnabled
                  ? {
                      borderColor: currentTheme.colors.pillActiveBorder,
                      backgroundColor: currentTheme.colors.pillActiveBg,
                      color: currentTheme.colors.pillActiveFg,
                    }
                  : {
                      borderColor: currentTheme.colors.pillInactiveBorder,
                      backgroundColor: currentTheme.colors.pillInactiveBg,
                      color: currentTheme.colors.pillInactiveFg,
                    }
              }
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition shadow-2xs"
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
                    style={
                      splitPersons === count
                        ? {
                            borderColor: currentTheme.colors.pillActiveBorder,
                            backgroundColor: currentTheme.colors.pillActiveBg,
                            color: currentTheme.colors.pillActiveFg,
                          }
                        : {
                            borderColor: currentTheme.colors.pillInactiveBorder,
                            backgroundColor: currentTheme.colors.pillInactiveBg,
                            color: currentTheme.colors.pillInactiveFg,
                          }
                    }
                    className="flex-1 rounded-2xl border py-2 text-center text-xs font-black transition shadow-2xs active:scale-95"
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
          style={{
            backgroundColor: currentTheme.colors.buttonBg,
            color: currentTheme.colors.buttonFg,
            boxShadow: currentTheme.colors.buttonShadow,
          }}
          className="flex w-full items-center justify-between rounded-[20px] px-5 py-3.5 text-xs font-black uppercase tracking-[0.14em] shadow-lg transition hover:brightness-105"
        >
          <span>Proceed to Payment</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold opacity-90">₹{grandTotal}</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
