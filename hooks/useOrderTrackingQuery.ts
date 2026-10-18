'use client';

import { useMemo } from 'react';
import { useRealtimeTickets, deriveOverallStage, type TrackedTicket } from './useRealtimeTickets';
import { useTableSeat } from './useTableSeat';

export interface OrderTrackingResult {
  tickets: TrackedTicket[];
  overallStage: 'PLACED' | 'PREP' | 'PLATED' | 'SERVED';
  stageHash: string;
  isLoading: boolean;
  tableId: string;
  seatNumber: number;
}

/**
 * Customer-facing order tracking hook.
 * Subscribes to Supabase Realtime for live stage updates.
 * Filters tickets to the current seat to avoid showing other seats' items.
 */
export function useOrderTrackingQuery(): OrderTrackingResult {
  const { tableId, seatNumber, isReady } = useTableSeat();
  const { tickets, isLoading } = useRealtimeTickets(tableId);

  // Filter to this seat's tickets only (seat isolation) - memoized to prevent render loops
  const myTickets = useMemo(() => {
    return tickets.filter(
      t => t.seatNumber === null || t.seatNumber === seatNumber
    );
  }, [tickets, seatNumber]);

  // Derive overall stage from all items across all my tickets
  const allItems = useMemo(() => myTickets.flatMap(t => t.items), [myTickets]);
  const overallStage = useMemo(() => deriveOverallStage(allItems), [allItems]);

  // stageHash — any change here triggers a re-render in Screen5
  const stageHash = useMemo(() => allItems.map(i => `${i.id}:${i.stage}`).join('|'), [allItems]);

  return {
    tickets: myTickets,
    overallStage,
    stageHash,
    isLoading: isLoading || !isReady,
    tableId,
    seatNumber,
  };
}
