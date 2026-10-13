# 4-Party Real-Time Collaborative Manual Test Plan
**Thoogudeepa Enterprise Suite**

*Document Version:* 2.0  
*Testing Method:* Live Synchronous Multi-Role Manual E2E Testing  
*Participants:* 4 Human Testers (Customer, Waiter, Chef, Manager)  
*Target Environment:* Localhost / Staging Network with Real-Time State Synchronization  

---

## 1. Executive Overview & Test Objectives

The **Thoogudeepa Enterprise Suite** is a unified, real-time omnichannel restaurant operating platform. Unlike isolated applications, state transitions in one module (such as placing an order, bumping a kitchen ticket, acknowledging a table ping, or applying a manager discount) immediately propagate across all four roles via Supabase Realtime and the shared state bridge.

This manual test plan is designed specifically for **four team members testing simultaneously on four separate devices/windows while communicating in real time** (in person or via a live audio call).

### 1.1 The 4 Testing Roles & Workstations

| Role | Tester Designation | Primary Device / Viewport | Target URL | Default Credentials / Session |
| :--- | :--- | :--- | :--- | :--- |
| **Tester 1** | **Customer (Guest)** | Smartphone or Chrome DevTools Mobile Emulation (390×844 px) | `http://<HOST>:3000/?table=T-01` | Table `T-01` (Guest: "Rahul & Friends", Party size: 2) |
| **Tester 2** | **Waiter (Floor Captain)** | Handheld Mobile / Tablet (390×844 px or 1024×768 px) | `http://<HOST>:3000/waiter/mobile` or `/waiter/tablet` | Captain: Ramesh / Suresh (`Floor Captain`, Section A) |
| **Tester 3** | **Chef (Kitchen Expediter)** | Kitchen Display System (Tablet or Desktop Landscape) | `http://<HOST>:3000/kitchen` | Master PIN: `1234` (Station: `MASTER_DISPATCH` or `DUM_BIRYANI`) |
| **Tester 4** | **Manager (Cashier / Lead)** | Manager POS Station (Desktop / Laptop 1920×1080 px) | `http://<HOST>:3000/manager` | Master PIN: `1234` (General Manager: Manjunath) |

---

## 2. Test Environment Setup & Synchronization Protocol

### 2.1 Network & Pre-Test Configuration
1. **Host Setup**:
   Ensure the Next.js server is running:
   ```bash
   npm run dev
   ```
   If testing on separate physical devices (smartphones/tablets) connected to the same Wi-Fi, run:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
   Find your local machine's IP (e.g. `http://192.168.1.50:3000`) so all devices can access the suite.
2. **Fresh Demo State Reset**:
   Before beginning any test cycle, Tester 4 (Manager) or Tester 2 (Waiter) must click **"Reset Demo State"** (or trigger `resetToFreshDemoState()`) to clear all active orders, restore table capacities, clear dirty KDS tickets, and reset all tables from `T-01` to `T-34` to `VACANT`.
3. **Live Communication Etiquette**:
   Because real-time updates happen within milliseconds, testers must use standardized **Verbal Callouts** before executing and confirming each action (e.g., *"Customer: Placed KOT-1 for T-01 with Donne Biryani"*, *"Chef: KOT-1 received, moving to PREP"*).

---

## 3. Real-Time Telemetry & Cross-Screen Assertion Matrix

Use this quick-reference table during testing to verify that state changes propagate instantly across all 4 screens:

