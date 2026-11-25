# ADR-067 — A district chosen opens its sheet and its outline

**Date**: 2026-11-25
**Status**: accepted

## Context

Choosing a district in the search, a quarter or an arrondissement, flew the map to its centre at zoom 14 and opened nothing (issue #67). The former app framed the area: it fitted its outline with a margin of 40 px, at zoom 14.3 at most, in 900 ms, or flew to zoom 14.3 when the outline was unknown. oertio decided on 2026-11-22 to give it a sheet, as Google Maps does: the name as title, the city under it, and the area outlined on the map by a dashed line `#D93A2F`, 2 px wide, with dashes of 2 px and gaps of 3 px, slightly transparent; the outlines are fake data made for the fake Paris, never computed from real data; the sheet has only the buttons that exist when it is built.

## Decision

- **A new ability, `open-district`, in the `search` feature.** Its use case opens the district chosen with its outline, read through a port, or with no outline when none is known or the outlines cannot be loaded. It loads the outlines once, at the first district chosen, and again after a failure.
- **The outlines are a GeoJSON `FeatureCollection`** ([RFC 7946](https://www.rfc-editor.org/rfc/rfc7946)), one `Polygon` per district, its properties named after schema.org: `name`, `postalCode`, `addressLocality` ([ADR-043](ADR-043-standards-first-and-their-libraries-in-the-domain.md)). A district is matched by its name and postal code. The adapter reads the outer ring and leaves out a feature it cannot read.
- **The fake outlines are regular polygons of sixteen corners** around the centre of each district of the fake zone, their radius 45 % of the distance to the nearest other centre, 500 m for a district alone. `/data/districts.json` serves them, prerendered as the other data files.
- **The outline is drawn as a MapLibre line layer** under the labels, through `layersOverlay`: `#D93A2F`, 2 px, `line-dasharray` `[1, 1.5]` in widths of the line, opacity 0.8.
- **The sheet gives the name and the city, and a close button only.** A link shares a place or a point, not a district: a share button would open a point at its centre.
- **The map frames the outline around the sheet** ([ADR-053](ADR-053-framing-the-map-on-what-is-opened-measured.md)), with 40 px on each side beyond what the top bar and the sheet cover, at zoom 14.3 at most, in 900 ms; without an outline it flies to the centre at zoom 14.3 in 900 ms.
- **The sheet closes in the order of [ADR-047](ADR-047-escape-and-the-back-button-close-what-is-open-in-order.md)**, after the sheet of a place and before the list of a kind. One sheet at a time: a district chosen closes the sheet of a place or of a spot, and opening either closes the district.
- The sheet takes a style shared with the sheet of a spot, `sheet-card.css` of the design library.

## Consequences

- A district has no pin any more: its outline shows it.
- The fake outlines are circles of districts, not their shapes: they overlap nothing but leave gaps between districts. To be looked at on a phone once published.
- The basemap's own administrative boundaries could replace the fake outlines later; that is left for later, as oertio decided.

## Alternatives considered

- **Outlines inside the addresses file**: the search would carry them, and the recent searches would keep them on the device.
- **Voronoi cells of the centres**, which tile the zone without gaps: a library more, `d3-delaunay`, for fake data.
- **A fill under the outline**, as some maps draw: not asked, and it hides the basemap.
- **A share button opening a point**: a link that does not open what was shared.
