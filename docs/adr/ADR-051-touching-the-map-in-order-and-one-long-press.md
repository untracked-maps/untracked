# ADR-051 — Touching the map in order, and one long press

**Date**: 2026-11-22
**Status**: accepted

## Context

A touch on the map always opened the sheet of the spot touched, even on the dot of a place, and even while a sheet was open. The previous app did the first of a fixed list of things, and a long press gave the address of any spot. Its measures were read in its code on 2026-11-21 and are listed in issue #54, with the product owner's decisions: no address beyond 200 m, « Address introuvable » when none is found, a long press on a dot opens the place, and one long press for the whole app. On 2026-11-22 the product owner added that only one sheet is shown at a time, that the list of a kind of places does not count as a sheet, and that the sheet of a spot says « Address indisponible » under its title when the addresses cannot be loaded.

The rule involves the dots of `show-places`, the sheet of `open-place` and the sheet of `inspect-point`, three abilities that never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)).

## Decision

- **A new ability, `touch-the-map`, in the `places` feature.** Its use case is a stream function of the touches and of whether a sheet is open, to what the touch does ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)): a touch or a long press on a dot opens its place; a touch on an empty spot closes the sheet open, or opens the sheet of the spot when none is; a long press on an empty spot opens the sheet of the spot, even with a sheet open. Its overlay turns the gestures on the map into touches and calls the home page back, which opens or closes the sheets ([ADR-008](ADR-008-composition-in-routes.md)).
- **The map menu needs no rule.** While it is open, a scrim covers the whole screen: a touch closes the menu and never reaches the map. An end-to-end test keeps it so.
- **A touch is MapLibre's click**: the finger moved less than 3 px. Each gesture gives one thing only, its first: the long press, a right click, or the click. A click that follows a long press is ignored.
- **The touch area of a dot** is the dot and the rectangle of its name, as MapLibre draws them, and a square of at least 24 × 24 px centred on the dot, after WCAG 2.2 criterion 2.5.8, at the AA level AGENTS.md targets. The previous app had no margin, and a dot fell to about 19 px in a wide view. `show-places` gives the id of each place in the data of its dots, and a function that finds the dot under a point of the screen; the home page hands it to `touch-the-map`. A dot under the finger wins over a dot whose square only is touched.
- **One long press for the whole app**: 480 ms, cancelled when the finger moves more than 10 px, then a 10 ms vibration where the device allows it. The helper moves from `open-place` to the `design` library, where the map and the copy of an address share it. A right click does the same at once, without vibration. A press with the mouse held still for 480 ms is a long press too.
- **One sheet at a time.** Opening a place closes the sheet of a spot; opening the sheet of a spot closes the sheet of a place, as its close button does.
- **A place opened on the map says so**: `open-place` takes the map as a third origin, beside the search and the list of a kind.
- **Enter still opens the sheet of the centre of the map**, the keyboard's way to inspect a spot, whatever lies there: no dot is looked for under the centre.
- **The sheet of a spot** is titled « Point sélectionné » with « Address » under it while the address is looked for, « Address introuvable » when none lies within 200 m, « Address indisponible » when the addresses cannot be loaded; the street part of the address and the rest under it once found.
- **The heights of the sheets move to the `design` library**, to keep the home page within its 200 lines.

## Consequences

- A double tap that zooms the map also counts as two touches, as before this change: the first opens the sheet of a spot, the second closes it.
- The vibration of a long press on the map is not checked by the end-to-end tests: no browser of the tests vibrates.
- The sheet of a spot still reads its address as one line in French order, from the addresses file; reading it in components ([ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md)) is left to the change that opens the sheet of an address chosen in the search.

## Alternatives considered

- **The rule in the home page**: three abilities meet there, but its rules would not be Gherkin scenarios, and the page holds no more lines.
- **Each ability listening to the clicks itself**, as `inspect-point` did: the order between the dot, the sheets and the empty spot would be spread over three abilities that cannot see each other.
- **MapLibre's `queryRenderedFeatures` on a box of 24 × 24 px around the finger alone**: simpler, but it widens the rectangle of the name by 12 px too, beyond what the previous app took in.
- **Two long presses, MapLibre's 500 ms and 3 px on the map and 480 ms and 10 px elsewhere**, as the previous app had: set aside by the product owner.
