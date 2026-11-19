import { BehaviorSubject, combineLatest, map, type Observable, Subject } from 'rxjs';
import type { ColourScheme } from '#features/appearance/abilities/choose-theme/domain/choose-theme';
import { BASEMAPS, type Basemap, chooseBasemap } from '#features/map/abilities/choose-basemap/domain/choose-basemap';
import { ignOrthophotos } from '#features/map/abilities/choose-basemap/implementation/ign/ign-orthophotos';
import type { Located } from '#features/map/abilities/locate-me/domain/locate-me';
import { showBikeLanes } from '#features/map/abilities/show-bike-lanes/domain/show-bike-lanes';
import type { BasemapImagery } from '#features/map/abilities/show-map/implementation/openfreemap/basemap-style';
import { showTransitLines, type TransitLine } from '#features/map/abilities/show-transit-lines/domain/show-transit-lines';
import { idfmTransitLines } from '#features/map/abilities/show-transit-lines/implementation/idfm/idfm-transit-lines';
import { type KeptOnDevice, keptInMemory, keptOnDevice } from '#features/map/implementation/browser/kept-on-device';
import { type Notice, showNotice } from '#features/notices/abilities/show-notice/domain/show-notice';
import { findAddress } from '#features/search/abilities/find-address/domain/find-address';
import { lazyAddressBook } from '#features/search/abilities/find-address/implementation/lazy/lazy-address-book';
import { prerenderedAddressBook } from '#features/search/abilities/find-address/implementation/prerendered/prerendered-address-book';
import type { IndexPlaces } from '#features/search/abilities/search-places/domain/search-places';
import { miniSearchIndex } from '#features/search/abilities/search-places/implementation/minisearch/minisearch-index';
import type { LoadPlaces } from '#features/search/domain/place';
import { prerenderedPlaces } from '#features/search/implementation/prerendered/prerendered-places';
import { browser } from '$app/env';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

type MapLayers = {
  readonly basemap: KeptOnDevice<Basemap>;
  readonly transitLines: KeptOnDevice<boolean>;
  readonly bikeLanes: KeptOnDevice<boolean>;
  readonly transitLinesShown: Observable<boolean>;
  readonly bikeLanesShown: Observable<boolean>;
  readonly satelliteImagery: Observable<BasemapImagery | undefined>;
  readonly transitLinesOnMap: Observable<readonly TransitLine[] | undefined>;
  readonly bikeLanesOnMap: Observable<ColourScheme | undefined>;
};

type SearchSources = {
  readonly loadPlaces: LoadPlaces;
  readonly indexPlaces: IndexPlaces;
};

type Notices = {
  readonly shown: Observable<Notice | undefined>;
  readonly tell: (notice: Notice) => void;
  readonly act: () => void;
};

const noticeBoard = (): Notices => {
  const told = new Subject<Notice>();
  const acted = new Subject<void>();
  return { shown: showNotice({ told, acted }), tell: (notice) => told.next(notice), act: () => acted.next() };
};

type SheetHeights = {
  readonly spot: (height: number) => void;
  readonly list: (height: number) => void;
  readonly tallest: Observable<number>;
};

const sheetHeights = (): SheetHeights => {
  const spot = new BehaviorSubject(0);
  const list = new BehaviorSubject(0);
  return {
    spot: (height) => spot.next(height),
    list: (height) => list.next(height),
    tallest: combineLatest([spot, list]).pipe(map((heights) => Math.max(...heights)))
  };
};

const SHOWN_OR_HIDDEN = [false, true] as const;

const keptChoice = <Value>(key: string, values: readonly [Value, ...Value[]]): KeptOnDevice<Value> =>
  browser ? keptOnDevice(localStorage, key, values) : keptInMemory(values);

const fetchFile = (url: string): Promise<Response> => fetch(url);

const searchSources = (): SearchSources => {
  const withAddresses = findAddress({
    loadAddresses: prerenderedAddressBook(fetchFile, resolve('/data/addresses.json')),
    indexAddresses: lazyAddressBook
  });
  return {
    loadPlaces: prerenderedPlaces(fetchFile, resolve('/data/places.json')),
    indexPlaces: (places) => withAddresses(miniSearchIndex(places))
  };
};

export const load: PageLoad = async ({
  data,
  parent
}): Promise<{
  readonly position: Located;
  readonly layers: MapLayers;
  readonly search: SearchSources;
  readonly notices: Notices;
  readonly sheetHeights: SheetHeights;
}> => {
  const { theme } = await parent();
  const basemap = keptChoice('untracked-maps.basemap', BASEMAPS);
  const transitLines = keptChoice('untracked-maps.transit-lines', SHOWN_OR_HIDDEN);
  const bikeLanes = keptChoice('untracked-maps.bike-lanes', SHOWN_OR_HIDDEN);
  return {
    ...data,
    search: searchSources(),
    notices: noticeBoard(),
    sheetHeights: sheetHeights(),
    layers: {
      basemap,
      transitLines,
      bikeLanes,
      transitLinesShown: transitLines.kept(),
      bikeLanesShown: bikeLanes.kept(),
      satelliteImagery: chooseBasemap({ chosenBasemap: basemap.kept, loadSatelliteImagery: ignOrthophotos })(),
      transitLinesOnMap: showTransitLines({
        shownTransitLines: transitLines.kept,
        loadTransitLines: idfmTransitLines((url) => fetch(url))
      })(),
      bikeLanesOnMap: showBikeLanes({ shownBikeLanes: bikeLanes.kept })(theme.colourScheme)
    }
  };
};
