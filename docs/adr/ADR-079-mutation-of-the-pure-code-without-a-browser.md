# ADR-079 — Mutation of the pure code, without a browser

**Status**: proposed
**Date**: 2026-11-28
**Decision-makers**: the maintainer

## Context and Problem Statement

StrykerJS mutates the TypeScript and Svelte files and runs every Vitest test against each mutant, the component tests in Chromium included ([ADR-012](ADR-012-testing-strategy.md)); the weekly run reuses the incremental report that a cache keeps between runs ([ADR-011](ADR-011-prek-hooks-and-conventional-commits.md)). Under Stryker's load, the browser made the results untrustworthy: a tracing error of Playwright, or a click lost in Chromium, failed a test, and Stryker counted the mutant as killed when no assertion had seen it. The initial run went past Stryker's timeout, and the weekly run past the thirty minutes of its job.

Which code should be mutated, by which tests, so that a killed mutant always means that a test saw the change, and the full run ends within the hour?

## Decision Drivers

- A mutant counts as killed only when an assertion fails on it.
- The full run ends within the hour, so that it runs weekly without reusing an earlier report.
- All the code that is pure and testable in isolation is mutated: the domain, the presenters, the logic of the libraries, the configuration, and the adapters that are pure.
- The runner never loads, for its own needs, code that is being mutated.

## Considered Options

- **The TypeScript code only, run by the unit tests in Node.js, with a runner configuration of its own**
- Every file, by every test, browser included, with a longer timeout
- Every file, by every test, with Playwright's tracing turned off under Stryker
- The TypeScript code by the unit tests, selected from the main Vitest configuration

## Decision Outcome

Chosen option: **the TypeScript code only, run by the unit tests in Node.js, with a runner configuration of its own**, because it removes the browser, the cause of the false kills, instead of tuning around it, and is the only option where the configuration of the tests is not itself mutated.

- **Mutated**: the TypeScript files of the configuration, the features and the libraries. Svelte components are not mutated.
- **Excluded by name**: a file that only drives MapLibre or the page, and so runs only in a browser, is listed in Stryker's configuration. Any other mutant that no unit test covers gets a test, or the code is simplified when the mutant is equivalent.
- **Runner**: the unit tests in Node.js, through a Vitest configuration that does not extend the application's, since the latter imports configuration modules that are being mutated.
- **Weekly run**: full, without the incremental report and its cache, on a runner without browser, within sixty minutes.

### Consequences

- Good, because every killed mutant was seen by an assertion: no browser error can kill one.
- Good, because the full run takes minutes, not half an hour.
- Bad, because the code that drives MapLibre or the page is not mutated: only its component tests check it.
- Bad, because the runner's configuration repeats four options of the application's test configuration, which must be kept in step by hand.
- Neutral, because a few mutants are still killed by a timeout, when the change makes a loop endless.

### Confirmation

The weekly Mutation workflow fails under a score of 100 %. Each excluded file is named, with nothing excluded by a broad pattern.

## Pros and Cons of the Options

### Every file, by every test, browser included, with a longer timeout

- Good, because the components are mutated too.
- Bad, because a browser error still counts as a kill, so a full score proves nothing.
- Bad, because the run grows past the hour.

### Every file, by every test, with Playwright's tracing turned off under Stryker

- Good, because it removes one cause of false kills.
- Bad, because clicks lost in Chromium under load remain.

### The TypeScript code by the unit tests, selected from the main Vitest configuration

- Good, because the test options live in one place.
- Bad, because that configuration imports code being mutated, so the runner itself changes under some mutants: they time out instead of being killed or surviving.
