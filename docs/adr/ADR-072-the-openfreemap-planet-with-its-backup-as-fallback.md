# ADR-072 — The OpenFreeMap planet, with its backup as a fallback

**Date**: 2026-11-25
**Status**: accepted

## Context

The basemap is drawn from the tiles that the TileJSON at `https://tiles.openfreemap.org/planet` describes ([ADR-021](ADR-021-maplibre-and-the-openfreemap-basemap.md)).

On 2026-11-25, EasyList commit `200afb4` added `||tiles.openfreemap.org/planet` to EasyPrivacy. uBlock Origin, AdGuard and Brave Shields apply this list, and they now refuse that TileJSON and its tiles in the browser, before any request leaves it. The live site then shows an empty map and the outage message, at once ([ADR-023](ADR-023-basemap-outage-told-from-the-maps-own-events.md)). This was seen on the live site: the request to `planet` is `(blocked:other)` in 1 ms.

Withdrawing or scoping the rule is requested in easylist/easylist#26522, with no maintainer answer on that day. The owner of OpenFreeMap serves the same data at `https://tiles.openfreemap.org/backup_planet`, which the rule does not match (hyperknot/openfreemap#151).

## Decision

- The `openmaptiles` source reads its TileJSON from `openfreemap://planet`, a MapLibre protocol that the app registers through the `protocol` property of the map canvas.
- The protocol fetches `planet` first, and `backup_planet` only when `planet` is refused or answers with an error. The tiles are then those of the TileJSON that answered.
- The source fails only when both fail, so the outage message keeps its meaning.
- Each page load asks `planet` first: as soon as the rule is withdrawn, or for a visitor without a blocker, the backup is no longer used, with no change to the code.

## Consequences

- A visitor with a blocker pays a refused request at each load, done locally in about 1 ms, before the backup.
- The host does not change: the Content Security Policy and the "Who sees what" page stay as they are.
- If the filter lists also block `backup_planet`, the source fails as before and the outage message shows.
- Once the rule is withdrawn, the protocol can be removed and the source can point to `planet` again. Until then, it costs only the code that tries the backup.

## Alternatives considered

- **Point the source at `backup_planet`**: one line, but every visitor would stay on the backup after the rule is withdrawn, until someone changes the code back.
- **Switch the source when MapLibre reports the failure of `planet`**: MapLibre would draw no error from the backup, but the outage message would flash, and screen readers would announce it, before the backup answered.
- **Fetch the TileJSON before drawing the style, and put its tiles in the source**: no MapLibre protocol, but the style would wait for that request on every load.
- **A second provider, such as VersaTiles**: sturdier against any outage of OpenFreeMap, but a new external service and a style to write for its schema, out of proportion to a filter rule.
