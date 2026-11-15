# ADR-007 — Abilities are RxJS stream functions, without a store

**Date**: 2026-11-15
**Status**: accepted

## Context

The previous app kept its screen state in about 130 variables exposed through one hand-written object of getters and setters, which every flow module read and changed. Store libraries such as Redux or NgRx replace that with a global action union, a reducer, effects and selectors: more ceremony than this app needs.

The interactions of a map are streams: a search query typed letter by letter, where only the latest answer matters; a route recomputed when its end points move; live departures. RxJS expresses them directly (`debounceTime`, `switchMap` cancelling the previous request), and its `TestScheduler` tests them deterministically.

## Decision

- An ability's use case is a function from its ports and input streams to its output streams, written in the ability's `domain`:

  ```ts
  export const searchPlaces =
    (ports: { findPlaces: FindPlaces }) =>
    (query$: Observable<Query>): Observable<SearchResult> =>
      query$.pipe(debounceTime(250), distinctUntilChanged(), switchMap(ports.findPlaces));
  ```

- Ports are function types returning observables. Adapters in `implementation/` implement them.
- There is no global state, no store and no action type. The state of the app is the set of streams the abilities expose; Svelte components subscribe to them directly, since an RxJS observable fulfils Svelte's store contract.
- High-frequency events (map moves, position, compass) go straight to MapLibre, outside the abilities' streams.
- `rxjs` is the only package a `domain` may import ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)). It is added with the first ability.

## Consequences

- Use cases are pure given their ports, and tested with marble diagrams, without network or clock.
- Shared streams use `shareReplay({ bufferSize: 1, refCount: true })` and selectors `distinctUntilChanged`, so that components do not recompute on every event.

## Alternatives considered

- **Svelte stores or runes as the state container**: they hold values, not cancellable asynchronous flows.
- **Redux-style `scan` over a global event stream**: it brings back the action union and the reducer.
