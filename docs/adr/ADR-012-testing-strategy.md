# ADR-012 — Testing strategy

**Date**: 2026-11-15
**Status**: accepted

## Decision

- **Vitest** runs unit tests in Node (`*.spec.ts`) and component tests in a real Chromium through its browser mode (`*.svelte.spec.ts`), with v8 coverage, which must stay at 100 % of lines, branches, functions and statements. Tests run in a random order, so that one never depends on another, and a focused test or an empty suite fails.
- **fast-check** adds property tests on domains, with the first ability.
- **Cucumber** runs the Gherkin scenarios of each ability, written in `<ability>.ability.md` with their steps in `<ability>.steps.ts`.
- **Playwright** runs end-to-end tests on the built site, with **axe-core** for accessibility (WCAG 2.2 AA). A failing test is never retried, a focused test fails in CI, and the trace of a failure is kept.
- **StrykerJS** mutates TypeScript and Svelte files and runs Vitest against each mutant, weekly in CI; no mutant may survive (threshold 100 %). Its TypeScript checker sets aside the mutants that do not compile, rather than counting them as killed. Stryker is declared as a plugin explicitly, because pnpm's strict layout hides it from Stryker's default lookup. Its [Svelte support](https://stryker-mutator.io/docs/stryker-js/guides/svelte) uses the installed compiler.
- **Lighthouse CI** audits the built pages: performance 0.95 or more, accessibility, best practices and SEO at 1, total blocking time under 100 ms, largest contentful paint under 1.5 s, layout shift under 0.05 and scripts under 120 kB. Lighthouse measures in the lab: interaction to next paint is only measurable on real users, so total blocking time stands in for it.

Tests use no mocks or spies: they pass fakes for ports and observe returned values, with one assertion each and no loop or branch in their body.

## Consequences

- Locally, Lighthouse needs a Chrome that Ubuntu's AppArmor lets sandbox: `CHROME_PATH=/usr/bin/google-chrome pnpm test:lighthouse`.
