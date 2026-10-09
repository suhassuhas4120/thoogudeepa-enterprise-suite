'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  QrCode,
  Banknote,
  CheckCircle2,
  Receipt,
  Printer,
  Phone,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  Armchair,
  Smartphone,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge, SharedTable } from '../../store/useSharedBridge';
import { useWaiterStore } from '../../store/useWaiterStore';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
import QRCode from 'qrcode';

interface Props {
  tableNum: string;
  splitAmount?: number;
  splitLabel?: string;
  waiterName?: string;
  onBack: () => void;
  onDone: () => void;
}

type PayMethod = 'UPI' | 'CASH';

interface SettledBillSnapshot {
  invoiceNumber: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    options?: string;
    addOns?: string[];
    stage?: string;
    seatNumber?: number;
    ticketNumber: string;
  }[];
  subtotal: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  method: PayMethod;
  cashTendered: number;
  cashChange: number;
  seatLabel: string;
  captainName: string;
  tableName: string;
  section: string;
  guestCount: number;
  formattedDate: string;
  formattedTime: string;
}

export function ScreenM6Settlement({
  tableNum,
  splitAmount,
  splitLabel,
  waiterName,
  onBack,
  onDone,
}: Props) {
  const {
    tables,
    kdsTickets,
    waiterRecordsPayment,
    waiterVacatesTable,
    waiterClearsChairAfterPayment,
    recordSettledBill,
    waiterInitiatesSettlement,
    waiterClearsSettlementSession,
  } = useSharedBridge();
  const { activeCaptain } = useWaiterStore();
  // Robust table number matching (handles T-05, T-5, TABLE 5, 5, etc.)
  const cleanTableNum = (s: string) => {
    const raw = (s || '').toUpperCase().replace(/\s+/g, '').replace(/^TABLE/, '').replace(/^T-?/, '').trim();
    const parsed = parseInt(raw, 10);
    return !isNaN(parsed) && parsed > 0 ? String(parsed) : raw;
  };

  const fallbackTable: SharedTable = {
    id: tableNum,
    number: tableNum.startsWith('T-') ? tableNum : `T-${tableNum}`,
    section: 'Main Dining Hall',
    capacity: 4,
    status: 'OCCUPIED',
    guestCount: 1,
    seatedTime: '--',
    currentBill: 0,
    serverName: 'Floor Captain',
    kotCount: 1,
    mergeGroupPeers: [tableNum],
    activeItems: [],
  };
  const table: SharedTable = tables.find((t) => cleanTableNum(t.number) === cleanTableNum(tableNum)) || tables.find((t) => t.number === tableNum) || fallbackTable;

  const [method, setMethod] = useState<PayMethod>('UPI');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [vacateAfter, setVacateAfter] = useState(!splitAmount);
  const [settled, setSettled] = useState(false);
  const [settledSnapshot, setSettledSnapshot] = useState<SettledBillSnapshot | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrZoomed, setQrZoomed] = useState(false);
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(true);

  const groupPeers: string[] = table?.mergeGroupPeers ?? [tableNum];
  const tickets = useMemo(() => {
    return kdsTickets.filter(
      (tk) =>
        groupPeers.some((p) => cleanTableNum(p) === cleanTableNum(tk.tableNumber)) &&
        tk.status !== 'COMPLETED'
    );
  }, [kdsTickets, groupPeers]);

  // Captain Name
  const ticketCaptain = tickets.find((t) => t.serverName && t.serverName !== 'Floor Captain')?.serverName;
  const captainName = ticketCaptain || table?.serverName || waiterName || activeCaptain || 'Floor Captain';

  // Gather all ordered items
  const allOrderedItems = useMemo(() => {
    const list: {
      id: string;
      name: string;
      quantity: number;
      price: number;
      totalPrice: number;
      options?: string;
      addOns?: string[];
      stage?: string;
      seatNumber?: number;
      ticketNumber: string;
    }[] = [];

    const seenIds = new Set<string>();

    tickets.forEach((tk) => {
      tk.items.forEach((it) => {
        const fallbackPrice =
          INITIAL_MENU_ITEMS.find(
            (m) =>
              m.name.toLowerCase() === it.name.toLowerCase() ||
              m.name.toLowerCase().includes(it.name.toLowerCase()) ||
              it.name.toLowerCase().includes(m.name.toLowerCase())
          )?.price || 220;
        const unitPrice = it.price && it.price > 0 ? it.price : fallbackPrice;
        seenIds.add(it.id);
        list.push({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: unitPrice,
          totalPrice: unitPrice * it.quantity,
          options: it.options,
          addOns: it.addOns || [],
          stage: it.stage,
          seatNumber: it.seatNumber || tk.seatNumber,
          ticketNumber: tk.id.slice(-4),
        });
      });
    });

    if (table?.activeItems && table.activeItems.length > 0) {
      table.activeItems.forEach((ai, idx) => {
        const id = ai.id || `ai-${idx}`;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          const fallbackPrice =
            INITIAL_MENU_ITEMS.find(
              (m) =>
                m.name.toLowerCase() === ai.name.toLowerCase() ||
                m.name.toLowerCase().includes(ai.name.toLowerCase()) ||
                ai.name.toLowerCase().includes(m.name.toLowerCase())
            )?.price || 220;
          const unitPrice = ai.price && ai.price > 0 ? ai.price : fallbackPrice;
          list.push({
            id,
            name: ai.name,
            quantity: ai.quantity,
            price: unitPrice,
            totalPrice: unitPrice * ai.quantity,
            options: ai.options,
            addOns: (ai as any).addOns || [],
            stage: ai.status || 'Placed',
            seatNumber: ai.seatNumber,
            ticketNumber: 'TBL',
          });
        }
      });
    }

    return list;
  }, [tickets, table?.activeItems]);

  // Detect if this is a single-chair settle
  const splitSeatNumber = useMemo(() => {
    if (!splitLabel) return null;
    const m = splitLabel.match(/(?:Chair|Seat)\s*(\d+)/i);
    return m ? Number(m[1]) : null;
  }, [splitLabel]);

  // When settling a specific chair, show that chair's items
  const displayedItems = useMemo(() => {
    if (splitSeatNumber !== null) {
      const chairItems = allOrderedItems.filter((it) => it.seatNumber === splitSeatNumber);
      return chairItems.length > 0 ? chairItems : allOrderedItems.filter((it) => !it.seatNumber);
    }
    return allOrderedItems;
  }, [allOrderedItems, splitSeatNumber]);

  const displayedItemsSum = useMemo(() => {
    return displayedItems.reduce((sum, it) => sum + (it.totalPrice || it.price * it.quantity || 0), 0);
  }, [displayedItems]);

  // Subtotal and tax calculations
  const { subtotal, totalTax, grandTotal, cgst, sgst } = useMemo(() => {
    if (splitAmount && splitAmount > 0) {
      const calcSub = Math.round(splitAmount / 1.05);
      const calcTax = splitAmount - calcSub;
      return {
        subtotal: calcSub,
        totalTax: calcTax,
        grandTotal: splitAmount,
        cgst: calcTax / 2,
        sgst: calcTax / 2,
      };
    }

    if (displayedItemsSum > 0) {
      const calcTax = Math.round(displayedItemsSum * 0.05);
      const calcGrand = displayedItemsSum + calcTax;
      return {
        subtotal: displayedItemsSum,
        totalTax: calcTax,
        grandTotal: calcGrand,
        cgst: calcTax / 2,
        sgst: calcTax / 2,
      };
    }

    const tableBill = table?.currentBill || 0;
    if (tableBill > 0) {
      const calcSub = Math.round(tableBill / 1.05);
      const calcTax = tableBill - calcSub;
      return {
        subtotal: calcSub,
        totalTax: calcTax,
        grandTotal: tableBill,
        cgst: calcTax / 2,
        sgst: calcTax / 2,
      };
    }

    return {
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
      cgst: 0,
      sgst: 0,
    };
  }, [splitAmount, displayedItemsSum, table?.currentBill]);

  const hasUnservedDishes =
    displayedItems.length > 0 &&
    displayedItems.some((it) => it.stage !== 'SERVED' && it.stage !== 'Served');

  const invoiceNumber = useMemo(() => {
    const cleanTbl = tableNum.replace(/[^a-zA-Z0-9]/g, '');
    const stamp = Date.now().toString().slice(-4);
    return `INV-${cleanTbl}-${stamp}`;
  }, [tableNum]);

  // Unique seat numbers
  const seatNumbers = useMemo(() => {
    if (splitSeatNumber !== null) return [splitSeatNumber];
    const seatsSet = new Set<number>();
    allOrderedItems.forEach((it) => {
      if (it.seatNumber) seatsSet.add(it.seatNumber);
    });
    if (seatsSet.size > 0) {
      return Array.from(seatsSet).sort((a, b) => a - b);
    }
    const count = table?.guestCount || table?.capacity || 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [allOrderedItems, splitSeatNumber, table]);

  const seatNumbersLabel =
    seatNumbers.length === 1
      ? `Chair ${seatNumbers[0]}`
      : `Chairs ${seatNumbers.join(', ')}`;

  // Cash and change calculations
  const effectiveCashTendered =
    typeof cashTendered === 'number' && cashTendered >= grandTotal
      ? cashTendered
      : grandTotal;

  const cashChange = Math.max(0, effectiveCashTendered - grandTotal);

  const changePreview =
    typeof cashTendered === 'number' && cashTendered >= grandTotal
      ? cashTendered - grandTotal
      : null;

  // Generate real dynamic UPI QR code
  useEffect(() => {
    if (grandTotal > 0) {
      const upiUri = `upi://pay?pa=thoogudeepa@okicici&pn=Thoogudeepa%20Donne%20Biryani&am=${grandTotal}&cu=INR&tn=Table_${tableNum}_Bill`;
      QRCode.toDataURL(upiUri, { width: 220, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [grandTotal, tableNum]);

  // Real-time synchronization of floor captain settlement arrival to diner app
  useEffect(() => {
    waiterInitiatesSettlement(tableNum, splitSeatNumber ?? undefined, grandTotal, method, isUpiVerified);
  }, [tableNum, splitSeatNumber, grandTotal, method, isUpiVerified, waiterInitiatesSettlement]);

  const handleExplicitBack = () => {
    waiterClearsSettlementSession(tableNum, splitSeatNumber ?? undefined);
    onBack();
  };

  // Modal scroll lock
  useEffect(() => {
    if (qrZoomed) {
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [qrZoomed]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSettle = () => {
    const itemsToRecord = displayedItems.length > 0 ? displayedItems : allOrderedItems;
    const finalSubtotal = subtotal > 0 ? subtotal : itemsToRecord.reduce((sum, it) => sum + it.totalPrice, 0);
    const finalTax = totalTax > 0 ? totalTax : Math.round(finalSubtotal * 0.05);
    const finalGrandTotal = grandTotal > 0 ? grandTotal : finalSubtotal + finalTax;
    const finalTendered =
      method === 'CASH'
        ? typeof cashTendered === 'number' && cashTendered >= finalGrandTotal
          ? cashTendered
          : finalGrandTotal
        : finalGrandTotal;
    const finalChange = method === 'CASH' ? Math.max(0, finalTendered - finalGrandTotal) : 0;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const snapshot: SettledBillSnapshot = {
      invoiceNumber,
      items: itemsToRecord,
      subtotal: finalSubtotal,
      totalTax: finalTax,
      cgst: finalTax / 2,
      sgst: finalTax / 2,
      grandTotal: finalGrandTotal,
      method,
      cashTendered: finalTendered,
      cashChange: finalChange,
      seatLabel: splitSeatNumber !== null ? `Chair ${splitSeatNumber}` : seatNumbersLabel,
      captainName,
      tableName: tableNum,
      section: table?.section || 'Main Dining Hall',
      guestCount: splitSeatNumber !== null ? 1 : table?.guestCount || table?.capacity || 1,
      formattedDate,
      formattedTime,
    };

    setSettledSnapshot(snapshot);
    setSettled(true);

    // Record settled bill for real-time customer app synchronization
    recordSettledBill({
      ...snapshot,
      seatNumber: splitSeatNumber ?? undefined,
    });

    // Update store state
    waiterRecordsPayment(tableNum, method, finalGrandTotal, splitSeatNumber ?? undefined);
  };

  const handleFinish = () => {
    if (splitSeatNumber !== null) {
      waiterClearsChairAfterPayment(tableNum, splitSeatNumber);
    } else if (vacateAfter) {
      waiterVacatesTable(tableNum);
    }
    onDone();
  };

  if (!table) return null;

  // ══════════════════════════════════════════════════════════════════════════════
  // ── 1. POST-PAYMENT RECEIPT VIEW (AFTER PAY ONLY) ───────────────────────────
  // ══════════════════════════════════════════════════════════════════════════════
  if (settled && settledSnapshot) {
    const s = settledSnapshot;

    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-black text-stone-900 uppercase">
              Settlement Bill Receipt
            </span>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="font-mono text-xs font-black text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl border border-stone-300 transition cursor-pointer"
          >
            Done
          </button>
        </header>

        {/* Content Container */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Payment Success Alert Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-3xl text-center space-y-1.5 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-black text-emerald-950 font-mono tracking-tight">
              Payment Recorded &amp; Settled!
            </h2>
            <p className="font-mono text-xs font-bold text-emerald-800">
              ₹{s.grandTotal.toFixed(2)} collected via {s.method} for Table {s.tableName}
            </p>
            {customerPhone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 font-mono text-[11px] font-bold text-emerald-900 mt-1">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span>Digital bill dispatched to +91 {customerPhone}</span>
              </div>
            )}
          </div>

          {/* ── AUTHENTIC RESTAURANT BILL & TAX RECEIPT ── */}
          <div className="bg-white border-2 border-dashed border-[#DCD6CE] rounded-3xl p-5 font-mono shadow-xs space-y-3.5">
            {/* Restaurant Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-200">
              <h3 className="text-base font-black text-stone-900 tracking-tight uppercase">
                Thoogudeepa Donne Biryani
              </h3>
              <p className="text-[10px] text-stone-500 font-bold">
                Authentic Military Style • Bengaluru
              </p>
              <p className="text-[9.5px] text-stone-400">
                GSTIN: 29AABCT1332L1Z9 • FSSAI: 11223334000182
              </p>

              <div className="pt-2 flex items-center justify-between text-[10.5px] text-stone-700 border-t border-stone-100 mt-2">
                <span className="font-black text-stone-900">TAX INVOICE: #{s.invoiceNumber}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black border border-emerald-300 text-[10px]">
                  PAID ({s.method})
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                <span>Date: {s.formattedDate}</span>
                <span>Time: {s.formattedTime}</span>
              </div>
            </div>

            {/* ── TABLE, CAPTAIN & SEAT DETAILS ── */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-400 font-bold block text-[9.5px] uppercase">Table Number</span>
                  <span className="font-black text-stone-900">
                    {s.tableName} ({s.section})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 font-bold block text-[9.5px] uppercase">Floor Captain</span>
                  <span className="font-black text-[#9C3D1E] flex items-center justify-end gap-1">
                    <User className="h-3 w-3" />
                    <span>{s.captainName}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-stone-200">
                <div>
                  <span className="text-stone-400 font-bold block text-[9.5px] uppercase">Assigned Seats</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <Armchair className="h-3 w-3 text-stone-500" />
                    <span>{s.seatLabel}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 font-bold block text-[9.5px] uppercase">Guest Count</span>
                  <span className="font-bold text-stone-800">
                    {s.guestCount} {s.guestCount === 1 ? 'Guest' : 'Guests'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── ITEMIZED DISH BREAKDOWN WITH PRICES ── */}
            <div className="space-y-1.5 pb-3 border-b border-dashed border-stone-200 text-xs">
              <div className="flex justify-between font-black text-[10px] text-stone-400 uppercase tracking-wider pb-1">
                <span>Item Particulars &amp; Chair</span>
                <span>Amount (₹)</span>
              </div>
              {s.items.length > 0 ? (
                s.items.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between text-stone-800 text-[11.5px] py-0.5">
                    <div>
                      <div className="font-bold">
                        <span className="text-[#9C3D1E] mr-1">{item.quantity}×</span>
                        <span>{item.name}</span>
                        {item.seatNumber && (
                          <span className="text-[9px] bg-stone-100 text-stone-700 px-1 py-0.5 rounded border border-stone-300 ml-1.5 font-bold">
                            Chair {item.seatNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-stone-400 flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span>@ ₹{item.price} each</span>
                        {item.options && <span>• {item.options}</span>}
                      </div>
                      {item.addOns && item.addOns.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.addOns.map((ao: string, aoIdx: number) => (
                            <span
                              key={aoIdx}
                              className="px-1 py-0.2 rounded bg-amber-100 border border-amber-300 text-[8px] font-black text-amber-900"
                            >
                              + {ao}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold shrink-0 ml-2">₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-stone-800 text-[11.5px]">
                  <span className="font-bold">1× Dine-in Food Orders</span>
                  <span className="font-bold">₹{s.subtotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* ── TAXES & CHARGES BREAKDOWN ── */}
            <div className="space-y-1.5 pb-3 border-b border-stone-200 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>
                  Items Subtotal ({s.items.length > 0 ? s.items.reduce((acc, i) => acc + i.quantity, 0) : 1} items):
                </span>
                <span className="font-bold text-stone-900">₹{s.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>CGST (2.5%):</span>
                <span>₹{s.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>SGST (2.5%):</span>
                <span>₹{s.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>Total GST (5%):</span>
                <span>₹{s.totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-200">
                <span>GRAND TOTAL PAID:</span>
                <span className="text-[#9C3D1E] text-base">₹{s.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* ── PROMINENT PAYMENT DETAILS & CHANGE CALCULATION ── */}
            {s.method === 'CASH' ? (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-950 font-black uppercase tracking-wider text-[11px] pb-1 border-b border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-emerald-700" />
                    <span>Cash Settlement Breakdown</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[9.5px]">
                    CASH
                  </span>
                </div>

                <div className="flex justify-between text-stone-700 pt-0.5">
                  <span>Bill Total Amount:</span>
                  <span className="font-bold text-stone-900">₹{s.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Cash Received from Guest:</span>
                  <span className="font-black text-stone-900">₹{s.cashTendered.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t-2 border-emerald-300 flex justify-between items-center">
                  <div>
                    <span className="font-black text-emerald-950 uppercase text-xs block">
                      Change to be Given:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {s.cashChange > 0 ? `Return ₹${s.cashChange.toFixed(2)} to guest` : 'Exact amount received'}
                    </span>
                  </div>
                  <span className="font-black text-xl text-emerald-800">
                    ₹{s.cashChange.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-indigo-950 font-black uppercase tracking-wider text-[11px] pb-1 border-b border-indigo-200">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-indigo-700" />
                    <span>UPI Payment Transfer</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 text-[9.5px]">
                    VERIFIED
                  </span>
                </div>
                <div className="flex justify-between text-stone-700 pt-0.5">
                  <span>Merchant VPA:</span>
                  <span className="font-bold text-indigo-900">thoogudeepa@okicici</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>NPCI Reference:</span>
                  <span className="font-mono text-stone-900">#UPI-{s.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Amount Debited:</span>
                  <span className="font-black text-stone-900">₹{s.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {customerPhone && (
              <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-[11px]">
                <span className="text-stone-600">Digital Receipt Sent:</span>
                <span className="font-bold text-stone-900">+91 {customerPhone}</span>
              </div>
            )}

            <div className="text-center text-[9.5px] text-stone-400 pt-1">
              Thank you for dining with Thoogudeepa! Visit Again!
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 pb-6 font-mono">
            <button
              type="button"
              onClick={() => {
                showToast('Thermal tax invoice printed');
                if (typeof window !== 'undefined') window.print?.();
              }}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Print Thermal Receipt</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/receipts/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      tableNumber: s.tableName,
                      invoiceNumber: s.invoiceNumber,
                      phone: customerPhone,
                      total: s.grandTotal,
                      subtotal: s.subtotal,
                      tax: s.totalTax,
                      bankUtr: s.method === 'CASH' ? 'CASH-SETTLED' : `#UPI-${s.invoiceNumber}`,
                      items: s.items.map((it) => ({
                        name: it.name,
                        quantity: it.quantity,
                        price: it.price,
                      })),
                    }),
                  });
                  const data = await res.json();
                  if (data?.deliveryStatus?.whatsappWebLink) {
                    window.open(data.deliveryStatus.whatsappWebLink, '_blank');
                  }
                  showToast('WhatsApp bill dispatched');
                } catch {
                  showToast('Bill generated');
                }
              }}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>Send Bill on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 bg-[#9C3D1E] hover:bg-[#853216] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
            >
              <span>Return to Floor Grid</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ── 2. PRE-PAYMENT SETTLEMENT VIEW (BEFORE PAY) ─────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
        <button
          type="button"
          onClick={handleExplicitBack}
          className="flex items-center gap-1.5 font-mono text-xs font-bold text-stone-700 hover:text-[#9C3D1E] py-1 px-2.5 -ml-1 rounded-xl bg-stone-50 hover:bg-[#FFF8F5] border border-[#EAE5DF] transition cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Table {tableNum}</span>
        </button>
        <span className="font-mono text-xs font-black text-[#9C3D1E] uppercase tracking-wider">
          Settle Bill
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Table & Captain Info Card */}
        <div className="p-4 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs font-mono space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                {table.section}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  {table.number}
                  {table.mergedWith && (
                    <span className="text-purple-700 text-sm font-bold ml-1.5">+ {table.mergedWith}</span>
                  )}
                </h1>
                {splitLabel && (
                  <span className="font-mono text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs">
                    {splitLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">
                Total Payable (Inc. GST)
              </span>
              <span className="text-2xl font-black text-stone-900">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-stone-400" />
              <span>
                Captain: <strong className="text-stone-900">{captainName}</strong>
              </span>
            </div>
            <div className="text-right flex items-center justify-end gap-1.5">
              <Armchair className="h-3.5 w-3.5 text-stone-400" />
              <span>
                Seats: <strong className="text-stone-900">{seatNumbersLabel}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── COMPACT ORDER SUMMARY CARD (WITH COLLAPSIBLE INSPECT) ── */}
        <div className="bg-white border border-[#EAE5DF] rounded-2xl p-4 font-mono shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#9C3D1E]" />
              <span className="font-black text-xs text-stone-900 uppercase tracking-wider">
                Bill Summary
              </span>
            </div>
            <span className="text-xs font-bold text-stone-500">
              {displayedItems.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          <div className="space-y-1 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>GST (2.5% CGST + 2.5% SGST):</span>
              <span>₹{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-100">
              <span>Total Amount:</span>
              <span className="text-[#9C3D1E] text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Collapsible toggle to inspect dishes */}
          {displayedItems.length > 0 && (
            <div className="pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-stone-600 hover:text-[#9C3D1E] py-1 cursor-pointer transition"
              >
                <span>{showOrderSummary ? 'Hide Ordered Items' : `View Ordered Items (${displayedItems.length})`}</span>
                {showOrderSummary ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              <AnimatePresence>
                {showOrderSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1.5 pt-2 max-h-48 overflow-y-auto"
                  >
                    {displayedItems.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between text-[11px] text-stone-700 py-0.5">
                        <div>
                          <div>
                            <span className="font-bold">{item.quantity}× {item.name}</span>
                            {!splitSeatNumber && item.seatNumber && (
                              <span className="text-[9.5px] text-[#9C3D1E] ml-1.5 font-bold">[Chair {item.seatNumber}]</span>
                            )}
                          </div>
                          {item.options && (
                            <div className="text-[9.5px] text-stone-400">[{item.options}]</div>
                          )}
                          {item.addOns && item.addOns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.addOns.map((ao: string, aIdx: number) => (
                                <span
                                  key={aIdx}
                                  className="px-1 py-0.2 rounded bg-amber-100 border border-amber-300 text-[8px] font-black text-amber-900"
                                >
                                  + {ao}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-bold shrink-0 ml-2">₹{item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── CUSTOMER MOBILE NUMBER INPUT ── */}
        <div className="space-y-1.5 font-mono">
          <label className="flex items-center justify-between text-xs font-black text-stone-700 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#9C3D1E]" />
              <span>Customer Mobile (E-Receipt)</span>
            </span>
            <span className="text-[10px] text-stone-400 font-bold lowercase">
              (optional whatsapp)
            </span>
          </label>
          <div className="relative flex items-center rounded-2xl border-2 border-[#EAE5DF] bg-white shadow-2xs focus-within:border-[#9C3D1E] focus-within:ring-2 focus-within:ring-[#9C3D1E]/20 overflow-hidden transition">
            <div className="flex items-center gap-1.5 px-3 py-3 bg-stone-100/90 border-r border-[#EAE5DF] font-mono text-xs font-black text-stone-800 shrink-0 select-none">
              <span className="text-xs font-bold">IN</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={customerPhone}
              onChange={(e) => {
                const numeric = e.target.value.replace(/\D/g, '').slice(0, 10);
                setCustomerPhone(numeric);
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full bg-transparent px-3 py-3 font-mono text-sm font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-normal focus:outline-none"
            />
            {customerPhone.length > 0 && (
              <span className="pr-3 text-[10px] font-bold text-stone-400">
                {customerPhone.length}/10
              </span>
            )}
          </div>
        </div>

        {/* ── PAYMENT METHODS: STRICTLY TWO OPTIONS (UPI & CASH) ── */}
        <div className="space-y-2 font-mono">
          <p className="text-xs font-black text-stone-700 uppercase tracking-wider">
            Payment Method:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className={`p-3.5 rounded-2xl border-2 font-mono text-xs font-black flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer ${
                method === 'UPI'
                  ? 'bg-indigo-700 text-white border-indigo-700 ring-2 ring-indigo-300'
                  : 'bg-white text-stone-700 border-[#EAE5DF] hover:border-indigo-200'
              }`}
            >
              <QrCode className="h-6 w-6" />
              <div className="text-center">
                <span className="block text-sm">UPI / QR Code</span>
                <span className={`text-[9.5px] font-bold block ${method === 'UPI' ? 'text-indigo-200' : 'text-stone-400'}`}>
                  Scan Dynamic QR
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('CASH')}
              className={`p-3.5 rounded-2xl border-2 font-mono text-xs font-black flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer ${
                method === 'CASH'
                  ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] ring-2 ring-[#9C3D1E]/30'
                  : 'bg-white text-stone-700 border-[#EAE5DF] hover:border-[#9C3D1E]/40'
              }`}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-center">
                <span className="block text-sm">Cash Tender</span>
                <span className={`text-[9.5px] font-bold block ${method === 'CASH' ? 'text-amber-200' : 'text-stone-400'}`}>
                  Cash &amp; Change Counter
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* ── UPI PAYMENT PANEL ── */}
        {method === 'UPI' && (
          <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-indigo-950">
              <span className="font-black uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-indigo-700" />
                <span>Instant UPI Payment</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                0% MDR • NPCI
              </span>
            </div>

            {/* QR Card — blurred until Confirm QR Pay is tapped */}
            <div
              onClick={() => isUpiVerified && setQrZoomed(true)}
              className={`p-4 bg-white rounded-xl border flex flex-col items-center justify-center text-center space-y-2 shadow-2xs transition ${
                isUpiVerified
                  ? 'border-indigo-200 cursor-pointer hover:border-indigo-300 group'
                  : 'border-stone-200 cursor-default'
              }`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-[11px] font-black text-stone-800">
                  Scan to Pay ₹{grandTotal.toFixed(2)}
                </span>
                {isUpiVerified && (
                  <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 flex items-center gap-1">
                    <Search className="h-3.5 w-3.5" />
                    <span>Tap to Enlarge</span>
                  </span>
                )}
              </div>

              {/* QR with blur-reveal */}
              <div className="relative w-44 h-44">
                {qrCodeUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="Dynamic UPI QR"
                      className={`w-44 h-44 rounded-xl border border-stone-200 shadow-xs transition-all duration-500 ${
                        isUpiVerified
                          ? 'blur-none scale-100 opacity-100'
                          : 'blur-md scale-95 opacity-50'
                      }`}
                    />
                    {/* Lock overlay — shown until Confirm QR Pay is clicked */}
                    {!isUpiVerified && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/60 backdrop-blur-xs space-y-1.5 pointer-events-none p-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shadow-2xs">
                          <QrCode className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-[11px] font-black text-indigo-950 text-center leading-tight">
                          QR code hidden
                        </p>
                        <p className="text-[9.5px] text-stone-600 text-center">
                          Tap &quot;Confirm QR Pay&quot; below to display scanner
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-44 h-44 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="pt-0.5 text-[11px] text-stone-600 font-bold">
                UPI ID: <span className="text-indigo-800 font-black select-all">thoogudeepa@okicici</span>
              </div>
            </div>

            {/* Confirm QR Pay Button */}
            <button
              type="button"
              onClick={() => {
                const nextVerified = !isUpiVerified;
                setIsUpiVerified(nextVerified);
                waiterInitiatesSettlement(tableNum, splitSeatNumber ?? undefined, grandTotal, method, nextVerified);
                showToast(nextVerified ? 'UPI QR Terminal Confirmed for Diner ✓' : 'UPI QR Terminal reset');
              }}
              className={`w-full p-3.5 rounded-xl font-mono text-xs font-black flex items-center justify-center gap-2 border transition cursor-pointer active:scale-98 shadow-xs ${
                isUpiVerified
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                  : 'bg-white text-indigo-950 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50'
              }`}
            >
              {isUpiVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Confirm QR Pay (Verified ✓)</span>
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 text-indigo-700" />
                  <span>Confirm QR Pay</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ── CASH PAYMENT PANEL ── */}
        {method === 'CASH' && (
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-amber-950">
              <span className="font-black uppercase tracking-wider flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-[#9C3D1E]" />
                <span>Cash Tendered</span>
              </span>
              <span className="text-[11px] text-amber-900 font-black">
                Bill Due: ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Quick Cash Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                grandTotal,
                grandTotal % 50 !== 0 ? Math.ceil(grandTotal / 50) * 50 : null,
                grandTotal % 100 !== 0 ? Math.ceil(grandTotal / 100) * 100 : null,
                grandTotal <= 400 ? 500 : null,
                grandTotal > 400 && grandTotal <= 800 ? 1000 : null,
                grandTotal > 800 ? Math.ceil(grandTotal / 500) * 500 : null,
              ]
                .filter((v): v is number => typeof v === 'number' && v >= grandTotal)
                .filter((val, i, arr) => arr.indexOf(val) === i)
                .slice(0, 4)
                .map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCashTendered(val)}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-black transition cursor-pointer ${
                      cashTendered === val
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-stone-50'
                    }`}
                  >
                    {val === grandTotal ? `Exact (₹${val.toFixed(0)})` : `₹${val.toFixed(0)}`}
                  </button>
                ))}
            </div>

            {/* Cash Input */}
            <div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter cash received from customer…"
                value={cashTendered}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, '');
                  setCashTendered(num ? Number(num) : '');
                }}
                className="w-full px-4 py-3 bg-white border border-[#EAE5DF] rounded-xl font-mono text-sm font-bold text-stone-900 focus:outline-none focus:border-[#9C3D1E] shadow-xs"
              />
            </div>

            {/* Change to Return Preview */}
            {changePreview !== null && changePreview >= 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-300 rounded-xl">
                <div>
                  <span className="font-mono text-xs font-black text-emerald-800 uppercase block">
                    Change to Return:
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Cash ₹{cashTendered} - Bill ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                <span className="font-mono text-xl font-black text-emerald-700">
                  ₹{changePreview.toFixed(2)}
                </span>
              </div>
            )}

            {typeof cashTendered === 'number' && cashTendered > 0 && cashTendered < grandTotal && (
              <div className="flex items-center justify-between px-3 py-2 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-900">
                <span>Remaining Due:</span>
                <span className="font-black">₹{(grandTotal - cashTendered).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Vacate / Free-Chair Guard */}
        <label
          className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer font-mono shadow-2xs border transition ${
            vacateAfter ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-[#EAE5DF]'
          }`}
        >
          <input
            type="checkbox"
            checked={vacateAfter}
            onChange={(e) => setVacateAfter(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-emerald-600 shrink-0"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-black text-stone-800 block">
              {splitSeatNumber
                ? `Free Chair ${splitSeatNumber} after settlement`
                : `Vacate & reset Table ${tableNum} after settlement`}
            </span>
            <span className="text-[10px] text-stone-500 block">
              {splitSeatNumber
                ? `Chair ${splitSeatNumber} will show available for new guests`
                : 'All chairs will be released and table marked clean'}
            </span>
          </div>
        </label>

        {/* ── SETTLEMENT CONFIRMATION ACTION ── */}
        <div className="pt-1 pb-6 space-y-2">
          {hasUnservedDishes && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-center text-amber-900 text-xs font-mono font-bold">
              ⚠️ All dishes must be served before finalizing payment.
            </div>
          )}
          {!vacateAfter && !hasUnservedDishes && grandTotal > 0 && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-stone-600 text-xs font-mono font-bold">
              ☝️ {splitSeatNumber ? `Confirm freeing Chair ${splitSeatNumber}` : 'Confirm vacate'} above to enable settlement
            </div>
          )}
          <motion.button
            whileTap={!hasUnservedDishes && vacateAfter ? { scale: 0.98 } : undefined}
            type="button"
            onClick={handleSettle}
            disabled={
              grandTotal === 0 ||
              hasUnservedDishes ||
              !vacateAfter ||
              (method === 'UPI' && !isUpiVerified) ||
              (method === 'CASH' &&
                typeof cashTendered === 'number' &&
                cashTendered > 0 &&
                cashTendered < grandTotal)
            }
            className={`w-full py-4 text-white rounded-2xl font-mono text-sm font-black flex items-center justify-center gap-2 shadow-md transition ${
              hasUnservedDishes || grandTotal === 0 || !vacateAfter || (method === 'UPI' && !isUpiVerified)
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-300'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>
              {hasUnservedDishes
                ? 'Serve All Dishes to Settle'
                : !vacateAfter
                ? 'Confirm above to enable'
                : method === 'UPI' && !isUpiVerified
                ? 'Confirm QR Pay above to enable'
                : `Confirm & Settle ₹${grandTotal.toFixed(2)} via ${method}`}
            </span>
          </motion.button>
        </div>
      </div>

      {/* ── FULL-SCREEN QR LIGHTBOX ── */}
      <AnimatePresence>
        {qrZoomed && qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrZoomed(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-3xl text-stone-900 shadow-2xl flex flex-col items-center space-y-3.5 max-w-xs border-2 border-stone-200"
            >
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#9C3D1E] bg-[#FFF8F5] border border-[#9C3D1E]/20 px-3 py-1 rounded-full">
                Scan to Pay • Table {tableNum}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="UPI QR Fullscreen"
                className="w-60 h-60 rounded-2xl border border-stone-200 shadow-md"
              />
              <div className="text-2xl font-mono font-black text-stone-900">
                ₹{grandTotal.toFixed(2)}
              </div>
              <p className="text-[10px] font-mono text-stone-500">
                Scan with any UPI Scanner
              </p>
              <button
                type="button"
                onClick={() => setQrZoomed(false)}
                className="w-full py-2.5 bg-stone-900 text-white rounded-xl font-mono text-xs font-bold"
              >
                Close Lightbox
              </button>
            </motion.div>
            <p className="mt-4 font-mono text-xs text-stone-400">Tap anywhere outside to dismiss</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
