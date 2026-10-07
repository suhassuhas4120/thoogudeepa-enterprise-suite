'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useKitchenStore } from '../../store/useKitchenStore';
import { useSharedBridge } from '../../store/useSharedBridge';
import { KitchenTabletHousing } from './KitchenTabletHousing';
import {
  MenuCategory,
  ALL_CATEGORIES,
  getCategoryForItem,
} from '../../types/kitchen';
import { OrderStage } from '../../types/customer';
import { Clock, Bell } from 'lucide-react';

interface K2TableItem {
  id: string;
  name: string;
  quantity: number;
  stage: 'RECEIVED' | 'PREPARING' | 'READY' | 'PLACED';
  notes?: string;       
  options?: string;     
  addOns?: string[];    
  seatNumber?: number;
}

interface K2Table {
  id: string;
  tableNumber: string;
  isVip?: boolean;
  kotNumber: string;
  elapsedMinutes: number;
  serverName: string;
  seatNumber?: number;
  items: K2TableItem[];
}


const STAGE_STEPS = ['RECEIVED', 'PREPARING', 'READY'] as const;
const STAGE_LABELS = ['1.REC', '2.PREP', '3.READY'];

const hasSpecialInstruction = (it: K2TableItem): boolean => {
  return !!(
    (it.notes && it.notes.trim()) ||
    (it.options && it.options.trim()) ||
    (it.addOns && it.addOns.length > 0)
  );
};

const buildInstructionTooltip = (items: K2TableItem[]): string => {
  return items
    .filter(hasSpecialInstruction)
    .map((it) => {
      const parts: string[] = [];
      if (it.options) parts.push(`Choice: ${it.options}`);
      if (it.addOns && it.addOns.length > 0)
        parts.push(`Add-ons: ${it.addOns.join(', ')}`);
      if (it.notes) parts.push(`Note: ${it.notes}`);
      return `${it.quantity}x ${it.name} → ${parts.join(' | ')}`;
    })
    .join('  •  ');
};

const getShortKot = (raw: string): string => {
  const tail = raw.split('-').pop();
  return tail || raw;
};

