# ADR-034 — Inspect a point with the nearest fake address within 200 m

**Date**: 2026-11-16
**Status**: accepted

## Context

In the previous app, a click on an empty spot of the map, a right click or a long press placed a red pin there and opened a card: the address of the spot, from the Géoplateforme's reverse geocoder or else Photon, its street as the title and its postcode and town below; a button with the travel time that started directions; "Enregistrer"; "Signaler", which opened an OpenStreetMap note at the spot; and the sentence "Une info manque ou est fausse ? Signalez-la sure OpenStreetMap ↗, la carte libre que nous utilisons…". On a computer the card stood under the search field; on a phone it was a sheet along the bottom. The keyboard could not inspect a spot.

The rebuilt app has no directions, no saved places and no real source of addresses yet. Its places are a fake Paris generated at build time ([ADR-028](ADR-028-a-fake-paris-generated-at-build-time.md)), and its map pages are over their script budget, 361.4 kB for 360 kB ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)).

## Decision

- **A new ability, `places/inspect-point`**, in a new `places` feature, for what the visitor does with one spot or place of the map. Its use case is a stream function of one port, `ReverseGeocode`, a function from coordinates to an observable address or none, and of two input streams, the spots inspected and the dismissals ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). It answers `looking`, then `address`, `no-address` or `unavailable` when the port fails, and `none` once dismissed; a new spot cancels the search for the previous one.
- **The nearest fake address within 200 m.** `src/routes/data/addresses.json/+server.ts` writes the address and coordinates of every place of the fake Paris into `build/data/addresses.json` at build time: 2,036 addresses, 214 kB, 30 kB with gzip. The `prerendered` adapter fetches it on the first inspection only, so the home page does not wait for it, keeps the well-formed entries, and answers the nearest address measured on an equirectangular projection, which is precise to the metre at this scale. 200 m is about a Paris block: on 4,000 spots spread over central Paris, half have an address within 150 m, 71 % within 200 m and 85 % within 250 m. A larger radius would name a spot after a street a few minutes away; a smaller one would leave most of the fake city without address. A failed load is not kept: the next inspection asks again.
- **Inputs of the map, through an overlay.** The overlay given to `show-map`'s component listens to MapLibre's `click` and `contextmenu` events, the latter fired by a right click and, since MapLibre 6.16, by a long press of one finger on any touch screen, iOS included. Enter on the map, which MapLibre's keyboard handler leaves free, inspects its centre, and Escape dismisses the spot, so the feature does not rely on a pointer ([WCAG 2.2, 2.1.1](https://www.w3.org/TR/WCAG22/#keyboard)). The same overlay draws the pin, the previous app's red one, as a MapLibre marker named "Selected spot", and gives the focus back to the map when the card closes. The map component does not change.
- **The card under the search field**, on every screen: the street as its title, the rest of the address or the coordinates below, a "Report" link styled as a button and the previous app's sentence, both leading to a new OpenStreetMap note at the spot (`https://www.openstreetmap.org/note/new#map=19/{lat}/{lon}`), and a close button. Escape within the card closes it too. It sits in a polite live region, so that a screen reader reads the address when it arrives.
- **The design library grows** by a close button, now shared with `dialog-button`, a warning icon, and a soft tone and an external link for `button-link` ([ADR-029](ADR-029-design-tokens-inter-and-a-design-library.md)).
- **No dead button.** The travel time and "Save" wait for the abilities that make them work.

## Replacing it with a real reverse geocoder

A real adapter of `ReverseGeocode` will ask a geocoder for the address at the coordinates, mapping an empty answer to `no-address`, and will add the geocoder to the Content Security Policy and to the "Who sees what" page ([ADR-018](ADR-018-security-checks.md), [ADR-021](ADR-021-maplibre-and-the-openfreemap-basemap.md)). The route will pass it instead of the prerendered one, the radius will go with it, and `addresses.json` will go with `fake-paris`. The use case, the overlay and the card do not change.

## Consequences

- The first inspection downloads 30 kB of addresses. The home page's script grows by about 1.9 kB with gzip; loading the card on demand with a dynamic import saved nothing measurable, as Svelte's `{#await}` costs what the card weighs.
- Every address is invented, and many spots by real landmarks bear a fake one: the card is a demonstration until a real source lands.
- A double click, which zooms in, also inspects the spot under it, as in the previous app.
- On a phone the card stands at the top, under the search field, rather than in a sheet along the bottom as in the previous app: the design library has no sheet yet ([ADR-029](ADR-029-design-tokens-inter-and-a-design-library.md)).
- The card can host the travel time and "Save" as a row of actions above "Report", passed by the route as a snippet from their own abilities, as the search panel hosts the recent searches ([ADR-033](ADR-033-recent-searches-kept-on-the-device.md)).

## Alternatives considered

- **Reusing `places.json`**, already fetched by the search: 368 kB rather than 214 kB, and a port that would depend on the search's file.
- **The nearest address at any distance**, as the previous app's geocoders answered: a spot in Vincennes or Saint-Denis would get a Paris address kilometres away.
- **A hook in the map component for clicks**: an overlay already receives the map, so each ability listens to what it needs without a new property on `show-map` ([ADR-024](ADR-024-locate-me-with-fake-positions-before-the-geolocation-api.md)).
- **Faker in the browser**: tens of kilobytes on pages already over their budget, for data that never changes.
