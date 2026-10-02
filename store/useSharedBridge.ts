/**
 * useSharedBridge.ts
 * ──────────────────────────────────────────────────────────────────────
 * The SINGLE source of truth for cross-section real-time state.
 * Customer → Kitchen → Waiter all read and write from here.
 *
 * Flow:
 *  Customer places order → creates a KDS ticket + waiter table bill entry
 *  Customer pings waiter → creates a ping in waiter pings list
 *  Waiter fires KOT    → creates a KDS ticket in kitchen
 *  Kitchen bumps stage → waiter kitchenReadyItems updates
 *  Kitchen marks 86    → customer menu item grays out (is86 flag)
 *  Waiter vacates table → clears table in shared tables
 */

import { create } from 'zustand';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { MenuItem } from '../types/customer';
import { OrderStage } from '../types/customer';

/* ── Shared Types ──────────────────────────────────────────────── */
export interface SharedKDSItem {
  id: string;
  name: string;
  quantity: number;
  stage: OrderStage;
  prepMode: string;
  options?: string;
  addOns?: string[];
  notes?: string;
}

export interface SharedKDSTicket {
  id: string;
  tableNumber: string;
  serverName: string;
  timestamp: string;
  elapsedMinutes: number;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  items: SharedKDSItem[];
  source: 'CUSTOMER' | 'WAITER'; // who originated the order
}

export interface SharedTable {
  id: string;
  number: string;
  section: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  guestCount: number;
  seatedTime: string;
  currentBill: number;
  serverName: string;
  kotCount: number;
  mergedWith?: string;
  activeItems?: { name: string; quantity: number; status: string }[];
}

export interface SharedPing {
  id: string;
  tableNumber: string;
  type: string;
  message?: string;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  guestName: string;
}

export interface SharedMenuItem86 {
  id: string;
  name: string;
  category: string;
  is86: boolean;
  prepDelayMinutes: number;
}

export interface SharedShiftStats {
  tablesServed: number;
  totalRevenue: number;
  tipsEarned: number;
  avgTurnaroundMinutes: number;
}