| Action Triggered By | Trigger Action | Customer Screen (T-01) | Waiter Screen (Mobile/Tablet) | Chef KDS Screen | Manager POS Screen |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer** | Places Order from Cart | Transitions to Screen 5 (Tracking: PLACED) | Table T-01 flashes Blue/Active; Bill updates | New KDS Ticket arrives with Audio Chime | Table T-01 active; Gross Sales increase |
| **Customer** | Pings "Water / Cutlery" | Screen 10 shows "Ping Sent: Awaiting Captain" | Red Ping notification banner + sound badge | None (Kitchen stays clean) | Alert logged on Screen M8 (SLA timer starts) |
| **Waiter** | Acknowledges / Resolves Ping | Screen 10 status changes to "Captain On the Way" → Resolved | Ping dismissed from drawer/grid | None | Screen M8 records resolution turnaround time |
| **Chef** | Bumps item to `PREP` | Screen 5 step indicator shifts to "Cooking in Progress" | Table item status reflects "PREP" | Ticket item turns Orange (In Prep) | Kitchen Speed (M5) timer tracks active cook time |
| **Chef** | Bumps item to `PLATED` | Screen 5 step shifts to "Plated & Ready" | Waiter Screen M5 (Dispatch) shows item ready to serve | Ticket item turns Green (Ready) | KDS SLA completes |
| **Waiter** | Marks item as `SERVED` | Screen 5 shows "Delivered to Table" | Item removed from Dispatch feed | Ticket clears from KDS | Floor occupancy timer updates |
| **Chef / Manager** | Marks item as `86` (Out of Stock)| Screen 2 item is grayed out with "86 SOLD OUT" | OrderPad disables item selection | Inventory item marked 86 | Menu 86 master (M10) marks item toggled |
| **Manager** | Applies Discount / Promo | Screen 6 & 7 bill total reflects reduced price | Settlement screen reflects updated balance | None | Screen M4 & M2 recalculate net revenue & tax |
| **Customer / Waiter** | Settle Bill via UPI / Cash | Screen 8 shows Payment Success receipt | Table T-01 moves to BILLING → CLEANING | Cleared from active KDS | Cash drawer / revenue ledger recorded |
| **Waiter** | Vacates & Cleans Table | Customer session cleared / resets to Screen 1 | Table T-01 turns Green (`VACANT`) | Clean | Table marked available for seating |

---

## 4. End-to-End Collaborative Test Scenarios

---

### Scenario TC-01: The Golden Path — Complete Dine-In Dining Lifecycle
**Objective:** Validate the complete end-to-end lifecycle of a guest from seating to digital bill settlement with 100% real-time multi-party synchronization.

* **Initial Condition:** Table `T-01` is `VACANT`. All testers are logged in.

#### Execution Script (Verbal Coordination):
1. **Step 1 (Customer & Waiter - Seating):**
   * *Tester 1 (Customer)* opens `http://<HOST>:3000/?table=T-01`.
   * *Tester 1* speaks: *"Customer: Scanning QR for Table T-01, on Screen 1 Welcome."*
   * *Tester 1* selects Language (English), sets Party Size to 2, types name "Rahul", taps **"PROCEED TO MENU"**.
   * *Tester 2 (Waiter)* checks Screen M2 (Floor Grid).
   * **Expected Assertion:** Table `T-01` displays active guest count (2) and changes state to `OCCUPIED`.
2. **Step 2 (Customer - Menu & Cart Selection):**
   * *Tester 1* navigates Screen 2 Menu.
   * *Tester 1* taps on **"Thoogudeepa Special Donne Biryani"** (₹280).
   * Screen 3 (Item Detail) opens: *Tester 1* selects Option: "Full Portion", checks Add-On: "Boiled Egg (+₹20)", enters special note: "Less spicy please", taps **"ADD TO CART"**.
   * *Tester 1* navigates to Beverages and adds 1 **"Fresh Lime Soda"** (₹60).
   * *Tester 1* taps Floating Cart (Screen 4). Cart shows Total: ₹360 + Taxes.
   * *Tester 1* taps **"CONFIRM & PLACE ORDER"**.
   * *Tester 1* speaks: *"Customer: Order placed for Table T-01!"*
3. **Step 3 (Customer, Waiter, Chef, Manager - Live Order Propagation):**
   * *Tester 1:* Screen automatically transitions to **Screen 5 (Live Tracking)** showing Order Stage: `PLACED`.
   * *Tester 2 (Waiter):* Screen M2 updates immediately; Table `T-01` current bill shows ₹360+tax; KOT count = 1.
   * *Tester 3 (Chef):* Kitchen Screen K2 (Master Dispatch) emits incoming ticket audio chime; new ticket card `KDS-101-xxx` appears for `Table T-01` with:
     * `1x Donne Biryani [Full Portion] (+Boiled Egg) - Note: Less spicy please`
     * `1x Fresh Lime Soda`
   * *Tester 4 (Manager):* Screen M2 (Live Overview) registers Table `T-01` under Active Orders; Gross Sales increases by ₹378.
   * *Tester 3* speaks: *"Chef: KOT ticket received on KDS!"*
