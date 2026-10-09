'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Printer,
  FileText,
  ArrowRight,
  UtensilsCrossed,
  Split,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useCustomer } from '../../context/CustomerContext';
import QRCode from 'qrcode';

interface Props {
  tableNum: string;
  selectedChair?: 'ALL' | number | string;
  onSwitchToMenu: () => void;
  onDone: () => void;
  onOpenSplit?: () => void;
  splitAmount?: number;
  splitLabel?: string;
}

type PayMethod = 'UPI' | 'CASH' | 'CARD';

export function TabletPaymentPanel({
  tableNum,
  selectedChair,
  onSwitchToMenu,
  onDone,
  onOpenSplit,
  splitAmount,
  splitLabel,
}: Props) {
  const { tables, kdsTickets, waiterRecordsPayment, waiterVacatesTable, recordSettledBill } = useSharedBridge();
  const { cart } = useCustomer();
  const table = tables.find((t) => t.number === tableNum);

  const [method, setMethod] = useState<PayMethod>('UPI');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [vacateAfter, setVacateAfter] = useState(!splitAmount);
  const [settled, setSettled] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [qrEnlarged, setQrEnlarged] = useState(false);
  const [qrScale, setQrScale] = useState(1);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  // ── Swipe to change payment method ──
  const swipeStartX = useRef<number | null>(null);
  const METHODS: PayMethod[] = ['UPI', 'CASH', 'CARD'];
  const onMethodSwipeStart = (e: React.TouchEvent) => { swipeStartX.current = e.touches[0].clientX; };
  const onMethodSwipeEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const dx = swipeStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 55) {
      setMethod((prev) => {
        const idx = METHODS.indexOf(prev);
        return dx > 0 ? METHODS[(idx + 1) % 3] : METHODS[(idx + 2) % 3];
      });
    }
    swipeStartX.current = null;
  };
  // ── Pinch to zoom QR ──
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const onQrTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist.current = Math.hypot(dx, dy);
      pinchStartScale.current = qrScale;
    }
  };
  const onQrTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchStartDist.current;
      setQrScale(Math.min(2.5, Math.max(1, pinchStartScale.current * ratio)));
    }
  };
  const onQrTouchEnd = () => { pinchStartDist.current = null; };

  // ── Group peers & unified orders computation ──
  const groupPeers = table?.mergeGroupPeers || (table?.mergedWith ? [tableNum, table.mergedWith] : [tableNum]);
  const tickets = kdsTickets.filter((tk) => groupPeers.includes(tk.tableNumber));
  const allFiredItems = tickets.flatMap((tk) => tk.items.map((it) => ({ ...it, tableNum: tk.tableNumber })));
  const allDraftItems = cart.filter((c) => !c.tableNumber || groupPeers.includes(c.tableNumber));

  const isVacant = table?.status === 'VACANT';

