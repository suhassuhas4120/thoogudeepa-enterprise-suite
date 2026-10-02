# Team Workflow Guide

## Roles and Branch Assignments

| Module | Team Members | Branch | Scope | Folders |
|---|---|---|---|---|
| Customer App | Vishal, Bharath | `feature/customer-app` | Customer menu, cart, tracking, checkout | `components/customer/`, `app/page.tsx` |
| Waiter Mobile | Shivakumar, Nayana | `feature/waiter-mobile` | Handheld steward tables and pings | `components/waiter-mobile/`, `app/waiter/mobile/` |
| Waiter Tablet | Shivakumar, Vennela | `feature/waiter-tablet` | Captain station floor layout and table details | `components/waiter-tablet/`, `app/waiter/tablet/` |
| Kitchen KDS | Suhas, Vennela | `feature/kitchen-kds` | Kitchen preparation tickets and inventory stock | `components/kitchen/`, `app/kitchen/` |
| Manager POS | Prajwal | `feature/manager-pos` | Cashier desk, billing, day reports | `components/manager/`, `app/manager/` |
| Testing & QA | Manjunath | `feature/qa-devops` | Test verification and build validation | `tests/`, build configurations |
| Backend & State | Suhas | `develop`, `main` | Database queries, state bridge, branch merges | `supabase/`, `lib/`, `store/` |

## Branch Strategy

All developers branch off `develop`. Once changes are tested, open a pull request to `develop`.

```
main
  ^
develop
  ├── feature/customer-app
  ├── feature/waiter-mobile
  ├── feature/waiter-tablet
  ├── feature/kitchen-kds
  ├── feature/manager-pos
  └── feature/qa-devops
```

## Setup Instructions

1. Clone repository:
```bash
git clone https://github.com/suhassuhas4120/thoogudeepa-enterprise-suite.git
cd thoogudeepa-enterprise-suite
```

2. Switch to your assigned feature branch:
```bash
git checkout feature/<your-assigned-branch>
```

3. Keep your branch up to date:
```bash
git checkout develop
git pull origin develop
git checkout feature/<your-assigned-branch>
git merge develop
```
