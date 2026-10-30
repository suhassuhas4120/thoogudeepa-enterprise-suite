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
import { useSharedBridge, cleanTableNum, type SharedTable } from '../store/useSharedBridge';
import { useCustomerStore } from '../store/useCustomerStore';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { isPingLocallyResolved, markPingLocallyResolved } from '../lib/settlementStore';
import { INITIAL_MENU_ITEMS } from '../data/menuItems';
export { markPingLocallyResolved, isPingLocallyResolved };

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
  seat_number?: number | string;
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
  pings: DbPingRow[] | null,
  unpaidOrders?: any[] | null
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
  const ordSig = (unpaidOrders || [])
    .map((o) => `${o.id}:${o.table_number}:${o.seat_number}:${o.subtotal || o.total}:${(o.items || []).length}`)
    .join('|');
  return `${tkPart}#${tblPart}#${m86Part}#${pingSig}#${ordSig}`;
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

    const dayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    // Fetch all tables in parallel (single network roundtrip)
    const [
      { data: tickets },
      { data: tables },
      { data: menu86 },
      { data: pings },
      { data: unpaidOrders },
    ] = await Promise.all([
      supabase.from('kds_tickets').select('*').or(`status.neq.COMPLETED,created_at.gte.${dayAgoIso}`).order('created_at', { ascending: true }),
      supabase.from('tables').select('*').order('number', { ascending: true }),
      supabase.from('menu_86').select('*').order('name', { ascending: true }),
      supabase.from('pings').select('*').order('created_at', { ascending: true }),
      supabase.from('orders').select('id, table_number, seat_number, items, subtotal, tax, total, status, created_at').eq('status', 'UNPAID').order('created_at', { ascending: true }),
    ]);

    // Skip setState if database data is completely identical
    const fingerprint = computeStateFingerprint(tickets, tables, menu86, pings, unpaidOrders);
    if (fingerprint === lastStateFingerprint && (bridge.kdsTickets.length > 0 || (tickets || []).length === 0)) {
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
        ? row.items.map((it) => {
            const rawStage = String(it.stage || '').toUpperCase();
            // Monotonic advancement guard: do not regress stage if client has advanced it locally
            const STAGE_RANK: Record<string, number> = {
              PLACED: 1,
              RECEIVED: 2,
              PREP: 3,
              PREPARING: 3,
              COOKING: 3,
              READY: 4,
              PLATED: 4,
              SERVED: 5,
            };
            const prevTk = bridge.kdsTickets.find((t) => t.id === row.id);
            const prevIt = prevTk?.items.find((pi) => pi.id === it.id || (pi.name === it.name && (pi.seatNumber === undefined || it.seat_number === undefined || pi.seatNumber === Number(it.seat_number || it.seatNumber))));
            const prevStage = prevIt ? String(prevIt.stage || '').toUpperCase() : '';
            const prevRank = STAGE_RANK[prevStage] || 0;
            const dbRank = STAGE_RANK[rawStage] || 0;
            const resolvedStage: 'PLACED' | 'RECEIVED' | 'PREP' | 'PLATED' | 'SERVED' =
              prevRank > dbRank
                ? (prevStage === 'READY' ? 'PLATED' : (prevIt!.stage as any))
                : rawStage === 'READY'
                ? 'PLATED'
                : (rawStage as any) || 'PLACED';

            return {
              id: it.id || `it-${Math.random()}`,
              name: it.name,
              quantity: it.quantity,
              stage: resolvedStage,
              prepMode: it.prepMode || '',
              options: it.options,
              addOns: (it as any).addOns || (it as any).add_ons || [],
              seatNumber: (it.seat_number || it.seatNumber || row.seat_number)
                ? Number(it.seat_number || it.seatNumber || row.seat_number)
                : undefined,
              price: Number(it.price || it.unit_price || 0),
            };
          })
        : [],
    }));

    // Group active items by table number (unpaid orders + active KDS tickets + local items)
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
    const seenItemIdsByTable = new Map<string, Set<string>>();

    // 1. Unpaid orders represent the complete persistent dining session items for active tables
    (unpaidOrders || []).forEach((ord: any) => {
      const tKey = cleanTableNum(ord.table_number);
      const normTable = `T-${String(parseInt(tKey, 10) || 1).padStart(2, '0')}`;
      const localTbl = bridge.tables.find((t) => cleanTableNum(t.number) === tKey);

      // Check if table or chair is already settled or vacant locally
      const isTableSettled = Boolean(bridge.settledBills?.[normTable] || bridge.settledBills?.[tKey]);
      const sNum = ord.seat_number ? Number(ord.seat_number) : undefined;
      const isChairSettled = typeof sNum === 'number' && Boolean(
        bridge.settledBills?.[`${normTable}-CHAIR-${sNum}`] ||
        bridge.settledBills?.[`${tKey}-CHAIR-${sNum}`]
      );
      if (isTableSettled || (localTbl?.status === 'VACANT' && (localTbl?.currentBill || 0) === 0)) {
        return;
      }
      if (isChairSettled) {
        return;
      }

      const list = itemsByTable.get(tKey) || [];
      const seen = seenItemIdsByTable.get(tKey) || new Set<string>();

      (ord.items || []).forEach((it: any, idx: number) => {
        const id = it.id || `${ord.id}-it-${idx}`;
        if (!seen.has(id)) {
          seen.add(id);
          const rawStage = String(it.stage || '').toUpperCase();
          const fallbackPrice =
            INITIAL_MENU_ITEMS.find((m) => m.id === it.id || m.name?.toLowerCase() === (it.name || '').toLowerCase())?.price || 220;
          const unitPrice = Number(it.price || it.unitPrice || fallbackPrice);
          const sNum = it.seatNumber !== undefined && it.seatNumber !== null
            ? Number(it.seatNumber)
            : it.seat_number !== undefined && it.seat_number !== null
            ? Number(it.seat_number)
            : ord.seat_number ? Number(ord.seat_number) : 1;

          const localAi = localTbl?.activeItems?.find((ai) => ai.id === id);
          const localIsServed = Boolean(localAi && (localAi.status === 'Served' || (localAi as any).stage === 'SERVED'));

          list.push({
            id,
            name: it.name || 'Dish',
            quantity: Number(it.quantity || 1),
            status:
              localIsServed || rawStage === 'SERVED'
                ? 'Served'
                : (rawStage === 'PLATED' || rawStage === 'READY')
                ? 'Ready'
                : (rawStage === 'PREP' || rawStage === 'PREPARING' || rawStage === 'COOKING')
                ? 'Cooking'
                : (rawStage === 'RECEIVED')
                ? 'Received'
                : (localAi?.status || 'Placed'),
            options: it.options || it.selectedOption || undefined,
            addOns: it.addOns || it.add_ons || [],
            seatNumber: sNum,
            price: unitPrice,
          });
        }
      });
      itemsByTable.set(tKey, list);
      seenItemIdsByTable.set(tKey, seen);
    });

    // 2. Overlay live status from KDS tickets or supplement newly created tickets
    mappedTickets.forEach((tk) => {
      const tKey = cleanTableNum(tk.tableNumber);
      const normTable = `T-${String(parseInt(tKey, 10) || 1).padStart(2, '0')}`;
      const localTbl = bridge.tables.find((t) => cleanTableNum(t.number) === tKey);
      if (bridge.settledBills?.[normTable] || bridge.settledBills?.[tKey] || (localTbl?.status === 'VACANT' && (localTbl?.currentBill || 0) === 0)) {
        return;
      }

      const list = itemsByTable.get(tKey) || [];
      const seen = seenItemIdsByTable.get(tKey) || new Set<string>();
      const matchedIdsInTicket = new Set<string>();

      tk.items.forEach((it) => {
        const sUpper = String(it.stage || (tk.status === 'COMPLETED' ? 'SERVED' : '')).toUpperCase();
        const stageStatus =
          sUpper === 'SERVED'
            ? 'Served'
            : (sUpper === 'PLATED' || sUpper === 'READY')
            ? 'Ready'
            : (sUpper === 'PREP' || sUpper === 'PREPARING' || sUpper === 'COOKING')
            ? 'Cooking'
            : sUpper === 'RECEIVED'
            ? 'Received'
            : 'Placed';

        const existingItem =
          list.find((li) => li.id === it.id) ||
          (tk.status !== 'COMPLETED'
            ? list.find(
                (li) =>
                  !matchedIdsInTicket.has(li.id) &&
                  li.name === it.name &&
                  (li.seatNumber === undefined || it.seatNumber === undefined || li.seatNumber === it.seatNumber)
              )
            : undefined);

        if (existingItem) {
          matchedIdsInTicket.add(existingItem.id);
          if (sUpper === 'SERVED') {
            existingItem.status = 'Served';
          } else if (existingItem.status !== 'Served') {
            existingItem.status = stageStatus;
          }
        } else if (tk.status !== 'COMPLETED' && !seen.has(it.id)) {
          seen.add(it.id);
          list.push({
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            status: stageStatus,
            options: it.options,
            addOns: it.addOns || [],
            seatNumber: it.seatNumber,
            price: it.price,
          });
        }
      });
      itemsByTable.set(tKey, list);
      seenItemIdsByTable.set(tKey, seen);
    });

    // 3. Keep local in-memory activeItems not already seen
    bridge.tables.forEach((localTbl) => {
      if (localTbl.status === 'VACANT') return; // Do not resurrect items for vacant tables
      const tKey = cleanTableNum(localTbl.number);
      const normTable = `T-${String(parseInt(tKey, 10) || 1).padStart(2, '0')}`;
      if (bridge.settledBills?.[normTable] || bridge.settledBills?.[tKey]) return;

      const list = itemsByTable.get(tKey) || [];
      const seen = seenItemIdsByTable.get(tKey) || new Set<string>();

      (localTbl.activeItems || []).forEach((ai, idx) => {
        const id = ai.id || `local-ai-${idx}`;
        if (!seen.has(id)) {
          seen.add(id);
          list.push({
            ...ai,
            id,
          });
        }
      });
      itemsByTable.set(tKey, list);
      seenItemIdsByTable.set(tKey, seen);
    });

    let mappedTables = bridge.tables;
    if (tables && tables.length > 0) {
      mappedTables = tables.map((row: DbTableRow) => {
        const tKey = cleanTableNum(row.number);
        const normT = `T-${String(parseInt(tKey, 10) || 1).padStart(2, '0')}`;
        const localTbl = bridge.tables.find((t) => cleanTableNum(t.number) === tKey);
        const isTableSettled = Boolean(bridge.settledBills?.[normT] || bridge.settledBills?.[tKey]);
        const isLocallyVacant = localTbl?.status === 'VACANT' && (localTbl?.currentBill || 0) === 0;

        // If table is locally vacant and was cleared or in DB vacant, maintain VACANT
        if (isLocallyVacant && (row.status === 'VACANT' || Number(row.current_bill || 0) === 0)) {
          return {
            id: row.number,
            number: row.number,
            section: row.section || localTbl?.section || 'Express / Couple Hall',
            capacity: row.capacity || localTbl?.capacity || 2,
            status: 'VACANT' as const,
            guestCount: 0,
            seatedTime: '--',
            currentBill: 0,
            serverName: row.server_name || localTbl?.serverName || 'Floor Captain',
            kotCount: 0,
            mergedWith: undefined,
            activeItems: [],
          };
        }

        if (isTableSettled) {
          const finalStatus: SharedTable['status'] = isLocallyVacant ? 'VACANT' : 'BILLING';
          return {
            id: row.number,
            number: row.number,
            section: row.section || localTbl?.section || 'Express / Couple Hall',
            capacity: row.capacity || localTbl?.capacity || 2,
            status: finalStatus,
            guestCount: finalStatus === 'VACANT' ? 0 : Math.max(1, row.guest_count ?? localTbl?.guestCount ?? 1),
            seatedTime: finalStatus === 'VACANT' ? '--' : (localTbl?.seatedTime && localTbl.seatedTime !== '--' ? localTbl.seatedTime : 'Just now'),
            currentBill: 0,
            serverName: row.server_name || localTbl?.serverName || 'Floor Captain',
            kotCount: 0,
            mergedWith: row.merged_with ?? localTbl?.mergedWith ?? undefined,
            activeItems: finalStatus === 'VACANT' ? [] : (localTbl?.activeItems || []),
          };
        }

        const tableActiveItems = itemsByTable.get(tKey) || [];
        const activeItemsSum = tableActiveItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
        const computedBill = activeItemsSum;
        const dbBill = Number(row.current_bill || 0);
        // Retain running bill: if KDS items exist, prefer max(computed, dbBill); if KDS tickets already served, retain dbBill
        const effectiveBill = Math.max(dbBill, computedBill);
        const hasRunningBill = effectiveBill > 0;
        const hasActiveKds = tableActiveItems.length > 0;
        const isDbOccupied = row.status === 'OCCUPIED' || row.status === 'BILLING';
        const isLocallySeated = Boolean(localTbl && localTbl.status === 'OCCUPIED' && (localTbl.guestCount || 0) > 0 && localTbl.seatedTime !== '--');

        // A table is truly active if:
        // 1. It has active KDS tickets or running bill > 0
        // 2. OR it is actively seated with guests in DB or locally
        const hasOrders = hasActiveKds || hasRunningBill;
        const isTrulyActive = hasOrders || (isDbOccupied && ((row.guest_count ?? 0) > 0 || isLocallySeated));

        const finalStatus: SharedTable['status'] = !isTrulyActive
          ? 'VACANT'
          : (row.status === 'BILLING' || localTbl?.status === 'BILLING' ? 'BILLING' : 'OCCUPIED');

        return {
          id: row.number,
          number: row.number,
          section: row.section || localTbl?.section || 'Express / Couple Hall',
          capacity: row.capacity || localTbl?.capacity || 2,
          status: finalStatus,
          guestCount: finalStatus === 'VACANT' ? 0 : Math.max(1, row.guest_count ?? localTbl?.guestCount ?? 1),
          seatedTime: localTbl?.seatedTime && localTbl.seatedTime !== '--' ? localTbl.seatedTime : (finalStatus !== 'VACANT' ? 'Just now' : '--'),
          currentBill: finalStatus === 'VACANT' ? 0 : effectiveBill,
          serverName: row.server_name || localTbl?.serverName || 'Floor Captain',
          kotCount: finalStatus === 'VACANT' ? 0 : (row.kot_count ?? localTbl?.kotCount ?? (hasOrders ? 1 : 0)),
          mergedWith: row.merged_with ?? localTbl?.mergedWith ?? undefined,
          activeItems: finalStatus === 'VACANT' ? [] : (tableActiveItems.length > 0 ? tableActiveItems : (localTbl?.activeItems || [])),
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
            const sNum = sess.seatNumber !== undefined && sess.seatNumber !== null && !isNaN(Number(sess.seatNumber))
              ? Number(sess.seatNumber)
              : undefined;

            // Reconcile with current chair items in case new orders were placed after session initiation
            const tblActive = itemsByTable.get(cleanTableNum(normTable)) || [];
            const chairActive = typeof sNum === 'number'
              ? tblActive.filter((it) => it.seatNumber === sNum)
              : tblActive;
            const chairSub = chairActive.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
            const chairDue = Math.round(chairSub * 1.05);
            if (chairDue > (sess.grandTotal || 0)) {
              sess.grandTotal = chairDue;
            }

            if (typeof sNum === 'number') {
              activeSessionsFromDb[`${normTable}-CHAIR-${sNum}`] = sess;
            } else {
              activeSessionsFromDb[normTable] = sess;
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
            const seatNum = typeof bill.seatNumber === 'number'
              ? bill.seatNumber
              : (bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(bill.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
            if (typeof seatNum === 'number') {
              settledBillsFromDb[`${normTable}-CHAIR-${seatNum}`] = bill;
            } else {
              settledBillsFromDb[normTable] = bill;
            }
          }
        } catch {}
      } else if (row.status === 'PENDING') {
        const cleanT = (row.table_number || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
        const normTable = `T-${String(parseInt(cleanT, 10) || 1).padStart(2, '0')}`;
        const compositeKey = `${normTable}-S${row.seat_number || 1}-${row.type}`;
        if (isPingLocallyResolved(row.id) || isPingLocallyResolved(compositeKey)) {
          // This ping was recently resolved locally; do not resurrect it from DB read lag
          return;
        }

        nextPings.push({
          id: row.id,
          tableNumber: row.table_number,
          seatNumber: row.seat_number ? Number(row.seat_number) : undefined,
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

    const nextTickets = (() => {
      const dbIds = new Set((mappedTickets || []).map((t) => t.id));
      const occupiedCleanTables = new Set(
        mappedTables
          .filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING')
          .map((t) => cleanTableNum(t.number))
      );
      const pendingOptimistic = (bridge.kdsTickets || []).filter((tk) => {
        if (!tk) return false;
        if (dbIds.has(tk.id)) return false;
        if (tk.status === 'COMPLETED') {
          return occupiedCleanTables.has(cleanTableNum(tk.tableNumber));
        }
        const isDuplicate = mappedTickets.some((mt) =>
          cleanTableNum(mt.tableNumber) === cleanTableNum(tk.tableNumber) &&
          mt.items.length === tk.items.length &&
          mt.items.every((mi) => tk.items.some((ti) => ti.name === mi.name && ti.quantity === mi.quantity))
        );
        if (isDuplicate) return false;
        return true;
      });
      const activeMappedTickets = (mappedTickets || []).filter((tk) =>
        occupiedCleanTables.has(cleanTableNum(tk.tableNumber))
      );
      return [...activeMappedTickets, ...pendingOptimistic];
    })();

    const nextPingsList = (() => {
      const dbPingIds = new Set(nextPings.map((p) => p.id));
      const pendingLocal = (bridge.pings || []).filter(
        (p) => p && p.status === 'PENDING' && !dbPingIds.has(p.id)
      );
      return [...nextPings, ...pendingLocal];
    })();

    const nextSettledBills = (() => {
      const merged: Record<string, any> = { ...settledBillsFromDb };
      const prevBills = bridge.settledBills || {};
      const nowTs = Date.now();
      // Only keep in-flight snapshots from memory if created in the last 4 seconds
      Object.entries(prevBills).forEach(([k, v]) => {
        if (v?.timestamp && Math.abs(nowTs - v.timestamp) < 4000 && !merged[k]) {
          merged[k] = v;
        }
      });
      return merged;
    })();

    useSharedBridge.setState((prev) => {
      const tablesEqual =
        prev.tables &&
        prev.tables.length === mappedTables.length &&
        mappedTables.every((mt, idx) => {
          const pt = prev.tables[idx];
          if (!pt) return false;
          if (
            pt.number !== mt.number ||
            pt.status !== mt.status ||
            pt.currentBill !== mt.currentBill ||
            pt.guestCount !== mt.guestCount ||
            pt.kotCount !== mt.kotCount ||
            pt.mergedWith !== mt.mergedWith
          ) return false;
          const pItems = pt.activeItems || [];
          const mItems = mt.activeItems || [];
          if (pItems.length !== mItems.length) return false;
          return pItems.every((pai, i) => {
            const mai = mItems[i];
            return mai && pai.id === mai.id && pai.status === mai.status && pai.quantity === mai.quantity;
          });
        });

      const ticketsEqual =
        prev.kdsTickets &&
        prev.kdsTickets.length === nextTickets.length &&
        nextTickets.every((nt, idx) => {
          const pt = prev.kdsTickets[idx];
          if (!pt) return false;
          if (
            pt.id !== nt.id ||
            pt.status !== nt.status ||
            pt.tableNumber !== nt.tableNumber ||
            pt.items.length !== nt.items.length
          ) return false;
          return pt.items.every((pi, i) => pi.stage === nt.items[i]?.stage);
        });

      const pingsEqual =
        prev.pings &&
        prev.pings.length === nextPingsList.length &&
        nextPingsList.every((np, idx) => {
          const pp = prev.pings[idx];
          return pp && pp.id === np.id && pp.status === np.status;
        });

      const inventoryEqual =
        prev.inventory86 &&
        prev.inventory86.length === nextInventory.length &&
        nextInventory.every((ni, idx) => {
          const pi = prev.inventory86[idx];
          return pi && pi.id === ni.id && pi.is86 === ni.is86;
        });

      const prevSessions = prev.activeSettlementSessions || {};
      const prevSessionKeys = Object.keys(prevSessions);
      const nextSessionKeys = Object.keys(activeSessionsFromDb);
      const sessionsEqual =
        prevSessionKeys.length === nextSessionKeys.length &&
        nextSessionKeys.every((k) => prevSessions[k]?.tableNumber === activeSessionsFromDb[k]?.tableNumber);

      const prevBills = prev.settledBills || {};
      const prevBillKeys = Object.keys(prevBills);
      const nextBillKeys = Object.keys(nextSettledBills);
      const billsEqual =
        prevBillKeys.length === nextBillKeys.length &&
        nextBillKeys.every((k) => prevBills[k]?.timestamp === nextSettledBills[k]?.timestamp);

      if (tablesEqual && ticketsEqual && pingsEqual && inventoryEqual && sessionsEqual && billsEqual) {
        return prev;
      }

      return {
        tables: tablesEqual ? prev.tables : mappedTables,
        kdsTickets: ticketsEqual ? prev.kdsTickets : nextTickets,
        pings: pingsEqual ? prev.pings : nextPingsList,
        inventory86: inventoryEqual ? prev.inventory86 : nextInventory,
        activeSettlementSessions: sessionsEqual ? prev.activeSettlementSessions : activeSessionsFromDb,
        settledBills: billsEqual ? prev.settledBills : nextSettledBills,
      };
    });
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

          // Reconcile optimistic in-memory ticket if created locally on this client
          const rowAge = row.created_at
            ? (Date.now() - new Date(row.created_at).getTime()) / 1000
            : 999;
          const optimisticMatch = existing.find(
            (tk) =>
              (tk.id.startsWith('KDS-') || tk.id.startsWith('kds-')) &&
              tk.tableNumber === row.table_number &&
              tk.source === row.source &&
              tk.status === row.status
          );
          if (optimisticMatch && rowAge < 10) {
            useSharedBridge.setState((state) => ({
              kdsTickets: state.kdsTickets.map((tk) =>
                tk.id === optimisticMatch.id ? { ...tk, id: row.id } : tk
              ),
            }));
            return;
          }

          const newTicketItems = Array.isArray(row.items)
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
            : [];

          const newTicket = {
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
            items: newTicketItems,
          };

          useSharedBridge.setState((state) => {
            const nextTickets = [...state.kdsTickets, newTicket];
            const nextTables = state.tables.map((tbl) => {
              if (tbl.number === row.table_number) {
                const additionalActive = newTicketItems.map((it) => ({
                  id: it.id,
                  name: it.name,
                  quantity: it.quantity,
                  status: 'Placed',
                  options: it.options,
                  addOns: it.addOns,
                  seatNumber: it.seatNumber,
                  price: it.price,
                }));
                return {
                  ...tbl,
                  status: 'OCCUPIED' as const,
                  activeItems: [...(tbl.activeItems || []), ...additionalActive],
                };
              }
              return tbl;
            });
            return {
              kdsTickets: nextTickets,
              tables: nextTables,
            };
          });
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
            const nextTickets = state.kdsTickets.map((tk) =>
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

            // Keep tables activeItems in sync with updated ticket items
            const nextTables = parsedItems && row.table_number
              ? state.tables.map((tbl) => {
                  if (cleanTableNum(tbl.number) !== cleanTableNum(row.table_number)) return tbl;
                  return {
                    ...tbl,
                    activeItems: (tbl.activeItems || []).map((ai) => {
                      const matched = parsedItems.find((pi) => pi.id === ai.id || (pi.name === ai.name && (pi.seatNumber === undefined || ai.seatNumber === undefined || pi.seatNumber === ai.seatNumber)));
                      if (!matched) return ai;
                      const ms = String(matched.stage || '').toUpperCase();
                      return {
                        ...ai,
                        stage: (ms === 'SERVED' ? 'SERVED' : (ai as any).stage || ms),
                        status:
                          ms === 'SERVED'
                            ? 'Served'
                            : (ms === 'PLATED' || ms === 'READY')
                            ? 'Ready'
                            : (ms === 'PREP' || ms === 'PREPARING' || ms === 'COOKING')
                            ? 'Cooking'
                            : ms === 'RECEIVED'
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
              const sNum = sess.seatNumber !== undefined && sess.seatNumber !== null && !isNaN(Number(sess.seatNumber))
                ? Number(sess.seatNumber)
                : undefined;
              useSharedBridge.setState((prev) => {
                const next = { ...(prev.activeSettlementSessions || {}) };
                if (typeof sNum === 'number') {
                  next[`${normTable}-CHAIR-${sNum}`] = sess;
                  if (next[normTable]?.seatNumber === sNum) {
                    delete next[normTable];
                  }
                } else {
                  next[normTable] = sess;
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
                const seatNum = typeof bill.seatNumber === 'number'
                  ? bill.seatNumber
                  : (bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(bill.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
                const nextSessions = { ...(prev.activeSettlementSessions || {}) };

                if (typeof seatNum === 'number') {
                  nextBills[`${normTable}-CHAIR-${seatNum}`] = bill;
                  delete nextSessions[`${normTable}-CHAIR-${seatNum}`];
                } else {
                  nextBills[normTable] = bill;
                  delete nextSessions[normTable];
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
                seatNumber: row.seat_number ? Number(row.seat_number) : undefined,
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
              const sNum = sess.seatNumber !== undefined && sess.seatNumber !== null && !isNaN(Number(sess.seatNumber))
                ? Number(sess.seatNumber)
                : undefined;
              useSharedBridge.setState((prev) => {
                const next = { ...(prev.activeSettlementSessions || {}) };
                if (typeof sNum === 'number') {
                  next[`${normTable}-CHAIR-${sNum}`] = sess;
                  if (next[normTable]?.seatNumber === sNum) {
                    delete next[normTable];
                  }
                } else {
                  next[normTable] = sess;
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
                const seatMatch = bill.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
                const seatNum = typeof bill.seatNumber === 'number'
                  ? bill.seatNumber
                  : (seatMatch ? Number(seatMatch[1]) : undefined);

                if (typeof seatNum === 'number') {
                  nextBills[`${normTable}-CHAIR-${seatNum}`] = bill;
                } else {
                  nextBills[normTable] = bill;
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
          if (!row?.number) {
            reconcileAllState();
            return;
          }
          useSharedBridge.setState((state) => {
            const existingIdx = state.tables.findIndex(
              (t) => cleanTableNum(t.number) === cleanTableNum(row.number)
            );
            const localTbl = existingIdx >= 0 ? state.tables[existingIdx] : undefined;
            const tableActiveItems = state.kdsTickets
              .filter((tk) => cleanTableNum(tk.tableNumber) === cleanTableNum(row.number))
              .flatMap((tk) =>
                (tk.items || [])
                  .map((it) => {
                    const sUpper = (it.stage || '').toUpperCase();
                    return {
                      id: it.id,
                      name: it.name,
                      quantity: it.quantity,
                      status:
                        sUpper === 'SERVED'
                          ? 'Served'
                          : sUpper === 'PLATED' || sUpper === 'READY'
                          ? 'Ready'
                          : sUpper === 'PREP' || sUpper === 'PREPARING' || sUpper === 'COOKING'
                          ? 'Cooking'
                          : sUpper === 'RECEIVED'
                          ? 'Received'
                          : 'Placed',
                      options: it.options,
                      addOns: it.addOns || [],
                      seatNumber: it.seatNumber,
                      price: it.price,
                    };
                  })
              );

            const activeItemsSum = tableActiveItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
            const computedBill = activeItemsSum;
            const dbBill = Number(row.current_bill || 0);
            const effectiveBill = Math.max(dbBill, computedBill);
            const hasRunningBill = effectiveBill > 0;
            const hasActiveKds = tableActiveItems.length > 0;
            const isDbOccupied = row.status === 'OCCUPIED' || row.status === 'BILLING';
            const isLocallySeated = localTbl && localTbl.status === 'OCCUPIED' && (localTbl.guestCount || 0) > 0;

            const hasOrders = hasActiveKds || hasRunningBill;
            const isTrulyActive = hasOrders || (isDbOccupied && ((row.guest_count ?? 0) > 0 || isLocallySeated));

            const finalStatus: SharedTable['status'] = !isTrulyActive
              ? 'VACANT'
              : (row.status === 'BILLING' || localTbl?.status === 'BILLING' ? 'BILLING' : 'OCCUPIED');

            const updatedTable: SharedTable = {
              id: row.number,
              number: row.number,
              section: row.section || (existingIdx >= 0 ? state.tables[existingIdx].section : 'Main AC Hall'),
              capacity: row.capacity || (existingIdx >= 0 ? state.tables[existingIdx].capacity : 4),
              status: finalStatus,
              guestCount: finalStatus === 'VACANT' ? 0 : Math.max(1, row.guest_count ?? (existingIdx >= 0 ? state.tables[existingIdx].guestCount : 1)),
              seatedTime: existingIdx >= 0 && state.tables[existingIdx].seatedTime !== '--' ? state.tables[existingIdx].seatedTime : (finalStatus !== 'VACANT' ? 'Just now' : '--'),
              currentBill: finalStatus === 'VACANT' ? 0 : effectiveBill,
              serverName: row.server_name || (existingIdx >= 0 ? state.tables[existingIdx].serverName : 'Floor Captain'),
              kotCount: finalStatus === 'VACANT' ? 0 : (row.kot_count ?? (existingIdx >= 0 ? state.tables[existingIdx].kotCount : (hasOrders ? 1 : 0))),
              mergedWith: row.merged_with ?? undefined,
              activeItems: finalStatus === 'VACANT' ? [] : (tableActiveItems.length > 0 ? tableActiveItems : (existingIdx >= 0 ? state.tables[existingIdx].activeItems : [])),
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
      // ── orders (order ingestion, additions, payment completion) ──
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          reconcileAllState();
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

    // 2. High-reliability background polling heartbeat (fallback for network drops)
    // Guarantees real-time synchronization on all devices, mobile browsers, cellular networks, and WiFis
    const pollInterval = setInterval(() => {
      reconcileAllState();
    }, 3000);

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
          const sNum = s.seatNumber !== undefined && s.seatNumber !== null && !isNaN(Number(s.seatNumber))
            ? Number(s.seatNumber)
            : undefined;
          useSharedBridge.setState((prev) => {
            const next = { ...(prev.activeSettlementSessions || {}) };
            if (typeof sNum === 'number') {
              next[`${normTable}-CHAIR-${sNum}`] = s;
              if (next[normTable]?.seatNumber === sNum) {
                delete next[normTable];
              }
            } else {
              next[normTable] = s;
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
            const seatNum = typeof snap.seatNumber === 'number'
              ? snap.seatNumber
              : (snap.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(snap.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);
            const nextSessions = { ...(prev.activeSettlementSessions || {}) };

            if (typeof seatNum === 'number') {
              nextBills[`${normTable}-CHAIR-${seatNum}`] = snap;
              delete nextSessions[`${normTable}-CHAIR-${seatNum}`];
            } else {
              nextBills[normTable] = snap;
              delete nextSessions[normTable];
            }
            return { settledBills: nextBills, activeSettlementSessions: nextSessions };
          });
        } else if (payload?.reason === 'waiterPingResolved' && payload?.payload) {
          const p = payload.payload;
          try {
            const curStore = useCustomerStore.getState();
            const cleanNum = (s?: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
            const pSeat = p.seatNumber !== undefined && p.seatNumber !== null ? Number(p.seatNumber) : undefined;
            const isMatch =
              cleanNum(curStore.tableNumber) === cleanNum(p.tableNumber) &&
              (pSeat === undefined || curStore.seatNumber === pSeat);
            if (isMatch) {
              curStore.setWaiterAttended(p.type, p.message);
            }
          } catch {}
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
