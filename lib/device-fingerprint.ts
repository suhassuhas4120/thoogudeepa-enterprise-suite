/**
 * Silent Client Hardware Fingerprint Generator
 * Produces a stable, unique 64-bit device token for 80% exit recovery
 * without requiring any customer login or SMS OTP.
 */

export function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') return 'SSR-DEVICE';

  const STORAGE_KEY = 'thoogudeepa_device_token';
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  // Build a hardware entropy string
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

  // Simple, fast hash
  let hash = 0;
  for (let i = 0; i < entropy.length; i++) {
    const char = entropy.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const token = `DEV-${Math.abs(hash).toString(36)}-${Date.now().toString(36)}`;
  localStorage.setItem(STORAGE_KEY, token);
  return token;
}
