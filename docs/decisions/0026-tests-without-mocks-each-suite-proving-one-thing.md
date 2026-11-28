---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Tests without mocks, each suite proving one thing, and mutation of the pure code

## Context and Problem Statement

The code is made of pure domains behind ports ([0006](0006-features-and-abilities-on-a-hexagonal-core.md)), stream functions ([0009](0009-abilities-are-rxjs-stream-functions-without-a-store.md)), presenters that hold what the interface decides ([0011](0011-no-logic-in-components-or-pages.md)), and adapters that reach the browser, the device or a service. The business rules are Gherkin scenarios of each ability, played by Cucumber.

The tests had grown into a mix. Unit tests and component tests ran in one suite, the components in Chromium, under one coverage threshold for the whole code. Some scenarios described what a screen shows rather than a rule. Many end-to-end tests each checked one screen or one technical point, accessibility included. Mutation testing ran every test against each mutant, browser included: under its load, a lost click or a tracing error failed a test, and the mutant counted as killed without any assertion having seen it.

How should the app be tested, so that each kind of test proves one thing, a passing suite can be trusted, and a weakened test is caught?

## Decision Drivers

- A test observes returned values, never calls: fakes for ports, no mocks and no spies.
- A killed mutant means that an assertion saw the change.
- Business rules are scenarios; what a screen shows is a story; neither restates the other.
- The pure code is proven without a browser; what needs a browser is proven in one.
- Every adapter that stays on the device is proven against the real thing.
- Only automated checks block a merge.

## Considered Options

- Unit tests without a browser, stories for every page and component, the same scenarios on in-memory then real adapters, a few end-to-end journeys, and mutation of the pure code on each pull request
- Component tests in Vitest's browser mode, beside the unit tests, as they were
- Many end-to-end tests, one per screen or check
- Mocks and spies to isolate each unit
- Mutation of every file by every test, browser included

## Decision Outcome

Chosen option: « Unit tests without a browser, stories for every page and component, the same scenarios on in-memory then real adapters, a few end-to-end journeys, and mutation of the pure code on each pull request », because each suite then proves one thing on the layer it fits, and mutation, run without a browser, tells a strong test from a weak one.

### Rules for every test

A test passes fakes for ports and observes returned values: no mock, no spy. It holds one assertion, no loop and no condition, and writes its own inputs, never shared fake data. Tests run in a random order; a focused test, an empty suite or a test without an assertion fails, and no test is retried. A unit test is to have the import rights of the code it tests, as [0007](0007-imports-bounded-by-dependency-cruiser.md) sets. Biome already refuses focused and skipped tests in the code it reads. Lint rules are to enforce the rest: a pure domain, which receives the time as an input and has neither default value nor exception, tests without loop or condition, and no skipped test of any kind. Target, tracked by #147.

### Scenarios for business rules only

Gherkin scenarios are written before the code, for business rules only. A feature that only displays, without filtering, computing or choosing anything, has no scenario; the display scenarios that exist are removed once stories cover them.

### Unit tests, without a browser

The unit tests prove the domain, the presenters and the logic of the libraries, and nothing that needs a browser: no interface, the map included, is unit tested. Today one suite runs the unit and component tests together, under one coverage threshold. The target is two suites, each its own job in CI, run in parallel, and a coverage of 100 % file by file of the domain, the presenters and the logic of the libraries, by the unit tests alone. Target, tracked by #144.

### Stories for every page and component

Today components are tested by Vitest in Chromium. The target is Storybook: stories in the Component Story Format, with their interactions written with Testing Library, become the only component tests, for every page and every component, on behaviours only, in a real headless browser. Accessibility is checked in them and blocks, story coverage is 100 %, a story that plays an action holds an assertion, and there is no screenshot comparison. A compatibility trial with SvelteKit comes first. Target, tracked by #149, then #150, #151, #152 and #153 for the migration.

### Integration tests: the same scenarios on in-memory, then real adapters

