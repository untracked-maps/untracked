# ADR-039 — A side panel on large screens

**Date**: 2026-11-19
**Status**: accepted

## Context

On a phone, the places of a kind and the spot inspected show in a sheet along the bottom ([ADR-038](ADR-038-a-bottom-sheet-on-phones-and-what-floats-above-it.md)). On a larger screen they were still cards in the flow of the page, under the search field and the kinds of places ([ADR-034](ADR-034-inspect-a-point-with-the-nearest-fake-address.md), [ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)): a list was held to half the height of the screen, and a spot inspected while a list was open stood under it.

The previous app showed the same sheet, on a large screen, as a panel on the left: 16 px from the edge, under the search field, 400 px wide at most, with the search field as wide as the panel and the kinds of places on its right. Its measures were read in its code on 2026-11-18, none seen on screen. Its round buttons never moved for the panel, and its credit line stood on the right of the panel rather than under it.

## Decision

- **The bottom sheet is a panel on a large screen**, `(width >= 700px), (width >= 560px) and (orientation: landscape)`, the previous app's rule and the exact complement of the phone's: a phone held sideways gets the panel. The same component of the design library draws both, so a screen that puts its content in a sheet gets the panel with nothing more to write.
- **Fixed on the left**, 16 px from the edge and 16 px under the search field, `min(25rem, 58vw - 1rem)` wide, with corners of 20 px and the shadow of what floats. It is no taller than its content, stops 16 px above the bottom of the screen, and scrolls beyond. It has no grip and follows no gesture. It fades in from 6 px above, in 280 ms, which the reduced motion setting cuts.
- **Out of the flow of the page.** In the flow, a long list pushed the round buttons and the credit line below the bottom of the screen; fixed, the panel leaves them where they are.
- **A card inside the panel is flattened**: the panel is the card. The design library's floating card loses its background, corners and shadow in a sheet, and takes the panel's margins, 18 px above and 22 px on the sides and below.
- **One panel at a time**, as on a phone: a panel that another one covers is not displayed.
- **The home page is laid out around the panel**: the search field takes its width, and the kinds of places stand on the right of the field, wrapping from 900 px and scrolling sideways below.
- **Nothing stays under the panel.** A sheet that nothing covers carries `data-sheet-open`; while one does, the home page starts the credit line and the basemap outage message on the right of the panel.

## Consequences

- The places of a kind are no longer held to half the height of the screen, and a list of 25 places scrolls in the panel.
- The top of the panel assumes a search field of one control's height on the edge of the screen; the language suggestion, which stands under the field until it is dismissed, shows under the panel while both are there.
- The message of the welcome card and the "About" dialog are not concerned: the first withdraws while a sheet is open, the second is modal.
- The page reads an attribute the library's component sets, `data-sheet-open`, as it already reads `--lift` and `--floats`.

## Alternatives considered

- **The panel in the flow of the page**, as the cards were: no fixed position, but its height pushes what the page stacks at the bottom, and capping it at half the screen is what this change removes.
- **A second component for the panel**: two looks kept apart, but every screen would choose between them with the same media query.
- **The credit line folded or hidden while a panel is open**: nothing to move, but OpenStreetMap's credit must stay visible ([ADR-032](ADR-032-the-home-screen-layout-a-native-dialog-and-a-welcome-kept-on-the-device.md)).
- **CSS subgrid to place the list in the page's grid**: the list would stay in the flow, with the same push on the bottom of the page.
