# ADR-009 — Translations with Paraglide, the locale in the URL

**Date**: 2026-11-15
**Status**: accepted

## Context

Every text shown must be translatable, through SvelteKit's official mechanism, on a site with no server. [Paraglide JS](https://paraglidejs.com/sveltekit) is SvelteKit's official i18n integration; it compiles messages into tree-shakable functions. Its middleware lives in `hooks.server.ts`, and SvelteKit's [`handle` hook](https://svelte.dev/docs/kit/hooks) runs "while the app is running, or during prerendering", so it works in a static build.

## Decision

- Messages live in `messages/<locale>.json`. English is the base locale, served at `/`; French is served at `/fr`.
- The locale is read from the URL only, with the `url` and `baseLocale` strategies: a static site cannot read a cookie before it sends a page.
- The layout links every page in every locale, with `hreflang` and `lang`, so that the prerender crawler generates each one, and visitors can switch.
- The generated code goes to `.paraglide/` at the root, ignored by git, and is imported through the `#i18n/*` alias declared in the `imports` of `package.json`. `outdir` has no default and no recommended location in Paraglide's [compiler options](https://paraglidejs.com/compiler-options); `src/lib/paraglide` was only the choice of the `sv` CLI. SvelteKit itself writes what it generates to `.svelte-kit/`, outside `src`, and so does this project: `src` holds only code written by hand.
- dependency-cruiser does not follow into `.paraglide/` (`doNotFollow`) but sees every import of it, so its rules decide who may use the translations: routes and UI, never a domain. Excluding the folder instead (`exclude`) would drop those imports, and the rules with them.
- The message format plugin is a development dependency, referenced by its path in `node_modules` from `project.inlang/settings.json`, as the [inlang documentation](https://inlang.com/docs/install-plugin) allows. The CLI's default loads it from jsDelivr at build time, outside the lockfile, its integrity and pnpm's release age; the build now opens no network connection. The `m-function-matcher` plugin, used only by editor tooling, is left out.

- Under a base path, such as `/untracked` on `untracked-maps.github.io` until the project's domain is set up, `BASE_PATH` gives both SvelteKit's `paths.base` and Paraglide's `urlPatterns`. The patterns accept addresses with or without the base path, with URLPattern's optional group, as the [i18n routing guide](https://paraglidejs.com/i18n-routing) shows, and `src/libraries/base-path` derives them from the locales of `project.inlang/settings.json`. Without a base path, Paraglide keeps its default patterns. The release reads `BASE_PATH` from `actions/configure-pages`, and the CI runs the end-to-end tests both at the root and under `/untracked`.

## Consequences

- A text written in a component instead of a message is a bug.
- French text follows French typography, for example a narrow no-break space before `!`.
- typos does not check the content of French files.
- knip does not see a plugin referenced from `settings.json`: `knip.json` declares it.

## Alternatives considered

- **Locale from the browser's language or a cookie**: needs a server or a client-side redirect after load.
