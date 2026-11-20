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

## Update, 2026-11-20: each test writes its own inputs

Five abilities' scenarios and two adapters' acceptance tests read the fake Paris ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)): a scenario said "Given the places of the fake Paris", and its outcome, such as the first of seven namesakes, depended on 2,036 generated places that no reader could see. A test now writes the inputs that show its case, in the scenario's tables or in the test itself, and nothing else.

- dependency-cruiser's `tests-without-fake-data` rule forbids a test to import the fake places or Faker; only the fake places' own library tests them.
- Its `tests-read-only-their-own-json` rule lets a test read only the JSON files of its own folder, the data it tests, never a data set shared with other tests. The check of the translations, which reads every locale, is the one exception, named in the rule.
- A rule that needs many inputs, such as "at most seven places", says how many in its step, which builds them.

## Update, 2026-11-20: the trace of a failing component test is kept

Component tests failed now and then on a local push, each time a click followed by an assertion on what it caused, and never twice the same way; no run reproduced them on demand. Vitest now keeps Playwright's trace of a failing component test, in `.vitest/traces`, outside `src`, and CI keeps those traces for seven days, so that the next failure shows where the click landed instead of being retried.

## Update, 2026-11-20: the pointer is parked before each component test

Component tests failed now and then, in the full suite only. Playwright has one mouse per page, and the test files run one after another in that page's frames: the pointer stayed where a previous test clicked, and a component drawn under it took its `:hover` style. The suggestion's hover shares the active background, so "blends in the panel otherwise" failed three runs out of four on one branch, and a deliberate hover reproduced the same error. Before each component test, `vitest.browser-setup.ts` now calls a Vitest browser command, `parkPointer`, declared in `vite.config.ts`, which moves Playwright's mouse outside the page; the same branch then passed four runs out of four. The module augmentation that types the command needs an `interface`, so Biome's `useConsistentTypeDefinitions` is off for that file only.
