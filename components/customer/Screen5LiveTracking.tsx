'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useOrderTrackingQuery } from '../../hooks/useOrderTrackingQuery';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { OrderStage } from '../../types/customer';
import {
  Check,
  Clock,
  Plus,
  ArrowRight,
  Wifi,
  ClipboardList,
  Flame,
  UtensilsCrossed,
  CheckCheck,
  CookingPot,
  CreditCard,
  Bell,
  CheckCircle2,
  QrCode,
  Banknote,
  X,
  Scan,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore } from '../../store/useCustomerStore';

// SVG brand icons for UPI payment providers
const GooglePayLogo: React.FC = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.5-5.2 3.5-9z" fill="#4285F4"/>
    <path d="M12 24c3.2 0 6-1.1 8-3l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.2C3.2 21.3 7.3 24 12 24z" fill="#34A853"/>
    <path d="M5.3 14.1c-.2-.7-.4-1.5-.4-2.1s.2-1.4.4-2.1V6.7H1.2C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3l4.1-3.2z" fill="#FBBC05"/>
    <path d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.7l4.1 3.2c.9-2.9 3.6-5.1 6.7-5.1z" fill="#EA4335"/>
  </svg>
);

const PhonePeLogo: React.FC = () => (
  <div className="w-5 h-5 rounded-full bg-[#5F259F] flex items-center justify-center font-bold text-white text-[11px] shadow-2xs shrink-0">
    <span>पे</span>
  </div>
);

const PaytmLogo: React.FC = () => (
  <div className="w-5 h-5 rounded bg-[#002E6E] flex items-center justify-center font-black text-white text-[7px] tracking-tight px-0.5 shrink-0">
    <span className="text-[#00BAF2]">Pay</span>tm
  </div>
);

const BhimLogo: React.FC = () => (
  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#00843D] to-[#F26522] flex items-center justify-center font-black text-white text-[7px] tracking-wider shadow-2xs shrink-0">
    BHIM
  </div>
);

const CredLogo: React.FC = () => (
  <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center border border-white/20 shadow-2xs shrink-0">
    <span className="font-serif font-black text-white text-[9px] tracking-tighter">CR</span>
  </div>
);

const UPI_APPS = [
  { name: 'PhonePe', shortName: 'PhonePe', logo: <PhonePeLogo /> },
  { name: 'GPay', shortName: 'GPay', logo: <GooglePayLogo /> },
  { name: 'Paytm', shortName: 'Paytm', logo: <PaytmLogo /> },
  { name: 'BHIM', shortName: 'BHIM', logo: <BhimLogo /> },
  { name: 'CRED', shortName: 'CRED', logo: <CredLogo /> },
];

