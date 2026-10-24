/**
 * Silent Client Hardware Fingerprint Generator
 * Produces a stable, unique device token for session persistence
 * without requiring any customer login or SMS OTP.
 */

export function getOrCreateDeviceToken(table?: string, seat?: number | string): string {
  if (typeof window === 'undefined') return 'SSR-DEVICE';

  // Extract table and seat from window location if omitted
  let resolvedSeat = seat;
  let resolvedTable = table;
  if (typeof window !== 'undefined') {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (!resolvedSeat) {
        const s = sp.get('seat');
        if (s) resolvedSeat = s;
      }
      if (!resolvedTable) {
        const t = sp.get('table');
        if (t) resolvedTable = t;
      }
    } catch {}
  }

  const sNum = resolvedSeat ? String(parseInt(String(resolvedSeat), 10) || 1) : '';
  const cleanT = resolvedTable ? String(resolvedTable).toUpperCase().replace(/^(TABLE\s*|T-?)/i, '').trim() : '';
  const normT = cleanT ? `T-${String(parseInt(cleanT, 10) || 1).padStart(2, '0')}` : '';

  // Tab-isolated storage key: guarantees separate tabs in same browser have distinct device identities
  const STORAGE_KEY = normT && sNum
    ? `thoogudeepa_device_token_${normT}_s${sNum}`
    : sNum
    ? `thoogudeepa_device_token_s${sNum}`
    : 'thoogudeepa_device_token';

  // 1. Check tab-specific sessionStorage first (vital for multi-chair browser testing)
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(STORAGE_KEY) || (sNum ? sessionStorage.getItem(`thoogudeepa_device_token_s${sNum}`) : null);
  } catch {}

  // 2. Check localStorage
  if (!token) {
    try {
      token = localStorage.getItem(STORAGE_KEY) || (sNum ? localStorage.getItem(`thoogudeepa_device_token_s${sNum}`) : null);
    } catch {}
  }

  // 3. Check persistent cookie fallback if localStorage was cleared
  if (!token && typeof document !== 'undefined') {
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + STORAGE_KEY + '=([^;]*)'));
      if (match && match[2]) {
        token = decodeURIComponent(match[2]);
      }
    } catch {}
  }

  if (token) {
    // Keep session and local storage in sync
    try {
      sessionStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(STORAGE_KEY, token);
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {}
    return token;
  }

  // 4. Build a hardware entropy string with chair isolation
  const entropy = [
    navigator.userAgent,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    Date.now(),
    Math.random(),
    normT,
    sNum,
  ].join('###');

  // Fast hash
  let hash = 0;
  for (let i = 0; i < entropy.length; i++) {
    const char = entropy.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  token = `DEV-${Math.abs(hash).toString(36)}-${Date.now().toString(36)}${sNum ? `-S${sNum}` : ''}`;

  try {
    sessionStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(STORAGE_KEY, token);
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {}

  return token;
}
