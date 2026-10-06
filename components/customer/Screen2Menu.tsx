'use client';

import React, { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { StickyBottomBar } from '../ui/StickyBottomBar';
import { ItemDrawer } from '../ui/ItemDrawer';
import { MenuItem } from '../../types/customer';
import { Search, Plus, Minus, ArrowRight, ShoppingCart, UtensilsCrossed, Ban, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Screen2MenuProps {
  isWaiterMode?: boolean;
  tabletMode?: boolean;
  tableNum?: string;
  seatNum?: number;
  waiterName?: string;
  onBack?: () => void;
  onKOTFired?: () => void;
  onSwitchToPayment?: () => void;
}

export const Screen2Menu: React.FC<Screen2MenuProps> = () => {
  const {
    setCurrentScreen,
    menuItems,
    setSelectedDetailItem,
    addToCart,
    updateCartQuantity,
    cart,
    venueName,
    tableNumber,
  } = useCustomer();

  const { inventory86 } = useSharedBridge();

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

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleOpenDetail = (item: MenuItem) => {
    const stockInfo = inventory86?.find((e) => e.id === item.id);
    if (stockInfo?.is86) {
      setToastNotice(`${item.name} is currently SOLD OUT (86) in Kitchen!`);
      setTimeout(() => setToastNotice(null), 2500);
      return;
    }
    setSelectedDetailItem(item);
    setCurrentScreen(3);
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
    const existing = cart.find((ci) => ci.menuItem.id === item.id);
    if (existing) {
      updateCartQuantity(existing.cartItemId, 1);
    } else {
      addToCart(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const existing = cart.find((ci) => ci.menuItem.id === itemId);
    if (existing) {
      updateCartQuantity(existing.cartItemId, -1);
    }
  };

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

      <div className="bg-[#FFFCF7] pb-2 flex-1 overflow-y-auto">
        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-[#8A4228]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Items, Biryanis, Starters..."
              className="w-full rounded-2xl border border-[#E8D5C3] bg-[#FFFCF7] pl-9 pr-3 py-2.5 text-xs font-semibold text-[#5B5049] placeholder:text-[#5B5049]/50 shadow-xs focus:border-[#8A4228] focus:outline-none"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="border-b border-[#E8D5C3] bg-[#FFFCF7] px-4 py-2">
          <div className="mb-1 text-[9.5px] font-black tracking-[0.24em] text-[#5B5049]/70 uppercase font-mono">
            Explore Categories
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black tracking-[0.08em] transition ${
                    isActive
                      ? 'bg-[#8A4228] text-[#FFFCF7] shadow-sm'
                      : 'bg-[#F3DFCC] text-[#5B5049] hover:bg-[#E8D5C3]'
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
              className="mx-4 mt-2 rounded-2xl bg-[#8A4228] px-3 py-2 text-center text-xs font-black text-[#FFFCF7] shadow-sm"
            >
              {toastNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Column Food Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3">
          {filteredItems.map((item) => {
            const stockInfo = inventory86?.find((e) => e.id === item.id);
            const is86 = !!stockInfo?.is86;
            const prepDelay = stockInfo?.prepDelayMinutes || 0;
            const quantityInCart = cart
              .filter((ci) => ci.menuItem.id === item.id)
              .reduce((sum, ci) => sum + ci.quantity, 0);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: is86 ? 0 : -2 }}
                onClick={() => handleOpenDetail(item)}
                className={`flex cursor-pointer flex-col justify-between rounded-[24px] border p-2.5 shadow-xs transition ${
                  is86
                    ? 'border-[#E8D5C3] bg-stone-100 opacity-60'
                    : 'border-[#E8D5C3] bg-[#FFFCF7] hover:border-[#8A4228] hover:shadow-md'
                }`}
              >
                {/* Dish Graphic / Image */}
                <div className="relative flex h-28 w-full flex-col items-center justify-center rounded-[20px] overflow-hidden border border-[#E8D5C3] bg-[#F3DFCC]/50">
                  {is86 ? (
                    <Ban className="h-8 w-8 text-stone-400" />
                  ) : (
                    <UtensilsCrossed className="h-8 w-8 text-[#8A4228]" />
                  )}
                  <span className="mt-1 font-mono text-[9px] font-black text-[#8A4228] line-clamp-1 px-2 text-center">
                    {item.prepMode || 'Authentic Handi'}
                  </span>

                  {is86 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[10px] font-black uppercase tracking-wider text-rose-300">
                      Sold Out
                    </div>
                  )}

                  {prepDelay > 0 && !is86 && (
                    <div className="absolute top-1 left-1 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[8.5px] font-bold text-white shadow-xs">
                      <Clock className="h-2.5 w-2.5" />
                      <span>+{prepDelay}m</span>
                    </div>
                  )}

                  {item.badge && !is86 && (
                    <div className="absolute top-1.5 right-1.5 rounded-full bg-[#8A4228] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#FFFCF7] shadow-xs">
                      {item.badge}
                    </div>
                  )}
                </div>

                {/* Dish Info */}
                <div className="mt-2 flex-1">
                  <h3 className="line-clamp-2 text-xs font-black text-[#5B5049] leading-snug">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-[#5B5049]/70 font-medium">
                    {item.description}
                  </p>
                </div>

                {/* Price & Quantity Controls */}
                <div className="mt-2.5 flex items-center justify-between gap-1 pt-1.5 border-t border-[#E8D5C3]/60">
                  <span className="font-mono text-xs font-extrabold text-[#8A4228]">
                    ₹{item.price}
                  </span>

                  {is86 ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 font-mono">
                      <Ban className="h-3 w-3" />
                      86&#39;d
                    </span>
                  ) : quantityInCart > 0 ? (
                    <div className="flex items-center gap-1 rounded-full border border-[#8A4228] bg-[#F3DFCC] p-0.5 shadow-xs">
                      <button
                        onClick={(e) => handleDecrement(e, item.id)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F]"
                      >
                        <Minus className="h-2.5 w-2.5 stroke-[3]" />
                      </button>
                      <span className="px-1 text-xs font-black text-[#8A4228] font-mono">
                        {quantityInCart}
                      </span>
                      <button
                        onClick={(e) => handleIncrement(e, item)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F]"
                      >
                        <Plus className="h-2.5 w-2.5 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleOpenDrawer(e, item)}
                      className="flex items-center gap-1 rounded-full border border-[#8A4228] bg-[#8A4228] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#FFFCF7] shadow-xs hover:bg-[#71351F] transition"
                    >
                      <Plus className="h-3 w-3 stroke-[3]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

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
