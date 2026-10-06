'use client';

import React, { useState } from 'react';
import { useCustomer, useCustomerStore } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { ItemDrawer } from '../ui/ItemDrawer';
import { MenuItem, IndividualItemTracking, OrderStage } from '../../types/customer';
import {
  Search,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  UtensilsCrossed,
  Ban,
  Clock,
  Flame,
  Armchair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Screen2MenuProps {
  isWaiterMode?: boolean;
  tabletMode?: boolean;
  tableNum?: string;
  seatNum?: number;
  waiterName?: string;
  onBack?: () => void;
  onKOTFired?: () => void;
  onSwitchToPayment?: () => void;
}

export const Screen2Menu: React.FC<Screen2MenuProps> = ({
  isWaiterMode = false,
  tabletMode = false,
  tableNum,
  seatNum,
  waiterName,
  onBack,
  onKOTFired,
  onSwitchToPayment,
}) => {
  const {
    setCurrentScreen,
    menuItems,
    setSelectedDetailItem,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    cart,
    venueName,
    tableNumber,
  } = useCustomer();

  const { inventory86, tables, waiterSeatsGuests, waiterFiresKOT } = useSharedBridge();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Quick Customize Bottom Sheet
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItem | null>(null);

  const categories = ['All', 'Starters', 'Rice & Bowls', 'Beverages', 'Chef Special', 'Quick Serve'];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Chef Special' && item.badge === 'Chef Special') ||
      (selectedCategory === 'Quick Serve' &&
        (item.category === 'Starters' || item.category === 'Desserts' || item.category === 'Quick Serve')) ||
      item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const effectiveTableNum = tableNum || tableNumber || 'T-01';
  const effectiveSeatNum = seatNum;

  // Active cart scoped strictly to this table and (if set) this chair
  const activeCart = cart.filter((c) => {
    if (isWaiterMode) {
      const matchTable = !c.tableNumber || c.tableNumber === effectiveTableNum;
      const matchSeat = effectiveSeatNum !== undefined ? c.seatNumber === effectiveSeatNum : true;
      return matchTable && matchSeat;
    }
    return !c.tableNumber || c.tableNumber === tableNumber;
  });

  const totalCartCount = activeCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = activeCart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleOpenDetail = (item: MenuItem) => {
    const stockInfo = inventory86?.find((e) => e.id === item.id);
    if (stockInfo?.is86) {
      setToastNotice(`${item.name} is currently SOLD OUT (86) in Kitchen!`);
      setTimeout(() => setToastNotice(null), 2500);
      return;
    }
    setSelectedDetailItem(item);
    if (!isWaiterMode) {
      setCurrentScreen(3);
    } else {
      setDrawerItem(item);
      setDrawerOpen(true);
    }
  };

  const handleOpenDrawer = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    const stockInfo = inventory86?.find((e) => e.id === item.id);
    if (stockInfo?.is86) {
      setToastNotice(`${item.name} is SOLD OUT in Kitchen!`);
      setTimeout(() => setToastNotice(null), 2500);
      return;
    }
    setDrawerItem(item);
    setDrawerOpen(true);
  };

  const handleIncrement = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    const existing = activeCart.find((ci) => ci.menuItem.id === item.id);
    if (existing) {
      updateCartQuantity(existing.cartItemId, 1);
    } else {
      addToCart(
        item,
        undefined,
        undefined,
        1,
        isWaiterMode ? effectiveTableNum : undefined,
        isWaiterMode ? effectiveSeatNum : undefined
      );
    }
  };

  const handleDecrement = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const existing = activeCart.find((ci) => ci.menuItem.id === itemId);
    if (existing) {
      updateCartQuantity(existing.cartItemId, -1);
    }
  };

  // Waiter Fire KOT Handler (Live syncs Kitchen KDS + Customer Live Tracking & Bill)
  const handleWaiterFireKOT = () => {
    if (activeCart.length === 0) return;
    const targetTableNum = effectiveTableNum;
    const captain = waiterName || 'Floor Captain';
    const customerStore = useCustomerStore.getState();

    // 1. Seat guests if vacant (ensure capacity fits this chair)
    const targetTable = tables.find((t) => t.number === targetTableNum);
    if (targetTable && targetTable.status === 'VACANT') {
      waiterSeatsGuests(targetTableNum, 1, captain);
    }

    // 2. Fire KOT to Kitchen KDS tagged with chair/seat number
    waiterFiresKOT(
      targetTableNum,
      captain,
      activeCart.map((c) => ({
        item: c.menuItem,
        selectedOption: c.selectedOption,
        quantity: c.quantity,
      })),
      effectiveSeatNum
    );

    // 3. Sync Customer Live Tracking & Bill for this table
    customerStore.setTableNumber(targetTableNum);
    const newTracking: IndividualItemTracking[] = activeCart.map((c) => ({
      id: 'track-' + c.cartItemId,
      name: `${c.menuItem.name} × ${c.quantity}`,
      prepMode: c.prepMode,
      status: 'In Kitchen Preparation',
      stage: 'PREP' as OrderStage,
    }));
    customerStore.setItemTracking([
      ...customerStore.itemTracking,
      ...newTracking,
    ]);
    customerStore.setOrderStage('PREP');

    // Update customer live payment totals
    const addedSubtotal = activeCart.reduce((s, c) => s + c.totalPrice, 0);
    const prevPayment = customerStore.payment;
    const newSubtotal = prevPayment.subtotal + addedSubtotal;
    const newTax = Math.round(newSubtotal * 0.05);
    customerStore.payment = {
      ...prevPayment,
      subtotal: newSubtotal,
      tax: newTax,
      totalAmount: newSubtotal + newTax + (prevPayment.tipAmount || 0),
    };

    customerStore.setCurrentScreen(5); // Switches customer mobile device to Screen 5 Live Tracking!

    // 4. Clear ONLY activeCart items
    activeCart.forEach((ci) => removeCartItem(ci.cartItemId));

    onKOTFired?.();
  };

  // The Shared 2-Column Food Grid and Categories Content
  const menuBodyContent = (
    <div className="bg-[#FAF8F5] pb-2 flex-1 overflow-y-auto">
      {/* Search Input - Large, High Contrast */}
      <div className="px-4 pt-3.5 pb-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-5 w-5 text-[#9C3D1E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Dishes, Donne Biryani, Starters..."
            className="w-full rounded-2xl border-2 border-stone-300 bg-white pl-11 pr-4 py-3 text-sm font-bold text-stone-950 placeholder:text-stone-400 shadow-xs focus:border-[#9C3D1E] focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Bar - High Contrast Pills */}
      <div className="border-b-2 border-stone-200 bg-white px-4 py-2.5">
        <div className="mb-1.5 text-[11px] font-black tracking-widest text-stone-700 uppercase font-mono">
          Explore Categories
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
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

      {/* 2-Column Food Grid with Larger Cards and High Visibility */}
      <div className="grid grid-cols-2 gap-3 p-3">
        {filteredItems.map((item) => {
          const stockInfo = inventory86?.find((e) => e.id === item.id);
          const is86 = !!stockInfo?.is86;
          const prepDelay = stockInfo?.prepDelayMinutes || 0;
          const quantityInCart = activeCart
            .filter((ci) => ci.menuItem.id === item.id)
            .reduce((sum, ci) => sum + ci.quantity, 0);

          return (
            <motion.div
              key={item.id}
              draggable={!is86}
              onDragStart={(e: any) => {
                if (is86) return;
                (window as any).__draggedMenuItem = item;
                try {
                  e.dataTransfer?.setData('text/plain', item.name);
                  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
                } catch {}
              }}
              onDragEnd={() => {
                (window as any).__draggedMenuItem = null;
              }}
              whileHover={{ y: is86 ? 0 : -2 }}
              onClick={() => handleOpenDetail(item)}
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
                  {item.prepMode || 'Authentic Handi'}
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
                ) : quantityInCart > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-xl border-2 border-[#9C3D1E] bg-amber-50 p-0.5 shadow-xs">
                    <button
                      type="button"
                      onClick={(e) => handleDecrement(e, item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#9C3D1E] text-white hover:bg-[#802f15] cursor-pointer"
                    >
                      <Minus className="h-3 w-3 stroke-[3]" />
                    </button>
                    <span className="px-1 text-xs font-black text-[#9C3D1E] font-mono">
                      {quantityInCart}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleIncrement(e, item)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#9C3D1E] text-white hover:bg-[#802f15] cursor-pointer"
                    >
                      <Plus className="h-3 w-3 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleOpenDrawer(e, item)}
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
  );

  // ── 1. WAITER DIRECT ORDERING MODE ──
  if (isWaiterMode) {
    const currentTableObj = tables.find((t) => t.number === effectiveTableNum);
    const tableCapacity = currentTableObj?.capacity || 2;
    const allChairsLabel = Array.from({ length: tableCapacity }, (_, i) => i + 1).join(', ');
    const bannerContextText = seatNum
      ? `${effectiveTableNum} - Chair ${seatNum}`
      : `${effectiveTableNum} - Chair ${allChairsLabel}`;

    return (
      <div className={`bg-[#FAF8F5] flex flex-col font-sans relative select-none overflow-hidden ${
        tabletMode ? 'w-full h-full' : 'h-[100dvh] w-full'
      }`}>
        {/* Waiter Sticky Header */}
        <header className="sticky top-0 z-40 bg-white/95 border-b-2 border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-2xs backdrop-blur-md">
          {onBack && !tabletMode && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 font-mono text-xs font-black text-stone-700 hover:text-[#9C3D1E] py-1 px-2.5 rounded-xl bg-stone-50 border border-[#EAE5DF] transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase text-[#9C3D1E] bg-[#FFF8F5] border-2 border-[#9C3D1E]/40 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
              <Armchair className="h-4 w-4 stroke-[2.4]" />
              <span>{seatNum ? `Chair-${seatNum}` : effectiveTableNum}</span>
            </span>
          </div>

          {onSwitchToPayment && (
            <button
              type="button"
              onClick={onSwitchToPayment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-purple-50 text-purple-700 border-2 border-purple-300 rounded-xl font-mono text-xs font-black transition cursor-pointer shadow-2xs"
            >
              <span>💳 Settle Bill</span>
            </button>
          )}
        </header>

        {/* Prominent Chair Context Banner so waiter never forgets seat context */}
        <div className="bg-gradient-to-r from-amber-50 to-[#FFF8F5] border-b-2 border-amber-200/80 px-4 py-2 flex items-center justify-between font-mono text-xs shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#9C3D1E] text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {seatNum ? 'C' : 'T'}
            </div>
            <span className="font-black text-stone-900 text-xs">
              {bannerContextText}
            </span>
          </div>
          <span className="text-[11px] font-bold text-stone-600">
            {waiterName || 'Floor Captain'}
          </span>
        </div>

        {/* Exact Menu Grid */}
        {menuBodyContent}

        {/* Waiter Sticky Bottom Bar: Place Order */}
        {totalCartCount > 0 && (
          <div className="sticky bottom-0 z-40 p-3 bg-white/95 border-t-2 border-stone-200 shadow-xl backdrop-blur-md">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleWaiterFireKOT}
              className="flex w-full items-center justify-between rounded-2xl bg-[#9C3D1E] hover:bg-[#853216] px-5 py-4 text-xs font-black uppercase tracking-wider text-white shadow-md transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🍽️</span>
                <span className="text-sm font-black tracking-wide">Place Order</span>
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

        {/* Quick Customize Drawer */}
        <ItemDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          item={drawerItem}
          onAddToCart={(item, opt, addons, qty) => {
            addToCart(
              item,
              opt,
              addons,
              qty,
              effectiveTableNum,
              effectiveSeatNum
            );
            setToastNotice(`Added ${item.name}!`);
            setTimeout(() => setToastNotice(null), 1800);
          }}
        />
      </div>
    );
  }

  // ── 2. CUSTOMER PORTAL MODE (Default) ──
  return (
    <ScreenHousing screenNumber={2} screenTitle="MENU PAGE (DOUBLE COLUMN GRID)">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 stroke-[2.2] text-[#D08A52]" />
            <span>Menu</span>
          </span>
        }
        leftSubtitle={`${venueName} | TABLE ${tableNumber}`}
        showBack={false}
        showCallWaiter={true}
        showCart={false}
      />

      {menuBodyContent}

      {/* Sticky Bottom Bar: Go to Cart */}
      <StickyBottomBar>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentScreen(4)}
          className="flex w-full items-center justify-between rounded-[20px] bg-[#8A4228] px-4 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-[#FFFCF7] shadow-lg transition hover:bg-[#71351F]"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            <span>Go To Cart</span>
            {totalCartCount > 0 && (
              <span className="rounded-full bg-[#D08A52] px-2 py-0.5 text-[9px] font-black text-[#FFFCF7]">
                {totalCartCount} Items
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {totalCartAmount > 0 && (
              <span className="font-mono text-sm font-bold text-[#F3DFCC]">
                ₹{totalCartAmount}
              </span>
            )}
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </div>
        </motion.button>
      </StickyBottomBar>

      {/* Quick Customize Drawer */}
      <ItemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={drawerItem}
        onAddToCart={(item, opt, addons, qty) => {
          addToCart(item, opt, addons, qty);
          setToastNotice(`Added ${item.name}!`);
          setTimeout(() => setToastNotice(null), 1800);
        }}
      />
    </ScreenHousing>
  );
};
