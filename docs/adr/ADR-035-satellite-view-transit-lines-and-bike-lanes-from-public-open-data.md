# ADR-035 — A satellite view, transit lines and bike lanes from public open data, loaded when first chosen

**Date**: 2026-11-16
**Status**: accepted

## Context

The previous app's map type panel offered four maps: the plan, a satellite view, the transit lines and the bike lanes. Its satellite view drew the aerial photos of IGN under the labels of the plan, as a hybrid; its transit and bike maps drew files that a pipeline of its own produced every night. This repository produces no map data ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)), so each layer must come from a service the browser calls directly, which then sees the visitor's IP address ([ADR-021](ADR-021-maplibre-and-the-openfreemap-basemap.md)). The map pages have almost no room left in their script budget ([ADR-022](ADR-022-lighthouse-budgets-per-page.md)): 359.8 kB for 360 kB. The popover of the map type holds one section per choice, given by the route ([ADR-032](ADR-032-the-home-screen-layout-a-native-dialog-and-a-welcome-kept-on-the-device.md)).

The sources were checked on 2026-11-16:

- **Aerial photos**: the BD ORTHO® of IGN, served by the WMTS of the Géoplateforme, `https://data.geopf.fr/wmts`, layer `ORTHOIMAGERY.ORTHOPHOTOS`, in Web Mercator up to zoom 19, under the [Licence Ouverte Etalab 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/). No key, no usage limit, CORS open to any origin, no cookie. France only.
- **Transit lines**: the dataset [`traces-du-reseau-ferre-idf`](https://data.iledefrance-mobilites.fr/explore/dataset/traces-du-reseau-ferre-idf/) of Île-de-France Mobilités, on its Opendatasoft portal, under the Licence Ouverte 2.0: the train, RER, metro, tram and shuttle lines of Île-de-France with their official web colour. Its GeoJSON export, limited to the shape, the mode and the colour, weighs 2.4 MB, 0.98 MB compressed, and may be cached for 60 seconds. No official source covers the rest of France in one file.
- **Bike lanes**: the vector tiles `OSM.PISTECYCLABLE` of the Géoplateforme, `https://data.geopf.fr/tms/1.0.0/OSM.PISTECYCLABLE/{z}/{x}/{y}.pbf`, layer `piste_cyclable`, from zoom 14 to 19, an extract of OpenStreetMap of January 2024 (ODbL) hosted by IGN, whose attribute `symbol` tells four kinds: `piste_cyclable`, `bande_cyclable`, `voie_partage` and `trottoir_cyclable`.
- Neither IGN nor Île-de-France Mobilités, nor Opendatasoft for the portal, publishes how long it keeps access logs.

## Decision

- **Three abilities of the `map` feature**, composed by the route with `show-map` ([ADR-008](ADR-008-composition-in-routes.md)):
  - `choose-basemap`: the plan or the satellite view. Its domain turns the chosen basemap into the imagery to draw, loaded through a port only once the satellite view is chosen. The imagery goes through the existing port of `show-map`: the OpenFreeMap adapter takes a stream of imagery next to the stream of palettes, and puts its sources and layers over the shapes of the basemap and under its labels, so that street and place names stay readable over the photos, as in the previous app. Changing the basemap or the theme keeps the camera, as before.
  - `show-transit-lines`: its domain loads the lines once, the first time they are shown, keeps them for the visit, and draws nothing when they cannot be loaded; showing them again after a failure tries again. The adapter for Île-de-France Mobilités turns the export into the domain's own lines, a mode and a colour per path, and drops what is not a line.
  - `show-bike-lanes`: its domain gives the palette to draw the bike lanes in, or nothing while they are hidden, so that they follow the theme. Each kind has its own look: tracks thick and solid, painted lanes thinner and lighter, lanes shared with other traffic dashed, tracks on the pavement dotted in teal; darker greens on the light map, lighter ones on the dark map.
- **Layers drawn at runtime through the `overlays` hook** of the map component: a helper of the feature, `map/ui/components/layers-on-map`, adds the sources and layers an overlay gives under the first label, adds them again after each style change, since MapLibre's `setStyle` removes what it does not find in the new style, and removes them when the overlay has nothing more to draw.
- **Every choice is kept on the device** in `localStorage`, under `untracked-maps.basemap`, `untracked-maps.transit-lines` and `untracked-maps.bike-lanes`, through one adapter of the feature, `keptOnDevice`, as the theme is ([ADR-026](ADR-026-a-theme-chosen-on-the-device-applied-before-the-first-paint.md)).
- **Nothing is requested before the visitor turns an option on**, and **the code of each layer is loaded with a dynamic `import()` when it is first chosen**: the WMTS source of the photos, the parser of the export of Île-de-France Mobilités, the GeoJSON and style of the transit lines, and the tiles and style of the bike lanes. The first load keeps the popover's sections, the domains and the small adapters that load the rest.
- **The popover** holds, in the previous app's order, "Map type", the plan and the satellite view as a native radio group with drawn thumbnails, "Layers", the transit lines and the bike lanes as native checkboxes, each with a hint ("Île-de-France only"; "Seen when zoomed in · OpenStreetMap, January 2024"), then the theme. The design library gets three generic components for them: `picture-choice`, `field-group`, which `segmented-control` and `picture-choice` now use for their fieldset and legend, and `checkbox`, which the route uses directly for the two layers.
- **Credits follow what is shown**: the map's credit line adds "© IGN BD ORTHO®", "© Île-de-France Mobilités" or "Bike lanes: IGN" while each is shown; the "About" dialog names both providers among its sources and gives the full attribution in its credits.
- **Content Security Policy**: `https://data.geopf.fr` and `https://data.iledefrance-mobilites.fr` are added to `connect-src` only. MapLibre fetches raster tiles with `fetch` and decodes them with `createImageBitmap`, so `img-src` needs no new host: the satellite view was checked in Chrome without any violation.
- **"Who sees what"** gets a section per service: what it sees, why, when (only once the visitor turns the option on; otherwise nothing is requested from it) and what it says about its access logs (nothing). Île-de-France Mobilités sees the IP address but not the area looked at, since the file covers the whole region.
- **End-to-end tests** answer the requests to the Géoplateforme with an empty response and those to Île-de-France Mobilités with a one-line fixture, so that they do not depend on either service, and check that neither is called before an option is turned on.

## Consequences

- The map pages go over their script budget: Lighthouse measured 362.4 kB of script for 360 kB on 2026-11-16, in English and in French, about 2.6 kB more than before this change; every other assertion passes. Measured with gzip on the built files, the popover's sections weigh about 0.95 kB, the credit components 0.47 kB, the "About" dialog's new sources and credits 0.39 kB, in the layout, and the domains, the adapters' entry points and the overlay helper about 0.9 kB. Moving the overlay helper behind a dynamic import saved nothing, since the import itself costs as much; dropping the two toggle components for the library's checkbox saved little. Loading the popover's sections only once it is first opened would save less than their 0.95 kB and still leave the pages over budget. The budget is left as it is, for the owner to decide between raising it, as [ADR-022](ADR-022-lighthouse-budgets-per-page.md) allows after measuring, and lighter sections.
- Turning the transit lines on downloads about 1 MB, once per visit.
- Outside France, the satellite view finds no photo and shows the plan; outside Île-de-France, the transit layer is empty, as its hint says.
- The bike lanes are those of OpenStreetMap in January 2024, until IGN publishes a new extract.
- Each change of basemap or theme gives MapLibre a new style, which removes the overlays' layers; they are added again at once, and the transit lines are not fetched again.

## Alternatives considered

- **Esri, Mapbox or Google imagery**: sharper outside France, but under terms of use that ask for keys or accounts, and services with their own tracking.
- **Transit and bike lanes from the OpenMapTiles of OpenFreeMap**: no host more, but its schema has no line colours or line references for transit, and no painted or shared bike lanes.
- **Files produced by a pipeline of our own**, as the previous app did: complete and fresh, but producing data belongs to another project ([ADR-001](ADR-001-a-static-web-app-and-nothing-else.md)).
- **The satellite view as an overlay** rather than through `show-map`'s port: it would need its own rule to stay under the other overlays, which are added under the labels in the order they are turned on.
- **Keeping runtime layers across style changes with `transformStyle`**: no layer to add again, but `show-map` would have to tell its own layers from the others.
- **Fetching the GeoJSON in MapLibre's worker by giving the source its URL**: no parsing on the main thread, but the file would be fetched again after each style change, once its 60 seconds of cache are over.
