# ADR-060 — On a phone, the welcome card gives way to the buttons

**Date**: 2026-11-24
**Status**: accepted

## Context

The home screen stacks, from the top, the search field and the category chips, the basemap outage message, the welcome card, the round buttons of the home page, then the "About" button of the root layout ([ADR-032](ADR-032-the-home-screen-layout-a-native-dialog-and-a-welcome-kept-on-the-device.md)). The application frame is at least the height of the screen, with no maximum: when that stack is taller than the screen, the frame grows and pushes the "About" button below the bottom edge (#86). [ADR-038](ADR-038-a-bottom-sheet-on-phones-and-what-floats-above-it.md) hides the stack when a bottom sheet leaves it no room, but the welcome card and the outage message are shown with no sheet open.

Measured on 2026-11-24 on `main`, the bottom of the "About" button on a 375 × 667 screen lies at 718 px with the welcome card and the outage message, and the page does not scroll there: the button cannot be reached. On 360 × 640 and 320 × 568, the welcome card alone pushes it out, at 665 and 715 px, and on 320 × 568 the position button too. On a phone held sideways, 568 × 320 or 667 × 375, the stack does not fit even with the card closed. The product owner agreed in #86 that on a small phone the welcome card is shortened so that the buttons stay on screen.

## Decision

- **On a phone held upright, `(width <= 699px) and (orientation: portrait)`, the home screen is exactly the height of the screen.** The home page sets the application frame to `100dvh`, and lets its own content shrink; the frame of the design library and the content pages, which scroll, do not change.
- **The welcome card gives way, never the buttons.** When the stack does not fit, the card's row shrinks and the card scrolls inside itself, from its top: its title stays visible, and its "Got it" button is reached by scrolling the card. The search field, the chips, the outage message, the round buttons and "About" keep their size and place.
- **Nothing changes elsewhere.** On a large screen, a tablet held upright or a phone held sideways, the layout stays as it was. A phone held sideways is left to its own issue: there the stack does not fit even without the card, and shortening the card would not be enough.

## Consequences

- On 320 × 568 with the outage message, the card has about 5 px left: it is still in the page and reachable by keyboard, but not readable until the message withdraws. The buttons win, as agreed.
- The welcome card is a scroll container on every screen, with no effect while it fits. The end-to-end tests check, on 375 × 667, that the "About" button lies wholly on screen and that axe-core finds no violation with the card shortened.
- The home page sets the height of the frame of the root layout through a `:has()` selector, since the layout draws the frame for every page and only the home page must fit the screen.

## Alternatives considered

- **Hiding the welcome card when it does not fit**, as the stack hides above a sheet ([ADR-038](ADR-038-a-bottom-sheet-on-phones-and-what-floats-above-it.md)): no measure needed in CSS, but the card would vanish on first visit on every small phone, while it is the first thing a visitor must read.
- **Hiding the category chips while the card is shown**: frees about 50 px only, not enough on 320 × 568, and changes a screen the visitor already uses.
- **Fitting the frame to the screen in the design library, for every page**: the content pages, such as "Who sees what", scroll the document and would be cut.
- **Letting the page scroll**: the map would scroll away with it, as it does today on a phone held sideways.
