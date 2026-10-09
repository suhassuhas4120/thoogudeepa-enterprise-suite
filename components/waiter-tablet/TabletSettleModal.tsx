'use client';

import React, { useState, useMemo } from 'react';
import { X, CreditCard, QrCode, Banknote, CheckCircle2, ShieldCheck, Printer, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  tableNum: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  splitAmount?: number;
  splitLabel?: string;
}

type PayMethod = 'CASH' | 'UPI' | 'CARD';

export function TabletSettleModal({ tableNum, open, onClose, onDone, splitAmount, splitLabel }: Props) {
  const { tables, kdsTickets, waiterRecordsPayment, waiterVacatesTable, recordSettledBill } = useSharedBridge();
  const table = tables.find((t) => t.number === tableNum);

  const [method, setMethod] = useState<PayMethod>('UPI');
  const [cashTendered, setCashTendered] = useState<number | ''>('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [vacateAfter, setVacateAfter] = useState(!splitAmount);
  const [settled, setSettled] = useState(false);

  if (!table) return null;

  const fullBill = table.currentBill || 0;
  const bill = splitAmount ? splitAmount : fullBill;
  const subtotal = Math.round(bill / 1.05);
  const totalTax = bill - subtotal;
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

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
    return Array.from(presets).filter((v) => v >= bill).sort((a, b) => a - b).slice(0, 4);
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

    const splitSeatNum = splitLabel?.match(/(?:Chair|Seat)\s*(\d+)/i)
      ? Number(splitLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1])
      : undefined;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
    const matchingTickets = (kdsTickets || []).filter(
      (tk) => cleanNum(tk.tableNumber) === cleanNum(tableNum)
    );
    const allItems = matchingTickets.flatMap((tk) => tk.items || []);
    const relevantItems = allItems.filter((it: any) => !splitSeatNum || it.seatNumber === splitSeatNum);

    const snapshotItems = relevantItems.length > 0
      ? relevantItems.map((it: any, idx: number) => ({
          id: it.id || `item-${idx}`,
          name: it.name || 'Item',
          quantity: it.quantity || 1,
          price: it.price || Math.round(subtotal / relevantItems.length),
          totalPrice: (it.price || Math.round(subtotal / relevantItems.length)) * (it.quantity || 1),
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

    const cleanTbl = cleanNum(tableNum);
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
      cgst,
      sgst,
      grandTotal: bill,
      cashTendered: method === 'CASH' && typeof cashTendered === 'number' ? cashTendered : undefined,
      cashChange: method === 'CASH' ? change : undefined,
      items: snapshotItems,
      seatNumber: splitSeatNum,
      seatLabel: splitLabel || 'All Seats',
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="settle-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            key="settle-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            className="relative w-[480px] max-w-full bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 overflow-hidden font-sans"
          >
            {settled ? (
              <div className="p-10 flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                </div>
                <div>
                  <p className="font-mono text-xs font-black text-emerald-700 uppercase tracking-wider">
                    Payment Successfully Recorded
                  </p>
                  <h3 className="text-2xl font-black text-stone-900 mt-1">{tableNum}</h3>
                  <p className="font-mono text-lg font-bold text-stone-700 mt-1">
                    ₹{bill.toFixed(2)} via {method}
                  </p>
                  {splitLabel && (
                    <span className="inline-block mt-2 font-mono text-[11px] font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                      {splitLabel}
                    </span>
                  )}
                  {vacateAfter && !splitAmount && (
                    <p className="font-mono text-xs text-stone-500 mt-2">
                      Table marked for cleaning and reset.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[10px] font-black text-[#9C3D1E] uppercase tracking-widest">
                        Terminal Cashier Settlement
                      </p>
                      {splitLabel && (
                        <span className="font-mono text-[9px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase">
                          Split Check
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-stone-900 mt-0.5">
                      TABLE {tableNum} {splitLabel ? `(${splitLabel})` : ''}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] text-stone-500 uppercase">Amount Due</p>
                    <p className="font-mono text-2xl font-black text-[#9C3D1E]">₹{bill.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-3 p-2 bg-white hover:bg-stone-200 border border-[#EAE5DF] rounded-xl transition cursor-pointer"
                  >
                    <X className="h-4 w-4 text-stone-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4 font-mono">
                  {/* Tax Breakdown Mini Card */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Food &amp; Beverage Subtotal:</span>
                      <span className="font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>CGST (2.5%) + SGST (2.5%):</span>
                      <span>₹{cgst.toFixed(2)} + ₹{sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-stone-900 pt-1 border-t border-stone-200 text-sm">
                      <span>Total Payable:</span>
                      <span className="text-[#9C3D1E]">₹{bill.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <p className="text-[11px] font-black text-stone-700 uppercase tracking-wider mb-2">
                      Select Payment Method:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'UPI',  icon: <QrCode className="h-4 w-4" />,   label: 'UPI QR' },
                        { id: 'CASH', icon: <Banknote className="h-4 w-4" />, label: 'Cash' },
                        { id: 'CARD', icon: <CreditCard className="h-4 w-4" />, label: 'Card POS' },
                      ] as { id: PayMethod; icon: React.ReactNode; label: string }[]).map(({ id, icon, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setMethod(id)}
                          className={`py-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                            method === id
                              ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900/20'
                              : 'bg-[#FAF8F5] border-[#EAE5DF] hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          {icon}
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method Specific UI */}
                  {method === 'UPI' && (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs">
                        <QrCode className="h-4 w-4 text-emerald-700" />
                        <span>Dynamic UPI / Soundbox Verification</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Ask guest to scan Table QR or Captain handheld scanner for ₹{bill.toFixed(2)}.
                      </p>
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isUpiVerified}
                          onChange={(e) => setIsUpiVerified(e.target.checked)}
                          className="h-4 w-4 accent-emerald-600 rounded"
                        />
                        <span className="text-xs font-bold text-emerald-950">
                          Payment confirmed on Soundbox / Mobile App
                        </span>
                      </label>
                    </div>
                  )}

                  {method === 'CASH' && (
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-stone-700">Quick Cash Presets:</span>
                        {typeof change === 'number' && change >= 0 && (
                          <span className="font-black text-emerald-700">
                            Change Due: ₹{change.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {cashPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCashTendered(preset)}
                            className={`flex-1 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                              cashTendered === preset
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
                            }`}
                          >
                            ₹{preset}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-600">Tendered:</span>
                        <input
                          type="number"
                          placeholder={`Min ₹${bill}`}
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value === '' ? '' : Number(e.target.value))}
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {method === 'CARD' && (
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center gap-2 text-blue-900 font-black">
                        <CreditCard className="h-4 w-4" />
                        <span>Card Swipe / Tap on POS Terminal</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Swipe or tap guest card on the handheld POS machine. Enter ₹{bill.toFixed(2)}.
                      </p>
                    </div>
                  )}

                  {/* Vacate Table Checkbox (if full bill) */}
                  {!splitAmount && (
                    <label className="flex items-center gap-2.5 px-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={vacateAfter}
                        onChange={(e) => setVacateAfter(e.target.checked)}
                        className="h-4 w-4 accent-[#9C3D1E] rounded"
                      />
                      <span className="text-xs text-stone-700 font-bold">
                        Automatically mark Table {tableNum} as Vacant &amp; Clean after payment
                      </span>
                    </label>
                  )}

                  {/* Settle Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSettleDisabled}
                      onClick={handleSettle}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-mono text-xs font-black shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        Confirm ₹{bill.toFixed(2)} Payment ({method})
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
