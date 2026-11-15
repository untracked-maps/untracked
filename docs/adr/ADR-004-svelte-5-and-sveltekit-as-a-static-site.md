# ADR-004 — Svelte 5 and SvelteKit as a static site

**Date**: 2026-11-15
**Status**: accepted

## Context

The app is one interactive map page that must stay fast on modest phones. It needs a build step that outputs static files for GitHub Pages, TypeScript, a strict Content Security Policy without a server, and an official way to translate the interface.

Next.js was considered: a static export (`output: 'export'`) disables its server features (server components, route handlers, middleware, image optimisation), so nearly every component would be a client component, and the React and Next runtimes add weight that Svelte does not. React's virtual DOM re-renders components where Svelte 5 updates only the nodes that change.

## Decision

Build the app with Svelte 5 and SvelteKit, prerendered with `@sveltejs/adapter-static`. Every page is prerendered (`prerender = true` in the root layout), the page for unknown addresses is a prerendered `/404` route written to `404.html` ([ADR-019](ADR-019-deterministic-checks-beyond-linting.md)), and asset paths are absolute so that it works under any URL. The project was generated with the official CLI, `sv create`, with the static adapter, Vitest, Playwright and Paraglide add-ons.

The build runs on Vite 8, whose bundler, [Rolldown](https://vite.dev/blog/announcing-vite8), replaces both esbuild and Rollup.

## Consequences

- `svelte` is a production dependency: its runtime ships to the browser.
- RxJS observables plug into Svelte components without an adapter ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)).
- The Svelte ecosystem is smaller than React's.

## Alternatives considered

- **Next.js with a static export**, for the reasons above.
- **React with Vite**, the standard client-only React setup: React's ecosystem without Next's server layer, but React's rendering cost remains.
- **SolidJS**: as fast as Svelte, with JSX, but an even smaller ecosystem.
