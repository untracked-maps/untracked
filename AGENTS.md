# AGENTS.md

Untracked Maps is a static map web app. The [README](README.md) says what it does, the [contributing guide](CONTRIBUTING.md) how to run it; the [ADRs](docs/adr) say why it is built this way. This file lists what you need to change the code without breaking its rules.

## Scope

- This repository holds the web app only. Never add code that produces, transforms or harvests map data, nor a workflow that does: such work belongs to a dedicated project ([ADR-001](docs/adr/ADR-001-a-static-web-app-and-nothing-else.md), [ADR-003](docs/adr/ADR-003-github-actions-build-test-and-publish-only.md)).
- Never commit what can be generated: the architecture documentation is generated at each release by `src/libraries/architecture-docs` ([ADR-016](docs/adr/ADR-016-architecture-documentation-generated-and-published.md)).

## Checks

`pnpm exec prek run --all-files --hook-stage pre-push` runs every check, tests included. Commits run the fast checks; pushes add Vitest, Cucumber and `pnpm audit`; CI runs them all, plus the end-to-end tests and Lighthouse.

While working, run the fast checks on what you touch: `pnpm check`, Biome, and `pnpm exec vitest run <paths>`. Run the slow ones once, at the end of a change, to validate it: the end-to-end tests, `pnpm test:mutation:incremental` and `pnpm test:lighthouse:quick`; CI runs the full Lighthouse audit. When one fails, fix it, rerun that check, then the whole set once more.

- **Architecture**: dependency-cruiser and folderslint enforce [ADR-006](docs/adr/ADR-006-features-and-abilities-on-a-hexagonal-core.md). Features never import each other; abilities never import each other; domains import only themselves and the packages of `DOMAIN_PACKAGES`: `rxjs` and the libraries that implement a standard ([ADR-039](docs/adr/ADR-039-standards-first-and-their-libraries-in-the-domain.md)). No barrel file: modules are imported directly, through the `#features/*` subpath imports from routes. Do not add a package exception to `.dependency-cruiser.ts` without a reason in the commit.
- **Types**: strict TypeScript 6 with the extra flags of `tsconfig.json`; `svelte-check` fails on warnings. Everything exported has an explicit type; no `enum` or `namespace`. No `any`, no `as` casts but `as const`, no `!`: Biome enforces all three.
- **Generated code** never goes in `src`: `pnpm lint:generated` fails when git ignores any file under `src`, on every commit and in CI after the build. Tools write their output at the root, in a hidden folder, as SvelteKit and Paraglide do.
- **Tests**: 100 % coverage, every mutant killed, tests in random order, no retry.
- **Other checks** ([ADR-019](docs/adr/ADR-019-deterministic-checks-beyond-linting.md)): every message translated in every locale, French spelling with cspell, no duplicated code with jscpd, valid HTML with html-validate, no broken link with lychee, no unused Cucumber step.
- **Biome** lints and formats; **knip** fails on unused files, exports and dependencies; **typos** checks spelling, except in French files.

## Writing code

- Functional style: no classes, no mutable state, no imperative loops; small pure named functions. The GritQL plugins in `.grit/` enforce no class, no `let` and no loop.
- An ability's use case is a function from its ports and input streams to its output streams, in its `domain` ([ADR-007](docs/adr/ADR-007-abilities-are-rxjs-stream-functions.md)). No store, no global state.
- The shape of data comes from a standard: the one that represents the information best, with the fewest known defects, then an international standard, then OpenStreetMap's tagging, then anything else ([ADR-039](docs/adr/ADR-039-standards-first-and-their-libraries-in-the-domain.md)). Never rewrite a standard: import the library that implements it.
- Routes are the only place where features meet and where adapters are passed to abilities ([ADR-008](docs/adr/ADR-008-composition-in-routes.md)).
- The Content Security Policy in `vite.config.ts` allows only the site itself: a feature that calls an external service adds it to `connect-src` ([ADR-018](docs/adr/ADR-018-security-checks.md)), and to the "Who sees what" page, with what it sees and why ([ADR-021](docs/adr/ADR-021-maplibre-and-the-openfreemap-basemap.md)).
- Every displayed text is a message in `messages/<locale>.json`, called through `m.<key>()` ([ADR-009](docs/adr/ADR-009-translations-with-paraglide-and-the-locale-in-the-url.md)).
- No comments in code or configuration; the reasoning goes in the commit message or an ADR. The one exception is the version annotation next to a pinned hash: `# frozen: vX.Y.Z` in `.pre-commit-config.yaml` and `# vX.Y.Z` after a `uses:` SHA.

## Writing tests

- Test first: a failing test, the minimal code, then clean up, one behaviour at a time.
- No mocks or spies: pass fakes for ports and observe returned values. One assertion per test, no loop or branch in a test body. The `.grit/` plugins enforce no mock and one assertion per test. Test names state the behaviour.
- Component tests are `*.svelte.spec.ts` and run in Chromium; unit tests are `*.spec.ts`; an ability's rules are Gherkin scenarios in `<ability>.ability.md`.
- Accessibility targets WCAG 2.2 AA; the end-to-end tests run axe-core.

## Decisions

When a change picks a library, a protocol or a rule, or sets aside a plausible alternative, record it as a new ADR in `docs/adr`, numbered after the last one.
