'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { ScreenHousing } from '../../ui/ScreenHousing';
import { WireHeader } from '../../ui/WireHeader';
import { ItemDrawer } from '../../ui/ItemDrawerLuxury';
import { MenuItem } from '../../../types/customer';
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
import { TabletMenuPanel } from '../../waiter-tablet/TabletMenuPanel';

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
    cart,
    venueName,
    tableNumber,
    seatNumber,
  } = useCustomer();

  if (isWaiterMode) {
    return (
      <TabletMenuPanel
        tableNum={tableNum || tableNumber || 'T-01'}
        seatNum={seatNum}
        captainName={waiterName || 'Floor Captain'}
        onBack={onBack || (() => setCurrentScreen(2))}
        onKOTFired={onKOTFired || (() => {})}
        onSwitchToPayment={onSwitchToPayment}
      />
    );
  }

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

  // Common colloquial and phonetic synonyms in Karnataka Donne Biryani dining
  const ALIAS_MAP: Record<string, string[]> = {
    'biryani rice': ['kushka', 'kuska', 'khuska', 'plain rice', 'rice'],
    'kaalu soup': ['kalu', 'leg', 'paya', 'bone soup', 'mutton soup', 'soup'],
    'plain soup': ['soup', 'sherva', 'sherwa'],
    'booti gojju': ['boti', 'botigojju', 'tripe', 'gojju'],
    'keema gojju': ['kheema', 'qeema', 'mince', 'keema'],
    'keema ball': ['kheema ball', 'meatball', 'kola urundai', 'ball'],
    'chicken kabab': ['kebab', 'kebob', 'pakoda', 'kabab'],
    'chilli chicken': ['chili', 'chilly', 'chilli'],
    'chicken pepper dry': ['pepper', 'pepper dry', 'dry'],
    'chicken fry': ['fry', 'roast'],
    'mutton chops': ['chops', 'ribs'],
    'mutton fry': ['mutton roast', 'fry', 'sukka'],
    'chicken donne biryani': ['cb', 'biriyani', 'biryani'],
    'mutton donne biryani': ['mb', 'biriyani', 'biryani'],
    'egg biryani': ['egg', 'motte', 'mottai'],
  };

  // Helper to determine dietary badge: VEG, EGG, NON_VEG
  const getDietType = (item: MenuItem): 'VEG' | 'EGG' | 'NON_VEG' => {
    const name = item.name.toLowerCase();
    const cat = (item.category || '').toLowerCase();
    if (name.includes('egg') && !name.includes('chicken') && !name.includes('mutton')) {
      return 'EGG';
    }
    if (cat === 'desserts' || name.includes('paneer') || name.includes('dosa') || name.includes('idli')) {
      return 'VEG';
    }
    return 'NON_VEG';
  };

  // Helper to determine Veg vs Non-Veg
  const isVegItem = (item: MenuItem) => {
    return getDietType(item) === 'VEG';
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

  // Reactive filtering with phonetic and alias matching
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const lowerName = item.name.toLowerCase();
      const hasAliasMatch = term
        ? Object.entries(ALIAS_MAP).some(([key, aliases]) => {
            if (lowerName.includes(key)) {
              return aliases.some((a) => a.includes(term) || term.includes(a));
            }
            return false;
          })
        : false;

      const matchesSearch =
        !term ||
        hasAliasMatch ||
        lowerName.includes(term) ||
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
    const existingUnplaced = cart.find((ci) => ci.menuItem.id === item.id && !ci.isOrdered);
    if (existingUnplaced) {
      updateCartQuantity(existingUnplaced.cartItemId, 1);
    } else {
      addToCart(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const existingUnplaced = cart.find((ci) => ci.menuItem.id === itemId && !ci.isOrdered);
    if (existingUnplaced) {
      updateCartQuantity(existingUnplaced.cartItemId, -1);
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
        className="flex-1 overflow-y-auto flex flex-col transition-colors duration-300 relative select-none"
        style={{
          background: 'radial-gradient(ellipse at top, #1E1914 0%, #110F0D 60%, #0A0908 100%)',
          color: '#FAF7F2',
        }}
      >
        {/* Minimal Elegant Gold Search Pill */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-amber-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dishes..."
              className="w-full rounded-full border border-amber-500/30 bg-black/40 pl-11 pr-10 py-3 text-xs font-medium text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(217,119,6,0.25)] transition backdrop-blur-md"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 p-1 rounded-full text-stone-400 hover:text-stone-200"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Silky Horizontal Scrolling Category Tabs with Glowing Gold Underline */}
        <div className="px-5 py-2.5">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none items-center">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap pb-1.5 text-xs font-serif-luxury tracking-wide transition-all relative ${
                    isActive
                      ? 'text-amber-300 font-bold text-sm'
                      : 'text-stone-400 font-medium hover:text-stone-200'
                  }`}
                >
                  <span>{cat}</span>
                  {isActive && (
                    <motion.div
                      layoutId="catActiveIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    />
                  )}
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
              className="mx-5 mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-center text-xs font-bold shadow-lg border border-amber-400/40 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 backdrop-blur-md"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              <span>{toastNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heritage Dum Deg Live Editorial Spotlight (when on All or Chef Special) */}
        {(selectedCategory === 'All' || selectedCategory === 'Chef Special') && !searchTerm && (
          <div className="px-5 pt-1 pb-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[30px] border border-amber-500/40 bg-gradient-to-br from-amber-950/60 via-stone-900/90 to-black/95 p-4 shadow-[0_16px_36px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-300 font-mono">
                    Heritage Dum Deg &bull; 1978 Daily Star
                  </span>
                </div>
              </div>

              <div className="flex gap-3.5 items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-stone-950">
                  <Image
                    src="/images/dishes/mutton-biryani.webp"
                    alt="Signature Dum Biryani"
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold font-serif-luxury text-amber-100 truncate">
                    1978 Mutton Donne Dum Biryani
                  </h4>
                  <p className="text-[10.5px] text-stone-300 line-clamp-2 mt-0.5 leading-snug">
                    Tender local cuts sealed in earthen handis with fragrant Seeraga Samba &amp; hand-ground black pepper.
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-amber-300">
                      ₹340
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const target = menuItems.find((m) => m.name.toLowerCase().includes('mutton') && m.name.toLowerCase().includes('biryani')) || menuItems[0];
                        if (target) handleOpenDetail(target);
                      }}
                      className="rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md hover:brightness-110 active:scale-95"
                    >
                      Customize &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

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
          <div className="grid grid-cols-2 gap-3.5 p-4 flex-1">
            {/* 2-Column Food Grid with Dramatic Chiaroscuro Presentation */}
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
                  whileHover={{ y: is86 ? 0 : -3 }}
                  onClick={() => handleOpenDetail(item)}
                  className={`group relative flex flex-col justify-between rounded-[28px] p-2.5 transition-all border ${
                    is86
                      ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5'
                      : 'cursor-pointer border-amber-500/20 bg-gradient-to-b from-stone-900/90 to-black/90 shadow-[0_12px_30px_rgba(0,0,0,0.6)] hover:border-amber-400/40 backdrop-blur-md'
                  }`}
                >
                  {/* Photo / Illustration Container */}
                  <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-[22px] bg-stone-950">
                    {item.image ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 240px"
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                          priority={filteredItems.indexOf(item) < 4}
                        />
                        {/* Dramatic Chiaroscuro Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      </div>
                    ) : (
                      <div className="transition-transform duration-300 group-hover:scale-105 text-amber-500">
                        {getItemIcon(item)}
                      </div>
                    )}

                    {/* Subtle Emerald / Ruby Veg Insignia */}
                    <div className="absolute top-2 left-2 z-10 flex h-4 w-4 items-center justify-center rounded-xs bg-black/60 p-0.5 border border-white/20 backdrop-blur-sm">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          getDietType(item) === 'VEG'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                            : getDietType(item) === 'EGG'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                      />
                    </div>

                    {/* Badge */}
                    {item.badge && !is86 && (
                      <div className="absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-700 text-amber-950 shadow-md">
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Dish Info */}
                  <div className="mt-2.5 px-1 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight font-serif-luxury text-amber-100">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-medium text-amber-300/75 truncate font-mono">
                        {item.prepMode || (item.category === 'Rice & Bowls' ? '12-Hr Dum' : 'Traditional')}
                      </span>
                    </div>
                  </div>

                  {/* Price Badge & Sculpted Gold CTA */}
                  <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-amber-500/15 px-1">
                    {/* Golden Price Badge */}
                    <span className="inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-black tracking-tight bg-gradient-to-r from-amber-400/20 to-amber-600/20 text-amber-300 border border-amber-400/30">
                      ₹{item.price}
                    </span>

                    {is86 ? (
                      <span className="flex items-center gap-1 rounded-md bg-rose-950/60 border border-rose-800 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 font-mono">
                        <Ban className="h-2.5 w-2.5" />
                        Sold Out
                      </span>
                    ) : quantityInCart > 0 ? (
                      <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-black/60 p-0.5">
                        <button
                          type="button"
                          onClick={(e) => handleDecrement(e, item.id)}
                          className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-600 text-white transition hover:bg-amber-500 active:scale-90"
                        >
                          <Minus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                        <span className="px-1 text-xs font-black font-mono text-amber-200">
                          {quantityInCart}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleIncrement(e, item)}
                          className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-600 text-white transition hover:bg-amber-500 active:scale-90"
                        >
                          <Plus className="h-2.5 w-2.5 stroke-[3]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleOpenDrawer(e, item)}
                        className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-950 shadow-md transition hover:brightness-110 active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
                        }}
                      >
                        <span>ADD</span>
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Animated Cart Checkout Bar (Organic Dark Glass Capsule Pill) */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="sticky bottom-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -2 }}
              onClick={() => setCurrentScreen(4)}
              className="pointer-events-auto flex w-full items-center justify-between rounded-[30px] px-6 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.8)] transition hover:brightness-105 border border-amber-400/40 backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(38, 30, 22, 0.95) 0%, rgba(18, 14, 11, 0.98) 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold font-serif-luxury text-amber-100">
                    {totalCartCount} {totalCartCount === 1 ? 'Item' : 'Items'}
                  </div>
                  <div className="text-[10px] font-medium text-stone-400">
                    Dine-in Order Ready
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-extrabold text-amber-300 font-mono">
                  ₹{totalCartAmount}
                </span>
                <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 text-xs font-bold font-serif-luxury shadow-md">
                  <span>View Order</span>
                  <ArrowRight className="h-3 w-3 stroke-[2.5]" />
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
