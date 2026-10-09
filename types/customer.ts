export type ScreenId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  description: string;
  imagePlaceholder: string;
  prepMode: string;
  optionsGroup1: {
    title: string;
    choices: string[];
  };
  optionsGroup2: {
    title: string;
    addOns: { name: string; extraPrice: number }[];
  };
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedOption: string;
  selectedAddOns: string[];
  quantity: number;
  totalPrice: number;
  prepMode: string;
  orderSeparately?: boolean;
  isOrdered?: boolean;
  tableNumber?: string;
  seatNumber?: number;
}

export type OrderStage = 'PLACED' | 'RECEIVED' | 'PREP' | 'PLATED' | 'SERVED';

export interface IndividualItemTracking {
  id: string;
  name: string;
  prepMode: string;
  status: string;
  stage: OrderStage;
}

export interface PaymentDetails {
  subtotal: number;
  tax: number;
  tipAmount: number;
  discount: number;
  totalAmount: number;
  splitMode: 'NONE' | 'ITEMS' | 'PERSONS';
  splitCount?: number;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH' | 'RAZORPAY';
  redeemPoints: boolean;
  pointsAvailable: number;
  pointsRedeemed: number;
  transactionId?: string;
  invoiceNumber?: string;
  settledItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    options?: string;
    addOns?: string[];
    seatNumber?: number;
  }>;
}

export type WaiterPingType = 'WATER' | 'TISSUE' | 'CUTLERY' | 'TABLE CLEAN' | 'GENERAL CALL' | 'PAYMENT';
