# ADR-065 — An address chosen in the search opens the sheet of a spot

**Date**: 2026-11-25
**Status**: accepted

## Context

Choosing an address or a street in the search flew the map to it and marked it with a pin of its own, and opened nothing (issue #67). The former app opened a sheet: the part of the address before the first comma as its title, the rest under it. oertio decided on 2026-11-22 that a street has the same layout, « Rue de Rennes » over « 75006 Paris », and on 2026-11-25 that no sheet has a button to copy an address ([ADR-064](ADR-064-an-address-is-copied-by-a-long-press-only.md)).

The sheet of a spot, from `inspect-point`, already showed an address that way, with its red pin, its share button and its report link; it read a one-line address in French order, which [ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md) left until this step.

## Decision

- **An address or a street chosen in the search opens the sheet of a spot**, at its coordinates, with its address already known: `inspect-point` takes a third input stream, the spots located with their address, which open without looking for the nearest address. A spot inspected afterwards, or a dismissal, takes its place as before.
- **The sheet of a spot reads its address in components** and writes it with the line of its country ([ADR-042](ADR-042-addresses-in-international-components-and-presenters-per-country.md)): its title is the first part of the line, the rest goes under it. The addresses file loses its one-line address; an address found by the search carries its house number and street, its details in the list still giving only its postcode and city.
- **The red pin of the spot marks the address chosen**; the pin of the search for addresses, in the colour `Highlight`, goes. A district chosen is no longer marked: issue #67 gives it a sheet and its outline in a pull request of its own.
- **The route decides which sheet opens**, in a module of its own folder ([ADR-061](ADR-061-a-route-imports-the-modules-of-its-own-folder.md)), `src/routes/spots.ts`, which also holds the composition of the sheet of a spot that `+page.ts` held.
- The map still flies to the address chosen, at zoom 16.5 at least, in 800 ms, now framed around the sheet ([ADR-053](ADR-053-framing-the-map-on-what-is-opened-measured.md)).

## Consequences

- Sharing the sheet of an address chosen shares a point: the link opens the sheet of the spot with the nearest address of the addresses file.
- An address kept among the recent searches by an earlier version has no house number nor street: chosen again, its sheet is titled by its postcode and city.
- A street is shown as the point the address book gives it, the mean of its houses; it is not drawn.

## Alternatives considered

- **A sheet of its own for addresses**, in the `search` feature: a second card with the same layout, pin and buttons as the sheet of a spot.
- **The address written by the route as one line** before opening the sheet: the components lost again, against ADR-042.
