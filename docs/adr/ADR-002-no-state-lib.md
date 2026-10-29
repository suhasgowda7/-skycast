# ADR-002: No global state library
**Status:** Accepted

**Context:** Shared state is small: selected place, units, favourites, forecast request.

**Decision:** React state lifted to `App` plus custom hooks; localStorage for persistence.

**Consequences:** Smaller bundle, simpler tests. Revisit if shared state grows beyond ~5 slices.
