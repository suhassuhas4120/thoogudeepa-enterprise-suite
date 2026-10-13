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
import { supabase, getSyncBroadcastChannel } from '../lib/supabase';
import { useSharedBridge, type SharedTable } from '../store/useSharedBridge';
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
  seat_number?: number;
  server_name: string;
  status: 'NEW' | 'PREP' | 'READY' | 'COMPLETED' | 'SERVED';
  elapsed_minutes: number;
  source: 'CUSTOMER' | 'WAITER';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    stage: string;
    prepMode?: string;
    options?: string;
    seat_number?: number;
    seatNumber?: number;
    price?: number;
    unit_price?: number;
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

let lastStateFingerprint = '';
let isReconciling = false;

function computeStateFingerprint(
  tickets: DbKdsTicketRow[] | null,
  tables: DbTableRow[] | null,
  menu86: DbMenu86Row[] | null,
  pings: DbPingRow[] | null
): string {
  const tkPart = (tickets || [])
    .map((t) => `${t.id}:${t.status}:${t.table_number}:${(t.items || []).map((i: any) => `${i.id}-${i.stage}-${i.quantity}`).join(',')}`)
    .join('|');
  const tblPart = (tables || [])
    .map((t) => `${t.number}:${t.status}:${t.current_bill}:${t.guest_count}:${t.server_name}:${t.kot_count}`)
    .join('|');
  const m86Part = (menu86 || [])
    .map((m) => `${m.id}:${m.is_86}:${m.prep_delay_minutes}`)
    .join('|');
  const pingSig = (pings || [])
    .map((p) => `${p.id}:${p.status}:${p.type}:${p.message || ''}`)
    .join('|');
  return `${tkPart}#${tblPart}#${m86Part}#${pingSig}`;
}

/**
 * Full state reconciliation: fetch all relevant tables from Supabase
 * and push them into the Zustand store. Called on reconnect and poll.
 */
