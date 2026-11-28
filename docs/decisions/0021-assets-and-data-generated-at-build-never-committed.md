---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Assets and data generated at build, never committed

## Context and Problem Statement

The site serves files that nobody writes by hand: the glyphs and the icons of the map, which it serves itself so that the provider of tiles sees only tile requests ([0018](0018-the-browser-talks-only-to-declared-services.md)), the fake data its adapters read until real sources replace them ([0003](0003-fake-data-generated-at-build-from-seeds.md)), the fake pictures of places, and the texts of the licences of the libraries it ships. The tools that make them are heavy, sometimes native, and have nothing to do in a browser. The former app committed such files: they drifted from their sources, swelled the history, and nothing proved they could still be rebuilt.

The site is static and prerendered by SvelteKit ([0004](0004-a-sveltekit-site-prerendered-as-static-files.md)), which can prerender any endpoint that lists its entries.

How are derived files produced, and where do they live?

## Decision Drivers

- Nothing that can be generated is kept in the repository.
- A derived file always matches the sources of the release it ships with.
- Tools that run at build never reach the browser.
- The site stays static: no generation at request time.

## Considered Options

- Prerendered endpoints that generate every derived file at build, nothing committed
- Generated files committed, and checked by a hook
- Generation in the browser, at runtime

## Decision Outcome

Chosen option: « Prerendered endpoints that generate every derived file at build, nothing committed », because SvelteKit's prerendering already writes every endpoint it lists to the static output, so that each derived file is rebuilt from its sources at every build without a tool of its own.

### Prerendered endpoints generate the files

Each kind of derived file is served by an endpoint of the site that lists its entries and is prerendered: the build writes every file to the output, and in development the endpoint answers on request. The work of each endpoint lives in a library or an adapter of the project, tested like any other code.

### Nothing generated is committed

No generated file is committed, neither in the sources nor elsewhere: tools write their output at the root, in hidden folders, and a check fails when Git ignores a file under the sources. What can be regenerated is never kept.

### Build tools stay at build

The tools that generate are development dependencies, allowed only in the folders that use them, as [0007](0007-imports-bounded-by-dependency-cruiser.md) sets: font and sprite tools in their libraries, fake data generators in in-memory adapters, the framework in prerendered endpoints. The browser receives data and files, never the code that made them.

### Consequences

- Good, because a derived file can never disagree with the sources of its release, and the history holds only what people wrote.
- Good, because the browser receives no generator: the weight of the pages ignores them.
- Good, because a new kind of derived file is an endpoint and its library, with no step to add to the build.
- Bad, because every build regenerates every file, which lengthens it.
- Bad, because some generators ship native binaries for a few platforms only: elsewhere they compile from source.
- Neutral, because a derived file is read only in the built site or the development server, not in the repository.

### Confirmation

A check on each commit and in CI after the build fails when Git ignores any file under the sources; dependency-cruiser refuses a build tool outside the folders allowed for it; end-to-end tests check that the generated files are served.

## Pros and Cons of the Options

### Generated files committed, and checked by a hook

The files are visible in the repository and the build is shorter. But generated content enters version control and its reviews, and a hook must regenerate everything to prove it has not drifted.

### Generation in the browser, at runtime

No file to serve. But the generators would weigh on the pages, and files that never change between two releases would be computed again on every visit.

## More Information

### Where to find the detail

- [The endpoints of the site, among them the glyphs, the icons, the pictures, the licences and the data](../../src/routes/)
- [The libraries that generate the glyphs and the icons](../../src/libraries/)
- [The check that no generated file is in the sources](../../package.json)

### References

- [0003: Fake data generated at build from seeds, until a real source replaces its adapter](0003-fake-data-generated-at-build-from-seeds.md)
- [0004: A SvelteKit site prerendered as static files](0004-a-sveltekit-site-prerendered-as-static-files.md)
- [0007: Imports bounded by dependency-cruiser, with exceptions written per target](0007-imports-bounded-by-dependency-cruiser.md)
- [0018: The browser talks only to declared services](0018-the-browser-talks-only-to-declared-services.md)
- [SvelteKit, prerendering](https://svelte.dev/docs/kit/page-options#prerender)

### History

- 2026-11-28, marc-gavanier: first writing.
