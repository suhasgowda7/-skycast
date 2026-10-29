# Software Requirements Specification — SkyCast v1

## 1. Purpose
Give anyone a fast, free, installable weather forecast for their current location or any saved city.

## 2. Users
- **Commuter** — checks the weather for today and the next few hours on a phone, often on a weak connection.
- **Planner** — compares the next 7 days for a few cities.

## 3. Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Show current conditions: temperature, feels-like, condition icon + text, humidity, wind speed + direction, precipitation | Must |
| FR-2 | Show the hourly forecast for the next 24 h (temperature, condition, precipitation probability) | Must |
| FR-3 | Show the 7-day forecast (min/max, condition, precipitation probability, sunrise/sunset) | Must |
| FR-4 | Search cities by name (≥ 2 chars, debounced) and select a result | Must |
| FR-5 | "Use my location" via browser Geolocation; handle denied/unavailable gracefully | Must |
| FR-6 | Save / remove favourite cities (max 10), persisted in localStorage | Must |
| FR-7 | Toggle temperature °C/°F and wind km/h / mph; persisted | Must |
| FR-8 | Remember the last viewed location and open it on start | Should |
| FR-9 | Installable PWA; show the last cached forecast offline with an "offline / updated at" notice | Should |
| FR-10 | Show Open-Meteo attribution | Must |

## 4. Non-functional requirements
| ID | Requirement |
|---|---|
| NFR-1 | LCP ≤ 2.5 s on 4G mid-tier mobile |
| NFR-2 | WCAG 2.2 AA; full keyboard operation; screen-reader labels |
| NFR-3 | Responsive 320 px – 1440 px; light and dark (prefers-color-scheme) |
| NFR-4 | No secrets, no tracking, no third-party scripts; strict CSP |
| NFR-5 | API errors shown with Retry; no crash on malformed data |
| NFR-6 | Latest two versions of Chrome, Edge, Firefox, Safari (iOS + macOS) |

## 5. Out of scope (v1)
Alerts/push notifications, radar maps, accounts/sync, air quality, languages other than English.

## 6. Constraints and assumptions
Open-Meteo free tier (< 10 000 calls/day, non-commercial). Times are shown in the location's own timezone (`timezone=auto`).