export const ScreenK2Overview: React.FC = () => {
  const {
    setCurrentScreen,
    setSelectedTableNumber,
    setSelectedTicketId,
    callFloorWaiter: localCallFloorWaiter,
  } = useKitchenStore();

  const {
    kdsTickets: bridgeTickets,
    kitchenSetItemStage,
    kitchenSetBulkItemStage,
    callFloorWaiter: bridgeCallFloorWaiter,
  } = useSharedBridge();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('ALL CATEGORIES');

  const [bulkStages, setBulkStages] = useState<
    Record<string, 'RECEIVED' | 'PREPARING' | 'READY'>
  >({});

  const [itemStageOverride, setItemStageOverride] = useState<
    Record<string, 'RECEIVED' | 'PREPARING' | 'READY'>
  >({});

  const prevTicketCountRef = useRef(bridgeTickets.length);

  useEffect(() => {
    if (bridgeTickets.length > prevTicketCountRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {}
    }
    prevTicketCountRef.current = bridgeTickets.length;
  }, [bridgeTickets.length]);

  const formatKdsTableNumber = (num: string): string => {
    if (!num) return 'TABLE --';
    if (num.startsWith('TABLE')) return num;
    if (num.startsWith('T-')) return `TABLE ${num.replace('T-', '')}`;
    return `TABLE ${num}`;
  };

  const activeBridgeTables: K2Table[] = useMemo(() => {
    return bridgeTickets
      .filter((tk) => tk.status !== 'COMPLETED' && tk.status !== 'SERVED')
      .map((tk) => {
        const unservedItems = tk.items.filter((it) => it.stage !== 'SERVED');
        return {
          id: tk.id,
          tableNumber: formatKdsTableNumber(tk.tableNumber),
          kotNumber: tk.id.replace('KDS-', ''),
          elapsedMinutes: tk.elapsedMinutes || 1,
          serverName: tk.serverName || 'Floor Captain',
          isVip: tk.source === 'CUSTOMER',
          seatNumber: tk.seatNumber,
          items: unservedItems.map((it) => {
            const key = `${tk.id}-${it.id}`;
            const override = itemStageOverride[key];
            const resolvedStage =
              it.stage === 'RECEIVED'
                ? 'RECEIVED'
                : it.stage === 'PREP'
                ? 'PREPARING'
                : it.stage === 'PLATED'
                ? 'READY'
                : override || 'PLACED';
            return {
              id: it.id,
              name: it.name,
              quantity: it.quantity,
              stage: resolvedStage as 'RECEIVED' | 'PREPARING' | 'READY' | 'PLACED',
              notes: it.notes,
              options: it.options,
              addOns: it.addOns,
              seatNumber: it.seatNumber || tk.seatNumber,
            };
          }),
        };
      })
      .filter((tbl) => tbl.items.length > 0);
  }, [bridgeTickets, itemStageOverride]);

  const allTablesToRender: K2Table[] = useMemo(() => {
    return activeBridgeTables;
  }, [activeBridgeTables]);

  const categoryFilteredTables = useMemo(() => {
    return allTablesToRender
      .map((tbl) => ({
        ...tbl,
        items: tbl.items.filter((it) => {
          return selectedCategory === 'ALL CATEGORIES'
            ? true
            : getCategoryForItem(it.name) === selectedCategory;
        }),
      }))
      .filter((tbl) => tbl.items.length > 0);
  }, [allTablesToRender, selectedCategory]);

  const bulkAggregation = useMemo(() => {
    const map = new Map<
      string,
      { total: number; sources: string[]; stages: Set<string> }
    >();

    categoryFilteredTables.forEach((tbl) => {
      tbl.items.forEach((it) => {
        const key = it.name;
        const existing =
          map.get(key) || { total: 0, sources: [], stages: new Set<string>() };
        existing.total += it.quantity;
        existing.sources.push(`${tbl.tableNumber} (x${it.quantity})`);
        existing.stages.add(it.stage);
        map.set(key, existing);
      });
    });

    return Array.from(map.entries()).map(([name, data]) => {
      const stageArr = Array.from(data.stages);
      let status = '';
      let currentStage: 'RECEIVED' | 'PREPARING' | 'READY' = 'PREPARING';

      if (stageArr.length === 1) {
        currentStage = stageArr[0] as any;
        status = `ALL ${data.total} ${
          currentStage === 'RECEIVED'
            ? 'PENDING'
            : currentStage === 'PREPARING'
            ? 'COOKING'
            : 'READY'
        }`;
      } else {
        if (stageArr.includes('READY')) currentStage = 'READY';
        else if (stageArr.includes('PREPARING')) currentStage = 'PREPARING';
        else currentStage = 'RECEIVED';

        const counts = stageArr.reduce((acc, s) => {
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        status = Object.entries(counts)
          .map(([s, c]) => `${c} ${s}`)
          .join(', ');
      }

      return {
        name,
        total: data.total,
        sources: data.sources.join(', '),
        status,
        currentStage,
      };
    });
  }, [categoryFilteredTables]);

  const handleSetStage = (
    tableId: string,
    itemId: string,
    newStage: 'RECEIVED' | 'PREPARING' | 'READY'
  ) => {
    const key = `${tableId}-${itemId}`;
    setItemStageOverride((prev) => ({ ...prev, [key]: newStage }));

    const bridgeStage: OrderStage =
      newStage === 'PREPARING'
        ? 'PREP'
        : newStage === 'READY'
        ? 'PLATED'
        : 'RECEIVED';

    const bridgeTicket = bridgeTickets.find(
      (tk) => tk.id === tableId || tk.items.some((i) => i.id === itemId)
    );
    if (bridgeTicket) {
      kitchenSetItemStage(bridgeTicket.id, itemId, bridgeStage);
    }
  };

  const handleSetBulkStage = (
    bulkItemName: string,
    newStage: 'RECEIVED' | 'PREPARING' | 'READY'
  ) => {
    setBulkStages((prev) => ({ ...prev, [bulkItemName]: newStage }));

    const bulkLower = bulkItemName.toLowerCase();
    setItemStageOverride((prev) => {
      const next = { ...prev };
      allTablesToRender.forEach((tbl) => {
        tbl.items.forEach((it) => {
          const itLower = it.name.toLowerCase();
          if (itLower.includes(bulkLower) || bulkLower.includes(itLower)) {
            next[`${tbl.id}-${it.id}`] = newStage;
          }
        });
      });
      return next;
    });

    const bridgeStage: OrderStage =
      newStage === 'PREPARING'
        ? 'PREP'
        : newStage === 'READY'
        ? 'PLATED'
        : 'RECEIVED';

    if (kitchenSetBulkItemStage) {
      kitchenSetBulkItemStage(bulkItemName, bridgeStage);
    }
    if (newStage === 'READY') {
      bridgeCallFloorWaiter('ALL', `${bulkItemName} Plated & Ready at Pass`);
    }
  };

  const handleOpenTable = (ticketIdOrTableNum: string, maybeTableNum?: string) => {
    if (maybeTableNum) {
      setSelectedTicketId(ticketIdOrTableNum);
      setSelectedTableNumber(maybeTableNum.replace('TABLE ', ''));
    } else {
      setSelectedTicketId('');
      setSelectedTableNumber(ticketIdOrTableNum.replace('TABLE ', ''));
    }
    setCurrentScreen(3);
  };

  const handleCallWaiter = () => {
    bridgeCallFloorWaiter('ALL', 'Kitchen calls Floor Captain to Pass');
    localCallFloorWaiter('ALL', 'Kitchen calls Floor Captain to Pass');
  };

  const timeQueueTickets = useMemo(() => {
    return bridgeTickets
      .filter((tk) => tk.status !== 'COMPLETED' && tk.items.some((it) => it.stage !== 'SERVED'))
      .map((tk) => ({
        ticketId: tk.id,
        ticketNum: tk.id.replace('KDS-', ''),
        table: `${formatKdsTableNumber(tk.tableNumber)}${tk.seatNumber ? ` • Chair ${tk.seatNumber}` : ''}`,
        time: ` (${tk.elapsedMinutes || 1}m)`,
        items: tk.items
          .filter((it) => it.stage !== 'SERVED')
          .map((it) => `${it.quantity}x ${it.name}${it.seatNumber ? ` [Chair ${it.seatNumber}]` : ''}`),
      }));
  }, [bridgeTickets]);


  return (
    <KitchenTabletHousing
      screenNumber={2}
      screenTitle="ALL TABLES & FEEDS (70/30 SPLIT)"
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Filter bar */}
        <div className="bg-white border-b border-[#EFE6DA] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="font-mono text-[11px] font-black uppercase text-slate-600 mr-1">
              CATEGORIES:
            </span>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded border font-mono text-[10.5px] font-black transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#E8722E] text-white border-[#E8722E]'
                    : 'bg-[#FBF7F0] text-slate-700 border-[#EFE6DA] hover:bg-[#FFF4EC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-[#FBF7F0] border border-[#EFE6DA] px-2 py-1 rounded">
              VISIBLE TABLES: {categoryFilteredTables.length}
            </span>
            <button
              onClick={handleCallWaiter}
              className="flex items-center gap-1.5 rounded-lg border border-[#E8722E] bg-[#E8722E] hover:bg-[#d15f1f] px-3 py-1.5 font-mono text-[10.5px] font-black uppercase text-white transition shadow-sm whitespace-nowrap"
            >
              <Bell className="h-3 w-3" />
              <span>CALL WAITER</span>
            </button>
          </div>
        </div>

        {/* SAME DISH LIST */}
        <div className="bg-[#FAF6EE] border-b border-[#EFE6DA] p-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-black text-slate-900 uppercase">
              SAME DISH LIST
            </span>
          </div>

          {bulkAggregation.length === 0 ? (
            <div className="text-center py-4 font-mono text-[11px] text-slate-400">
              NO ITEMS FOR THIS FILTER COMBINATION
            </div>
          ) : (
            <div
              className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200"
              style={{ scrollbarWidth: 'thin' }}
            >
              {bulkAggregation.map((b, idx) => {
                const currentBulkStage = b.currentStage;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#EFE6DA] rounded-xl p-2.5 shadow-xs flex flex-col justify-between gap-1.5 shrink-0 w-[260px]"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-[#EFE6DA]">
                      <span
                        className="font-mono text-[11px] font-black text-slate-900 truncate"
                        title={b.name}
                      >
                        {b.name}
                      </span>
                      <span className="font-mono text-[10px] font-black bg-[#E8722E] text-white px-1.5 py-0.5 rounded ml-1 shrink-0">
                        TOTAL: {b.total}
                      </span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-600 truncate">
                      {b.sources}
                    </div>
                    <div className="flex items-center justify-between font-mono text-[9px] font-extrabold text-[#B85A1F]">
                      <span>STATUS:</span>
                      <span className="bg-[#FFF4EC] border border-[#F5C9A5] px-1.5 py-0.2 rounded text-[8.5px] truncate">
                        {b.status}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#EFE6DA]">
                      <div className="grid grid-cols-3 gap-1 font-mono text-[9px] font-black">
                        {STAGE_STEPS.map((stg, sIdx) => {
                          const isActive = currentBulkStage === stg;
                          return (
                            <button
                              key={stg}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetBulkStage(b.name, stg);
                              }}
                              className={`py-1.5 rounded text-center transition border ${
                                isActive
                                  ? 'bg-[#E8722E] text-white border-[#E8722E] shadow-xs'
                                  : 'bg-[#FBF7F0] text-slate-700 border-[#EFE6DA] hover:bg-[#FFF4EC] hover:text-[#B85A1F]'
                              }`}
                            >
                              {STAGE_LABELS[sIdx]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tables + Time queue */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[70%] border-r-2 border-[#EFE6DA] p-3 overflow-y-auto bg-[#FAF6EE]/70">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[11px] font-black text-slate-900 uppercase">
                ALL TABLES
              </span>
            </div>

            {categoryFilteredTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                <span className="font-mono text-xs font-bold text-slate-700">
                  ALL ORDERS CLEARED • KITCHEN PASS READY
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Live orders from Waiter Mobile or tables will appear here in real time
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {categoryFilteredTables.map((tbl, idx) => {
                  const shortKot = getShortKot(tbl.kotNumber);
                  return (
                    <div
                      key={`${tbl.id}-${idx}`}
                      onClick={() => handleOpenTable(tbl.id, tbl.tableNumber)}
                      className="border-2 rounded-xl p-3 cursor-pointer transition flex flex-col justify-between bg-white border-[#EFE6DA] shadow-xs hover:shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-1.5 border-b-2 border-[#EFE6DA] mb-2">
                          <div className="font-mono text-xs font-black text-slate-900 whitespace-nowrap flex items-center gap-1.5">
                            <span>{tbl.tableNumber}</span>
                            {tbl.seatNumber && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-300">
                                Chair {tbl.seatNumber}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
                            <Clock className="h-3 w-3 text-[#E8722E] shrink-0" />
                            <span>
                              {tbl.elapsedMinutes}m (KOT #{shortKot})
                            </span>
                            {tbl.items.some(hasSpecialInstruction) && (
                              <span
                                title={buildInstructionTooltip(tbl.items)}
                                className="h-2 w-2 rounded-full bg-[#E8722E] animate-pulse inline-block ml-1 shrink-0"
                              />
                            )}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {tbl.items.map((it) => (
                            <div
                              key={it.id}
                              className="bg-[#FBF7F0] border border-[#EFE6DA] rounded-lg p-2 space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs font-mono font-black">
                                <div className="text-slate-900 truncate pr-1">
                                  <span>{it.quantity}x {it.name}</span>
                                  {it.seatNumber && (
                                    <span className="ml-1.5 text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                      Chair {it.seatNumber}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[8.5px] font-bold bg-white border border-[#EFE6DA] px-1.5 py-0.5 rounded text-slate-800 shrink-0">
                                  STAGE{' '}
                                  {it.stage === 'RECEIVED'
                                    ? '1: RECEIVED'
                                    : it.stage === 'PREPARING'
                                    ? '2: PREPARING'
                                    : it.stage === 'READY'
                                    ? '3: READY'
                                    : 'NEW ORDER'}
                                </span>
                              </div>
                              {(it.options || (it.addOns && it.addOns.length > 0) || it.notes) && (
                                <div className="text-[9.5px] text-amber-900 font-mono truncate">
                                  {it.options ? `[${it.options}] ` : ''}
                                  {it.addOns && it.addOns.length > 0 ? `+${it.addOns.join(', ')} ` : ''}
                                  {it.notes ? `(${it.notes})` : ''}
                                </div>
                              )}


                              <div className="grid grid-cols-3 gap-1 pt-0.5 font-mono text-[9px] font-black">
                                {STAGE_STEPS.map((stg, sIdx) => {
                                  const isActive = it.stage === stg;
                                  return (
                                    <button
                                      key={stg}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetStage(tbl.id, it.id, stg);
                                      }}
                                      className={`py-1.5 rounded text-center transition border ${
                                        isActive
                                          ? 'bg-[#E8722E] text-white border-[#E8722E] shadow-2xs'
                                          : 'bg-white text-slate-600 border-[#EFE6DA] hover:bg-[#FFF4EC]'
                                      }`}
                                    >
                                      {STAGE_LABELS[sIdx]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTable(tbl.id, tbl.tableNumber);
                        }}
                        className="w-full mt-3 py-1.5 bg-[#E8722E] hover:bg-[#d15f1f] text-white font-mono text-[10px] font-black rounded uppercase tracking-wider transition text-center shadow-xs"
                      >
                        MANAGE {tbl.tableNumber} &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TIME QUEUE */}
          <div className="w-[30%] bg-white p-3 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE6DA] mb-3">
                <span className="font-mono text-[11px] font-black text-slate-900 uppercase">
                  TIME QUEUE
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-bold">
                  TIMED ORDERS
                </span>
              </div>

              <div className="space-y-2.5">
                {timeQueueTickets.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center gap-1 font-mono text-[11px]">
                    <Clock className="h-6 w-6 text-slate-300" />
                    <span className="font-bold text-slate-500">NO TIMED ORDERS</span>
                    <span className="text-[10px] text-slate-400">All table tickets completed</span>
                  </div>
                ) : (
                  timeQueueTickets.map((tq, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenTable(tq.ticketId, tq.table)}
                    className="p-2.5 rounded-lg border border-[#EFE6DA] bg-[#FBF7F0] hover:bg-[#FFF4EC] cursor-pointer transition shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 whitespace-nowrap">
                        #{getShortKot(tq.ticketNum)} • {tq.table}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500 whitespace-nowrap shrink-0">
                        {tq.time}
                      </span>
                    </div>

                    <div className="space-y-0.5 font-mono text-[10px] text-slate-700">
                      {tq.items.map((itLine, i) => (
                        <div key={i} className="truncate">
                          • {itLine}
                        </div>
                      ))}
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleCallWaiter}
              className="w-full mt-4 py-2.5 rounded-xl border border-[#EFE6DA] bg-[#FBF7F0] hover:bg-[#FFF4EC] font-mono text-xs font-black uppercase text-slate-900 flex items-center justify-center gap-1.5 shadow-xs transition"
            >
              <Bell className="h-3.5 w-3.5 text-[#E8722E]" />
              <span>CALL FLOOR RUNNER TO PASS</span>
            </button>
          </div>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};