4. **Step 4 (Chef - Cooking & Stage Progression):**
   * *Tester 3 (Chef)* taps **"PREP"** button on Donne Biryani.
   * *Tester 3* speaks: *"Chef: Starting preparation on Biryani."*
   * **Expected Assertion:**
     * *Tester 1 (Customer):* Screen 5 tracking progress moves to `PREP` ("Chef is cooking your dish").
     * *Tester 2 (Waiter):* Table sheet reflects item status: `PREP`.
   * After 5 seconds, *Tester 3 (Chef)* taps **"PLATED"** on both items (or clicks ticket bump bar).
   * *Tester 3* speaks: *"Chef: All items are PLATED and ready for pickup!"*
   * **Expected Assertion:**
     * *Tester 1 (Customer):* Screen 5 status updates to `PLATED` ("Food is ready at the pass").
     * *Tester 2 (Waiter):* Screen M5 (Dispatch / Kitchen Ready) lists Table `T-01` items with a green **"SERVE"** badge.
5. **Step 5 (Waiter - Dispatch & Service Delivery):**
   * *Tester 2 (Waiter)* taps **"SERVE"** on the ready items in Screen M5.
   * *Tester 2* speaks: *"Waiter: Dishes served to Table T-01."*
   * **Expected Assertion:**
     * *Tester 1 (Customer):* Screen 5 updates status to `SERVED` ("Enjoy your meal!").
     * *Tester 3 (Chef):* Ticket moves to completed / clears from active cooking board.
6. **Step 6 (Customer & Waiter - Bill Request & Digital Checkout):**
   * *Tester 1 (Customer)* taps **"PROCEED TO BILL"** on Screen 5.
   * Screen 6 (Payment Breakdown) opens. Shows Subtotal, 2.5% CGST, 2.5% SGST, Total.
   * *Tester 1* adds a Tip of ₹50, then taps **"PAY VIA UPI / ONLINE"**.
   * Screen 7 (Payment Gateway) displays a dynamic UPI QR code with countdown timer.
   * *Tester 1* speaks: *"Customer: On Screen 7 scanning UPI QR."*
   * *Tester 1* taps **"SIMULATE PAYMENT SUCCESS"** (or mock UPI payment verification).
   * **Expected Assertion:**
     * *Tester 1 (Customer):* Transitions to **Screen 8 (Payment Confirmation)** with green success checkmark and Invoice ID.
     * *Tester 2 (Waiter):* Table `T-01` turns Orange (`BILLING / PAID`).
     * *Tester 4 (Manager):* Screen M4 and Screen M2 register successful digital settlement.
7. **Step 7 (Customer - Digital Bill, VIP Points & Feedback):**
   * *Tester 1* taps **"VIEW DIGITAL TAX INVOICE"** (Screen 9).
   * *Tester 1* verifies GST breakdown and taps **"DOWNLOAD PDF"** (verifies receipt preview).
   * *Tester 1* taps **"RATE DINING EXPERIENCE"** (Screen 12 Feedback), gives 5 stars, enters comment "Amazing biryani!", taps **"SUBMIT"**.
8. **Step 8 (Waiter & Manager - Table Vacating & Turnaround):**
   * *Tester 2 (Waiter)* navigates to Table `T-01` on Screen M3, taps **"VACATE & CLEAN TABLE"**.
   * *Tester 2* speaks: *"Waiter: Table T-01 vacated and cleared."*
   * **Expected Assertion:**
     * Table `T-01` status changes to `CLEANING` then returns to Green `VACANT`.
     * *Tester 1 (Customer):* If customer refreshes `/?table=T-01`, session is cleanly terminated and ready for the next guest.
     * *Tester 4 (Manager):* Screen M2 active table count decreases by 1.

---

### Scenario TC-02: Waiter-Assisted In-Person Ordering (Handheld KOT)
**Objective:** Verify that orders taken verbally by a Waiter on their handheld device sync seamlessly to the Customer's live tracking screen, the Kitchen KDS, and Manager POS.

* **Initial Condition:** Table `T-02` is `OCCUPIED`. Customer has phone open at `/?table=T-02`.

#### Execution Script:
1. *Tester 1 (Customer)* speaks: *"Customer: We don't want to order via phone; Waiter, please take our order in person."*
2. *Tester 2 (Waiter)* opens Screen M4 (Order Pad) on Handheld Mobile for Table `T-02`.
3. *Tester 2* selects:
   * 1x **Mutton Donne Biryani** (₹340)
   * 1x **Chicken Guntur Dry** (₹240)
