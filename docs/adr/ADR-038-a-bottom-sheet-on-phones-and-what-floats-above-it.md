# ADR-038 — A bottom sheet on phones, and what floats above it

**Date**: 2026-11-18
**Status**: accepted

## Context

On a phone, the previous app showed the places of a kind, a place or a spot in a sheet along the bottom of the screen, which the visitor dragged between three heights while the map stayed visible above it. The rebuilt app showed them as cards under the search field instead, because the design library had no sheet yet ([ADR-029](ADR-029-design-tokens-inter-and-a-design-library.md), [ADR-034](ADR-034-inspect-a-point-with-the-nearest-fake-address.md), [ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)): on a phone, a card of 25 places hid most of the map.

The measures of the previous sheet were read in its code on 2026-11-18, none of them seen on screen since that app is offline: its heights, the thresholds of its gestures, what its grip does, and the rule that raised or hid the round buttons. Two of its behaviours were defects, set aside by the owner: its animation ignored the reduced motion setting, and the buttons rested 20 px from the bottom where this app rests them on its 12 px edge.

Abilities never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)), the code holds no mutable state ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)), and the "About" button belongs to the root layout while the other round buttons belong to the home page ([ADR-032](ADR-032-the-home-screen-layout-a-native-dialog-and-a-welcome-kept-on-the-device.md)).

## Decision

- **A `bottom-sheet` component in the design library.** On a phone, `(width <= 699px) and (orientation: portrait), (width <= 559px)` as in the previous app, it is fixed along the bottom, with top corners of 26 px and a grip of 36 by 5 px in a zone of 30 px. Elsewhere it is a plain block in the flow of the page: the cards stay where they were until the left panel of large screens is rebuilt.
- **Three heights, from its content**: full, the screen but 64 px; half, 46 % of the screen; a peek of 150 px, or 6 px above the element its content marks with `data-sheet-actions`. None is taller than the content, a height no taller than the one below it is dropped, and the grip goes with the last one. The content scrolls at full height only, and goes back to its top below it.
- **Gestures, as the previous app decided them.** Nothing moves before 6 px. The sheet follows a finger that goes more up or down than sideways, two and a half times more from a row marked `data-sheet-sideways`; a gesture that starts sideways is left alone until the next touch. A full sheet follows only a pull down from the top of its content. On release, a flick faster than 0.45 px/ms goes one stop up or down from where the gesture started, anything slower settles on the nearest stop, and a sheet that can be closed closes under 70 % of its peek, or on a flick down from its peek faster than 0.5 px/ms. The grip grows the sheet to full, and reduces a full sheet to half; turning the wheel down grows it to full.
- **The rules are pure functions of the library**, `sheet-heights` and `sheet-gesture`: a reducer over the events of the sheet, folded by an RxJS `scan`, with every threshold named and tested. The component only measures its content with a `ResizeObserver`, turns touch events into those events and shows the height it is given, through a custom property, so that a style sheet decides whether it applies. The property is set by script, not written as a `style` attribute: the prerendered page would carry it, and the Content Security Policy refuses inline styles ([ADR-018](ADR-018-security-checks.md)).
- **280 ms between two heights**, with the previous curve, and 200 ms to close. The global rule for reduced motion already cuts every transition, this one included.
- **One sheet at a time.** A component puts its panel in a sheet and tells it when another one covers it: the places of a kind stay behind the spot inspected, hidden, and come back when it closes. The places of a kind open as a peek and do not close by a swipe; a spot opens at half height and does.
- **What floats above the sheet rises with it, or hides.** Each sheet tells the height it shows, none on a large screen. The home page keeps the tallest one in a stream that the root layout's `load` provides, as it provides the theme, since the layout draws the "About" button. The application frame of the design library measures what the page marks `data-sheet-stack` and `data-sheet-top`, and a pure function, `float-lift`, gives the offset, 8 px above the sheet, and whether the stack still fits between the sheet and the top bar; when it does not, the whole stack hides, never half of it. The frame hands both to its content as two custom properties, `--lift` and `--floats`. The credit line and the basemap outage message rise with the buttons.
- **The welcome card withdraws while a sheet is open**, as in the previous app.

## Consequences

- On a phone, the places of a kind and the spot inspected no longer stand under the search field ([ADR-034](ADR-034-inspect-a-point-with-the-nearest-fake-address.md), [ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)); on a large screen nothing changes.
- The next sheets, a place, a route, saved places, reuse the component, each with its opening height.
- A sheet that covers another one hides it without closing it, so two sheets are in the page at once; a third kind of sheet will call for the route to choose which one shows.
- The grip is `rgb(216 216 220)` in the light theme, the previous app's; its dark value, `rgb(74 79 87)`, is this change's, the previous one not having been read.
- The touch events are synthetic in the tests: a real finger on a real phone was not tried.

## Alternatives considered

- **A native modal `<dialog>`**, as "About": it would make the map inert, while the sheet exists to keep the map in use.
- **Pointer events**: one code path for the mouse and the finger, but the browser cancels them as soon as it scrolls, and a full sheet must both scroll and be pulled down.
- **CSS scroll snap**, the sheet being a scroll container with three snap points: no script for the gesture, but no rule for a flick, for closing or for a sideways gesture, and the heights depend on the content.
- **A store shared by the sheets and the buttons**: forbidden here; the height goes up through callbacks and down through the layout's data.
- **Rising computed in CSS alone**: the offset can be, but hiding the stack when it no longer fits needs measures no style sheet has.
