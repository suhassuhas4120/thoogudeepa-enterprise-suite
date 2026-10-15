"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Users,
  Clock,
  Armchair,
  Utensils,
  Flame,
  ShoppingBag,
  Plus,
  CreditCard,
  Link2,
  UserX,
  Split,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { useSharedBridge, SharedTable } from "../../store/useSharedBridge";
import { useCustomer } from "../../context/CustomerContext";
import { formatSectionName } from "./TabletFloorMap";

interface Props {
  tableNum: string;
  selectedChair: "ALL" | number | string;
  onSelectChair: (c: "ALL" | number | string) => void;
  onBackToFloor: () => void;
  onAddDishes: (chairNum?: number) => void;
  onSettle: () => void;
  onSeatGuests: () => void;
  onSplit: () => void;
  onMerge: () => void;
  onVacate: () => void;
  /** Which right panel is currently active — hides the redundant action button */
  activePanelTab?: "menu" | "payment";
}

function statusBadge(status: SharedTable["status"]) {
  switch (status) {
    case "OCCUPIED":
      return "text-white bg-amber-600 border-amber-700 shadow-2xs";
    case "BILLING":
      return "text-white bg-purple-700 border-purple-800 shadow-2xs";
    case "CLEANING":
      return "text-stone-900 bg-stone-300 border-stone-400 shadow-2xs";
    default:
      return "text-white bg-emerald-600 border-emerald-700 shadow-2xs";
  }
}

function StagePill({
  stage,
  onServe,
}: {
  stage: string;
  onServe?: () => void;
}) {
  if (stage === "Received" || stage === "RECEIVED") {
    return (
      <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-sky-100 text-sky-800 border border-sky-300">
        Received
      </span>
    );
  }
  if (stage === "Cooking" || stage === "PREP" || stage === "Preparing") {
    return (
      <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
        Preparing
      </span>
    );
  }
  if (stage === "Ready" || stage === "PLATED" || stage === "READY" || (stage as any) === "ready") {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.stopPropagation();
          onServe?.();
        }}
        className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center gap-1 cursor-pointer transition active:scale-95 border border-emerald-700"
      >
        <span className="text-white">●</span>
        <span>Serve</span>
      </motion.button>
    );
  }
  if (stage === "Served" || stage === "SERVED") {
    return (
      <button
        disabled
        type="button"
        className="px-2.5 py-0.5 rounded-md font-bold uppercase text-[8.5px] bg-stone-100 text-stone-400 border border-stone-300 line-through inline-flex items-center gap-1 shadow-none cursor-not-allowed opacity-75"
      >
        <span className="line-through">Served</span>
      </button>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] bg-stone-100 text-stone-600 border border-stone-200">
      Placed
    </span>
  );
}

function getElapsed(seatedTime: string): number {
  if (!seatedTime || seatedTime === "--") return 0;
  const parts = seatedTime.split(":");
  if (parts.length < 2) return 0;
  const now = new Date();
  const seated = new Date();
  seated.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  let diff = now.getTime() - seated.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round(diff / 60000));
}

function elapsedColor(mins: number) {
  if (mins < 35) return "text-emerald-900 bg-emerald-100 border-emerald-300";
  if (mins < 55) return "text-amber-900 bg-amber-100 border-amber-300";
  return "text-rose-900 bg-rose-100 border-rose-300 animate-pulse font-black";
}

