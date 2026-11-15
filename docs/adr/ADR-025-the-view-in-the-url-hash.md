# ADR-025 — The view in the URL hash

**Date**: 2026-11-15
**Status**: accepted

## Context

A reload or a shared link must reopen the map on the view the visitor was looking at. The previous app turned on MapLibre's own `hash: 'carte'` option, which writes `#carte=zoom/latitude/longitude`, adds the bearing and the pitch when they are not zero, and rewrites the hash with the native `history.replaceState`.

OpenStreetMap writes the same view as `#map=zoom/latitude/longitude`, and MapLibre's option writes it under any key it is given. A URL's fragment is never sent to the server, nor in the `Referer` header ([RFC 9110, section 10.1.3](https://www.rfc-editor.org/rfc/rfc9110#section-10.1.3)), whereas a query string reaches the host of the site and every service the page calls.

## Decision

- The view lives in the hash, as `#map=zoom/latitude/longitude`, OpenStreetMap's format. The hash is read as `key=value` pairs separated by `&` (`URLSearchParams`), so that other abilities can add their own keys.
- The zoom is written with two decimals at most, the coordinates with the decimals that keep the centre within half a pixel at that zoom, MapLibre's rule: `ceil(log10(2^zoom × 1024 / 360))` decimals, 5 at zoom 13. Trailing zeros are dropped.
- A view is read only when it has exactly three parts, each a plain decimal number, with a zoom between 0 and 22, MapLibre's default range, a latitude between −90 and 90 and a longitude between −180 and 180. Anything else opens the default view, Paris. The longitude MapLibre gives is wrapped into that range before it is written.
- The `keep-view-in-url` ability owns the format and two use cases: the view the URL asks for, and the hashes to write as the view changes ([ADR-007](ADR-007-abilities-are-rxjs-stream-functions.md)). `show-map` accepts the view to open on as an input stream and falls back to Paris when it is empty; the route wires the two ([ADR-008](ADR-008-composition-in-routes.md)).
- The map tells its view on MapLibre's `moveend`, not on `move`, so that only settled views enter the streams. The hash is written 300 ms after the last of them, MapLibre's own delay, and not again when it has not changed: browsers limit how often a page may change its history.
- The hash is replaced through SvelteKit's shallow `goto(…, { shallow: true, replace: true })`: the view does not add an entry to the history, the back button leaves the page rather than stepping through every move, and SvelteKit's router keeps its own state in the history entry.

## Consequences

- Links to the previous app, under `#carte=`, open the default view.
- The bearing and the pitch are neither written nor read: a link with them opens the default view. They will be added with the ability that lets the visitor rotate or tilt the map.
- A hash pasted into an open tab is not followed until the page is reloaded.
- The language links point to the page without its hash, so switching language reopens the default view.

## Alternatives considered

- **MapLibre's `hash` option**: no code to write, but the format and its validation would sit in the renderer, outside the domain and its tests, and it calls the native `history.replaceState`, which SvelteKit's router warns against.
- **The query string**, as in `?map=…`: it is sent to the server and in the `Referer` header, and changing it with SvelteKit's router means a navigation.
- **Keeping the key `carte`**: the app's base language is English, and `map` is the key OpenStreetMap uses.
