# ADR-010 — Biome for linting and formatting

**Date**: 2026-11-15
**Status**: accepted

## Context

la Cartographie nationale, la Coop and ihexa use Biome. Biome's [Svelte support](https://biomejs.dev/internals/language-support/) covers the HTML, CSS and script parts of Svelte 5 files, but is marked experimental: it must be enabled explicitly, "newer features, rare syntax, or edge cases might not be covered yet", and cross-language rules may raise false positives.

## Decision

Biome lints and formats the whole repository, Svelte files included (`html.experimentalFullSupportEnabled`), with the recommended preset, single quotes, semicolons and a line width of 128. Imports are organised by Biome's assist. `src/app.html` turns off `useValidLang`, because its `lang` is a placeholder Paraglide fills at build time.

### Rules

- The `recommended` preset applies by default. It already forbids `any` and non-null assertions (`noExplicitAny`, `noNonNullAssertion`) and enforces `import type`.
- Every other stable rule was reviewed on 2026-11-15 and those that fit the project are on, as errors: functional style (no parameter reassignment, `++`, `var`, `for...in`, nested ternaries, `delete`, `void`, `enum`, `namespace`), safety (undeclared dependencies and variables, shadowing, floating expressions, errors thrown as `Error` with a message and a cause), test hygiene (no focused, skipped or conditional tests, no duplicate titles, the Playwright rules), size and complexity limits (200 lines per file, 20 per function, a cognitive complexity of 10, and Biome's defaults for parameters, statements and nesting), where `describe` callbacks in tests are exempt from the function length, since one assertion per test keeps each test short; the configuration of dependency-cruiser is split into modules under `.dependency-cruiser/` to fit, magic numbers, licences approved by the OSI, and no Node.js module, `process` or default export outside configuration files.
- Types are declared with `type`, never `interface`. Regular expressions carry the `u` flag and are declared at module level. Exports come last in a file.
- File names are kebab-case, components included, as `welcome.svelte`; SvelteKit's `+` prefix is allowed.
- Unit and component tests are written with `it`, end-to-end tests with `test`, inside `describe` blocks too: each suite reads apart from the other.
- `useImportExtensions` stays off: imports carry no extension, the usual form under the `bundler` resolution. The `#features/*`, `#libraries/*`, `#configuration/*` and `#i18n/*` subpath imports of `package.json`, which SvelteKit 3 recommends over its deprecated `alias` option, add the extension themselves: `#features/*` points to `./src/features/*.ts`, and the more specific `#features/*.svelte` to components, which keep their `.svelte` extension as Svelte requires. The configuration files import through them too, since Node resolves them when Vite loads its configuration natively.
- A second review turned on the remaining stable rules that fit, none of which reported anything on the code: simplifications (useless `undefined`, `return`, catch bindings, template literals), functional idioms (`find`, `some`, destructuring, spread), consistency (array types, method signatures, imports first, no namespace import), modern APIs (`at()`, `globalThis`, `slice`), regex safety, and HTML and accessibility checks (no handlers on non-interactive elements, unique ids, image sizes, sandboxed iframes).
- `noRestrictedImports` forbids what the project does not want, each group with its reason: stores (`svelte/store`, Redux, Zustand, MobX, Jotai, Pinia, NgRx…), lodash and underscore, jQuery, CSS frameworks and icon fonts (Bootstrap, Bulma, Font Awesome…), Moment, HTTP clients (Axios, request…), `classnames` and `clsx`, `uuid` and `nanoid`, polyfills (`core-js`…), analytics, monitoring and session recording (Sentry, PostHog, Mixpanel, Segment, Vercel Analytics…), and Google Maps.
- `useRequiredScripts` keeps the scripts the hooks, the CI and the contributing guide rely on in `package.json`.
- Rules left off as irrelevant: those about classes, `enum` and `var`, which the code never uses, and `noUndeclaredEnvVars`, which only checks variables declared in a Turborepo `turbo.json`.
- Rules no built-in rule covers are GritQL plugins in `.grit/`, written for this project since no maintained plugin exists for them, and run on TypeScript and on the script of Svelte components: no class, no `let`, no `for` or `while` loop, no `vi.fn`, `vi.mock` or `vi.spyOn`, and one assertion per test (`it` or `test` whose body holds `expect` twice). Comments could not be targeted this way.
- The `svelte`, `playwright`, `project`, `test` and `types` domains are on in full, so that a rule Biome adds to them later turns on by itself; the rules set aside above are turned off one by one.
- Assist actions keep `package.json` in its conventional order, CSS properties in a canonical order, class attributes without duplicates, and the keys of `messages/*.json` sorted. `biome ci` fails when one is not applied.
- `markdown.analyzeEmbeds` lints and formats the code blocks of the Markdown files, such as the examples in these records.
- `noBarrelFile` and `noReExportAll` forbid barrel files ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)).
- Nursery rules, still unstable, are on where they fit, as errors: `noUnsafeTypeAssertion` forbids every `as` but `as const`; `noFloatingPromises`, `noMisusedPromises`, `useAwaitThenable`, `noUnsafeReturn`, `useStrictBooleanExpressions`, `useExhaustiveSwitchCases`, `useNullishCoalescing` and `useExplicitReturnType` tighten the types; the Svelte rules require keyed `{#each}` and forbid `{@html}`, `export let`, `svelte/internal` and debugging tags; JSON, YAML and `package.json` rules check unsafe values, boolean keys and valid fields; accessibility rules check headings, labels and zoom. `noFloatingPromises` found, on the day it was turned on, component tests that did not await `render`. `noNull` is off in tests, whose fake `Storage` must return `null`, `noSyncMethods` in configuration files, and `useCapitalizedConstructors` in Cucumber steps, whose `function` must read the world through `this`. Markup uses Svelte's declaration tags (`{const …}`, since Svelte 5.56) rather than `{@const}`. `useExplicitType`, which would type every parameter TypeScript already infers from its context, and `useLayeredStyles`, whose cascade layers add nothing to Svelte's scoped styles, are left off. A Biome update may change a nursery rule; the CI then says so.
- Left off, with their reasons: `noTernary` (the ternary is the functional conditional), `noForEach` (it pushes towards `for...of`), `noUnresolvedImports`, `noDeprecatedImports`, `useExpect` and `noMisplacedAssertion` (false positives on Svelte components, SvelteKit types and RxJS marble tests), the rules of other frameworks, and the nursery rule `useSvelteKitResolve`, since Paraglide's `localizeHref` already builds links with the base path.

## Consequences

- A Biome gap in Svelte syntax is worked around in the narrowest override, with the reason in the commit.

## Alternatives considered

- **ESLint with eslint-plugin-svelte and Prettier with prettier-plugin-svelte**: complete and stable on Svelte, but slower and two tools instead of one.
- **oxlint and oxfmt**: oxlint lints only the `<script>` blocks of Svelte files.
