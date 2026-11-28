---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# What the first view does not need, loaded on demand behind ports

## Context and Problem Statement

The map is the content of the home page, and its rendering library alone fills most of what a visitor downloads before the first view. Every ability added beside it, a search index, an address formatter, an opening-hours reader, a layer of open data, a station or a picture, added code or data to that first load, while most visits use only a few of them. The app is a static site without a server ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)), so its data are files served by the site, generated at build ([0021](0021-assets-and-data-generated-at-build-never-committed.md)), and read through ports ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)).

How should code and data reach the browser, so that a visitor pays only for what they use, and the first view stays as light as the map allows?

## Decision Drivers

- The first view loads the map and what it shows at once, nothing more.
- An ability that is not used costs nothing, neither code nor data.
- The choice of what loads when stays inside adapters: the domain does not know how its data arrive.
- The way data are fetched can change, from one file to files per area or a real service, without changing a domain.
- The weight of each part can be capped apart.

## Considered Options

- Optional code and heavy libraries in chunks of their own, data per item or per area, both loaded by adapters when first needed
- Everything in the main bundle and one data file
- Code split, but data in one file per kind, fetched whole
- One file per item for every kind of data

## Decision Outcome

Chosen option: « Optional code and heavy libraries in chunks of their own, data per item or per area, both loaded by adapters when first needed », because it is the only option where the first view carries only the map, and where an unused ability adds nothing to a visit.

### Optional code and heavy libraries in chunks of their own

The code of an optional capability, such as a layer of the map, the search index, the vocabularies of the search or the drawing of a list on the map, and every heavy library, such as the address formatter or the opening-hours reader, is reached through a dynamic import made by an adapter. The bundler puts it in a chunk of its own, loaded the first time the visitor needs it. A port of the domain returns what the chunk gives; the use case never imports the library itself, only its types.

### A library every visit needs soon is preloaded after the first view

A library that the first open sheet needs, and that most visits open, is loaded in the background once the map has given its first view, rather than when the sheet opens, so that the sheet does not wait. It still lives in its own chunk, outside the code of the first view, and counts in the weight of start-up.

### Data per item, fetched when its item is opened

What belongs to one item, the passages and exits of a station or the description of a picture, is a file of its own, fetched when its item is opened. What a whole area shares, such as the outlines of its districts, is fetched once, when first needed, and again after a failure.

### Places served as tiles behind a port close to OGC API Features

Today the places are two files: what is read before any sheet opens, and the details of the places by their identifier, each fetched once per visit and shared by every ability that reads it. The target is a port close to OGC API Features, which asks for the places of an area, up to a limit, of a category, and answers in GeoJSON; its first adapter reads tiles generated at build, each with its own weight cap. A real service then replaces the adapter, not the domains. Target, tracked by #158.

### Consequences

- Good, because the code and data of the first view stay those of the map and what it shows.
- Good, because an ability that a visit does not use costs it nothing.
- Good, because the domains do not change when the way their data are fetched changes.
- Good, because each chunk and each data file can be capped apart, and moving code out of the first view shows in the measure.
- Bad, because the first use of a capability waits for its chunk or its data, and a failed load must be handled by every ability that loads.
- Bad, because a dynamic import costs a few bytes itself: code too small to be worth a chunk stays in the first load.
- Bad, because, until the tiles come, every visit that opens a sheet fetches the places of the whole zone, and the places file grows with the fake data.
- Neutral, because the bundler, not the code, decides which modules share a chunk.

### Confirmation

The weight caps tell the code loaded at start-up from the code loaded on demand by the build's own manifest, and fail when either grows.

## Pros and Cons of the Options

### Everything in the main bundle and one data file

The simplest: nothing waits after the first view. Every visitor pays for every ability before the map shows, and the first view's weight grows with each ability added, over the budget of the map pages.

### Code split, but data in one file per kind, fetched whole

One request per kind of data, and no tiling to write. Every visit that uses a kind pays for all its items, the file grows with the data until its cap is reached, and a real source, which answers by area, would not fit the port.

### One file per item for every kind of data

The finest grain, also for the details of the places: one request per sheet. Thousands of files for data that a list or the map reads together, and many requests where one would do.

## More Information

### Where to find the detail

- [The adapters that load code on demand, in the abilities](../../src/features/)
- [Data fetched once per visit](../../src/libraries/fetched-once/)
- [Start-up and on-demand code told apart](../../src/libraries/chunk-loading/)
- [The data files generated at build](../../src/routes/data/)
- [The weight caps](../../.size-limit.ts)

### References

- [OGC API Features](https://ogcapi.ogc.org/features/)
- [GeoJSON, RFC 7946](https://www.rfc-editor.org/rfc/rfc7946)
- [Dynamic import](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import)
- [#158: serve the places as tiles behind a port](https://github.com/untracked-maps/untracked/issues/158)

### History

- 2026-11-28, marc-gavanier: first writing.
