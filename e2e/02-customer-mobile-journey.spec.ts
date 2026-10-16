import { test, expect } from '@playwright/test';
import { clearTableSession } from './fixtures/test-helpers';

test.describe('Customer Mobile Dining Journey Simulation', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // Mobile viewport (iPhone 14)
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });

  const testTable = 'T-02';
  const testSeat = 1;

  test('Complete Customer Lifecycle: QR Scan -> Menu -> Cart -> Live KDS Tracking -> Payment', async ({ page }) => {
    // 1. Pristine session setup for Table 2 Seat 1
    await clearTableSession(page, testTable, testSeat);

    // Step 1: Scan QR / Navigate to table URL
    await page.goto(`/?table=${testTable}&seat=${testSeat}`, { waitUntil: 'commit' });

    // In case a chair conflict modal appears, select any vacant chair or continue
    const vacantChairBtn = page.locator('button:has-text("Chair")').or(page.locator('button:has-text("Seat")')).first();
    if (await vacantChairBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await vacantChairBtn.click();
    }

    // Step 2: Transition to Screen 2 (Menu)
    // Seamlessly handles either Screen 1 (Welcome) or Screen 5 (Active order)
    const transitionBtn = page.locator('button:has-text("Add More Dishes")')
      .or(page.locator('button:has-text("Add More")'))
      .or(page.locator('button:has-text("Connect With Free Restaurant Wi-Fi")'))
      .or(page.locator('button:has-text("Continue With Mobile Data")'))
      .first();

    await expect(transitionBtn).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(400);
    await transitionBtn.click({ force: true });

    // Verify Screen 2: Authentic Menu loaded
    const menuIndicator = page.getByPlaceholder(/search/i).or(page.locator('button:has-text("ADD")')).first();
    try {
      await expect(menuIndicator).toBeVisible({ timeout: 6000 });
    } catch {
      if (await transitionBtn.isVisible().catch(() => false)) {
        await transitionBtn.click({ force: true }).catch(() => {});
      }
      await expect(menuIndicator).toBeVisible({ timeout: 15000 });
    }

    // Step 3: Add dishes to Cart
    const addButtons = page.locator('button:has-text("ADD")');
    await expect(addButtons.first()).toBeVisible({ timeout: 10000 });
    await addButtons.first().click();

    // If an item customization drawer opened, confirm adding by clicking "Add • 1 Item" button
    const drawerConfirmBtn = page.locator('button:has-text("Add •")')
      .or(page.locator('button:has-text("Add to Cart")'))
      .or(page.locator('button:has-text("ADD TO CART")'))
      .first();

    if (await drawerConfirmBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await drawerConfirmBtn.click({ force: true });
      await page.waitForTimeout(600);
    }

    // Step 4: Verify Floating Cart bar and click View Cart
    const viewCartBtn = page.locator('button:has-text("View Cart")')
      .or(page.locator('button:has-text("VIEW CART")'))
      .or(page.locator('text=VIEW CART'))
      .first();
    await expect(viewCartBtn).toBeVisible({ timeout: 10000 });
    await viewCartBtn.click();

    // Step 5: Verify Screen 4: Cart Screen
    await expect(
      page.locator('text=Order Cart')
        .or(page.locator('text=Send Order to Kitchen'))
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Step 6: Fire order to Kitchen
    const sendOrderBtn = page.locator('button:has-text("Send Order to Kitchen")')
      .or(page.locator('button:has-text("Track Live Order")'))
      .first();
    await expect(sendOrderBtn).toBeVisible({ timeout: 10000 });
    await sendOrderBtn.click();

    // Step 7: Verify Screen 5: Live Tracking
    await expect(
      page.locator('text=LIVE ORDER TRACKING')
        .or(page.locator('text=Live Order Tracking'))
        .or(page.locator('text=Order Placed'))
        .or(page.locator('text=Kitchen Linked'))
        .first()
    ).toBeVisible({ timeout: 20000 });

    // Step 8: Proceed to Payment Breakdown if available or verify Live Order bill summary
    await expect(
      page.locator('text=Order Bill Summary')
        .or(page.locator('text=Items Subtotal'))
        .or(page.locator('text=Grand Total'))
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Take high-res screenshot of final customer screen state
    await page.screenshot({ path: 'playwright-report/customer-journey-final.png', fullPage: true });
  });
});
