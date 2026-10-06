'use client';

import React from 'react';
import { useCustomerTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Check } from 'lucide-react';

export const ThemeSwitcherBar: React.FC = () => {
  const { currentThemeId, setTheme, themes } = useCustomerTheme();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pt-1 pb-3">
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 shadow-xs backdrop-blur-md">
        {/* Bar Sub-header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 mb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <Palette className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-800">
              SELECT CUSTOMER UI DESIGN (7 CURATED LIGHT THEMES)
            </span>
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 font-mono">
              Live Color & Button Sync
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-500 font-mono">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Harmonious Screen & Button Palettes • 100% Unique Design System</span>
          </div>
        </div>

        {/* Horizontal Theme Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
          {themes.map((th) => {
            const isActive = currentThemeId === th.id;
            return (
              <motion.button
                key={th.id}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -1 }}
                onClick={() => setTheme(th.id)}
                className={`group flex items-center gap-2.5 shrink-0 rounded-xl border px-3 py-2 text-left transition-all ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                    : 'border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-white text-slate-700'
                }`}
              >
                {/* Two-tone Color Swatch */}
                <div className="relative flex items-center justify-center shrink-0">
                  <div
                    className="h-5 w-5 rounded-full border border-white shadow-2xs flex items-center justify-center"
                    style={{ backgroundColor: th.dotColor1 }}
                  >
                    {isActive && <Check className="h-3 w-3 stroke-[3] text-white" />}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white shadow-2xs"
                    style={{ backgroundColor: th.dotColor2 }}
                  />
                </div>

                {/* Theme Title & Archetype Badge */}
                <div className="flex flex-col min-w-[110px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-extrabold tracking-tight truncate ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {th.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`text-[9.5px] font-mono font-bold tracking-wider uppercase px-1 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {th.archetype}
                    </span>
                    <span
                      className={`text-[9px] truncate max-w-[90px] ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {th.subtitle}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
