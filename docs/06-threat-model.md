# Threat Model (STRIDE-lite) — SkyCast

Assets: the user's coarse location, favourites (localStorage), integrity of displayed data.

| Threat | Vector | Mitigation |
|---|---|---|
| XSS | Malicious place names from the geocoding API | React escaping only, no `dangerouslySetInnerHTML`; CSP `script-src 'self'` |
| Data injection | Malformed or unexpected API JSON | Runtime validation in `api/openMeteo.ts`; fall back to error state |
| localStorage tampering | Edited stored JSON | Parse in try/catch + shape validation, fall back to defaults |
| Privacy | Location sent to a third party | Only lat/lon rounded to 2 dp sent to Open-Meteo; disclosed in footer; no analytics |
| Supply chain | Malicious npm dependency | Lockfile, `npm audit` in CI, CodeQL, Dependabot |
| Clickjacking | Embedding in a frame | Low impact (no side-effecting actions); `frame-ancestors` cannot be set via meta on Pages — accepted risk |
