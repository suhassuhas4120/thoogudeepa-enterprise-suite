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

export default function ManagerPortalPage() {
  const { currentScreen, setCurrentScreen } = useManagerStore();

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
        
        {/* ── SCREEN NAVIGATION TABS (Top of Frame matching sketch) ── */}
        <nav className="shrink-0 w-full border-b border-[#EAE5DF] bg-[#FAF8F5] px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-slate-900">
          {screens.map((sc) => {
            const isActive = currentScreen === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setCurrentScreen(sc.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition shrink-0 ${
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
