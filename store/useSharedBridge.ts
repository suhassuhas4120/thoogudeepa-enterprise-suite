import { create } from 'zustand';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { MenuItem } from '../types/customer';
import { OrderStage } from '../types/customer';


export interface SharedKDSItem {
  id: string;
  name: string;
  quantity: number;
  stage: OrderStage;
  prepMode: string;
  options?: string;
  addOns?: string[];
  notes?: string;
  seatNumber?: number;
  price?: number;
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
  seatNumber?: number;
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
  mergedWith?: string;           // primary table's number (for the non-primary members)
  mergeGroupPeers?: string[];    // ALL table numbers in the group including self (set on every member)
  preMergeCapacity?: number;
  preMergeBill?: number;
  preMergeGuests?: number;
  preMergeStatus?: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING'; // status before merge — restored on unmerge
  mergedSeatGroups?: Record<string, number[]>; // e.g. { 'Chairs 1 & 2': [1, 2] }
  activeItems?: {
    id?: string;
    name: string;
    quantity: number;
    status: string;
    seatNumber?: number;
    price?: number;
    options?: string;
  }[];
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

export interface SettledBillSnapshot {
  invoiceNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
  grandTotal: number;
  method: 'UPI' | 'CASH';
}


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
let notifCounter = 1;
const makeTicketId = () => {
  if (typeof ticketCounter !== 'number' || isNaN(ticketCounter)) {
    ticketCounter = 1;
  }
  const currentCount = ticketCounter++;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `KDS-${String(100 + currentCount).padStart(3, '0')}-${suffix}`;
};
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });


interface SharedBridgeState {
  // Shared cross-section state
  tables: SharedTable[];
  kdsTickets: SharedKDSTicket[];
  pings: SharedPing[];
  inventory86: SharedMenuItem86[];
  shiftStats: SharedShiftStats;
  settledBills: Record<string, SettledBillSnapshot>;

  // NEW kitchen notification queue — never shown to customer
  kitchenNotifications: Array<{
    id: string;
    ticketId: string;
    tableNumber: string;
    itemCount: number;
    timestamp: string;
    dismissed: boolean;
  }>;

  /** Customer places order */
  customerPlacesOrder: (
    tableNumber: string,
    guestName: string,
    guestCount: number,
    items: Array<{ item: MenuItem; selectedOption: string; addOns: string[]; quantity: number }>
  ) => void;

  /** Customer pings waiter */
  customerPingsWaiter: (tableNumber: string, type: string, guestName: string, msg?: string) => void;

  /** Kitchen bumps an item stage */
  kitchenBumpItemStage: (ticketId: string, itemId: string) => void;
  kitchenSetItemStage: (ticketId: string, itemId: string, stage: OrderStage) => void;
  kitchenSetBulkItemStage: (itemName: string, stage: OrderStage) => void;
  kitchenBumpTable: (ticketId: string) => void;
  kitchenClearCompleted: () => void;

  /** Kitchen toggles 86 (out of stock) */
  kitchenToggle86: (itemId: string) => void;
  kitchenUpdatePrepDelay: (itemId: string, deltaMinutes: number) => void;

  /** Kitchen dismisses a notification */
  kitchenDismissNotification: (notifId: string) => void;
  kitchenDismissAllNotifications: () => void;

  /** Kitchen calls floor waiter to pass */
  callFloorWaiter: (tableNumber: string, reason?: string) => void;

  /** Waiter fires KOT */
  waiterFiresKOT: (
    tableNumber: string,
    captainName: string,
    items: Array<{ item: MenuItem; selectedOption: string; quantity: number }>,
    seatNumber?: number
  ) => void;

  /** Waiter seats guests at a table */
  waiterSeatsGuests: (tableNumber: string, guestCount: number, captainName: string) => void;

  /** Waiter merges two tables — combines bills */
  waiterMergeTables: (targetTable: string, sourceTable: string) => void;

  /** Waiter merges two chairs on a table — combines items/orders */
  waiterMergeChairs: (tableNumber: string, fromChair: number, toChair: number) => void;

  /** Waiter merges multiple chairs into a named group (e.g. Chairs 1 & 2) */
  waiterMergeSeatGroup: (tableNumber: string, groupKey: string, seats: number[]) => void;

  /** Waiter unmerges / dissolves a chair group back to individual chairs */
  waiterUnmergeSeatGroup: (tableNumber: string, groupKey: string) => void;

