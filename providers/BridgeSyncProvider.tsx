'use client';

/**
 * BridgeSyncProvider.tsx
 * ──────────────────────────────────────────────────────────────────────
 * Client component that activates the Supabase Realtime CDC listener
 * for the shared bridge. Must be rendered once at the app root level.
 *
 * WHY a separate component instead of directly in layout.tsx?
 *   - app/layout.tsx is a SERVER component (no 'use client').
 *   - React hooks (useEffect) cannot run in server components.
 *   - This thin wrapper is the standard Next.js App Router pattern
 *     for "client-only side effects at root".
 */

import { useBridgeSync } from '../hooks/useBridgeSync';

export function BridgeSyncProvider({ children }: { children: React.ReactNode }) {
  // This hook runs useEffect to subscribe to Supabase Realtime.
  // It returns nothing — pure side effect.
  useBridgeSync();

  return <>{children}</>;
}
