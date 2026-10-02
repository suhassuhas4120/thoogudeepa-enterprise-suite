'use client';

import { useBridgeSync } from '../hooks/useBridgeSync';

export function BridgeSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook runs useEffect to subscribe to Supabase Realtime.
  // It returns nothing — pure side effect.
  useBridgeSync();

  return <>{children}</>;
}
