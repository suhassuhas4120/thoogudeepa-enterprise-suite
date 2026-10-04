'use client';

import React, { useState, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useSharedBridge } from '../../store/useSharedBridge';
import { ScreenHousing } from '../ui/ScreenHousing';
import { WireHeader } from '../ui/WireHeader';
import { ItemDrawer } from '../ui/ItemDrawer';
import { MenuItem } from '../../types/customer';
import {
  Search,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart,
  UtensilsCrossed,
  Ban,
  Clock,
  Flame,
  Sparkles,
  CookingPot,
  X,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Screen2Menu: React.FC = () => {
  const {
    setCurrentScreen,
    menuItems,
    setSelectedDetailItem,
    addToCart,
    updateCartQuantity,
    cart,
    venueName,
    tableNumber,
    seatNumber,
  } = useCustomer();

  const { inventory86 } = useSharedBridge();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Quick Customize Bottom Sheet
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItem | null>(null);

  // Dynamically derive categories from live menu items (no hardcoding)
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(menuItems.map((item) => item.category))).filter(Boolean);
    return ['All', ...uniqueCats, 'Chef Special'];
  }, [menuItems]);

  // Helper to determine Veg vs Non-Veg for Indian FSSAI dietary badge
  const isVegItem = (item: MenuItem) => {
    const name = item.name.toLowerCase();
    return item.category === 'Desserts' || name.includes('paneer') || name.includes('veg');
  };

  // Helper to select an evocative icon for each culinary item
  const getItemIcon = (item: MenuItem) => {
    if (item.category === 'Rice & Bowls') {
      return <CookingPot className="h-8 w-8 text-[#8A4228]" />;
    }
    if (item.category === 'Desserts') {
      return <Sparkles className="h-8 w-8 text-[#8A4228]" />;
    }
    return <Flame className="h-8 w-8 text-[#8A4228]" />;
  };

  // Reactive filtering across name, description, category, and cooking mode
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.prepMode && item.prepMode.toLowerCase().includes(term));

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Chef Special' && (item.badge === 'Chef Special' || item.badge === 'Bestseller')) ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  // Dynamic live cart calculations
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const handleOpenDetail = (item: MenuItem) => {
    const stockInfo = inventory86?.find((e) => e.id === item.id);
    if (stockInfo?.is86) {
      setToastNotice(`${item.name} is currently SOLD OUT!`);
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
      setToastNotice(`${item.name} is SOLD OUT!`);
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
    <ScreenHousing screenNumber={2} screenTitle="AUTHENTIC MENU">
      {/* Header */}
      <WireHeader
        title={
          <span className="inline-flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 stroke-[2.2] text-[#D08A52]" />
            <span>Menu</span>
            <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-black text-orange-900 font-mono tracking-tight">
              {tableNumber} • C-{String(seatNumber || 1).padStart(2, '0')}
            </span>
          </span>
        }
        leftSubtitle={venueName.toUpperCase()}
        showBack={true}
        onBack={() => setCurrentScreen(1)}
        showCallWaiter={true}
        showCart={false}
      />

      <div className="bg-[#FFFCF7] flex-1 overflow-y-auto flex flex-col">
        {/* Search Bar + Cart Action Button Row */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-[#8A4228]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Biryanis, Kebabs..."
              className="w-full rounded-2xl border border-[#E8D5C3] bg-white pl-10 pr-9 py-2.5 text-xs font-semibold text-[#5B5049] placeholder:text-[#5B5049]/50 shadow-2xs focus:border-[#8A4228] focus:outline-none transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Cart Icon Button (Icon Only, Red Badge at Top with Item Count) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => setCurrentScreen(4)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#9C3D1E] text-white shadow-xs hover:bg-[#853116] transition"
            title="View Cart"
          >
            <ShoppingCart className="h-5 w-5 stroke-[2.2]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white shadow-xs">
                {totalCartCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Dynamic Categories Bar */}
        <div className="border-b border-[#E8D5C3] bg-[#FFFCF7] px-4 py-2">
          <div className="mb-1 text-[9.5px] font-black tracking-[0.2em] text-[#5B5049]/70 uppercase font-mono">
            Explore Categories
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-black tracking-[0.06em] transition ${
                    isActive
                      ? 'bg-[#8A4228] text-[#FFFCF7] shadow-xs'
                      : 'bg-[#F3DFCC]/80 text-[#5B5049] hover:bg-[#E8D5C3]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Toast Notification */}
        <AnimatePresence>
          {toastNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-4 mt-2 flex items-center justify-center gap-1.5 rounded-2xl bg-[#8A4228] px-3.5 py-2 text-center text-xs font-bold text-[#FFFCF7] shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-200" />
              <span>{toastNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items Container */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center my-auto space-y-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3DFCC] text-[#8A4228]">
              <Search className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h4 className="text-sm font-black text-slate-800">No Dishes Found</h4>
            <p className="text-xs text-slate-500 max-w-[220px]">
              We couldn&#39;t find any items matching &quot;{searchTerm}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-2 rounded-xl border border-[#8A4228] bg-white px-3 py-1.5 text-xs font-bold text-[#8A4228] hover:bg-[#F3DFCC]"
            >
              Show All Items
            </button>
          </div>
        ) : (
          /* 2-Column Food Grid */
          <div className="grid grid-cols-2 gap-2.5 p-3 flex-1">
            {filteredItems.map((item) => {
              const stockInfo = inventory86?.find((e) => e.id === item.id);
              const is86 = !!stockInfo?.is86;
              const prepDelay = stockInfo?.prepDelayMinutes || 0;
              const isVeg = isVegItem(item);
              const quantityInCart = cart
                .filter((ci) => ci.menuItem.id === item.id)
                .reduce((sum, ci) => sum + ci.quantity, 0);

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: is86 ? 0 : -2 }}
                  onClick={() => handleOpenDetail(item)}
                  className={`flex cursor-pointer flex-col justify-between rounded-[22px] border p-2.5 shadow-2xs transition ${
                    is86
                      ? 'border-[#E8D5C3] bg-[#FAF8F5] opacity-60'
                      : 'border-[#E8D5C3] bg-white hover:border-[#8A4228] hover:shadow-md'
                  }`}
                >
                  {/* Dish Graphic / Image Area */}
                  <div className="relative flex h-28 w-full flex-col items-center justify-center rounded-[18px] overflow-hidden border border-[#E8D5C3] bg-[#F3DFCC]/40">
                    {/* FSSAI Veg / Non-Veg Indicator */}
                    <div
                      className={`absolute top-2 left-2 flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border bg-white shadow-2xs z-10 ${
                        isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}
                      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                    </div>

                    {/* Culinary Icon */}
                    {is86 ? (
                      <Ban className="h-8 w-8 text-stone-400" />
                    ) : (
                      getItemIcon(item)
                    )}

                    <span className="mt-1 font-mono text-[9px] font-black text-[#8A4228] line-clamp-1 px-2 text-center">
                      {item.prepMode || 'Authentic Handi'}
                    </span>

                    {/* Sold Out Overlay */}
                    {is86 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[10px] font-black uppercase tracking-wider text-rose-300">
                        Sold Out
                      </div>
                    )}

                    {/* Kitchen Prep Delay Badge */}
                    {prepDelay > 0 && !is86 && (
                      <div className="absolute top-1.5 left-7 flex items-center gap-1 rounded-full bg-amber-500/95 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-2xs">
                        <Clock className="h-2.5 w-2.5" />
                        <span>+{prepDelay}m</span>
                      </div>
                    )}

                    {/* Badge (Bestseller, Chef Special, Signature) */}
                    {item.badge && !is86 && (
                      <div className="absolute top-1.5 right-1.5 rounded-full bg-[#8A4228] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#FFFCF7] shadow-2xs">
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

                  {/* Price & Cart Controls */}
                  <div className="mt-2.5 flex items-center justify-between gap-1 pt-1.5 border-t border-[#E8D5C3]/60">
                    <span className="font-mono text-xs font-extrabold text-[#8A4228]">
                      ₹{item.price}
                    </span>

                    {is86 ? (
                      <span className="flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 font-mono">
                        <Ban className="h-2.5 w-2.5" />
                        Sold Out
                      </span>
                    ) : quantityInCart > 0 ? (
                      <div className="flex items-center gap-1 rounded-full border border-[#8A4228] bg-[#F3DFCC] p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={(e) => handleDecrement(e, item.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F] transition"
                        >
                          <Minus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                        <span className="px-1 text-xs font-black text-[#8A4228] font-mono">
                          {quantityInCart}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleIncrement(e, item)}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8A4228] text-white hover:bg-[#71351F] transition"
                        >
                          <Plus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
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
        )}
      </div>

      {/* Floating Animated Cart Checkout Bar (Only displays when diner has items in cart) */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="sticky bottom-0 z-20 p-3 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xs"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentScreen(4)}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#9C3D1E] via-[#8A361A] to-[#712A12] px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-950/20 transition hover:brightness-105"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-1 ring-white">
                    {totalCartCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">
                    VIEW CART
                  </div>
                  <div className="text-[9.5px] font-medium text-orange-200">
                    {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} selected
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-amber-200">
                  ₹{totalCartAmount}
                </span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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
