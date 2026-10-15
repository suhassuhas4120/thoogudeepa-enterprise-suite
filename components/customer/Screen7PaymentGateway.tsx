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
  Smartphone,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SelfPayTab = 'SCANNER' | 'APPS';
export type SupportedApp = 'UPI_PHONEPE' | 'UPI_GPAY' | 'UPI_PAYTM' | 'UPI_GENERIC';

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

  // Tab State: 'SCANNER' (QR Code) | 'APPS' (Device Payment Apps)
  const [activeTab, setActiveTab] = useState<SelfPayTab>('SCANNER');
  const [selectedApp, setSelectedApp] = useState<SupportedApp>('UPI_PHONEPE');
  const [copied, setCopied] = useState(false);
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

  // Standard NPCI UPI URI string
  const merchantVpa = 'thoogudeepa@okicici';
  const merchantName = 'Thoogudeepa Donne Biryani';
  const transactionNote = `Table ${effectiveTable} Seat ${effectiveSeat} Bill`;
  const upiUri = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(
    merchantName
  )}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Supported UPI Payment Applications on Diner's Device
  const supportedApps = useMemo(() => [
    {
      id: 'UPI_PHONEPE' as const,
      name: 'PhonePe',
      subtitle: 'Instant UPI Transfer',
      uri: `phonepe://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      badge: 'RECOMMENDED',
      color: '#5f259f',
    },
    {
      id: 'UPI_GPAY' as const,
      name: 'Google Pay',
      subtitle: 'GPay Quick UPI',
      uri: `tez://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      badge: 'FAST',
      color: '#1a73e8',
    },
    {
      id: 'UPI_PAYTM' as const,
      name: 'Paytm UPI',
      subtitle: 'Paytm Wallet & Bank',
      uri: `paytmmp://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      badge: null,
      color: '#00b9f5',
    },
    {
      id: 'UPI_GENERIC' as const,
      name: 'Any Other UPI App',
      subtitle: 'BHIM, CRED, Navi & Banking Apps',
      uri: upiUri,
      badge: null,
      color: '#8A4228',
    },
  ], [grandTotal, effectiveTable, effectiveSeat, upiUri]);

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
    const finalMethod = activeTab === 'SCANNER' ? 'UPI_QR' : selectedApp;
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
      method: finalMethod as any,
      cashTendered: grandTotal,
      cashChange: 0,
      seatLabel: `Chair ${effectiveSeat}`,
      seatNumber: effectiveSeat,
      captainName: 'Self-Pay (Online)',
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

  // Dedicated Tab definitions: UPI / QR Pay and Cash Payment
  const paymentTabs = [
    { id: 'UPI' as const, label: 'UPI / QR Pay', icon: <QrCode className="h-4 w-4" /> },
    { id: 'CASH' as const, label: 'Cash Payment', icon: <Banknote className="h-4 w-4" /> },
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

        {/* PAYMENT OPTIONS: DYNAMIC ON-SCREEN SCANNER & DEVICE APPS */}
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
            Select Self-Pay Method
          </div>

          {/* Dedicated Tab Pills: Scanner QR Code vs Payment Apps */}
          <div
            className="flex rounded-2xl p-1 gap-1.5 border"
            style={{
              backgroundColor: currentTheme.colors.bgElevated,
              borderColor: currentTheme.colors.border,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('SCANNER')}
              style={
                activeTab === 'SCANNER'
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
              className="flex-1 py-2.5 rounded-xl text-center text-xs font-black transition flex items-center justify-center gap-2 border shadow-2xs active:scale-95 cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>On-Screen Scanner / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPS')}
              style={
                activeTab === 'APPS'
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
              className="flex-1 py-2.5 rounded-xl text-center text-xs font-black transition flex items-center justify-center gap-2 border shadow-2xs active:scale-95 cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
              <span>Device Payment Apps</span>
            </button>
          </div>

          {/* TAB 1: DYNAMIC ON-SCREEN QR SCANNER */}
          {activeTab === 'SCANNER' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
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
                    Scan QR with Any Device Camera or UPI App
                  </span>
                </div>

                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="NPCI UPI QR Code"
                    style={{ borderColor: currentTheme.colors.border }}
                    className="h-52 w-52 rounded-2xl border-2 p-2.5 bg-white shadow-sm"
                  />
                ) : (
                  <div
                    className="h-52 w-52 rounded-2xl bg-white border flex items-center justify-center"
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    <QrCode className="h-10 w-10" style={{ color: currentTheme.colors.buttonBg }} />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-full border"
                    style={{
                      backgroundColor: currentTheme.colors.bgSurface,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.textSecondary,
                    }}
                  >
                    UPI ID: {merchantVpa}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(merchantVpa);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy ID'}
                  </button>
                </div>
              </div>

              <div
                className="p-3 rounded-2xl border text-center text-xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <p className="text-[11px] font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  Once paid on any phone or scanner, tap <strong style={{ color: currentTheme.colors.textPrimary }}>Confirm QR Payment</strong> below.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DEVICE SUPPORTED PAYMENT APPS */}
          {activeTab === 'APPS' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div
                className="rounded-2xl border p-3.5 space-y-2.5 shadow-2xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="text-[11px] font-bold text-stone-600 px-1">
                  Tap to launch your preferred payment application:
                </div>

                <div className="space-y-2">
                  {supportedApps.map((app) => {
                    const isSelected = selectedApp === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApp(app.id);
                          if (typeof window !== 'undefined') {
                            window.location.href = app.uri;
                          }
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                        style={
                          isSelected
                            ? {
                                backgroundColor: currentTheme.colors.pillActiveBg,
                                borderColor: currentTheme.colors.pillActiveBorder,
                                color: currentTheme.colors.pillActiveFg,
                              }
                            : {
                                backgroundColor: currentTheme.colors.bgSurface,
                                borderColor: currentTheme.colors.border,
                                color: currentTheme.colors.textPrimary,
                              }
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-xs"
                            style={{ backgroundColor: app.color }}
                          >
                            {app.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-black flex items-center gap-1.5">
                              <span>{app.name}</span>
                              {app.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  {app.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-medium opacity-75">
                              {app.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span>Launch</span>
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="p-3 rounded-2xl border text-center text-xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <p className="text-[11px] font-medium" style={{ color: currentTheme.colors.textSecondary }}>
                  After paying in your app, return here and tap <strong style={{ color: currentTheme.colors.textPrimary }}>Confirm Payment</strong> below.
                </p>
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
          className="flex w-full items-center justify-between rounded-[20px] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] shadow-lg transition hover:brightness-105 disabled:opacity-75 cursor-pointer"
        >
          <span>
            {isProcessing
              ? 'Verifying Settlement...'
              : activeTab === 'SCANNER'
              ? `Confirm QR Payment (₹${grandTotal})`
              : `Confirm Payment via ${supportedApps.find((a) => a.id === selectedApp)?.name || 'UPI'} (₹${grandTotal})`}
          </span>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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
