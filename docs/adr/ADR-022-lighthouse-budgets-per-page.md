# ADR-022 — Lighthouse budgets per page

**Date**: 2026-11-15
**Status**: accepted

## Context

Lighthouse CI held every page to the same budget: a performance score of at least 0.95, a Total Blocking Time of at most 100 ms and at most 120 kB of script. With the map, measured on 2026-11-15 with Lighthouse's mobile throttling over three runs, the home page in each language reaches a score of 0.82 to 0.85, a Total Blocking Time of 590 to 755 ms and 337 kB of script, of which MapLibre is 280 kB and a single long task of about 600 ms. Its LCP and CLS stay within budget, and so do the other categories. On GitHub's runner, whose CPU is about twice as slow, the same pages reach a score of 0.72 to 0.74 and a Total Blocking Time of 1,483 to 2,062 ms: Lighthouse slows down the CPU of the machine it runs on by a fixed factor, so these two measures depend on that machine, unlike the weight of the script.

## Decision

- Pages that show the map, `/` and `/fr`, have their own budget, set from the measures of the CI runner, where it is enforced, with a margin: a score of at least 0.70, a Total Blocking Time of at most 2,500 ms and at most 360 kB of script. The weight of the script, the same on every machine, is the reliable guard against a regression. On 2026-11-16, the design foundation brought the map pages to 351 kB of script, MapLibre still 280 kB of it: the limit became 360 kB, and code that the first view does not need, such as the search index, loads when it is first used, outside this budget.
- Every other page keeps the strict budget, and `/privacy` in both languages is now audited, so that a page without the map stays light.
- The other assertions, accessibility, best practices, SEO, LCP and CLS, are the same for every page.
- Lighthouse audits the addresses visitors use, `/fr` rather than the file `fr.html`, served by `vite preview` as GitHub Pages serves them: SvelteKit's router knows no `/fr.html` route, so the audit of the file measured a page no visitor sees. Each page is audited by a browser in its own language, through Chrome's `--accept-lang`, one run per language: on `/fr`, an English browser is offered the English page by a banner that, shown after the scripts, becomes the largest content of the page; that case is tested end to end rather than held to the budget of the page's own audience.

## Consequences

- A change that makes the map pages heavier than measured fails, as does one that brings the map's weight into another page.
- Each new ability shown on the map counts against the same budget; raising it again requires measuring and updating this record.

## Alternatives considered

- **One looser budget for every page**: simpler, but a page without the map could then grow threefold unnoticed.
- **Calibrating Lighthouse's CPU slowdown on each machine's benchmark index**: closer to a reference phone, but one setting per machine, and the index of GitHub's runners varies too.
- **Loading MapLibre after the page is interactive**: a better score, but the map is the content of the page, and the visitor waits for it all the same.

## Update, 2026-11-16: MapLibre and the app budgeted apart

Lighthouse measures the script of a page as one sum, so every ability added to the map counted against a total that MapLibre alone filled to four fifths: on 2026-11-16, the map pages loaded 369 kB, 287 kB of it MapLibre's own chunk. The owner set two budgets instead: **300 kB for MapLibre** and **200 kB for the rest of the app**, compressed with gzip as served.

- [size-limit](https://github.com/ai/size-limit), with its file preset, checks them on the build, in `.size-limit.ts`, from `pnpm test:size` and in CI's Build job. SvelteKit names chunks by their hash only, so the configuration finds MapLibre's chunk by a class name only MapLibre's code holds, `maplibregl-canvas`, and fails if no chunk holds it.
- "The rest of the app" counts every chunk of the build but MapLibre's and its worker, including the code loaded on first use, so code moved out of the first load still counts.
- MapLibre's worker, 147 kB compressed, is loaded alongside the map and runs off the main thread; it is outside both budgets.
- Lighthouse's script assertion on the map pages becomes the sum of both, 500 kB, as a coarse guard; the other pages keep their strict budget.
