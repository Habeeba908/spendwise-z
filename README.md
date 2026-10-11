# SpendWise Z — Broke But Functional: Survive the Month

A modern, interactive personal-finance experience for Gen Z. Manage a limited **₹10,000 budget over 30 days** and simulate every money decision *before* you make it.

**Live demo:** https://spendwise-z.vercel.app

## Problem statement coverage
| Requirement | Where it lives |
|---|---|
| Income & balance | Plan tab (editable income), Overview cards |
| Spending | Ledger tab, category breakdown |
| Commitments (bills) | Plan tab, mark paid / delete / add |
| Subscriptions | Plan tab, toggle on/off, add, delete |
| Savings goals | Plan tab, progress, daily target, +₹200 |
| Unexpected expenses | 💥 Surprise button, "Unexpected hit" decision |
| Financial risk & health | Overview cards, 0-100 scores with explanation |
| Decision simulation | Simulator tab: before → after for balance, free cash, daily allowance, day-30 forecast, risk, health, goals |
| Daily allowance & monthly forecast | Overview cards and forecast chart with run-out day |

## Tech stack
Next.js 14 (App Router), React 18, TypeScript, Vitest, hand-written responsive CSS (no runtime UI dependencies).

## Project structure
```
app/            layout.tsx, page.tsx (UI and state), globals.css (responsive styles)
components/     ForecastChart, HealthRing, ImpactRow
lib/finance.ts  pure domain logic (calculateFinancialSummary, applyDecision)
lib/finance.test.ts  unit tests
```

## How the numbers connect
- `balance = income − spending − paid bills − savings`
- `free = balance − unpaid commitments − active subscriptions`
- `daily allowance = free ÷ days left`
- `forecast = free − average daily spend × days left`
- `risk = logistic(forecast)`; `health` combines risk, fixed-cost ratio and goal progress

## Getting started
```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests
npm run build    # production build
```

## Quality notes
- Pure, tested domain logic separated from the UI.
- Responsive layout (mobile, tablet, desktop), reduced-motion support, visible focus states.
- Accessible: labelled inputs, ARIA tab roles, status announcements, chart `aria-label`.
- Data persists locally in the browser (`localStorage`); no backend or personal data.

## Limitations
Single-user, client-only prototype with simulated data.

## Feature highlights
- **Safe-to-spend hero** – today's daily allowance, days left and projected finish.
- **Decision simulator** with one-tap presets (takeaway week, sneakers, trip, freelance income, cancel gym) showing remaining balance, daily allowance, savings goals, monthly forecast, financial risk and financial health before you commit.
- **30-day spending timeline** – every day against your allowance; overspend days turn red.
- **Auto insights** – run-out day, fixed-cost ratio, biggest category, cancellable subscriptions.
- **Unexpected expenses** – random shocks that ripple through every metric.
- **Installable PWA manifest**, error / loading / not-found boundaries, keyboard and screen-reader support.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT.

## Rubric alignment
- **Code quality:** TypeScript `strict: true`, ESLint (`next/core-web-vitals`, `npm run lint`), small typed modules, Prettier/EditorConfig.
- **Security:** pinned/patched dependencies, input sanitization (`sanitizeText`, `sanitizeAmount`), validated `localStorage` reads, security headers + CSP in `next.config.js`, React output escaping, no secrets or backend.
- **Efficiency:** no runtime UI libraries, ~90 kB first-load JS, system fonts (no layout shift), reserved card heights, SVG charts.
- **Accessibility:** semantic landmarks, skip link, ARIA tabs with arrow-key navigation, labelled controls, live-region toasts, visible focus, reduced-motion support.
