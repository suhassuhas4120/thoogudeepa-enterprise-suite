import { NextResponse } from 'next/server';
import { generateTableSignature } from '../../../../lib/qrSignature';

export const dynamic = 'force-dynamic';

export async function GET() {
  const signatures: Record<string, Record<number, string>> = {};

  for (let i = 1; i <= 34; i++) {
    const tableId = `T-${String(i).padStart(2, '0')}`;
    signatures[tableId] = {};
    for (let s = 1; s <= 6; s++) {
      signatures[tableId][s] = generateTableSignature(tableId, s);
    }
  }

  return NextResponse.json({
    success: true,
    count: 34,
    signatures,
  });
}
