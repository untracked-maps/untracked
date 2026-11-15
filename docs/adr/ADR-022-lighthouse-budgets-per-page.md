# ADR-022 — Lighthouse budgets per page

**Date**: 2026-11-15
**Status**: accepted

## Context

Lighthouse CI held every page to the same budget: a performance score of at least 0.95, a Total Blocking Time of at most 100 ms and at most 120 kB of script. With the map, measured on 2026-11-15 with Lighthouse's mobile throttling over three runs, the home page in each language reaches a score of 0.82 to 0.85, a Total Blocking Time of 590 to 755 ms and 337 kB of script, of which MapLibre is 280 kB and a single long task of about 600 ms. Its LCP and CLS stay within budget, and so do the other categories. On GitHub's runner, whose CPU is about twice as slow, the same pages reach a score of 0.72 to 0.74 and a Total Blocking Time of 1,483 to 2,062 ms: Lighthouse slows down the CPU of the machine it runs on by a fixed factor, so these two measures depend on that machine, unlike the weight of the script.

## Decision

- Pages that show the map, `/` and `/fr`, have their own budget, set from the measures of the CI runner, where it is enforced, with a margin: a score of at least 0.70, a Total Blocking Time of at most 2,500 ms and at most 350 kB of script. The weight of the script, the same on every machine, is the reliable guard against a regression.
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
