<script lang="ts">
  import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
  import { NEVER, type Observable } from 'rxjs';
  import { reportBasemapOutage } from '#features/map/abilities/report-basemap-outage/domain/report-basemap-outage';
  import { mapLibreBasemapEvents } from '#features/map/abilities/report-basemap-outage/implementation/maplibre/basemap-events';
  import BasemapOutage from '#features/map/abilities/report-basemap-outage/ui/components/basemap-outage.svelte';
  import { type MapScene, showMap } from '#features/map/abilities/show-map/domain/show-map';
  import { openFreeMapBasemap } from '#features/map/abilities/show-map/implementation/openfreemap/load-basemap';
  import { openMapTilesId } from '#features/map/abilities/show-map/implementation/openfreemap/style/tiles';
  import MapCanvas from '#features/map/abilities/show-map/ui/components/map-canvas.svelte';
  import { m } from '#i18n/messages';
  import { browser } from '$app/env';
  import { resolve } from '$app/paths';

  const glyphsUrl = (origin: string): string => `${origin}${resolve('/')}glyphs/{fontstack}/{range}.pbf`;

  const scene: Observable<MapScene<StyleSpecification>> = browser
    ? showMap({ loadBasemap: openFreeMapBasemap(glyphsUrl(location.origin)) })()
    : NEVER;

  const basemap = mapLibreBasemapEvents(openMapTilesId);

  const outage: Observable<boolean> = reportBasemapOutage({ basemapEvents: basemap.basemapEvents })();
</script>

<h1>{m.app_name()}</h1>

<MapCanvas {scene} label={m.map_label()} onMap={basemap.watch} />

<BasemapOutage {outage} />

<style>
  h1 {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }
</style>
