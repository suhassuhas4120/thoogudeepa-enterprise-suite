import { useQuery } from '@tanstack/react-query';
import { useKitchenStore } from '../store/useKitchenStore';

async function fetchKitchenServerSync() {
  await new Promise((r) => setTimeout(r, 60));
  return {
    syncTimestamp: Date.now(),
    status: 'HEALTHY',
  };
}

export function useKitchenQuery() {
  const tickets = useKitchenStore((s) => s.tickets);
  const activeStation = useKitchenStore((s) => s.activeStation);

  const query = useQuery({
    queryKey: ['kitchenTickets', activeStation],
    queryFn: fetchKitchenServerSync,
    refetchInterval: 8000,
  });

  return {
    ...query,
    tickets,
  };
}