/* ── Initial Data ───────────────────────────────────────────────── */
const freshTables: SharedTable[] = [
  // Express / Couple Hall (4 tables, 2-seater)
  { id: 'tbl-01', number: 'T-01', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-02', number: 'T-02', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-03', number: 'T-03', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-04', number: 'T-04', section: 'Express / Couple Hall', capacity: 2, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },

  // Main Dining Hall (10 tables, 3-seater)
  { id: 'tbl-05', number: 'T-05', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-06', number: 'T-06', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-07', number: 'T-07', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-08', number: 'T-08', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-09', number: 'T-09', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-10', number: 'T-10', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-11', number: 'T-11', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-12', number: 'T-12', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-13', number: 'T-13', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-14', number: 'T-14', section: 'Main Dining Hall', capacity: 3, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },

  // Family Section (10 tables, 4-seater)
  { id: 'tbl-15', number: 'T-15', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-16', number: 'T-16', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-17', number: 'T-17', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-18', number: 'T-18', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-19', number: 'T-19', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-20', number: 'T-20', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-21', number: 'T-21', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-22', number: 'T-22', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-23', number: 'T-23', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-24', number: 'T-24', section: 'Family Section', capacity: 4, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },

  // Courtyard Garden (5 tables, 5-seater)
  { id: 'tbl-25', number: 'T-25', section: 'Courtyard Garden', capacity: 5, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-26', number: 'T-26', section: 'Courtyard Garden', capacity: 5, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-27', number: 'T-27', section: 'Courtyard Garden', capacity: 5, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-28', number: 'T-28', section: 'Courtyard Garden', capacity: 5, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-29', number: 'T-29', section: 'Courtyard Garden', capacity: 5, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },

  // Grand Feast Hall (5 tables, 6-seater)
  { id: 'tbl-30', number: 'T-30', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-31', number: 'T-31', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-32', number: 'T-32', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-33', number: 'T-33', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
  { id: 'tbl-34', number: 'T-34', section: 'Grand Feast Hall', capacity: 6, status: 'VACANT', guestCount: 0, seatedTime: '--', currentBill: 0, serverName: 'Floor Captain', kotCount: 0 },
];

const freshInventory86: SharedMenuItem86[] = INITIAL_MENU_ITEMS.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  is86: false,
  prepDelayMinutes: 0,
}));

let ticketCounter = 1;
const makeTicketId = () => `KDS-${String(100 + ticketCounter++).padStart(3, '0')}`;
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ── Store Interface ────────────────────────────────────────────── */
interface SharedBridgeState {
  // Shared cross-section state
  tables: SharedTable[];
  kdsTickets: SharedKDSTicket[];
  pings: SharedPing[];
  inventory86: SharedMenuItem86[];
  shiftStats: SharedShiftStats;

  // NEW kitchen notification queue — never shown to customer
  kitchenNotifications: Array<{
    id: string;
    ticketId: string;
    tableNumber: string;
    itemCount: number;
    timestamp: string;
    dismissed: boolean;
  }>;

  // ── Customer actions ────────────────────────────────────────────
  /** Customer places order → adds KDS ticket + sets table as OCCUPIED */
  customerPlacesOrder: (
    tableNumber: string,
    guestName: string,
    guestCount: number,
    items: Array<{ item: MenuItem; selectedOption: string; addOns: string[]; quantity: number }>
  ) => void;

  /** Customer pings waiter */
  customerPingsWaiter: (tableNumber: string, type: string, guestName: string, msg?: string) => void;

  // ── Kitchen actions ─────────────────────────────────────────────
  /** Kitchen bumps an item stage — when ALL items of a ticket are PLATED, 
   *  creates a kitchenReadyItem visible in waiter feed */
  kitchenBumpItemStage: (ticketId: string, itemId: string) => void;
  kitchenSetItemStage: (ticketId: string, itemId: string, stage: OrderStage) => void;
  kitchenSetBulkItemStage: (itemName: string, stage: OrderStage) => void;
  kitchenBumpTable: (ticketId: string) => void;
  kitchenClearCompleted: () => void;

  /** Kitchen toggles 86 (out of stock) — affects customer menu immediately */
  kitchenToggle86: (itemId: string) => void;
  kitchenUpdatePrepDelay: (itemId: string, deltaMinutes: number) => void;

  /** Kitchen dismisses a notification */
  kitchenDismissNotification: (notifId: string) => void;
  kitchenDismissAllNotifications: () => void;

  /** Kitchen calls floor waiter to pass */
  callFloorWaiter: (tableNumber: string, reason?: string) => void;

  // ── Waiter actions ──────────────────────────────────────────────
  /** Waiter fires KOT → adds KDS ticket to kitchen */
  waiterFiresKOT: (
    tableNumber: string,
    captainName: string,
    items: Array<{ item: MenuItem; selectedOption: string; quantity: number }>
  ) => void;

  /** Waiter seats guests at a table */
  waiterSeatsGuests: (tableNumber: string, guestCount: number, captainName: string) => void;

  /** Waiter merges two tables — combines bills */
  waiterMergeTables: (targetTable: string, sourceTable: string) => void;

  /** Waiter resolves ping */
  waiterResolvePing: (pingId: string) => void;

  /** Waiter records payment */
  waiterRecordsPayment: (tableNumber: string, method: string, amount: number) => void;

  /** Waiter vacates table → sets to CLEANING then VACANT */
  waiterVacatesTable: (tableNumber: string) => void;

  /** Waiter marks a kitchen-ready item as served → removes from waiter feed + updates table item status */
  waiterMarkKitchenItemServed: (ticketId: string, itemId: string) => void;

  /** Reset all portals and tables back to clean initial state */
  resetToFreshDemoState: () => void;
}

/* ── Canonical dish key: strips seat/table tags, normalizes for bulk grouping */
export const getCanonicalDishKey = (name: string): string => {
  return name
    .replace(/\[Seat \d+\]/gi, '')
    .replace(/\[Table [^\]]+\]/gi, '')
    .replace(/[\[\]()]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

/* ── Store Implementation ───────────────────────────────────────── */
export const useSharedBridge = create<SharedBridgeState>((set, get) => ({
  tables: freshTables,
  kdsTickets: [],
  pings: [],
  inventory86: freshInventory86,
  shiftStats: {
    tablesServed: 0,
    totalRevenue: 0,
    tipsEarned: 0,
    avgTurnaroundMinutes: 38,
  },
  kitchenNotifications: [],

  /* ─── Customer Places Order ──────────────────────────────────── */
  customerPlacesOrder: (tableNumber, guestName, guestCount, items) => {
    const ticket: SharedKDSTicket = {
      id: makeTicketId(),
      tableNumber,
      serverName: guestName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'CUSTOMER',
      items: items.map((i, idx) => ({
        id: `ki-c-${Date.now()}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
        addOns: i.addOns,
      })),
    };
    const orderTotal = items.reduce((s, i) => s + i.item.price * i.quantity, 0);

    // Create kitchen notification for new order
    const notif = {
      id: `notif-${Date.now()}`,
      ticketId: ticket.id,
      tableNumber,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      timestamp: nowTime(),
      dismissed: false,
    };

    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      kitchenNotifications: [...state.kitchenNotifications, notif],
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? {
              ...t,
              status: 'OCCUPIED',
              guestCount: guestCount || t.guestCount || 1,
              seatedTime: t.seatedTime === '--' ? nowTime() : t.seatedTime,
              currentBill: t.currentBill + orderTotal,
              kotCount: t.kotCount + 1,
              activeItems: [
                ...(t.activeItems || []),
                ...items.map((i) => ({
                  name: i.item.name,
                  quantity: i.quantity,
                  status: 'Placed',
                })),
              ],
            }
          : t
      ),
    }));
  },

  /* ─── Customer Pings Waiter ──────────────────────────────────── */
  customerPingsWaiter: (tableNumber, type, guestName, msg) => {
    // Deduplication: prevent duplicate pending pings from same table for same reason
    const currentPings = get().pings;
    const hasDuplicate = currentPings.some(
      (p) => p.tableNumber === tableNumber && p.type === type && p.status === 'PENDING'
    );
    if (hasDuplicate) return;

    const ping: SharedPing = {
      id: 'p-' + Date.now(),
      tableNumber,
      type,
      message: msg,
      timestamp: nowTime(),
      status: 'PENDING',
      guestName,
    };
    set((state) => ({ pings: [...state.pings, ping] }));
  },

  /* ─── Kitchen Bumps Item Stage ───────────────────────────────── */
  kitchenBumpItemStage: (ticketId, itemId) => {
    const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED'];
    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) => {
          if (it.id !== itemId) return it;
          const curIdx = stageOrder.indexOf(it.stage);
          const nextStage = curIdx < stageOrder.length - 1 ? stageOrder[curIdx + 1] : stageOrder[curIdx];
          return { ...it, stage: nextStage };
        });
        const allPlated = newItems.every((i) => i.stage === 'PLATED' || i.stage === 'SERVED');
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        const anyPrep = newItems.some((i) => i.stage === 'PREP');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyPrep ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number && tk.id === ticketId);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            status: it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed',
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Sets Specific Item Stage ───────────────────────── */
  kitchenSetItemStage: (ticketId, itemId, stage) => {
    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) => {
          if (it.id !== itemId) return it;
          return { ...it, stage };
        });
        const allPlated = newItems.every((i) => i.stage === 'PLATED' || i.stage === 'SERVED');
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        const anyPrep = newItems.some((i) => i.stage === 'PREP');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyPrep ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number && tk.id === ticketId);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            status: it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed',
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Sets Bulk Item Stage (Cross-Table & Cross-Portal) ─── */
  kitchenSetBulkItemStage: (itemName, stage) => {
    const targetKey = getCanonicalDishKey(itemName);
    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        let ticketHasItem = false;
        const newItems = t.items.map((it) => {
          const itemKey = getCanonicalDishKey(it.name);
          if (itemKey === targetKey || itemKey.includes(targetKey) || targetKey.includes(itemKey)) {
            ticketHasItem = true;
            return { ...it, stage };
          }
          return it;
        });

        if (!ticketHasItem) return t;

        const allPlated = newItems.every((i) => i.stage === 'PLATED' || i.stage === 'SERVED');
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        const anyPrep = newItems.some((i) => i.stage === 'PREP');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyPrep ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update activeItems on all matching tables
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            status: it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed',
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  /* ─── Kitchen Bumps Entire Table ─────────────────────────────── */
  kitchenBumpTable: (ticketId) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'READY',
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' })),
        };
      }),
    }));
  },

  /* ─── Kitchen Clear Completed ─────────────────────────────────── */
  kitchenClearCompleted: () => {
    set((state) => ({
      kdsTickets: state.kdsTickets.filter((t) => t.status !== 'COMPLETED'),
    }));
  },

  /* ─── Kitchen Toggle 86 ──────────────────────────────────────── */
  kitchenToggle86: (itemId) => {
    set((state) => ({
      inventory86: state.inventory86.map((item) =>
        item.id === itemId ? { ...item, is86: !item.is86 } : item
      ),
    }));
  },

  /* ─── Kitchen Update Prep Delay ──────────────────────────────── */
  kitchenUpdatePrepDelay: (itemId, deltaMinutes) => {
    set((state) => ({
      inventory86: state.inventory86.map((item) =>
        item.id === itemId
          ? { ...item, prepDelayMinutes: Math.max(0, item.prepDelayMinutes + deltaMinutes) }
          : item
      ),
    }));
  },

  /* ─── Kitchen Dismiss Notification ───────────────────────────── */
  kitchenDismissNotification: (notifId) => {
    set((state) => ({
      kitchenNotifications: state.kitchenNotifications.map((n) =>
        n.id === notifId ? { ...n, dismissed: true } : n
      ),
    }));
  },

  kitchenDismissAllNotifications: () => {
    set((state) => ({
      kitchenNotifications: state.kitchenNotifications.map((n) => ({ ...n, dismissed: true })),
    }));
  },

  /* ─── Kitchen Calls Floor Waiter ─────────────────────────────── */
  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    get().customerPingsWaiter(tableNumber, 'FOOD', 'Kitchen Pass', reason);
  },

  /* ─── Waiter Fires KOT ───────────────────────────────────────── */
  waiterFiresKOT: (tableNumber, captainName, items) => {
    const ticket: SharedKDSTicket = {
      id: makeTicketId(),
      tableNumber,
      serverName: captainName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'WAITER',
      items: items.map((i, idx) => ({
        id: `ki-w-${Date.now()}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
      })),
    };

    const notif = {
      id: `notif-${Date.now()}`,
      ticketId: ticket.id,
      tableNumber,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      timestamp: nowTime(),
      dismissed: false,
    };

    const kotTotal = items.reduce((s, i) => s + i.item.price * i.quantity, 0);
    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      kitchenNotifications: [...state.kitchenNotifications, notif],
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? {
              ...t,
              status: 'OCCUPIED',
              currentBill: t.currentBill + kotTotal,
              kotCount: t.kotCount + 1,
              activeItems: [
                ...(t.activeItems || []),
                ...items.map((i) => ({ name: i.item.name, quantity: i.quantity, status: 'Placed' })),
              ],
            }
          : t
      ),
    }));
  },

  /* ─── Waiter Seats Guests ────────────────────────────────────── */
  waiterSeatsGuests: (tableNumber, guestCount, captainName) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? { ...t, status: 'OCCUPIED', guestCount, seatedTime: nowTime(), serverName: captainName }
          : t
      ),
    }));
  },

  /* ─── Waiter Merges Two Tables ───────────────────────────────── */
  waiterMergeTables: (targetTable, sourceTable) => {
    set((state) => {
      const target = state.tables.find((t) => t.number === targetTable);
      const source = state.tables.find((t) => t.number === sourceTable);
      if (!target || !source) return state;
      const mergedBill = target.currentBill + source.currentBill;
      const mergedGuests = Math.max(2, (target.guestCount || 2) + (source.guestCount || 2));
      return {
        tables: state.tables.map((t) => {
          if (t.number === targetTable) {
            return {
              ...t,
              status: 'OCCUPIED',
              currentBill: mergedBill,
              guestCount: mergedGuests,
              mergedWith: sourceTable,
              activeItems: [...(t.activeItems || []), ...(source.activeItems || [])],
            };
          }
          if (t.number === sourceTable) {
            return {
              ...t,
              status: 'OCCUPIED',
              currentBill: 0,
              guestCount: 0,
              mergedWith: targetTable,
            };
          }
          return t;
        }),
      };
    });
  },

  /* ─── Waiter Resolves Ping ───────────────────────────────────── */
  waiterResolvePing: (pingId) => {
    set((state) => ({ pings: state.pings.filter((p) => p.id !== pingId) }));
  },

  /* ─── Waiter Records Payment ─────────────────────────────────── */
  waiterRecordsPayment: (tableNumber, method, amount) => {
    set((state) => {
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
      const partner = targetTbl?.mergedWith;
      return {
        tables: state.tables.map((t) =>
          t.number === tableNumber || (partner && t.number === partner)
            ? { ...t, status: 'BILLING' }
            : t
        ),
        shiftStats: {
          ...state.shiftStats,
          totalRevenue: state.shiftStats.totalRevenue + amount,
          tablesServed: state.shiftStats.tablesServed + 1,
        },
      };
    });
  },

  /* ─── Waiter Vacates Table ───────────────────────────────────── */
  waiterVacatesTable: (tableNumber) => {
    set((state) => {
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
      const partner = targetTbl?.mergedWith;
      return {
        tables: state.tables.map((t) =>
          t.number === tableNumber || (partner && t.number === partner)
            ? {
                ...t,
                status: 'VACANT',
                currentBill: 0,
                guestCount: 0,
                kotCount: 0,
                seatedTime: '--',
                activeItems: [],
                mergedWith: undefined,
              }
            : t
        ),
        // Remove ALL KDS tickets for this table (completed or not, since table is vacated)
        kdsTickets: state.kdsTickets.filter(
          (tk) =>
            !(
              (tk.tableNumber === tableNumber || (partner && tk.tableNumber === partner))
            )
        ),
      };
    });
  },

  /* ─── Waiter Marks Kitchen Item Served ───────────────────────── */
  waiterMarkKitchenItemServed: (ticketId, itemId) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = t.items.map((it) =>
          it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return { ...t, items: newItems, status: allServed ? 'COMPLETED' : t.status };
      }),
    }));
  },

  /* ─── Reset to Fresh Demo State ──────────────────────────────── */
  resetToFreshDemoState: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thoogudeepa_bridge_v1');
      } catch {}
    }
    ticketCounter = 1;
    set({
      tables: freshTables,
      kdsTickets: [],
      pings: [],
      inventory86: freshInventory86,
      kitchenNotifications: [],
      shiftStats: {
        tablesServed: 0,
        totalRevenue: 0,
        tipsEarned: 0,
        avgTurnaroundMinutes: 38,
      },
    });
  },
}));