Today the scenarios run on in-memory adapters only. The target is one set of scenarios, played on each pull request on the in-memory adapters, then on the real ones under a profile of their own, in an environment that gives them a browser when they need one. They block for the adapters that stay on the device, which their integration tests cover at 100 %; those of external services, which come with the first real service, do not block. A real adapter leaves the unit coverage only in the pull request that adds its integration test. Target, tracked by #154.

### A few end-to-end journeys

Today many end-to-end tests each check a screen or a technical point. The target is two to four independent journeys, each named after what a person wants to do, and nothing else. A journey, and only a journey, may hold several assertions. It checks no accessibility, which the stories hold, and no test turns an accessibility setting, such as reduced motion, on to pass. Target, tracked by #155.

### Mutation of the pure code, without a browser

Stryker mutates the TypeScript of the configuration, the features and the libraries, and runs only the unit tests, without a browser, through a test configuration of its own that imports no mutated code. A file that only drives the map or the page is excluded by name. No mutant may survive. A full run happens weekly, without reusing an earlier report, within the hour. The target is a run on each pull request in Stryker's incremental mode from the report of the main branch, which replays what a changed code or a changed or deleted test touched, after a trial of its precision with the Vitest runner. Target, tracked by #143.

### Required checks

The mutation of pull requests, the stories and the integration profile that blocks become required checks of the main branch, so that a failure blocks the merge. Target, tracked by #143, #149 and #154.

### Consequences

- Good, because every killed mutant was seen by an assertion, and a weakened test fails its pull request.
- Good, because a passing suite says one thing: the rules hold, the components behave, the adapters work, the journeys succeed.
- Good, because the unit suite runs without a browser and fast, and the adapters of the device are proven against the browser's real storage.
- Good, because a refactoring that keeps behaviour breaks no test: no test checks a call.
- Bad, because hand-written fakes are code to maintain, and an in-memory adapter can drift from the real one until its integration test runs.
- Bad, because the code that drives the map or the page is not mutated: only its stories check it.
- Bad, because the move to stories rewrites every component test, and depends on a trial whose outcome is not known.
- Bad, because a journey that fails says less about where than a narrow test would.
- Neutral, because the mutation runner repeats a few options of the test configuration, kept in step by hand.

### Confirmation

Vitest's coverage thresholds, Stryker's break threshold at 100 %, the GritQL plugins of Biome against test doubles and against several assertions, Biome's rules against focused and skipped tests, and dependency-cruiser's rules on what a test may import. Each new automated rule is proven by a deliberate violation.

## Pros and Cons of the Options

### Component tests in Vitest's browser mode, beside the unit tests, as they were

Nothing to migrate. The pure code shares a suite and a coverage threshold with code that needs a browser, so neither proves its own part, and nothing shows a component's states to a reader.

### Many end-to-end tests, one per screen or check

Each failure points at one screen. They are the slowest tests, they repeat what stories and scenarios prove, and they check technical points no visitor would name.

### Mocks and spies to isolate each unit

Any unit can be isolated. The tests follow the implementation: a refactoring breaks them, and a real defect passes when the calls stay the same.

### Mutation of every file by every test, browser included

The components would be mutated too. A browser error under load counts as a kill, so a full score proves nothing, and the run grows past the hour.

## More Information

### Where to find the detail

- [The test configuration](../../vite.config.ts)
- [The mutation runner's configuration](../../vitest.mutation.config.ts)
- [Stryker's configuration](../../stryker.config.json)
- [The weekly mutation run](../../.github/workflows/mutation.yml)
- [The GritQL plugins](../../.grit/)
- [The rules on what tests import](../../.dependency-cruiser/)
- [The scenarios of the abilities](../../src/features/)

### References

- [Vitest](https://vitest.dev/)
- [Cucumber](https://cucumber.io/docs/cucumber/)
- [StrykerJS and its incremental mode](https://stryker-mutator.io/docs/stryker-js/incremental/)
- [Storybook's Vitest add-on](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

### History

- 2026-11-28, marc-gavanier: first writing.