const totalTableFiredSubtotal = allFiredItems.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
  const totalTableDraftSubtotal = allDraftItems.reduce((s, it) => s + it.totalPrice, 0);
  const totalTableBill = Math.max(table?.currentBill || 0, totalTableFiredSubtotal) + totalTableDraftSubtotal;

  let effectiveBill = 0;
  let targetLabel = 'All Seats';

  if (splitAmount) {
    effectiveBill = splitAmount;
    targetLabel = splitLabel || 'Split Bill';
  } else if (selectedChair && selectedChair !== 'ALL') {
    const targetSeats: number[] =
      typeof selectedChair === 'number'
        ? [selectedChair]
        : typeof selectedChair === 'string' && table?.mergedSeatGroups?.[selectedChair]
        ? table.mergedSeatGroups[selectedChair]
        : [];

    targetLabel = typeof selectedChair === 'number' ? `Chair ${selectedChair}` : String(selectedChair);

    const chairFired = allFiredItems.filter((it) => it.seatNumber && targetSeats.includes(it.seatNumber));
    const chairDraft = allDraftItems.filter((c) => c.seatNumber && targetSeats.includes(c.seatNumber));

    const chairFiredSub = chairFired.reduce((s, it) => s + (it.price || 0) * it.quantity, 0);
    const chairDraftSub = chairDraft.reduce((s, it) => s + it.totalPrice, 0);
    const chairTotal = chairFiredSub + chairDraftSub;

    if (chairTotal > 0) {
      effectiveBill = chairTotal;
    } else if (totalTableBill > 0 && allFiredItems.length === 0 && allDraftItems.length === 0) {
      const guestCount = Math.max(1, table?.guestCount || table?.capacity || 1);
      effectiveBill = Math.round(totalTableBill / guestCount);
    } else {
      effectiveBill = 0;
    }
  } else {
    effectiveBill = totalTableBill;
    targetLabel = 'All Seats';
  }

  const bill = effectiveBill;
  const subtotal = Math.round(bill / 1.05);
  const totalTax = Math.max(0, bill - subtotal);
  const cgst = (totalTax / 2).toFixed(2);
  const sgst = (totalTax / 2).toFixed(2);

  // ── Generate real dynamic UPI QR code whenever method, table or bill changes ──
  useEffect(() => {
    if (method !== 'UPI' || !table) return;
    const upiUri = `upi://pay?pa=thoogudeepa@okicici&pn=Thoogudeepa%20Donne%20Biryani&am=${bill.toFixed(2)}&cu=INR&tn=Table_${tableNum}_Bill`;
    QRCode.toDataURL(upiUri, { width: 240, margin: 1 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate UPI QR code:', err));
  }, [method, table, tableNum, bill]);

  if (!table) return null;

  // Dynamic cash presets tailored to the bill amount
  const cashPresets = useMemo(() => {
    if (bill <= 0) return [100, 200, 500];
    const base = Math.ceil(bill / 50) * 50;
    const presets = new Set<number>();
    presets.add(bill);
    if (base > bill) presets.add(base);
    presets.add(Math.ceil(bill / 100) * 100);
    presets.add(Math.ceil(bill / 500) * 500 || 500);
    if (bill > 500) presets.add(Math.ceil(bill / 1000) * 1000 || 1000);
    return Array.from(presets)
      .filter((v) => v >= bill)
      .sort((a, b) => a - b)
      .slice(0, 4);
  }, [bill]);

  const change =
    method === 'CASH' && typeof cashTendered === 'number' && cashTendered >= bill
      ? cashTendered - bill
      : 0;

  const isSettleDisabled =
    bill <= 0 ||
    (method === 'UPI' && !isUpiVerified) ||
    (method === 'CASH' && (cashTendered === '' || Number(cashTendered) < bill));

  const handleSettle = () => {
    if (isSettleDisabled) return;

    const splitSeatNum = typeof selectedChair === 'number'
      ? selectedChair
      : (splitLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(splitLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const relevantItems = (allFiredItems.length > 0 ? allFiredItems : allDraftItems)
      .filter((it: any) => !splitSeatNum || it.seatNumber === splitSeatNum);

    const snapshotItems = relevantItems.length > 0
      ? relevantItems.map((it: any, idx: number) => ({
          id: it.id || `item-${idx}`,
          name: it.name || it.menuItem?.name || 'Item',
          quantity: it.quantity || 1,
          price: it.price || it.menuItem?.price || Math.round(subtotal / relevantItems.length),
          totalPrice: (it.price || it.menuItem?.price || Math.round(subtotal / relevantItems.length)) * (it.quantity || 1),
          seatNumber: it.seatNumber,
        }))
      : [
          {
            id: `item-${Date.now()}`,
            name: `${tableNum} Dine-in Food Service`,
            quantity: 1,
            price: subtotal,
            totalPrice: subtotal,
            seatNumber: splitSeatNum,
          },
        ];

    const cleanTbl = tableNum.replace(/^(TABLE\s*|T-?)/i, '').trim();
    const invoiceNumber = `INV-${cleanTbl.padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    recordSettledBill({
      invoiceNumber,
      tableName: tableNum,
      section: table?.section || 'Main Dining Hall',
      guestCount: splitSeatNum ? 1 : table?.guestCount || table?.capacity || 1,
      formattedDate,
      formattedTime,
      captainName: 'Floor Captain',
      method,
      subtotal,
      totalTax,
      cgst: Number(cgst),
      sgst: Number(sgst),
      grandTotal: bill,
      cashTendered: method === 'CASH' && typeof cashTendered === 'number' ? cashTendered : undefined,
      cashChange: method === 'CASH' ? change : undefined,
      items: snapshotItems,
      seatNumber: splitSeatNum,
      seatLabel: targetLabel,
    });

    waiterRecordsPayment(tableNum, method, bill, splitSeatNum);

    setSettled(true);
    setTimeout(() => {
      if (vacateAfter && !splitAmount && !splitSeatNum) {
        waiterVacatesTable(tableNum);
      }
      setSettled(false);
      setCashTendered('');
      setIsUpiVerified(false);
      setMethod('UPI');
      onDone();
    }, 1500);
  };

  const handlePrintBill = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#FAF8F5] relative select-none font-sans">
      {/* ── Top Header - Crisp & High Visibility ── */}
      <div className="px-5 py-4 bg-white border-b-2 border-stone-200 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase tracking-widest text-[#9C3D1E]">
              Cashier Settlement
            </span>
            {splitLabel && (
              <span className="font-mono text-xs font-black bg-amber-300 text-amber-950 px-2 py-0.5 rounded-md uppercase">
                {splitLabel}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-stone-950 tracking-tight mt-0.5 font-mono">
            {tableNum}
            {selectedChair && selectedChair !== 'ALL' && (
              <span className="text-stone-600 font-bold text-sm ml-2">
                ({targetLabel})
              </span>
            )}
          </h2>
        </div>

        {/* Amount Due & Add Dishes Switcher */}
        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <p className="font-mono text-xs font-black text-stone-500 uppercase tracking-wider">
              Amount Due
            </p>
            <p className="font-mono text-2xl font-black text-[#9C3D1E]">
              ₹{bill.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToMenu}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-xl font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs active:scale-98"
          >
            <UtensilsCrossed className="h-4 w-4 stroke-[2.4]" />
            <span>Add Dishes</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono">
        {settled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4"
          >
            <div className="h-24 w-24 bg-emerald-100 border-2 border-emerald-300 rounded-3xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="h-14 w-14 text-emerald-600 stroke-[2.4]" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">
                Payment Successfully Recorded
              </p>
              <h3 className="text-3xl font-black text-stone-950 mt-1 font-mono">{tableNum}</h3>
              <p className="text-2xl font-black text-[#9C3D1E] mt-2 font-mono">
                ₹{bill.toFixed(2)} via {method}
              </p>
              {vacateAfter && !splitAmount && (
                <p className="text-xs text-stone-600 mt-2 font-bold">
                  Table marked vacant and ready for clean &amp; reset.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Bill Subtotal & Tax Breakdown Card */}
            <div className="p-4 bg-white border-2 border-stone-200 rounded-2xl shadow-2xs space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-700 font-bold">
                <span>Food &amp; Beverage Subtotal:</span>
                <span className="font-black text-stone-950 text-sm">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600 font-bold text-xs">
                <span>CGST (2.5%) + SGST (2.5%):</span>
                <span>
                  ₹{cgst} + ₹{sgst}
                </span>
              </div>
              <div className="flex items-center justify-between font-black text-stone-950 pt-2 border-t-2 border-dashed border-stone-200 text-base">
                <span>Total Payable:</span>
                <span className="text-xl text-[#9C3D1E]">₹{bill.toFixed(2)}</span>
              </div>
            </div>


            {/* Split bill trigger if needed */}
            {onOpenSplit && !splitAmount && bill > 0 && (
              <div className="flex items-center justify-between p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <Split className="h-4.5 w-4.5 text-amber-800 stroke-[2.4]" />
                  <span className="text-xs font-black text-amber-950">
                    Split bill across guests or chairs?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onOpenSplit}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black tracking-wider transition cursor-pointer"
                >
                  Split Check
                </button>
              </div>
            )}

            {/* Payment Method Selector — supports horizontal swipe to cycle modes */}
            <div>
              <p className="text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                Select Payment Mode
              </p>
              <div
                onTouchStart={onMethodSwipeStart}
                onTouchEnd={onMethodSwipeEnd}
                className="grid grid-cols-3 gap-2.5 touch-pan-y"
              >
                {[
                  { id: 'UPI', label: 'UPI QR', icon: QrCode },
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'CARD', label: 'Card POS', icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id as PayMethod)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition cursor-pointer select-none ${
                        isSelected
                          ? 'border-[#9C3D1E] bg-[#FFF8F5] text-[#9C3D1E] shadow-xs'
                          : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-1.5 stroke-[2.2]" />
                      <span className="text-xs font-black">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Details */}
            {method === 'UPI' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white border-2 border-stone-200 rounded-2xl space-y-3"
              >
                {/* QR Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 stroke-[2.4]" />
                    <span className="text-xs font-black text-stone-900">
                      Dynamic UPI QR — Table {tableNum}
                    </span>
                  </div>
                  <span className="text-[10.5px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    Live
                  </span>
                </div>

                {/* Dynamic UPI QR Code Image — tap to enlarge or pinch to zoom */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    onTouchStart={onQrTouchStart}
                    onTouchMove={onQrTouchMove}
                    onTouchEnd={onQrTouchEnd}
                    className="overflow-hidden p-3 rounded-2xl border-2 border-stone-200 bg-white shadow-sm flex items-center justify-center min-w-[210px] min-h-[210px]"
                  >
                    {qrCodeUrl ? (
                      <button
                        type="button"
                        title="Tap to enlarge QR"
                        onClick={() => setQrEnlarged(true)}
                        className="relative group block cursor-zoom-in"
                      >
                        <img
                          src={qrCodeUrl}
                          alt="Dynamic UPI QR"
                          className="w-48 h-48 rounded-xl object-contain block transition-transform duration-150"
                          style={{
                            transform: `scale(${qrScale})`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition rounded-xl">
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-white bg-black/70 px-2.5 py-1 rounded-lg transition shadow-xs">
                            Tap to enlarge
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="w-48 h-48 flex flex-col items-center justify-center text-stone-400 gap-2 font-mono text-xs">
                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="text-stone-600 font-bold">Generating UPI QR...</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center font-mono">
                    <p className="text-xs font-black text-stone-800 tracking-wider">
                      ₹{bill.toFixed(2)} — Scan &amp; Pay
                    </p>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      UPI ID: <span className="font-bold text-indigo-700 select-all">thoogudeepa@okicici</span>
                    </p>
                  </div>
                </div>

                {/* Verified checkbox */}
                <label className="flex items-center gap-3 p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUpiVerified}
                    onChange={(e) => setIsUpiVerified(e.target.checked)}
                    className="h-5 w-5 rounded accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs font-black text-emerald-950">
                    Soundbox Confirmation / Payment Received
                  </span>
                </label>
              </motion.div>
            )}

            {method === 'CASH' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white border-2 border-stone-200 rounded-2xl space-y-3"
              >
                <div>
                  <label className="text-xs font-black text-stone-700 uppercase tracking-wider block mb-1.5">
                    Cash Tendered from Customer (₹)
                  </label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) =>
                      setCashTendered(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder={`Enter amount (≥ ₹${bill})`}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border-2 border-stone-300 focus:border-[#9C3D1E] rounded-xl text-base font-black focus:outline-none"
                  />
                </div>

                {/* Cash Presets */}
                <div className="flex gap-2 flex-wrap">
                  {cashPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCashTendered(preset)}
                      className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                        cashTendered === preset
                          ? 'border-[#9C3D1E] bg-[#9C3D1E] text-white shadow-xs'
                          : 'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>

                {typeof cashTendered === 'number' && cashTendered >= bill && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-xs font-black text-emerald-950">
                    <span>Return Change:</span>
                    <span className="text-base text-emerald-800">₹{change.toFixed(2)}</span>
                  </div>
                )}
                {typeof cashTendered === 'number' && cashTendered < bill && (
                  <p className="text-xs font-black text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 stroke-[2.4]" />
                    <span>Short by ₹{(bill - cashTendered).toFixed(2)}</span>
                  </p>
                )}
              </motion.div>
            )}

            {method === 'CARD' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white border-2 border-stone-200 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600 stroke-[2.4]" />
                  <span className="font-black text-stone-900">
                    Physical Card POS Authorization
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-bold">
                  Insert/Tap card on terminal for ₹{bill.toFixed(2)}. Verify approved transaction slip.
                </p>
              </motion.div>
            )}

            {/* Vacate & Reset checkbox */}
            {!splitAmount && (
              <label className="flex items-center gap-3 p-3.5 bg-white border-2 border-stone-200 rounded-2xl cursor-pointer shadow-2xs">
                <input
                  type="checkbox"
                  checked={vacateAfter}
                  onChange={(e) => setVacateAfter(e.target.checked)}
                  className="h-5 w-5 rounded accent-[#9C3D1E] cursor-pointer"
                />
                <span className="text-xs font-black text-stone-800">
                  Vacate &amp; reset table immediately after payment completion
                </span>
              </label>
            )}
          </>
        )}
      </div>

      {/* ── Bottom Action Bar ── */}
      {!settled && (
        <div className="p-4 bg-white border-t-2 border-stone-200 shrink-0 flex gap-2.5 shadow-sm">
          <button
            type="button"
            onClick={handlePrintBill}
            className="px-4 py-3.5 rounded-2xl border-2 border-stone-300 hover:bg-stone-100 font-mono text-xs font-black text-stone-800 flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <Printer className="h-4 w-4 stroke-[2.4]" />
            <span>{printed ? 'Printed!' : 'Print Bill'}</span>
          </button>

          <button
            type="button"
            onClick={handleSettle}
            disabled={isSettleDisabled}
            className={`flex-1 py-3.5 px-5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              isSettleDisabled
                ? 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
            }`}
          >
            <CheckCircle2 className="h-5 w-5 stroke-[2.4]" />
            <span>Complete Settlement (₹{bill.toFixed(2)})</span>
          </button>
        </div>
      )}

      {/* ── Enlarged QR Overlay ── */}
      <AnimatePresence>
        {qrEnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setQrEnlarged(false)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-black text-stone-900">
                  Scan &amp; Pay — Table {tableNum}
                </span>
                <button
                  type="button"
                  onClick={() => setQrEnlarged(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 font-black text-stone-700 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {/* Large QR image */}
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Fullscreen"
                  className="w-72 h-72 rounded-2xl border-2 border-stone-200 shadow-md p-2 bg-white object-contain"
                />
              ) : (
                <div className="w-72 h-72 flex items-center justify-center text-stone-400">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              )}
              <p className="text-2xl font-black text-stone-950 font-mono">
                ₹{bill.toFixed(2)}
              </p>
              <p className="text-xs font-bold text-stone-500 text-center max-w-[220px]">
                Scan with any UPI app — Google Pay, PhonePe, Paytm
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
