'use client';

import React, { useState, useMemo } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useCustomerStore } from '../../store/useCustomerStore';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
import { MenuItem } from '../../types/customer';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  UtensilsCrossed,
  Ban,
  Clock,
  Flame,
  Armchair,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  tableNum: string;
  seatNum?: number;
  waiterName: string;
  onBack: () => void;
  onKOTFired: () => void;
}

interface OrderPadItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOption?: string;
  addOns?: string[];
  totalPrice: number;
  seatNumber?: number;
}

export function ScreenM4OrderPad({
  tableNum,
  seatNum,
  waiterName,
  onBack,
  onKOTFired,
}: Props) {
  const { waiterFiresKOT, tables, inventory86, waiterSeatsGuests } = useSharedBridge();

  const draftKey = `thoogudeepa_order_pad_draft_${tableNum}_${seatNum ?? 'all'}`;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderPadItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem(`thoogudeepa_order_pad_draft_${tableNum}_${seatNum ?? 'all'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [kotFired, setKotFired] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Auto-save cart to sessionStorage to prevent data loss on refresh
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (cart.length > 0) {
        sessionStorage.setItem(draftKey, JSON.stringify(cart));
      } else {
        sessionStorage.removeItem(draftKey);
      }
    } catch {}
  }, [cart, draftKey]);

  // Quick Customize Bottom Sheet State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const categories = ['All', 'Starters', 'Rice & Bowls', 'Beverages', 'Chef Special', 'Quick Serve'];

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return INITIAL_MENU_ITEMS.filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.prepMode && item.prepMode.toLowerCase().includes(term));

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Chef Special' && (item.badge === 'Chef Special' || item.badge === 'Bestseller')) ||
        (selectedCategory === 'Quick Serve' &&
          (item.category === 'Starters' || item.category === 'Desserts' || item.category === 'Quick Serve')) ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const getCartQty = (itemId: string) => {
    return cart
      .filter((c) => c.menuItem.id === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  const addItemToCart = (
    item: MenuItem,
    opt?: string,
    addOns: string[] = [],
    qty: number = 1
  ) => {
    const chosenOpt = opt || item.optionsGroup1?.choices?.[0] || '';
    const addOnExtra = addOns.reduce((s, ao) => {
      const found = item.optionsGroup2?.addOns?.find((a) => a.name === ao);
      return s + (found?.extraPrice || 0);
    }, 0);
    const unitPrice = item.price + addOnExtra;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) =>
          c.menuItem.id === item.id &&
          c.selectedOption === chosenOpt &&
          (c.addOns || []).slice().sort().join(',') === addOns.slice().sort().join(',')
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += qty;
        copy[existingIdx].totalPrice = copy[existingIdx].quantity * unitPrice;
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId: `pad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          menuItem: item,
          quantity: qty,
          selectedOption: chosenOpt,
          addOns,
          totalPrice: qty * unitPrice,
          seatNumber: seatNum,
        },
      ];
    });
  };

  const adjustQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((c) => c.menuItem.id !== itemId);
      }
      const unitPrice = existing.totalPrice / existing.quantity;
      return prev.map((c) =>
        c.menuItem.id === itemId
          ? { ...c, quantity: newQty, totalPrice: newQty * unitPrice }
          : c
      );
    });
  };

  const adjustCartItemQty = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.cartItemId === cartItemId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((c) => c.cartItemId !== cartItemId);
      }
      const unitPrice = existing.totalPrice / existing.quantity;
      return prev.map((c) =>
        c.cartItemId === cartItemId
          ? { ...c, quantity: newQty, totalPrice: newQty * unitPrice }
          : c
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleOpenItem = (item: MenuItem) => {
    const stockInfo = inventory86?.find((e) => e.id === item.id);
    if (stockInfo?.is86) {
      setToastNotice(`${item.name} is SOLD OUT in Kitchen!`);
      setTimeout(() => setToastNotice(null), 2500);
      return;
    }
    if (item.optionsGroup1?.choices?.length || item.optionsGroup2?.addOns?.length) {
      setSelectedOption(item.optionsGroup1?.choices?.[0] || '');
      setSelectedAddOns([]);
      setQuantity(1);
      setDrawerItem(item);
      setDrawerOpen(true);
    } else {
      addItemToCart(item, undefined, [], 1);
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const targetTable = tables.find((t) => t.number === tableNum);
    if (targetTable && targetTable.status === 'VACANT') {
      waiterSeatsGuests(tableNum, seatNum ? Math.max(1, seatNum) : 2, waiterName || 'Floor Captain');
    }

    waiterFiresKOT(
      tableNum,
      waiterName || 'Floor Captain',
      cart.map((c) => ({
        item: c.menuItem,
        quantity: c.quantity,
        selectedOption: c.selectedOption || '',
        addOns: c.addOns || [],
      })),
      seatNum
    );

    // Sync live tracking for customer portal when matching table and chair are active
    try {
      const customerStore = useCustomerStore.getState();
      if (customerStore.tableNumber === tableNum && (!seatNum || customerStore.seatNumber === seatNum)) {
        const newTracking = cart.map((c) => ({
          id: `track-${c.cartItemId}`,
          name: `${c.menuItem.name} × ${c.quantity}`,
          prepMode: c.menuItem.prepMode || 'Military Dum Handi',
          status: 'In Kitchen Preparation',
          stage: 'PREP' as const,
        }));
        customerStore.setItemTracking([
          ...(customerStore.itemTracking || []),
          ...newTracking,
        ]);
        customerStore.setOrderStage('PREP');
      }
    } catch {}

    setKotFired(true);
    setTimeout(() => {
      setKotFired(false);
      setCart([]);
      onKOTFired();
    }, 900);
  };

  const drawerUnitPrice = useMemo(() => {
    if (!drawerItem) return 0;
    const addOnExtra = selectedAddOns.reduce((s, name) => {
      const found = drawerItem.optionsGroup2?.addOns?.find((a) => a.name === name);
      return s + (found?.extraPrice || 0);
    }, 0);
    return drawerItem.price + addOnExtra;
  }, [drawerItem, selectedAddOns]);

  return (
    <div className="bg-[#FAF8F5] flex flex-col font-sans relative select-none overflow-hidden h-full min-h-screen">
      {/* Waiter Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b-2 border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-2xs backdrop-blur-md shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-xs font-black text-stone-700 hover:text-[#9C3D1E] py-1.5 px-3 rounded-xl bg-stone-50 border border-[#EAE5DF] transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black uppercase text-[#9C3D1E] bg-[#FFF8F5] border-2 border-[#9C3D1E]/40 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
            <Armchair className="h-4 w-4 stroke-[2.4]" />
            <span>{seatNum ? `Chair ${seatNum}` : 'All Table'}</span>
          </span>
          <span className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-3 py-1 rounded-xl border-2 border-stone-200">
            {tableNum}
          </span>
        </div>
      </header>

      {/* Prominent Chair Context Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-[#FFF8F5] border-b-2 border-amber-200/80 px-4 py-2 flex items-center justify-between font-mono text-xs shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-[#9C3D1E] text-white flex items-center justify-center font-black text-xs shadow-2xs">
            {seatNum ? seatNum : 'T'}
          </div>
          <span className="font-black text-stone-900 text-xs">
            {seatNum ? `Ordering for Chair ${seatNum} (${tableNum})` : `Ordering for All Seats (${tableNum})`}
          </span>
        </div>
        <span className="text-[11px] font-bold text-stone-600">
          {waiterName || 'Floor Captain'}
        </span>
      </div>

      {/* Sticky Search Bar and Cart Icon (Pinned at top when scrolled) */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/98 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center gap-2.5 border-b border-stone-200/80 shrink-0 shadow-xs">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 h-5 w-5 text-[#9C3D1E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Dishes, Donne Biryani, Starters..."
            className="w-full rounded-2xl border-2 border-stone-300 bg-white pl-11 pr-10 py-3 text-sm font-bold text-stone-950 placeholder:text-stone-400 shadow-xs focus:border-[#9C3D1E] focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Cart Icon Button directly beside Search Bar */}
        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative h-12 w-12 rounded-2xl bg-white border-2 border-stone-300 hover:border-[#9C3D1E] active:scale-95 text-[#9C3D1E] flex items-center justify-center shrink-0 shadow-xs transition cursor-pointer group"
          title="View Order Cart"
          aria-label="View Order Cart"
        >
          <ShoppingCart className="h-5 w-5 stroke-[2.4] group-hover:scale-110 transition-transform" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#9C3D1E] text-white text-[10.5px] font-mono font-black rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-scale-in">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pb-24 bg-[#FAF8F5]">
        {/* Categories Bar - High Contrast Pills */}
        <div className="border-b-2 border-stone-200 bg-white px-4 py-2.5">
          <div className="mb-1.5 text-[11px] font-black tracking-widest text-stone-700 uppercase font-mono">
            Explore Categories
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black tracking-wide transition cursor-pointer border-2 ${
                    isActive
                      ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                      : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toast Notice */}
        <AnimatePresence>
          {toastNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-4 mt-2 rounded-2xl bg-[#9C3D1E] px-4 py-2.5 text-center text-xs font-black text-white shadow-md border border-amber-300/40"
            >
              {toastNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Column Food Grid */}
        <div className="grid grid-cols-2 gap-3 p-3">
          {filteredItems.map((item) => {
            const stockInfo = inventory86?.find((e) => e.id === item.id);
            const is86 = !!stockInfo?.is86;
            const prepDelay = stockInfo?.prepDelayMinutes || 0;
            const inCartQty = getCartQty(item.id);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: is86 ? 0 : -2 }}
                onClick={() => !is86 && handleOpenItem(item)}
                className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-3 shadow-xs transition ${
                  is86
                    ? 'border-stone-300 bg-stone-100 opacity-60'
                    : 'border-stone-200 bg-white hover:border-[#9C3D1E] hover:shadow-md'
                }`}
              >
                {/* Dish Graphic / Image Area */}
                <div className="relative flex h-28 w-full flex-col items-center justify-center rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                  {is86 ? (
                    <Ban className="h-8 w-8 text-stone-400" />
                  ) : (
                    <UtensilsCrossed className="h-8 w-8 text-[#9C3D1E]" />
                  )}
                  <span className="mt-1 font-mono text-[10px] font-black text-[#9C3D1E] line-clamp-1 px-2 text-center">
                    {item.prepMode || 'Military Dum Handi'}
                  </span>

                  {is86 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 font-mono text-xs font-black uppercase tracking-wider text-rose-300">
                      Sold Out
                    </div>
                  )}

                  {prepDelay > 0 && !is86 && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
                      <Clock className="h-3 w-3" />
                      <span>+{prepDelay}m</span>
                    </div>
                  )}

                  {item.badge && !is86 && (
                    <div className="absolute top-1.5 right-1.5 rounded-lg bg-[#9C3D1E] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Dish Info with Big Clear Typography */}
                <div className="mt-2.5 flex-1">
                  <h3 className="line-clamp-2 text-sm font-black text-stone-950 leading-tight">
                    {item.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-600 leading-normal font-medium">
                    {item.description}
                  </p>
                </div>

                {/* Price & Quantity Controls */}
                <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t-2 border-stone-100">
                  <span className="font-mono text-base font-black text-[#9C3D1E]">
                    ₹{item.price}
                  </span>

                  {is86 ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 font-mono">
                      <Ban className="h-3.5 w-3.5" />
                      86&#39;d
                    </span>
                  ) : inCartQty > 0 ? (
                    <div
                      className="flex items-center gap-1.5 rounded-xl border-2 border-[#9C3D1E] bg-amber-50 p-0.5 shadow-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustQty(item.id, -1);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#9C3D1E] text-white hover:bg-[#802f15] cursor-pointer"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="px-1 text-xs font-black text-[#9C3D1E] font-mono">
                        {inCartQty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustQty(item.id, 1);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#9C3D1E] text-white hover:bg-[#802f15] cursor-pointer"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenItem(item);
                      }}
                      className="flex items-center gap-1 rounded-xl border-2 border-[#9C3D1E] bg-[#9C3D1E] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-xs hover:bg-[#802f15] transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Waiter Sticky Bottom Bar: Place Order */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 border-t-2 border-stone-200 shadow-xl backdrop-blur-md">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={kotFired}
            onClick={handlePlaceOrder}
            className="flex w-full items-center justify-between rounded-2xl bg-[#9C3D1E] hover:bg-[#853216] px-5 py-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition cursor-pointer disabled:opacity-75"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-300" />
              <span className="text-sm">{kotFired ? 'Order Placed!' : 'Place Order'}</span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-black text-white font-mono">
                {totalCartCount} Items
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-base font-black text-amber-200">
              <span>₹{totalCartAmount}</span>
              <ArrowRight className="h-5 w-5 stroke-[3]" />
            </div>
          </motion.button>
        </div>
      )}

      {/* Compact Quick Customization Bottom Drawer */}
      <AnimatePresence>
        {drawerOpen && drawerItem && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDrawerOpen(false);
                setDrawerItem(null);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet - Compact, sleek, less area at bottom */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t-2 border-[#9C3D1E] shadow-2xl p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="min-w-0 pr-2">
                  <span className="font-mono text-[9px] font-black uppercase text-[#9C3D1E] tracking-wider">
                    {drawerItem.prepMode || drawerItem.category}
                  </span>
                  <h3 className="text-sm font-black text-stone-900 truncate">
                    {drawerItem.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#9C3D1E]">
                    ₹{drawerItem.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setDrawerItem(null);
                    }}
                    className="p-1 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Option Choices - Compact horizontal chips */}
              {drawerItem.optionsGroup1?.choices && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-black uppercase tracking-wider text-stone-500">
                    {drawerItem.optionsGroup1.title}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {drawerItem.optionsGroup1.choices.map((ch) => {
                      const isSelected = selectedOption === ch;
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setSelectedOption(ch)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-2xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons - Compact chips */}
              {drawerItem.optionsGroup2?.addOns && drawerItem.optionsGroup2.addOns.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-black uppercase tracking-wider text-stone-500">
                    {drawerItem.optionsGroup2.title || 'Add-Ons'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {drawerItem.optionsGroup2.addOns.map((ao) => {
                      const isSelected = selectedAddOns.includes(ao.name);
                      return (
                        <button
                          key={ao.name}
                          type="button"
                          onClick={() =>
                            setSelectedAddOns((prev) =>
                              isSelected ? prev.filter((a) => a !== ao.name) : [...prev, ao.name]
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 border-[#9C3D1E] text-[#9C3D1E] shadow-2xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span>{ao.name}</span>
                          <span className="font-mono text-[10px] opacity-80">+₹{ao.extraPrice}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action row with inline stepper and Add button */}
              <div className="pt-2 flex items-center gap-2.5">
                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 bg-stone-100 px-2 py-1.5 rounded-xl border border-stone-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-6 w-6 rounded-lg bg-white flex items-center justify-center font-black text-stone-700 shadow-2xs cursor-pointer hover:bg-stone-50"
                  >
                    <Minus className="h-3 w-3 stroke-[3]" />
                  </button>
                  <span className="font-mono text-xs font-black text-stone-900 w-5 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-6 w-6 rounded-lg bg-white flex items-center justify-center font-black text-stone-700 shadow-2xs cursor-pointer hover:bg-stone-50"
                  >
                    <Plus className="h-3 w-3 stroke-[3]" />
                  </button>
                </div>

                {/* Add to Order Button */}
                <button
                  type="button"
                  onClick={() => {
                    addItemToCart(drawerItem, selectedOption, selectedAddOns, quantity);
                    setDrawerOpen(false);
                    setDrawerItem(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#9C3D1E] hover:bg-[#853216] text-white flex items-center justify-between font-mono text-xs font-black transition cursor-pointer shadow-md"
                >
                  <span>Add to Order</span>
                  <span className="text-amber-200 text-sm">
                    ₹{drawerUnitPrice * quantity}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOP CART DRAWER (HALF PAGE DRAWER SLIDING DOWN FROM THE TOP) ── */}
      <AnimatePresence>
        {isCartDrawerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartDrawerOpen(false)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
            />

            {/* Top Sheet - sliding down from top, half page height */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-b-3xl border-b-4 border-[#9C3D1E] shadow-2xl flex flex-col max-h-[58vh] overflow-hidden font-sans"
            >
              {/* Drawer Top Header */}
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-2xs shrink-0">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900 font-mono tracking-tight flex items-center gap-2">
                      <span>Order Cart</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-[#9C3D1E] border border-amber-300">
                        {seatNum ? `Chair ${seatNum}` : 'All Seats'}
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-stone-500">
                      Table {tableNum} • {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold text-stone-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                    title="Close Cart"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {cart.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#9C3D1E] flex items-center justify-center mx-auto shadow-2xs">
                      <ShoppingCart className="h-6 w-6 stroke-[1.8]" />
                    </div>
                    <p className="text-xs font-black text-stone-800 font-mono">
                      Your order cart is empty
                    </p>
                    <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                      Tap the &quot;Add&quot; button on any menu item below to build the table order.
                    </p>
                  </div>
                ) : (
                  cart.map((cartItem) => (
                    <div
                      key={cartItem.cartItemId}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-stone-900 truncate">
                            {cartItem.menuItem.name}
                          </h4>
                          {cartItem.seatNumber && (
                            <span className="text-[9px] font-mono font-black text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/20 px-1.5 py-0.2 rounded shrink-0">
                              Ch {cartItem.seatNumber}
                            </span>
                          )}
                        </div>

                        {cartItem.selectedOption && (
                          <div className="text-[10px] text-stone-500 truncate mt-0.5">
                            {cartItem.selectedOption}
                          </div>
                        )}

                        {cartItem.addOns && cartItem.addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cartItem.addOns.map((ao, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[8.5px] font-black font-mono"
                              >
                                + {ao}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-[11px] font-mono font-black text-[#9C3D1E] mt-1">
                          ₹{cartItem.totalPrice.toFixed(2)}
                          <span className="text-[9.5px] font-normal text-stone-400 ml-1">
                            (₹{(cartItem.totalPrice / cartItem.quantity).toFixed(0)} each)
                          </span>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-xl border-2 border-stone-200 shadow-2xs shrink-0">
                        <button
                          type="button"
                          onClick={() => adjustCartItemQty(cartItem.cartItemId, -1)}
                          className="h-6 w-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-black transition cursor-pointer active:scale-95"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 stroke-[3]" />
                        </button>
                        <span className="w-5 text-center font-mono text-xs font-black text-stone-900">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustCartItemQty(cartItem.cartItemId, 1)}
                          className="h-6 w-6 rounded-lg bg-[#9C3D1E] hover:bg-[#853216] text-white flex items-center justify-center font-black transition cursor-pointer active:scale-95 shadow-2xs"
                          title="Increase quantity"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer with Total & Firing Action */}
              {cart.length > 0 && (
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-black text-stone-500 block">
                      Total Cart Amount
                    </span>
                    <span className="text-lg font-black font-mono text-[#9C3D1E]">
                      ₹{totalCartAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-mono text-xs font-bold hover:bg-stone-100 transition cursor-pointer"
                    >
                      + Add More
                    </button>
                    <button
                      type="button"
                      disabled={kotFired}
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        handlePlaceOrder();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#9C3D1E] hover:bg-[#853216] text-white font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md active:scale-95 disabled:opacity-75"
                    >
                      <Flame className="h-4 w-4 text-amber-300" />
                      <span>{kotFired ? 'Placed!' : 'Fire KOT'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Drag Handle Pill */}
              <div className="py-1 bg-stone-100 flex justify-center">
                <div className="h-1 w-12 bg-stone-300 rounded-full" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