4. *Tester 2* taps **"FIRE KOT TO KITCHEN"**.
5. *Tester 2* speaks: *"Waiter: Fired KOT for Table T-02 from handheld."*
6. **Expected Real-Time Assertions:**
   * **Tester 3 (Chef):** KDS immediately displays ticket tagged with badge `SOURCE: WAITER` and server name `Captain Ramesh`.
   * **Tester 1 (Customer):** Customer phone automatically transitions from Menu to **Screen 5 (Live Tracking)** without manual refresh, displaying both items with status `PLACED`.
   * **Tester 4 (Manager):** Live Overview (Screen M2) and Billing POS (Screen M4) reflect the updated KOT and subtotal ₹580.
7. *Tester 3 (Chef)* bumps both items to `PREP` → `PLATED`.
8. *Tester 2 (Waiter)* receives ready notification and taps **"SERVE"**.
9. *Tester 1 (Customer)* confirms items marked as `SERVED` on their personal screen.

---

### Scenario TC-03: Real-Time Waiter Pings & Call-Bell Escalation
**Objective:** Test real-time customer service requests (Water, Cutlery, Bill, Custom message), audio/vibration dispatch to Waiter, and SLA logging on Manager dashboard.

* **Initial Condition:** Table `T-01` is seated.

#### Execution Script:
1. *Tester 1 (Customer)* taps the **"Call Waiter"** icon on the header/footer (Screen 10).
2. *Tester 1* selects service reason: **"WATER"** and adds note: *"Please bring warm drinking water"*, taps **"SEND PING"**.
3. *Tester 1* speaks: *"Customer: Sent ping for Water on T-01."*
4. **Expected Real-Time Assertions:**
   * **Tester 1 (Customer):** Screen 10 displays: *"Ping Sent at [time] • Awaiting Waiter Acceptance"*.
   * **Tester 2 (Waiter):** Handheld device plays notification alert sound; top ping badge shows `(1)`; Drawer displays: *"Table T-01: WATER - Please bring warm drinking water"*.
   * **Tester 4 (Manager):** Screen M8 (Calls & Alerts) logs: `Table T-01 | Ping Type: WATER | Pending Time: 00:01s | SLA Status: GREEN`.
5. *Tester 2 (Waiter)* taps **"ACKNOWLEDGE / ACCEPT"** on the ping.
6. *Tester 2* speaks: *"Waiter: Acknowledged ping for Table T-01."*
7. **Expected Assertions:**
   * **Tester 1 (Customer):** Screen 10 turns blue with banner: *"Captain Ramesh is on the way with your request!"*.
   * **Tester 4 (Manager):** Ping state on Screen M8 changes to `ACCEPTED`.
8. *Tester 2 (Waiter)* walks to the table, serves water, and taps **"RESOLVE PING"**.
9. *Tester 2* speaks: *"Waiter: Ping resolved."*
10. **Expected Assertions:**
    * **Tester 1 (Customer):** Screen 10 confirms resolution and resets to default state.
    * **Tester 2 (Waiter):** Ping clears from the notification drawer.
    * **Tester 4 (Manager):** Screen M8 logs exact response time (e.g. `Turnaround: 24s • SLA MET`).

---

### Scenario TC-04: Kitchen "86" Stock Outage & Real-Time Menu Synchronisation
**Objective:** Verify that when Chef or Manager marks a dish out-of-stock, it is instantly disabled on Customer and Waiter screens, preventing race-condition ordering.

* **Initial Condition:** Customer is actively browsing the menu (Screen 2).

#### Execution Script:
1. *Tester 3 (Chef)* or *Tester 4 (Manager)* opens the **86 / Out of Stock** inventory panel (Screen K2 drawer or Screen M10).
2. *Tester 3 / Tester 4* locates **"Chicken Chilly"** and toggles status to **`86 (OUT OF STOCK)`**.
3. *Tester 3* speaks: *"Chef: Chicken Chilly is now 86'd (Sold Out)!"*
4. **Expected Real-Time Assertions (Without Page Reload):**
   * **Tester 1 (Customer):** On Screen 2 Menu, "Chicken Chilly" immediately displays a red badge **"SOLD OUT (86)"**, image turns greyscale, and the "ADD" button is disabled.
   * **Tester 2 (Waiter):** On Screen M4 (Order Pad), "Chicken Chilly" is crossed out and non-selectable.
