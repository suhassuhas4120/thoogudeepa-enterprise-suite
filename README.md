# 🥘 Thoogudeepa Donne Biryani Mane — Enterprise Pure-UPI Seat-QR Suite

A production-grade, zero-friction, post-paid Tabletop Seat-QR restaurant management platform engineered for authentic Karnataka military cuisine.

---

## 🌟 The 5 Zero Pillars
1. **ZERO OTP / Logins**: Diners scan seat QR (`?table=T-15&seat=2`), enter name/phone optionally. 0% SMS drop-off.
2. **ZERO Pre-Payment**: Dine first, eat, pay seamlessly at the end.
3. **ZERO Split Confusion**: 133 distinct seat trackers across 34 tables. Each seat is an independent financial tab.
4. **ZERO Data Loss (80% Exit Recovery)**: Hardware device fingerprint anchor automatically recovers active unpaid bills when browser is closed or phone is locked for 30 minutes.
5. **ZERO MDR Charges**: Indian UPI Deep Intent (`upi://pay`) with automated dual-key payment verification.

---

## 🌐 The 6 Portals

| Portal | URL / Route | Description |
|---|---|---|
| 📱 **Customer App** | `/?table=T-15&seat=1` | 10 screens: Seat QR, portions, cart, live tracking, zero-typing UPI pay. |
| 🍳 **Kitchen KDS** | `/kitchen/` | 3 screens: Station login PIN `1234`, 70/30 table matrix + bulk aggregator (Commit `520b7bd`), 86 inventory toggle. |
| 🏃 **Waiter Mobile** | `/waiter/mobile/` | Handheld steward smartphone app: 34 tables matrix, live call bells, ready-to-serve food alerts. |
| 📟 **Captain Tablet** | `/waiter/tablet/` | 10" widescreen cockpit: 60/40 split floor matrix, seat tabs, table vacate turnaround. |
| 💻 **Manager POS** | `/manager/` | 16 screens: Executive dashboard, counter takeaway orders, Day-Close Z-Report. |
| 🖨️ **QR Deck & Print** | `/qr-deck/` | 34 tables, 133 interactive seat test buttons, printable table cards. |

---

## 🛠️ Tech Stack (100% Free Tiers)
- **Frontend**: Next.js 15 (React 19, Tailwind CSS, Lucide icons, Framer Motion)
- **Database & WebSockets**: Supabase Free Tier (PostgreSQL + Realtime CDC)
- **Hosting**: Surge / Vercel Free Global Edge CDN

---

## 👥 Team & GitFlow
See `TEAM_COLLABORATION_GUIDE.md` for role pairings and dedicated feature branches.