async function reconcileAllState(): Promise<void> {
  if (isReconciling) return;
  isReconciling = true;
  try {
    const bridge = useSharedBridge.getState();

    // Fetch active settlement sessions and settled bills from server API
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/settlement/session', { cache: 'no-store' });
        if (res.ok) {
          const sessionData = await res.json();
          if (sessionData) {
            useSharedBridge.setState((prev) => ({
              activeSettlementSessions: sessionData.sessions || {},
              settledBills: {
                ...(prev.settledBills || {}),
                ...(sessionData.settledBills || {}),
              },
            }));
          }
        }
      } catch {}
    }

    // Fetch all tables in parallel (single network roundtrip)
    const [
      { data: tickets },
      { data: tables },
      { data: menu86 },
      { data: pings },
    ] = await Promise.all([
      supabase.from('kds_tickets').select('*').neq('status', 'COMPLETED').order('created_at', { ascending: true }),
      supabase.from('tables').select('*').order('number', { ascending: true }),
      supabase.from('menu_86').select('*').order('name', { ascending: true }),
      supabase.from('pings').select('*').order('created_at', { ascending: true }),
    ]);

    // Skip setState if database data is completely identical
    const fingerprint = computeStateFingerprint(tickets, tables, menu86, pings);
    if (fingerprint === lastStateFingerprint && bridge.kdsTickets.length > 0) {
      return;
    }
    lastStateFingerprint = fingerprint;

    const mappedTickets = (tickets || []).map((row: DbKdsTicketRow) => ({
      id: row.id,
      tableNumber: row.table_number,
      seatNumber: row.seat_number ? Number(row.seat_number) : undefined,
      serverName: row.server_name || '',
      timestamp: row.created_at
        ? new Date(row.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
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
            stage: (it.stage as 'PLACED' | 'RECEIVED' | 'PREP' | 'PLATED' | 'SERVED') || 'PLACED',
            prepMode: it.prepMode || '',
            options: it.options,
            addOns: (it as any).addOns || (it as any).add_ons || [],
            seatNumber: (it.seat_number || it.seatNumber || row.seat_number)
              ? Number(it.seat_number || it.seatNumber || row.seat_number)
              : undefined,
            price: Number(it.price || it.unit_price || 0),
          }))
        : [],
    }));

    // Group active items by table number
    const itemsByTable = new Map<
      string,
      Array<{
        id: string;
        name: string;
        quantity: number;
        status: string;
        options?: string;
        addOns?: string[];
        seatNumber?: number;
        price?: number;
      }>
    >();
    mappedTickets.forEach((tk) => {
      if (tk.status !== 'COMPLETED') {
        const list = itemsByTable.get(tk.tableNumber) || [];
        tk.items.forEach((it) => {
          list.push({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            status:
              it.stage === 'SERVED'
                ? 'Served'
                : it.stage === 'PLATED'
                ? 'Ready'
                : it.stage === 'PREP'
                ? 'Cooking'
                : it.stage === 'RECEIVED'
                ? 'Received'
                : 'Placed',
            options: it.options,
            addOns: it.addOns || [],
            seatNumber: it.seatNumber,
            price: it.price,
          });
        });
        itemsByTable.set(tk.tableNumber, list);
      }
    });

    let mappedTables = bridge.tables;
    if (tables && tables.length > 0) {
      mappedTables = tables.map((row: DbTableRow) => {
        const tableActiveItems = itemsByTable.get(row.number) || [];
        const activeItemsSum = tableActiveItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
        const computedBill = Math.round(activeItemsSum * 1.05);
        const dbBill = Number(row.current_bill || 0);
        const effectiveBill = dbBill > 0 ? dbBill : computedBill;
        const hasRunningBill = effectiveBill > 0;
        const hasOrders = tableActiveItems.length > 0 || hasRunningBill || row.status === 'OCCUPIED' || row.status === 'BILLING';

        return {
          id: row.number,
          number: row.number,
          section: row.section,
          capacity: row.capacity,
          status: hasOrders ? (row.status === 'BILLING' ? 'BILLING' : 'OCCUPIED') : (row.status || 'VACANT'),
          guestCount: hasOrders ? (row.guest_count ?? 1) : 0,
          seatedTime: '--',
          currentBill: effectiveBill,
          serverName: row.server_name || 'Floor Captain',
          kotCount: hasOrders ? (row.kot_count ?? 1) : 0,
          mergedWith: row.merged_with ?? undefined,
          activeItems: tableActiveItems,
        };
      });
    }

    const nextInventory = (menu86 && menu86.length > 0)
      ? (() => {
          const dbMap = new Map<string, DbMenu86Row>(menu86.map((row: DbMenu86Row) => [row.id, row]));
          return bridge.inventory86.map((inv) => {
            const dbRow = dbMap.get(inv.id);
            if (!dbRow) return inv;
            return {
              ...inv,
              is86: dbRow.is_86,
              prepDelayMinutes: dbRow.prep_delay_minutes ?? inv.prepDelayMinutes,
            };
          });
        })()
      : bridge.inventory86;

    const nextPings: any[] = [];
    const activeSessionsFromDb: Record<string, any> = {};
    const settledBillsFromDb: Record<string, any> = {};
    const now = Date.now();

    (pings || []).forEach((row: DbPingRow) => {
      if (row.type === 'SETTLEMENT_SESSION' && row.message) {
        try {
          const sess = JSON.parse(row.message);
          const clean = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
          const tNum = clean(row.table_number);
          const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
          if (sess.initiatedAt && Math.abs(now - sess.initiatedAt) < 1800000) {
            activeSessionsFromDb[normTable] = sess;
            if (typeof sess.seatNumber === 'number') {
              activeSessionsFromDb[`${normTable}-CHAIR-${sess.seatNumber}`] = sess;
            }
          }
        } catch {}
      } else if (row.type === 'SETTLED_BILL' && row.message) {
        try {
          const bill = JSON.parse(row.message);
          const clean = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
          const tNum = clean(row.table_number);
          const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
          if (bill.timestamp && Math.abs(now - bill.timestamp) < 1800000) {
            settledBillsFromDb[normTable] = bill;
            const seatMatch = bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
            if (seatMatch) {
              settledBillsFromDb[`${normTable}-CHAIR-${seatMatch[1]}`] = bill;
            }
          }
        } catch {}
      } else if (row.status === 'PENDING') {
        nextPings.push({
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
        });
      }
    });

    useSharedBridge.setState((prev) => ({
      tables: mappedTables,
      kdsTickets: mappedTickets,
      inventory86: nextInventory,
      pings: nextPings,
      activeSettlementSessions: {
        ...(prev.activeSettlementSessions || {}),
        ...activeSessionsFromDb,
      },
      settledBills: {
        ...(prev.settledBills || {}),
        ...settledBillsFromDb,
      },
    }));
  } catch (err) {
    console.error('[BridgeSync] Reconciliation error:', err);
  } finally {
    isReconciling = false;
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

          // Primary check: exact ID match (works after onSuccess ID reconciliation)
          const byId = existing.some((tk) => tk.id === row.id);
          if (byId) return;

          // Fallback: same table + same source within a 10-second burst window
          // Guards against edge cases where onSuccess hasn't fired yet
          const rowAge = row.created_at
            ? (Date.now() - new Date(row.created_at).getTime()) / 1000
            : 999;
          const byProximity =
            rowAge < 10 &&
            existing.some(
              (tk) =>
                tk.tableNumber === row.table_number &&
                tk.source === row.source &&
                tk.status === row.status
            );
          if (byProximity) {
            // Still make sure the in-memory ticket carries the real DB id
            useSharedBridge.setState((state) => ({
              kdsTickets: state.kdsTickets.map((tk) =>
                tk.tableNumber === row.table_number &&
                tk.source === row.source &&
                tk.status === row.status &&
                tk.id !== row.id
                  ? { ...tk, id: row.id }
                  : tk
              ),
            }));
            return;
          }

          useSharedBridge.setState((state) => ({
            kdsTickets: [
              ...state.kdsTickets,
              {
                id: row.id,
                tableNumber: row.table_number,
                seatNumber: row.seat_number ? Number(row.seat_number) : undefined,
                serverName: row.server_name || '',
                timestamp: row.created_at
                  ? new Date(row.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata',
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
                      stage: (it.stage as 'PLACED' | 'RECEIVED' | 'PREP' | 'PLATED' | 'SERVED') || 'PLACED',
                      prepMode: it.prepMode || '',
                      options: it.options,
                      addOns: (it as any).addOns || (it as any).add_ons || [],
                      seatNumber: (it.seat_number || it.seatNumber || row.seat_number)
                        ? Number(it.seat_number || it.seatNumber || row.seat_number)
                        : undefined,
                      price: Number(it.price || it.unit_price || 0),
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
          const parsedItems = Array.isArray(row.items) && row.items.length > 0
            ? row.items.map((it) => ({
                id: it.id || `it-${Math.random()}`,
                name: it.name,
                quantity: it.quantity,
                stage: (it.stage as 'PLACED' | 'RECEIVED' | 'PREP' | 'PLATED' | 'SERVED') || 'PLACED',
                prepMode: it.prepMode || '',
                options: it.options,
                addOns: (it as any).addOns || (it as any).add_ons || [],
                seatNumber: (it.seat_number || it.seatNumber || row.seat_number)
                  ? Number(it.seat_number || it.seatNumber || row.seat_number)
                  : undefined,
                price: Number(it.price || it.unit_price || 0),
              }))
            : undefined;

          useSharedBridge.setState((state) => {
            const nextTickets =
              row.status === 'COMPLETED'
                ? state.kdsTickets.filter((tk) => tk.id !== row.id)
                : state.kdsTickets.map((tk) =>
                    tk.id === row.id
                      ? {
                          ...tk,
                          seatNumber: row.seat_number ? Number(row.seat_number) : tk.seatNumber,
                          status: row.status,
                          elapsedMinutes: row.elapsed_minutes ?? tk.elapsedMinutes,
                          items: parsedItems ?? tk.items,
                        }
                      : tk
                  );

            const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '');
            // Keep tables activeItems in sync with updated ticket items
            const nextTables = parsedItems && row.table_number
              ? state.tables.map((tbl) => {
                  if (cleanNum(tbl.number) !== cleanNum(row.table_number)) return tbl;
                  return {
                    ...tbl,
                    activeItems: (tbl.activeItems || []).map((ai) => {
                      const matched = parsedItems.find(
                        (pi) => pi.id === ai.id || (pi.name === ai.name && pi.seatNumber === ai.seatNumber)
                      );
                      if (!matched) return ai;
                      return {
                        ...ai,
                        status:
                          matched.stage === 'SERVED'
                            ? 'Served'
                            : matched.stage === 'PLATED'
                            ? 'Ready'
                            : matched.stage === 'PREP'
                            ? 'Cooking'
                            : matched.stage === 'RECEIVED'
                            ? 'Received'
                            : 'Placed',
                      };
                    }),
                  };
                })
              : state.tables;

            return { kdsTickets: nextTickets, tables: nextTables };
          });
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

          // 1. Settlement session initiated/updated by captain
          if (row.type === 'SETTLEMENT_SESSION' && row.message) {
            try {
              const sess = JSON.parse(row.message);
              const clean = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
              const tNum = clean(row.table_number);
              const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
              useSharedBridge.setState((prev) => {
                const next = { ...(prev.activeSettlementSessions || {}) };
                next[normTable] = sess;
                if (typeof sess.seatNumber === 'number') {
                  next[`${normTable}-CHAIR-${sess.seatNumber}`] = sess;
                }
                return { activeSettlementSessions: next };
              });
            } catch {}
            return;
          }

          // 2. Settled bill recorded by captain
          if (row.type === 'SETTLED_BILL' && row.message) {
            try {
              const bill = JSON.parse(row.message);
              const clean = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
              const tNum = clean(row.table_number);
              const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
              useSharedBridge.setState((prev) => {
                const nextBills = { ...(prev.settledBills || {}) };
                nextBills[normTable] = bill;
                const seatMatch = bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
                if (seatMatch) {
                  nextBills[`${normTable}-CHAIR-${seatMatch[1]}`] = bill;
                }
                const nextSessions = { ...(prev.activeSettlementSessions || {}) };
                delete nextSessions[normTable];
                if (seatMatch) {
                  delete nextSessions[`${normTable}-CHAIR-${seatMatch[1]}`];
                }
                return { settledBills: nextBills, activeSettlementSessions: nextSessions };
              });
            } catch {}
            return;
          }

          // 3. Operational waiter ping
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

          if (row.type === 'SETTLEMENT_SESSION' && row.message) {
            try {
              const sess = JSON.parse(row.message);
              const clean = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
              const tNum = clean(row.table_number);
              const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
              useSharedBridge.setState((prev) => {
                const next = { ...(prev.activeSettlementSessions || {}) };
                next[normTable] = sess;
                if (typeof sess.seatNumber === 'number') {
                  next[`${normTable}-CHAIR-${sess.seatNumber}`] = sess;
                }
                return { activeSettlementSessions: next };
              });
            } catch {}
            return;
          }

          if (row.type === 'SETTLED_BILL' && row.message) {
            try {
              const bill = JSON.parse(row.message);
              const clean = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
              const tNum = clean(row.table_number);
              const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
              useSharedBridge.setState((prev) => {
                const nextBills = { ...(prev.settledBills || {}) };
                nextBills[normTable] = bill;
                const seatMatch = bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
                if (seatMatch) {
                  nextBills[`${normTable}-CHAIR-${seatMatch[1]}`] = bill;
                }
                return { settledBills: nextBills };
              });
            } catch {}
            return;
          }

          if (row.status === 'RESOLVED') {
            useSharedBridge.setState((state) => ({
              pings: state.pings.filter((p) => p.id !== row.id),
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'pings' },
        (payload) => {
          const oldRow = payload.old as { id?: string; table_number?: string };
          if (!oldRow?.id) return;

          if (oldRow.id.startsWith('SETTLE-SESSION-')) {
            const raw = oldRow.id.replace('SETTLE-SESSION-', '');
            useSharedBridge.setState((prev) => {
              const next = { ...(prev.activeSettlementSessions || {}) };
              delete next[raw];
              const parts = raw.split('-S');
              if (parts[0]) {
                delete next[parts[0]];
                if (parts[1]) delete next[`${parts[0]}-CHAIR-${parts[1]}`];
              }
              return { activeSettlementSessions: next };
            });
            return;
          }

          if (oldRow.id.startsWith('SETTLED-BILL-')) {
            const raw = oldRow.id.replace('SETTLED-BILL-', '');
            useSharedBridge.setState((prev) => {
              const next = { ...(prev.settledBills || {}) };
              delete next[raw];
              const parts = raw.split('-S');
              if (parts[0]) {
                delete next[parts[0]];
                if (parts[1]) delete next[`${parts[0]}-CHAIR-${parts[1]}`];
              }
              return { settledBills: next };
            });
            return;
          }

          useSharedBridge.setState((state) => ({
            pings: state.pings.filter((p) => p.id !== oldRow.id),
          }));
        }
      )

      // ── payments (live shift revenue & settlement cascade) ────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          const row = payload.new as { status?: string; amount?: number } | undefined;
          if (row && row.status === 'CONFIRMED') {
            useSharedBridge.setState((state) => ({
              shiftStats: {
                ...state.shiftStats,
                totalRevenue: state.shiftStats.totalRevenue + Number(row.amount || 0),
                tablesServed: state.shiftStats.tablesServed + 1,
              },
            }));
          }
        }
      )
      // ── tables (floor status, bills, captain, occupancy) ─────────
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          const row = payload.new as DbTableRow;
          if (!row?.number) return;
          const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '');

          useSharedBridge.setState((state) => {
            const existingIdx = state.tables.findIndex(
              (t) => cleanNum(t.number) === cleanNum(row.number)
            );
            const tableActiveItems = state.kdsTickets
              .filter((tk) => cleanNum(tk.tableNumber) === cleanNum(row.number) && tk.status !== 'COMPLETED')
              .flatMap((tk) => (tk.items || []).filter((it) => it.stage !== 'SERVED'));

            const activeItemsSum = tableActiveItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
            const computedBill = Math.round(activeItemsSum * 1.05);
            const dbBill = Number(row.current_bill || 0);
            const effectiveBill = dbBill > 0 ? dbBill : computedBill;
            const hasOrders = tableActiveItems.length > 0 || effectiveBill > 0 || row.status === 'OCCUPIED' || row.status === 'BILLING';

            const updatedTable: SharedTable = {
              id: row.number,
              number: row.number,
              section: row.section || (existingIdx >= 0 ? state.tables[existingIdx].section : 'Main AC Hall'),
              capacity: row.capacity || (existingIdx >= 0 ? state.tables[existingIdx].capacity : 4),
              status: hasOrders ? (row.status === 'BILLING' ? 'BILLING' : 'OCCUPIED') : (row.status || 'VACANT'),
              guestCount: hasOrders ? (row.guest_count ?? (existingIdx >= 0 ? state.tables[existingIdx].guestCount : 1)) : 0,
              seatedTime: existingIdx >= 0 ? state.tables[existingIdx].seatedTime : '--',
              currentBill: effectiveBill,
              serverName: row.server_name || (existingIdx >= 0 ? state.tables[existingIdx].serverName : 'Floor Captain'),
              kotCount: hasOrders ? (row.kot_count ?? (existingIdx >= 0 ? state.tables[existingIdx].kotCount : 1)) : 0,
              mergedWith: row.merged_with ?? undefined,
              activeItems: existingIdx >= 0 ? state.tables[existingIdx].activeItems : [],
            };

            if (existingIdx >= 0) {
              const next = [...state.tables];
              next[existingIdx] = { ...next[existingIdx], ...updatedTable };
              return { tables: next };
            } else {
              return { tables: [...state.tables, updatedTable] };
            }
          });
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

    // 1. Initial reconciliation
    reconcileAllState();

    // 2. High-frequency 1.5s background polling heartbeat
    // Guarantees real-time synchronization on all devices, mobile browsers, cellular networks, and WiFis
    const pollInterval = setInterval(() => {
      reconcileAllState();
    }, 1500);

    // 3. Instantaneous peer-to-peer broadcast listener (<50ms response across devices)
    const broadcastCh = getSyncBroadcastChannel();
    if (broadcastCh) {
      broadcastCh.on('broadcast', { event: 'STATE_CHANGED' }, (msg: any) => {
        const payload = msg?.payload;
        if (payload?.reason === 'settlementSessionStarted' && payload?.payload) {
          const s = payload.payload;
          const cleanNum = (str: string) => (str || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
          const tNum = cleanNum(s.tableNumber);
          const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
          useSharedBridge.setState((prev) => {
            const next = { ...(prev.activeSettlementSessions || {}) };
            next[normTable] = s;
            if (typeof s.seatNumber === 'number') {
              next[`${normTable}-CHAIR-${s.seatNumber}`] = s;
            }
            return { activeSettlementSessions: next };
          });
        } else if (payload?.reason === 'settlementSessionCleared' && payload?.payload) {
          const p = payload.payload;
          useSharedBridge.setState((prev) => {
            const next = { ...(prev.activeSettlementSessions || {}) };
            delete next[p.normTable];
            if (typeof p.seatNumber === 'number') {
              delete next[`${p.normTable}-CHAIR-${p.seatNumber}`];
            }
            return { activeSettlementSessions: next };
          });
        } else if (
          (payload?.reason === 'settledBillRecorded' || payload?.reason === 'billSettled') &&
          payload?.payload
        ) {
          const snap = payload.payload;
          const cleanNum = (str: string) => (str || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
          const tNum = cleanNum(snap.tableName);
          const normTable = `T-${String(parseInt(tNum, 10) || 1).padStart(2, '0')}`;
          useSharedBridge.setState((prev) => {
            const nextBills = { ...(prev.settledBills || {}) };
            nextBills[normTable] = snap;
            const seatMatch = snap.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
            if (seatMatch) {
              nextBills[`${normTable}-CHAIR-${seatMatch[1]}`] = snap;
            }
            const nextSessions = { ...(prev.activeSettlementSessions || {}) };
            delete nextSessions[normTable];
            if (seatMatch) {
              delete nextSessions[`${normTable}-CHAIR-${seatMatch[1]}`];
            }
            return { settledBills: nextBills, activeSettlementSessions: nextSessions };
          });
        }
        reconcileAllState();
      });
    }

    // 4. Reconnect & reconcile on tab visibility and window focus
    const handleVisibility = () => {
      if (!document.hidden && !isSubscribedRef.current) {
        console.info('[BridgeSync] Tab visible — resubscribing and reconciling...');
        subscribe();
      } else if (!document.hidden) {
        reconcileAllState();
      }
    };
    const handleFocus = () => {
      reconcileAllState();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [subscribe]);

  // Elapsed-minutes ticker — increments every 60 s for all active KDS tickets
  useEffect(() => {
    const tick = setInterval(() => {
      useSharedBridge.setState((state) => ({
        kdsTickets: state.kdsTickets.map((tk) =>
          tk.status === 'COMPLETED'
            ? tk
            : { ...tk, elapsedMinutes: (tk.elapsedMinutes ?? 0) + 1 }
        ),
      }));
    }, 60_000);

    return () => clearInterval(tick);
  }, []);
}
