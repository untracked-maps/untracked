# ADR-046 — Places shown as dots coloured by family

**Date**: 2026-11-21
**Status**: accepted

## Context

The previous app showed every place as a small coloured dot with a pictogram and its name, shown or hidden by zoom, so that the map could be read at a glance: orange to eat and drink, blue to shop, green for parks. The rebuilt app only marked stations, with the round "M" of the basemap ([ADR-031](ADR-031-basemap-icons-in-a-sprite-generated-at-build.md)). The measures of the dots, of their names, of their colours and of their zooms were read in the previous app's code on 2026-11-21 and are in issue #50.

The previous app drew the dots from two sources: from afar, a file of places put forward, computed at build time from OpenStreetMap by keeping one place per square of the screen, each with the zoom from which it shows and its rank; from zoom 17, the points of interest of the basemap's own tiles. This repository computes no data ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)), the app is sealed on fake data ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)), and the basemap's places are real ones, which would mix with the fake Paris.

## Decision

- **Every dot comes from the fake places.** The points of interest of the basemap are not drawn. The stations' round "M" does not change.
- **The fake places carry what the map needs.** The generator gives each place three more fields: `family`, absent when its kind has none; `minzoom`, the zoom from which it shows from afar, named as MapLibre and tippecanoe name it; and `rank`, the lower the better, as in OpenMapTiles' `poi` layer ([ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md)). No standard holds a family: its thirteen values are the previous app's.
- **The family follows the kind**, after the previous app's tables: restaurants are `food`; cafés, bars and bakeries have their own family; supermarkets, hairdressers, beauty salons, florists, bookshops and department stores are `shop`; museums, cinemas, libraries and theatres `culture`; attractions, monuments and places of worship `sight`; parks and gardens `nature`; pharmacies and hospitals `health`; hotels `stay`; stations `train`. Car parks, post offices and schools have no family. No fake place is of the families `money` and `fuel` yet: the app knows them, their kinds come with the categories.
- **`minzoom` and `rank` are fake values, made from the fame**, not the previous app's computation. A place of the families `culture`, `sight`, `nature` or `train` counts as a monument and shows from zoom 11.5 at the earliest; any other place from 13.75. Every place shows at 16.5 at the latest, and earlier by steps of 0.25 as its fame grows: `16.5 − 0.25 × round(fame ÷ 99 × steps)`, with 20 steps for a monument and 11 for the others. The rank is `99 − fame` for a monument and `199 − fame` for the others, so that a monument always goes before a shop.
- **A new ability, `places/show-places`.** Its use case is a stream function from the zoom of the map to the dots to show ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)), and holds every rule, written as scenarios:
  - before zoom 17, a place with a family shows from its `minzoom`, in the order of its `rank`;
  - from zoom 17, a place that showed from afar stays, and the others join it by family: `food`, `cafe`, `bar`, `bakery`, `culture`, `sight`, `health` and `stay` from 17; `nature`, `shop`, `money` and `fuel` from 17.5; a place without a family from 18, except a school, which never shows. The previous app kept its layer of places put forward up to zoom 18.5, above the layer of every place. Their order is then the previous app's priority: 0 for `food` and `cafe`, 0.5 for `bar` and `bakery`, 1 for `culture` and `sight`, 2 for `health`, 2.5 for `stay`, 3 for `nature`, 4 for `shop`, 4.5 for `money` and `fuel`, and 5, after them all, for a place without a family. A station, whose family the previous app's layer of every place did not hold, shows from its own zoom only, stays at every zoom, and goes first: whether the previous app still drew it beyond 18.5, and in which order, was not read;
  - the zoom is tested by steps of 0.25: the dots are computed again only when the zoom crosses one;
  - when the places cannot be loaded, the map shows no dot and says nothing.
