'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge, SettledBillSnapshot } from '../../../store/useSharedBridge';
import { useOrderTrackingQuery } from '../../../hooks/useOrderTrackingQuery';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { StickyBottomBar } from '../../ui/StickyBottomBar';
import { OrderStage } from '../../../types/customer';
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
  Receipt,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore } from '../../../store/useCustomerStore';

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
  { key: 'SERVED', label: 'Served', icon: CheckCheck },
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
    orderPlacedAt,
    placeAllOrders,
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
    if (lower.includes('chicken') || lower.includes('mutton') || lower.includes('booti') || lower.includes('keema') || lower.includes('kaalu') || lower.includes('kabab') || lower.includes('liver')) {
      return false;
    }
    return lower.includes('dessert') || lower.includes('paneer') || lower.includes('veg') || lower.includes('salad') || lower.includes('idli') || lower.includes('dosa');
  };

  // Normalized table key for bridge lookups
  const normTable = `T-${String(parseInt(effectiveTable.replace(/[^0-9]/g, ''), 10) || 1).padStart(2, '0')}`;
  const chairKey = `${normTable}-CHAIR-${effectiveSeat}`;
  const currentTbl = tables.find((t) => isTableMatch(t.number, effectiveTable));

  const getDishStageIdx = (stage: string | OrderStage, dishItemId?: string): number => {
    const s = String(stage || '').toUpperCase();
    if (s === 'SERVED') return 4;
    // Check if table activeItems says Served or further stage for this item
    if (dishItemId && currentTbl?.activeItems) {
      const matched = currentTbl.activeItems.find(
        (ai) => ai.id === dishItemId || (ai.name && getCanonicalKey(ai.name) === getCanonicalKey(dishItemId))
      );
      if (matched?.status) {
        const ms = String(matched.status).toUpperCase();
        if (ms === 'SERVED') return 4;
        if (ms === 'READY' || ms === 'PLATED') return 3;
        if (ms === 'COOKING' || ms === 'PREP' || ms === 'PREPARING') return 2;
        if (ms === 'RECEIVED') return 1;
      }
    }
    if (s === 'PLATED' || s === 'READY') return 3;
    if (s === 'PREP' || s === 'PREPARING') return 2;
    if (s === 'RECEIVED') return 1;
    return 0; // PLACED
  };

  // Check if floor captain has arrived and initiated settlement for this specific chair
  const activeSession = useMemo(() => {
    const sessions = activeSettlementSessions || {};
    const now = Date.now();
    const isValid = (sess: any) => sess && (!sess.initiatedAt || Math.abs(now - sess.initiatedAt) < 1800000);

    const chairCandidate = sessions[chairKey];
    if (isValid(chairCandidate)) {
      if (typeof chairCandidate.seatNumber !== 'number' || Number(chairCandidate.seatNumber) === effectiveSeat) {
        return chairCandidate;
      }
    }

    const tableCandidate = sessions[normTable];
    if (isValid(tableCandidate)) {
      if (typeof tableCandidate.seatNumber !== 'number' || Number(tableCandidate.seatNumber) === effectiveSeat) {
        return tableCandidate;
      }
    }

    return null;
  }, [activeSettlementSessions, chairKey, normTable, effectiveSeat]);

  const isCaptainArrived = Boolean(activeSession);

  // Check if waiter was called for payment strictly for this chair
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

  const unplacedCartItems = useMemo(() => {
    return (cart || []).filter((ci) => ci && !ci.isOrdered);
  }, [cart]);
  const unplacedCount = unplacedCartItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const unplacedTotal = unplacedCartItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0);

  // Unified items list with live stage resolved across Bridge, Supabase, and local Cart
  const trackedDishes = useMemo(() => {
    const myBridgeTickets = bridgeTickets.filter((tk) => {
      if (!isTableMatch(tk.tableNumber, effectiveTable)) return false;
      const tkSeat = tk.seatNumber !== undefined && tk.seatNumber !== null ? Number(tk.seatNumber) : 1;
      return (
        tkSeat === effectiveSeat ||
        tk.items?.some((i) => {
          const itemSeat = i.seatNumber !== undefined && i.seatNumber !== null
            ? Number(i.seatNumber)
            : (i as any).seat_number !== undefined && (i as any).seat_number !== null
            ? Number((i as any).seat_number)
            : tkSeat;
          return itemSeat === effectiveSeat;
        })
      );
    });

    const bridgeItems = myBridgeTickets.flatMap((tk) => {
      const tkSeat = tk.seatNumber !== undefined && tk.seatNumber !== null ? Number(tk.seatNumber) : 1;
      return (tk.items || [])
        .filter((it) => {
          const itemSeat = it.seatNumber !== undefined && it.seatNumber !== null
            ? Number(it.seatNumber)
            : (it as any).seat_number !== undefined && (it as any).seat_number !== null
            ? Number((it as any).seat_number)
            : tkSeat;
          return itemSeat === effectiveSeat;
        })
        .map((it) => ({
          id: it.id,
          ticketId: tk.id,
          name: getCleanName(it.name),
          quantity: it.quantity,
          stage: it.stage as OrderStage,
          prepMode: it.prepMode,
          options: it.options,
          addOns: it.addOns,
          notes: it.notes,
          seatNumber: effectiveSeat,
        }));
    });

    const mySupabaseTickets = supabaseTickets.filter((tk) => {
      if (!isTableMatch(tk.tableId, effectiveTable)) return false;
      const tkSeat = tk.seatNumber !== undefined && tk.seatNumber !== null ? Number(tk.seatNumber) : 1;
      return (
        tkSeat === effectiveSeat ||
        tk.items?.some((i: any) => {
          const itemSeat = i.seat_number !== undefined && i.seat_number !== null
            ? Number(i.seat_number)
            : (i.seatNumber !== undefined && i.seatNumber !== null
            ? Number(i.seatNumber)
            : tkSeat);
          return itemSeat === effectiveSeat;
        })
      );
    });

    const supabaseItems = mySupabaseTickets.flatMap((tk) => {
      const tkSeat = tk.seatNumber !== undefined && tk.seatNumber !== null ? Number(tk.seatNumber) : 1;
      return (tk.items || [])
        .filter((it: any) => {
          const itemSeat = it.seat_number !== undefined && it.seat_number !== null
            ? Number(it.seat_number)
            : (it.seatNumber !== undefined && it.seatNumber !== null
            ? Number(it.seatNumber)
            : tkSeat);
          return itemSeat === effectiveSeat;
        })
        .map((it) => ({
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
        }));
    });

    // Combine bridge items and supabase items authoritative from kitchen tickets for this chair
    const combinedTicketItems: Array<{
      id: string;
      ticketId?: string;
      name: string;
      quantity: number;
      stage: OrderStage;
      prepMode?: string;
      options?: string;
      addOns?: string[];
      notes?: string;
      seatNumber: number;
    }> = [];

    // Map bridge items first (most reactive, in-memory + broadcast)
    bridgeItems.forEach((bi) => {
      combinedTicketItems.push({
        id: bi.id,
        ticketId: bi.ticketId,
        name: bi.name,
        quantity: bi.quantity,
        stage: bi.stage,
        prepMode: bi.prepMode,
        options: bi.options,
        addOns: bi.addOns,
        notes: bi.notes,
        seatNumber: effectiveSeat,
      });
    });

    // Supplement with supabase items and reconcile stages
    supabaseItems.forEach((si) => {
      const existing = combinedTicketItems.find(
        (ci) => ci.id === si.id || (getCanonicalKey(ci.name) === getCanonicalKey(si.name) && (!ci.ticketId || !si.ticketId || ci.ticketId === si.ticketId))
      );
      if (existing) {
        // Reconcile: advance to the furthest stage reported
        const existingIdx = getDishStageIdx(existing.stage, existing.id);
        const supabaseIdx = getDishStageIdx(si.stage, si.id);
        if (supabaseIdx > existingIdx) {
          existing.stage = si.stage;
        }
      } else {
        combinedTicketItems.push({
          id: si.id,
          ticketId: si.ticketId,
          name: si.name,
          quantity: si.quantity,
          stage: si.stage,
          prepMode: 'Military Dum Handi',
          options: si.options,
          addOns: si.addOns,
          notes: si.notes,
          seatNumber: effectiveSeat,
        });
      }
    });

    // If kitchen tickets exist for this chair, they are authoritative!
    // They represent all confirmed orders placed for this chair across all devices.
    if (combinedTicketItems.length > 0) {
      return combinedTicketItems.map((ti) => {
        const key = getCanonicalKey(ti.name);
        const cartMatch = (cart || []).find(
          (c) => c && c.isOrdered && c.seatNumber === effectiveSeat && getCanonicalKey(c.menuItem?.name || '') === key
        );

        // Check if table activeItems has a stage update for this item
        const tableActiveItem = currentTbl?.activeItems?.find(
          (ai) => ai && (ai.id === ti.id || (getCanonicalKey(ai.name) === key && (!ai.seatNumber || ai.seatNumber === effectiveSeat)))
        );
        const rawTblStatus = String(tableActiveItem?.status || '').toUpperCase();
        const tableStage: OrderStage | undefined =
          rawTblStatus === 'SERVED' ? 'SERVED' :
          rawTblStatus === 'READY' ? 'PLATED' :
          rawTblStatus === 'COOKING' ? 'PREP' :
          rawTblStatus === 'RECEIVED' ? 'RECEIVED' :
          undefined;

        const tiIdx = getDishStageIdx(ti.stage, ti.id);
        const tblIdx = tableStage ? getDishStageIdx(tableStage, ti.id) : 0;
        const liveStage: OrderStage = tblIdx > tiIdx && tableStage ? tableStage : (ti.stage || 'PLACED');

        return {
          id: ti.id,
          cartItemId: cartMatch?.cartItemId,
          ticketId: ti.ticketId,
          name: ti.name,
          quantity: ti.quantity,
          stage: liveStage,
          prepMode: ti.prepMode || cartMatch?.prepMode || 'Military Dum Handi',
          options: ti.options || cartMatch?.selectedOption || '',
          addOns: ti.addOns && ti.addOns.length > 0 ? ti.addOns : cartMatch?.selectedAddOns || [],
          notes: ti.notes || '',
          seatNumber: effectiveSeat,
        };
      });
    }

    // Fallback to local ordered cart if ticket stream hasn't populated yet
    const orderedCart = (cart || []).filter((ci) => ci && ci.isOrdered && ci.seatNumber === effectiveSeat);
    if (orderedCart.length > 0) {
      return orderedCart.map((ci) => {
        const dishName = ci.menuItem?.name || (ci as any)?.name || 'Special Dish';
        // In fallback mode, match strictly by unique cart item ID rather than dish name to prevent cross-order stage contamination
        const tableActiveItem = currentTbl?.activeItems?.find(
          (ai) => ai && ai.id === ci.cartItemId
        );
        const tableStage: OrderStage | undefined =
          tableActiveItem?.status === 'Served' ? 'SERVED' : undefined;

        return {
          id: `cart-${ci.cartItemId || Math.random()}`,
          cartItemId: ci.cartItemId,
          name: dishName,
          quantity: ci.quantity || 1,
          stage: tableStage || 'PLACED',
          prepMode: ci.prepMode || ci.menuItem?.prepMode || 'Military Dum Handi',
          options: ci.selectedOption,
          addOns: ci.selectedAddOns || [],
          notes: '',
          seatNumber: effectiveSeat,
        };
      });
    }

    return [];
  }, [bridgeTickets, effectiveTable, supabaseTickets, cart, effectiveSeat, currentTbl]);

  // Latch served status so transient reconciliation frames never cause payment buttons to flicker
  const [hasEverBeenFullyServed, setHasEverBeenFullyServed] = useState(false);

  const rawAllDishesServed = useMemo(() => {
    if (!trackedDishes.length) return false;
    return trackedDishes.every((d) => d.stage === 'SERVED' || getDishStageIdx(d.stage, d.id) === 4);
  }, [trackedDishes, currentTbl]);

  useEffect(() => {
    if (rawAllDishesServed) {
      setHasEverBeenFullyServed(true);
    } else if (trackedDishes.some((d) => d.stage !== 'SERVED' && getDishStageIdx(d.stage, d.id) !== 4)) {
      // Reset latch if any newly placed/cooking item is currently pending in kitchen
      setHasEverBeenFullyServed(false);
    }
  }, [rawAllDishesServed, trackedDishes, currentTbl]);

  const allDishesServed = rawAllDishesServed || hasEverBeenFullyServed;

  // Auto-transition to Screen 8 immediately when waiter confirms payment
  const matchingSnapshot = useMemo(() => {
    if (!trackedDishes || trackedDishes.length === 0) return null;

    const bills = settledBills || {};
    let candidate: SettledBillSnapshot | null = null;

    if (bills[chairKey]) {
      const b = bills[chairKey];
      const seatNum = typeof b.seatNumber === 'number'
        ? b.seatNumber
        : (b.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(b.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
      if (seatNum === undefined || seatNum === effectiveSeat) {
        candidate = b;
      }
    } else if (bills[normTable]) {
      const b = bills[normTable];
      const seatNum = typeof b.seatNumber === 'number'
        ? b.seatNumber
        : (b.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(b.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
      if (seatNum === undefined || seatNum === effectiveSeat) {
        candidate = b;
      }
    }

    // Must be fresh and generated within current session
    if (candidate && candidate.timestamp) {
      const now = Date.now();
      const isRecent = Math.abs(now - candidate.timestamp) < 1800000;
      const effectiveOrderTime = orderPlacedAt && orderPlacedAt > 0 ? orderPlacedAt : 0;
      const isAfterOrder = effectiveOrderTime > 0 ? candidate.timestamp >= effectiveOrderTime - 5000 : isRecent;
      if (isRecent && isAfterOrder) {
        return candidate;
      }
    }

    return null;
  }, [settledBills, chairKey, normTable, effectiveSeat, orderPlacedAt, trackedDishes]);

  useEffect(() => {
    if (matchingSnapshot && trackedDishes.length > 0) {
      const now = Date.now();
      if (!matchingSnapshot.timestamp || Math.abs(now - matchingSnapshot.timestamp) < 1800000) {
        setIsScannerOpen(false);
        useCustomerStore.getState().handleBillSettledByWaiter(matchingSnapshot);
      }
    }
  }, [matchingSnapshot, trackedDishes]);

  // Synchronize settlement session without causing broadcast loops across tabs
  useEffect(() => {
    let isCancelled = false;
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/settlement/session?tableNumber=${encodeURIComponent(effectiveTable)}`, { cache: 'no-store' });
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data?.sessions !== undefined || data?.settledBills !== undefined) {
            const currentBridge = useSharedBridge.getState();
            const sessionsChanged = JSON.stringify(currentBridge.activeSettlementSessions) !== JSON.stringify(data.sessions || {});
            const billsChanged = JSON.stringify(currentBridge.settledBills) !== JSON.stringify(data.settledBills || {});
            if (sessionsChanged || billsChanged) {
              useSharedBridge.setState({
                activeSettlementSessions: data.sessions || {},
                settledBills: data.settledBills || {},
              });
            }
          }
        }
      } catch {}
    };

    fetchSession();
    const interval = setInterval(fetchSession, 1200);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [effectiveTable]);

  // Total payable amount strictly scoped to this chair
  const currentBillAmount = useMemo(() => {
    if (activeSession?.grandTotal && activeSession.grandTotal > 0) {
      if (typeof activeSession.seatNumber !== 'number' || Number(activeSession.seatNumber) === effectiveSeat) {
        return activeSession.grandTotal;
      }
    }
    const currentTableObj = tables.find((t) => isTableMatch(t.number, effectiveTable));
    if (currentTableObj?.activeItems && currentTableObj.activeItems.length > 0) {
      const myChairItems = currentTableObj.activeItems.filter((ai) => ai.seatNumber === effectiveSeat);
      if (myChairItems.length > 0) {
        const chairSub = myChairItems.reduce((sum, it) => sum + (it.price || 220) * it.quantity, 0);
        return Math.round(chairSub * 1.05);
      }
    }
    const cartSub = (cart || []).filter((ci) => !ci.seatNumber || ci.seatNumber === effectiveSeat).reduce((sum, it) => sum + it.totalPrice, 0);
    if (cartSub > 0) {
      return Math.round(cartSub * 1.05);
    }
    return 0;
  }, [activeSession, tables, effectiveTable, effectiveSeat, cart]);

  // Detailed bill breakdown for placed orders with proper calculation
  const ordersSummary = useMemo(() => {
    const currentTableObj = tables.find((t) => isTableMatch(t.number, effectiveTable));
    const tableChairItems = currentTableObj?.activeItems?.filter(
      (ai) => ai.seatNumber === effectiveSeat
    ) || [];

    const chairOrderedCart = (cart || []).filter(
      (ci) => ci.isOrdered && (!ci.seatNumber || ci.seatNumber === effectiveSeat)
    );

    let subtotal = 0;
    let itemCount = 0;

    if (chairOrderedCart.length > 0) {
      subtotal = chairOrderedCart.reduce((sum, ci) => sum + (ci.totalPrice || 0), 0);
      itemCount = chairOrderedCart.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
    } else if (tableChairItems.length > 0) {
      subtotal = tableChairItems.reduce((sum, ai) => sum + ((ai.price || 220) * (ai.quantity || 1)), 0);
      itemCount = tableChairItems.reduce((sum, ai) => sum + (ai.quantity || 1), 0);
    } else if (cart && cart.length > 0) {
      const myCart = cart.filter((ci) => !ci.seatNumber || ci.seatNumber === effectiveSeat);
      subtotal = myCart.reduce((sum, ci) => sum + (ci.totalPrice || 0), 0);
      itemCount = myCart.reduce((sum, ci) => sum + (ci.quantity || 1), 0);
    } else if (currentBillAmount > 0) {
      subtotal = Math.round(currentBillAmount / 1.05);
      itemCount = trackedDishes.reduce((sum, d) => sum + (d.quantity || 1), 0);
    }

    const gst = Math.round(subtotal * 0.05);
    const grandTotal = currentBillAmount > 0 ? currentBillAmount : subtotal + gst;

    return {
      subtotal,
      gst,
      grandTotal,
      itemCount: itemCount || trackedDishes.length || 0,
    };
  }, [tables, effectiveTable, effectiveSeat, cart, currentBillAmount, trackedDishes]);

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

  // Reset any transient waiter call state when mounting Screen 5
  useEffect(() => {
    setIsWaitingForCaptain(false);
  }, []);

  const cancelPaymentPing = () => {
    setIsWaitingForCaptain(false);
    useCustomerStore.getState().dismissWaiterNotification();
    const paymentPing = pings.find(
      (p) =>
        isTableMatch(p.tableNumber, effectiveTable) &&
        p.type === 'PAYMENT' &&
        p.seatNumber === effectiveSeat &&
        p.status === 'PENDING'
    );
    if (paymentPing) {
      useSharedBridge.getState().waiterResolvePing(paymentPing.id);
    }
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
        title={<span>Live Order Tracking</span>}
        leftSubtitle={venueName?.toUpperCase()}
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      {/* Body */}
      <div
        className="flex-1 overflow-y-auto p-4 pb-36 space-y-4 transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Floor Captain Attended Notification Banner */}
        <AnimatePresence>
          {waiterNotification?.active && waiterNotification?.attended && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[24px] border border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-stone-900/80 to-emerald-950/70 p-4 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-xs">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest font-serif-luxury">
                      Request Attended
                    </span>
                    <button
                      onClick={() => useCustomerStore.getState().dismissWaiterNotification()}
                      className="text-stone-400 hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-emerald-100/90 mt-0.5 leading-snug">
                    {waiterNotification.message || 'Floor Captain has attended to your request.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Connection Status Bar */}
        <div className="flex items-center justify-between rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-stone-900/85 to-black/90 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-amber-950/40 text-amber-300 shadow-sm">
              <CookingPot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-serif-luxury text-amber-200">
                {effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`} &bull; Seat C-{String(effectiveSeat).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-medium text-amber-400/80">
                {trackedDishes.length} {trackedDishes.length === 1 ? 'Dish' : 'Dishes'} in Active Preparation
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 text-[10px] font-bold text-emerald-300 font-mono shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <Wifi className="h-3 w-3 text-emerald-400" />
            <span>Kitchen Linked</span>
          </span>
        </div>

        {/* Particular Dish Status Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-200 font-serif-luxury">
              Particular Dish Status
            </div>
            <span className="text-[10px] font-bold text-amber-400/90 font-mono">
              Live Dish Tracking
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {trackedDishes.length > 0 ? (
                trackedDishes.map((it) => {
                  const isVeg = isVegItem(it.name);
                  const dishCurrentIdx = getDishStageIdx(it.stage, it.id);
                  const isDishServed = dishCurrentIdx === 4;

                  return (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-[28px] p-5 space-y-4 border border-amber-500/25 bg-gradient-to-b from-stone-900/85 to-black/90 shadow-[0_12px_28px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                      {/* Dish Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {/* FSSAI Veg / Non-Veg Icon */}
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border p-0.5 mt-0.5 ${
                              isVeg
                                ? 'border-emerald-500 bg-emerald-950/60'
                                : 'border-rose-500 bg-rose-950/60'
                            }`}
                            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                          </div>

                          <div>
                            <h4 className="text-sm font-bold font-serif-luxury text-amber-100">
                              {it.quantity}&times; {it.name}
                            </h4>
                            {(it.prepMode || it.options || (it.addOns && it.addOns.length > 0)) && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {it.prepMode && (
                                  <span className="text-[10px] font-bold text-amber-300/90 font-mono">
                                    {it.prepMode}
                                  </span>
                                )}
                                {it.options && (
                                  <span className="text-[10px] font-medium text-stone-400">
                                    &bull; {it.options}
                                  </span>
                                )}
                                {it.addOns?.map((addon) => (
                                  <span key={addon} className="text-[10px] font-medium text-amber-400">
                                    &bull; +{addon}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Top Live Badge */}
                        <div className="shrink-0">
                          {isDishServed ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-[9.5px] font-bold text-emerald-300 font-mono">
                              <CheckCheck className="h-3 w-3 text-emerald-400" />
                              <span>Served</span>
                            </span>
                          ) : it.stage === 'PLACED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-stone-700 bg-stone-800/80 px-2.5 py-0.5 text-[9.5px] font-bold text-stone-300 font-mono">
                              <ClipboardList className="h-3 w-3 text-stone-400" />
                              <span>Placed</span>
                            </span>
                          ) : it.stage === 'RECEIVED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/40 bg-teal-950/60 px-2.5 py-0.5 text-[9.5px] font-bold text-teal-300 font-mono animate-pulse">
                              <CheckCircle2 className="h-3 w-3 text-teal-400" />
                              <span>Received</span>
                            </span>
                          ) : it.stage === 'PREP' || it.stage === 'PREPARING' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/60 px-2.5 py-0.5 text-[9.5px] font-bold text-amber-300 font-mono animate-pulse">
                              <Flame className="h-3 w-3 text-amber-400" />
                              <span>Preparing</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-[9.5px] font-bold text-emerald-300 font-mono shadow-xs animate-pulse">
                              <UtensilsCrossed className="h-3 w-3 text-emerald-400" />
                              <span>Ready</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Refined 5-Stage Complete Dining Lifecycle Tracker: Placed -> Received -> Preparing -> Ready -> Served */}
                      <div className="pt-3 border-t border-amber-500/15">
                        <div className="relative px-1">
                          {/* Segmented Milestone Progress Line */}
                          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-stone-800/90 z-0 overflow-hidden rounded-full">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                              style={{
                                width: `${(dishCurrentIdx / 4) * 100}%`,
                              }}
                            />
                          </div>

                          <div className="relative z-10 flex justify-between items-center">
                            {DISH_STAGES.map((stg, stgIdx) => {
                              const isPast = stgIdx < dishCurrentIdx;
                              const isCurrent = stgIdx === dishCurrentIdx;
                              const Icon = stg.icon;

                              return (
                                <div key={stg.key} className="flex flex-col items-center gap-1.5">
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all shadow-md ${
                                      isPast
                                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/50'
                                        : isCurrent && stg.key === 'SERVED'
                                        ? 'bg-emerald-500 text-stone-950 ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]'
                                        : isCurrent && stg.key === 'READY'
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse'
                                        : isCurrent && stg.key === 'PREPARING'
                                        ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse'
                                        : isCurrent && stg.key === 'RECEIVED'
                                        ? 'bg-teal-600 text-white ring-2 ring-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.5)] animate-pulse'
                                        : isCurrent
                                        ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                                        : 'border border-stone-800 bg-stone-900/90 text-stone-500'
                                    }`}
                                  >
                                    {isPast ? (
                                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    ) : (
                                      <Icon className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9px] font-serif-luxury tracking-wide font-medium leading-none ${
                                      isPast || isCurrent
                                        ? isCurrent && stg.key === 'PREPARING'
                                          ? 'text-amber-300 font-bold'
                                          : 'text-emerald-300 font-bold'
                                        : 'text-stone-500'
                                    }`}
                                  >
                                    {stg.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
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

        {/* Order Bill Summary Card (After Placed Orders with Total Highlighted) */}
        {ordersSummary.grandTotal > 0 && (
          <div className="rounded-[28px] border border-amber-500/30 bg-black/75 p-5 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-wider font-mono text-amber-400/90">
                Order Bill Summary
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-[9.5px] font-mono font-bold text-amber-300">
                Table {effectiveTable} • Chair {effectiveSeat}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-300">
                <span className="font-medium">
                  Items Subtotal ({ordersSummary.itemCount} {ordersSummary.itemCount === 1 ? 'dish' : 'dishes'})
                </span>
                <span className="font-mono font-bold text-stone-100">
                  ₹{ordersSummary.subtotal}
                </span>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

              <div className="flex items-center justify-between text-stone-300">
                <span className="font-medium">GST (5% Taxes)</span>
                <span className="font-mono font-bold text-stone-100">
                  ₹{ordersSummary.gst}
                </span>
              </div>

              {/* Highlighted Total Amount Callout */}
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-black/90 p-3.5 shadow-[0_4px_20px_rgba(217,119,6,0.18)] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md">
                    <Receipt className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider font-serif-luxury text-amber-100">
                      Total Amount
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                      All taxes & charges included
                    </div>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl px-3.5 py-1.5 border border-amber-400/60 bg-black/80 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-right">
                  <div className="text-[9px] font-black uppercase tracking-wider font-mono text-amber-400/80">
                    Grand Total
                  </div>
                  <div className="font-mono text-xl font-black text-amber-300 tracking-tight leading-none mt-0.5 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                    ₹{ordersSummary.grandTotal}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unplaced Dishes Quick Send Banner */}
        {unplacedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-3.5 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
                <CookingPot className="h-4 w-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-black text-amber-950">
                  {unplacedCount} {unplacedCount === 1 ? 'Dish' : 'Dishes'} in Selection (₹{unplacedTotal})
                </div>
                <div className="text-[10px] font-bold text-amber-800">
                  Ready to send to kitchen
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => placeAllOrders()}
              className="shrink-0 rounded-xl px-3.5 py-2 text-[11px] font-black uppercase text-white shadow-xs cursor-pointer hover:brightness-105"
              style={{ backgroundColor: currentTheme.colors.buttonBg }}
            >
              Send to Kitchen
            </motion.button>
          </motion.div>
        )}

        {/* Add More Items Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(2)}
          className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-amber-500/30 bg-black/40 py-3.5 text-xs font-bold font-serif-luxury tracking-wide text-amber-300 transition shadow-lg hover:border-amber-400/50 hover:bg-black/60 cursor-pointer backdrop-blur-md"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add More Dishes to Same Bill</span>
        </motion.button>
      </div>

      {/* Bottom Sticky Bar */}
      <StickyBottomBar>
        <div className="w-full flex flex-col gap-2.5">
          {/* Notice when Floor Captain is summoned (with Cancel option, never hides payment buttons) */}
          {isSummoned && !isCaptainArrived && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-amber-950/60 to-black/80 p-3.5 shadow-lg space-y-1.5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400 animate-bounce" />
                  <span className="font-serif-luxury">Floor Captain Summoned</span>
                </div>
                <button
                  type="button"
                  onClick={cancelPaymentPing}
                  className="text-[11px] font-medium text-amber-400 underline hover:text-amber-200 cursor-pointer"
                >
                  Cancel Call
                </button>
              </div>
              <p className="text-[11px] text-stone-300 leading-snug font-normal">
                Captain Suresh is walking over to Chair C-{String(effectiveSeat).padStart(2, '0')}. You can also use Self Pay below.
              </p>
            </motion.div>
          )}

          {/* Captain Arrived & opened Settle Bill on Waiter Mobile (Only displayed once food is served) */}
          {allDishesServed && isCaptainArrived && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[28px] border border-amber-500/40 bg-gradient-to-b from-stone-900/95 to-black/95 p-4 shadow-xl space-y-3 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-bold text-amber-100 uppercase tracking-wider font-serif-luxury">
                    Floor Captain Arrived at {effectiveTable}
                  </span>
                </div>
                <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                  Payable: ₹{currentBillAmount}
                </span>
              </div>

              {/* Sub-case 2A: Waiter selected UPI on Waiter Mobile */}
              {activeSession?.method === 'UPI' && (
                <div className="space-y-2.5">
                  {activeSession.isUpiVerified ? (
                    <>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3 py-2 rounded-2xl">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>QR Terminal Verified by Captain Suresh &bull; Ready to Pay</span>
                      </div>
                      <p className="text-[11px] text-stone-300 font-normal">
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
                            className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/40 transition shadow-xs active:scale-95 cursor-pointer"
                          >
                            {app.logo}
                            <span className="text-[9px] font-bold text-stone-300 truncate w-full text-center">
                              {app.shortName}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[22px] text-stone-950 font-serif-luxury text-sm font-bold shadow-lg transition cursor-pointer active:scale-98 border border-amber-300/60"
                        style={{
                          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Scan Floor Captain&apos;s QR Code (₹{currentBillAmount})</span>
                      </button>
                    </>
                  ) : (
                    <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Floor Captain Suresh is setting up UPI QR Terminal...</span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-snug">
                        Please wait a moment while the captain verifies your QR payment on the terminal.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-case 2B: Waiter selected Cash on Waiter Mobile */}
              {activeSession?.method === 'CASH' && (
                <div className="space-y-2 bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                    <Banknote className="h-4 w-4 text-amber-400" />
                    <span>Cash Payment Selected</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-snug">
                    Please hand <span className="font-bold text-amber-300">₹{currentBillAmount}</span> in cash directly to Floor Captain Suresh.
                  </p>
                  <div className="flex items-center gap-2 text-[10.5px] font-bold text-amber-300/80 pt-1.5 border-t border-white/10">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Please wait for Floor Captain's cash confirmation...</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Action buttons: Display status badge while cooking; show payment options only when all dishes are served */}
          {!allDishesServed ? (
            <div className="rounded-[24px] border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black/60 to-amber-950/40 px-4 py-3.5 flex items-center gap-3 text-amber-200 shadow-lg backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse shrink-0" />
              <p className="text-xs font-medium leading-snug text-amber-100/90">
                Dishes are actively being prepared &amp; served. Payment options will appear once your food reaches the table.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                disabled={isSummoned}
                whileTap={!isSummoned ? { scale: 0.98 } : undefined}
                onClick={() => {
                  if (!isSummoned) setShowPayViaWaiterModal(true);
                }}
                className={`flex items-center justify-center gap-2 rounded-[22px] border py-3.5 text-xs font-bold transition shadow-md font-serif-luxury ${
                  isSummoned
                    ? 'border-amber-500/30 bg-amber-950/30 text-amber-400/60 opacity-80 cursor-not-allowed'
                    : 'border-amber-500/40 bg-stone-900/80 text-amber-200 hover:bg-stone-800 cursor-pointer'
                }`}
              >
                <CreditCard className="h-4 w-4 stroke-[2]" />
                <span>{isSummoned ? 'Captain Summoned' : 'Pay via Waiter'}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  cancelPaymentPing();
                  setIsWaitingForCaptain(false);
                  useCustomerStore.getState().dismissWaiterNotification();
                  setCurrentScreen(6);
                }}
                className="flex items-center justify-center gap-2 rounded-[22px] py-3.5 text-xs font-bold tracking-wide transition hover:brightness-105 cursor-pointer shadow-[0_12px_28px_rgba(217,119,6,0.4)] text-stone-950 font-serif-luxury border border-amber-300/60"
                style={{
                  background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
                }}
              >
                <span>Self Pay (QR/UPI)</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </motion.button>
            </div>
          )}
        </div>
      </StickyBottomBar>

      {/* Confirmation Modal: "Call Waiter for Payment" */}
      <AnimatePresence>
        {showPayViaWaiterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#1C1610] to-[#0E0B08] p-6 shadow-2xl border border-amber-500/40 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 mb-3 mx-auto">
                <CreditCard className="h-6 w-6 stroke-[2]" />
              </div>

              <h3 className="text-base font-bold text-amber-100 font-serif-luxury">
                Call Waiter for Payment
              </h3>

              {/* Table & Chair location chip */}
              <div className="mt-2 flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-mono border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  <span>{effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`}</span>
                  <span>•</span>
                  <span>Chair C-{String(effectiveSeat).padStart(2, '0')}</span>
                </span>
              </div>

              {/* Simple Info Note */}
              <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl p-3 text-left border border-white/10 bg-white/5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Info className="h-4 w-4" />
                </div>
                <p className="text-xs leading-snug text-stone-300 font-normal">
                  A waiter will bring the bill to your chair for payment settlement.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPayViaWaiterModal(false)}
                  className="rounded-[20px] border border-white/10 bg-white/5 py-3 text-xs font-bold text-stone-300 transition hover:bg-white/10 active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCallCaptain}
                  className="rounded-[20px] py-3 text-xs font-bold text-stone-950 shadow-md transition hover:brightness-105 active:scale-95 cursor-pointer font-serif-luxury border border-amber-300/60"
                  style={{
                    background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 40%, #D97706 75%, #B45309 100%)',
                  }}
                >
                  Call Waiter
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
                  const candidate = settledBills[key] || settledBills[normTbl];
                  const now = Date.now();
                  const snapshot = candidate && candidate.timestamp && Math.abs(now - candidate.timestamp) < 1800000
                    ? candidate
                    : null;
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
