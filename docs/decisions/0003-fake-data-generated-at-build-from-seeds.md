---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Fake data generated at build from seeds, until a real source replaces its adapter

## Context and Problem Statement

The app reads its data from outside, behind ports ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)), but the real sources of places, addresses, positions and departures are not chosen yet. The abilities still need data to settle their shape, to be shown and to be tried: a position for the visitor, thousands of places to search, their addresses, opening hours, photos, the departures of a station.

The first ability that needed such data used a generator of fake data, seeded and run at build time only. The next ones needed far more, and the same places for several abilities. Each time a kind of fake data was added, the values already generated could shift, and with them what other abilities showed.

How does the app get the data it needs before a real source exists, without weighing on the browser and without changing what is already in use?

## Decision Drivers

- The browser receives data, never the code that invents it.
- The same build gives the same data, so that the app and its measures do not change between builds.
- Adding a kind of fake data never changes the data already in use.
- A real source replaces the fake one by an adapter, without touching a use case.

## Considered Options

- A library of the project that generates seeded fake data at build time, read through the abilities' ports
- A generator of fake data run in the browser
- Fake data generated in an in-memory adapter of each ability
- Fake data written by hand and committed

## Decision Outcome

Chosen option: « A library of the project that generates seeded fake data at build time, read through the abilities' ports », because it gives every ability the same data, costs the browser nothing but the data, and goes away with its adapter when a real source arrives.

### A generator at build time only

A library of the project generates the fake data with Faker. It runs at build time only, and the data is written into the static files of the site. The dependency rules allow Faker in that library and in in-memory adapters, and in no code shipped to the browser.

### Seeded, one seed per kind of data

Every generation starts from a fixed seed, so that the same build gives the same data. Each new kind of fake data has its own seed: adding a kind, or changing how one kind is made, never changes the values of the others, already used elsewhere.

### A zone as a setting

The generator knows no city: a zone describes where data is generated, and the configuration chooses it. A dependency rule forbids the generator to reach a zone itself.

### Behind the ports, until a real source

The abilities read the fake data through the same ports as a real source would. Fake services, such as the departures of a station, are adapters too. When a real source lands, its adapter replaces the fake one; the generator and its files go once no ability uses them.

### No test reads the fake data

Each test writes its own inputs. A dependency rule forbids any test but the generator's own to read the fake data or Faker, so that a change of the fake data never changes what a scenario means.

### Consequences

- Good, because every ability works, is shown and is tried before a real source exists.
- Good, because the browser downloads data only, and only when an ability asks for it.
- Good, because a new kind of fake data leaves the data already in use untouched.
- Bad, because the app is a demonstration until real sources land: what it shows is invented.
- Bad, because a change of the generator's own locale data changes the generated values; only the generator's tests see it.
- Neutral, because the content of the fake data is chosen by each change that needs it, and checked by no rule.

### Confirmation

dependency-cruiser keeps Faker out of shipped code and out of every test but the generator's, and keeps zones out of the generator. The generator's tests pin its output.

## Pros and Cons of the Options

### A generator of fake data run in the browser

No build step, but its code would weigh on every page that needs data, for data that never changes.

### Fake data generated in an in-memory adapter of each ability

What the first ability did. The data would belong to one ability, while several abilities need the same places, and each would grow its own generator.

### Fake data written by hand and committed

Nothing to generate, but thousands of values cannot be written by hand, and what can be generated is never committed.

## More Information

### Where to find the detail

- [The generator of fake data](../../src/libraries/fake-places/)
- [The zone chosen](../../src/configuration/)
- [The dependency rules on Faker and the fake data](../../.dependency-cruiser/)

### References

- [Faker](https://fakerjs.dev/)
- [Faker's seeds](https://fakerjs.dev/guide/usage.html#reproducible-results)

### History

- 2026-11-28, marc-gavanier: first writing.
