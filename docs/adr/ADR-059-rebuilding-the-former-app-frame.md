# ADR-059 — Rebuilding the former app: frame

**Date**: 2026-11-24
**Status**: accepted

## Context

The product owner rebuilds the former Untracked Maps app in this repository, step by step, from an inventory of the former app and an archive of its measures, texts and drawings. Both are kept outside this public repository. The plan is issue #46: each step has its own issue and pull request, and its own ADR when it picks a library, a protocol or a rule.

Some decisions hold for every step, until the end of the plan. They were taken by the product owner in the comments of #46, and written nowhere in the repository. [ADR-024](ADR-024-locate-me-with-fake-positions-before-the-geolocation-api.md) and [ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md) work on fake data without stating it as a rule, and [ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md) describes the generator of fake places, not who extends it.

## Decision

Until the last step of the plan:

- **The app is sealed**: it shows fake data and calls fake services only. No external service is added to those it already calls ([ADR-021](ADR-021-maplibre-and-the-openfreemap-basemap.md), [ADR-035](ADR-035-satellite-view-transit-lines-and-bike-lanes-from-public-open-data.md)), and no data is computed here ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)).
- **The rebuild extends the fake-data generator itself**, in pull requests the maintainer reviews. The fake places stay in Paris. A behaviour of the former app about places outside Paris, such as a namesake hundreds of kilometres away, another country's address format or its public holidays, is covered by tests that write their own places ([ADR-012](ADR-012-testing-strategy.md)); the app does not show such places.
- **The content of the fake data**, such as which places have photos or opening hours, is chosen by the pull request of the step: ordinary places get it at random, the famous places by hand.
- **The drawings and the displayed texts of the former app may be reused**: the product owner does not count them as code. The thumbnails of the map types stay gradient backgrounds.
- **The English texts** are written in the pull request of each step, and the product owner reviews them there.
- **A measure missing from the archive** is taken from one the new app already uses, and the pull request says so.
- **A button or a link of a lot not rebuilt yet**, such as Directions, Save, Reviews or Correct, is hidden until its lot.
- **Product questions are the product owner's; the method and the technical quality are the maintainer's.** Only what blocks a step goes to the maintainer beforehand. A step's technical choices are reviewed in its pull request, through its ADR.

## Consequences

- Almost every step extends the generator: the places file grows with each one, and each step measures the weight of the app in its pull request.
- Every displayed text is written in French and in English ([ADR-009](ADR-009-translations-with-paraglide-and-the-locale-in-the-url.md)), the English one with no former text to follow.
- Nothing in the repository compares the rebuilt app with the former one: the inventory and the archive are the reference, outside the repository.
- Reused drawings and texts enter under this repository's licence ([ADR-015](ADR-015-agpl-3.0.md)); the maintainer confirms that point in the review of this decision.
- When a real source of places arrives, the places outside Paris and the behaviours kept in tests are looked at again.

## Alternatives considered

- **Keeping these decisions in #46 only**: a ticket is rewritten by every session and reviewed by no one; they were lost from its description once already.
- **One ADR per decision**: most are one line, and they share one end, the last step of the plan.
- **Fake places outside Paris in the app**: they would show behaviours of the former app, but as invented places abroad, which the product owner did not ask for.
