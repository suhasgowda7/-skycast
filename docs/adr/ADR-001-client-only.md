# ADR-001: Client-only SPA calling Open-Meteo directly
**Status:** Accepted

**Context:** We need free weather data without key management or servers.

**Decision:** A static React SPA on GitHub Pages calls Open-Meteo directly.

**Consequences:** + Zero cost and ops, no secrets. − Bound by Open-Meteo free-use terms (non-commercial); commercial use would need a paid plan or proxy.
