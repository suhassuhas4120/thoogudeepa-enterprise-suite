import { test, expect, devices } from '@playwright/test';
import { clearTableSession, loginKitchenKDS, loginWaiterMobile, PINS } from './fixtures/test-helpers';

test.describe('Real-Time Multi-Persona Live Restaurant Simulation', () => {
  test.beforeAll(async ({ request }) => {
    // Vacate Table T-05 to guarantee fresh slate
    try {
      await request.post('/api/tables/vacate', {
        data: { tableNumber: 'T-05', reason: 'Pre-simulation Reset' },
        timeout: 30000,
      });
    } catch {}
  });

  test('Orchestrated Symphony: Customer orders on Mobile -> Kitchen cooks on Tablet -> Waiter serves on Steward Phone', async ({ browser }) => {
    test.setTimeout(180 * 1000); // Allow up to 3 minutes for full 3-device live sync in headed mode
    // -------------------------------------------------------------
    // PERSONA 1: CUSTOMER (Mobile Device at Table 05, Seat 1)
    // -------------------------------------------------------------
    const customerContext = await browser.newContext({
      ...devices['iPhone 14'],
      recordVideo: { dir: 'playwright-report/videos/customer/' },
    });
    const customerPage = await customerContext.newPage();
    await clearTableSession(customerPage, 'T-05', 1);

    // Diner sits down and opens table QR
    await customerPage.goto('/?table=T-05&seat=1', { waitUntil: 'commit' });

    // In case a chair conflict modal appears, select any vacant chair or continue
    const vacantChairBtn = customerPage.locator('button:has-text("Chair")').or(customerPage.locator('button:has-text("Seat")')).first();
    if (await vacantChairBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await vacantChairBtn.click();
    }

    // Transition to Menu: seamlessly handles either Screen 1 (Welcome) or Screen 5 (Active order)
    const transitionBtn = customerPage.locator('button:has-text("Add More Dishes")')
      .or(customerPage.locator('button:has-text("Add More")'))
      .or(customerPage.locator('button:has-text("Connect With Free Restaurant Wi-Fi")'))
      .or(customerPage.locator('button:has-text("Continue With Mobile Data")'))
      .first();

    await expect(transitionBtn).toBeVisible({ timeout: 15000 });
    await customerPage.waitForTimeout(400);
    await transitionBtn.click({ force: true });

    // Transition to Screen 2
    const menuIndicator = customerPage.getByPlaceholder(/search/i).or(customerPage.locator('button:has-text("ADD")')).first();
    try {
      await expect(menuIndicator).toBeVisible({ timeout: 6000 });
    } catch {
      if (await transitionBtn.isVisible().catch(() => false)) {
        await transitionBtn.click({ force: true }).catch(() => {});
      }
      await expect(menuIndicator).toBeVisible({ timeout: 15000 });
    }

    // Diner selects an item and adds to cart
    const addBtn = customerPage.locator('button:has-text("ADD")').first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Confirm drawer if present
    const drawerAddBtn = customerPage.locator('button:has-text("Add •")')
      .or(customerPage.locator('button:has-text("Add to Cart")'))
      .first();
    if (await drawerAddBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await drawerAddBtn.click({ force: true });
      await customerPage.waitForTimeout(500);
    }

    // View Cart
    const viewCartBtn = customerPage.locator('button:has-text("View Cart")')
      .or(customerPage.locator('button:has-text("VIEW CART")'))
      .or(customerPage.locator('text=VIEW CART'))
      .first();
    await expect(viewCartBtn).toBeVisible({ timeout: 10000 });
    await viewCartBtn.click();

    // Fire order to Kitchen
    const sendOrderBtn = customerPage.locator('button:has-text("Send Order to Kitchen")')
      .or(customerPage.locator('button:has-text("Track Live Order")'))
      .first();
    await expect(sendOrderBtn).toBeVisible({ timeout: 10000 });
    await sendOrderBtn.click();

    // Verify Customer transitions to Live Order Tracking (Screen 5)
    await expect(
      customerPage.locator('text=LIVE ORDER TRACKING')
        .or(customerPage.locator('text=Order Placed'))
        .or(customerPage.locator('text=Kitchen'))
        .first()
    ).toBeVisible({ timeout: 15000 });

    await customerPage.screenshot({ path: 'playwright-report/simulation-step1-order-placed.png' });

    // -------------------------------------------------------------
    // PERSONA 2: KITCHEN CHEF (Tablet Display at KDS Station)
    // -------------------------------------------------------------
    const kitchenContext = await browser.newContext({
      ...devices['iPad (gen 7)'],
      recordVideo: { dir: 'playwright-report/videos/kitchen/' },
    });
    const kitchenPage = await kitchenContext.newPage();

    // Kitchen Chef logs in with PIN 1234
    await loginKitchenKDS(kitchenPage);

    // Chef observes live ticket for Table T-05
    await kitchenPage.waitForTimeout(1000);
    const table5Ticket = kitchenPage.locator('text=T-05').or(kitchenPage.locator('text=TABLE 5')).first();
    if (await table5Ticket.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Step the item to PREPARING
      const prepBtn = kitchenPage.locator('button:has-text("2: PREPARING")').or(kitchenPage.locator('button:has-text("PREPARING")')).first();
      if (await prepBtn.isVisible()) {
        await prepBtn.click();
      }
      await kitchenPage.waitForTimeout(500);

      // Step the item to READY
      const readyBtn = kitchenPage.locator('button:has-text("3: READY")').or(kitchenPage.locator('button:has-text("READY")')).first();
      if (await readyBtn.isVisible()) {
        await readyBtn.click();
      }
    }

    await kitchenPage.screenshot({ path: 'playwright-report/simulation-step2-kitchen-ready.png' });

    // -------------------------------------------------------------
    // PERSONA 3: FLOOR WAITER (Mobile Device in Dining Hall)
    // -------------------------------------------------------------
    const waiterContext = await browser.newContext({
      ...devices['iPhone 14'],
      recordVideo: { dir: 'playwright-report/videos/waiter/' },
    });
    const waiterPage = await waiterContext.newPage();

    // Waiter logs in with PIN 1111 (Ramesh)
    await loginWaiterMobile(waiterPage, PINS.WAITER_RAMESH);

    // Waiter checks READY tab for tickets
    const readyTab = waiterPage.locator('button:has-text("READY")').first();
    if (await readyTab.isVisible()) {
      await readyTab.click();
      await waiterPage.waitForTimeout(500);
    }

    await waiterPage.screenshot({ path: 'playwright-report/simulation-step3-waiter-pass.png' });

    // Clean up all contexts cleanly
    await customerContext.close().catch(() => {});
    await kitchenContext.close().catch(() => {});
    await waiterContext.close().catch(() => {});
  });
});
