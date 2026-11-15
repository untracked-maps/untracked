# ADR-019 — Deterministic checks beyond linting

**Date**: 2026-11-15
**Status**: accepted

## Context

Types, Biome, the architecture rules and the tests leave a few kinds of mistakes unchecked. Each found something on the day it was tried: a missing French translation falls back to English without a warning; the fallback page that the static adapter wrote for unknown addresses had no title and no content without JavaScript; nothing read the French texts for spelling, nor the links between the decision records.

## Decision

- **Translations**: a test compares the keys of every locale's messages with the base locale's, and fails on a missing one.
- **French spelling**: cspell, with its French dictionary, reads `messages/fr.json`; typos reads the rest, in English.
- **Duplication**: jscpd fails on any clone of 50 tokens or more in `src` and `tests`. A duplication that decoupling abilities calls for is written differently or raised in review.
- **HTML**: html-validate checks every built page against the standard, accessibility and document presets. Subresource integrity is required on cross-origin resources only: it protects against a third party changing a file, and our own files come with the page. The formatting rules are left out, since Biome formats the sources.
- **The page for unknown addresses** is a prerendered `/404` route, written to `404.html` in every locale, with a title, a message and a link home, rather than the adapter's empty fallback. GitHub Pages serves it for any unknown address.
- **Links**: lychee checks the links of every Markdown file offline, including anchors, on each commit, and every link, external ones included, weekly in CI.
- **Unused step definitions**: Cucumber writes its usage report, and `src/libraries/cucumber-usage` fails when a step definition matches no scenario, which no other tool reports.

## Consequences

- A new locale needs its messages file and an entry in the translations test.
- Proper nouns of the project go to cspell's word list.

## Alternatives considered

- **The inlang linter** for translations: its rules with Paraglide 2 were not verified, and one test does the job.
- **Visual regression tests**: left until the interface has more than a greeting.
- **type-coverage, editorconfig-checker and size-limit**: redundant with strict types, Biome and the hooks, and Lighthouse's script budget.
- **A tool against comments**: none was found that tells comments from URLs reliably; the rule stays in `AGENTS.md`.
