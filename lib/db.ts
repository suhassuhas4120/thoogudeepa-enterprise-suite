import { supabase, DbOrder, DbTableSeat, DbTable, DbKdsTicket } from './supabase';
import type { CartItem } from '../types/customer';

export async function placeOrderToSupabase(params: {
  tableId: string;
  seatNumber: number;
  customerName: string;
  cartItems: CartItem[];
  ticketId: string;
}) {
  return placeSeatOrder({
    tableNumber: params.tableId,
    seatNumber: params.seatNumber,
    guestName: params.customerName || `Seat ${params.seatNumber}`,
    items: params.cartItems.map((c) => ({
      name: c.menuItem.name,
      quantity: c.quantity,
      price: c.totalPrice || c.menuItem.price * c.quantity,
      prepMode: c.prepMode || 'Dum Handi',
      options: c.selectedOption,
      addOns: c.selectedAddOns || [],
    })),
    subtotal: params.cartItems.reduce((acc, c) => acc + (c.totalPrice || c.menuItem.price * c.quantity), 0),
    tax: Math.round(params.cartItems.reduce((acc, c) => acc + (c.totalPrice || c.menuItem.price * c.quantity), 0) * 0.05),
    total: Math.round(params.cartItems.reduce((acc, c) => acc + (c.totalPrice || c.menuItem.price * c.quantity), 0) * 1.05),
  });
}

export const updateItemStage = updateOrderItemStage;

/* ── 80% Exit Recovery: Check active unpaid session on a physical seat ──── */
export async function fetchSeatSession(
  tableNumber: string,
  seatNumber: number
): Promise<{ seat: DbTableSeat | null; activeOrder: DbOrder | null }> {
  try {
    const { data: seatData } = await supabase
      .from('table_seats')
      .select('*')
      .eq('table_number', tableNumber)
      .eq('seat_number', seatNumber)
      .maybeSingle();

    if (!seatData) return { seat: null, activeOrder: null };

    if (seatData.status !== 'VACANT') {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('table_number', tableNumber)
        .eq('seat_number', seatNumber)
        .eq('status', 'UNPAID')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { seat: seatData, activeOrder: orderData || null };
    }

    return { seat: seatData, activeOrder: null };
  } catch (err) {
    console.error('fetchSeatSession error:', err);
    return { seat: null, activeOrder: null };
  }
}

