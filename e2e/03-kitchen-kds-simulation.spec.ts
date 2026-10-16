import { test, expect } from '@playwright/test';
import { loginKitchenKDS } from './fixtures/test-helpers';

test.describe('Kitchen KDS Tablet Simulation', () => {
  test.use({
    viewport: { width: 1024, height: 768 }, // Commercial Kitchen Tablet (iPad Landscape)
  });

  test('Kitchen Chef Terminal: PIN Authentication -> Station Filtering -> Ticket Prep Flow', async ({ page }) => {
    // Step 1: Open /kitchen and authenticate with Universal PIN 1234
    await loginKitchenKDS(page);

    // Step 2: Verify KDS Header & Station Controls
    await expect(page.locator('text=ALL TABLES')).toBeVisible({ timeout: 10000 });

    // Step 3: Test Category Filtering tabs
    const biryaniStationTab = page.locator('button:has-text("DUM BIRYANI")').first();
    if (await biryaniStationTab.isVisible()) {
      await biryaniStationTab.click();
      await page.waitForTimeout(400);
    }

    const allStationTab = page.locator('button:has-text("ALL")').first();
    if (await allStationTab.isVisible()) {
      await allStationTab.click();
      await page.waitForTimeout(400);
    }

    // Step 4: Check if any active ticket exists or interact with stage buttons
    const stagePrepBtn = page.locator('button:has-text("2: PREPARING")').or(page.locator('button:has-text("PREPARING")')).first();
    const stageReadyBtn = page.locator('button:has-text("3: READY")').or(page.locator('button:has-text("READY")')).first();

    if (await stagePrepBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stagePrepBtn.click();
      await page.waitForTimeout(500);
    }

    if (await stageReadyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stageReadyBtn.click();
      await page.waitForTimeout(500);
    }

    // Step 5: Capture high-res screenshot of Kitchen KDS state
    await page.screenshot({ path: 'playwright-report/kitchen-kds-overview.png' });
  });
});
