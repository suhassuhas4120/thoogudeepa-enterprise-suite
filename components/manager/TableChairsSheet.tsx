"use client";

import React, { useState } from "react";
import { useSharedBridge } from "../../store/useSharedBridge";
import { useManagerStore } from "../../store/useManagerStore";
import {
  X,
  Armchair,
  FileText,
  Utensils,
  Receipt,
  CheckCircle2,
  Printer,
  Trash2,
  ArrowRight,
  Sparkles,
  Clock,
  Users,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  tableNumber: string;
  isModal?: boolean;
  onClose?: () => void;
}

export function getSectionAndCaptain(
  tableNumber: string,
  rawSection?: string,
  rawServer?: string,
) {
  const num =
    parseInt((tableNumber || "").replace(/^(TABLE\s*|T-?)/i, ""), 10) || 1;
  let section = "Section A";
  let captain = "Captain Ramesh";

  if (rawSection) {
    const s = rawSection.toLowerCase();
    if (
      s.includes("section a") ||
      s.includes("sec_a") ||
      s.includes("express") ||
      s.includes("couple")
    ) {
      section = "Section A";
      captain = "Captain Ramesh";
    } else if (
      s.includes("section b") ||
      s.includes("sec_b") ||
      s.includes("main dining")
    ) {
      section = "Section B";
      captain = "Captain Suresh";
    } else if (
      s.includes("section c") ||
      s.includes("sec_c") ||
      s.includes("family")
    ) {
      section = "Section C";
      captain = "Captain Nayana";
    } else if (
      s.includes("section d") ||
      s.includes("sec_d") ||
      s.includes("grand") ||
      s.includes("courtyard")
    ) {
      section = "Section D";
      captain = "Captain Vennela";
    } else if (num <= 8) {
      section = "Section A";
      captain = "Captain Ramesh";
    } else if (num <= 16) {
      section = "Section B";
      captain = "Captain Suresh";
    } else if (num <= 24) {
      section = "Section C";
      captain = "Captain Nayana";
    } else {
      section = "Section D";
      captain = "Captain Vennela";
    }
  } else {
    if (num <= 8) {
      section = "Section A";
      captain = "Captain Ramesh";
    } else if (num <= 16) {
      section = "Section B";
      captain = "Captain Suresh";
    } else if (num <= 24) {
      section = "Section C";
      captain = "Captain Nayana";
    } else {
      section = "Section D";
      captain = "Captain Vennela";
    }
  }

  if (rawServer && rawServer !== "Floor Captain" && rawServer !== "--") {
    const clean = rawServer.replace(/\s*\([^)]*\)/g, "").trim();
    if (clean) {
      captain = clean.startsWith("Captain ") ? clean : `Captain ${clean}`;
    }
  }

  return { section, captain };
}

