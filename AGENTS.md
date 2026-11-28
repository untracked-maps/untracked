# AGENTS.md

Untracked Maps is a static map web app. The [README](README.md) says what it does, the [contributing guide](CONTRIBUTING.md) how to run it; the [architecture decisions](docs/decisions) say why it is built this way. This file lists what you need to change the code without breaking its rules.

## Scope

- This repository holds the web app only. Never add code that produces, transforms or harvests map data, nor a workflow that does: such work belongs to a dedicated project ([0002](docs/decisions/0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)).
- Never commit what can be generated: the architecture documentation is generated at each release by `src/libraries/architecture-docs` ([0021](docs/decisions/0021-assets-and-data-generated-at-build-never-committed.md)).

## Checks

`pnpm exec prek run --all-files --hook-stage pre-push` runs every check, tests included. Commits run the fast checks; pushes add Vitest, Cucumber and `pnpm audit`; CI runs them all, plus the end-to-end tests and Lighthouse.

While working, run the fast checks on what you touch: `pnpm check`, Biome, and `pnpm exec vitest run <paths>`. Run the slow ones once, at the end of a change, to validate it: the end-to-end tests, `pnpm test:mutation:incremental` and `pnpm test:lighthouse:quick`; CI runs the full Lighthouse audit. When one fails, fix it, rerun that check, then the whole set once more.

- **Architecture**: dependency-cruiser and folderslint enforce [0006](docs/decisions/0006-features-and-abilities-on-a-hexagonal-core.md). Features never import each other; abilities never import each other; domains import only themselves and the packages of `DOMAIN_PACKAGES`: `rxjs` and the libraries that implement a standard ([0012](docs/decisions/0012-the-shape-of-external-data-comes-from-a-standard.md)). No barrel file: modules are imported directly, through the `#features/*` subpath imports from routes. Do not add a package exception to `.dependency-cruiser.ts` without a reason in the commit.
- **Types**: strict TypeScript 6 with the extra flags of `tsconfig.json`; `svelte-check` fails on warnings. Everything exported has an explicit type; no `enum` or `namespace`. No `any`, no `as` casts but `as const`, no `!`: Biome enforces all three.
- **Generated code** never goes in `src`: `pnpm lint:generated` fails when git ignores any file under `src`, on every commit and in CI after the build. Tools write their output at the root, in a hidden folder, as SvelteKit and Paraglide do.
- **Tests**: 100 % coverage, every mutant killed, tests in random order, no retry.
- **Other checks** ([0027](docs/decisions/0027-static-checks-by-tools-fast-hooks-and-every-check-in-ci.md)): every message translated in every locale, French spelling with cspell, no duplicated code with jscpd, valid HTML with html-validate, no broken link (between Markdown files with remark-validate-links at each commit, to other sites with lychee every week), no unused Cucumber step.
- **Biome** lints and formats; **knip** fails on unused files, exports and dependencies; **typos** checks spelling, except in French files: those `_typos.toml` names, such as `fr.json`. Put French text, the fake places' included, in a file of that name, or typos rewrites its words in English.

## Writing code

- Functional style: no classes, no mutable state, no imperative loops; small pure named functions. The GritQL plugins in `.grit/` enforce no class, no `let` and no loop.
- An ability's use case is a function from its ports and input streams to its output streams, in its `domain` ([0009](docs/decisions/0009-abilities-are-rxjs-stream-functions-without-a-store.md)). No store, no global state.
- The shape of data comes from a standard: the one that represents the information best, with the fewest known defects, then an international standard, then OpenStreetMap's tagging, then anything else ([0012](docs/decisions/0012-the-shape-of-external-data-comes-from-a-standard.md)). Never rewrite a standard: import the library that implements it. OpenStreetMap's tags and other external formats are a transfer format: the adapters translate what the product uses into the domain's value objects, and check every external data when they read it ([0013](docs/decisions/0013-adapters-translate-external-formats-into-a-domain-of-value-objects.md)).
- Routes are the only place where features meet and where adapters are passed to abilities ([0010](docs/decisions/0010-only-entry-points-compose.md)).
- The Content Security Policy in `vite.config.ts` allows only the site itself: a feature that calls an external service adds it to `connect-src` ([0019](docs/decisions/0019-a-strict-content-security-policy-built-from-hashes.md)), and to the "Who sees what" page, with what it sees and why ([0018](docs/decisions/0018-the-browser-talks-only-to-declared-services.md)).
- Every displayed text is a message in `messages/<locale>.json`, called through `m.<key>()` ([0016](docs/decisions/0016-translations-compiled-by-paraglide-without-a-redirect-by-language.md)).
- No comments in code or configuration; the reasoning goes in the commit message or an ADR. The one exception is the version annotation next to a pinned hash: `# frozen: vX.Y.Z` in `.pre-commit-config.yaml` and `# vX.Y.Z` after a `uses:` SHA.

## Writing tests

- Test first: a failing test, the minimal code, then clean up, one behaviour at a time.
- Each test writes its own inputs, in the scenario's tables or in the test itself: never the fake places, Faker or a JSON file of another folder, as dependency-cruiser enforces ([0026](docs/decisions/0026-tests-without-mocks-each-suite-proving-one-thing.md)).
- No mocks or spies: pass fakes for ports and observe returned values. One assertion per test, no loop or branch in a test body. The `.grit/` plugins enforce no mock and one assertion per test. Test names state the behaviour.
- Component tests are `*.svelte.spec.ts` and run in Chromium; unit tests are `*.spec.ts`; an ability's rules are Gherkin scenarios in `<ability>.ability.md`.
- Accessibility targets WCAG 2.2 AA; the end-to-end tests run axe-core.
- In end-to-end tests, never wait for a text that depends on the map's centre while the map flies, and never time an animation.

## Decisions

When a change takes an architecture decision, as [the rules of the decisions](docs/decisions/README.md) define it, record it as a new decision in `docs/decisions`, numbered after the last one.

Never wait for the maintainer: an open question goes to an issue labelled `question` and the work goes on; a rule change is justified in its commit and reported by an issue, as the [contributing guide](CONTRIBUTING.md#questions-and-rule-changes) says.

Keep the rebuild plan, #46, up to date: tick a step's box once its pull request is merged into `main`, with the numbers of its issue, its pull request and its ADR.
