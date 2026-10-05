'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
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
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen7PaymentGateway: React.FC = () => {
  const {
    setCurrentScreen,
    payment,
    setPaymentMethod,
    cart,
    tableNumber,
    seatNumber,
    venueName,
  } = useCustomer();

  const { waiterRecordsPayment } = useSharedBridge();

  // Tab State: 'UPI' | 'CASH' | 'CARD' — Clean single word & single icon
  const [activeTab, setActiveTab] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [cashTender, setCashTender] = useState<'EXACT' | '500' | '2000'>('EXACT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [appNotice, setAppNotice] = useState<string>('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Money Calculations
  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
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

  // 1. Instant Bulletproof QR Generation on Mount (Never stuck loading)
  useEffect(() => {
    let isMounted = true;

    // A. Generate client-side QR data URL immediately
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
        // Fallback to high-res API if canvas fails
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

  // App Intents for 1-Tap launch
  const upiAppOptions = [
    {
      id: 'gpay',
      name: 'Google Pay',
      scheme: `tez://upi/pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      badgeColor: 'border-blue-200 bg-blue-50/60 text-blue-900',
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      scheme: `phonepe://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      badgeColor: 'border-purple-200 bg-purple-50/60 text-purple-900',
    },
    {
      id: 'paytm',
      name: 'Paytm',
      scheme: `paytmmp://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      badgeColor: 'border-sky-200 bg-sky-50/60 text-sky-900',
    },
    {
      id: 'other',
      name: 'Other UPI / Cred',
      scheme: upiUri,
      badgeColor: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
    },
  ];

  // Handler for 1-Tap App launch
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
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(8);
        }, 700);
      } else {
        waiterRecordsPayment(effectiveTable, 'CARD', grandTotal);
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

  // Clean Tab definitions: Single proper icon + single word name (NO emojis, NO duplicates)
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
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Money Card: Total Amount Due — Clear & Non-Clumsy */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5B5049]/70 font-mono">
                Total Amount Due
              </div>
              <div className="mt-0.5 font-mono text-3xl font-black text-[#8A4228]">
                ₹{grandTotal}
              </div>
            </div>

            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-1.5 rounded-full border border-[#E8D5C3] bg-[#FAF8F5] px-3 py-1.5 text-[11px] font-bold text-[#8A4228] hover:bg-[#F3DFCC]/40 transition"
            >
              <Receipt className="h-3.5 w-3.5" />
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
                className="mt-3 pt-3 border-t border-dashed border-[#E8D5C3] space-y-1.5 text-xs text-[#5B5049]"
              >
                <div className="flex justify-between font-medium">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-medium text-[#5B5049]/80">
                  <span>GST (5% Total: 2.5% CGST + 2.5% SGST)</span>
                  <span className="font-mono">₹{tax}</span>
                </div>
                {payment.tipAmount > 0 && (
                  <div className="flex justify-between font-bold text-[#8A4228]">
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

        {/* PAYMENT TABS: ONE ICON & SINGLE WORD (UPI, Cash, Card) */}
        <div className="rounded-[28px] border-2 border-[#8A4228]/30 bg-white p-4 shadow-sm space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
            Select Payment Method
          </div>

          {/* Sliding Tab Segmented Switcher */}
          <div className="relative flex rounded-2xl bg-[#FAF8F5] p-1 border border-[#E8D5C3]">
            {paymentTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPaymentMethod(tab.id);
                  }}
                  className={`relative flex-1 py-2 text-center text-xs font-black transition flex items-center justify-center gap-2 z-10 ${
                    isActive ? 'text-[#8A4228]' : 'text-[#5B5049]/70 hover:text-[#5B5049]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="paymentTabHighlight"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs -z-10 border border-[#E8D5C3]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DYNAMIC UPI QR CODE & WORKING 1-TAP APPS */}
          {activeTab === 'UPI' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              {/* Dynamic QR Display */}
              <div className="rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] p-4 flex flex-col items-center text-center shadow-2xs">
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
                    className="h-48 w-48 rounded-2xl border-2 border-[#8A4228]/20 p-2 bg-white shadow-sm"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-2xl bg-white border border-[#E8D5C3] flex items-center justify-center">
                    <QrCode className="h-10 w-10 text-[#8A4228]" />
                  </div>
                )}

                <div className="mt-2 text-[10.5px] font-mono text-[#5B5049]/70">
                  Google Pay • PhonePe • Paytm • Cred • BHIM
                </div>
              </div>

              {/* Working 1-Tap App Deep Links */}
              <div>
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-[#5B5049]/70 font-mono">
                    Or Tap to Launch Installed App:
                  </span>
                  {selectedApp && (
                    <span className="text-[9.5px] font-bold text-[#8A4228] font-mono">
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
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-[11px] font-black transition ${
                        selectedApp === app.name
                          ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-xs'
                          : 'border-[#E8D5C3] bg-white text-[#5B5049] hover:bg-[#F3DFCC]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3.5 w-3.5 text-[#8A4228]" />
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

          {/* TAB 2: CASH TO FLOOR CAPTAIN */}
          {activeTab === 'CASH' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-200/80 text-amber-900">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950">Pay Cash to Floor Captain</h4>
                    <p className="text-[10px] font-medium text-amber-800">
                      Physical currency collection directly at Table {effectiveTable}
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-amber-200/80">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-mono mb-1.5">
                    Select Tender Note for Quick Change:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCashTender('EXACT')}
                      className={`rounded-xl border py-1.5 text-center text-[10.5px] font-black transition ${
                        cashTender === 'EXACT'
                          ? 'border-amber-700 bg-amber-200 text-amber-950 shadow-2xs'
                          : 'border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      Exact (₹{grandTotal})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashTender('500')}
                      className={`rounded-xl border py-1.5 text-center text-[10.5px] font-black transition ${
                        cashTender === '500'
                          ? 'border-amber-700 bg-amber-200 text-amber-950 shadow-2xs'
                          : 'border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      ₹500 Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashTender('2000')}
                      className={`rounded-xl border py-1.5 text-center text-[10.5px] font-black transition ${
                        cashTender === '2000'
                          ? 'border-amber-700 bg-amber-200 text-amber-950 shadow-2xs'
                          : 'border-amber-300 bg-white text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      ₹2000 Note
                    </button>
                  </div>

                  {cashTender !== 'EXACT' && (
                    <div className="mt-2 text-[10.5px] font-mono font-bold text-amber-900 bg-white/80 rounded-lg p-1.5 border border-amber-200">
                      Change needed: ₹{cashTender === '500' ? Math.max(0, 500 - grandTotal) : Math.max(0, 2000 - grandTotal)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white border border-[#E8D5C3] p-2.5 text-[11px] text-[#5B5049]">
                <BellRing className="h-4 w-4 text-[#8A4228] shrink-0" />
                <span>
                  Floor Captain will arrive at Table {effectiveTable} with your printed tax bill &amp; cash folio.
                </span>
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
              <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-200 text-purple-900">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-purple-950">Wireless Card Machine at Table</h4>
                    <p className="text-[10px] font-medium text-purple-800">
                      Captain will bring the portable POS terminal
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-purple-200/80 text-[10.5px] text-purple-900 font-medium space-y-1">
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
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F] disabled:opacity-75"
        >
          <span>
            {isProcessing
              ? 'Verifying Settlement...'
              : activeTab === 'UPI'
              ? `Pay ₹${grandTotal} via ${selectedApp || 'UPI'}`
              : activeTab === 'CASH'
              ? `Confirm Cash Payment (₹${grandTotal})`
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
