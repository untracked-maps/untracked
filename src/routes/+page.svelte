<script lang="ts">
  import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
  import { map, NEVER, type Observable, of, ReplaySubject, Subject } from 'rxjs';
  import { WELCOME_STORAGE_KEY } from '#configuration/welcome';
  import ThemeSwitcher from '#features/appearance/abilities/choose-theme/ui/components/theme-switcher.svelte';
  import LanguageSuggestion from '#features/languages/abilities/suggest-language/ui/components/language-suggestion.svelte';
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
  import MapCredit from '#features/map/abilities/show-map/ui/components/map-credit.svelte';
  import ZoomButtons from '#features/map/abilities/show-map/ui/components/zoom-buttons.svelte';
  import { type ZoomStep, zoomOverlay } from '#features/map/abilities/show-map/ui/components/zoom-overlay';
  import { welcomeVisitor } from '#features/privacy/abilities/welcome-visitor/domain/welcome-visitor';
  import { localAcknowledgement } from '#features/privacy/abilities/welcome-visitor/implementation/browser/local-acknowledgement';
  import WelcomeCard from '#features/privacy/abilities/welcome-visitor/ui/components/welcome-card.svelte';
  import { type RecentPlace, recentSearches } from '#features/search/abilities/recent-searches/domain/recent-searches';
  import { localRecents } from '#features/search/abilities/recent-searches/implementation/browser/local-recents';
  import RecentSearches from '#features/search/abilities/recent-searches/ui/components/recent-searches.svelte';
  import { searchPlaces } from '#features/search/abilities/search-places/domain/search-places';
  import { miniSearchIndex } from '#features/search/abilities/search-places/implementation/minisearch/minisearch-index';
  import { prerenderedPlaces } from '#features/search/abilities/search-places/implementation/prerendered/prerendered-places';
  import { chosenPlaceOverlay } from '#features/search/abilities/search-places/ui/components/chosen-place-overlay';
  import type { SearchPanel } from '#features/search/abilities/search-places/ui/components/combobox.presenter';
  import SearchPlaces from '#features/search/abilities/search-places/ui/components/search-places.svelte';
  import type { Place } from '#features/search/domain/place';
  import { m } from '#i18n/messages';
  import LayersIcon from '#libraries/design/layers-icon.svelte';
  import PopoverButton from '#libraries/design/popover-button.svelte';
  import '#libraries/design/tokens.css';
  import { localizeHref } from '#i18n/runtime';
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

  const zooms = new Subject<ZoomStep>();

  const zoom = (step: ZoomStep): void => zooms.next(step);

  const views = new ReplaySubject<MapView>(1);

  const searchWakes = new Subject<void>();

  const searchQueries = new Subject<string>();

  const chosenPlaces = new Subject<RecentPlace>();

  const clearedRecents = new Subject<void>();

  const searchState = searchPlaces({
    loadPlaces: prerenderedPlaces((url) => fetch(url), resolve('/data/places.json')),
    indexPlaces: miniSearchIndex
  })({ wake: searchWakes, query: searchQueries, mapView: views });

  const wakeSearch = (): void => searchWakes.next();

  const search = (query: string): void => searchQueries.next(query);

  const choosePlace = (place: Place): void => chosenPlaces.next(place);

  const recents = browser
    ? recentSearches(localRecents(localStorage))({ chosen: chosenPlaces, cleared: clearedRecents })
    : of([]);

  const chooseRecent =
    ({ settle }: SearchPanel) =>
    (recent: RecentPlace): void => {
      settle(recent.name);
      chosenPlaces.next(recent);
    };

  const clearRecents =
    ({ focusField }: SearchPanel) =>
    (): void => {
      focusField();
      clearedRecents.next();
    };

  $effect(() => {
    const subscription = recents.subscribe();
    return (): void => subscription.unsubscribe();
  });

  $effect(() => {
    const subscription = keepViewInUrl({ writeFragment: replacedFragment(replaceUrl) })(views).subscribe();
    return (): void => subscription.unsubscribe();
  });

  const keepView = (view: MapView): void => views.next(view);

  const acknowledgement = browser ? localAcknowledgement(localStorage, WELCOME_STORAGE_KEY) : undefined;

  const welcome: Observable<boolean> =
    acknowledgement === undefined ? of(true) : welcomeVisitor({ acknowledged: acknowledgement.acknowledged })();

  const acknowledge = (): void => acknowledgement?.acknowledge();
</script>

<h1>{m.app_name()}</h1>

<div class="top">
  <SearchPlaces state={searchState} onWake={wakeSearch} onQuery={search} onChoose={choosePlace} ready={browser}>
    {#snippet suggestions(panel)}
      <RecentSearches {recents} onChoose={chooseRecent(panel)} onClear={clearRecents(panel)} />
    {/snippet}
  </SearchPlaces>
  <LanguageSuggestion
    suggestion={data.languageSuggestion.suggestion}
    path={page.url.pathname}
    onDismiss={data.languageSuggestion.dismiss}
  />
</div>

<MapCanvas
  {scene}
  label={m.map_label()}
  onMap={basemap.watch}
  onViewChange={keepView}
  overlays={[positionOverlay(located), chosenPlaceOverlay(chosenPlaces), zoomOverlay(zooms)]}
/>

<BasemapOutage {outage} />

<div class="corner">
  <div class="welcome">
    <WelcomeCard {welcome} privacyHref={localizeHref(resolve('/(content)/privacy'))} onAcknowledge={acknowledge} />
  </div>
  <div class="credit">
    <MapCredit />
  </div>
  <div class="controls">
    <PopoverButton label={m.layers_label()}>
      {#snippet icon()}
        <LayersIcon />
      {/snippet}
      <ThemeSwitcher choice={data.theme.choice} onChoose={data.theme.choose} />
    </PopoverButton>
    <ZoomButtons onZoom={zoom} ready={browser} />
    <LocateButton status={located} onLocate={locate} ready={browser} />
  </div>
</div>

<style>
  h1 {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }

  .top {
    position: relative;
    z-index: 2;
    display: grid;
    gap: var(--space-3);
    justify-items: start;
    margin-block-end: auto;
  }

  .corner {
    display: grid;
    grid-template-areas:
      "welcome welcome"
      "credit controls";
    grid-template-columns: 1fr auto;
    gap: var(--space-3);
    align-items: end;
  }

  .welcome {
    display: flex;
    grid-area: welcome;
    justify-content: flex-end;
  }

  .welcome:empty {
    display: none;
  }

  .credit {
    display: flex;
    grid-area: credit;
    margin-block-end: calc(-1 * (var(--control-size) + var(--space-3)));
  }

  .controls {
    display: grid;
    grid-area: controls;
    gap: var(--space-3);
    justify-items: end;
  }

  @media (width >= 700px) {
    .corner {
      grid-template-areas: "credit welcome controls";
      grid-template-columns: auto 1fr auto;
    }

    .welcome {
      margin-block-end: calc(-1 * (var(--control-size) + var(--space-3)));
    }
  }
</style>
