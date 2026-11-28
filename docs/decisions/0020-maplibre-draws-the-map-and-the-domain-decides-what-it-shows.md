---
status: accepted
date: 2026-11-28
decision-makers:
  - marc-gavanier
---

# MapLibre draws the map, the domain decides what it shows

## Context and Problem Statement

The map needs a renderer and a basemap. The repository produces no map data ([0002](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)), so the tiles come from an existing service that the browser calls ([0018](0018-the-browser-talks-only-to-declared-services.md)). The former app drew OpenMapTiles vector tiles from OpenFreeMap with MapLibre GL JS and a style of its own. Abilities hold their rules in their domains, as stream functions ([0009](0009-abilities-are-rxjs-stream-functions-without-a-store.md)), and only entry points compose them ([0010](0010-only-entry-points-compose.md)); yet many abilities draw on the map: the visitor's position, the places, a district's outline, transit lines, bike lanes, a framing on what is opened.

A renderer invites rules into its style: filters, zoom expressions, colours computed per feature. Rules written there escape the domain and its scenarios, and MapLibre evaluates some of them at whole zooms only. Each colour that depends on a feature also costs a variant of the programs MapLibre compiles on the graphics processor, at start-up, on the devices that can least afford it.

How is the map drawn, and where do the rules of what it shows live?

## Decision Drivers

- The domain does not know the renderer nor the provider of tiles.
- Every rule of what the map shows is a rule of a domain, with its scenarios.
- An ability draws on the map without the map knowing what is drawn.
- A provider refused by a filter list or down does not empty the map while a fallback answers.
- The cost of drawing stays low on modest devices.

## Considered Options

- MapLibre behind a port, OpenFreeMap with its backup, a style of our own, rules in the domain and overlays as the extension point
- Leaflet with raster tiles
- A self-hosted file of vector tiles
- OpenFreeMap's own styles
- Rules written in MapLibre's style, as filters and expressions
- A property of the map component for each thing drawn on it

## Decision Outcome

Chosen option: « MapLibre behind a port, OpenFreeMap with its backup, a style of our own, rules in the domain and overlays as the extension point », because the renderer then only draws, behind a port, while every rule stays in a domain where its scenarios test it.

### MapLibre behind a port, OpenFreeMap and its backup

MapLibre GL JS draws the map; its worker is a file of the site, so that the Content Security Policy needs no blob source. The basemap is a port of the ability that shows the map: its domain knows neither MapLibre nor OpenFreeMap, and the route passes the adapter. The adapter reads OpenFreeMap's planet first, and its backup only when the planet is refused or fails, through a protocol registered on the map; the source fails only when both fail. Each load asks the planet first, so that the backup stops being used as soon as the planet answers again.

### A style of our own, one colour per layer

The style is the project's own, checked with MapLibre's style specification, and it takes a palette rather than a theme. A layer of the basemap paints its features with properties that depend on the zoom at most, never on the feature: features that need different colours get one layer per colour, filtered on the property that tells them apart, so that MapLibre compiles fewer programs. The names of places keep their colour per family in one layer, since splitting it would change which names give way when they collide.

### Rules in the domain, MapLibre only draws

What the map shows, and when, is decided by the domains, as streams of data and of coordinates; the adapters give MapLibre the result to draw, in sources it replaces. The framing on what is opened takes coordinates only, from each ability that turns its own state into coordinates, and a port that measures what covers the map. The map knows nothing of a sheet or a search.

### Overlays as the extension point of the map

An ability draws on the map through an overlay: a function of the map to a stream that draws while subscribed, and removes its drawing when unsubscribed. The route passes overlays to the map, so that neither the map nor the abilities import each other. Layers that overlays add are added again after each change of style.

### Gestures and places listed

The end of a gesture of the visitor is a signal that the map gives, at the real end of its movement, and the route passes it to the abilities that need it without logic of its own; today the map tells only its settled view. Places listed by a search and the other places are drawn at two levels, with MapLibre's standard tools. Target, tracked by #107.

### Consequences

- Good, because the domain is tested without MapLibre, and a change of renderer or provider touches adapters only.
- Good, because a rule of what the map shows has its scenarios, and is evaluated at the exact zoom, not at a whole one.
- Good, because a blocked address of the provider does not empty the map while its backup answers.
- Good, because a new drawing on the map is an overlay, and the map component does not change.
- Bad, because a visitor whose browser refuses the planet pays one refused request at each load before the backup.
- Bad, because the style is the project's to maintain, layer by layer.
- Bad, because MapLibre weighs on start-up more than any other library, and its drawing time depends on the device's graphics processor, which the app does not control.

## Pros and Cons of the Options

### Leaflet with raster tiles

Lighter. But raster tiles cannot be restyled, nor themed in dark mode.

### A self-hosted file of vector tiles

No third party at all. But producing and hosting the data belongs to another project.

### OpenFreeMap's own styles

Nothing to maintain. But their glyphs and icons would come from the provider too, and the look of the former app would be lost.

### Rules written in MapLibre's style, as filters and expressions

No code between the domain and the map. But the rules leave the domain and its scenarios, and a filter of a symbol layer is evaluated at the whole zoom of its tile, which cannot express a threshold between two zooms.

### A property of the map component for each thing drawn on it

Explicit inputs. But every ability that draws on the map would add a property to the map component, which would then know every feature.

## More Information

### Where to find the detail

- [The ability that shows the map, its basemap port and its framing](../../src/features/map/abilities/show-map/)
- [The ability that shows the places as dots](../../src/features/places/abilities/show-places/)
- [The ability that tells an outage of the basemap](../../src/features/map/abilities/report-basemap-outage/)

### References

- [0002: A static client app, reading map data from outside behind ports](0002-a-static-client-app-reading-map-data-from-outside-behind-ports.md)
- [0009: Abilities are RxJS stream functions, without a store](0009-abilities-are-rxjs-stream-functions-without-a-store.md)
- [0010: Only entry points compose, through routes that only wire](0010-only-entry-points-compose.md)
- [0018: The browser talks only to declared services](0018-the-browser-talks-only-to-declared-services.md)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre style specification](https://maplibre.org/maplibre-style-spec/)
- [OpenFreeMap](https://openfreemap.org/)
- [OpenMapTiles schema](https://openmaptiles.org/schema/)

### History

- 2026-11-28, marc-gavanier: first writing.
