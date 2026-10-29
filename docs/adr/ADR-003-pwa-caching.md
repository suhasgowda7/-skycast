# ADR-003: PWA caching strategy
**Status:** Accepted

**Decision:** vite-plugin-pwa (Workbox, generateSW). Precache the app shell. Runtime caching for Open-Meteo requests uses `NetworkFirst` (3 s timeout, max 30 entries, 24 h). The app also keeps the last forecast in localStorage for instant start.

**Consequences:** Works offline with stale data, clearly labelled with "updated at".
