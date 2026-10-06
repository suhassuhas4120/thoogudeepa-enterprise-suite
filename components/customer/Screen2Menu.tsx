'use client';

import React, { useState, useMemo } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
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
    seatNumber,
  } = useCustomer();

  const { currentTheme } = useCustomerTheme();
  const { inventory86 } = useSharedBridge();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Quick Customize Bottom Sheet
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItem | null>(null);

  // Dynamically derive categories from live menu items
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(menuItems.map((item) => item.category))).filter(Boolean);
    return ['All', ...uniqueCats, 'Chef Special'];
  }, [menuItems]);

  // Helper to determine Veg vs Non-Veg
  const isVegItem = (item: MenuItem) => {
    const name = item.name.toLowerCase();
    return item.category === 'Desserts' || name.includes('paneer') || name.includes('veg');
  };

  // Helper to select icon
  const getItemIcon = (item: MenuItem) => {
    if (item.category === 'Rice & Bowls') {
      return <CookingPot className="h-8 w-8 text-amber-700/80" />;
    }
    if (item.category === 'Desserts') {
      return <Sparkles className="h-8 w-8 text-amber-600/80" />;
    }
    return <Flame className="h-8 w-8 text-orange-600/80" />;
  };

  // Reactive filtering
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
    if (stockInfo?.is86) return;
    setSelectedDetailItem(item);
    setCurrentScreen(3);
  };

  const handleOpenDrawer = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    const stockInfo = inventory86?.find((e) => e.id === item.id);
    if (stockInfo?.is86) return;
    if (item.optionsGroup1?.choices?.length <= 1 && item.optionsGroup2?.addOns?.length === 0) {
      addToCart(item);
      setToastNotice(`Added ${item.name}!`);
      setTimeout(() => setToastNotice(null), 1800);
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
            <UtensilsCrossed className="h-4 w-4 stroke-[2.2]" style={{ color: currentTheme.colors.primary }} />
            <span>Menu</span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black font-mono tracking-tight border"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.secondaryFg,
                borderColor: currentTheme.colors.border,
              }}
            >
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

      <div
        className="flex-1 overflow-y-auto flex flex-col transition-colors duration-200"
        style={{ backgroundColor: currentTheme.colors.bgApp }}
      >
        {/* Search Bar + Cart Action Button Row */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 h-4 w-4" style={{ color: currentTheme.colors.primary }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Biryanis, Kebabs..."
              className="w-full rounded-2xl border pl-10 pr-9 py-2.5 text-xs font-semibold shadow-2xs focus:outline-none transition"
              style={{
                backgroundColor: currentTheme.colors.bgSurface,
                borderColor: currentTheme.colors.border,
                color: currentTheme.colors.textPrimary,
              }}
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

          {/* Cart Icon Button Beside Search */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => setCurrentScreen(4)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-xs transition"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.primaryFg,
              boxShadow: currentTheme.colors.primaryShadow,
            }}
            title="View Cart"
          >
            <ShoppingCart className="h-5 w-5 stroke-[2.2]" />
            {totalCartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[10px] font-black ring-2 ring-white shadow-xs"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: currentTheme.colors.accentFg,
                }}
              >
                {totalCartCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Dynamic Categories Bar */}
        <div
          className="border-b px-4 py-2 transition-colors duration-200"
          style={{
            backgroundColor: currentTheme.colors.bgSurface,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div
            className="mb-1.5 text-[9.5px] font-black tracking-[0.2em] uppercase font-mono"
            style={{ color: currentTheme.colors.textMuted }}
          >
            Explore Categories
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black tracking-wide transition-all border shadow-2xs active:scale-95"
                  style={
                    isActive
                      ? {
                          backgroundColor: currentTheme.colors.pillActiveBg,
                          color: currentTheme.colors.pillActiveFg,
                          borderColor: currentTheme.colors.pillActiveBorder,
                        }
                      : {
                          backgroundColor: currentTheme.colors.pillInactiveBg,
                          color: currentTheme.colors.pillInactiveFg,
                          borderColor: currentTheme.colors.pillInactiveBorder,
                        }
                  }
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
              className="mx-4 mt-2 flex items-center justify-center gap-1.5 rounded-2xl px-3.5 py-2 text-center text-xs font-bold shadow-sm"
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.primaryFg,
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-200" />
              <span>{toastNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items Container */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center my-auto space-y-2.5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: currentTheme.colors.secondaryBg,
                color: currentTheme.colors.primary,
              }}
            >
              <Search className="h-6 w-6 stroke-[1.8]" />
            </div>
            <h4
              className="text-sm font-black"
              style={{ color: currentTheme.colors.textPrimary }}
            >
              No Dishes Found
            </h4>
            <p
              className="text-xs max-w-[220px]"
              style={{ color: currentTheme.colors.textMuted }}
            >
              We couldn&#39;t find any items matching &quot;{searchTerm}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition"
              style={{
                borderColor: currentTheme.colors.primary,
                color: currentTheme.colors.primary,
                backgroundColor: currentTheme.colors.bgSurface,
              }}
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
                  className={`group relative flex flex-col justify-between rounded-3xl border p-2.5 shadow-xs transition-all ${
                    is86
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.bgSurface,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  {/* Photo / Illustration Container */}
                  <div
                    className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl"
                    style={{
                      backgroundColor: currentTheme.colors.bgElevated,
                    }}
                  >
                    <div className="transition-transform duration-300 group-hover:scale-105">
                      {getItemIcon(item)}
                    </div>

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-1.5 left-1.5 flex h-4 w-4 items-center justify-center rounded-sm bg-white/95 p-0.5 shadow-2xs">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isVeg ? 'bg-emerald-600' : 'bg-rose-700'
                        }`}
                      />
                    </div>

                    {/* Kitchen Prep Delay Badge */}
                    {prepDelay > 0 && !is86 && (
                      <div className="absolute top-1.5 left-7 flex items-center gap-1 rounded-full bg-amber-500/95 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-2xs">
                        <Clock className="h-2.5 w-2.5" />
                        <span>+{prepDelay}m</span>
                      </div>
                    )}

                    {/* Badge */}
                    {item.badge && !is86 && (
                      <div
                        className="absolute top-1.5 right-1.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-2xs"
                        style={{
                          backgroundColor: currentTheme.colors.primary,
                          color: currentTheme.colors.primaryFg,
                        }}
                      >
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Dish Info */}
                  <div className="mt-2 flex-1">
                    <h3
                      className="line-clamp-2 text-xs font-black leading-snug"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      {item.name}
                    </h3>
                    <p
                      className="mt-0.5 line-clamp-1 text-[10px] font-medium"
                      style={{ color: currentTheme.colors.textMuted }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Cart Controls (Harmonized with Theme Button Color) */}
                  <div
                    className="mt-2.5 flex items-center justify-between gap-1 pt-1.5 border-t"
                    style={{ borderColor: currentTheme.colors.borderLight }}
                  >
                    <span
                      className="font-mono text-sm font-black"
                      style={{ color: currentTheme.colors.textPrimary }}
                    >
                      ₹{item.price}
                    </span>

                    {is86 ? (
                      <span className="flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 font-mono">
                        <Ban className="h-2.5 w-2.5" />
                        Sold Out
                      </span>
                    ) : quantityInCart > 0 ? (
                      <div
                        className="flex items-center gap-1.5 rounded-xl border p-0.5 shadow-2xs"
                        style={{
                          backgroundColor: currentTheme.colors.bgElevated,
                          borderColor: currentTheme.colors.border,
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleDecrement(e, item.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-lg transition hover:brightness-110 active:scale-90"
                          style={{ backgroundColor: currentTheme.colors.buttonBg, color: currentTheme.colors.buttonFg }}
                        >
                          <Minus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                        <span
                          className="px-1.5 text-xs font-black font-mono"
                          style={{ color: currentTheme.colors.textPrimary }}
                        >
                          {quantityInCart}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleIncrement(e, item)}
                          className="flex h-5 w-5 items-center justify-center rounded-lg transition hover:brightness-110 active:scale-90"
                          style={{ backgroundColor: currentTheme.colors.buttonBg, color: currentTheme.colors.buttonFg }}
                        >
                          <Plus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleOpenDrawer(e, item)}
                        className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-xs transition hover:brightness-105 active:scale-95"
                        style={{
                          backgroundColor: currentTheme.colors.buttonBg,
                          borderColor: currentTheme.colors.primaryBorder,
                          color: currentTheme.colors.buttonFg,
                          boxShadow: currentTheme.colors.buttonShadow,
                        }}
                      >
                        <span>ADD</span>
                        <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Animated Cart Checkout Bar */}
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
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:brightness-105"
              style={{
                backgroundColor: currentTheme.colors.primary,
                boxShadow: currentTheme.colors.primaryShadow,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">
                    VIEW CART
                  </div>
                  <div className="text-[9.5px] font-medium opacity-90">
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
