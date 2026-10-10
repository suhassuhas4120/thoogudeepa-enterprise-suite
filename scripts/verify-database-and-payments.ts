import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dwjjprzyyjmunhdxvkuo.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_n2WMU-LLYOgykukVbxg5Zw_vHCa74DV';
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

interface InspectionReport {
  tablesTotal: number;
  tablesList: string[];
  seatsTotal: number;
  seatsPerTable: Record<string, number>;
  tableStatusSummary: Record<string, number>;
  seatStatusSummary: Record<string, number>;
  tableColumnsVerified: boolean;
  seatColumnsVerified: boolean;
  orderColumnsVerified: boolean;
  paymentColumnsVerified: boolean;
  kdsColumnsVerified: boolean;
  errors: string[];
}

async function runDatabaseAudit(): Promise<InspectionReport> {
  const report: InspectionReport = {
    tablesTotal: 0,
    tablesList: [],
    seatsTotal: 0,
    seatsPerTable: {},
    tableStatusSummary: {},
    seatStatusSummary: {},
    tableColumnsVerified: false,
    seatColumnsVerified: false,
    orderColumnsVerified: false,
    paymentColumnsVerified: false,
    kdsColumnsVerified: false,
    errors: [],
  };

  console.log('=====================================================');
  console.log('       FORENSIC DATABASE & SCHEMA AUDIT SUITE        ');
  console.log('=====================================================');

  // 1. Audit Tables
  const { data: tables, error: tableErr } = await db
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  if (tableErr) {
    report.errors.push(`Tables query error: ${tableErr.message}`);
  } else if (tables) {
    report.tablesTotal = tables.length;
    report.tablesList = tables.map((t: any) => t.number);
    tables.forEach((t: any) => {
      report.tableStatusSummary[t.status] = (report.tableStatusSummary[t.status] || 0) + 1;
    });

    if (tables.length > 0) {
      const sample = tables[0];
      const requiredCols = ['number', 'status', 'capacity', 'current_bill', 'guest_count', 'kot_count'];
      const missing = requiredCols.filter(col => !(col in sample));
      if (missing.length === 0) {
        report.tableColumnsVerified = true;
      } else {
        report.errors.push(`Tables missing columns: ${missing.join(', ')}`);
      }
    }
  }

  // 2. Audit Table Seats
  const { data: seats, error: seatErr } = await db
    .from('table_seats')
    .select('*')
    .order('table_number', { ascending: true });

  if (seatErr) {
    report.errors.push(`Seats query error: ${seatErr.message}`);
  } else if (seats) {
    report.seatsTotal = seats.length;
    seats.forEach((s: any) => {
      report.seatsPerTable[s.table_number] = (report.seatsPerTable[s.table_number] || 0) + 1;
      report.seatStatusSummary[s.status] = (report.seatStatusSummary[s.status] || 0) + 1;
    });

    if (seats.length > 0) {
      const sample = seats[0];
      const requiredCols = ['id', 'table_number', 'seat_number', 'status'];
      const missing = requiredCols.filter(col => !(col in sample));
      if (missing.length === 0) {
        report.seatColumnsVerified = true;
      } else {
        report.errors.push(`Seats missing columns: ${missing.join(', ')}`);
      }
    }
  }

  // 3. Audit Orders table structure
  const { data: orderCols, error: orderErr } = await db
    .from('orders')
    .select('*')
    .limit(1);

  if (orderErr) {
    report.errors.push(`Orders schema error: ${orderErr.message}`);
  } else {
    report.orderColumnsVerified = true;
  }

  // 4. Audit Payments table structure
  const { data: payCols, error: payErr } = await db
    .from('payments')
    .select('*')
    .limit(1);

  if (payErr) {
    report.errors.push(`Payments schema error: ${payErr.message}`);
  } else {
    report.paymentColumnsVerified = true;
  }

  // 5. Audit KDS tickets structure
  const { data: kdsCols, error: kdsErr } = await db
    .from('kds_tickets')
    .select('*')
    .limit(1);

  if (kdsErr) {
    report.errors.push(`KDS Tickets schema error: ${kdsErr.message}`);
  } else {
    report.kdsColumnsVerified = true;
  }

  return report;
}

runDatabaseAudit().then(report => {
  console.log('Tables detected:', report.tablesTotal);
  console.log('Tables Status breakdown:', report.tableStatusSummary);
  console.log('Seats detected:', report.seatsTotal);
  console.log('Seats Status breakdown:', report.seatStatusSummary);
  console.log('Total unique tables with seats:', Object.keys(report.seatsPerTable).length);
  console.log('Schema column verifications:');
  console.log(' - Tables table columns:', report.tableColumnsVerified ? 'VERIFIED' : 'FAILED');
  console.log(' - Table seats table columns:', report.seatColumnsVerified ? 'VERIFIED' : 'FAILED');
  console.log(' - Orders table columns:', report.orderColumnsVerified ? 'VERIFIED' : 'FAILED');
  console.log(' - Payments table columns:', report.paymentColumnsVerified ? 'VERIFIED' : 'FAILED');
  console.log(' - KDS Tickets table columns:', report.kdsColumnsVerified ? 'VERIFIED' : 'FAILED');
  if (report.errors.length > 0) {
    console.error('Errors encountered:', report.errors);
    process.exit(1);
  }
  process.exit(0);
}).catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
