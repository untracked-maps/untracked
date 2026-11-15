# ADR-027 — Lighthouse audits one page per runner

**Date**: 2026-11-16
**Status**: accepted

## Context

Lighthouse CI audits the four pages of [ADR-022](ADR-022-lighthouse-budgets-per-page.md) at the addresses visitors use, each by a browser in its own language: `pnpm test:lighthouse` runs the English pages, then the French ones, three runs each, one page after the other, in a single job. It is the slowest of the checks, about 2 min locally. Lighthouse's documentation advises against running audits concurrently on one machine, since they compete for the CPU and skew the performance measures, the very ones the budgets of ADR-022 depend on. Lighthouse CI reads `--collect.url` on the command line in place of a `url` list in its configuration, and adds up the `--collect.url` flags given on the command line.

## Decision

- **In CI, one job per page.** A matrix lists each page with the language of its browser; each entry builds the site and audits its page alone on its runner, three runs as before, with the same Chrome flags as the local scripts, under the name `Lighthouse (<page>)`. The measures stay comparable with those that set the budgets.
- **One required check.** A last job named `Lighthouse` fails unless every page succeeded. It runs even when they fail or are skipped, since GitHub counts a skipped required check as passing. The branch ruleset requires this one name, whatever pages the matrix holds.
- **Locally, a quick audit.** `pnpm test:lighthouse:quick` audits every page once instead of three times, in both languages, to check a change before pushing; `pnpm test:lighthouse` keeps the three runs of CI.

## Consequences

- The Lighthouse check takes as long as its slowest page instead of the sum of the four; each runner builds the site.
- On 2026-11-16, on an idle machine, `pnpm test:lighthouse` took 126 s, the quick audit 44 s, and one page with three runs, as a CI job runs it, 33 s.
- A single run is noisier than the median of three: the quick audit can fail or pass where CI does not, close to a budget. CI stays the reference.
- The pages and their languages are listed twice, in the workflow's matrix and in the `test:lighthouse:en` and `test:lighthouse:fr` scripts: a page added to the scripts must be added to the matrix, or CI does not audit it. The budgets need no change, since the matrix of assertions matches each page by its URL.

## Alternatives considered

- **Concurrent audits on one runner**, such as `xargs -P`: no extra runner, but the audits share the CPU, which Lighthouse advises against.
- **One job per language script**: the pages listed once, but two pages in series on each runner, and the scripts' `--collect.url` flags add up, so a job cannot narrow a script to one page.
- **A list of pages read by both the scripts and the workflow**: a single source, but a script of our own to turn it into Lighthouse CI's flags, for four pages that rarely change.
- **Building once and sharing the site as an artifact**: one build instead of four, but a job in series before the audits, and an upload and a download, for a build of about 20 s.
- **Requiring each `Lighthouse (<page>)` check in the ruleset**: no extra job, but the ruleset would change with each page, and a page missing from it would not block a merge.
- **Fewer runs in CI**: faster, but the budgets of ADR-022 were set from the median of three runs.