  /** Waiter unmerges tables — separates bills */
  waiterUnmergeTable: (tableNumber: string) => void;

  /** Removes one specific table from a multi-group, keeping the rest merged */
  waiterRemoveTableFromGroup: (tableNumberToRemove: string) => void;

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

export const getCanonicalDishKey = (name: string): string => {
  return name
    .replace(/\[Seat \d+\]/gi, '')
    .replace(/\[Table [^\]]+\]/gi, '')
    .replace(/[\[\]()]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

function bridgePost(
  url: string,
  body: Record<string, unknown>,
  onRollback?: () => void
): void {
  if (typeof window === 'undefined') return;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (!res.ok) {
        res.json().catch(() => null).then((err) => {
          console.error(`[Bridge] API ${url} failed (${res.status}):`, err);
          onRollback?.();
        });
      }
    })
    .catch((err) => {
      console.error(`[Bridge] API ${url} network error:`, err);
      onRollback?.();
    });
}


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
  settledBills: {},
  kitchenNotifications: [],

  
  customerPlacesOrder: (tableNumber, guestName, guestCount, items) => {
    const ticket: SharedKDSTicket = {
      id: makeTicketId(),
      tableNumber,
      serverName: guestName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'CUSTOMER',
      seatNumber: 1,
      items: items.map((i, idx) => ({
        id: `ki-c-${Date.now()}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
        addOns: i.addOns,
        seatNumber: 1,
        price: i.item.price,
      })),
    };
    const orderTotal = items.reduce((s, i) => s + i.item.price * i.quantity, 0);

    // Create kitchen notification for new order
    const notif = {
      id: `notif-${Date.now()}-${notifCounter++}`,
      ticketId: ticket.id,
      tableNumber,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      timestamp: nowTime(),
      dismissed: false,
    };

    const prevState = {
      kdsTickets: get().kdsTickets,
      kitchenNotifications: get().kitchenNotifications,
      tables: get().tables,
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
                ...items.map((i, idx) => ({
                  id: `ai-c-${Date.now()}-${idx}`,
                  name: i.item.name,
                  quantity: i.quantity,
                  status: 'Placed',
                  seatNumber: 1,
                  price: i.item.price,
                  options: i.selectedOption,
                })),
              ],
            }
          : t
      ),
    }));

    bridgePost(
      '/api/orders/create',
      {
        tableNumber,
        seatNumber: 1,            // default seat; customer screen sets proper seat
        guestName,
        guestCount: guestCount || 1,
        source: 'CUSTOMER',
        items: items.map((i) => ({
          name: i.item.name,
          quantity: i.quantity,
          price: i.item.price,
          unitPrice: i.item.price,
          prepMode: i.item.prepMode || 'Regular',
          selectedOption: i.selectedOption || null,
          addOns: i.addOns || [],
          notes: '',
        })),
      },
      () => {
        // Rollback on API failure
        console.error('[Bridge] customerPlacesOrder rollback');
        useSharedBridge.setState(prevState);
      }
    );
  },

  
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

    // Snapshot for rollback
    const prevPings = get().pings;

    // 1. Optimistic update
    set((state) => ({ pings: [...state.pings, ping] }));

    // 2. Persist to Supabase
    bridgePost(
      '/api/pings/create',
      { tableNumber, seatNumber: 1, type, guestName, message: msg || '' },
      () => {
        console.error('[Bridge] customerPingsWaiter rollback');
        useSharedBridge.setState({ pings: prevPings });
      }
    );
  },

  
  kitchenBumpItemStage: (ticketId, itemId) => {
    const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED', 'SERVED'];

    // Snapshot for rollback
    const prevTickets = get().kdsTickets;
    const prevTables = get().tables;

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
        const anyActive = newItems.some((i) => i.stage === 'PREP' || i.stage === 'PLATED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number && tk.id === ticketId);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            status: it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed',
            seatNumber: it.seatNumber,
            price: it.price,
            options: it.options,
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });

    // Persist to Supabase
    bridgePost(
      '/api/kds/bump-item',
      { ticketId, itemId },
      () => {
        console.error('[Bridge] kitchenBumpItemStage rollback');
        useSharedBridge.setState({ kdsTickets: prevTickets, tables: prevTables });
      }
    );
  },

  
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
        const anyActive = newItems.some((i) => i.stage === 'PREP' || i.stage === 'PLATED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number && tk.id === ticketId);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            status: it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed',
            seatNumber: it.seatNumber,
            price: it.price,
            options: it.options,
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  
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
        const anyActive = newItems.some((i) => i.stage === 'PREP' || i.stage === 'PLATED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update activeItems on all matching tables
      const updatedTables = state.tables.map((tbl) => {
        const ticket = newTickets.find((tk) => tk.tableNumber === tbl.number);
        if (!ticket) return tbl;
        return {
          ...tbl,
          activeItems: ticket.items.map((it) => ({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            status: it.stage === 'SERVED' ? 'Served' : it.stage === 'PLATED' ? 'Ready' : it.stage === 'PREP' ? 'Cooking' : 'Placed',
            seatNumber: it.seatNumber,
            price: it.price,
            options: it.options,
          })),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  
  kitchenBumpTable: (ticketId) => {
    const prevTickets = get().kdsTickets;

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

    bridgePost(
      '/api/kds/bump-table',
      { ticketId, status: 'READY' },
      () => {
        console.error('[Bridge] kitchenBumpTable rollback');
        useSharedBridge.setState({ kdsTickets: prevTickets });
      }
    );
  },

  
  kitchenClearCompleted: () => {
    set((state) => ({
      kdsTickets: state.kdsTickets.filter((t) => t.status !== 'COMPLETED'),
    }));
  },

  
  kitchenToggle86: (itemId) => {
    const prevInventory = get().inventory86;
    const currentItem = prevInventory.find((i) => i.id === itemId);

    set((state) => ({
      inventory86: state.inventory86.map((item) =>
        item.id === itemId ? { ...item, is86: !item.is86 } : item
      ),
    }));

    bridgePost(
      '/api/kds/toggle-86',
      { itemId, is86: !currentItem?.is86 },
      () => {
        console.error('[Bridge] kitchenToggle86 rollback');
        useSharedBridge.setState({ inventory86: prevInventory });
      }
    );
  },

  
  kitchenUpdatePrepDelay: (itemId, deltaMinutes) => {
    const prevInventory = get().inventory86;
    const currentItem = prevInventory.find((i) => i.id === itemId);
    const newDelay = Math.max(0, (currentItem?.prepDelayMinutes ?? 0) + deltaMinutes);

    set((state) => ({
      inventory86: state.inventory86.map((item) =>
        item.id === itemId
          ? { ...item, prepDelayMinutes: Math.max(0, item.prepDelayMinutes + deltaMinutes) }
          : item
      ),
    }));

    bridgePost(
      '/api/kds/toggle-86',
      { itemId, is86: currentItem?.is86 ?? false, prepDelayMinutes: newDelay },
      () => {
        console.error('[Bridge] kitchenUpdatePrepDelay rollback');
        useSharedBridge.setState({ inventory86: prevInventory });
      }
    );
  },

  
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

  
  callFloorWaiter: (tableNumber, reason = 'Dishes Ready for Pickup') => {
    get().customerPingsWaiter(tableNumber, 'FOOD', 'Kitchen Pass', reason);
  },

  
  waiterFiresKOT: (tableNumber, captainName, items, seatNumber) => {
    const ticket: SharedKDSTicket = {
      id: makeTicketId(),
      tableNumber,
      serverName: captainName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'WAITER',
      seatNumber,
      items: items.map((i, idx) => ({
        id: `ki-w-${Date.now()}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
        price: i.item.price,
        seatNumber,
      })),
    };

    const notif = {
      id: `notif-${Date.now()}-${notifCounter++}`,
      ticketId: ticket.id,
      tableNumber,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      timestamp: nowTime(),
      dismissed: false,
    };

    const kotTotal = items.reduce((s, i) => s + i.item.price * i.quantity, 0);

    // Snapshot for rollback
    const prevState = {
      kdsTickets: get().kdsTickets,
      kitchenNotifications: get().kitchenNotifications,
      tables: get().tables,
    };

    // 1. Optimistic update
    set((state) => ({
      kdsTickets: [...state.kdsTickets, ticket],
      kitchenNotifications: [...state.kitchenNotifications, notif],
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? {
              ...t,
              status: 'OCCUPIED',
              guestCount: Math.max(t.guestCount || 0, seatNumber ? seatNumber : 1),
              seatedTime: t.seatedTime === '--' ? nowTime() : t.seatedTime,
              currentBill: t.currentBill + kotTotal,
              kotCount: t.kotCount + 1,
              activeItems: [
                ...(t.activeItems || []),
                ...items.map((i, idx) => ({
                  id: `ai-w-${Date.now()}-${idx}`,
                  name: i.item.name,
                  quantity: i.quantity,
                  status: 'Placed',
                  seatNumber,
                  price: i.item.price,
                  options: i.selectedOption,
                })),
              ],
            }
          : t
      ),
    }));

    // 2. Persist to Supabase
    bridgePost(
      '/api/orders/create',
      {
        tableNumber,
        seatNumber: seatNumber || 1,
        guestName: captainName,
        guestCount: 1,
        source: 'WAITER',
        items: items.map((i) => ({
          name: i.item.name,
          quantity: i.quantity,
          price: i.item.price,
          unitPrice: i.item.price,
          prepMode: i.item.prepMode || 'Regular',
          selectedOption: i.selectedOption || null,
          addOns: [],
          notes: seatNumber ? `Seat ${seatNumber}` : '',
        })),
      },
      () => {
        console.error('[Bridge] waiterFiresKOT rollback');
        useSharedBridge.setState(prevState);
      }
    );
  },

  
  waiterSeatsGuests: (tableNumber, guestCount, captainName) => {
    const prevTables = get().tables;

    set((state) => ({
      tables: state.tables.map((t) =>
        t.number === tableNumber
          ? { ...t, status: 'OCCUPIED', guestCount, seatedTime: nowTime(), serverName: captainName }
          : t
      ),
    }));

    bridgePost(
      '/api/tables/seat',
      { tableNumber, guestCount, captainName },
      () => {
        console.error('[Bridge] waiterSeatsGuests rollback');
        useSharedBridge.setState({ tables: prevTables });
      }
    );
  },

  
  waiterMergeTables: (tableA, tableB) => {
    set((state) => {
      const tblA = state.tables.find((t) => t.number === tableA);
      const tblB = state.tables.find((t) => t.number === tableB);
      if (!tblA || !tblB) return state;

      // Collect all table numbers currently in each table's group (or solo)
      const groupA: string[] = tblA.mergeGroupPeers && tblA.mergeGroupPeers.length > 0
        ? tblA.mergeGroupPeers
        : [tblA.number];
      const groupB: string[] = tblB.mergeGroupPeers && tblB.mergeGroupPeers.length > 0
        ? tblB.mergeGroupPeers
        : [tblB.number];

      // Combine and deduplicate — hard cap at 4 tables
      const combined = Array.from(new Set([...groupA, ...groupB])).sort();
      if (combined.length > 4) return state; // silently block; UI should prevent this

      // Primary = lowest table number in combined group (stable sort order)
      const primaryNum = combined[0];

      // Combined capacity: sum of all members' capacities
      const combinedCapacity = combined.reduce((sum, num) => {
        const t = state.tables.find((x) => x.number === num);
        return sum + (t?.capacity || 2);
      }, 0);

      // Sum up all bills and guests from every table in the combined group
      const combinedBill = combined.reduce((sum, num) => {
        const t = state.tables.find((x) => x.number === num);
        return sum + (t?.currentBill || 0);
      }, 0);
      const combinedGuests = combined.reduce((sum, num) => {
        const t = state.tables.find((x) => x.number === num);
        return sum + (t?.guestCount || 0);
      }, 0);

      // Collect all active items from every table
      const combinedItems = combined.flatMap((num) => {
        const t = state.tables.find((x) => x.number === num);
        return t?.activeItems || [];
      });

      return {
        tables: state.tables.map((t) => {
          if (!combined.includes(t.number)) return t;

          const isPrimary = t.number === primaryNum;
          return {
            ...t,
            status: 'OCCUPIED' as const,
            // Primary holds combined capacity, bill + items
            capacity: isPrimary ? combinedCapacity : t.capacity,
            currentBill: isPrimary ? combinedBill : 0,
            guestCount: isPrimary ? Math.max(combined.length * 2, combinedGuests) : 0,
            activeItems: isPrimary ? combinedItems : [],
            // mergedWith = primary's number for all (including primary itself so isMerged check works)
            mergedWith: primaryNum,
            mergeGroupPeers: combined,
            preMergeCapacity: t.preMergeCapacity !== undefined ? t.preMergeCapacity : t.capacity,
            preMergeBill: t.preMergeBill !== undefined ? t.preMergeBill : t.currentBill,
            preMergeGuests: t.preMergeGuests !== undefined ? t.preMergeGuests : t.guestCount,
            preMergeStatus: t.preMergeStatus !== undefined ? t.preMergeStatus : t.status,
          };
        }),
      };
    });
  },

  waiterMergeChairs: (tableNumber, fromChair, toChair) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((tk) => {
        if (tk.tableNumber !== tableNumber) return tk;
        return {
          ...tk,
          seatNumber: tk.seatNumber === fromChair ? toChair : tk.seatNumber,
          items: tk.items.map((it) =>
            it.seatNumber === fromChair ? { ...it, seatNumber: toChair } : it
          ),
        };
      }),
      tables: state.tables.map((t) => {
        if (t.number !== tableNumber) return t;
        const currentGroups = t.mergedSeatGroups || {};
        const groupKey = `Chairs ${Math.min(fromChair, toChair)} & ${Math.max(fromChair, toChair)}`;
        return {
          ...t,
          mergedSeatGroups: {
            ...currentGroups,
            [groupKey]: [Math.min(fromChair, toChair), Math.max(fromChair, toChair)],
          },
          activeItems: (t.activeItems || []).map((it: any) =>
            it.seatNumber === fromChair ? { ...it, seatNumber: toChair } : it
          ),
        };
      }),
    }));
  },

  waiterMergeSeatGroup: (tableNumber, groupKey, seats) => {
    set((state) => {
      const primarySeat = Math.min(...seats);
      return {
        kdsTickets: state.kdsTickets.map((tk) => {
          if (tk.tableNumber !== tableNumber) return tk;
          const isTargetSeat = tk.seatNumber && seats.includes(tk.seatNumber);
          return {
            ...tk,
            seatNumber: isTargetSeat ? primarySeat : tk.seatNumber,
            items: tk.items.map((it) =>
              it.seatNumber && seats.includes(it.seatNumber) ? { ...it, seatNumber: primarySeat } : it
            ),
          };
        }),
        tables: state.tables.map((t) => {
          if (t.number !== tableNumber) return t;
          return {
            ...t,
            mergedSeatGroups: {
              ...(t.mergedSeatGroups || {}),
              [groupKey]: seats,
            },
            activeItems: (t.activeItems || []).map((it: any) =>
              it.seatNumber && seats.includes(it.seatNumber) ? { ...it, seatNumber: primarySeat } : it
            ),
          };
        }),
      };
    });
  },

  waiterUnmergeSeatGroup: (tableNumber, groupKey) => {
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.number !== tableNumber || !t.mergedSeatGroups) return t;
        const nextGroups = { ...t.mergedSeatGroups };
        delete nextGroups[groupKey];
        return {
          ...t,
          mergedSeatGroups: nextGroups,
        };
      }),
    }));
  },

  waiterUnmergeTable: (tableNumber) => {
    set((state) => {
      const tbl = state.tables.find((t) => t.number === tableNumber);
      if (!tbl || !tbl.mergedWith) return state;

      // Get all members of this group
      const group: string[] = tbl.mergeGroupPeers && tbl.mergeGroupPeers.length > 0
        ? tbl.mergeGroupPeers
        : [tbl.number, tbl.mergedWith];

      return {
        tables: state.tables.map((t) => {
          if (!group.includes(t.number)) return t;
          // Restore each table to its pre-merge state individually
          const restoredCapacity = t.preMergeCapacity !== undefined ? t.preMergeCapacity : t.capacity;
          const restoredBill = t.preMergeBill !== undefined ? t.preMergeBill : 0;
          const restoredGuests = t.preMergeGuests !== undefined ? t.preMergeGuests : 0;
          const restoredStatus = t.preMergeStatus ?? (restoredBill === 0 && restoredGuests === 0 ? 'VACANT' : 'OCCUPIED');
          return {
            ...t,
            status: restoredStatus,
            capacity: restoredCapacity,
            currentBill: restoredBill,
            guestCount: restoredGuests,
            activeItems: [],
            mergedWith: undefined,
            mergeGroupPeers: undefined,
            mergedSeatGroups: undefined,
            preMergeCapacity: undefined,
            preMergeBill: undefined,
            preMergeGuests: undefined,
            preMergeStatus: undefined,
          };
        }),
      };
    });
  },

  waiterRemoveTableFromGroup: (tableNumToRemove) => {
    set((state) => {
      const removedTable = state.tables.find((t) => t.number === tableNumToRemove);
      if (!removedTable?.mergedWith) return state; // not merged, nothing to do

      const peers: string[] = removedTable.mergeGroupPeers ?? [removedTable.number, removedTable.mergedWith];

      // If the group is just 2 — removing one fully dissolves it (same as full unmerge)
      if (peers.length <= 2) {
        const restoredTables = state.tables.map((t) => {
          if (!peers.includes(t.number)) return t;
          const restoredBill = t.preMergeBill ?? t.currentBill;
          const restoredGuests = t.preMergeGuests ?? t.guestCount;
          const restoredStatus = t.preMergeStatus ?? (restoredBill === 0 && restoredGuests === 0 ? 'VACANT' : 'OCCUPIED');
          return {
            ...t,
            status: restoredStatus,
            currentBill: restoredBill,
            guestCount: restoredGuests,
            activeItems: [],
            mergedWith: undefined,
            mergeGroupPeers: undefined,
            preMergeBill: undefined,
            preMergeGuests: undefined,
            preMergeStatus: undefined,
          };
        });
        return { tables: restoredTables };
      }

      // 3+ member group — remove one, keep the rest merged
      const oldPrimaryNum = [...peers].sort()[0];
      const oldPrimary = state.tables.find((t) => t.number === oldPrimaryNum);

      // The old combined bill lives on the primary. Subtract the removed table's preMergeBill.
      const removedPreMerge = removedTable.preMergeBill ?? 0;
      const removedPreGuests = removedTable.preMergeGuests ?? removedTable.guestCount;
      const removedRestoredStatus = removedTable.preMergeStatus ?? (removedPreMerge === 0 && removedPreGuests === 0 ? 'VACANT' : 'OCCUPIED');
      const oldCombinedBill = oldPrimary?.currentBill ?? 0;
      const newCombinedBill = Math.max(0, oldCombinedBill - removedPreMerge);

      const newPeers = peers.filter((n) => n !== tableNumToRemove).sort();
      const newPrimaryNum = newPeers[0]; // lowest-numbered of the remaining group

      return {
        tables: state.tables.map((t) => {
          if (t.number === tableNumToRemove) {
            // This table leaves the group and gets its own bill + original status back
            return {
              ...t,
              status: removedRestoredStatus,
              currentBill: removedPreMerge,
              guestCount: removedPreGuests,
              mergedWith: undefined,
              mergeGroupPeers: undefined,
              preMergeBill: undefined,
              preMergeGuests: undefined,
              preMergeStatus: undefined,
            };
          }
          if (peers.includes(t.number)) {
            // Remaining group member: update group peers + bill
            const isNewPrimary = t.number === newPrimaryNum;
            return {
              ...t,
              mergedWith: newPrimaryNum,
              mergeGroupPeers: newPeers,
              currentBill: isNewPrimary ? newCombinedBill : 0,
            };
          }
          return t;
        }),
      };
    });
  },

  
  waiterResolvePing: (pingId) => {
    const prevPings = get().pings;

    // 1. Optimistic: remove ping immediately from UI
    set((state) => ({ pings: state.pings.filter((p) => p.id !== pingId) }));

    // 2. Persist to Supabase
    bridgePost(
      '/api/pings/resolve',
      { pingId },
      () => {
        console.error('[Bridge] waiterResolvePing rollback');
        useSharedBridge.setState({ pings: prevPings });
      }
    );
  },

  
  waiterRecordsPayment: (tableNumber, method, amount) => {
    set((state) => {
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
      // Use mergeGroupPeers to cover ALL tables in a 3-4 member group (not just mergedWith partner)
      const groupNums: Set<string> = new Set(targetTbl?.mergeGroupPeers ?? [tableNumber]);
      return {
        tables: state.tables.map((t) =>
          groupNums.has(t.number)
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

  
  waiterVacatesTable: (tableNumber) => {
    // Snapshot for rollback (vacate is destructive — save full state)
    const prevTables = get().tables;
    const prevTickets = get().kdsTickets;

    set((state) => {
      const targetTbl = state.tables.find((t) => t.number === tableNumber);
      // Use mergeGroupPeers so all tables in a 3-4 member group are fully vacated
      const groupNums: Set<string> = new Set(targetTbl?.mergeGroupPeers ?? [tableNumber]);
      return {
        tables: state.tables.map((t) =>
          groupNums.has(t.number)
            ? {
                ...t,
                status: 'VACANT',
                currentBill: 0,
                guestCount: 0,
                kotCount: 0,
                seatedTime: '--',
                activeItems: [],
                mergedWith: undefined,
                mergeGroupPeers: undefined,
                preMergeBill: undefined,
                preMergeGuests: undefined,
                preMergeStatus: undefined,
              }
            : t
        ),
        // Remove ALL KDS tickets for every table in this group
        kdsTickets: state.kdsTickets.filter(
          (tk) => !groupNums.has(tk.tableNumber)
        ),
      };
    });

    // Persist to Supabase
    bridgePost(
      '/api/tables/vacate',
      { tableNumber },
      () => {
        console.error('[Bridge] waiterVacatesTable rollback');
        useSharedBridge.setState({ tables: prevTables, kdsTickets: prevTickets });
      }
    );
  },

  
  waiterMarkKitchenItemServed: (ticketId, itemId) => {
    set((state) => {
      let targetTableNumber: string | undefined;
      let targetItemName: string | undefined;

      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        targetTableNumber = t.tableNumber;
        const target = t.items.find((i) => i.id === itemId);
        if (target) targetItemName = target.name;
        const newItems = t.items.map((it) =>
          it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it
        );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return { ...t, items: newItems, status: allServed ? 'COMPLETED' : t.status };
      });

      const updatedTables = targetTableNumber
        ? state.tables.map((tbl) => {
            if (tbl.number !== targetTableNumber) return tbl;
            return {
              ...tbl,
              activeItems: (tbl.activeItems || []).map((ai) =>
                ai.id === itemId || (targetItemName && ai.name === targetItemName && ai.status !== 'Served')
                  ? { ...ai, status: 'Served' }
                  : ai
              ),
            };
          })
        : state.tables;

      return { kdsTickets: newTickets, tables: updatedTables };
    });
  },

  
  resetToFreshDemoState: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thoogudeepa_bridge_v1');
      } catch {}
    }
    ticketCounter = 1;
    notifCounter = 1;
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


if (typeof window !== 'undefined') {
  const applyPersistedState = (parsed: Record<string, unknown>, suppressBroadcast = false) => {
    if (!parsed || !Array.isArray(parsed.tables)) return;
    const cur = useSharedBridge.getState();
    // Always filter COMPLETED tickets and sanitize any malformed/NaN IDs on incoming sync
    const liveTickets = Array.isArray(parsed.kdsTickets)
      ? (parsed.kdsTickets as SharedKDSTicket[])
          .filter((tk) => tk && tk.status !== 'COMPLETED')
          .map((tk, idx) => {
            if (!tk.id || typeof tk.id !== 'string' || tk.id.includes('NaN')) {
              return { ...tk, id: `KDS-${Date.now().toString().slice(-4)}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}` };
            }
            return tk;
          })
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
        // Filter out COMPLETED tickets on rehydration so old orders don't persist & sanitize any NaN
        const liveTickets = Array.isArray(parsed.kdsTickets)
          ? (parsed.kdsTickets as SharedKDSTicket[])
              .filter((tk) => tk && tk.status !== 'COMPLETED')
              .map((tk, idx) => {
                if (!tk.id || typeof tk.id !== 'string' || tk.id.includes('NaN')) {
                  return { ...tk, id: `KDS-${Date.now().toString().slice(-4)}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}` };
                }
                return tk;
              })
          : [];
        isBroadcasting = true;
        useSharedBridge.setState({
          ...parsed,
          kdsTickets: liveTickets,
          // kitchenNotifications are session-only, don't persist them
          kitchenNotifications: [],
        });
        isBroadcasting = false;
        // Safely recover ticket counter
        if (liveTickets.length > 0) {
          const validNums = liveTickets
            .map((tk: SharedKDSTicket) => {
              const cleaned = (tk.id || '').replace(/^KDS-/, '').split('-')[0];
              const parsedInt = parseInt(cleaned, 10);
              return isNaN(parsedInt) ? 0 : parsedInt - 100;
            })
            .filter((n: number) => !isNaN(n) && n > 0);
          const maxNum = validNums.length > 0 ? Math.max(...validNums) : 0;
          ticketCounter = (maxNum > 0 ? maxNum : 1) + 1;
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


