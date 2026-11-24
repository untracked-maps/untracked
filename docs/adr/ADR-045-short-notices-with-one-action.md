# ADR-045 — Short notices, with one action at most

**Date**: 2026-11-19
**Status**: accepted

## Context

The previous app told the visitor what had just happened in a short message under the top bar: "Lieux récents effacés", "Lien copié", "Enregistré dans Favoris"… About fifty of its actions did so, and those that erase something offered "Annuler" in the message, so that nothing was lost by a slip of the finger. Its rules were read in its code on 2026-11-18: three and a half seconds, six with an action; a new message replaces the one shown and its time starts over; no queue; the message does not close when touched; it comes in from 8 px above in 0.22 s and goes without animation; it is announced to screen readers.

The rebuilt app had no such message: clearing the recent searches erased them at once and for good ([ADR-033](ADR-033-recent-searches-kept-on-the-device.md)). Features never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)), yet any of them may have something to tell.

## Decision

- **A new feature, `notices`, with one ability, `show-notice`.** Its use case is a stream function of two input streams, what is told and the actions taken, to the notice to show, if any ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). A notice is a text and at most one action, a label and what it runs. The domain holds the two durations and the rule of replacement, `switchMap` cancelling the time left of the notice replaced.
- **The route tells.** No feature imports `notices`: the home page's `load` builds the stream and gives the page two functions, to tell a notice and to say its action was taken; the page calls the first where something happens and passes the texts, already translated ([ADR-008](ADR-008-composition-in-routes.md), [ADR-009](ADR-009-translations-with-paraglide-and-the-locale-in-the-url.md)).
- **A polite live region**, `role="status"`, present and empty while nothing is told, as the basemap outage message is ([ADR-023](ADR-023-basemap-outage-told-from-the-maps-own-events.md)). The card is the previous app's: white, corners of 16 px, 420 px at most, a text of 14.5 px, and an action as a pale blue pill 36 px high.
- **Under the top bar, covering nothing.** The notice stands in the flow of the top of the page, 8 px under the search field and the kinds of places, and under the search panel while it is open. On a large screen it starts under the search field, and on the right of the panel while one is open ([ADR-039](ADR-039-a-side-panel-on-large-screens.md)); it leaves the round buttons their column. It stands above a bottom sheet, so a sheet grown to the full screen passes under it, as in the previous app; [ADR-057](ADR-057-short-notices-tell-no-copy-done-and-cover-nothing.md) moves it above such a sheet, covering nothing.
- **First use: taking back the clearing of the recent searches.** `recent-searches` gets a third input stream, the clearings taken back. Its state keeps the places last cleared next to the list; taking a clearing back puts them back after the places chosen since, each once, eight at most, and is kept on the device like any other change.

## Consequences

- Every later action that erases or saves something tells it through the same two functions.
- A notice's action is a function carried by a value of the domain: the domain runs nothing itself, the component runs the action then says it was taken.
- A notice told while another one shows replaces it without the entrance animation, the card staying in place.
- The order of the places after a clearing is taken back, those chosen since first, is this change's: the previous app's behaviour in that case was not read.
- During turn-by-turn guidance the previous app moved the notice above its bottom bar; that waits for guidance.

## Alternatives considered

- **A queue of notices**: nothing told is lost, but the previous app replaced, and a queue shows news that is already old.
- **The notice in the design library alone, driven by each feature**: no feature of its own, but the durations and the replacement are rules, and rules belong to a domain with its scenarios.
- **A confirmation dialog before clearing**: nothing to take back, but a question at every clearing, where the previous app let the visitor act and repent.
- **A fixed position computed from the top bar's height**, as the previous app did: needed there because its top bar was not in the flow; here the flow of the page gives the same place without a measure.
