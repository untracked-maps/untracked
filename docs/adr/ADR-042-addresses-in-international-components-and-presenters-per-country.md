# ADR-042 — Addresses in international components, and presenters per country

**Date**: 2026-11-20
**Status**: accepted

## Context

A place's address is one line today, `5 avenue Anatole France, 75007 Paris`, written in the French order by the fake places ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)) and cut into parts again to be searched ([ADR-037](ADR-037-find-addresses-in-the-search-field-detected-ranked-and-mixed-with-places.md)). The previous app showed addresses outside France, a Dutch one among them, where the number follows the street and the postcode differs in shape. The order of an address's parts, and which parts it has, depend on its country.

Formatting addresses by country is a known problem, solved in two halves:

- **The components**: [ISO 19160-4](https://www.iso.org/standard/83470.html), built on the Universal Postal Union's S42, defines the components of a postal address and a language of templates to render them by country. schema.org's [`PostalAddress`](https://schema.org/PostalAddress) holds a smaller set, widely used: street address, postcode, locality, region and country, the country as an [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) code.
- **The templates**: OpenCage's [address-formatting](https://github.com/OpenCageData/address-formatting), under the MIT licence, holds a template and test cases for each country and territory, with implementations in many languages, JavaScript among them. Google's [libaddressinput](https://github.com/google/libaddressinput) holds a format per country too, made for input and validation rather than display.

## Decision

- **The domain holds an address in components**, named after ISO 19160-4 and schema.org's `PostalAddress`, with its country as an ISO 3166-1 alpha-2 code. A type, `Address`, enforces it.
- **Presenters render an address in its country's format** with OpenCage's templates, through a maintained JavaScript implementation, rather than templates of our own. dependency-cruiser keeps that package in `*.presenter.ts` files.
- **The change comes with the next ability that touches addresses**, in its pull request ([ADR-039](ADR-039-standards-first-and-their-libraries-in-the-domain.md)): the fake places then generate components, and the search of addresses reads them instead of cutting a line.

## Consequences

- OpenCage's templates name their components after OpenStreetMap's tags, not ISO 19160's: a presenter maps one to the other, in one place.
- Until that ability lands, addresses stay one French line.

## Alternatives considered

- **Templates of our own per country**: a standard rewritten, country by country, without its test cases.
- **ISO 19160-4's template language implemented ourselves**: the international standard, but no maintained JavaScript implementation, and a paying text.
- **libaddressinput's formats**: maintained, but made for forms rather than display.
- **Keeping one line in each country's order**: no structure to search or format, and every source translated into French order.
