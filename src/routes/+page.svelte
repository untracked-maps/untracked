<script lang="ts">
  import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
  import { combineLatest, map, merge, NEVER, type Observable, of, ReplaySubject, Subject, tap } from 'rxjs';
  import ThemeSwitcher from '#features/appearance/abilities/choose-theme/ui/components/theme-switcher.svelte';
  import LanguageSuggestion from '#features/languages/abilities/suggest-language/ui/components/language-suggestion.svelte';
  import BasemapSwitcher from '#features/map/abilities/choose-basemap/ui/components/basemap-switcher.svelte';
  import SatelliteCredit from '#features/map/abilities/choose-basemap/ui/components/satellite-credit.svelte';
  import { keepViewInUrl, viewInUrl } from '#features/map/abilities/keep-view-in-url/domain/keep-view-in-url';
  import {
    locationFragment,
    replacedFragment
  } from '#features/map/abilities/keep-view-in-url/implementation/browser/url-fragment';
  import LocateButton from '#features/map/abilities/locate-me/ui/components/locate-button.svelte';
  import { positionOverlay } from '#features/map/abilities/locate-me/ui/components/position-overlay';
  import { reportBasemapOutage } from '#features/map/abilities/report-basemap-outage/domain/report-basemap-outage';
  import { mapLibreBasemapEvents } from '#features/map/abilities/report-basemap-outage/implementation/maplibre/basemap-events';
  import BasemapOutage from '#features/map/abilities/report-basemap-outage/ui/components/basemap-outage.svelte';
  import BikeLanesCredit from '#features/map/abilities/show-bike-lanes/ui/components/bike-lanes-credit.svelte';
  import { loadBikeLanesLayers } from '#features/map/abilities/show-bike-lanes/ui/components/bike-lanes-overlay';
  import { type MapScene, type MapView, showMap } from '#features/map/abilities/show-map/domain/show-map';
  import { openFreeMapBasemap } from '#features/map/abilities/show-map/implementation/openfreemap/load-basemap';
  import { basemapPalettes } from '#features/map/abilities/show-map/implementation/openfreemap/style/colours';
  import { openMapTilesId } from '#features/map/abilities/show-map/implementation/openfreemap/style/tiles';
  import { openFreeMapProtocol } from '#features/map/abilities/show-map/implementation/openfreemap/tile-description';
  import { framingOverlay } from '#features/map/abilities/show-map/ui/components/framing-overlay';
  import MapCanvas from '#features/map/abilities/show-map/ui/components/map-canvas.svelte';
  import MapCredit from '#features/map/abilities/show-map/ui/components/map-credit.svelte';
  import ZoomButtons from '#features/map/abilities/show-map/ui/components/zoom-buttons.svelte';
  import { type ZoomStep, zoomOverlay } from '#features/map/abilities/show-map/ui/components/zoom-overlay';
  import TransitLinesCredit from '#features/map/abilities/show-transit-lines/ui/components/transit-lines-credit.svelte';
  import { loadTransitLinesLayers } from '#features/map/abilities/show-transit-lines/ui/components/transit-lines-overlay';
  import { layersOverlay } from '#features/map/ui/components/layers-on-map';
  import NoticeCard from '#features/notices/abilities/show-notice/ui/components/notice.svelte';
  import PlaceFreshness from '#features/places/abilities/glance-at-place/ui/components/place-freshness.svelte';
  import PlaceGlance from '#features/places/abilities/glance-at-place/ui/components/place-glance.svelte';
  import { inspectedSpotOverlay } from '#features/places/abilities/inspect-point/ui/components/inspected-spot-overlay';
  import SpotCard from '#features/places/abilities/inspect-point/ui/components/spot-card.svelte';
  import { placesOpenedAt } from '#features/places/abilities/open-place/domain/open-place';
  import { openPlaceOverlay } from '#features/places/abilities/open-place/ui/components/open-place-overlay';
  import PlaceSheetCard from '#features/places/abilities/open-place/ui/components/place-sheet.svelte';
  import OpeningHours from '#features/places/abilities/show-opening-hours/ui/components/opening-hours.svelte';
  import OpeningStatus from '#features/places/abilities/show-opening-hours/ui/components/opening-status.svelte';
  import PhotoStrip from '#features/places/abilities/show-photos/ui/components/photo-strip.svelte';
  import { placeDotAt } from '#features/places/abilities/show-places/ui/components/place-dot-at';
  import { placeDotsOverlay } from '#features/places/abilities/show-places/ui/components/place-dots-overlay';
  import { stationExitsOverlay } from '#features/places/abilities/show-station/ui/components/station-exits-overlay';
  import StationSections from '#features/places/abilities/show-station/ui/components/station-sections.svelte';
  import StreetView from '#features/places/abilities/show-street-view/ui/components/street-view.svelte';
  import { touchedMapOverlay } from '#features/places/abilities/touch-the-map/ui/components/touched-map-overlay';
  import WelcomeCard from '#features/privacy/abilities/welcome-visitor/ui/components/welcome-card.svelte';
  import { districtOutlineLayers } from '#features/search/abilities/open-district/ui/components/district-outline';
  import DistrictSheetCard from '#features/search/abilities/open-district/ui/components/district-sheet.svelte';
  import { type RecentPlace, recentSearches } from '#features/search/abilities/recent-searches/domain/recent-searches';
  import { localRecents } from '#features/search/abilities/recent-searches/implementation/browser/local-recents';
  import RecentSearches from '#features/search/abilities/recent-searches/ui/components/recent-searches.svelte';
  import type { CategoryKey } from '#features/search/abilities/search-by-type/domain/categories';
  import { namedCategory } from '#features/search/abilities/search-by-type/domain/named-category';
  import { placesFoundAt, searchByType } from '#features/search/abilities/search-by-type/domain/search-by-type';
  import { lazyCategoryWords } from '#features/search/abilities/search-by-type/implementation/lazy/lazy-category-words';
  import KindNamed from '#features/search/abilities/search-by-type/ui/components/kind-named.svelte';
  import { kindPlacesOverlay } from '#features/search/abilities/search-by-type/ui/components/kind-places-overlay';
  import KindSearch from '#features/search/abilities/search-by-type/ui/components/kind-search.svelte';
  import { addressesChosenAt } from '#features/search/abilities/search-places/domain/chosen-place';
  import { searchPlaces } from '#features/search/abilities/search-places/domain/search-places';
  import type { SearchPanel } from '#features/search/abilities/search-places/ui/components/combobox.presenter';
  import SearchPlaces from '#features/search/abilities/search-places/ui/components/search-places.svelte';
  import { m } from '#i18n/messages';
  import Checkbox from '#libraries/design/checkbox.svelte';
  import FieldGroup from '#libraries/design/field-group.svelte';
  import LayersIcon from '#libraries/design/layers-icon.svelte';
  import PopoverButton from '#libraries/design/popover-button.svelte';
  import '#libraries/design/tokens.css';
  import { localizeHref } from '#i18n/runtime';
  import { browser } from '$app/env';
  import { replaceState } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { PageProps } from './$types';
  import { locating } from './locating';
  import { placeGlance } from './place-glance';
  import { photoSource } from './place-photos';
  import { welcomed } from './welcome';

  const { data }: PageProps = $props();

  const replaceUrl = (url: string): Promise<void> => Promise.resolve(replaceState(url, page.state));

  const layers = $derived(data.layers);

  const [transitLinesShown, bikeLanesShown] = $derived([layers.transitLinesShown, layers.bikeLanesShown]);

  const scene: Observable<MapScene<StyleSpecification>> = $derived(
    browser
      ? showMap({
          loadBasemap: openFreeMapBasemap(
            { origin: location.origin, basePath: resolve('/') },
            data.theme.colourScheme.pipe(map((scheme) => basemapPalettes[scheme])),
            layers.satelliteImagery
          )
        })(viewInUrl({ readFragment: locationFragment(location) })())
      : NEVER
  );

  const basemap = mapLibreBasemapEvents(openMapTilesId);

  const outage: Observable<boolean> = reportBasemapOutage({ basemapEvents: basemap.basemapEvents })();

  const { located, locate, position } = locating(() => data.position);

  const zooms = new Subject<ZoomStep>();

  const zoom = (step: ZoomStep): void => zooms.next(step);

  const views = new ReplaySubject<MapView>(1);

  const searchWakes = new ReplaySubject<void>(1);

  const searchQueries = new ReplaySubject<string>(1);

  const chosenPlaces = new Subject<RecentPlace>();

  const clearedRecents = new Subject<void>();

  const restoredRecents = new Subject<void>();

  const searchInputs = { wake: searchWakes, query: searchQueries };

  const searchState = $derived(searchPlaces(data.search)({ ...searchInputs, mapView: views }));

  const kindChoices = new Subject<CategoryKey | undefined>();

  const kindSearch = $derived(searchByType(data.search)({ chosen: kindChoices, mapView: views }));

  const kindNamed = namedCategory({ loadCategoryFinder: lazyCategoryWords })(searchInputs);

  const chooseKind = (category?: CategoryKey): void => kindChoices.next(category);

  const wakeSearch = (): void => searchWakes.next();

  const search = (query: string): void => searchQueries.next(query);

  const choosePlace =
    (from: 'search' | 'kind list') =>
    (place: RecentPlace): void => {
      chosenPlaces.next(place);
      data.openChosen(place, from);
      if (from === 'search') {
        chooseKind();
      }
    };

  const recents = browser
    ? recentSearches(localRecents(localStorage))({ chosen: chosenPlaces, cleared: clearedRecents, restored: restoredRecents })
    : of([]);

  const chooseRecent =
    ({ settle }: SearchPanel) =>
    (recent: RecentPlace): void => {
      settle(recent.name);
      choosePlace('search')(recent);
    };

  const clearRecents =
    ({ focusField }: SearchPanel) =>
    (): void => {
      focusField();
      clearedRecents.next();
      data.notices.tell({
        text: m.recent_searches_cleared(),
        action: { label: m.notice_undo(), run: () => restoredRecents.next() }
      });
    };

  $effect(() => {
    const subscription = merge(
      recents,
      data.sheetHeights.tallest.pipe(tap((height) => data.sheets.show(height))),
      keepViewInUrl({ writeFragment: replacedFragment(replaceUrl) })(views, data.closing.steps, data.links.kept),
      inspectedSpot.pipe(tap(({ kind }) => data.closing.of('spot').onToggle(kind !== 'none'))),
      placeSheet.pipe(tap(({ status }) => data.closing.of('place').onToggle(status === 'open'))),
      kindSearch.pipe(tap(({ status }) => data.closing.of('kind list').onToggle(status !== 'closed'))),
      districtSheet.pipe(tap(({ status }) => data.closing.of('district').onToggle(status === 'open'))),
      data.links.followed,
      data.hours.preloaded(views),
      position
    ).subscribe();
    return (): void => subscription.unsubscribe();
  });

  const [placeSheet, inspectedSpot, districtSheet] = $derived([data.places.sheet, data.spots.spot, data.districts.sheet]);

  const glanced = $derived(placeGlance(data.places.sheet, data.hours.view, position));

  const welcome = welcomed();

  const welcomeShown: Observable<boolean> = $derived(
    combineLatest([welcome.shown, data.spots.sheetOpen, kindSearch]).pipe(
      map(([shown, sheetOpen, list]) => shown && !sheetOpen && list.status === 'closed')
    )
  );
