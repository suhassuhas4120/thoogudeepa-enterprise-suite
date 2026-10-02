'use client';

/**
 * useBridgeSync.ts
 * ──────────────────────────────────────────────────────────────────────
 * Supabase Realtime CDC listener hook for the SharedBridge.
 *
 * WHY this exists separately from useSharedBridge.ts:
 *   - useSharedBridge.ts is a plain Zustand store (no React hooks allowed inside).
 *   - Supabase Realtime requires useEffect / React lifecycle hooks.
 *   - So: this hook is the "realtime adapter" that bridges Supabase DB changes
 *     into the Zustand store. Call it ONCE at the app layout level.
 *
 * CHANNELS (distinct names — no collision with useRealtimeTickets.ts):
 *   bridge_tables     → tables table  (INSERT/UPDATE/DELETE)
 *   bridge_tickets    → kds_tickets   (INSERT/UPDATE/DELETE)
 *   bridge_items      → order_items   (INSERT/UPDATE/DELETE)
 *   bridge_menu86     → menu_86       (INSERT/UPDATE/DELETE)
 *   bridge_pings      → pings         (INSERT/UPDATE/DELETE)
 *
 * RECONNECT STRATEGY:
 *   On subscription status → CLOSED or CHANNEL_ERROR:
 *     - Wait 2s, then re-subscribe (Supabase auto-reconnects the transport)
 *     - On SUBSCRIBED event: re-fetch all state from DB (reconcile)
 *
 * NOTE: This hook does NOT block rendering. It runs side-effect only.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSharedBridge } from '../store/useSharedBridge';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Supabase row shapes (only fields we need) ────────────────────────

interface DbTableRow {
  number: string;
  section: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  guest_count: number;
  current_bill: number;
  server_name: string;
  kot_count: number;
  merged_with: string | null;
}

interface DbKdsTicketRow {
  id: string;
  table_number: string;
  server_name: string;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED';
  elapsed_minutes: number;
  source: 'CUSTOMER' | 'WAITER';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    stage: string;
    prepMode?: string;
    options?: string;
  }>;
  created_at: string;
}

interface DbMenu86Row {
  id: string;
  name: string;
  category: string;
  is_86: boolean;
  prep_delay_minutes: number;
}

interface DbPingRow {
  id: string;
  table_number: string;
  type: string;
  message: string | null;
  guest_name: string;
  status: 'PENDING' | 'RESOLVED';
  created_at: string;
}

// ── Reconcile helpers ────────────────────────────────────────────────

/**
 * Full state reconciliation: fetch all relevant tables from Supabase
 * and push them into the Zustand store. Called on reconnect.
 */
