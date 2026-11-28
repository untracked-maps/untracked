---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Documentation generated with Starlight and published, never committed

## Context and Problem Statement

A document written by hand falls out of date as soon as the code moves on, and nothing tells. The architecture of the app is already stated by its own configuration and code: the dependency rules, the allowed folders, the imports between modules, the scenarios of each ability. The decisions are the only part written by hand, since they hold reasons that no code contains ([0001](0001-architecture-decisions-recorded-in-madr-and-checked-by-tools.md)). What can be generated is never committed ([0021](0021-assets-and-data-generated-at-build-never-committed.md)).

The documentation is generated today by a small tool of the project, which renders the dependency rules and the allowed folders as one page, beside the dependency graph that dependency-cruiser draws with Graphviz and the report of the scenarios that Cucumber writes. It is built in CI on each pull request and published with each release under the site. It has no navigation, no search, and does not show the decisions.

How should the documentation be produced, so that it never disagrees with the code, gathers what the repository knows in one place, and costs no development of its own?

## Decision Drivers

- Nothing written by hand that can drift: everything comes from the repository.
- A tool ready to use, which is configured rather than developed.
- Navigation, search and diagrams without design work.
- The sources, decisions and scenarios, stay as they are for their own tools.

## Considered Options

- Starlight, fed by a collection step, built and published with each release
- The tool of the project, kept and extended
- VitePress
- MkDocs Material
- Generated files committed and checked by a hook

## Decision Outcome

Chosen option: « Starlight, fed by a collection step, built and published with each release », because it is a maintained documentation generator that brings navigation, search and diagrams, reads Markdown as the decisions and scenarios are written, and leaves no tool of the project to maintain.

### Generated at each build, never committed

The documentation is generated from the repository at each build, and published with the release it comes from. CI generates it on each pull request, so that a broken generation fails before a release. No generated file is committed.

### Starlight gathers the decisions, the scenarios and the diagrams

Today the tool of the project renders the rules and folders, beside the dependency graph and the report of the scenarios. The target is a Starlight site that publishes the decisions, the scenarios and the diagrams of the architecture, fed by a step that collects them and gives them what the generator expects, without changing the sources; the tool of the project is then removed. Target, tracked by #142.

### Consequences

- Good, because the documentation cannot disagree with the code of the release it comes with: it is drawn from it.
- Good, because what the repository knows can be read in one place, with navigation and search.
- Good, because no documentation tool of the project remains to maintain once the target is reached.
- Bad, because the site adds a build dependency, and a step of the build to keep working.
- Bad, because it takes a release, or a local build, to read the documentation of a change.
- Neutral, because the repository is public, so the site shows nothing that the repository does not.

## Pros and Cons of the Options

### The tool of the project, kept and extended

Already in place, and under the same rules as the rest of the code. Navigation, search and the rendering of the decisions would all be developed and maintained here.

### VitePress

Renders Markdown without asking for a title in its front matter. The extension that draws diagrams is no longer maintained.

### MkDocs Material

Complete and widely used. It has moved to maintenance mode, its successor has no stable version yet, and it needs a Python environment in CI.

### Generated files committed and checked by a hook

Visible in the repository without a build. Generated content under version control, which a hook must keep in step with the code.

## More Information

### Where to find the detail

- [The tool of the project, until Starlight replaces it](../../src/libraries/architecture-docs/)
- [The build of the documentation in CI](../../.github/workflows/checks.yml)
- [The release that publishes it](../../.github/workflows/release.yml)

### References

- [Starlight](https://starlight.astro.build/)
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)
- [#142: replace the home-made documentation generator with Starlight](https://github.com/untracked-maps/untracked/issues/142)

### History

- 2026-11-28, marc-gavanier: first writing.