const DISH_STAGES = [
  { key: 'PLACED', label: 'Placed', icon: ClipboardList },
  { key: 'RECEIVED', label: 'Received', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparing', icon: Flame },
  { key: 'READY', label: 'Ready', icon: UtensilsCrossed },
];

export const Screen5LiveTracking: React.FC = () => {
  const { currentTheme } = useCustomerTheme();
  const {
    setCurrentScreen,
    orderStage,
    setOrderStage,
    venueName,
    tableNumber,
    seatNumber,
    cart,
    pingWaiter,
    waiterNotification,
  } = useCustomer();

  const {
    kdsTickets: bridgeTickets,
    settledBills,
    activeSettlementSessions,
    pings,
    tables,
  } = useSharedBridge();

  const { tickets: supabaseTickets } = useOrderTrackingQuery();

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

  // Local state for payment workflow
  const [showPayViaWaiterModal, setShowPayViaWaiterModal] = useState(false);
  const [isWaitingForCaptain, setIsWaitingForCaptain] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PhonePe' | 'GPay' | 'Paytm' | 'BHIM' | 'CRED' | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Normalized matching for table ID to handle T-01, TABLE 01, 01 reliably
  const isTableMatch = (a?: string, b?: string) => {
    if (!a || !b) return false;
    const normA = a.toUpperCase().replace(/\s+/g, '').replace('TABLE', '').replace('T-', '');
    const normB = b.toUpperCase().replace(/\s+/g, '').replace('TABLE', '').replace('T-', '');
    return normA === normB || (parseInt(normA, 10) > 0 && parseInt(normA, 10) === parseInt(normB, 10));
  };

  const getCleanName = (name: string) => {
    return name
      .replace(/\s*\[Seat \d+\]/gi, '')
      .replace(/\s*\[Table [^\]]+\]/gi, '')
      .replace(/[\[\]()]/g, '')
      .trim();
  };

  const getCanonicalKey = (name: string) => {
    return getCleanName(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const isVegItem = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('dessert') || lower.includes('paneer') || lower.includes('veg') || lower.includes('salad');
  };

  // Normalized table key for bridge lookups
  const normTable = `T-${String(parseInt(effectiveTable.replace(/[^0-9]/g, ''), 10) || 1).padStart(2, '0')}`;
  const chairKey = `${normTable}-CHAIR-${effectiveSeat}`;
  const currentTbl = tables.find((t) => isTableMatch(t.number, effectiveTable));

  // Check if floor captain has arrived and initiated settlement for this chair or table
  const activeSession = useMemo(() => {
    const sessions = activeSettlementSessions || {};
    const now = Date.now();
    const isValid = (sess: any) => sess && (!sess.initiatedAt || Math.abs(now - sess.initiatedAt) < 1800000);

    if (isValid(sessions[chairKey])) return sessions[chairKey];
    if (isValid(sessions[normTable])) return sessions[normTable];
    for (const [, sess] of Object.entries(sessions)) {
      if (!isValid(sess)) continue;
      if (isTableMatch(sess.tableNumber, effectiveTable)) {
        if (!sess.seatNumber || Number(sess.seatNumber) === effectiveSeat) {
          return sess;
        }
      }
    }
    return null;
  }, [activeSettlementSessions, chairKey, normTable, effectiveTable, effectiveSeat]);

  const isCaptainArrived = Boolean(activeSession);

  // Check if waiter was called for payment
  const hasActivePaymentPing = useMemo(() => {
    return pings.some(
      (p) =>
        isTableMatch(p.tableNumber, effectiveTable) &&
        p.type === 'PAYMENT' &&
        p.status === 'PENDING' &&
        (!p.seatNumber || p.seatNumber === effectiveSeat)
    );
  }, [pings, effectiveTable, effectiveSeat]);

  const isSummoned = isWaitingForCaptain || hasActivePaymentPing || (waiterNotification?.active && waiterNotification.type === 'PAYMENT');

  // Unified items list with live stage resolved across Bridge, Supabase, and local Cart
  const trackedDishes = useMemo(() => {
    const myBridgeTickets = bridgeTickets.filter((tk) => isTableMatch(tk.tableNumber, effectiveTable));
    const bridgeItems = myBridgeTickets.flatMap((tk) =>
      tk.items.map((it) => ({
        id: it.id,
        ticketId: tk.id,
        name: getCleanName(it.name),
        quantity: it.quantity,
        stage: it.stage as OrderStage,
        prepMode: it.prepMode,
        options: it.options,
        addOns: it.addOns,
        notes: it.notes,
        seatNumber: it.seatNumber || tk.seatNumber,
      }))
    );

    const mySupabaseTickets = supabaseTickets.filter((tk) => isTableMatch(tk.tableId, effectiveTable));
    const supabaseItems = mySupabaseTickets.flatMap((tk) =>
      tk.items.map((it) => ({
        id: it.id,
        ticketId: tk.id,
        name: getCleanName(it.name),
        quantity: it.quantity,
        stage: it.stage as OrderStage,
        prepMode: '',
        options: '',
        addOns: [] as string[],
        notes: it.notes,
        seatNumber: effectiveSeat,
      }))
    );

    const orderedCart = (cart || []).filter((ci) => ci && ci.isOrdered);

    if (orderedCart.length > 0) {
      return orderedCart.map((ci) => {
        const dishName = ci.menuItem?.name || (ci as any)?.name || 'Special Dish';
        const key = getCanonicalKey(dishName);
        const bridgeMatch =
          bridgeItems.find((bi) => bi && getCanonicalKey(bi.name) === key && bi.seatNumber === (ci.seatNumber || effectiveSeat)) ||
          bridgeItems.find((bi) => bi && getCanonicalKey(bi.name) === key);
        const supabaseMatch = supabaseItems.find((si) => si && getCanonicalKey(si.name) === key);

        // Check if table active item is marked Served
        const tableActiveItem = currentTbl?.activeItems?.find(
          (ai) => ai && getCanonicalKey(ai.name) === key && (!ai.seatNumber || ai.seatNumber === effectiveSeat)
        );
        const tableStage: OrderStage | undefined =
          tableActiveItem?.status === 'Served' ? 'SERVED' : undefined;

        const liveStage: OrderStage =
          tableStage ||
          bridgeMatch?.stage ||
          supabaseMatch?.stage ||
          'PLACED';

        return {
          id: bridgeMatch?.id || `cart-${ci.cartItemId || Math.random()}`,
          cartItemId: ci.cartItemId,
          ticketId: bridgeMatch?.ticketId,
          name: dishName,
          quantity: ci.quantity || 1,
          stage: liveStage,
          prepMode: ci.prepMode || ci.menuItem?.prepMode || 'Military Dum Handi',
          options: ci.selectedOption,
          addOns: ci.selectedAddOns || [],
          notes: '',
          seatNumber: ci.seatNumber || effectiveSeat,
        };
      });
    }

    if (bridgeItems.length > 0) {
      return bridgeItems.map((bi) => ({
        ...bi,
        cartItemId: undefined,
      }));
    }

    if (supabaseItems.length > 0) {
      return supabaseItems.map((si) => ({
        ...si,
        cartItemId: undefined,
        prepMode: undefined,
        options: undefined,
        addOns: undefined,
      }));
    }

    return [];
  }, [bridgeTickets, effectiveTable, supabaseTickets, cart, effectiveSeat, currentTbl]);

  // Strict check: all orders must be SERVED to enable calling captain to pay
  const allDishesServed = useMemo(() => {
    if (!trackedDishes.length) return false;
    return trackedDishes.every((d) => {
      if (d.stage === 'SERVED') return true;
      const matched = currentTbl?.activeItems?.find(
        (ai) => getCanonicalKey(ai.name) === getCanonicalKey(d.name) && (!ai.seatNumber || ai.seatNumber === effectiveSeat)
      );
      return matched?.status === 'Served';
    });
  }, [trackedDishes, currentTbl, effectiveSeat]);

  // Auto-transition to Screen 8 immediately when waiter confirms payment
  const matchingSnapshot = useMemo(() => {
    const bills = settledBills || {};
    if (bills[chairKey]) return bills[chairKey];
    if (bills[normTable]) {
      const b = bills[normTable];
      if (b.seatNumber === undefined || b.seatNumber === null || b.seatNumber === effectiveSeat) {
        return b;
      }
    }
    for (const [key, bill] of Object.entries(bills)) {
      if (!bill) continue;
      if (isTableMatch(bill.tableName, effectiveTable)) {
        if (typeof bill.seatNumber === 'number') {
          if (bill.seatNumber === effectiveSeat) return bill;
        } else {
          const seatMatch = bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
          if (seatMatch) {
            if (Number(seatMatch[1]) === effectiveSeat) return bill;
          } else {
            return bill;
          }
        }
      }
    }
    return null;
  }, [settledBills, chairKey, normTable, effectiveTable, effectiveSeat]);

  useEffect(() => {
    if (matchingSnapshot) {
      const now = Date.now();
      if (!matchingSnapshot.timestamp || Math.abs(now - matchingSnapshot.timestamp) < 1800000) {
        setIsScannerOpen(false);
        useCustomerStore.getState().handleBillSettledByWaiter(matchingSnapshot);
      }
    }
  }, [matchingSnapshot]);

  // Dedicated high-priority 1-second polling loop to guarantee instantaneous synchronization
  // when customer is waiting for captain or settlement
  useEffect(() => {
    let isCancelled = false;
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/settlement/session', { cache: 'no-store' });
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data?.sessions || data?.settledBills) {
            useSharedBridge.setState((prev) => ({
              activeSettlementSessions: data.sessions || {},
              settledBills: {
                ...(prev.settledBills || {}),
                ...(data.settledBills || {}),
              },
            }));
          }
        }
      } catch {}
    };

    fetchSession();
    const interval = setInterval(fetchSession, 1000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Total payable amount
  const currentBillAmount = useMemo(() => {
    if (activeSession?.grandTotal && activeSession.grandTotal > 0) {
      return activeSession.grandTotal;
    }
    const currentTableObj = tables.find((t) => isTableMatch(t.number, effectiveTable));
    if (currentTableObj?.currentBill && currentTableObj.currentBill > 0) {
      const myChairItems = (currentTableObj.activeItems || []).filter((ai) => ai.seatNumber === effectiveSeat);
      if (myChairItems.length > 0) {
        const chairSub = myChairItems.reduce((sum, it) => sum + (it.price || 220) * it.quantity, 0);
        return Math.round(chairSub * 1.05);
      }
      return currentTableObj.currentBill;
    }
    const cartSub = cart.reduce((sum, it) => sum + it.totalPrice, 0);
    return Math.round(cartSub * 1.05);
  }, [activeSession, tables, effectiveTable, effectiveSeat, cart]);

  // Setup camera stream when QR scanner opens
  useEffect(() => {
    if (!isScannerOpen) return;
    let stream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera fallback to scanner HUD
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScannerOpen]);

  const getDishStageIdx = (stage: OrderStage, dishName?: string): number => {
    if (stage === 'SERVED') return 4;
    // Check if table activeItems says Served
    if (dishName && currentTbl?.activeItems) {
      const matched = currentTbl.activeItems.find(
        (ai) => getCanonicalKey(ai.name) === getCanonicalKey(dishName) && (!ai.seatNumber || ai.seatNumber === effectiveSeat)
      );
      if (matched?.status === 'Served') return 4;
    }
    if (stage === 'PLATED') return 3;
    if (stage === 'PREP') return 2;
    if (stage === 'RECEIVED') return 1;
    return 0; // PLACED
  };

  const handleConfirmCallCaptain = () => {
    setShowPayViaWaiterModal(false);
    setIsWaitingForCaptain(true);
    pingWaiter('PAYMENT', `Customer requested bill settlement at Table ${effectiveTable} (Chair ${effectiveSeat})`);
  };

  return (
    <ScreenHousing screenNumber={5} screenTitle="LIVE ORDER TRACKING">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Live Order Tracking</span>
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
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 pb-36 space-y-4" style={{ backgroundColor: currentTheme.colors.bgApp }}>
        {/* Table Connection Status Bar */}
        <div
          className="flex items-center justify-between rounded-2xl border p-3 shadow-2xs"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.buttonBg,
              }}
            >
              <CookingPot className="h-4 w-4" />
            </div>
            <div>
              <div
                className="text-[11px] font-black"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                {effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`} • C-{String(effectiveSeat).padStart(2, '0')}
              </div>
              <div
                className="text-[9.5px] font-bold font-mono"
                style={{ color: currentTheme.colors.buttonBg }}
              >
                {trackedDishes.length} {trackedDishes.length === 1 ? 'Dish' : 'Dishes'} in Active Preparation
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[9.5px] font-black text-emerald-800 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <Wifi className="h-3 w-3 text-emerald-600" />
            <span>Kitchen Linked</span>
          </span>
        </div>

        {/* Particular Dish Status Section (Overall Kitchen Status Removed as Requested) */}
        <div
          className="rounded-3xl border p-4 shadow-xs space-y-3"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-[9.5px] font-black uppercase tracking-[0.2em] font-mono"
              style={{ color: currentTheme.colors.textMuted }}
            >
              Particular Dish Status
            </div>
            <span className="text-[10px] font-bold font-mono" style={{ color: currentTheme.colors.buttonBg }}>
              Live Dish Tracking
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {trackedDishes.length > 0 ? (
                trackedDishes.map((it) => {
                  const isVeg = isVegItem(it.name);
                  const dishCurrentIdx = getDishStageIdx(it.stage, it.name);
                  const isDishServed = dishCurrentIdx === 4;

                  return (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border p-3.5 shadow-2xs space-y-3"
                      style={{
                        backgroundColor: currentTheme.colors.bgSurface,
                        borderColor: currentTheme.colors.borderLight,
                      }}
                    >
                      {/* Dish Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {/* FSSAI Veg / Non-Veg Icon */}
                          <div
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs border p-0.5 mt-0.5 ${
                              isVeg
                                ? 'border-emerald-600 bg-emerald-50/50'
                                : 'border-rose-600 bg-rose-50/50'
                            }`}
                            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          >
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${
                                isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </div>

                          <div>
                            <h4
                              className="text-xs font-black"
                              style={{ color: currentTheme.colors.textPrimary }}
                            >
                              {it.quantity}× {it.name}
                            </h4>
                            {(it.prepMode || it.options || (it.addOns && it.addOns.length > 0)) && (
                              <div className="mt-0.5 flex flex-wrap gap-1">
                                {it.prepMode && (
                                  <span className="text-[9.5px] font-bold font-mono" style={{ color: currentTheme.colors.buttonBg }}>
                                    {it.prepMode}
                                  </span>
                                )}
                                {it.options && (
                                  <span className="text-[9.5px] font-medium" style={{ color: currentTheme.colors.textMuted }}>
                                    • {it.options}
                                  </span>
                                )}
                                {it.addOns?.map((addon) => (
                                  <span key={addon} className="text-[9.5px] font-medium" style={{ color: currentTheme.colors.buttonBg }}>
                                    • +{addon}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Top Live Badge */}
                        <div className="shrink-0">
                          {isDishServed ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100/70 px-2 py-0.5 text-[9px] font-black text-emerald-900 font-mono">
                              <CheckCheck className="h-3 w-3 text-emerald-700" />
                              <span>Served</span>
                            </span>
                          ) : it.stage === 'PLACED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-700 font-mono">
                              <ClipboardList className="h-3 w-3 text-slate-500" />
                              <span>Placed</span>
                            </span>
                          ) : it.stage === 'RECEIVED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-800 font-mono animate-pulse">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Received</span>
                            </span>
                          ) : it.stage === 'PREP' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-800 font-mono animate-pulse">
                              <Flame className="h-3 w-3 text-amber-600" />
                              <span>Preparing</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-800 font-mono shadow-xs animate-pulse">
                              <UtensilsCrossed className="h-3 w-3 text-emerald-600" />
                              <span>Ready</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Matching 4-Stage Dish Live Progress Tracker: PLACED -> RECEIVED -> PREPARING -> READY */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="relative flex justify-between items-center px-1">
                          {/* Background connecting line */}
                          <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-100 -z-0" />

                          {/* Active fill line */}
                          <div
                            className="absolute top-3 left-4 h-0.5 bg-emerald-600 -z-0 transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, (dishCurrentIdx / 3) * 88))}%`,
                            }}
                          />

                          {DISH_STAGES.map((stg, stgIdx) => {
                            const isPast = stgIdx < dishCurrentIdx;
                            const isCurrent = stgIdx === dishCurrentIdx;
                            const isReceivedActive = isCurrent && stg.key === 'RECEIVED';
                            const Icon = stg.icon;

                            return (
                              <div key={stg.key} className="relative z-10 flex flex-col items-center gap-1">
                                <div
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black transition-all shadow-2xs ${
                                    isPast
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-100'
                                      : isReceivedActive
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 shadow-xs animate-pulse'
                                      : isCurrent && stg.key === 'PREPARING'
                                      ? 'bg-amber-600 text-white ring-2 ring-amber-200 animate-pulse'
                                      : isCurrent && stg.key === 'READY'
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 animate-pulse'
                                      : isCurrent
                                      ? 'bg-[#9C3D1E] text-white ring-2 ring-orange-200'
                                      : 'border border-slate-200 bg-white text-slate-400'
                                  }`}
                                >
                                  {isPast ? (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  ) : (
                                    <Icon className="h-3 w-3" />
                                  )}
                                </div>
                                <span
                                  className={`text-[9px] font-mono tracking-tight font-black leading-none ${
                                    isPast
                                      ? 'text-emerald-700'
                                      : isReceivedActive
                                      ? 'text-emerald-700'
                                      : isCurrent && stg.key === 'PREPARING'
                                      ? 'text-amber-700'
                                      : isCurrent && stg.key === 'READY'
                                      ? 'text-emerald-700'
                                      : isCurrent
                                      ? 'text-[#9C3D1E]'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {stg.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div
                  className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <Clock className="h-8 w-8 mb-2 stroke-[1.5]" style={{ color: currentTheme.colors.textMuted }} />
                  <p className="text-xs font-bold" style={{ color: currentTheme.colors.textPrimary }}>No active orders for this table</p>
                  <p className="text-[10.5px] mt-0.5" style={{ color: currentTheme.colors.textMuted }}>
                    Order items from the menu to see live kitchen preparation stages.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Add More Items Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(2)}
          style={{
            borderColor: currentTheme.colors.border,
            backgroundColor: currentTheme.colors.bgSurface,
            color: currentTheme.colors.buttonBg,
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-xs font-black transition shadow-2xs hover:brightness-105 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add More Dishes to Same Bill</span>
        </motion.button>
      </div>

      {/* Bottom Sticky Bar */}
      <StickyBottomBar>
        <div className="w-full flex flex-col gap-2.5">
          {/* STATE 1: Captain Summoned and Waiter hasn't opened Settle Bill yet (ONLY DISPLAY MESSAGE, NO BUTTONS) */}
          {isSummoned && !isCaptainArrived && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm space-y-2 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-900">
                <Bell className="h-4 w-4 text-amber-600 animate-bounce" />
                <span>Floor Captain Summoned for Payment</span>
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Please wait at Chair C-{String(effectiveSeat).padStart(2, '0')}... Floor Captain Suresh is walking over to your table with the billing terminal.
              </p>
            </motion.div>
          )}

          {/* STATE 2: Captain Arrived & opened Settle Bill on Waiter Mobile */}
          {isCaptainArrived && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border-2 border-[#9C3D1E] bg-[#FFF8F5] p-3.5 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-stone-900 uppercase">
                    Floor Captain Arrived at {effectiveTable}
                  </span>
                </div>
                <span className="rounded-full bg-[#9C3D1E] text-white px-2 py-0.5 text-[10px] font-mono font-black">
                  Payable: ₹{currentBillAmount}
                </span>
              </div>

              {/* Sub-case 2A: Waiter selected UPI on Waiter Mobile */}
              {activeSession?.method === 'UPI' && (
                <div className="space-y-2.5">
                  {activeSession.isUpiVerified ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>QR Terminal Verified by Captain Suresh • Ready to Pay</span>
                      </div>
                      <p className="text-[11px] text-stone-700 font-medium">
                        Select your UPI payment app to scan captain's QR code:
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {UPI_APPS.map((app) => (
                          <button
                            key={app.name}
                            onClick={() => {
                              setSelectedUpiApp(app.name as any);
                              setIsScannerOpen(true);
                            }}
                            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50/50 hover:border-emerald-500 transition shadow-xs active:scale-95 cursor-pointer ring-1 ring-emerald-200"
                          >
                            {app.logo}
                            <span className="text-[9px] font-bold text-stone-800 truncate w-full text-center">
                              {app.shortName}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black shadow-xs transition cursor-pointer active:scale-98"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Scan Floor Captain&apos;s QR Code (₹{currentBillAmount})</span>
                      </button>
                    </>
                  ) : (
                    <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                        <span>Floor Captain Suresh is setting up UPI QR Terminal...</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Please wait a moment while the captain verifies your QR payment on the terminal.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-case 2B: Waiter selected Cash on Waiter Mobile */}
              {activeSession?.method === 'CASH' && (
                <div className="space-y-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <Banknote className="h-4 w-4 text-amber-700" />
                    <span>Cash Payment Selected</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Please hand <span className="font-bold">₹{currentBillAmount}</span> in cash directly to Floor Captain Suresh.
                  </p>
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-amber-900 pt-1 border-t border-amber-200/60">
                    <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
                    <span>Please wait for Floor Captain's cash confirmation...</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STATE 3: Captain NOT summoned yet: Show action buttons (Enabled ONLY when allDishesServed) */}
          {!isSummoned && !isCaptainArrived && (
            <>
              {!allDishesServed && trackedDishes.length > 0 && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-center text-[10.5px] font-medium text-stone-600">
                  Dishes are being cooked & served. Payment unlocks once all dishes reach your table.
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  disabled={!allDishesServed}
                  whileTap={allDishesServed ? { scale: 0.98 } : undefined}
                  onClick={() => {
                    if (allDishesServed) setShowPayViaWaiterModal(true);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-black transition shadow-xs ${
                    allDishesServed
                      ? 'border-[#9C3D1E] bg-[#FFF8F5] text-[#9C3D1E] hover:bg-[#FDF0E9] cursor-pointer'
                      : 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <CreditCard className="h-4 w-4 stroke-[2.2]" />
                  <span>Pay via Waiter</span>
                </motion.button>

                <motion.button
                  disabled={!allDishesServed}
                  whileTap={allDishesServed ? { scale: 0.98 } : undefined}
                  onClick={() => {
                    if (allDishesServed) setCurrentScreen(6);
                  }}
                  style={
                    allDishesServed
                      ? {
                          backgroundColor: currentTheme.colors.buttonBg,
                          color: currentTheme.colors.buttonFg,
                          boxShadow: currentTheme.colors.buttonShadow,
                        }
                      : {
                          backgroundColor: '#E5E7EB',
                          color: '#9CA3AF',
                        }
                  }
                  className={`flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition ${
                    allDishesServed
                      ? 'hover:brightness-105 cursor-pointer shadow-md'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Self Pay (QR/UPI)</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </motion.button>
              </div>
            </>
          )}
        </div>
      </StickyBottomBar>

      {/* Confirmation Modal: "Are you sure want to call waiter for payment?" */}
      <AnimatePresence>
        {showPayViaWaiterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-stone-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-3 mx-auto">
                <CreditCard className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-black text-stone-900 text-center">
                Call Floor Captain for Payment?
              </h3>
              <p className="mt-1.5 text-xs text-stone-600 text-center leading-relaxed">
                Are you sure you want to call the Floor Captain for payment at <span className="font-bold text-stone-900">{effectiveTable} (Chair C-{String(effectiveSeat).padStart(2, '0')})</span>?
              </p>
              <p className="mt-1 text-[11px] text-stone-500 text-center">
                A captain will visit your seat with the payment terminal and QR scanner.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPayViaWaiterModal(false)}
                  className="rounded-2xl border border-stone-200 bg-stone-100 py-3 text-xs font-bold text-stone-700 transition hover:bg-stone-200 active:scale-95 cursor-pointer"
                >
                  No, Go Back
                </button>
                <button
                  onClick={handleConfirmCallCaptain}
                  className="rounded-2xl bg-[#9C3D1E] py-3 text-xs font-black text-white shadow-md transition hover:bg-[#853218] active:scale-95 cursor-pointer"
                >
                  Yes, Call Captain
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scanner Mode Overlay Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 text-white p-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                {selectedUpiApp === 'PhonePe' && <PhonePeLogo />}
                {selectedUpiApp === 'GPay' && <GooglePayLogo />}
                {selectedUpiApp === 'Paytm' && <PaytmLogo />}
                {selectedUpiApp === 'BHIM' && <BhimLogo />}
                {selectedUpiApp === 'CRED' && <CredLogo />}
                <span className="text-xs font-bold font-mono">
                  Ready to Scan via {selectedUpiApp}
                </span>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="py-4 text-center space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                Amount Payable
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400">
                ₹{currentBillAmount}
              </div>
              <p className="text-[11px] text-slate-400">
                Table {effectiveTable} • Chair C-{String(effectiveSeat).padStart(2, '0')}
              </p>
            </div>

            {/* High-Tech Camera Viewfinder */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-2 border-emerald-500/50 bg-slate-900 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover opacity-75"
                />

                {/* 4 Corner Targeting Crosshairs */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />

                {/* Center scan reticle */}
                <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
                  <Scan className="h-12 w-12 text-emerald-400/80 animate-pulse stroke-[1.5]" />
                  <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-300">
                    Align QR Code
                  </span>
                </div>

                {/* Sweeping Laser Bar */}
                <motion.div
                  animate={{ y: [-110, 110, -110] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399]"
                />
              </div>

              <div className="mt-4 text-center space-y-1 max-w-xs px-4">
                <p className="text-xs font-bold text-stone-200">
                  Point camera at Floor Captain's QR Code
                </p>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Hold steady. Once scanned and authorized, the Floor Captain will confirm on their terminal and your invoice will display automatically.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="py-4 space-y-2 border-t border-white/10">
              <button
                onClick={() => {
                  const normTbl = `T-${String(parseInt(effectiveTable.replace(/[^0-9]/g, ''), 10) || 1).padStart(2, '0')}`;
                  const key = `${normTbl}-CHAIR-${effectiveSeat}`;
                  const snapshot = settledBills[key] || (
                    settledBills[normTbl] && (
                      settledBills[normTbl].seatNumber === undefined ||
                      settledBills[normTbl].seatNumber === null ||
                      settledBills[normTbl].seatNumber === effectiveSeat
                    ) ? settledBills[normTbl] : null
                  );
                  if (snapshot) {
                    useCustomerStore.getState().handleBillSettledByWaiter(snapshot);
                  } else {
                    useCustomerStore.getState().handleBillSettledByWaiter({
                      invoiceNumber: `INV-${normTbl.replace(/[^0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
                      items: trackedDishes.map((td) => ({
                        id: td.id,
                        name: td.name,
                        quantity: td.quantity,
                        price: 220,
                        totalPrice: td.quantity * 220,
                        options: td.options,
                        addOns: td.addOns,
                        ticketNumber: 'LIVE',
                      })),
                      subtotal: Math.round(currentBillAmount / 1.05),
                      totalTax: currentBillAmount - Math.round(currentBillAmount / 1.05),
                      cgst: Math.round((currentBillAmount - Math.round(currentBillAmount / 1.05)) / 2),
                      sgst: currentBillAmount - Math.round(currentBillAmount / 1.05) - Math.round((currentBillAmount - Math.round(currentBillAmount / 1.05)) / 2),
                      grandTotal: currentBillAmount,
                      method: 'UPI',
                      seatLabel: `Chair ${effectiveSeat}`,
                      captainName: 'Floor Captain Suresh',
                      tableName: effectiveTable,
                      section: 'Main Dining Hall',
                      guestCount: 1,
                      formattedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                      formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                      timestamp: Date.now(),
                    });
                  }
                  setIsScannerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-lg cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Simulate QR Scan (Diner Demo)</span>
              </button>

              <button
                onClick={() => setIsScannerOpen(false)}
                className="w-full py-2.5 text-center text-xs text-stone-400 hover:text-white transition cursor-pointer"
              >
                Choose another payment method
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </ScreenHousing>
  );
};
