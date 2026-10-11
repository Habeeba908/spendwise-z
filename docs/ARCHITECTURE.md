# Architecture

## Layers
1. **Domain (`lib/finance.ts`)** – pure, side-effect-free functions. `calculateFinancialSummary(state)` derives remaining balance, free cash, daily allowance, monthly forecast, financial risk and financial health from income, spending, commitments, subscriptions and savings goals. `applyDecision(state, decision)` returns a new state for what-if simulation (spend, save, extra income, unexpected expense, cancel subscription).
2. **Presentation (`components/`)** – small stateless components: `ForecastChart`, `HealthRing`, `ImpactRow`.
3. **Application (`app/page.tsx`)** – owns UI state, persists to `localStorage`, wires the tabs (Overview, Simulator, Plan, Ledger).
4. **Platform (`app/`)** – layout, metadata, viewport, manifest, icon, error / loading / not-found boundaries.

## Data flow
`state → calculateFinancialSummary → UI`. A simulation computes `applyDecision(state, decision)` and renders before → after for every metric. Committing replaces the state; discarding drops the simulated copy.

## Decisions
- Immutable updates keep the simulator side-effect free and testable.
- No runtime UI library: small bundle, fast first load.
- Data never leaves the browser.

## Testing
`npm test` runs Vitest unit tests for the domain layer.
