'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
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
  } = useCustomer();

  const { waiterRecordsPayment, customerPingsWaiter } = useSharedBridge();

  // Tab State: 'UPI' | 'CASH' | 'CARD'
  const [activeTab, setActiveTab] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [appNotice, setAppNotice] = useState<string>('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Money Calculations
  const subtotal = cart.length > 0
    ? cart.reduce((s, i) => s + i.totalPrice, 0)
    : (payment.subtotal > 0 ? payment.subtotal : 1180);
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

  // 1-Tap App launch options
  const upiAppOptions = [
    {
      id: 'gpay',
      name: 'Google Pay',
      scheme: `tez://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      scheme: `phonepe://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    },
    {
      id: 'paytm',
      name: 'Paytm',
      scheme: `paytmmp://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
    },
    {
      id: 'other',
      name: 'Other UPI / Cred',
      scheme: upiUri,
    },
  ];

  const handleLaunchApp = (app: typeof upiAppOptions[0]) => {
    setSelectedApp(app.name);
    setPaymentMethod('UPI');

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = app.scheme;
    } else {
      setAppNotice(`Selected ${app.name} • On mobile this opens ${app.name} directly.`);
      setTimeout(() => setAppNotice(''), 3500);
    }
  };

  // Complete Payment Settlement
  const handleCompletePayment = async () => {
    setIsProcessing(true);
    setPaymentMethod(activeTab);

    try {
      if (activeTab === 'UPI') {
        waiterRecordsPayment(effectiveTable, 'UPI', grandTotal);
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(8);
        }, 700);
      } else if (activeTab === 'CASH') {
        waiterRecordsPayment(effectiveTable, 'CASH', grandTotal);
        customerPingsWaiter(
          effectiveTable,
          'CASH BILL',
          `Customer (Table ${effectiveTable})`,
          selectedTender.change > 0
            ? `Cash payment: ₹${selectedTender.amount} tendered, ₹${selectedTender.change} return change requested`
            : `Exact cash payment of ₹${grandTotal} ready at table`
        );
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(8);
        }, 700);
      } else {
        waiterRecordsPayment(effectiveTable, 'CARD', grandTotal);
        customerPingsWaiter(
          effectiveTable,
          'CARD POS',
          `Customer (Table ${effectiveTable})`,
          `Portable POS Card Machine requested at Table ${effectiveTable} (Bill: ₹${grandTotal})`
        );
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(8);
        }, 700);
      }
    } catch {
      setIsProcessing(false);
      setCurrentScreen(8);
    }
  };

  // Clean Tab definitions: Single proper icon + single word name (UPI, Cash, Card)
  const paymentTabs = [
    { id: 'UPI' as const, label: 'UPI', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'CASH' as const, label: 'Cash', icon: <Banknote className="h-4 w-4" /> },
    { id: 'CARD' as const, label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
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
        onBack={() => setCurrentScreen(6)}
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

              {/* Working 1-Tap App Deep Links */}
              <div>
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span
                    className="text-[9.5px] font-black uppercase tracking-wider font-mono"
                    style={{ color: currentTheme.colors.textMuted }}
                  >
                    Or Tap to Launch Installed App:
                  </span>
                  {selectedApp && (
                    <span className="text-[9.5px] font-bold font-mono" style={{ color: currentTheme.colors.buttonBg }}>
                      Selected: {selectedApp}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {upiAppOptions.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleLaunchApp(app)}
                      style={
                        selectedApp === app.name
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
                      className="flex items-center justify-between rounded-xl border p-2.5 text-[11px] font-black transition shadow-2xs active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone
                          className="h-3.5 w-3.5"
                          style={{ color: selectedApp === app.name ? currentTheme.colors.pillActiveFg : currentTheme.colors.buttonBg }}
                        />
                        <span>{app.name}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </button>
                  ))}
                </div>

                {appNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-[10.5px] font-bold text-emerald-800"
                  >
                    {appNotice}
                  </motion.div>
                )}
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

          {/* TAB 3: CARD AT TABLE */}
          {activeTab === 'CARD' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div
                className="rounded-2xl border p-4 space-y-2"
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
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4
                      className="text-xs font-black"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      Wireless Card Machine at Table
                    </h4>
                    <p
                      className="text-[10px] font-medium"
                      style={{ color: currentTheme.colors.textMuted }}
                    >
                      Captain will bring the portable POS terminal
                    </p>
                  </div>
                </div>

                <div
                  className="mt-2 pt-2 border-t text-[10.5px] font-medium space-y-1"
                  style={{
                    borderColor: currentTheme.colors.borderLight,
                    color: currentTheme.colors.textSecondary,
                  }}
                >
                  <div>• Accepted: Visa, Mastercard, RuPay, Amex</div>
                  <div>• Contactless NFC Tap &amp; Pay supported</div>
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
          onClick={handleCompletePayment}
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
              : activeTab === 'UPI'
              ? `Pay ₹${grandTotal} via ${selectedApp || 'UPI'}`
              : activeTab === 'CASH'
              ? selectedTender.change === 0
                ? `Confirm Cash (Exact ₹${grandTotal})`
                : `Confirm Cash ₹${selectedTender.amount} (Return ₹${selectedTender.change})`
              : `Request Card Machine (₹${grandTotal})`}
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
