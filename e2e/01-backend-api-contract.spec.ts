import { test, expect } from '@playwright/test';

test.describe('Backend API Contract & Health Suite', () => {
  let createdOrderId: string = '';

  test.beforeAll(async ({ request }) => {
    // Vacate Table T-04 before running tests to ensure clean state
    await request.post('/api/tables/vacate', {
      data: { tableNumber: 'T-04', reason: 'Pre-test Reset' },
    });
  });

  test('01. GET /api/health - verifies system, DB latency, and portal definitions', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('HEALTHY');
    expect(data.database.status).toBe('CONNECTED');
    expect(data.portals.totalTables).toBe(34);
    expect(data.portals.customerScreens).toBe(12);
  });

  test('02. GET /api/session/verify - verifies QR table and seat dining authorization', async ({ request }) => {
    const res = await request.get('/api/session/verify?table=T-04&seat=1&deviceToken=DEV-playwright-contract-token');
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.tableNumber).toBe('T-04');
    expect(data.seatNumber).toBe(1);
    expect(data.active !== undefined || data.isOccupiedByOtherDevice !== undefined).toBe(true);
  });

  test('03. POST /api/orders/create - validates schema, calculates GST, and generates KDS ticket', async ({ request }) => {
    const payload = {
      tableNumber: 'T-04',
      seatNumber: 1,
      deviceToken: 'DEV-playwright-contract-token',
      guestName: 'Playwright Automated Diner',
      guestCount: 1,
      items: [
        {
          id: 'item-chk-biryani-01',
          name: 'Thoogudeepa Donne Chicken Biryani',
          price: 280,
          quantity: 2,
          category: 'DUM BIRYANI',
        },
      ],
      paymentMethod: 'UPI',
      notes: 'Automated E2E Contract Test',
    };

    const res = await request.post('/api/orders/create', { data: payload });
    expect([200, 201]).toContain(res.status());

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.orderId).toBeDefined();
    expect(data.ticketId).toBeDefined();
    expect(data.total).toBe(588);

    createdOrderId = data.orderId;
  });

  test('04. POST /api/payments/initiate - generates zero-typing UPI payment session with QR', async ({ request }) => {
    expect(createdOrderId).toBeTruthy();

    const payload = {
      orderId: createdOrderId,
      tableNumber: 'T-04',
      seatNumber: 1,
      amount: 588,
      paymentMethod: 'UPI',
    };

    const res = await request.post('/api/payments/initiate', { data: payload });
    expect([200, 201]).toContain(res.status());

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.paymentId).toBeDefined();
    expect(data.upiUri).toContain('upi://pay');
    expect(data.qrDataUrl).toBeDefined();
  });

  test('05. POST /api/tables/vacate - resets table and settles session', async ({ request }) => {
    const payload = {
      tableNumber: 'T-04',
      reason: 'Automated E2E Test Reset',
    };

    const res = await request.post('/api/tables/vacate', { data: payload });
    expect([200, 201]).toContain(res.status());

    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
