# Test Plan — SkyCast

| Level | Tool | Scope |
|---|---|---|
| Unit | Vitest | units, weather codes, API mapping/validation, storage |
| Component | Vitest + Testing Library + jsdom | SearchBox keyboard flow, unit toggles, favourites, App states (fetch mocked) |
| E2E | Playwright (Chromium) | search → forecast → favourite → reload persists; unit toggle; API mocked via `page.route()` |
| A11y | @axe-core/playwright | empty state + loaded forecast: no serious/critical violations |
| Perf | Lighthouse (manual, pre-release) | NFR-1, PWA installable |

**Entry:** story code complete. **Exit:** all tests green in CI, coverage ≥ 80 % lines, no open Sev-1/2 defects.

Traceability: each FR has at least one test; test names are prefixed with the FR id.
