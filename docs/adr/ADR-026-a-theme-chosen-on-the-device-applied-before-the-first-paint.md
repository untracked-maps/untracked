# ADR-026 — A theme chosen on the device, applied before the first paint

**Date**: 2026-11-15
**Status**: accepted

## Context

The previous app let the visitor pick an automatic, light or dark theme, kept in `localStorage`. Its interface had two sets of CSS custom properties switched by a `data-theme` attribute, and its map turned dark by translating every colour of the light style, value by value, through a table of about seventy entries. It set the attribute only once the app had started, so a visitor who chose the opposite of their device's preference saw the wrong theme first.

The basemap belongs to the `map/show-map` ability, the theme to `appearance/choose-theme`; features never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)). The site is prerendered, so the stored choice is unknown while the HTML is generated, and the Content Security Policy runs only the site's own scripts and the inline scripts whose hash it lists ([ADR-018](ADR-018-security-checks.md)).

## Decision

- **Three choices**, light, dark and system; system follows `prefers-color-scheme`, even when the device switches while the page is open. The ability `appearance/choose-theme` turns the chosen theme and the device's preference into the colour scheme to show, as a stream function of two ports; its browser adapters read `localStorage` (key `untracked-maps.theme`) and `matchMedia('(prefers-color-scheme: dark)')`. The choice stays on the device, like the dismissed language suggestion ([ADR-017](ADR-017-suggest-the-visitors-language-without-redirecting.md)).
- **The interface follows through CSS `color-scheme`.** The root declares `color-scheme: light dark`, and `data-theme="light"` or `"dark"` on the root narrows it; system colours such as `Canvas`, and any `light-dark()` value, follow without a second set of variables.
- **The switcher is a group of native radio buttons** with a legend, in the footer landmark, so that it works with the keyboard and screen readers without ARIA.
- **The map takes a palette.** The OpenFreeMap adapter of `show-map` takes a stream of palettes, `basemapPalettes.light` or `.dark`, every layer module is a function of the palette, and the light style stays identical. The root layout's `load` composes the theme in the browser, and the home page maps its colour scheme to the matching palette: the route is the only place where both features meet ([ADR-008](ADR-008-composition-in-routes.md)). The map keeps its camera when only the basemap changes.
- **The dark palette is the previous app's**, picked from its translation table for the 25 colours this style uses: its own text halo (`rgba(22,24,28,0.9)`) for both halos, a blue-grey for motorways, muted parks and water.
- **No flash.** An inline script in `src/app.html`, placed after `%sveltekit.head%` so that the policy's `<meta>` governs it, copies the stored choice to `data-theme` before the first paint. `vite.config.ts` reads that script from `src/app.html` and adds its SHA-256 hash to `script-src`, so the hash follows any change to the script. An end-to-end test reloads the page with the app's scripts refused and checks that the kept theme is shown.

## Consequences

- The prerendered pages check "System" in the switcher until the app starts; the page itself is already in the right colours.
- If storage is blocked, the inline script throws like the rest of the app does when it reads `localStorage`, and the site follows the device.
- MapLibre's attribution control keeps its own light background in the dark theme.
- A change to the inline script's text changes its hash at the next build, with nothing to update by hand.

## Alternatives considered

- **`mode-watcher`**, the Svelte library for light and dark modes: it brings its own rune-based state instead of the abilities' streams, and writes its anti-flash script with `{@html}`, which Biome forbids here.
- **No anti-flash script**, as in the previous app: a visitor who chose dark on a light device sees a white page first.
- **A blocking external script in `static/`**, allowed by `'self'` without a hash: one more request before the first paint, and a JavaScript file outside the checks of `src`.
- **`'unsafe-inline'` in `script-src`**: it would allow any inline script.
- **Translating the light style colour by colour**, as the previous app did: it depends on every colour value being unique and silently leaves a new colour light.
- **Passing the colour scheme rather than a palette to the map adapter**: it would tie `show-map` to the theme's vocabulary instead of its own colours.
