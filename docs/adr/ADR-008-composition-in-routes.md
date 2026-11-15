# ADR-008 — Composition happens in routes

**Date**: 2026-11-15
**Status**: accepted

## Context

Features never depend on each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)), yet a screen often combines several of them, and every ability needs adapters for its ports.

## Decision

SvelteKit routes are the only place where features meet and where adapters are given to abilities. A route imports the modules it needs from features and abilities, through the `#features/*` subpath imports, passes adapters to use cases by plain function application, without a dependency injection container, and renders pages from the features with the resulting streams as props. `configuration/` holds application settings only, such as the base URLs of external services.

## Consequences

- Routes stay thin: they wire, they hold no business logic and no presentational markup beyond the layout.
- A component never reaches an adapter: it receives streams.

## Alternatives considered

- **A composition root in `configuration/`**: one more place to look, and routes still have to pick what they render.
- **piqure**, the dependency injection library of la Coop and ihexa: unnecessary when routes apply functions to adapters.
