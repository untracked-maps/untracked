# ADR-022 — Lighthouse budgets per page

**Date**: 2026-11-15
**Status**: accepted

## Context

Lighthouse CI held every page to the same budget: a performance score of at least 0.95, a Total Blocking Time of at most 100 ms and at most 120 kB of script. With the map, measured on 2026-11-15 with Lighthouse's mobile throttling over three runs, the home page in each language reaches a score of 0.82 to 0.85, a Total Blocking Time of 590 to 755 ms and 337 kB of script, of which MapLibre is 280 kB and a single long task of about 600 ms. Its LCP and CLS stay within budget, and so do the other categories.

## Decision

- Pages that show the map, `/` and `/fr`, have their own budget, the measured level with a margin: a score of at least 0.80, a Total Blocking Time of at most 800 ms and at most 350 kB of script.
- Every other page keeps the strict budget, and `/privacy` in both languages is now audited, so that a page without the map stays light.
- The other assertions, accessibility, best practices, SEO, LCP and CLS, are the same for every page.

## Consequences

- A change that makes the map pages heavier than measured fails, as does one that brings the map's weight into another page.
- Each new ability shown on the map counts against the same budget; raising it again requires measuring and updating this record.

## Alternatives considered

- **One looser budget for every page**: simpler, but a page without the map could then grow threefold unnoticed.
- **Loading MapLibre after the page is interactive**: a better score, but the map is the content of the page, and the visitor waits for it all the same.
