# ADR-023 — A basemap outage is told from the map's own events

**Date**: 2026-11-15
**Status**: accepted

## Context

When OpenFreeMap does not answer, the map stays empty ([ADR-021](ADR-021-maplibre-and-the-openfreemap-basemap.md)), and the visitor cannot tell a broken app from a broken provider. The previous app showed a banner, "Le fond de carte ne répond pas : rues et noms peuvent manquer", once three tiles of the basemap had failed with no tile received in between, and hid it at the first tile received: a single failed tile, common on a mobile network, said nothing.

That rule watched tiles only. The basemap source of this app is a TileJSON URL: when it fails, MapLibre requests no tile at all, so a count of failed tiles never reaches three, and the map stays empty without a word. The previous app also queried status pages for its other services; this one calls no external service but the basemap itself.

## Decision

- The outage is deduced from the events MapLibre already fires for the basemap source, nothing else: an `error` with a tile is a failed tile, an `error` without a tile is a failed source, a `sourcedata` with a tile is a loaded tile. Events of other sources are ignored. No status API is called.
- The basemap is out after three failed tiles in a row, or at once when its source fails; it is back at the first loaded tile. Loading a tile forgives the failures before it.
- The `report-basemap-outage` ability holds the rule in its domain, as a stream from basemap events to an outage flag ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)); its MapLibre adapter reads the events of the map that `show-map` hands over through the `onMap` callback of its canvas, and the route joins the two ([ADR-008](ADR-008-composition-in-routes.md)).
- The message lives in a polite live region, `role="status"`, present and empty while the basemap answers, so that screen readers announce it when it appears. It keeps the previous wording, without "the places stay shown", since this app shows no places yet, and without promising a return, which a failed source cannot keep.

## Consequences

- A failed TileJSON is reported at once, but MapLibre does not request it again: the message then stays until the page is reloaded.
- A tile outage ends by itself as soon as the visitor moves the map and a new tile loads; MapLibre does not retry a failed tile on its own.
- A timeout counts only once MapLibre or the browser reports the request as failed: a provider that holds requests open without answering is not told until then.
- The end-to-end tests that refuse OpenFreeMap now show the message; dedicated tests check it in both languages, its accessibility, and its withdrawal when tiles load again.

## Alternatives considered

- **OpenFreeMap's status page, or a probe request**: closer to the truth, but a second external call that the visitor's browser makes, against the rule of calling no service but the basemap.
- **A delay without any tile, such as five seconds**: it would also catch a provider that never answers, but it fires on a slow network where tiles are only late, and needs a clock where counting events does not.
- **Any failure is an outage**: simpler, but one lost tile on a mobile network would raise the message.
