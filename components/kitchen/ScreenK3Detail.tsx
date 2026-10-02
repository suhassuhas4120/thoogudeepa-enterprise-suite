'use client';

import React, { useState } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import { OrderStage } from '../../types/customer';
import {
  ArrowLeft,
  Clock,
  Bell,
  Sliders,
  Lock,
  LockOpen,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenK3Detail: React.FC = () => {
  const {
    setCurrentScreen,
    selectedTableNumber,
    tickets: localTickets,
  } = useKitchenStore();

  const {
    kdsTickets: bridgeTickets,
    inventory86,
    kitchenToggle86,
    kitchenUpdatePrepDelay,
    kitchenBumpTable,
    kitchenSetItemStage,
    callFloorWaiter,
  } = useSharedBridge();

  const [inventoryLocked, setInventoryLocked] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [pendingDelays, setPendingDelays] = useState<Record<string, number>>({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const allTickets =
    bridgeTickets.length > 0
      ? bridgeTickets
      : localTickets.map((t) => ({ ...t, source: 'WAITER' as const }));

  const currentTicket =
    allTickets.find(
      (t) => t.tableNumber === selectedTableNumber.replace('TABLE ', '')
    ) ||
    allTickets.find((t) => t.tableNumber === selectedTableNumber) ||
    allTickets[0];

  const handlePendingToggle = (itemId: string, currentIs86: boolean) => {
    if (inventoryLocked) return;
    setPendingChanges((prev) => ({
      ...prev,
      [itemId]: itemId in prev ? !prev[itemId] : !currentIs86,
    }));
  };

  const handlePendingDelay = (itemId: string, delta: number) => {
    if (inventoryLocked) return;
    setPendingDelays((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + delta,
    }));
  };

  const handleUpdate = () => {
    Object.entries(pendingChanges).forEach(([itemId, newIs86]) => {
      const currentItem = inventory86.find((i) => i.id === itemId);
      if (currentItem && currentItem.is86 !== newIs86) {
        kitchenToggle86(itemId);
      }
    });
    Object.entries(pendingDelays).forEach(([itemId, delta]) => {
      if (delta !== 0) kitchenUpdatePrepDelay(itemId, delta);
    });

    setPendingChanges({});
    setPendingDelays({});
    setInventoryLocked(true);
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleDiscard = () => {
    setPendingChanges({});
    setPendingDelays({});
    setInventoryLocked(true);
  };

  const hasPendingChanges =
    Object.keys(pendingChanges).length > 0 ||
    Object.keys(pendingDelays).length > 0;

  // ✅ Only 3 stages — SERVED removed
  const stageOrder: OrderStage[] = ['PLACED', 'PREP', 'PLATED'];
  const stageLabels: Record<string, string> = {
    PLACED: '1.REC',
    PREP: '2.PREP',
    PLATED: '3.READY',
  };

  const handleItemStageSet = (
    ticketId: string,
    itemId: string,
    newStage: OrderStage
  ) => {
    kitchenSetItemStage(ticketId, itemId, newStage);
  };

  return (
    <KitchenTabletHousing
      screenNumber={3}
      screenTitle="TABLE DETAIL (55%) + MENU 86 INVENTORY (45%)"
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT 55% */}
          <div className="w-[55%] border-r border-slate-200 p-5 overflow-y-auto bg-stone-50/50 flex flex-col justify-between">
            <div className="space-y-4">
              {/* ✅ Back arrow + table info header — replaces old top bar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen(2)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-slate-900 bg-white hover:bg-orange-50 transition shadow-[2px_2px_0px_#0f172a] shrink-0"
                  title="Back to All Tables"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[2.5] text-slate-900" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-black text-slate-900">
                    TABLE DETAILS
                  </span>
                </div>
              </div>

              {!currentTicket && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                  <CheckCircle2 className="h-12 w-12 text-slate-300" />
                  <div className="font-mono text-xs font-bold text-center">
                    NO ACTIVE KDS TICKETS
                    <br />
                    <span className="text-[10px] font-normal">
                      Orders appear here when customers or waiters place them
                    </span>
                  </div>
                </div>
              )}

              {currentTicket && (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900 mt-0.5">
                        Table [{currentTicket?.tableNumber}] •{' '}
                        {currentTicket?.items.length} Dishes
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Source:{' '}
                        {currentTicket?.source === 'CUSTOMER'
                          ? '📱 Customer App'
                          : '📟 Waiter Tablet'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-mono text-xs font-black text-orange-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>ELAPSED: {currentTicket?.elapsedMinutes} MIN</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {currentTicket?.items.map((it) => (
                      <div
                        key={it.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-orange-600">
                                {it.quantity}×
                              </span>
                              <span className="text-xs font-black text-slate-900 truncate">
                                {it.name}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-500 mt-1 font-mono">
                              Prep: {it.prepMode}
                              {it.options ? ` • Option: ${it.options}` : ''}
                              {it.addOns && it.addOns.length > 0
                                ? ` • Add-ons: ${it.addOns.join(', ')}`
                                : ''}
                              {it.notes ? ` • Note: ${it.notes}` : ''}
                            </div>
                          </div>

                          <span
                            className={`font-mono text-[10.5px] font-bold px-2 py-1 rounded-lg border shrink-0 ${
                              it.stage === 'PLATED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : it.stage === 'PREP'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-stone-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {it.stage}
                          </span>
                        </div>

                        {/* ✅ Only 3-stage stepper (grid-cols-3) */}
                        <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] font-black">
                          {stageOrder.map((stg) => {
                            const isActive = it.stage === stg;
                            const idx = stageOrder.indexOf(stg);
                            const curIdx = stageOrder.indexOf(it.stage);
                            const isPast = idx < curIdx;
                            return (
                              <button
                                key={stg}
                                onClick={() =>
                                  handleItemStageSet(
                                    currentTicket.id,
                                    it.id,
                                    stg
                                  )
                                }
                                className={`py-1.5 rounded text-center transition border ${
                                  isActive
                                    ? 'bg-orange-600 text-white border-orange-700 shadow-xs ring-1 ring-orange-500'
                                    : isPast
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                    : 'bg-stone-50 text-slate-600 border-slate-300 hover:bg-orange-50'
                                }`}
                              >
                                {stageLabels[stg]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {currentTicket && (
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => kitchenBumpTable(currentTicket?.id || '')}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
                >
                  MARK ALL DISHES PLATED &amp; READY ✓
                </button>
              </div>
            )}
          </div>

          {/* RIGHT 45% — Inventory */}
          <div className="w-[45%] bg-white p-5 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-black uppercase text-slate-700">
                <Sliders className="h-4 w-4 text-orange-600" />
                <span>IN-STOCK / OUT-OF-STOCK &amp; PREP DELAY</span>
              </div>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl border p-3 transition ${
                inventoryLocked
                  ? 'border-slate-200 bg-stone-50'
                  : 'border-orange-300 bg-orange-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {inventoryLocked ? (
                  <Lock className="h-4 w-4 text-slate-500" />
                ) : (
                  <LockOpen className="h-4 w-4 text-orange-600" />
                )}
                <div>
                  <div className="font-mono text-[10.5px] font-black text-slate-800">
                    {inventoryLocked
                      ? 'INVENTORY LOCKED — CLICK TO EDIT'
                      : 'EDITING UNLOCKED — MAKE CHANGES THEN UPDATE'}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {inventoryLocked
                      ? 'Unlock to mark items Available or Out of Stock'
                      : 'Changes are staged until you click UPDATE'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!inventoryLocked) {
                    handleDiscard();
                  } else {
                    setInventoryLocked(false);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-[10.5px] font-black transition ${
                  inventoryLocked
                    ? 'bg-slate-900 text-white hover:bg-black'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {inventoryLocked ? (
                  <>
                    <LockOpen className="h-3.5 w-3.5" />
                    <span>UNLOCK</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>CANCEL</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {updateSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-emerald-800 text-xs font-black"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ✓ MENU INVENTORY UPDATED — SYNCED TO ALL SECTIONS
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2.5 flex-1">
              {inventory86.map((item) => {
                const effectiveIs86 =
                  item.id in pendingChanges ? pendingChanges[item.id] : item.is86;
                const hasPending = item.id in pendingChanges;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3 transition shadow-2xs flex items-center justify-between gap-3 ${
                      effectiveIs86
                        ? 'border-rose-200 bg-rose-50/50'
                        : hasPending
                        ? 'border-orange-200 bg-orange-50/40'
                        : 'border-slate-200 bg-stone-50/70'
                    } ${inventoryLocked ? 'opacity-90' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {item.name}
                        {hasPending && !inventoryLocked && (
                          <span className="ml-1.5 text-orange-600 text-[10px] font-black">
                            PENDING
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Category: {item.category}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePendingToggle(item.id, item.is86)}
                        disabled={inventoryLocked}
                        className={`rounded-xl px-3 py-1.5 font-mono text-[10.5px] font-black uppercase transition ${
                          inventoryLocked
                            ? 'opacity-40 cursor-not-allowed border border-slate-200 bg-stone-50 text-slate-500'
                            : effectiveIs86
                            ? 'bg-rose-600 text-white shadow-xs hover:bg-rose-700'
                            : 'border border-slate-300 bg-white text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {effectiveIs86 ? '86 SOLD OUT' : 'IN STOCK'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {!inventoryLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="border-t border-slate-200 pt-3 flex gap-2 shrink-0"
                >
                  <button
                    onClick={handleDiscard}
                    className="flex-1 rounded-xl border border-slate-300 bg-stone-50 py-3 font-mono text-xs font-black text-slate-600 hover:bg-stone-100 transition"
                  >
                    DISCARD
                  </button>
                  <button
                    onClick={handleUpdate}
                    className={`flex-[2] rounded-xl py-3 font-mono text-xs font-black uppercase transition flex items-center justify-center gap-2 shadow-sm ${
                      hasPendingChanges
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                        : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>
                      UPDATE &amp; SYNC MENU
                      {hasPendingChanges
                        ? ` (${
                            Object.keys(pendingChanges).length
                          } change${
                            Object.keys(pendingChanges).length > 1 ? 's' : ''
                          })`
                        : ''}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 text-[11px] text-orange-950 font-medium shrink-0">
              ⚡ <strong>Thoogudeepa Inventory Notice:</strong> Marking items 86
              reflects instantaneously across all floor POS and live customer
              ordering pages.
            </div>
          </div>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};