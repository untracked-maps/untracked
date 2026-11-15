# ADR-002 — A fresh repository under untracked-maps

**Date**: 2026-11-15
**Status**: accepted

## Context

The previous organisation, `UntrackedMaps`, belongs to a suspended account. Its repository carried 233 branches and an 811 MB `gh-pages` history, a JavaScript code base without strict types, and screen state held in one mutable object shared by 35 files.

GitHub's [Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service) allow "no more than one free Account" per person (B.3) and do not otherwise address suspended users; GitHub "reserves the right to refuse service to anyone for any reason at any time" (M.3).

## Decision

Start a new repository, `untracked-maps/untracked`, from an empty project generated with the official Svelte CLI, in an organisation owned by an account in good standing. The old code is neither imported nor kept in history; it stays archived outside GitHub and serves as a reference when a feature is rebuilt.

## Consequences

- Nothing of the old repository's weight, branches or workflows comes along.
- Features are rebuilt one at a time on the architecture of [ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md), test first.
- The owner of the suspended account joins the organisation only once that account is restored, and creates no second account.

## Alternatives considered

- **Refactor the old repository in place.** It keeps every feature working at each step, but the shared state object and the missing types make each step large, and the history carries the data that triggered the suspension.
- **Rewrite `main`'s history into the new organisation.** It keeps authorship, but none of the old code survives the new architecture.
