# ADR-080 — The cities covered, a list of boxes given to the app

**Date**: 2026-11-28
**Status**: proposed

## Context

Step 20 of the rebuild plan (#46, #123) brings back the sheet of a place out of the cities covered by the detailed data. In the former app, a place looked for in its tile and the four next ones, at zoom 14, was « out of area » when these five tiles held no place at all: an isolated place inside a covered region was declared out of area too. Such places came from the points of the basemap, from the online search and from links; their sheet showed only what the map knew, and ended with « Ce lieu est hors des villes couvertes par nos données détaillées : seules les infos de la carte sont affichées. ». The app is sealed ([ADR-059](ADR-059-rebuilding-the-former-app-frame.md)) and has a single places file, with no tiles ([ADR-075](ADR-075-the-places-file-split-from-the-details-of-the-places.md)). The product owner decided that an out-of-area place is reached by a link only (#91), and agreed on 2026-11-28 to the proposal of #123.

## Decision

- **The cities covered are data given to the app**: a list of boxes, one per city, each one west, south, east and north, the order of a GeoJSON `bbox` (RFC 7946). Today the list holds the box of the fake Paris, `2.22,48.81,2.47,48.91`, given by the server data of the page beside its region and its time zone. A place is covered when it lies inside one box, its edges included: a comparison of four numbers, in the domain of `places`, with no library.
- **Coverage decides three things, and only these**: the sheet of a place out of every box says the sentence of the former app, last, in its measures (13 px, line height 1.45, the muted text colour); the dots of the map leave that place out; the search, and so the lists of a kind, leave it out. The route applies the same rule to the two loaders, since features do not import each other ([ADR-006](ADR-006-features-and-abilities-on-a-hexagonal-core.md)).
- **No section is cut by coverage.** The sheet shows what the data holds, as for any place: a place out of area has no details, so no hours, good to know, photos or street view. Departures, photos or reviews that a real service gives beyond the cities covered will show without a change to this rule.
- **Two fake places stand beyond the fake Paris**, made by hand in `zones/paris/beyond.json`: base fields only, no address, no details, no station. They are in the places file and not in the details file.
- **A link opens such a place by its id**, from the whole places file: the sheet keeps the name and the type of the place, and a link without a position never says « not found » for a place that exists.
- **« Link only » holds until step 34** (fake online search), which decides whether that search can reach places beyond the cities covered.

## Consequences

- With real data, the data project gives the list of boxes of the cities it covers ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)); the domain does not change.
- The places file grows by two places; the details file does not change.
- The footer of the sheet, with the date of the data the former app wrote first (« Infos du 12 novembre. »), comes with lot L, as Correct and Report do.

## Alternatives considered

- **The rule of the former app, empty tiles**: this app has no tiles, and the rule declared out of area an isolated place inside a city.
- **The outline of each city**: closer to the truth, but one more library for what four numbers do in a sealed app; the data project can give finer shapes later.
- **The box of the former app, `2.224,48.815,2.47,48.902`**: it would turn 331 of the 2,258 generated places out of area; it stays the box of the street views ([ADR-077](ADR-077-the-shop-front-cut-from-a-fake-street-view-facing-the-place.md)).
- **The sheet reduced by the domain**: its fields stripped and its sections cut when a place is out of area. Redundant with data that holds no details there, and a rule to undo once a real service covers more than the detailed data.
- **A field in the places file**: a fact of the cities covered, not of the place, and weight in a file read at start.