</script>

<h1>{m.app_name()}</h1>

<div class="top" data-sheet-top>
  <SearchPlaces
    state={searchState}
    onWake={wakeSearch}
    onQuery={search}
    onChoose={choosePlace('search')}
    ready={browser}
    onOpen={data.closing.of('search').onToggle}
    closings={data.closing.of('search').closings}
  >
    {#snippet lead(panel)}
      <KindNamed named={kindNamed} onChoose={chooseKind} onClear={(): void => panel.settle('')} />
    {/snippet}
    {#snippet suggestions(panel)}
      <RecentSearches {recents} onChoose={chooseRecent(panel)} onClear={clearRecents(panel)} />
    {/snippet}
  </SearchPlaces>
  <div class="kinds" data-notice-under>
    <KindSearch
      search={kindSearch}
      onChoose={chooseKind}
      onChoosePlace={choosePlace('kind list')}
      ready={browser}
      covered={$inspectedSpot.kind !== 'none' || $placeSheet.status === 'open' || $districtSheet.status === 'open'}
      onSheetHeight={data.sheetHeights.of('list')}
      closings={data.closing.of('kind list').closings}
    />
  </div>
  <div class="notice">
    <NoticeCard shown={data.notices.shown} onAct={data.notices.act} />
  </div>
  <PlaceSheetCard
    sheet={placeSheet}
    typed={data.station.lines}
    onClose={data.places.close}
    onCopy={data.places.copy}
    onShare={data.links.share}
    vibrate={data.places.vibrate}
    onSheetHeight={data.sheetHeights.of('place')}
    closings={data.closing.of('place').closings}
  >
    {#snippet first()}
      <StationSections station={data.station.view} onExit={data.station.touch} timeZone={data.zone.timeZone} />
    {/snippet}
    {#snippet hours()}
      <OpeningHours hours={data.hours.view} />
    {/snippet}
    {#snippet freshness()}
      <PlaceFreshness glance={glanced} closable={data.closing.of('place window')} />
    {/snippet}
    {#snippet glance()}
      <PlaceGlance glance={glanced}>
        {#snippet hours()}
          <OpeningStatus hours={data.hours.view} />
        {/snippet}
      </PlaceGlance>
    {/snippet}
    {#snippet photos(name: string)}
      <PhotoStrip photos={data.photos} {name} source={photoSource} closable={data.closing.of('photo viewer')} />
    {/snippet}
  </PlaceSheetCard>
  <SpotCard
    spot={inspectedSpot}
    onClose={data.spots.dismiss}
    onShare={data.links.share}
    onCopy={data.places.copy}
    vibrate={data.places.vibrate}
    onSheetHeight={data.sheetHeights.of('spot')}
    closings={data.closing.of('spot').closings}
  />
  <DistrictSheetCard
    sheet={districtSheet}
    onClose={data.districts.close}
    onSheetHeight={data.sheetHeights.of('district')}
    closings={data.closing.of('district').closings}
  />
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
  protocol={openFreeMapProtocol((url, init) => fetch(url, init))}
  onViewChange={(view): void => views.next(view)}
  overlays={[
    placeDotsOverlay(data.placesShown, data.theme.colourScheme),
    positionOverlay(located),
    kindPlacesOverlay(kindSearch),
    openPlaceOverlay(placeSheet, data.theme.colourScheme),
    stationExitsOverlay(data.station.view, data.station.touched),
    framingOverlay({
      placesOpened: merge(placesOpenedAt(placeSheet), addressesChosenAt(chosenPlaces)),
      districtsOpened: data.districts.framed,
      placesListed: placesFoundAt(kindSearch)
    }),
    zoomOverlay(zooms),
    layersOverlay(layers.transitLinesOnMap, loadTransitLinesLayers),
    layersOverlay(layers.bikeLanesOnMap, loadBikeLanesLayers),
    layersOverlay(data.districts.outlined, districtOutlineLayers),
    inspectedSpotOverlay(inspectedSpot, { onInspect: data.spots.inspect }),
    touchedMapOverlay({
      placeAt: placeDotAt,
      vibrate: data.places.vibrate,
      sheetOpen: data.spots.sheetOpen,
      onOpenPlace: (id) => data.places.open({ id, from: 'map' }),
      onInspect: data.spots.inspect,
      onClose: data.spots.closeSheets
    })
  ]}
/>

<div class="afloat">
  <BasemapOutage {outage} />

  <div class="corner">
    <div class="welcome">
      <WelcomeCard
        welcome={welcomeShown}
        privacyHref={localizeHref(resolve('/(content)/privacy'))}
        onAcknowledge={welcome.acknowledge}
        ready={browser}
      />
    </div>
    <div class="credit">
      <StreetView
        view={data.streetView}
        sheetHeight={data.sheetHeights.tallest}
        source={photoSource}
        closable={data.closing.of('photo viewer')}
      />
      <MapCredit>
        <SatelliteCredit basemap={layers.basemap.kept()} />
        <TransitLinesCredit shown={layers.transitLinesShown} />
        <BikeLanesCredit shown={layers.bikeLanesShown} />
      </MapCredit>
    </div>
    <div class="controls" data-sheet-stack>
      <PopoverButton label={m.layers_label()} closable={data.closing.of('map menu')}>
        {#snippet icon()}
          <LayersIcon />
        {/snippet}
        <BasemapSwitcher basemap={layers.basemap.kept()} onChoose={layers.basemap.keep} />
        <FieldGroup legend={m.overlays_label()}>
          <Checkbox
            label={m.transit_lines()}
            hint={m.transit_lines_hint()}
            checked={$transitLinesShown}
            onToggle={layers.transitLines.keep}
          />
          <Checkbox
            label={m.bike_lanes()}
            hint={m.bike_lanes_hint()}
            checked={$bikeLanesShown}
            onToggle={layers.bikeLanes.keep}
          />
        </FieldGroup>
        <ThemeSwitcher choice={data.theme.choice} onChoose={data.theme.choose} />
      </PopoverButton>
      <ZoomButtons onZoom={zoom} ready={browser} />
      <LocateButton status={located} onLocate={locate} ready={browser} />
    </div>
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

  .top > :global(search),
  .kinds {
    grid-area: 1 / 1;
    align-self: start;
  }

  .kinds {
    display: grid;
    inline-size: 100%;
    margin-block-start: calc(var(--control-size) + var(--space-3));
  }

  @media (width >= 700px), (width >= 560px) and (orientation: landscape) {
    .top {
      grid-template-columns: min(25rem, 58vw - 1rem) minmax(0, 1fr);
      column-gap: var(--space-3);
    }

    .top > :global(*) {
      grid-column: 1;
    }

    .kinds {
      grid-area: 1 / 2;
      align-self: center;
      margin-block-start: 0;
    }

    .top > .notice {
      grid-area: 2 / 1 / auto / -1;
      justify-self: start;
      inline-size: min(26.25rem, 100% - 3.75rem);
    }

    :global(main:has([data-sheet-open])) .notice {
      grid-column: 2;
      inline-size: min(26.25rem, 100% - 4rem);
      margin-inline-start: var(--space-1);
    }

    :global(main:has([data-sheet-open])) .afloat {
      margin-inline-start: calc(min(25rem, 58vw - 1rem) + var(--space-4));
    }
  }

  .notice {
    position: relative;
    z-index: 4;
    justify-self: center;
    inline-size: min(26.25rem, 100%);
    margin-block-start: calc(var(--space-2) - var(--space-3));
  }

  @media (width <= 699px) and (orientation: portrait), (width <= 559px) {
    :global(main:has([data-sheet-at-top])) .notice {
      position: fixed;
      inset-block-start: max(var(--edge), env(safe-area-inset-top));
      inset-inline: max(var(--edge), env(safe-area-inset-left)) max(var(--edge), env(safe-area-inset-right));
      inline-size: auto;
      max-inline-size: 26.25rem;
      margin: 0 auto;
    }
  }

  .afloat {
    display: grid;
    visibility: var(--floats);
    gap: var(--space-3);
    translate: 0 calc(var(--lift) * -1px);
    transition: translate 0.2s ease;
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
    flex-direction: column;
    grid-area: credit;
    gap: var(--space-3);
    align-items: flex-start;
    margin-block-end: calc(-1 * (var(--control-size) + var(--space-3)));
  }

  .controls {
    display: grid;
    visibility: var(--floats);
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

  @media (width <= 699px) and (orientation: portrait) {
    :global(:has(> main)):has(.afloat) {
      grid-template-rows: minmax(0, 1fr) auto;
      block-size: 100dvh;
    }

    .afloat {
      grid-template-rows: auto minmax(0, 1fr);
      min-block-size: 0;
    }

    .corner {
      grid-template-rows: minmax(0, 1fr) auto;
    }

    .welcome {
      align-self: stretch;
      min-block-size: 0;
    }
  }
</style>
