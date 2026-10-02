'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useManagerStore } from '../../store/useManagerStore';
import { ManagerScreenId } from '../../types/manager';

// Screens
import { ScreenM1Login } from '../../components/manager/ScreenM1Login';
import { ScreenM2LiveOverview } from '../../components/manager/ScreenM2LiveOverview';
import { ScreenM3FloorPlan } from '../../components/manager/ScreenM3FloorPlan';
import { ScreenM4BillingPOS } from '../../components/manager/ScreenM4BillingPOS';
import { ScreenM5KitchenSpeed } from '../../components/manager/ScreenM5KitchenSpeed';
import { ScreenM6WaitingQueue } from '../../components/manager/ScreenM6WaitingQueue';
import { ScreenM7StaffRoster } from '../../components/manager/ScreenM7StaffRoster';
import { ScreenM8CallsAlerts } from '../../components/manager/ScreenM8CallsAlerts';
import { ScreenM9WaiterCash } from '../../components/manager/ScreenM9WaiterCash';
import { ScreenM10Menu86Stock } from '../../components/manager/ScreenM10Menu86Stock';
import { ScreenM11SalesReport } from '../../components/manager/ScreenM11SalesReport';
import { ScreenM12OffersRules } from '../../components/manager/ScreenM12OffersRules';
import { ScreenM13PettyExpenses } from '../../components/manager/ScreenM13PettyExpenses';
import { ScreenM14AttendanceTips } from '../../components/manager/ScreenM14AttendanceTips';
import { ScreenM15PrinterHealth } from '../../components/manager/ScreenM15PrinterHealth';
import { ScreenM16DayCloseZReport } from '../../components/manager/ScreenM16DayCloseZReport';

import {
  Briefcase,
  LayoutGrid,
  Tablet,
  Users,
  Utensils,
  Flame,
  UserCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManagerPortalPage() {
  const {
    currentScreen,
    setCurrentScreen,
    viewMode,
    setViewMode,
    activeManager,
    activeShift,
    logout,
  } = useManagerStore();

  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeString(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const screens = [
    { id: 1 as ManagerScreenId, name: '01. Login & Float', comp: <ScreenM1Login /> },
    { id: 2 as ManagerScreenId, name: '02. Live Overview', comp: <ScreenM2LiveOverview /> },
    { id: 3 as ManagerScreenId, name: '03. Floor Plan', comp: <ScreenM3FloorPlan /> },
    { id: 4 as ManagerScreenId, name: '04. Billing & POS', comp: <ScreenM4BillingPOS /> },
    { id: 5 as ManagerScreenId, name: '05. Kitchen Speed', comp: <ScreenM5KitchenSpeed /> },
    { id: 6 as ManagerScreenId, name: '06. Waiting Queue', comp: <ScreenM6WaitingQueue /> },
    { id: 7 as ManagerScreenId, name: '07. Staff Roster', comp: <ScreenM7StaffRoster /> },
    { id: 8 as ManagerScreenId, name: '08. Calls & Alerts', comp: <ScreenM8CallsAlerts /> },
    { id: 9 as ManagerScreenId, name: '09. Waiter Cash', comp: <ScreenM9WaiterCash /> },
    { id: 10 as ManagerScreenId, name: '10. Menu 86 Stock', comp: <ScreenM10Menu86Stock /> },
    { id: 11 as ManagerScreenId, name: '11. Sales Report', comp: <ScreenM11SalesReport /> },
    { id: 12 as ManagerScreenId, name: '12. Offers & Rules', comp: <ScreenM12OffersRules /> },
    { id: 13 as ManagerScreenId, name: '13. Petty Expenses', comp: <ScreenM13PettyExpenses /> },
    { id: 14 as ManagerScreenId, name: '14. Attendance & Tips', comp: <ScreenM14AttendanceTips /> },
    { id: 15 as ManagerScreenId, name: '15. Printer Health', comp: <ScreenM15PrinterHealth /> },
    { id: 16 as ManagerScreenId, name: '16. Day Close Z-Report', comp: <ScreenM16DayCloseZReport /> },
  ];

  const renderActiveScreen = () => {
    const s = screens.find((item) => item.id === currentScreen);
    return s ? s.comp : <ScreenM1Login />;
  };

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Header Console */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 bg-white/95 px-6 py-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/30">
            <Briefcase className="h-5 w-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-900 bg-stone-100 border border-slate-300 rounded-md px-1.5 py-0.5">
                MANAGER COMMAND DESK • 16 SCREENS • REACT 19
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-400">
                THOOGUDEEPA DONNE BIRYANI MANE
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-sm font-black tracking-tight text-slate-900 font-mono">
                {activeManager.name}
              </h1>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                [{activeShift.name}]
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                • {timeString} IST
              </span>
            </div>
          </div>
        </div>

        {/* Global Multi-Portal Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1 shadow-xs font-mono text-xs font-bold">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>CUSTOMER (10)</span>
            </Link>
            <Link
              href="/kitchen"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span>KITCHEN (3)</span>
            </Link>
            <Link
              href="/waiter"
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 hover:text-slate-900 transition"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>WAITER (10)</span>
            </Link>
            <span className="rounded-xl bg-slate-900 text-white px-3 py-1.5 shadow-xs flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 fill-white" />
              <span>MANAGER (16)</span>
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-stone-50 p-1 shadow-xs">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                viewMode === 'single'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span>STAGE FLOW</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition ${
                viewMode === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>ALL 16 SCREENS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Tabs Bar (1 to 16) */}
      <nav className="w-full max-w-7xl mx-auto flex gap-1.5 overflow-x-auto px-6 py-2.5 scrollbar-none font-mono">
        {screens.map((sc) => {
          const isActive = viewMode === 'single' && currentScreen === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setCurrentScreen(sc.id);
                if (viewMode !== 'single') setViewMode('single');
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50'
              }`}
            >
              <span>{sc.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Viewport */}
      <div className="flex-1 py-4 px-4">
        {viewMode === 'single' ? (
          <div className="flex justify-center pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, scale: 0.99, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -6 }}
                transition={{ duration: 0.15 }}
                className="w-full flex justify-center"
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-7xl px-2 space-y-12 pb-24">
            {screens.map((sc) => (
              <div
                key={sc.id}
                className="bg-white border-2 border-slate-900 rounded-2xl shadow-[6px_6px_0px_#0f172a] overflow-hidden"
              >
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between font-mono">
                  <span className="font-bold text-sm">SCREEN {sc.name.toUpperCase()}</span>
                  <button
                    onClick={() => {
                      setCurrentScreen(sc.id);
                      setViewMode('single');
                    }}
                    className="bg-white text-slate-900 px-3 py-1 rounded text-xs font-bold hover:bg-stone-100 transition"
                  >
                    OPEN STAGE ➔
                  </button>
                </div>
                <div className="p-4 bg-stone-50">
                  {sc.comp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
