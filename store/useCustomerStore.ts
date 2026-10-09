import { create } from 'zustand';
import {
  ScreenId,
  MenuItem,
  CartItem,
  OrderStage,
  IndividualItemTracking,
  PaymentDetails,
  WaiterPingType,
} from '../types/customer';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
import { useSharedBridge, SettledBillSnapshot } from './useSharedBridge';

interface CustomerStoreState {
  currentScreen: ScreenId;
  previousScreen: ScreenId;
  viewMode: 'single' | 'all';
  guestName: string;
  tableNumber: string;
  seatNumber: number;
  venueName: string;
  selectedDetailItem: MenuItem;
  cart: CartItem[];
  orderStage: OrderStage;
  itemTracking: IndividualItemTracking[];
  payment: PaymentDetails;
  waiterNotification: { active: boolean; type: string; message: string } | null;
  isSettled: boolean;

  // Actions
  setCurrentScreen: (screen: ScreenId) => void;
  navigateTo: (screen: ScreenId) => void;
  setViewMode: (mode: 'single' | 'all') => void;
  setGuestName: (name: string) => void;
  setTableNumber: (table: string) => void;
  setSeatNumber: (seat: number) => void;
  setSelectedDetailItem: (item: MenuItem) => void;
  addToCart: (
    item: MenuItem,
    selectedOption?: string,
    selectedAddOns?: string[],
    quantity?: number
  ) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  orderSeparately: (cartItemId: string) => void;
  placeAllOrders: () => void;
  setOrderStage: (stage: OrderStage) => void;
  setItemTracking: (items: IndividualItemTracking[]) => void;
  updateTip: (tip: number) => void;
  setSplitMode: (mode: 'NONE' | 'ITEMS' | 'PERSONS', count?: number) => void;
  setPaymentMethod: (method: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH') => void;
  toggleRedeemPoints: () => void;
  confirmAndPay: () => void;
  pingWaiter: (type: WaiterPingType, customMsg?: string) => void;
  handleBillSettledByWaiter: (snapshot: SettledBillSnapshot) => void;
  syncWithActiveSession: (tableNumber: string, seatNumber: number) => void;
  dismissWaiterNotification: () => void;
  resetSession: () => void;
}

// Calculate payment details dynamically based on items currently in cart
const calculatePaymentTotals = (
  cart: CartItem[],
  prevPayment: PaymentDetails
): PaymentDetails => {
  const subtotal = cart.length > 0 ? cart.reduce((s, i) => s + i.totalPrice, 0) : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST (2.5% CGST + 2.5% SGST)
  const discount = prevPayment.redeemPoints ? Math.min(50, subtotal + tax) : 0;
  const tip = subtotal > 0 ? prevPayment.tipAmount : 0;
  const totalAmount = Math.max(0, subtotal + tax + tip - discount);

  return {
    ...prevPayment,
    subtotal,
    tax,
    tipAmount: tip,
    discount,
    totalAmount,
  };
};

const initialEmptyPayment: PaymentDetails = {
  subtotal: 0,
  tax: 0,
  tipAmount: 0,
  discount: 0,
  totalAmount: 0,
  splitMode: 'NONE',
  paymentMethod: 'UPI',
  redeemPoints: false,
  pointsAvailable: 250,
  pointsRedeemed: 0,
  transactionId: '',
};

export const useCustomerStore = create<CustomerStoreState>((set) => ({
  currentScreen: 1,
  previousScreen: 1,
  viewMode: 'single',
  guestName: '',
  tableNumber: 'T-01',
  seatNumber: 1,
  venueName: 'Thoogudeepa donne biryani mane',
  selectedDetailItem: INITIAL_MENU_ITEMS[0],
  cart: [],
  orderStage: 'PLACED',
  itemTracking: [],
  payment: initialEmptyPayment,
  waiterNotification: null,
  isSettled: false,

  setCurrentScreen: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    })),

