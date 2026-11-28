---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# A SvelteKit site prerendered as static files

## Context and Problem Statement

The app is a static client app ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)): one interactive map page, a few content pages, and no server of its own at run time. It must stay fast on modest phones, be served by a host of static files, keep a strict Content Security Policy without a server to send headers, be written in TypeScript, and have an official way to translate its interface.

Which framework builds it, and what does the build output?

## Decision Drivers

- The output is static files, which any host of static files serves.
- Little runtime shipped to the browser, and updates limited to what changes.
- Server features that a static output cannot use are not paid for.
- An official tooling for tests and translations.

## Considered Options

- Svelte and SvelteKit, every page prerendered with the static adapter
- Next.js with a static export
- React with Vite
- SolidJS

## Decision Outcome

Chosen option: « Svelte and SvelteKit, every page prerendered with the static adapter », because Svelte compiles components to code that updates only the nodes that change, and SvelteKit's static adapter writes every page as a file at build time, with official integrations for tests and translations.

### Every page is prerendered

The root layout prerenders every page: the build writes each page and its data as static files, and nothing runs on a server once the site is published. What a page needs at build time, such as generated data, is computed during the prerender and written into the files.

### Unknown addresses get a prerendered page

The page for an address the site does not know is a prerendered route, written as the file a static host serves for a missing page.

### Asset paths are absolute, under a base path

Asset paths are absolute and prefixed with a base path given at build time, so that the same build works at the root of a domain or under a folder of it.

### Built by Vite

SvelteKit builds through Vite, which holds its configuration, the bundler's and the tests'.

### Consequences

- Good, because the site is a folder of files, which any static host serves, and its pages load without waiting for a server.
- Good, because the runtime shipped to the browser is Svelte's, smaller than React's and Next's.
- Bad, because the Svelte ecosystem is smaller than React's.
- Bad, because nothing can be decided per request: what depends on the visitor is decided in the browser.
- Neutral, because the Svelte runtime is a production dependency: it ships to the browser.

### Confirmation

The build fails when a page cannot be prerendered. The end-to-end tests run on the built site, at the root and under a base path.

## Pros and Cons of the Options

### Next.js with a static export

A static export turns off Next's server features, server components, route handlers, middleware and image optimisation, so nearly every component would be a client component, and the React and Next runtimes would add weight that Svelte does not.

### React with Vite

The standard client-only React setup: React's ecosystem without Next's server layer, but React's virtual DOM re-renders components where Svelte updates only the nodes that change.

### SolidJS

As fast as Svelte, with JSX, but an even smaller ecosystem.

## More Information

### Where to find the detail

- [The configuration of SvelteKit and Vite](../../vite.config.ts)
- [The routes](../../src/routes/)

### References

- [SvelteKit's static adapter](https://svelte.dev/docs/kit/adapter-static)
- [Prerendering in SvelteKit](https://svelte.dev/docs/kit/page-options#prerender)
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)

### History

- 2026-11-28, marc-gavanier: first writing.
