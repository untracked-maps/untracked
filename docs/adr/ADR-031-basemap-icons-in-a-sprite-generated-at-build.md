# ADR-031 — Basemap icons in a sprite generated at build time

**Date**: 2026-11-16
**Status**: accepted

## Context

The basemap marks metro, train and RER stations with a round blue "M", as the previous app did. The previous app drew its icons on a canvas in the browser and added them to the map one by one when MapLibre asked for a missing image. MapLibre's standard way to give a style its icons is a sprite: a PNG sheet and a JSON index, in a standard and a high density version, which the style points to with its `sprite` URL. MapLibre fetches both files and decodes the image with `createImageBitmap`, so a sprite served by the site needs nothing more than `connect-src 'self'` in the Content Security Policy ([ADR-018](ADR-018-security-checks.md)). What can be generated is never committed ([ADR-016](ADR-016-architecture-documentation-generated-and-published.md)).

## Decision

- The site serves the basemap sprite, `sprites/basemap.{json,png}` and `sprites/basemap@2x.{json,png}`, from a prerendered SvelteKit endpoint, `src/routes/sprites/[file]/+server.ts`, as it serves the glyphs ([ADR-020](ADR-020-map-glyphs-generated-at-build.md)): at build time SvelteKit writes the four files into `build/sprites`. Nothing generated is committed.
- The icons are SVG sources, written in `show-map/implementation/openfreemap/style/sprite-icons.ts`, next to the style that names them. Only their names, in `sprite.ts`, reach the browser.
- `src/libraries/map-sprite`, tested, turns them into sprite sheets with `@basemaps/sprites`, the sprite generator of Toitū Te Whenua Land Information New Zealand's basemaps (MIT), which packs the icons with Mapbox's `shelf-pack` and renders them with `sharp`.
- `sharp` ships its native binaries as optional packages, covered by the lockfile's integrity; its install script only checks for them, and is denied (`allowBuilds: sharp: false`). `@basemaps/sprites` is a development dependency that dependency-cruiser allows in `src/libraries/map-sprite` only.
- One icon serves both palettes: its blue disc stands out from every light fill (5.5:1 against light water, 7.5:1 against light land) and its white ring from every dark fill (at least 7:1), so the icon keeps a contrast of 3:1 at least against the map, as WCAG 2.2 criterion 1.4.11 asks. Station names take the colour of the palette: `#2B4793` in light, `#9DB2F2` in dark, as in the previous app.

## Consequences

- The Content Security Policy does not change: no `blob:` source is needed, and `img-src` keeps `'self' data:`.
- The client code gains only the sprite URL and the icon's name; the browser fetches four small files more, once.
- A new basemap icon is an SVG source added to `sprite-icons.ts` and named in `sprite.ts`.

## Alternatives considered

- **Icons drawn on a canvas in the browser**, as the previous app did: code in the map component for each icon, and images to add again after each style change.
- **SVG rasterised in the browser and added with `addImage`**: still code in the map component, and SVG images decoded through an `<img>` element.
- **`spritezero`** and **`@mapbox/spritezero`**: last released in 2022 and 2023, on Mapnik's native binaries.
- **`spreet`**: the reference sprite generator in Rust, not published on npm, with a Rust toolchain next to Node.
- **An SDF icon recoloured by the style**: a single colour per icon, while the station icon has two.
