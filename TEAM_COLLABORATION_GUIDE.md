# 👥 Team Collaboration & GitFlow Guide
## Thoogudeepa Donne Biryani Mane — Enterprise Pure-UPI Seat-QR Suite

---

## 🎖️ 1. Team Developer Pairings & Module Ownership

| Portal / Module | Assigned Team Pair | Dedicated Git Branch | Exact Responsibilities | Dedicated Files & Folders |
|---|---|---|---|---|
| **1. Customer App** | **Vishal & Bharath** | `feature/customer-app` | **Vishal**: Ordering screens 1–10, portions, add-ons, cart, zero-typing UPI.<br/>**Bharath**: Restaurant design tokens, food imagery, UI styling, responsive layout. | `components/customer/`<br/>`app/page.tsx`<br/>`store/useCustomerStore.ts` |
| **2. Waiter Mobile** | **Shivakumar & Nayana** | `feature/waiter-mobile` | **Nayana**: Smartphone floor steward screens, call-bell notification banners.<br/>**Shivakumar**: 34-table mobile grid, one-tap accept/resolve pings, food runner pickup alerts. | `components/waiter-mobile/`<br/>`app/waiter/mobile/page.tsx`<br/>`store/useWaiterMobileStore.ts` |
| **3. Waiter Tablet** | **Shivakumar & Vennela** | `feature/waiter-tablet` | **Shivakumar**: 10" Captain widescreen cockpit, 60/40 floor matrix, seat tabs.<br/>**Vennela**: 1-tap table bill merge, offline cash/card settle, table vacate/sanitize turnaround. | `components/waiter-tablet/`<br/>`app/waiter/tablet/page.tsx`<br/>`store/useWaiterTabletStore.ts` |
| **4. Kitchen KDS** | **Suhas & Vennela** | `feature/kitchen-kds` | **Vennela**: 70/30 table matrix + bulk aggregator (Commit `520b7bd`), 86 inventory toggle.<br/>**Suhas**: KDS real-time WebSockets synchronization, audio soundbox triggers. | `components/kitchen/`<br/>`app/kitchen/page.tsx`<br/>`store/useKitchenStore.ts` |
| **5. Manager POS** | **Prajwal** | `feature/manager-pos` | **Prajwal**: 16 screens Cashier & Manager hub, counter takeaway ordering, staff attendance, Day-Close Z-Report. | `components/manager/`<br/>`app/manager/page.tsx`<br/>`store/useManagerStore.ts` |
| **6. QA & Testing** | **Manjunath** | `feature/qa-devops` | **Manjunath**: Build tests (`npm run type-check`), CI/CD automation, Surge/Vercel deployment, multi-device stress test. | `.github/workflows/`<br/>`tests/`<br/>Deployment configs |
| **7. Core Lead** | **Suhas** | **`develop` & `main`** *(Branch Lead & Architect)* | **Suhas**: Supabase PostgreSQL DB, 34 tables & 133 seats, real-time WebSockets CDC, server logic, PR review & GitHub merge handling. | `supabase/`<br/>`lib/supabase.ts`<br/>`lib/db.ts`<br/>`store/useSharedBridge.ts` |

---

## 🌿 2. GitFlow Branch Structure

```
main (Production Ready — Deployed Live)
  ▲
  │ (Suhas merges verified PRs)
develop (Central Integration Branch — Managed by Suhas)
  ▲
  ├── feature/customer-app         (Vishal & Bharath)
  ├── feature/waiter-mobile        (Shivakumar & Nayana)
  ├── feature/waiter-tablet        (Shivakumar & Vennela)
  ├── feature/kitchen-kds          (Suhas & Vennela)
  ├── feature/manager-pos          (Prajwal)
  └── feature/qa-devops            (Manjunath)
```

---

## 💻 3. Daily Commands for Developers

### Step 1: Clone and Checkout Your Branch
```bash
git clone https://github.com/suhassuhas4120/thoogudeepa-enterprise-suite.git
cd thoogudeepa-enterprise-suite

# Checkout your assigned branch:
git checkout feature/customer-app        # Vishal & Bharath
# OR
git checkout feature/waiter-mobile       # Shivakumar & Nayana
# OR
git checkout feature/waiter-tablet       # Shivakumar & Vennela
# OR
git checkout feature/kitchen-kds         # Suhas & Vennela
# OR
git checkout feature/manager-pos         # Prajwal
# OR
git checkout feature/qa-devops           # Manjunath
```

### Step 2: Keep in Sync with Develop
```bash
git checkout develop
git pull origin develop
git checkout feature/<your-branch>
git merge develop
```

### Step 3: Push Your Changes
```bash
git add .
git commit -m "feat(module): description of work"
git push origin feature/<your-branch>
```
