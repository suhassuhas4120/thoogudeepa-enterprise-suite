'use client';

import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { ArrowLeft, Bell, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface WireHeaderProps {
  title: string | React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  showCallWaiter?: boolean;
  showCart?: boolean;
  leftSubtitle?: string;
}

export const WireHeader: React.FC<WireHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showCallWaiter = true,
  showCart = false,
  leftSubtitle,
}) => {
  const { navigateTo, previousScreen, cart } = useCustomer();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            onClick={onBack ? onBack : () => navigateTo(previousScreen || 2)}
            title="Go Back"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </motion.button>
        )}
        <div className="min-w-0">
          {leftSubtitle && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 font-mono">
              {leftSubtitle}
            </div>
          )}
          <div className="truncate text-sm font-extrabold tracking-tight text-slate-900">
            {title}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showCallWaiter && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition hover:bg-orange-100"
            onClick={() => navigateTo(9)}
            title="Call Waiter"
          >
            <Bell className="h-4 w-4 stroke-[2.2]" />
          </motion.button>
        )}

        {showCart && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-[#9C3D1E] text-white shadow-sm transition hover:bg-[#7c3018]"
            onClick={() => navigateTo(4)}
            title="View Cart"
          >
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white ring-2 ring-white animate-in zoom-in">
                {totalCartCount}
              </span>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};
