# ADR-053 — Framing the map on what is opened, measured

**Date**: 2026-11-22
**Status**: accepted

## Context

When a place opened, its sheet could cover it. A place chosen in the search made the map fly to it, centred, at MapLibre's default duration. The list of a kind fitted its places with margins estimated from the size of the screen (48, 88 and 488 px, 60 % of the height) and zoom 16 at most. A dot touched on the map did not move it at all.

Issue #55 asks, after the previous app: one place opened flies to zoom 16.5 at least, in 800 ms, into the middle of what the top bar and the sheet leave visible; several places fit within 24 px of the top bar and of the sheet (counted at 60 % of the screen at most) and 36 px on the sides on a phone, and within 60 px of every edge with the panel's width plus 60 on the left on a large screen, at zoom 17 at most, in 700 ms. With reduced motion, the map jumps. The previous app estimated the offset for one place, `(46 % of the screen − 120) / 2`. On 2026-11-21 the product owner chose to measure in both cases. On 2026-11-22 the product owner also confirmed that a dot touched on the map flies like a place chosen in the search, and the values of the previous code for a large screen: 60 px from the top of the screen, and the panel's width alone.

What is framed comes from three abilities of two other features, which never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)): the sheet of `open-place`, the address chosen in `search-places`, the list of `search-by-type`. Only a route may combine them ([ADR-008](ADR-008-composition-in-routes.md)), and the home page stood at 199 of its 200 lines.

## Decision

- **The framing belongs to `show-map`.** Its use case, `frameMap`, is a stream function of three streams of coordinates (places opened, districts opened, places listed) and of a port that measures the map, to the moves of its camera ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). Its rules are Gherkin scenarios. A district keeps zoom 14, as before.
- **The framing takes coordinates only.** Each ability turns its own state into coordinates in its domain: `placesOpenedAt` in `open-place`, once each time a sheet opens; `addressesChosenAt` and `districtsChosenAt` in `search-places`, a place chosen in the search being left to its sheet; `placesFoundAt` in `search-by-type`. The home page plugs them into the framing; the map knows nothing of a sheet or a search.
- **Measured, not estimated.** The `design` library measures what covers the map: the bottom of the top bar (`data-sheet-top`), and either the height a bottom sheet goes to (its `--sheet-height`, not its height during its animation) or the width and right edge of the side panel. The flight waits two animation frames, so that a sheet opened with the place has measured itself; a test fails with one.
- **One place is offset, not padded.** MapLibre's `offset` moves the place into the middle of the visible part for that flight only; its `padding` would stay on the map and shift the centre written in the address ([ADR-025](ADR-025-the-view-in-the-url-hash.md)). Several places use `fitBounds` with a padding, which MapLibre drops once it has fitted.
- **Not essential**: each move says `essential: false`, so MapLibre jumps instead of flying when the visitor asks for reduced motion.
- **The search and the list of a kind no longer move the map.** Their former flight, fit, estimated padding and bounds are removed.
- **The home page keeps within its 200 lines** by passing the site's origin and base path to the OpenFreeMap adapter, which now builds the addresses of the glyphs and of the sprite itself.

## Consequences

- The centre written in the address is no longer the place opened, but the centre of the map around it.
- The change touches four abilities (`show-map`, `open-place`, `search-places`, `search-by-type`), against the rule of one ability per pull request: the three that described their state for the map, and the one that moves it.
- Nothing moves the map back to the visitor's position on its own after a search: `locate-me` flies only when the visitor asks for the position, as before.

## Alternatives considered

- **A module beside the home page, in `src/routes`, to combine the three states**: refused by dependency-cruiser's `routes-compose-features` rule, which forbids a route to import another file of `src/routes`. Changing that rule is the maintainer's decision.
- **Raising the 200-line limit of Biome, or exempting the home page from it**: also the maintainer's decision, and the page would keep growing.
- **The framing describing the states of the sheet, the search and the list itself**: no rule changes, but the map would depend on the shapes of other features.
- **The previous app's estimate for one place**: set aside by the product owner on 2026-11-21.
- **Re-aiming the flight when the sheet's height arrives late**: a second flight in the middle of the first; waiting two frames is enough, since a sheet measures itself in the frame it is laid out.
