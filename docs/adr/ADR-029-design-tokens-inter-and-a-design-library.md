# ADR-029 — Design tokens, Inter served by the site and a design library

**Date**: 2026-11-16
**Status**: accepted

## Context

The rebuilt app had no design: the browser's default serif font, blue underlined links, native radio buttons and plain boxes over the map. Only the basemap's style had been ported from the previous app. The previous app's look lived in about 240 lines of global CSS (`base.css`) and in the custom properties of its home page: white cards with soft shadows floating over the map, pill-shaped controls, a blue accent, a muted grey, and a second set of the same properties for the dark theme, switched by `data-theme` and `prefers-color-scheme`. It used the system fonts in its interface, and Inter only for the map's labels.

The theme is chosen on the device and applied through CSS `color-scheme` before the first paint ([ADR-026](ADR-026-a-theme-chosen-on-the-device-applied-before-the-first-paint.md)). The Content Security Policy allows fonts and styles from the site only ([ADR-018](ADR-018-security-checks.md)). Pages without the map keep a strict performance budget ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)). Features never import each other, and every module they share is a library ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)).

## Decision

- **Design tokens as CSS custom properties**, declared once in `src/libraries/design/tokens.css`: surfaces (`--surface`, `--surface-sunken`, `--surface-translucent`, `--surface-inverse`, `--page`), text (`--text`, `--text-muted`, `--text-on-accent`, `--text-on-inverse`), `--line`, the accent (`--accent`, `--accent-strong`, `--accent-soft`), `--focus`, shadows, radii, spacing, the gutter and the edge of the screen, control sizes, and a type scale in `rem`, so that it follows the visitor's text size. Their values are the previous app's, except where a pair of text and background fell below WCAG 2.2 AA: the light muted grey goes from `rgb(108 112 119)` to `rgb(103 107 114)`, which reaches 4.8:1 on the sunken surface and 4.7:1 on the page instead of 4.5:1 and 4.3:1; and the inverse surface, dark in both themes in the previous app, turns light in the dark theme, where a dark banner would not stand out from a dark map.
- **One value per token, with `light-dark()`.** Each colour token holds its light and dark values, and follows whatever `color-scheme` the root has: the theme switcher keeps setting it from `data-theme`, and the tokens know nothing of how the theme is chosen. Shadows are composed from three colour tokens, since `light-dark()` takes colours only. Lightning CSS, which Vite uses to minify, rewrites `light-dark()` for older browsers when needed.
- **Inter for the interface, served by the site** from the `inter-ui` package already used for the map's glyphs ([ADR-020](ADR-020-map-glyphs-generated-at-build.md)): the Latin subsets of its Regular (400) and SemiBold (600) weights, as WOFF2, declared with `@font-face` and `font-display: swap` in `src/libraries/design/global.css`. Vite resolves the files from the package and gives them a hashed name; nothing is committed. The subsets cover every character of the English and French messages, including the narrow no-break space and typographic apostrophe, and weigh 28 kB each. The interface uses only these two weights.
- **A design library**, `src/libraries/design`, holds the global stylesheet (fonts, base typography, a focus ring, reduced motion) and the generic components the screens use: an application frame over the map, a floating card, a button, a button-styled link, a round icon button, a segmented control built on a native radio group, segmented links for a navigation, a content page, and icons as inline SVG components. Its rules:
  - Generic only: it knows nothing about features, abilities, routes or translations, and takes every text as a property. dependency-cruiser already forbids a library to import a feature.
  - Only what a screen uses: knip fails on an unused component.
  - Svelte 5 components with runes and scoped styles, accessible to WCAG 2.2 AA: targets of at least 24 px, a visible focus, a name for every control; each tested in Chromium.
  - A component, or a feature's component, that reads a token imports `tokens.css`, which declares it, so that Biome can check that every custom property used is declared. Vite includes the file once.
- **MapLibre's controls match**: the map's component styles MapLibre's attribution with the tokens, through its classes, and draws the compact attribution button's icon with a mask in the text colour, so it no longer stays light, with a dark icon, in the dark theme.

## Consequences

- A screen restyled tomorrow picks tokens and components from one place; a colour changes in one line, in both themes.
- The first visit downloads 56 kB of fonts, cached afterwards; text shows in the fallback font until they arrive.
- The library grows with the screens: a bottom sheet and its grip, from the previous app, wait for the first screen that needs them.
- Lightning CSS's rewrite of `light-dark()` adds custom properties of its own, `--lightningcss-light` and `--lightningcss-dark`, in the built CSS.

## Alternatives considered

- **A component library**, such as Bits UI, Melt UI or shadcn-svelte: well tested headless behaviour, but a dependency for a handful of controls that native elements already make accessible, a second styling convention next to scoped styles, and, for shadcn-svelte, Tailwind.
- **Tailwind CSS**: utility classes in every template instead of scoped styles, a build step of its own, and tokens declared in its configuration rather than in CSS.
- **Open Props**: ready-made custom properties, but its scales are not the previous app's, which is the look to keep, and most of its hundreds of properties would go unused.
- **Keeping the system fonts**, as the previous app did: no download, but a different face on each system, unlike the map's labels in Inter.
- **The variable Inter font**: one file for every weight, but 100 kB for its Latin subset against 56 kB for the two weights used.
- **Two sets of custom properties switched by `data-theme`**, as the previous app did: twice the values to keep in step, and the tokens would depend on how the theme is chosen.
