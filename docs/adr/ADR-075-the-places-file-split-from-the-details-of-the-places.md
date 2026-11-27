# ADR-075 — The places file split from the details of the places

**Date**: 2026-11-26
**Status**: proposed

## Context

Every visit of the map fetches `build/data/places.json`, whatever it does next: the dots, the search and the lists of a kind read it ([ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md), [ADR-046](ADR-046-places-shown-as-dots-coloured-by-family.md)). The sheet of a place read it too, for the fields that only a sheet shows: phone, website, menu, Instagram, Facebook and the OpenStreetMap tags, which hold the opening hours, the good-to-know facts and the freshness. [ADR-074](ADR-074-a-glance-at-a-place-and-the-freshness-of-its-information.md) left the file at 119.6 of the 120 kB that [ADR-063](ADR-063-a-weight-budget-for-the-places-file.md) gives it, and step 16, the photos of a place (#119), adds a field again. ADR-063 says that past the budget the file is split rather than the budget raised. The product owner chose the split on 2026-11-26 (#120), rather than a cap of 500 kB.

## Decision

- **`places.json` keeps what is read before any sheet opens**: id, name, kind, cuisine, address, coordinates, fame, family, minzoom and rank.
- **`place-details.json` holds the rest, by the id of the place**: phone, website, menu, Instagram, Facebook and tags. A place without any of them is not in it.
- **The sheet's adapter fetches both files when the first sheet of a visit opens**, and joins them by id: the details file gives only its own fields, never a name or a position. The places file is the one the other abilities already fetched, fetched once per visit ([ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)); the details file is fetched once, since the use case keeps what it loaded.
- **Each file has its budget in `.size-limit.ts`**, about 20 kB above its weight, as a guard against drift in the sense of ADR-063: **90 kB** for the places file, 71.4 kB on 2026-11-26, and **70 kB** for the details, 45.7 kB.
- **The steps that add what only a sheet shows**, such as photos, reviews or texts, add it to the details file.

## Consequences

- Each visit of the map fetches 71.4 kB of places instead of 119.6 kB, with gzip.
- The first sheet of a visit waits for the details file too; the next ones do not. The same failure of either file leaves the sheet closed, as a failure of the places file did.
- A field read before a sheet opens, such as the opening hours that the lists of a kind will need (#46, steps 22 and 23), moves from the details to the places file, in the pull request that needs it.

## Alternatives considered

- **A cap of 500 kB on the single file**: nothing to change now, but every visit of the map pays for every field of every sheet, and the guard no longer warns of anything for a long time.
- **The places fetched by area**, as the former app's place tiles and the maintainer's application do: the right end when the places are many more, a larger change than one more file.
- **The details of each place in a file of its own**: about 2,000 files, one request per sheet, for 45.7 kB in all.
