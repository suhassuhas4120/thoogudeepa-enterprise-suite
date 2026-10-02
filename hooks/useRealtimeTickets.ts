'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

const STAGE_ORDER = { PLACED: 0, PREP: 1, PLATED: 2, SERVED: 3 } as const;

export type ItemStage = 'PLACED' | 'PREP' | 'PLATED' | 'SERVED';
export type TicketStatus = 'NEW' | 'PREP' | 'READY' | 'COMPLETED';

export interface TrackedItem {
  id: string;
  name: string;
  quantity: number;
  stage: ItemStage;
  seatNumber: number | null;
  unitPrice: number;
  notes: string;
}

export interface TrackedTicket {
  id: string;
  tableId: string;
  orderId: string;
  seatNumber: number | null;
  customerName: string;
  status: TicketStatus;
  items: TrackedItem[];
  overallStage: ItemStage;
  createdAt: string;
}

export function deriveOverallStage(items: TrackedItem[]): ItemStage {
  if (!items.length) return 'PLACED';
  const allServed  = items.every((i) => i.stage === 'SERVED');
  const allPlated  = items.every((i) => STAGE_ORDER[i.stage] >= STAGE_ORDER.PLATED);
  const anyPrep    = items.some((i) => i.stage === 'PREP');
  if (allServed) return 'SERVED';
  if (allPlated) return 'PLATED';
  if (anyPrep)   return 'PREP';
  return 'PLACED';
}

function parseSeatFromItemName(name: string): number | null {
  const match = name.match(/\[seat\s*(\d+)\]/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Customer hook: Subscribes to live tickets and order items for a specific table.
 */
export function useRealtimeTickets(tableId: string) {
  const [tickets, setTickets] = useState<TrackedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!tableId) return;

    // 1. Fetch tickets for this table
    const { data: ticketsData, error: tErr } = await supabase
      .from('kds_tickets')
      .select('*')
      .eq('table_number', tableId)
      .neq('status', 'COMPLETED')
      .order('created_at', { ascending: true });

    if (tErr || !ticketsData || ticketsData.length === 0) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const orderIds = ticketsData.map((t) => t.order_id).filter(Boolean);

    // 2. Fetch order items for these orders
    let itemsData: any[] = [];
    if (orderIds.length > 0) {
      const { data: items, error: iErr } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      if (!iErr && items) {
        itemsData = items;
      }
    }

    // 3. Map into TrackedTickets
    const mapped: TrackedTicket[] = ticketsData.map((t) => {
      const relatedItems = itemsData.filter((i) => i.order_id === t.order_id);
      const items: TrackedItem[] = relatedItems.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        stage: (i.stage as ItemStage) || 'PLACED',
        seatNumber: parseSeatFromItemName(i.name),
        unitPrice: Number(i.unit_price) || 0,
        notes: [i.prep_mode, i.selected_option].filter(Boolean).join(' • '),
      }));

      const detectedSeat = items.find((it) => it.seatNumber !== null)?.seatNumber || null;

      return {
        id: t.id,
        tableId: t.table_number,
        orderId: t.order_id,
        seatNumber: detectedSeat,
        customerName: t.server_name || 'Guest',
        status: (t.status as TicketStatus) || 'NEW',
        items,
        overallStage: deriveOverallStage(items),
        createdAt: t.created_at,
      };
    });

    setTickets(mapped);
    setIsLoading(false);
  }, [tableId]);

  useEffect(() => {
    if (!tableId) return;

    fetchTickets();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`rt_table_${tableId}_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kds_tickets' },
        () => fetchTickets()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => fetchTickets()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchTickets()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [tableId, fetchTickets]);

  return { tickets, isLoading, refetch: fetchTickets };
}

/**
 * Kitchen hook: Subscribes to ALL active tickets across all tables.
 */
export function useRealtimeAllTickets() {
  const [tickets, setTickets] = useState<TrackedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchAll = useCallback(async () => {
    const { data: ticketsData, error: tErr } = await supabase
      .from('kds_tickets')
      .select('*')
      .neq('status', 'COMPLETED')
      .order('created_at', { ascending: true });

    if (tErr || !ticketsData || ticketsData.length === 0) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    const orderIds = ticketsData.map((t) => t.order_id).filter(Boolean);

    let itemsData: any[] = [];
    if (orderIds.length > 0) {
      const { data: items, error: iErr } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      if (!iErr && items) {
        itemsData = items;
      }
    }

    const mapped: TrackedTicket[] = ticketsData.map((t) => {
      const relatedItems = itemsData.filter((i) => i.order_id === t.order_id);
      const items: TrackedItem[] = relatedItems.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        stage: (i.stage as ItemStage) || 'PLACED',
        seatNumber: parseSeatFromItemName(i.name),
        unitPrice: Number(i.unit_price) || 0,
        notes: [i.prep_mode, i.selected_option].filter(Boolean).join(' • '),
      }));

      const detectedSeat = items.find((it) => it.seatNumber !== null)?.seatNumber || null;

      return {
        id: t.id,
        tableId: t.table_number,
        orderId: t.order_id,
        seatNumber: detectedSeat,
        customerName: t.server_name || 'Guest',
        status: (t.status as TicketStatus) || 'NEW',
        items,
        overallStage: deriveOverallStage(items),
        createdAt: t.created_at,
      };
    });

    setTickets(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`kitchen_all_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kds_tickets' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchAll)
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchAll]);

  return { tickets, isLoading, refetch: fetchAll };
}
