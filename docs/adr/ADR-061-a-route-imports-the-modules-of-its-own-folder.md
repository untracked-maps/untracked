# ADR-061 — A route imports the modules of its own folder

**Date**: 2026-11-24
**Status**: accepted

## Context

Routes are the only place where features meet ([ADR-008](ADR-008-composition-in-routes.md)). Each step of the rebuild that combines features adds lines to the home page, whose `+page.svelte` script and `+page.ts` are near Biome's limit of 200 lines per file. The rule `routes-compose-features` of dependency-cruiser forbade a route to import any other file of `src/routes`, so the home page could neither grow nor be split: steps 10 and 11 had to move code out of the page to fit ([ADR-053](ADR-053-framing-the-map-on-what-is-opened-measured.md), [ADR-055](ADR-055-sharing-a-place-or-a-spot-by-a-link.md)), and the sheets of an address, a street or a district (#67) and of a station (#96) could not be wired at all (#83).

The maintainer's own application of the national digital mediation map, `anct-cartographie-nationale/cartographie`, met the same need: its rule `no-interdependencies-in-app` keeps every route of `src/app` apart, yet lets a route import the module beside it that wires the map and two features, `client.layout.tsx`, and its `metadata.ts`. Its Biome configuration has no limit of lines per file.

The product owner chose this way out on 2026-11-24, in the maintainer's absence, as both sessions that met the question advised.

## Decision

- **A file of `src/routes` may import the modules of its own folder whose name does not start with `+`**, such as `src/routes/home-sheets.ts` beside `src/routes/+page.ts`. The rule `routes-compose-features` captures the folder of the importing file and allows only that folder's modules.
- **It still never imports a file of another folder of `src/routes`, nor a file starting with `+`**: a route stays an entry point of its own, and SvelteKit's files are never imported by hand.
- **Those modules are part of the route, and follow its rule**: they import only features, configuration, libraries, translations and their own folder's modules, and do nothing but wire features to their adapters and to each other.
- **Biome's limit of 200 lines per file stays as it is**, the home page included.

## Consequences

- The home page can be split into modules beside it, so #67 and the step of a station (#96) can be wired without moving more code into features.
- A module beside a route is not a route for SvelteKit, which only reads the files starting with `+`.
- The regular expressions of the rule had to pass dependency-cruiser's check for unsafe expressions: the folder is captured by `^(src/routes.*)/[^/]+$`, since a nested quantifier is refused.

## Alternatives considered

- **Raising the limit of 200 lines, or exempting the home page from it**: the page would keep growing with each step, and the limit would no longer tell when a file does too much.
- **Moving more code out of the page into features and libraries**: done at steps 10 and 11; what is left is composition, which only a route may hold.
- **One feature describing the shapes of other features' states**: no rule change, but it ties features together, as the session of step 10 warned.
- **Composing in `+layout.ts`**: works around the rule instead of changing it, and puts the home page's wiring in the layout of every page.
- **Any module of `src/routes` importable by any route**: routes would start sharing code, which belongs in features or libraries.
