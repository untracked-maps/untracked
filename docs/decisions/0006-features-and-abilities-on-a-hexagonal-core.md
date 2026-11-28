---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Features and abilities on a hexagonal core

## Context and Problem Statement

The previous app had about a hundred and thirty modules side by side in one folder, the addresses of its providers written in the modules that used them, and no ports, although its own instructions required them. The app reads its data from outside, behind ports ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)), so every source needs a place for its port and its adapter, apart from the rules that use them.

La Coop de la médiation numérique, a larger code base of the same maintainer, organises its code by feature and use case on a hexagonal core: a feature holds layers shared by its abilities, each ability is a vertical slice with the same layers, and abilities never depend on each other, preferring duplication to coupling. Two other projects enforce the same layout with tools.

How is the code organised, so that a rule, a source or a screen can change without the others?

## Decision Drivers

- A business rule is read, tested and changed in one place, apart from the techniques that serve it.
- A source of data is replaced by an adapter, without touching a rule.
- One ability changes without breaking another.
- The structure holds by tools, not by review.

## Considered Options

- Features and abilities on a hexagonal core, without barrel files
- Modules side by side, grouped by technical kind
- The layout of la Cartographie nationale, with folders for keys, injection, queries, presenters and shared interface
- Features that expose a public index to other features
- Features and abilities with a barrel file for each feature, ability and layer

## Decision Outcome

Chosen option: « Features and abilities on a hexagonal core, without barrel files », because a vertical slice keeps each rule beside its ports, its adapters and its interface, and the hexagon keeps the rules free of the techniques that serve them.

### Features hold abilities, as vertical slices

A feature is a business area; an ability is one thing the visitor can do in it. Each ability holds three layers: a domain, with its model, its ports and its use cases; an implementation, with one folder of adapters per technique; and an interface, with its components and pages. A feature holds the same layers for what its abilities share. Its scenarios live beside the ability they specify.

### The domain is the centre

The domain depends only on itself, on its feature's domain, and on the few packages allowed to it by name. Adapters implement the domain's ports with libraries and packages. The interface renders the domain and never reaches an adapter: it receives what the adapters produced, through the use cases.

### No dependency between features, nor between abilities

A feature never depends on another feature, and an ability never depends on another ability; the root of a feature never depends on its abilities. Code shared by several abilities moves up to the feature, under the same layer. Where moving up would couple two business areas, duplication is preferred.

### Libraries and configuration stand apart

Libraries hold technical code shared by features, and know no feature. The configuration holds the settings of the app. Neither depends on features; the entry points, and only them, bring features, libraries and configuration together.

### Modules are imported directly

No barrel file: a module is imported by its own path. Importing one name from a file that re-exports a folder makes the bundler fetch and transform every file it re-exports, which slows the development server and the tests more with each ability. Boundaries rest on dependency rules, not on index files.

### Every module is reachable

Every module is reachable from an entry point. A module that only its own test uses is dead code.

### Changes to the structure go ability by ability

A change of structure is carried out vertically, one ability at a time, and the former code is removed only once its replacement works.

### Consequences

- Good, because a business rule lives in one domain, with its scenarios, and is tested without a browser or a network.
- Good, because a source of data is replaced by writing an adapter, the use case unchanged.
- Good, because abilities change independently, and a feature can be removed without searching the others.
- Bad, because a screen that combines several features needs a place to combine them, outside every feature.
- Bad, because duplication between abilities is accepted, and kept in step by hand.
- Neutral, because the number of folders grows with each ability, whatever its size.

### Confirmation

dependency-cruiser checks the dependency rules, cycles and unreachable modules included, and folderslint checks the layout of every file the repository tracks, on each commit and in CI. Biome forbids barrel files and re-exports of a whole module.

## Pros and Cons of the Options

### Modules side by side, grouped by technical kind

The previous app's layout. Nothing told a rule from a technique, sources were reached from screen code, and a change crossed many modules.

### The layout of la Cartographie nationale, with folders for keys, injection, queries, presenters and shared interface

A proven layout, but la Coop does without these folders on a larger code base, and a shared interface folder couples abilities to each other.

### Features that expose a public index to other features

La Coop lets features meet through such an index and anti-corruption ports. It was set aside so that features only meet where the app is composed, never in each other.

### Features and abilities with a barrel file for each feature, ability and layer

Chosen first, as la Coop does, then dropped: importing through a barrel makes the bundler transform every file it re-exports, a cost that grows with each ability, while the boundaries need dependency rules anyway.

## More Information

### Where to find the detail

- [The features and their abilities](../../src/features/)
- [The dependency rules](../../.dependency-cruiser.ts)
- [The layout of the folders](../../.folderslintrc)

### References

- [Hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Vite's performance guide, on barrel files](https://vite.dev/guide/performance#avoid-barrel-files)
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)
- [folderslint](https://github.com/denisraslov/folderslint)

### History

- 2026-11-28, marc-gavanier: first writing.
