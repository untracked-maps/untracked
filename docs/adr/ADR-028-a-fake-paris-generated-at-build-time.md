# ADR-028 — A fake Paris generated at build time

**Date**: 2026-11-16
**Status**: accepted

## Context

The `search-places` ability needs places to search: names, kinds, addresses, coordinates and how well known each one is. The previous app searched an index of OpenStreetMap places, with their fame taken from Wikidata (QRank), built every night by a Python script. Producing or transforming map data is out of scope here ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)), and the real source of places is not chosen yet.

`locate-me` already settled its shape on fake data first ([ADR-024](ADR-024-locate-me-with-fake-positions-before-the-geolocation-api.md)): a seeded Faker adapter, run at build time only. Search needs far more data than one position, and the next abilities (a place sheet, categories, routes) will need the same places.

## Decision

- **A library, `src/libraries/fake-paris`**, returns plain data, `fakeParis()`, and knows nothing of features: each place has a stable `id`, a `name`, a `kind`, a one-line `address`, `coordinates` and a `fame` from 0 to 99. A kind is one of 26 English identifiers, such as `museum` or `beauty-salon`, never a translated label: the interface translates it.
- **Landmarks are written by hand**, in `landmarks.json`: 28 well-known places of Paris (Tour Eiffel, Louvre, Musée d'Orsay, Grand Palais, Palais de l'Élysée, Sacré-Cœur, Notre-Dame, the six main stations…) with their real coordinates and a fame from 70 to 99, and 8 low-fame namesakes that a search must rank after them (the "Élysée Beauté" salon, the "Parking Tour Eiffel", "Orsay Fleurs"…). A JSON file rather than a TypeScript literal: mutation testing would otherwise ask a test for every string.
- **2,000 places are generated** by Faker with its French locale and a fixed seed, 1789, so they are the same at every build: over 20 kinds weighted as a city is (restaurants, cafés and bakeries first, hospitals last), named after a fake person as a shop is ("Boulangerie Garcia", "Chez Camille"), spread uniformly over Paris (longitude 2.22 to 2.47, latitude 48.81 to 48.91, 5 decimals), at a Faker street with a number and a Paris postcode, 75001 to 75020. One in twenty has a fame from 1 to 30, the others none. Faker's names repeat: 315 names are borne by several places, which the ranking by distance needs.
- **Delivery: a prerendered endpoint.** `src/routes/data/places.json/+server.ts` writes `fakeParis()` into `build/data/places.json` at build time, as the glyphs are ([ADR-020](ADR-020-map-glyphs-generated-at-build.md)). On 2026-11-16 the file weighs 368 kB, 54 kB compressed with gzip, for 2,036 places.
- **Fetched on demand.** The browser asks for the file only when the search field first gets the focus, through the `prerendered` adapter of the ability's `LoadPlaces` port, which keeps only well-formed places. The home page does not wait for it, so its Lighthouse budget does not count it ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)).
- **Faker stays at build time.** dependency-cruiser allows `@faker-js/faker` in `src/libraries/fake-paris` and nowhere else outside in-memory adapters (`BUILD_TIME_DEPENDENCIES`), and the built `_app` is checked to contain no Faker code.

## Replacing it with real places

A real adapter of `LoadPlaces` will read places from a data project ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)), mapping its own types to the same kinds. The route will pass it instead of the prerendered one; if no ability uses `fake-paris` any more, the library and its endpoint will go. The use case, the index, the ranking and the interface do not change.

## Consequences

- Every place but the landmarks is invented, and many stand outside the walls of Paris while their postcode says otherwise: the search is a demonstration until a real source lands.
- A change of Faker's French data changes the generated places; the library's tests pin the first one and the ability's scenarios pin two namesakes, so the change shows.
- A visitor with JavaScript turned off sees the search field, disabled.

## Alternatives considered

- **Faker in an in-memory adapter of the ability**, as `locate-me` does: the places would belong to search, while the next abilities need the same ones.
- **Faker in the browser**: tens of kilobytes on the map pages, already near their script budget, for data that never changes.
- **The places in the page's data, through `+page.server.ts`**: every visit would download them, searching or not.
- **A file committed in `static/`**: what can be generated is never committed ([ADR-016](ADR-016-architecture-documentation-generated-and-published.md)).
