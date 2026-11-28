---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Adapters translate external formats into a domain of value objects, and check what they read

## Context and Problem Statement

External data takes the shape of a standard ([0012](0012-the-shape-of-external-data-comes-from-a-standard.md)), and for places that standard is OpenStreetMap's tagging. Two ways of reading it grew side by side: one ability renamed a handful of contact keys into flat fields of its own, while others carried the tags as they come, a record of text keyed by OpenStreetMap's names, and read them in their domain. The domain then spoke OpenStreetMap: the meaning of a key, its spelling and its vocabulary of values sat in the rules, and a typing mistake in a key was a value missing rather than an error. Nothing checked what an adapter read: a malformed file of a source reached the screen.

A format is how data travels between a source and the app; it is not how the app thinks about a place. How should the domain be modelled, and where does a format end?

## Decision Drivers

- The domain holds only values that are valid by construction.
- A change of source, or of format, touches its adapter and nothing else.
- External data is checked once, where it enters, with the official definition of its format.
- The project never rewrites a standard ([0012](0012-the-shape-of-external-data-comes-from-a-standard.md)), and never takes over a vocabulary it does not use.

## Considered Options

- A domain of branded value objects and discriminated unions, into which adapters translate and check every external format
- OpenStreetMap's tags as the model of the domain, read raw by the rules
- OpenStreetMap's keys renamed one by one into flat fields of the domain
- A validation library of our own schemas, shared by the domain and the adapters

## Decision Outcome

Chosen option: « A domain of branded value objects and discriminated unions, into which adapters translate and check every external format », because it keeps formats at the boundary, as an anti-corruption layer, and gives the domain a model the compiler checks.

### Formats are for transfer, the domain has its own model

OpenStreetMap's tagging, like every other external format, is a format of transfer, not the model of the business. The domain is made of value objects, branded so that two values of the same primitive type are never mixed up, and of discriminated unions for every state, so that an incoherent combination of fields has no representation. Each value object is created by one constructor that checks it.

### Adapters translate, and only what the product uses

The adapter of a source is an anti-corruption layer: it translates the tags, keys and fields the product uses into the domain's values. A tag no ability uses is ignored, unknown tags included: the domain never carries a record of keys it does not understand. Using a new tag means adding its translation to the adapter, then the value it gives to the domain.

### Every external data is checked when read

An adapter checks everything it reads, against the official schema of its format, and with tests, before translating it. Data that fails the check does not enter the domain. The checks rely on the formats' own definitions, not on a set of schemas written by the project.

### Current state and target

Several domains read raw OpenStreetMap tags as a record of text, one renames contact keys into flat fields, and adapters check only part of what they read, field by field and by hand. One branded value object and many discriminated unions already exist. Target, tracked by #160 and a dedicated issue.

### Consequences

- Good, because a value of the domain has been checked, by construction, and the compiler refuses to pass one kind of value where another is expected.
- Good, because a change of source or of format, OpenStreetMap included, touches its adapter alone.
- Good, because a malformed file of a source is caught where it enters, rather than shown.
- Good, because the scenarios of an ability speak the language of the product rather than OpenStreetMap's keys.
- Bad, because each use of a tag costs a translation in the adapter and a value object in the domain, where a raw record cost nothing.
- Bad, because the domains that read raw tags, and the adapter that renames contact keys, must be rewritten before the rule holds.
- Neutral, because the fake data keeps OpenStreetMap's tags: it is a source like any other, read through the same adapters.

## Pros and Cons of the Options

### OpenStreetMap's tags as the model of the domain, read raw by the rules

No translation, and a real source tagged after OpenStreetMap read as it is. But the domain then depends on a format: keys spelled as text, values of a vocabulary the domain only partly knows, and no check that a key exists. It is the state that this decision ends.

### OpenStreetMap's keys renamed one by one into flat fields of the domain

Fields the compiler knows, but still text of OpenStreetMap's vocabulary under new names: half a translation, done for a few keys and not for the others, without value objects nor a check of what is read.

### A validation library of our own schemas, shared by the domain and the adapters

One tool to describe, check and type every value. But it puts a library of schemas at the centre of the domain, and its schemas would restate, in the project's own words, formats that already publish their definitions.

## More Information

### Where to find the detail

- [The abilities of the places, whose adapters read OpenStreetMap's tags](../../src/features/places/abilities/)
- [The fake places, tagged after OpenStreetMap](../../src/libraries/fake-places/)

### References

- [Anti-corruption layer, in Domain-Driven Design](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
- [Discriminated unions in TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [OpenStreetMap's map features](https://wiki.openstreetmap.org/wiki/Map_features)
- [0012: The shape of external data comes from a standard](0012-the-shape-of-external-data-comes-from-a-standard.md)

### History

- 2026-11-28, marc-gavanier: first writing.
