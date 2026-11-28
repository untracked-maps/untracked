---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# No logic in components or pages, only in presenters or in the domain

## Context and Problem Statement

Each ability holds a domain, adapters and an interface ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)), its use cases are stream functions ([0009](0009-abilities-are-rxjs-stream-functions-without-a-store.md)), and routes only wire ([0010](0010-only-entry-points-compose.md)). What the interface itself decides had no rule: how a value is worded or ordered for the screen, which item is shown, which state a control takes. Part of it lives in presenters, part in components and pages, and part in TypeScript files of the interface that are not filed as presenters.

A decision inside a component can be tested only by rendering it in a browser, which is slow and which mutation testing does not run in. A decision that nothing names is not found by the next reader either.

Where does a decision of the interface live, so that it is tested without a browser and found where its kind says?

## Decision Drivers

- Every decision is tested by unit tests, without a browser, and mutated.
- A component reads as markup: what it shows and what it forwards.
- The kind of a file says what it holds.
- The rule is checked by a tool where it can be, by review elsewhere, and holds without exception.

## Considered Options

- Decisions in presenters in plain TypeScript or in the domain, components and pages only rendering
- Decisions in components and pages, tested in a browser
- Presenters written as Svelte modules, with runes

## Decision Outcome

Chosen option: « Decisions in presenters in plain TypeScript or in the domain, components and pages only rendering », because a function in plain TypeScript is unit tested and mutated without a browser, and a component without decisions needs only its stories.

### Components and pages decide nothing

A component or a page renders what it receives and forwards what the visitor does. It filters, computes and chooses nothing: a presenter or the domain gives it what to show, already decided.

### What the interface decides is a presenter

A decision that belongs to the screen, such as the words of a state, the order of a list for display or the shape of an address in its country's format, is a presenter: a pure function in plain TypeScript, in the interface layer of its ability or feature, filed as a presenter. A TypeScript file of the interface that decides something becomes a presenter. The style settings of the map are data for the renderer, not decisions, and stay apart.

### What the business decides is in the domain

A rule of the business is in the domain, with its scenarios. The domain is pure: it receives the time as an input, and has neither default values nor exceptions.

### Current state and target

Today some decisions of the interface are presenters, while others still live in components, in pages and in TypeScript files of the interface that are not presenters. They move into presenters ability by ability, and a lint rule then keeps presenters in plain TypeScript. Target, tracked by #145. The purity of the domain, the time received as an input, without default values nor exceptions, is checked by review only, and lint rules are to check it. Target, tracked by #147.

### Consequences

- Good, because every decision is reached by unit tests and by mutation, without a browser.
- Good, because a component reads as markup, and its stories test only what it shows and forwards.
- Good, because the kind of a file tells a reader where a decision of the screen is.
- Bad, because a small decision needs a file and a test of its own, apart from the component that shows it.
- Bad, because what counts as a decision in markup, beyond what a tool detects, is a judgement of review.
- Neutral, because the move is done ability by ability, and the two ways coexist until it ends.

### Confirmation

dependency-cruiser keeps the packages that format for the screen in presenters. Until lint rules check components and presenters, review refuses a decision in a component or a page.

## Pros and Cons of the Options

### Decisions in components and pages, tested in a browser

No file apart, but every decision is tested by rendering a component in a browser, slower than a unit test, and out of reach of mutation testing, which runs without a browser.

### Presenters written as Svelte modules, with runes

Reactive state at hand, but the presenter depends on the compiler of the framework, mixes state with decision, and is no longer a plain function a unit test calls.

## More Information

### Where to find the detail

- [The features, with the presenters of their interfaces](../../src/features/)
- [The rule that keeps the address formatter in presenters](../../.dependency-cruiser/global.ts)

### References

- [Presentation Model, Martin Fowler](https://martinfowler.com/eaaDev/PresentationModel.html)

### History

- 2026-11-28, marc-gavanier: first writing.
