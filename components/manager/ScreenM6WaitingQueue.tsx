'use client';

import React, { useState } from 'react';
import { MANAGER_SECTIONS, useManagerStore } from '../../store/useManagerStore';
import { QueueToken } from '../../types/manager';
import { useSharedBridge } from '../../store/useSharedBridge';
import { Users, Clock, Send, CheckCircle, Plus } from 'lucide-react';

export function ScreenM6WaitingQueue() {
  const { queueTokens, addQueueToken, updateQueueStatus } = useManagerStore();
  const { tables, waiterSeatsGuests } = useSharedBridge();

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState('4');
  const [section, setSection] = useState<string>(MANAGER_SECTIONS[0]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    addQueueToken(guestName, phone, Number(pax) || 2, section);
    setGuestName('');
    setPhone('');
  };

  const handleSeat = (token: QueueToken) => {
    const vacantTable = tables.find((t) => t.status === 'VACANT');
    if (vacantTable) {
      waiterSeatsGuests(vacantTable.number, token.pax, 'Manager Host');
      updateQueueStatus(token.id, 'SEATED');
      alert(`Guest ${token.guestName} seated at Table ${vacantTable.number}!`);
    } else {
      alert('No vacant tables available right now!');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-5 border border-[#D6D3D1] rounded-2xl bg-white shadow-sm">
      {/* Left Queue List */}
      <div className="md:col-span-7 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-black font-mono text-slate-900">
              ACTIVE DINING QUEUE TOKENS
            </h3>
          </div>
          <span className="bg-orange-100 text-orange-800 font-mono text-xs font-bold px-2 py-0.5 rounded">
            {queueTokens.filter((q) => q.status !== 'SEATED').length} WAITING
          </span>
        </div>

        <div className="space-y-2.5 mt-4">
          {queueTokens.map((tk) => (
            <div
              key={tk.id}
              className={`p-3.5 rounded-xl border-2 font-mono text-xs flex flex-wrap items-center justify-between gap-3 ${
                tk.status === 'SEATED'
                  ? 'bg-[#FAF8F5] border-slate-200 opacity-60'
                  : 'bg-white border-[#EAE5DF] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">{tk.tokenNumber}</span>
                  <span className="font-bold text-slate-800">{tk.guestName}</span>
                  <span className="bg-[#FAF8F5] text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-bold">
                    {tk.pax} Pax
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Phone: {tk.phone} • Pref: {tk.section} • Wait: {tk.waitTimeMins}m
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  tk.status === 'WAITING'
                    ? 'bg-amber-100 text-amber-800'
                    : tk.status === 'PAGED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  [{tk.status}]
                </span>
                {tk.status !== 'SEATED' && (
                  <>
                    <button
                      onClick={() => {
                        updateQueueStatus(tk.id, 'PAGED');
                        alert(`SMS Ping sent to ${tk.phone}: 'Your table at Thoogudeepa Biryani is ready!'`);
                      }}
                      className="bg-[#FAF8F5] border border-slate-300 px-2 py-1 rounded text-[11px] font-bold hover:bg-stone-200 transition"
                    >
                      PAGE SMS
                    </button>
                    <button
                      onClick={() => handleSeat(tk)}
                      className="bg-[#9C3D1E] text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-emerald-600 transition"
                    >
                      SEAT
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Add Token Form */}
      <div className="md:col-span-5 bg-white border border-[#EAE5DF] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-black font-mono text-slate-900 pb-3 border-b border-slate-200 uppercase">
            Issue New Dining Token
          </h3>

          <form onSubmit={handleAdd} className="space-y-3 mt-4 font-mono text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GUEST NAME:</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Ramesh Gowda"
                required
                className="w-full bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg p-2 font-mono text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">MOBILE NUMBER:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg p-2 font-mono text-xs focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">PARTY SIZE (PAX):</label>
                <input
                  type="number"
                  value={pax}
                  onChange={(e) => setPax(e.target.value)}
                  min="1"
                  max="20"
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg p-2 font-mono text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">SECTION PREF:</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg p-2 font-mono text-xs focus:outline-none font-bold"
                >
                  {MANAGER_SECTIONS.map((managerSection) => (
                    <option key={managerSection} value={managerSection}>{managerSection}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-[#9C3D1E] text-white py-3 px-4 rounded-xl font-mono text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition shadow-xs"
            >
              + ISSUE TOKEN &amp; SMS PING
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
