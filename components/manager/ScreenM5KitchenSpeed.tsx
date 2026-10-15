'use client';

import React, { useState } from 'react';
import { useSharedBridge, SharedKDSTicket, SettledBillSnapshot, SharedPing } from '../../store/useSharedBridge';
import { INITIAL_PAID_ORDERS, INITIAL_PLACED_ORDERS, INITIAL_CUSTOMER_PINGS } from '../../data/seedOrdersHistory';
import { OrderStage } from '../../types/customer';
import {
  Flame,
  Clock,
  Receipt,
  Printer,
  Share2,
  Search,
  Filter,
  CheckCheck,
  ChefHat,
  BellRing,
  PhoneCall,
  Droplets,
  Sparkles,
  Star,
  Activity,
  ShieldCheck,
} from 'lucide-react';

interface KitchenItemNotification {
  id: string;
  ticketId: string;
  itemId: string;
  tableNumber: string;
  chairNumber: number;
  itemName: string;
  quantity: number;
  options?: string;
  stage: OrderStage;
  timestamp: string;
  serverName: string;
}

export function ScreenM5KitchenSpeed() {
  const {
    kdsTickets,
    settledBills,
    paidBillsHistory,
    pings,
  } = useSharedBridge();

  const [activeTab, setActiveTab] = useState<'PLACED' | 'PAID'>('PLACED');
  const [placedFilter, setPlacedFilter] = useState<'ALL' | 'PLACED' | 'RECEIVED' | 'PREPARING' | 'READY'>('ALL');
  const [paidFilter, setPaidFilter] = useState<'ALL' | 'CASH' | 'UPI' | 'CARD'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // ── 1. Minimum 20 Placed Orders ──
  const combinedPlacedOrders: SharedKDSTicket[] = React.useMemo(() => {
    const liveMap = new Map<string, SharedKDSTicket>();
    // Live bridge tickets first
    (kdsTickets || []).forEach((tk) => liveMap.set(tk.id, tk));
    // Add seed tickets if not already present (ensuring minimum 20)
    (INITIAL_PLACED_ORDERS || []).forEach((seed) => {
      if (!liveMap.has(seed.id)) {
        liveMap.set(seed.id, seed);
      }
    });
    return Array.from(liveMap.values());
  }, [kdsTickets]);

  // ── 2. Minimum 20 Paid Orders ──
  const combinedPaidOrders: SettledBillSnapshot[] = React.useMemo(() => {
    const paidMap = new Map<string, SettledBillSnapshot>();
    // Real settled history from bridge
    (paidBillsHistory || []).forEach((bill) => {
      if (bill && bill.invoiceNumber) paidMap.set(bill.invoiceNumber, bill);
    });
    // Individual settled bills dictionary
    Object.values(settledBills || {}).forEach((bill) => {
      if (bill && bill.invoiceNumber) paidMap.set(bill.invoiceNumber, bill);
    });
    // Add seed paid orders
    (INITIAL_PAID_ORDERS || []).forEach((seed) => {
      if (!paidMap.has(seed.invoiceNumber)) {
        paidMap.set(seed.invoiceNumber, seed);
      }
    });
    return Array.from(paidMap.values());
  }, [paidBillsHistory, settledBills]);

  // ── 3. Combined Customer Pings ──
  const combinedCustomerPings: SharedPing[] = React.useMemo(() => {
    const pingMap = new Map<string, SharedPing>();
    (pings || []).forEach((p) => pingMap.set(p.id, p));
    (INITIAL_CUSTOMER_PINGS || []).forEach((seed) => {
      if (!pingMap.has(seed.id)) {
        pingMap.set(seed.id, seed);
      }
    });
    return Array.from(pingMap.values());
  }, [pings]);

  // ── 4. Kitchen Item Notifications List (Table #, Chair #, Item name, Live Status) ──
  const kitchenNotificationsList: KitchenItemNotification[] = React.useMemo(() => {
    const list: KitchenItemNotification[] = [];
    combinedPlacedOrders.forEach((tk) => {
      const defaultChair = tk.seatNumber || tk.items?.[0]?.seatNumber || 1;
      (tk.items || []).forEach((it) => {
        if (!it) return;
        list.push({
          id: `${tk.id}-${it.id || Math.random()}`,
          ticketId: tk.id,
          itemId: it.id || '',
          tableNumber: tk.tableNumber || '',
          chairNumber: it.seatNumber || defaultChair,
          itemName: it.name || 'Unnamed Dish',
          quantity: it.quantity || 1,
          options: it.options,
          stage: it.stage || 'PLACED',
          timestamp: tk.timestamp || '',
          serverName: tk.serverName || '',
        });
      });
    });
    return list;
  }, [combinedPlacedOrders]);

  // Normalize any item stage or ticket status to the 4 canonical stages (PLACED, RECEIVED, PREPARING, READY)
  const getItemStageNormalized = (itemStage?: string, ticketStatus?: string): 'PLACED' | 'RECEIVED' | 'PREPARING' | 'READY' => {
    const s = String(itemStage || '').toUpperCase().trim();
    if (s === 'READY' || s === 'PLATED') return 'READY';
    if (s === 'PREPARING' || s === 'PREP' || s === 'COOKING') return 'PREPARING';
    if (s === 'RECEIVED') return 'RECEIVED';
    if (s === 'PLACED' || s === 'NEW') return 'PLACED';

    const ts = String(ticketStatus || '').toUpperCase().trim();
    if (ts === 'READY' || ts === 'PLATED') return 'READY';
    if (ts === 'PREPARING' || ts === 'PREP' || ts === 'COOKING') return 'PREPARING';
    if (ts === 'RECEIVED') return 'RECEIVED';
    return 'PLACED';
  };

  // Helper to accurately classify ticket stage category (PLACED, RECEIVED, PREPARING, READY)
  const getTicketStageCategory = (tk: SharedKDSTicket): 'PLACED' | 'RECEIVED' | 'PREPARING' | 'READY' => {
    const itemStages = (tk.items || []).map((it) => getItemStageNormalized(it?.stage, tk.status));
    if (itemStages.length > 0) {
      if (itemStages.some((s) => s === 'PREPARING')) return 'PREPARING';
      if (itemStages.some((s) => s === 'RECEIVED')) return 'RECEIVED';
      if (itemStages.some((s) => s === 'PLACED')) return 'PLACED';
      if (itemStages.every((s) => s === 'READY')) return 'READY';
    }
    const ts = String(tk.status || '').toUpperCase().trim();
    if (ts === 'READY' || ts === 'PLATED') return 'READY';
    if (ts === 'PREPARING' || ts === 'PREP' || ts === 'COOKING') return 'PREPARING';
    if (ts === 'RECEIVED') return 'RECEIVED';
    return 'PLACED';
  };

  // Filter stage counts (matching tickets containing items in respective mode)
  const placedCount = React.useMemo(
    () => combinedPlacedOrders.filter((t) => (t.items || []).some((it) => getItemStageNormalized(it?.stage, t.status) === 'PLACED')).length,
    [combinedPlacedOrders]
  );
  const receivedCount = React.useMemo(
    () => combinedPlacedOrders.filter((t) => (t.items || []).some((it) => getItemStageNormalized(it?.stage, t.status) === 'RECEIVED')).length,
    [combinedPlacedOrders]
  );
  const preparingCount = React.useMemo(
    () => combinedPlacedOrders.filter((t) => (t.items || []).some((it) => getItemStageNormalized(it?.stage, t.status) === 'PREPARING')).length,
    [combinedPlacedOrders]
  );
  const readyCount = React.useMemo(
    () => combinedPlacedOrders.filter((t) => (t.items || []).some((it) => getItemStageNormalized(it?.stage, t.status) === 'READY')).length,
    [combinedPlacedOrders]
  );

  // Paid Orders method filter counts (Cash, UPI, Card)
  const cashCount = React.useMemo(
    () => combinedPaidOrders.filter((b) => (b.method || '').toUpperCase() === 'CASH').length,
    [combinedPaidOrders]
  );
  const upiCount = React.useMemo(
    () => combinedPaidOrders.filter((b) => (b.method || '').toUpperCase() === 'UPI').length,
    [combinedPaidOrders]
  );
  const cardCount = React.useMemo(
    () => combinedPaidOrders.filter((b) => (b.method || '').toUpperCase() === 'CARD').length,
    [combinedPaidOrders]
  );

  // Filtered and Sorted Placed Orders for Left Column
  const filteredPlaced = React.useMemo(() => {
    return combinedPlacedOrders
      .filter((tk) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          (tk.tableNumber || '').toLowerCase().includes(term) ||
          (tk.id || '').toLowerCase().includes(term) ||
          (tk.serverName && (tk.serverName || '').toLowerCase().includes(term)) ||
          (tk.items || []).some((it) => (it?.name || '').toLowerCase().includes(term));

        if (!matchesSearch) return false;
        if (placedFilter === 'ALL') return true;
        // In respective order mode, only keep tickets with items in this stage
        return (tk.items || []).some((it) => getItemStageNormalized(it?.stage, tk.status) === placedFilter);
      })
      .sort((a, b) => {
        // Stage priority order when viewing ALL: PREPARING -> RECEIVED -> PLACED -> READY
        if (placedFilter === 'ALL') {
          const priority: Record<string, number> = { PREPARING: 1, RECEIVED: 2, PLACED: 3, READY: 4 };
          const pA = priority[getTicketStageCategory(a)] || 5;
          const pB = priority[getTicketStageCategory(b)] || 5;
          if (pA !== pB) return pA - pB;
        }
        // Numeric sort by table number
        const numA = parseInt((a.tableNumber || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((b.tableNumber || '').replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        return (b.timestamp || '').localeCompare(a.timestamp || '');
      });
  }, [combinedPlacedOrders, searchTerm, placedFilter]);

  // Filtered and Sorted Paid Orders for Left Column
  const filteredPaid = React.useMemo(() => {
    return combinedPaidOrders
      .filter((bill) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          (bill.tableName || '').toLowerCase().includes(term) ||
          (bill.invoiceNumber || '').toLowerCase().includes(term) ||
          (bill.method || '').toLowerCase().includes(term) ||
          (bill.items || []).some((it) => (it?.name || '').toLowerCase().includes(term));

        if (!matchesSearch) return false;
        if (paidFilter === 'ALL') return true;
        return (bill.method || '').toUpperCase() === paidFilter;
      })
      .sort((a, b) => {
        // Method priority sorting when viewing ALL: CASH -> UPI -> CARD
        if (paidFilter === 'ALL') {
          const priority: Record<string, number> = { CASH: 1, UPI: 2, CARD: 3 };
          const pA = priority[(a.method || '').toUpperCase()] || 4;
          const pB = priority[(b.method || '').toUpperCase()] || 4;
          if (pA !== pB) return pA - pB;
        }
        // Numeric sort by table number
        const numA = parseInt((a.tableName || '').replace(/\D/g, ''), 10) || 0;
        const numB = parseInt((b.tableName || '').replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        // Secondary sort by timestamp (most recent first) or invoiceNumber
        const timeA = typeof a.timestamp === 'number' ? a.timestamp : 0;
        const timeB = typeof b.timestamp === 'number' ? b.timestamp : 0;
        if (timeA !== timeB) return timeB - timeA;
        return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '');
      });
  }, [combinedPaidOrders, searchTerm, paidFilter]);

  // Stage Badge Formatting: PLACED, RECEIVED, PREPARING, READY, SERVED
  // Enhanced with proper badge width (min-w-[90px]) and larger font size (text-xs font-black)
  const getStageBadge = (stage?: string, status?: string) => {
    const s = getItemStageNormalized(stage, status);
    if (s === 'READY') {
      return {
        text: 'READY',
        cls: 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs font-black min-w-[90px] text-center px-3 py-1 text-xs rounded-lg',
      };
    }
    if (s === 'PREPARING') {
      return {
        text: 'PREPARING',
        cls: 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-black min-w-[90px] text-center px-3 py-1 text-xs rounded-lg',
      };
    }
    if (s === 'RECEIVED') {
      return {
        text: 'RECEIVED',
        cls: 'bg-blue-100 text-blue-950 border border-blue-300 shadow-2xs font-black min-w-[90px] text-center px-3 py-1 text-xs rounded-lg',
      };
    }
    return {
      text: 'PLACED',
      cls: 'bg-orange-100 text-[#9C3D1E] border border-orange-300 shadow-2xs font-black min-w-[90px] text-center px-3 py-1 text-xs rounded-lg',
    };
  };

  // Helper for Customer Ping Icon
  const getPingIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('WATER')) return <Droplets className="h-4 w-4 text-cyan-600" />;
    if (t.includes('BILL') || t.includes('PAY')) return <Receipt className="h-4 w-4 text-amber-600" />;
    if (t.includes('CLEAN')) return <Sparkles className="h-4 w-4 text-purple-600" />;
    if (t.includes('FEEDBACK') || t.includes('STAR')) return <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />;
    return <PhoneCall className="h-4 w-4 text-rose-600" />;
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4 font-mono">
      {/* ── TOP TITLE HEADER BANNER ── */}
      <div className="bg-white border border-[#EAE5DF] rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-sm">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black font-mono text-slate-900">
              Kitchen Orders &amp; Customer Notifications
            </h1>
          </div>
        </div>

        {/* Live Active Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-xs text-slate-700">
          <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span className="font-bold text-xs">Live Sync</span>
        </div>
      </div>

      {/* ── 3-COLUMN SIDE-BY-SIDE LAYOUT (MATCHING USER SKETCH) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1: ORDERS SECTION (LEFT 6 COLS / ~50% WIDTH)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-4">
          {/* Two Buttons: [ Placed orders ] and [ Paid orders ] */}
          <div className="grid grid-cols-2 gap-3">
            {/* Button 1: Placed orders */}
            <button
              onClick={() => {
                setActiveTab('PLACED');
                setSearchTerm('');
              }}
              className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-left cursor-pointer active:scale-[0.99] ${
                activeTab === 'PLACED'
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-md ring-2 ring-[#9C3D1E]/40'
                  : 'bg-white text-slate-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 transition ${
                    activeTab === 'PLACED' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  <Flame className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black tracking-tight truncate">Placed Orders</div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-1">
                <span
                  className={`text-xl font-black ${
                    activeTab === 'PLACED' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {combinedPlacedOrders.length}
                </span>
              </div>
            </button>

            {/* Button 2: Paid orders */}
            <button
              onClick={() => {
                setActiveTab('PAID');
                setSearchTerm('');
              }}
              className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-left cursor-pointer active:scale-[0.99] ${
                activeTab === 'PAID'
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-md ring-2 ring-[#9C3D1E]/40'
                  : 'bg-white text-slate-700 border-[#EAE5DF] hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 transition ${
                    activeTab === 'PAID' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black tracking-tight truncate">Paid Orders</div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-1">
                <span
                  className={`text-xl font-black ${
                    activeTab === 'PAID' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {combinedPaidOrders.length}
                </span>
              </div>
            </button>
          </div>

          {/* Search bar & Stage filters */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3 shadow-xs space-y-2.5">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'PLACED'
                    ? 'Search by table or dish...'
                    : 'Search by table or invoice...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>

            {activeTab === 'PLACED' && (
              <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1.5 border-t border-slate-100">
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 shrink-0">
                  <Filter className="h-3.5 w-3.5 text-slate-600" />
                  <span>FILTER:</span>
                </span>
                {(['ALL', 'PLACED', 'RECEIVED', 'PREPARING', 'READY'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPlacedFilter(st)}
                    className={`px-3.5 py-1.5 rounded-lg font-black transition text-xs shrink-0 cursor-pointer min-w-[70px] text-center ${
                      placedFilter === st
                        ? 'bg-[#9C3D1E] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-slate-700 hover:bg-stone-200 border border-slate-300'
                    }`}
                  >
                    {st === 'ALL'
                      ? `All (${combinedPlacedOrders.length})`
                      : st === 'PLACED'
                      ? `Placed (${placedCount})`
                      : st === 'RECEIVED'
                      ? `Received (${receivedCount})`
                      : st === 'PREPARING'
                      ? `Preparing (${preparingCount})`
                      : `Ready (${readyCount})`}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'PAID' && (
              <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1.5 border-t border-slate-100">
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 shrink-0">
                  <Filter className="h-3.5 w-3.5 text-slate-600" />
                  <span>FILTER:</span>
                </span>
                {(['ALL', 'CASH', 'UPI', 'CARD'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaidFilter(method)}
                    className={`px-3.5 py-1.5 rounded-lg font-black transition text-xs shrink-0 cursor-pointer min-w-[70px] text-center ${
                      paidFilter === method
                        ? 'bg-[#9C3D1E] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-slate-700 hover:bg-stone-200 border border-slate-300'
                    }`}
                  >
                    {method === 'ALL'
                      ? `All (${combinedPaidOrders.length})`
                      : method === 'CASH'
                      ? `Cash (${cashCount})`
                      : method === 'UPI'
                      ? `UPI (${upiCount})`
                      : `Card (${cardCount})`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2-Column Grid of Orders (Minimum 20 orders, Clean Overview) */}
          {activeTab === 'PLACED' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700 px-1">
                <span className="font-black text-xs text-slate-800">
                  Placed Orders ({filteredPlaced.length})
                </span>
              </div>

              {filteredPlaced.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[780px] overflow-y-auto pr-1">
                  {filteredPlaced.map((tk) => {
                    const chairNum = tk.seatNumber || tk.items[0]?.seatNumber || 1;
                    const visibleItems =
                      placedFilter === 'ALL'
                        ? tk.items
                        : tk.items.filter(
                            (it) => getItemStageNormalized(it.stage, tk.status) === placedFilter
                          );
                    const overallStage =
                      placedFilter === 'ALL'
                        ? getStageBadge(undefined, getTicketStageCategory(tk))
                        : getStageBadge(placedFilter);

                    return (
                      <div
                        key={tk.id}
                        className="p-3.5 rounded-xl border border-[#EAE5DF] bg-white shadow-xs flex flex-col justify-between hover:border-orange-300 transition"
                      >
                        <div>
                          {/* Ticket Header (No stage badge on table right side; stage badge is on item right side only) */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs sm:text-sm font-black text-white bg-[#9C3D1E] px-2.5 py-1 rounded-lg shadow-2xs">
                                Table {tk.tableNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                                Chair {chairNum}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-bold">
                              {tk.id} • {tk.timestamp}
                            </div>
                          </div>

                          {/* Items List (Respective Items Matching Selected Stage Mode) */}
                          <div className="mt-2.5 space-y-2">
                            {visibleItems.map((it, idx) => {
                              const itemStageNorm = getItemStageNormalized(it.stage, tk.status);
                              const itemBadge = getStageBadge(itemStageNorm);
                              return (
                                <div
                                  key={it.id || idx}
                                  className="p-2.5 rounded-xl bg-[#FAF8F5] border border-slate-200/90 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-sm sm:text-base font-black text-[#9C3D1E] shrink-0">
                                        {it.quantity}x
                                      </span>
                                      <span className="font-mono text-sm sm:text-base font-black text-slate-900 truncate">
                                        {it.name}
                                      </span>
                                    </div>
                                    {it.options && (
                                      <div className="font-mono text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                                        <span>•</span>
                                        <span>{it.options}</span>
                                      </div>
                                    )}
                                    {it.notes && (
                                      <div className="font-mono text-xs font-bold text-amber-800 mt-0.5 truncate">
                                        Note: {it.notes}
                                      </div>
                                    )}
                                  </div>

                                  <span className={`shrink-0 ${itemBadge.cls}`}>
                                    {itemBadge.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Clean Card Footer */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-bold">
                            {visibleItems.reduce((s, i) => s + i.quantity, 0)} Items{' '}
                            {placedFilter !== 'ALL' ? `(${placedFilter})` : 'Total'}
                          </span>
                          <span className="text-slate-400 font-medium">
                            Capt: <strong className="text-slate-700">{tk.serverName}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  <ChefHat className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                  <div className="font-bold text-xs">No Placed Orders Matching Search</div>
                </div>
              )}
            </div>
          ) : (
            /* Paid Orders 2-Column Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-700 px-1">
                <span className="font-black text-xs text-slate-800">
                  Paid Orders ({filteredPaid.length})
                </span>
              </div>

              {filteredPaid.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[780px] overflow-y-auto pr-1">
                  {filteredPaid.map((bill, idx) => {
                    const methodBadgeClass =
                      bill.method === 'UPI'
                        ? 'bg-purple-100 text-purple-900 border-purple-200'
                        : bill.method === 'CASH'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        : 'bg-blue-100 text-blue-900 border-blue-200';

                    return (
                      <div
                        key={bill.invoiceNumber || idx}
                        className="p-3.5 rounded-xl border border-[#EAE5DF] bg-white shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
                      >
                        <div>
                          {/* Bill Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs sm:text-sm font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-2xs">
                                  Table {bill.tableName}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                                  {bill.seatLabel || 'Whole Table'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold mt-1">
                                {bill.invoiceNumber} • {bill.formattedTime}
                              </div>
                            </div>

                            <span className="min-w-[85px] px-3 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center gap-1 shadow-2xs">
                              <CheckCheck className="h-3.5 w-3.5" />
                              <span>PAID</span>
                            </span>
                          </div>

                          {/* Items Breakdown */}
                          <div className="mt-2.5 space-y-2">
                            {bill.items.map((it, iIdx) => (
                              <div
                                key={it.id || iIdx}
                                className="p-2.5 rounded-xl bg-[#FAF8F5] border border-slate-200/90 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-sm sm:text-base font-black text-[#9C3D1E] shrink-0">
                                    {it.quantity}x
                                  </span>
                                  <span className="font-mono text-sm sm:text-base font-black text-slate-900 truncate">
                                    {it.name}
                                  </span>
                                </div>
                                <span className="font-mono text-sm sm:text-base font-black text-slate-900 shrink-0">
                                  ₹ {it.totalPrice || it.price * it.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Financials & Method */}
                          <div className="mt-2.5 p-2.5 bg-[#FAF8F5] rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between text-slate-500 text-xs font-bold">
                              <span>Subtotal + GST:</span>
                              <span>₹ {bill.subtotal} + ₹ {bill.totalTax}</span>
                            </div>
                            <div className="flex justify-between font-mono font-black text-slate-900 text-xs sm:text-sm pt-1 border-t border-slate-200">
                              <span>TOTAL PAID:</span>
                              <span className="text-[#9C3D1E]">₹ {bill.grandTotal}.00</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Details */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span
                            className={`min-w-[70px] text-center text-xs font-black px-2.5 py-1 rounded-lg border shadow-2xs ${methodBadgeClass}`}
                          >
                            {bill.method}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => alert(`Thermal Tax Invoice Re-Printed for ${bill.invoiceNumber}`)}
                              className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-stone-100 text-slate-600 transition cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => alert(`Digital receipt shared for ${bill.invoiceNumber}`)}
                              className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-stone-100 text-slate-600 transition cursor-pointer"
                              title="Share Receipt"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                  <Receipt className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                  <div className="font-bold text-xs">No Paid Orders Matching Search</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2: KITCHEN NOTIFICATIONS (MIDDLE 3 COLS / ~25% WIDTH)
            Separated by vertical border line (lg:border-l lg:border-slate-200 lg:pl-5)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 lg:border-l lg:border-slate-200 lg:pl-5 space-y-3">
          {/* Section Header */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                <ChefHat className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                  Kitchen Notifications
                </h2>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200">
              {kitchenNotificationsList.length}
            </span>
          </div>

          {/* Kitchen Notifications Scrollable Feed (Clean Overview, No Advance Button) */}
          <div className="space-y-2.5 max-h-[860px] overflow-y-auto pr-1">
            {kitchenNotificationsList.map((notif) => {
              const stageBadge = getStageBadge(notif.stage);
              const isReady = notif.stage === 'PLATED';
              const isPrep = notif.stage === 'PREP';
              const isServed = notif.stage === 'SERVED';
              const isReceived = notif.stage === 'RECEIVED';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-2.5 transition-all hover:shadow-xs ${
                    isReady
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isPrep
                      ? 'border-amber-300 bg-amber-50/20'
                      : isServed
                      ? 'border-slate-200 bg-slate-50/40 opacity-75'
                      : isReceived
                      ? 'border-blue-300 bg-blue-50/20'
                      : 'border-orange-200 bg-orange-50/20'
                  }`}
                >
                  {/* Top row: Table No, Chair No, Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm font-black text-white bg-[#9C3D1E] px-2.5 py-1 rounded-lg shadow-2xs">
                        Table {notif.tableNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                        Chair {notif.chairNumber}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{notif.timestamp}</span>
                    </span>
                  </div>

                  {/* Item Details: Quantity & Name */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-black text-[#9C3D1E] shrink-0">
                            {notif.quantity}x
                          </span>
                          <span className="font-mono text-sm sm:text-base font-black text-slate-900 truncate">
                            {notif.itemName}
                          </span>
                        </div>
                        {notif.options && (
                          <div className="font-mono text-xs sm:text-sm font-bold text-slate-600 mt-1 flex items-center gap-1.5 truncate">
                            <span>•</span>
                            <span>{notif.options}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Live Status Badge & Server Info */}
                  <div className="flex items-center justify-between pt-1">
                    <span className={stageBadge.cls}>
                      {stageBadge.text}
                    </span>

                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                      Pass: <strong className="text-slate-800 font-black">{notif.serverName}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3: CUSTOMER NOTIFICATIONS (RIGHT 3 COLS / ~25% WIDTH)
            Separated by vertical border line (lg:border-l lg:border-slate-200 lg:pl-5)
           ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 lg:border-l lg:border-slate-200 lg:pl-5 space-y-3">
          {/* Section Header */}
          <div className="bg-white border border-[#EAE5DF] rounded-xl p-3.5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 text-red-700">
                <BellRing className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                  Customer Notifications
                </h2>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
              {combinedCustomerPings.length}
            </span>
          </div>

          {/* Customer Notifications Scrollable Feed (Clean Overview, No Resolve Button) */}
          <div className="space-y-2.5 max-h-[860px] overflow-y-auto pr-1">
            {combinedCustomerPings.map((ping) => {
              const isResolved = ping.status === 'RESOLVED';
              const isPending = ping.status === 'PENDING';
              const isFeedback = (ping.type || '').toUpperCase() === 'FEEDBACK';

              return (
                <div
                  key={ping.id}
                  className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-2.5 transition-all hover:shadow-xs ${
                    isFeedback
                      ? 'border-amber-300 bg-amber-50/25'
                      : isResolved
                      ? 'border-slate-200 bg-slate-50/50 opacity-70'
                      : isPending
                      ? 'border-red-200 bg-red-50/15'
                      : 'border-blue-200 bg-blue-50/15'
                  }`}
                >
                  {/* Top row: Icon, Table, Chair, Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-slate-200 shrink-0">
                        {getPingIcon(ping.type)}
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-black text-rose-950 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-lg shadow-2xs">
                        Table {ping.tableNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                        {typeof ping.seatNumber === 'number'
                          ? `Chair ${ping.seatNumber}`
                          : 'Table'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                      {ping.timestamp}
                    </span>
                  </div>

                  {/* Message & Type (Feedback Fully Visible) */}
                  <div className={`p-3 rounded-xl border ${isFeedback ? 'bg-amber-50/50 border-amber-200' : 'bg-[#FAF8F5] border border-slate-200'}`}>
                    <div className="flex items-center justify-between gap-1 text-xs">
                      {isFeedback ? (
                        <span className="font-mono text-xs sm:text-sm font-black text-amber-900 flex items-center gap-1 uppercase tracking-wide">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                          <span>GUEST FEEDBACK</span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">
                          {ping.type} REQUEST
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-slate-600">
                        {ping.guestName || 'Guest'}
                      </span>
                    </div>
                    {ping.message && (
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-2 whitespace-pre-wrap leading-relaxed">
                        {ping.message}
                      </p>
                    )}
                  </div>

                  {/* Bottom row: Live Status badge */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`min-w-[85px] text-center px-3 py-1 rounded-lg text-xs font-black border shadow-2xs ${
                        isResolved
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : isPending
                          ? 'bg-rose-100 text-rose-950 border-rose-300'
                          : 'bg-blue-100 text-blue-950 border-blue-300'
                      }`}
                    >
                      {ping.status}
                    </span>

                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                      {isResolved ? 'Resolved by Waiter' : 'Awaiting Floor Server'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
