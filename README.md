# Thoogudeepa Donne Biryani Mane

Restaurant table ordering and floor management application for Thoogudeepa Donne Biryani Mane.

## Overview
The application handles dine-in table ordering, kitchen ticket management, floor staff notifications, and cashier management across 34 dining tables and 133 seat positions.

## Modules
- `/` - Customer table ordering
- `/kitchen` - Kitchen display system
- `/waiter/mobile` - Floor waiter mobile view
- `/waiter/tablet` - Captain floor tablet console
- `/manager` - Manager and cashier portal
- `/qr-deck` - Table QR codes and printable table cards

## Development
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
npm run type-check
```

## Database
Supabase PostgreSQL connection configured in `.env.local`. Schema and seed files are located in `supabase/schema.sql` and `supabase/seed.sql`.
