'use client';

import React from 'react';
import Link from 'next/link';
import { useCustomer } from '../context/CustomerContext';
import { CustomerThemeProvider, useCustomerTheme } from '../context/ThemeContext';
import { ThemeSwitcherBar } from '../components/ui/ThemeSwitcherBar';
import { ScreenId } from '../types/customer';
import { Screen1Welcome } from '../components/customer/Screen1Welcome';
import { Screen2Menu } from '../components/customer/Screen2Menu';
import { Screen3ItemDetail } from '../components/customer/Screen3ItemDetail';
import { Screen4Cart } from '../components/customer/Screen4Cart';
import { Screen5LiveTracking } from '../components/customer/Screen5LiveTracking';
import { Screen6PaymentBreakdown } from '../components/customer/Screen6PaymentBreakdown';
import { Screen7PaymentGateway } from '../components/customer/Screen7PaymentGateway';
import { Screen8Confirmation } from '../components/customer/Screen8Confirmation';
import { Screen9DigitalBill } from '../components/customer/Screen9DigitalBill';
import { Screen10WaiterCall } from '../components/customer/Screen10WaiterCall';
import { Screen11Loyalty } from '../components/customer/Screen11Loyalty';
import { Screen12Feedback } from '../components/customer/Screen12Feedback';
import {
  Smartphone,
  LayoutGrid,
  UtensilsCrossed,
  Sparkles,
  Crown,
  Bell,
  ShoppingCart,
  Clock,
  CreditCard,
  CheckCircle2,
  FileText,
  Flame,
  Award,
  Star,
  Utensils,
  Briefcase,
  QrCode,
  Tablet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CustomerJourneyContent() {
  const { currentScreen, setCurrentScreen, viewMode, setViewMode } = useCustomer();
  const { currentTheme } = useCustomerTheme();

  const screens = [
    { id: 1 as ScreenId, name: '1. Welcome & Wi-Fi', icon: <Crown className="h-3.5 w-3.5 text-orange-500" />, comp: <Screen1Welcome /> },
    { id: 2 as ScreenId, name: '2. Menu (2-Col Grid)', icon: <UtensilsCrossed className="h-3.5 w-3.5 text-orange-500" />, comp: <Screen2Menu /> },
    { id: 3 as ScreenId, name: '3. Item Details', icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" />, comp: <Screen3ItemDetail /> },
    { id: 4 as ScreenId, name: '4. Cart & Stepper', icon: <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />, comp: <Screen4Cart /> },
    { id: 5 as ScreenId, name: '5. Live Tracking', icon: <Clock className="h-3.5 w-3.5 text-indigo-500" />, comp: <Screen5LiveTracking /> },
    { id: 6 as ScreenId, name: '6. Payment Breakdown', icon: <CreditCard className="h-3.5 w-3.5 text-purple-500" />, comp: <Screen6PaymentBreakdown /> },
    { id: 7 as ScreenId, name: '7. Payment Gateway (QR)', icon: <CreditCard className="h-3.5 w-3.5 text-emerald-500" />, comp: <Screen7PaymentGateway /> },
    { id: 8 as ScreenId, name: '8. Confirmation', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />, comp: <Screen8Confirmation /> },
    { id: 9 as ScreenId, name: '9. Digital Tax Bill', icon: <FileText className="h-3.5 w-3.5 text-slate-700" />, comp: <Screen9DigitalBill /> },
    { id: 10 as ScreenId, name: '10. Call Waiter', icon: <Bell className="h-3.5 w-3.5 text-rose-500" />, comp: <Screen10WaiterCall /> },
    { id: 11 as ScreenId, name: '11. Loyalty Club', icon: <Award className="h-3.5 w-3.5 text-amber-600" />, comp: <Screen11Loyalty /> },
    { id: 12 as ScreenId, name: '12. Review & Rating', icon: <Star className="h-3.5 w-3.5 text-yellow-500" />, comp: <Screen12Feedback /> },
  ];

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 1: return <Screen1Welcome />;
      case 2: return <Screen2Menu />;
      case 3: return <Screen3ItemDetail />;
      case 4: return <Screen4Cart />;
      case 5: return <Screen5LiveTracking />;
      case 6: return <Screen6PaymentBreakdown />;
      case 7: return <Screen7PaymentGateway />;
      case 8: return <Screen8Confirmation />;
      case 9: return <Screen9DigitalBill />;
      case 10: return <Screen10WaiterCall />;
      case 11: return <Screen11Loyalty />;
      case 12: return <Screen12Feedback />;
      default: return <Screen1Welcome />;
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Top Console Header */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE5DF] bg-white/95 px-6 py-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-sm transition-colors duration-200"
            style={{ backgroundColor: currentTheme.colors.primary }}
          >
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border"
                style={{
                  backgroundColor: currentTheme.colors.secondaryBg,
                  color: currentTheme.colors.secondaryFg,
                  borderColor: currentTheme.colors.border,
                }}
              >
                Table Ordering
              </span>
              <span className="font-mono text-[10px] text-stone-500 font-semibold">
                Thoogudeepa Donne Biryani Mane
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-stone-900 mt-0.5">
              Customer Ordering Portal • <span className="font-extrabold" style={{ color: currentTheme.colors.primary }}>{currentTheme.name}</span>
            </h1>
          </div>
        </div>

        {/* Multi-Portal Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-[#EAE5DF] bg-[#FAF8F5] p-1 shadow-xs font-mono text-xs font-bold">
            <span
              className="rounded-xl text-white px-3 py-1.5 shadow-xs flex items-center gap-1 transition-colors duration-200"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>CUSTOMER (12)</span>
            </span>
            <Link
              href="/kitchen"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>KITCHEN (3)</span>
            </Link>
            <Link
              href="/waiter/mobile"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>WAITER MOBILE</span>
            </Link>
            <Link
              href="/waiter/tablet"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>CAPTAIN TABLET</span>
            </Link>
            <Link
              href="/manager"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>MANAGER (16)</span>
            </Link>
            <Link
              href="/qr-deck"
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 transition border border-amber-200"
            >
              <QrCode className="h-3.5 w-3.5 text-amber-600" />
              <span>QR DECK (34)</span>
            </Link>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-1 shadow-xs">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'single'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{
                backgroundColor: viewMode === 'single' ? currentTheme.colors.primary : 'transparent',
              }}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>SINGLE SCREEN FLOW</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                viewMode === 'all'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{
                backgroundColor: viewMode === 'all' ? currentTheme.colors.primary : 'transparent',
              }}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>ALL 12 SCREENS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Navigation Tabs */}
      <nav className="w-full max-w-7xl mx-auto flex gap-2 overflow-x-auto px-6 py-3 scrollbar-none">
        {screens.map((sc) => {
          const isActive = viewMode === 'single' && currentScreen === sc.id;
          return (
            <motion.button
              key={sc.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentScreen(sc.id);
                if (viewMode !== 'single') setViewMode('single');
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                isActive
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
              style={
                isActive
                  ? {
                      borderColor: currentTheme.colors.primary,
                      boxShadow: `0 0 0 2px ${currentTheme.colors.secondaryBg}`,
                    }
                  : {}
              }
            >
              <span>{sc.icon}</span>
              <span>{sc.name}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* UI Design Switcher Bar (Placed right below Screen tabs) */}
      <ThemeSwitcherBar />

      {/* Main Container */}
      <div className="flex-1 py-4 px-4">
        {viewMode === 'single' ? (
          <div className="flex justify-center pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1680px] px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 justify-items-center pb-20">
            {screens.map((sc) => (
              <div key={sc.id} className="flex flex-col items-center w-[380px] shrink-0">
                {sc.comp}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CustomerJourneyPage() {
  return (
    <CustomerThemeProvider>
      <CustomerJourneyContent />
    </CustomerThemeProvider>
  );
}
