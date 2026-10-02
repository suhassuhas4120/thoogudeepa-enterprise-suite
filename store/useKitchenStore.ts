import { create } from 'zustand';
import { KitchenScreenId, KitchenStation, KDSTicket } from '../types/kitchen';
import { OrderStage } from '../types/customer';
import { useSharedBridge } from './useSharedBridge';

interface KitchenStoreState {
  currentScreen: KitchenScreenId;
  previousScreen: KitchenScreenId;
  viewMode: 'single' | 'all';
  activeStation: KitchenStation;
  selectedTableNumber: string;
  soundAlertsEnabled: boolean;
  tickets: KDSTicket[];
  waiterAlertNotice: string | null;

  setCurrentScreen: (screen: KitchenScreenId) => void;
  setViewMode: (mode: 'single' | 'all') => void;
  setActiveStation: (station: KitchenStation) => void;
  setSelectedTableNumber: (table: string) => void;
  toggleSoundAlerts: () => void;
  bumpItemStage: (ticketId: string, itemId: string) => void;
  bumpTable: (ticketId: string) => void;
  callFloorWaiter: (tableNumber: string, reason?: string) => void;
  dismissWaiterAlert: () => void;
  resetKitchenDemo: () => void;
}

export const useKitchenStore = create<KitchenStoreState>((set) => ({
  currentScreen: 1,
  previousScreen: 1,
  viewMode: 'single',
  activeStation: 'MASTER_DISPATCH',
  selectedTableNumber: '',
  soundAlertsEnabled: true,
  // ✅ No demo tickets — real orders come from bridge only
  tickets: [],
  waiterAlertNotice: null,

  setCurrentScreen: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveStation: (station) => set({ activeStation: station }),
  setSelectedTableNumber: (table) => set({ selectedTableNumber: table }),
  toggleSoundAlerts: () =>
    set((state) => ({ soundAlertsEnabled: !state.soundAlertsEnabled })),

  bumpItemStage: (ticketId, itemId) => {
    useSharedBridge.getState().kitchenBumpItemStage(ticketId, itemId);
    set((state) => {
      const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED'];
      const newTickets = state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) => {
          if (it.id !== itemId) return it;
          const curIdx = stageOrder.indexOf(it.stage);
          const nextStage =
            curIdx < stageOrder.length - 1
              ? stageOrder[curIdx + 1]
              : stageOrder[curIdx];
          return { ...it, stage: nextStage };
        });
        const allPlated = newItems.every(
          (i) => i.stage === 'PLATED' || i.stage === 'SERVED'
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: (allServed
            ? 'COMPLETED'
            : allPlated
            ? 'READY'
            : 'PREP') as KDSTicket['status'],
        };
      });
      return { tickets: newTickets };
    });
  },

  bumpTable: (ticketId) => {
    useSharedBridge.getState().kitchenBumpTable(ticketId);
    set((state) => ({
      tickets: state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'READY',
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' as OrderStage })),
        };
      }),
    }));
  },

  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    useSharedBridge.getState().callFloorWaiter(tableNumber, reason);
    set({
      waiterAlertNotice: `[NOTIFICATION TRANSMITTED] Floor Captain alerted for Table ${tableNumber}: ${reason}`,
    });
    setTimeout(() => {
      set((state) =>
        state.waiterAlertNotice ? { waiterAlertNotice: null } : state
      );
    }, 4000);
  },

  dismissWaiterAlert: () => set({ waiterAlertNotice: null }),

  resetKitchenDemo: () => set({ tickets: [] }),
}));

export const useBridgeKDSTickets = () => useSharedBridge((s) => s.kdsTickets);
export const useBridgeInventory86 = () => useSharedBridge((s) => s.inventory86);