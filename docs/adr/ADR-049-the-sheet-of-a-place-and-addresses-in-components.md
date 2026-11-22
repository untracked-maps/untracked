# ADR-049 — The sheet of a place, and addresses in components

**Date**: 2026-11-21
**Status**: accepted

## Context

Choosing a place in the search or in the list of a kind of places left the visitor without anything telling what the place is. The previous app opened the sheet of the place: its name, its type, its address, and a way to copy the address. Its measures and texts were read in its code on 2026-11-21 and are listed in issue #53.

[ADR-042](ADR-042-addresses-in-international-components-and-presenters-per-country.md) asks the next ability that touches addresses to hold them in components and to write them with OpenCage's templates; this one shows an address, with its city, as oertio decided. The fake places had a one-line address in French order, cut into parts again for the search of addresses.

## Decision

- **A new ability, `open-place`, in the `places` feature.** Its use case opens a place by its id, from the search or from the list of a kind, and reads the place in the places file through its own adapter; a place the file does not hold opens nothing. It tells where the place was opened from, so that the home page brings the list back when the sheet closes. A second use case copies the address shown through a port, the clipboard, and says whether the device copied it.
- **Addresses in components**, as ADR-042 decided: house number and street, after OpenStreetMap's `addr:housenumber` and `addr:street`, since schema.org's `PostalAddress` keeps them in one `streetAddress`; postal code, locality and country, after schema.org's `postalCode`, `addressLocality` and `addressCountry`, the last one an ISO 3166-1 code ([ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md)). The fake places generate them, the addresses file is built from them, and the search reads them for places, addresses and recent places.
- **[`@fragaria/address-formatter`](https://github.com/fragaria/address-formatter)** writes an address in its country's format, with OpenCage's templates: MIT, maintained, the JavaScript implementation OpenCage lists. A presenter of a new library, `postal-address`, loads it on demand, since its templates weigh about 62 kB compressed, and dependency-cruiser keeps the package in `*.presenter.ts` files. Its type declarations name a `format` export that its ES build does not have: a declaration file states its default export, and Biome allows that file a default export.
- **The type of a place** is a table from the kind to a message, the previous app's labels, with OpenStreetMap's `cuisine` added after « · » when the cuisine is known. A place without a known kind is « Lieu ». The sheet has its own messages, apart from those of the search, since step 17 makes its types more precise.
- **The chosen place is marked by a larger dot in a DOM marker**, drawn in SVG from the pictograms and colours of [ADR-046](ADR-046-places-shown-as-dots-coloured-by-family.md), which move up to the feature so that both abilities share them. A marker stands above the canvas and the markers of the list of a kind, which a symbol layer of the sprite could not. Its name takes the colour of its family, in either theme. The small dot of the same place is left out while its sheet is open, whatever it was opened from: `show-places` takes the id of the open place as a second input stream.
- **The sheet takes its place in the order of [ADR-047](ADR-047-escape-and-the-back-button-close-what-is-open-in-order.md)**, after the sheet of a spot and before the list of a kind. Chosen in the list of a kind, a place leaves the list open under its sheet; chosen in the search, it clears the kind shown.

## Consequences

- Recent places kept by an earlier version, with a one-line address, are left out once.
- The addresses file still carries a one-line address for the sheet of a spot, written by the fake generator in French order; that sheet reads components when step 9 changes it.
- A long press on the address copies it, after 480 ms, unless the finger moves more than 10 px; the device vibrates 10 ms where it can. A copy refused tells the visitor in a short notice ([ADR-045](ADR-045-short-notices-with-one-action.md)).
- The weight of the app grows by the templates of every country, loaded only once an address is shown.

## Alternatives considered

- **Templates of our own for France**, or the address written in French order by the generator: the standard rewritten, which ADR-042 set aside.
- **The formatter loaded with the page**: simpler presenters, but 62 kB more to load and run before the map, against the budgets of [ADR-022](ADR-022-lighthouse-budgets-per-page.md).
- **The large dot as a symbol layer with the sprite**: drawn by MapLibre with the other dots, but under every DOM marker, those of the list of a kind among them.
- **Opening the sheet with the place itself rather than its id**: the search and the list would carry the family and every field of the sheet, which they do not need; links (step 11) open a place by its id too.
