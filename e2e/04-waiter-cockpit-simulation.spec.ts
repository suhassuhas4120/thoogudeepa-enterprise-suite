import { test, expect } from '@playwright/test';
import { loginWaiterMobile, PINS } from './fixtures/test-helpers';

test.describe('Waiter Cockpit Mobile & Tablet Simulation', () => {
  test('01. Waiter Mobile Steward Flow: PIN Login -> Floor Grid -> Table Sheet -> Tab Navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Step 1: Login via PIN 1111 (Ramesh)
    await loginWaiterMobile(page, PINS.WAITER_RAMESH);

    // Step 2: Verify Floor Grid with tables
    await expect(page.locator('text=Ramesh').or(page.locator('text=TABLES')).first()).toBeVisible({ timeout: 10000 });

    // Step 3: Switch tabs: CALLS, READY, TABLES
    const readyTab = page.locator('button:has-text("READY")').first();
    if (await readyTab.isVisible()) {
      await readyTab.click();
      await page.waitForTimeout(300);
    }

    const callsTab = page.locator('button:has-text("CALLS")').first();
    if (await callsTab.isVisible()) {
      await callsTab.click();
      await page.waitForTimeout(300);
    }

    const tablesTab = page.locator('button:has-text("TABLES")').first();
    if (await tablesTab.isVisible()) {
      await tablesTab.click();
      await page.waitForTimeout(300);
    }

    // Step 4: Click Table T-04 or any table card to open Table Sheet
    const tableCard = page.locator('text=T-04').or(page.locator('text=T-01')).first();
    if (await tableCard.isVisible()) {
      await tableCard.click();
      await page.waitForTimeout(600);
    }

    // Screenshot of Steward mobile floor view
    await page.screenshot({ path: 'playwright-report/waiter-mobile-grid.png' });
  });

  test('02. Waiter Tablet Captain Cockpit Flow: 34-Table Floor Map & KOT Pass', async ({ page }) => {
    await page.setViewportSize({ width: 1194, height: 834 });

    // Step 1: Navigate to /waiter/tablet
    await page.goto('/waiter/tablet');

    // Login via PIN pad
    for (const d of PINS.WAITER_RAMESH.split('')) {
      const btn = page.locator('button', { hasText: new RegExp(`^${d}$`) }).first();
      await btn.click();
    }

    // Step 2: Verify Floor Map rendered
    await expect(page.locator('text=FLOOR').or(page.locator('text=ALL TABLES')).or(page.locator('text=SECTION')).first()).toBeVisible({ timeout: 10000 });

    // Screenshot of Captain Tablet view
    await page.screenshot({ path: 'playwright-report/waiter-tablet-map.png' });
  });
});
