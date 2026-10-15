'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCustomer } from '../../../context/CustomerContext';
import { useCustomerTheme } from '../../../context/ThemeContext';
import { useSharedBridge } from '../../../store/useSharedBridge';
import { MenuItem } from '../../../types/customer';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  UtensilsCrossed,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Flame,
  Check,
  Moon,
  Sun,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'All', label: 'All', icon: '/assets/royal/menu/cat_all.png' },
  { id: 'Sunday Specials', label: 'Sunday Specials', icon: '/assets/royal/menu/cat_sunday_specials.png' },
  { id: 'Starters', label: 'Starters', icon: '/assets/royal/menu/cat_starters.png' },
  { id: 'Rice & Biryani', label: 'Rice & Biryani', icon: '/assets/royal/menu/cat_rice_biryani.png' },
  { id: 'Chef Special', label: 'Chef Special', icon: '/assets/royal/menu/cat_chef_special.png' },
];

// Reference Dish Artwork Mapping for Authentic Royal Presentation
const ROYAL_DISH_IMAGES: Record<string, string> = {
  'Kaalu Soup': '/assets/royal/menu/dish_kaalu_soup.png',
  'Plain Soup': '/assets/royal/menu/dish_plain_soup.png',
  'Idli (2pcs)': '/assets/royal/menu/dish_idli.png',
  'Dosa (2pcs)': '/assets/royal/menu/dish_dosa.png',
};

// Taglines from reference
const DISH_TAGLINES: Record<string, string> = {
  'Kaalu Soup': 'Aromatic • Peppery • Comforting',
  'Plain Soup': 'Light • Healthy • Refreshing',
  'Idli (2pcs)': 'Steamed • Soft • Wholesome',
  'Dosa (2pcs)': 'Crispy • Classic • Delicious',
  'Booti Gojju': 'Rich • Spiced • Traditional',
  'Keema Gojju': 'Tender • Savory • Slow Cooked',
  'Mutton Biryani': 'Fragrant • Seeraga Samba • Dum Deg',
  'Chicken Biryani': 'Succulent • Military Style • Spiced',
};

const IS_VEG: Record<string, boolean> = {
  'Idli (2pcs)': true,
  'Dosa (2pcs)': true,
};