5. **Race Condition Test:**
   * If *Tester 1* already had "Chicken Chilly" in the cart before the 86 toggle:
   * *Tester 1* attempts to click **"CONFIRM ORDER"** in Cart (Screen 4).
   * **Expected Assertion:** System blocks checkout with toast alert: *"One or more items in your cart is sold out (Chicken Chilly). Please update your cart."*
6. *Tester 3 (Chef)* re-stocks the dish and toggles 86 status back to **`AVAILABLE`**.
7. *Tester 3* speaks: *"Chef: Chicken Chilly is back in stock."*
8. **Expected Assertion:** Customer and Waiter screens instantly re-enable the item and restore the active "ADD" button.

---

### Scenario TC-05: Kitchen SLA Bottleneck & Prep Delay Broadcasting
**Objective:** Validate dynamic cooking delay notifications when the kitchen encounters high rush.

* **Initial Condition:** Customer is tracking an order on Screen 5.

#### Execution Script:
1. *Tester 3 (Chef)* on Screen K2 opens the delay adjustment on Table `T-01`'s ticket.
2. *Tester 3* adds **+15 Minutes Delay** on the Donne Biryani with reason: *"Fresh dum pot unsealing in progress"*.
3. *Tester 3* speaks: *"Chef: Adding 15 minutes prep delay to T-01 Biryani."*
4. **Expected Assertions:**
   * **Tester 1 (Customer):** Screen 5 ETA progress updates by +15 mins and shows a friendly status badge: *"Fresh dum batch being unsealed — slight delay (+15m)"*.
   * **Tester 2 (Waiter):** Waiter Table Sheet shows the updated ETA so captain can inform guests.
   * **Tester 4 (Manager):** Screen M5 (Kitchen Speed) highlights the ticket in Amber/Red for SLA monitoring.

---

### Scenario TC-06: Multi-Round Ordering (Additive KOTs)
**Objective:** Verify that a table can place multiple consecutive rounds of food and drinks, with KOT numbers incrementing and bills aggregating accurately.

* **Initial Condition:** Table `T-01` has already received Round 1 food.

#### Execution Script:
1. *Tester 1 (Customer)* on Screen 5 taps **"ORDER MORE ITEMS"**.
2. *Tester 1* is taken back to Screen 2 Menu.
3. *Tester 1* adds:
   * 2x **Gulab Jamun with Ice Cream** (₹180)
4. *Tester 1* submits order via Cart.
5. *Tester 1* speaks: *"Customer: Placed Round 2 dessert order!"*
6. **Expected Assertions:**
   * **Tester 3 (Chef):** KDS generates `KDS-102-xxx` tagged as **`KOT #2`** for Table `T-01`.
   * **Tester 2 (Waiter):** Table `T-01` KOT count increases from 1 to 2; Current Bill increases by ₹180 + tax.
   * **Tester 1 (Customer):** Screen 5 tracking now shows both KOT #1 (Served) and KOT #2 (Placed / In Prep).
   * **Tester 4 (Manager):** Billing POS aggregates all items from both KOTs into a single master tab.

---

### Scenario TC-07: Order Item Voiding & Manager Authorization Override
**Objective:** Verify the security and inventory reconciliation workflow when a customer cancels an item or a wrong order is voided.

* **Initial Condition:** Table `T-01` has 1x Donne Biryani and 1x Lime Soda placed.

#### Execution Script:
1. *Tester 1 (Customer)* speaks: *"Customer: Excuse me Captain, we accidentally ordered Lime Soda; please cancel it."*
2. *Tester 2 (Waiter)* opens Table `T-01` on Screen M3, taps **"VOID ITEM"** on Lime Soda.
3. System prompts for **"Manager Authorization Required"**.
4. *Tester 2* calls *Tester 4 (Manager)*: *"Waiter: Requesting Manager PIN to void 1x Lime Soda on T-01."*
5. *Tester 4 (Manager)* reviews reason ("Customer requested cancellation prior to prep"), enters Manager PIN `1234` (or approves remotely from Screen M4).
6. **Expected Real-Time Assertions:**
   * **Tester 3 (Chef):** KDS ticket automatically removes the Lime Soda with a strike-through cancellation alert.
   * **Tester 1 (Customer):** Screen 5 item list updates immediately; Lime Soda is removed from bill and tracker.
   * **Tester 2 (Waiter):** Table bill decreases by ₹60.
   * **Tester 4 (Manager):** Screen M4 records void audit log with timestamp and approving manager ID (`mgr-1`).

