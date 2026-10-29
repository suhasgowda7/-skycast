# UX / UI Design — SkyCast

## Layout (mobile-first, single column; two columns ≥ 900 px)
1. Header: "SkyCast" logo, SearchBox (combobox), "My location" button, unit toggles
2. Favourites chips row (scrollable)
3. Current card: place name + star toggle, large temperature, condition, feels-like, humidity / wind / precipitation
4. Hourly strip (24 items, horizontal scroll)
5. 7-day list
6. Footer: "Weather data by Open-Meteo.com" + privacy note

## Tokens
Colours via CSS custom properties; light/dark through `prefers-color-scheme`. Contrast ≥ 4.5:1 for text, 3:1 for UI. System UI font stack. Spacing scale 4/8/12/16/24/32. Radius 12 px.

## Accessibility
- SearchBox follows the ARIA 1.2 combobox pattern (arrow keys, Enter, Escape).
- Unit toggles are `aria-pressed` buttons; the favourite star has a dynamic label ("Add {city} to favourites").
- A live region announces loading and errors. Icons are decorative (`aria-hidden`) with text alongside.
- Visible focus ring; respects `prefers-reduced-motion`.

## States
Empty (no place yet → prompt to search or use location), loading, error + Retry, offline banner.
