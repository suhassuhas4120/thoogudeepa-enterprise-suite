import { useQuery } from '@tanstack/react-query';
import { MenuItem } from '../types/customer';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';

// Simulated async server fetch function for the menu
async function fetchMenuCatalog(): Promise<MenuItem[]> {
  // In production, this calls: const res = await fetch('/api/menu'); return res.json();
  // Here we simulate network response with fast resolve:
  await new Promise((resolve) => setTimeout(resolve, 80));
  return INITIAL_MENU_ITEMS;
}

export function useMenuQuery() {
  return useQuery<MenuItem[]>({
    queryKey: ['menuCatalog'],
    queryFn: fetchMenuCatalog,
    initialData: INITIAL_MENU_ITEMS,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}
