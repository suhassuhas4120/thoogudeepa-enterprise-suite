'use client';

import React, { useMemo, useEffect } from 'react';
import { useCustomer } from '../../context/CustomerContext';
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
  Utensils,
  CookingPot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen5LiveTracking: React.FC = () => {
  const {
    setCurrentScreen,
    orderStage,
    setOrderStage,
    venueName,
    tableNumber,
    seatNumber,
    cart,
    itemTracking,
    setItemTracking,
  } = useCustomer();

  const {
    kdsTickets: bridgeTickets,
    kitchenSetItemStage,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();

  const {
    tickets: supabaseTickets,
  } = useOrderTrackingQuery();

  const effectiveTable = tableNumber || 'T-01';
  const effectiveSeat = seatNumber || 1;

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

  // Helper for Indian FSSAI dietary indicator
  const isVegItem = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes('dessert') || lower.includes('paneer') || lower.includes('veg') || lower.includes('salad');
  };

  // Unified items list with live stage resolved across Bridge, Supabase, and local Cart
  const trackedDishes = useMemo(() => {
    // 1. Gather all bridge tickets for this table
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
      }))
    );

    // 2. Gather all Supabase items for this table & seat
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
      }))
    );

    // 3. Local ordered cart items
    const orderedCart = cart.filter((ci) => ci.isOrdered);

    // Merge: start with cart items if present, and overlay the live kitchen stage
    if (orderedCart.length > 0) {
      return orderedCart.map((ci) => {
        const key = getCanonicalKey(ci.menuItem.name);
        const bridgeMatch = bridgeItems.find((bi) => getCanonicalKey(bi.name) === key);
        const supabaseMatch = supabaseItems.find((si) => getCanonicalKey(si.name) === key);
        const trackingMatch = itemTracking.find((t) => getCanonicalKey(t.name) === key);

        const liveStage: OrderStage =
          bridgeMatch?.stage ||
          supabaseMatch?.stage ||
          trackingMatch?.stage ||
          'PLACED';

        return {
          id: bridgeMatch?.id || `cart-${ci.cartItemId}`,
          cartItemId: ci.cartItemId,
          ticketId: bridgeMatch?.ticketId,
          name: ci.menuItem.name,
          quantity: ci.quantity,
          stage: liveStage,
          prepMode: ci.prepMode || ci.menuItem.prepMode,
          options: ci.selectedOption,
          addOns: ci.selectedAddOns,
          notes: '',
        };
      });
    }

    // If cart is empty, fall back directly to bridgeItems or supabaseItems
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
  }, [bridgeTickets, effectiveTable, supabaseTickets, cart, itemTracking]);

  // Derive overall order stage dynamically
  const currentStage: OrderStage = useMemo(() => {
    if (!trackedDishes.length) return orderStage || 'PLACED';
    const allServed = trackedDishes.every((i) => i.stage === 'SERVED');
    if (allServed) return 'SERVED';
    const allPlatedOrServed = trackedDishes.every((i) => i.stage === 'PLATED' || i.stage === 'SERVED');
    if (allPlatedOrServed) return 'PLATED';
    const anyPlated = trackedDishes.some((i) => i.stage === 'PLATED');
    if (anyPlated) return 'PLATED';
    const anyPrep = trackedDishes.some((i) => i.stage === 'PREP');
    if (anyPrep) return 'PREP';
    return 'PLACED';
  }, [trackedDishes, orderStage]);

  // Synchronize store orderStage
  useEffect(() => {
    if (currentStage && currentStage !== orderStage) {
      setOrderStage(currentStage);
    }
  }, [currentStage, orderStage, setOrderStage]);

  // Handler for collecting ready dish
  const handleMarkCollected = (ticketId?: string, itemId?: string, cartItemId?: string) => {
    if (ticketId && itemId) {
      kitchenSetItemStage(ticketId, itemId, 'SERVED');
      waiterMarkKitchenItemServed(ticketId, itemId);
    }
    if (cartItemId) {
      const nextTracking = itemTracking.map((t) =>
        t.id === `track-${cartItemId}`
          ? { ...t, stage: 'SERVED' as OrderStage, status: 'Served' }
          : t
      );
      setItemTracking(nextTracking);
    }
  };

  const stages: { key: OrderStage; label: string; short: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'PLACED',
      label: 'ORDER RECEIVED',
      short: 'RECEIVED',
      icon: <ClipboardList className="h-4 w-4" />,
      desc: 'Order received at kitchen pass. Chef has queued tickets on the line.',
    },
    {
      key: 'PREP',
      label: 'PREPARING',
      short: 'PREPARING',
      icon: <Flame className="h-4 w-4" />,
      desc: 'Authentic Donne Biryanis & military dishes are cooking fresh in dum pots.',
    },
    {
      key: 'PLATED',
      label: 'READY TO COLLECT',
      short: 'READY',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      desc: 'Dishes are freshly plated at the pass. Ready for table pickup!',
    },
    {
      key: 'SERVED',
      label: 'COLLECTED',
      short: 'COLLECTED',
      icon: <CheckCheck className="h-4 w-4" />,
      desc: 'All dishes collected & served at your table. Enjoy your feast!',
    },
  ];

  const stageKeyToIdx: Record<OrderStage, number> = {
    PLACED: 0,
    PREP: 1,
    PLATED: 2,
    SERVED: 3,
  };
  const currentIdx = stageKeyToIdx[currentStage] ?? 0;

  return (
    <ScreenHousing screenNumber={5} screenTitle="LIVE ORDER TRACKING">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>Live Order Tracking</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFCF7]">
        {/* Table Connection Status Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-[#E8D5C3] bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3DFCC] text-[#8A4228]">
              <CookingPot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] font-black text-[#5B5049]">
                {effectiveTable.startsWith('T-') ? effectiveTable : `T-${effectiveTable}`} • C-{String(effectiveSeat).padStart(2, '0')}
              </div>
              <div className="text-[9.5px] font-bold text-[#8A4228] font-mono">
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

        {/* Overall Order Stage Progress Card */}
        <div className="rounded-3xl border border-[#E8D5C3] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-[#5B5049]/70 font-mono">
              Overall Kitchen Status
            </span>
            <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-[9.5px] font-black text-orange-900 font-mono">
              {stages[currentIdx]?.label}
            </span>
          </div>

          <div className="relative flex justify-between px-2 pt-2 pb-1">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-[#F3DFCC]/70 -z-0" />
            {/* Active Progress Line */}
            <motion.div
              className="absolute top-6 left-6 h-1 bg-[#8A4228] -z-0"
              initial={false}
              animate={{ width: `${(currentIdx / (stages.length - 1)) * 82}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />

            {stages.map((st, i) => {
              const isPast = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={st.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all shadow-xs ${
                      isPast
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                        : isCurrent
                        ? 'bg-[#8A4228] text-white ring-4 ring-orange-200 animate-pulse'
                        : 'border-2 border-[#E8D5C3] bg-white text-[#5B5049]/50'
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4 stroke-[3]" /> : st.icon}
                  </motion.div>
                  <span
                    className={`text-[9px] font-mono tracking-tight font-extrabold text-center leading-tight ${
                      isCurrent
                        ? 'text-[#8A4228]'
                        : isPast
                        ? 'text-emerald-700'
                        : 'text-[#5B5049]/50'
                    }`}
                  >
                    {st.short}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current stage description */}
          <div className="mt-4 text-center font-mono text-[10.5px] text-[#5B5049] font-medium bg-[#FFFCF7] rounded-xl py-2.5 px-3 border border-[#E8D5C3]">
            {stages[currentIdx]?.desc}
          </div>
        </div>

        {/* Particular Dish Status Section (At Down) */}
        <div className="rounded-3xl border border-[#E8D5C3] bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[9.5px] font-black uppercase tracking-[0.2em] text-[#5B5049]/70 font-mono">
              Particular Dish Status
            </div>
            <span className="text-[10px] font-bold text-[#8A4228] font-mono">
              Live Dish Tracking
            </span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {trackedDishes.length > 0 ? (
                trackedDishes.map((it) => {
                  const isVeg = isVegItem(it.name);

                  return (
                    <motion.div
                      key={it.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] p-3.5 shadow-2xs space-y-2"
                    >
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
                            <h4 className="text-xs font-black text-[#5B5049]">
                              {it.quantity}× {it.name}
                            </h4>
                            {(it.prepMode || it.options || (it.addOns && it.addOns.length > 0)) && (
                              <div className="mt-0.5 flex flex-wrap gap-1">
                                {it.prepMode && (
                                  <span className="text-[9.5px] font-bold text-[#8A4228] font-mono">
                                    {it.prepMode}
                                  </span>
                                )}
                                {it.options && (
                                  <span className="text-[9.5px] font-medium text-[#5B5049]/70">
                                    • {it.options}
                                  </span>
                                )}
                                {it.addOns?.map((addon) => (
                                  <span key={addon} className="text-[9.5px] font-medium text-[#8A4228]">
                                    • +{addon}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Live Status Badge */}
                        <div className="shrink-0">
                          {it.stage === 'PLACED' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-[#FAF8F5] px-2.5 py-1 text-[9.5px] font-bold text-slate-700 font-mono">
                              <ClipboardList className="h-3 w-3 text-slate-500" />
                              <span>Received</span>
                            </span>
                          )}
                          {it.stage === 'PREP' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9.5px] font-bold text-amber-800 font-mono animate-pulse">
                              <Flame className="h-3 w-3 text-amber-600" />
                              <span>Preparing</span>
                            </span>
                          )}
                          {it.stage === 'PLATED' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[9.5px] font-black text-emerald-800 font-mono shadow-xs animate-pulse">
                              <UtensilsCrossed className="h-3 w-3 text-emerald-600" />
                              <span>Ready to Collect</span>
                            </span>
                          )}
                          {it.stage === 'SERVED' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100/70 px-2.5 py-1 text-[9.5px] font-black text-emerald-900 font-mono">
                              <CheckCheck className="h-3 w-3 text-emerald-700" />
                              <span>Collected</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Action when dish is Ready to Collect */}
                      {it.stage === 'PLATED' && (
                        <div className="flex items-center justify-between border-t border-[#E8D5C3]/60 pt-2 text-[10.5px]">
                          <span className="text-[10px] font-bold text-emerald-800">
                            Dishes waiting at kitchen pass
                          </span>
                          <button
                            onClick={() => handleMarkCollected(it.ticketId, it.id, it.cartItemId)}
                            className="flex items-center gap-1 rounded-xl bg-[#8A4228] px-2.5 py-1 text-[10px] font-black text-white hover:bg-[#71351F] transition shadow-xs"
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Mark as Collected</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-[#FAF8F5]/50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-bold text-[#5B5049]">No active orders for this table</p>
                  <p className="text-[10.5px] text-[#5B5049]/70 mt-0.5">
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E8D5C3] bg-white py-3 text-xs font-black text-[#8A4228] hover:border-[#8A4228] hover:bg-[#F3DFCC]/30 transition shadow-2xs"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add More Dishes to Same Bill</span>
        </motion.button>
      </div>

      {/* Bottom Sticky: Payment */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(6)}
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-5 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </motion.button>
      </StickyBottomBar>
    </ScreenHousing>
  );
};