  navigateTo: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    })),

  setViewMode: (mode) => set({ viewMode: mode }),
  setGuestName: (guestName) => set({ guestName }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  setSeatNumber: (seatNumber) => set({ seatNumber }),
  setSelectedDetailItem: (selectedDetailItem) => set({ selectedDetailItem }),

  addToCart: (
    item,
    selectedOption = item.optionsGroup1.choices[0],
    selectedAddOns = [],
    quantity = 1
  ) => {
    let unitPrice = item.price;
    selectedAddOns.forEach((addonName) => {
      const found = item.optionsGroup2.addOns.find((a) => a.name === addonName);
      if (found) unitPrice += found.extraPrice;
    });

    set((state) => {
      const existingIndex = state.cart.findIndex(
        (ci) =>
          !ci.isOrdered &&
          ci.menuItem.id === item.id &&
          ci.selectedOption === selectedOption &&
          JSON.stringify([...ci.selectedAddOns].sort()) ===
            JSON.stringify([...selectedAddOns].sort())
      );

      let newCart: CartItem[];
      if (existingIndex > -1) {
        newCart = state.cart.map((ci, idx) => {
          if (idx === existingIndex) {
            const newQty = ci.quantity + quantity;
            return {
              ...ci,
              quantity: newQty,
              totalPrice: newQty * unitPrice,
            };
          }
          return ci;
        });
      } else {
        const newCartItem: CartItem = {
          cartItemId: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          menuItem: item,
          selectedOption,
          selectedAddOns,
          quantity,
          totalPrice: unitPrice * quantity,
          prepMode: item.prepMode,
        };
        newCart = [...state.cart, newCartItem];
      }

      return {
        cart: newCart,
        payment: calculatePaymentTotals(newCart, state.payment),
      };
    });
  },

  updateCartQuantity: (cartItemId, delta) => {
    set((state) => {
      const newCart = state.cart
        .map((ci) => {
          if (ci.cartItemId === cartItemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            const singleUnitPrice = ci.totalPrice / ci.quantity;
            return {
              ...ci,
              quantity: newQty,
              totalPrice: singleUnitPrice * newQty,
            };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];

      return {
        cart: newCart,
        payment: calculatePaymentTotals(newCart, state.payment),
      };
    });
  },

  removeCartItem: (cartItemId) => {
    set((state) => {
      const newCart = state.cart.filter((ci) => ci.cartItemId !== cartItemId);
      return {
        cart: newCart,
        payment: calculatePaymentTotals(newCart, state.payment),
      };
    });
  },

  orderSeparately: (cartItemId) => {
    set((state) => {
      const item = state.cart.find((c) => c.cartItemId === cartItemId);
      if (!item) return state;
      const trackingEntry: IndividualItemTracking = {
        id: 'sep-' + Date.now(),
        name: item.menuItem.name,
        prepMode: item.prepMode,
        status: 'Sent to Kitchen Separately',
        stage: 'PLACED',
      };
      return {
        itemTracking: [...state.itemTracking, trackingEntry],
      };
    });
  },

  placeAllOrders: () => {
    set((state) => {
      const newlyAddedItems = state.cart.filter((c) => !c.isOrdered);
      if (newlyAddedItems.length === 0) {
        return { currentScreen: 5 };
      }

      // Read seat from URL params or state
      const params = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
      const seatNumber = parseInt(params.get('seat') || String(state.seatNumber || 1), 10) || 1;
      const rawTable = params.get('table') || state.tableNumber || 'T-01';
      let tableId = rawTable.trim().toUpperCase();
      const match = tableId.match(/^T-?(\d+)$/);
      if (match) {
        tableId = `T-${String(parseInt(match[1], 10)).padStart(2, '0')}`;
      }

      // Build a stable ticket ID
      const ts = Date.now();
      const tblTag = tableId.replace('-', '');
      const ticketId = `KDS-${tblTag}-${ts}-001`;

      // Push order once through the shared bridge (optimistic update + /api/orders/create + broadcast)
      try {
        const bridge = useSharedBridge.getState();
        bridge.customerPlacesOrder(
          tableId,
          state.guestName || `Guest (Chair ${seatNumber})`,
          seatNumber,
          newlyAddedItems.map((c) => ({
            item: c.menuItem,
            selectedOption: c.selectedOption,
            addOns: c.selectedAddOns,
            quantity: c.quantity,
          }))
        );
      } catch (err) {
        console.error('[placeAllOrders] bridge order error:', err);
      }

      const newTracking: IndividualItemTracking[] = newlyAddedItems.map((c) => ({
        id: 'track-' + c.cartItemId,
        name: `${c.menuItem.name} × ${c.quantity}`,
        prepMode: c.prepMode,
        status: 'In Preparation',
        stage: 'PREP' as OrderStage,
      }));

      const updatedCart = state.cart.map((c) => ({
        ...c,
        isOrdered: true,
        seatNumber: c.seatNumber || seatNumber,
      }));

      return {
        cart: updatedCart,
        tableNumber: tableId,
        itemTracking: [...state.itemTracking, ...newTracking],
        orderStage: 'PLACED',
        previousScreen: state.currentScreen,
        currentScreen: 5,
      };
    });
  },

  setOrderStage: (orderStage) => set({ orderStage }),
  setItemTracking: (itemTracking) => set({ itemTracking }),

  updateTip: (tip) => {
    set((state) => {
      const updatedPayment: PaymentDetails = {
        ...state.payment,
        tipAmount: tip,
        totalAmount: Math.max(0, state.payment.subtotal + state.payment.tax + tip - state.payment.discount),
      };
      return { payment: updatedPayment };
    });
  },

  setSplitMode: (mode, count = 2) => {
    set((state) => ({
      payment: {
        ...state.payment,
        splitMode: mode,
        splitCount: count,
      },
    }));
  },

  setPaymentMethod: (method) => {
    set((state) => ({
      payment: {
        ...state.payment,
        paymentMethod: method,
      },
    }));
  },

  toggleRedeemPoints: () => {
    set((state) => {
      const willRedeem = !state.payment.redeemPoints;
      const discount = willRedeem ? Math.min(50, state.payment.subtotal + state.payment.tax) : 0;
      const pointsRedeemed = willRedeem ? 100 : 0;
      const updatedPayment: PaymentDetails = {
        ...state.payment,
        redeemPoints: willRedeem,
        discount,
        pointsRedeemed,
        totalAmount: Math.max(0, state.payment.subtotal + state.payment.tax + state.payment.tipAmount - discount),
      };
      return { payment: updatedPayment };
    });
  },

  confirmAndPay: () => {
    const randomTxn = '#TXN-' + Math.floor(100000 + Math.random() * 900000);
    set((state) => {
      // Record payment in bridge → updates waiter shift stats + table to BILLING
      const bridge = useSharedBridge.getState();
      bridge.waiterRecordsPayment(state.tableNumber, state.payment.paymentMethod, state.payment.totalAmount);

      return {
        previousScreen: state.currentScreen,
        currentScreen: 8, // Proceed to Confirmation Screen 8
        payment: {
          ...state.payment,
          transactionId: randomTxn,
        },
      };
    });
  },

  pingWaiter: (type, customMsg = '') => {
    set((state) => {
      const seat = state.seatNumber || 1;
      const guest = state.guestName || `Guest (Chair ${seat})`;
      const defaultMsg =
        type === 'PAYMENT'
          ? `Customer requested bill settlement at Table ${state.tableNumber} (Chair ${seat})`
          : type === 'WATER'
          ? `Drinking water requested for Table ${state.tableNumber} (Chair ${seat})`
          : type === 'TISSUE'
          ? `Extra tissues requested for Table ${state.tableNumber} (Chair ${seat})`
          : type === 'CUTLERY'
          ? `Cutlery / plates requested for Table ${state.tableNumber} (Chair ${seat})`
          : type === 'TABLE CLEAN'
          ? `Table cleaning requested for Table ${state.tableNumber}`
          : `Floor assistance requested at Table ${state.tableNumber} (Chair ${seat})`;
      const message = customMsg && customMsg.trim() ? customMsg.trim() : defaultMsg;

      const bridge = useSharedBridge.getState();
      bridge.customerPingsWaiter(
        state.tableNumber,
        type,
        guest,
        message,
        seat
      );
      return {
        waiterNotification: { active: true, type, message },
      };
    });
  },

  handleBillSettledByWaiter: (snapshot) => {
    set((state) => {
      // Transition immediately to Screen 8, skipping Screen 6 and 7
      const convertedCart: CartItem[] = (snapshot.items || []).map((it) => ({
        cartItemId: it.id || `settled-${Date.now()}-${Math.random()}`,
        menuItem: {
          id: it.id,
          name: it.name,
          price: it.price || 0,
          category: 'Authentic Donne',
          description: '',
          imagePlaceholder: '',
          prepMode: 'Military Dum Handi',
          optionsGroup1: { title: '', choices: [] },
          optionsGroup2: { title: '', addOns: [] },
        },
        selectedOption: it.options || '',
        selectedAddOns: it.addOns || [],
        quantity: it.quantity || 1,
        totalPrice: it.totalPrice || (it.price || 0) * (it.quantity || 1),
        prepMode: 'Military Dum Handi',
        isOrdered: true,
        seatNumber: it.seatNumber || state.seatNumber,
      }));

      const newPayment: PaymentDetails = {
        ...state.payment,
        subtotal: snapshot.subtotal,
        tax: snapshot.totalTax,
        tipAmount: 0,
        discount: 0,
        totalAmount: snapshot.grandTotal,
        paymentMethod: (snapshot.method as any) || 'UPI',
        transactionId: snapshot.invoiceNumber,
        invoiceNumber: snapshot.invoiceNumber,
        settledItems: snapshot.items,
      };

      return {
        previousScreen: state.currentScreen,
        currentScreen: 8, // Directly navigate to Screen 8!
        cart: convertedCart.length > 0 ? convertedCart : state.cart,
        payment: newPayment,
        orderStage: 'SERVED',
        waiterNotification: null,
        isSettled: true,
      };
    });
  },

  syncWithActiveSession: (tableNumber: string, seatNumber: number) => {
    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const targetTableNum = cleanNum(tableNumber);
    const normTable = `T-${String(parseInt(targetTableNum, 10) || 1).padStart(2, '0')}`;
    const bridge = useSharedBridge.getState();
    const currentTbl = bridge.tables.find((t) => cleanNum(t.number) === targetTableNum);

    // Tickets for this table
    const myTickets = bridge.kdsTickets.filter(
      (tk) => cleanNum(tk.tableNumber) === targetTableNum && tk.status !== 'COMPLETED'
    );
    const tableActiveItems = (currentTbl?.activeItems || []).filter(
      (ai) => !ai.seatNumber || ai.seatNumber === seatNumber
    );
    const seatTickets = myTickets.filter(
      (tk) => !tk.seatNumber || tk.seatNumber === seatNumber || tk.items.some((i) => !i.seatNumber || i.seatNumber === seatNumber)
    );

    const hasActiveOrders =
      (currentTbl && currentTbl.status !== 'VACANT' && (currentTbl.currentBill > 0 || tableActiveItems.length > 0)) ||
      seatTickets.length > 0;

    const tableIsVacant = !currentTbl || currentTbl.status === 'VACANT';

    // If the bill was settled by waiter and the table is still BILLING/OCCUPIED (not yet vacated),
    // don't overwrite — customer is on Screen 8 (confirmation). But if the table is now VACANT,
    // the waiter has completed the vacate — the NEXT customer scanning the QR should get a clean start.
    const { isSettled } = useCustomerStore.getState();
    if (isSettled && !tableIsVacant) {
      // Still in the post-payment confirmation state, table not cleared yet — leave as-is
      return;
    }
    if (isSettled && tableIsVacant) {
      // Waiter has vacated — previous customer session is done. Reset for next customer.
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${normTable}_s${seatNumber}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
        } catch {}
      }
      set({
        currentScreen: 1,
        previousScreen: 1,
        cart: [],
        orderStage: 'PLACED',
        itemTracking: [],
        payment: initialEmptyPayment,
        waiterNotification: null,
        isSettled: false,
      });
      return;
    }

    if (!hasActiveOrders) {
      // Table/seat is VACANT or already settled/vacated.
      // Reset session completely so scanning QR opens clean/new!
      set({
        currentScreen: 1,
        previousScreen: 1,
        cart: [],
        orderStage: 'PLACED',
        itemTracking: [],
        payment: initialEmptyPayment,
        waiterNotification: null,
        isSettled: false,
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`thoogudeepa_customer_session_${normTable}_s${seatNumber}`);
          localStorage.removeItem('thoogudeepa_customer_session_v1');
        } catch {}
      }
      return;
    }

    // Otherwise, table/seat has active unpaid orders!
    // Extract real dishes from KDS tickets or table activeItems
    const ticketItems = seatTickets.flatMap((tk) =>
      tk.items
        .filter((it) => !it.seatNumber || it.seatNumber === seatNumber)
        .map((it) => ({
          ...it,
          ticketId: tk.id,
        }))
    );

    const activeList = ticketItems.length > 0 ? ticketItems : tableActiveItems;

    if (activeList.length > 0) {
      const restoredCart: CartItem[] = activeList.map((it: any, idx: number) => {
        const foundMenu = INITIAL_MENU_ITEMS.find(
          (m) => m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim()
        ) || {
          id: `item-${idx}`,
          name: it.name,
          price: it.price || 0,
          category: 'Authentic Donne',
          description: '',
          imagePlaceholder: '',
          prepMode: it.prepMode || 'Military Dum Handi',
          optionsGroup1: { title: '', choices: [] },
          optionsGroup2: { title: '', addOns: [] },
        };

        const unitPrice = it.price || foundMenu.price || 0;
        const qty = it.quantity || 1;
        return {
          cartItemId: it.id || `active-${idx}-${Date.now()}`,
          menuItem: foundMenu,
          selectedOption: it.options || '',
          selectedAddOns: it.addOns || [],
          quantity: qty,
          totalPrice: unitPrice * qty,
          prepMode: it.prepMode || foundMenu.prepMode || 'Military Dum Handi',
          isOrdered: true,
          seatNumber: it.seatNumber || seatNumber,
        };
      });

      const restoredTracking: IndividualItemTracking[] = activeList.map((it: any, idx: number) => {
        const stg: OrderStage =
          it.stage === 'SERVED' || it.status === 'Served'
            ? 'SERVED'
            : it.stage === 'READY' || it.stage === 'PLATED' || it.status === 'Ready'
            ? 'PLATED'
            : it.stage === 'PREP' || it.status === 'Cooking'
            ? 'PREP'
            : it.stage === 'RECEIVED' || it.status === 'Received'
            ? 'RECEIVED'
            : 'PLACED';

        return {
          id: it.id || `track-${idx}`,
          name: `${it.name} × ${it.quantity || 1}`,
          prepMode: it.prepMode || 'Military Dum Handi',
          status:
            stg === 'SERVED'
              ? 'Delivered to Table'
              : stg === 'PLATED'
              ? 'Plated & Ready for Service'
              : stg === 'PREP'
              ? 'In Kitchen Preparation'
              : stg === 'RECEIVED'
              ? 'Order Received by Kitchen'
              : 'Order Placed',
          stage: stg,
        };
      });

      const subtotal = restoredCart.reduce((s, c) => s + c.totalPrice, 0);
      const tax = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + tax;

      const allServed = restoredTracking.every((t) => t.stage === 'SERVED');
      const orderStage: OrderStage = allServed ? 'SERVED' : 'PREP';

      set((state) => {
        const nextScreen = state.currentScreen <= 4 ? 5 : state.currentScreen;
        return {
          cart: restoredCart,
          itemTracking: restoredTracking,
          orderStage,
          currentScreen: nextScreen,
          tableNumber: normTable,
          seatNumber,
          payment: {
            ...state.payment,
            subtotal,
            tax,
            totalAmount,
          },
        };
      });
    }
  },

  dismissWaiterNotification: () => {
    set({ waiterNotification: null });
  },

  resetSession: () => {
    if (typeof window !== 'undefined') {
      try {
        const st = useCustomerStore.getState();
        localStorage.removeItem('thoogudeepa_customer_session_v1');
        localStorage.removeItem(`thoogudeepa_customer_session_${st.tableNumber}_s${st.seatNumber}`);
      } catch {}
    }
    set({
      currentScreen: 1,
      previousScreen: 1,
      guestName: '',
      cart: [],
      orderStage: 'PLACED',
      itemTracking: [],
      payment: initialEmptyPayment,
      waiterNotification: null,
      isSettled: false,
    });
  },
}));

