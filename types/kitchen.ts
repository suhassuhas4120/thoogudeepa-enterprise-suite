import { OrderStage } from './customer';

export type KitchenScreenId = 1 | 2 | 3;

export type KitchenStation =
  | 'DUM_BIRYANI'
  | 'KEBAB_TANDOOR'
  | 'DESSERTS'
  | 'MASTER_DISPATCH';

export const STATION_LABELS: Record<KitchenStation, string> = {
  DUM_BIRYANI: 'Dum Biryani',
  KEBAB_TANDOOR: 'Kebab & Tandoor',
  DESSERTS: 'Desserts',
  MASTER_DISPATCH: 'Master Dispatch',
};

// ✅ SINGLE UNIVERSAL PIN — no per-station passwords
export const KITCHEN_MASTER_PIN = '1234';

export const ALL_STATIONS: KitchenStation[] = [
  'DUM_BIRYANI',
  'KEBAB_TANDOOR',
  'DESSERTS',
  'MASTER_DISPATCH',
];

// Which station handles which item (by name keyword)
export function getStationForItem(itemName: string): KitchenStation {
  const n = itemName.toLowerCase();
  if (n.includes('biryani') || n.includes('rice') || n.includes('donne')) {
    return 'DUM_BIRYANI';
  }
  if (
    n.includes('kebab') ||
    n.includes('tandoor') ||
    n.includes('chops') ||
    n.includes('wings') ||
    n.includes('fry')
  ) {
    return 'KEBAB_TANDOOR';
  }
  if (
    n.includes('dessert') ||
    n.includes('gulab') ||
    n.includes('jamun') ||
    n.includes('ice') ||
    n.includes('sweet') ||
    n.includes('payasam')
  ) {
    return 'DESSERTS';
  }
  return 'MASTER_DISPATCH';
}

// ✅ Category list for Screen 2 filter
export type MenuCategory =
  | 'ALL CATEGORIES'
  | 'DUM BIRYANI'
  | 'STARTERS & KEBABS'
  | 'CURRY & SIDES'
  | 'BEVERAGES'
  | 'DESSERTS';

export const ALL_CATEGORIES: MenuCategory[] = [
  'ALL CATEGORIES',
  'DUM BIRYANI',
  'STARTERS & KEBABS',
  'CURRY & SIDES',
  'BEVERAGES',
  'DESSERTS',
];

// Map item → category (for filter logic)
export function getCategoryForItem(itemName: string): MenuCategory {
  const n = itemName.toLowerCase();
  if (n.includes('biryani') || n.includes('rice')) return 'DUM BIRYANI';
  if (
    n.includes('kebab') ||
    n.includes('tandoor') ||
    n.includes('chops') ||
    n.includes('wings') ||
    n.includes('fry')
  )
    return 'STARTERS & KEBABS';
  if (n.includes('curry') || n.includes('salna') || n.includes('gravy'))
    return 'CURRY & SIDES';
  if (
    n.includes('juice') ||
    n.includes('lassi') ||
    n.includes('coffee') ||
    n.includes('tea') ||
    n.includes('drink') ||
    n.includes('water')
  )
    return 'BEVERAGES';
  if (
    n.includes('gulab') ||
    n.includes('jamun') ||
    n.includes('ice') ||
    n.includes('sweet') ||
    n.includes('payasam')
  )
    return 'DESSERTS';
  return 'ALL CATEGORIES';
}

export interface KDSItem {
  id: string;
  name: string;
  quantity: number;
  prepMode: string;
  stage: OrderStage;
  options?: string;
  addOns?: string[];
  notes?: string;
}

export interface KDSTicket {
  id: string;
  tableNumber: string;
  serverName: string;
  timestamp: string;
  elapsedMinutes: number;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  items: KDSItem[];
  source?: 'CUSTOMER' | 'WAITER';
}

export interface MenuItem86 {
  id: string;
  name: string;
  category: string;
  is86: boolean;
  prepDelayMinutes: number;
}