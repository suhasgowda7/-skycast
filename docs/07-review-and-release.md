# Review, Quality Gates & Release — SkyCast v1.0.0

## Quality gates
| Gate | Owner role | Evidence | Status |
|---|---|---|---|
| G1 Requirements | Requirements analyst / PO | [01-srs.md](01-srs.md), [02-backlog.md](02-backlog.md) | ✅ |
| G2 Design | UX/UI designer | [04-ux-design.md](04-ux-design.md) | ✅ |
| G3 Architecture | Software architect / tech lead | [03-architecture.md](03-architecture.md), ADR-001..003 | ✅ |
| G4 Security design | Security engineer | [06-threat-model.md](06-threat-model.md) | ✅ |
| G5 Code review | Tech lead (highest validator) | Review notes below | ✅ with follow-ups |
| G6 Test | QA | 48 unit/component tests (98.8 % lines), 10 E2E (desktop + mobile), axe light + dark | ✅ |
| G7 Release readiness | DevOps | CI, CodeQL, Dependabot, Pages deploy gated on CI | ✅ |
| G8 UAT | Product owner (you) | Try the deployed app against the backlog acceptance criteria | ⏳ pending |

## Tech-lead review (G5)
Checked: strict TypeScript, no `any` in source, runtime validation of every external input (API + localStorage), aborts in-flight requests, no `dangerouslySetInnerHTML`, CSP verified in E2E, bundle 75 kB gzip (budget 120 kB).

| # | Finding | Severity | Decision |
|---|---|---|---|
| R1 | "My location" shows no city name — Open-Meteo has no reverse geocoding | Low | Accepted for v1; candidate: nearest-city lookup via geocoding of a favourite, or a reverse-geocoding provider |
| R2 | Search list can briefly show previous results while the next debounced query is pending | Low | Accepted; cosmetic |
| R3 | Star on the card and × on the chip share the label "Remove X from favourites" | Info | Accepted; both perform the same action |
| R4 | Lighthouse performance/PWA audit not automated | Medium | Run manually before UAT sign-off (see checklist) |
| R5 | `frame-ancestors` cannot be set on GitHub Pages | Low | Accepted risk (see threat model) |

## Traceability
| FR | Tests |
|---|---|
| FR-1 | `App.test` FR-1/2/3/4, `openMeteo.test` FR-1, `domain.test` FR-1 |
| FR-2, FR-3 | `openMeteo.test` FR-2/FR-3, `App.test` FR-1/2/3/4, E2E search flow |
| FR-4 | `SearchBox.test` (6), `openMeteo.test` FR-4, E2E keyboard search |
| FR-5 | `App.test` FR-5 (granted, denied, timeout, unsupported) |
| FR-6 | `App.test` FR-6 (add/select/remove, cap 10), E2E persist after reload |
| FR-7 | `domain.test` FR-7, `App.test` FR-7, E2E unit toggle |
| FR-8, FR-9 | `App.test` FR-8/FR-9 (restore + offline cache) |
| FR-10 | `App.test` welcome/attribution |
| NFR-2 | E2E axe (light + dark, empty + loaded), keyboard-only E2E |
| NFR-4 | E2E CSP test, `storage.test` tampering |
| NFR-5 | `App.test` NFR-5 (error/retry, offline), `openMeteo.test` malformed payloads |

## Release checklist
- [x] CI green (lint, typecheck, unit + coverage, E2E, `npm audit`)
- [x] Smoke-checked real Open-Meteo responses match the parser's expected shape
- [ ] GitHub Pages source set to **GitHub Actions** (Settings → Pages)
- [ ] Deployed URL loads, installs as an app, works offline after first load
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, PWA installable
- [ ] UAT sign-off (G8)

## Known limitations (v1)
No weather alerts, radar or air quality; English only; Open-Meteo free tier is for non-commercial use.
