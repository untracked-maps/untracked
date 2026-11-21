# ADR-047 — Escape and the back button close what is open, in order

**Date**: 2026-11-21
**Status**: accepted

## Context

On a phone, the back button is how a visitor closes a sheet or a menu. The view of the map is written in the address by replacing the current history entry, so that moving the map adds none ([ADR-025](ADR-025-the-view-in-the-url-hash.md)): the back button therefore left the app, whatever was open. The Escape key was listened to by each element for itself, the search field, the list of a kind of places, the sheet of a spot and the map: it closed the element that held the focus, not the one on top.

The previous app closed one element at each press, the one on top first, in a fixed order, and left only once nothing was open. It kept one entry in the history while something was open, whatever the number of elements. How it did so was read in its code on 2026-11-21. Some of its elements added no entry, a menu or its "About" window among them, so that the back button left the app while they were open: a limit, which the product owner asked not to copy.

Features never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)), yet the elements that close belong to five of them.

## Decision

- **A new feature, `navigation`, with one ability, `close-what-is-open`.** Its use case is a stream function of three input streams, what each element reports about being open, the presses of the Escape key and the steps in the history, to the element to close ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). Its port is the history entry, which it adds and leaves.
- **The order is a rule of the domain**, a list of names: the "About" window, the map menu, the sheet of a spot, the list of a kind of places, the search. The element to close is the first of the list that is open, whatever the order they were opened in. A later element takes its place in the list.
- **Escape closes the element on top and nothing else.** One listener on the window replaces those of the elements, which no longer listen to the key: each one closes when it is asked to. The "About" window and the map menu, a modal dialog and a popover, are also closed by the browser itself; both ways close the same element, since they stand first in the order.
- **One history entry while something is open.** It is added when the first element opens, at the same address, through SvelteKit's shallow `goto`, as ADR-025 chose for the view. A second element adds none. When everything is closed another way, a close button or Escape, the app steps back once itself, and does not take that step for a press of the back button.
- **The back button closes the element on top.** A step in the history closes one element; if another one stays open, an entry is added again, so that the next press closes it too. Once nothing is open, the back button leaves the app.
- **Everything that opens is concerned**, the "About" window and the map menu included, on every page.
- **The history is changed one change at a time**: the port returns streams, and leaving an entry waits until it is added, `goto` being asynchronous.
- **A step in the history is a `popstate` that carries a state.** An address typed or pasted in the open tab comes without one: it closes nothing.
- **The address keeps the view after a step back.** The entry the app steps back to holds the address of the moment an element opened. `keep-view-in-url` gets a second input stream, the steps in the history, and writes the last view again on each of them.
- **The search is open while its panel is open or its field holds text.** Asked to close, it closes its panel, then clears its field, the two presses of Escape it already took; it says again that it is open when text is left.
- **Closing never takes the focus away from what the visitor is doing.** The list of a kind gives the focus back to its chip only when the focus was in the list; closing the sheet of a spot leaves the focus in a field the visitor types in. Otherwise closing the element on top would close the search panel under it, which closes when it loses the focus.

## Consequences

- Moving the map still adds no entry to the history.
- The app no longer marks its entry: the domain remembers whether it added one. After a reload, or after the forward button, the history may hold an entry the app no longer knows; one press of the back button then closes nothing before the next one leaves.
- A hash pasted into an open tab is still not followed until the page is reloaded, as ADR-025 states. The previous app followed it as a link; whether to do so is left to a later decision.
- With the Escape key, clearing the search field no longer opens its panel again.
- An element that opens later reports when it opens and closes when asked, and takes its place in the order; nothing else changes.
- The elements of the design library that open, the dialog button and the popover button, tell when they open and close when asked to.

## Alternatives considered

- **One history entry for each element open**: the back button needs no order of its own, but an element closed with its own button would leave its entry in the middle of the history, and the previous app kept one entry.
- **The mark of the entry in SvelteKit's page state**, read back after each step: SvelteKit updates the page state after the `popstate` event, asynchronously, so the mark read at that moment is the one of the entry just left.
- **The native `history.pushState`**: no asynchronous step, but SvelteKit's router keeps its own state in each entry and warns against it, as ADR-025 noted.
- **Each element keeps its own Escape listener, and the window's listener handles the rest**: less to change, but the element that holds the focus would close before the one on top.
- **The browser's `CloseWatcher`**: made for Escape and the back button, but it closes in the order of opening, not in the order asked for.
