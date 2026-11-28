---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# Weight caps close to the measure, and the Total Blocking Time as a warning

## Context and Problem Statement

The map pages load a rendering library that fills most of their first view, and each ability added beside it pushed them toward their budget, while the other pages carry little. Lighthouse audits the built pages in CI, but its Total Blocking Time and its performance score depend on the runner: on the same commit, runs of one day differed several times over, and a slow runner failed changes that had not touched the code. The weight of the build is the same on every machine.

The first weight caps were set well above the measure, as guards against drift: a change could add tens of kilobytes unseen, and the change that reached a cap paid for all the others. One cap mixed the code of the first view with the code loaded on demand ([0022](0022-what-the-first-view-does-not-need-loaded-on-demand.md)), so moving code out of the first view changed nothing in the measure.

How should the weight and the speed of the app be held, so that every change sees what it costs, and only a measure that is the same on every machine fails it?

## Decision Drivers

- A check that blocks a change gives the same answer on every machine, or is wide enough to catch only an aberrant page.
- Every pull request shows what it adds or removes, without anyone building it by hand.
- What loads at start-up is told apart from what loads on demand by the build's own record.
- The map pages and the other pages are held apart: one budget for both would let the light pages grow unseen.
- No measure is taken on the visitors' devices: the app collects nothing about them.

## Considered Options

- Weight caps close to the measure in size-limit, start-up and on-demand code told apart by the build's manifest, Lighthouse per page with the Total Blocking Time as a warning, the difference shown on each pull request
- Weight caps with a wide margin
- Lighthouse as the only judge of weight and speed
- Measures taken on the visitors' devices
- A runner with a GPU, to measure the smoothness of the map

## Decision Outcome

Chosen option: « Weight caps close to the measure in size-limit, start-up and on-demand code told apart by the build's manifest, Lighthouse per page with the Total Blocking Time as a warning, the difference shown on each pull request », because the weight is the same on every machine, and caps close to it show each change its cost.

### The weight blocks, close to the measure

size-limit caps every part of the build with gzip, each cap at the measured size rounded up. At start-up, one cap for the map library, one for the opening-hours library, preloaded after the first view, and one for the rest of the start-up code; one cap for the code loaded on demand; one cap per data file, and for a folder of many small files, one on its heaviest file. Start-up and on-demand code are told apart by the manifest the bundler writes at each build: a chunk reached through static imports from an entry loads at start-up, a chunk reached only through a dynamic import loads on demand. A cap is raised only with a reason given in the pull request that raises it.

### One global cap, in Lighthouse, for what the map pages load at opening

Lighthouse holds the total weight of script that each kind of page loads at opening, the map pages and the other pages apart, close to its measure on the CI runner. It is the only cap that holds what the bundler's manifest does not list, such as the worker of the map library.

### The Total Blocking Time only warns

The Total Blocking Time is published as a warning, never a failure, and the measures of each run are written to the job's summary, so that a budget is revised from the runner's measures. The other measures that depend on the machine keep budgets that, on the map pages, catch only an aberrant page. Lighthouse keeps its default simulated throttling, so that its measures compare with public tools. Each page is audited alone on its runner, so that audits do not share a processor, and a commit is measured once: an audit is never rerun to make it pass.

### The difference shown on each pull request

compressed-size-action comments, on each pull request, the size difference of each file of the build, above a threshold drawn from the history of releases. It never fails: size-limit judges.

### Consequences

- Good, because a change that adds weight to any part of the app fails until its pull request says why, and its comment shows where.
- Good, because moving code from start-up to on demand shows in the measure.
- Good, because a slow runner no longer fails a change that did not touch the code.
- Bad, because ordinary work raises caps often: each new ability needs a reason and, for a new file, a new cap.
- Bad, because a regression of the Total Blocking Time that adds no weight passes CI, seen only in the warning and the summary.
- Bad, because the job that shows the difference builds the app twice, and cannot comment on a pull request from a fork.
- Neutral, because the two libraries are still found in the build by a string only their code holds, since the bundler names a chunk after one of its modules.

### Confirmation

size-limit runs in CI's build job and fails past any cap. Lighthouse fails past the weight of script of each kind of page. The function that reads the manifest is unit tested.

## Pros and Cons of the Options

### Weight caps with a wide margin

A step of work rarely touches a cap. Tens of kilobytes add up unseen until a cap is reached, and the step that reaches it pays for all the others.

### Lighthouse as the only judge of weight and speed

It measures what a browser really loads. It needs a browser and a server, it cannot tell which part grew, and its speed measures fail on slow runners.

### Measures taken on the visitors' devices

What native platforms rely on most. It would collect data from visitors, against the purpose of the app.

### A runner with a GPU, to measure the smoothness of the map

The measure closest to a phone. Paid, and without it a measure of frames only times software drawing on runners whose speed varies.

## More Information

### Where to find the detail

- [The weight caps](../../.size-limit.ts)
- [The Lighthouse budgets](../../lighthouserc.json)
- [The audits and the build in CI](../../.github/workflows/checks.yml)
- [The size difference on each pull request](../../.github/workflows/size.yml)

### References

- [size-limit](https://github.com/ai/size-limit)
- [compressed-size-action](https://github.com/preactjs/compressed-size-action)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Vite's manifest](https://vite.dev/guide/backend-integration)

### History

- 2026-11-28, marc-gavanier: first writing.
