import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = -1;

  try {
    const { data, error } = await supabase
      .from('tables')
      .select('number')
      .limit(1);

    dbLatencyMs = Date.now() - startTime;
    if (!error && data) {
      dbStatus = 'CONNECTED';
    } else {
      dbStatus = error ? `ERROR: ${error.message}` : 'NO_DATA';
    }
  } catch (err: any) {
    dbLatencyMs = Date.now() - startTime;
    dbStatus = `EXCEPTION: ${err.message || 'Unknown database error'}`;
  }

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthPayload = {
    status: dbStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
      },
    },
    portals: {
      customerScreens: 12,
      kitchenScreens: 3,
      waiterMobileScreens: 6,
      waiterTabletPanes: 4,
      managerScreens: 16,
      totalTables: 34,
      floorSections: 5,
    },
  };

  const statusCode = dbStatus === 'CONNECTED' ? 200 : 503;
  return NextResponse.json(healthPayload, { status: statusCode });
}
