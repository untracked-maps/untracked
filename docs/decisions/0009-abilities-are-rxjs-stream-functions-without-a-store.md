---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Abilities are RxJS stream functions, without a store

## Context and Problem Statement

Each ability holds its use cases in its domain, behind ports ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)). The previous app kept its screen state in about a hundred and thirty variables, exposed through one hand-written object of getters and setters that every module read and changed. Store libraries replace that with a global union of actions, a reducer, effects and selectors: more ceremony than this app needs.

The interactions of a map are streams: a query typed letter by letter, where only the latest answer matters; a sheet that loads what it shows while another may open; departures asked again while a sheet stays open, and not while the page is hidden. Some rules depend on the time of day, such as whether a place is open now, and must not depend on the clock of the machine that runs the tests.

What shape does a use case have, where does the state of the app live, and how does a rule receive the time?

## Decision Drivers

- A use case is pure given its ports and its inputs, and tested without network, browser or real clock.
- Asynchronous flows, cancellation of a stale request included, are written once, in the domain.
- No global state that every module reads and changes.
- The time and the visibility of the page are inputs like any other, shared by the abilities that need them.

## Considered Options

- RxJS stream functions without a store, the clock and the page's visibility as input streams
- Svelte stores or runes as the state container
- A global store, with a union of actions and a reducer
- Stream functions that read the clock with timers of their own

## Decision Outcome

Chosen option: « RxJS stream functions without a store, the clock and the page's visibility as input streams », because RxJS expresses cancellable asynchronous flows directly, an observable is what Svelte components already subscribe to, and a clock given as a stream makes every rule that depends on time testable with plain values.

### A use case is a function of streams

An ability's use case is a function from its ports and its input streams to its output streams, written in its domain. Ports are function types that return observables, which adapters implement. A failure an ability expects, such as a refused permission or a source that cannot be read, is a value of its output, not an error.

### No store

There is no global state, no store and no type of action. The state of the app is the set of streams the abilities expose; components subscribe to them directly, since an RxJS observable fulfils Svelte's contract for stores. Store libraries are banned by the linter.

### The clock is an input stream

A rule that depends on the time receives it as an input stream, which an adapter reads from the device and the entry point passes in. The same clock can feed several abilities, and a test gives the times it needs as values.

### The visibility of the page is an input stream

Whether the page is shown is an input stream too, read by an adapter of the browser, so that an ability stops asking for what nobody sees, and asks again once the page is shown.

### Events of every frame stay in the renderer

Events that fire at every frame, such as each step of a move of the map, stay in the renderer: abilities receive their outcome, such as the end of a move.

### Consequences

- Good, because use cases are pure given their ports and inputs, and tested deterministically.
- Good, because a stale request is cancelled by the stream itself, never by hand.
- Good, because a rule that depends on the time is tested at any hour, in any time zone, without changing the clock of the machine.
- Bad, because RxJS is a dependency of every domain, and its operators must be known to read a use case.
- Bad, because shared streams need care, replayed and deduplicated, so that components do not recompute on every event.
- Neutral, because the state of a screen is spread over the streams of its abilities, never gathered in one object.

### Confirmation

The dependency rules allow RxJS in every domain. Biome bans store libraries. The scenarios of each ability play its use case with in-memory ports and times given as values.

## Pros and Cons of the Options

### Svelte stores or runes as the state container

They hold values, not cancellable asynchronous flows, and they would tie the domain to the framework of the interface.

### A global store, with a union of actions and a reducer

Redux, NgRx, or a reduction over one global stream of events: each brings back the union of actions and the reducer, a central object every ability would depend on.

### Stream functions that read the clock with timers of their own

Simpler at the entry point, but the rates and the moments would be tested with virtual time only, and the clock could not be shared between abilities, such as a refresh and a countdown.

## More Information

### Where to find the detail

- [The use cases of each ability](../../src/features/)
- [The ban of store libraries](../../biome.json)

### References

- [RxJS](https://rxjs.dev/)
- [Svelte's store contract](https://svelte.dev/docs/svelte/stores#Store-contract)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

### History

- 2026-11-28, marc-gavanier: first writing.
