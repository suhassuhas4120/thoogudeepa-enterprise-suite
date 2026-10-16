import { Page, expect } from '@playwright/test';

/**
 * Reusable Helpers and Selectors for Thoogudeepa Enterprise Suite E2E Testing
 */

export const PINS = {
  KITCHEN: '1234',
  MANAGER: '1234',
  WAITER_RAMESH: '1111',
  WAITER_SURESH: '2222',
};

/**
 * Resets local/session storage for a table and vacates on server to guarantee a fresh session
 */
export async function clearTableSession(page: Page, table = 'T-04', seat = 1) {
  try {
    await page.request.post('/api/tables/vacate', {
      data: { tableNumber: table, reason: 'Automated E2E Test Reset' },
      timeout: 10000,
    });
  } catch {}

  await page.addInitScript(({ tbl, st }) => {
    try {
      localStorage.removeItem(`thoogudeepa_customer_session_${tbl}_s${st}`);
      localStorage.removeItem('thoogudeepa_customer_session_v1');
      localStorage.removeItem(`thoogudeepa_device_token_${tbl}_s${st}`);
      sessionStorage.removeItem('thoogudeepa_verified_session');
    } catch {}
  }, { tbl: table, st: seat });
}

/**
 * Logs in to Kitchen KDS with universal PIN 1234
 */
export async function loginKitchenKDS(page: Page) {
  await page.goto('/kitchen', { waitUntil: 'commit' });
  // Wait for PIN pad or Overview
  const pin1 = page.locator('button', { hasText: /^1$/ }).first();
  if (await pin1.isVisible({ timeout: 8000 }).catch(() => false)) {
    const pin2 = page.locator('button', { hasText: /^2$/ }).first();
    const pin3 = page.locator('button', { hasText: /^3$/ }).first();
    const pin4 = page.locator('button', { hasText: /^4$/ }).first();
    await pin1.click();
    await page.waitForTimeout(100);
    await pin2.click();
    await page.waitForTimeout(100);
    await pin3.click();
    await page.waitForTimeout(100);
    await pin4.click();
  }

  // Verify KDS Overview is rendered
  await expect(page.locator('text=ALL TABLES').or(page.locator('text=MASTER DISPATCH')).first()).toBeVisible({ timeout: 20000 });
}

/**
 * Logs in to Waiter Mobile with Steward PIN
 */
export async function loginWaiterMobile(page: Page, pin = PINS.WAITER_RAMESH) {
  await page.goto('/waiter/mobile', { waitUntil: 'commit' });
  // Clear any existing session
  await page.evaluate(() => {
    try { sessionStorage.removeItem('thoogudeepa_waiter_session'); } catch {}
  });
  await page.reload({ waitUntil: 'commit' });

  // Click steward name if visible (e.g. Ramesh)
  const rameshBtn = page.locator('button:has-text("Ramesh")').first();
  if (await rameshBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await rameshBtn.click();
    await page.waitForTimeout(100);
  }

  // Type 4 digits if PIN pad visible
  const firstPinBtn = page.locator('button', { hasText: new RegExp(`^${pin[0]}$`) }).first();
  if (await firstPinBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    for (const digit of pin.split('')) {
      const btn = page.locator('button', { hasText: new RegExp(`^${digit}$`) }).first();
      await btn.click();
      await page.waitForTimeout(80);
    }
  }

  // If login button is visible and enabled, click it
  const loginBtn = page.locator('button:has-text("Login")').first();
  if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    if (await loginBtn.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await loginBtn.click();
    }
  }

  // Wait for Floor Grid to load
  await expect(
    page.locator('text=MY SECTION')
      .or(page.locator('text=Ramesh'))
      .or(page.locator('text=TABLES'))
      .or(page.locator('input[placeholder*="Search table"]'))
      .first()
  ).toBeVisible({ timeout: 20000 });
}

/**
 * Logs in to Manager Portal
 */
export async function loginManagerPortal(page: Page, pin = PINS.MANAGER) {
  await page.goto('/manager', { waitUntil: 'commit' });
  const firstPinBtn = page.locator('button', { hasText: new RegExp(`^${pin[0]}$`) }).first();
  if (await firstPinBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
    for (const digit of pin.split('')) {
      const btn = page.locator('button', { hasText: new RegExp(`^${digit}$`) }).first();
      await btn.click();
    }
    const unlockBtn = page.locator('button', { hasText: /VERIFY & UNLOCK DESK|Unlock Terminal/i }).first();
    if (await unlockBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await unlockBtn.click();
    }
  }

  // Verify Dashboard overview (matches new 8-screen manager desk layout)
  await expect(
    page.locator('text=02. Live Overview')
      .or(page.locator('text=LIVE OVERVIEW'))
      .or(page.locator('text=TOTAL REVENUE'))
      .first()
  ).toBeVisible({ timeout: 20000 });
}