---

### Scenario TC-08: Peak Rush Hour Concurrent Ordering Across Multiple Tables
**Objective:** Stress-test real-time concurrency when multiple tables place orders simultaneously.

* **Initial Condition:** Table `T-01` and Table `T-02` are both occupied.

#### Execution Script:
1. *Tester 1 (Customer on T-01)* prepares cart with Biryani.
2. *Tester 2 (Waiter on T-02)* prepares handheld OrderPad with Kebabs.
3. Both testers countdown: *"3... 2... 1... FIRE!"* and press **"PLACE ORDER"** at the exact same second.
4. **Expected Assertions:**
   * **Tester 3 (Chef):** KDS receives both tickets without race condition corruption or missing data. Tickets are strictly sequenced by timestamp.
   * **Tester 4 (Manager):** Live Overview (Screen M2) increments active orders by 2 and calculates accurate combined revenue.
   * No duplicate ticket IDs generated.
   * No table cross-contamination (T-01 items do not leak into T-02).

---

### Scenario TC-09: Table Merging & Unmerging (Large Party Event)
**Objective:** Verify table amalgamation when a party of 8 guests requires merging Tables `T-01` and `T-02`.

* **Initial Condition:** Tables `T-01` (2-seater) and `T-02` (2-seater) are vacant.

#### Execution Script:
1. *Tester 2 (Waiter)* on Waiter Tablet opens `TabletFloorMap.tsx` / `TabletMergeModal.tsx`.
2. *Tester 2* selects Primary Table: `T-01`, Secondary Table: `T-02`, and taps **"CONFIRM MERGE"**.
3. *Tester 2* speaks: *"Waiter: Merged Table T-02 into Table T-01."*
4. **Expected Assertions:**
   * **Tester 2 (Waiter):** Floor grid displays Table `T-01` with badge `MERGED (T-01 + T-02)` and combined capacity 4. Table `T-02` is marked `LOCKED / MERGED`.
   * **Tester 4 (Manager):** Screen M3 (Floor Plan) reflects the unified table cluster.
5. *Tester 1 (Customer)* scans QR code for Table `T-01` and places an order for 4 people.
6. **Expected Assertions:**
   * **Tester 3 (Chef):** KDS ticket header clearly displays `TABLE: T-01 (MERGED w/ T-02)`.
   * **Tester 4 (Manager):** Billing POS aggregates orders under master table `T-01`.
7. **Unmerge Test:**
   * After bill settlement, *Tester 2 (Waiter)* taps **"UNMERGE TABLES"**.
   * Both `T-01` and `T-02` return to individual `VACANT` tables with their original capacities.

---

### Scenario TC-10: Bill Splitting (By Seat Number & 50-50 Equal Split)
**Objective:** Verify dynamic bill splitting where two guests pay separately using different payment methods.

* **Initial Condition:** Table `T-01` has total bill of ₹1,000 (Guest A had ₹600, Guest B had ₹400).

#### Execution Script:
1. *Tester 1 (Customer)* proceeds to Screen 6 (Payment Breakdown), taps **"SPLIT BILL"**.
2. *Tester 1* chooses **"SPLIT 50 / 50 (2 PERSONS)"** (₹500 each).
3. *Tester 1* generates Split QR #1 for Person 1 (₹500) and completes UPI payment.
4. *Tester 1* speaks: *"Customer: Paid Part 1 (₹500 via UPI). Calling waiter for Part 2 cash payment."*
5. **Expected Real-Time Assertions:**
   * **Tester 2 (Waiter):** Screen M6 Settlement reflects Partial Payment received: ₹500; Remaining Balance Due: ₹500. Table status stays `BILLING` (not vacant yet).
   * **Tester 4 (Manager):** Screen M4 POS displays `Split 1 Paid (UPI) | Split 2 Pending`.
