# ADR-021 — MapLibre and the OpenFreeMap basemap

**Date**: 2026-11-15
**Status**: accepted

## Context

The map needs a renderer and a basemap. This repository produces no map data ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)), so the tiles come from an existing service, which the browser calls directly and which therefore sees the visitor's IP address and the area they look at. The previous app drew OpenMapTiles vector tiles from OpenFreeMap with MapLibre GL JS and its own style.

## Decision

- **MapLibre GL JS** draws the map, in a Svelte attachment that creates the map on mount and removes it on unmount. Its worker is a separate file of the site, set with `setWorkerUrl`, so the Content Security Policy needs no `blob:`. Its own region label, `Map.Title`, is translated.
- **OpenFreeMap** serves the vector tiles, from `https://tiles.openfreemap.org/planet`: free, without key or account. It is the only host added to `connect-src`.
- **The style is ours**, ported from the previous app into `show-map/implementation/openfreemap/style`, one module per theme (land, water, roads, places…), and checked with `validateStyleMin` from `@maplibre/maplibre-gl-style-spec`, whose types the style uses. Its labels use the glyphs the site serves ([ADR-020](ADR-020-map-glyphs-generated-at-build.md)).
- **The basemap is a port** of the `show-map` ability, `LoadBasemap`, so the domain does not know about MapLibre or OpenFreeMap, and the route passes the OpenFreeMap adapter.
- **A "Who sees what" page**, at `/privacy`, lists every external service the browser calls, what it sees and why, starting with OpenFreeMap. A feature that adds a host to `connect-src` adds it to this page in the same change.
- The end-to-end tests refuse the requests to OpenFreeMap, so that they do not depend on its availability.

## Consequences

- If OpenFreeMap is down, the map stays empty; the `report-basemap-outage` ability will tell the visitor.
- MapLibre weighs about 280 kB compressed and takes about a second of CPU on a throttled phone; [ADR-022](ADR-022-lighthouse-budgets-per-page.md) sets the budgets of the map pages accordingly.
- Names are shown in French first, then in the local name, as in the previous app, whatever the language of the interface.

## Alternatives considered

- **Leaflet with raster tiles**: lighter, but raster tiles cannot be restyled, nor themed in dark mode.
- **A self-hosted PMTiles file**: no third party at all, but producing and hosting the data belongs to another project.
- **OpenFreeMap's own styles**: nothing to maintain, but their glyphs and sprites would come from OpenFreeMap too, and the look of the previous app would be lost.
