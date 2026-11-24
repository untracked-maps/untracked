# ADR-057 — Short notices tell no copy done, and cover nothing

**Date**: 2026-11-24
**Status**: accepted

## Context

[ADR-045](ADR-045-short-notices-with-one-action.md) brought short notices from the previous app. Two of its rules were questioned once the sheet of a place was built ([ADR-049](ADR-049-the-sheet-of-a-place-and-addresses-in-components.md)):

- Copying an address told that it was copied. Android 13 and later shows its own confirmation after a copy, and its documentation advises against a second one; the reference map apps show none on phones. Sharing a link already tells only a refused copy ([ADR-055](ADR-055-sharing-a-place-or-a-spot-by-a-link.md)).
- A notice stood above a bottom sheet, so that a sheet grown to the full screen passed under it, as in the previous app. That app also had a behaviour marked « essai » in its code, where a notice covers nothing; oertio chose it on 2026-11-22.

Measured on 2026-11-23 in Chromium, on a phone: a full sheet left 64 px of the screen free ([ADR-038](ADR-038-a-bottom-sheet-on-phones-and-what-floats-above-it.md)); the page keeps 12 px from the top of the screen, `--edge`, or the safe area where it is larger; a notice with an action is 60 px high, its 36 px button between two paddings of 12 px. A notice placed in the free band would have covered the top 8 px of the sheet. A notice stands from 112 to 172 px under the top bar, which ends at 104 px: a sheet whose top fell between 80 and 180 px, a full sheet held lower by short content or a half sheet on a screen about 320 px high, reached it. Issue #76 holds these measures.

## Decision

- **No notice after a copy done.** Only a refused copy is told, as for the link. The wiring leaves the home page for the `open-place` feature, as `link-sharing` did for the link; `copyAddress` still reports both outcomes, since telling is the page's business.
- **A full sheet leaves 80 px of the screen free**, no longer 64: the page's 12 px edge, the 60 px of a notice with an action, and 8 px between the notice and the sheet, the gap the notice keeps under the top bar. This changes ADR-038. oertio chose it on 2026-11-23.
- **The top of a sheet on a phone is either 80 px from the top of the screen, or at least 8 px under the room of a notice**: under the bottom of the element the page marks `data-notice-under`, the bar of the kinds of places, 76 px are kept for a notice, 8 px above it, 60 px for it and 8 px under it. A full sheet that would stop in that room rises to 80 px, with blank space under its content; a half sheet or a peek stays under it. Without such an element, as on the content pages, nothing changes. oertio chose it on 2026-11-23, for the full sheet held lower by short content and for small phones held sideways alike.
- **While a sheet reaches 80 px from the top, the notice stands in that band**, 12 px from the top of the screen, or the safe area where it is larger, and centred, at most 420 px wide. The sheet marks itself `data-sheet-at-top` then, from a pure function of the library, `reachesTop`; a sheet covered by another one does not. Nothing moves when a notice appears: the sheet's heights do not depend on it.
- **Every other case stays as ADR-045 decided**: under the top bar, under the search panel while it is open, and on the right of the side panel on a large screen.

## Consequences

- A full sheet shows 16 px less of its content than before, on every phone.
- A full sheet with content that would stop between 80 and about 180 px from the top shows blank space under its content.
- A notice whose text wraps on two lines next to an action is taller than the 60 px kept for it, and would cover the top of the sheet; the length of today's notices on the narrowest phones was not measured.
- Copying an address on a desktop browser, which shows no confirmation of its own, tells nothing.
- On the content pages, a sheet does not know of any notice.

## Alternatives considered

- **The sheet lowered only while a notice shows**: 64 px kept the rest of the time, but the sheet would move under the visitor's finger each time something is told.
- **The notice 2 px from the top of the screen**, to fit in 64 px: against the page's edge, and still too tall for two lines.
- **A lower notice in the band**, with a button under 36 px: a second look for the same notice, and a target smaller than the previous app's.
- **Leaving the small phones held sideways as they were**, 2 px covered at 540 by 320 px, and the full sheet held lower by its content: the rule « a notice never covers anything » would hold only on some screens.
- **Moving the notice into the band whenever it would cover the sheet**: on those screens the band holds the search field, which the notice would cover instead.
