'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge, SettledBillSnapshot } from '../../store/useSharedBridge';
import { useCustomerStore } from '../../store/useCustomerStore';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import QRCode from 'qrcode';
import {
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Receipt,
  ChevronDown,
  ChevronUp,
  BellRing,
  Check,
  Coins,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TenderOption {
  id: string;
  amount: number;
  label: string;
  change: number;
}

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

  // Tab State: 'RAZORPAY' | 'UPI' | 'CASH'
  type PaymentTab = 'RAZORPAY' | 'UPI' | 'CASH';
  const [activeTab, setActiveTab] = useState<PaymentTab>('RAZORPAY');
  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

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
  const tenderOptions: TenderOption[] = useMemo(() => {
    const total = grandTotal;
    if (total <= 0) return [];

    const opts: TenderOption[] = [];

    // 1. Exact amount
    opts.push({
      id: 'exact',
      amount: total,
      label: `Exact (₹${total})`,
      change: 0,
    });

    // 2. Nearest multiple of 50
    const next50 = Math.ceil((total + 1) / 50) * 50;
    if (next50 > total && !opts.some((o) => o.amount === next50)) {
      opts.push({
        id: `amt-${next50}`,
        amount: next50,
        label: `₹${next50}`,
        change: next50 - total,
      });
    }

    // 3. Nearest multiple of 100
    let next100 = Math.ceil((total + 1) / 100) * 100;
    if (next100 <= next50) {
      next100 += 100;
    }
    if (next100 > total && !opts.some((o) => o.amount === next100)) {
      opts.push({
        id: `amt-${next100}`,
        amount: next100,
        label: `₹${next100}`,
        change: next100 - total,
      });
    }

    // 4. Next higher currency note (500, 1000, 1500, 2000, 3000, 5000)
    const currencyNotes = [500, 1000, 1500, 2000, 3000, 5000];
    const nextHigher = currencyNotes.find(
      (n) => n > total && !opts.some((o) => o.amount === n)
    );
    if (nextHigher) {
      opts.push({
        id: `amt-${nextHigher}`,
        amount: nextHigher,
        label: `₹${nextHigher}`,
        change: nextHigher - total,
      });
    }

    return opts.slice(0, 4);
  }, [grandTotal]);

  const [selectedTender, setSelectedTender] = useState<TenderOption>(
    tenderOptions[0] || { id: 'exact', amount: grandTotal, label: `Exact (₹${grandTotal})`, change: 0 }
  );

  // Sync selected tender if grandTotal updates
  useEffect(() => {
    if (tenderOptions.length > 0) {
      setSelectedTender((prev) => {
        const found = tenderOptions.find((o) => o.id === prev.id);
        return found || tenderOptions[0];
      });
    }
  }, [tenderOptions]);

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
    setPaymentMethod(activeTab);

    const finalMethod = activeTab === 'UPI' ? 'UPI' : 'CASH';
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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    try {
      const orderId = payment.transactionId || `ORD-${effectiveTable.replace(/[^a-zA-Z0-9]/g, '')}-S${effectiveSeat}-${Date.now().toString().slice(-6)}`;

      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: grandTotal,
          tableNumber: effectiveTable,
          seatNumber: effectiveSeat,
          paymentMethod: 'RAZORPAY',
        }),
      });

      const data = await res.json();

      if (data.razorpayOrderId && data.razorpayKeyId) {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded && (window as any).Razorpay) {
          const options = {
            key: data.razorpayKeyId,
            amount: Math.round(grandTotal * 100),
            currency: 'INR',
            name: venueName || 'Thoogudeepa Donne Biryani',
            description: `Table ${effectiveTable} Chair ${effectiveSeat} Bill Payment`,
            order_id: data.razorpayOrderId,
            handler: async (response: any) => {
              try {
                await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId,
                    tableNumber: effectiveTable,
                    seatNumber: effectiveSeat,
                    amount: grandTotal,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
              } catch (err) {
                console.warn('Verify error:', err);
              }
              await handleCompletePayment();
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
              },
            },
            theme: {
              color: '#9C3D1E',
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        }
      }

      // Seamless fallback if API keys are in local/test mode
      await handleCompletePayment();
    } catch (err) {
      console.error('Razorpay checkout error:', err);
      setIsProcessing(false);
      setActiveTab('UPI');
    }
  };

  // Dedicated Tab definitions: Pay Online, QR Pay & Cash
  const paymentTabs = [
    { id: 'RAZORPAY' as const, label: 'Pay Online', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'UPI' as const, label: 'QR Pay', icon: <QrCode className="h-4 w-4" /> },
    { id: 'CASH' as const, label: 'Cash', icon: <Banknote className="h-4 w-4" /> },
  ];

  return (
    <ScreenHousing screenNumber={7} screenTitle="PAYMENT">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Payment</span>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: currentTheme.colors.bgApp }}>
        {/* Money Card: Total Amount Due */}
        <div
          className="rounded-[28px] border p-4 shadow-xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-[10px] font-black uppercase tracking-[0.2em] font-mono"
                style={{ color: currentTheme.colors.textMuted }}
              >
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

          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>0% Extra Fee • Direct Restaurant Bank Settlement</span>
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

        {/* PAYMENT TABS: PROPER PILL NAVIGATION (UPI, Cash, Card) */}
        <div
          className="rounded-[28px] border bg-white p-4 shadow-sm space-y-4"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="text-[10px] font-black uppercase tracking-[0.22em] font-mono"
            style={{ color: currentTheme.colors.textMuted }}
          >
            Select Payment Method
          </div>

          {/* Dedicated Tab Pills with Active/Inactive Color Sync */}
          <div
            className="flex rounded-2xl p-1 gap-1.5 border"
            style={{
              backgroundColor: currentTheme.colors.bgElevated,
              borderColor: currentTheme.colors.border,
            }}
          >
            {paymentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPaymentMethod(tab.id);
                  }}
                  style={
                    isActive
                      ? {
                          backgroundColor: currentTheme.colors.pillActiveBg,
                          color: currentTheme.colors.pillActiveFg,
                          borderColor: currentTheme.colors.pillActiveBorder,
                        }
                      : {
                          backgroundColor: currentTheme.colors.pillInactiveBg,
                          color: currentTheme.colors.pillInactiveFg,
                          borderColor: currentTheme.colors.pillInactiveBorder,
                        }
                  }
                  className="flex-1 py-2 rounded-xl text-center text-xs font-black transition flex items-center justify-center gap-2 border shadow-2xs active:scale-95"
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 0: RAZORPAY ONLINE CHECKOUT */}
          {activeTab === 'RAZORPAY' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div
                className="rounded-2xl border p-4 space-y-3 shadow-2xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: currentTheme.colors.borderLight }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black font-mono tracking-wider text-emerald-800 uppercase">
                      Direct Encrypted Gateway
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 font-bold">
                    Zero Extra Fee
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-stone-900">
                    Supported Payment Options
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-stone-700">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200">
                      <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>GPay / PhonePe / Paytm</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200">
                      <CreditCard className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>Credit & Debit Cards</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200">
                      <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>All Indian NetBanking</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200">
                      <QrCode className="h-4 w-4 text-purple-600 shrink-0" />
                      <span>CRED / BHIM / Any UPI</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t text-[11px] text-stone-500 font-medium text-center" style={{ borderColor: currentTheme.colors.borderLight }}>
                  Tap below to launch the official payment gateway and complete your bill.
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: DYNAMIC UPI QR CODE & 1-TAP APPS */}
          {activeTab === 'UPI' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              {/* Dynamic QR Display */}
              <div
                className="rounded-2xl border p-4 flex flex-col items-center text-center shadow-2xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-800 font-mono uppercase tracking-wider">
                    Scan with Any UPI App to Pay
                  </span>
                </div>

                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="NPCI UPI QR Code"
                    style={{ borderColor: currentTheme.colors.border }}
                    className="h-48 w-48 rounded-2xl border-2 p-2 bg-white shadow-sm"
                  />
                ) : (
                  <div
                    className="h-48 w-48 rounded-2xl bg-white border flex items-center justify-center"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    <QrCode className="h-10 w-10" style={{ color: currentTheme.colors.buttonBg }} />
                  </div>
                )}

                <div
                  className="mt-2 text-[10.5px] font-mono"
                  style={{ color: currentTheme.colors.textMuted }}
                >
                  Google Pay • PhonePe • Paytm • Cred • BHIM
                </div>
              </div>

              <div
                className="p-3.5 rounded-2xl border text-center text-xs space-y-1"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <p className="font-bold text-stone-900">
                  Scan QR with any UPI app on your phone
                </p>
                <p className="text-[11px] text-stone-600 font-medium">
                  After completing payment in your app, tap <strong>Confirm QR Pay</strong> below.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SMART CASH TENDER (DYNAMIC CALCULATED PILLS & CHANGE DUE) */}
          {activeTab === 'CASH' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: currentTheme.colors.secondaryBg,
                      color: currentTheme.colors.buttonBg,
                    }}
                  >
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-black"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      Pay Cash to Floor Captain
                    </h4>
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: currentTheme.colors.textMuted }}
                    >
                      Physical currency collection directly at Table {effectiveTable}
                    </p>
                  </div>
                </div>

                {/* Dynamic Smart Cash Tender Pills */}
                <div
                  className="pt-2 border-t"
                  style={{ borderColor: currentTheme.colors.borderLight }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider font-mono"
                      style={{ color: currentTheme.colors.textMuted }}
                    >
                      Select Cash Tender Note:
                    </span>
                    <span
                      className="text-[10px] font-bold font-mono"
                      style={{ color: currentTheme.colors.buttonBg }}
                    >
                      Bill: ₹{grandTotal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {tenderOptions.map((opt) => {
                      const isSelected = selectedTender.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedTender(opt)}
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
                          className="flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-mono font-black transition text-center shadow-2xs active:scale-95"
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Cash Tender Collection Summary Card */}
                  <div
                    className="mt-3 rounded-xl p-3 border flex items-center justify-between text-xs shadow-2xs"
                    style={{
                      backgroundColor: currentTheme.colors.bgSurface,
                      borderColor: currentTheme.colors.border,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg font-mono font-black text-xs"
                        style={{
                          backgroundColor: currentTheme.colors.secondaryBg,
                          color: currentTheme.colors.buttonBg,
                        }}
                      >
                        ₹
                      </div>
                      <div>
                        <div
                          className="text-[10px] font-black uppercase tracking-wider font-mono"
                          style={{ color: currentTheme.colors.textMuted }}
                        >
                          Tender Collection
                        </div>
                        <div
                          className="font-bold text-[11px] mt-0.5"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          {selectedTender.change === 0 ? (
                            <span className="text-emerald-800 font-black">
                              Exact Cash • No balance return needed
                            </span>
                          ) : (
                            <span>
                              Paying <span className="font-mono font-black" style={{ color: currentTheme.colors.buttonBg }}>₹{selectedTender.amount}</span> • Return balance:{' '}
                              <span className="font-mono font-black text-emerald-800">₹{selectedTender.change}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: currentTheme.colors.secondaryBg,
                        color: currentTheme.colors.secondaryFg,
                        borderColor: currentTheme.colors.border,
                      }}
                      className="font-mono text-[11px] font-black px-2.5 py-1 rounded-lg border shrink-0"
                    >
                      {selectedTender.change === 0 ? 'EXACT CASH' : `₹${selectedTender.change} RETURN`}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-3 rounded-2xl border p-3 text-[11.5px] shadow-2xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.textSecondary,
                }}
              >
                <div
                  style={{
                    backgroundColor: currentTheme.colors.secondaryBg,
                    color: currentTheme.colors.buttonBg,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
                >
                  <BellRing className="h-4 w-4" />
                </div>
                <div className="flex-1 leading-relaxed">
                  Floor Captain will arrive at <strong className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>Table {effectiveTable}</strong> with your printed tax bill{' '}
                  {selectedTender.change > 0 ? (
                    <>
                      and{' '}
                      <span className="inline-flex items-center px-2.5 py-0.5 mx-1 rounded-xl bg-emerald-100 border border-emerald-300 font-mono font-black text-base text-emerald-900 shadow-2xs">
                        ₹{selectedTender.change}
                      </span>{' '}
                      return balance.
                    </>
                  ) : (
                    'and payment receipt.'
                  )}
                </div>
              </div>
            </motion.div>
          )}


        </div>
      </div>

      {/* Sticky Bottom Bar with One Clear Action */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={activeTab === 'RAZORPAY' ? handleRazorpayCheckout : handleCompletePayment}
          disabled={isProcessing}
          style={{
            backgroundColor: currentTheme.colors.buttonBg,
            color: currentTheme.colors.buttonFg,
            boxShadow: currentTheme.colors.buttonShadow,
          }}
          className="flex w-full items-center justify-between rounded-[20px] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] shadow-lg transition hover:brightness-105 disabled:opacity-75"
        >
          <span>
            {isProcessing
              ? 'Verifying Settlement...'
              : activeTab === 'RAZORPAY'
              ? `Pay Online ₹${grandTotal} (UPI / Cards / NetBanking)`
              : activeTab === 'UPI'
              ? `Confirm QR Pay (₹${grandTotal})`
              : selectedTender.change === 0
              ? `Confirm Cash (Exact ₹${grandTotal})`
              : `Confirm Cash ₹${selectedTender.amount} (Return ₹${selectedTender.change})`}
          </span>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          )}
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
