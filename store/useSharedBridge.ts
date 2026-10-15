import { create } from 'zustand';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { MenuItem } from '../types/customer';
import { OrderStage } from '../types/customer';
import { broadcastStateChange, supabase } from '../lib/supabase';
import { getOrCreateDeviceToken } from '../lib/device-fingerprint';
import { useManagerStore } from './useManagerStore';
import { INITIAL_PAID_ORDERS, INITIAL_PLACED_ORDERS } from '../data/seedOrdersHistory';


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
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED' | 'SERVED';
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
  isMergeConfirmed?: boolean;
  removedChairs?: number[];
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
  seatNumber?: number;
  type: string;
  message?: string;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  guestName: string;
}

export interface SettledBillSnapshot {
  invoiceNumber: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    options?: string;
    addOns?: string[];
    seatNumber?: number;
  }>;
  subtotal: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  method: string;
  cashTendered?: number;
  cashChange?: number;
  seatLabel: string;
  seatNumber?: number;
  captainName: string;
  tableName: string;
  section: string;
  guestCount: number;
  formattedDate: string;
  formattedTime: string;
  timestamp?: number;
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

export interface ActiveSettlementSession {
  tableNumber: string;
  seatNumber?: number;
  grandTotal?: number;
  method?: 'UPI' | 'CASH';
  isUpiVerified?: boolean;
  initiatedAt: number;
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
let itemIdCounter = 1;
const makeTicketId = () => {
  if (typeof ticketCounter !== 'number' || isNaN(ticketCounter)) {
    ticketCounter = 1;
  }
  const currentCount = ticketCounter++;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `KDS-${String(100 + currentCount).padStart(3, '0')}-${suffix}`;
};
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });


export interface SharedKitchenNotification {
  id: string;
  ticketId: string;
  tableNumber: string;
  itemCount: number;
  timestamp: string;
  dismissed: boolean;
}

interface SharedBridgeState {
  // Shared cross-section state
  tables: SharedTable[];
  kdsTickets: SharedKDSTicket[];
  pings: SharedPing[];
  inventory86: SharedMenuItem86[];
  shiftStats: SharedShiftStats;
  settledBills: Record<string, SettledBillSnapshot>;
  paidBillsHistory: SettledBillSnapshot[];
  activeSettlementSessions: Record<string, ActiveSettlementSession>;

  // NEW kitchen notification queue — never shown to customer
  kitchenNotifications: SharedKitchenNotification[];

  /** Customer places order */
  customerPlacesOrder: (
    tableNumber: string,
    guestName: string,
    guestCount: number,
    items: Array<{ item: MenuItem; selectedOption: string; addOns: string[]; quantity: number }>
  ) => void;

  /** Customer pings waiter */
  customerPingsWaiter: (tableNumber: string, type: string, guestName: string, msg?: string, seatNumber?: number) => void;

  /** Record settled bill snapshot from waiter settlement */
  recordSettledBill: (snapshot: SettledBillSnapshot) => void;

  /** Clear settled bill for a table or specific chair */
  clearSettledBill: (tableNumber: string, seatNumber?: number) => void;

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
    items: Array<{ item: MenuItem; selectedOption: string; quantity: number; addOns?: string[] }>,
    seatNumber?: number
  ) => void;

  /** Waiter seats guests at a table */
  waiterSeatsGuests: (tableNumber: string, guestCount: number, captainName: string) => void;

  /** Waiter merges two tables — combines bills */
  waiterMergeTables: (targetTable: string, sourceTable: string) => void;

  /** Waiter confirms merge configuration for a table group */
  waiterConfirmMerge: (tableNumber: string) => void;

  /** Waiter removes a specific chair from a table */
  waiterRemoveChair: (tableNumber: string, chairIdx: number) => void;

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
  waiterRecordsPayment: (tableNumber: string, method: string, amount: number, seatNumber?: number) => void;

  /** Waiter vacates table → sets to CLEANING then VACANT */
  waiterVacatesTable: (tableNumber: string) => void;

  /** Waiter clears a specific chair's tickets after single-chair payment — frees that seat */
  waiterClearsChairAfterPayment: (tableNumber: string, seatNumber: number) => void;

  /** Waiter marks a kitchen-ready item as served → removes from waiter feed + updates table item status */
  waiterMarkKitchenItemServed: (ticketId: string, itemId: string) => void;

  /** Waiter serves all items for an entire table or chair */
  waiterServeAllItemsForTable: (tableNumber: string, seatNumber?: number) => void;

  /** Waiter initiates settlement session at table/chair */
  waiterInitiatesSettlement: (
    tableNumber: string,
    seatNumber?: number,
    grandTotal?: number,
    method?: 'UPI' | 'CASH',
    isUpiVerified?: boolean
  ) => void;

  /** Waiter clears settlement session at table/chair */
  waiterClearsSettlementSession: (tableNumber: string, seatNumber?: number) => void;

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
  onRollback?: (err?: any) => void,
  onSuccess?: (data: Record<string, unknown>) => void
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
          onRollback?.(err);
        });
        return;
      }
      res.json().then((data) => {
        broadcastStateChange(url);
        onSuccess?.(data as Record<string, unknown>);
      }).catch(() => {
        broadcastStateChange(url);
      });
    })
    .catch((err) => {
      console.error(`[Bridge] API ${url} network error:`, err);
      onRollback?.(err);
    });
}


