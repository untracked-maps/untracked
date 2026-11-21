# ADR-048 — Windows and menus whole on screen, at the previous app's format

**Date**: 2026-11-21
**Status**: accepted

## Context

On a small phone, a window or a menu must never be cut by the edge of the screen. The previous app gave every modal window one format and kept every menu whole; its measures were read in its code and listed in the issue of this step. The design library had a `dialog-button`, a native modal `<dialog>` along the bottom below 700 px and centred above ([ADR-032](ADR-032-the-home-screen-layout-a-native-dialog-and-a-welcome-kept-on-the-device.md)), and a `popover-button`, a popover placed above its button by CSS anchor positioning, flipped below when it did not fit, with no limit to its height. A touch outside the popover closed it, then reached what was under it: the map inspected the spot, the search field took the focus.

## Decision

- **One format for every modal window, in the `dialog-button`.** A phone is the rule of the bottom sheet, `(width <= 699px) and (orientation: portrait), (width <= 559px)` ([ADR-038](ADR-038-a-bottom-sheet-on-phones-and-what-floats-above-it.md)), so that a phone held sideways gets the centred window, as it gets the side panel. On a phone the window stands on the bottom, the whole width, 92 % of the screen's height at most (`92dvh`), with top corners of 22 px and a handle of 38 by 5 px. Elsewhere it is centred, 420 px wide at most, `100dvh − 32px` high at most, with corners of 20 px and a padding of 20, 20 and 22 px. Its title is 19 px; its round close button of 32 px stands 12 px from the top and the right and answers 6 px around it. The backdrop stays black at 40 %, and a touch on it closes the window, as before. Nothing animates when it opens, nor when it closes by its button, Escape or the backdrop.
- **A swipe down closes a window, on a phone only.** It starts when the content is scrolled to its top and the touch is not in a text field, a select or a text area; it becomes a swipe once the finger went more than 6 px, down more than sideways. The window follows the finger and the backdrop fades to `max(0.3, 1 − dy / 400)` of itself. Lifted beyond 90 px, or beyond 30 px faster than 0.5 px/ms, it slides out in 200 ms and is closed after 180 ms; otherwise it slides back. With reduced motion it closes at once. As for the bottom sheet, the rule is a pure function of the touches, folded by an RxJS `scan`, and the component only feeds it the touches and draws the result.
- **A menu covers the screen with a clear layer, under its panel.** The popover itself is the whole screen; a touch anywhere outside its panel lands on a button that hides the popover, declared with `popovertarget` and `popovertargetaction="hide"`, kept out of the tab order and of the accessibility tree. Nothing under the touch is reached. Touching the menu's button again lands on that layer too and closes the menu. The popover takes the touches even when it stands in a layer of floating controls that lets them through to the map.
- **The menu's panel is placed by a pure function** of its button, its size and the screen: above its button when it fits, else below, else beside it on the side with more room, always 8 px from every edge; 8 px from its button, as before; beyond the height of the screen less 16 px, it scrolls. A `ResizeObserver` places it again when its size or the screen's changes, before it is painted.
- **Opening a window closes an open menu**: the browser hides every popover when a modal dialog opens, and a test now holds it. One menu stays open at a time, as `popover="auto"` already ensured.
- **Testing reduced motion** needs a browser command of Vitest that emulates the setting; its type is declared in the browser setup, which the type check now includes.

## Consequences

- A window opened before the app has started keeps working without JavaScript; only the swipe needs it. A menu still opens without JavaScript, but its panel is placed once the app has started.
- A touch outside a menu no longer reaches the map or a button: closing a menu takes one touch, and doing something else a second one, as in the previous app.
- The handle of the window is drawn, 8 px from its top; it is not a button, as the whole window takes the swipe.
- Other windows and menus get this format with nothing more to write, through the two components of the design library.
- No window has a main button yet: its format, 48 px high, corners of 14 px, blue with white text of 16 px in bold, and the secondary button, blue text centred, come with the first window that has one.
- The swipe was tried with synthetic touches only, not with a finger on a real phone.

## Alternatives considered

- **CSS anchor positioning for the menu, as before**, with fallbacks for below and beside: the panel is held to its area only by a maximum height, and with one the fallbacks are never tried, since the first position always fits once the panel scrolls.
- **Swallowing the touch with listeners on the window**: a touch on a phone sends its events over several tasks, the click coming last, and the listeners would have had to guess when the touch ends.
- **The popover's own `::backdrop` as the layer**: browsers draw it with `pointer-events: none`, so it takes no touch.
