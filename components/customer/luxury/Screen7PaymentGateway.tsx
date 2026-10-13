'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge, SettledBillSnapshot } from '../../../store/useSharedBridge';
import { useCustomerStore } from '../../../store/useCustomerStore';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { StickyBottomBar } from '../../ui/StickyBottomBar';
import QRCode from 'qrcode';
import {
  QrCode,
  ArrowRight,
  Loader2,
  Receipt,
  ChevronDown,
  ChevronUp,
  BellRing,
  CreditCard,
  Lock,
  ShieldCheck,
  Wifi,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen7PaymentGateway: React.FC = () => {
  const { currentTheme } = useCustomerTheme();
  const {
    setCurrentScreen,
    payment,
    setPaymentMethod,
    cart,
    tableNumber,
    seatNumber,
    venueName,
    orderPlacedAt,
  } = useCustomer();

  const { waiterRecordsPayment, settledBills, recordSettledBill, waiterClearsChairAfterPayment, tables, customerPingsWaiter } = useSharedBridge();

  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'UPI' | 'CARD'>('UPI');
  const [cardType, setCardType] = useState<'Debit' | 'Credit'>('Debit');
  const [cardNetwork, setCardNetwork] = useState<'RuPay' | 'VISA' | 'Mastercard'>('RuPay');
  const [cardPin, setCardPin] = useState('');
  const [waiterSummonedForCard, setWaiterSummonedForCard] = useState(false);

  const handleSummonCardMachine = () => {
    setWaiterSummonedForCard(true);
    customerPingsWaiter(effectiveTable, 'PAYMENT', `Card EDC Machine requested at Chair ${effectiveSeat}`, undefined, effectiveSeat);
  };

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Dismiss any lingering waiter summons when on self-pay gateway
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

  // Money Calculations
  const subtotal = cart.length > 0
    ? cart.reduce((s, i) => s + i.totalPrice, 0)
    : (payment.subtotal > 0 ? payment.subtotal : 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST (2.5% CGST + 2.5% SGST)
  const discount = payment.discount || (payment.redeemPoints ? Math.min(50, subtotal + tax) : 0);
  const grandTotal = Math.max(0, subtotal + tax + payment.tipAmount - discount);

  // Smart Dynamic Tender Generator (e.g. ₹1239 -> Exact ₹1239, ₹1250 [+11 change], ₹1300 [+61 change], ₹1500/₹2000)


  // Standard NPCI UPI URI string
  const merchantVpa = 'thoogudeepa@okicici';
  const merchantName = 'Thoogudeepa Donne Biryani';
  const transactionNote = `Table ${effectiveTable} Seat ${effectiveSeat} Bill`;
  const upiUri = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(
    merchantName
  )}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // 1. Instant Bulletproof QR Generation on Mount (0-Second Display)
  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 1,
      color: {
        dark: '#1C1917',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        if (isMounted) {
          setQrDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              upiUri
            )}&color=1C1917`
          );
        }
      });

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [upiUri]);

  // Complete Payment Settlement
  const handleCompletePayment = async () => {
    setIsProcessing(true);
    const finalMethod = activeTab === 'UPI' ? 'UPI' : 'CARD';
    setPaymentMethod(finalMethod as any);

    const finalItems = cart.map((ci) => ({
      id: ci.cartItemId,
      name: ci.menuItem.name,
      quantity: ci.quantity,
      price: ci.totalPrice / (ci.quantity || 1),
      totalPrice: ci.totalPrice,
      seatNumber: ci.seatNumber || effectiveSeat,
    }));

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const inv = payment.invoiceNumber || `INV-${effectiveTable.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

    const snapshot: SettledBillSnapshot = {
      invoiceNumber: inv,
      items: finalItems,
      subtotal,
      totalTax: tax,
      cgst: Math.round(tax / 2),
      sgst: tax - Math.round(tax / 2),
      grandTotal,
      method: finalMethod,
      cashTendered: grandTotal,
      cashChange: 0,
      seatLabel: `Chair ${effectiveSeat}`,
      seatNumber: effectiveSeat,
      captainName: 'Floor Captain',
      tableName: effectiveTable,
      section: 'Main Dining Hall',
      guestCount: 1,
      formattedDate,
      formattedTime,
      timestamp: Date.now(),
    };

    try {
      waiterRecordsPayment(effectiveTable, finalMethod, grandTotal, effectiveSeat);
      recordSettledBill(snapshot);
      waiterClearsChairAfterPayment(effectiveTable, effectiveSeat);
    } catch (e) {
      console.warn('payment bridge error', e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      useCustomerStore.getState().handleBillSettledByWaiter(snapshot);
    }, 600);
  };

  return (
    <ScreenHousing screenNumber={7} screenTitle="PAYMENT">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Payment</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black font-mono tracking-tight border border-amber-500/30 bg-amber-950/40 text-amber-200">
              {effectiveTable} • C-{String(effectiveSeat).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName?.toUpperCase()}
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
          setCurrentScreen(6);
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
        {/* Money Card: Total Amount Due */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
                Total Amount Due
              </div>
              <div
                className="mt-0.5 font-mono text-3xl font-black"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                ₹{grandTotal}
              </div>
            </div>

            <button
              onClick={() => setShowSummary(!showSummary)}
              style={{
                backgroundColor: currentTheme.colors.bgElevated,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold hover:brightness-95 transition shadow-2xs"
            >
              <Receipt className="h-3.5 w-3.5" style={{ color: currentTheme.colors.buttonBg }} />
              <span>{showSummary ? 'Hide Bill' : 'View Bill'}</span>
              {showSummary ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Collapsible Bill Details */}
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-dashed space-y-1.5 text-xs"
                style={{ borderColor: currentTheme.colors.borderLight, color: currentTheme.colors.textSecondary }}
              >
                <div className="flex justify-between font-medium">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-bold" style={{ color: currentTheme.colors.textPrimary }}>₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>GST (5% Total: 2.5% CGST + 2.5% SGST)</span>
                  <span className="font-mono font-bold" style={{ color: currentTheme.colors.textPrimary }}>₹{tax}</span>
                </div>
                {payment.tipAmount > 0 && (
                  <div className="flex justify-between font-bold" style={{ color: currentTheme.colors.buttonBg }}>
                    <span>Staff Tip</span>
                    <span className="font-mono">+₹{payment.tipAmount}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Loyalty Discount</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Tabs: UPI / QR vs Card */}
        <div className="p-1 rounded-2xl border border-amber-500/25 bg-stone-950/80 flex gap-1 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('UPI')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-serif-luxury flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'UPI'
                ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-stone-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            <QrCode className="h-4 w-4 text-amber-400" />
            <span>UPI / QR Pay</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CARD')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-serif-luxury flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'CARD'
                ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-stone-400 hover:text-stone-200 border border-transparent'
            }`}
          >
            <CreditCard className="h-4 w-4 text-amber-400" />
            <span>Card Payment</span>
          </button>
        </div>

        {/* Payment Container */}
        <div className="rounded-[28px] border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-4">
          {activeTab === 'UPI' ? (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
                  Scan &amp; Pay via UPI
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span>Instant Self-Pay</span>
                </span>
              </div>

              {/* Dynamic QR Display */}
              <div className="rounded-2xl border p-5 flex flex-col items-center text-center border-amber-500/25 bg-stone-950/70 shadow-inner">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-bold text-emerald-300 font-mono uppercase tracking-wider">
                    Scan with Any UPI App to Pay
                  </span>
                </div>

                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="NPCI UPI QR Code"
                    className="h-48 w-48 rounded-2xl border-2 border-amber-500/30 p-2 bg-white shadow-lg"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-2xl bg-stone-950 border border-amber-500/30 flex items-center justify-center shadow-lg">
                    <QrCode className="h-10 w-10 text-amber-400" />
                  </div>
                )}

                <div className="mt-3 text-[10.5px] font-mono text-stone-300 font-medium">
                  Google Pay • PhonePe • Paytm • CRED • BHIM
                </div>
              </div>

              <div className="p-3 rounded-2xl border text-center text-xs border-amber-500/20 bg-stone-900/70 backdrop-blur-md">
                <p className="text-[11px] text-stone-300 font-medium">
                  After completing payment in your UPI app, tap{' '}
                  <strong className="text-amber-200">Confirm UPI Payment</strong> below.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Card Header & Machine Status */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
                  Pay via Card Machine
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span>Wireless EDC Terminal</span>
                </span>
              </div>

              {/* Waiter Summon Banner for Card Machine */}
              <div className="rounded-2xl border border-amber-500/25 bg-stone-950/70 p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="font-bold text-xs truncate text-amber-100 font-serif-luxury">
                      {waiterSummonedForCard ? 'Captain is on the way!' : 'Waiter brings device to chair'}
                    </div>
                    <div className="text-[11px] truncate text-stone-400">
                      {waiterSummonedForCard
                        ? `Bringing swipe machine to Chair ${effectiveSeat}`
                        : `Swipe or tap card at Chair ${effectiveSeat}`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSummonCardMachine}
                  className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold border border-amber-400/40 bg-amber-500/15 text-amber-300 transition hover:bg-amber-500/25 active:scale-95 cursor-pointer font-serif-luxury"
                >
                  {waiterSummonedForCard ? '✓ Summoned' : 'Call Waiter'}
                </button>
              </div>

              {/* Card Selection: Debit vs Credit & Networks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-amber-200/80 font-serif-luxury">
                  <span>SELECT CARD TYPE</span>
                  <span className="font-mono text-[10px] text-stone-400">CHIP &amp; PIN</span>
                </div>
                <div className="grid grid-cols-2 p-1 rounded-xl border border-amber-500/20 bg-stone-950/60 gap-1">
                  <button
                    type="button"
                    onClick={() => setCardType('Debit')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer font-serif-luxury ${
                      cardType === 'Debit'
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Debit Card (ATM PIN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('Credit')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer font-serif-luxury ${
                      cardType === 'Credit'
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Credit Card
                  </button>
                </div>

                {/* Card Networks */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {(['RuPay', 'VISA', 'Mastercard'] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setCardNetwork(net)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition text-center cursor-pointer font-mono ${
                        cardNetwork === net
                          ? 'border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-xs'
                          : 'border-white/10 bg-white/5 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handheld EDC POS Terminal Simulator & PIN Authorization */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-stone-950 via-stone-900 to-black p-4 text-white shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

                {/* Device Header */}
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 text-[10px] font-mono text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="font-bold text-amber-200 font-serif-luxury">PORTABLE EDC TERMINAL</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-500/30">
                    {effectiveTable} • Chair {effectiveSeat}
                  </span>
                </div>

                {/* LCD Display on Device */}
                <div className="rounded-xl border border-amber-500/25 bg-stone-950/90 p-3 text-center shadow-inner space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-amber-200/80 font-serif-luxury">
                    Thoogudeepa Royal Dining
                  </div>
                  <div className="font-mono text-2xl font-black text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                    ₹{grandTotal}
                  </div>
                  <div className="text-[11px] font-mono text-stone-300 font-medium">
                    {cardType} Card • {cardNetwork}
                  </div>
                  <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>SWIPE / INSERT CARD &amp; ENTER PIN</span>
                  </div>
                </div>

                {/* Secure PIN Dots Display */}
                <div className="flex flex-col items-center justify-center pt-1">
                  <div className="text-[11px] font-bold text-amber-200 mb-2 flex items-center gap-1 font-serif-luxury">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Enter 4-Digit Card PIN Permission</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {[0, 1, 2, 3].map((idx) => {
                      const isFilled = cardPin.length > idx;
                      return (
                        <div
                          key={idx}
                          className={`h-10 w-10 rounded-xl border flex items-center justify-center text-lg font-mono font-black transition-all ${
                            isFilled
                              ? 'border-amber-400 bg-amber-500/25 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                              : 'border-white/15 bg-stone-950 text-stone-600'
                          }`}
                        >
                          {isFilled ? '●' : '○'}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-[10px] text-stone-400 text-center font-mono">
                    Confidential PIN authorizes the swipe on merchant terminal
                  </div>
                </div>

                {/* On-Screen EDC Device Numeric Keypad */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-amber-500/20">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', '⌫'].map((btn) => (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        if (btn === 'CLR') {
                          setCardPin('');
                        } else if (btn === '⌫') {
                          setCardPin((prev) => prev.slice(0, -1));
                        } else {
                          if (cardPin.length < 4) {
                            setCardPin((prev) => prev + btn);
                          }
                        }
                      }}
                      className={`h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition active:scale-95 cursor-pointer ${
                        btn === 'CLR'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60'
                          : btn === '⌫'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40 hover:bg-amber-900/60'
                          : 'bg-stone-900 hover:bg-stone-800 text-amber-100 border border-amber-500/20'
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>

                {/* Security Certification */}
                <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-stone-400 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>PCI-PTS &amp; EMV Level 2 Certified Terminal</span>
                </div>
              </div>
            </>
          )}

          {/* Prefer Cash / Waiter settlement option */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="font-bold text-xs truncate text-amber-100 font-serif-luxury">
                  Paying by cash?
                </div>
                <div className="text-[11px] truncate text-stone-400">
                  Floor captain will bring the bill to your chair
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentScreen(10)}
              className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold border border-amber-400/40 bg-amber-500/10 text-amber-300 transition hover:bg-amber-500/20 active:scale-95 cursor-pointer font-serif-luxury"
            >
              Call Waiter
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar with One Clear Action */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCompletePayment}
          disabled={isProcessing}
          className="flex w-full items-center justify-between rounded-[22px] px-6 py-4 shadow-[0_12px_32px_rgba(217,119,6,0.45)] transition hover:brightness-105 disabled:opacity-75 border border-amber-300/60 font-serif-luxury text-base font-bold tracking-wide text-amber-950 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
          }}
        >
          <span>
            {isProcessing
              ? 'Verifying Settlement...'
              : activeTab === 'UPI'
              ? `Confirm UPI Payment (₹${grandTotal})`
              : cardPin.length === 4
              ? `Authorize & Pay via Card (₹${grandTotal})`
              : `Swipe & Authorize Card (₹${grandTotal})`}
          </span>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-950" />
          ) : (
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            >
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.span>
          )}
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
