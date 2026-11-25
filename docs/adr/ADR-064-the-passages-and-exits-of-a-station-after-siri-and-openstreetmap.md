# ADR-064 — The passages and exits of a station, after SIRI and OpenStreetMap

**Date**: 2026-11-24
**Status**: proposed

## Context

Step 18 of the rebuild (#96) shows, in the sheet of a station, its next departures and its exits, as the former app did. The app is sealed ([ADR-059](ADR-059-rebuilding-the-former-app-frame.md)): the departures come from a fake service, the lines and their colours are the real ones (#91). Three kinds of data need a shape ([ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md)): the lines, the exits and the departures. The departures are asked again every 30 seconds and counted down every 10 seconds while the sheet is open; a line's colours must read at 4.5:1.

## Decision

- **A new ability, `show-station`**, in the `places` feature: a use case from a port that loads a station, a port that asks its departures, and three input streams, the station opened, the clock and whether the page is shown.
- **Departures after SIRI StopMonitoring** (CEN/TS 15531), the standard the Paris transit authority publishes its next departures in: `lineRef`, `destinationName`, `aimedDepartureTime`, `expectedDepartureTime`, `monitored`, `departureStatus`. SIRI names its fields in PascalCase; Biome asks for camelCase, so the names are SIRI's with a lower-case first letter.
- **Lines and exits after OpenStreetMap's tagging**: a line is a `route_master` with `ref`, `colour`, `text_colour`, `network` and `ref:FR:STIF`, the line's identifier in Île-de-France Mobilités' reference; an exit is a `railway=subway_entrance` with `ref`, `name` and `wheelchair`. No key says that an exit has an escalator; `conveying=yes`, OpenStreetMap's key for moving steps, is the closest.
- **Refreshing from the clock as an input stream**: the departures are asked at the first time given and whenever 30 seconds have passed since; the reference time moves on by steps of 10 seconds. Nothing is asked while the page is hidden (Page Visibility API), and the departures are asked again at once when it is shown again: a defect of the former app, which left it to the browser, fixed rather than copied.
- **Readable colours with colorjs.io**, by the editors of CSS Color, which implements the WCAG 2.1 contrast and the mixing of colours: below 4.5:1 the background is darkened toward black, or lightened toward white, by steps of 5 %, never the text, as the former app did. `colorjs.io` joins `DOMAIN_PACKAGES`; its procedural API is imported, so only sRGB is bundled.
- **A station's data in a file of its own**, `/data/stations/<id>.json`, prerendered and loaded when its sheet opens, rather than in `places.json`, the way out [ADR-058](ADR-058-the-text-type-and-local-name-of-a-place-after-openstreetmap-tags.md) names. The real lines are written once, in `lines.json`, so that the Métro list (step 25) can reuse them.
- **The fake departures service** reads the same file and makes departures from the clock: a train every 4 minutes on the metro, 8 on the RER, 15 on other trains, the RER's second one delayed, a Transilien's third one cancelled. It can be told to fail for some stations: the seven famous stations work in the app, and the failure is shown in tests and screenshots only, as oertio decided (#96).

## Consequences

- Nothing is called outside the site: the Content Security Policy and « Who sees what » do not change.
- The colours of the lines are Île-de-France Mobilités' official ones, read once on 2026-11-25 from its open dataset _référentiel des lignes_ (fields `colourweb_hexa` and `textcolourweb_hexa`, at `data.iledefrance-mobilites.fr`) and written by hand in `lines.json`. The app does not call that service; a change of colour there is copied by hand.
- The 170 m within which the former app looked for a station's exits is not needed: each station lists its own exits.

## Alternatives considered

- **GTFS and GTFS Realtime for the departures**: the most used format, but not a standard body's, and its real-time feed carries no destination.
- **NeTEx for the lines**: the European standard, far heavier than the few keys a sheet reads.
- **A clock read with RxJS timers inside the use case**: the rates would be tested with virtual time only, and the clock could not be shared with the countdown.
- **wcag-contrast**: smaller, but unmaintained since 2018 and without colour mixing, which would have been rewritten here.
- **Lines and exits in `places.json`**: one file less, but read by the map at start-up, and already the heaviest file of the app.