6. *Tester 2 (Waiter)* takes ₹500 cash from Guest 2, selects **"CASH"** on Screen M6, enters ₹500 tendered, taps **"COMPLETE SETTLEMENT"**.
7. **Expected Assertions:**
   * Total balance reaches ₹0.00.
   * Table `T-01` transitions to `CLEANING`.
   * Both transactions are logged with distinct receipt numbers.

---

### Scenario TC-11: Manager Promotional Code & Goodwill Comp Override
**Objective:** Verify that discounts applied by Manager POS dynamically propagate to Customer and Waiter billing totals.

* **Initial Condition:** Table `T-01` has active bill of ₹800.

#### Execution Script:
1. *Tester 1 (Customer)* on Screen 6 sees bill total ₹800 + tax = ₹840.
2. *Tester 4 (Manager)* opens Screen M4 (Billing POS), selects Table `T-01`.
3. *Tester 4* applies Promo Code: **`HAPPYHOUR10`** (10% off).
4. *Tester 4* speaks: *"Manager: Applied Happy Hour 10% discount to Table T-01."*
5. **Expected Real-Time Assertions:**
   * **Tester 1 (Customer):** Screen 6 Payment Breakdown updates without reload:
     * Subtotal: ₹800
     * Discount (10%): -₹80
     * Net Taxable: ₹720
     * Taxes: ₹36
     * New Grand Total: ₹756
   * **Tester 2 (Waiter):** Waiter Settlement screen reflects the discount and matches ₹756.
   * **Tester 4 (Manager):** Screen M11 (Sales Report) records promotional markdown under marketing expense.

---

### Scenario TC-12: Cash Settlement & Physical Cash Drawer Balancing
**Objective:** Verify shift-end cash drawer reconciliation between Waiter cash collections and Manager cashier desk.

* **Initial Condition:** Waiter Ramesh has completed 3 cash settlements totaling ₹3,850.

#### Execution Script:
1. *Tester 2 (Waiter)* navigates to Shift Summary (`TabletShiftModal.tsx` / Screen M6), reviews:
   * Total Cash Collected: ₹3,850
   * Tables Served: 3
2. *Tester 2* walks to Manager desk and hands over ₹3,850 in cash.
3. *Tester 2* speaks: *"Waiter: Handing over ₹3,850 shift cash to Manager."*
4. *Tester 4 (Manager)* opens Screen M9 (**Waiter Cash Drawer Reconciliation**).
5. *Tester 4* selects `Captain Ramesh`:
   * System Expected Cash: ₹3,850
   * Handed Over Cash: Enter `3850`
   * Calculated Variance: `₹0.00 (BALANCED)`
6. *Tester 4* taps **"RECONCILE & LOCK CASH"**.
7. **Expected Assertions:**
   * Screen M7 (Staff Roster) updates Ramesh's status from active cash holding to settled.
   * Cashier drawer ledger logs ₹3,850 inflow.

---

### Scenario TC-13: Network Failure, Offline Queuing & Reconnection
**Objective:** Verify resilient offline recovery when a device loses Wi-Fi connectivity and reconnects.

* **Initial Condition:** Customer is on Screen 4 Cart with items ready.

#### Execution Script:
1. *Tester 1 (Customer)* toggles device to **Airplane Mode** (or toggles "Offline" in Chrome DevTools Network tab).
2. **Expected Assertion:** Top banner appears on Customer screen: *"Offline: Connecting to Restaurant Wi-Fi..."*.
3. *Tester 1* taps **"PLACE ORDER"**.
4. System queues mutation locally in storage without crashing or dropping data.
5. *Tester 1* turns Airplane Mode **OFF** (reconnects to Wi-Fi).
6. *Tester 1* speaks: *"Customer: Wi-Fi reconnected!"*
7. **Expected Real-Time Assertions:**
   * App automatically reconnects to Supabase Realtime channel.
   * Queued order fires instantly to backend.
   * **Tester 3 (Chef):** KDS chime triggers and ticket appears.
   * **Tester 2 (Waiter):** Table `T-01` updates to occupied.
   * No duplicate orders created during retry.

---

### Scenario TC-14: Hardware Health Monitoring & Fallback Notification
**Objective:** Verify monitoring of thermal receipt printers, EDC swipe machines, and cash drawer solenoid.

* **Initial Condition:** Manager is on Screen M15 (Printer Health).