- **The rules stay out of the style.** MapLibre evaluates the filter of a symbol layer at the zoom of the tile, a whole number: a filter cannot hide a place until zoom 13.75. The overlay gives the zoom of the map to the use case at each `zoom` event and replaces the data of one GeoJSON source with the dots it answers. Two symbol layers draw that source, the places without a family underneath; MapLibre hides a dot that would overlap another, in the order of the `symbol-sort-key`, and a dot shows with its name or not at all, its default.
- **The dots are icons of the map's sprite**, generated at build time as the round "M" is. The ability writes one SVG per family, 24 px wide: a white disc of 20.8 px over a shadow, a coloured disc of 18 px and a white pictogram of 11.25 px. The route that serves the sprite puts them next to the basemap's icons, in the same sheet: `show-map` does not change. The pictograms and the colours are data, in JSON files next to the code that reads them, as the landmarks are ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)); only the names' colours reach the browser.
- **The dots keep their colours in the dark theme; the names take a lighter one**, over the halo of the palette. The previous app left the names of the families `money` and `fuel` dark on a dark map, 2.3:1 and 2.2:1 against the dark land. They become `#8CC3AE` and `#9DB6E0`, 8.1:1 and 7.8:1, of the same hue as their disc and as light as the other families' names. To be confirmed by the owner.
- **The places are asked for as soon as the map opens**, by the `prerendered` adapter of the ability's own port, which reads the same `places.json` as the search and keeps of each place what the map shows. The file is still fetched once per visit ([ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)): features never import each other, so the route gives the map's adapter and the search's the same answer, and asks again after a failure. The code that draws the dots is loaded with a dynamic `import()`, outside the first scripts.
- **A dot cannot be touched yet.**

## Measures

On 2026-11-21, with `pnpm test:size`: MapLibre stays at 287.3 kB; the rest of the app goes from 89.51 to 92.30 kB compressed, for a limit of 200 kB ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)); the chunk that draws the dots weighs 1.3 kB of it. `places.json` goes from 368 to 451 kB, 54 to 62 kB compressed, and is now fetched by every visit of the map, where only a search fetched it. The sprite goes from one icon to fifteen: 5.1 kB for the standard sheet, 15.6 kB for the high density one.

## Consequences

- From afar, every fake place with a family is put forward, the unknown ones from zoom 16.5, so every one of them is on the map from 16.5 on: the zooms of the families, 17 and 17.5, only matter for a place whose own zoom comes later, which no fake place has. They are kept for the real places to come, and tested.
- The dots are drawn above every layer of the basemap, so a dot and its name win over a street name, the name of a neighbourhood or the name of a station that they would overlap; the round "M" itself always shows. The previous app's code, read again on 2026-11-21, drew its places last for that very reason, with two differences that wait for the owner: its house numbers stood above the places, and from zoom 18 a house number hid a dot and its name; and its grey places without a family stood lower, among the names of streets. Here a dot wins over a house number, and a grey dot stands with the others.
- A name on two lines has its lines centred on each other while the block starts on the right of the dot: `text-justify` is not set, as in the previous app. It is likely a defect of the previous app, which waits for the owner. The lines of a grey place's name are 1.2 em high, MapLibre's default, as the previous app left them.
- The colour of a pixel of the map is read in an end-to-end test, to check that a dot is really drawn: such a test fails if the sprite, the glyphs or the places are missing.
- A real source of places will need its adapter to give a family, a `minzoom` and a rank, or the data project to compute them.

## Alternatives considered

- **Rebuilding the previous app's computation**, one place per square of the screen at each zoom: it is a computation of data, out of scope here ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)).
- **Drawing the basemap's own points of interest from zoom 17**, as the previous app did: real places among fake ones, which neither the search nor the sheet to come would know.
- **A filter on the zoom in the style**: evaluated at whole zooms only, it would show a place put forward at 13.75 from zoom 14.
- **One layer per step of 0.25**, each with its own `minzoom`: thirty-three layers, and an order between dots set by the layers rather than by the rank.
- **The family derived from the kind in the app**: the brief of issue #50 has the generator give it, and a real source will carry OpenStreetMap's tags rather than our kinds.
- **A second sprite for the places**: MapLibre reads several, but `show-map` would have to take a list of sprites; one sheet composed by the route leaves it unchanged.
- **Markers in the page**, as the places of a kind are marked ([ADR-036](ADR-036-search-by-type-one-vocabulary-the-nearest-places-and-chips.md)): two thousand elements, and no collision between them.
