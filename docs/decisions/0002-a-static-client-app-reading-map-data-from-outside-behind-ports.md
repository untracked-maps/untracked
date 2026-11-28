---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# A static client app, reading map data from outside behind ports

## Context and Problem Statement

The previous repository held the web app and the code that produced its data: scripts that read OpenStreetMap extracts, joined other open data sets, scraped shop websites and built search indexes. Scheduled workflows ran that code and committed its output to the branch the site was served from, which grew hundreds of times heavier than the whole history of the app. The hosting platform then suspended the account and the organisation that owned the repository, for a use of its continuous integration that its terms reserve to building, testing and publishing software, and the site went offline.

The app reads most of what it shows from existing services and open data. The data it produced itself was optional for every feature but a few.

What does this repository hold, and where does the data the map shows come from?

## Decision Drivers

- The repository and its continuous integration stay within what a software forge accepts: building, testing, releasing and publishing software.
- The app and the production of data have different lifecycles, and different legal questions.
- A source of data can be replaced without touching the rules of the app.

## Considered Options

- The web app only, with every map data read from outside through ports
- The data pipelines next to the app, run by the continuous integration
- The data pipelines next to the app, on a rented server

## Decision Outcome

Chosen option: « The web app only, with every map data read from outside through ports », because it keeps the repository within what its forge accepts, and it lets a source of data change without changing the app.

### The repository holds the web app only

The repository holds the code that runs in the browser, its tests, and the tooling that builds and publishes it. No code that produces, transforms or harvests data consumed by the map lives here. When the app needs data that no existing source publishes, a dedicated project produces it, outside this repository.

### Data comes from outside, behind ports

The app reads its data from existing services, open data or a dedicated data project, each through a port of the ability that needs it. An adapter translates the source into the shapes of the domain; replacing a source replaces an adapter, never a use case.

### The continuous integration builds, tests, releases and publishes only

No workflow fetches, transforms or stores data for the map. Scheduled workflows test or scan the software, nothing else.

### Fake data is not map data

Data invented to develop and show the app, generated from the code of the repository at build time and replacing no real source, is not produced map data: it stands behind the same ports, until a real source replaces its adapter.

### Consequences

- Good, because the repository never grows with published data, and its continuous integration does nothing its forge reserves.
- Good, because every source of data is an adapter, which a test replaces by a fake and a later source replaces for good.
- Bad, because the features of the previous app that rested on self-produced data come back only when an external source, or a dedicated project, covers them.
- Neutral, because the line between fake data and produced data rests on review: no tool tells them apart.

### Confirmation

Review refuses a workflow that is not a build, a test, a scan, a release or a deployment, and any code that harvests or transforms map data. The dependency rules keep adapters behind the ports of the domain.

## Pros and Cons of the Options

### The data pipelines next to the app, run by the continuous integration

What the previous repository did. It brought every feature at once, but it is the use of continuous integration that got the previous organisation suspended, and its output weighed on the history of the repository.

### The data pipelines next to the app, on a rented server

It would bring back the features that rest on self-produced data sooner, and keep them off the forge's continuous integration. It still mixes two products with different lifecycles in one repository, and the scraping raises legal and abuse questions that no host settles.

## More Information

### Where to find the detail

- [The adapters of each ability](../../src/features/)
- [The workflows](../../.github/workflows/)

### References

- [GitHub Actions terms of use](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#actions)
- [Hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/)

### History

- 2026-11-28, marc-gavanier: first writing.
