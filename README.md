# SkyCast

A fast, installable weather forecast PWA built with React, TypeScript and Vite on the free [Open-Meteo](https://open-meteo.com/) API. No API key, no backend, no tracking.

## Features
- Current conditions, the next 24 hours and a 7-day forecast
- City search (keyboard-accessible combobox) and **My location** via browser geolocation
- Up to 10 favourite cities, saved in your browser
- °C/°F and km/h/mph toggles, remembered between visits
- Reopens the last place you viewed
- Installable; shows the last saved forecast when offline

## Getting started
Requires Node.js 20+ (CI uses 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run build` | Typecheck + production build to `dist/` (with CSP and service worker) |
| `npm run preview` | Serve the production build |
| `npm test` / `npm run coverage` | Unit + component tests (Vitest), coverage gate 80 % |
| `npm run e2e` | Playwright E2E + axe accessibility checks (desktop + mobile) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run icons` | Regenerate PWA icons from `public/favicon.svg` |

## Deployment
Every push to `main` runs CI; when it passes, `deploy.yml` publishes `dist/` to GitHub Pages.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Project structure
```
src/
  api/          Open-Meteo client with runtime validation
  domain/       types, unit conversion, weather codes, validators
  hooks/        localStorage, forecast loading/caching, geolocation
  components/   SearchBox, CurrentCard, HourlyStrip, DailyList, Favourites, UnitToggle
e2e/            Playwright tests
docs/           SRS, backlog, architecture + ADRs, UX, test plan, threat model, review & release
```

## Privacy
Your location is only sent to Open-Meteo, rounded to about 1 km, to fetch the forecast. Favourites and settings stay in your browser's localStorage.

## Data attribution
Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Free for non-commercial use.
