---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Imports bounded by dependency-cruiser, with exceptions written per target

## Context and Problem Statement

The code is organised as features and abilities on a hexagonal core ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)): features and abilities never depend on each other, and each layer depends only on the layers it may reach. These rules hold only if a tool refuses every import that breaks them, cycles and indirect reaches included.

Two needs pull against the strictest rule. Many data shapes come from standards whose rules need a library to be read, such as opening hours or the contrast of colours; a domain that may import nothing but its stream library pushed toward rewriting the standard, or a part of it, in the app's own code. And some packages must stay in a few places only: a generator of fake data or a font compiler must never reach the browser, and a formatter of addresses belongs to the code that writes for the screen.

How are imports bounded, so that each zone allows only what is written, and each exception stays readable?

## Decision Drivers

- The strictest default: what is not written is refused.
- An exception as close as possible to what needs it: a named package, for named folders.
- Exceptions readable by a person, as data apart from the rules.
- A domain never rewrites a standard that a library implements.

## Considered Options

- dependency-cruiser, each zone forbidding by default, with exceptions written per target
- Biome's import restrictions
- dependency-cruiser, with exceptions written per folder, per feature or per layer
- A domain that imports only its stream library, standards read by adapters

## Decision Outcome

Chosen option: « dependency-cruiser, each zone forbidding by default, with exceptions written per target », because it sees the whole graph of imports, cycles and indirect reaches included, and an exception written for one package and its folders keeps a coupling visible without opening it to a whole layer.

### Zones, each the strictest possible

Everywhere: no cycle, no unresolved or undeclared package, no deprecated package, no test imported by code that is not one, no development dependency in code shipped to the browser. Routes import only what they compose. Features, abilities and their layers import only what the hexagonal core allows them. A library never imports a feature, a route or the configuration, and imports another library only as declared.

### A type import follows the same rules

A type import vanishes at run time but creates the same dependency of design: it is checked like any other.

### The domain imports only libraries that implement a standard

Besides its stream library, a domain may import a library that implements a standard, listed by name, so that a standard is never rewritten here. Each such library is added by the change that first needs it, with its reason. Any other package in a domain stays an error.

### Sensitive packages confined to named folders

A package that must stay in a few places is written once, as a target, with the exact folders allowed to import it. Today this holds for the generators of fake data and of build assets, kept in the folders that run at build time, for the server kit of the framework, kept in prerendered endpoints, and for the formatter of addresses, kept in presenters. The other packages that adapters and the interface import are allowed to their whole layer, and confining each sensitive one to its named folders is the target. Target, tracked by #146.

### Tests have the rights of what they test

Today tests are exempt from the rules of the layers, beyond the rules that keep each test on its own inputs. A unit test is to import only what the code it tests may import; integration and end-to-end tests are not concerned. Target, tracked by #146.

### Rules and exceptions apart, and every exception justified

The rules live apart from the lists of exceptions, which are data. A new exception comes with its reason in the message of its commit.

### Consequences

- Good, because every forbidden direction of the architecture fails on each commit and in CI, indirect reaches and cycles included.
- Good, because an exception is a line of data that says who imports what.
- Good, because a domain reads a standard through the library that implements it, and its rules stay in the domain and its scenarios.
- Bad, because a library in a domain is a dependency the domain's tests run against: its licence and its upkeep weigh on the domain.
- Bad, because every new sensitive package needs a line of exception before the code that uses it.
- Bad, because dependency-cruiser refuses some regular expressions it deems unsafe, so a rule is sometimes written in two patterns.
- Neutral, because whether a library really implements a standard is a judgement no tool checks.

### Confirmation

dependency-cruiser runs on each commit and in CI. Each new rule is proven by an import that breaks it on purpose.

## Pros and Cons of the Options

### Biome's import restrictions

Biome sees only the path imported, never the file that imports it: forbidding imports between features would need a rule per feature, and it sees neither cycles nor indirect reaches. It keeps the bans of whole families of packages, which do not depend on who imports them.

### dependency-cruiser, with exceptions written per folder, per feature or per layer

Per folder, exceptions grow into lines nobody reads. Per feature or per layer, a package allowed for one domain is allowed for every domain, which is what the rule meant to prevent.

### A domain that imports only its stream library, standards read by adapters

The domain stays free of packages, but rules such as « open now » would move out of it and out of its scenarios, or be rewritten here, partly, and translated to and from the real standard later.

## More Information

### Where to find the detail

- [The configuration of dependency-cruiser](../../.dependency-cruiser.ts)
- [Its rules and lists of exceptions](../../.dependency-cruiser/)
- [The bans of whole families of packages](../../biome.json)

### References

- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)
- [Its rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)

### History

- 2026-11-28, marc-gavanier: first writing.
