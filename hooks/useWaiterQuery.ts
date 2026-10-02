import { useQuery } from '@tanstack/react-query';
import { useSharedBridge } from '../store/useSharedBridge';

async function fetchWaiterFloorSync() {
  await new Promise((r) => setTimeout(r, 60));
  return {
    syncTimestamp: Date.now(),
    status: 'ACTIVE_FLOOR_FEED',
  };
}

export function useWaiterQuery() {
  // All real-time data comes from shared bridge, not a local store
  const tables = useSharedBridge((s) => s.tables);
  const pings = useSharedBridge((s) => s.pings);
  const kdsTickets = useSharedBridge((s) => s.kdsTickets);
  const kitchenReadyItems = kdsTickets.filter((tk) => tk.status === 'READY');

  const query = useQuery({
    queryKey: ['waiterFloorStatus'],
    queryFn: fetchWaiterFloorSync,
    refetchInterval: 6000,
  });

  return {
    ...query,
    tables,
    pings,
    kitchenReadyItems,
  };
}
