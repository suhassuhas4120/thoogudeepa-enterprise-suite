'use client';

import React from 'react';
import { Wifi, Battery } from 'lucide-react';
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
  screenNumber,
  screenTitle,
}) => {
  const { currentTheme } = useCustomerTheme();

  return (
    <div className="flex flex-col items-center w-[380px] shrink-0">
      {screenNumber && screenTitle && (
        <div className="mb-2.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3.5 py-1 text-xs font-bold tracking-wider text-slate-700 shadow-sm backdrop-blur">
          <span
            className="flex h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentTheme.colors.primary }}
          />
          <span
            className="font-mono text-[11px] font-extrabold"
            style={{ color: currentTheme.colors.primary }}
          >
            SCREEN {screenNumber}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-800 font-semibold">{screenTitle}</span>
          <span
            className="ml-1 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase"
            style={{
              backgroundColor: currentTheme.colors.secondaryBg,
              color: currentTheme.colors.secondaryFg,
            }}
          >
            {currentTheme.archetype}
          </span>
        </div>
      )}

      <div
        className={`phone-mockup relative flex flex-col ${currentTheme.colors.isDark ? 'dark-theme' : ''} ${className}`}
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
            borderColor: currentTheme.colors.phoneBezel,
            backgroundColor: currentTheme.colors.bgApp,
            ...style,
          } as React.CSSProperties
        }
      >
        {/* iOS / Modern Mobile Status Bar (Harmonized with Theme) */}
        <div
          className="flex h-9 w-full items-center justify-between px-6 text-[11px] font-semibold border-b z-30 select-none transition-colors duration-200"
          style={{
            backgroundColor: currentTheme.colors.statusBarBg,
            color: currentTheme.colors.statusBarFg,
            borderColor: currentTheme.colors.borderLight,
          }}
        >
          <span>12:45</span>
          {/* Dynamic Island Pill */}
          <div
            className="h-4 w-20 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.colors.isDark ? '#2D333B' : '#0F172A',
            }}
          />
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 stroke-[2.2]" />
            <Battery className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
        </div>

        {/* Screen Content */}
        <div
          className="flex-1 overflow-y-auto flex flex-col relative transition-colors duration-200"
          style={{
            backgroundColor: currentTheme.colors.bgApp,
            color: currentTheme.colors.textPrimary,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
