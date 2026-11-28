# ADR-078 — Weight caps close to the measure, and the size difference on each pull request

**Status**: proposed
**Date**: 2026-11-28
**Decision-makers**: the maintainer

## Context and Problem Statement

size-limit caps the weight of the build with gzip ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)): MapLibre, the opening-hours library ([ADR-073](ADR-073-opening-hours-read-in-the-time-zone-of-the-place-by-a-library-loaded-apart.md)), the rest of the app, and two data files ([ADR-063](ADR-063-a-weight-budget-for-the-places-file.md), [ADR-075](ADR-075-the-places-file-split-from-the-details-of-the-places.md)). Those caps were set well above the measure, as guards against drift: a change could add tens of kilobytes without anyone seeing it. "The rest of the app" mixed the code a visitor loads at opening with the code loaded when a feature is first used, so moving code out of the first load changed nothing in the measure. The other files the app fetches had no cap, and Lighthouse failed on the Total Blocking Time, a measure that depends on the machine that runs it ([ADR-069](ADR-069-measuring-what-the-visitor-of-the-map-sees.md)).

How should the weight of the app be held, so that every change sees what it costs, and only a measure that is the same on every machine fails it?

## Decision Drivers

- The weight is the same on every machine; the Total Blocking Time is not.
- Every pull request shows what it adds or removes, without a reviewer building it.
- What a visitor loads at opening is told apart from what loads on demand, by the build's own record rather than by guesses on file names.
- One judge: two tools that fail on weight would disagree on how they measure.
- No service outside GitHub receives the build.

## Considered Options

- **Caps close to the measure in size-limit, start-up and on-demand code told apart by Vite's manifest, and the difference shown by compressed-size-action**
- Caps with a wide margin, as before
- Start-up and on-demand code told apart by markers in the chunks, or by SvelteKit's own list of preloaded chunks
- Lighthouse as the only judge of weight
- size-limit's own GitHub action, or a bundle analysis service, to show the difference

## Decision Outcome

Chosen option: **caps close to the measure in size-limit, start-up and on-demand code told apart by Vite's manifest, and the difference shown by compressed-size-action**, because it is the only option where every change sees its cost, the measure is the same everywhere, and the build itself says what loads when.

- **The weight blocks; the Total Blocking Time is published without blocking.** Lighthouse reports it as a warning, and the Lighthouse job writes it, with the other measures of each run, to the job's summary.
- **Every cap is the measured gzipped size rounded up to the next whole kilobyte.** A cap is raised only with a justification in the pull request that raises it.
- **At start-up, three caps**: MapLibre, the opening-hours library, which is preloaded once the map is shown and so counts at start-up, and the rest of the start-up code. **One cap for the code loaded on demand.**
- **Start-up and on-demand code are told apart by Vite's manifest**, which SvelteKit writes at each build. A chunk reached from an entry through static imports loads at start-up; a chunk reached only through a dynamic import loads on demand. The two libraries are still found by a string only their code holds, since the bundler names a chunk after one of its modules, not after the library it carries.
- **One cap for each data file the app fetches**, and, for a folder of many small files such as the stations, the pictures of a street, the glyph ranges or the sprite, one cap on its heaviest file.
- **One global cap in Lighthouse on the map pages**, for everything loaded at opening, tiles of the basemap included, set close to its measure on the CI runner.
- **compressed-size-action shows the difference on each pull request**, in its own workflow, with the right to comment only. It never fails the pull request: size-limit stays the only judge. It strips the hash from the names of the entries and route nodes so that they are compared across builds; the shared chunks, named by their hash only, show as removed and added when they change.
- **Its minimum change is 20 bytes per file**, drawn from the history below.

### Consequences

- Good, because a change that adds a kilobyte to any part of the app fails the build until its pull request says why, and the comment of the pull request shows where.
- Good, because moving code from start-up to on demand now shows in the measure.
- Good, because the Total Blocking Time of a slow runner no longer fails a change that did not touch the code.
- Bad, because ordinary work raises caps often: each new ability needs a line of justification and a new cap.
- Bad, because the job that shows the difference builds the app twice, and comments only on pull requests from the repository itself: GitHub gives no write right to a pull request from a fork, and the action then prints its table in its log.
- Bad, because MapLibre's worker, built apart from the chunks, is outside Vite's manifest and outside every size-limit cap; only Lighthouse's global cap holds it.
- Neutral, because SvelteKit's client runtime entry, a few dozen bytes reached by a dynamic import but preloaded by every page, counts on demand.

### Confirmation

size-limit runs in CI's Build job and fails past any cap. The pure function that reads the manifest is unit tested, and the architecture checks treat size-limit's configuration as an entry point.

## Pros and Cons of the Options

### Caps with a wide margin, as before

- Good, because a step of work rarely touches a cap.
- Bad, because tens of kilobytes add up unseen until a cap is reached, and the step that reaches it pays for all the others.

### Markers in the chunks, or SvelteKit's list of preloaded chunks

- Good, because a marker names a library, which the manifest cannot.
- Bad, because a marker for every part of the app is a guess that breaks when the code changes, and SvelteKit's list is written into its generated server code, not in a documented format.

### Lighthouse as the only judge of weight

- Good, because it measures what a browser really loads, basemap tiles included.
- Bad, because it needs a browser and a server, its total depends on the tiles of the view, and it cannot tell which part of the app grew.

### size-limit's own GitHub action, or a bundle analysis service

- Good, because size-limit's action reports the same entries as the caps.
- Bad, because it judges too, so a second tool fails on the same weight, and a service such as RelativeCI or Codecov receives the build outside GitHub.

## More Information

The threshold was drawn from the archives of the 32 releases from v1.0.0 to v1.30.0 that carry one; v1.16.0, v1.22.0, v1.23.0 and v1.24.0 have none. Each file whose name survives hash stripping (entries, route nodes, MapLibre's worker, data files) was compressed with gzip at its highest level, and compared with the same file of the release before.

| Change of a file between two releases | Count |
| ------------------------------------- | ----: |
| 1 to 5 bytes                          |    58 |
| 6 to 15 bytes                         |    12 |
| 16 to 21 bytes                        |     0 |
| 22 to 100 bytes                       |     9 |
| more than 100 bytes                   |    51 |
| all                                   |   130 |

The changes of 15 bytes or less are all in the entries and route nodes, whose text holds the hashed names of the chunks they import, and changes with them. The first change above them, 22 bytes, is a chunk added to the imports of the app's entry: a change of the build's structure, worth showing. A threshold of 20 bytes hides that churn, more than half of the changes, and shows every other change seen in the history.
