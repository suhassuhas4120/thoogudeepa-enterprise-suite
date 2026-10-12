'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerThemeId, CustomerThemeConfig, CUSTOMER_THEMES } from '../types/theme';

interface CustomerThemeContextType {
  currentThemeId: CustomerThemeId;
  currentTheme: CustomerThemeConfig;
  setTheme: (themeId: CustomerThemeId) => void;
  themes: CustomerThemeConfig[];
}

const CustomerThemeContext = createContext<CustomerThemeContextType | undefined>(undefined);

export function CustomerThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<CustomerThemeId>('terracotta-dum');

  // Always enforce the luxury Obsidian Gold theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentThemeId('terracotta-dum');
      try {
        localStorage.setItem('thoogudeepa_customer_theme', 'terracotta-dum');
      } catch {}
    }
  }, []);

  const setTheme = (id: CustomerThemeId) => {
    setCurrentThemeId('terracotta-dum');
  };

  const currentTheme =
    CUSTOMER_THEMES.find((t) => t.id === currentThemeId) || CUSTOMER_THEMES[0];

  return (
    <CustomerThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        setTheme,
        themes: CUSTOMER_THEMES,
      }}
    >
      {children}
    </CustomerThemeContext.Provider>
  );
}

export function useCustomerTheme() {
  const context = useContext(CustomerThemeContext);
  if (!context) {
    // Graceful fallback to default theme if used outside provider
    return {
      currentThemeId: 'terracotta-dum' as CustomerThemeId,
      currentTheme: CUSTOMER_THEMES[0],
      setTheme: () => {},
      themes: CUSTOMER_THEMES,
    };
  }
  return context;
}
