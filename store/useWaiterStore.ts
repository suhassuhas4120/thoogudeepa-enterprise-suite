import { create } from 'zustand';
import {
  WaiterScreenId,
} from '../types/waiter';
import { MenuItem, CartItem } from '../types/customer';
import { useSharedBridge, SharedTable, SharedPing, SharedKDSTicket } from './useSharedBridge';

/* ── Re-export shared types for backward compat ───────────────── */
export type { SharedTable as FloorTable, SharedPing as WaiterCustomerPing };

interface WaiterStoreState {
  currentScreen: WaiterScreenId;
  previousScreen: WaiterScreenId;
  viewMode: 'single' | 'all' | 'tablet';
  activeCaptain: string;
  activeSection: string;
  selectedTableNumber: string;
  orderCart: CartItem[];
  kitchenCallNotice: string | null;

  // Actions
  setCurrentScreen: (screen: WaiterScreenId) => void;
  navigateTo: (screen: WaiterScreenId) => void;
  setViewMode: (mode: 'single' | 'all' | 'tablet') => void;
  setActiveCaptain: (name: string) => void;
  setActiveSection: (section: string) => void;
  selectTable: (tableNumber: string) => void;
  addToOrderCart: (item: MenuItem, selectedOption?: string, quantity?: number) => void;
  updateOrderCartQty: (cartItemId: string, delta: number) => void;
  clearOrderCart: () => void;
  fireKOTToKitchen: () => void;
  callKitchenStation: (stationName: string) => void;
  dismissKitchenCall: () => void;
}

export const useWaiterStore = create<WaiterStoreState>((set, get) => ({
  currentScreen: 1,
  previousScreen: 1,
  viewMode: 'single',
  activeCaptain: '',     // empty — waiter must log in
  activeSection: 'SECTION A',
  selectedTableNumber: '',
  orderCart: [],
  kitchenCallNotice: null,

  setCurrentScreen: (screen) =>
    set((state) => ({ previousScreen: state.currentScreen, currentScreen: screen })),

  navigateTo: (screen) =>
    set((state) => ({ previousScreen: state.currentScreen, currentScreen: screen })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveCaptain: (name) => set({ activeCaptain: name }),
  setActiveSection: (section) => set({ activeSection: section }),
  selectTable: (tableNumber) => set({ selectedTableNumber: tableNumber }),

  addToOrderCart: (item, selectedOption = 'Standard', quantity = 1) => {
    set((state) => {
      const existing = state.orderCart.find(
        (ci) => ci.menuItem.id === item.id && ci.selectedOption === selectedOption
      );
      if (existing) {
        return {
          orderCart: state.orderCart.map((ci) =>
            ci.cartItemId === existing.cartItemId
              ? { ...ci, quantity: ci.quantity + quantity, totalPrice: (ci.quantity + quantity) * item.price }
              : ci
          ),
        };
      }
      return {
        orderCart: [
          ...state.orderCart,
          {
            cartItemId: 'wcart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            menuItem: item,
            selectedOption,
            selectedAddOns: [],
            quantity,
            totalPrice: item.price * quantity,
            prepMode: item.prepMode,
          } as CartItem,
        ],
      };
    });
  },

  updateOrderCartQty: (cartItemId, delta) => {
    set((state) => ({
      orderCart: state.orderCart
        .map((ci) => {
          if (ci.cartItemId !== cartItemId) return ci;
          const newQty = ci.quantity + delta;
          if (newQty <= 0) return null;
          return { ...ci, quantity: newQty, totalPrice: (ci.totalPrice / ci.quantity) * newQty };
        })
        .filter(Boolean) as CartItem[],
    }));
  },

  clearOrderCart: () => set({ orderCart: [] }),

  fireKOTToKitchen: () => {
    const state = get();
    const { activeCaptain, selectedTableNumber, orderCart } = state;
    if (!orderCart.length || !selectedTableNumber) return;

    const bridge = useSharedBridge.getState();
    bridge.waiterFiresKOT(
      selectedTableNumber,
      activeCaptain || 'Captain',
      orderCart.map((ci) => ({
        item: ci.menuItem,
        selectedOption: ci.selectedOption,
        quantity: ci.quantity,
      }))
    );

    // Seat guests if table is vacant
    const table = bridge.tables.find((t) => t.number === selectedTableNumber);
    if (table && table.status === 'VACANT') {
      bridge.waiterSeatsGuests(selectedTableNumber, 1, activeCaptain || 'Captain');
    }

    set({ orderCart: [], currentScreen: 3 });
  },

  callKitchenStation: (stationName) =>
    set({ kitchenCallNotice: `[HOTLINE DISPATCHED] Kitchen alerted: ${stationName}` }),

  dismissKitchenCall: () => set({ kitchenCallNotice: null }),
}));

/* ── Convenience hooks that components can use ──────────────────── */
/** Tables (live, from shared bridge) */
export const useTables = () => useSharedBridge((s) => s.tables);

/** Pending pings (live, from shared bridge) */
export const usePings = () => useSharedBridge((s) => s.pings);

/** KDS tickets (live, from shared bridge) */
export const useKDSTickets = () => useSharedBridge((s) => s.kdsTickets);

/** Ready-to-serve tickets (stage READY) */
export const useKitchenReadyItems = () =>
  useSharedBridge((s) => s.kdsTickets.filter((tk) => tk.status === 'READY'));

/** Shift stats (live, from shared bridge) */
export const useShiftStats = () => useSharedBridge((s) => s.shiftStats);

/** 86 inventory (live, from shared bridge) */
export const useInventory86 = () => useSharedBridge((s) => s.inventory86);
