# ADR-043 — Standards first, and their libraries in the domain

**Date**: 2026-11-20
**Status**: accepted

## Context

The next abilities need places described in more detail: phone, website, opening hours, date of the last check, country, accessibility, practical notes, photos and a description. The source of real places is not chosen yet ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)), so each ability defines the shape it reads and its fake data. Left to each change, these shapes would be invented one by one, and the real source would have to be translated into all of them.

For most of these fields a standard exists, sometimes several: schema.org describes a place's phone, website, address and opening hours, ISO 3166-1 its country, ISO 8601 its dates, OpenStreetMap a tag for each. They do not all represent the information equally well: for opening hours, OpenStreetMap's `opening_hours` holds public and school holidays, the nth weekday of a month or sunrise, which schema.org's `openingHoursSpecification` cannot. A rich standard often needs a library to be read, and the domain could only import `rxjs` ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)), which pushed toward rewriting the standard, or a part of it, in our own code.

## Decision

- **A shape is chosen from standards, in this order**: the standard that represents the information best, with the fewest known defects; otherwise an international standard; otherwise OpenStreetMap's tagging; and only then anything else. Where no standard exists, the shape we propose stays as close as possible to a real one. The ADR of the ability records the choice and the standards set aside.
- **The domain may import a library that implements a standard**, so that we never rewrite the standard ourselves. `.dependency-cruiser.ts` lists the packages allowed in a domain by name, in `DOMAIN_PACKAGES`: `rxjs` ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)) and, from now on, each such library, added by the change that first needs it, with its ADR. Any other package in a domain stays an error.
- **One pull request per ability**, as a rule rather than an absolute: the ability, the shape of the data it needs and their fakes. CI's `Abilities` job warns, without failing, when a pull request touches several abilities.

## Consequences

- Choosing the best standard is a judgement no tool checks: the review and the ADR of each ability carry it.
- A library in a domain is a dependency the domain's tests run against: its licence and its upkeep are weighed in its ADR, like any other package's.
- The real source of places, when it lands, is read through standard shapes, and its adapters translate into them.

## Alternatives considered

- **International standards first, OpenStreetMap second**: the first rule, set aside for opening hours, where OpenStreetMap's format holds what schema.org's cannot.
- **Our own simple shapes, and rules written in the domain without a library**: no dependency, but a standard rewritten, partly, by us, and translated to and from the real one later.
- **A library behind a port, in an adapter**: the domain stays free of packages, but its rules, such as "open now", move out of it and out of its Gherkin scenarios.
- **Blocking a pull request that touches several abilities**: the rule would become absolute, while a shared change sometimes needs several.
