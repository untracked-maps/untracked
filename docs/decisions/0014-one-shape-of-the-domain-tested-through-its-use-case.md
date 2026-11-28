---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# One shape of the domain, tested through its use case

## Context and Problem Statement

The logic of an ability lives in its domain, which receives its dependencies through ports ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)), and its use case is a stream function from its ports and input streams to its output streams ([0009](0009-abilities-are-rxjs-stream-functions-without-a-store.md)). Its values come from the adapters, translated and checked ([0013](0013-adapters-translate-external-formats-into-a-domain-of-value-objects.md)). These decisions say where the logic lives, not which form it takes inside the domain, nor how far its tests must reach.

Each domain had found its own form. Some use cases took their ports then an object of inputs, others read an input as a port; ports were declared in different places; a port's failure reached the domain as an error that the domain turned into a value itself. Tests often aimed at the small functions under a use case: a branch could be covered by a test of a helper while the use case that relies on it was never exercised, and nothing proved that every file of the domain was covered by its own tests.

Which form does a domain take, and how is it tested?

## Decision Drivers

- Any domain reads the same way, without learning its form.
- Every decision of the domain is checked through the value it returns, without mocks nor spies.
- A test fixes time or the failure of a port with a value, never with a trick.
- What a tool can check is checked by the tool, not by review.

## Considered Options

- One shape of the domain, tested through its use case, with doubles without logic and full coverage file by file
- Each domain free of its form, reviewed case by case
- Tests aimed at each function of the domain, the use case covered by the scenarios only

## Decision Outcome

Chosen option: « One shape of the domain, tested through its use case, with doubles without logic and full coverage file by file », because a single form makes every domain readable and testable from the top, and the coverage of each file by unit tests proves that every branch answers to an assertion.

### A pure domain

The domain reads no clock: the present comes as an input, as a stream when it changes. It holds no default value, neither for a port nor for an input: what the entry point can set is an input, anything else a constant of the domain. It throws no exception: an outcome the domain expects, such as a refused permission or a source that cannot be reached, is a value it returns. No lint rule checks it yet. Target, tracked by #147.

### Tested through the use case

The unit tests of a domain exercise it through its highest entry point: the use case, otherwise the exported function or constructor. The doubles of ports are written by hand and hold no logic: a fixed value, a stream given by the test, or the identity.

### Every file of the domain covered by its own unit tests

The domain, the presenters and the logic of the libraries are covered entirely by unit tests alone, file by file, in lines, branches, functions and statements; a branch that only another suite reaches is not covered. Today the threshold applies to the code as a whole, and the component tests count toward it. Target, tracked by #144.

### Consequences

- Good, because every domain reads the same way, and a difference shows in review as in the tools.
- Good, because each decision is checked by the value it returns, which makes tests of internal helpers unnecessary.
- Good, because a test that fixes the time or makes a port fail needs only a value.
- Good, because a branch that no unit test reaches blocks the change that adds it.
- Bad, because full coverage forces a test for every defensive branch, or its removal.
- Bad, because every expected failure must become a value, in the port or the domain, where an error once sufficed.
- Bad, because the existing domains must be put in this form before the lint rules that check it can be turned on.

### Confirmation

The coverage thresholds of the unit test runner check that every file is covered. The lint rules check, in the domain, the absence of clock, default value and thrown exception, and, in its tests, the absence of mocks, spies, loops and conditions.

## Pros and Cons of the Options

### Each domain free of its form, reviewed case by case

No rewriting. But every review rediscovers a form, no tool can check a rule that does not exist, and a decision that leaves through a port without coming back in a value can only be checked by spying on the call, which the testing strategy excludes.

### Tests aimed at each function of the domain, the use case covered by the scenarios only

Small tests close to the code. But a branch reached only by a scenario is not checked by an assertion on its value, and the coverage of helpers says nothing of the use case that composes them.

## More Information

### Where to find the detail

- [The abilities and their domains](../../src/features/)
- [The coverage thresholds of the test runner](../../vite.config.ts)
- [The lint plugins on tests and the domain](../../.grit/)

### References

- [0006: Features and abilities on a hexagonal core](0006-features-and-abilities-on-a-hexagonal-core.md)
- [0009: Abilities are RxJS stream functions, without a store](0009-abilities-are-rxjs-stream-functions-without-a-store.md)
- [0010: Only entry points compose, through routes that only wire](0010-only-entry-points-compose.md)
- [0013: Adapters translate external formats into a domain of value objects, and check what they read](0013-adapters-translate-external-formats-into-a-domain-of-value-objects.md)
- [Vitest, coverage thresholds](https://vitest.dev/config/coverage.html)
- [Biome, GritQL plugins](https://biomejs.dev/linter/plugins/)

### History

- 2026-11-28, marc-gavanier: first writing.
