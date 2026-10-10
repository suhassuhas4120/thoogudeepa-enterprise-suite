import { NextRequest, NextResponse } from 'next/server';
import { supabase, broadcastStateChange } from '../../../../lib/supabase';
import {
  activeSettlementSessions,
  settledBills,
  clearedSettlementAt,
  normalizeTable,
  ActiveSettlementSession,
  SettledBillSnapshot,
} from '../../../../lib/settlementStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const now = Date.now();
  const sessionsObj: Record<string, ActiveSettlementSession> = {};
  activeSettlementSessions.forEach((val, key) => {
    if (val.initiatedAt && Math.abs(now - val.initiatedAt) < 1800000) {
      sessionsObj[key] = val;
    } else if (val.initiatedAt && now - val.initiatedAt >= 1800000) {
      activeSettlementSessions.delete(key);
    }
  });

  const billsObj: Record<string, SettledBillSnapshot> = {};
  settledBills.forEach((val, key) => {
    if (val.timestamp && Math.abs(now - val.timestamp) < 1800000) {
      billsObj[key] = val;
    } else if (val.timestamp && now - val.timestamp >= 1800000) {
      settledBills.delete(key);
    }
  });

  // Reconcile across cloud serverless instances via Supabase persistence
  try {
    const { data: dbRows } = await supabase
      .from('pings')
      .select('*')
      .in('type', ['SETTLEMENT_SESSION', 'SETTLED_BILL']);

    if (dbRows && dbRows.length > 0) {
      for (const row of dbRows) {
        if (!row.message) continue;
        try {
          const parsed = JSON.parse(row.message);
          const normTable = normalizeTable(row.table_number);
          if (row.type === 'SETTLEMENT_SESSION') {
            const lastCleared = typeof parsed.seatNumber === 'number'
              ? (clearedSettlementAt.get(`${normTable}-CHAIR-${parsed.seatNumber}`) || clearedSettlementAt.get(normTable))
              : clearedSettlementAt.get(normTable);
            if (lastCleared && Date.now() - lastCleared < 20000) {
              continue;
            }
            if (parsed.initiatedAt && Math.abs(now - parsed.initiatedAt) < 1800000) {
              if (typeof parsed.seatNumber === 'number') {
                sessionsObj[`${normTable}-CHAIR-${parsed.seatNumber}`] = parsed;
                activeSettlementSessions.set(`${normTable}-CHAIR-${parsed.seatNumber}`, parsed);
              } else {
                sessionsObj[normTable] = parsed;
                activeSettlementSessions.set(normTable, parsed);
              }
            }
          } else if (row.type === 'SETTLED_BILL') {
            if (parsed.timestamp && Math.abs(now - parsed.timestamp) < 1800000) {
              const seatNum = typeof parsed.seatNumber === 'number'
                ? parsed.seatNumber
                : (parsed.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i) ? Number(parsed.seatLabel.match(/(?:Chair|Seat)\s*(\d+)/i)![1]) : undefined);

              if (typeof seatNum === 'number') {
                billsObj[`${normTable}-CHAIR-${seatNum}`] = parsed;
                settledBills.set(`${normTable}-CHAIR-${seatNum}`, parsed);
              } else {
                billsObj[normTable] = parsed;
                settledBills.set(normTable, parsed);
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  const { searchParams } = new URL(req.url);
  const tableParam = searchParams.get('tableNumber') || searchParams.get('table');

  if (tableParam) {
    const normReqTable = normalizeTable(tableParam);
    const filteredSessions: Record<string, ActiveSettlementSession> = {};
    const filteredBills: Record<string, SettledBillSnapshot> = {};

    Object.entries(sessionsObj).forEach(([k, v]) => {
      if (k === normReqTable || k.startsWith(`${normReqTable}-CHAIR-`)) {
        filteredSessions[k] = v;
      }
    });

    Object.entries(billsObj).forEach(([k, v]) => {
      if (k === normReqTable || k.startsWith(`${normReqTable}-CHAIR-`)) {
        filteredBills[k] = v;
      }
    });

    return NextResponse.json({
      sessions: filteredSessions,
      settledBills: filteredBills,
    });
  }

  return NextResponse.json({
    sessions: sessionsObj,
    settledBills: billsObj,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'INITIATE') {
      const session: ActiveSettlementSession = body.session;
      if (!session || !session.tableNumber) {
        return NextResponse.json({ error: 'Session and tableNumber are required' }, { status: 400 });
      }

      const normTable = normalizeTable(session.tableNumber);
      const cleanSession: ActiveSettlementSession = {
        ...session,
        tableNumber: normTable,
        initiatedAt: session.initiatedAt || Date.now(),
      };

      if (typeof session.seatNumber === 'number') {
        clearedSettlementAt.delete(`${normTable}-CHAIR-${session.seatNumber}`);
      } else {
        clearedSettlementAt.delete(normTable);
      }

      if (typeof session.seatNumber === 'number') {
        activeSettlementSessions.set(`${normTable}-CHAIR-${session.seatNumber}`, cleanSession);
        if (activeSettlementSessions.get(normTable)?.seatNumber === session.seatNumber) {
          activeSettlementSessions.delete(normTable);
        }
      } else {
        activeSettlementSessions.set(normTable, cleanSession);
      }

      broadcastStateChange('settlementSessionStarted', cleanSession);

      const sessId = `SETTLE-SESSION-${normTable}${typeof session.seatNumber === 'number' ? `-S${session.seatNumber}` : ''}`;
      try {
        await supabase.from('pings').upsert({
          id: sessId,
          table_number: normTable,
          seat_number: typeof session.seatNumber === 'number' ? session.seatNumber : 1,
          type: 'SETTLEMENT_SESSION',
          guest_name: 'Floor Captain',
          message: JSON.stringify(cleanSession),
          status: 'PENDING',
        });
      } catch {}

      return NextResponse.json({ success: true, session: cleanSession });
    }

    if (action === 'CLEAR') {
      const tableNumber = body.tableNumber;
      const seatNumber = body.seatNumber;
      if (!tableNumber) {
        return NextResponse.json({ error: 'tableNumber is required' }, { status: 400 });
      }

      const normTable = normalizeTable(tableNumber);
      if (typeof seatNumber === 'number') {
        clearedSettlementAt.set(`${normTable}-CHAIR-${seatNumber}`, Date.now());
        activeSettlementSessions.delete(`${normTable}-CHAIR-${seatNumber}`);
        if (activeSettlementSessions.get(normTable)?.seatNumber === seatNumber) {
          activeSettlementSessions.delete(normTable);
        }
      } else {
        clearedSettlementAt.set(normTable, Date.now());
        activeSettlementSessions.delete(normTable);
        for (let s = 1; s <= 12; s++) {
          activeSettlementSessions.delete(`${normTable}-CHAIR-${s}`);
        }
      }

      broadcastStateChange('settlementSessionCleared', { normTable, seatNumber });

      const sessId = `SETTLE-SESSION-${normTable}${typeof seatNumber === 'number' ? `-S${seatNumber}` : ''}`;
      try {
        if (typeof seatNumber === 'number') {
          await supabase
            .from('pings')
            .delete()
            .eq('id', sessId);
        } else {
          await supabase
            .from('pings')
            .delete()
            .in('id', [sessId, `SETTLE-SESSION-${normTable}`]);
          await supabase
            .from('pings')
            .delete()
            .eq('table_number', normTable)
            .eq('type', 'SETTLEMENT_SESSION');
        }
      } catch {}

      return NextResponse.json({ success: true });
    }

    if (action === 'RECORD_BILL') {
      const snapshot: SettledBillSnapshot = body.snapshot;
      if (!snapshot || !snapshot.tableName) {
        return NextResponse.json({ error: 'Snapshot is required' }, { status: 400 });
      }

      const normTable = normalizeTable(snapshot.tableName);
      const enrichedSnapshot: SettledBillSnapshot = {
        ...snapshot,
        timestamp: snapshot.timestamp || Date.now(),
      };

      const seatMatch = snapshot.seatLabel?.match(/(?:Chair|Seat)\s*(\d+)/i);
      const seatNumber = typeof snapshot.seatNumber === 'number'
        ? snapshot.seatNumber
        : (seatMatch ? Number(seatMatch[1]) : undefined);

      if (typeof seatNumber === 'number') {
        settledBills.set(`${normTable}-CHAIR-${seatNumber}`, enrichedSnapshot);
        if (settledBills.get(normTable)?.seatNumber === seatNumber) {
          settledBills.delete(normTable);
        }
        activeSettlementSessions.delete(`${normTable}-CHAIR-${seatNumber}`);
        if (activeSettlementSessions.get(normTable)?.seatNumber === seatNumber) {
          activeSettlementSessions.delete(normTable);
        }
      } else {
        settledBills.set(normTable, enrichedSnapshot);
        activeSettlementSessions.delete(normTable);
        for (let s = 1; s <= 12; s++) {
          activeSettlementSessions.delete(`${normTable}-CHAIR-${s}`);
        }
      }

      broadcastStateChange('settledBillRecorded', enrichedSnapshot);

      const billId = `SETTLED-BILL-${normTable}${typeof seatNumber === 'number' ? `-S${seatNumber}` : ''}`;
      const sessId = `SETTLE-SESSION-${normTable}${typeof seatNumber === 'number' ? `-S${seatNumber}` : ''}`;
      try {
        await supabase.from('pings').upsert({
          id: billId,
          table_number: normTable,
          seat_number: typeof seatNumber === 'number' ? seatNumber : 1,
          type: 'SETTLED_BILL',
          guest_name: snapshot.captainName || 'Guest',
          message: JSON.stringify(enrichedSnapshot),
          status: 'RESOLVED',
        });
        if (typeof seatNumber === 'number') {
          await supabase
            .from('pings')
            .delete()
            .eq('id', sessId);
        } else {
          await supabase
            .from('pings')
            .delete()
            .or(`id.eq.${sessId},id.eq.SETTLE-SESSION-${normTable}`);
        }
      } catch {}

      return NextResponse.json({ success: true, snapshot: enrichedSnapshot });
    }

    if (action === 'CLEAR_BILL' || action === 'VACATE') {
      const tableNumber = body.tableNumber;
      const seatNumber = body.seatNumber;
      if (!tableNumber) {
        return NextResponse.json({ error: 'tableNumber is required' }, { status: 400 });
      }

      const normTable = normalizeTable(tableNumber);
      if (typeof seatNumber === 'number') {
        settledBills.delete(`${normTable}-CHAIR-${seatNumber}`);
        if (settledBills.get(normTable)?.seatNumber === seatNumber) {
          settledBills.delete(normTable);
        }
        activeSettlementSessions.delete(`${normTable}-CHAIR-${seatNumber}`);
        if (activeSettlementSessions.get(normTable)?.seatNumber === seatNumber) {
          activeSettlementSessions.delete(normTable);
        }
      } else {
        settledBills.delete(normTable);
        for (let s = 1; s <= 12; s++) {
          settledBills.delete(`${normTable}-CHAIR-${s}`);
        }
        activeSettlementSessions.delete(normTable);
        for (let s = 1; s <= 12; s++) {
          activeSettlementSessions.delete(`${normTable}-CHAIR-${s}`);
        }
      }

      broadcastStateChange('settledBillCleared', { normTable, seatNumber });

      try {
        if (typeof seatNumber === 'number') {
          await supabase
            .from('pings')
            .delete()
            .or(`id.eq.SETTLE-SESSION-${normTable}-S${seatNumber},id.eq.SETTLED-BILL-${normTable}-S${seatNumber}`);
        } else {
          await supabase
            .from('pings')
            .delete()
            .or(`id.ilike.SETTLE-SESSION-${normTable}%,id.ilike.SETTLED-BILL-${normTable}%`);
        }
      } catch {}

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
