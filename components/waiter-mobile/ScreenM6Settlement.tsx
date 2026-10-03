'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  QrCode,
  Banknote,
  CheckCircle2,
  Trash2,
  Receipt,
  Download,
  Share2,
  Printer,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
import QRCode from 'qrcode';

interface Props {
  tableNum: string;
  onBack: () => void;
  onDone: () => void;
}

type PayMethod = 'UPI' | 'CASH';

export function ScreenM6Settlement({ tableNum, onBack, onDone }: Props) {
  const { tables, kdsTickets, waiterRecordsPayment, waiterVacatesTable } = useSharedBridge();
  const table = tables.find((t) => t.number === tableNum);

  const [method, setMethod] = useState<PayMethod>('UPI');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [vacateAfter, setVacateAfter] = useState(true);
  const [settled, setSettled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tickets for table (including merged partner table if merged)
  const tickets = kdsTickets.filter(
    (tk) => tk.tableNumber === tableNum || (table?.mergedWith && tk.tableNumber === table.mergedWith)
  );

  // Gather all ordered items
  const allOrderedItems = useMemo(() => {
    const list: {
      id: string;
      name: string;
      quantity: number;
      price: number;
      totalPrice: number;
      options?: string;
      seatNumber?: number;
      ticketNumber: string;
    }[] = [];

    tickets.forEach((tk) => {
      tk.items.forEach((it) => {
        const fallbackPrice =
          INITIAL_MENU_ITEMS.find((m) => m.name.toLowerCase() === it.name.toLowerCase())?.price || 0;
        const unitPrice = it.price || fallbackPrice;
        list.push({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          price: unitPrice,
          totalPrice: unitPrice * it.quantity,
          options: it.options,
          seatNumber: it.seatNumber || tk.seatNumber,
          ticketNumber: tk.id.slice(-4),
        });
      });
    });

    if (list.length === 0 && table?.activeItems && table.activeItems.length > 0) {
      table.activeItems.forEach((ai, idx) => {
        const fallbackPrice =
          INITIAL_MENU_ITEMS.find((m) => m.name.toLowerCase() === ai.name.toLowerCase())?.price || 0;
        const unitPrice = ai.price || fallbackPrice;
        list.push({
          id: ai.id || `ai-${idx}`,
          name: ai.name,
          quantity: ai.quantity,
          price: unitPrice,
          totalPrice: unitPrice * ai.quantity,
          options: ai.options,
          seatNumber: ai.seatNumber,
          ticketNumber: 'TBL',
        });
      });
    }

    return list;
  }, [tickets, table?.activeItems]);

  const itemsSubtotal = allOrderedItems.reduce((sum, it) => sum + it.totalPrice, 0);
  const subtotal = Math.max(table?.currentBill || 0, itemsSubtotal);
  const cgst = Math.round(subtotal * 0.025);
  const sgst = Math.round(subtotal * 0.025);
  const totalTax = cgst + sgst;
  const grandTotal = subtotal + totalTax;

  const invoiceNumber = useMemo(() => {
    const cleanTbl = tableNum.replace(/[^a-zA-Z0-9]/g, '');
    const stamp = Date.now().toString().slice(-4);
    return `INV-${cleanTbl}-${stamp}`;
  }, [tableNum]);

  const change =
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSettle = () => {
    waiterRecordsPayment(tableNum, method, grandTotal);
    if (vacateAfter) {
      setTimeout(() => waiterVacatesTable(tableNum), 300);
    }
    setSettled(true);
  };

  if (!table) return null;

  // ── SETTLED RECEIPT VIEW ──────────────────────────────────────────────────
  if (settled) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-black text-stone-900 uppercase">
              Settlement Receipt
            </span>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="font-mono text-xs font-black text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl border border-stone-300 transition cursor-pointer"
          >
            Done
          </button>
        </header>

        {/* Success Alert Banner */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-3xl text-center space-y-2 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-black text-emerald-950 font-mono tracking-tight">
              Payment Recorded &amp; Settled!
            </h2>
            <p className="font-mono text-xs font-bold text-emerald-800">
              ₹{grandTotal} collected via {method} for {tableNum}
            </p>
            {customerPhone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 font-mono text-[11px] font-bold text-emerald-900 mt-1">
                <span>📱 Digital bill sent to +91 {customerPhone}</span>
              </div>
            )}
          </div>

          {/* Printable Thermal Receipt Card */}
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
              <div className="pt-1.5 flex items-center justify-between text-[10px] text-stone-600 border-t border-stone-100 mt-2">
                <span>TAX INVOICE: {invoiceNumber}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black border border-emerald-300">
                  PAID
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                <span>Table: {tableNum} ({table.section})</span>
                <span>Server: {table.serverName || 'Captain'}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-1.5 pb-3 border-b border-dashed border-stone-200 text-xs">
              <div className="flex justify-between font-black text-[10px] text-stone-400 uppercase tracking-wider pb-1">
                <span>Item / Particulars</span>
                <span>Amount</span>
              </div>
              {allOrderedItems.length > 0 ? (
                allOrderedItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between text-stone-800 text-[11.5px]">
                    <div>
                      <span className="font-bold">{item.quantity}× {item.name}</span>
                      {item.seatNumber && (
                        <span className="text-[9px] text-stone-400 ml-1.5">[Chair {item.seatNumber}]</span>
                      )}
                      {item.options && (
                        <div className="text-[9.5px] text-stone-400">{item.options}</div>
                      )}
                    </div>
                    <span className="font-bold shrink-0 ml-2">₹{item.totalPrice}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-stone-800 text-[11.5px]">
                  <span className="font-bold">1× Dine-in Food Orders</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
              )}
            </div>

            {/* Taxes & Charges Breakdown */}
            <div className="space-y-1.5 pb-3 border-b border-stone-200 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>CGST (2.5%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>SGST (2.5%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>Total GST (5%):</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-200">
                <span>GRAND TOTAL PAID:</span>
                <span className="text-[#9C3D1E] text-base">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Mode Receipt Proof */}
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-[10.5px]">
              <div className="flex justify-between text-stone-700">
                <span>Payment Mode:</span>
                <span className="font-black text-stone-900">{method}</span>
              </div>
              {method === 'CASH' && typeof cashTendered === 'number' && cashTendered >= grandTotal && (
                <>
                  <div className="flex justify-between text-stone-700">
                    <span>Cash Tendered:</span>
                    <span className="font-bold">₹{cashTendered}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Change Returned:</span>
                    <span>₹{cashTendered - grandTotal}</span>
                  </div>
                </>
              )}
              {customerPhone && (
                <div className="flex justify-between text-stone-700">
                  <span>Customer Mobile:</span>
                  <span className="font-bold">+91 {customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 pt-1 border-t border-stone-200 text-[9.5px]">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold">SETTLED &amp; RECONCILED</span>
              </div>
            </div>

            <div className="text-center text-[9.5px] text-stone-400 pt-1">
              Thank you for dining with Thoogudeepa! Visit Again!
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 pb-6 font-mono">
            <button
              type="button"
              onClick={() => showToast('🖨️ Thermal receipt sent to counter printer')}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Print Thermal Receipt</span>
            </button>

            <button
              type="button"
              onClick={onDone}
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

  // ── ACTIVE SETTLEMENT VIEW ────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans max-w-md mx-auto border-x border-[#EAE5DF] shadow-2xl relative select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#EAE5DF] px-4 py-3 flex items-center justify-between shadow-2xs backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 font-mono text-xs font-bold text-stone-700 hover:text-[#9C3D1E] py-1 px-2.5 -ml-1 rounded-xl bg-stone-50 hover:bg-[#FFF8F5] border border-[#EAE5DF] transition cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Table {tableNum}</span>
        </button>
        <span className="font-mono text-xs font-black text-[#9C3D1E] uppercase tracking-wider">
          Settle Bill
        </span>
      </header>

      {/* Main Form & Bill Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Table & Section Hero */}
        <div className="p-4 bg-white border border-[#EAE5DF] rounded-2xl shadow-xs font-mono">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-[#9C3D1E] font-black uppercase tracking-widest">
                {table.section}
              </p>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                {table.number}
                {table.mergedWith && (
                  <span className="text-stone-400 text-sm font-bold ml-1.5">+ {table.mergedWith}</span>
                )}
              </h1>
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
        </div>

        {/* ── AUTHENTIC RESTAURANT BILL & RECEIPT BREAKDOWN ── */}
        <div className="bg-white border-2 border-dashed border-[#DCD6CE] rounded-3xl p-4 font-mono shadow-xs space-y-3">
          {/* Bill Card Title */}
          <div className="flex items-center justify-between pb-2 border-b border-dashed border-stone-200">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#9C3D1E]" />
              <span className="font-black text-xs text-stone-900 uppercase tracking-wider">
                Official Bill &amp; Tax Breakdown
              </span>
            </div>
            <span className="text-[9.5px] font-bold text-stone-500">
              #{invoiceNumber}
            </span>
          </div>

          {/* Itemized Orders List */}
          <div className="space-y-1.5 pb-2.5 border-b border-dashed border-stone-200 text-xs">
            <div className="flex justify-between font-black text-[9.5px] text-stone-400 uppercase tracking-wider pb-1">
              <span>Item Description</span>
              <span>Amount</span>
            </div>
            {allOrderedItems.length > 0 ? (
              allOrderedItems.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between text-stone-800 text-[11px]">
                  <div>
                    <span className="font-bold">{item.quantity}× {item.name}</span>
                    {item.seatNumber && (
                      <span className="text-[9px] text-[#9C3D1E] ml-1.5 font-semibold">[Chair {item.seatNumber}]</span>
                    )}
                    {item.options && (
                      <div className="text-[9px] text-stone-400">{item.options}</div>
                    )}
                  </div>
                  <span className="font-bold shrink-0 ml-2">₹{item.totalPrice}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-between text-stone-800 text-[11px]">
                <span className="font-bold">1× Dine-in Food Orders</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
            )}
          </div>

          {/* Taxes & GST Computations */}
          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Item Subtotal ({allOrderedItems.reduce((s, i) => s + i.quantity, 0) || 1} items):</span>
              <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>CGST (2.5%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>SGST (2.5%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Total GST (5%):</span>
              <span>₹{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>GRAND TOTAL DUE:</span>
              <span className="text-[#9C3D1E] text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── CUSTOMER MOBILE NUMBER INPUT (WITH FIXED +91 PREFIX) ── */}
        <div className="space-y-1.5 font-mono">
          <label className="flex items-center justify-between text-xs font-black text-stone-700 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#9C3D1E]" />
              <span>Customer Mobile (E-Receipt)</span>
            </span>
            <span className="text-[10px] text-stone-400 font-bold lowercase">
              (optional sms / whatsapp)
            </span>
          </label>
          <div className="relative flex items-center rounded-2xl border-2 border-[#EAE5DF] bg-white shadow-2xs focus-within:border-[#9C3D1E] focus-within:ring-2 focus-within:ring-[#9C3D1E]/20 overflow-hidden transition">
            {/* Fixed +91 Country Code Badge for India */}
            <div className="flex items-center gap-1.5 px-3 py-3 bg-stone-100/90 border-r border-[#EAE5DF] font-mono text-xs font-black text-stone-800 shrink-0 select-none">
              <span className="text-sm">🇮🇳</span>
              <span>+91</span>
            </div>
            {/* Strictly Numeric Input Only */}
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={customerPhone}
              onChange={(e) => {
                // Strictly allow numbers only (no alphabets or symbols)
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
                  GPay • PhonePe • Paytm
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

            {/* Dynamic QR Code Card */}
            <div className="p-4 bg-white rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center space-y-2 shadow-2xs">
              <div className="text-[11px] font-black text-stone-800">
                Scan with any UPI App to Pay ₹{grandTotal}
              </div>
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="Dynamic UPI QR"
                  className="w-44 h-44 rounded-xl border border-stone-200 shadow-xs"
                />
              ) : (
                <div className="w-44 h-44 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs">
                  Generating UPI QR...
                </div>
              )}
              <div className="pt-1 text-[10.5px] text-stone-600 font-bold">
                UPI ID: <span className="text-indigo-800 select-all">thoogudeepa@okicici</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-stone-400">
                <span>Google Pay • PhonePe • Paytm • BHIM • Cred</span>
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-indigo-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isUpiVerified}
                onChange={(e) => setIsUpiVerified(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-700"
              />
              <span className="text-xs font-bold text-indigo-950">
                Customer confirmed UPI transfer on phone
              </span>
            </label>
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
              <span className="text-[10px] text-amber-800 font-bold">
                Bill Due: ₹{grandTotal}
              </span>
            </div>

            {/* Quick Cash Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                grandTotal,
                grandTotal % 100 !== 0 ? Math.ceil(grandTotal / 100) * 100 : null,
                500,
                1000,
                2000,
              ]
                .filter(Boolean)
                .filter((val, i, arr) => arr.indexOf(val) === i && (val as number) >= grandTotal)
                .map((val) => (
                  <button
                    key={val as number}
                    type="button"
                    onClick={() => setCashTendered(val as number)}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-black transition cursor-pointer ${
                      cashTendered === val
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-[#EAE5DF] hover:bg-stone-50'
                    }`}
                  >
                    ₹{val}
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

            {/* Change to Return Calculation */}
            {change !== null && change >= 0 && (
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-300 rounded-xl">
                <div>
                  <span className="font-mono text-xs font-black text-emerald-800 uppercase block">
                    Change to Return:
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Cash ₹{cashTendered} - Bill ₹{grandTotal}
                  </span>
                </div>
                <span className="font-mono text-xl font-black text-emerald-700">
                  ₹{change}
                </span>
              </div>
            )}

            {typeof cashTendered === 'number' && cashTendered > 0 && cashTendered < grandTotal && (
              <div className="flex items-center justify-between px-3 py-2 bg-amber-100 border border-amber-300 rounded-xl text-xs text-amber-900">
                <span>Remaining Due:</span>
                <span className="font-black">₹{grandTotal - cashTendered}</span>
              </div>
            )}
          </div>
        )}

        {/* Vacate Table Guard */}
        <label className="flex items-center gap-3 p-3 bg-white border border-[#EAE5DF] rounded-2xl cursor-pointer font-mono shadow-2xs">
          <input
            type="checkbox"
            checked={vacateAfter}
            onChange={(e) => setVacateAfter(e.target.checked)}
            className="h-4 w-4 rounded accent-[#9C3D1E]"
          />
          <span className="text-xs font-bold text-stone-700">
            Vacate &amp; reset table {tableNum} after settlement
          </span>
        </label>

        {/* ── SETTLEMENT CONFIRMATION ACTION ── */}
        <div className="pt-1 pb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSettle}
            disabled={
              grandTotal === 0 ||
              (method === 'CASH' &&
                typeof cashTendered === 'number' &&
                cashTendered > 0 &&
                cashTendered < grandTotal)
            }
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-mono text-sm font-black flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Confirm &amp; Settle ₹{grandTotal} via {method}</span>
          </motion.button>
        </div>
      </div>
    </main>
  );
}
