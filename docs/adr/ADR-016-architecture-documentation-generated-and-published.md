# ADR-016 — Architecture documentation generated from the code and published, never committed

**Date**: 2026-11-15
**Status**: accepted

## Context

A document written by hand falls out of date as soon as the code moves on, and nothing tells. What can be generated must never be committed. The architecture of the app is stated by its own configuration and code: the dependency rules in `.dependency-cruiser.ts`, the allowed folders in `.folderslintrc`, the imports between modules, and the Gherkin scenarios of each ability.

dependency-cruiser draws the dependency graph (its `archi` output, rendered by Graphviz), and Cucumber writes its scenarios as an HTML report. No tool lists dependency-cruiser's rules or folderslint's folders as a document.

## Decision

- `pnpm docs:build`, after `pnpm build`, writes into `build/docs/`:
  - `index.html`, the rules with their reasons and the allowed folders, rendered by `src/libraries/architecture-docs`, a small tool written for this purpose, with its tests;
  - `dependencies.svg`, the graph of routes, features, abilities and libraries;
  - `features.html`, the Cucumber report of every ability's scenarios.
- The release publishes them with the app, under `/docs` of the site. The CI generates them on every pull request, so a broken generation fails before a release. The README links to them.
- Nothing generated is committed. The decision records stay written by hand in `docs/adr`: they hold reasons that no code contains.
- The tool is a library like any other, under the same rules. Its command line, `cli.ts`, is an entry point that nothing imports: it is the only exception to dependency-cruiser's `no-orphans` rule.

## Consequences

- The documentation can never disagree with the code of the release it comes with.
- It takes a release, or a local `pnpm build && pnpm docs:build` with Graphviz, to read it.

## Alternatives considered

- **Commit the generated files and check them in a hook**: visible in the repository, but generated content under version control.
- **Mermaid written by hand**: rendered by GitHub, but not generated, so it would drift from the code.
