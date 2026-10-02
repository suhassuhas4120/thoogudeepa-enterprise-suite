'use client';

import React from 'react';

interface StickyBottomBarProps {
  label?: string;
  children: React.ReactNode;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ label, children }) => {
  return (
    <div className="sticky bottom-0 z-30 mt-auto border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur-md">
      {label && (
        <div className="mb-1.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-500 font-mono text-center">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};
