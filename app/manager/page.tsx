'use client';

import React from 'react';
import { useManagerStore } from '../../store/useManagerStore';
import { ManagerScreenId } from '../../types/manager';

// Screens
import { ScreenM1Login } from '../../components/manager/ScreenM1Login';
import { ScreenM2LiveOverview } from '../../components/manager/ScreenM2LiveOverview';
import { ScreenM4BillingPOS } from '../../components/manager/ScreenM4BillingPOS';
import { ScreenM5KitchenSpeed } from '../../components/manager/ScreenM5KitchenSpeed';
import { ScreenM9WaiterCash } from '../../components/manager/ScreenM9WaiterCash';
import { ScreenM10Menu86Stock } from '../../components/manager/ScreenM10Menu86Stock';
import { ScreenM11SalesReport } from '../../components/manager/ScreenM11SalesReport';
import { ScreenM13PettyExpenses } from '../../components/manager/ScreenM13PettyExpenses';

import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut } from 'lucide-react';

export default function ManagerPortalPage() {
  const { currentScreen, setCurrentScreen, activeManager, activeShift, isAuthenticated, logout } = useManagerStore();

  const cleanManagerName = activeManager?.name
    ? activeManager.name.replace(/\s*\([^)]*\)/g, '').trim()
    : 'Manager';

  const screens = [
    { id: 1 as ManagerScreenId, name: '01. Login & Float', comp: <ScreenM1Login /> },
    { id: 2 as ManagerScreenId, name: '02. Live Overview', comp: <ScreenM2LiveOverview /> },
    { id: 3 as ManagerScreenId, name: '03. Billing & POS', comp: <ScreenM4BillingPOS /> },
    { id: 4 as ManagerScreenId, name: '04. Kitchen & Notifications', comp: <ScreenM5KitchenSpeed /> },
    { id: 5 as ManagerScreenId, name: '05. Waiter Cash & Tips', comp: <ScreenM9WaiterCash /> },
    { id: 6 as ManagerScreenId, name: '06. Menu Stocks & Offers', comp: <ScreenM10Menu86Stock /> },
    { id: 7 as ManagerScreenId, name: '07. Sales Report', comp: <ScreenM11SalesReport /> },
    { id: 8 as ManagerScreenId, name: '08. Petty Expenses & Cash Counter', comp: <ScreenM13PettyExpenses /> },
  ];

  const renderActiveScreen = () => {
    const s = screens.find((item) => item.id === currentScreen);
    return s ? s.comp : <ScreenM1Login />;
  };

  return (
    <div className="manager-portal h-screen w-screen max-h-screen max-w-screen bg-[#EFECE6] text-slate-900 p-2.5 sm:p-3 md:p-4 box-border flex flex-col overflow-hidden font-sans">
      {/* ── MASTER FRAMED APPLICATION SHELL (Matching Sketch: gap 1cm all sides, burnt orange border) ── */}
      <div className="h-full w-full max-h-full bg-white text-slate-900 border-2 border-[#9C3D1E] rounded-2xl shadow-sm flex flex-col overflow-hidden">
        
        {/* ── SCREEN NAVIGATION TABS & LOGGED-IN MANAGER (Top of Frame visible across all screens) ── */}
        <div className="shrink-0 w-full border-b border-[#EAE5DF] bg-[#FAF8F5] px-3 sm:px-4 py-2 flex items-center justify-between gap-3 font-mono text-slate-900">
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0 flex-1">
            {screens.map((sc) => {
              const isActive = currentScreen === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setCurrentScreen(sc.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-[#9C3D1E] bg-[#9C3D1E] text-white shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{sc.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Logged-in Manager Profile on All Screens */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5 bg-white border border-[#EAE5DF] rounded-xl px-3 py-1.5 shadow-2xs">
                {/* Manager Avatar with Live Status Pulse */}
                <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-orange-100 text-[#9C3D1E] shrink-0 font-black">
                  <User className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                  </span>
                </div>

                {/* Manager Name & Role */}
                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs sm:text-sm font-black text-slate-900 leading-tight truncate">
                      {cleanManagerName}
                    </span>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs shrink-0">
                      {activeManager?.role || 'Manager'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>ON DUTY</span>
                    <span>•</span>
                    <span className="truncate">{activeShift?.name || 'Dinner Service'}</span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  title="Logout Manager"
                  className="ml-1 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-slate-600 hover:text-rose-700 transition font-mono text-xs font-black shadow-2xs cursor-pointer active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-500 text-xs font-bold">
                <User className="h-3.5 w-3.5" />
                <span>Not Logged In</span>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTUAL PARTICULAR SCREEN CONTAINER (Internal Scrolling only) ── */}
        <div className="flex-1 min-h-0 w-full bg-[#FAF8F5] p-2 sm:p-4 overflow-y-auto overflow-x-hidden">
          <div className="w-full flex justify-center pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, scale: 0.99, y: 3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -3 }}
                transition={{ duration: 0.1 }}
                className="w-full flex justify-center"
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
