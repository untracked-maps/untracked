# ADR-006 — Features and abilities on a hexagonal core

**Date**: 2026-11-15
**Status**: accepted

## Context

The previous app had 130 modules side by side in `src/lib`, provider URLs written in the modules that used them, and no ports, although its own instructions required them.

La Coop de la médiation numérique organises a larger code base (20 features, 157 abilities) by feature and use case on a hexagonal core: a feature holds a `domain`, an `implementation` and a `ui` shared by its abilities, each ability is a vertical slice with its own `domain`, `implementation` and `ui`, and abilities never depend on each other, preferring duplication to coupling. la Cartographie nationale and ihexa enforce the same layout with dependency-cruiser and folderslint.

## Decision

The layout, enforced by folderslint (`.folderslintrc`) over every file git tracks or would track, so that no folder escapes it, inside `src` or at the root of the repository:

```text
.github/actions/<action>/  .github/workflows/  .vscode/
docs/adr/  messages/  project.inlang/  static/  tests/e2e/
src/
  routes/                         thin pages, the only composition point
  configuration/                  application settings
  libraries/<library>/            shared technical code
  features/<feature>/
    domain/                       model and ports shared by the abilities
    implementation/<adapter>/     adapters shared by the abilities
    ui/components/  ui/pages/
    abilities/<ability>/
      <ability>.ability.md        Gherkin scenarios
      <ability>.steps.ts
      domain/                     ports, pure functions, stream functions
      implementation/<adapter>/   adapters
      ui/components/  ui/pages/   presenters as *.presenter.ts
```

The rules, enforced by dependency-cruiser (`.dependency-cruiser.ts`), every one an error:

1. A feature never depends on another feature.
2. An ability never depends on another ability. Code shared by abilities moves up to the feature, under the same folder name.
3. The feature root never depends on its abilities.
4. A `domain` depends only on itself, on its feature's `domain` for an ability, and on `rxjs` ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). No other package.
5. An `implementation` depends on its domain, on its feature's `domain` and `implementation`, on libraries and on npm packages.
6. A `ui` depends on its domain, on its feature's `domain` and `ui`, on libraries, on translations and on npm packages, never on an adapter.
7. Features never depend on routes or configuration. Routes import the modules they need from features and abilities ([ADR-008](ADR-008-composition-in-routes.md)).
8. Libraries never depend on routes, configuration or features, and depend on each other only as declared in `LIBRARY_DEPENDENCIES`, empty to begin with.
9. Every module is reachable from an entry point: a route, a hook, a configuration file or a command line tool. A module only its own test uses is dead code.
10. No cycles, no orphans, no deprecated, undeclared or unresolvable package, no dependency on a test file, and no development dependency in code shipped to the browser.

Tests are exempt from the layer rules.

## Consequences

- No package is allowed by name in a layer, except `rxjs` in domains. A library gets an exception only when a change needs it, with the reason in the commit.
- `pnpm lint:architecture` runs both tools, in the commit hook and in CI.

## Alternatives considered

- **`keys/`, `injection/`, `query/`, `presenter/` and `ui/shared/` folders** from la Cartographie nationale: la Coop does without them on a larger code base, and `ui/shared/` couples abilities.
- **A feature's `index.ts` as a public API for other features**, as la Coop allows through anti-corruption ports: rejected, so that features only meet in routes.
- **An `index.ts` re-exporting each feature, ability and layer**, as la Coop does: chosen first, then dropped on 2026-11-15. Importing one name from such a barrel file makes Vite fetch and transform every file it re-exports, which slows the dev server and the tests ([Vite performance guide](https://vite.dev/guide/performance)), and the cost grows with each ability. Modules are imported directly, and Biome's `noBarrelFile` and `noReExportAll` forbid barrels. The boundaries do not rest on `index.ts` files but on dependency-cruiser's rules.

## Update, 2026-11-20: libraries that implement a standard

Rule 4 now allows, besides `rxjs`, the libraries that implement a standard, listed by name in `DOMAIN_PACKAGES` in `.dependency-cruiser.ts`, so that a domain never rewrites a standard ([ADR-039](ADR-039-standards-first-and-their-libraries-in-the-domain.md)). Any other package in a domain stays an error.
