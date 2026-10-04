'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import {
  Receipt,
  Heart,
  Users,
  Check,
  ArrowRight,
  QrCode,
  Banknote,
  CreditCard,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  BellRing,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen6PaymentBreakdown: React.FC = () => {
  const {
    setCurrentScreen,
    cart,
    payment,
    updateTip,
    setSplitMode,
    setPaymentMethod,
    tableNumber,
    seatNumber,
    venueName,
    guestName,
  } = useCustomer();

  const { waiterRecordsPayment } = useSharedBridge();

  // Mode & Tabs State
  const [activeTab, setActiveTab] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [showItemized, setShowItemized] = useState(false);
  const [customTip, setCustomTip] = useState<string>('');
  const [splitPersons, setSplitPersons] = useState<number>(2);
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [cashTender, setCashTender] = useState<'EXACT' | '500' | '2000' | 'CUSTOM'>('EXACT');
  const [cashAlertSent, setCashAlertSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  // Dynamic UPI State
  const [orderId, setOrderId] = useState<string>('');
  const [upiData, setUpiData] = useState<{
    upiUri: string;
    qrDataUrl: string;
    paymentId: string;
    txnRef: string;
    appIntents: Record<string, string>;
  } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Financial Calculations
  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : payment.subtotal;
  const tax = Math.round(subtotal * 0.05); // 5% GST (2.5% CGST + 2.5% SGST)
  const discount = payment.discount || (payment.redeemPoints ? Math.min(50, subtotal + tax) : 0);
  const grandTotal = Math.max(0, subtotal + tax + payment.tipAmount - discount);
  const perPersonAmount = isSplitEnabled ? Math.ceil(grandTotal / splitPersons) : grandTotal;

  // Tip management
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

  // 1. Initialize Dynamic UPI Payment on Mount
  useEffect(() => {
    let isMounted = true;
    async function initPayment() {
      try {
        const generatedOrderId = `ORD-${effectiveTable.replace(/[^a-zA-Z0-9]/g, '')}-S${effectiveSeat}-${Date.now().toString().slice(-6)}`;
        if (isMounted) setOrderId(generatedOrderId);

        const initRes = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: generatedOrderId,
            tableNumber: effectiveTable,
            seatNumber: effectiveSeat,
            amount: grandTotal,
            paymentMethod: activeTab,
          }),
        });

        const initJson = await initRes.json();
        if (initJson.success && isMounted) {
          setUpiData({
            upiUri: initJson.upiUri,
            qrDataUrl: initJson.qrDataUrl,
            paymentId: initJson.paymentId,
            txnRef: initJson.txnRef,
            appIntents: initJson.appIntents || {},
          });
        }
      } catch (err) {
        console.warn('Payment init fallback:', err);
      }
    }

    initPayment();
    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [effectiveTable, effectiveSeat, grandTotal, activeTab]);

  // 2. Poll for payment status in background (Zero-Typing Webhook listener)
  useEffect(() => {
    if (!orderId || activeTab !== 'UPI') return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/verify?orderId=${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'CONFIRMED' || data.settled) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            waiterRecordsPayment(effectiveTable, 'UPI', grandTotal);
            setCurrentScreen(7);
          }
        }
      } catch {
        // Silent polling continue
      }
    }, 2800);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId, activeTab, effectiveTable, grandTotal, waiterRecordsPayment, setCurrentScreen]);

  const defaultUpiUri =
    upiData?.upiUri ||
    `upi://pay?pa=thoogudeepa@okicici&pn=Thoogudeepa%20Donne%20Biryani&am=${grandTotal}&cu=INR&tn=Table_${effectiveTable}`;

  // Execute Payment or Cash Request
  const handleProceedPayment = async () => {
    setIsProcessing(true);
    setPaymentMethod(activeTab);

    try {
      if (activeTab === 'UPI') {
        // Trigger verification route
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            tableNumber: effectiveTable,
            seatNumber: effectiveSeat,
            amount: grandTotal,
            paymentMethod: 'UPI',
            paymentId: upiData?.paymentId,
          }),
        }).catch(() => {});

        waiterRecordsPayment(effectiveTable, 'UPI', grandTotal);
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(7);
        }, 800);
      } else if (activeTab === 'CASH') {
        waiterRecordsPayment(effectiveTable, 'CASH', grandTotal);
        setCashAlertSent(true);
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(7);
        }, 1000);
      } else {
        // Card POS at table
        waiterRecordsPayment(effectiveTable, 'CARD', grandTotal);
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentScreen(7);
        }, 800);
      }
    } catch {
      setIsProcessing(false);
      setCurrentScreen(7);
    }
  };

  return (
    <ScreenHousing screenNumber={6} screenTitle="CHECKOUT & SMART PAYMENT">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Payment &amp; Checkout</span>
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
        {/* Total Due Banner with Expandable Item Breakdown */}
        <div className="rounded-[28px] border border-[#E8D5C3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-[#5B5049]/70 font-mono">
                Total Payable Amount
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl font-black text-[#8A4228]">₹{grandTotal}</span>
                {isSplitEnabled && (
                  <span className="text-xs font-black text-emerald-800 font-mono">
                    (₹{perPersonAmount}/diner)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowItemized(!showItemized)}
              className="flex items-center gap-1.5 rounded-full border border-[#E8D5C3] bg-[#FAF8F5] px-3 py-1.5 text-[11px] font-bold text-[#8A4228] hover:bg-[#F3DFCC]/40 transition"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>{showItemized ? 'Hide Details' : 'View Bill Details'}</span>
              {showItemized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {/* Collapsible Itemized Receipt */}
          <AnimatePresence>
            {showItemized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-dashed border-[#E8D5C3] space-y-2 text-xs"
              >
                <div className="space-y-1.5">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.cartItemId} className="flex items-center justify-between text-[#5B5049]">
                        <span className="font-semibold">
                          {item.menuItem.name} × {item.quantity}
                        </span>
                        <span className="font-mono font-black">₹{item.totalPrice}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#5B5049]/70 py-1">No items in session cart</div>
                  )}
                </div>

                <div className="border-t border-[#E8D5C3]/60 pt-2 space-y-1 text-[#5B5049]/80 font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Tip & Split Bill Expanders */}
          <div className="mt-3 pt-3 border-t border-[#E8D5C3]/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-[#8A4228]" />
              <span className="font-bold text-[#5B5049]">Staff Tip:</span>
              <span className="font-mono font-black text-[#8A4228]">
                {payment.tipAmount > 0 ? `₹${payment.tipAmount}` : 'None'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSplitEnabled(!isSplitEnabled)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition border ${
                  isSplitEnabled
                    ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228]'
                    : 'border-[#E8D5C3] bg-[#FAF8F5] text-[#5B5049] hover:bg-[#F3DFCC]/30'
                }`}
              >
                <Users className="h-3 w-3" />
                <span>{isSplitEnabled ? `Split: ${splitPersons} Diners` : 'Split Bill'}</span>
              </button>
            </div>
          </div>

          {/* Tip Presets Row */}
          <div className="mt-2.5 flex items-center gap-1.5">
            {tipPresets.map((amt) => {
              const isSelected = payment.tipAmount === amt && !customTip;
              return (
                <button
                  key={amt}
                  onClick={() => handlePresetTip(amt)}
                  className={`flex-1 rounded-xl border py-1.5 text-center text-[11px] font-black font-mono transition ${
                    isSelected
                      ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228] shadow-2xs'
                      : 'border-[#E8D5C3] bg-white text-[#5B5049] hover:bg-[#F3DFCC]/30'
                  }`}
                >
                  +₹{amt}
                </button>
              );
            })}
            <button
              onClick={() => handlePresetTip(0)}
              className={`rounded-xl border px-3 py-1.5 text-center text-[10.5px] font-black transition ${
                payment.tipAmount === 0 && !customTip
                  ? 'border-[#8A4228] bg-[#F3DFCC] text-[#8A4228]'
                  : 'border-[#E8D5C3] bg-white text-[#5B5049] hover:bg-[#F3DFCC]/30'
              }`}
            >
              None
            </button>
          </div>

          {/* Split Bill Controls (When active) */}
          {isSplitEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-2.5 border-t border-dashed border-[#E8D5C3] flex items-center justify-between"
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5B5049]/70 font-mono">
                Split Among Diners:
              </span>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => {
                      setSplitPersons(cnt);
                      setSplitMode('PERSONS', cnt);
                    }}
                    className={`h-7 w-7 rounded-xl border text-[11px] font-black font-mono transition ${
                      splitPersons === cnt
                        ? 'border-[#8A4228] bg-[#8A4228] text-white shadow-2xs'
                        : 'border-[#E8D5C3] bg-white text-[#5B5049] hover:bg-[#F3DFCC]/30'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ULTRA PRO MAX INTERACTIVE TAB SWAPPER: QR CODE <-> CASH <-> CARD */}
        <div className="rounded-[28px] border-2 border-[#8A4228]/30 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5B5049]/70 font-mono">
              Select Payment Method
            </span>
            <span className="flex items-center gap-1 text-[9.5px] font-black text-emerald-800 font-mono">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>0% Surcharge • Direct</span>
            </span>
          </div>

          {/* Sliding Tab Segmented Switcher */}
          <div className="relative flex rounded-2xl bg-[#FAF8F5] p-1 border border-[#E8D5C3]">
            {[
              { id: 'UPI' as const, label: '⚡ UPI / QR', icon: <QrCode className="h-3.5 w-3.5" /> },
              { id: 'CASH' as const, label: '💵 Pay Cash', icon: <Banknote className="h-3.5 w-3.5" /> },
              { id: 'CARD' as const, label: '💳 Card at Table', icon: <CreditCard className="h-3.5 w-3.5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPaymentMethod(tab.id);
                  }}
                  className={`relative flex-1 py-2 text-center text-xs font-black transition flex items-center justify-center gap-1.5 z-10 ${
                    isActive ? 'text-[#8A4228]' : 'text-[#5B5049]/70 hover:text-[#5B5049]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activePaymentTabPill"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs -z-10 border border-[#E8D5C3]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DYNAMIC UPI QR & 1-TAP APPS */}
          {activeTab === 'UPI' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {/* Dynamic QR Card */}
              <div className="rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] p-3.5 flex flex-col items-center text-center shadow-2xs">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-800 font-mono uppercase tracking-wider">
                    NPCI Live Radar • Auto-Detecting Settlement
                  </span>
                </div>

                {upiData?.qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={upiData.qrDataUrl}
                    alt="Dynamic NPCI UPI QR"
                    onClick={() => setQrExpanded(!qrExpanded)}
                    className="h-44 w-44 rounded-2xl border-2 border-[#8A4228]/20 p-1.5 bg-white shadow-sm cursor-pointer hover:scale-102 transition"
                  />
                ) : (
                  <div className="h-44 w-44 rounded-2xl bg-[#F3DFCC]/30 border border-[#E8D5C3] flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[#8A4228]" />
                  </div>
                )}

                <div className="mt-2 text-[10.5px] font-mono text-[#5B5049]/70">
                  Scan with GPay, PhonePe, Paytm, Cred, or BHIM
                </div>
              </div>

              {/* 1-Tap UPI App Launch Buttons */}
              <div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[#5B5049]/60 font-mono px-1">
                  Or One-Tap Launch Installed App:
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <a
                    href={upiData?.appIntents?.gpay || defaultUpiUri}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E8D5C3] bg-white py-2 px-3 text-[11px] font-bold text-[#5B5049] hover:bg-[#F3DFCC]/30 transition shadow-2xs"
                  >
                    <span>Google Pay</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <a
                    href={upiData?.appIntents?.phonepe || defaultUpiUri}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E8D5C3] bg-white py-2 px-3 text-[11px] font-bold text-[#5B5049] hover:bg-[#F3DFCC]/30 transition shadow-2xs"
                  >
                    <span>PhonePe</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <a
                    href={upiData?.appIntents?.paytm || defaultUpiUri}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E8D5C3] bg-white py-2 px-3 text-[11px] font-bold text-[#5B5049] hover:bg-[#F3DFCC]/30 transition shadow-2xs"
                  >
                    <span>Paytm</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <a
                    href={upiData?.appIntents?.generic || defaultUpiUri}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E8D5C3] bg-white py-2 px-3 text-[11px] font-bold text-[#5B5049] hover:bg-[#F3DFCC]/30 transition shadow-2xs"
                  >
                    <span>Other UPI App</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: CASH AT TABLE / COUNTER */}
          {activeTab === 'CASH' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
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
                    Select Tender Note For Quick Change:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
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
                  Confirming cash will dispatch Floor Captain with a printed tax bill &amp; cash change pouch.
                </span>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CARD AT TABLE */}
          {activeTab === 'CARD' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
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
                      Captain brings portable Pine Labs / MSwipe terminal
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-purple-200/80 text-[10.5px] text-purple-900 font-medium space-y-1">
                  <div>• Accepted: Visa, Mastercard, RuPay, Amex, Corporate Cards</div>
                  <div>• Supports Tap &amp; Pay (NFC contactless up to ₹5,000)</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar with One-Tap Dynamic Action */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleProceedPayment}
          disabled={isProcessing}
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F] disabled:opacity-75"
        >
          <span>
            {isProcessing
              ? 'Settling Bill...'
              : activeTab === 'UPI'
              ? `Pay ₹${grandTotal} via UPI`
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
