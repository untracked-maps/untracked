# ADR-033 — Recent searches kept on the device, in the search panel

**Date**: 2026-11-16
**Status**: accepted

## Context

The previous app opened a panel under its search field as soon as the field got the focus: shortcuts to home and work, example queries, the recent searches with an "Effacer" link, and links to import places from Google Maps and to customise the categories. It kept the last 8 places opened in `localStorage`, under `lieux-recents`, with their id, name, type, address, coordinates and the OpenStreetMap references its place sheet needed, and dropped a place already listed by id or by name.

In the rebuilt app, abilities never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)): the search field belongs to `search-places`, and recent searches are a second ability. The theme and the dismissed language suggestion are already kept on the device through a port and a browser adapter ([ADR-017](ADR-017-suggest-the-visitors-language-without-redirecting.md), [ADR-026](ADR-026-a-theme-chosen-on-the-device-applied-before-the-first-paint.md)).

## Decision

- **A new ability, `search/recent-searches`**, keeps the places chosen, in the search results or among the recent searches themselves. Its use case is a stream function of two ports, reading and storing the list, and of two input streams, the places chosen and the clearings ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). Its browser adapter reads and writes `localStorage` under `untracked-maps.recent-searches`, and removes the key when the list is cleared.
- **At most 8 places, the most recent first, each once**, as in the previous app: a place chosen again moves to the top. Eight rows fill the panel of a phone without scrolling, under the field, and keep the list a list of recent places rather than a history.
- **A recent search keeps only what showing it and flying to it need**: its id, name, kind, address and coordinates. Not its fame, which only ranks search results, nor anything about when it was chosen. A place is the same place by its id only: two namesakes stay two places. What is read back from the device is checked field by field, and anything else, from another version or another tool, is skipped.
- **Nothing leaves the device.** Clearing removes the key. A device that refuses to store keeps the list for the visit.
- **The place model and the labels of its kinds move up to the `search` feature** (`domain/place.ts`, `ui/components/kind-labels.ts`), since both abilities show places.
- **The search panel hosts what other abilities offer.** `search-places` opens its panel when the field gets the focus, and takes a `suggestions` snippet that it renders while nothing is searched. The route composes it with the recent searches, and gives the snippet two functions of the panel: `settle`, which writes a name in the field, searches it and closes the panel, and `focusField`. A hosted block gets the panel's separator, keeps the focus in the field when pressed, and closes the panel on Escape. Only places found are options of the combobox's listbox; the suggestions are buttons in a region of their own beside it, reached with Tab, so that `aria-expanded` stays true only while the listbox has options to show.

## Consequences

- The shortcuts of the previous app (home, work, a new shortcut), its Google Maps import and its customised categories will each be an ability, composed in the same snippet by the route, each block separated by the panel's line; its example queries wait for categories.
- Recent searches are not reachable with the arrow keys, as they were not in the previous app; Tab reaches them.

## Alternatives considered

- **Recent searches as options of the listbox**, as Google Maps does: arrow keys would reach them, but the combobox of `search-places` would have to know the recent searches, and its options would mix two abilities.
- **Keeping the whole place**: its fame and, tomorrow, its opening hours would go stale on the device.
- **`sessionStorage`**: the list would vanish with the tab, though recent searches serve the next visit first.
