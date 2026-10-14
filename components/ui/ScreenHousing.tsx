'use client';

import React from 'react';
import { useCustomerTheme } from '../../context/ThemeContext';

interface ScreenHousingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  screenNumber?: number;
  screenTitle?: string;
}

export const ScreenHousing: React.FC<ScreenHousingProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const { currentTheme } = useCustomerTheme();

  return (
    <div
      className={`flex flex-col w-full h-full relative ${className}`}
      style={
        {
          '--theme-bg-app': currentTheme.colors.bgApp,
          '--theme-bg-surface': currentTheme.colors.bgSurface,
          '--theme-border': currentTheme.colors.border,
          '--theme-border-light': currentTheme.colors.borderLight,
          '--theme-primary': currentTheme.colors.primary,
          '--theme-primary-hover': currentTheme.colors.primaryHover,
          '--theme-primary-fg': currentTheme.colors.primaryFg,
          '--theme-secondary-bg': currentTheme.colors.secondaryBg,
          '--theme-secondary-fg': currentTheme.colors.secondaryFg,
          '--theme-accent': currentTheme.colors.accent,
          '--theme-text-primary': currentTheme.colors.textPrimary,
          '--theme-text-secondary': currentTheme.colors.textSecondary,
          '--theme-text-muted': currentTheme.colors.textMuted,
          backgroundColor: currentTheme.colors.bgApp,
          color: currentTheme.colors.textPrimary,
          ...style,
        } as React.CSSProperties
      }
    >
      <div
        className="flex-1 flex flex-col min-h-0 relative transition-colors duration-200"
        style={{
          backgroundColor: currentTheme.colors.bgApp,
          color: currentTheme.colors.textPrimary,
        }}
      >
        {children}
      </div>
    </div>
  );
};
