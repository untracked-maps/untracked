<script lang="ts">
  import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
  import { map, NEVER, type Observable, ReplaySubject, Subject } from 'rxjs';
  import { keepViewInUrl, viewInUrl } from '#features/map/abilities/keep-view-in-url/domain/keep-view-in-url';
  import {
    locationFragment,
    replacedFragment
  } from '#features/map/abilities/keep-view-in-url/implementation/browser/url-fragment';
  import { locateMe } from '#features/map/abilities/locate-me/domain/locate-me';
  import { inMemoryLocate } from '#features/map/abilities/locate-me/implementation/in-memory/in-memory-locate';
  import LocateButton from '#features/map/abilities/locate-me/ui/components/locate-button.svelte';
  import { positionOverlay } from '#features/map/abilities/locate-me/ui/components/position-overlay';
  import { reportBasemapOutage } from '#features/map/abilities/report-basemap-outage/domain/report-basemap-outage';
  import { mapLibreBasemapEvents } from '#features/map/abilities/report-basemap-outage/implementation/maplibre/basemap-events';
  import BasemapOutage from '#features/map/abilities/report-basemap-outage/ui/components/basemap-outage.svelte';
  import { type MapScene, type MapView, showMap } from '#features/map/abilities/show-map/domain/show-map';
  import { openFreeMapBasemap } from '#features/map/abilities/show-map/implementation/openfreemap/load-basemap';
  import { basemapPalettes } from '#features/map/abilities/show-map/implementation/openfreemap/style/colours';
  import { basemapSpriteName } from '#features/map/abilities/show-map/implementation/openfreemap/style/sprite';
  import { openMapTilesId } from '#features/map/abilities/show-map/implementation/openfreemap/style/tiles';
  import MapCanvas from '#features/map/abilities/show-map/ui/components/map-canvas.svelte';
  import type { Place } from '#features/search/abilities/search-places/domain/place';
  import { searchPlaces } from '#features/search/abilities/search-places/domain/search-places';
  import { miniSearchIndex } from '#features/search/abilities/search-places/implementation/minisearch/minisearch-index';
  import { prerenderedPlaces } from '#features/search/abilities/search-places/implementation/prerendered/prerendered-places';
  import { chosenPlaceOverlay } from '#features/search/abilities/search-places/ui/components/chosen-place-overlay';
  import SearchPlaces from '#features/search/abilities/search-places/ui/components/search-places.svelte';
  import { m } from '#i18n/messages';
  import { browser } from '$app/env';
  import { replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { PageProps } from './$types';

  const { data }: PageProps = $props();

  const glyphsUrl = (origin: string): string => `${origin}${resolve('/')}glyphs/{fontstack}/{range}.pbf`;

  const spriteUrl = (origin: string): string => `${origin}${resolve('/')}sprites/${basemapSpriteName}`;

  const replaceUrl = (url: string): Promise<void> => Promise.resolve(replaceState(url, page.state));

  const scene: Observable<MapScene<StyleSpecification>> = $derived(
    browser
      ? showMap({
          loadBasemap: openFreeMapBasemap(
            { glyphs: glyphsUrl(location.origin), sprite: spriteUrl(location.origin) },
            data.theme.colourScheme.pipe(map((scheme) => basemapPalettes[scheme]))
          )
        })(viewInUrl({ readFragment: locationFragment(location) })())
      : NEVER
  );

  const basemap = mapLibreBasemapEvents(openMapTilesId);

  const outage: Observable<boolean> = reportBasemapOutage({ basemapEvents: basemap.basemapEvents })();

  const locateRequests = new Subject<void>();

  const located = locateMe({ locate: () => inMemoryLocate(data.position)() })(locateRequests);

  const locate = (): void => locateRequests.next();

  const views = new ReplaySubject<MapView>(1);

  const searchWakes = new Subject<void>();

  const searchQueries = new Subject<string>();

  const chosenPlaces = new Subject<Place>();

  const searchState = searchPlaces({
    loadPlaces: prerenderedPlaces((url) => fetch(url), resolve('/data/places.json')),
    indexPlaces: miniSearchIndex
  })({ wake: searchWakes, query: searchQueries, mapView: views });

  const wakeSearch = (): void => searchWakes.next();

  const search = (query: string): void => searchQueries.next(query);

  const choosePlace = (place: Place): void => chosenPlaces.next(place);

  $effect(() => {
    const subscription = keepViewInUrl({ writeFragment: replacedFragment(replaceUrl) })(views).subscribe();
    return (): void => subscription.unsubscribe();
  });

  const keepView = (view: MapView): void => views.next(view);
</script>

<h1>{m.app_name()}</h1>

<SearchPlaces state={searchState} onWake={wakeSearch} onQuery={search} onChoose={choosePlace} ready={browser} />

<MapCanvas
  {scene}
  label={m.map_label()}
  onMap={basemap.watch}
  onViewChange={keepView}
  overlays={[positionOverlay(located), chosenPlaceOverlay(chosenPlaces)]}
/>

<BasemapOutage {outage} />

{#if browser}
  <LocateButton status={located} onLocate={locate} />
{/if}

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
