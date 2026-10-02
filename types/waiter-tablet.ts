export interface CaptainTableSeatTab {
  seatNumber: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'PAID';
  orderId?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    stage: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
  }>;
  totalAmount: number;
}

export interface CaptainTableDetail {
  number: string;
  section: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  serverName: string;
  seatedMinutes: number;
  seats: CaptainTableSeatTab[];
  grandTotal: number;
}
