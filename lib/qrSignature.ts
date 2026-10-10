import crypto from 'crypto';

const VENUE_SECRET = process.env.VENUE_QR_SECRET || 'thoogudeepa-authentic-hospitality-secret-2026';

/**
 * Generates an authentic 10-character HMAC-SHA256 signature for a table and seat
 */
export function generateTableSignature(table: string, seat: number = 1): string {
  const normTable = (table || '').trim().toUpperCase();
  const rawData = `${normTable}:SEAT-${seat}:${VENUE_SECRET}`;
  return crypto.createHmac('sha256', VENUE_SECRET).update(rawData).digest('hex').slice(0, 10);
}

/**
 * Validates whether the given signature matches the expected HMAC-SHA256 signature
 */
export function verifyTableSignature(
  table: string,
  seat: number = 1,
  providedSignature?: string | null
): boolean {
  if (!providedSignature) return false;
  const expected = generateTableSignature(table, seat);
  return providedSignature.toLowerCase() === expected.toLowerCase();
}
