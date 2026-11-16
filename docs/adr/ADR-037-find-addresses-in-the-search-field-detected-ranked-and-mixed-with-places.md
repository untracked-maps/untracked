# ADR-037 — Find addresses in the search field: detected, ranked and mixed with places

**Date**: 2026-11-16
**Status**: accepted

## Context

The previous app found addresses and streets in the same field as places. A query holding a digit was an address, unless it named a transit line, and went to the Géoplateforme's geocoder first; a query holding a kind of street ("rue", "place", "bd"…, abbreviations spelt out) was a street. An address found cleanly, the exact house or a street holding every word typed, came alone, five at most; otherwise the first address came first, then three places, then the other addresses, seven at most. Clean streets came first, three at most, then the places, then the other streets. A postcode alone ("75011") gave, as the geocoder answered, three streets of that postcode, then its arrondissement. Among equally good answers, the nearest to the map came first. Its rows named the address, its postcode and town, over the kind (address, street, or town or arrondissement), the postcode and the town again, with the pin of the places.

The rebuilt app has no geocoder yet. The fake Paris already gives each place an address ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)), served as `addresses.json` for `inspect-point` ([ADR-034](ADR-034-inspect-a-point-with-the-nearest-fake-address.md)). `search-places` owns the field and its listbox ([ADR-030](ADR-030-search-by-name-with-minisearch-and-our-own-ranking.md), [ADR-033](ADR-033-recent-searches-kept-on-the-device.md)), and abilities never import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)).

## Decision

- **A new ability, `search/find-address`.** Its use case is a stream function of two ports, `LoadAddresses` and `IndexAddresses`, from the place finders of `search-places` to finders that add the addresses ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). The route composes the two by plain function application, in `+page.ts`: `indexPlaces: (places) => findAddress(…)(miniSearchIndex(places))` ([ADR-008](ADR-008-composition-in-routes.md)). `search-places` does not know addresses exist; it only learns, through the feature's `Found` model, that a result may be a place or an address.
- **Shared rules move up to the feature**: the typo count (`typos`), the folding and stop words (`words`), the quality of a typed word against a word of a name (`word-quality`) and the score of a text match (`text-match`) leave `search-places` for `search/domain`, unchanged; so does the `Found` model, a place or an address of kind `address`, `street` or `district`, with the labels of those kinds.
- **Detection**, in order: a query holding a digit is an address query; else a query holding a kind of street, once abbreviations are spelt out, is a street query; else it is a name and the places come alone, untouched. A house number is a first word of one to four digits, with "bis" or "ter" attached or next to it; a postcode is any word of five digits; "paris" and the stop words of names are left out. The kinds of street (24) and the abbreviations (14, those of the previous app: "bd", "av", "pl", "st"…) are data, in `street-words.json`, tested as a whole.
- **Matching**: every street word typed must match a word of the street, with the tolerance of the search by name: one typo from four letters, two from eight, the beginning of the last word. A house matches only at the number typed; a street matches with or without a number, so that a number the street does not have still gives the street; an arrondissement matches its postcode alone or the words of its name ("11e arrondissement"). A postcode typed keeps to its addresses. An address is _clean_ when every word matches exactly, the last one possibly cut short.
- **Ranking**: the house at the number typed first, then the better text match, with the score of the search by name (quality of the words, weighted by the share of the street they cover), then the nearest to the centre of the map. Seven at most.
- **Mixing**, as the previous app: clean first address, the addresses alone, five at most; otherwise the first address, three places, the other addresses, then the other places, seven at most; for a street query, the clean streets, three at most, then the places, then the other streets, seven at most. No address found, the places alone.
- **Data**: `addresses.json` stays the one file of addresses. The `fake-paris` library splits each address into its number, street, postcode and city, as a geocoder answers, keeps the one-line address `inspect-point` reads, and adds the 20 arrondissements, with their name and approximate centre written by hand in `arrondissements.json`, without a one-line address so that `inspect-point` skips them. The `prerendered` adapter of `find-address` draws one street per name and postcode from the houses, at their centre, since a geocoder answers streets itself while the fake Paris only has houses.
- **Rows**: a signpost icon from the design library for addresses, the pin for places; the details read "Address · 75008 Paris", "Street · 75001 Paris" or "Arrondissement · 75011 Paris". Choosing an address flies there at street level and marks it, as a place; an arrondissement is shown whole, at zoom 14. Addresses join the recent searches like places. The field now reads "Search a place or an address", its listbox "Places and addresses found", and its status counts results.
- **Loaded on first use**: the addresses are fetched when the places are indexed, after the field first gets the focus; the matching code is loaded with a dynamic `import()` at the same moment. A failed load leaves the places alone for the visit.

## Measures

The acceptance queries of `acceptance.spec.ts` adapt to the fake Paris the address rows of the previous app's reference list ("12 bd voltaire", "75 rue de rennes", "rue de rivoli", "75011"…) and add typos, abbreviations, cut words, "bis", elisions, postcodes and arrondissements: 35 queries, 32 from the centre of Paris and 3 from its north-east, each with the address it must find first. Measured on 2026-11-16:

| Rules                                       | Top-1 accuracy |
| ------------------------------------------- | -------------- |
| These rules                                 | 35/35 (100 %)  |
| Exact words only, no abbreviation, no "bis" | 24/35 (69 %)   |

On 3,908 entries (2,026 houses, 10 streets named by landmarks, 1,852 streets drawn from the houses, 20 arrondissements), building the address book takes 40 ms once, after the first focus, and a query 1.4 ms on average, under 4 ms at most, on a desktop computer.

`addresses.json` grows from 214 kB (30 kB with gzip) to 411 kB (49 kB with gzip), fetched on the first focus of the field rather than on the first inspection only. The scripts of the app but MapLibre grow from 83.83 kB to 86.31 kB with gzip (`pnpm test:size`), 1.5 kB of which is the matching code and the words of streets, loaded on demand.

## Replacing it with a real geocoder

A Géoplateforme adapter of `LoadAddresses` and `IndexAddresses`, or a port answering a query directly, will replace the prerendered file; the geocoder will join the Content Security Policy and the "Who sees what" page ([ADR-018](ADR-018-security-checks.md), [ADR-021](ADR-021-maplibre-and-the-openfreemap-basemap.md)). Detection and mixing stay.

## Consequences

- A street is found only once its kind is typed in full ("rue", not "ru"), or with a number: "rivoli" alone stays a search by name, as in the previous app before its fallback to Photon.
- "What + where" ("boulangerie 75011"), a number after the street ("rue de rivoli 12"), transit lines and reverse geocoding are left out.
- A place whose name starts with a kind of street ("Square Thierry Martin") still comes first when no street holds the other words.
- A postcode alone gives its arrondissement alone, first, where the previous app listed streets of that postcode before it: the fake Paris has no main streets to offer.
- The fake streets are scattered: a street of the same name may exist in several arrondissements far apart.

## Alternatives considered

- **Addresses as a hosted snippet of the panel**, as the recent searches and the kind row: the arrow keys would not reach them, and they could not be mixed with places in one list.
- **A second listbox for addresses**: two listboxes for one combobox breaks the WAI-ARIA pattern.
- **Mixing in the route**: business rules out of any domain, untested by the ability's scenarios.
- **Streets and arrondissements as entries of their own in the file**: almost twice the entries for streets drawn from data already there; the arrondissements are in the file since nothing else gives them.
- **Parsing the one-line address in the browser**: a display string as a format; the parts are what a geocoder answers.
