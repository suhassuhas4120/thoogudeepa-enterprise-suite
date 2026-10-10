/**
 * Silent Client Hardware Fingerprint Generator
 * Produces a stable, unique device token for session persistence
 * without requiring any customer login or SMS OTP.
 */

export function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') return 'SSR-DEVICE';

  const STORAGE_KEY = 'thoogudeepa_device_token';

  // 1. Check localStorage first
  let token: string | null = null;
  try {
    token = localStorage.getItem(STORAGE_KEY);
  } catch {}

  // 2. Check persistent cookie fallback if localStorage was cleared
  if (!token && typeof document !== 'undefined') {
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + STORAGE_KEY + '=([^;]*)'));
      if (match && match[2]) {
        token = decodeURIComponent(match[2]);
        try {
          localStorage.setItem(STORAGE_KEY, token);
        } catch {}
      }
    } catch {}
  }

  if (token) {
    // Refresh cookie expiry to 30 days
    try {
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {}
    return token;
  }

  // 3. Build a hardware entropy string
  const entropy = [
    navigator.userAgent,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    Date.now(),
    Math.random(),
  ].join('###');

  // Fast hash
  let hash = 0;
  for (let i = 0; i < entropy.length; i++) {
    const char = entropy.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  token = `DEV-${Math.abs(hash).toString(36)}-${Date.now().toString(36)}`;

  try {
    localStorage.setItem(STORAGE_KEY, token);
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {}

  return token;
}