/* ── Place Seat Order (Customer / Waiter) ─────────────────────────────────── */
export async function placeSeatOrder(params: {
  tableNumber: string;
  seatNumber: number;
  guestName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    prepMode?: string;
    options?: string;
    addOns?: string[];
    notes?: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  deviceToken?: string;
}): Promise<{ orderId: string; ticketId: string }> {
  const orderId = `ORD-${params.tableNumber.replace(/[^a-zA-Z0-9]/g, '')}-S${params.seatNumber}-${Date.now().toString().slice(-6)}`;
  const ticketId = `KOT-${params.tableNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

  try {
    // 1. Insert order
    await supabase.from('orders').insert({
      id: orderId,
      table_number: params.tableNumber,
      seat_number: params.seatNumber,
      guest_name: params.guestName,
      items: params.items,
      subtotal: params.subtotal,
      tax: params.tax,
      total: params.total,
      status: 'UNPAID',
      device_token: params.deviceToken,
    });

    // 2. Insert line items
    const lineItems = params.items.map((it, idx) => ({
      id: `${orderId}-it-${idx}`,
      order_id: orderId,
      table_number: params.tableNumber,
      seat_number: params.seatNumber,
      name: it.name,
      quantity: it.quantity,
      price: it.price,
      stage: 'RECEIVED',
      prep_mode: it.prepMode || 'Dum Pot',
      options: it.options,
      add_ons: it.addOns,
      notes: it.notes,
    }));
    await supabase.from('order_items').insert(lineItems);

    // 3. Insert KDS ticket
    await supabase.from('kds_tickets').insert({
      id: ticketId,
      table_number: params.tableNumber,
      server_name: params.guestName,
      status: 'NEW',
      source: 'CUSTOMER',
      items: lineItems,
    });

    // 4. Update Seat & Table status to OCCUPIED
    await supabase
      .from('table_seats')
      .update({ status: 'OCCUPIED', active_order_id: orderId })
      .eq('table_number', params.tableNumber)
      .eq('seat_number', params.seatNumber);

    await supabase
      .from('tables')
      .update({ status: 'OCCUPIED' })
      .eq('number', params.tableNumber);

    return { orderId, ticketId };
  } catch (err) {
    console.error('placeSeatOrder error:', err);
    return { orderId, ticketId };
  }
}

/* ── Update Line Item Stage (KDS Stepper: 1.REC -> 2.PREP -> 3.READY) ──── */
export async function updateOrderItemStage(
  itemId: string,
  stage: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED'
) {
  try {
    await supabase
      .from('order_items')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', itemId);
  } catch (err) {
    console.error('updateOrderItemStage error:', err);
  }
}

/* ── Confirm Seat Payment (Zero-Typing Pure-UPI Settlement) ─────────────── */
export async function confirmSeatPayment(params: {
  orderId: string;
  tableNumber: string;
  seatNumber: number;
  amount: number;
  bankUtr?: string;
  paymentMethod?: string;
}): Promise<boolean> {
  const utr = params.bankUtr || `UPI-AUTO-${Date.now().toString().slice(-8)}`;
  const paymentId = `PAY-${Date.now().toString().slice(-6)}`;

  try {
    // 1. Insert payment record
    await supabase.from('payments').insert({
      id: paymentId,
      order_id: params.orderId,
      table_number: params.tableNumber,
      seat_number: params.seatNumber,
      amount: params.amount,
      payment_method: params.paymentMethod || 'UPI',
      bank_utr: utr,
      status: 'CONFIRMED',
    });

    // 2. Mark order as PAID
    await supabase
      .from('orders')
      .update({ status: 'PAID', updated_at: new Date().toISOString() })
      .eq('id', params.orderId);

    // 3. Mark seat as PAID
    await supabase
      .from('table_seats')
      .update({ status: 'PAID', updated_at: new Date().toISOString() })
      .eq('table_number', params.tableNumber)
      .eq('seat_number', params.seatNumber);

    return true;
  } catch (err) {
    console.error('confirmSeatPayment error:', err);
    return false;
  }
}

/* ── Service Ping (Call Waiter) ─────────────────────────────────────────── */
export async function sendCallWaiterPing(params: {
  tableNumber: string;
  seatNumber: number;
  type: 'WATER' | 'CLEAN' | 'TISSUE' | 'SALNA' | 'BILL';
  guestName?: string;
  message?: string;
}) {
  try {
    await supabase.from('pings').insert({
      id: `PING-${Date.now().toString().slice(-6)}`,
      table_number: params.tableNumber,
      seat_number: params.seatNumber,
      type: params.type,
      guest_name: params.guestName || 'Guest',
      message: params.message,
      status: 'PENDING',
    });
  } catch (err) {
    console.error('sendCallWaiterPing error:', err);
  }
}

export async function resolveCallWaiterPing(pingId: string) {
  try {
    await supabase
      .from('pings')
      .update({ status: 'RESOLVED' })
      .eq('id', pingId);
  } catch (err) {
    console.error('resolveCallWaiterPing error:', err);
  }
}

/* ── Vacate Table Pod (Waiter Sanitize Turnaround Action) ─────────────────── */
export async function vacateTablePod(tableNumber: string): Promise<boolean> {
  try {
    // 1. Reset all seats for this table to VACANT
    await supabase
      .from('table_seats')
      .update({
        status: 'VACANT',
        active_order_id: null,
        device_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('table_number', tableNumber);

    // 2. Reset table status to VACANT
    await supabase
      .from('tables')
      .update({
        status: 'VACANT',
        current_bill: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('number', tableNumber);

    return true;
  } catch (err) {
    console.error('vacateTablePod error:', err);
    return false;
  }
}
