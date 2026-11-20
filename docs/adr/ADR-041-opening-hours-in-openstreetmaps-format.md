# ADR-041 — Opening hours in OpenStreetMap's format

**Date**: 2026-11-20
**Status**: accepted

## Context

The place sheet will show when a place is open, and a search may keep only the places open now. The previous app read OpenStreetMap's `opening_hours` values with the [opening_hours](https://github.com/opening-hours/opening_hours.js) library. The rewrite first proposed a simpler shape of our own, ranges of hours for each weekday, with the rule "open now" written in the domain, to keep the domain free of packages ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)). [ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) orders shapes from standards and allows a domain to import the library that implements one.

Three standards describe opening hours:

| Need                                           | OpenStreetMap `opening_hours` | schema.org `openingHoursSpecification` | iCalendar recurrence (RFC 5545), as Open Referral's HSDS uses it |
| ---------------------------------------------- | ----------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| Ranges per weekday, several a day              | yes                           | yes                                    | yes                                                              |
| Public holidays                                | `PH`                          | `PublicHolidays`                       | one excluded date per holiday                                    |
| School holidays                                | `SH`                          | no                                     | no                                                               |
| The nth weekday of a month, odd and even weeks | yes                           | no                                     | yes                                                              |
| Seasons and date ranges                        | yes                           | `validFrom`, `validThrough`            | yes                                                              |
| Sunrise and sunset, open end, comments         | yes                           | no                                     | no                                                               |
| Readable without a parser                      | no                            | yes                                    | in part                                                          |

## Decision

- **Opening hours are an OpenStreetMap `opening_hours` value**: it represents the information best, and it is the format of the data a real source will most likely hold.
- **The domain reads them with the opening_hours library**, added to `DOMAIN_PACKAGES` by the ability that first needs it. The rules of the domain, such as "open now" or "opens next at", use it, public holidays included, which it computes from the country and region of the place.
- **A value is checked once**: a branded type, `OsmOpeningHours`, is built only by a function that parses the value with the library, so that a value nobody checked does not compile where opening hours are expected.
- **Presenters render the hours** for what a page shows, a table per weekday or "closes at 18:00", through the same library. dependency-cruiser keeps their rendering in `*.presenter.ts` files.

## Consequences

- The library is under the LGPL-3.0, while the app is under the AGPL-3.0 ([ADR-015](ADR-015-agpl-3.0.md)). The pull request that adds it checks what the LGPL asks of a work that bundles it, and records it here.
- Public holidays depend on the library's own definitions, by country and region; a country it does not know has no public holiday.
- The fake places get opening hours in this format from their generator, in the pull request of the ability that shows them.

## Alternatives considered

- **Our own ranges per weekday, the rule written in the domain**: no dependency, but a standard rewritten in part, without holidays, and translated from the real one later.
- **schema.org's `openingHoursSpecification`**: structured and easy to read, but without school holidays, the nth weekday of a month or open ends.
- **The library behind a port, in an adapter**: the domain stays free of packages, but "open now" leaves it, and its Gherkin scenarios with it.