#### Execution Script:
1. *Tester 4 (Manager)* reviews Screen M15:
   * `Billing Desk Thermal 80mm` (Status: ONLINE)
   * `Kitchen KDS Dum Biryani Printer` (Status: ONLINE)
   * `HDFC EDC Swipe POS Machine` (Status: ONLINE)
2. *Tester 4* taps **"TEST PRINT BILL RECEIPT"** on Billing Desk Thermal.
3. **Expected Assertion:**
   * Raw ESC/POS byte sequence generates without error.
   * Simulated print spooler status confirms `PRINT SUCCESS (200 OK)`.
4. *Tester 4* toggles Kitchen Printer status to **`WARNING / PAPER OUT`**.
5. **Expected Assertion:**
   * Kitchen KDS displays warning banner alerting chef that physical paper is low, prompting reliance on digital screen bump bar.

---

### Scenario TC-15: Shift Handover & Day Close (Z-Report Fiscal Audit)
**Objective:** Complete the restaurant day cycle with fiscal ledger validation, Z-Report generation, and resetting daily operational states.

* **Initial Condition:** All dining tables are settled and vacant.

#### Execution Script:
1. *Tester 4 (Manager)* navigates to Screen M13 (**Petty Expenses**):
   * Enters voucher for ₹450: "Emergency Fresh Mint & Coriander", Category: "Kitchen Supplies".
2. *Tester 4* navigates to Screen M14 (**Attendance & Tips**):
   * Validates tip pool total (e.g. ₹620) and calculates distribution across active staff.
3. *Tester 4* navigates to Screen M16 (**Day Close & Z-Report**).
4. *Tester 4* verifies summary metrics:
   * Gross Dine-In Sales
   * Discounts & Comps Deducted
   * Net Sales & Tax Breakdown (CGST 2.5%, SGST 2.5%)
   * Total Cash Collected vs UPI / Digital Settlements
5. *Tester 4* enters Manager PIN `1234` and taps **"EXECUTE FISCAL DAY CLOSE (GENERATE Z-REPORT)"**.
6. *Tester 4* speaks: *"Manager: Fiscal Day Close executed. Generating Z-Report."*
7. **Expected Final Assertions:**
   * Z-Report PDF/receipt generates with immutable timestamp and hash.
   * Daily counters, KOT ticket numbers, and active queue tokens are archived and reset to 0.
   * All screens on Customer, Waiter, and Kitchen display clean reset status ready for the next shift.

---

## 5. Defect Logging & Rapid Triage Template

When any tester encounters an issue during this synchronous testing session, record it immediately using this standard format:

```markdown
### Bug Report: [Short Title]
- **Scenario ID:** (e.g., TC-04 Kitchen 86 Stock Outage)
- **Role Discovering:** (Customer / Waiter / Chef / Manager)
- **Time of Incident:** HH:MM:SS
- **Trigger Action:** (e.g., Chef marked Biryani 86'd on Screen K2)
- **Expected Behavior:** (Customer screen should disable "ADD" button within 500ms)
- **Actual Behavior:** (Customer screen remained active; order succeeded)
- **Network / Console Logs:** (e.g., Supabase broadcast websocket error / 409 Conflict)
- **Severity:** [Blocker / High / Medium / Low]
```

---

## 6. Execution Sign-Off Checklist

| Scenario ID | Test Scenario Description | Tester 1 (Cust) | Tester 2 (Wait) | Tester 3 (Chef) | Tester 4 (Mgr) | Overall Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **TC-01** | Golden Path Dine-In Lifecycle | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-02** | Waiter Handheld KOT Ordering | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-03** | Service Pings & Call-Bell Alert SLA | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-04** | Kitchen 86'd Out-of-Stock Sync | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-05** | Kitchen SLA Delay & Prep Notice | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-06** | Multi-Round Additive KOT Ordering | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-07** | Order Item Voiding & Manager PIN | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-08** | Multi-Table Peak Rush Concurrency | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-09** | Table Merging & Unmerging | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-10** | Split Billing (Seat / 50-50 Partial) | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-11** | Manager Promo Code & Discount | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-12** | Cash Settlement & Drawer Balancing | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-13** | Offline Queuing & Reconnection | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-14** | Hardware Health & Thermal Printing | [ ] | [ ] | [ ] | [ ] | **PENDING** |
| **TC-15** | Shift Handover & Day Close Z-Report | [ ] | [ ] | [ ] | [ ] | **PENDING** |
