export interface StewardFloorTable {
  number: string;
  section: string;
  capacity: number;
  status: 'VACANT' | 'OCCUPIED' | 'BILLING' | 'CLEANING';
  occupiedSeatsCount: number;
  totalSeatsCount: number;
  currentBill: number;
  activePingsCount: number;
}

export interface StewardPingAlert {
  id: string;
  tableNumber: string;
  seatNumber: number;
  type: 'WATER' | 'CLEAN' | 'TISSUE' | 'SALNA' | 'BILL';
  guestName: string;
  timestamp: string;
}

export interface ReadyFoodItemAlert {
  id: string;
  tableNumber: string;
  seatNumber: number;
  dishName: string;
  quantity: number;
  readyTimestamp: string;
}
