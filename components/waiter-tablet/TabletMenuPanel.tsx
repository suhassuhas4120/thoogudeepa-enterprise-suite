'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, ChevronLeft, Flame, X, CheckCircle2, Armchair, CreditCard, Ban } from 'lucide-react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useCustomerStore } from '../../store/useCustomerStore';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  option?: string;
  addOns: string[];
}

interface Props {
  tableNum: string;
  seatNum?: number; // which chair we're ordering for
  captainName: string;
  onBack: () => void;
  onKOTFired: () => void;
  onSwitchToPayment?: () => void;
}

const CATEGORIES = ['All', 'Rice & Bowls', 'Starters', 'Beverages', 'Desserts'];

// Accent colors per category badge
const BADGE_COLOR: Record<string, string> = {
  Bestseller: 'bg-amber-500 text-white',
  'Chef Special': 'bg-[#9C3D1E] text-white',
  Popular: 'bg-blue-600 text-white',
  Signature: 'bg-purple-600 text-white',
};

export function TabletMenuPanel({ tableNum, seatNum, captainName, onBack, onKOTFired, onSwitchToPayment }: Props) {
  const { waiterFiresKOT, tables, inventory86, waiterSeatsGuests } = useSharedBridge();

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customizingId, setCustomizingId] = useState<string | null>(null);
  const [pendingOption, setPendingOption] = useState('');
  const [pendingAddOns, setPendingAddOns] = useState<string[]>([]);
  const [kotFired, setKotFired] = useState(false);

  const table = tables.find((t) => t.number === tableNum);

  const filtered = useMemo(() => {
    return INITIAL_MENU_ITEMS.filter((item) => {
      const catOk = category === 'All' || item.category === category;
      const searchOk = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return catOk && searchOk;
    });
  }, [category, search]);

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const getCartQty = (itemId: string) => cart.find((c) => c.itemId === itemId)?.quantity || 0;

  const openCustomize = (itemId: string) => {
    const item = INITIAL_MENU_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    const def = item.optionsGroup1?.choices?.[0] || '';
    setPendingOption(def);
    setPendingAddOns([]);
    setCustomizingId(itemId);
  };

  const confirmAdd = () => {
    if (!customizingId) return;
    const item = INITIAL_MENU_ITEMS.find((i) => i.id === customizingId)!;
    const addOnExtra = pendingAddOns.reduce((s, ao) => {
      const found = item.optionsGroup2?.addOns?.find((a) => a.name === ao);
      return s + (found?.extraPrice || 0);
    }, 0);
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === customizingId && c.option === pendingOption);
      if (existing) {
        return prev.map((c) =>
          c.itemId === customizingId && c.option === pendingOption
            ? { ...c, quantity: c.quantity + 1, price: item.price + addOnExtra }
            : c
        );
      }
      return [...prev, {
        itemId: customizingId,
        name: item.name,
        price: item.price + addOnExtra,
        quantity: 1,
        option: pendingOption,
        addOns: pendingAddOns,
      }];
    });
    setCustomizingId(null);
  };

  const adjustQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => c.itemId === itemId ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  const fireKOT = () => {
    if (cart.length === 0) return;

    // Auto-seat guests if table is currently vacant
    const targetTable = tables.find((t) => t.number === tableNum);
    if (targetTable && targetTable.status === 'VACANT') {
      waiterSeatsGuests(tableNum, seatNum ? Math.max(1, seatNum) : 2, captainName);
    }

    waiterFiresKOT(
      tableNum,
      captainName,
      cart.map((c) => ({
        item: { id: c.itemId, name: c.name, price: c.price, category: '', prepMode: '', imagePlaceholder: '' } as any,
        quantity: c.quantity,
        selectedOption: c.option || '',
        addOns: c.addOns,
      })),
      seatNum
    );

    // Sync live tracking for customer portal when matching table is active
    try {
      const customerStore = useCustomerStore.getState();
      if (customerStore.tableNumber === tableNum) {
        const newTracking = cart.map((c) => ({
          id: `track-${c.itemId}-${Date.now()}`,
          name: `${c.name} × ${c.quantity}`,
          prepMode: 'Military Dum Handi',
          status: 'In Kitchen Preparation',
          stage: 'PREP' as const,
        }));
        customerStore.setItemTracking([
          ...customerStore.itemTracking,
          ...newTracking,
        ]);
        customerStore.setOrderStage('PREP');
      }
    } catch {}

    setKotFired(true);
    setCart([]);
    setTimeout(() => {
      setKotFired(false);
      onKOTFired();
    }, 1200);
  };

  const customItem = customizingId ? INITIAL_MENU_ITEMS.find((i) => i.id === customizingId) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#FAF8F5]">

      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-[#EAE5DF] flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 hover:bg-stone-100 rounded-xl transition cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 text-stone-500" />
        </button>
        <div className="flex-1">
          <p className="font-mono text-[9px] font-black uppercase tracking-widest text-[#9C3D1E]">
            Add Dishes · {tableNum}
            {seatNum && <span className="ml-1 text-stone-400">· Chair {seatNum}</span>}
          </p>
          <h3 className="text-sm font-black text-stone-900 tracking-tight">
            {seatNum ? `Ordering for Chair ${seatNum}` : `Ordering for All Seats`}
          </h3>
        </div>
        {/* Seat indicator pill */}
        {seatNum && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl">
            <Armchair className="h-3 w-3 text-amber-700" />
            <span className="font-mono text-[10px] font-black text-amber-800">Chair {seatNum}</span>
          </div>
        )}
        {/* Settle button if provided */}
        {onSwitchToPayment && (
          <button
            type="button"
            onClick={onSwitchToPayment}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-mono text-[11px] font-black transition cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Settle</span>
          </button>
        )}
      </div>

      {/* Search + Category pills */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-[#EAE5DF] shrink-0 space-y-2">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-[#FAF8F5] border border-[#EAE5DF] focus:border-[#9C3D1E] rounded-xl text-[11px] font-mono focus:outline-none transition"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold whitespace-nowrap border transition cursor-pointer shrink-0 ${
                category === cat
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E]'
                  : 'bg-[#FAF8F5] text-stone-600 border-[#EAE5DF] hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid — scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-stone-400 font-mono text-xs">
            No items found
          </div>
        ) : (
          filtered.map((item) => {
            const qty = getCartQty(item.id);
            const inCart = qty > 0;
            const stockInfo = inventory86?.find((e) => e.id === item.id);
            const is86 = !!stockInfo?.is86;
            return (
              <motion.div
                key={item.id}
                layout
                className={`flex gap-3 p-3 rounded-2xl border transition ${
                  is86
                    ? 'border-stone-200 bg-stone-100 opacity-60'
                    : inCart
                    ? 'border-[#9C3D1E]/40 bg-[#FFF8F5]'
                    : 'border-[#EAE5DF] bg-white'
                }`}
              >
                {/* Image placeholder */}
                <div className="h-16 w-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 relative overflow-hidden">
                  <span className="text-[8px] font-mono font-black text-stone-400 text-center leading-tight px-1">
                    {item.imagePlaceholder}
                  </span>
                  {item.badge && !is86 && (
                    <span className={`absolute top-1 left-0 right-0 mx-auto w-fit px-1.5 py-0.5 text-[7px] font-black font-mono rounded-full ${BADGE_COLOR[item.badge] || 'bg-stone-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {is86 && (
                    <span className="absolute top-1 left-0 right-0 mx-auto w-fit px-1 py-0.5 text-[7px] font-black font-mono rounded-full bg-rose-600 text-white">
                      86'd
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-stone-900 leading-tight line-clamp-1">{item.name}</p>
                  <p className="text-[9.5px] text-stone-400 font-mono mt-0.5 line-clamp-1">{item.description}</p>
                  <p className="text-[10px] font-bold text-[#9C3D1E] mt-1">₹{item.price}</p>
                </div>

                {/* Add/Qty controls */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  {is86 ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 font-mono">
                      <Ban className="h-3 w-3" />
                      Sold Out
                    </span>
                  ) : inCart ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustQty(item.id, -1)}
                        className="h-6 w-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center cursor-pointer transition"
                      >
                        <Minus className="h-3 w-3 text-stone-600" />
                      </button>
                      <span className="font-mono font-black text-sm w-4 text-center text-stone-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => openCustomize(item.id)}
                        className="h-6 w-6 rounded-lg bg-[#9C3D1E] hover:bg-[#7d3018] flex items-center justify-center cursor-pointer transition"
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openCustomize(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-xl font-mono text-[10px] font-black transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> ADD
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Customization sheet */}
      <AnimatePresence>
        {customItem && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 bg-white border-t-2 border-[#9C3D1E] rounded-t-3xl shadow-2xl z-30 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-stone-900">{customItem.name}</p>
                <p className="font-mono text-[10px] text-stone-400">₹{customItem.price}</p>
              </div>
              <button type="button" onClick={() => setCustomizingId(null)}
                className="p-1.5 hover:bg-stone-100 rounded-xl cursor-pointer">
                <X className="h-4 w-4 text-stone-400" />
              </button>
            </div>

            {/* Option group 1 */}
            {customItem.optionsGroup1 && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] font-black uppercase tracking-wider text-stone-500">
                  {customItem.optionsGroup1.title}
                </p>
                <div className="flex flex-col gap-1.5">
                  {customItem.optionsGroup1.choices.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setPendingOption(ch)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[11px] font-bold transition cursor-pointer ${
                        pendingOption === ch
                          ? 'border-[#9C3D1E] bg-[#FFF8F5] text-[#9C3D1E]'
                          : 'border-[#EAE5DF] bg-[#FAF8F5] text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                        pendingOption === ch ? 'border-[#9C3D1E]' : 'border-stone-300'
                      }`}>
                        {pendingOption === ch && <span className="h-1.5 w-1.5 rounded-full bg-[#9C3D1E]" />}
                      </span>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {customItem.optionsGroup2?.addOns && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] font-black uppercase tracking-wider text-stone-500">
                  Add-Ons (optional)
                </p>
                <div className="flex flex-col gap-1.5">
                  {customItem.optionsGroup2.addOns.map((ao) => {
                    const selected = pendingAddOns.includes(ao.name);
                    return (
                      <button
                        key={ao.name}
                        type="button"
                        onClick={() => setPendingAddOns((prev) =>
                          selected ? prev.filter((a) => a !== ao.name) : [...prev, ao.name]
                        )}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                          selected
                            ? 'border-[#9C3D1E] bg-[#FFF8F5] text-[#9C3D1E]'
                            : 'border-[#EAE5DF] bg-[#FAF8F5] text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <span>{ao.name}</span>
                        <span>+₹{ao.extraPrice}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={confirmAdd}
              className="w-full py-3 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-2xl font-mono font-black text-sm transition cursor-pointer"
            >
              Add to Order
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart bar — KOT fire */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 60 }} animate={{ y: 0 }}
          className="shrink-0 px-4 py-3 bg-white border-t border-[#EAE5DF]"
        >
          {/* Cart preview */}
          <div className="mb-2 space-y-1 max-h-[80px] overflow-y-auto">
            {cart.map((c) => (
              <div key={c.itemId} className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-stone-700 font-bold">{c.name} ×{c.quantity}</span>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">₹{c.price * c.quantity}</span>
                  <button type="button" onClick={() => removeFromCart(c.itemId)} className="text-stone-300 hover:text-rose-500 transition cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={fireKOT}
            disabled={kotFired}
            className={`w-full py-3 rounded-2xl flex items-center justify-between px-5 font-mono font-black text-sm transition cursor-pointer ${
              kotFired ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] hover:bg-stone-800 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {kotFired ? <CheckCircle2 className="h-4 w-4" /> : <Flame className="h-4 w-4 text-orange-400" />}
              <span>{kotFired ? 'KOT Fired!' : `Fire KOT — ${cartCount} items`}</span>
            </div>
            <span className="text-emerald-400">₹{cartTotal}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
