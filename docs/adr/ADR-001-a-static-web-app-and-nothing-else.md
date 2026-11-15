# ADR-001 — A static web app, and nothing else

**Date**: 2026-11-15
**Status**: accepted

## Context

The previous repository, `UntrackedMaps/untracked`, held the web app and the code that produced its data: Python scripts that read OpenStreetMap extracts, joined Overture Maps and All The Places, scraped tens of thousands of shop websites and built search indexes. Seven scheduled GitHub Actions workflows ran that code and committed its output to the `gh-pages` branch, which grew to 811 MB while the app's whole history weighed 5 MB. On 2026-11-14, GitHub suspended the account and the organisation that owned the repository, and the site went offline.

The app reads most of what it shows from existing services and open data. The data it produced itself was optional for every feature but place cards and local search.

## Decision

This repository holds the web app only: the code that runs in the browser, its tests and the tooling that builds and publishes it. No code that produces, transforms or harvests data consumed by the map lives here. When the app needs data that no existing source publishes, a dedicated project produces it, outside this repository, and the app reads it through a port like any other source.

## Consequences

- The app fetches its data from external sources at run time, behind ports ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)).
- Features that relied on self-produced data (place cards with prepared photos and opening hours, local search, cycle network overlays, metro exits) come back only when an external source covers them.
- The repository stays small, and its CI only builds, tests and publishes software ([ADR-003](ADR-003-github-actions-build-test-and-publish-only.md)).

## Alternatives considered

- **Keep the data pipelines next to the app, on a rented server.** It would bring back the features above sooner, but mixes two products with different lifecycles, and the scraping raises legal and abuse questions that no host settles.