async function reconcileAllState(): Promise<void> {
  try {
    const bridge = useSharedBridge.getState();

    // 1. Tables
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .order('number', { ascending: true });

    if (tables && tables.length > 0) {
      useSharedBridge.setState({
        tables: tables.map((row: DbTableRow) => ({
          id: row.number,            // use number as id (matches freshTables)
          number: row.number,
          section: row.section,
          capacity: row.capacity,
          status: row.status,
          guestCount: row.guest_count ?? 0,
          seatedTime: '--',          // not stored in DB
          currentBill: Number(row.current_bill) || 0,
          serverName: row.server_name || 'Floor Captain',
          kotCount: row.kot_count ?? 0,
          mergedWith: row.merged_with ?? undefined,
        })),
      });
    }

    // 2. KDS Tickets (non-completed)
    const { data: tickets } = await supabase
      .from('kds_tickets')
      .select('*')
      .neq('status', 'COMPLETED')
      .order('created_at', { ascending: true });

    if (tickets) {
      useSharedBridge.setState({
        kdsTickets: tickets.map((row: DbKdsTicketRow) => ({
          id: row.id,
          tableNumber: row.table_number,
          serverName: row.server_name || '',
          timestamp: row.created_at
            ? new Date(row.created_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--',
          elapsedMinutes: row.elapsed_minutes ?? 0,
          status: row.status,
          source: row.source,
          items: Array.isArray(row.items)
            ? row.items.map((it) => ({
                id: it.id || `it-${Math.random()}`,
                name: it.name,
                quantity: it.quantity,
                stage: (it.stage as 'PLACED' | 'PREP' | 'PLATED' | 'SERVED') || 'PLACED',
                prepMode: it.prepMode || '',
                options: it.options,
              }))
            : [],
        })),
      });
    }

    // 3. Menu 86
    const { data: menu86 } = await supabase
      .from('menu_86')
      .select('*')
      .order('name', { ascending: true });

    if (menu86 && menu86.length > 0) {
      // Merge DB is_86 values into existing inventory86 items (by id match)
      const dbMap = new Map<string, DbMenu86Row>(
        menu86.map((row: DbMenu86Row) => [row.id, row])
      );
      useSharedBridge.setState({
        inventory86: bridge.inventory86.map((inv) => {
          const dbRow = dbMap.get(inv.id);
          if (!dbRow) return inv;
          return {
            ...inv,
            is86: dbRow.is_86,
            prepDelayMinutes: dbRow.prep_delay_minutes ?? inv.prepDelayMinutes,
          };
        }),
      });
    }

    // 4. Pings (pending only)
    const { data: pings } = await supabase
      .from('pings')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (pings) {
      useSharedBridge.setState({
        pings: pings.map((row: DbPingRow) => ({
          id: row.id,
          tableNumber: row.table_number,
          type: row.type,
          message: row.message ?? undefined,
          timestamp: row.created_at
            ? new Date(row.created_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--',
          status: 'PENDING' as const,
          guestName: row.guest_name || 'Guest',
        })),
      });
    }
  } catch (err) {
    console.error('[BridgeSync] Reconciliation error:', err);
  }
}

// ── The hook ─────────────────────────────────────────────────────────

export function useBridgeSync() {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubscribedRef = useRef(false);

  const subscribe = useCallback(() => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel('bridge_global_sync')

      // ── tables ────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          const row = payload.new as DbTableRow | undefined;
          if (!row || !row.number) {
            // DELETE — run full reconcile to be safe
            reconcileAllState();
            return;
          }
          useSharedBridge.setState((state) => ({
            tables: state.tables.map((t) =>
              t.number === row.number
                ? {
                    ...t,
                    status: row.status ?? t.status,
                    guestCount: row.guest_count ?? t.guestCount,
                    currentBill: Number(row.current_bill) || t.currentBill,
                    serverName: row.server_name || t.serverName,
                    kotCount: row.kot_count ?? t.kotCount,
                    mergedWith: row.merged_with ?? undefined,
                  }
                : t
            ),
          }));
        }
      )

      // ── kds_tickets ───────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kds_tickets' },
        (payload) => {
          const row = payload.new as DbKdsTicketRow;
          if (!row?.id) return;

          // Only add if not already in memory (optimistic may have added it)
          const existing = useSharedBridge.getState().kdsTickets;
          // Check by id OR by table+source+timestamp proximity (optimistic dedup)
          const alreadyPresent = existing.some((tk) => tk.id === row.id);
          if (alreadyPresent) return;

          useSharedBridge.setState((state) => ({
            kdsTickets: [
              ...state.kdsTickets,
              {
                id: row.id,
                tableNumber: row.table_number,
                serverName: row.server_name || '',
                timestamp: row.created_at
                  ? new Date(row.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--',
                elapsedMinutes: row.elapsed_minutes ?? 0,
                status: row.status,
                source: row.source,
                items: Array.isArray(row.items)
                  ? row.items.map((it) => ({
                      id: it.id || `it-${Math.random()}`,
                      name: it.name,
                      quantity: it.quantity,
                      stage: (it.stage as 'PLACED' | 'PREP' | 'PLATED' | 'SERVED') || 'PLACED',
                      prepMode: it.prepMode || '',
                      options: it.options,
                    }))
                  : [],
              },
            ],
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kds_tickets' },
        (payload) => {
          const row = payload.new as DbKdsTicketRow;
          if (!row?.id) return;
          useSharedBridge.setState((state) => ({
            kdsTickets:
              row.status === 'COMPLETED'
                ? state.kdsTickets.filter((tk) => tk.id !== row.id)
                : state.kdsTickets.map((tk) =>
                    tk.id === row.id
                      ? {
                          ...tk,
                          status: row.status,
                          elapsedMinutes: row.elapsed_minutes ?? tk.elapsedMinutes,
                          items: Array.isArray(row.items) && row.items.length > 0
                            ? row.items.map((it) => ({
                                id: it.id || `it-${Math.random()}`,
                                name: it.name,
                                quantity: it.quantity,
                                stage: (it.stage as 'PLACED' | 'PREP' | 'PLATED' | 'SERVED') || 'PLACED',
                                prepMode: it.prepMode || '',
                                options: it.options,
                              }))
                            : tk.items,
                        }
                      : tk
                  ),
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'kds_tickets' },
        (payload) => {
          const oldRow = payload.old as { id?: string };
          if (!oldRow?.id) return;
          useSharedBridge.setState((state) => ({
            kdsTickets: state.kdsTickets.filter((tk) => tk.id !== oldRow.id),
          }));
        }
      )

      // ── menu_86 ───────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'menu_86' },
        (payload) => {
          const row = payload.new as DbMenu86Row;
          if (!row?.id) return;
          useSharedBridge.setState((state) => ({
            inventory86: state.inventory86.map((inv) =>
              inv.id === row.id
                ? {
                    ...inv,
                    is86: row.is_86,
                    prepDelayMinutes: row.prep_delay_minutes ?? inv.prepDelayMinutes,
                  }
                : inv
            ),
          }));
        }
      )

      // ── pings ─────────────────────────────────────────────────────
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pings' },
        (payload) => {
          const row = payload.new as DbPingRow;
          if (!row?.id) return;
          // Dedup: don't add if already in memory (optimistic)
          const existing = useSharedBridge.getState().pings;
          if (existing.some((p) => p.id === row.id)) return;

          useSharedBridge.setState((state) => ({
            pings: [
              ...state.pings,
              {
                id: row.id,
                tableNumber: row.table_number,
                type: row.type,
                message: row.message ?? undefined,
                timestamp: row.created_at
                  ? new Date(row.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--',
                status: 'PENDING' as const,
                guestName: row.guest_name || 'Guest',
              },
            ],
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pings' },
        (payload) => {
          const row = payload.new as DbPingRow;
          if (!row?.id) return;
          if (row.status === 'RESOLVED') {
            // Remove resolved pings from local state
            useSharedBridge.setState((state) => ({
              pings: state.pings.filter((p) => p.id !== row.id),
            }));
          }
        }
      )

      // ── subscription lifecycle ────────────────────────────────────
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (!isSubscribedRef.current) {
            isSubscribedRef.current = true;
            // On first connect: reconcile with DB to catch any missed events
            reconcileAllState();
          }
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          isSubscribedRef.current = false;
          // Clear existing reconnect timer
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            console.warn('[BridgeSync] Channel error — resubscribing...');
            subscribe();
          }, 2000);
        }

        if (status === 'CLOSED') {
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;
  }, []);

  useEffect(() => {
    subscribe();

    // Reconnect on tab visibility: catches mobile tab wake-up after long sleep
    const handleVisibility = () => {
      if (!document.hidden && !isSubscribedRef.current) {
        console.info('[BridgeSync] Tab visible — resubscribing and reconciling...');
        subscribe();
      } else if (!document.hidden) {
        // Even if subscribed, reconcile on visibility to catch missed events
        reconcileAllState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [subscribe]);
}
