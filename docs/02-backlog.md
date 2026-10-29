# Product Backlog — SkyCast v1

| Story | Story | Acceptance criteria (abridged) | FR | Est |
|---|---|---|---|---|
| S0-1 | As a developer I want toolchain, CI and deploy so that every change is verified | CI runs lint + typecheck + test + build; main deploys to Pages | — | 3 |
| US-1 | As a user I want current weather for a place | Given a location, when loaded, then all FR-1 fields render with units | FR-1 | 3 |
| US-2 | As a user I want the next 24 hours | 24 hourly items from the current hour, horizontally scrollable, keyboard reachable | FR-2 | 2 |
| US-3 | As a user I want the next 7 days | 7 rows with min/max, icon, precipitation %, sunrise/sunset | FR-3 | 2 |
| US-4 | As a user I want to search a city | ≥ 2 chars → debounced (300 ms) results with country/region; Enter or click selects; "no results" state | FR-4 | 3 |
| US-5 | As a user I want to use my location | Click → permission prompt; on grant loads forecast; on deny shows a message and search stays usable | FR-5 | 2 |
| US-6 | As a user I want favourite cities | Star toggles; up to 10 shown; selecting loads; remove works; survives reload | FR-6 | 3 |
| US-7 | As a user I want unit toggles | °C/°F and km/h/mph switch instantly without refetch; persisted | FR-7 | 2 |
| US-8 | As a user I want to reopen where I left off | Last location restored on start | FR-8 | 1 |
| US-9 | As a user I want install + offline | Manifest + service worker; offline shows cached data with a banner | FR-9 | 3 |
| US-10 | As a user I want clear loading and errors | Loading state; error message with Retry | NFR-5 | 1 |

**Definition of Done:** tech-lead review passed, unit/component tests, a11y check, CI green, docs updated.

Sprint 1: S0-1, US-1..US-5, US-10 · Sprint 2: US-6..US-9, hardening, release.
