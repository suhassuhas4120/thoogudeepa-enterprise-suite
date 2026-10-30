'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
import { useSharedBridge, SettledBillSnapshot } from '../../store/useSharedBridge';
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
  Receipt,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore } from '../../store/useCustomerStore';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

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
    recordSettledBill,
    waiterRecordsPayment,
    waiterClearsChairAfterPayment,
    waiterClearsSettlementSession,
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
    const strA = String(a);
    const strB = String(b);
    const normA = strA.toUpperCase().replace(/\s+/g, '').replace('TABLE', '').replace('T-', '');
    const normB = strB.toUpperCase().replace(/\s+/g, '').replace('TABLE', '').replace('T-', '');
    return normA === normB || (parseInt(normA, 10) > 0 && parseInt(normA, 10) === parseInt(normB, 10));
  };

  const getCleanName = (name?: string | null) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .replace(/\s*\[Seat \d+\]/gi, '')
      .replace(/\s*\[Table [^\]]+\]/gi, '')
      .replace(/[\[\]()]/g, '')
      .trim();
  };

  const getCanonicalKey = (name?: string | null) => {
    return getCleanName(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const isVegItem = (name?: string | null) => {
    const lower = String(name || '').toLowerCase();
    return lower.includes('dessert') || lower.includes('paneer') || lower.includes('veg') || lower.includes('salad');
  };

  // Normalized table key for bridge lookups
  const normTable = `T-${String(parseInt(String(effectiveTable).replace(/[^0-9]/g, ''), 10) || 1).padStart(2, '0')}`;
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
      const cSeat = chairCandidate.seatNumber !== undefined && chairCandidate.seatNumber !== null
        ? Number(chairCandidate.seatNumber)
        : undefined;
      if (cSeat === undefined || cSeat === effectiveSeat) {
        return chairCandidate;
      }
    }

    const tableCandidate = sessions[normTable];
    if (isValid(tableCandidate)) {
      const tSeat = tableCandidate.seatNumber !== undefined && tableCandidate.seatNumber !== null
        ? Number(tableCandidate.seatNumber)
        : undefined;
      if (tSeat === effectiveSeat) {
        return tableCandidate;
      }
      if (tSeat === undefined) {
        const otherChairsHaveItems = currentTbl?.activeItems?.some((ai) => ai.seatNumber && Number(ai.seatNumber) !== effectiveSeat);
        if (!otherChairsHaveItems) {
          return tableCandidate;
        }
      }
    }

    return null;
  }, [activeSettlementSessions, chairKey, normTable, effectiveSeat, currentTbl]);

  const isCaptainArrived = Boolean(activeSession);

  // Check if waiter was called for payment strictly for this chair
  const hasActivePaymentPing = useMemo(() => {
    return pings.some((p) => {
      if (!isTableMatch(p.tableNumber, effectiveTable)) return false;
      if (p.type !== 'PAYMENT' || p.status !== 'PENDING') return false;
      const pSeat = p.seatNumber !== undefined && p.seatNumber !== null ? Number(p.seatNumber) : undefined;
      if (pSeat !== undefined && !isNaN(pSeat)) {
        return pSeat === effectiveSeat;
      }
      return isWaitingForCaptain;
    });
  }, [pings, effectiveTable, effectiveSeat, isWaitingForCaptain]);

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
      if (tk.status === 'COMPLETED') return false;
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
          if (!it) return false;
          const itemSeat = it.seatNumber !== undefined && it.seatNumber !== null
            ? Number(it.seatNumber)
            : (it as any).seat_number !== undefined && (it as any).seat_number !== null
            ? Number((it as any).seat_number)
            : tkSeat;
          return itemSeat === effectiveSeat;
        })
        .map((it) => {
          const rawName = it.name || (it as any).itemName || (it as any).dishName || (it as any).dish_name || (it as any).item_name || (it as any).item?.name || '';
          return {
            id: it.id,
            ticketId: tk.id,
            name: getCleanName(rawName) || 'Special Dish',
            quantity: it.quantity,
            price: Number(it.price || (it as any).unitPrice || (it as any).unit_price || 0),
            stage: it.stage as OrderStage,
            prepMode: it.prepMode,
            options: it.options,
            addOns: it.addOns,
            notes: it.notes,
            seatNumber: effectiveSeat,
          };
        });
    });

    const mySupabaseTickets = supabaseTickets.filter((tk) => {
      if (!isTableMatch(tk.tableId, effectiveTable)) return false;
      if (tk.status === 'COMPLETED') return false;
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
          if (!it) return false;
          const itemSeat = it.seat_number !== undefined && it.seat_number !== null
            ? Number(it.seat_number)
            : (it.seatNumber !== undefined && it.seatNumber !== null
            ? Number(it.seatNumber)
            : tkSeat);
          return itemSeat === effectiveSeat;
        })
        .map((it) => {
          const rawName = it.name || (it as any).itemName || (it as any).dishName || (it as any).dish_name || (it as any).item_name || (it as any).item?.name || '';
          return {
            id: it.id,
            ticketId: tk.id,
            name: getCleanName(rawName) || 'Special Dish',
            quantity: it.quantity,
            price: Number((it as any).price || (it as any).unit_price || (it as any).unitPrice || 0),
            stage: it.stage as OrderStage,
            prepMode: '',
            options: '',
            addOns: [] as string[],
            notes: it.notes,
            seatNumber: effectiveSeat,
          };
        });
    });

    // Combine bridge items and supabase items authoritative from kitchen tickets for this chair
    const combinedTicketItems: Array<{
      id: string;
      ticketId?: string;
      name: string;
      quantity: number;
      price: number;
      stage: OrderStage;
      prepMode?: string;
      options?: string;
      addOns?: string[];
      notes?: string;
      seatNumber: number;
    }> = [];

    const coveredItemIds = new Set<string>();

    // Map bridge items first (most reactive, in-memory + broadcast)
    bridgeItems.forEach((bi) => {
      if (bi.id) coveredItemIds.add(bi.id);
      combinedTicketItems.push({
        id: bi.id,
        ticketId: bi.ticketId,
        name: bi.name,
        quantity: bi.quantity,
        price: bi.price,
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
      if (si.id && coveredItemIds.has(si.id)) {
        const existing = combinedTicketItems.find((ci) => ci.id === si.id);
        if (existing) {
          const existingIdx = getDishStageIdx(existing.stage, existing.id);
          const supabaseIdx = getDishStageIdx(si.stage, si.id);
          if (supabaseIdx > existingIdx) {
            existing.stage = si.stage;
          }
        }
      } else {
        if (si.id) coveredItemIds.add(si.id);
        combinedTicketItems.push({
          id: si.id,
          ticketId: si.ticketId,
          name: si.name,
          quantity: si.quantity,
          price: si.price,
          stage: si.stage,
          prepMode: 'Military Dum Handi',
          options: si.options,
          addOns: si.addOns,
          notes: si.notes,
          seatNumber: effectiveSeat,
        });
      }
    });

    // Reconcile with table activeItems for this chair (covers previously served items from earlier orders whose tickets completed)
    const tableChairActiveItems = (currentTbl?.activeItems || []).filter((ai) => {
      if (!ai) return false;
      const aiSeat = ai.seatNumber !== undefined && ai.seatNumber !== null ? Number(ai.seatNumber) : undefined;
      if (aiSeat !== undefined && !isNaN(aiSeat)) {
        return aiSeat === effectiveSeat;
      }
      return effectiveSeat === 1;
    });

    tableChairActiveItems.forEach((ai) => {
      if (ai.id && coveredItemIds.has(ai.id)) {
        const existing = combinedTicketItems.find((ci) => ci.id === ai.id);
        if (existing && String(ai.status).toUpperCase() === 'SERVED') {
          existing.stage = 'SERVED';
        }
        return;
      }

      // Old item from earlier order that was served or whose ticket is completed
      const rawStatus = String(ai.status || '').toUpperCase();
      const resolvedStage: OrderStage =
        rawStatus === 'SERVED' ? 'SERVED' :
        rawStatus === 'READY' || rawStatus === 'PLATED' ? 'PLATED' :
        rawStatus === 'COOKING' || rawStatus === 'PREP' || rawStatus === 'PREPARING' ? 'PREP' :
        rawStatus === 'RECEIVED' ? 'RECEIVED' :
        'PLACED';

      const key = getCanonicalKey(ai.name);
      const cartMatch = (cart || []).find(
        (c) => c && c.isOrdered && (c.seatNumber === effectiveSeat || (!c.seatNumber && effectiveSeat === 1)) && getCanonicalKey(c.menuItem?.name || '') === key
      );

      const itemPrice = Number(ai.price || 0) > 0
        ? Number(ai.price)
        : cartMatch?.menuItem?.price ||
          INITIAL_MENU_ITEMS.find((m) => getCanonicalKey(m.name) === key)?.price ||
          0;

      if (ai.id) coveredItemIds.add(ai.id);
      combinedTicketItems.push({
        id: ai.id || `ai-${Date.now()}-${Math.random()}`,
        name: getCleanName(ai.name) || 'Special Dish',
        quantity: ai.quantity || 1,
        price: itemPrice,
        stage: resolvedStage,
        prepMode: (ai as any).prepMode || cartMatch?.prepMode || 'Military Dum Handi',
        options: ai.options || cartMatch?.selectedOption || '',
        addOns: (ai as any).addOns || cartMatch?.selectedAddOns || [],
        notes: '',
        seatNumber: effectiveSeat,
      });
    });

    // Fallback to local ordered cart if ticket stream hasn't populated yet
    const orderedCart = (cart || []).filter(
      (ci) => ci && ci.isOrdered && (ci.seatNumber === effectiveSeat || (!ci.seatNumber && effectiveSeat === 1))
    );

    if (combinedTicketItems.length === 0 && orderedCart.length > 0) {
      return orderedCart.map((ci) => {
        const dishName = ci.menuItem?.name || (ci as any)?.name || 'Special Dish';
        const key = getCanonicalKey(dishName);
        const tableActiveItem = currentTbl?.activeItems?.find(
          (ai) => ai && (ai.id === ci.cartItemId || getCanonicalKey(ai.name) === key)
        );
        const rawStatus = String(tableActiveItem?.status || '').toUpperCase();
        const tableStage: OrderStage =
          rawStatus === 'SERVED' ? 'SERVED' :
          rawStatus === 'READY' || rawStatus === 'PLATED' ? 'PLATED' :
          rawStatus === 'COOKING' || rawStatus === 'PREP' ? 'PREP' :
          rawStatus === 'RECEIVED' ? 'RECEIVED' :
          'PLACED';

        const itemPrice = ci.menuItem?.price || (ci.totalPrice ? Math.round(ci.totalPrice / (ci.quantity || 1)) : 0);

        return {
          id: `cart-${ci.cartItemId || Math.random()}`,
          cartItemId: ci.cartItemId,
          name: dishName,
          quantity: ci.quantity || 1,
          price: itemPrice,
          stage: tableStage,
          prepMode: ci.prepMode || ci.menuItem?.prepMode || 'Military Dum Handi',
          options: ci.selectedOption,
          addOns: ci.selectedAddOns || [],
          seatNumber: effectiveSeat,
        };
      });
    }

    if (combinedTicketItems.length > 0) {
      return combinedTicketItems.map((ti) => {
        const key = getCanonicalKey(ti.name);
        const cartMatch = (cart || []).find(
          (c) => c && c.isOrdered && (c.seatNumber === effectiveSeat || (!c.seatNumber && effectiveSeat === 1)) && getCanonicalKey(c.menuItem?.name || '') === key
        );

        // Check if table activeItems has a stage update for this item - strictly match by ID to avoid cross-order stage bleeding
        const tableActiveItem = currentTbl?.activeItems?.find(
          (ai) => ai && (ai.id ? ai.id === ti.id : (!ti.id && getCanonicalKey(ai.name) === key && (!ai.seatNumber || ai.seatNumber === effectiveSeat)))
        );
        const rawTblStatus = String(tableActiveItem?.status || '').toUpperCase();
        const tableStage: OrderStage | undefined =
          rawTblStatus === 'SERVED' ? 'SERVED' :
          rawTblStatus === 'READY' || rawTblStatus === 'PLATED' ? 'PLATED' :
          rawTblStatus === 'COOKING' || rawTblStatus === 'PREP' ? 'PREP' :
          rawTblStatus === 'RECEIVED' ? 'RECEIVED' :
          undefined;

        const tiIdx = getDishStageIdx(ti.stage, ti.id);
        const tblIdx = tableStage ? getDishStageIdx(tableStage, ti.id) : 0;
        const liveStage: OrderStage = tblIdx > tiIdx && tableStage ? tableStage : (ti.stage || 'PLACED');

        const itemPrice = ti.price > 0
          ? ti.price
          : cartMatch?.menuItem?.price ||
            tableActiveItem?.price ||
            INITIAL_MENU_ITEMS.find((m) => getCanonicalKey(m.name) === key)?.price ||
            0;

        return {
          id: ti.id,
          cartItemId: cartMatch?.cartItemId,
          ticketId: ti.ticketId,
          name: ti.name,
          quantity: ti.quantity,
          price: itemPrice,
          stage: liveStage,
          prepMode: ti.prepMode || cartMatch?.prepMode || 'Military Dum Handi',
          options: ti.options || cartMatch?.selectedOption || '',
          addOns: ti.addOns && ti.addOns.length > 0 ? ti.addOns : cartMatch?.selectedAddOns || [],
          notes: ti.notes || '',
          seatNumber: effectiveSeat,
        };
      });
    }

    return [];
  }, [bridgeTickets, effectiveTable, supabaseTickets, cart, effectiveSeat, currentTbl]);

  const allDishesServed = useMemo(() => {
    if (!trackedDishes.length) return false;
    return trackedDishes.every((d) => d.stage === 'SERVED' || getDishStageIdx(d.stage, d.id) === 4);
  }, [trackedDishes, currentTbl]);

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

    // Must be fresh and generated within current session after this order was placed
    if (candidate && candidate.timestamp) {
      const now = Date.now();
      const isRecent = Math.abs(now - candidate.timestamp) < 1800000;
      const effectiveOrderTime = orderPlacedAt && orderPlacedAt > 0 ? orderPlacedAt : 0;
      const isAfterOrder = effectiveOrderTime > 0 ? candidate.timestamp >= effectiveOrderTime - 2000 : false;
      if (isRecent && isAfterOrder) {
        return candidate;
      }
    }

    return null;
  }, [settledBills, chairKey, normTable, effectiveSeat, orderPlacedAt, trackedDishes]);

  useEffect(() => {
    if (matchingSnapshot && trackedDishes.length > 0) {
      const currentCustState = useCustomerStore.getState();
      if (currentCustState.payment.transactionId === matchingSnapshot.invoiceNumber && currentCustState.isSettled) {
        return;
      }
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
              const cleanedBills = { ...(data.settledBills || {}) };
              const custState = useCustomerStore.getState();
              if (custState.orderPlacedAt && custState.orderPlacedAt > 0) {
                Object.keys(cleanedBills).forEach((k) => {
                  if (cleanedBills[k]?.timestamp && cleanedBills[k].timestamp < custState.orderPlacedAt - 2000) {
                    delete cleanedBills[k];
                  }
                });
              }
              useSharedBridge.setState({
                activeSettlementSessions: data.sessions || {},
                settledBills: cleanedBills,
              });
            }
          }
        }
      } catch {}
    };

    fetchSession();
    const interval = setInterval(fetchSession, 5000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [effectiveTable]);

  const payment = useCustomerStore((s) => s.payment);

  // Total payable amount strictly scoped to this chair across ALL batches
  const currentBillAmount = useMemo(() => {
    const currentTableObj = tables.find((t) => isTableMatch(t.number, effectiveTable));

    let calculatedSubtotal = 0;

    // 1. Authoritative placed dishes for this chair (spans tickets, bridge, supabase, and past served activeItems)
    if (trackedDishes && trackedDishes.length > 0) {
      calculatedSubtotal = trackedDishes.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
    } else {
      // 2. Fallback only if trackedDishes hasn't populated yet
      const unifiedChairItemsMap = new Map<string, { id: string; name: string; quantity: number; price: number }>();
      (currentTableObj?.activeItems || [])
        .filter((ai) => (ai.seatNumber ? Number(ai.seatNumber) === effectiveSeat : effectiveSeat === 1))
        .forEach((ai) => {
          const key = ai.id || `${getCanonicalKey(ai.name)}_S${effectiveSeat}`;
          const p = ai.price && ai.price > 0
            ? ai.price
            : INITIAL_MENU_ITEMS.find((m) => getCanonicalKey(m.name) === getCanonicalKey(ai.name))?.price || 0;
          unifiedChairItemsMap.set(key, {
            id: ai.id || key,
            name: ai.name,
            quantity: ai.quantity || 1,
            price: p,
          });
        });

      (cart || [])
        .filter((ci) => ci.isOrdered && (ci.seatNumber ? Number(ci.seatNumber) === effectiveSeat : effectiveSeat === 1))
        .forEach((ci) => {
          const dishName = ci.menuItem?.name || (ci as any)?.name || 'Special Dish';
          const key = ci.cartItemId || `${getCanonicalKey(dishName)}_S${effectiveSeat}`;
          if (!unifiedChairItemsMap.has(key)) {
            const p = ci.menuItem?.price || (ci.totalPrice ? Math.round(ci.totalPrice / (ci.quantity || 1)) : 0);
            unifiedChairItemsMap.set(key, {
              id: ci.cartItemId || key,
              name: dishName,
              quantity: ci.quantity || 1,
              price: p,
            });
          }
        });

      calculatedSubtotal = Array.from(unifiedChairItemsMap.values()).reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );
    }

    const effectiveSubtotal = calculatedSubtotal;
    let chairItemsTotal = effectiveSubtotal > 0 ? Math.round(effectiveSubtotal * 1.05) : 0;

    // Explicit chair session takes highest precedence
    if (activeSession?.grandTotal && activeSession.grandTotal > 0) {
      if (Number(activeSession.seatNumber) === effectiveSeat) {
        return activeSession.grandTotal;
      }
      // Table-wide session ONLY if there are NO other chairs on the table
      if (typeof activeSession.seatNumber !== 'number') {
        const otherChairsHaveItems = currentTableObj?.activeItems?.some((ai) => ai.seatNumber && ai.seatNumber !== effectiveSeat);
        const otherChairsHaveTickets = bridgeTickets?.some(
          (tk) => isTableMatch(tk.tableNumber, effectiveTable) && tk.seatNumber && tk.seatNumber !== effectiveSeat
        );
        if (!otherChairsHaveItems && !otherChairsHaveTickets && chairItemsTotal === 0) {
          return activeSession.grandTotal;
        }
      }
    }

    return chairItemsTotal;
  }, [activeSession, tables, bridgeTickets, effectiveTable, effectiveSeat, cart, trackedDishes]);

  // Detailed bill breakdown for placed orders with proper calculation
  const ordersSummary = useMemo(() => {
    const currentTableObj = tables.find((t) => isTableMatch(t.number, effectiveTable));

    let calculatedSubtotal = 0;
    let totalItemCount = 0;

    // 1. Authoritative placed dishes for this chair
    if (trackedDishes && trackedDishes.length > 0) {
      calculatedSubtotal = trackedDishes.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
      totalItemCount = trackedDishes.reduce(
        (sum, it) => sum + (it.quantity || 1),
        0
      );
    } else {
      // 2. Fallback only if trackedDishes hasn't populated yet
      const unifiedChairItemsMap = new Map<string, { id: string; name: string; quantity: number; price: number }>();
      (currentTableObj?.activeItems || [])
        .filter((ai) => (ai.seatNumber ? Number(ai.seatNumber) === effectiveSeat : effectiveSeat === 1))
        .forEach((ai) => {
          const key = ai.id || `${getCanonicalKey(ai.name)}_S${effectiveSeat}`;
          const p = ai.price && ai.price > 0
            ? ai.price
            : INITIAL_MENU_ITEMS.find((m) => getCanonicalKey(m.name) === getCanonicalKey(ai.name))?.price || 0;
          unifiedChairItemsMap.set(key, {
            id: ai.id || key,
            name: ai.name,
            quantity: ai.quantity || 1,
            price: p,
          });
        });

      (cart || [])
        .filter((ci) => ci.isOrdered && (ci.seatNumber ? Number(ci.seatNumber) === effectiveSeat : effectiveSeat === 1))
        .forEach((ci) => {
          const dishName = ci.menuItem?.name || (ci as any)?.name || 'Special Dish';
          const key = ci.cartItemId || `${getCanonicalKey(dishName)}_S${effectiveSeat}`;
          if (!unifiedChairItemsMap.has(key)) {
            const p = ci.menuItem?.price || (ci.totalPrice ? Math.round(ci.totalPrice / (ci.quantity || 1)) : 0);
            unifiedChairItemsMap.set(key, {
              id: ci.cartItemId || key,
              name: dishName,
              quantity: ci.quantity || 1,
              price: p,
            });
          }
        });

      calculatedSubtotal = Array.from(unifiedChairItemsMap.values()).reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );
      totalItemCount = Array.from(unifiedChairItemsMap.values()).reduce(
        (sum, it) => sum + it.quantity,
        0
      );
    }

    const subtotal = calculatedSubtotal;
    const itemCount = totalItemCount || trackedDishes.length || 0;
    const gst = Math.round(subtotal * 0.05);
    const calculatedGrand = subtotal + gst;
    const grandTotal = (activeSession?.grandTotal && Number(activeSession.seatNumber) === effectiveSeat)
      ? activeSession.grandTotal
      : (currentBillAmount > 0 ? currentBillAmount : calculatedGrand);

    return {
      subtotal,
      gst,
      grandTotal,
      itemCount,
    };
  }, [tables, effectiveTable, effectiveSeat, cart, currentBillAmount, trackedDishes, activeSession]);

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
        {/* Floor Captain Attended Notification Banner */}
        <AnimatePresence>
          {waiterNotification?.active && waiterNotification?.attended && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Request Attended
                    </span>
                    <button
                      onClick={() => useCustomerStore.getState().dismissWaiterNotification()}
                      className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-800 mt-0.5 leading-snug">
                    {waiterNotification.message || 'Floor Captain has attended to your request.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Particular Dish Status Section (Unboxed matching dark theme with all 5 modes visible) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <div
              className="text-xs font-black uppercase tracking-wider font-mono"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              Particular Dish Status
            </div>
            <span
              className="text-[10px] font-bold font-mono"
              style={{ color: currentTheme.colors.primary }}
            >
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
                      className="rounded-2xl border p-4 shadow-xs space-y-3 transition-colors duration-200"
                      style={{
                        backgroundColor: currentTheme.colors.bgSurface,
                        borderColor: currentTheme.colors.border,
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
                            <span className="inline-flex items-center gap-1 rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-[9px] font-black text-teal-800 font-mono animate-pulse">
                              <CheckCircle2 className="h-3 w-3 text-teal-600" />
                              <span>Received</span>
                            </span>
                          ) : it.stage === 'PREP' || (it.stage as string) === 'PREPARING' ? (
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

                      {/* Complete 5-Stage Dish Dining Lifecycle Tracker: Placed -> Received -> Preparing -> Ready -> Served */}
                      <div className="pt-3 border-t" style={{ borderColor: currentTheme.colors.borderLight }}>
                        <div className="relative px-1">
                          {/* Segmented Milestone Progress Line */}
                          <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 z-0 overflow-hidden rounded-full">
                            <div
                              className="h-full bg-emerald-600 transition-all duration-500"
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
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all shadow-xs ${
                                      isPast
                                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                                        : isCurrent && stg.key === 'SERVED'
                                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-sm'
                                        : isCurrent && stg.key === 'READY'
                                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-sm animate-pulse'
                                        : isCurrent && stg.key === 'PREPARING'
                                        ? 'bg-amber-600 text-white ring-2 ring-amber-200 shadow-xs animate-pulse'
                                        : isCurrent && stg.key === 'RECEIVED'
                                        ? 'bg-teal-600 text-white ring-2 ring-teal-200 shadow-xs animate-pulse'
                                        : isCurrent
                                        ? 'bg-slate-700 text-white ring-2 ring-slate-200'
                                        : 'border border-slate-300 bg-white text-slate-400'
                                    }`}
                                  >
                                    {isPast ? (
                                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    ) : (
                                      <Icon className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-[9.5px] font-mono tracking-tight font-black leading-none ${
                                      isPast || isCurrent
                                        ? isCurrent && stg.key === 'PREPARING'
                                          ? 'text-amber-700'
                                          : 'text-emerald-700'
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

        {/* Order Bill Summary Card (Matching Dark Theme Perfection) */}
        {ordersSummary.grandTotal > 0 && (
          <div
            className="rounded-[28px] border p-5 shadow-sm space-y-3 transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="text-[10px] font-black uppercase tracking-wider font-mono"
                style={{ color: currentTheme.colors.textMuted }}
              >
                Order Bill Summary
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold font-mono border"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.secondaryFg,
                  borderColor: currentTheme.colors.border,
                }}
              >
                Table {effectiveTable} • Chair {effectiveSeat}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                className="flex items-center justify-between"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                <span className="font-medium">
                  Items Subtotal ({ordersSummary.itemCount} {ordersSummary.itemCount === 1 ? 'dish' : 'dishes'})
                </span>
                <span className="font-mono font-bold" style={{ color: currentTheme.colors.textPrimary }}>
                  ₹{ordersSummary.subtotal}
                </span>
              </div>

              <div
                className="border-t"
                style={{ borderColor: currentTheme.colors.borderLight }}
              />

              <div
                className="flex items-center justify-between"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                <span className="font-medium">GST (5% Taxes)</span>
                <span className="font-mono font-bold" style={{ color: currentTheme.colors.textPrimary }}>
                  ₹{ordersSummary.gst}
                </span>
              </div>

              {/* Highlighted Total Amount Callout */}
              <div
                className="mt-3 flex items-center justify-between gap-2.5 rounded-2xl p-3 border transition-all"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  borderColor: currentTheme.colors.borderLight,
                  boxShadow: currentTheme.colors.primaryShadow,
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  >
                    <Receipt className="h-4.5 w-4.5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xs font-black uppercase tracking-wider truncate"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      Total Amount
                    </div>
                    <div
                      className="text-[9.5px] font-semibold mt-0.5 truncate"
                      style={{ color: currentTheme.colors.textMuted }}
                    >
                      All taxes & charges included
                    </div>
                  </div>
                </div>

                <div
                  className="shrink-0 rounded-xl px-3 py-1.5 text-right border"
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.primary,
                    boxShadow: currentTheme.colors.primaryShadow,
                  }}
                >
                  <div
                    className="text-[9px] font-black uppercase tracking-wider font-mono"
                    style={{ color: currentTheme.colors.textMuted }}
                  >
                    Grand Total
                  </div>
                  <div
                    className="text-lg font-black font-mono tracking-tight leading-none mt-0.5"
                    style={{ color: currentTheme.colors.primary }}
                  >
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
          {/* Notice when Floor Captain is summoned (with Cancel option, never hides payment buttons) */}
          {isSummoned && !isCaptainArrived && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-300 bg-amber-50 p-3 shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-black text-amber-900">
                <div className="flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-amber-600 animate-bounce" />
                  <span>Floor Captain Summoned</span>
                </div>
                <button
                  type="button"
                  onClick={cancelPaymentPing}
                  className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                >
                  Cancel Call
                </button>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug font-medium">
                Captain Suresh is walking over to Chair C-{String(effectiveSeat).padStart(2, '0')}. You can also use Self Pay below.
              </p>
            </motion.div>
          )}

          {/* Captain Arrived & opened Settle Bill on Waiter Mobile (Only displayed once food is served) */}
          {allDishesServed && isCaptainArrived && (
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

          {/* Action buttons: Display status badge while cooking; show payment options only when all dishes are served */}
          {!allDishesServed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 flex items-center gap-2.5 text-amber-900 shadow-2xs">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className="text-xs font-semibold leading-snug">
                Dishes are actively being prepared &amp; served. Payment options will appear once your food reaches the table.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                disabled={isSummoned}
                whileTap={!isSummoned ? { scale: 0.98 } : undefined}
                onClick={() => {
                  if (!isSummoned) setShowPayViaWaiterModal(true);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-black transition shadow-xs ${
                  isSummoned
                    ? 'border-amber-300 bg-amber-50 text-amber-800 opacity-80 cursor-not-allowed'
                    : 'border-[#9C3D1E] bg-[#FFF8F5] text-[#9C3D1E] hover:bg-[#FDF0E9] cursor-pointer'
                }`}
              >
                <CreditCard className="h-4 w-4 stroke-[2.2]" />
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
                style={{
                  backgroundColor: currentTheme.colors.buttonBg,
                  color: currentTheme.colors.buttonFg,
                  boxShadow: currentTheme.colors.buttonShadow,
                }}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition hover:brightness-105 cursor-pointer shadow-md"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-[28px] p-5 shadow-2xl border transition-colors duration-200"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border mb-3 mx-auto shadow-xs"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.buttonBg,
                }}
              >
                <CreditCard className="h-6 w-6 stroke-[2]" />
              </div>

              <h3
                className="text-base font-extrabold text-center"
                style={{ color: currentTheme.colors.textPrimary }}
              >
                Call Waiter for Payment
              </h3>

              {/* Table & Chair location chip */}
              <div className="mt-2 flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black font-mono border"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    color: currentTheme.colors.textPrimary,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <span>{effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`}</span>
                  <span>•</span>
                  <span>Chair C-{String(effectiveSeat).padStart(2, '0')}</span>
                </span>
              </div>

              {/* Simple Info Note */}
              <div
                className="mt-3.5 flex items-center gap-2.5 rounded-2xl p-3 text-left border"
                style={{
                  backgroundColor: currentTheme.colors.bgElevated,
                  borderColor: currentTheme.colors.borderLight,
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: currentTheme.colors.secondaryBg,
                    color: currentTheme.colors.buttonBg,
                  }}
                >
                  <Info className="h-4 w-4" />
                </div>
                <p
                  className="text-xs leading-snug font-medium"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  A waiter will bring the bill to your chair for payment settlement.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowPayViaWaiterModal(false)}
                  className="rounded-2xl border py-3 text-xs font-bold transition active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: currentTheme.colors.bgElevated,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCallCaptain}
                  className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-md"
                  style={{
                    backgroundColor: currentTheme.colors.buttonBg,
                    color: currentTheme.colors.buttonFg,
                    boxShadow: currentTheme.colors.buttonShadow,
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
                  const normTbl = `T-${String(parseInt(String(effectiveTable).replace(/[^0-9]/g, ''), 10) || 1).padStart(2, '0')}`;
                  const key = `${normTbl}-CHAIR-${effectiveSeat}`;
                  const candidate = settledBills[key] || settledBills[normTbl];
                  const now = Date.now();
                  const snapshot = candidate && candidate.timestamp && Math.abs(now - candidate.timestamp) < 1800000
                    ? candidate
                    : null;
                  const finalSnapshot: SettledBillSnapshot = snapshot || {
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
                    seatNumber: effectiveSeat,
                    captainName: 'Floor Captain Suresh',
                    tableName: effectiveTable,
                    section: 'Main Dining Hall',
                    guestCount: 1,
                    formattedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                    formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    timestamp: Date.now(),
                  };

                  useCustomerStore.getState().handleBillSettledByWaiter(finalSnapshot);

                  // Real-time synchronization to waiter interface
                  recordSettledBill(finalSnapshot);
                  waiterRecordsPayment(normTbl, 'UPI', finalSnapshot.grandTotal, effectiveSeat);
                  // Table and chair remain OCCUPIED when payment is done through customer interface until waiter/manager vacates
                  waiterClearsSettlementSession(normTbl, effectiveSeat);

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
