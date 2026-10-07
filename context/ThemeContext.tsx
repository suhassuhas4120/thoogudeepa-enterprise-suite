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

  // Load persisted theme on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thoogudeepa_customer_theme') as CustomerThemeId;
      if (saved && CUSTOMER_THEMES.some((t) => t.id === saved)) {
        setCurrentThemeId(saved);
      } else {
        setCurrentThemeId('terracotta-dum');
      }
    }
  }, []);

  const setTheme = (id: CustomerThemeId) => {
    setCurrentThemeId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('thoogudeepa_customer_theme', id);
    }
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
