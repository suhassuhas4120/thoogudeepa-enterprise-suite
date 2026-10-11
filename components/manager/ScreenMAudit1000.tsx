'use client';

import React, { useState, useMemo } from 'react';
import {
  THOUSAND_ISSUES_DATA,
  OPERATIONAL_CATEGORIES,
  OperationalIssueItem,
} from '../../data/thousandIssuesData';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ScreenMAudit1000: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<number>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return THOUSAND_ISSUES_DATA.filter((item) => {
      const matchSection = selectedSection === 0 || item.sectionIndex === selectedSection;
      const matchSearch =
        !q ||
        item.description.toLowerCase().includes(q) ||
        item.mitigation.toLowerCase().includes(q) ||
        item.sectionTitle.toLowerCase().includes(q) ||
        String(item.number).includes(q) ||
        String(item.id).includes(q);
      return matchSection && matchSearch;
    });
  }, [selectedSection, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleSectionChange = (secIndex: number) => {
    setSelectedSection(secIndex);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner Overview */}
      <div className="rounded-3xl border border-[#EAE5DF] bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>1,000-Point Operational Resilience Deck</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Comprehensive Operational & Security Defense Matrix
          </h2>
          <p className="text-xs text-stone-500 max-w-2xl font-medium">
            Active audit index covering all 1,000 potential friction points, user mistakes, intentional exploits, application anomalies, and server distress scenarios for Thoogudeepa Enterprise Suite.
          </p>
        </div>

        {/* Global Resilience Stats */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 text-center">
            <div className="text-xl font-black font-mono text-stone-900">1,000</div>
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Audited Scenarios</div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center">
            <div className="text-xl font-black font-mono text-emerald-800">100%</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Defense State</div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-center">
            <div className="text-xl font-black font-mono text-amber-800">5</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pillars Protected</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleSectionChange(0)}
            className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-black tracking-tight border transition-all ${
              selectedSection === 0
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            All 1,000 Scenarios
          </button>
          {OPERATIONAL_CATEGORIES.map((cat) => (
            <button
              key={cat.index}
              onClick={() => handleSectionChange(cat.index)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-black tracking-tight border transition-all flex items-center gap-1.5 ${
                selectedSection === cat.index
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{cat.title}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${cat.badgeColor}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search across all 1,000 failure modes, exploits, mistakes, or mitigation safeguards..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-xs font-bold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 hover:text-stone-600 px-2 py-0.5 rounded-lg bg-stone-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Page Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-bold px-1">
        <div>
          Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} matching points
        </div>
        <div className="flex items-center gap-2">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 rounded-lg border border-stone-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 w-7 rounded-lg border border-stone-200 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Issues Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <AnimatePresence mode="popLayout">
          {paginatedItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-3xl border border-stone-200 bg-white p-4.5 shadow-2xs space-y-3 flex flex-col justify-between hover:border-stone-300 transition-all"
            >
              <div className="space-y-2">
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-stone-400">
                      #{String(item.id).padStart(4, '0')}
                    </span>
                    <span className="text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {item.sectionTitle} • Item {item.number}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    <span>{item.status}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs font-bold text-stone-800 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Protective Mitigation Safeguard */}
              <div className="pt-2.5 border-t border-stone-100 flex items-start gap-2 text-[10px] text-stone-500 font-medium bg-stone-50/60 p-2.5 rounded-2xl">
                <Lock className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-stone-700 font-bold">Safeguard: </strong>
                  {item.mitigation}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-stone-50"
          >
            First
          </button>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-stone-50"
          >
            Previous
          </button>
          <span className="px-4 py-1.5 text-xs font-mono font-bold text-stone-600">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-stone-50"
          >
            Next
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold disabled:opacity-40 hover:bg-stone-50"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
};