/* ── Real-Time Cross-Tab & Multi-Device Synchronization ───────────── */
if (typeof window !== 'undefined') {

  // ── Helper: apply persisted state safely ─────────────────────────
  const applyPersistedState = (parsed: Record<string, unknown>, suppressBroadcast = false) => {
    if (!parsed || !Array.isArray(parsed.tables)) return;
    const cur = useSharedBridge.getState();
    // Always filter COMPLETED tickets on incoming sync
    const liveTickets = Array.isArray(parsed.kdsTickets)
      ? (parsed.kdsTickets as SharedKDSTicket[]).filter((tk) => tk.status !== 'COMPLETED')
      : cur.kdsTickets;
    // Validate shiftStats shape before accepting
    const rawStats = parsed.shiftStats as Partial<typeof cur.shiftStats> | undefined;
    const safeShiftStats: typeof cur.shiftStats =
      rawStats &&
      typeof rawStats.tablesServed === 'number' &&
      typeof rawStats.totalRevenue === 'number'
        ? (rawStats as typeof cur.shiftStats)
        : cur.shiftStats;

    const incoming: Partial<typeof cur> = {
      tables: parsed.tables as typeof cur.tables,
      kdsTickets: liveTickets,
      pings: Array.isArray(parsed.pings) ? (parsed.pings as typeof cur.pings) : cur.pings,
      inventory86: Array.isArray(parsed.inventory86)
        ? (parsed.inventory86 as typeof cur.inventory86)
        : cur.inventory86,
      shiftStats: safeShiftStats,
      // kitchenNotifications: merge incoming with local (kitchen device owns these)
      kitchenNotifications: Array.isArray(parsed.kitchenNotifications)
        ? (parsed.kitchenNotifications as typeof cur.kitchenNotifications)
        : cur.kitchenNotifications,
    };
    if (suppressBroadcast) {
      isBroadcasting = true;
      useSharedBridge.setState(incoming);
      isBroadcasting = false;
    } else {
      useSharedBridge.setState(incoming);
    }
  };


  // Global flag to prevent broadcast loops
  let isBroadcasting = false;

  // 0. Rehydrate from localStorage if available
  try {
    const saved = localStorage.getItem('thoogudeepa_bridge_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tables)) {
        // Filter out COMPLETED tickets on rehydration so old orders don't persist
        const liveTickets = Array.isArray(parsed.kdsTickets)
          ? parsed.kdsTickets.filter((tk: SharedKDSTicket) => tk.status !== 'COMPLETED')
          : [];
        isBroadcasting = true;
        useSharedBridge.setState({
          ...parsed,
          kdsTickets: liveTickets,
          // kitchenNotifications are session-only, don't persist them
          kitchenNotifications: [],
        });
        isBroadcasting = false;
        // Sync ticket counter so new tickets don't collide with saved ones
        if (liveTickets.length > 0) {
          const maxNum = liveTickets
            .map((tk: SharedKDSTicket) => parseInt(tk.id.replace('KDS-', ''), 10) - 100)
            .reduce((a: number, b: number) => Math.max(a, b), 0);
          ticketCounter = maxNum + 1;
        }
      }
    }
  } catch {}

  // 1. Native Cross-Tab Sync via BroadcastChannel (0ms latency, zero dependencies)
  let syncChannel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('thoogudeepa_bridge_sync');

    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_STATE' && event.data.payload) {
        applyPersistedState(event.data.payload, true); // suppress re-broadcast
      }
    };

    useSharedBridge.subscribe((state) => {
      // Save state to localStorage on every change (persistence + cross-device fallback)
      try {
        localStorage.setItem(
          'thoogudeepa_bridge_v1',
          JSON.stringify({
            tables: state.tables,
            kdsTickets: state.kdsTickets,
            pings: state.pings,
            inventory86: state.inventory86,
            shiftStats: state.shiftStats,
            // kitchenNotifications intentionally NOT persisted (session-only)
          })
        );
      } catch {}

      // Only broadcast if this change was NOT caused by an incoming broadcast
      if (isBroadcasting) return;
      try {
        syncChannel?.postMessage({
          type: 'SYNC_STATE',
          payload: {
            tables: state.tables,
            kdsTickets: state.kdsTickets,
            pings: state.pings,
            inventory86: state.inventory86,
            shiftStats: state.shiftStats,
            kitchenNotifications: state.kitchenNotifications,
          },
        });
      } catch {
        // Channel may be closed — ignore
      }
    });
  }

  // 2. visibilitychange Re-Sync — handles mobile tab wakeup after sleep
  // When a tab comes back to foreground, it may have missed BroadcastChannel messages.
  // Re-read localStorage to catch up with any changes made by other tabs.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return; // tab going to background — nothing to do
    try {
      const saved = localStorage.getItem('thoogudeepa_bridge_v1');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.tables)) return;

      const currentState = useSharedBridge.getState();
      const savedJson = JSON.stringify({
        kdsTickets: parsed.kdsTickets,
        tables: parsed.tables,
      });
      const currentJson = JSON.stringify({
        kdsTickets: currentState.kdsTickets,
        tables: currentState.tables,
      });

      // Only update if there's an actual difference (avoid unnecessary re-renders)
      if (savedJson !== currentJson) {
        applyPersistedState(parsed, true); // suppress broadcast — we're catching up
      }
    } catch {}
  });

  // 3. localStorage polling fallback (every 3 seconds)
  // Catches state changes from tabs where BroadcastChannel messages were dropped
  // (e.g., heavy CPU load, tab sleeping, or browser throttling)
  let lastSeenTicketsHash = '';
  setInterval(() => {
    // Skip polling if this tab is currently broadcasting or if tab is visible
    // (BroadcastChannel handles the visible case; polling is only a safety net)
    if (document.hidden) return; // only poll when tab is visible
    try {
      const saved = localStorage.getItem('thoogudeepa_bridge_v1');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.kdsTickets)) return;

      // Quick hash = count + last stage of each ticket item
      const newHash = parsed.kdsTickets
        .map((tk: SharedKDSTicket) =>
          `${tk.id}:${tk.status}:${tk.items.map((i) => i.stage).join(',')}`
        )
        .join('|');

      if (newHash !== lastSeenTicketsHash) {
        lastSeenTicketsHash = newHash;
        const currentState = useSharedBridge.getState();
        const liveFromStorage = (parsed.kdsTickets as SharedKDSTicket[])
          .filter((tk) => tk.status !== 'COMPLETED');
        const liveInMemory = currentState.kdsTickets;

        // Check if there's a meaningful diff before applying
        if (JSON.stringify(liveFromStorage) !== JSON.stringify(liveInMemory)) {
          applyPersistedState(parsed, true);
        }
      }
    } catch {}
  }, 3000);

  // 4. Optional WebSocket client for cross-device sync (when ws-server is running)
  try {
    const wsHost = window.location.hostname || 'localhost';
    const wsPort = 3001;
    const wsUrl = `ws://${wsHost}:${wsPort}`;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let wsConnected = false;

    const connectWs = () => {
      // Don't try WebSocket on surge.sh (static hosting has no WS server)
      if (window.location.hostname.includes('surge.sh')) return;
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          wsConnected = true;
          const s = useSharedBridge.getState();
          ws?.send(JSON.stringify({
            type: 'SYNC_STATE',
            payload: { tables: s.tables, kdsTickets: s.kdsTickets, pings: s.pings }
          }));
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === 'SYNC_STATE' && data.payload) {
              applyPersistedState(data.payload, true);
            }
          } catch {}
        };
        ws.onerror = () => {
          wsConnected = false;
          ws?.close();
        };
        ws.onclose = () => {
          ws = null;
          wsConnected = false;
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              connectWs();
            }, 15000);
          }
        };
      } catch {
        // Fallback to BroadcastChannel only
      }
    };

    connectWs();
  } catch {
    // Fallback to BroadcastChannel only
  }
}



