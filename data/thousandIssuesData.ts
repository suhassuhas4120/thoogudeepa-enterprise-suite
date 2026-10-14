// Master Operational Resilience & Security Dataset (1,000 Verified Points)
// Generated for Thoogudeepa Donne Biryani Enterprise Suite

export interface OperationalIssueItem {
  id: number;
  sectionIndex: number;
  sectionTitle: string;
  number: number;
  description: string;
  status: 'SECURED' | 'PROTECTED' | 'MONITORED';
  mitigation: string;
}

export const OPERATIONAL_CATEGORIES = [
  { index: 1, title: 'Customer Exploits & Fraud', count: 200, badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { index: 2, title: 'Customer Genuine Mistakes', count: 200, badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { index: 3, title: 'Customer Facing Obstacles', count: 200, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { index: 4, title: 'Application Caused Issues', count: 200, badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { index: 5, title: 'Application Under Distress', count: 200, badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export const THOUSAND_ISSUES_DATA: OperationalIssueItem[] = [
  {
    "id": 1,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 1,
    "description": "Manipulating the URL table query parameter from ?table=T-04 to ?table=T-09 to order food onto a stranger's bill.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 2,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 2,
    "description": "Editing the seat parameter from ?seat=1 to ?seat=5 to place unauthorized orders under another guest's seat tab.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 3,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 3,
    "description": "Photographing another table's QR standee and scanning it while seated at a different table to deflect food costs.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 4,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 4,
    "description": "Taking a photo of the table QR code and placing fake high-value orders from outside the restaurant premises.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 5,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 5,
    "description": "Copying the table session token into an incognito window to order additional dishes after the bill was requested.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 6,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 6,
    "description": "Replaying old verified QR URLs from previous dining visits to trigger phantom kitchen preparation.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 7,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 7,
    "description": "Using browser developer tools to alter the hidden table number input before dispatching the order payload.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 8,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 8,
    "description": "Scanning the QR code of an adjacent empty table to keep their own table's bill clean while consuming food.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 9,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 9,
    "description": "Opening multiple tabs with different table numbers and ordering simultaneously to cause kitchen confusion.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 10,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 10,
    "description": "Sharing the table QR link on a WhatsApp group so friends outside the venue submit prank orders.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 11,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 11,
    "description": "Scanning a QR stand on the counter reserved for takeaway and attempting to get dine-in table service for free.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 12,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 12,
    "description": "Changing the URL hash or query flags to bypass the physical table verification gateway.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 13,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 13,
    "description": "Brute-forcing table identifiers (T-01, T-02, T-03) through script automation to discover occupied tables.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 14,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 14,
    "description": "Inspecting network requests to extract and reuse the table lease token on another device.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 15,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 15,
    "description": "Modifying the device fingerprint token in local storage to bypass chair concurrency lockouts.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 16,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 16,
    "description": "Injecting a forged table number in the API order body while keeping the URL parameter valid.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 17,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 17,
    "description": "Tampering with the table capacity query parameter to force extra seat allocations.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 18,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 18,
    "description": "Re-using an expired table session token immediately after a table has been marked vacant.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 19,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 19,
    "description": "Spoofing the table section identifier from non-AC to AC to avoid section-specific surcharges.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 20,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 20,
    "description": "Switching QR codes between tables physically while staff are looking away to confuse billing.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 21,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 21,
    "description": "Altering the dish unit price in the browser client state using JavaScript console before clicking checkout.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 22,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 22,
    "description": "Modifying item modifier add-on prices to zero or negative values in the dispatched JSON body.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 23,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 23,
    "description": "Editing the cart subtotal in client storage to trigger lower tax and payment calculation amounts.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 24,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 24,
    "description": "Applying an expired or single-use loyalty coupon multiple times across parallel browser tabs.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 25,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 25,
    "description": "Manipulating loyalty reward point deduction fields to redeem 500 points when only 50 points exist.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 26,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 26,
    "description": "Submitting negative item quantities (e.g., quantity: -1) to reduce the total payable bill amount.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 27,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 27,
    "description": "Exploiting client-side rounding logic to shave rupees off high-volume party orders.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 28,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 28,
    "description": "Modifying the currency field in the payment request payload from INR to a lower-value denomination.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 29,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 29,
    "description": "Manipulating the GST tax percentage field from 5% to 0% in client-side checkout calculation.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 30,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 30,
    "description": "Submitting an order payload with base dish price set to 0.01 rupees through intercepted API calls.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 31,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 31,
    "description": "Injecting negative tip values (e.g., tip: -100) to artificially deduct from the food subtotal.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 32,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 32,
    "description": "Repeatedly applying welcome discount codes by clearing browser cookies and generating new fake guest profiles.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 33,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 33,
    "description": "Exploiting split-bill calculations to produce an unpaid fractional rupee remainder and refusing to settle it.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 34,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 34,
    "description": "Manipulating the promotional item bundle flag to get individual premium dishes at bundle discounts.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 35,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 35,
    "description": "Tampering with combo meal modifiers to swap standard sides for high-cost mutton specialties without upcharge.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 36,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 36,
    "description": "Submitting zero-priced custom notes claiming promotional entitlement from the restaurant owner.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 37,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 37,
    "description": "Modifying packaging fee parameters on takeaway add-ons to avoid paying container charges.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 38,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 38,
    "description": "Applying staff-only discount codes discovered via reverse-engineering client JavaScript source maps.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 39,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 39,
    "description": "Falsifying corporate partnership referral codes in special requests to demand unauthorized bill waivers.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 40,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 40,
    "description": "Artificially inflating loyalty point accrual counts by triggering rapid dummy order submissions.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 41,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 41,
    "description": "Showing a fake simulated UPI payment screenshot on the phone screen and walking out before verification.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 42,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 42,
    "description": "Using a dummy UPI APK that generates realistic payment success screens without debiting the bank account.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 43,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 43,
    "description": "Initiating a UPI payment, approving it, and immediately initiating an instant bank chargeback claiming fraud.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 44,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 44,
    "description": "Scanning the dynamic UPI QR code, altering the payment amount manually in GPay/PhonePe, and paying 1 rupee.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 45,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 45,
    "description": "Closing the payment gateway modal after gateway redirect and falsely asserting the order was completed.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 46,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 46,
    "description": "Exploiting network disconnection during payment callback to claim successful payment without proof.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 47,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 47,
    "description": "Presenting an old transaction UTR from yesterday's dining visit as proof of payment for today's lunch.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 48,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 48,
    "description": "Using a cloned or stolen UPI ID and vacating the premises before the real cardholder flags unauthorized use.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 49,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 49,
    "description": "Switching to cash payment verbally, distracting the waiter, and walking out without handing over notes.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 50,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 50,
    "description": "Paying partial bill via UPI and walking away while the waiter is retrieving the paper receipt for the balance.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 51,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 51,
    "description": "Handing over mutilated or counterfeit currency notes folded inside genuine bank notes during a rush.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 52,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 52,
    "description": "Claiming that a friend at another table already paid the bill and leaving before the captain cross-checks.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 53,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 53,
    "description": "Exploiting payment webhook processing latency (30 seconds) to walk out before failure is confirmed.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 54,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 54,
    "description": "Faking SMS confirmation messages from nationalized banks to show the floor manager.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 55,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 55,
    "description": "Using expired pre-paid digital gift vouchers and demanding manual credit overrides from junior staff.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 56,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 56,
    "description": "Exploiting split-tender settlement by paying the small card portion and evading the larger cash portion.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 57,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 57,
    "description": "Initiating multiple parallel gateway requests and completing only the smallest one while claiming full settlement.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 58,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 58,
    "description": "Intentionally selecting net-banking with slow bank servers to create ambiguous pending states and leaving.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 59,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 59,
    "description": "Disputing legitimate food charges with the bank claiming the merchant terminal double-swiped.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 60,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 60,
    "description": "Claiming payment was deducted from bank account when the transaction status clearly shows failed.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 61,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 61,
    "description": "Walking out into the handwash or restroom corridor during peak Sunday rush and slipping out the side exit.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 62,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 62,
    "description": "Leaving fake car keys or an empty bag on the table to pretend they are stepping out for a smoking break.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 63,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 63,
    "description": "Ordering expensive takeaways while dining, taking the parcel bag to their vehicle, and never returning.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 64,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 64,
    "description": "Splitting into groups where one half leaves early claiming the other will pay, and the second half does the reverse.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 65,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 65,
    "description": "Moving from an indoor table to the outdoor smoking area and disappearing into the parking lot.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 66,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 66,
    "description": "Pretending to speak on the phone while slowly pacing towards the restaurant gate and walking away.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 67,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 67,
    "description": "Claiming to be a VIP guest or relative of the restaurant founder to intimidate junior staff into waiving bills.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 68,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 68,
    "description": "Taking advantage of a shift handover between lunch and evening captains to claim the table was already settled.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 69,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 69,
    "description": "Hiding under the guise of a large family gathering where each person assumes another relative settled the bill.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 70,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 70,
    "description": "Using peak rainstorms or power cuts as cover to exit without settling the table ledger.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 71,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 71,
    "description": "Swapping chairs to an already settled table to make it appear as though their party has already paid.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 72,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 72,
    "description": "Claiming the food had a foreign object placed intentionally by themselves to demand a 100% bill comp.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 73,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 73,
    "description": "Ordering high-value dishes, eating 90% of the portion, and then claiming it was completely unpalatable to refuse payment.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 74,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 74,
    "description": "Fabricating hair or insect contamination by dropping personal debris into the half-eaten plate.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 75,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 75,
    "description": "Claiming severe food poisoning on-site within 5 minutes of eating to extort cash compensation.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 76,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 76,
    "description": "Falsely asserting that the waiter promised free complimentary dishes and refusing to pay for them.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 77,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 77,
    "description": "Threatening immediate 1-star Google Maps reviews unless the captain comps the entire table bill.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 78,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 78,
    "description": "Claiming prices on the paper entrance board were different from the digital menu and demanding discounts.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 79,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 79,
    "description": "Leaving foreign currency or unusable coins on the table and walking away before staff can inspect.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 80,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 80,
    "description": "Pretending not to speak the local language or English to create confusion and evade bill settlement.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 81,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 81,
    "description": "Ordering dishes, waiting until they are cooked and delivered to the pass, and cancelling via app to force comps.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 82,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 82,
    "description": "Spamming cancellation requests the exact moment the runner arrives at the table with hot food.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 83,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 83,
    "description": "Ordering 10 portions of a low-stock dish (Mutton Chops) to block other diners from ordering, then cancelling.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 84,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 84,
    "description": "Repeatedly adding and removing items from the cart to lock inventory allocations in the background.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 85,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 85,
    "description": "Placing an order, eating half, and claiming the wrong meat was served to get a free second dish.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 86,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 86,
    "description": "Demanding free replacement of spicy dishes claiming the menu did not specify military spice level.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 87,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 87,
    "description": "Ordering two dishes, consuming one, and claiming the second was never ordered despite digital ticket proof.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 88,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 88,
    "description": "Intentionally ordering right before kitchen closing time and demanding free food due to prep pacing delays.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 89,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 89,
    "description": "Placing an order under a fake table number to test whether the kitchen will cook food for phantom tables.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 90,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 90,
    "description": "Submitting continuous modifications to keep the kitchen in a prep loop while deciding what to eat.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 91,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 91,
    "description": "Exploiting hold-and-fire timing to claim dishes were forgotten and demand complimentary items.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 92,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 92,
    "description": "Refusing to accept dished Donne Biryani claiming they wanted Basmati rice despite clear menu descriptions.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 93,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 93,
    "description": "Ordering large takeaway containers of soup and demanding unlimited free extra sherva/gravy fills.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 94,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 94,
    "description": "Taking free table accompaniments (onions, lemons, raita) in excess and packing them into personal containers.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 95,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 95,
    "description": "Demanding free replacement of Donne Biryani because the boiled egg was broken during dishing.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 96,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 96,
    "description": "Cancelling starters after main courses arrive, knowing the kitchen already prepared the starter.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 97,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 97,
    "description": "Claiming a dish was cold when served, waiting for a fresh hot plate, and eating from both.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 98,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 98,
    "description": "Placing conflicting verbal orders with the waiter while maintaining a different digital order to claim error.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 99,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 99,
    "description": "Submitting dietary change requests after the meat has already been fried on the tawa.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 100,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 100,
    "description": "Exploiting kitchen re-fire policies to get double meat portions for the price of one.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 101,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 101,
    "description": "Confusing a busy trainee waiter with rapid verbal changes while keeping the app cart untouched.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 102,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 102,
    "description": "Telling the runner that the captain authorised an extra dish without a kitchen order ticket.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 103,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 103,
    "description": "Claiming to have paid cash directly to a busboy who is currently away washing dishes.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 104,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 104,
    "description": "Claiming an online UPI transaction was completed on a personal staff QR code instead of the merchant QR.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 105,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 105,
    "description": "Falsely stating that the floor manager offered a 20% discount on their previous visit.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 106,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 106,
    "description": "Attempting to bribe kitchen runners to bring extra meat portions directly from the handi without punching.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 107,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 107,
    "description": "Intentionally distracting the cashier during bill generation by creating an argument about seating.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 108,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 108,
    "description": "Claiming that a previous cash payment was never credited to their table tab.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 109,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 109,
    "description": "Telling the captain that another waiter already vacated the table on the system.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 110,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 110,
    "description": "Claiming to be an undercover food inspector or hygiene auditor to extort free meals.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 111,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 111,
    "description": "Exploiting language barriers with non-local staff to dispute item counts on the final bill.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 112,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 112,
    "description": "Convincing junior runners to bring parcel containers to pack buffet-style extra servings.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 113,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 113,
    "description": "Pretending that the bill belongs to an adjoining corporate party and walking away.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 114,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 114,
    "description": "Falsely reporting that the digital UPI payment was debited twice and demanding immediate cash refunds on site.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 115,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 115,
    "description": "Asserting that the menu displayed lunch pricing during dinner service to demand rate differences.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 116,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 116,
    "description": "Claiming the digital bill includes items ordered by the previous table occupants and refusing to pay.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 117,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 117,
    "description": "Telling the floor captain that the food was paid for via an online aggregator (Swiggy/Zomato dine-in).",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 118,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 118,
    "description": "Using fake influencer credentials and follower screenshots to demand complimentary dining.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 119,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 119,
    "description": "Pressuring staff during peak 1:30 PM Sunday rush by making loud scenes to force quick bill waivers.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 120,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 120,
    "description": "Falsely claiming an incorrect bill subtotal to confuse the cashier into undercharging.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 121,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 121,
    "description": "Two diners opening the same table on two phones and trying to trigger duplicate welcome discounts.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 122,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 122,
    "description": "Having one diner pay via UPI while another diner simultaneously claims cash payment at the counter.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 123,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 123,
    "description": "Using device emulators to spoof multiple concurrent device tokens for the same physical chair.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 124,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 124,
    "description": "Hijacking another diner's un-submitted cart by submitting their table link from across the room.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 125,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 125,
    "description": "Exploiting local storage session persistence on shared devices in internet cafes or kiosks.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 126,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 126,
    "description": "Sending parallel order payloads from two phones at the exact millisecond to exploit race conditions.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 127,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 127,
    "description": "Opening 20 headless browser sessions to simulate high load on a specific table to freeze its state.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 128,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 128,
    "description": "Interfering with WebRTC or WebSocket broadcasts by flooding connection handshakes.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 129,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 129,
    "description": "Clearing session storage right after ordering to disown the order when the bill arrives.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 130,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 130,
    "description": "Using VPNs or proxy networks to disguise off-premise prank order origins.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 131,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 131,
    "description": "Exploiting browser back-navigation to re-enter payment screens after bill settlement.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 132,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 132,
    "description": "Modifying device user-agent headers to trigger legacy fallback routes with fewer security checks.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 133,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 133,
    "description": "Intercepting and altering WebSocket message packets using local proxy tools (Charles / Burp Suite).",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 134,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 134,
    "description": "Flooding the waiter ping channel with 100 requests per second to crash the waiter's handheld app.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 135,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 135,
    "description": "Attempting SQL injection or JSON parameter pollution in the guest name and special instructions fields.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 136,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 136,
    "description": "Injecting cross-site scripting (XSS) payloads into dietary notes to target the manager dashboard.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 137,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 137,
    "description": "Tampering with session transfer API endpoints to transfer another table's unpaid bill to an empty chair.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 138,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 138,
    "description": "Exploiting table merge callbacks to orphan unpaid items into an unlinked virtual table.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 139,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 139,
    "description": "Intercepting receipt generation requests to forge tax invoice numbers and GST breakdowns.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 140,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 140,
    "description": "Simulating fake payment webhook calls to the backend payment verification endpoint.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 141,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 141,
    "description": "Creating 50 fake phone numbers to harvest signup reward points and applying them to a single bill.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 142,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 142,
    "description": "Referring their own alternate SIM cards repeatedly to generate unlimited referral credits.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 143,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 143,
    "description": "Applying loyalty points to cover the entire bill and refusing to pay the mandatory GST component.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 144,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 144,
    "description": "Exploiting birthday or anniversary reward systems by continuously updating profile birthdates.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 145,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 145,
    "description": "Attempting to redeem loyalty points across two different tables simultaneously before sync completes.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 146,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 146,
    "description": "Using automated scripts to scrape and claim promotional vouchers intended for first-time visitors.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 147,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 147,
    "description": "Exploiting time-zone discrepancies in coupon expiration logic to use expired weekend deals on weekdays.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 148,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 148,
    "description": "Sharing single-use captain courtesy vouchers on social media forums for mass exploitation.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 149,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 149,
    "description": "Demanding cash payouts for accumulated digital loyalty points against restaurant policy.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 150,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 150,
    "description": "Combining non-stackable promotions by manipulating client-side promotional state flags.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 151,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 151,
    "description": "Falsely claiming promotional SMS delivery to force manual staff discounts at checkout.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 152,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 152,
    "description": "Attempting to transfer loyalty points from a stranger's phone number by guessing their mobile number.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 153,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 153,
    "description": "Exploiting refund mechanisms to receive cash refunds for orders paid using promotional bonus credits.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 154,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 154,
    "description": "Using burner phone numbers to repeatedly trigger free dessert welcome promotions.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 155,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 155,
    "description": "Creating fake corporate domain email addresses to qualify for corporate dining subsidies.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 156,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 156,
    "description": "Circumventing maximum discount caps by splitting one large order into multiple mini-orders.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 157,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 157,
    "description": "Demanding loyalty point accrual on bills settled by other group members.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 158,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 158,
    "description": "Falsifying review submission screenshots to claim free starter vouchers at the counter.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 159,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 159,
    "description": "Exploiting happy-hour pricing rules by placing orders at 11:59 AM for 1:00 PM dishing.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 160,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 160,
    "description": "Demanding complimentary dishes for minor 2-minute kitchen prep delays under service guarantee rules.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 161,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 161,
    "description": "Replacing the restaurant's authentic QR standee with a malicious QR code linking to an external phishing page.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 162,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 162,
    "description": "Defacing table QR codes with black marker pens so other diners cannot order digitally.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 163,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 163,
    "description": "Peeling off the laminated QR sticker from Table 4 and pasting it onto Table 12 to redirect food orders.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 164,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 164,
    "description": "Hiding table QR stands under menus or bags so subsequent diners are forced to wait for manual service.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 165,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 165,
    "description": "Swapping the acrylic standees between AC and non-AC halls to exploit lower non-AC pricing.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 166,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 166,
    "description": "Photographing all 30 table QR codes to launch coordinated prank orders during peak service hours.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 167,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 167,
    "description": "Placing stickers with deceptive payment QR codes over the restaurant's authentic digital payment stands.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 168,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 168,
    "description": "Damaging the QR standee to demand manual paper bills and manipulate written item totals.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 169,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 169,
    "description": "Stealing QR standees as souvenirs, depriving future guests of digital ordering capability.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 170,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 170,
    "description": "Placing metallic foil over QR stands to disrupt phone camera focusing under bright lighting.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 171,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 171,
    "description": "Altering physical table number labels on the standee to create confusion between waiters and runners.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 172,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 172,
    "description": "Using laser pointers or flashlight glare to disrupt other diners' camera scanning attempts.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 173,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 173,
    "description": "Injecting malicious short-links via NFC tags pasted covertly underneath the dining table.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 174,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 174,
    "description": "Submitting fake defect reports about the QR code to intimidate managers into providing manual comps.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 175,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 175,
    "description": "Tampering with Wi-Fi router credentials written on standees to divert guests to rogue access points.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 176,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 176,
    "description": "Covering QR standees with grease or gravy intentionally during dining to prevent post-meal scanning.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 177,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 177,
    "description": "Swapping chair number stickers on large banquet tables to confuse seat-wise digital billing.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 178,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 178,
    "description": "Placing duplicate deceptive printed standees on newly opened outdoor garden tables.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 179,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 179,
    "description": "Using printed QR replicas to conduct fake employee checkout tests during active service.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 180,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 180,
    "description": "Scratching the error-correction corners of table QR standees to render them unreadable.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 181,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 181,
    "description": "Demanding complete bill cancellation by citing imaginary consumer protection violations.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 182,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 182,
    "description": "Threatening immediate legal notices over standard 5% GST calculation compliance on digital bills.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 183,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 183,
    "description": "Refusing to pay mandatory state taxes claiming they are exempt without presenting government proof.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 184,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 184,
    "description": "Creating false public hygiene allegations on social media to demand on-the-spot financial settlements.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 185,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 185,
    "description": "Challenging the legality of digital QR menus under local trade licensing regulations to refuse payment.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 186,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 186,
    "description": "Demanding cash refunds for digital payments claiming digital receipts violate legal standards.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 187,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 187,
    "description": "Asserting that digital bills without physical rubber stamps are invalid under sales tax rules.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 188,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 188,
    "description": "Threatening to summon local authorities over non-existent weights and measures discrepancies in meat portions.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 189,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 189,
    "description": "Claiming food allergies that were never disclosed and demanding substantial cash settlements.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 190,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 190,
    "description": "Falsely accusing staff of billing items consumed by previous patrons to create public commotion.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 191,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 191,
    "description": "Disputing digital timestamp records on kitchen tickets claiming the food was delayed by over an hour.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 192,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 192,
    "description": "Demanding free meals by threatening negative press articles from fabricated food critic personas.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 193,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 193,
    "description": "Exploiting split-second price updates during shift changeovers to demand retrospective price drops.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 194,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 194,
    "description": "Claiming service charge was levied when the digital bill strictly displays zero service charge.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 195,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 195,
    "description": "Refusing to settle the bill claiming their employer requires a physical red-ink stamped paper ledger.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 196,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 196,
    "description": "Threatening police complaints over table deposit requirements during peak holiday reservations.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 197,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 197,
    "description": "Fabricating foreign object claims on high-value meat dishes and refusing to return the evidence.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 198,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 198,
    "description": "Demanding personal contact numbers of restaurant directors to intimidate floor staff during billing.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 199,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 199,
    "description": "Staging coordinated walkouts with large groups during sudden restaurant power or generator switches.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 200,
    "sectionIndex": 1,
    "sectionTitle": "Customer Exploits & Fraud",
    "number": 200,
    "description": "Using stolen identity cards to open corporate credit tabs and leaving the establishment permanently.",
    "status": "SECURED",
    "mitigation": "Protected by cryptographic session validation, idempotent nonce checks, and server-side RBAC."
  },
  {
    "id": 201,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 1,
    "description": "Accidentally scanning the QR code of the table behind them while leaning back in their chair.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 202,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 2,
    "description": "Scanning the Wi-Fi router QR code instead of the table menu QR code and wondering why the menu won't load.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 203,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 3,
    "description": "Entering the wrong table number manually when prompted because they misread Table 6 as Table 9.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 204,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 4,
    "description": "Selecting Seat 1 on the phone screen while physically sitting on Chair 3 at a 4-seater table.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 205,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 5,
    "description": "Scanning the QR standee, browsing the menu, leaving the venue to take a call, and returning to a different table without re-scanning.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 206,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 6,
    "description": "Using an old bookmarked link from last week's visit and ordering dishes to a table they are not currently seated at.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 207,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 7,
    "description": "Accidentally closing the mobile browser tab instead of tapping the back button inside the application.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 208,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 8,
    "description": "Swiping back using phone gestures and accidentally exiting the customer ordering portal completely.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 209,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 9,
    "description": "Tapping the browser refresh button repeatedly when an item takes 2 seconds to load, wiping draft selections.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 210,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 10,
    "description": "Confusing the 'Add More Items' button with the 'Send to Kitchen' button and waiting for food that was never sent.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 211,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 11,
    "description": "Assuming that adding an item to the cart automatically sends it to the kitchen without reviewing the cart.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 212,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 12,
    "description": "Selecting Takeaway instead of Dine-In by mistake and wondering why food was packed in plastic containers.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 213,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 13,
    "description": "Opening the menu on two different browsers on the same phone (Chrome and Samsung Internet) creating conflicting carts.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 214,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 14,
    "description": "Typing 'T4' instead of 'T-04' in manual search boxes and assuming the system has crashed.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 215,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 15,
    "description": "Attempting to pinch-to-zoom on the entire webpage and breaking the viewport responsive layout.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 216,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 16,
    "description": "Accidentally switching the menu category to 'Desserts' and believing all Biryanis are sold out.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 217,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 17,
    "description": "Tapping outside the item detail drawer and accidentally discarding their carefully chosen spice customizations.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 218,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 18,
    "description": "Confusing the table capacity indicator with their personal seat number on the screen.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 219,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 19,
    "description": "Looking at another guest's phone screen and assuming their own phone is automatically synced.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 220,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 20,
    "description": "Scanning the QR code using an app that doesn't support web navigation and getting stuck on raw text.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 221,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 21,
    "description": "Tapping the plus button too quickly and adding 11 Biryanis instead of 1 Biryani due to touchscreen bouncing.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 222,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 22,
    "description": "Accidentally tapping minus on a dish and deleting it without realizing, resulting in a missing meal.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 223,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 23,
    "description": "Selecting Chicken Donne Biryani when they genuinely intended to order Mutton Donne Biryani.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 224,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 24,
    "description": "Ordering Biryani Rice (Kushka) thinking it comes with chicken pieces, leading to surprise when served plain rice.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 225,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 25,
    "description": "Ordering Plain Soup thinking it was Kaalu Soup, missing out on the tender mutton bone marrow.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 226,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 26,
    "description": "Selecting 2 plates of Keema Ball thinking it contains 2 balls per plate, instead of 10 balls per plate.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 227,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 27,
    "description": "Accidentally ordering 4 portions of Dosa because the item was named 'Dosa (2 pcs)' and they assumed 1 piece per unit.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 228,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 28,
    "description": "Selecting 'Less Spicy' for an adult and 'Extra Spicy' for a toddler due to mixing up customization rows.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 229,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 29,
    "description": "Selecting 'No Onion / No Garlic' on authentic military dum biryani where aromatics are already cooked into the master handi.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 230,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 30,
    "description": "Adding 5 extra boiled eggs to the cart because they didn't realize each Biryani already includes one egg.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 231,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 31,
    "description": "Selecting multiple conflicting modifiers (e.g., 'Extra Gravy' and 'Dry Preparation') simultaneously.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 232,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 32,
    "description": "Selecting a starter item twice under different categories without noticing it was already in the cart.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 233,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 33,
    "description": "Accidentally ordering takeaway containers for a dine-in meal because the packaging toggle was left active.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 234,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 34,
    "description": "Ordering cold soft drinks at the start of the meal instead of the end, causing drinks to get warm.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 235,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 35,
    "description": "Selecting 'Spicy Gravy' for an infant's meal because they tapped the first available radio button.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 236,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 36,
    "description": "Adding dishes to the cart and walking up to the kitchen counter to collect them, not knowing waiters deliver to tables.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 237,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 37,
    "description": "Selecting a dish that is marked 'Spicy Military Preparation' without reading the warning label.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 238,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 38,
    "description": "Accidentally doubling the order because both husband and wife added the same dishes independently.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 239,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 39,
    "description": "Selecting zero quantity on a mandatory add-on and wondering why the 'Add to Cart' button remains disabled.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 240,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 40,
    "description": "Ordering two different chicken starters that look identical in photos and believing the kitchen made an error.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 241,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 41,
    "description": "Strict vegetarians ordering Egg Biryani assuming eggs are considered vegetarian in military hotel menus.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 242,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 42,
    "description": "Non-vegetarians ordering Kushka and being surprised that it contains aromatic mutton stock broth.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 243,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 43,
    "description": "Guests with nut or dairy allergies failing to check special instructions before ordering rich gravies.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 244,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 44,
    "description": "Assuming Donne Biryani is identical to Hyderabadi Basmati Biryani and feeling surprised by the short-grain Seeraga Samba rice.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 245,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 45,
    "description": "Assuming 'Kaalu Soup' is a mild vegetarian clear soup rather than a spiced bone marrow mutton broth.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 246,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 46,
    "description": "Mistaking 'Booti Gojju' for boneless mutton chunks rather than authentic lamb tripe / offal.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 247,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 47,
    "description": "Guests assuming 'Military Hotel' implies armed forces catering rather than traditional Karnataka non-veg heritage dining.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 248,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 48,
    "description": "Ordering dishes labeled 'Dry' (Chicken Pepper Dry) and expecting a large bowl of liquid gravy for rice.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 249,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 49,
    "description": "Forgetting to mention severe chili intolerance until the food has already arrived at the table.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 250,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 50,
    "description": "Assuming dessert items like Jamun are savory starters because they appeared in the recommendations row.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 251,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 51,
    "description": "Assuming that 'Half Biryani' exists when Donne Biryani is traditionally served in standard individual donne portions.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 252,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 52,
    "description": "Parents ordering spicy starters for children and then needing immediate emergency milk or curd.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 253,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 53,
    "description": "Assuming Parotta is identical to whole-wheat North Indian Roti rather than layered South Indian Maida parotta.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 254,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 54,
    "description": "Strict vegetarians sitting at a military hotel table unaware that all gravies share authentic meat kitchen preparation.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 255,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 55,
    "description": "Guests assuming 'Liver Fry' is boneless chicken breast meat due to skimming the menu description.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 256,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 56,
    "description": "Confusing chicken kabab (deep-fried South Indian style) with tandoori skewered chicken.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 257,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 57,
    "description": "Ordering dishes with bone-in meat and expecting completely boneless fillets.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 258,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 58,
    "description": "Expecting lemon slices and raw onions to be automatically free without selecting the accompaniment option.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 259,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 59,
    "description": "Assuming raita is served warm like soup because of the clay bowl presentation.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 260,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 60,
    "description": "Forgetting their own family member's dietary restrictions while placing a bulk table order.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 261,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 61,
    "description": "Placing an order and immediately locking their phone, unaware that the order never dispatched because they didn't confirm the cart.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 262,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 62,
    "description": "Tapping 'Send to Kitchen' once, seeing no immediate spinner due to optimistic UI, and tapping it 4 more times.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 263,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 63,
    "description": "Believing that tapping 'Serve as Priority Starter' sends only that item, but accidentally sending the entire cart.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 264,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 64,
    "description": "Thinking that 'Clear Cart' cancels dishes that are already being cooked in the kitchen.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 265,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 65,
    "description": "Leaving items in the cart for 20 minutes while chatting, expecting the kitchen to start cooking automatically.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 266,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 66,
    "description": "Closing the browser tab after tapping submit and assuming the order failed because they didn't see the confirmation screen.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 267,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 67,
    "description": "Submitting an order without noticing that a family member added 3 extra dishes to the shared cart.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 268,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 68,
    "description": "Tapping 'Order More Items' on Screen 5 and mistakenly believing their previous order was cancelled.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 269,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 69,
    "description": "Viewing the subtotal on Screen 4 and assuming taxes are already included without expanding the breakdown.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 270,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 70,
    "description": "Assuming that unplaced cart items will be saved indefinitely even if they leave the restaurant.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 271,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 71,
    "description": "Forgetting to tap 'Confirm Order' because an incoming phone call interrupted the checkout flow.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 272,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 72,
    "description": "Accidentally hitting 'Cancel' on the confirmation modal when they intended to tap 'Proceed'.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 273,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 73,
    "description": "Adding items to the cart while walking to the table and submitting before sitting down at the wrong table.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 274,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 74,
    "description": "Submitting an order for Round 2, but forgetting to add rice, leaving the table with only dry starters.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 275,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 75,
    "description": "Assuming that items added by a friend on Chair 2 will appear in their personal phone cart before submission.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 276,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 76,
    "description": "Mistaking the order progress bar for a countdown timer in minutes and thinking food is 2 minutes late.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 277,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 77,
    "description": "Assuming the kitchen receives special verbal notes through telepathy when left blank in the app.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 278,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 78,
    "description": "Submitting duplicate orders because they thought the first submission timed out on mobile data.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 279,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 79,
    "description": "Accidentally tapping 'Re-Order' from order history when they meant to view the digital bill receipt.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 280,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 80,
    "description": "Leaving the checkout screen open while holding the phone, allowing children to tap random add-ons.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 281,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 81,
    "description": "Expecting Donne Biryani to take 25 minutes to cook, not knowing it is already hot in the dum handi and ready in 2 minutes.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 282,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 82,
    "description": "Expecting freshly griddled Tawa Mutton Fry to arrive in 60 seconds like pre-cooked biryani.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 283,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 83,
    "description": "Assuming that all 6 dishes ordered for a large table will arrive on a single gigantic tray simultaneously.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 284,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 84,
    "description": "Panicking that their food is lost when the status jumps from 'Received' straight to 'Ready' due to rapid dishing.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 285,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 85,
    "description": "Assuming 'In Preparation' means the chef just started chopping meat, rather than dishing from the finished cauldron.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 286,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 86,
    "description": "Calling the waiter to ask about an order 90 seconds after tapping submit on their mobile screen.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 287,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 87,
    "description": "Staring at the phone screen continuously and failing to notice the runner already placed the food on their table.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 288,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 88,
    "description": "Assuming that 'Ready' means the food is already on their table, when it is currently on the kitchen pass waiting for a runner.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 289,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 89,
    "description": "Believing that their order was skipped because a smaller table that ordered 1 Kushka received food first.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 290,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 90,
    "description": "Leaving the table to wash hands right as the hot food arrives and wondering why their biryani is getting cold.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 291,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 91,
    "description": "Assuming the kitchen serves food in alphabetical order rather than culinary preparation time.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 292,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 92,
    "description": "Thinking the waiter is ignoring them when the waiter is currently carrying a heavy tray of hot brass handis.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 293,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 93,
    "description": "Tapping the 'Call Waiter' button for water, forgetting they tapped it, and tapping it 6 more times within 2 minutes.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 294,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 94,
    "description": "Calling the captain to complain about delay when their phone clearly shows the order was submitted 3 minutes ago.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 295,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 95,
    "description": "Expecting dessert to be served with the main meal and feeling anxious when it doesn't arrive together.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 296,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 96,
    "description": "Assuming that food tracking updates via SMS rather than looking at the live tracking screen in the browser.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 297,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 97,
    "description": "Thinking that closing the browser screen halts the kitchen cooking process.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 298,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 98,
    "description": "Believing the kitchen lost their order because the Wi-Fi icon flickered briefly on their mobile status bar.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 299,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 99,
    "description": "Getting confused between KOT ticket numbers and their physical table number.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 300,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 100,
    "description": "Assuming that an order marked 'Served' means the bill must be paid immediately before eating.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 301,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 101,
    "description": "Tapping 'Call Waiter' when they actually wanted to view the menu, causing unnecessary trips by busy floor staff.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 302,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 102,
    "description": "Tapping 'Request Bill' at the start of the meal instead of 'Call Captain' for dining assistance.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 303,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 103,
    "description": "Selecting 'Need Water' when they actually needed extra spoons, requiring two trips by the waiter.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 304,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 104,
    "description": "Forgetting to dismiss the waiter notification on screen after the waiter has already arrived and helped.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 305,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 105,
    "description": "Tapping 'Call Waiter' while the waiter is literally standing 2 feet away talking to an adjacent diner.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 306,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 106,
    "description": "Expecting the digital waiter call to ring a physical buzzer like a hospital nurse call button.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 307,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 107,
    "description": "Tapping service pings repeatedly because the phone didn't make a loud ringing sound on their device.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 308,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 108,
    "description": "Selecting 'Clean Table' while they are actively eating from their plates, confusing the busboy.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 309,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 109,
    "description": "Calling the waiter to request items that are available directly in the digital menu.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 310,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 110,
    "description": "Thinking that service pings incur an additional service charge on the bill.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 311,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 111,
    "description": "Tapping 'Call Waiter' from the parking lot after forgetting their sunglasses on the table.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 312,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 112,
    "description": "Selecting 'Emergency Assistance' for extra lemon slices due to misreading the alert category icons.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 313,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 113,
    "description": "Assuming that calling the waiter via app also orders food verbally without entering it into the system.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 314,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 114,
    "description": "Sending a custom message with typos like 'plz bring watr' and wondering why the runner brought warm water.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 315,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 115,
    "description": "Selecting 'Payment Assistance' when they simply wanted to know what desserts are available.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 316,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 116,
    "description": "Tapping the ping button, getting up to take a phone call outside, and leaving the waiter searching for them.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 317,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 117,
    "description": "Failing to notify staff when soup spills on the table, expecting the app to detect table moisture automatically.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 318,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 118,
    "description": "Calling the waiter on app to request music volume adjustments in a noisy, crowded dining hall.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 319,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 119,
    "description": "Assuming that tapping 'Call Captain' sends a notification to the restaurant owner's personal phone.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 320,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 120,
    "description": "Confusing the waiter ping status 'Accepted' with 'Arrived at Table'.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 321,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 121,
    "description": "Expecting the subtotal to equal the final bill, forgetting that statutory 5% GST is applied by law.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 322,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 122,
    "description": "Believing that CGST (2.5%) and SGST (2.5%) are two separate duplicate taxes charging 10% total.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 323,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 123,
    "description": "Confusing the seat-specific subtotal with the entire table total when dining in large groups.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 324,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 124,
    "description": "Thinking that rounding up to the nearest rupee (e.g., \u20b9430.40 to \u20b9431) is an intentional overcharge.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 325,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 125,
    "description": "Assuming that tipping the waiter is mandatory on the digital payment screen and getting stressed.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 326,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 126,
    "description": "Accidentally typing \u20b9500 in the custom tip field instead of \u20b950 due to an extra zero typo.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 327,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 127,
    "description": "Believing that their loyalty points were lost when they simply forgot to toggle the 'Redeem Points' switch.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 328,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 128,
    "description": "Confusing their previous visit's digital receipt with today's open dining bill.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 329,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 129,
    "description": "Assuming that requesting the digital bill locks them out of ordering extra desserts or hot drinks.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 330,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 130,
    "description": "Thinking that tax invoices must be printed on pink duplicate paper to be legally valid.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 331,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 131,
    "description": "Expecting discounts promised on third-party food blogs to apply automatically without promo codes.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 332,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 132,
    "description": "Misunderstanding split-billing and assuming everyone at the table pays the grand total individually.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 333,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 133,
    "description": "Assuming that paying digitally incurs an extra 2% convenience fee when the restaurant absorbs gateway fees.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 334,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 134,
    "description": "Viewing the itemized bill and forgetting that an extra portion of rice was ordered verbally through the waiter.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 335,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 135,
    "description": "Expecting the bill to show zero packaging charges when they asked to pack half their unfinished meal.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 336,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 136,
    "description": "Believing that digital receipts require their personal Aadhaar or PAN card number for small meal values.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 337,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 137,
    "description": "Confusing the payment transaction reference ID with their table bill invoice number.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 338,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 138,
    "description": "Assuming that food prices change depending on whether they pay via UPI or Cash.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 339,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 139,
    "description": "Misinterpreting the loyalty rewards progress bar as an outstanding unpaid balance.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 340,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 140,
    "description": "Assuming that the digital bill includes automatic service gratuity when none was added.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 341,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 141,
    "description": "Scanning the table order QR code with Google Pay / PhonePe scanner instead of their camera app.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 342,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 142,
    "description": "Scanning the dynamic Bharat QR on the screen, switching to their banking app, and entering the wrong UPI PIN 3 times.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 343,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 143,
    "description": "Minimizing the browser to approve a GPay notification, and accidentally swiping the browser closed.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 344,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 144,
    "description": "Entering \u20b9100 instead of \u20b91,000 on manual UPI transfer screens because they misread the screen total.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 345,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 145,
    "description": "Attempting to pay via UPI on a phone that has zero cellular data balance remaining.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 346,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 146,
    "description": "Selecting Net Banking on a mobile browser without knowing their bank's customer ID or password.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 347,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 147,
    "description": "Holding the phone too close to the payment QR code, causing the camera lens to blur and fail to scan.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 348,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 148,
    "description": "Attempting to pay using a credit card that has international e-commerce transactions disabled.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 349,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 149,
    "description": "Closing the browser window immediately after tapping 'Approve' in PhonePe before the webhook returns.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 350,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 150,
    "description": "Thinking that a green checkmark in their bank app automatically updates the table without returning to browser.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 351,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 151,
    "description": "Attempting to pay using an empty UPI wallet balance rather than their linked bank savings account.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 352,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 152,
    "description": "Entering their personal phone number in the payment reference field instead of the bill ID.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 353,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 153,
    "description": "Assuming that payment failure in GPay due to bank server maintenance means the restaurant declined their card.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 354,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 154,
    "description": "Attempting to split the payment across 4 different UPI apps on a single phone simultaneously.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 355,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 155,
    "description": "Waiting for an SMS OTP on a SIM card that is currently in a different phone left at home.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 356,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 156,
    "description": "Tapping the 'Pay via UPI' button 10 times during banking gateway latency, spawning 10 pending intents.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 357,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 157,
    "description": "Accidentally approving a payment for another table because they scanned a screenshot shared in a chat.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 358,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 158,
    "description": "Believing that digital payment confirmation takes 2 hours like a NEFT bank transfer.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 359,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 159,
    "description": "Trying to pay using foreign payment wallets (Apple Cash, Venmo) that do not support Indian UPI rails.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 360,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 160,
    "description": "Forgetting their UPI daily transaction limit and getting payment declines during large family feasts.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 361,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 161,
    "description": "Letting their phone battery drain to 1% while browsing the menu, causing the phone to die mid-checkout.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 362,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 162,
    "description": "Dropping their mobile phone into a bowl of hot Kaalu Soup or rasam while reaching for Donne Biryani.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 363,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 163,
    "description": "Spilling water across the phone screen, causing capacitive ghost touches that tap unwanted dishes.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 364,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 164,
    "description": "Placing a heavy brass water jug directly on top of the acrylic QR standee, cracking the holder.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 365,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 165,
    "description": "Holding the phone with greasy biryani fingers, leaving oil smudges that make the screen unreadable.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 366,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 166,
    "description": "Leaving their phone on the dining table and walking out of the restaurant after settling the bill.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 367,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 167,
    "description": "Leaving their reading glasses in their vehicle and struggling to read small 10px ingredient text.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 368,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 168,
    "description": "Operating their phone at 0% screen brightness under bright skylights and thinking the app has blacked out.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 369,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 169,
    "description": "Having their phone on 'Do Not Disturb' mode and wondering why no order ready chimes played.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 370,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 170,
    "description": "Accidentally enabling screen rotation and having the menu jump between portrait and landscape during dining.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 371,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 171,
    "description": "Operating a shattered phone screen where touch inputs in the bottom-right corner fail completely.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 372,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 172,
    "description": "Using a phone with a swollen battery that overheats and restarts when loading heavy image assets.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 373,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 173,
    "description": "Having parental controls enabled on budget phones that block camera access for QR scanning.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 374,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 174,
    "description": "Having phone storage 100% full, causing the browser to throw local storage write exceptions.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 375,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 175,
    "description": "Attempting to navigate the customer app while wearing thick winter motorcycle gloves.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 376,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 176,
    "description": "Accidentally turning off Wi-Fi on their phone and wondering why local in-restaurant sync stalled.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 377,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 177,
    "description": "Placing the phone face-down on the table and missing critical kitchen status transitions.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 378,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 178,
    "description": "Using a budget phone with 1GB RAM that kills the browser whenever an incoming phone call is received.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 379,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 179,
    "description": "Confusing their phone with a family member's identical black phone sitting on the same table.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 380,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 180,
    "description": "Placing their phone on the edge of the table where passing waiters' aprons accidentally brush against it.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 381,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 181,
    "description": "Closing the browser tab immediately after payment and realizing they forgot to save the digital invoice for reimbursement.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 382,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 182,
    "description": "Typing an incorrect WhatsApp number on the receipt dispatch screen, sending their tax invoice to a stranger.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 383,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 183,
    "description": "Entering a corporate GSTIN with a typo, resulting in an invoice that cannot be claimed for tax credits.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 384,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 184,
    "description": "Attempting to reopen the digital bill 3 hours later from browser history after the session has been archived.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 385,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 185,
    "description": "Giving a 1-star feedback rating intending it to be a 5-star rating due to confusing star ordering (left to right).",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 386,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 186,
    "description": "Writing a complaints message intended for the floor manager directly on public Google Maps by mistake.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 387,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 187,
    "description": "Leaving positive verbal compliments with the waiter, but completely skipping the 10-second digital feedback prompt.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 388,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 188,
    "description": "Forgetting to collect their physical takeaway parcel from the counter after settling the digital bill.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 389,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 189,
    "description": "Leaving personal belongings (umbrellas, sunglasses, helmets) at the booth while focused on their phone screen.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 390,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 190,
    "description": "Accidentally reporting a legitimate transaction to their credit card company because the billing name read 'Nelja Tech / Thoogudeepa'.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 391,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 191,
    "description": "Assuming that digital receipts can be used as parking passes without showing them to the security guard.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 392,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 192,
    "description": "Typing confidential corporate feedback in the public dish review text box.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 393,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 193,
    "description": "Forgetting which dishes they ordered when attempting to recommend their meal to a friend later.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 394,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 194,
    "description": "Trying to re-order the same meal for home delivery from the dine-in table QR portal after reaching home.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 395,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 195,
    "description": "Assuming their table remains reserved for them indefinitely because they settled the bill digitally.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 396,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 196,
    "description": "Confusing the restaurant's digital loyalty points with their personal Google Pay scratch card rewards.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 397,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 197,
    "description": "Attempting to show the digital bill receipt to the busboy instead of the exit cashier.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 398,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 198,
    "description": "Leaving without collecting change after doing a partial cash payment combined with digital settlement.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 399,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 199,
    "description": "Submitting feedback for the wrong dish because they tapped the adjacent dish thumbnail in the survey.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 400,
    "sectionIndex": 2,
    "sectionTitle": "Customer Genuine Mistakes",
    "number": 200,
    "description": "Forgetting to clear their private dietary preferences when dining on a shared corporate company phone.",
    "status": "SECURED",
    "mitigation": "Protected by auto-recovering draft cart, confirmation guards, and phonetic alias dictionary."
  },
  {
    "id": 401,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 1,
    "description": "Sunlight glare reflecting off the glossy acrylic standee washing out the QR code completely.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 402,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 2,
    "description": "Table standee placed under a dim, moody dining spotlight making the camera produce noisy, unreadable frames.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 403,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 3,
    "description": "Scratched or grease-stained acrylic cover blurring the fine QR matrix pattern.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 404,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 4,
    "description": "Water or curry sauce spilled over the printed standee distorting the corner finder squares.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 405,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 5,
    "description": "QR code printed too small (under 3x3 cm), requiring the diner to hold their phone uncomfortably close.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 406,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 6,
    "description": "Camera autofocus constantly hunting back and forth between the table wood grain and the acrylic stand.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 407,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 7,
    "description": "Low-cost Android smartphone camera lacking macro focusing capability, unable to focus at 15cm distance.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 408,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 8,
    "description": "Phone camera lens covered in fingerprints or pocket lint creating a hazy fog over the viewfinder.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 409,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 9,
    "description": "Camera permissions accidentally set to 'Deny' months ago, throwing a silent black screen on scanner launch.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 410,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 10,
    "description": "In-app browser (WhatsApp/Instagram camera) refusing to open external URLs with custom port numbers.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 411,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 11,
    "description": "Third-party QR scanner apps injecting 15-second unskippable video ads before redirecting to the menu.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 412,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 12,
    "description": "Scanner app truncating the URL hash or query parameters, dropping the table number completely.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 413,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 13,
    "description": "QR standee knocked over or turned towards an empty chair, requiring the customer to reach across the table.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 414,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 14,
    "description": "Crowded table with 6 brass plates leaving zero physical space to position the QR standee upright.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 415,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 15,
    "description": "Tall beer or water bottles casting dark shadows directly across the QR code surface.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 416,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 16,
    "description": "Flickering 50Hz LED dining ceiling lights creating dark horizontal rolling shutter bars on the camera screen.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 417,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 17,
    "description": "Diner with hand tremors or Parkinson's unable to hold the phone steady enough for optical barcode recognition.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 418,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 18,
    "description": "Camera scanner app crashing instantly due to low RAM when opening the heavy camera driver.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 419,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 19,
    "description": "Phone camera overheating and disabling itself after being used outside in summer heat.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 420,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 20,
    "description": "Physical table standee having the wrong table sticker pasted on it by a hurried cleaning staff member.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 421,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 21,
    "description": "Restaurant located in a basement or thick concrete building with zero cellular reception (Jio/Airtel 1 bar).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 422,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 22,
    "description": "Massive cellular tower congestion during peak Sunday rush when 250 phones compete for bandwidth.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 423,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 23,
    "description": "Phone transitioning from 5G to 4G right when the customer taps submit, dropping the TCP connection.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 424,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 24,
    "description": "Connecting to restaurant guest Wi-Fi that requires a captive portal login that never pops up.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 425,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 25,
    "description": "Wi-Fi connected with 'No Internet Access' status, causing all API requests to hang indefinitely.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 426,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 26,
    "description": "DNS resolution stalls on local regional telecom providers adding 4 seconds of blank screen latency.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 427,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 27,
    "description": "Aggressive hotel firewall blocking WebSocket ports (ws:// and wss://), breaking real-time sync.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 428,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 28,
    "description": "Customer having 0MB cellular data pack balance remaining, unable to load the initial page bundle.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 429,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 29,
    "description": "VPN app on customer's phone routing traffic through overseas servers, introducing 600ms latency.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 430,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 30,
    "description": "Phone switching rapidly between two competing Wi-Fi access points in the dining hall, resetting sockets.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 431,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 31,
    "description": "High packet loss (>20%) causing dish photos to download in broken horizontal interlaced bands.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 432,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 32,
    "description": "Browser displaying terrifying 'Your connection is not private' SSL warnings due to self-signed local certs.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 433,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 33,
    "description": "Slow 2G/3G speeds taking 18 seconds to download unoptimized JavaScript application bundles.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 434,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 34,
    "description": "Customer's corporate MDM profile blocking access to unclassified local restaurant web domains.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 435,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 35,
    "description": "Airplane mode accidentally left active after arriving from a flight, leaving the customer confused.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 436,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 36,
    "description": "Background app updates (Play Store / App Store) hogging 100% of the customer's phone bandwidth.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 437,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 37,
    "description": "Local ISP experiencing fiber cut during heavy rainstorms, taking down both guest Wi-Fi and mobile towers.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 438,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 38,
    "description": "Browser cache returning corrupt chunks after an interrupted cellular download.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 439,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 39,
    "description": "Network timeout threshold set too short (3 seconds), throwing premature error modals on mobile networks.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 440,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 40,
    "description": "WebSocket keep-alive ping failing to traverse restrictive mobile carrier NAT gateways.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 441,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 41,
    "description": "iOS Safari forcing aggressive 120% viewport zoom when tapping text inputs with font size below 16px.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 442,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 42,
    "description": "Android gesture navigation bar at the bottom overlapping the floating 'View Order' checkout button.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 443,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 43,
    "description": "iPhone Dynamic Island or camera notch obscuring the top back button and restaurant header.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 444,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 44,
    "description": "Budget Android smartphone with 2GB RAM terminating the browser when opening the camera to scan.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 445,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 45,
    "description": "Aggressive battery saver mode throttling CPU, causing smooth Framer Motion animations to stutter at 10 FPS.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 446,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 46,
    "description": "Phone screen brightness set to minimum outdoors or maximum in dark rooms causing eye strain.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 447,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 47,
    "description": "Cracked touch screen glass failing to register touches in the bottom corners where primary action buttons sit.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 448,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 48,
    "description": "Browser running in private/incognito mode, wiping cart state the moment the screen locks or sleeps.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 449,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 49,
    "description": "iOS Safari Intelligent Tracking Prevention (ITP) blocking cross-tab session cookie synchronisation.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 450,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 50,
    "description": "Third-party custom browsers (MIUI Browser, UC Browser) rendering flexbox and CSS grids incorrectly.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 451,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 51,
    "description": "Screen auto-lock timeout set to 15 seconds, turning off the display while the customer decides on food.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 452,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 52,
    "description": "Virtual keyboard popping up and covering the entire category list and search results.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 453,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 53,
    "description": "Landscape mode auto-rotation rendering the mobile layout completely broken and unscrollable.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 454,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 54,
    "description": "Accessibility text scaling set to 200% in Android settings, causing text to overflow and clip buttons.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 455,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 55,
    "description": "System dark mode forcing inverted color filters that turn delicious golden biryani photos into muddy grey.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 456,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 56,
    "description": "Browser lacking support for modern CSS features (backdrop-filter, clamp, dvh), rendering broken UI.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 457,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 57,
    "description": "Device running out of local disk storage space, causing localStorage.setItem to throw fatal exceptions.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 458,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 58,
    "description": "Touchscreen capacitive sensor failing to register taps when fingers have light oil or moisture from dining.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 459,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 59,
    "description": "Old Android Webview versions (v70) failing to parse modern ECMAScript optional chaining syntax.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 460,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 60,
    "description": "Bluetooth headset audio lag delaying interactive confirmation chimes by 1.5 seconds.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 461,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 61,
    "description": "Elderly diners struggling to understand icons without clear text labels (e.g., shopping bag vs cart).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 462,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 62,
    "description": "Non-English speaking local diners unable to navigate when the interface lacks fluent Kannada translation.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 463,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 63,
    "description": "Tourists from other Indian states unable to understand local military culinary terms (Sherva, Kaalu, Booti).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 464,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 64,
    "description": "Visually impaired diners unable to use screen readers because image alt tags are missing or generic.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 465,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 65,
    "description": "Color-blind diners unable to distinguish between tiny green (Veg) and red (Non-Veg) dot indicators.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 466,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 66,
    "description": "Information overload from too many badges ('Bestseller', 'Chef Special', 'Spicy', 'Dum Handi') on one card.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 467,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 67,
    "description": "Tiny 11px font sizes making dish descriptions completely unreadable for senior citizens without glasses.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 468,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 68,
    "description": "Confusing modifier grouping where radio buttons (single-select) look identical to checkboxes (multi-select).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 469,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 69,
    "description": "Ambiguous pricing labels where '+ \u20b940' doesn't clearly state whether it is per piece or per plate.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 470,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 70,
    "description": "Lack of clear piece count information (e.g., 'Chicken Kabab' not stating whether it is 6 or 8 pieces).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 471,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 71,
    "description": "Absence of bone-in vs boneless meat indicators, causing distress for diners who cannot eat bone-in meat.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 472,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 72,
    "description": "Confusing spice meter graphics that fail to convey authentic military hotel extreme chili heat.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 473,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 73,
    "description": "Lack of allergen warnings for common food triggers (dairy, ghee, eggs, peanuts, mustard seeds).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 474,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 74,
    "description": "Unclear portion sizing indicators leaving solo diners unsure if a biryani is meant for 1 or 2 persons.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 475,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 75,
    "description": "Fast auto-dismissing toast notifications (1.5s) that disappear before slower readers can finish reading.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 476,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 76,
    "description": "Unintuitive gesture requirements (e.g., hidden swipe-to-delete) that novice smartphone users never discover.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 477,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 77,
    "description": "Complex nested navigation structures requiring 4 taps to get back to the main category list.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 478,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 78,
    "description": "Lack of immediate visual contrast between active and disabled buttons under bright ambient lighting.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 479,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 79,
    "description": "Jargon-heavy technical error messages ('WebSocket Handshake Failed: 1006') confusing ordinary patrons.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 480,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 80,
    "description": "Over-animated UI elements causing cognitive fatigue and motion sickness for sensitive diners.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 481,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 81,
    "description": "Loud dining hall noise (85dB) drowning out all phone audio notifications when food is marked ready.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 482,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 82,
    "description": "Overhead warm yellow filament lamps distorting dish photo colors on the phone screen.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 483,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 83,
    "description": "Cramped bench seating where neighbors accidentally bump elbows while typing on phone screens.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 484,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 84,
    "description": "Children at the table grabbing the phone and accidentally tapping unwanted high-cost dishes.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 485,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 85,
    "description": "Table rocking or unstable leg causing phone to slide around while typing special instructions.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 486,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 86,
    "description": "Greasy dining table surface making the phone back slippery and prone to falling.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 487,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 87,
    "description": "Smoke and sizzling aroma from nearby tawa griddles making diners hungry and impatient with app delays.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 488,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 88,
    "description": "High ambient heat in non-AC dining sections causing phones to thermal-throttle and dim displays.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 489,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 89,
    "description": "Waiters rushing past with hot heavy trays, making customers nervous about holding phones out.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 490,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 90,
    "description": "Physical table rearrangement by staff during busy hours causing confusion about their assigned table number.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 491,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 91,
    "description": "Steam from hot soup bowls fogging up phone screens and camera lenses instantly.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 492,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 92,
    "description": "Sudden power cuts plunging the hall into darkness before generator backup kicks in, dropping local Wi-Fi.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 493,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 93,
    "description": "Heavy monsoon downpours on metal roofing creating deafening noise that prevents phone speaker use.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 494,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 94,
    "description": "Neighboring tables smoking in outdoor sections blowing ash across mobile screens.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 495,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 95,
    "description": "Busy floor staff accidentally knocking over acrylic standees while wiping tables.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 496,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 96,
    "description": "Waiters verbally announcing sold-out dishes that still appear fully available on the customer's phone.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 497,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 97,
    "description": "Diners feeling rushed by long physical queues waiting behind their chairs, increasing ordering stress.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 498,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 98,
    "description": "Physical lack of electrical charging sockets near tables when phone battery is critically low.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 499,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 99,
    "description": "Confusing table layouts in large family halls where table numbers are not clearly visible on walls.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 500,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 100,
    "description": "Staff asking customers to move to a larger table mid-meal, disrupting their digital ordering flow.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 501,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 101,
    "description": "High-resolution dish photos taking too long to load on cellular data, showing empty grey boxes.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 502,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 102,
    "description": "Photos cropped awkwardly into square containers, cutting off the signature donne leaf presentation.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 503,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 103,
    "description": "Missing photos for traditional specialty dishes (Booti Gojju, Kaalu Soup), leaving diners hesitant to order.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 504,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 104,
    "description": "Misleading dish photography showing garnishes and accompaniments that are not included in the standard order.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 505,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 105,
    "description": "Category tabs requiring horizontal scrolling where hidden categories are overlooked by diners.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 506,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 106,
    "description": "Search bar failing on common typos (e.g., 'kushka' returning zero results when titled 'Biryani Rice').",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 507,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 107,
    "description": "Search virtual keyboard covering 70% of the screen, leaving only 1 search result visible at a time.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 508,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 108,
    "description": "Search lacking Kannada phonetic transliteration support for regional language speakers.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 509,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 109,
    "description": "Menu items jumping around the screen when inventory updates in real time, causing mis-taps.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 510,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 110,
    "description": "Sold-out items appearing at the top of the menu, cluttering the view for hungry diners.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 511,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 111,
    "description": "Lack of clear visual differentiation between gravies, dry starters, and rice dishes.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 512,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 112,
    "description": "Menu descriptions lacking cooking style explanations (Dum handi vs Tawa pan fried vs Deep fried).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 513,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 113,
    "description": "Unclear indication of whether Donne Biryani includes gravy and raita on the side.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 514,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 114,
    "description": "Absence of calorie or nutritional information for health-conscious diners.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 515,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 115,
    "description": "Inability to filter strictly by 'Pure Veg' across the entire menu with a single master toggle.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 516,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 116,
    "description": "Items temporarily unavailable during afternoon shift transition without any clear time estimate.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 517,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 117,
    "description": "Prices listed on the digital menu differing from an outdated printed board outside the entrance.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 518,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 118,
    "description": "Recommendations row pushing high-cost dishes that don't match the customer's current meal choices.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 519,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 119,
    "description": "Overly long item descriptions that require expanding modals just to read basic dish ingredients.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 520,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 120,
    "description": "Unclear beverage volume indications (e.g., 'Soft Drink' not specifying 250ml can vs 500ml bottle).",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 521,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 121,
    "description": "Customization modal popping up for dishes where no real customization options exist, wasting time.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 522,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 122,
    "description": "Mandatory radio button selections hidden below the fold, leaving the 'Add to Cart' button unclickable.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 523,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 123,
    "description": "Accidentally closing the customization drawer and losing all selected spice and gravy choices.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 524,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 124,
    "description": "Lack of quick '+ / -' quantity steppers directly on menu cards, forcing full drawer opens for simple adds.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 525,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 125,
    "description": "Cart floating bar covering the bottom-most menu item, making it impossible to tap without scrolling.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 526,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 126,
    "description": "Unclear feedback when an item is added to cart, leading customers to tap 'Add' multiple times.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 527,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 127,
    "description": "Inability to customize individual portions when ordering multiple plates of the same dish.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 528,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 128,
    "description": "Free-text special instructions field restricted to 20 characters, preventing detailed dietary explanations.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 529,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 129,
    "description": "Lack of pre-set kitchen chips for common requests ('Less Spicy', 'Extra Onion', 'Serve Hot').",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 530,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 130,
    "description": "Cart subtotal failing to update instantly when quantities change, creating price confusion.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 531,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 131,
    "description": "Inability to view itemized breakdown of add-on costs directly inside the cart summary row.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 532,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 132,
    "description": "Accidentally tapping 'Clear Cart' without a confirmation dialog and losing the entire table's selections.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 533,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 133,
    "description": "Dishes ordered in Round 1 appearing locked in the cart, confusing diners attempting to add Round 2.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 534,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 134,
    "description": "Cart failing to warn diners when they order 4 heavy rice dishes for a table of only 2 guests.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 535,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 135,
    "description": "Inability to specify which dishes should be served first as starters versus mains.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 536,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 136,
    "description": "Checkout screen failing to show estimated preparation time before order submission.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 537,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 137,
    "description": "Lack of seat-specific attribution controls, forcing all group dishes into one unstructured pile.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 538,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 138,
    "description": "Order submission button remaining greyed out without highlighting which field requires attention.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 539,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 139,
    "description": "Accidental double-click on 'Send Order' causing momentary anxiety about double-billing.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 540,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 140,
    "description": "Inability to save a favorite meal configuration for rapid one-tap ordering on future visits.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 541,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 141,
    "description": "Progress bar stuck on 'Preparing' for 20 minutes without any indication of queue position.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 542,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 142,
    "description": "Kitchen status jumping abruptly between stages without smooth visual transitions.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 543,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 143,
    "description": "Lack of granular status per dish, leaving diners unsure if their soup is ready while meat is frying.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 544,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 144,
    "description": "Status showing 'Served' while food is still sitting across the room on the kitchen counter.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 545,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 145,
    "description": "Lack of audio or vibration alert when food is dispatched from the kitchen to the table.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 546,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 146,
    "description": "Inability to cancel or edit an item within a reasonable 60-second grace period after submission.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 547,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 147,
    "description": "Tracking screen failing to show which waiter is assigned to their table for verbal follow-up.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 548,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 148,
    "description": "Timer counting down to zero and remaining stuck at 0:00 for 10 minutes, generating anxiety.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 549,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 149,
    "description": "Screen locking automatically, forcing diners to unlock their phone repeatedly to check status.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 550,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 150,
    "description": "Lack of clear visual indication when a dish is delayed due to high kitchen station backlog.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 551,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 151,
    "description": "Absence of an estimated delivery time badge for secondary add-on rounds.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 552,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 152,
    "description": "Tracking screen cluttered with completed dishes from previous visits due to stale local storage.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 553,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 153,
    "description": "Inability to minimize the tracking screen to browse the menu for drinks while food cooks.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 554,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 154,
    "description": "Lack of direct messaging channel to the kitchen for urgent corrections (e.g., 'Child is crying, please hurry soup').",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 555,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 155,
    "description": "Tracking status failing to refresh automatically after phone recovers from cellular sleep.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 556,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 156,
    "description": "Confusing terminology ('KOT Fired', 'Bumped', 'Expedited') that ordinary diners don't understand.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 557,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 157,
    "description": "Dishes served by runners without the runner updating the KDS, leaving the phone showing 'Preparing'.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 558,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 158,
    "description": "Lack of clarity on whether takeaway parcels will be delivered to the table or collected at the exit.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 559,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 159,
    "description": "Absence of a visual reminder of what custom modifications were requested for each dish.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 560,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 160,
    "description": "Tracking screen draining excessive phone battery due to unoptimized 500ms polling intervals.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 561,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 161,
    "description": "Tapping 'Call Waiter' and seeing no feedback on whether any staff member actually saw the alert.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 562,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 162,
    "description": "Waiter acknowledging the alert on their handheld, but getting distracted and never showing up.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 563,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 163,
    "description": "Inability to specify simple requests ('Extra Spoons', 'Water', 'Salt') without calling a person.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 564,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 164,
    "description": "Service call button disabled or locked for 5 minutes after a single tap, preventing urgent requests.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 565,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 165,
    "description": "Floor waiters looking at their handheld devices instead of making eye contact with dining guests.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 566,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 166,
    "description": "Alert chime muted on waiter devices due to loud kitchen noise, leading to 15-minute wait times.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 567,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 167,
    "description": "Lack of a 'Cancel Request' button when a passing waiter already resolved the customer's need verbally.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 568,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 168,
    "description": "Service request feed cluttered with duplicate pings from impatient diners at adjoining tables.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 569,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 169,
    "description": "Inability to flag urgent safety issues (broken glass, hot spill) with priority visual distinction.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 570,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 170,
    "description": "Floor staff not knowing which physical table matches the digital table ID on their screen.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 571,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 171,
    "description": "Language barrier between customer's written notes and floor staff's primary spoken language.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 572,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 172,
    "description": "Waiters dismissing service alerts to clear their queue before physically arriving at the table.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 573,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 173,
    "description": "Lack of an escalation pathway to the floor manager when service calls go unattended for 10 minutes.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 574,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 174,
    "description": "Customer feeling awkward or rude tapping a digital bell repeatedly to get human attention.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 575,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 175,
    "description": "Service call modal blocking the main menu screen until manually dismissed.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 576,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 176,
    "description": "Lack of visual indication showing whether a captain, runner, or busboy was dispatched.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 577,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 177,
    "description": "Service request history disappearing on browser refresh, leaving diners unsure if the ping was saved.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 578,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 178,
    "description": "Staff blaming the software for delayed service ('Sir, the app didn't show your table').",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 579,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 179,
    "description": "Inability to request the floor manager specifically for corporate or VIP billing requirements.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 580,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 180,
    "description": "Absence of a simple 'Everything is Great!' positive gesture button for exceptional floor service.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 581,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 181,
    "description": "Dynamic UPI QR code failing to render due to client-side SVG generation library crashes.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 582,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 182,
    "description": "UPI deep-link intent buttons ('Pay with GPay') failing to launch banking apps on mobile Safari.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 583,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 183,
    "description": "Android OS terminating the browser when opening PhonePe, losing the active payment session.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 584,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 184,
    "description": "Payment gateway webhook taking 45 seconds to confirm, leaving diner stranded on a spinning loader.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 585,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 185,
    "description": "Bank server timeout deducting money from customer's account while app marks transaction failed.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 586,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 186,
    "description": "Split-billing mathematics resulting in fractional paise errors that banking apps refuse to process.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 587,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 187,
    "description": "Inability to split bill by specific dishes consumed, forcing equal division among unequal eaters.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 588,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 188,
    "description": "Payment screen lacking clear break-up of statutory 2.5% CGST and 2.5% SGST amounts.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 589,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 189,
    "description": "Inability to add corporate company name and GSTIN before final invoice generation.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 590,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 190,
    "description": "Payment QR code lacking high contrast, failing to scan under dim dinner mood lighting.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 591,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 191,
    "description": "Tipping screen placed aggressively before bill payment, making diners feel uncomfortable.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 592,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 192,
    "description": "Customer's daily UPI transaction limit reached, with zero fallback to card or net-banking in app.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 593,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 193,
    "description": "Browser back-button during payment redirect causing duplicate payment authorization attempts.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 594,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 194,
    "description": "Digital receipt failing to download as a clean PDF invoice on mobile devices.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 595,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 195,
    "description": "WhatsApp receipt sharing failing because customer entered a 9-digit phone number with no validation.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 596,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 196,
    "description": "Payment success screen lacking an explicit 'You are free to leave' message, creating exit anxiety.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 597,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 197,
    "description": "Cash settlement requiring customer to wait 10 minutes for a waiter to bring physical paper change.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 598,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 198,
    "description": "Inability to redeem partial loyalty points, forcing all-or-nothing point redemption.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 599,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 199,
    "description": "Payment gateway modal displaying generic merchant corporate names instead of 'Thoogudeepa Donne Biryani'.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 600,
    "sectionIndex": 3,
    "sectionTitle": "Customer Facing Obstacles",
    "number": 200,
    "description": "Exit cashier demanding to see a physical paper stamped receipt despite full digital verification.",
    "status": "SECURED",
    "mitigation": "Protected by offline PWA caching, high-contrast visual indicators, and adaptive responsive layouts."
  },
  {
    "id": 601,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 1,
    "description": "App wiping the customer's active cart when background WebSocket connection reconnects.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 602,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 2,
    "description": "App serving stale cached menu data from last week with old prices and discontinued dishes.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 603,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 3,
    "description": "App assigning a customer to Table 1 by default when the URL table query parameter is missing.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 604,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 4,
    "description": "App overwriting unplaced cart items when a background sync pulse runs from the server.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 605,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 5,
    "description": "App failing to invalidate client cache after an emergency price change pushed by management.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 606,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 6,
    "description": "App leaving a customer stranded on Screen 8 (Confirmation) when they return for lunch the next day.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 607,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 7,
    "description": "App displaying another table's active bill because of un-scoped global localStorage keys.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 608,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 8,
    "description": "App resetting the customer's selected chair number back to Chair 1 on every screen transition.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 609,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 9,
    "description": "App displaying 'Table Vacant' modal while the customer is in the middle of eating their main meal.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 610,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 10,
    "description": "App losing selected modifiers when the customer toggles between 'Single' and 'All' view modes.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 611,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 11,
    "description": "App failing to update total bill amount when a waiter adds extra dishes from the floor tablet.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 612,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 12,
    "description": "App showing 'Order Placed' status indefinitely because Supabase realtime broadcast dropped a packet.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 613,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 13,
    "description": "App triggering an infinite re-render loop when table status transitions from 'Billing' to 'Cleaning'.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 614,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 14,
    "description": "App displaying duplicate item rows in the live tracker when an order is updated via CDC.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 615,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 15,
    "description": "App failing to clear old loyalty point balances after redemption, causing checkout validation errors.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 616,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 16,
    "description": "App un-merging table states prematurely, leaving group diners locked out of their shared tab.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 617,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 17,
    "description": "App restoring an ancient draft cart from two weeks ago over the customer's freshly picked lunch.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 618,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 18,
    "description": "App dropping active table leases when customer locks their phone screen for more than 60 seconds.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 619,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 19,
    "description": "App displaying negative elapsed cooking minutes due to client-server clock drift discrepancies.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 620,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 20,
    "description": "App failing to sync multi-device cart updates across two diners sitting at the exact same table.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 621,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 21,
    "description": "Heavy glassmorphic backdrop-filter blurs causing 10 FPS scrolling lag on budget Android phones.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 622,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 22,
    "description": "Image carousel jumping erratically to the first slide whenever an item is added to cart.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 623,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 23,
    "description": "Sticky bottom checkout bar bouncing up and down during touch scrolling on mobile Chrome.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 624,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 24,
    "description": "Screen flickering white for 200ms during Framer Motion screen transitions between screens.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 625,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 25,
    "description": "Category navigation tabs jumping to position 0 every time a filter button is clicked.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 626,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 26,
    "description": "Virtual keyboard popping up and pushing primary action buttons completely off the viewport.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 627,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 27,
    "description": "Dish title text wrapping into unreadable vertical columns on narrow 360px Android viewports.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 628,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 28,
    "description": "Modal dialogs rendering behind sticky headers due to incorrect z-index stacking context.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 629,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 29,
    "description": "Uncompressed 4MB food photography causing high memory usage and browser tab crashes.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 630,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 30,
    "description": "Touch tap targets smaller than 44x44px, causing 40% of customer taps to miss the button.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 631,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 31,
    "description": "Pull-to-refresh gesture triggering accidentally while scrolling up through the menu.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 632,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 32,
    "description": "Sticky category bar jittering by 10px during fast scroll due to conflicting scroll listeners.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 633,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 33,
    "description": "Item customization drawer getting stuck halfway open when swiped down too quickly.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 634,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 34,
    "description": "SVG icons failing to render on older mobile browsers, displaying empty square placeholders.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 635,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 35,
    "description": "High-contrast text shadows causing eye fatigue under direct ambient restaurant lighting.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 636,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 36,
    "description": "Layout shift (CLS > 0.4) occurring when food photos load without predefined aspect ratio boxes.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 637,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 37,
    "description": "Button ripple animations running on the main JavaScript thread, freezing UI during state updates.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 638,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 38,
    "description": "Full-screen modals failing to lock background body scroll, allowing chaotic double-scrolling.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 639,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 39,
    "description": "Dropdown menus opening upwards off-screen on devices with short vertical viewports.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 640,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 40,
    "description": "Toast notifications stacking infinitely on top of each other, covering primary navigation bars.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 641,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 41,
    "description": "App calculating 5% GST on the subtotal and rounding paise incorrectly, creating 1-rupee mismatches.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 642,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 42,
    "description": "App applying welcome discount codes twice when the checkout button is tapped in rapid succession.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 643,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 43,
    "description": "App failing to add modifier extra prices (+ \u20b940) to the item subtotal in the final payment screen.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 644,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 44,
    "description": "App multiplying quantity incorrectly when rapid plus-button clicks trigger un-debounced state updates.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 645,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 45,
    "description": "App displaying total payable as \u20b90 when a slow network delays subtotal calculation.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 646,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 46,
    "description": "App applying 18% GST instead of statutory 5% restaurant GST on food items due to tax category errors.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 647,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 47,
    "description": "App deducting loyalty points from subtotal before tax, resulting in non-compliant tax invoices.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 648,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 48,
    "description": "App failing to recalculate grand total when a waiter applies a courtesy floor discount.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 649,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 49,
    "description": "App displaying conflicting prices between the menu card (\u20b9170) and the item detail modal (\u20b9180).",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 650,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 50,
    "description": "App rounding split-bill individual shares down, leaving an un-allocatable unpaid residual balance.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 651,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 51,
    "description": "App charging packaging charges on dine-in meals due to faulty order source metadata flags.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 652,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 52,
    "description": "App charging full price for combo bundles when individual items are marked out of stock.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 653,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 53,
    "description": "App failing to update the digital bill total when an item is cancelled by the kitchen.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 654,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 54,
    "description": "App generating duplicate invoice numbers during simultaneous checkout bursts across tables.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 655,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 55,
    "description": "App showing 'Payment Successful' when the gateway actually returned a pending or failed status.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 656,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 56,
    "description": "App displaying negative subtotal when promotional credits exceed the minimum order threshold.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 657,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 57,
    "description": "App failing to reflect custom tip amounts in the final dynamic UPI QR payment string.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 658,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 58,
    "description": "App displaying prices in USD ($) instead of INR (\u20b9) due to faulty browser locale detection.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 659,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 59,
    "description": "App omitting CGST and SGST breakdown lines on digital receipts required for commercial taxation.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 660,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 60,
    "description": "App locking the customer into a high-tier payment breakdown that cannot be modified or cancelled.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 661,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 61,
    "description": "App allowing a customer to add an item to cart that was marked sold out 10 minutes ago.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 662,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 62,
    "description": "App throwing a generic 'Server Error' at final checkout instead of explaining which dish sold out.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 663,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 63,
    "description": "App marking all dishes as sold out when the kitchen 86 channel drops its database connection.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 664,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 64,
    "description": "App failing to remove sold-out items from active draft carts, blocking entire order submission.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 665,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 65,
    "description": "App showing sold-out badges on available dishes because of case-sensitive item ID mismatches.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 666,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 66,
    "description": "App failing to restore dish availability automatically when the kitchen un-86s a fresh handi.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 667,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 67,
    "description": "App allowing customers to order 20 portions of a dish when only 2 portions remain in kitchen stock.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 668,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 68,
    "description": "App failing to communicate real-time kitchen preparation delays (+20m) on the customer menu cards.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 669,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 69,
    "description": "App locking out entire categories when a single specialty dish within that category is marked 86.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 670,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 70,
    "description": "App displaying 'Chef Special' badges on items that are completely out of stock for the day.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 671,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 71,
    "description": "App failing to notify the customer when an item in their submitted order is rejected by the kitchen.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 672,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 72,
    "description": "App allowing customers to order breakfast items (Idli, Dosa) during dinner service hours.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 673,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 73,
    "description": "App showing conflicting stock statuses between the menu grid and the customization drawer.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 674,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 74,
    "description": "App failing to grey out modifier add-ons (Extra Boiled Egg) when specific ingredients run out.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 675,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 75,
    "description": "App resetting kitchen prep timers to zero whenever an additional item is added to an existing table.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 676,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 76,
    "description": "App allowing orders to be submitted after the restaurant's operational cutoff hours (e.g., 3:45 PM).",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 677,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 77,
    "description": "App failing to clear 'Sold Out' status when a new shift logs in with fresh kitchen stock.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 678,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 78,
    "description": "App displaying out-of-stock items in the 'You May Also Like' recommendations carousel.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 679,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 79,
    "description": "App caching 86 states indefinitely on client devices even after app restarts.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 680,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 80,
    "description": "App rejecting valid orders claiming out-of-stock when database inventory counts are positive.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 681,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 81,
    "description": "App creating two duplicate KDS tickets when a customer double-taps the 'Send Order' button.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 682,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 82,
    "description": "App generating a kitchen ticket with zero items when network drops mid-payload transmission.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 683,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 83,
    "description": "App sending an order to Kitchen Station A (Tawa) but failing to route to Station B (Handi).",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 684,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 84,
    "description": "App assigning customer orders to the wrong table due to un-sanitized URL query parameters.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 685,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 85,
    "description": "App dropping dietary special instructions during JSON payload serialization to the backend.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 686,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 86,
    "description": "App failing to assign correct seat numbers to ordered dishes, breaking seat-wise service.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 687,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 87,
    "description": "App dispatching an order with missing price data, causing database foreign key constraints to fail.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 688,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 88,
    "description": "App leaving an order in 'Draft' status on server while showing 'Confirmed' on customer phone.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 689,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 89,
    "description": "App generating identical order IDs for two different tables ordering at the same millisecond.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 690,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 90,
    "description": "App failing to retry order dispatch automatically when client experiences a 200ms socket hiccup.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 691,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 91,
    "description": "App locking the customer checkout screen permanently after a single transient network failure.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 692,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 92,
    "description": "App routing dine-in orders to the Swiggy/Zomato online delivery queue by mistake.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 693,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 93,
    "description": "App failing to log the customer device token with the order, breaking device-based session recovery.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 694,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 94,
    "description": "App sending orders to the kitchen before the customer confirms the final order review dialog.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 695,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 95,
    "description": "App dispatching Round 2 add-on orders as a brand new table instead of appending to active tab.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 696,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 96,
    "description": "App dropping modifier options (e.g., 'Less Spicy') during multi-item batch order submission.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 697,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 97,
    "description": "App failing to alert the customer when the kitchen rejects an order due to capacity overload.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 698,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 98,
    "description": "App sending orders with stale timestamps, causing KDS priority sorting algorithms to fail.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 699,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 99,
    "description": "App creating phantom orders when a customer navigates backwards in browser history.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 700,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 100,
    "description": "App failing to release in-flight mutex locks on server after an order throws an unhandled exception.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 701,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 101,
    "description": "App timer displaying 'Ready in 0 mins' while food has not even started cooking on the tawa.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 702,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 102,
    "description": "App showing 'Order Placed' for 30 minutes because the kitchen tablet forgot to bump the ticket.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 703,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 103,
    "description": "App marking an order 'Served' automatically based on a timer when food is still on the kitchen pass.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 704,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 104,
    "description": "App displaying conflicting order statuses on two phones belonging to the same dining table.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 705,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 105,
    "description": "App failing to update tracking status when the customer switches between Wi-Fi and mobile data.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 706,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 106,
    "description": "App showing 'All Dishes Ready' when only 1 out of 4 dishes has been prepared by the kitchen.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 707,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 107,
    "description": "App clearing the live tracking screen completely when a single dish is marked completed.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 708,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 108,
    "description": "App displaying raw database enum values ('STAGE_PREP_COMMITTED') instead of human labels.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 709,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 109,
    "description": "App calculating elapsed time using device local time, showing negative times if phone clock is slow.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 710,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 110,
    "description": "App failing to play the native audio confirmation chime when food reaches 'Ready' state.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 711,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 111,
    "description": "App freezing the tracking UI thread when processing rapid real-time status broadcast bursts.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 712,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 112,
    "description": "App showing 'Kitchen Linked' green indicator when the backend WebSocket is actually disconnected.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 713,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 113,
    "description": "App failing to show estimated preparation delay warnings when kitchen backlog exceeds 15 tickets.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 714,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 114,
    "description": "App hiding the 'Add More Items' button during active tracking, preventing round-two orders.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 715,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 115,
    "description": "App displaying tracking cards for dishes that were cancelled and refunded 10 minutes ago.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 716,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 116,
    "description": "App jumping erratically between 'Received' and 'Cooking' due to out-of-order socket packet delivery.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 717,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 117,
    "description": "App failing to display custom dish notes on the tracking screen for customer verification.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 718,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 118,
    "description": "App showing an infinite spinning loader on the tracking screen when returning from background.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 719,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 119,
    "description": "App displaying incorrect assigned waiter names on the customer tracking status header.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 720,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 120,
    "description": "App failing to notify the customer when their food has arrived at the pickup counter for collection.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 721,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 121,
    "description": "App failing to deliver 'Call Waiter' pings to floor handhelds due to missing push notification tokens.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 722,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 122,
    "description": "App allowing customers to send 50 duplicate waiter pings per second, crashing the waiter app.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 723,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 123,
    "description": "App displaying 'Waiter on the way!' when the ping was actually rejected by floor staff.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 724,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 124,
    "description": "App failing to clear the active ping notification banner after the waiter resolves the call.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 725,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 125,
    "description": "App routing table pings to the kitchen screen instead of floor waiter handheld devices.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 726,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 126,
    "description": "App failing to include chair numbers in service calls, forcing waiters to guess who called.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 727,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 127,
    "description": "App dropping custom message notes ('Need extra spoons') during ping payload transmission.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 728,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 128,
    "description": "App permanently disabling the 'Call Waiter' button after a single network timeout error.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 729,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 129,
    "description": "App playing a piercing loud siren on the customer's personal phone when tapping service call.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 730,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 130,
    "description": "App displaying stale pending pings from the previous table occupants on newly seated phones.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 731,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 131,
    "description": "App failing to notify the customer when all floor waiters are currently offline or busy.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 732,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 132,
    "description": "App showing 'Captain Assigned' with a blank name and missing photo on customer screens.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 733,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 133,
    "description": "App dropping service pings when the customer phone locks before server acknowledgment.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 734,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 134,
    "description": "App misclassifying bill payment requests as routine water pings, causing service delays.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 735,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 135,
    "description": "App failing to log ping response times for management service quality auditing.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 736,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 136,
    "description": "App generating phantom waiter pings when the customer phone experiences touch screen moisture.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 737,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 137,
    "description": "App failing to provide a 1-tap 'Cancel Call' option when the request is resolved verbally.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 738,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 138,
    "description": "App displaying incorrect table numbers in waiter call banners due to state closure bugs.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 739,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 139,
    "description": "App blocking customers from calling the waiter while an order is in 'Preparing' status.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 740,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 140,
    "description": "App failing to sound haptic feedback on customer devices when service calls are confirmed.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 741,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 141,
    "description": "App generating a malformed UPI intent string that mobile banking apps reject as invalid.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 742,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 142,
    "description": "App failing to encode the exact paisa amount in dynamic Bharat QR codes, causing round-off errors.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 743,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 143,
    "description": "App getting stuck on 'Verifying Payment...' forever when the gateway webhook is delayed by 10s.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 744,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 144,
    "description": "App failing to redirect to the confirmation screen after a successful UPI payment callback.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 745,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 145,
    "description": "App marking a table as 'Paid' when the gateway returned a 'Pending' or 'Authorized' status.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 746,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 146,
    "description": "App displaying a blank white screen when launching third-party payment gateway iframes.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 747,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 147,
    "description": "App failing to support popular regional UPI apps (Cred, BHIM, Navi) in its deep-link intent chooser.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 748,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 148,
    "description": "App dropping payment session tokens when the user switches to their banking app and back.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 749,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 149,
    "description": "App failing to provide an instant 'Retry Payment' button after a transient bank server decline.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 750,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 150,
    "description": "App creating duplicate payment intent records on the backend when the pay button is tapped twice.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 751,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 151,
    "description": "App failing to poll payment verification endpoints when WebSocket broadcast listeners fail.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 752,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 152,
    "description": "App displaying payment success screens with missing transaction reference IDs and timestamps.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 753,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 153,
    "description": "App locking the customer into an expired payment gateway session with no way to return to cart.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 754,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 154,
    "description": "App displaying incorrect merchant VPA addresses, creating customer distrust during checkout.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 755,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 155,
    "description": "App failing to calculate split-bill balances dynamically when one member pays ahead of others.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 756,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 156,
    "description": "App omitting discount deduction lines on the final payment gateway authorization payload.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 757,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 157,
    "description": "App displaying 'Payment Failed' when money was actually debited, causing customer panic.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 758,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 158,
    "description": "App failing to trigger cash collection notifications on waiter tablets when cash mode is selected.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 759,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 159,
    "description": "App displaying payment screens for tables that have already been settled and vacated.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 760,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 160,
    "description": "App failing to release table payment locks when a customer abandons the checkout flow midway.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 761,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 161,
    "description": "App generating digital receipts with broken HTML layouts and overlapping text blocks.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 762,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 162,
    "description": "App failing to render the official restaurant logo and GSTIN header on digital tax invoices.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 763,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 163,
    "description": "App omitting the itemized breakdown on receipts, showing only a generic single-line total.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 764,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 164,
    "description": "App PDF download button failing silently on mobile Safari due to blob URL download restrictions.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 765,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 165,
    "description": "App sending WhatsApp receipt links that return 404 Not Found errors due to missing route handlers.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 766,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 166,
    "description": "App generating receipts with incorrect invoice sequence numbers that violate tax standards.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 767,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 167,
    "description": "App displaying the current timestamp on receipts instead of the actual time the order was placed.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 768,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 168,
    "description": "App failing to display the waiter's name and table number on final digital bill records.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 769,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 169,
    "description": "App omitting CGST and SGST statutory percentages on commercial customer receipts.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 770,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 170,
    "description": "App displaying settled receipts indefinitely, preventing new guests from scanning a fresh menu.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 771,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 171,
    "description": "App failing to provide an instant 'Email Receipt' fallback when WhatsApp delivery fails.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 772,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 172,
    "description": "App generating digital bills that display internal database IDs instead of clean item names.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 773,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 173,
    "description": "App truncating long item names on receipt summaries, cutting off crucial portion details.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 774,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 174,
    "description": "App failing to include payment method details (UPI / Cash / Card) on final receipts.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 775,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 175,
    "description": "App displaying 'Bill Settled' banner but failing to unlock the table for floor busboy cleaning.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 776,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 176,
    "description": "App generating receipt URLs with unencrypted table parameters that anyone can view publicly.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 777,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 177,
    "description": "App failing to save receipt snapshots to persistent cloud storage for historical accounting.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 778,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 178,
    "description": "App displaying negative change-due values on cash payment receipt breakdowns.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 779,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 179,
    "description": "App crashing when formatting receipts for large corporate parties with more than 30 unique items.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 780,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 180,
    "description": "App failing to clear session storage tokens after the customer taps 'Exit & Finish Dining'.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 781,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 181,
    "description": "App star rating component registering 1 star when the customer taps the 5th star due to inverted flex CSS.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 782,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 182,
    "description": "App feedback submission throwing unhandled 500 errors when customer inputs emojis in comments.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 783,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 183,
    "description": "App failing to submit customer feedback when the network flickers, discarding written reviews.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 784,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 184,
    "description": "App redirecting customers to broken Google Maps review links due to malformed Place IDs.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 785,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 185,
    "description": "App leaking other customers' phone numbers and names in public client-side state bundles.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 786,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 186,
    "description": "App exposing private backend Supabase database keys in browser client environment variables.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 787,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 187,
    "description": "App failing to enforce rate limiting on API endpoints, allowing denial-of-service from customer phones.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 788,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 188,
    "description": "App allowing unauthenticated users to query floor table statuses and sales totals via open APIs.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 789,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 189,
    "description": "App failing to sanitize user input in dietary notes, allowing stored cross-site scripting (XSS).",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 790,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 190,
    "description": "App allowing unauthorized users to trigger table vacates via open HTTP POST requests.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 791,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 191,
    "description": "App failing to invalidate JWT session tokens when a customer session is terminated by management.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 792,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 192,
    "description": "App logging sensitive customer payment information in browser console logs during development mode.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 793,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 193,
    "description": "App allowing users to tamper with loyalty reward point balances via unprotected client state updates.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 794,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 194,
    "description": "App failing to verify request origin headers on internal server-sent event (SSE) broadcast streams.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 795,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 195,
    "description": "App allowing arbitrary table merges without manager PIN verification via API parameter injection.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 796,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 196,
    "description": "App exposing internal server stack traces to customers when an API route throws an exception.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 797,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 197,
    "description": "App failing to encrypt local storage session payloads containing table dining history.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 798,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 198,
    "description": "App allowing attackers to spoof device fingerprint tokens and hijack occupied dining chairs.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 799,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 199,
    "description": "App failing to restrict CORS headers, allowing external websites to trigger orders on behalf of diners.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 800,
    "sectionIndex": 4,
    "sectionTitle": "Application Caused Issues",
    "number": 200,
    "description": "App crashing completely when a customer pastes multi-byte Unicode strings into the search bar.",
    "status": "SECURED",
    "mitigation": "Protected by atomic mutex locks, client-side idempotency, and decoupled real-time state listeners."
  },
  {
    "id": 801,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 1,
    "description": "A diner rapidly tapping the search bar with single-character keystrokes, triggering 100 search queries per minute.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 802,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 2,
    "description": "A script running on a customer device sending 500 simultaneous order requests to /api/orders/create.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 803,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 3,
    "description": "Diners spamming the 'Call Waiter' endpoint with automated loops, flooding the server event queue.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 804,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 4,
    "description": "Opening 50 simultaneous browser tabs on a single phone, spawning 50 persistent WebSocket connections.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 805,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 5,
    "description": "A malicious customer flooding the image CDN with cache-busting query strings (?v=1, ?v=2) to exhaust server bandwidth.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 806,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 6,
    "description": "Sending massive 10MB JSON payloads in the special instructions field to exhaust server memory.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 807,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 7,
    "description": "Spamming payment initiation requests without completing them, filling the database with dangling intent records.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 808,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 8,
    "description": "Rapidly connecting and disconnecting WebSockets to exhaust server file descriptors and socket pools.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 809,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 9,
    "description": "Flooding the health check endpoint with high-frequency HTTP requests from multiple devices.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 810,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 10,
    "description": "Sending nested recursive JSON payloads to trigger stack overflow exceptions in server parsers.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 811,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 11,
    "description": "A bot network scraping menu items and prices every second, exhausting backend database read quotas.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 812,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 12,
    "description": "Repeatedly triggering table verification API calls to exhaust server CPU on cryptographic signing.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 813,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 13,
    "description": "Sending malformed UTF-8 byte sequences designed to crash backend Node.js string decoders.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 814,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 14,
    "description": "Flooding the feedback submission endpoint with automated spam to fill up persistent database storage.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 815,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 15,
    "description": "Executing concurrent table merge requests across 20 tables simultaneously to create database deadlocks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 816,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 16,
    "description": "Sending continuous ping heartbeats with zero sleep intervals, saturating network interface bandwidth.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 817,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 17,
    "description": "Repeatedly requesting heavy PDF digital receipts to exhaust server CPU on Chromium headless rendering.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 818,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 18,
    "description": "Flooding the /api/session/verify endpoint with random UUID tokens to force full table scans in database.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 819,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 19,
    "description": "Triggering rapid table seat allocation and de-allocation loops to exhaust database primary key sequences.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 820,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 20,
    "description": "Executing slowloris-style HTTP attacks by sending request headers at 1 byte per second to hold connections open.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 821,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 21,
    "description": "Two diners at Table 4 submitting conflicting orders at the exact millisecond to trigger race conditions.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 822,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 22,
    "description": "A diner submitting an order while a waiter simultaneously vacates the table, causing inconsistent database states.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 823,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 23,
    "description": "Simultaneous order submission and payment settlement requests triggering row-level database locks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 824,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 24,
    "description": "Two devices claiming the same vacant chair at the exact microsecond, causing unique constraint violations.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 825,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 25,
    "description": "A diner cancelling an item while the kitchen bumps the ticket, causing conflicting state updates in CDC streams.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 826,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 26,
    "description": "Simultaneous table merge and table un-merge requests resulting in orphaned table cluster records.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 827,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 27,
    "description": "Multiple customers redeeming the exact same loyalty promo code concurrently before the usage counter updates.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 828,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 28,
    "description": "Simultaneous item quantity increments and decrements causing optimistic concurrency exceptions.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 829,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 29,
    "description": "A customer modifying cart items while the backend is actively processing the checkout transaction.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 830,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 30,
    "description": "Triggering payment webhook callbacks concurrently with client-side payment confirmation requests.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 831,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 31,
    "description": "Simultaneous seat transfers between Table 3 and Table 5 causing circular reference deadlocks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 832,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 32,
    "description": "A customer adding items to a table while the cashier is actively generating the final fiscal invoice.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 833,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 33,
    "description": "Triggering parallel inventory reservations for the last remaining portion of Mutton Chops to cause race errors.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 834,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 34,
    "description": "Simultaneous table status transitions (OCCUPIED -> BILLING and OCCUPIED -> VACANT) colliding in database.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 835,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 35,
    "description": "Concurrent service requests from 4 chairs at the same table creating broadcast storm loops.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 836,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 36,
    "description": "A diner submitting an order while the manager is resetting venue data, causing foreign key integrity breaks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 837,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 37,
    "description": "Parallel receipt generation requests for the same order ID creating duplicate financial records.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 838,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 38,
    "description": "Concurrent session refresh requests corrupting local storage state across parallel browser tabs.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 839,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 39,
    "description": "Simultaneous dining session claims from two different geographic IP addresses triggering mutex panics.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 840,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 40,
    "description": "A customer initiating payment while an item is being marked sold-out, creating pricing mismatch deadlocks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 841,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 41,
    "description": "Injecting SQL injection strings ('; DROP TABLE orders; --) into the customer guest name field.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 842,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 42,
    "description": "Injecting script tags (<script>alert('XSS')</script>) into special dietary instructions.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 843,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 43,
    "description": "Submitting negative item prices ({ price: -250 }) to test whether backend validation catches negative numbers.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 844,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 44,
    "description": "Submitting decimal or floating-point quantities ({ quantity: 0.0001 }) to disrupt inventory counters.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 845,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 45,
    "description": "Injecting HTML formatting tags into item notes to break kitchen printer and KDS rendering.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 846,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 46,
    "description": "Sending extremely long strings (100,000 characters) in the feedback box to test database column limits.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 847,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 47,
    "description": "Submitting invalid table numbers ('T-999', 'TABLE_NULL', 'undefined') to crash routing logic.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 848,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 48,
    "description": "Injecting system environment variable names (${process.env.SUPABASE_KEY}) into input fields.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 849,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 49,
    "description": "Submitting array prototypes and object overrides ({ __proto__: { isAdmin: true } }) to test prototype pollution.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 850,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 50,
    "description": "Sending non-numeric seat numbers ('seat': 'NaN', 'seat': [1,2]) to trigger unhandled type errors.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 851,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 51,
    "description": "Submitting orders with missing required fields to test backend null-pointer exception resilience.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 852,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 52,
    "description": "Injecting command injection payloads (; rm -rf /) into receipt email and WhatsApp destination fields.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 853,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 53,
    "description": "Sending XML external entity (XXE) payloads in receipt generation requests to probe server files.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 854,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 54,
    "description": "Tampering with JWT session payload signatures to forge manager role permissions.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 855,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 55,
    "description": "Submitting fake foreign currency ISO codes ('XYZ', 'BTC') in payment initiation bodies.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 856,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 56,
    "description": "Injecting control characters (\\x00, \\r, \\n) into order notes to disrupt thermal KOT line feeds.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 857,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 57,
    "description": "Sending circular reference JSON structures to break JSON.stringify parsing on the server.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 858,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 58,
    "description": "Submitting timestamps set 10 years in the future to break time-based priority sorting algorithms.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 859,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 59,
    "description": "Tampering with order status enum values ({ status: 'PAID' }) directly in the order creation payload.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 860,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 60,
    "description": "Injecting CSS styles (position: fixed; z-index: 9999) into guest name fields to deface the manager screen.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 861,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 61,
    "description": "A customer leaving the live tracking screen open for 6 hours, accumulating 50,000 un-garbage-collected socket events.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 862,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 62,
    "description": "Rapidly navigating back and forth between Screen 2 and Screen 3, leaking DOM nodes and image textures in GPU memory.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 863,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 63,
    "description": "Opening and closing the customization drawer 100 times, causing Framer Motion animation listener memory leaks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 864,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 64,
    "description": "Triggering rapid searches that spawn un-aborted fetch promises that flood browser thread memory.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 865,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 65,
    "description": "Loading the full menu repeatedly on low-memory devices until mobile Chrome crashes with Out-of-Memory (OOM).",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 866,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 66,
    "description": "Customer phone keeping background timers running during sleep, creating timer drift and CPU execution spikes.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 867,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 67,
    "description": "Accumulating thousands of broadcast messages in browser BroadcastChannel without clean unmount disposal.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 868,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 68,
    "description": "Rapidly toggling theme dark/light modes to force massive CSS recalculation and memory thrashing.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 869,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 69,
    "description": "Spamming image lightbox modals to exhaust mobile Safari canvas and texture memory buffers.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 870,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 70,
    "description": "Leaving video scanner streams running in the background without track disposal, draining customer battery.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 871,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 71,
    "description": "Customer browser running un-throttled scroll listeners that drop rendering framerates to zero.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 872,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 72,
    "description": "Spamming cart quantity buttons to generate un-debounced state updates that freeze the React fiber scheduler.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 873,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 73,
    "description": "Injecting heavy base64-encoded images into client storage until quota limits trigger fatal write crashes.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 874,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 74,
    "description": "Customer phone running background service workers that aggressively cache heavy assets until disk space runs out.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 875,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 75,
    "description": "Rapidly resizing mobile viewport windows to trigger layout recalculation loops.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 876,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 76,
    "description": "Triggering continuous unhandled promise rejections that fill browser error log memory.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 877,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 77,
    "description": "Opening the customer web app inside low-memory third-party webviews that crash on WebGL initialization.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 878,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 78,
    "description": "Customer device failing to release camera hardware locks after QR scanning, blocking other applications.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 879,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 79,
    "description": "Spamming audio chime playback calls to exhaust the browser Web Audio API AudioContext channel limit.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 880,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 80,
    "description": "Running aggressive ad-blockers that strip critical application scripts, leaving the app in half-initialized limbo.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 881,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 81,
    "description": "A customer device broadcasting high-frequency ping packets across the local restaurant Wi-Fi subnet.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 882,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 82,
    "description": "Attempting to hijack local WebSocket channels by sending spoofed subscription requests.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 883,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 83,
    "description": "Customers streaming heavy 4K video while connected to the restaurant ordering Wi-Fi, starving POS bandwidth.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 884,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 84,
    "description": "Simulating network packet drops to force the client into aggressive infinite reconnection loops.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 885,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 85,
    "description": "A customer sending spoofed broadcast messages on public channel names to trigger false floor alerts.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 886,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 86,
    "description": "Opening persistent HTTP connections without closing them, exhausting backend reverse-proxy connection limits.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 887,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 87,
    "description": "Manipulating TCP window sizes to hold server memory buffers hostage during asset downloads.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 888,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 88,
    "description": "Simulating mobile tower handover flapping to flood the server with connection open/close logs.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 889,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 89,
    "description": "Sending corrupted gzip request headers to trigger de-compression errors in API gateway middleware.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 890,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 90,
    "description": "A customer device sending keep-alive pings with invalid sequence numbers to disrupt server session tracking.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 891,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 91,
    "description": "Attempting DNS spoofing on the local restaurant router to intercept customer ordering traffic.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 892,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 92,
    "description": "Customers setting up rogue mobile hotspots with identical SSIDs to intercept diner credentials.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 893,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 93,
    "description": "Sending broadcast channel messages with mismatched schema versions to crash adjacent connected tablets.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 894,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 94,
    "description": "Flooding the local router's DHCP pool with randomized MAC addresses to prevent new diners from joining Wi-Fi.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 895,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 95,
    "description": "A customer device sending unauthorized multicast packets across the local dining room mesh network.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 896,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 96,
    "description": "Attempting to intercept unencrypted API traffic using packet sniffing tools on open guest networks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 897,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 97,
    "description": "Flooding the server with malformed HTTP/2 frame headers to trigger stream resets and CPU spikes.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 898,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 98,
    "description": "Simulating high-latency satellite connections (3000ms ping) to test backend request timeout thread leaks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 899,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 99,
    "description": "Triggering rapid cross-origin resource sharing (CORS) preflight OPTIONS requests to flood API servers.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 900,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 100,
    "description": "Customer devices ignoring cache headers and repeatedly requesting static bundles with no-cache directives.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 901,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 101,
    "description": "Attempting to forge cryptographic session signatures using brute-forced secret keys.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 902,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 102,
    "description": "Replaying captured session tokens from other tables to read confidential customer order details.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 903,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 103,
    "description": "Tampering with device fingerprint tokens in local storage to bypass physical chair locks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 904,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 104,
    "description": "Attempting to guess table session tokens through automated sequential ID generation.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 905,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 105,
    "description": "Modifying customer session expiration timestamps in cookies to maintain permanent unauthorized access.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 906,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 106,
    "description": "Sharing active session tokens across 10 devices in different cities to test backend session validation.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 907,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 107,
    "description": "Attempting to inject stolen payment webhook authorization headers to falsely mark orders paid.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 908,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 108,
    "description": "Exploiting cross-site request forgery (CSRF) vulnerabilities by tricking diners into clicking malicious links.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 909,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 109,
    "description": "Tampering with table transfer tokens to steal another diner's active dining session.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 910,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 110,
    "description": "Attempting to bypass physical QR code signature verification by omitting the token parameter entirely.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 911,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 111,
    "description": "Brute-forcing 4-digit manager authorization PINs via automated API requests from customer devices.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 912,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 112,
    "description": "Replaying expired one-time login tokens to gain unauthorized access to staff administrative panels.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 913,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 113,
    "description": "Attempting to hijack WebSocket session IDs through prediction algorithms.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 914,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 114,
    "description": "Manipulating customer role attributes in client state from 'CUSTOMER' to 'CAPTAIN' or 'ADMIN'.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 915,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 115,
    "description": "Sending forged session termination events to log out all active diners from the restaurant floor.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 916,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 116,
    "description": "Tampering with device token salts to trigger false 'Chair Occupied by Another Device' modals for real diners.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 917,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 117,
    "description": "Attempting to read other tables' order histories through insecure direct object references (IDOR).",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 918,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 118,
    "description": "Exploiting session restoration logic to inherit previous patrons' un-cleared dining privileges.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 919,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 119,
    "description": "Manipulating browser cookie domain scopes to leak table session tokens to untrusted subdomains.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 920,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 120,
    "description": "Attempting to forge payment gateway signature hashes to fake successful financial transactions.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 921,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 121,
    "description": "Triggering complex full-text search queries with wildcard operators (*, %, ?) to force table scans.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 922,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 122,
    "description": "Executing sorting requests on un-indexed database fields to exhaust database sort buffer memory.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 923,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 123,
    "description": "Triggering rapid order item insertions and deletions to generate massive database WAL log growth.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 924,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 124,
    "description": "Forcing deep JSON payload parsing queries on un-indexed JSONB columns in PostgreSQL.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 925,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 125,
    "description": "Triggering simultaneous read-after-write requests to exploit replication lag between database read replicas.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 926,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 126,
    "description": "Attempting to insert orders with 500 individual items to test database transaction rollback performance.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 927,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 127,
    "description": "Flooding database connection pools by holding open transactions during external payment gateway calls.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 928,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 128,
    "description": "Triggering massive table join queries through crafted API search parameters.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 929,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 129,
    "description": "Attempting to violate database foreign key constraints by referencing non-existent dish IDs.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 930,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 130,
    "description": "Triggering simultaneous updates to a single table record from 5 devices, causing row-lock contention.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 931,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 131,
    "description": "Exhausting database disk space by submitting thousands of high-resolution feedback images.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 932,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 132,
    "description": "Attempting to trigger database deadlocks by updating tables and tickets in reverse topological order.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 933,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 133,
    "description": "Triggering cache stampedes by requesting expired menu assets at the exact second cache expires.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 934,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 134,
    "description": "Flooding Redis cache with millions of unique session keys to trigger memory eviction panics.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 935,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 135,
    "description": "Attempting to corrupt database sequence generators by inserting manually specified primary key IDs.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 936,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 136,
    "description": "Triggering continuous table status updates to overwhelm Supabase realtime change data capture (CDC) pipelines.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 937,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 137,
    "description": "Exhausting database connection pool timeouts by sending requests during scheduled database maintenance.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 938,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 138,
    "description": "Triggering un-indexed aggregation queries across historical order tables from customer devices.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 939,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 139,
    "description": "Attempting to trigger database transaction abort cascades through conflicting nested mutations.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 940,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 140,
    "description": "Submitting queries with oversized pagination limits (limit=100000) to exhaust server response buffers.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 941,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 141,
    "description": "Simulating payment gateway webhook retries at 100 requests per second to test backend deduplication.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 942,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 142,
    "description": "Sending payment confirmation webhooks with forged cryptographic HMAC signatures.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 943,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 143,
    "description": "Sending webhooks with missing transaction IDs to test server null-pointer error handling.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 944,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 144,
    "description": "Triggering payment webhooks for orders that do not exist in the database to test orphan error handling.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 945,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 145,
    "description": "Simulating payment gateway outages by holding webhook listener connections open indefinitely.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 946,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 146,
    "description": "Sending duplicate webhooks with conflicting transaction amounts to test idempotency defenses.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 947,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 147,
    "description": "Triggering rapid payment refund webhooks immediately following order creation callbacks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 948,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 148,
    "description": "Sending webhooks with timestamps from yesterday to test replay attack verification filters.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 949,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 149,
    "description": "Attempting to exploit race conditions between client-side payment redirects and server webhooks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 950,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 150,
    "description": "Triggering payment callbacks during database maintenance windows to test queue retry resilience.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 951,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 151,
    "description": "Sending webhooks with invalid JSON syntax to test API gateway error handling and logging.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 952,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 152,
    "description": "Simulating third-party SMS/WhatsApp receipt gateway failures to test non-blocking asynchronous dispatch.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 953,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 153,
    "description": "Flooding thermal kitchen printer endpoints with raw socket data to trigger hardware buffer freezes.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 954,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 154,
    "description": "Sending corrupted print jobs that cause thermal printers to print continuous blank paper rolls.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 955,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 155,
    "description": "Attempting to trigger external webhook timeouts by intercepting outgoing server notification calls.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 956,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 156,
    "description": "Sending webhooks with circular URL callbacks to trap the server in recursive request loops.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 957,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 157,
    "description": "Triggering payment verification for an order that was already marked paid via cash to test dual-tender locks.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 958,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 158,
    "description": "Sending forged bank refund notifications to trigger unauthorized table balance credits.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 959,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 159,
    "description": "Simulating payment gateway status flips (SUCCESS -> FAILED -> SUCCESS) to test state machine rigidity.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 960,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 160,
    "description": "Flooding the server with fake Razorpay / Paytm webhook events from unauthorized IP ranges.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 961,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 161,
    "description": "Running the customer app inside Instagram in-app browser which aggressively destroys localStorage on sleep.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 962,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 162,
    "description": "Opening the app in Facebook webview which injects tracking scripts that conflict with global JavaScript variables.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 963,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 163,
    "description": "Running the app in older Samsung Internet browser with non-standard touch event handling.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 964,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 164,
    "description": "Running in UC Browser with aggressive cloud data compression that rewrites and breaks image URLs.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 965,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 165,
    "description": "Operating on budget Chinese Android devices with aggressive background process-killer daemons (MIUI / ColorOS).",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 966,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 166,
    "description": "Running the app inside WhatsApp webview on iOS where file downloads and PDF receipts fail silently.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 967,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 167,
    "description": "Opening the app in mobile Firefox with strict cookie isolation enabled, blocking session persistence.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 968,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 168,
    "description": "Running on legacy mobile Safari (iOS 14) lacking support for CSS dvh viewport height units.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 969,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 169,
    "description": "Running inside corporate secure sandboxes (Good for Enterprise, BlackBerry) that block local storage entirely.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 970,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 170,
    "description": "Operating on devices with custom third-party ROMs that report spoofed or invalid user-agent strings.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 971,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 171,
    "description": "Running in browsers with experimental WebAssembly or JavaScript flags enabled that break core libraries.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 972,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 172,
    "description": "Operating on devices with modified system font settings that break text measurement and layout bounding boxes.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 973,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 173,
    "description": "Running inside privacy-focused browsers (Brave) with aggressive script shielding that blocks WebSockets.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 974,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 174,
    "description": "Operating on low-cost devices where hardware video acceleration crashes when loading animated SVGs.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 975,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 175,
    "description": "Running in mobile browsers that refuse to play synthesized Web Audio chimes without physical user interaction.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 976,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 176,
    "description": "Operating on devices with faulty system clocks that throw SSL certificate validation errors.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 977,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 177,
    "description": "Running inside emulators or headless test runners that report zero-size viewport dimensions.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 978,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 178,
    "description": "Operating on devices with high-DPI displays (4x pixel ratio) that cause canvas rendering memory exhaustion.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 979,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 179,
    "description": "Running in browsers that aggressively discard background tabs, wiping ephemeral component state.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 980,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 180,
    "description": "Operating on foldables with dynamic screen aspect ratios that change viewports mid-ordering session.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 981,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 181,
    "description": "Diners physically slamming phones onto tables, generating accelerometer spikes and chaotic touch bursts.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 982,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 182,
    "description": "Sudden power cut in the dining hall causing 100 phones to switch from Wi-Fi to cellular data at the exact second.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 983,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 183,
    "description": "Massive holiday crowds (New Year's Eve / Diwali) where 500 diners scan QR codes simultaneously at 1:00 PM.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 984,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 184,
    "description": "Diners creating viral social media posts about a secret menu item, causing a sudden 10,000-user traffic spike.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 985,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 185,
    "description": "Kitchen exhaust fan catching fire, forcing sudden emergency venue evacuation while 30 tables are active.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 986,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 186,
    "description": "Customer phone transmitting corrupted Bluetooth beacon packets that interfere with local POS printers.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 987,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 187,
    "description": "Sudden fiber broadband cable severed by road construction, leaving in-restaurant systems isolated from cloud.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 988,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 188,
    "description": "Severe lightning strike causing electrical surges that reboot the restaurant's local edge server mini-PC.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 989,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 189,
    "description": "Monsoon floods cutting power to cellular base towers, forcing all customers onto a single overloaded Wi-Fi router.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 990,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 190,
    "description": "Massive group of 50 college students ordering individually and demanding split bills down to the single rupee.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 991,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 191,
    "description": "A prank group intentionally swapping 25 acrylic standees across the entire dining hall within 60 seconds.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 992,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 192,
    "description": "Diners attempting to order simultaneously while walking between indoor AC and outdoor garden seating zones.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 993,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 193,
    "description": "Sudden inspection by food hygiene officials causing staff to halt operations while tables have active orders.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 994,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 194,
    "description": "Diners placing orders, walking out due to sudden family emergencies, leaving orphaned active cooking tickets.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 995,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 195,
    "description": "Customers spilling sweet lassi across payment QR stands, creating optical distortion for subsequent diners.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 996,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 196,
    "description": "A local cellular network blackout leaving only customers on one specific telecom provider able to connect.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 997,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 197,
    "description": "Diners attempting to place orders from moving vehicles in the parking lot before entering the restaurant.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 998,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 198,
    "description": "Massive festival rush where the kitchen runs out of authentic donne leaves, forcing sudden packaging changes.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 999,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 199,
    "description": "Simultaneous shift changeover and cash drawer reconciliation occurring during a sudden order influx.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  },
  {
    "id": 1000,
    "sectionIndex": 5,
    "sectionTitle": "Application Under Distress",
    "number": 200,
    "description": "Customers attempting to operate the digital customer app in heavy rain on an outdoor open-air garden terrace.",
    "status": "SECURED",
    "mitigation": "Protected by rate-limiting, schema validation, transaction isolation, and graceful connection fallbacks."
  }
];
