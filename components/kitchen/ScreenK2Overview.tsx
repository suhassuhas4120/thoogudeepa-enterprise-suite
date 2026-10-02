'use client';

import React, { useState, useMemo } from 'react';
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
  stage: 'RECEIVED' | 'PREPARING' | 'READY';
  notes?: string;       
  options?: string;     
  addOns?: string[];    
}

interface K2Table {
  id: string;
  tableNumber: string;
  isVip?: boolean;
  kotNumber: string;
  elapsedMinutes: number;
  serverName: string;
  items: K2TableItem[];
}

const INITIAL_K2_TABLES: K2Table[] = [
  {
    id: 'tbl-1',
    tableNumber: 'TABLE 01',
    kotNumber: '101',
    elapsedMinutes: 14,
    serverName: 'Captain Ramesh',
    items: [
      { id: 't1-i1', name: 'Special Chicken Donne Biryani', quantity: 2, stage: 'PREPARING' },
      { id: 't1-i2', name: 'Mutton Chops Fry (Dry)', quantity: 1, stage: 'RECEIVED' },
    ],
  },
  {
    id: 'tbl-2',
    tableNumber: 'TABLE 02',
    kotNumber: '102',
    elapsedMinutes: 8,
    serverName: 'Captain Suresh',
    items: [
      { id: 't2-i1', name: 'Donne Mutton Biryani (Regular)', quantity: 2, stage: 'RECEIVED' },
      { id: 't2-i2', name: 'Guntur Chicken Wings', quantity: 1, stage: 'RECEIVED' },
    ],
  },
  {
    id: 'tbl-3',
    tableNumber: 'TABLE 03',
    kotNumber: '103',
    elapsedMinutes: 22,
    serverName: 'Captain Naveen',
    items: [
      { id: 't3-i1', name: 'Special Chicken Donne Biryani', quantity: 1, stage: 'READY' },
      { id: 't3-i2', name: 'Chicken Kshatriya Kebab', quantity: 1, stage: 'READY' },
    ],
  },
  {
    id: 'tbl-4',
    tableNumber: 'TABLE 04',
    isVip: true,
    kotNumber: '104',
    elapsedMinutes: 12,
    serverName: 'Captain Ramesh',
    items: [
      { id: 't4-i1', name: 'Donne Mutton Biryani (Large)', quantity: 1, stage: 'PREPARING' },
      { id: 't4-i2', name: 'Nati Koli Donne Biryani', quantity: 2, stage: 'PREPARING' },
    ],
  },
  {
    id: 'tbl-5',
    tableNumber: 'TABLE 05',
    kotNumber: '105',
    elapsedMinutes: 5,
    serverName: 'Captain Suresh',
    items: [
      { id: 't5-i1', name: 'Donne Mutton Biryani (Regular)', quantity: 1, stage: 'RECEIVED' },
      { id: 't5-i2', name: 'Donne Egg Biryani', quantity: 3, stage: 'RECEIVED' },
    ],
  },
  {
    id: 'tbl-6',
    tableNumber: 'TABLE 06',
    kotNumber: '106',
    elapsedMinutes: 18,
    serverName: 'Captain Naveen',
    items: [
      { id: 't6-i1', name: 'Mutton Chops Fry (Dry)', quantity: 2, stage: 'READY' },
      { id: 't6-i2', name: 'Special Donne Biryani Rice Combo', quantity: 1, stage: 'PREPARING' },
    ],
  },
];

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

