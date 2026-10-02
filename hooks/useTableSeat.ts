'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Reads ?table=A-01&seat=1 from the URL.
 * Falls back to defaults when running on the server (SSR) or if params missing.
 */
export function useTableSeat() {
  const [tableId, setTableId] = useState<string>('A-01');
  const [seatNumber, setSeatNumber] = useState<number>(1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tbl = params.get('table');
    const seat = params.get('seat');

    if (tbl) setTableId(tbl.toUpperCase());
    if (seat) setSeatNumber(parseInt(seat, 10) || 1);
    setIsReady(true);
  }, []);

  /** Returns a stable ticket-ID prefix for this seat */
  const makeTicketId = useCallback(
    (counter: number) => {
      const ts = Date.now();
      const tblTag = tableId.replace('-', '');
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
