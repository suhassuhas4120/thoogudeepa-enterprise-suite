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
import { useSharedBridge } from './useSharedBridge';

interface CustomerStoreState {
  currentScreen: ScreenId;
  previousScreen: ScreenId;
  viewMode: 'single' | 'all';
  guestName: string;
  tableNumber: string;
  venueName: string;
  selectedDetailItem: MenuItem;
  cart: CartItem[];
  orderStage: OrderStage;
  itemTracking: IndividualItemTracking[];
  payment: PaymentDetails;
  waiterNotification: { active: boolean; type: string; message: string } | null;

  // Actions
  setCurrentScreen: (screen: ScreenId) => void;
  navigateTo: (screen: ScreenId) => void;
  setViewMode: (mode: 'single' | 'all') => void;
  setGuestName: (name: string) => void;
  setTableNumber: (table: string) => void;
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
  venueName: 'Thoogudeepa donne biryani mane',
  selectedDetailItem: INITIAL_MENU_ITEMS[0],
  cart: [],
  orderStage: 'PLACED',
  itemTracking: [],
  payment: initialEmptyPayment,
  waiterNotification: null,

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

      // Read seat from URL params
      const params = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
      const seatNumber = parseInt(params.get('seat') || '1', 10);
      const tableId = (params.get('table') || state.tableNumber || 'T-01').toUpperCase();

      // Build a stable ticket ID
      const ts = Date.now();
      const tblTag = tableId.replace('-', '');
      const ticketId = `KDS-${tblTag}-${ts}-001`;

      // Fire-and-forget to Supabase (async, non-blocking)
      import('../lib/db').then(({ placeOrderToSupabase }) => {
        placeOrderToSupabase({
          tableId,
          seatNumber,
          customerName: state.guestName || 'Guest',
          cartItems: newlyAddedItems,
          ticketId,
        }).catch((err: any) => {
          console.error('[placeAllOrders] Supabase error:', err);
        });
      });

      // Also push to local bridge as fallback (same-device BroadcastChannel)
      try {
        const bridge = useSharedBridge.getState();
        bridge.customerPlacesOrder(
          tableId,
          state.guestName || 'Guest',
          seatNumber,
          newlyAddedItems.map((c) => ({
            item: c.menuItem,
            selectedOption: c.selectedOption,
            addOns: c.selectedAddOns,
            quantity: c.quantity,
          }))
        );
      } catch (_) { /* bridge optional */ }

      const newTracking: IndividualItemTracking[] = newlyAddedItems.map((c) => ({
        id: 'track-' + c.cartItemId,
        name: `${c.menuItem.name} × ${c.quantity}`,
        prepMode: c.prepMode,
        status: 'In Preparation',
        stage: 'PREP' as OrderStage,
      }));

      const updatedCart = state.cart.map((c) => ({ ...c, isOrdered: true }));

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
    // Get current state to capture tableNumber and guestName
    const message = customMsg || `Request for ${type} transmitted to floor server`;
    set((state) => {
      // Push real ping to bridge → waiter sees it immediately
      const bridge = useSharedBridge.getState();
      bridge.customerPingsWaiter(
        state.tableNumber,
        type,
        state.guestName || `Guest (Table ${state.tableNumber})`,
        message
      );
      return {
        waiterNotification: { active: true, type, message },
      };
    });
  },

  dismissWaiterNotification: () => {
    set({ waiterNotification: null });
  },

  resetSession: () => {
    set({
      currentScreen: 1,
      previousScreen: 1,
      guestName: '',
      cart: [],
      orderStage: 'PLACED',
      itemTracking: [],
      payment: initialEmptyPayment,
      waiterNotification: null,
    });
  },
}));