export const ScreenK2Overview: React.FC = () => {
  const {
    setCurrentScreen,
    setSelectedTableNumber,
    callFloorWaiter: localCallFloorWaiter,
  } = useKitchenStore();

  const {
    kdsTickets: bridgeTickets,
    kitchenSetItemStage,
    kitchenSetBulkItemStage,
    callFloorWaiter: bridgeCallFloorWaiter,
  } = useSharedBridge();

  const [tablesState, setTablesState] = useState<K2Table[]>(INITIAL_K2_TABLES);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('ALL CATEGORIES');

  const [bulkStages, setBulkStages] = useState<
    Record<string, 'RECEIVED' | 'PREPARING' | 'READY'>
  >({});

  const [itemStageOverride, setItemStageOverride] = useState<
    Record<string, 'RECEIVED' | 'PREPARING' | 'READY'>
  >({});

  const activeBridgeTables: K2Table[] = useMemo(() => {
    return bridgeTickets
      .filter((tk) => tk.status !== 'COMPLETED')
      .map((tk) => ({
        id: tk.id,
        tableNumber: `TABLE ${tk.tableNumber}`,
        kotNumber: tk.id.replace('KDS-', ''),
        elapsedMinutes: tk.elapsedMinutes || 1,
        serverName: tk.serverName || 'Captain',
        isVip: tk.source === 'CUSTOMER',
        items: tk.items.map((it) => {
          const key = `${tk.id}-${it.id}`;
          const override = itemStageOverride[key];
          const resolvedStage =
            override ||
            (it.stage === 'PLACED'
              ? 'RECEIVED'
              : it.stage === 'PREP'
              ? 'PREPARING'
              : it.stage === 'PLATED'
              ? 'READY'
              : 'READY');
          return {
            id: it.id,
            name: it.name,
            quantity: it.quantity,
            stage: resolvedStage as 'RECEIVED' | 'PREPARING' | 'READY',
            notes: it.notes,       
            options: it.options,   
            addOns: it.addOns,     
          };
        }),
      }));
  }, [bridgeTickets, itemStageOverride]);

  const allTablesToRender: K2Table[] = useMemo(() => {
    if (activeBridgeTables.length === 0) return tablesState;
    const tableNumsInBridge = new Set(activeBridgeTables.map((t) => t.tableNumber));
    const remainingSeed = tablesState.filter(
      (t) => !tableNumsInBridge.has(t.tableNumber)
    );
    return [...activeBridgeTables, ...remainingSeed];
  }, [activeBridgeTables, tablesState]);

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

    setTablesState((prev) =>
      prev.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        return {
          ...tbl,
          items: tbl.items.map((it) =>
            it.id === itemId ? { ...it, stage: newStage } : it
          ),
        };
      })
    );

    const bridgeStage: OrderStage =
      newStage === 'PREPARING'
        ? 'PREP'
        : newStage === 'READY'
        ? 'PLATED'
        : 'PLACED';

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

    setTablesState((prev) =>
      prev.map((tbl) => ({
        ...tbl,
        items: tbl.items.map((it) => {
          const itLower = it.name.toLowerCase();
          const isMatch =
            itLower.includes(bulkLower) || bulkLower.includes(itLower);
          return isMatch ? { ...it, stage: newStage } : it;
        }),
      }))
    );

    const bridgeStage: OrderStage =
      newStage === 'PREPARING'
        ? 'PREP'
        : newStage === 'READY'
        ? 'PLATED'
        : 'PLACED';

    if (kitchenSetBulkItemStage) {
      kitchenSetBulkItemStage(bulkItemName, bridgeStage);
    }
  };

  const handleOpenTable = (tableNumber: string) => {
    setSelectedTableNumber(tableNumber.replace('TABLE ', ''));
    setCurrentScreen(3);
  };

  const handleCallWaiter = () => {
    bridgeCallFloorWaiter('ALL', 'Kitchen calls Floor Captain to Pass');
    localCallFloorWaiter('ALL', 'Kitchen calls Floor Captain to Pass');
  };

  const timeQueueTickets = useMemo(() => {
    if (bridgeTickets.length > 0) {
      return bridgeTickets.map((tk) => ({
        ticketNum: tk.id.replace('KDS-', ''),
        table: `TABLE ${tk.tableNumber}`,
        time: ` (${tk.elapsedMinutes || 1}m)`,
        items: tk.items.map((it) => `${it.quantity}x ${it.name}`),
      }));
    }
    return [
      {
        ticketNum: '101',
        table: 'TABLE 01',
        time: '(14m)',
        items: [
          '2x Special Chicken Donne Biryani [NOTE: LESS SPICY]',
          '1x Mutton Chops Fry [NOTE: EXTRA CRISPY]',
        ],
      },
      {
        ticketNum: '102',
        table: 'TABLE 02',
        time: '(10m)',
        items: [
          '2x Donne Mutton Biryani [NOTE: EXTRA SALNA]',
          '1x Guntur Chicken Wings [NOTE: STANDARD]',
        ],
      },
      {
        ticketNum: '103',
        table: 'TABLE 03',
        time: '(06m)',
        items: [
          '1x Special Chicken Donne Biryani',
          '1x Chicken Kshatriya Kebab',
        ],
      },
    ];
  }, [bridgeTickets]);

  return (
    <KitchenTabletHousing
      screenNumber={2}
      screenTitle="ALL TABLES & FEEDS (70/30 SPLIT)"
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <div className="bg-white border-b-2 border-slate-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
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
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-stone-50 text-slate-700 border-slate-300 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] font-bold text-slate-700 bg-stone-100 border border-slate-300 px-2 py-1 rounded">
              VISIBLE TABLES: {categoryFilteredTables.length}
            </span>
            <button
              onClick={handleCallWaiter}
              className="flex items-center gap-1.5 rounded-lg border border-orange-500 bg-orange-600 hover:bg-orange-700 px-3 py-1.5 font-mono text-[10.5px] font-black uppercase text-white transition shadow-sm whitespace-nowrap"
            >
              <Bell className="h-3 w-3" />
              <span>CALL WAITER</span>
            </button>
          </div>
        </div>

        <div className="bg-stone-50 border-b-2 border-slate-900 p-3 shrink-0">
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
                    className="bg-white border-2 border-slate-900 rounded-xl p-2.5 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between gap-1.5 shrink-0 w-[260px]"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span
                        className="font-mono text-[11px] font-black text-slate-900 truncate"
                        title={b.name}
                      >
                        {b.name}
                      </span>
                      <span className="font-mono text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded ml-1 shrink-0">
                        TOTAL: {b.total}
                      </span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-600 truncate">
                      {b.sources}
                     </div>
                    <div className="flex items-center justify-between font-mono text-[9px] font-extrabold text-orange-700">
                      <span>STATUS:</span>
                      <span className="bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded text-[8.5px] truncate">
                        {b.status}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/80">
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
                                  ? 'bg-orange-600 text-white border-orange-700 shadow-xs ring-1 ring-orange-500'
                                  : 'bg-stone-50 text-slate-700 border-slate-300 hover:bg-orange-100 hover:text-orange-900'
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

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[70%] border-r-2 border-slate-900 p-3 overflow-y-auto bg-stone-100/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[11px] font-black text-slate-900 uppercase">
                ALL TABLES
              </span>
            </div>

            {categoryFilteredTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <span className="font-mono text-xs font-bold">
                  NO ACTIVE ORDERS FOR THIS FILTER
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {categoryFilteredTables.map((tbl, idx) => (
                  <div
                    key={`${tbl.id}-${idx}`}
                    onClick={() => handleOpenTable(tbl.tableNumber)}
                    className="bg-white border-2 border-slate-900 rounded-xl p-3 shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] cursor-pointer transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-900 mb-2">
                        <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-900">
                          <span>{tbl.tableNumber}</span>
                          {tbl.isVip && (
                            <span className="text-amber-500 font-bold">★</span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-orange-600" />
                          <span>
                            {tbl.elapsedMinutes}m (KOT #{tbl.kotNumber})
                          </span>
                          {tbl.items.some(hasSpecialInstruction) && (
                            <span
                              title={buildInstructionTooltip(tbl.items)}
                              className="h-2 w-2 rounded-full bg-orange-500 animate-pulse inline-block ml-1 shrink-0"
                            />
                          )}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {tbl.items.map((it) => (
                          <div
                            key={it.id}
                            className="bg-stone-50 border border-slate-300 rounded-lg p-2 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs font-mono font-black">
                              <span className="text-slate-900 truncate pr-1">
                                {it.quantity}x {it.name}
                              </span>
                              <span className="font-mono text-[8.5px] font-bold bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-800 shrink-0">
                                STAGE{' '}
                                {it.stage === 'RECEIVED'
                                  ? '1: RECEIVED'
                                  : it.stage === 'PREPARING'
                                  ? '2: PREPARING'
                                  : '3: READY'}
                              </span>
                            </div>

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
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-stone-200'
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
                        handleOpenTable(tbl.tableNumber);
                      }}
                      className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white font-mono text-[10px] font-black rounded uppercase tracking-wider transition text-center shadow-xs"
                    >
                      MANAGE {tbl.tableNumber} ➔
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-[30%] bg-white p-3 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 mb-3">
                <span className="font-mono text-[11px] font-black text-slate-900 uppercase">
                  TIME QUEUE
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-bold">
                  TIMED ORDERS
                </span>
              </div>

              <div className="space-y-2.5">
                {timeQueueTickets.map((tq, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenTable(tq.table)}
                    className="p-2.5 rounded-lg border-2 border-slate-900 bg-stone-50 hover:bg-orange-50/50 cursor-pointer transition shadow-[2px_2px_0px_#0f172a]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-black text-slate-900">
                        #{tq.ticketNum} • {tq.table}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500">
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
                ))}
              </div>
            </div>

            <button
              onClick={handleCallWaiter}
              className="w-full mt-4 py-2.5 rounded-xl border-2 border-slate-900 bg-stone-100 hover:bg-orange-50 font-mono text-xs font-black uppercase text-slate-900 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#0f172a] transition"
            >
              <Bell className="h-3.5 w-3.5 text-orange-600" />
              <span>CALL FLOOR RUNNER TO PASS</span>
            </button>
          </div>
        </div>
      </div>
    </KitchenTabletHousing>
  );
};