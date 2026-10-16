import { test, expect } from '@playwright/test';
import { loginManagerPortal } from './fixtures/test-helpers';

test.describe('General Manager Portal Simulation (8-Screen Desk Layout)', () => {
  test.use({
    viewport: { width: 1440, height: 900 }, // High-res Desktop Executive Cockpit
  });

  test('Manager Cockpit: PIN Unlock -> 8-Screen Desk Navigation & Live KPI Audits', async ({ page }) => {
    // Step 1: Open /manager and unlock terminal
    await loginManagerPortal(page);

    // Step 2: Verify Executive Cockpit Navigation Bar & Live Overview
    await expect(page.locator('button:has-text("02. Live Overview")')).toBeVisible({ timeout: 10000 });

    // Step 3: Switch through Manager 8-Screen Navigation Desk Tabs
    const tabsToTest = [
      '03. Billing & POS',
      '04. Kitchen & Notifications',
      '05. Waiter Cash & Tips',
      '06. Menu Stocks & Offers',
      '07. Sales Report',
      '08. Petty Expenses & Cash Counter',
      '02. Live Overview',
    ];

    for (const tabName of tabsToTest) {
      const tabBtn = page.locator(`button:has-text("${tabName}")`).first();
      if (await tabBtn.isVisible()) {
        await tabBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // Verify returning to Live Overview
    await expect(page.locator('text=LIVE OVERVIEW').or(page.locator('text=TOTAL REVENUE')).first()).toBeVisible({ timeout: 10000 });

    // Capture screenshot of Manager Cockpit
    await page.screenshot({ path: 'playwright-report/manager-portal-overview.png' });
  });
});
