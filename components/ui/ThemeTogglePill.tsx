'use client';

import React from 'react';
import { useCustomerTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeTogglePillProps {
  className?: string;
  variant?: 'header' | 'floating' | 'subtle';
}

export const ThemeTogglePill: React.FC<ThemeTogglePillProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { currentThemeId, setTheme } = useCustomerTheme();
  const isDark = currentThemeId === 'obsidian-gold';

  const toggleTheme = () => {
    if (currentThemeId === 'terracotta-dum') {
      setTheme('obsidian-gold');
    } else if (currentThemeId === 'obsidian-gold') {
      setTheme('royal-palace-gold');
    } else {
      setTheme('terracotta-dum');
    }
  };

  const themeLabel =
    currentThemeId === 'royal-palace-gold'
      ? 'Royal Palace'
      : currentThemeId === 'obsidian-gold'
      ? 'Luxury Dark'
      : 'Classic Light';

  if (variant === 'floating') {
    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggleTheme}
        className={`fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 select-none ${
          currentThemeId === 'royal-palace-gold'
            ? 'border-[#FFE6A0] bg-[#120B04]/90 text-[#FFF0C5] shadow-[0_0_20px_rgba(243,211,139,0.35)]'
            : currentThemeId === 'obsidian-gold'
            ? 'border-amber-400/40 bg-stone-900/90 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : 'border-stone-300 bg-white/95 text-stone-800 shadow-md'
        } ${className}`}
        title={`Current: ${themeLabel}. Click to switch theme.`}
      >
        {currentThemeId === 'royal-palace-gold' ? (
          <>
            <span className="text-xs">👑</span>
            <span className="text-[10px] font-mono font-bold tracking-tight text-[#FFE6A0]">
              Royal Palace
            </span>
          </>
        ) : currentThemeId === 'obsidian-gold' ? (
          <>
            <Moon className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-bold tracking-tight text-amber-300">
              Luxury Dark
            </span>
          </>
        ) : (
          <>
            <Sun className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[10px] font-mono font-bold tracking-tight text-stone-700">
              Classic Light
            </span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all duration-200 select-none ${
        currentThemeId === 'royal-palace-gold'
          ? 'border-[#FFE6A0]/50 bg-[#120B04] text-[#FFE6A0] shadow-[0_0_10px_rgba(243,211,139,0.25)]'
          : currentThemeId === 'obsidian-gold'
          ? 'border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
          : 'border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200/80 shadow-xs'
      } ${className}`}
      title={`Current: ${themeLabel}. Click to switch theme.`}
    >
      {currentThemeId === 'royal-palace-gold' ? (
        <>
          <span className="text-xs">👑</span>
          <span className="text-[10px] font-mono font-bold">Royal</span>
        </>
      ) : currentThemeId === 'obsidian-gold' ? (
        <>
          <Moon className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-mono font-bold">Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-[10px] font-mono font-bold">Light</span>
        </>
      )}
    </motion.button>
  );
};