export const useSharedBridge = create<SharedBridgeState>((set, get) => ({
  tables: freshTables,
  kdsTickets: INITIAL_PLACED_ORDERS,
  pings: [],
  inventory86: freshInventory86,
  shiftStats: {
    tablesServed: 0,
    totalRevenue: 0,
    tipsEarned: 0,
    avgTurnaroundMinutes: 38,
  },
  settledBills: {},
  paidBillsHistory: INITIAL_PAID_ORDERS,
  activeSettlementSessions: {},
  kitchenNotifications: [],

  
  customerPlacesOrder: (tableNumber, guestName, guestCount, items) => {
    const targetTable = get().tables.find((t) => t.number === tableNumber);
    const assignedSeat = (guestCount && guestCount >= 1 && guestCount <= (targetTable?.capacity || 8)) ? guestCount : 1;

    const ticket: SharedKDSTicket = {
      id: makeTicketId(),
      tableNumber,
      serverName: guestName,
      timestamp: nowTime(),
      elapsedMinutes: 0,
      status: 'NEW',
      source: 'CUSTOMER',
      seatNumber: assignedSeat,
      items: items.map((i, idx) => ({
        id: `ki-c-${Date.now()}-${Math.floor(Math.random() * 100000)}-${itemIdCounter++}-${idx}`,
        name: i.item.name,
        quantity: i.quantity,
        stage: 'PLACED',
        prepMode: i.item.prepMode,
        options: i.selectedOption,
        addOns: i.addOns,
        seatNumber: assignedSeat,
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

    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    set((state) => {
      const nextBills = { ...state.settledBills };
      delete nextBills[normTable];
      delete nextBills[tableNumber];
      delete nextBills[`${normTable}-CHAIR-${assignedSeat}`];
      delete nextBills[`${tableNumber}-CHAIR-${assignedSeat}`];

      if (typeof window !== 'undefined') {
        supabase
          .from('pings')
          .delete()
          .or(`id.eq.SETTLED-BILL-${normTable}-S${assignedSeat},id.eq.SETTLE-SESSION-${normTable}-S${assignedSeat},id.eq.SETTLED-BILL-${normTable}`)
          .then(() => {}, () => {});
      }

      return {
        kdsTickets: [...state.kdsTickets, ticket],
        kitchenNotifications: [...state.kitchenNotifications, notif],
        settledBills: nextBills,
        tables: state.tables.map((t) =>
          (cleanNum(t.number) === targetNum || t.number === tableNumber || t.number === normTable)
            ? {
                ...t,
                status: 'OCCUPIED',
                guestCount: (() => {
                  const existingSeats = new Set<number>();
                  (t.activeItems || []).forEach((it) => {
                    if (it.seatNumber) existingSeats.add(it.seatNumber);
                  });
                  existingSeats.add(assignedSeat);
                  return Math.min(t.capacity, Math.max(1, existingSeats.size));
                })(),
                seatedTime: t.seatedTime === '--' ? nowTime() : t.seatedTime,
                currentBill: t.currentBill + orderTotal,
                kotCount: t.kotCount + 1,
                activeItems: [
                  ...(t.activeItems || []),
                  ...ticket.items.map((it) => ({
                    id: it.id,
                    name: it.name,
                    quantity: it.quantity,
                    status: 'Placed',
                    seatNumber: assignedSeat,
                    price: it.price,
                    options: it.options,
                  })),
                ],
              }
            : t
        ),
      };
    });

    broadcastStateChange('orderPlaced', {
      ticket,
      tableNumber,
      assignedSeat,
      orderTotal,
      notif,
    });
    broadcastStateChange('seatOccupied', {
      tableNumber,
      seatNumber: assignedSeat,
    });
    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('thoogudeepa_bridge_sync');
        bc.postMessage({
          type: 'ORDER_PLACED',
          payload: {
            ticket,
            tableNumber,
            assignedSeat,
            orderTotal,
            notif,
          },
        });
        bc.postMessage({
          type: 'SEAT_OCCUPIED',
          tableNumber,
          seatNumber: assignedSeat,
        });
        bc.close();
      } catch {}
    }

    bridgePost(
      '/api/orders/create',
      {
        tableNumber,
        seatNumber: assignedSeat,
        guestName,
        guestCount: guestCount || 1,
        source: 'CUSTOMER',
        deviceToken: getOrCreateDeviceToken(),
        idempotencyKey: ticket.id,
        clientOrderId: ticket.id,
        items: items.map((i, idx) => ({
          id: ticket.items[idx]?.id,
          name: i.item.name,
          quantity: i.quantity,
          price: i.item.price,
          unitPrice: i.item.price,
          prepMode: i.item.prepMode || 'Regular',
          selectedOption: i.selectedOption || null,
          addOns: i.addOns || [],
          seatNumber: assignedSeat,
          seat_number: assignedSeat,
          notes: '',
        })),
      },
      (err) => {
        // Rollback on API failure
        console.error('[Bridge] customerPlacesOrder rollback', err);
        useSharedBridge.setState(prevState);
        if (typeof window !== 'undefined' && err?.error === 'CHAIR_OCCUPIED_BY_ANOTHER_DEVICE') {
          window.dispatchEvent(new CustomEvent('chairConflictDetected', { detail: err }));
        }
      },
      (data) => {
        // Swap optimistic ticket ID with real DB-assigned ticketId so CDC dedup works correctly
        const realId = data.ticketId as string | undefined;
        if (!realId) return;
        useSharedBridge.setState((state) => ({
          kdsTickets: state.kdsTickets.map((tk) =>
            tk.id === ticket.id ? { ...tk, id: realId } : tk
          ),
        }));
      }
    );
  },

  
  customerPingsWaiter: (tableNumber, type, guestName, msg, seatNumber) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normalizedTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    // Deduplication: prevent duplicate pending pings from same table & chair for same reason
    const currentPings = get().pings;
    const hasDuplicate = currentPings.some((p) => {
      if (cleanNum(p.tableNumber) !== targetNum) return false;
      if (p.type !== type || p.status !== 'PENDING') return false;
      // If a specific chair is pinging, only treat as duplicate if that SAME chair already has a pending ping
      if (typeof seatNumber === 'number' && typeof p.seatNumber === 'number') {
        return p.seatNumber === seatNumber;
      }
      if (typeof seatNumber === 'number' && p.seatNumber === undefined) {
        return false; // Do not block chair-specific ping if an existing ping had no chair
      }
      return !seatNumber && !p.seatNumber;
    });
    if (hasDuplicate) return;

    const ping: SharedPing = {
      id: 'p-' + Date.now(),
      tableNumber: normalizedTable,
      seatNumber,
      type,
      message: msg,
      timestamp: nowTime(),
      status: 'PENDING',
      guestName,
    };

    // Snapshot for rollback
    const prevPings = get().pings;

    // 1. Optimistic update
    set((state) => ({ pings: [ping, ...state.pings] }));

    // 2. Broadcast change to all listening windows / tabs
    broadcastStateChange('waiterPingCreated', ping);

    // 3. Persist to Supabase
    bridgePost(
      '/api/pings/create',
      { tableNumber: normalizedTable, seatNumber: seatNumber || 1, type, guestName, message: msg || '' },
      () => {
        console.error('[Bridge] customerPingsWaiter rollback');
        useSharedBridge.setState({ pings: prevPings });
      }
    );
  },

  recordSettledBill: (snapshot) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const tNum = cleanNum(snapshot.tableName);
    const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
    const timestampedSnapshot = { ...snapshot, tableName: normTable, timestamp: Date.now() };

    set((state) => {
      const nextBills = { ...state.settledBills };
      // Key by chair if specific chair; otherwise key by whole table
      if (typeof snapshot.seatNumber === 'number') {
        nextBills[`${normTable}-CHAIR-${snapshot.seatNumber}`] = timestampedSnapshot;
        if (nextBills[normTable]?.seatNumber === snapshot.seatNumber) {
          delete nextBills[normTable];
        }
      } else {
        nextBills[normTable] = timestampedSnapshot;
      }

      // Automatically clear active settlement session
      const nextSessions = { ...state.activeSettlementSessions };
      if (typeof snapshot.seatNumber === 'number') {
        delete nextSessions[`${normTable}-CHAIR-${snapshot.seatNumber}`];
        if (nextSessions[normTable]?.seatNumber === snapshot.seatNumber) {
          delete nextSessions[normTable];
        }
      } else {
        delete nextSessions[normTable];
        for (let s = 1; s <= 12; s++) {
          delete nextSessions[`${normTable}-CHAIR-${s}`];
        }
      }

      // Auto-purge lingering PAYMENT and BILL pings for this table/chair
      const cleanedPings = state.pings.filter(
        (p) =>
          !(
            cleanNum(p.tableNumber) === tNum &&
            (p.type === 'PAYMENT' || p.type === 'BILL') &&
            (typeof snapshot.seatNumber !== 'number' || p.seatNumber === snapshot.seatNumber)
          )
      );

      return {
        settledBills: nextBills,
        paidBillsHistory: [timestampedSnapshot, ...(state.paidBillsHistory || INITIAL_PAID_ORDERS)].slice(0, 50),
        activeSettlementSessions: nextSessions,
        pings: cleanedPings,
      };
    });

    broadcastStateChange('billSettled', timestampedSnapshot);
    broadcastStateChange('paymentPingsResolved', {
      tableNumber: normTable,
      seatNumber: snapshot.seatNumber,
    });

    bridgePost('/api/settlement/session', {
      action: 'RECORD_BILL',
      snapshot: timestampedSnapshot,
    });

    if (typeof window !== 'undefined') {
      let pingQuery = supabase
        .from('pings')
        .update({ status: 'RESOLVED' })
        .eq('table_number', normTable)
        .in('type', ['PAYMENT', 'BILL']);
      if (typeof snapshot.seatNumber === 'number') {
        pingQuery = pingQuery.eq('seat_number', snapshot.seatNumber);
      }
      pingQuery.then(() => {}, () => {});

      const billId = `SETTLED-BILL-${normTable}${typeof snapshot.seatNumber === 'number' ? `-S${snapshot.seatNumber}` : ''}`;
      const sessId = `SETTLE-SESSION-${normTable}${typeof snapshot.seatNumber === 'number' ? `-S${snapshot.seatNumber}` : ''}`;
      supabase
        .from('pings')
        .upsert({
          id: billId,
          table_number: normTable,
          seat_number: typeof snapshot.seatNumber === 'number' ? snapshot.seatNumber : 1,
          type: 'SETTLED_BILL',
          guest_name: snapshot.captainName || 'Guest',
          message: JSON.stringify(timestampedSnapshot),
          status: 'RESOLVED',
        })
        .then(() => {}, () => {});

      if (typeof snapshot.seatNumber === 'number') {
        supabase
          .from('pings')
          .delete()
          .eq('id', sessId)
          .then(() => {}, () => {});
      } else {
        supabase
          .from('pings')
          .delete()
          .or(`id.eq.${sessId},id.eq.SETTLE-SESSION-${normTable}`)
          .then(() => {}, () => {});
      }
    }
  },

  clearSettledBill: (tableNumber, seatNumber) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    set((state) => {
      const nextBills = { ...state.settledBills };
      if (typeof seatNumber === 'number') {
        delete nextBills[`${normTable}-CHAIR-${seatNumber}`];
        if (nextBills[normTable] && (!nextBills[normTable].seatNumber || nextBills[normTable].seatNumber === seatNumber)) {
          delete nextBills[normTable];
        }
      } else {
        delete nextBills[normTable];
        for (let s = 1; s <= 12; s++) {
          delete nextBills[`${normTable}-CHAIR-${s}`];
        }
      }
      return { settledBills: nextBills };
    });

    bridgePost('/api/settlement/session', {
      action: 'CLEAR_BILL',
      tableNumber,
      seatNumber,
    });

    if (typeof window !== 'undefined') {
      if (typeof seatNumber === 'number') {
        supabase
          .from('pings')
          .delete()
          .or(`id.eq.SETTLED-BILL-${normTable}-S${seatNumber},id.eq.SETTLE-SESSION-${normTable}-S${seatNumber}`)
          .then(() => {}, () => {});
      } else {
        supabase
          .from('pings')
          .delete()
          .or(`id.ilike.SETTLED-BILL-${normTable}%,id.ilike.SETTLE-SESSION-${normTable}%`)
          .then(() => {}, () => {});
      }
    }
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
        const anyActive = newItems.some((i) => i.stage === 'PREP' || i.stage === 'PLATED' || i.stage === 'RECEIVED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages without erasing other tickets' items
      const targetTicket = newTickets.find((tk) => tk.id === ticketId);
      const updatedTables = targetTicket
        ? state.tables.map((tbl) => {
            if (tbl.number !== targetTicket.tableNumber) return tbl;
            return {
              ...tbl,
              activeItems: (tbl.activeItems || []).map((ai) => {
                const matchedTicketItem = targetTicket.items.find(
                  (ti) => ti.id === ai.id || (ti.name === ai.name && ti.seatNumber === ai.seatNumber)
                );
                if (!matchedTicketItem) return ai;
                return {
                  ...ai,
                  status:
                    matchedTicketItem.stage === 'SERVED'
                      ? 'Served'
                      : matchedTicketItem.stage === 'PLATED'
                      ? 'Ready'
                      : matchedTicketItem.stage === 'PREP'
                      ? 'Cooking'
                      : matchedTicketItem.stage === 'RECEIVED'
                      ? 'Received'
                      : 'Placed',
                };
              }),
            };
          })
        : state.tables;

      return { kdsTickets: newTickets, tables: updatedTables };
    });

    broadcastStateChange('KDS_TICKET_UPDATED', { ticketId, itemId });

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
    const prevTickets = get().kdsTickets;
    const prevTables = get().tables;

    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId && !t.items.some((it) => it.id === itemId)) return t;
        const newItems = t.items.map((it) => {
          if (it.id !== itemId) return it;
          return { ...it, stage };
        });
        const allPlated = newItems.every((i) => i.stage === 'PLATED' || i.stage === 'SERVED');
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        const anyActive = newItems.some((i) => i.stage === 'PREP' || i.stage === 'PLATED' || i.stage === 'RECEIVED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update waiter table's activeItems stages without erasing other tickets' items
      const targetTicket = newTickets.find((tk) => tk.id === ticketId || tk.items.some((i) => i.id === itemId));
      const updatedTables = targetTicket
        ? state.tables.map((tbl) => {
            if (tbl.number !== targetTicket.tableNumber) return tbl;
            return {
              ...tbl,
              activeItems: (tbl.activeItems || []).map((ai) => {
                const matchedTicketItem = targetTicket.items.find(
                  (ti) => ti.id === ai.id
                );
                if (!matchedTicketItem) return ai;
                return {
                  ...ai,
                  status:
                    matchedTicketItem.stage === 'SERVED'
                      ? 'Served'
                      : matchedTicketItem.stage === 'PLATED'
                      ? 'Ready'
                      : matchedTicketItem.stage === 'PREP'
                      ? 'Cooking'
                      : matchedTicketItem.stage === 'RECEIVED'
                      ? 'Received'
                      : 'Placed',
                };
              }),
            };
          })
        : state.tables;

      return { kdsTickets: newTickets, tables: updatedTables };
    });

    broadcastStateChange('KDS_TICKET_UPDATED', { ticketId, itemId, stage });

    // Persist to Supabase
    bridgePost(
      '/api/kds/bump-item',
      { ticketId, itemId, stage },
      () => {
        console.error('[Bridge] kitchenSetItemStage rollback');
        useSharedBridge.setState({ kdsTickets: prevTickets, tables: prevTables });
      }
    );
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
        const anyActive = newItems.some((i) => i.stage === 'PREP' || i.stage === 'PLATED' || i.stage === 'RECEIVED');
        return {
          ...t,
          items: newItems,
          status: (allServed ? 'COMPLETED' : allPlated ? 'READY' : anyActive ? 'PREP' : 'NEW') as SharedKDSTicket['status'],
        };
      });

      // Update activeItems on all matching tables without erasing other tickets' items
      const updatedTables = state.tables.map((tbl) => {
        const tableTickets = newTickets.filter((tk) => tk.tableNumber === tbl.number);
        if (tableTickets.length === 0) return tbl;
        const allTicketItems = tableTickets.flatMap((tk) => tk.items);
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => {
            const matchedTicketItem = allTicketItems.find(
              (ti) => ti.id === ai.id || (ti.name === ai.name && ti.seatNumber === ai.seatNumber)
            );
            if (!matchedTicketItem) return ai;
            return {
              ...ai,
              status:
                matchedTicketItem.stage === 'SERVED'
                  ? 'Served'
                  : matchedTicketItem.stage === 'PLATED'
                  ? 'Ready'
                  : matchedTicketItem.stage === 'PREP'
                  ? 'Cooking'
                  : matchedTicketItem.stage === 'RECEIVED'
                  ? 'Received'
                  : 'Placed',
            };
          }),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });

    // Persist each matching item to Supabase and broadcast
    const matchingItems: { ticketId: string; itemId: string }[] = [];
    get().kdsTickets.forEach((tk) => {
      tk.items.forEach((it) => {
        const itemKey = getCanonicalDishKey(it.name);
        if (itemKey === targetKey || itemKey.includes(targetKey) || targetKey.includes(itemKey)) {
          matchingItems.push({ ticketId: tk.id, itemId: it.id });
        }
      });
    });

    matchingItems.forEach(({ ticketId, itemId }) => {
      bridgePost('/api/kds/bump-item', { ticketId, itemId, stage });
    });
    broadcastStateChange('BULK_STAGE_UPDATE');
  },

  
  kitchenBumpTable: (ticketId) => {
    const prevTickets = get().kdsTickets;
    const prevTables = get().tables;

    set((state) => {
      const targetTicket = state.kdsTickets.find((t) => t.id === ticketId);
      const newTickets = state.kdsTickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'READY' as const, // status: 'READY',
          items: t.items.map((i) => ({ ...i, stage: 'PLATED' as OrderStage })), // items: t.items.map((i) => ({ ...i, stage: 'PLATED' }))
        };
      });

      const updatedTables = targetTicket
        ? state.tables.map((tbl) => {
            if (tbl.number !== targetTicket.tableNumber) return tbl;
            return {
              ...tbl,
              activeItems: (tbl.activeItems || []).map((ai) => {
                const isTicketItem = targetTicket.items.some(
                  (ti) => ti.id === ai.id
                );
                return isTicketItem ? { ...ai, status: 'Ready' } : ai;
              }),
            };
          })
        : state.tables;

      return { kdsTickets: newTickets, tables: updatedTables };
    });

    bridgePost(
      '/api/kds/bump-table',
      { ticketId, status: 'READY' },
      () => {
        console.error('[Bridge] kitchenBumpTable rollback');
        useSharedBridge.setState({ kdsTickets: prevTickets, tables: prevTables }); // useSharedBridge.setState({ kdsTickets: prevTickets })
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
      items: items.map((i, idx) => {
        const addOns = i.addOns || [];
        const addOnExtra = addOns.reduce((s, ao) => {
          const found = i.item.optionsGroup2?.addOns?.find((a) => a.name === ao);
          return s + (found?.extraPrice || 0);
        }, 0);
        const unitPrice = i.item.price + addOnExtra;
        return {
          id: `ki-w-${Date.now()}-${Math.floor(Math.random() * 100000)}-${itemIdCounter++}-${idx}`,
          name: i.item.name,
          quantity: i.quantity,
          stage: 'PLACED',
          prepMode: i.item.prepMode,
          options: i.selectedOption,
          addOns,
          price: unitPrice,
          seatNumber,
        };
      }),
    };

    const notif = {
      id: `notif-${Date.now()}-${notifCounter++}`,
      ticketId: ticket.id,
      tableNumber,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      timestamp: nowTime(),
      dismissed: false,
    };

    const kotTotal = items.reduce((s, i) => {
      const addOns = i.addOns || [];
      const addOnExtra = addOns.reduce((ao_s, ao) => {
        const found = i.item.optionsGroup2?.addOns?.find((a) => a.name === ao);
        return ao_s + (found?.extraPrice || 0);
      }, 0);
      return s + (i.item.price + addOnExtra) * i.quantity;
    }, 0);

    // Snapshot for rollback
    const prevState = {
      kdsTickets: get().kdsTickets,
      kitchenNotifications: get().kitchenNotifications,
      tables: get().tables,
    };

    // 1. Optimistic update
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    set((state) => {
      const nextBills = { ...state.settledBills };
      delete nextBills[normTable];
      delete nextBills[tableNumber];
      if (typeof seatNumber === 'number') {
        delete nextBills[`${normTable}-CHAIR-${seatNumber}`];
        delete nextBills[`${tableNumber}-CHAIR-${seatNumber}`];
        if (typeof window !== 'undefined') {
          supabase
            .from('pings')
            .delete()
            .or(`id.eq.SETTLED-BILL-${normTable}-S${seatNumber},id.eq.SETTLE-SESSION-${normTable}-S${seatNumber},id.eq.SETTLED-BILL-${normTable}`)
            .then(() => {}, () => {});
        }
      } else {
        for (let s = 1; s <= 12; s++) {
          delete nextBills[`${normTable}-CHAIR-${s}`];
          delete nextBills[`${tableNumber}-CHAIR-${s}`];
        }
        if (typeof window !== 'undefined') {
          supabase
            .from('pings')
            .delete()
            .or(`id.ilike.SETTLED-BILL-${normTable}%,id.ilike.SETTLE-SESSION-${normTable}%`)
            .then(() => {}, () => {});
        }
      }

      return {
        kdsTickets: [...state.kdsTickets, ticket],
        kitchenNotifications: [...state.kitchenNotifications, notif],
        settledBills: nextBills,
        tables: state.tables.map((t) =>
        (cleanNum(t.number) === targetNum || t.number === tableNumber || t.number === normTable)
          ? {
              ...t,
              status: 'OCCUPIED',
              guestCount: (() => {
                const existingSeats = new Set<number>();
                (t.activeItems || []).forEach((it) => {
                  if (it.seatNumber) existingSeats.add(it.seatNumber);
                });
                if (seatNumber) existingSeats.add(seatNumber);
                return Math.min(t.capacity, Math.max(1, existingSeats.size));
              })(),
              seatedTime: t.seatedTime === '--' ? nowTime() : t.seatedTime,
              currentBill: t.currentBill + kotTotal,
              kotCount: t.kotCount + 1,
              activeItems: [
                ...(t.activeItems || []),
                ...items.map((i, idx) => {
                  const addOns = i.addOns || [];
                  const addOnExtra = addOns.reduce((s, ao) => {
                    const found = i.item.optionsGroup2?.addOns?.find((a) => a.name === ao);
                    return s + (found?.extraPrice || 0);
                  }, 0);
                  return {
                    id: `ai-w-${Date.now()}-${Math.floor(Math.random() * 100000)}-${itemIdCounter++}-${idx}`,
                    name: i.item.name,
                    quantity: i.quantity,
                    status: 'Placed',
                    seatNumber,
                    price: i.item.price + addOnExtra,
                    options: i.selectedOption,
                    addOns,
                  };
                }),
              ],
            }
          : t
      ),
      };
    });

    broadcastStateChange('orderPlaced', {
      ticket,
      tableNumber,
      assignedSeat: seatNumber || 1,
      orderTotal: kotTotal,
      notif,
    });
    broadcastStateChange('seatOccupied', {
      tableNumber,
      seatNumber: seatNumber || 1,
    });
    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('thoogudeepa_bridge_sync');
        bc.postMessage({
          type: 'ORDER_PLACED',
          payload: {
            ticket,
            tableNumber,
            assignedSeat: seatNumber || 1,
            orderTotal: kotTotal,
            notif,
          },
        });
        bc.postMessage({
          type: 'SEAT_OCCUPIED',
          tableNumber,
          seatNumber: seatNumber || 1,
        });
        bc.close();
      } catch {}
    }

    // 2. Persist to Supabase
    bridgePost(
      '/api/orders/create',
      {
        tableNumber,
        seatNumber: seatNumber || 1,
        guestName: captainName,
        guestCount: 1,
        source: 'WAITER',
        items: items.map((i, idx) => {
          const addOns = i.addOns || [];
          const addOnExtra = addOns.reduce((s, ao) => {
            const found = i.item.optionsGroup2?.addOns?.find((a) => a.name === ao);
            return s + (found?.extraPrice || 0);
          }, 0);
          const unitPrice = i.item.price + addOnExtra;
          return {
            id: ticket.items[idx]?.id,
            name: i.item.name,
            quantity: i.quantity,
            price: unitPrice,
            unitPrice,
            prepMode: i.item.prepMode || 'Regular',
            selectedOption: i.selectedOption || null,
            addOns,
            seatNumber: seatNumber || 1,
            seat_number: seatNumber || 1,
            notes: seatNumber ? `Seat ${seatNumber}` : '',
          };
        }),
      },
      () => {
        console.error('[Bridge] waiterFiresKOT rollback');
        useSharedBridge.setState(prevState);
      },
      (data) => {
        // Swap optimistic ticket ID with real DB-assigned ticketId so CDC dedup works correctly
        const realId = data.ticketId as string | undefined;
        if (!realId) return;
        useSharedBridge.setState((state) => ({
          kdsTickets: state.kdsTickets.map((tk) =>
            tk.id === ticket.id ? { ...tk, id: realId } : tk
          ),
        }));
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

      const hasActiveOrders = combined.some((num) => {
        const t = state.tables.find((x) => x.number === num);
        return (t?.currentBill || 0) > 0 || (t?.activeItems && t.activeItems.length > 0);
      });
      const mergedStatus = hasActiveOrders ? ('OCCUPIED' as const) : ('VACANT' as const);

      return {
        tables: state.tables.map((t) => {
          if (!combined.includes(t.number)) return t;

          const preCap = t.preMergeCapacity !== undefined ? t.preMergeCapacity : t.capacity;
          // IMPORTANT: Each table keeps its own activeItems and currentBill.
          // The floor grid aggregates them across members — do NOT consolidate onto primary.
          // This prevents double-billing and ensures occupied-chair counts are correct per table.
          return {
            ...t,
            status: mergedStatus,
            capacity: preCap,
            // Preserve each table's own bill and items — do NOT move them to primary
            mergedWith: primaryNum,
            mergeGroupPeers: combined,
            isMergeConfirmed: false,
            preMergeCapacity: preCap,
            preMergeBill: t.preMergeBill !== undefined ? t.preMergeBill : t.currentBill,
            preMergeGuests: t.preMergeGuests !== undefined ? t.preMergeGuests : t.guestCount,
            preMergeStatus: t.preMergeStatus !== undefined ? t.preMergeStatus : t.status,
          };
        }),
      };
    });
  },

  waiterConfirmMerge: (tableNumber) => {
    set((state) => {
      const target = state.tables.find((t) => t.number === tableNumber);
      const peers = target?.mergeGroupPeers || [tableNumber];
      return {
        tables: state.tables.map((t) =>
          peers.includes(t.number) ? { ...t, isMergeConfirmed: true } : t
        ),
      };
    });
  },

  waiterRemoveChair: (tableNumber, chairIdx) => {
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.number !== tableNumber) return t;
        const currentRemoved = t.removedChairs || [];
        if (currentRemoved.includes(chairIdx)) return t;
        return {
          ...t,
          removedChairs: [...currentRemoved, chairIdx],
        };
      }),
    }));
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
          // Each table kept its own bill/items during merge. Just restore pre-merge status.
          const restoredBill = t.currentBill || 0;
          const restoredGuests = t.guestCount || 0;
          const restoredStatus = restoredBill > 0 || (t.activeItems && t.activeItems.length > 0)
            ? 'OCCUPIED' as const
            : 'VACANT' as const;
          return {
            ...t,
            status: restoredStatus,
            capacity: t.preMergeCapacity !== undefined ? t.preMergeCapacity : t.capacity,
            mergedWith: undefined,
            mergeGroupPeers: undefined,
            mergedSeatGroups: undefined,
            isMergeConfirmed: undefined,
            removedChairs: undefined,
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
            isMergeConfirmed: undefined,
            removedChairs: undefined,
            preMergeBill: undefined,
            preMergeGuests: undefined,
            preMergeStatus: undefined,
          };
        });
        return { tables: restoredTables };
      }

      // 3+ member group — remove one, keep the rest merged
      const newPeers = peers.filter((n) => n !== tableNumToRemove).sort();
      const newPrimaryNum = newPeers[0]; // lowest-numbered of the remaining group

      // Removed table: keeps its own bill/items (already stored on it), just leaves the group
      const restoredBill = removedTable.currentBill || 0;
      const restoredGuests = removedTable.guestCount || 0;
      const removedRestoredStatus = restoredBill > 0 || (removedTable.activeItems && removedTable.activeItems.length > 0)
        ? 'OCCUPIED' as const
        : 'VACANT' as const;

      return {
        tables: state.tables.map((t) => {
          if (t.number === tableNumToRemove) {
            // This table leaves the group — its own bill/items are already on it
            return {
              ...t,
              status: removedRestoredStatus,
              mergedWith: undefined,
              mergeGroupPeers: undefined,
              isMergeConfirmed: undefined,
              removedChairs: undefined,
              preMergeCapacity: undefined,
              preMergeBill: undefined,
              preMergeGuests: undefined,
              preMergeStatus: undefined,
            };
          }
          if (peers.includes(t.number)) {
            // Remaining group member: update group peers only — bill/items unchanged
            return {
              ...t,
              mergedWith: newPrimaryNum,
              mergeGroupPeers: newPeers,
              isMergeConfirmed: false, // allow review / edit
            };
          }
          return t;
        }),
      };
    });
  },

  
  waiterResolvePing: (pingId) => {
    const prevPings = get().pings;
    const targetPing = prevPings.find((p) => p.id === pingId);

    // 1. Optimistic: remove ping immediately from UI
    set((state) => ({ pings: state.pings.filter((p) => p.id !== pingId) }));

    const resolvedPayload = {
      pingId,
      tableNumber: targetPing?.tableNumber,
      seatNumber: targetPing?.seatNumber,
      type: targetPing?.type,
      message: targetPing?.type
        ? `Floor Captain attended your request for ${targetPing.type}.`
        : 'Floor Captain attended your request.',
    };

    broadcastStateChange('waiterPingResolved', resolvedPayload);

    // Broadcast event locally for any customer store listening on this client
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('waiterPingAttended', {
          detail: resolvedPayload,
        })
      );
    }

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

  
  waiterRecordsPayment: (tableNumber, method, amount, seatNumber) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);

    set((state) => {
      const targetTbl = state.tables.find((t) => cleanNum(t.number) === targetNum);
      const groupNums: Set<string> = new Set(targetTbl?.mergeGroupPeers ?? [targetTbl?.number || tableNumber]);

      // For single-chair settle: keep table OCCUPIED, reduce its bill by that chair's share.
      // For full-table settle: mark entire group as BILLING (pre-vacate status).
      const isChairSettle = typeof seatNumber === 'number';

      const newTickets = isChairSettle
        ? state.kdsTickets.map((tk) => {
            if (cleanNum(tk.tableNumber) !== targetNum) return tk;
            const seatItems = tk.items.filter((it) => it.seatNumber === seatNumber);
            const otherItems = tk.items.filter((it) => it.seatNumber !== seatNumber);
            if (seatItems.length === 0) return tk;
            if (otherItems.length === 0) {
              return { ...tk, status: 'COMPLETED' as const };
            }
            return { ...tk, items: otherItems };
          })
        : state.kdsTickets;

      return {
        tables: state.tables.map((t) => {
          if (!groupNums.has(t.number) && cleanNum(t.number) !== targetNum) return t;
          if (isChairSettle) {
            // Recompute currentBill strictly as raw subtotal of remaining activeItems
            const remainingActiveItems = (t.activeItems || []).filter(
              (ai: { seatNumber?: number }) => ai.seatNumber !== seatNumber
            );
            const remainingSubtotal = remainingActiveItems.reduce(
              (s, ai) => s + (ai.price || 0) * (ai.quantity || 1),
              0
            );
            return { ...t, currentBill: remainingSubtotal, activeItems: remainingActiveItems };
          }
          return { ...t, status: 'BILLING' };
        }),
        kdsTickets: newTickets,
        pings: state.pings.filter(
          (p) =>
            !(
              cleanNum(p.tableNumber) === targetNum &&
              (p.type === 'PAYMENT' || p.type === 'BILL') &&
              (!isChairSettle || p.seatNumber === seatNumber)
            )
        ),
        shiftStats: {
          ...state.shiftStats,
          totalRevenue: state.shiftStats.totalRevenue + amount,
          tablesServed: state.shiftStats.tablesServed + (isChairSettle ? 0 : 1),
        },
      };
    });

    if (typeof window !== 'undefined') {
      const normTbl = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;
      let pQuery = supabase
        .from('pings')
        .update({ status: 'RESOLVED' })
        .eq('table_number', normTbl)
        .in('type', ['PAYMENT', 'BILL']);
      if (typeof seatNumber === 'number') {
        pQuery = pQuery.eq('seat_number', seatNumber);
      }
      pQuery.then(() => {}, () => {});
    }

    // Automatically sync cash collection into Manager Staff Roster (M9 Waiter Cash Handover)
    if (String(method).toUpperCase() === 'CASH' && amount > 0) {
      try {
        const targetTbl = get().tables.find((t) => cleanNum(t.number) === targetNum);
        const serverRef = targetTbl?.serverName || targetTbl?.section || 'Floor Captain';
        useManagerStore.getState().recordStaffCashCollection(serverRef, amount);
      } catch (err) {
        console.error('[Bridge] Failed to sync cash collection to manager roster:', err);
      }
    }

    broadcastStateChange('paymentPingsResolved', {
      tableNumber: `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`,
      seatNumber,
    });
  },


  waiterVacatesTable: (tableNumber) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;
    // Snapshot for rollback (vacate is destructive — save full state)
    const prevTables = get().tables;
    const prevTickets = get().kdsTickets;

    set((state) => {
      const targetTbl = state.tables.find((t) => cleanNum(t.number) === targetNum);
      const groupNums: Set<string> = new Set(targetTbl?.mergeGroupPeers ?? [targetTbl?.number || tableNumber]);
      const nextSessions = { ...state.activeSettlementSessions };
      const nextBills = { ...state.settledBills };
      delete nextSessions[normTable];
      delete nextBills[normTable];
      for (let s = 1; s <= 12; s++) {
        delete nextSessions[`${normTable}-CHAIR-${s}`];
        delete nextBills[`${normTable}-CHAIR-${s}`];
      }

      return {
        tables: state.tables.map((t) =>
          groupNums.has(t.number) || cleanNum(t.number) === targetNum
            ? {
                ...t,
                status: 'VACANT' as const,
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
          (tk) => !groupNums.has(tk.tableNumber) && cleanNum(tk.tableNumber) !== targetNum
        ),
        // Auto-vanish ALL table notifications and pings on vacate
        pings: state.pings.filter(
          (p) => !groupNums.has(p.tableNumber) && cleanNum(p.tableNumber) !== targetNum
        ),
        activeSettlementSessions: nextSessions,
        settledBills: nextBills,
      };
    });

    broadcastStateChange('tableVacated');

    // Clear server settlement session & settled bills
    bridgePost('/api/settlement/session', {
      action: 'VACATE',
      tableNumber,
    });

    if (typeof window !== 'undefined') {
      supabase
        .from('pings')
        .delete()
        .or(`table_number.eq.${normTable},id.ilike.SETTLE-SESSION-${normTable}%`)
        .then(() => {}, () => {});
    }

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

  waiterClearsChairAfterPayment: (tableNumber, seatNumber) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    set((state) => {
      // 1. Separate items on tickets: settled seat's items are removed from active ticket
      const newTickets: SharedKDSTicket[] = [];

      for (const tk of state.kdsTickets) {
        if (cleanNum(tk.tableNumber) !== targetNum) {
          newTickets.push(tk);
          continue;
        }

        const tkSeat = tk.seatNumber !== undefined && tk.seatNumber !== null ? Number(tk.seatNumber) : undefined;
        const seatItems = tk.items.filter((it) => (it.seatNumber ?? tkSeat) === seatNumber);
        const otherItems = tk.items.filter((it) => (it.seatNumber ?? tkSeat) !== seatNumber);

        if (seatItems.length === 0 && tkSeat !== seatNumber) {
          // Ticket doesn't contain items for this seat
          newTickets.push(tk);
          continue;
        }

        if (otherItems.length === 0) {
          // Entire ticket is for this seat -> mark ticket COMPLETED
          newTickets.push({ ...tk, status: 'COMPLETED' as const });
        } else {
          // Mixed ticket: keep active ticket with ONLY the other items
          newTickets.push({
            ...tk,
            items: otherItems,
          });
          // Add an archived ticket for the paid seat items
          newTickets.push({
            ...tk,
            id: `${tk.id}-paid-s${seatNumber}`,
            status: 'COMPLETED' as const,
            items: seatItems.map((it) => ({ ...it, stage: 'SERVED' as OrderStage })),
          });
        }
      }

      // 2. Update table activeItems and remaining bill:
      const newTables = state.tables.map((t) => {
        if (cleanNum(t.number) !== targetNum) return t;

        const remainingActiveItems = (t.activeItems || []).filter(
          (ai: { seatNumber?: number }) => ai.seatNumber !== seatNumber
        );

        // Sum remaining items from active tickets and activeItems
        const remainingTicketItems = newTickets
          .filter((tk) => cleanNum(tk.tableNumber) === targetNum && tk.status !== 'COMPLETED')
          .flatMap((tk) => tk.items);

        const remainingTotal = remainingTicketItems.length > 0
          ? remainingTicketItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
          : remainingActiveItems.reduce((s, ai) => s + (ai.price || 0) * (ai.quantity || 1), 0);

        const newBill = remainingTotal;
        const hasRemainingOrders = remainingTicketItems.length > 0 || remainingActiveItems.length > 0;
        const activeKotCount = newTickets.filter((tk) => cleanNum(tk.tableNumber) === targetNum && tk.status !== 'COMPLETED').length;

        const hasOtherGuests = (t.guestCount || 1) > 1 || hasRemainingOrders;
        const nextStatus = hasOtherGuests ? ('OCCUPIED' as const) : ('VACANT' as const);

        return {
          ...t,
          activeItems: remainingActiveItems,
          currentBill: newBill,
          guestCount: hasOtherGuests ? Math.max(1, (t.guestCount || 2) - 1) : 0,
          kotCount: hasRemainingOrders ? activeKotCount : 0,
          status: nextStatus,
        };
      });

      const nextSessions = { ...state.activeSettlementSessions };
      const nextBills = { ...state.settledBills };
      const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;
      delete nextSessions[`${normTable}-CHAIR-${seatNumber}`];
      // Keep chair settled bill snapshot so the customer receives and views their receipt

      const tblRemaining = newTables.find((t) => cleanNum(t.number) === targetNum);
      if (!tblRemaining || tblRemaining.currentBill === 0 || tblRemaining.status === 'VACANT') {
        delete nextBills[normTable];
        delete nextSessions[normTable];
      }

      // Auto-vanish ALL pings and notifications for this vacated chair!
      const remainingPings = state.pings.filter((p) => {
        const isMatchTable = cleanNum(p.tableNumber) === targetNum;
        const isMatchSeat = p.seatNumber === seatNumber;
        return !(isMatchTable && isMatchSeat);
      });

      return {
        kdsTickets: newTickets,
        tables: newTables,
        pings: remainingPings,
        activeSettlementSessions: nextSessions,
        settledBills: nextBills,
      };
    });

    broadcastStateChange('chairCleared', {
      tableNumber: normTable,
      seatNumber,
    });

    // Clear server active settlement session for this chair
    bridgePost('/api/settlement/session', {
      action: 'CLEAR_SESSION',
      tableNumber,
      seatNumber,
    });

    if (typeof window !== 'undefined') {
      supabase
        .from('pings')
        .delete()
        .eq('table_number', normTable)
        .eq('seat_number', seatNumber)
        .then(() => {}, () => {});
    }

    // Persist to Supabase
    bridgePost(
      '/api/tables/vacate',
      { tableNumber, seatNumber },
      () => {
        console.error('[Bridge] waiterClearsChairAfterPayment rollback');
      }
    );
  },

  waiterMarkKitchenItemServed: (ticketId, itemId) => {
    const prevTickets = get().kdsTickets;
    const prevTables = get().tables;

    let targetTableNumber: string | undefined;
    let targetItemName: string | undefined;
    let targetSeatNumber: number | undefined;
    const isServeAll = itemId === 'ALL' || !itemId;

    set((state) => {
      const newTickets = state.kdsTickets.map((t) => {
        const isMatch = t.id === ticketId || (itemId && itemId !== 'ALL' && t.items.some((i) => i.id === itemId));
        if (!isMatch) return t;
        targetTableNumber = t.tableNumber;
        if (!isServeAll) {
          const target = t.items.find((i) => i.id === itemId);
          if (target) {
            targetItemName = target.name;
            targetSeatNumber = target.seatNumber || t.seatNumber;
          }
        }
        const newItems = isServeAll
          ? t.items.map((it) => ({ ...it, stage: 'SERVED' as OrderStage }))
          : t.items.map((it) =>
              it.id === itemId ? { ...it, stage: 'SERVED' as OrderStage } : it
            );
        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return { ...t, items: newItems, status: allServed ? 'COMPLETED' : t.status };
      });

      if (!targetTableNumber) {
        const foundTbl = state.tables.find((tbl) =>
          tbl.activeItems?.some((ai) => (isServeAll ? true : ai.id === itemId))
        );
        if (foundTbl) targetTableNumber = foundTbl.number;
      }

      const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
      const targetNum = targetTableNumber ? cleanNum(targetTableNumber) : '';

      const updatedTables = targetTableNumber
        ? state.tables.map((tbl) => {
            if (cleanNum(tbl.number) !== targetNum && tbl.number !== targetTableNumber) return tbl;
            return {
              ...tbl,
              activeItems: (tbl.activeItems || []).map((ai) => {
                if (isServeAll || ai.id === itemId) {
                  return { ...ai, status: 'Served' };
                }
                return ai;
              }),
            };
          })
        : state.tables;

      return { kdsTickets: newTickets, tables: updatedTables };
    });

    const payload = {
      ticketId,
      itemId: isServeAll ? 'ALL' : itemId,
      tableNumber: targetTableNumber,
      seatNumber: targetSeatNumber,
      stage: 'SERVED',
      timestamp: Date.now(),
    };

    broadcastStateChange('KDS_TICKET_UPDATED', payload);
    broadcastStateChange('ITEMS_SERVED', payload);

    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('thoogudeepa_bridge_sync');
        bc.postMessage({
          type: 'ITEMS_SERVED',
          payload,
        });
        bc.close();
      } catch {}
    }

    // Persist to Supabase
    bridgePost(
      '/api/kds/bump-item',
      { ticketId, itemId: isServeAll ? 'ALL' : itemId, stage: 'SERVED' },
      () => {
        console.error('[Bridge] waiterMarkKitchenItemServed rollback');
        useSharedBridge.setState({ kdsTickets: prevTickets, tables: prevTables });
      }
    );
  },

  waiterServeAllItemsForTable: (tableNumber, seatNumber) => {
    const prevTickets = get().kdsTickets;
    const prevTables = get().tables;

    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    set((state) => {
      const nextTickets = state.kdsTickets.map((t) => {
        if (cleanNum(t.tableNumber) !== targetNum && t.tableNumber !== tableNumber && t.tableNumber !== normTable) {
          return t;
        }
        if (seatNumber && t.seatNumber && t.seatNumber !== seatNumber) {
          return t;
        }
        const nextItems = t.items.map((it) => {
          if (!seatNumber || !it.seatNumber || it.seatNumber === seatNumber) {
            return { ...it, stage: 'SERVED' as OrderStage };
          }
          return it;
        });
        const allServed = nextItems.every((it) => it.stage === 'SERVED');
        return { ...t, items: nextItems, status: allServed ? ('COMPLETED' as const) : t.status };
      });

      const nextTables = state.tables.map((tbl) => {
        if (cleanNum(tbl.number) !== targetNum && tbl.number !== tableNumber && tbl.number !== normTable) {
          return tbl;
        }
        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => {
            if (!seatNumber || !ai.seatNumber || ai.seatNumber === seatNumber) {
              return { ...ai, status: 'Served' };
            }
            return ai;
          }),
        };
      });

      return { kdsTickets: nextTickets, tables: nextTables };
    });

    const payload = {
      tableNumber: normTable,
      seatNumber,
      itemId: 'ALL',
      stage: 'SERVED',
      timestamp: Date.now(),
    };

    broadcastStateChange('KDS_TICKET_UPDATED', payload);
    broadcastStateChange('ITEMS_SERVED', payload);

    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('thoogudeepa_bridge_sync');
        bc.postMessage({
          type: 'ITEMS_SERVED',
          payload,
        });
        bc.close();
      } catch {}
    }

    // Persist to Supabase
    const matchingTickets = prevTickets.filter(
      (t) => (cleanNum(t.tableNumber) === targetNum || t.tableNumber === tableNumber) && (!seatNumber || t.seatNumber === seatNumber)
    );
    matchingTickets.forEach((tk) => {
      bridgePost('/api/kds/bump-item', { ticketId: tk.id, itemId: 'ALL', stage: 'SERVED' });
    });
  },

  waiterInitiatesSettlement: (tableNumber, seatNumber, grandTotal, method, isUpiVerified) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const tNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
    const session: ActiveSettlementSession = {
      tableNumber: normTable,
      seatNumber,
      grandTotal,
      method: method || 'UPI',
      isUpiVerified: Boolean(isUpiVerified),
      initiatedAt: Date.now(),
    };

    set((state) => {
      const nextSessions = { ...state.activeSettlementSessions };
      if (typeof seatNumber === 'number') {
        nextSessions[`${normTable}-CHAIR-${seatNumber}`] = session;
        if (nextSessions[normTable]?.seatNumber === seatNumber) {
          delete nextSessions[normTable];
        }
      } else {
        nextSessions[normTable] = session;
      }
      return { activeSettlementSessions: nextSessions };
    });

    broadcastStateChange('settlementSessionStarted', session);

    // Persist to server so any other device gets it immediately on fetch or poll
    bridgePost('/api/settlement/session', {
      action: 'INITIATE',
      session,
    });

    // Persist directly to Supabase pings table for real-time cloud multi-device sync (Vercel-ready)
    if (typeof window !== 'undefined') {
      const sessId = `SETTLE-SESSION-${normTable}${typeof seatNumber === 'number' ? `-S${seatNumber}` : ''}`;
      supabase
        .from('pings')
        .upsert({
          id: sessId,
          table_number: normTable,
          seat_number: typeof seatNumber === 'number' ? seatNumber : 1,
          type: 'SETTLEMENT_SESSION',
          guest_name: 'Floor Captain',
          message: JSON.stringify(session),
          status: 'PENDING',
        })
        .then(() => {}, () => {});
    }
  },

  waiterClearsSettlementSession: (tableNumber, seatNumber) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const tNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;

    set((state) => {
      const nextSessions = { ...state.activeSettlementSessions };
      if (typeof seatNumber === 'number') {
        delete nextSessions[`${normTable}-CHAIR-${seatNumber}`];
        if (nextSessions[normTable]?.seatNumber === seatNumber) {
          delete nextSessions[normTable];
        }
      } else {
        delete nextSessions[normTable];
        for (let s = 1; s <= 12; s++) {
          delete nextSessions[`${normTable}-CHAIR-${s}`];
        }
      }
      return { activeSettlementSessions: nextSessions };
    });

    broadcastStateChange('settlementSessionCleared', { normTable, seatNumber });

    bridgePost('/api/settlement/session', {
      action: 'CLEAR',
      tableNumber: normTable,
      seatNumber,
    });

    if (typeof window !== 'undefined') {
      const sessId = `SETTLE-SESSION-${normTable}${typeof seatNumber === 'number' ? `-S${seatNumber}` : ''}`;
      if (typeof seatNumber === 'number') {
        supabase
          .from('pings')
          .delete()
          .eq('id', sessId)
          .then(() => {}, () => {});
      } else {
        supabase
          .from('pings')
          .delete()
          .or(`id.eq.${sessId},id.eq.SETTLE-SESSION-${normTable}`)
          .then(() => {}, () => {});
      }
    }
  },

  resetToFreshDemoState: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('thoogudeepa_bridge_v3');
        localStorage.removeItem('thoogudeepa_bridge_live_v2');
        localStorage.removeItem('thoogudeepa_bridge_v1');
        localStorage.removeItem('thoogudeepa_shared_bridge_state');
      } catch {}
    }
    ticketCounter = 1;
    notifCounter = 1;
    itemIdCounter = 1;
    set({
      tables: freshTables.map((t) => ({
        ...t,
        status: 'VACANT' as const,
        currentBill: 0,
        guestCount: 0,
        activeItems: [],
        seatedTime: '--',
        kotCount: 0,
        mergedWith: undefined,
        mergeGroupPeers: undefined,
        isMergeConfirmed: undefined,
        preMergeCapacity: undefined,
        preMergeBill: undefined,
        preMergeGuests: undefined,
        preMergeStatus: undefined,
      })),
      kdsTickets: [],
      pings: [],
      inventory86: freshInventory86,
      kitchenNotifications: [],
      settledBills: {},
      activeSettlementSessions: {},
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
  let isBroadcasting = false;
  const BRIDGE_STORAGE_KEY = 'thoogudeepa_bridge_v3';

  // Purge any stale legacy bridge state from previous versions
  try {
    localStorage.removeItem('thoogudeepa_bridge_live_v2');
    localStorage.removeItem('thoogudeepa_bridge_v1');
    localStorage.removeItem('thoogudeepa_shared_bridge_state');
  } catch {}

  const applyPersistedState = (parsed: Record<string, unknown>, suppressBroadcast = false) => {
    if (!parsed || !Array.isArray(parsed.tables)) return;
    const cur = useSharedBridge.getState();
    const rawTables = parsed.tables as SharedTable[];

    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const tablesWithOrders = new Set<string>();
    rawTables
      .filter((t) => (t.currentBill && t.currentBill > 0) || (t.activeItems && t.activeItems.length > 0))
      .forEach((t) => {
        tablesWithOrders.add(t.number);
        const c = cleanNum(t.number);
        tablesWithOrders.add(c);
        tablesWithOrders.add(`T-${String(parseInt(c, 10) || 1).padStart(2, '0')}`);
      });

    // Expand: if any member of a merge group has orders, ALL peers are considered active
    const activeTableNums = new Set<string>(tablesWithOrders);
    rawTables.forEach((t) => {
      if (t.mergeGroupPeers && t.mergeGroupPeers.length > 1) {
        const groupHasOrders = t.mergeGroupPeers.some((n) => tablesWithOrders.has(n) || tablesWithOrders.has(cleanNum(n)));
        if (groupHasOrders) {
          t.mergeGroupPeers.forEach((n) => {
            activeTableNums.add(n);
            const c = cleanNum(n);
            activeTableNums.add(c);
            activeTableNums.add(`T-${String(parseInt(c, 10) || 1).padStart(2, '0')}`);
          });
        }
      }
    });

    const sanitizedTables = rawTables.map((t) => {
      // A table is safe to keep if: it has its own bill/items, OR it's a member of an active merge group
      const isMergedAndGroupActive = t.mergeGroupPeers && t.mergeGroupPeers.length > 1 && (activeTableNums.has(t.number) || activeTableNums.has(cleanNum(t.number)));
      const hasBillOrItems = (t.currentBill && t.currentBill > 0) || (t.activeItems && t.activeItems.length > 0);
      if (!hasBillOrItems && !isMergedAndGroupActive) {
        // Truly vacant table — wipe any leftover state
        return {
          ...t,
          status: 'VACANT' as const,
          currentBill: 0,
          guestCount: 0,
          activeItems: [],
          seatedTime: '--',
          kotCount: 0,
          // Also clear any stale merge group metadata if the group has no orders
          mergedWith: undefined,
          mergeGroupPeers: undefined,
          isMergeConfirmed: undefined,
          preMergeCapacity: undefined,
          preMergeBill: undefined,
          preMergeGuests: undefined,
          preMergeStatus: undefined,
        };
      }
      return t;
    });

    // Always filter COMPLETED tickets and orphan tickets for vacant tables
    const liveTickets = Array.isArray(parsed.kdsTickets)
      ? (parsed.kdsTickets as SharedKDSTicket[])
          .filter((tk) => {
            if (!tk || tk.status === 'COMPLETED') return false;
            const c = cleanNum(tk.tableNumber);
            const norm = `T-${String(parseInt(c, 10) || 1).padStart(2, '0')}`;
            return activeTableNums.has(tk.tableNumber) || activeTableNums.has(c) || activeTableNums.has(norm);
          })
          .map((tk, idx) => {
            if (!tk.id || typeof tk.id !== 'string' || tk.id.includes('NaN')) {
              return { ...tk, id: `KDS-${Date.now().toString().slice(-4)}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}` };
            }
            return tk;
          })
      : cur.kdsTickets.filter((tk) => {
          const c = cleanNum(tk.tableNumber);
          const norm = `T-${String(parseInt(c, 10) || 1).padStart(2, '0')}`;
          return activeTableNums.has(tk.tableNumber) || activeTableNums.has(c) || activeTableNums.has(norm);
        });

    // Validate shiftStats shape before accepting
    const rawStats = parsed.shiftStats as Partial<typeof cur.shiftStats> | undefined;
    const safeShiftStats: typeof cur.shiftStats =
      rawStats &&
      typeof rawStats.tablesServed === 'number' &&
      typeof rawStats.totalRevenue === 'number'
        ? (rawStats as typeof cur.shiftStats)
        : cur.shiftStats;

    const incoming: Partial<typeof cur> = {
      tables: sanitizedTables,
      kdsTickets: liveTickets,
      pings: Array.isArray(parsed.pings) ? (parsed.pings as typeof cur.pings) : cur.pings,
      inventory86: Array.isArray(parsed.inventory86)
        ? (parsed.inventory86 as typeof cur.inventory86)
        : cur.inventory86,
      shiftStats: safeShiftStats,
      settledBills: parsed.settledBills && typeof parsed.settledBills === 'object'
        ? (parsed.settledBills as typeof cur.settledBills)
        : cur.settledBills,
      activeSettlementSessions: parsed.activeSettlementSessions && typeof parsed.activeSettlementSessions === 'object'
        ? (parsed.activeSettlementSessions as typeof cur.activeSettlementSessions)
        : cur.activeSettlementSessions,
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


  // 0. Rehydrate from localStorage if available
  try {
    // Purge any stale legacy bridge state from old test iterations
    localStorage.removeItem('thoogudeepa_bridge_v1');

    const saved = localStorage.getItem(BRIDGE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.tables)) {
        const rawTables = parsed.tables as SharedTable[];
        const tablesWithOrdersLocal = new Set(
          rawTables
            .filter((t) => (t.currentBill && t.currentBill > 0) || (t.activeItems && t.activeItems.length > 0))
            .map((t) => t.number)
        );
        // Expand to include all merge group peers of any table with orders
        const activeTableNums = new Set<string>(tablesWithOrdersLocal);
        rawTables.forEach((t) => {
          if (t.mergeGroupPeers && t.mergeGroupPeers.length > 1) {
            const groupHasOrders = t.mergeGroupPeers.some((n) => tablesWithOrdersLocal.has(n));
            if (groupHasOrders) {
              t.mergeGroupPeers.forEach((n) => activeTableNums.add(n));
            }
          }
        });

        const sanitizedTables = rawTables.map((t) => {
          const isMergedAndGroupActive = t.mergeGroupPeers && t.mergeGroupPeers.length > 1 && activeTableNums.has(t.number);
          const hasBillOrItems = (t.currentBill && t.currentBill > 0) || (t.activeItems && t.activeItems.length > 0);
          if (!hasBillOrItems && !isMergedAndGroupActive) {
            return {
              ...t,
              status: 'VACANT' as const,
              currentBill: 0,
              guestCount: 0,
              activeItems: [],
              seatedTime: '--',
              kotCount: 0,
              mergedWith: undefined,
              mergeGroupPeers: undefined,
              isMergeConfirmed: undefined,
              preMergeCapacity: undefined,
              preMergeBill: undefined,
              preMergeGuests: undefined,
              preMergeStatus: undefined,
            };
          }
          return t;
        });

        const incomingTickets: SharedKDSTicket[] = Array.isArray(parsed.kdsTickets)
          ? (parsed.kdsTickets as SharedKDSTicket[])
              .filter((tk) => tk && tk.status !== 'COMPLETED' && activeTableNums.has(tk.tableNumber))
              .map((tk, idx) => {
                if (!tk.id || typeof tk.id !== 'string' || tk.id.includes('NaN')) {
                  return { ...tk, id: `KDS-${Date.now().toString().slice(-4)}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}` };
                }
                return tk;
              })
          : [];

        // Merge tickets non-destructively by ID so one chair's update never purges another chair's tickets
        const currentBridge = useSharedBridge.getState();
        const currentTickets = currentBridge.kdsTickets || [];
        const ticketMap = new Map<string, SharedKDSTicket>();
        currentTickets.forEach((tk: SharedKDSTicket) => {
          if (tk?.id) ticketMap.set(tk.id, tk);
        });
        incomingTickets.forEach((tk: SharedKDSTicket) => {
          if (tk?.id) ticketMap.set(tk.id, tk);
        });
        const mergedLiveTickets = Array.from(ticketMap.values()).filter(
          (tk) => tk.status !== 'COMPLETED' && (activeTableNums.has(tk.tableNumber) || (tk.items && tk.items.length > 0))
        );

        // Merge active items across chairs so multi-diner tables retain all chairs' orders
        const currentTables = currentBridge.tables || [];
        const mergedTables = sanitizedTables.map((t) => {
          const localTbl = currentTables.find((lt: SharedTable) => lt.number === t.number);
          if (!localTbl) return t;

          const itemMap = new Map<string, any>();
          (localTbl.activeItems || []).forEach((ai: any) => {
            const key = ai.id || `${ai.name}-s${ai.seatNumber}`;
            itemMap.set(key, ai);
          });
          (t.activeItems || []).forEach((ai: any) => {
            const key = ai.id || `${ai.name}-s${ai.seatNumber}`;
            itemMap.set(key, ai);
          });
          const mergedActiveItems = Array.from(itemMap.values());
          const hasItems = mergedActiveItems.length > 0;
          return {
            ...t,
            activeItems: mergedActiveItems,
            status: hasItems ? 'OCCUPIED' : t.status,
          };
        });

        isBroadcasting = true;
        useSharedBridge.setState({
          ...parsed,
          tables: mergedTables,
          kdsTickets: mergedLiveTickets,
          // kitchenNotifications are session-only, don't persist them
          kitchenNotifications: [],
        });
        isBroadcasting = false;

        // Immediately persist the sanitized clean state
        try {
          localStorage.setItem(BRIDGE_STORAGE_KEY, JSON.stringify({
            ...parsed,
            tables: sanitizedTables,
            kdsTickets: mergedLiveTickets,
          }));
        } catch {}

        // Safely recover ticket counter
        if (mergedLiveTickets.length > 0) {
          const validNums = mergedLiveTickets
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

  const applyIncomingOrderPlaced = (data: {
    ticket?: SharedKDSTicket;
    tableNumber?: string;
    assignedSeat?: number;
    seatNumber?: number;
    orderTotal?: number;
    notif?: SharedKitchenNotification;
  }) => {
    if (!data || !data.ticket || !data.tableNumber) return;
    const { ticket, tableNumber, orderTotal = 0, notif } = data;
    const seatNum = data.assignedSeat || data.seatNumber || ticket.seatNumber || 1;

    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

    isBroadcasting = true;
    useSharedBridge.setState((state) => {
      // 1. Deduplicate KDS tickets
      const exists = state.kdsTickets.some((tk) => tk.id === ticket.id);
      const nextTickets = exists
        ? state.kdsTickets.map((tk) => (tk.id === ticket.id ? { ...tk, ...ticket } : tk))
        : [...state.kdsTickets, ticket];

      // 2. Add kitchen notification if provided and not duplicated
      const nextNotifs = notif && !state.kitchenNotifications.some((n) => n.id === notif.id)
        ? [...state.kitchenNotifications, notif]
        : state.kitchenNotifications;

      // 3. Clear settled bills for this table/chair
      const nextBills = { ...state.settledBills };
      delete nextBills[normTable];
      delete nextBills[tableNumber];
      delete nextBills[`${normTable}-CHAIR-${seatNum}`];
      delete nextBills[`${tableNumber}-CHAIR-${seatNum}`];

      // 4. Update table status, running bill, active items, and seated time
      const nextTables = state.tables.map((t) => {
        const match = cleanNum(t.number) === targetNum || t.number === tableNumber || t.number === normTable;
        if (!match) return t;

        const existingSeats = new Set<number>();
        (t.activeItems || []).forEach((it) => {
          if (it.seatNumber) existingSeats.add(it.seatNumber);
        });
        existingSeats.add(seatNum);
        const computedGuests = Math.min(t.capacity, Math.max(1, existingSeats.size));

        const newActive = ticket.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          status: 'Placed' as const,
          seatNumber: seatNum,
          price: it.price,
          options: it.options,
          addOns: it.addOns,
        }));

        const currentActiveIds = new Set((t.activeItems || []).map((i) => i.id));
        const filteredNewActive = newActive.filter((i) => !currentActiveIds.has(i.id));

        const totalToAdd = exists ? 0 : (orderTotal || ticket.items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0));
        const kotIncrement = exists ? 0 : 1;

        return {
          ...t,
          status: 'OCCUPIED' as const,
          guestCount: Math.max(t.guestCount || 1, computedGuests),
          seatedTime: (!t.seatedTime || t.seatedTime === '--') ? nowTime() : t.seatedTime,
          currentBill: (t.currentBill || 0) + totalToAdd,
          kotCount: (t.kotCount || 0) + kotIncrement,
          activeItems: [...(t.activeItems || []), ...filteredNewActive],
        };
      });

      return {
        kdsTickets: nextTickets,
        kitchenNotifications: nextNotifs,
        settledBills: nextBills,
        tables: nextTables,
      };
    });
    isBroadcasting = false;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('seatOccupiedRealtime', {
          detail: {
            tableNumber,
            seatNumber: seatNum,
          },
        })
      );
    }
  };

  const applyIncomingItemsServed = (data: {
    ticketId?: string;
    itemId?: string;
    tableNumber?: string;
    seatNumber?: number;
    stage?: string;
  }) => {
    if (!data) return;
    const { ticketId, itemId, tableNumber, seatNumber } = data;
    const isServeAll = itemId === 'ALL' || !itemId;
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetNum = tableNumber ? cleanNum(tableNumber) : '';

    isBroadcasting = true;
    useSharedBridge.setState((state) => {
      let matchedTableNum = targetNum;

      const newTickets = state.kdsTickets.map((t) => {
        const matchByTicket = ticketId && t.id === ticketId;
        const matchByTable = targetNum && (cleanNum(t.tableNumber) === targetNum || t.tableNumber === tableNumber);
        const matchByItem = itemId && itemId !== 'ALL' && t.items.some((i) => i.id === itemId);

        if (!matchByTicket && !matchByTable && !matchByItem) return t;

        if (seatNumber && t.seatNumber && t.seatNumber !== seatNumber) {
          return t;
        }

        if (!matchedTableNum && t.tableNumber) {
          matchedTableNum = cleanNum(t.tableNumber);
        }

        const newItems = t.items.map((it) => {
          if (seatNumber && it.seatNumber && it.seatNumber !== seatNumber) {
            return it;
          }
          if (isServeAll || it.id === itemId) {
            return { ...it, stage: 'SERVED' as OrderStage };
          }
          return it;
        });

        const allServed = newItems.every((i) => i.stage === 'SERVED');
        return {
          ...t,
          items: newItems,
          status: allServed ? ('COMPLETED' as const) : t.status,
        };
      });

      const updatedTables = state.tables.map((tbl) => {
        const isTarget =
          (matchedTableNum && cleanNum(tbl.number) === matchedTableNum) ||
          (targetNum && cleanNum(tbl.number) === targetNum) ||
          (tableNumber && tbl.number === tableNumber) ||
          tbl.activeItems?.some((ai) => (isServeAll ? false : ai.id === itemId));

        if (!isTarget) return tbl;

        return {
          ...tbl,
          activeItems: (tbl.activeItems || []).map((ai) => {
            if (seatNumber && ai.seatNumber && ai.seatNumber !== seatNumber) {
              return ai;
            }
            if (isServeAll || ai.id === itemId) {
              return { ...ai, status: 'Served' as const };
            }
            return ai;
          }),
        };
      });

      return { kdsTickets: newTickets, tables: updatedTables };
    });
    isBroadcasting = false;
  };

  // 1. Native Cross-Tab Sync via BroadcastChannel (0ms latency, zero dependencies)
  let syncChannel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('thoogudeepa_bridge_sync');

    syncChannel.onmessage = (event) => {
      if (
        event.data?.type === 'VENUE_CLEAN_RESET' ||
        event.data?.type === 'VENUE_FRESH_RESET' ||
        event.data?.type === 'RESET_ALL'
      ) {
        useSharedBridge.getState().resetToFreshDemoState();
        try {
          localStorage.removeItem(BRIDGE_STORAGE_KEY);
          localStorage.removeItem('thoogudeepa_bridge_v3');
          localStorage.removeItem('thoogudeepa_bridge_live_v2');
          localStorage.removeItem('thoogudeepa_bridge_v1');
          localStorage.removeItem('thoogudeepa_shared_bridge_state');
        } catch {}
        return;
      }
      if (event.data?.type === 'ORDER_PLACED' && event.data.payload) {
        applyIncomingOrderPlaced(event.data.payload);
      }
      if (event.data?.type === 'ITEMS_SERVED' && event.data.payload) {
        applyIncomingItemsServed(event.data.payload);
      }
      if (event.data?.type === 'SEAT_OCCUPIED' && event.data.tableNumber && event.data.seatNumber) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('seatOccupiedRealtime', {
              detail: {
                tableNumber: event.data.tableNumber,
                seatNumber: Number(event.data.seatNumber),
              },
            })
          );
        }
      }
      if (event.data?.type === 'BROADCAST_STATE_CHANGED') {
        const reason = event.data.reason;
        const payload = event.data.payload;
        if (reason === 'orderPlaced' && payload) {
          applyIncomingOrderPlaced(payload);
        }
        if (
          (reason === 'ITEMS_SERVED' ||
            reason === 'KDS_TICKET_UPDATED' ||
            reason === 'KDS_ITEM_BUMPED') &&
          payload
        ) {
          applyIncomingItemsServed(payload);
        }
        if (reason === 'waiterPingCreated' && payload) {
          const newPing = payload as SharedPing;
          if (newPing && newPing.tableNumber) {
            useSharedBridge.setState((state) => {
              if (state.pings.some((p) => p.id === newPing.id)) return state;
              return { pings: [newPing, ...state.pings] };
            });
          }
        }
        if (reason === 'waiterPingResolved' && payload?.pingId) {
          useSharedBridge.setState((state) => ({
            pings: state.pings.filter((p) => p.id !== payload.pingId),
          }));
        }
        if (reason === 'paymentPingsResolved' && payload?.tableNumber) {
          const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
          const targetTbl = cleanNum(payload.tableNumber);
          const targetSeat = payload.seatNumber;
          useSharedBridge.setState((state) => ({
            pings: state.pings.filter(
              (p) =>
                !(
                  cleanNum(p.tableNumber) === targetTbl &&
                  (p.type === 'PAYMENT' || p.type === 'BILL') &&
                  (!targetSeat || p.seatNumber === targetSeat)
                )
            ),
          }));
        }
      }
      if (event.data?.type === 'SYNC_STATE' && event.data.payload) {
        applyPersistedState(event.data.payload, true); // suppress re-broadcast
      }
    };

    try {
      const sbChannel = supabase.channel('restaurant-sync-broadcast');
      sbChannel
        .on('broadcast', { event: 'STATE_CHANGED' }, (msg: any) => {
          const reason = msg?.payload?.reason;
          const payload = msg?.payload?.payload;
          if (
            reason === 'VENUE_CLEAN_RESET' ||
            reason === 'VENUE_FRESH_RESET' ||
            reason === 'venueReset' ||
            reason === 'RESET_ALL'
          ) {
            useSharedBridge.getState().resetToFreshDemoState();
            try {
              localStorage.removeItem(BRIDGE_STORAGE_KEY);
              localStorage.removeItem('thoogudeepa_bridge_v3');
              localStorage.removeItem('thoogudeepa_bridge_live_v2');
              localStorage.removeItem('thoogudeepa_bridge_v1');
              localStorage.removeItem('thoogudeepa_shared_bridge_state');
            } catch {}
            try {
              syncChannel?.postMessage({ type: 'VENUE_CLEAN_RESET' });
            } catch {}
            return;
          }
          if (reason === 'orderPlaced' && payload) {
            applyIncomingOrderPlaced(payload);
          }
          if (
            (reason === 'ITEMS_SERVED' ||
              reason === 'KDS_TICKET_UPDATED' ||
              reason === 'KDS_ITEM_BUMPED') &&
            payload
          ) {
            applyIncomingItemsServed(payload);
          }
          if (reason === 'seatOccupied' && payload?.tableNumber && payload?.seatNumber) {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('seatOccupiedRealtime', {
                  detail: {
                    tableNumber: payload.tableNumber,
                    seatNumber: Number(payload.seatNumber),
                  },
                })
              );
            }
          }
          if (reason === 'waiterPingCreated' && payload) {
            const newPing = payload as SharedPing;
            if (newPing && newPing.tableNumber) {
              useSharedBridge.setState((state) => {
                if (state.pings.some((p) => p.id === newPing.id)) return state;
                return { pings: [newPing, ...state.pings] };
              });
            }
          }
          if (reason === 'waiterPingResolved' && payload?.pingId) {
            useSharedBridge.setState((state) => ({
              pings: state.pings.filter((p) => p.id !== payload.pingId),
            }));
          }
          if (reason === 'paymentPingsResolved' && payload?.tableNumber) {
            const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
            const targetTbl = cleanNum(payload.tableNumber);
            const targetSeat = payload.seatNumber;
            useSharedBridge.setState((state) => ({
              pings: state.pings.filter(
                (p) =>
                  !(
                    cleanNum(p.tableNumber) === targetTbl &&
                    (p.type === 'PAYMENT' || p.type === 'BILL') &&
                    (!targetSeat || p.seatNumber === targetSeat)
                  )
              ),
            }));
          } else if (reason === 'settlementSessionStarted' && payload) {
            const sess = payload;
            useSharedBridge.setState((state) => {
              const nextSessions = { ...state.activeSettlementSessions };
              nextSessions[sess.tableNumber] = sess;
              if (typeof sess.seatNumber === 'number') {
                nextSessions[`${sess.tableNumber}-CHAIR-${sess.seatNumber}`] = sess;
              } else {
                for (let s = 1; s <= 6; s++) {
                  nextSessions[`${sess.tableNumber}-CHAIR-${s}`] = sess;
                }
              }
              return { activeSettlementSessions: nextSessions };
            });
          } else if (reason === 'settlementSessionEnded' && payload?.tableNumber) {
            const normTable = payload.tableNumber;
            useSharedBridge.setState((state) => {
              const nextSessions = { ...state.activeSettlementSessions };
              delete nextSessions[normTable];
              for (let s = 1; s <= 6; s++) {
                delete nextSessions[`${normTable}-CHAIR-${s}`];
              }
              return { activeSettlementSessions: nextSessions };
            });
          }
        })
        .subscribe();
    } catch {}

    useSharedBridge.subscribe((state) => {
      // Save state to localStorage on every change (persistence + cross-device fallback)
      try {
        localStorage.setItem(
          BRIDGE_STORAGE_KEY,
          JSON.stringify({
            tables: state.tables,
            kdsTickets: state.kdsTickets,
            pings: state.pings,
            inventory86: state.inventory86,
            shiftStats: state.shiftStats,
            settledBills: state.settledBills,
            activeSettlementSessions: state.activeSettlementSessions,
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
            settledBills: state.settledBills,
            activeSettlementSessions: state.activeSettlementSessions,
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
      const saved = localStorage.getItem(BRIDGE_STORAGE_KEY);
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

  // 3. Instant storage event sync across browser tabs (0ms latency fallback)
  window.addEventListener('storage', (event) => {
    if (event.key === BRIDGE_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        applyPersistedState(parsed, true);
      } catch {}
    }
  });

  // 4. localStorage polling fallback (every 3 seconds)
  // Catches state changes from tabs where BroadcastChannel messages were dropped
  // (e.g., heavy CPU load, tab sleeping, or browser throttling)
  let lastSeenTicketsHash = '';
  setInterval(() => {
    // Skip polling if this tab is currently broadcasting or if tab is visible
    // (BroadcastChannel handles the visible case; polling is only a safety net)
    if (document.hidden) return; // only poll when tab is visible
    try {
      const saved = localStorage.getItem(BRIDGE_STORAGE_KEY);
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