export const Screen2MenuRoyal: React.FC = () => {
  const {
    setCurrentScreen,
    menuItems,
    setSelectedDetailItem,
    addToCart,
    updateCartQuantity,
    cart,
    tableNumber,
    seatNumber,
  } = useCustomer();

  const { currentThemeId, setTheme } = useCustomerTheme();
  const { inventory86 } = useSharedBridge();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Cart totals calculation
  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((acc, it) => acc + (it.menuItem.price * it.quantity), 0);
  }, [cart]);

  // Featured Hero Item (Mutton Donne Dum Biryani)
  const heroItem = useMemo(() => {
    const found = menuItems.find(
      (it) => it.name.toLowerCase().includes('mutton biryani') || it.name.toLowerCase().includes('mutton donne')
    );
    if (found) return found;
    return {
      id: 'dish-hero-mutton',
      name: 'Mutton Donne Dum Biryani',
      price: 340,
      category: 'Rice & Biryani',
      description: 'Tender local cuts sealed in earthen handle with fragrant seeraga Samba & hand-ground black pepper.',
      prepMode: 'Heritage Dum Deg',
      imagePlaceholder: 'MUTTON DUM BIRYANI',
    } as MenuItem;
  }, [menuItems]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Exclude hero item from main grid if desired, or keep both
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Chef Special') {
        return item.badge === 'Chef Special' || item.name === 'Kaalu Soup';
      }
      return item.category === selectedCategory;
    });
  }, [menuItems, searchTerm, selectedCategory]);

  const getItemQuantity = (itemId: string) => {
    const entry = cart.find((c) => c.menuItem.id === itemId);
    return entry ? entry.quantity : 0;
  };

  const handleAddItem = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSoldOut = inventory86.some((item86) => item86.id === item.id && item86.is86);
    if (isSoldOut) {
      setToastNotice(`${item.name} is currently sold out!`);
      setTimeout(() => setToastNotice(null), 2500);
      return;
    }
    const existingUnplaced = cart.find(
      (ci) => ci.menuItem.id === item.id && !ci.isOrdered
    );
    if (existingUnplaced) {
      updateCartQuantity(existingUnplaced.cartItemId, 1);
    } else {
      addToCart(item);
    }
    setToastNotice(`Added ${item.name} to cart`);
    setTimeout(() => setToastNotice(null), 1800);
  };

  const handleUpdateQuantity = (itemId: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existingUnplaced = cart.find(
      (ci) => ci.menuItem.id === itemId && !ci.isOrdered
    );
    if (existingUnplaced) {
      updateCartQuantity(existingUnplaced.cartItemId, delta);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#080502] text-[#F3E7D3] font-sans antialiased overflow-x-hidden pb-32">
      {/* Background Subtle Palace Depth */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 15%, rgba(138, 66, 40, 0.22) 0%, rgba(8, 5, 2, 0.95) 70%)',
        }}
      />

      {/* Ornate Corner Flourishes */}
      <div 
        className="fixed top-0 left-0 w-16 h-16 pointer-events-none z-10 opacity-75"
        style={{
          backgroundImage: "url('/assets/royal/menu/corner_top_left.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div 
        className="fixed top-0 right-0 w-16 h-16 pointer-events-none z-10 opacity-75"
        style={{
          backgroundImage: "url('/assets/royal/menu/corner_top_right.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div 
        className="fixed bottom-0 left-0 w-16 h-16 pointer-events-none z-30 opacity-70"
        style={{
          backgroundImage: "url('/assets/royal/menu/gold_corner_bl.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div 
        className="fixed bottom-0 right-0 w-16 h-16 pointer-events-none z-30 opacity-70"
        style={{
          backgroundImage: "url('/assets/royal/menu/gold_corner_br.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Main Content Constraint Container (Mobile-First 100% width up to 520px) */}
      <div className="relative z-10 max-w-[500px] mx-auto px-4 pt-3">
        
        {/* ============================================================ */}
        {/* TOP BAR / HEADER                                             */}
        {/* ============================================================ */}
        <header className="flex flex-col gap-2 pt-1 pb-2">
          {/* Top Brand Centered Line */}
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setCurrentScreen(1)}
              aria-label="Back to Welcome Screen"
              className="w-10 h-10 rounded-full flex items-center justify-center border border-[#DFC38A]/40 bg-[#140E0A]/90 text-[#DFC38A] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition hover:border-[#DFC38A]"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </motion.button>

            {/* Restaurant Brand Title */}
            <div className="flex-1 text-center px-2">
              <span className="block text-[10px] font-bold tracking-[0.24em] text-[#CBB279] uppercase font-serif drop-shadow-sm">
                THOOGUDEEPA DONNE BIRYANI MANE
              </span>
            </div>

            {/* Right Controls: Dark/Theme Pill & Bell Pill */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTheme(currentThemeId === 'royal-palace-gold' ? 'obsidian-gold' : 'royal-palace-gold')}
                aria-label="Toggle Theme"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#DFC38A]/35 bg-[#140E0A]/90 text-[#DFC38A] text-[11px] font-semibold shadow-xs"
              >
                <Moon className="w-3.5 h-3.5 fill-[#DFC38A]/30 text-[#DFC38A]" />
                <span className="text-[10px] tracking-wide text-[#EAD8B2]">Dark</span>
              </button>

              <button
                aria-label="Notifications"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[#DFC38A]/35 bg-[#140E0A]/90 text-[#DFC38A] shadow-xs"
              >
                <Bell className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Subheader: Menu Title with Cutlery & Table Badge */}
          <div className="flex items-center justify-between px-1 mt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-[#FDF8EE] tracking-tight flex items-center gap-2">
                Menu
                <span className="inline-flex text-[#DFC38A] text-lg">
                  <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
                </span>
              </h1>
            </div>

            {/* Table & Seat Dynamic Pill */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#DFC38A]/45 bg-[#160E08]/95 shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <span className="w-2 h-2 rounded-full bg-[#E5B85C] animate-pulse" />
              <span className="text-xs font-serif font-bold tracking-wider text-[#F7E7C4]">
                {tableNumber || 'T-01'} • C-{String(seatNumber || 2).padStart(2, '0')}
              </span>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* SEARCH BAR                                                   */}
        {/* ============================================================ */}
        <div className="relative mt-2 mb-4">
          <div className="relative flex items-center w-full h-11 px-4 rounded-full border border-[#DFC38A]/35 bg-[#120B07]/85 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(223,195,138,0.15)] focus-within:border-[#DFC38A] transition-all">
            <Search className="w-4 h-4 text-[#DFC38A] shrink-0 mr-2.5 stroke-[2.2]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search delicacies..."
              className="w-full bg-transparent text-[#FDF8EE] placeholder-[#9E8B76] text-xs font-medium focus:outline-hidden tracking-wide"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#9E8B76] hover:text-[#FDF8EE] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CATEGORY STORY NAVIGATION (HORIZONTAL SCROLL)                */}
        {/* ============================================================ */}
        <div className="relative -mx-4 px-4 overflow-x-auto scrollbar-none pb-2 pt-1">
          <div className="flex items-center gap-3.5 min-w-max">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-1.5 focus:outline-hidden group"
                >
                  {/* Outer Golden Pedestal Ring */}
                  <div
                    className={`relative w-[62px] h-[62px] rounded-full p-[2.5px] transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-tr from-[#DFC38A] via-[#F9E7B9] to-[#A47E3B] shadow-[0_0_14px_rgba(223,195,138,0.5)] scale-105'
                        : 'bg-[#22160F] border border-[#DFC38A]/25 opacity-80 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0F0A06] relative">
                      <Image
                        src={cat.icon}
                        alt={cat.label}
                        fill
                        sizes="62px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Category Label & Active Gold Underline */}
                  <span
                    className={`text-[11px] font-medium tracking-tight text-center whitespace-nowrap transition-colors ${
                      isActive ? 'text-[#DFC38A] font-bold' : 'text-[#C5B39A]'
                    }`}
                  >
                    {cat.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="w-4 h-0.5 rounded-full bg-gradient-to-r from-[#DFC38A] to-[#F9E7B9]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* FEATURED HERO CARD ("HERITAGE DUM DEG • DAILY STAR")          */}
        {/* ============================================================ */}
        {(!searchTerm || heroItem.name.toLowerCase().includes(searchTerm.toLowerCase())) && (
          <div className="relative my-4 rounded-2xl border border-[#DFC38A]/35 bg-[#120B07]/90 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(223,195,138,0.2)] overflow-hidden">
            {/* Ambient amber radial backlight */}
            <div 
              className="absolute -top-12 -left-12 w-48 h-48 pointer-events-none rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(203, 134, 46, 0.28) 0%, transparent 70%)',
              }}
            />

            <div className="relative flex items-center gap-3">
              {/* Left Biryani Pot Image with SINCE 1978 Seal */}
              <div className="relative w-[130px] h-[130px] shrink-0 rounded-xl overflow-hidden border border-[#DFC38A]/30 bg-[#0A0704]">
                <Image
                  src="/assets/royal/menu/hero_biryani_pot.png"
                  alt={heroItem.name}
                  fill
                  sizes="130px"
                  className="object-cover"
                />

                {/* SINCE 1978 Heritage Seal Overlay */}
                <div className="absolute top-1 left-1 w-9 h-9 pointer-events-none drop-shadow-md">
                  <Image
                    src="/assets/royal/menu/since_1978_seal.png"
                    alt="Since 1978"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Right Hero Info */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Eyebrow Label */}
                <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-[#E5B85C] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B85C]" />
                  <span>HERITAGE DUM DEG • DAILY STAR</span>
                </div>

                {/* Dish Title */}
                <h3 className="text-base font-serif font-bold text-[#FFF9F0] tracking-tight leading-tight mt-0.5 truncate">
                  {heroItem.name}
                </h3>

                {/* Description */}
                <p className="text-[10px] text-[#C2B199] leading-snug mt-1 line-clamp-2">
                  {heroItem.description}
                </p>

                {/* Price & Taste Story CTA */}
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-xl font-serif font-bold text-[#F5D27A] tracking-tight">
                    ₹{heroItem.price}
                  </span>

                  {getItemQuantity(heroItem.id) === 0 ? (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => handleAddItem(heroItem, e)}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#DFC38A] via-[#F9E7B9] to-[#C99C4B] text-[#140E0A] text-[10px] font-bold tracking-wider uppercase shadow-[0_3px_10px_rgba(223,195,138,0.35)] flex items-center gap-1"
                    >
                      <span>TASTE STORY</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#DFC38A]/50 bg-[#1A110A]">
                      <button
                        onClick={(e) => handleUpdateQuantity(heroItem.id, -1, e)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[#DFC38A] hover:bg-[#DFC38A]/20"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="text-xs font-bold text-[#FFF9F0] min-w-3 text-center">
                        {getItemQuantity(heroItem.id)}
                      </span>
                      <button
                        onClick={(e) => handleUpdateQuantity(heroItem.id, 1, e)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[#DFC38A] hover:bg-[#DFC38A]/20"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TWO-COLUMN FOOD GRID                                         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 gap-3 my-2">
          {filteredItems.map((dish) => {
            const qty = getItemQuantity(dish.id);
            const dishImage = ROYAL_DISH_IMAGES[dish.name] || dish.image || '/assets/royal/menu/dish_kaalu_soup.png';
            const tagline = DISH_TAGLINES[dish.name] || 'Aromatic • Authentic • Fresh';
            const isVeg = IS_VEG[dish.name] || false;
            const isChefSpecial = dish.badge === 'Chef Special' || dish.name === 'Kaalu Soup';

            return (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="relative flex flex-col justify-between rounded-xl border border-[#DFC38A]/25 bg-[#120B07]/85 p-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(223,195,138,0.12)] hover:border-[#DFC38A]/50 transition-all group"
              >
                {/* Food Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#0A0704] border border-[#DFC38A]/20">
                  <Image
                    src={dishImage}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 500px) 50vw, 240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Chef Special Tag Badge if applicable */}
                  {isChefSpecial && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-sm bg-[#120B07]/90 border border-[#DFC38A]/40 text-[#DFC38A] text-[8px] font-bold tracking-wider uppercase flex items-center gap-0.5 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5 text-[#DFC38A]" />
                      <span>Chef Special</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 justify-between pt-2">
                  <div>
                    {/* Dietary Indicator & Dish Name */}
                    <div className="flex items-center gap-1.5">
                      {/* Dietary Dot Badge */}
                      <span className={`w-3 h-3 rounded-[3px] border flex items-center justify-center shrink-0 ${
                        isVeg 
                          ? 'border-emerald-500 bg-emerald-950/40' 
                          : 'border-rose-600 bg-rose-950/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-600'}`} />
                      </span>

                      <h4 className="text-xs font-serif font-bold text-[#FFF9F0] tracking-tight truncate">
                        {dish.name}
                      </h4>
                    </div>

                    {/* Tagline / Flavor Notes */}
                    <p className="text-[9.5px] text-[#AFA08C] leading-tight mt-0.5 line-clamp-1">
                      {tagline}
                    </p>
                  </div>

                  {/* Price & ADD Action Bar */}
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#DFC38A]/15">
                    <span className="text-base font-serif font-bold text-[#F5D27A]">
                      ₹{dish.price}
                    </span>

                    {qty === 0 ? (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={(e) => handleAddItem(dish, e)}
                        className="px-2.5 py-1 rounded-full border border-[#DFC38A]/45 bg-[#1F140C] text-[#DFC38A] text-[10px] font-bold tracking-wider uppercase hover:bg-[#DFC38A] hover:text-[#140E0A] transition-colors shadow-xs"
                      >
                        ADD +
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#DFC38A]/60 bg-[#1A110A]">
                        <button
                          onClick={(e) => handleUpdateQuantity(dish.id, -1, e)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[#DFC38A] hover:bg-[#DFC38A]/20"
                        >
                          <Minus className="w-2.5 h-2.5 stroke-[3]" />
                        </button>
                        <span className="text-[11px] font-bold text-[#FFF9F0] min-w-2.5 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={(e) => handleUpdateQuantity(dish.id, 1, e)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[#DFC38A] hover:bg-[#DFC38A]/20"
                        >
                          <Plus className="w-2.5 h-2.5 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* ============================================================ */}
      {/* BOTTOM FLOATING CART CHECKOUT BAR                             */}
      {/* ============================================================ */}
      {totalItemsCount > 0 && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="fixed bottom-3 left-0 right-0 z-40 px-3 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-[480px] rounded-full border border-[#DFC38A]/50 bg-[#140E0A]/95 backdrop-blur-xl p-2 px-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(223,195,138,0.3)] flex items-center justify-between">
            {/* Left Cart Counter & Price */}
            <div 
              onClick={() => setCurrentScreen(4)}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="relative w-9 h-9 rounded-full bg-[#20150E] border border-[#DFC38A]/35 flex items-center justify-center text-[#DFC38A]">
                <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5B85C] text-[#140E0A] text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-serif font-bold text-[#FFF9F0]">
                  ₹{totalCartAmount}
                </span>
                <span className="text-[9px] text-[#C2B199] tracking-wider uppercase">
                  View Cart
                </span>
              </div>
            </div>

            {/* Right Proceed CTA Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentScreen(4)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#DFC38A] via-[#F9E7B9] to-[#C99C4B] text-[#140E0A] text-xs font-bold tracking-wide uppercase shadow-[0_4px_14px_rgba(223,195,138,0.4)] flex items-center gap-1.5"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1A110A] border border-[#DFC38A]/60 text-[#F5D27A] text-xs font-semibold shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 text-[#E5B85C] stroke-[3]" />
            <span>{toastNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
