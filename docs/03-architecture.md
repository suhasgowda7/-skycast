# Architecture — SkyCast

## Context
Static SPA served by GitHub Pages. The browser calls Open-Meteo directly over HTTPS. No backend.

```
Browser ──HTTPS──> api.open-meteo.com/v1/forecast
        ──HTTPS──> geocoding-api.open-meteo.com/v1/search
        <── GitHub Pages (static assets + service worker)
```

## Modules (`src/`)
| Module | Responsibility |
|---|---|
| `api/openMeteo.ts` | Typed fetch for forecast + geocoding, AbortSignal, response validation, mapping to domain model |
| `domain/types.ts` | `Place`, `Forecast`, `CurrentWeather`, `HourlyPoint`, `DailyPoint`, `Units` |
| `domain/weatherCodes.ts` | WMO weather code → label + icon |
| `domain/units.ts` | °C↔°F, km/h↔mph, formatting |
| `domain/validators.ts` | Type guards for stored data (tamper-safe reads) |
| `hooks/useForecast.ts` | Load / cancel / retry state, caches last forecast in localStorage |
| `hooks/storage.ts` | Typed, validated localStorage persistence (`useLocalStorage`) |
| `hooks/useGeolocation.ts` | Browser geolocation with rounded coordinates and friendly errors |
| `components/*` | SearchBox, CurrentCard, HourlyStrip, DailyList, Favourites, UnitToggle |
| `App.tsx` | Composition and selected-place state |

## Data flow
Units are a *view* concern: the API is always called in metric and conversion happens at render, so toggling never refetches.

## Key decisions
- [ADR-001](adr/ADR-001-client-only.md) Client-only SPA on Open-Meteo (no backend, no key)
- [ADR-002](adr/ADR-002-no-state-lib.md) No state library: React state + small hooks
- [ADR-003](adr/ADR-003-pwa-caching.md) Workbox via vite-plugin-pwa: precache shell, NetworkFirst for API
