import React, { useState } from 'react';
import { X, Link2, Unlink, CheckCircle2, AlertCircle, Users, Armchair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSharedBridge } from '../../store/useSharedBridge';

interface Props {
  open: boolean;
  onClose: () => void;
  tableNum: string;
  onMergedSuccess?: (msg: string) => void;
}

export function TabletMergeModal({ open, onClose, tableNum, onMergedSuccess }: Props) {
  const { tables, waiterMergeTables, waiterUnmergeTable, waiterMergeSeatGroup, waiterUnmergeSeatGroup } = useSharedBridge();
  const currentTable = tables.find((t) => t.number === tableNum);

  const [activeTab, setActiveTab] = useState<'table' | 'seat'>('table');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('ALL');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  if (!currentTable) return null;

  const isAlreadyMerged = Boolean(currentTable.mergedWith);
  const groupPeers = currentTable.mergeGroupPeers || (isAlreadyMerged ? [tableNum, currentTable.mergedWith!] : [tableNum]);

  // Candidates for merging: other tables (prefer same section or occupied/vacant)
  const candidateTables = tables.filter(
    (t) => t.number !== tableNum && !groupPeers.includes(t.number) && (filterSection === 'ALL' || t.section === filterSection)
  );

  const handleMerge = () => {
    if (!selectedTarget) return;
    waiterMergeTables(tableNum, selectedTarget);
    if (onMergedSuccess) {
      onMergedSuccess(`Table ${tableNum} merged with ${selectedTarget}`);
    }
    onClose();
  };

  const handleUnmerge = () => {
    waiterUnmergeTable(tableNum);
    if (onMergedSuccess) {
      onMergedSuccess(`Table ${tableNum} unmerged successfully`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-[540px] max-w-full max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#EAE5DF] z-10 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#EAE5DF] bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-purple-800">
                    Floor Captain Operations
                  </p>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">
                    Merge / Group Tables
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white hover:bg-stone-200 border border-[#EAE5DF] rounded-xl transition cursor-pointer"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-[#EAE5DF] bg-[#FAF8F5] px-6 pt-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-4 py-2.5 font-mono text-xs font-black rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'table'
                    ? 'bg-white border-purple-700 text-purple-900 shadow-2xs'
                    : 'text-stone-500 border-transparent hover:text-stone-800'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Merge Tables</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seat')}
                className={`px-4 py-2.5 font-mono text-xs font-black rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'seat'
                    ? 'bg-white border-purple-700 text-purple-900 shadow-2xs'
                    : 'text-stone-500 border-transparent hover:text-stone-800'
                }`}
              >
                <Armchair className="h-3.5 w-3.5" />
                <span>Merge Chairs / Seats</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 font-mono">
              {activeTab === 'table' ? (
                <>
                  {/* Active Table Status Banner */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">
                        Current Focus Table
                      </span>
                      <span className="text-xl font-black text-stone-950">
                        {currentTable.number} ({currentTable.section})
                      </span>
                      <span className="text-xs text-stone-600 block mt-0.5">
                        {currentTable.capacity} seats · Status: {currentTable.status} · Bill: ₹{currentTable.currentBill || 0}
                      </span>
                    </div>
                    {isAlreadyMerged && (
                      <span className="px-2.5 py-1 bg-purple-200 text-purple-950 rounded-lg text-xs font-black uppercase border border-purple-300">
                        Currently Grouped
                      </span>
                    )}
                  </div>

                  {/* Already Merged State */}
                  {isAlreadyMerged ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                          <AlertCircle className="h-4 w-4 text-amber-700" />
                          <span>Table is part of a combined party:</span>
                        </div>
                        <p className="text-xs text-stone-700">
                          This table is merged with <strong className="text-stone-950">{groupPeers.join(', ')}</strong>.
                          Orders, tickets, and billing are consolidated together across this group.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleUnmerge}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <Unlink className="h-4 w-4" />
                        <span>Unmerge Table {currentTable.number} (Restore Separate Billing)</span>
                      </button>
                    </div>
                  ) : (
                    /* Merge Candidates Selection */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-stone-700 uppercase tracking-wider">
                          Select Table to Link With:
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          {candidateTables.length} tables available
                        </span>
                      </div>

                      {/* Candidate Grid */}
                      <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {candidateTables.map((t) => {
                          const isSelected = selectedTarget === t.number;
                          return (
                            <button
                              key={t.number}
                              type="button"
                              onClick={() => setSelectedTarget(t.number)}
                              className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between cursor-pointer active:scale-95 ${
                                isSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300'
                                  : 'bg-[#FAF8F5] border-[#EAE5DF] hover:bg-white text-stone-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-black text-sm">{t.number}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                              <div className="mt-2 text-[10px] opacity-80 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{t.capacity} seats</span>
                                <span className="ml-auto">₹{t.currentBill || 0}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-stone-200 flex gap-2.5">
                        <button
                          type="button"
                          onClick={onClose}
                          className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!selectedTarget}
                          onClick={handleMerge}
                          className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Link2 className="h-4 w-4" />
                          <span>Link with {selectedTarget || 'Selected'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ── Seat / Chair Merging Tab ── */
                <div className="space-y-4">
                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
                    <p className="text-xs text-purple-950 font-black">
                      Combine Multiple Chairs on {currentTable.number}
                    </p>
                    <p className="text-[11px] text-stone-600 mt-1">
                      Merged chairs share orders, items and a unified check for group billing.
                    </p>
                  </div>

                  {/* Active Merged Seat Groups */}
                  {currentTable.mergedSeatGroups && Object.keys(currentTable.mergedSeatGroups).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-black text-stone-700 uppercase tracking-wider">
                        Active Merged Chair Groups
                      </p>
                      <div className="space-y-2">
                        {Object.entries(currentTable.mergedSeatGroups).map(([groupKey, seats]) => (
                          <div
                            key={groupKey}
                            className="p-3 bg-purple-100/70 border border-purple-300 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-purple-700" />
                              <span className="font-black text-stone-900 text-xs">{groupKey}</span>
                              <span className="text-[10px] text-stone-600">
                                (Chairs {seats.join(', ')})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                waiterUnmergeSeatGroup(tableNum, groupKey);
                                if (onMergedSuccess) onMergedSuccess(`${groupKey} unmerged`);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black cursor-pointer shadow-2xs"
                            >
                              Unmerge Chairs
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chair Selection for Merging */}
                  <div className="space-y-2">
                    <p className="text-xs font-black text-stone-700 uppercase tracking-wider">
                      Select Chairs to Combine ({selectedSeats.length} selected):
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: currentTable.capacity || 4 }, (_, i) => i + 1).map((ch) => {
                        const isSelected = selectedSeats.includes(ch);
                        const isAlreadyInGroup = Object.values(currentTable.mergedSeatGroups || {}).some(
                          (seats) => seats.includes(ch)
                        );

                        return (
                          <button
                            key={ch}
                            type="button"
                            disabled={isAlreadyInGroup}
                            onClick={() => {
                              setSelectedSeats((prev) =>
                                prev.includes(ch) ? prev.filter((s) => s !== ch) : [...prev, ch]
                              );
                            }}
                            className={`p-3 rounded-2xl border-2 font-mono flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                              isAlreadyInGroup
                                ? 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-purple-700 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                                : 'bg-[#FAF8F5] border-[#EAE5DF] text-stone-800 hover:bg-white'
                            }`}
                          >
                            <Armchair className="h-5 w-5" />
                            <span className="text-xs font-black">Chair {ch}</span>
                            {isAlreadyInGroup && (
                              <span className="text-[8.5px] opacity-70">Merged</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seat Merge Actions */}
                  <div className="pt-3 border-t border-stone-200 flex gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={selectedSeats.length < 2}
                      onClick={() => {
                        if (selectedSeats.length < 2) return;
                        const sorted = [...selectedSeats].sort((a, b) => a - b);
                        const groupKey = `Chairs ${sorted.join(' & ')}`;
                        waiterMergeSeatGroup(tableNum, groupKey, sorted);
                        if (onMergedSuccess) onMergedSuccess(`${groupKey} combined successfully`);
                        setSelectedSeats([]);
                        onClose();
                      }}
                      className="flex-1 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>Merge ({selectedSeats.length}) Chairs</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
