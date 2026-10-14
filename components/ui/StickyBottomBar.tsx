'use client';

import React from 'react';
import { useCustomerTheme } from '../../context/ThemeContext';

interface StickyBottomBarProps {
  label?: string;
  children: React.ReactNode;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ label, children }) => {
  const { currentTheme } = useCustomerTheme();

  return (
    <div
      className="sticky bottom-0 z-30 mt-auto border-t px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.colors.bottomBg,
        borderColor: currentTheme.colors.border,
      }}
    >
      {label && (
        <div
          className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wider font-mono text-center"
          style={{ color: currentTheme.colors.textMuted }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
};
