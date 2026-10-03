# Thoogudeepa Donne Biryani Mane — Enterprise Hospitality Suite

A high-performance dine-in floor operations suite engineered for **Thoogudeepa Donne Biryani Mane**. The system coordinates customer table QR ordering, floor waiter handhelds, captain tablet consoles, kitchen display terminals (KDS), and general management cash tills across 34 dining tables and 133 covers in real time.

---

## Architecture & Realtime Synchronization

- **Frontend & Routing:** Next.js 15 App Router, React 19, Tailwind CSS, Framer Motion
- **State Management:** Zustand with optimistic updates and rollback capabilities
- **Zero-Latency Local Interop:** BroadcastChannel (`thoogudeepa_bridge_sync`) for cross-device/cross-tab floor sync with `localStorage` persistence
- **Cloud Database & CDC:** Supabase PostgreSQL with realtime postgres_changes subscription channel (`bridge_global_sync`)
- **Visual Design Identity:** Mysore Heritage Palette (`#FAF8F5` Warm Oat Porcelain, `#9C3D1E` Mysore Terracotta, `#D28835` Saffron Gold)

---

## Portals & Endpoints

| Portal | Route | Primary Audience | Core Functionality |
|---|---|---|---|
| **Customer Portal** | `/` | Dine-in Guests | Menu catalog, add-ons, item customization, bill split, UPI/Card payment, waiter call |
| **Kitchen Display System** | `/kitchen` | Chefs & Pass Expeditors | Station routing (Dum Biryani, Kebab/Tandoor, Desserts, Dispatch), KOT bump, 86 item inventory toggles |
| **Waiter Handheld** | `/waiter/mobile` | Floor Waiters | Real-time table status grid, incoming guest assistance pings, dish ready alerts, seat occupancy |
| **Captain Tablet** | `/waiter/tablet` | Floor Captains | Table floor plan, KOT fire to kitchen, multi-table merge/split, cash/card payment recording |
| **Manager Portal** | `/manager` | General Manager & Cashier | Live revenue telemetry, shift management, petty expense ledger, hardware status, Z-Report cash till |
| **Table QR Deck** | `/qr-deck` | Administration | Printable high-resolution QR table cards with direct deep links for all 34 tables |

---

## Restaurant Floor Plan

The restaurant covers 34 physical tables across 5 distinct dining zones:
- **Express / Couple Hall:** Tables `T-01` to `T-04` (2-seater, 8 covers)
- **Main Dining Hall:** Tables `T-05` to `T-14` (3-seater, 30 covers)
- **Family Section:** Tables `T-15` to `T-24` (4-seater, 40 covers)
- **Courtyard Garden:** Tables `T-25` to `T-29` (5-seater, 25 covers)
- **Grand Feast Hall:** Tables `T-30` to `T-34` (6-seater, 30 covers)
- **Total Capacity:** 133 seats

---

## Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or pnpm

### Installation
```bash
git clone https://github.com/suhassuhas4120/thoogudeepa-enterprise-suite.git
cd thoogudeepa-enterprise-suite
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local` and provide your Supabase credentials:
```bash
cp .env.example .env.local
```
Configure:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### Local Development
```bash
npm run dev
```
The application runs on `http://localhost:3001`.

### Production Build & Type Verification
```bash
npm run type-check
npm run build
npm run start
```

---

## Database Setup

SQL schema and seed migrations are provided in the repository:
1. `supabase/schema.sql` — Tables, enumerations, foreign keys, triggers, and Row Level Security (RLS) policies.
2. `supabase/seed.sql` — Initial table layout, menu catalog, and system configurations.

Apply via the Supabase SQL Editor or migration CLI:
```bash
# Via Supabase CLI or SQL editor
cat supabase/schema.sql | psql $DATABASE_URL
cat supabase/seed.sql | psql $DATABASE_URL
```

---

## Automated Verification Suite

The project includes 10 comprehensive verification test suites validating UI, UX, components, state management, and edge-case contracts:

```bash
# Run any verification suite:
npx tsx scripts/test-phase1-comprehensive.js   # Customer portal
npx tsx scripts/test-phase2-comprehensive.js   # Waiter mobile
npx tsx scripts/test-phase3-comprehensive.ts   # Waiter tablet & hardware
npx tsx scripts/test-phase4-comprehensive.ts   # Kitchen Display System
npx tsx scripts/test-phase5-comprehensive.ts   # Manager portal
npx tsx scripts/test-phase6-comprehensive.ts   # Cross-portal bridge
npx tsx scripts/test-phase7-comprehensive.ts   # Supabase schema & CDC sync
npx tsx scripts/test-phase8-comprehensive.ts   # Visual, UI & UX components
npx tsx scripts/test-phase9-comprehensive.ts   # End-to-end user journeys
npx tsx scripts/test-phase10-comprehensive.ts  # Edge cases & defensive logic
```

Total verified test assertions across all 10 phases: **3,855 / 3,855 passing (100%)**.

---

## License
Proprietary — All rights reserved by Thoogudeepa Donne Biryani Mane.
