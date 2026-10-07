'use client';

import { useEffect, useState, useCallback } from 'react';
import { normalizeTableNumber } from '../store/useCustomerStore';

/**
 * Reads ?table=T-01&seat=1 from the URL.
 * Falls back to defaults matching schema and seed data (T-01, Seat 1).
 */
export function useTableSeat() {
  const [tableId, setTableId] = useState<string>('T-01');
  const [seatNumber, setSeatNumber] = useState<number>(1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table') || params.get('t') || params.get('tableNumber');
    const seat = params.get('seat') || params.get('s') || params.get('chair');

    if (tbl) setTableId(normalizeTableNumber(tbl));
    if (seat) setSeatNumber(parseInt(seat, 10) || 1);
    setIsReady(true);
  }, []);

  /** Returns a stable ticket-ID prefix for this seat */
  const makeTicketId = useCallback(
    (counter: number) => {
      const ts = Date.now();
      const tblTag = tableId.replace(/[^a-zA-Z0-9]/g, '');
      return `KDS-${tblTag}-${ts}-${String(counter).padStart(3, '0')}`;
    },
    [tableId]
  );

  /** Returns an item-ID for use inside a ticket */
  const makeItemId = useCallback(
    (ticketId: string, index: number) =>
      `${ticketId}-item-${String(index + 1).padStart(2, '0')}`,
    []
  );

  return { tableId, seatNumber, makeTicketId, makeItemId, isReady };
}
