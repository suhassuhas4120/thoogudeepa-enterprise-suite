'use client';

import React from 'react';
import { Wifi, Battery } from 'lucide-react';

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
  return (
    <div className="flex flex-col items-center w-[380px] shrink-0">
      {screenNumber && screenTitle && (
        <div className="mb-2.5 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1 text-xs font-bold tracking-wider text-slate-700 shadow-sm backdrop-blur">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-mono text-[11px] text-orange-600 font-extrabold">SCREEN {screenNumber}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-800 font-semibold">{screenTitle}</span>
        </div>
      )}

      <div className={`phone-mockup relative flex flex-col ${className}`} style={style}>
        {/* iOS / Modern Mobile Status Bar */}
        <div className="flex h-9 w-full items-center justify-between px-6 text-[11px] font-semibold text-slate-700 bg-white/95 border-b border-slate-100 z-30 select-none">
          <span>12:45</span>
          {/* Subtle Dynamic Island Pill */}
          <div className="h-4 w-20 rounded-full bg-slate-900" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <Wifi className="h-3.5 w-3.5 text-slate-800 stroke-[2.2]" />
            <Battery className="h-3.5 w-3.5 text-slate-800 stroke-[2.2]" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto bg-stone-50/70 text-slate-900 flex flex-col relative">
          {children}
        </div>
      </div>
    </div>
  );
};
