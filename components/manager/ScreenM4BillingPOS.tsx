'use client';

import React, { useState, useEffect } from 'react';
import { useSharedBridge } from '../../store/useSharedBridge';
import { useManagerStore } from '../../store/useManagerStore';
import { INITIAL_MENU_ITEMS } from '../../data/menuItems';
import {
  IndianRupee,
  Printer,
  Percent,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Banknote,
  Smartphone,
  CheckCircle2,
  Search,
  Utensils,
  PlusCircle,
  LayoutGrid,
  Sparkles,
  ArrowLeft,
  Flame,
  AlertCircle,
  Clock,
  Armchair,
} from 'lucide-react';

interface BillItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  isFree: boolean;
  seatNumber?: number;
  stage: 'PLACED' | 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'NEW_EXTRA';
  isExistingKOT: boolean;
  ticketId?: string;
  options?: string;
  addOns?: string[];
}

export function ScreenM4BillingPOS() {
  const { tables, kdsTickets, waiterFiresKOT, waiterRecordsPayment, waiterVacatesTable, recordSettledBill } = useSharedBridge();
  const {
    selectedTableNumber,
    selectedSeatNumber,
    setSelectedTableNumber,
    setSelectedSeatNumber,
    setCurrentScreen,
    activeManager,
  } = useManagerStore();

  const cleanNum = (s: string) => (s || '').replace(/^(TABLE\s*|T-?)/i, '').trim();
  const targetNum = cleanNum(selectedTableNumber);

  const getSectionName = (rawSection?: string, tableNum?: string): string => {
    const s = (rawSection || '').toLowerCase();
    const num = parseInt(cleanNum(tableNum || ''), 10) || 1;
    if (s.includes('section a') || s.includes('sec_a') || s.includes('express') || s.includes('couple') || num <= 8) {
      return 'Section A';
    }
    if (s.includes('section b') || s.includes('sec_b') || s.includes('main dining') || num <= 16) {
      return 'Section B';
    }
    if (s.includes('section c') || s.includes('sec_c') || s.includes('family') || num <= 24) {
      return 'Section C';
    }
    return 'Section D';
  };

  const selectedTable =
    tables.find((t) => cleanNum(t.number) === targetNum) ||
    tables[0] || {
      id: 'tbl-01',
      number: selectedTableNumber || 'T-01',
      section: 'Section A',
      capacity: 4,
      status: 'VACANT' as const,
      guestCount: 0,
      seatedTime: '--',
      currentBill: 0,
      serverName: 'Captain Ramesh',
      kotCount: 0,
    };

  const currentSeat: 'ALL' | number = selectedSeatNumber || 'ALL';

  // Gather existing KOT items for this table from kdsTickets
  const groupPeers: string[] = selectedTable?.mergeGroupPeers ?? [selectedTable?.number || 'T-01'];
  const tableTickets = kdsTickets.filter(
    (tk) =>
      groupPeers.some((peer) => cleanNum(peer) === cleanNum(tk.tableNumber)) &&
      tk.status !== 'COMPLETED'
  );

  const existingItems: BillItem[] = [];
  tableTickets.forEach((tk) => {
    (tk.items || []).forEach((it) => {
      const rawStage = String(it.stage || tk.status || '').toUpperCase();
      const stage: BillItem['stage'] =
        rawStage === 'SERVED'
          ? 'SERVED'
          : rawStage === 'READY' || rawStage === 'PLATED'
          ? 'READY'
          : rawStage === 'PREPARING' || rawStage === 'PREP' || rawStage === 'COOKING'
          ? 'PREPARING'
          : rawStage === 'RECEIVED'
          ? 'RECEIVED'
          : 'PLACED';

      const seat = it.seatNumber || tk.seatNumber || 1;
      const unitPrice = it.price && it.price > 0 ? it.price : 220;

      existingItems.push({
        id: it.id,
        name: it.name,
        price: unitPrice,
        qty: it.quantity,
        isFree: false,
        seatNumber: seat,
        stage,
        isExistingKOT: true,
        ticketId: tk.id,
        options: it.options,
        addOns: it.addOns,
      });
    });
  });

  // Fallback to table activeItems if tickets are empty but activeItems present
  if (existingItems.length === 0 && selectedTable.activeItems && selectedTable.activeItems.length > 0) {
    selectedTable.activeItems.forEach((ai, idx) => {
      const rawStage = String(ai.status || '').toUpperCase();
      const stage: BillItem['stage'] =
        rawStage === 'SERVED'
          ? 'SERVED'
          : rawStage === 'READY' || rawStage === 'PLATED'
          ? 'READY'
          : rawStage === 'PREPARING' || rawStage === 'PREP' || rawStage === 'COOKING'
          ? 'PREPARING'
          : rawStage === 'RECEIVED'
          ? 'RECEIVED'
          : 'PLACED';

      const seat = ai.seatNumber || 1;
      const menuItem = INITIAL_MENU_ITEMS.find((m) => m.name === ai.name);
      const unitPrice = ai.price && ai.price > 0 ? ai.price : menuItem ? menuItem.price : 220;

      existingItems.push({
        id: ai.id || `ai-${idx}`,
        name: ai.name,
        price: unitPrice,
        qty: ai.quantity,
        isFree: false,
        seatNumber: seat,
        stage,
        isExistingKOT: true,
        ticketId: 'tbl-direct',
        options: ai.options,
      });
    });
  }

  // Extra newly added items (not yet fired to kitchen)
  const [extraItems, setExtraItems] = useState<BillItem[]>([]);
  const [fireSuccessMessage, setFireSuccessMessage] = useState<string | null>(null);

  // Clear extra items when switching tables
  useEffect(() => {
    setExtraItems([]);
    setFireSuccessMessage(null);
  }, [selectedTable.number]);

  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'AGGREGATOR'>('UPI');
  const [cashTendered, setCashTendered] = useState('1500');
  const [settledSuccess, setSettledSuccess] = useState(false);

  // Menu items side tab state for direct counter ordering
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showMenuCatalog, setShowMenuCatalog] = useState(true);

  const categories = [
    'ALL',
    'Donne Biryani',
    'Starters & Kebabs',
    'Sunday Specials',
    'Sides & Desserts',
    'Beverages',
  ];

  const filteredMenuItems = INITIAL_MENU_ITEMS.filter((item) => {
    const term = menuSearch.trim().toLowerCase();
    const matchesSearch =
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.prepMode && item.prepMode.toLowerCase().includes(term));

    const matchesCat = (() => {
      if (selectedCategory === 'ALL') return true;
      const catLower = selectedCategory.toLowerCase();
      const itemCat = (item.category || '').toLowerCase();
      const itemName = item.name.toLowerCase();

      if (catLower.includes('biryani')) {
        return itemCat.includes('biryani') || itemCat.includes('rice') || itemName.includes('biryani');
      }
      if (catLower.includes('starter') || catLower.includes('kebab')) {
        return (
          itemCat.includes('starter') ||
          itemName.includes('kabab') ||
          itemName.includes('fry') ||
          itemName.includes('dry') ||
          itemName.includes('wings') ||
          itemName.includes('chops') ||
          itemName.includes('ball') ||
          itemName.includes('leg piece')
        );
      }
      if (catLower.includes('sunday')) {
        return (
          itemCat.includes('sunday') ||
          item.badge === 'Chef Special' ||
          itemName.includes('soup') ||
          itemName.includes('idli') ||
          itemName.includes('dosa') ||
          itemName.includes('gojju')
        );
      }
      if (catLower.includes('dessert') || catLower.includes('side')) {
        return (
          itemCat.includes('dessert') ||
          itemCat.includes('side') ||
          itemName.includes('jamun') ||
          itemName.includes('parotta')
        );
      }
      if (catLower.includes('beverage')) {
        return (
          itemCat.includes('beverage') ||
          itemName.includes('coffee') ||
          itemName.includes('water') ||
          itemName.includes('soda')
        );
      }
      return itemCat === catLower;
    })();

    return matchesSearch && matchesCat;
  });

  // Adding item from direct menu
  const handleAddDirectItem = (menuItem: typeof INITIAL_MENU_ITEMS[0]) => {
    const targetSeat = currentSeat === 'ALL' ? 1 : currentSeat;

    setExtraItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.name === menuItem.name && it.seatNumber === targetSeat
      );
      if (existingIdx >= 0) {
        return prev.map((it, idx) =>
          idx === existingIdx ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [
        ...prev,
        {
          id: `extra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
          isFree: false,
          seatNumber: targetSeat,
          stage: 'NEW_EXTRA',
          isExistingKOT: false,
          options: menuItem.prepMode || 'Dum Pot',
          addOns: [],
        },
      ];
    });
  };

  const updateExtraQty = (id: string, delta: number) => {
    setExtraItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: it.qty + delta } : it))
        .filter((it) => it.qty > 0)
    );
  };

  const removeExtraItem = (id: string) => {
    setExtraItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Real-time Action: Fire ONLY Extra Items to Kitchen & Add to Table Bill
  const handleFireExtraToKitchen = () => {
    if (extraItems.length === 0) return;

    const targetSeat = typeof currentSeat === 'number' ? currentSeat : undefined;
    const itemsToFire = extraItems.map((ex) => {
      const found = INITIAL_MENU_ITEMS.find((m) => m.name === ex.name);
      const menuItem = (found || {
        ...INITIAL_MENU_ITEMS[0],
        id: ex.id,
        name: ex.name,
        price: ex.price,
      }) as any;
      return {
        item: menuItem,
        selectedOption: ex.options || 'Regular',
        quantity: ex.qty,
        addOns: ex.addOns || [],
      };
    });

    // Fire KOT ticket on the shared bridge
    waiterFiresKOT(
      selectedTable.number,
      activeManager?.name || 'Floor Lead',
      itemsToFire,
      targetSeat
    );

    const extraCount = extraItems.reduce((sum, it) => sum + it.qty, 0);
    const extraCost = extraItems.reduce((sum, it) => sum + it.price * it.qty, 0);

    // Clear extra items state as they are now active in kdsTickets
    setExtraItems([]);
    setFireSuccessMessage(
      `✓ KOT Sent to Kitchen! ${extraCount} extra items (₹${extraCost}) added to Table ${selectedTable.number} running bill.`
    );

    setTimeout(() => {
      setFireSuccessMessage(null);
    }, 4500);
  };

  // Combine items for display
  const allCombinedItems = [...existingItems, ...extraItems];
  const displayedItems =
    currentSeat === 'ALL'
      ? allCombinedItems
      : allCombinedItems.filter((it) => it.seatNumber === currentSeat);

  // Math
  const subtotal = displayedItems.reduce((acc, item) => acc + (item.isFree ? 0 : item.price * item.qty), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = subtotal - discountAmount;
  const cgst = Math.round(taxableAmount * 0.025);
  const sgst = Math.round(taxableAmount * 0.025);
  const grandTotal = taxableAmount + cgst + sgst;
  const tenderedNum = Number(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - grandTotal);

  const handleSettle = () => {
    // If there are still unfired extra items, automatically fire them before settlement
    if (extraItems.length > 0) {
      handleFireExtraToKitchen();
    }

    const invNum = `INV-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    recordSettledBill({
      invoiceNumber: invNum,
      items: displayedItems.map((it) => ({
        id: String(it.id),
        name: it.name,
        quantity: it.qty,
        price: it.price,
        totalPrice: it.price * it.qty,
        options: it.options,
        seatNumber: it.seatNumber,
      })),
      subtotal,
      totalTax: cgst + sgst,
      cgst,
      sgst,
      grandTotal,
      method: paymentMethod,
      cashTendered: paymentMethod === 'CASH' ? tenderedNum : undefined,
      cashChange: paymentMethod === 'CASH' ? changeDue : undefined,
      seatLabel: currentSeat === 'ALL' ? 'Whole Table' : `Chair ${currentSeat}`,
      seatNumber: typeof currentSeat === 'number' ? currentSeat : undefined,
      captainName: selectedTable?.serverName || 'Manager Host',
      tableName: selectedTable?.number || 'T-01',
      section: getSectionName(selectedTable?.section, selectedTable?.number),
      guestCount: selectedTable?.guestCount || 2,
      formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      formattedTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });

    waiterRecordsPayment(
      selectedTable.number,
      paymentMethod,
      grandTotal,
      typeof currentSeat === 'number' ? currentSeat : undefined
    );

    if (currentSeat === 'ALL') {
      waiterVacatesTable(selectedTable.number);
    }

    setSettledSuccess(true);
    setTimeout(() => {
      setSettledSuccess(false);
      setCurrentScreen(2); // Jump back to Live Overview
    }, 1800);
  };

  const getStageBadge = (stage: BillItem['stage']) => {
    switch (stage) {
      case 'SERVED':
        return { text: 'SERVED', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'READY':
        return { text: 'READY', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'PREPARING':
        return { text: 'PREPARING', cls: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'RECEIVED':
        return { text: 'RECEIVED', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'NEW_EXTRA':
        return { text: '+ EXTRA (NOT FIRED)', cls: 'bg-purple-100 text-purple-900 border-purple-400 font-black animate-pulse' };
      default:
        return { text: 'PLACED', cls: 'bg-orange-100 text-orange-800 border-orange-300' };
    }
  };

  return (
    <div className="w-full mx-auto p-1 space-y-4">
      {/* Top POS Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#EAE5DF] rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen(2)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-stone-50 font-mono text-xs font-bold text-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Live Overview</span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9C3D1E] text-white shadow-sm">
            <Utensils className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono text-xs sm:text-sm font-black text-slate-900 uppercase">
              Billing &amp; POS Desk
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 block mt-0.5">
              Table {selectedTable.number} • {getSectionName(selectedTable.section, selectedTable.number)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMenuCatalog(!showMenuCatalog)}
            className={`px-3.5 py-1.5 rounded-lg border border-[#EAE5DF] font-mono text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
              showMenuCatalog
                ? 'bg-[#9C3D1E] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-slate-800 hover:bg-stone-200'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{showMenuCatalog ? 'Hide Menu' : 'Show Menu'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column POS Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: DIRECT ORDER MENU ITEMS SIDE TAB */}
        {showMenuCatalog && (
          <div className="lg:col-span-4 bg-white border border-[#EAE5DF] rounded-xl p-4 shadow-sm flex flex-col h-[680px]">
            {/* Header & Search */}
            <div className="pb-3 border-b border-slate-200 shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                  <span>COUNTER MENU</span>
                </h4>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search biryani, kebabs, coffee..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#9C3D1E] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-slate-700 hover:bg-stone-200 border border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Quick Punch Grid */}
            <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
              {filteredMenuItems.map((menuItem) => (
                <button
                  key={menuItem.id}
                  onClick={() => handleAddDirectItem(menuItem)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 bg-white transition flex items-center justify-between group shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <div className="pr-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-slate-900 group-hover:text-[#9C3D1E] transition">
                        {menuItem.name}
                      </span>
                      {menuItem.badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-orange-100 text-[#9C3D1E] border border-orange-200">
                          {menuItem.badge}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <span className="font-bold text-slate-600">{menuItem.category}</span>
                      <span>•</span>
                      <span className="text-slate-500 font-medium">{menuItem.prepMode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-black text-slate-900 group-hover:text-[#9C3D1E]">
                      ₹{menuItem.price}
                    </span>
                    <span className="h-8 w-8 rounded-lg bg-[#9C3D1E] group-hover:bg-orange-700 text-white flex items-center justify-center transition shadow-2xs">
                      <PlusCircle className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MIDDLE COLUMN: [TAX INVOICE BILL & REAL-TIME KOT FIRE DESK] */}
        <div
          className={`${
            showMenuCatalog ? 'lg:col-span-5' : 'lg:col-span-7'
          } bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-col justify-between h-[680px]`}
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header & Table Selector */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#9C3D1E] flex items-center justify-center shrink-0">
                  <Utensils className="h-4.5 w-4.5 text-[#9C3D1E]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black font-mono text-slate-900">
                    Tax Invoice &amp; Kitchen KOT Desk
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    KOTs: {selectedTable.kotCount} • Total: ₹{selectedTable.currentBill}
                  </span>
                </div>
              </div>

              {/* Table Selector Dropdown */}
              <div className="flex items-center">
                <select
                  value={selectedTable.number}
                  onChange={(e) => {
                    setSelectedTableNumber(e.target.value);
                    setSelectedSeatNumber('ALL');
                  }}
                  className="bg-[#FAF8F5] border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 font-mono text-xs font-black text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.number}>
                      Table {t.number} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Chair Filter Rail */}
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-b border-slate-200 shrink-0 font-mono text-xs">
              <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 shadow-2xs">
                <Armchair className="h-4 w-4 text-[#9C3D1E]" />
                <span>CHAIR:</span>
              </span>
              <button
                onClick={() => setSelectedSeatNumber('ALL')}
                className={`px-3 py-1.5 rounded-lg font-black transition shrink-0 cursor-pointer ${
                  currentSeat === 'ALL'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-slate-700 border border-slate-200 hover:bg-stone-200'
                }`}
              >
                All Table ({allCombinedItems.reduce((s, i) => s + i.qty, 0)})
              </button>
              {Array.from({ length: selectedTable.capacity || 4 }).map((_, idx) => {
                const chairNum = idx + 1;
                const count = allCombinedItems
                  .filter((i) => i.seatNumber === chairNum)
                  .reduce((s, i) => s + i.qty, 0);
                const isSelected = currentSeat === chairNum;
                return (
                  <button
                    key={chairNum}
                    onClick={() => setSelectedSeatNumber(chairNum)}
                    className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#9C3D1E] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-slate-700 border border-slate-200 hover:bg-stone-200'
                    }`}
                  >
                    <span>Chair {chairNum}</span>
                    {count > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-black ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-950'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Success Banner if KOT Fired */}
            {fireSuccessMessage && (
              <div className="my-2 p-2.5 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{fireSuccessMessage}</span>
              </div>
            )}

            {/* High-Visibility Banner & Action: Send Extra Items to Kitchen */}
            {extraItems.length > 0 && (
              <div className="my-2 p-2.5 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-center justify-between gap-2 shadow-xs shrink-0 animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <Flame className="h-4 w-4 text-orange-600 animate-pulse shrink-0" />
                  <div className="min-w-0 font-mono">
                    <div className="text-xs font-black text-amber-950 truncate">
                      {extraItems.reduce((s, i) => s + i.qty, 0)} New Items to Send
                    </div>
                    <div className="text-[10px] text-amber-800 font-bold truncate">
                      Total: ₹{extraItems.reduce((s, i) => s + i.price * i.qty, 0)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleFireExtraToKitchen}
                  className="px-3.5 py-1.5 bg-[#9C3D1E] hover:bg-orange-700 text-white font-mono text-xs font-black rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Send to Kitchen (KOT)</span>
                </button>
              </div>
            )}

            {/* Items Table */}
            <div className="mt-2 flex-1 overflow-y-auto overflow-x-auto pr-1">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#EAE5DF] text-slate-500 text-left sticky top-0 bg-white">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-center">Stage</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedItems.length > 0 ? (
                    displayedItems.map((it) => {
                      const badge = getStageBadge(it.stage);
                      return (
                        <tr
                          key={it.id}
                          className={`hover:bg-[#FAF8F5] transition ${
                            !it.isExistingKOT ? 'bg-purple-50/50' : ''
                          }`}
                        >
                          <td className="py-2.5 font-bold text-slate-800">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">{it.name}</span>
                              {it.seatNumber && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                                  Chair {it.seatNumber}
                                </span>
                              )}
                            </div>
                            {it.options && (
                              <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                                Option: {it.options}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badge.cls}`}>
                              {badge.text}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            {!it.isExistingKOT ? (
                              /* Stepper for extra items */
                              <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                                <button
                                  onClick={() => updateExtraQty(it.id, -1)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs transition cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="px-3 font-black text-slate-900 text-xs sm:text-sm min-w-[28px] text-center">
                                  {it.qty}
                                </span>
                                <button
                                  onClick={() => updateExtraQty(it.id, 1)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs transition cursor-pointer"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="font-black text-slate-900 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs sm:text-sm">
                                {it.qty}x
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-700 text-xs sm:text-sm">₹ {it.price}</td>
                          <td className="py-2.5 text-right font-black text-slate-900 text-xs sm:text-sm">
                            ₹ {(it.price * it.qty).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 text-center">
                            {!it.isExistingKOT ? (
                              <button
                                onClick={() => removeExtraItem(it.id)}
                                className="text-rose-500 hover:text-rose-700 p-1.5 rounded transition cursor-pointer"
                                title="Remove extra item"
                              >
                                <Trash2 className="h-4 w-4 mx-auto" />
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-bold">
                                Fired
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <Armchair className="h-7 w-7 mx-auto text-slate-300 mb-1" />
                        <div className="font-bold text-xs text-slate-500">No items on this bill</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Discount Bar */}
            <div className="mt-2.5 p-2 bg-[#FAF8F5] rounded-xl border border-slate-300 shrink-0">
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Percent className="h-3.5 w-3.5 text-orange-600" />
                  <span>SPECIAL DISCOUNT:</span>
                </span>
                <span className="text-orange-600">{discountPercent}% APPLIED</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`flex-1 py-1 rounded border font-mono text-xs font-bold transition ${
                      discountPercent === pct
                        ? 'bg-[#9C3D1E] text-white border-[#9C3D1E]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {pct === 0 ? 'NONE' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="mt-2.5 pt-2.5 border-t-2 border-dashed border-slate-300 font-mono text-xs space-y-1 shrink-0">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Subtotal:</span>
                <span className="font-black text-sm">₹ {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Special Discount ({discountPercent}%):</span>
                  <span>- ₹ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (2.5%):</span>
                <span className="font-bold">₹ {cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (2.5%):</span>
                <span className="font-bold">₹ {sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-[#EAE5DF]">
                <span>Grand Total:</span>
                <span className="text-[#9C3D1E]">₹ {grandTotal.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PAYMENT & SETTLEMENT DESK */}
        <div
          className={`${
            showMenuCatalog ? 'lg:col-span-3' : 'lg:col-span-5'
          } bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-col justify-between h-[680px]`}
        >
          <div>
            <h3 className="text-sm font-black font-mono text-slate-900 pb-3 border-b border-slate-200 uppercase flex items-center justify-between">
              <span>Payment &amp; Settlement</span>
              <span className="text-xs font-bold text-slate-500">
                {currentSeat === 'ALL' ? 'Table Settlement' : `Chair ${currentSeat}`}
              </span>
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border-2 font-mono text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-[#FAF8F5]'
                }`}
              >
                <QrCode className="h-4.5 w-4.5" />
                <span className="text-xs font-black">UPI / QR</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-xl border-2 font-mono text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-[#FAF8F5]'
                }`}
              >
                <Banknote className="h-4.5 w-4.5" />
                <span className="text-xs font-black">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border-2 font-mono text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-[#FAF8F5]'
                }`}
              >
                <CreditCard className="h-4.5 w-4.5" />
                <span className="text-xs font-black">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('AGGREGATOR')}
                className={`p-3 rounded-xl border-2 font-mono text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  paymentMethod === 'AGGREGATOR'
                    ? 'bg-[#9C3D1E] text-white border-[#9C3D1E] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-[#FAF8F5]'
                }`}
              >
                <Smartphone className="h-4.5 w-4.5" />
                <span className="text-xs font-black">Aggregator</span>
              </button>
            </div>

            {/* Cash Tendered Box */}
            {paymentMethod === 'CASH' && (
              <div className="mt-4 p-3.5 bg-[#FAF8F5] rounded-xl border border-slate-300 font-mono text-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-bold text-slate-800 text-xs">Cash Tendered:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-600 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-28 text-right bg-white border border-[#EAE5DF] rounded-lg p-1.5 font-mono text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 shadow-2xs"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>Change Due:</span>
                  <span className="text-emerald-700 text-base">₹ {changeDue.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            )}

            {/* QR Code Box */}
            {paymentMethod === 'UPI' && (
              <div className="mt-4 p-3 bg-[#FAF8F5] rounded-xl border border-slate-300 text-center font-mono">
                <div className="w-24 h-24 mx-auto bg-white border border-[#EAE5DF] p-1 flex items-center justify-center shadow-xs rounded-lg">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div className="text-[11px] font-bold text-slate-800 mt-2">
                  UPI ID: thoogudeepabiryani@icici
                </div>
              </div>
            )}
          </div>

          {/* Settlement Actions */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 shrink-0">
            {settledSuccess ? (
              <div className="bg-emerald-50 border-2 border-emerald-600 p-3 rounded-xl text-center font-mono text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Bill Settled Successfully</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSettle}
                  className="w-full bg-[#9C3D1E] text-white py-3 px-4 rounded-xl font-mono text-xs font-black tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-600 transition shadow-xs cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Collect Payment (₹{grandTotal.toLocaleString('en-IN')})</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert(`Thermal Tax Invoice Printed for ₹${grandTotal}`)}
                    className="bg-[#FAF8F5] border border-slate-300 py-2 rounded-lg font-mono text-xs font-bold text-slate-700 hover:bg-stone-200 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => alert('Digital Invoice sent via WhatsApp!')}
                    className="bg-[#FAF8F5] border border-slate-300 py-2 rounded-lg font-mono text-xs font-bold text-slate-700 hover:bg-stone-200 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>WhatsApp Bill</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
