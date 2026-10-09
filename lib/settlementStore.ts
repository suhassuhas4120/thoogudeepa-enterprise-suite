export interface ActiveSettlementSession {
  tableNumber: string;
  seatNumber?: number;
  grandTotal?: number;
  method: 'UPI' | 'CASH';
  isUpiVerified?: boolean;
  initiatedAt: number;
}

export interface SettledBillSnapshot {
  invoiceNumber: string;
  items: any[];
  subtotal: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  method: 'UPI' | 'CASH';
  cashTendered?: number;
  cashChange?: number;
  seatLabel: string;
  seatNumber?: number;
  captainName: string;
  tableName: string;
  section: string;
  guestCount: number;
  formattedDate: string;
  formattedTime: string;
  timestamp?: number;
}

// In-memory active settlement storage on Next.js server instance
export const activeSettlementSessions = new Map<string, ActiveSettlementSession>();
export const settledBills = new Map<string, SettledBillSnapshot>();

export const normalizeTable = (tbl: string) => {
  const clean = (tbl || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
  const num = parseInt(clean, 10);
  return `T-${String(!isNaN(num) && num > 0 ? num : clean).padStart(2, '0')}`;
};

export function clearSettledBillInMemory(tableNumber: string, seatNumber?: number) {
  const normTable = normalizeTable(tableNumber);
  if (typeof seatNumber === 'number') {
    settledBills.delete(`${normTable}-CHAIR-${seatNumber}`);
    activeSettlementSessions.delete(`${normTable}-CHAIR-${seatNumber}`);
  } else {
    settledBills.delete(normTable);
    activeSettlementSessions.delete(normTable);
    for (let s = 1; s <= 12; s++) {
      settledBills.delete(`${normTable}-CHAIR-${s}`);
      activeSettlementSessions.delete(`${normTable}-CHAIR-${s}`);
    }
  }
}
