# ADR-073 — Opening hours read in the time zone of the place, by a library loaded apart

**Date**: 2026-11-26
**Status**: proposed

## Context

Step 13 of the rebuild plan (#46, #111) shows the opening hours of a place. [ADR-041](ADR-041-opening-hours-in-openstreetmaps-format.md) chose OpenStreetMap's `opening_hours` format, read in the domain with the [opening_hours](https://github.com/opening-hours/opening_hours.js) library. Three facts were left open:

- **Weight.** The library weighs about 110 kB with gzip, more than the headroom of "the rest of the app" under its 200 kB budget ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)). The product owner chose, in #90 on 2026-11-24, a budget of its own, as MapLibre has, and the library loaded in the background once the map is shown.
- **Time.** The library reads the clock of the device. The former app did the same for opening hours, while it used `Europe/Paris` for departures and traffic. A visitor whose device is not on the time of the place would see « Ouvert » for a closed place. The product owner chose, in #111 on 2026-11-25, the time zone of the place, kept in the profile of its city, never written in the code.
- **Public holidays.** [ADR-041](ADR-041-opening-hours-in-openstreetmaps-format.md) says that a country the library does not know has no public holiday. The library does otherwise: a value that uses `PH` throws when the country is missing or unknown, and a `null` location makes it use the holidays of Baden-Württemberg.

The former app's sentence of the state of a place (« Ouvert · ferme à 19 h ») appears only in the « en un coup d'œil » strip, which is step 14. Step 22 needs it too, for the lines of a list.

## Decision

- **A new ability of the places feature, `show-opening-hours`.** Its domain reads a value, tells the state of the place now and the moment it changes, and gives the week, from Monday to Sunday. The state and the moment are data: `open` until `today`, `tonight`, `tomorrow`, a day of the week or a date. Their words come with step 14, which shows them; the lists of step 22 reuse the same state. The use case shows the week of the place opened in the sheet, or « Pas encore connus. » for a place that should have opening hours and has none.
- **Which places should have opening hours** moves from the `open-place` ability to the domain of the places feature, `expectsHours`, shared by the sheet and the opening hours. Its list becomes the former app's: every shop, and the kinds of `amenity`, `tourism` and `leisure` it named (file I, 17.2), for the kinds the app knows.
- **The library is loaded apart.** Only `opening-hours.ts` imports it, in the domain, as [ADR-041](ADR-041-opening-hours-in-openstreetmaps-format.md) and [ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md) allow; `opening_hours` joins `DOMAIN_PACKAGES`. The use case imports its types only. An adapter, `lazyOpeningHours`, imports that module dynamically, as `lazyCategoryWords` does, so the build puts the library in a chunk of its own. The route loads that chunk once the map gives its first view, so that a sheet opened later finds it ready.
- **The library has a budget of its own: 120 kB with gzip**, checked by size-limit on the chunk that holds the library's address, `opening-hours/opening_hours.js`, as MapLibre's chunk is found by `maplibregl-canvas`. "The rest of the app" no longer counts it.
- **The state is read in the time zone of the place.** The city profile, `FakeZone`, holds an IANA time zone, `Europe/Paris` for Paris. The page receives it from the server load at prerender, as it receives the fake position: a time zone in each place would add 1.5 kB with gzip to the places file. The domain turns the time into the wall clock of that zone, with `Intl.DateTimeFormat`, before the library reads it, so the result does not depend on the device.
- **Public holidays are those of the country of the place**, from `addressCountry`. A value that uses `PH` for a place without a known country cannot be read: it shows as unreadable hours, rather than with another country's holidays. France needs no region for its public holidays; the region, which the library asks for school holidays in some countries, is not given.
- **The fake places get opening hours** from a seed of their own, so that no place moves: three in four places of the kinds that have hours, among a few values per kind, and three badly written values, for « Horaires non lisibles ». The 25 famous places get theirs by hand.

## Consequences

- The places file goes from 108.6 kB to 114.6 kB with gzip, of its 120 kB budget ([ADR-063](ADR-063-a-weight-budget-for-the-places-file.md)).
- The opening-hours chunk is loaded on every visit of the map, after its first view. Lighthouse's script budget of the map pages, the sum of the two budgets of [ADR-022](ADR-022-lighthouse-budgets-per-page.md), does not count this third budget.
- ADR-041's consequence on unknown countries is replaced by the decision above.
- The library is under the LGPL-3.0-only, and is bundled in an app under the AGPL-3.0 ([ADR-015](ADR-015-agpl-3.0.md)). Section 4 of the LGPL asks a combined work to say that the library is used and is under the LGPL, to come with the texts of the GPL and the LGPL, and to let the user rebuild it with a changed library. The source of the app is public, with its lockfile, which allows the rebuild; the notice and the texts are to be settled in review.
- A day whose hours are marked unknown shows « Incertains » in the table, the word of the former app's strip; the former app's table for such a day is not known.
- Unreadable hours show no Horaires section: the former app tells them only in the strip, « Horaires non lisibles », which comes with step 14.

## Alternatives considered

- **The library in the main bundle**: no wait at the first sheet, but "the rest of the app" over its budget by about 100 kB.
- **The library loaded when a sheet opens**: nothing loaded for a visitor who opens no sheet, but a wait at the first sheet. The product owner chose the background load.
- **The time zone of the device**, as the former app: simpler, but wrong for a visitor elsewhere, and untestable without setting the clock of the machine.
- **`Europe/Paris` in the code**: right for Paris only, and against the rule that what is Parisian stays in the city profile.
- **A time zone in each place**: the most general, but 1.5 kB with gzip for a value that is the same for every place of a zone.
- **Reading `PH` without a location**: the library then uses the holidays of Baden-Württemberg, wrong for every place of the app.
