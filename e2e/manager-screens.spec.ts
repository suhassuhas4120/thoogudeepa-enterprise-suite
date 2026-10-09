import { test, expect, type Page } from '@playwright/test';

const screens = [
  '01. Login & Float',
  '02. Live Overview',
  '03. Floor Plan',
  '04. Billing & POS',
  '05. Kitchen Speed',
  '06. Waiting Queue',
  '07. Staff Roster',
  '08. Calls & Alerts',
  '09. Waiter Cash',
  '10. Menu 86 Stock',
  '11. Sales Report',
  '12. Offers & Rules',
  '13. Petty Expenses',
  '14. Attendance & Tips',
  '15. Printer Health',
  '16. Day Close Z-Report',
];

async function unlock(page: Page) {
  await page.goto('http://localhost:3001/manager');
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await page.getByRole('button', { name: '4', exact: true }).click();
  await page.getByRole('button', { name: /VERIFY & UNLOCK DESK/ }).click();
  await expect(page.getByRole('button', { name: 'LOCK DESK' })).toBeVisible();
}

test.describe('manager portal runtime validation', () => {
  test('authenticates and renders all 16 screens', async ({ page }) => {
    await unlock(page);

    for (const screen of screens) {
      await page.getByRole('button', { name: screen, exact: true }).click();
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('creates and pages a waiting queue token', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await unlock(page);
    await page.getByRole('button', { name: '06. Waiting Queue', exact: true }).click();
    await page.getByPlaceholder('e.g. Ramesh Gowda').fill('Playwright Queue Guest');
    await page.getByPlaceholder('+91 98450 12345').fill('+91 99999 11111');
    await page.getByRole('button', { name: /ISSUE TOKEN/ }).click();
    await expect(page.getByText('Playwright Queue Guest')).toBeVisible();
    await page.getByRole('button', { name: 'PAGE SMS' }).last().click();
    await expect(page.getByText('[PAGED]').last()).toBeVisible();
  });

  test('marks live notifications as read and closes the shift', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await unlock(page);
    await page.getByRole('button', { name: '02. Live Overview', exact: true }).click();
    await page.getByRole('button', { name: 'MARK ALL READ' }).click();
    await expect(page.getByText('READ').first()).toBeVisible();
    await page.getByRole('button', { name: '16. Day Close Z-Report', exact: true }).click();
    await page.getByRole('button', { name: 'LOCK NIGHT SHIFT & CLOSE REGISTER' }).click();
    await expect(page.getByText('SHIFT CLOSED & ARCHIVED SECURELY')).toBeVisible();
  });

  test('updates stock, promotion, petty cash, and hardware controls', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await unlock(page);

    await page.getByRole('button', { name: '10. Menu 86 Stock', exact: true }).click();
    const stockToggle = page.getByRole('button', { name: /86 DISH|RESTORE DISH/ }).first();
    const stockLabel = await stockToggle.textContent();
    await stockToggle.click();
    await expect(page.getByRole('button', { name: stockLabel?.includes('86 DISH') ? 'RESTORE DISH (IN STOCK)' : '86 DISH (SOLD OUT)' }).first()).toBeVisible();

    await page.getByRole('button', { name: '12. Offers & Rules', exact: true }).click();
    const promoToggle = page.getByRole('button', { name: /PAUSE PROMOTION|ENABLE PROMOTION/ }).first();
    const promoLabel = await promoToggle.textContent();
    await promoToggle.click();
    await expect(page.getByRole('button', { name: promoLabel?.includes('PAUSE') ? 'ENABLE PROMOTION' : 'PAUSE PROMOTION' }).first()).toBeVisible();

    await page.getByRole('button', { name: '13. Petty Expenses', exact: true }).click();
    await page.getByPlaceholder(/Fresh Curd/).fill('Playwright test expense');
    await page.getByPlaceholder('₹ 500').fill('125');
    await page.getByRole('button', { name: /RECORD CASH VOUCHER/ }).click();
    await expect(page.getByText('Playwright test expense')).toBeVisible();

    await page.getByRole('button', { name: '15. Printer Health', exact: true }).click();
    await page.getByRole('button', { name: 'PING' }).first().click();
    await expect(page.getByText(/\[(ONLINE|OFFLINE|WARNING)\]/).first()).toBeVisible();
  });
});
