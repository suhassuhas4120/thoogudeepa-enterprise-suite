'use client';

import React from 'react';
import { useCustomerStore } from '../store/useCustomerStore';
import { useMenuQuery } from '../hooks/useMenuQuery';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import {
  ScreenId,
  MenuItem,
  CartItem,
  OrderStage,
  IndividualItemTracking,
  PaymentDetails,
  WaiterPingType,
} from '../types/customer';

export { INITIAL_MENU_ITEMS };
export { useCustomerStore };

/**
 * Unified customer hook bridging Zustand (client local state)
 * and TanStack Query (server-state caching and synchronization).
 */
export function useCustomer() {
  const store = useCustomerStore();
  const { data: menuQueryData, isLoading: isMenuLoading } = useMenuQuery();

  const menuItems = menuQueryData || INITIAL_MENU_ITEMS;

  return {
    ...store,
    menuItems,
    isMenuLoading,
  };
}

/**
 * Legacy compatibility Provider.
 * State is managed directly by Zustand and TanStack Query.
 */
export function CustomerProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