if (typeof window !== 'undefined') {
  useCustomerStore.subscribe((state) => {
    try {
      // Only persist if there is an active unplaced/in-progress order for a known table+seat.
      // Never write to the global _v1 key — that caused cross-seat contamination.
      const hasTable = state.tableNumber && state.tableNumber !== 'T-01';
      const hasSeat = state.seatNumber && state.seatNumber > 0;
      const hasActiveCart = state.cart && state.cart.length > 0;
      // Don't persist the settled confirmation screen (screen 8) — next QR scan must be fresh
      const isConfirmationScreen = state.currentScreen === 8 || state.isSettled;

      if (hasTable && hasSeat && hasActiveCart && !isConfirmationScreen) {
        const payload = JSON.stringify({
          cart: state.cart,
          currentScreen: state.currentScreen,
          tableNumber: state.tableNumber,
          seatNumber: state.seatNumber,
          guestName: state.guestName,
          orderStage: state.orderStage,
          itemTracking: state.itemTracking,
          payment: state.payment,
        });
        localStorage.setItem(
          `thoogudeepa_customer_session_${state.tableNumber}_s${state.seatNumber}`,
          payload
        );
      } else if (isConfirmationScreen && hasTable && hasSeat) {
        // Payment confirmed — wipe the scoped session so next scan starts fresh
        localStorage.removeItem(
          `thoogudeepa_customer_session_${state.tableNumber}_s${state.seatNumber}`
        );
        localStorage.removeItem('thoogudeepa_customer_session_v1');
      }
    } catch {}
  });
}

