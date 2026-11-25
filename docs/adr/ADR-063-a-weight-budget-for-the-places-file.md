# ADR-063 — A weight budget for the places file

**Date**: 2026-11-24
**Status**: accepted

## Context

size-limit caps MapLibre at 300 kB and the rest of the app's scripts at 200 kB, compressed ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)). The places file, `build/data/places.json`, had no budget, though every visit of the map fetches it since the places are shown as dots ([ADR-046](ADR-046-places-shown-as-dots-coloured-by-family.md)), and every step of the rebuild adds to the fake places: 54 kB compressed with ADR-028, 62 kB with ADR-046, 99.6 kB at step 17 (#90).

The maintainer's application of the national digital mediation map, `anct-cartographie-nationale/cartographie`, has no budget for its places either: it never sends them all, but by squares of 0.6 by 1.2 degrees, with only their identifier, name and position, and the details of a place when it is opened. The product owner chose a budget of 120 kB on 2026-11-24, in the maintainer's absence.

## Decision

- **size-limit caps `build/data/places.json` at 120 kB, compressed with gzip**, as a third entry of `.size-limit.ts`, checked by `pnpm test:size` and in CI's Build job.
- **120 kB is a guard against drift, not a measure of what a visitor can bear**: about 20 kB above the file's weight on `main` on 2026-11-24, 99.53 kB as size-limit measures it.
- **When a step would go past it, the file is split rather than the budget raised**: the texts moved to a file fetched when a sheet opens, as [ADR-058](ADR-058-the-text-type-and-local-name-of-a-place-after-openstreetmap-tags.md) names, or the places fetched by area, as the maintainer's application does.

## Consequences

- A step that adds fake places or fields to them sees its weight in `pnpm test:size`, and fails the build past 120 kB.
- The other data files, such as `addresses.json`, still have no budget; they are fetched on demand, not at the start of every visit.
- size-limit compresses at its own level: its 99.53 kB is not the 106.5 kB of the `gzip` command measured in #90.

## Alternatives considered

- **No budget, as in the maintainer's application**: there the server sends the places by area, so no file grows with the whole set; here one static file does.
- **A budget at the file's present weight**: the next step that adds a place would fail, before the split is worth its cost.
- **Splitting the file now**: the right end, but a change of how the places are fetched, larger than a guard.
