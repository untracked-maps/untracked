# ADR-005 — Strict TypeScript 6

**Date**: 2026-11-15
**Status**: accepted

## Context

The previous app was JavaScript with `checkJs` and `strict: false`; a home-made script searched for misspelled property names because nothing else could.

[TypeScript 7](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), the native compiler written in Go, is stable since 2026-07-08, but its programmatic API, which `svelte-check` and the Svelte language tools need, is planned for 7.1; Svelte projects are advised to stay on TypeScript 6 until then ([Visual Studio Magazine](https://visualstudiomagazine.com/articles/2026/07/08/typescript-7-arrives-to-rock-vs-code-with-go-powered-speed.aspx)).

## Decision

- All code is TypeScript, `.svelte` components included (`lang="ts"`).
- `tsconfig.json` turns on `strict` and the stricter flags used in la Cartographie nationale: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`, `noUnusedParameters`, and no unreachable code or unused labels.
- `erasableSyntaxOnly` forbids syntax that emits code, such as `enum`, `namespace` and parameter properties: the code stays JavaScript with types.
- `isolatedDeclarations` requires an explicit type on everything exported, so that ports and use cases state their contracts without inference. It needs `declaration`, and refuses `allowJs`.
- `tsconfig.json` covers all the code: `src`, the end-to-end tests and the configuration files, which are all TypeScript but Cucumber's, in JSON since Cucumber reads no TypeScript configuration. `allowJs` is off.
- SvelteKit's base configuration already turns on `verbatimModuleSyntax` and `isolatedModules`, and TypeScript 6 turns on `strict` and `noUncheckedSideEffectImports` by default ([announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)).
- `pnpm check` runs `svelte-check --fail-on-warnings`, in the commit hook and in CI.
- Typing the configuration of dependency-cruiser found rules whose `severity` was a plain string; each group of rules is now typed with `IForbiddenRuleType`.
- Renovate holds TypeScript below 7 until `svelte-check` supports it.

## Consequences

- Biome's `useLiteralKeys` rule is off, because `noPropertyAccessFromIndexSignature` requires bracket access on index signatures.

## Alternatives considered

- **`skipLibCheck: false`**, to check the type declarations of the dependencies too. Measured on 2026-11-15: 38 errors, all in dependencies (27 in Paraglide, the others in unplugin, typebox and webpack-virtual-modules), none of them ours to fix, and a check going from 3 to 8 seconds.

- **TypeScript 7 now**: faster, but it cannot check Svelte components yet.
