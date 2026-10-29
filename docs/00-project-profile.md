# Project Profile — SkyCast

| Field | Value |
|---|---|
| Product | SkyCast — weather forecast PWA |
| Type | Web app / PWA (client-only, no backend) |
| Delivery mode | Solo + AI product team, gates reviewed at the end |
| Size tier | **S** (≤ 6 epics, 1 developer, no backend, no server-side personal data) |
| Stack | React 19, TypeScript 6 (strict), Vite 8, Vitest, Testing Library, Playwright, vite-plugin-pwa |
| Hosting | GitHub Pages via GitHub Actions |
| Data sources | Open-Meteo Forecast API, Open-Meteo Geocoding API (no key, CC BY 4.0, non-commercial) |
| Owner | Suhas Gowda |

## Tailoring (tier S)
- Gates G1–G8 kept; G4 (architecture) and G6 (security) are lightweight documents.
- Compliance: attribution + privacy note only (location leaves the browser only as lat/lon sent to Open-Meteo).
- No SLA or ops runbook; GitHub Pages is the platform.

## Quality bars
- Unit/integration coverage ≥ 80 % lines on `src/` logic.
- PWA installable; Lighthouse Performance ≥ 90 (mobile), Accessibility ≥ 95.
- WCAG 2.2 AA; zero axe critical/serious violations.
- JS bundle ≤ 120 kB gzip.
