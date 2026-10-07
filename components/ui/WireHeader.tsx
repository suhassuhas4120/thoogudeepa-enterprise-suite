'use client';

import React from 'react';
import { useCustomer } from '../../context/CustomerContext';
import { useCustomerTheme } from '../../context/ThemeContext';
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
  const { currentTheme } = useCustomerTheme();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.colors.headerBg,
        borderColor: currentTheme.colors.border,
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.textPrimary,
            }}
            onClick={onBack ? onBack : () => navigateTo(previousScreen || 2)}
            title="Go Back"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </motion.button>
        )}
        <div className="min-w-0">
          {leftSubtitle && (
            <div
              className="text-[10px] font-bold uppercase tracking-wider font-mono truncate"
              style={{ color: currentTheme.colors.primary }}
            >
              {leftSubtitle}
            </div>
          )}
          <div
            className="truncate text-sm font-extrabold tracking-tight"
            style={{ color: currentTheme.colors.textPrimary }}
          >
            {title}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showCallWaiter && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border shadow-2xs transition hover:bg-slate-50"
            style={{
              backgroundColor: currentTheme.colors.bgSurface,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.textPrimary,
            }}
            onClick={() => navigateTo(10)}
            title="Call Waiter"
          >
            <Bell className="h-4 w-4 stroke-[2.2]" />
          </motion.button>
        )}

        {showCart && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border shadow-xs transition hover:brightness-105"
            style={{
              backgroundColor: currentTheme.colors.buttonBg,
              borderColor: currentTheme.colors.primaryBorder,
              color: currentTheme.colors.buttonFg,
            }}
            onClick={() => navigateTo(4)}
            title="View Cart"
          >
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            {totalCartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black ring-2 ring-white animate-in zoom-in"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: currentTheme.colors.accentFg,
                }}
              >
                {totalCartCount}
              </span>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};