export function TableChairsSheet({
  tableNumber,
  isModal = false,
  onClose,
}: Props) {
  const { tables, kdsTickets, waiterVacatesTable } = useSharedBridge();
  const { setSelectedTableNumber, setSelectedSeatNumber, setCurrentScreen } =
    useManagerStore();

  const [selectedSeat, setSelectedSeat] = useState<"ALL" | number>("ALL");

  const cleanNum = (s: string) =>
    (s || "").replace(/^(TABLE\s*|T-?)/i, "").trim();
  const targetNum = cleanNum(tableNumber);
  const table = tables.find((t) => cleanNum(t.number) === targetNum) ||
    tables[0] || {
      id: "tbl-01",
      number: tableNumber || "T-01",
      section: "Section A",
      capacity: 4,
      status: "VACANT" as const,
      guestCount: 0,
      seatedTime: "--",
      currentBill: 0,
      serverName: "Captain Ramesh",
      kotCount: 0,
    };

  const { section, captain } = getSectionAndCaptain(
    table.number,
    table.section,
    table.serverName,
  );

  const capacity = table.capacity || 4;
  const isOccupied = table.status === "OCCUPIED";
  const isBilling = table.status === "BILLING";

  // Find all active tickets for this table
  const groupPeers: string[] = table.mergeGroupPeers ?? [table.number];
  const tickets = kdsTickets.filter(
    (tk) =>
      groupPeers.some((peer) => cleanNum(peer) === cleanNum(tk.tableNumber)) &&
      tk.status !== "COMPLETED",
  );

  // Unified items list
  interface ChairItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    options?: string;
    addOns?: string[];
    stage: "PLACED" | "RECEIVED" | "PREPARING" | "READY" | "SERVED";
    seatNumber?: number;
    ticketId: string;
  }

  const allTableOrderedItems: ChairItem[] = [];

  tickets.forEach((tk) => {
    (tk.items || []).forEach((it) => {
      const rawStage = String(it.stage || tk.status || "").toUpperCase();
      const stage: ChairItem["stage"] =
        rawStage === "SERVED"
          ? "SERVED"
          : rawStage === "READY" || rawStage === "PLATED"
            ? "READY"
            : rawStage === "PREPARING" ||
                rawStage === "PREP" ||
                rawStage === "COOKING"
              ? "PREPARING"
              : rawStage === "RECEIVED"
                ? "RECEIVED"
                : "PLACED";

      const seat = it.seatNumber || tk.seatNumber || 1;
      const unitPrice = it.price && it.price > 0 ? it.price : 220;

      allTableOrderedItems.push({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        price: unitPrice,
        totalPrice: unitPrice * it.quantity,
        options: it.options,
        addOns: it.addOns || [],
        stage,
        seatNumber: seat,
        ticketId: tk.id,
      });
    });
  });

  // Fallback to table activeItems if tickets are empty
  if (
    allTableOrderedItems.length === 0 &&
    table.activeItems &&
    table.activeItems.length > 0
  ) {
    table.activeItems.forEach((ai, idx) => {
      const rawStage = String(ai.status || "").toUpperCase();
      const stage: ChairItem["stage"] =
        rawStage === "SERVED"
          ? "SERVED"
          : rawStage === "READY" || rawStage === "PLATED"
            ? "READY"
            : rawStage === "PREPARING" ||
                rawStage === "PREP" ||
                rawStage === "COOKING"
              ? "PREPARING"
              : rawStage === "RECEIVED"
                ? "RECEIVED"
                : "PLACED";

      const seat = ai.seatNumber || 1;
      const unitPrice = ai.price && ai.price > 0 ? ai.price : 220;

      allTableOrderedItems.push({
        id: ai.id || `ai-${idx}`,
        name: ai.name,
        quantity: ai.quantity,
        price: unitPrice,
        totalPrice: unitPrice * ai.quantity,
        options: ai.options,
        stage,
        seatNumber: seat,
        ticketId: "tbl-direct",
      });
    });
  }

  // Occupancy metrics
  const chairsWithOrders = new Set<number>();
  allTableOrderedItems.forEach((it) => {
    if (it.seatNumber) chairsWithOrders.add(it.seatNumber);
  });

  const occupiedGuests = Math.min(
    capacity,
    Math.max(
      chairsWithOrders.size,
      table.guestCount || (isOccupied || isBilling ? 1 : 0),
    ),
  );

  // Filtered items based on selected seat
  const displayedItems =
    selectedSeat === "ALL"
      ? allTableOrderedItems
      : allTableOrderedItems.filter((i) => i.seatNumber === selectedSeat);

  // Pricing calculations
  const itemsSubtotal = displayedItems.reduce(
    (sum, it) => sum + it.totalPrice,
    0,
  );
  const totalTableItemsSubtotal = allTableOrderedItems.reduce(
    (sum, it) => sum + it.totalPrice,
    0,
  );

  const displayedSubtotal =
    itemsSubtotal > 0
      ? itemsSubtotal
      : selectedSeat === "ALL"
        ? Math.round(table.currentBill / 1.05)
        : occupiedGuests > 0 && (isOccupied || isBilling)
          ? Math.round(table.currentBill / 1.05 / Math.max(1, occupiedGuests))
          : 0;

  const displayedTax = Math.round(displayedSubtotal * 0.05);
  const displayedTotal = displayedSubtotal + displayedTax;

  const handleOpenBilling = () => {
    setSelectedTableNumber(table.number);
    setSelectedSeatNumber(selectedSeat);
    setCurrentScreen(3); // Screen 03 Billing & POS
    onClose?.();
  };

  const handlePrintKOT = () => {
    alert(`Thermal Running KOT Printed for Table ${table.number}`);
  };

  const handleVacateTable = () => {
    if (
      confirm(`Vacate Table ${table.number}? This will reset table to vacant.`)
    ) {
      waiterVacatesTable(table.number);
      onClose?.();
    }
  };

  const getStageBadge = (stage: ChairItem["stage"]) => {
    switch (stage) {
      case "SERVED":
        return {
          text: "SERVED",
          cls: "bg-slate-100 text-slate-700 border-slate-300",
        };
      case "READY":
        return {
          text: "READY",
          cls: "bg-emerald-100 text-emerald-800 border-emerald-300",
        };
      case "PREPARING":
        return {
          text: "PREPARING",
          cls: "bg-amber-100 text-amber-800 border-amber-300",
        };
      case "RECEIVED":
        return {
          text: "RECEIVED",
          cls: "bg-blue-100 text-blue-800 border-blue-300",
        };
      default:
        return {
          text: "PLACED",
          cls: "bg-orange-100 text-orange-800 border-orange-300",
        };
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#FAF8F5] font-mono text-slate-900 select-none">
      {/* Table Identity Header */}
      <div className="p-4 bg-white border-b border-[#EAE5DF] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#9C3D1E] text-white flex items-center justify-center font-black shadow-xs">
            <Armchair className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Table {table.number}
              </h2>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-md border uppercase ${
                  isOccupied
                    ? "bg-[#9C3D1E] text-white border-[#9C3D1E]"
                    : isBilling
                      ? "bg-amber-100 text-amber-900 border-amber-400"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {table.status}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-bold mt-0.5">
              {section} • {occupiedGuests}/{capacity} Chairs • {captain}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── INTERACTIVE CHAIR NAVIGATION (IDENTICAL TO WAITER MOBILE) ── */}
      <div className="p-3.5 bg-white border-b border-[#EAE5DF] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Armchair className="h-4 w-4 text-[#9C3D1E]" />
            <span>Select Chair:</span>
          </span>
          <span className="text-xs font-bold text-slate-500">
            {capacity} Total Chairs
          </span>
        </div>

        {/* Rail of Chairs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* All Table Card */}
          <button
            type="button"
            onClick={() => setSelectedSeat("ALL")}
            className={`p-2.5 rounded-xl font-mono text-xs font-black border-2 transition flex flex-col items-center justify-between h-[82px] min-w-[90px] shrink-0 shadow-2xs active:scale-95 ${
              selectedSeat === "ALL"
                ? "bg-stone-900 text-white border-stone-900 ring-2 ring-stone-900/30"
                : "bg-white text-stone-700 border-[#EAE5DF] hover:bg-[#FAF8F5]"
            }`}
          >
            <FileText className="h-4.5 w-4.5 mb-0.5 shrink-0" />
            <span className="truncate w-full text-center">All Table</span>
            <span className="text-[11px] opacity-80 shrink-0 font-black">
              ₹ {table.currentBill}
            </span>
          </button>

          {/* Individual Chairs 1..N */}
          {Array.from({ length: capacity }).map((_, idx) => {
            const seatNum = idx + 1;
            const isSelected = selectedSeat === seatNum;
            const chairItems = allTableOrderedItems.filter(
              (i) => i.seatNumber === seatNum,
            );
            const hasOrders = chairItems.length > 0;
            const isSeated =
              hasOrders ||
              (chairsWithOrders.size === 0 && seatNum <= occupiedGuests);
            const chairSub = chairItems.reduce((s, it) => s + it.totalPrice, 0);
            const chairAmt =
              chairSub > 0
                ? Math.round(chairSub * 1.05)
                : isSeated && table.currentBill > 0
                  ? Math.round(table.currentBill / Math.max(1, occupiedGuests))
                  : 0;

            const hasReadyItem = chairItems.some((i) => i.stage === "READY");

            return (
              <button
                key={seatNum}
                type="button"
                onClick={() => setSelectedSeat(seatNum)}
                className={`p-2.5 rounded-xl font-mono text-xs font-black border-2 transition-all active:scale-95 flex flex-col items-center justify-between h-[82px] min-w-[90px] shrink-0 relative select-none shadow-2xs ${
                  isSelected
                    ? "bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-sm ring-2 ring-[#9C3D1E]/40"
                    : hasOrders
                      ? "bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200"
                      : isSeated
                        ? "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                        : "bg-white text-slate-400 border-dashed border-slate-300 hover:bg-[#FAF8F5]"
                }`}
              >
                {hasReadyItem && (
                  <span className="absolute -top-1 -left-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                )}

                <div className="flex items-center gap-1.5">
                  <Armchair className="h-4 w-4" />
                  <span>Chair {seatNum}</span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-black uppercase truncate max-w-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : hasOrders
                        ? "bg-amber-200 text-amber-900"
                        : isSeated
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {hasOrders ? "Ordered" : isSeated ? "Seated" : "Available"}
                </span>

                <span className="text-[11px] opacity-80 shrink-0 font-black">
                  {chairAmt > 0 ? `₹ ${chairAmt}` : "--"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Chair / All Table Breakdown Header */}
      <div className="px-4 py-2.5 bg-white border-b border-[#EAE5DF] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-black text-slate-900 uppercase tracking-wide truncate">
            {selectedSeat === "ALL"
              ? "Table Orders"
              : `Chair ${selectedSeat} Breakdown`}
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
            {displayedItems.reduce((s, i) => s + i.quantity, 0)} {displayedItems.reduce((s, i) => s + i.quantity, 0) === 1 ? "item" : "items"}
          </span>
        </div>
        <button
          onClick={handleOpenBilling}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9C3D1E] hover:bg-orange-700 text-white font-mono text-xs font-black transition shadow-xs hover:shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Items</span>
        </button>
      </div>

      {/* Dishes List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5 min-h-0">
        {displayedItems.length > 0 ? (
          displayedItems.map((item, idx) => {
            const badge = getStageBadge(item.stage);
            return (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-orange-700 text-sm shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {item.name}
                    </span>
                    {item.seatNumber && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                        Chair {item.seatNumber}
                      </span>
                    )}
                  </div>
                  {item.options && (
                    <div className="text-xs text-slate-600 mt-1 truncate">
                      Choice: {item.options}
                    </div>
                  )}
                  {item.addOns && item.addOns.length > 0 && (
                    <div className="text-xs text-slate-600 truncate">
                      Add-ons: {item.addOns.join(", ")}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-md border ${badge.cls}`}
                  >
                    {badge.text}
                  </span>
                  <span className="font-mono text-sm font-black text-slate-900 min-w-[65px] text-right">
                    ₹ {item.totalPrice}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Armchair className="h-9 w-9 text-slate-300" />
            <p className="font-bold text-sm text-slate-600">
              {selectedSeat === "ALL"
                ? "No items ordered"
                : `No active orders for Chair ${selectedSeat}`}
            </p>
            <button
              onClick={handleOpenBilling}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9C3D1E] hover:bg-orange-700 text-white font-mono text-xs font-black transition shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Items</span>
            </button>
          </div>
        )}
      </div>

      {/* Bill & Actions Footer */}
      <div className="p-4 bg-white border-t border-[#EAE5DF] space-y-3 shrink-0">
        {/* Bill Summary */}
        {selectedSeat === "ALL" ? (
          <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-xs flex items-center justify-between font-mono">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
                  TOTAL TABLE BILL
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  INC. 5% GST
                </span>
              </div>
              <div className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-2">
                <span>Subtotal: ₹{displayedSubtotal}</span>
                <span>•</span>
                <span>GST (5%): ₹{displayedTax}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 block tracking-tight">
                ₹ {displayedTotal}.00
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-orange-50/80 rounded-xl border-2 border-orange-300 shadow-xs flex items-center justify-between font-mono ring-2 ring-orange-300/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-orange-950 tracking-wide flex items-center gap-1.5">
                  <Armchair className="h-4 w-4 text-[#9C3D1E]" />
                  CHAIR {selectedSeat} BILL
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-200 text-orange-900 border border-orange-300">
                  INC. 5% GST
                </span>
              </div>
              <div className="text-xs font-bold text-orange-900/80 mt-1 flex items-center gap-2">
                <span>Subtotal: ₹{displayedSubtotal}</span>
                <span>•</span>
                <span>GST (5%): ₹{displayedTax}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-orange-950 block tracking-tight">
                ₹ {displayedTotal}.00
              </span>
            </div>
          </div>
        )}

        {/* Buttons Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleOpenBilling}
            className="col-span-1 bg-[#9C3D1E] hover:bg-orange-700 text-white font-mono text-xs md:text-sm font-black py-3 px-3 rounded-xl transition shadow-xs hover:shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>POS Bill</span>
          </button>
          <button
            onClick={handlePrintKOT}
            className="col-span-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-mono text-xs md:text-sm font-bold py-3 px-3 rounded-xl transition shadow-xs hover:shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print KOT</span>
          </button>
          <button
            onClick={handleVacateTable}
            className="col-span-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono text-xs md:text-sm font-bold py-3 px-3 rounded-xl transition shadow-xs hover:shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Vacate</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl border border-[#EAE5DF] overflow-hidden shadow-xs flex flex-col">
      {content}
    </div>
  );
}