export function TabletTableDetail({
  tableNum,
  selectedChair,
  onSelectChair,
  onBackToFloor,
  onAddDishes,
  onSettle,
  onSeatGuests,
  onSplit,
  onMerge,
  onVacate,
  activePanelTab,
}: Props) {
  const {
    tables,
    kdsTickets,
    pings,
    activeSettlementSessions,
    settledBills,
    waiterVacatesTable,
    waiterRecordsPayment,
    waiterClearsChairAfterPayment,
    recordSettledBill,
    waiterMergeChairs,
    waiterMergeSeatGroup,
    waiterUnmergeSeatGroup,
    waiterSeatsGuests,
    waiterMarkKitchenItemServed,
  } = useSharedBridge();
  const { cart, addToCart } = useCustomer();

  // ── Drag & Drop & Chair Merging State ──
  const [dragOverTarget, setDragOverTarget] = useState<
    "ALL" | number | string | null
  >(null);
  const [dragType, setDragType] = useState<"dish" | "chair" | null>(null);
  const [isPanelDragOver, setIsPanelDragOver] = useState(false);
  const [mergeChairMode, setMergeChairMode] = useState(false);
  const [chairsSelectedForMerge, setChairsSelectedForMerge] = useState<
    number[]
  >([]);

  useEffect(() => {
    let isCancelled = false;
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/settlement/session?tableNumber=${encodeURIComponent(tableNum)}`, { cache: 'no-store' });
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data?.sessions !== undefined || data?.settledBills !== undefined) {
            useSharedBridge.setState((prev) => ({
              activeSettlementSessions: {
                ...(prev.activeSettlementSessions || {}),
                ...(data.sessions || {}),
              },
              settledBills: {
                ...(prev.settledBills || {}),
                ...(data.settledBills || {}),
              },
            }));
          }
        }
      } catch {}
    };

    fetchSession();
    const interval = setInterval(fetchSession, 1000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [tableNum]);

  const table = tables.find((t) => t.number === tableNum);
  if (!table) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-stone-500 font-mono text-sm">
        <Utensils className="h-10 w-10 opacity-40 mb-2 stroke-[2.2]" />
        <span className="font-bold">Table not found</span>
      </div>
    );
  }

  const isVacant = table.status === "VACANT";
  const elapsed = getElapsed(table.seatedTime);
  const groupPeers =
    table.mergeGroupPeers ||
    (table.mergedWith ? [tableNum, table.mergedWith] : [tableNum]);
  const totalCapacity = groupPeers.reduce(
    (s, p) => s + (tables.find((t) => t.number === p)?.capacity || 2),
    0,
  );
  const tickets = isVacant
    ? []
    : kdsTickets.filter((tk) => groupPeers.includes(tk.tableNumber));

  const allItems = tickets.flatMap((tk) =>
    tk.items.map((item) => ({ ...item, tableNum: tk.tableNumber })),
  );

  const allFiredItems = allItems;
  const hasFiredItems = allFiredItems.length > 0;
  const allFoodServed =
    !isVacant &&
    hasFiredItems &&
    allFiredItems.every(
      (it) => it.stage === "SERVED" || (it.stage as string) === "Served",
    );

  const mergedSeatGroups = table.mergedSeatGroups || {};
  const groupSeats = Object.values(mergedSeatGroups).flat();

  // Chairs available
  const chairs = Array.from(
    { length: Math.max(totalCapacity, table.guestCount || 1) },
    (_, i) => i + 1,
  );

  // Scoped draft items from live cart for this table
  const allTableDraftItems = cart.filter(
    (c) => !c.tableNumber || groupPeers.includes(c.tableNumber),
  );
  const allTableDraftSubtotal = allTableDraftItems.reduce(
    (s, it) => s + it.totalPrice,
    0,
  );

  // Table total bill
  const firedSubtotal = allItems.reduce(
    (s, it) => s + (it.price || 0) * it.quantity,
    0,
  );
  const totalTableBill =
    Math.max(table.currentBill || 0, firedSubtotal) + allTableDraftSubtotal;

  // Selected chair's target seats
  const targetSeats: number[] =
    selectedChair === "ALL"
      ? []
      : typeof selectedChair === "number"
        ? [selectedChair]
        : typeof selectedChair === "string" && mergedSeatGroups[selectedChair]
          ? mergedSeatGroups[selectedChair]
          : [];

  const displayItems =
    selectedChair === "ALL"
      ? allItems
      : allItems.filter(
          (it) => it.seatNumber && targetSeats.includes(it.seatNumber),
        );

  const draftItems =
    selectedChair === "ALL"
      ? allTableDraftItems
      : allTableDraftItems.filter(
          (c) => c.seatNumber && targetSeats.includes(c.seatNumber),
        );
  const draftSubtotal = draftItems.reduce((s, it) => s + it.totalPrice, 0);

  // Target chair bill
  let targetChairBill = 0;
  let chairLabel = "Total Bill Due";
  if (selectedChair === "ALL") {
    targetChairBill = totalTableBill;
    chairLabel = "Total Bill Due";
  } else {
    chairLabel =
      typeof selectedChair === "number"
        ? `Chair ${selectedChair} Bill`
        : `${selectedChair} Bill`;
    const chairFiredSub = displayItems.reduce(
      (s, it) => s + (it.price || 0) * it.quantity,
      0,
    );
    const chairTotal = chairFiredSub + draftSubtotal;
    if (chairTotal > 0) {
      targetChairBill = chairTotal;
    } else if (
      totalTableBill > 0 &&
      allItems.length === 0 &&
      allTableDraftSubtotal === 0
    ) {
      const guestCount = Math.max(1, table.guestCount || totalCapacity);
      targetChairBill = Math.round(totalTableBill / guestCount);
    } else {
      targetChairBill = 0;
    }
  }

  // Food serving validation for settlement
  const relevantItems = selectedChair === "ALL" ? allItems : displayItems;
  const relevantDrafts =
    selectedChair === "ALL" ? allTableDraftItems : draftItems;
  const billToSettle =
    selectedChair === "ALL" ? totalTableBill : targetChairBill;

  // Check if customer requested bill / payment settlement (serving food alone does NOT enable settle)
  const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
  const targetNum = cleanNum(tableNum);
  const normTable = `T-${String(parseInt(targetNum, 10) || 1).padStart(2, '0')}`;

  const hasCustomerPaymentRequest = (pings || []).some((p) => {
    if (p.status !== 'PENDING') return false;
    if (cleanNum(p.tableNumber) !== targetNum) return false;
    if (p.type !== 'PAYMENT' && p.type !== 'BILL') return false;

    if (selectedChair === 'ALL') {
      return true;
    }
    if (typeof selectedChair === 'number') {
      return p.seatNumber === selectedChair;
    }
    if (typeof selectedChair === 'string' && mergedSeatGroups[selectedChair]) {
      return typeof p.seatNumber === 'number' && mergedSeatGroups[selectedChair].includes(p.seatNumber);
    }
    return false;
  });

  const chairKey = `${normTable}-CHAIR-${selectedChair}`;
  const hasTableVerifiedUpi = Object.entries(activeSettlementSessions || {}).some(
    ([k, sess]) => (k === normTable || k.startsWith(`${normTable}-CHAIR-`)) && sess?.isUpiVerified
  );
  const hasChairVerifiedUpi = Boolean(
    activeSettlementSessions?.[chairKey]?.isUpiVerified ||
    activeSettlementSessions?.[normTable]?.isUpiVerified
  );
  const isCustomerBillRequested = hasCustomerPaymentRequest || hasTableVerifiedUpi || hasChairVerifiedUpi;

  const liveSessionSnapshot =
    activeSettlementSessions?.[chairKey]?.billSnapshot ||
    activeSettlementSessions?.[normTable]?.billSnapshot ||
    Object.entries(activeSettlementSessions || {}).find(
      ([k, sess]) => (k === normTable || k.startsWith(`${normTable}-CHAIR-`)) && sess?.billSnapshot
    )?.[1]?.billSnapshot;

  const effectiveBillToSettle = billToSettle > 0
    ? billToSettle
    : (liveSessionSnapshot?.grandTotal || 0);

  const hasSettledBill = Boolean(
    settledBills?.[chairKey] ||
    settledBills?.[normTable] ||
    Object.entries(settledBills || {}).some(
      ([k, b]) => (k === normTable || k.startsWith(`${normTable}-CHAIR-`))
    )
  );

  const isPaymentDoneViaUpi = Boolean(
    hasTableVerifiedUpi ||
    hasChairVerifiedUpi ||
    hasSettledBill ||
    Object.entries(activeSettlementSessions || {}).some(
      ([k, sess]) => (k === normTable || k.startsWith(`${normTable}-CHAIR-`)) && sess?.isUpiVerified
    )
  );

  const activeChairsWithOrders = Array.from(
    new Set(
      [
        ...allItems.map((i: any) => i.seatNumber),
        ...(table.activeItems || []).map((ai: any) => ai.seatNumber),
      ].filter((s): s is number => typeof s === 'number')
    )
  );

  // Food is only considered served if ordered items exist and ALL of them have reached 'SERVED' stage
  const hasItemsToSettle = relevantItems.length > 0;
  const areAllRelevantItemsServed =
    hasItemsToSettle &&
    relevantItems.every(
      (it) => it.stage === "SERVED" || (it.stage as string) === "Served",
    );

  // Settle is enabled ONLY AFTER:
  // 1. All items have been served
  // 2. Customer has requested bill/settlement (serving dishes alone does NOT enable Settle Bill)
  // 3. No pending drafts, and bill > 0
  const canSettle = isPaymentDoneViaUpi || (
    !isVacant &&
    effectiveBillToSettle > 0 &&
    relevantDrafts.length === 0 &&
    areAllRelevantItemsServed &&
    isCustomerBillRequested
  );

  const handleDirectConfirmAndVacate = () => {
    const finalAmt = Math.round(effectiveBillToSettle > 0 ? effectiveBillToSettle : (targetChairBill || table.currentBill || 26));
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const cleanTbl = tableNum.replace(/^(TABLE\s*|T-?)/i, '').trim();
    const invoiceNumber = `INV-${cleanTbl.padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    const resolvedSeatNum = typeof selectedChair === 'number'
      ? selectedChair
      : (liveSessionSnapshot?.seatNumber || (activeChairsWithOrders.length === 1 ? activeChairsWithOrders[0] : undefined));

    const seatLabel = resolvedSeatNum
      ? `Chair ${resolvedSeatNum}`
      : typeof selectedChair === 'string' && mergedSeatGroups[selectedChair]
      ? `Chairs ${mergedSeatGroups[selectedChair].join(' & ')}`
      : 'All Seats';

    const snapshotItems = liveSessionSnapshot?.items && liveSessionSnapshot.items.length > 0
      ? liveSessionSnapshot.items
      : relevantItems.map((it: any, idx: number) => ({
          id: it.id || `item-${idx}`,
          name: it.name || it.menuItem?.name || 'Item',
          quantity: it.quantity || 1,
          price: it.price || it.menuItem?.price || 0,
          totalPrice: (it.price || it.menuItem?.price || 0) * (it.quantity || 1),
          seatNumber: it.seatNumber,
          ticketNumber: 'TBL',
        }));

    const calcSub = liveSessionSnapshot?.subtotal || Math.round(finalAmt / 1.05);
    const calcTax = liveSessionSnapshot?.totalTax ?? (finalAmt - calcSub);

    recordSettledBill({
      invoiceNumber,
      tableName: tableNum,
      section: formatSectionName(table?.section || '', tableNum),
      guestCount: resolvedSeatNum ? 1 : (table?.guestCount || 1),
      formattedDate,
      formattedTime,
      captainName: 'Floor Captain',
      method: 'UPI',
      subtotal: calcSub,
      totalTax: calcTax,
      cgst: liveSessionSnapshot?.cgst ?? (calcTax / 2),
      sgst: liveSessionSnapshot?.sgst ?? (calcTax / 2),
      grandTotal: finalAmt,
      items: snapshotItems,
      seatNumber: resolvedSeatNum,
      seatLabel,
    });

    waiterRecordsPayment(tableNum, 'UPI', finalAmt, resolvedSeatNum);

    if (resolvedSeatNum !== undefined) {
      waiterClearsChairAfterPayment(tableNum, resolvedSeatNum);
      const remainingChairs = activeChairsWithOrders.filter((c) => c !== resolvedSeatNum);
      if (remainingChairs.length === 0) {
        waiterVacatesTable(tableNum);
        onVacate();
      } else {
        onSelectChair('ALL');
      }
    } else {
      waiterVacatesTable(tableNum);
      onVacate();
    }
  };

  const handleConfirmMergeSelectedChairs = () => {
    if (chairsSelectedForMerge.length < 2) return;
    const sorted = [...chairsSelectedForMerge].sort((a, b) => a - b);
    const groupKey = `Chairs ${sorted.join(" & ")}`;
    waiterMergeSeatGroup(tableNum, groupKey, sorted);
    setMergeChairMode(false);
    setChairsSelectedForMerge([]);
    onSelectChair(groupKey);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if ((window as any).__draggedMenuItem) {
          if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
          if (!isPanelDragOver) setIsPanelDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsPanelDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsPanelDragOver(false);
        const item = (window as any).__draggedMenuItem;
        if (item) {
          (window as any).__draggedMenuItem = null;
          const targetSeat =
            typeof selectedChair === "number"
              ? selectedChair
              : targetSeats.length > 0
                ? targetSeats[0]
                : undefined;
          addToCart(item, undefined, undefined, 1);
          if (isVacant) {
            waiterSeatsGuests(tableNum, 1, "Floor Captain");
          }
        }
      }}
      className="flex flex-col h-full overflow-hidden bg-[#FAF8F5] select-none font-sans relative"
    >
      {/* ── Full Panel Drop Indicator when dragging any dish from Menu ── */}
      {isPanelDragOver && (
        <div className="absolute inset-0 bg-amber-500/15 border-4 border-dashed border-[#9C3D1E] z-40 rounded-none pointer-events-none flex flex-col items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white/95 px-7 py-5 rounded-3xl shadow-2xl border-2 border-[#9C3D1E] flex items-center gap-4 font-mono text-stone-900 animate-pulse">
            <div className="h-12 w-12 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center font-black text-2xl shadow-sm">
              +
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#9C3D1E]">
                Drop anywhere to add dish
              </p>
              <p className="text-base font-black text-stone-900 mt-0.5">
                Adding to{" "}
                {selectedChair === "ALL"
                  ? `Table ${tableNum} (General)`
                  : `${chairLabel}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header with Large Icons & High Visibility ── */}
      <div className="px-5 pt-3.5 pb-3 bg-white border-b-2 border-stone-200 shrink-0 shadow-2xs">
        <button
          type="button"
          onClick={onBackToFloor}
          className="flex items-center gap-1.5 font-mono text-xs font-black text-stone-600 hover:text-[#9C3D1E] transition cursor-pointer mb-2.5 py-1 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 w-fit"
        >
          <ChevronLeft className="h-4 w-4 stroke-[3]" />
          <span>All Tables</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Prominent High-Def Table Icon Badge */}
            <div className="h-13 w-13 rounded-2xl bg-[#9C3D1E] text-white flex items-center justify-center shadow-md shrink-0 border border-amber-400/40">
              <Utensils className="h-7 w-7 text-amber-200 stroke-[2.4]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-3xl font-black text-stone-950 tracking-tight font-mono">
                  {groupPeers.length > 1 ? groupPeers.join(" + ") : tableNum}
                </h2>
                {allFoodServed ? (
                  <span className="px-2.5 py-0.5 rounded-xl border text-xs font-black font-mono uppercase tracking-wider text-emerald-800 bg-emerald-100 border-emerald-300 shadow-2xs">
                    SERVED
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-xl border text-xs font-black font-mono uppercase tracking-wider ${statusBadge(
                      table.status,
                    )}`}
                  >
                    {table.status}
                  </span>
                )}
                {groupPeers.length > 1 && (
                  <span className="px-2.5 py-0.5 rounded-xl bg-indigo-600 text-white text-xs font-black font-mono flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    MERGED TABLE
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-stone-700 mt-1 font-bold">
                {formatSectionName(table.section, table.number)} · Maximum
                Capacity: {totalCapacity} Seats
              </p>
            </div>
          </div>

          {!isVacant && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-stone-900 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-300 font-bold">
                <Users className="h-4 w-4 text-stone-700 stroke-[2.2]" />
                <span>{table.guestCount || totalCapacity} guests</span>
              </div>
              {elapsed > 0 && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${elapsedColor(
                    elapsed,
                  )}`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{elapsed}m</span>
                </div>
              )}
              <div className="text-right pl-2">
                <p className="text-[10px] text-stone-500 uppercase font-black tracking-wider">
                  Total Bill
                </p>
                <p className="font-black text-stone-950 text-xl font-mono">
                  ₹{totalTableBill.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── High Visibility Chair Selector Rail ── */}
      <div className="px-5 py-3 bg-white border-b-2 border-stone-200 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-xs font-black uppercase tracking-wider text-stone-700">
            Select Chair · {totalCapacity} Seats Available
          </p>

          <button
            type="button"
            onClick={() => {
              setMergeChairMode(!mergeChairMode);
              setChairsSelectedForMerge([]);
            }}
            className={`font-mono text-[11px] font-black px-3 py-1 rounded-xl border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              mergeChairMode
                ? "bg-purple-700 text-white border-purple-800"
                : "bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100"
            }`}
          >
            <Link2 className="h-3 w-3" />
            <span>{mergeChairMode ? "Cancel Merge" : "Merge Chairs"}</span>
          </button>
        </div>

        {/* Merge Chair Action Banner */}
        {mergeChairMode && (
          <div className="mb-2.5 p-2.5 bg-purple-50 border-2 border-purple-300 rounded-2xl flex items-center justify-between font-mono text-xs">
            <span className="text-purple-950 font-bold">
              {chairsSelectedForMerge.length === 0
                ? "Tap 2 or more chairs to combine their checks:"
                : `Selected Chairs: ${chairsSelectedForMerge.join(", ")}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChairsSelectedForMerge([])}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-purple-200 font-bold"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={chairsSelectedForMerge.length < 2}
                onClick={handleConfirmMergeSelectedChairs}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-lg font-black shadow-xs flex items-center gap-1"
              >
                <Link2 className="h-3 w-3" />
                <span>Merge ({chairsSelectedForMerge.length})</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-2.5 pb-2 px-1.5 -mt-1.5">
          {/* ALL Seats Button — supports dropping menu dish */}
          <button
            type="button"
            onClick={() => onSelectChair("ALL")}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if ((window as any).__draggedMenuItem) {
                if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
                if (dragOverTarget !== "ALL") {
                  setDragOverTarget("ALL");
                  setDragType("dish");
                }
              }
            }}
            onDragLeave={() => {
              setDragOverTarget(null);
              setDragType(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPanelDragOver(false);
              setDragOverTarget(null);
              setDragType(null);
              const draggedItem = (window as any).__draggedMenuItem;
              if (draggedItem) {
                (window as any).__draggedMenuItem = null;
                addToCart(draggedItem, undefined, undefined, 1);
                if (isVacant) {
                  waiterSeatsGuests(tableNum, 1, "Floor Captain");
                }
                onSelectChair("ALL");
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-3 min-w-[80px] rounded-2xl border-2 font-mono font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
              dragOverTarget === "ALL"
                ? "border-emerald-500 bg-emerald-100 text-emerald-900 ring-4 ring-emerald-300 scale-105 shadow-md"
                : selectedChair === "ALL"
                  ? "bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-sm"
                  : "bg-stone-50 text-stone-800 border-stone-300 hover:bg-stone-100"
            }`}
          >
            <Users className="h-6 w-6 stroke-[2.4]" />
            <span className="text-xs">
              {dragOverTarget === "ALL" ? "+ Drop Dish" : "All Seats"}
            </span>
          </button>

          {/* Merged Chair Groups */}
          {Object.entries(mergedSeatGroups).map(([groupKey, seats]) => {
            const isSelected = selectedChair === groupKey;
            const groupFired = allItems.filter(
              (it) => it.seatNumber && seats.includes(it.seatNumber),
            );
            const groupDraft = allTableDraftItems.filter(
              (c) => c.seatNumber && seats.includes(c.seatNumber),
            );
            const groupSubtotal =
              groupFired.reduce(
                (s, it) => s + (it.price || 0) * it.quantity,
                0,
              ) + groupDraft.reduce((s, it) => s + it.totalPrice, 0);

            return (
              <div key={groupKey} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectChair(groupKey)}
                  className={`flex flex-col items-start justify-between px-3.5 py-2.5 min-w-[105px] h-[82px] rounded-2xl border-2 font-mono font-black transition cursor-pointer ${
                    isSelected
                      ? "bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-300"
                      : "bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1 text-[11px] font-black">
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Group</span>
                    </span>
                    <span
                      className={`text-[10px] ${isSelected ? "opacity-90" : "text-purple-800"}`}
                    >
                      ₹{groupSubtotal}
                    </span>
                  </div>

                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold uppercase truncate max-w-[95px] ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-purple-200 text-purple-900"
                    }`}
                  >
                    {groupKey}
                  </span>
                </button>

                {/* Unmerge chip button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    waiterUnmergeSeatGroup(tableNum, groupKey);
                    onSelectChair("ALL");
                  }}
                  title="Unmerge Chairs"
                  className="absolute -top-2 -right-2 h-6 w-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-20 cursor-pointer transition-transform"
                >
                  <X className="h-3.5 w-3.5 stroke-[3]" />
                </button>
              </div>
            );
          })}

          {/* Individual Chairs (excluding those in merged groups) */}
          {chairs.map((ch) => {
            if (groupSeats.includes(ch)) return null;

            const hasItems = allItems.some((it) => it.seatNumber === ch);
            const hasDraft = allTableDraftItems.some(
              (c) => c.seatNumber === ch,
            );
            const hasReady = allItems.some(
              (it) => it.seatNumber === ch && it.stage === "PLATED",
            );
            const isSelected = selectedChair === ch;
            const isDragTarget = dragOverTarget === ch;
            const isMarkedForMerge = chairsSelectedForMerge.includes(ch);

            return (
              <button
                key={ch}
                type="button"
                draggable={!mergeChairMode}
                onDragStart={(e) => {
                  (window as any).__draggedChair = ch;
                  (window as any).__draggedChairTable = tableNum;
                  try {
                    e.dataTransfer?.setData("text/plain", String(ch));
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
                  } catch {}
                }}
                onDragEnd={() => {
                  (window as any).__draggedChair = null;
                  (window as any).__draggedChairTable = null;
                  setDragOverTarget(null);
                  setDragType(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const draggedCh = (window as any).__draggedChair;
                  const draggedItem = (window as any).__draggedMenuItem;
                  if (draggedCh && draggedCh !== ch) {
                    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                    if (dragOverTarget !== ch) {
                      setDragOverTarget(ch);
                      setDragType("chair");
                    }
                  } else if (draggedItem) {
                    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
                    if (dragOverTarget !== ch) {
                      setDragOverTarget(ch);
                      setDragType("dish");
                    }
                  }
                }}
                onDragLeave={() => {
                  setDragOverTarget(null);
                  setDragType(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPanelDragOver(false);
                  setDragOverTarget(null);
                  setDragType(null);

                  const fromChair = (window as any).__draggedChair;
                  const draggedItem = (window as any).__draggedMenuItem;

                  if (fromChair && fromChair !== ch) {
                    (window as any).__draggedChair = null;
                    (window as any).__draggedChairTable = null;
                    const sorted = [
                      Math.min(fromChair, ch),
                      Math.max(fromChair, ch),
                    ];
                    const groupKey = `Chairs ${sorted.join(" & ")}`;
                    waiterMergeSeatGroup(tableNum, groupKey, sorted);
                    onSelectChair(groupKey);
                    return;
                  }

                  if (draggedItem) {
                    (window as any).__draggedMenuItem = null;
                    addToCart(draggedItem, undefined, undefined, 1);
                    if (isVacant) {
                      waiterSeatsGuests(tableNum, 1, "Floor Captain");
                    }
                    onSelectChair(ch);
                  }
                }}
                onClick={() => {
                  if (mergeChairMode) {
                    setChairsSelectedForMerge((prev) =>
                      prev.includes(ch)
                        ? prev.filter((c) => c !== ch)
                        : [...prev, ch],
                    );
                    return;
                  }
                  if (isSelected) {
                    onSelectChair("ALL");
                  } else {
                    onSelectChair(ch);
                    if (isVacant) {
                      waiterSeatsGuests(tableNum, 1, "Floor Captain");
                    }
                  }
                }}
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-3 min-w-[80px] rounded-2xl border-2 font-mono font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isMarkedForMerge
                    ? "border-purple-600 bg-purple-100 text-purple-950 ring-4 ring-purple-300 scale-105 shadow-md"
                    : isDragTarget && dragType === "chair"
                      ? "border-purple-600 bg-purple-100 text-purple-950 ring-4 ring-purple-300 scale-105 shadow-md"
                      : isDragTarget && dragType === "dish"
                        ? "border-amber-500 bg-amber-100 text-amber-950 ring-4 ring-amber-300 scale-105 shadow-md"
                        : isSelected
                          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                          : hasItems || hasDraft
                            ? "bg-amber-50 text-amber-950 border-amber-400"
                            : "bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100"
                }`}
              >
                <Armchair className="h-6 w-6 stroke-[2.4]" />
                <span className="text-xs">
                  {isMarkedForMerge
                    ? `✓ Chair ${ch}`
                    : isDragTarget && dragType === "chair"
                      ? `Merge Into ${ch}`
                      : isDragTarget && dragType === "dish"
                        ? `+ Add to ${ch}`
                        : `Chair ${ch}`}
                </span>
                {/* Food Ready Dot */}
                {hasReady && (
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-blue-600 border-2 border-white shadow-xs animate-pulse z-10" />
                )}
                {/* Active Items Dot */}
                {hasItems && !hasReady && (
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" />
                )}
                {/* Draft Items Dot */}
                {hasDraft && !hasItems && !hasReady && (
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-amber-400 border-2 border-white shadow-xs animate-pulse z-10" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content Area: Vacant Empty Space or Active Orders List ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* VACANT: Prominent Card in the Empty Space if no draft items */}
        {isVacant && draftItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-5 p-8 bg-white border-2 border-stone-200 rounded-3xl text-center shadow-xs mt-4 max-w-md mx-auto"
          >
            <div className="h-20 w-20 rounded-3xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shadow-xs">
              <Users className="h-10 w-10 text-emerald-700 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="font-black text-stone-950 text-xl font-mono">
                Table {tableNum} is Vacant
              </h3>
              <p className="font-mono text-xs text-stone-600 mt-1 font-bold">
                Capacity: {table.capacity} Guests ·{" "}
                {formatSectionName(table.section, table.number)}
              </p>
              <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed">
                {selectedChair !== "ALL"
                  ? `Chair ${selectedChair} selected. Tap below to seat 1 guest and start punching items from the right panel.`
                  : "Seat arriving customers to start service, then use the customer menu on the right panel to punch in food."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedChair !== "ALL") {
                  useSharedBridge
                    .getState()
                    .waiterSeatsGuests(tableNum, 1, "Floor Captain");
                } else {
                  onSeatGuests();
                }
              }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#9C3D1E] hover:bg-[#7d3018] text-white rounded-2xl font-mono font-black text-sm uppercase tracking-wider transition cursor-pointer shadow-md active:scale-98"
            >
              <Users className="h-5 w-5 stroke-[2.4]" />
              <span>
                {selectedChair === "ALL"
                  ? "Seat Table Guests"
                  : `Seat Chair ${selectedChair} (1 Guest)`}
              </span>
            </button>
          </motion.div>
        )}

        {/* ── LIVE UNFIRED DRAFT / CART ITEMS SECTION ── */}
        {draftItems.length > 0 && (
          <div className="space-y-2 bg-amber-50/80 p-3.5 rounded-2xl border-2 border-amber-300 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-amber-700 stroke-[2.4]" />
                <span className="font-mono text-xs font-black text-amber-950 uppercase tracking-wider">
                  🛒 Unfired Draft Order ·{" "}
                  {selectedChair === "ALL"
                    ? "All Table"
                    : `Chair ${selectedChair}`}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider text-amber-900 bg-amber-200 border-amber-300 animate-pulse">
                In Cart · Pending KOT
              </span>
            </div>

            {draftItems.map((ci, cIdx) => (
              <div
                key={ci.cartItemId || `draft-${cIdx}`}
                className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-black text-stone-950 leading-tight antialiased">
                      {ci.menuItem.name}
                    </p>
                    {ci.seatNumber && (
                      <span className="text-[10px] font-black font-mono text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-300">
                        Chair {ci.seatNumber}
                      </span>
                    )}
                  </div>
                  {ci.selectedOption && (
                    <p className="text-[10px] text-stone-600 font-mono mt-0.5 font-medium">
                      {ci.selectedOption}
                      {ci.selectedAddOns &&
                        ci.selectedAddOns.length > 0 &&
                        ` + ${ci.selectedAddOns.join(", ")}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2.5 shrink-0 font-mono">
                  <span className="text-xs font-black text-amber-950 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">
                    ×{ci.quantity}
                  </span>
                  <span className="text-xs font-black text-[#9C3D1E]">
                    ₹{ci.totalPrice}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider bg-white text-amber-800 border-amber-200">
                    Draft
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-amber-200 flex items-center justify-between font-mono text-xs">
              <span className="text-amber-900 font-bold text-[11px]">
                👉 Tap &quot;Fire KOT to Kitchen&quot; on the right panel to
                send to chef
              </span>
              <span className="font-black text-[#9C3D1E]">
                Draft Subtotal: ₹{draftSubtotal}
              </span>
            </div>
          </div>
        )}

        {/* OCCUPIED: Empty state if no orders and no draft */}
        {!isVacant && displayItems.length === 0 && draftItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-36 text-stone-500 font-mono text-xs text-center gap-2">
            <ShoppingBag className="h-8 w-8 opacity-40 stroke-[2.2]" />
            <p className="font-bold text-stone-700">
              No dishes ordered yet for{" "}
              {selectedChair === "ALL"
                ? "this table"
                : `Chair ${selectedChair}`}
            </p>
            <p className="text-xs text-stone-400">
              Tap &quot;Add Dishes&quot; below or pick dishes on the right to
              start ordering
            </p>
          </div>
        )}

        {!isVacant &&
          displayItems.length > 0 &&
          tickets.map((tk, tkIdx) => {
            const tkItems = tk.items.filter((it) => {
              if (selectedChair === "ALL") return true;
              if (typeof selectedChair === "number")
                return it.seatNumber === selectedChair;
              if (targetSeats.length > 0)
                return it.seatNumber && targetSeats.includes(it.seatNumber);
              return false;
            });
            if (tkItems.length === 0) return null;

            const isAllServed =
              tk.items.length > 0 &&
              tk.items.every(
                (i) => i.stage === "SERVED" || (i.stage as string) === "Served",
              );

            const isTicketReady =
              tk.status === "READY" ||
              tkItems.some((i) => {
                const stageStr = String(i.stage || '').toUpperCase();
                const isServed = stageStr === "SERVED";
                const isReady =
                  stageStr === "READY" ||
                  stageStr === "PLATED" ||
                  String((i as any).status || '').toUpperCase() === "READY";
                return !isServed && isReady;
              });

            return (
              <div
                key={tk.id ? `${tk.id}-${tkIdx}` : `kot-${tkIdx}`}
                className={`space-y-2 p-3.5 rounded-2xl border-2 transition ${
                  isAllServed
                    ? "bg-stone-50/70 border-stone-200"
                    : "bg-white border-stone-200"
                }`}
              >
                {/* KOT Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Flame
                      className={`h-4 w-4 stroke-[2.4] ${isAllServed ? "text-stone-400" : "text-orange-600"}`}
                    />
                    <span className="font-mono text-xs font-black text-stone-900 uppercase tracking-wider">
                      KOT #{tk.id ? tk.id.slice(-4) : String(tkIdx + 1)} ·{" "}
                      {tk.timestamp}
                    </span>
                  </div>
                  {isAllServed ||
                  tk.status === "COMPLETED" ||
                  tk.status === "SERVED" ? (
                    <button
                      disabled
                      type="button"
                      className="px-2.5 py-1 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider text-stone-400 bg-stone-100 border-stone-300 line-through cursor-not-allowed opacity-75 shadow-none"
                    >
                      Served
                    </button>
                  ) : !isTicketReady ? (
                    <button
                      disabled
                      type="button"
                      title="Dishes are being prepared in kitchen. Unlocks once kitchen marks ready."
                      className="px-2.5 py-1 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider text-stone-400 bg-stone-100 border-stone-200 cursor-not-allowed opacity-60 shadow-none flex items-center gap-1"
                    >
                      <Utensils className="h-3 w-3 text-stone-400" />
                      <span>Serve All</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        waiterMarkKitchenItemServed(tk.id, "ALL")
                      }
                      className="px-2.5 py-1 rounded-lg border text-[10px] font-black font-mono uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-700 shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                    >
                      <Utensils className="h-3 w-3" />
                      <span>Serve All</span>
                    </button>
                  )}
                </div>

                {tkItems.map((item) => {
                  const isServed =
                    item.stage === "SERVED" ||
                    (item.stage as string) === "Served";
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between py-2 border-b border-stone-100 last:border-0 transition ${
                        isServed ? "opacity-60" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-[14px] font-black leading-tight antialiased ${
                              isServed
                                ? "line-through text-stone-400"
                                : "text-stone-950"
                            }`}
                          >
                            {item.name}
                          </p>
                          {item.seatNumber && (
                            <span
                              className={`text-[9.5px] font-black font-mono px-1.5 py-0.5 rounded border ${
                                isServed
                                  ? "bg-stone-100 text-stone-400 border-stone-200"
                                  : "bg-amber-100 text-amber-900 border-amber-200"
                              }`}
                            >
                              Chair {item.seatNumber}
                            </span>
                          )}
                        </div>
                        {item.options && (
                          <p
                            className={`text-[10px] font-mono mt-0.5 ${
                              isServed ? "text-stone-400" : "text-stone-500"
                            }`}
                          >
                            {item.options}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 font-mono">
                        <span
                          className={`text-xs font-black px-2 py-1 rounded-lg ${
                            isServed
                              ? "text-stone-400 bg-stone-100 border border-stone-200"
                              : "text-stone-700 bg-stone-100"
                          }`}
                        >
                          ×{item.quantity}
                        </span>
                        {item.price !== undefined && (
                          <span
                            className={`text-xs font-black ${
                              isServed
                                ? "line-through text-stone-400"
                                : "text-[#9C3D1E]"
                            }`}
                          >
                            ₹{item.price * item.quantity}
                          </span>
                        )}
                        <StagePill
                          stage={item.stage}
                          onServe={() =>
                            waiterMarkKitchenItemServed(tk.id, item.id)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      {/* ── High-Contrast Bottom Action Bar for Occupied Tables (Matching Waiter Mobile) ── */}
      {!isVacant && (
        <div className="shrink-0 bg-white border-t-2 border-stone-200 px-5 py-3.5 space-y-3 shadow-sm">
          {/* Bill Summary Row */}
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="text-stone-700 font-black text-xs uppercase tracking-wider">
                {chairLabel}
              </span>
              {!areAllRelevantItemsServed && hasItemsToSettle && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                  Serve dishes to settle
                </span>
              )}
              {areAllRelevantItemsServed && !isCustomerBillRequested && (
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-300 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-stone-500" />
                  Awaiting Customer Bill Request
                </span>
              )}
              {areAllRelevantItemsServed && (isCustomerBillRequested || isPaymentDoneViaUpi) && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {isPaymentDoneViaUpi ? 'Payment Done via UPI' : 'Ready to Settle'}
                </span>
              )}
            </div>
            <span className="font-black text-stone-950 text-2xl">
              ₹{Math.round(effectiveBillToSettle > 0 ? effectiveBillToSettle : targetChairBill).toLocaleString()}
            </span>
          </div>

          {/* Primary Action Buttons — Two side-by-side buttons matching Waiter Mobile */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs font-black">
            <button
              type="button"
              onClick={() =>
                onAddDishes(
                  typeof selectedChair === "number"
                    ? selectedChair
                    : targetSeats[0],
                )
              }
              className="min-h-[46px] rounded-xl bg-[#9C3D1E] hover:bg-[#853318] text-white flex items-center justify-center gap-1.5 transition-all duration-150 shadow-xs cursor-pointer active:scale-98 border-0"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add Dishes</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!canSettle) return;
                if (isPaymentDoneViaUpi) {
                  handleDirectConfirmAndVacate();
                  return;
                }
                onSettle();
              }}
              disabled={!canSettle}
              title={
                !areAllRelevantItemsServed && hasItemsToSettle
                  ? "All ordered dishes must be served before settling the bill"
                  : !isCustomerBillRequested
                  ? "Dishes served. Settle bill unlocks when customer requests bill."
                  : undefined
              }
              className={`min-h-[46px] rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 border-0 ${
                !canSettle
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-98 shadow-xs"
              }`}
            >
              {isPaymentDoneViaUpi ? (
                <CheckCircle2 className="h-4 w-4 stroke-[2.4]" />
              ) : (
                <CreditCard className="h-4 w-4 stroke-[2.4]" />
              )}
              <span>
                {isPaymentDoneViaUpi
                  ? `Payment Done - Please Confirm (₹${Math.round(effectiveBillToSettle)})`
                  : !canSettle && hasItemsToSettle
                  ? !areAllRelevantItemsServed
                    ? "Serve to Settle"
                    : "Awaiting Bill"
                  : `Settle ${selectedChair === "ALL" ? "Bill" : chairLabel}`}
              </span>
            </button>
          </div>

          {/* Secondary Action Buttons */}
          {/* <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={onSplit}
              disabled={table.currentBill === 0}
              className="py-2.5 rounded-xl border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 disabled:opacity-40 font-bold text-stone-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Split className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={onMerge}
              className="py-2.5 rounded-xl border-2 border-stone-300 bg-stone-50 hover:bg-stone-100 font-bold text-stone-800 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>{table.mergedWith ? 'Unmerge' : 'Merge'}</span>
            </button>
            <button
              type="button"
              onClick={onVacate}
              className="py-2.5 rounded-xl border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 font-bold text-rose-700 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserX className="h-3.5 w-3.5" />
              <span>Vacate</span>
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
