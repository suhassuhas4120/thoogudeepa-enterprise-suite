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

  const { waiterRecordsPayment, settledBills, recordSettledBill, waiterClearsChairAfterPayment, tables } = useSharedBridge();

  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'UPI' | 'CARD'>('UPI');
  const [cardType, setCardType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^5[1-5]/.test(clean)) return 'Mastercard';
    if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
    if (/^3[47]/.test(clean)) return 'Amex';
    return 'Card';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
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
              {/* Card Header & Security Badge */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
                  Debit / Credit Card
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>

              {/* Card Type Selection: Credit vs Debit */}
              <div className="grid grid-cols-2 p-1 rounded-xl border border-amber-500/20 bg-stone-950/60 gap-1">
                <button
                  type="button"
                  onClick={() => setCardType('CREDIT')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer font-serif-luxury ${
                    cardType === 'CREDIT'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('DEBIT')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer font-serif-luxury ${
                    cardType === 'DEBIT'
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Debit Card
                </button>
              </div>

              {/* Visual Luxury Bank Card */}
              <div className="relative rounded-2xl p-4 bg-gradient-to-tr from-stone-950 via-stone-900 to-amber-950/70 text-white shadow-[0_8px_24px_rgba(0,0,0,0.7)] border border-amber-500/35 overflow-hidden">
                <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] uppercase tracking-widest font-mono text-amber-200/90 font-bold">
                    THOOGUDEEPA {cardType}
                  </div>
                  <span className="font-mono text-xs font-black tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {getCardBrand(cardNumber)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-inner flex items-center justify-center">
                    <div className="h-4 w-6 border border-amber-800/40 rounded-[3px] opacity-75" />
                  </div>
                  <Wifi className="h-4 w-4 text-amber-200/80 rotate-90" />
                </div>

                <div className="font-mono text-base tracking-[0.18em] font-bold text-amber-100 mb-3 drop-shadow-sm">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="flex items-end justify-between text-[10px] font-mono">
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase tracking-wider">Cardholder</div>
                    <div className="font-bold text-amber-200 truncate max-w-[170px]">
                      {cardHolder || 'VALUED GUEST'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-stone-400 uppercase tracking-wider">Expires</div>
                    <div className="font-bold text-amber-200">
                      {cardExpiry || 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3">
                {/* Card Number */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-400 font-serif-luxury">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="4532 8920 1192 8821"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className="w-full rounded-xl border border-amber-500/25 bg-stone-950/70 px-3.5 py-2.5 text-xs font-mono font-bold text-amber-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400/60 pointer-events-none" />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-400 font-serif-luxury">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name as printed on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-amber-500/25 bg-stone-950/70 px-3.5 py-2.5 text-xs font-medium text-amber-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* Expiry & CVV Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-400 font-serif-luxury">
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className="w-full rounded-xl border border-amber-500/25 bg-stone-950/70 px-3.5 py-2.5 text-xs font-mono font-bold text-amber-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-stone-400 font-serif-luxury">
                      CVV / CVC
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        maxLength={4}
                        className="w-full rounded-xl border border-amber-500/25 bg-stone-950/70 px-3.5 py-2.5 text-xs font-mono font-bold text-amber-100 placeholder:text-stone-600 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-center tracking-widest"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400/60 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Tokenization Checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer pt-1 select-none">
                  <div
                    onClick={() => setSaveCard(!saveCard)}
                    className="h-4 w-4 rounded border flex items-center justify-center transition border-amber-400/40 bg-stone-950/80"
                    style={{
                      backgroundColor: saveCard ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                    }}
                  >
                    {saveCard && <Check className="h-3 w-3 stroke-[3] text-amber-300" />}
                  </div>
                  <span className="text-[11px] font-medium leading-tight text-stone-300">
                    Securely save card for faster dining checkouts (RBI tokenized)
                  </span>
                </label>

                {/* Trust & Security Badge */}
                <div className="p-2.5 rounded-xl border border-amber-500/20 bg-stone-950/60 flex items-center justify-center gap-2 text-[10.5px] font-medium text-stone-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>PCI-DSS Compliant • 256-Bit SSL Bank Grade Encryption</span>
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
              : `Pay via Card (₹${grandTotal})`}
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
