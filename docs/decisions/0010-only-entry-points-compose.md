---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Only entry points compose, through routes that only wire

## Context and Problem Statement

Features and abilities never depend on each other ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)), and each use case is a function of its ports and input streams ([0009](0009-abilities-are-rxjs-stream-functions-without-a-store.md)). Yet a screen combines several features, every ability needs adapters for its ports, and some rules involve several abilities at once: which element closes first, what a touch on the map does, how the map frames what was opened, which notice is shown.

The routes of the framework were the only place where features met. As the home page grew with each ability, its files reached the linter's limit of lines per file; code was moved out to fit, and modules beside the route were then allowed, which wire only. Those modules multiplied, and some of them gathered combinations of streams that decide something, away from any domain. This record reverses that allowance.

Where are the app's parts assembled, and what may the place that assembles them hold?

## Decision Drivers

- No dependency between features, nor between abilities: the rule of the hexagonal core does not bend.
- Composition may cross as many features as a screen needs.
- A rule is read in its domain, with its scenarios, never in a file of wiring.
- An entry point says, in one place, what it assembles.

## Considered Options

- Only entry points compose; the route only wires, and the page lives in a feature
- Modules beside a route, which wire for it
- A composition root of its own, in the configuration or in a folder at the root
- A dependency injection library
- Svelte's context
- One feature that knows the states of the others

## Decision Outcome

Chosen option: « Only entry points compose; the route only wires, and the page lives in a feature », because it is the principle of the composition root, each entry point being its own, and it leaves no intermediate file where logic could settle.

### The entry points are the only composition roots

The app is assembled only at its entry points: routes, their layouts and their loading functions, prerendered endpoints, hooks, command-line tools, the steps of scenarios and the tests. An entry point imports the use cases, adapters and pages it needs from features, applies each use case to its adapters by plain function application, and passes the resulting streams and functions to the page. A feature provides ports, domains, adapters and interfaces; it assembles nothing.

### No dependency injection library, no Svelte context

Adapters are given by function application, never through a container of dependencies nor through Svelte's context. A component never reaches an adapter: it receives streams and functions as properties.

### The route only wires

A route holds no rule and no markup of its own: it applies use cases to adapters, plugs the output of one ability into the input of another, and hands everything to the page of a feature. A signal from the interface, such as the end of a move of the map, passes through the route without logic. Since a route only wires, its length follows the number of abilities it assembles, and the linter's limit of lines per file does not apply to it.

### The page lives in a feature, with slots

The component of a page lives in a feature, and receives what other abilities or features show through slots, which the route fills, so that two abilities show together without importing each other. The properties of a page are grouped into objects of the domain rather than passed one by one.

### No module beside a route

A route imports no other file of the routes, its own folder included. What a module beside it would hold is either wiring, which belongs to the route, or a rule, which belongs to a domain.

### A rule between abilities is an ability of its own

When a rule involves several abilities, it is the use case of an ability of its own, which takes as inputs what the others expose in the terms of their domains, such as coordinates or what is open, never the shape of their states. The route plugs them together.

### Current state and target

Today the home route holds its page's markup, imports modules beside it that wire part of the page and combine some streams, and keeps within the linter's limit of lines. The page moves into a feature with slots, the modules beside the route go, a dependency rule forbids them, and the limit of lines is lifted for routes, ability by ability. Target, tracked by #157.

### Consequences

- Good, because composition crosses as many features as a screen needs, without any feature importing another.
- Good, because each entry point says, in one place, what it assembles, and each rule stays in a domain with its scenarios.
- Good, because a test composes an ability with its fakes as a route composes it with its adapters.
- Bad, because the same wiring is repeated from one entry point to another, and a change of signature spreads to all of them.
- Bad, because the route of a rich page grows long, a length no limit of lines watches any more.
- Neutral, because the route still depends on the framework's loading functions, which decide when the wiring runs.

### Confirmation

dependency-cruiser refuses that a feature imports another, an ability another, or a feature a route, and refuses that a route imports a file of another route. Review checks that a route holds no logic, until a rule can.

## Pros and Cons of the Options

### Modules beside a route, which wire for it

They let the home page be split without moving more code into features. But they are a second place of composition, and they gathered combinations of streams that decide something, away from any domain and its scenarios.

### A composition root of its own, in the configuration or in a folder at the root

One more place to look, which knows every feature at once and becomes a second domain, while routes still have to pick what they render.

### A dependency injection library

The library of la Coop and of other projects of the maintainer. Unnecessary where entry points apply functions to adapters, and a key resolved at run time is checked by no import.

### Svelte's context

It would let a component reach what a distant ancestor gave it, out of sight of the properties and of the dependency rules.

### One feature that knows the states of the others

No rule would change, but it ties features together, and the map or a sheet would depend on the shapes of other features.

## More Information

### Where to find the detail

- [The routes](../../src/routes/)
- [The abilities that hold rules between abilities](../../src/features/navigation/abilities/)
- [The dependency rules of routes and features](../../.dependency-cruiser/)

### References

- [Mark Seemann, Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)
- [Snippets in Svelte](https://svelte.dev/docs/svelte/snippet)

### History

- 2026-11-28, marc-gavanier: first writing.
