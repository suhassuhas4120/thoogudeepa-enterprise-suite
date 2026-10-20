'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge, SettledBillSnapshot } from '../../store/useSharedBridge';
import { useCustomerStore } from '../../store/useCustomerStore';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
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

  const { waiterRecordsPayment, settledBills, recordSettledBill, waiterClearsChairAfterPayment, waiterClearsSettlementSession, tables, kdsTickets } = useSharedBridge();

  // Tab State: 'UPI' | 'CASH'
  type PaymentTab = 'UPI' | 'CASH';
  const [activeTab, setActiveTab] = useState<PaymentTab>('UPI');
  const [showSummary, setShowSummary] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Auto-transition to Screen 8 only if waiter just settled this specific chair right now
  useEffect(() => {
    if (!settledBills) return;
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
      if (seatNum === undefined || seatNum === effectiveSeat) {
        matchingSnapshot = b;
      }
    } else if (settledBills[normTable]) {
      const b = settledBills[normTable];
      const seatNum = typeof b.seatNumber === 'number'
        ? b.seatNumber
        : (b.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(b.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
      if (seatNum === undefined || seatNum === effectiveSeat) {
        matchingSnapshot = b;
      }
    }

    if (matchingSnapshot && matchingSnapshot.timestamp) {
      const now = Date.now();
      const isRecent = Math.abs(now - matchingSnapshot.timestamp) < 1800000;
      const effectiveOrderTime = orderPlacedAt && orderPlacedAt > 0 ? orderPlacedAt : 0;
      const isAfterOrder = effectiveOrderTime > 0 ? matchingSnapshot.timestamp >= effectiveOrderTime - 5000 : isRecent;
      if (isRecent && isAfterOrder) {
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

  // Resolved chair items for breakdown & final settlement
  const chairCart = useMemo(() => {
    return (cart || []).filter((ci) => ci.seatNumber === effectiveSeat || (!ci.seatNumber && effectiveSeat === 1));
  }, [cart, effectiveSeat]);

  const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
  const currentTbl = tables.find((t) => cleanNum(t.number) === cleanNum(effectiveTable));

  const chairResolvedItems = useMemo(() => {
    if (chairCart.length > 0) {
      return chairCart.map((ci) => ({
        id: ci.cartItemId,
        name: ci.menuItem.name,
        quantity: ci.quantity,
        price: ci.totalPrice / (ci.quantity || 1),
        totalPrice: ci.totalPrice,
        seatNumber: ci.seatNumber || effectiveSeat,
      }));
    }
    const myTickets = (kdsTickets || []).filter(
      (tk) => cleanNum(tk.tableNumber) === cleanNum(effectiveTable) &&
              tk.status !== 'COMPLETED' &&
              (tk.seatNumber === effectiveSeat || tk.items.some((i) => i.seatNumber === effectiveSeat))
    );
    if (myTickets.length > 0) {
      const items = myTickets.flatMap((tk) =>
        tk.items
          .filter((it) => it.seatNumber === effectiveSeat || (!it.seatNumber && tk.seatNumber === effectiveSeat))
          .map((it) => {
            const catalogItem = INITIAL_MENU_ITEMS.find((m: any) => m.id === it.id || m.name?.toLowerCase() === it.name?.toLowerCase());
            const verifiedPrice = it.price || (it as any).unitPrice || catalogItem?.price || 0;
            return {
              id: it.id,
              name: it.name,
              quantity: it.quantity,
              price: verifiedPrice,
              totalPrice: verifiedPrice * it.quantity,
              seatNumber: effectiveSeat,
            };
          })
      );
      if (items.length > 0) return items;
    }
    if (currentTbl?.activeItems && currentTbl.activeItems.length > 0) {
      const chairTableItems = currentTbl.activeItems.filter(
        (it: any) => it.seatNumber === effectiveSeat || (!it.seatNumber && effectiveSeat === 1)
      );
      if (chairTableItems.length > 0) {
        return chairTableItems.map((it: any) => {
          const catalogItem = INITIAL_MENU_ITEMS.find((m: any) => m.id === it.id || m.name?.toLowerCase() === it.name?.toLowerCase());
          const verifiedPrice = it.price || (it as any).unitPrice || catalogItem?.price || 0;
          return {
            id: it.id || `active-${it.name}`,
            name: it.name,
            quantity: it.quantity || 1,
            price: verifiedPrice,
            totalPrice: verifiedPrice * (it.quantity || 1),
            seatNumber: effectiveSeat,
          };
        });
      }
    }
    return [];
  }, [chairCart, kdsTickets, currentTbl, effectiveTable, effectiveSeat]);

  // Money Calculations
  const subtotal = chairResolvedItems.length > 0
    ? chairResolvedItems.reduce((s, i) => s + i.totalPrice, 0)
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
    const finalItems = chairResolvedItems.length > 0
      ? chairResolvedItems
      : [
          {
            id: `item-${Date.now()}`,
            name: `${effectiveTable} Chair ${effectiveSeat} Food Service`,
            quantity: 1,
            price: subtotal,
            totalPrice: subtotal,
            seatNumber: effectiveSeat,
          },
        ];

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
      cashTendered: finalMethod === 'CASH' ? selectedTender.amount : grandTotal,
      cashChange: finalMethod === 'CASH' ? selectedTender.change : 0,
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
      waiterClearsSettlementSession(effectiveTable, effectiveSeat);
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

          {/* TAB 0: DYNAMIC UPI QR CODE (Takes care of all UPI payments) */}
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
                  className="mt-2 text-[10.5px] font-mono font-bold"
                  style={{ color: currentTheme.colors.textMuted }}
                >
                  Google Pay • PhonePe • Paytm • CRED • BHIM
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
                  After completing payment in your UPI app, tap <strong style={{ color: currentTheme.colors.textPrimary }}>Confirm UPI Payment</strong> below.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 1: CASH PAYMENT AT TABLE */}
          {activeTab === 'CASH' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-3"
            >
              <div
                className="rounded-2xl border p-4 space-y-3.5 shadow-2xs"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div
                  className="flex items-center justify-between border-b pb-3"
                  style={{ borderColor: currentTheme.colors.borderLight }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span
                      className="text-[10px] font-black font-mono tracking-wider uppercase"
                      style={{ color: currentTheme.colors.buttonBg }}
                    >
                      Cash Settlement at Table
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
                    style={{
                      backgroundColor: currentTheme.colors.secondaryBg,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.textPrimary,
                    }}
                  >
                    {effectiveTable} • Chair C-{String(effectiveSeat).padStart(2, '0')}
                  </span>
                </div>

                {/* Tender Note Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold" style={{ color: currentTheme.colors.textPrimary }}>
                      Select Note (Optional)
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: currentTheme.colors.textMuted }}>
                      To calculate change
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {tenderOptions.map((opt) => {
                      const isSelected = selectedTender.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedTender(opt)}
                          className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold border transition shadow-2xs active:scale-95 cursor-pointer"
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
                          <span className="font-mono">{opt.label}</span>
                          {opt.change > 0 ? (
                            <span className="text-[10px] font-mono font-medium opacity-80">
                              +₹{opt.change}
                            </span>
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTender.change > 0 && (
                    <div
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold border"
                      style={{
                        backgroundColor: currentTheme.colors.secondaryBg,
                        borderColor: currentTheme.colors.borderLight,
                        color: currentTheme.colors.secondaryFg,
                      }}
                    >
                      <span>Change to Receive:</span>
                      <span className="font-mono font-black text-sm">₹{selectedTender.change}</span>
                    </div>
                  )}
                </div>

                <div
                  className="pt-2 border-t text-[11px] font-medium text-center"
                  style={{
                    borderColor: currentTheme.colors.borderLight,
                    color: currentTheme.colors.textSecondary,
                  }}
                >
                  Hand ₹{selectedTender.amount} cash directly to the Floor Captain when they arrive at your chair.
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
          className="flex w-full items-center justify-between rounded-[20px] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] shadow-lg transition hover:brightness-105 disabled:opacity-75 cursor-pointer"
        >
          <span>
            {isProcessing
              ? 'Verifying Settlement...'
              : activeTab === 'UPI'
              ? `Confirm UPI Payment (₹${grandTotal})`
              : `Confirm Cash Payment (₹${grandTotal})`}
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
