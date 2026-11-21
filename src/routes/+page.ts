import { BehaviorSubject, combineLatest, defer, firstValueFrom, map, type Observable, of, Subject, shareReplay } from 'rxjs';
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
import {
  type Coordinates,
  type InspectedSpot,
  inspectPoint
} from '#features/places/abilities/inspect-point/domain/inspect-point';
import { nearestAddress } from '#features/places/abilities/inspect-point/implementation/prerendered/nearest-address';
import { prerenderedAddresses } from '#features/places/abilities/inspect-point/implementation/prerendered/prerendered-addresses';
import { copyAddress, type Opening, openPlace, type PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import { clipboardCopy } from '#features/places/abilities/open-place/implementation/browser/clipboard';
import { prerenderedPlaces as prerenderedPlacesOfSheet } from '#features/places/abilities/open-place/implementation/prerendered/prerendered-places';
import { type PlaceDot, showPlaces } from '#features/places/abilities/show-places/domain/show-places';
import { prerenderedPlaces as prerenderedPlacesOnMap } from '#features/places/abilities/show-places/implementation/prerendered/prerendered-places';
import { findAddress } from '#features/search/abilities/find-address/domain/find-address';
import { lazyAddressBook } from '#features/search/abilities/find-address/implementation/lazy/lazy-address-book';
import { prerenderedAddressBook } from '#features/search/abilities/find-address/implementation/prerendered/prerendered-address-book';
import type { IndexPlaces } from '#features/search/abilities/search-places/domain/search-places';
import { miniSearchIndex } from '#features/search/abilities/search-places/implementation/minisearch/minisearch-index';
import type { LoadPlaces } from '#features/search/domain/place';
import { prerenderedPlaces } from '#features/search/implementation/prerendered/prerendered-places';
import { m } from '#i18n/messages';
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
  readonly place: (height: number) => void;
  readonly list: (height: number) => void;
  readonly tallest: Observable<number>;
};

const sheetHeights = (): SheetHeights => {
  const spot = new BehaviorSubject(0);
  const place = new BehaviorSubject(0);
  const list = new BehaviorSubject(0);
  return {
    spot: (height) => spot.next(height),
    place: (height) => place.next(height),
    list: (height) => list.next(height),
    tallest: combineLatest([spot, place, list]).pipe(map((heights) => Math.max(...heights)))
  };
};

type PlaceSheets = {
  readonly sheet: Observable<PlaceSheet>;
  readonly open: (opening: Opening) => void;
  readonly close: () => void;
  readonly copy: (text: string) => void;
  readonly vibrate: (milliseconds: number) => void;
};

const COPY_NOTICES = { copied: m.place_sheet_address_copied, 'not copied': m.place_sheet_address_not_copied };

const placeSheets = (fetchPlaces: () => Promise<Response>, notices: Notices): PlaceSheets => {
  const opened = new Subject<Opening>();
  const closed = new Subject<void>();
  const copy = copyAddress({ copyText: clipboardCopy(browser ? navigator.clipboard : undefined) });
  return {
    sheet: openPlace({ loadPlaces: prerenderedPlacesOfSheet(fetchPlaces, resolve('/data/places.json')) })({ opened, closed }),
    open: (opening) => opened.next(opening),
    close: () => closed.next(),
    copy: (text) => copy(of(text)).subscribe((copied) => notices.tell({ text: COPY_NOTICES[copied]() })),
    vibrate: (milliseconds) => navigator.vibrate?.(milliseconds)
  };
};

type Spots = {
  readonly spot: Observable<InspectedSpot>;
  readonly inspect: (spot: Coordinates) => void;
  readonly dismiss: () => void;
};

const spotsInspected = (): Spots => {
  const inspected = new Subject<Coordinates>();
  const dismissed = new Subject<void>();
  const reverseGeocode = nearestAddress(prerenderedAddresses(fetchFile, resolve('/data/addresses.json')));
  return {
    spot: inspectPoint({ reverseGeocode })({ inspected, dismissed }),
    inspect: (spot) => inspected.next(spot),
    dismiss: () => dismissed.next()
  };
};

const SHOWN_OR_HIDDEN = [false, true] as const;

const keptChoice = <Value>(key: string, values: readonly [Value, ...Value[]]): KeptOnDevice<Value> =>
  browser ? keptOnDevice(localStorage, key, values) : keptInMemory(values);

const fetchFile = (url: string): Promise<Response> => fetch(url);

const answered = (response: Response): Response => {
  if (!response.ok) {
    throw new Error(`The file answered ${response.status}.`);
  }
  return response;
};

const fetchedOnce = (url: string): (() => Promise<Response>) => {
  const answer$ = defer(() => fetch(url)).pipe(map(answered), shareReplay(1));
  return async () => (await firstValueFrom(answer$)).clone();
};

const searchSources = (fetchPlaces: () => Promise<Response>): SearchSources => {
  const withAddresses = findAddress({
    loadAddresses: prerenderedAddressBook(fetchFile, resolve('/data/addresses.json')),
    indexAddresses: lazyAddressBook
  });
  return {
    loadPlaces: prerenderedPlaces(fetchPlaces, resolve('/data/places.json')),
    indexPlaces: (places) => withAddresses(miniSearchIndex(places))
  };
};

type Loaded = {
  readonly position: Located;
  readonly layers: MapLayers;
  readonly search: SearchSources;
  readonly notices: Notices;
  readonly sheetHeights: SheetHeights;
  readonly places: PlaceSheets;
  readonly spots: Spots;
  readonly placesShown: (zoom$: Observable<number>) => Observable<readonly PlaceDot[]>;
};

const mapLayers = (colourScheme: Observable<ColourScheme>): MapLayers => {
  const basemap = keptChoice('untracked-maps.basemap', BASEMAPS);
  const transitLines = keptChoice('untracked-maps.transit-lines', SHOWN_OR_HIDDEN);
  const bikeLanes = keptChoice('untracked-maps.bike-lanes', SHOWN_OR_HIDDEN);
  return {
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
    bikeLanesOnMap: showBikeLanes({ shownBikeLanes: bikeLanes.kept })(colourScheme)
  };
};

export const load: PageLoad = async ({ data, parent }): Promise<Loaded> => {
  const { theme } = await parent();
  const fetchPlaces = fetchedOnce(resolve('/data/places.json'));
  const notices = noticeBoard();
  const places = placeSheets(fetchPlaces, notices);
  const openId = places.sheet.pipe(map((sheet) => (sheet.status === 'open' ? sheet.place.id : undefined)));
  const shownOnMap = showPlaces({ loadPlaces: prerenderedPlacesOnMap(fetchPlaces, resolve('/data/places.json')) });
  return {
    ...data,
    search: searchSources(fetchPlaces),
    notices,
    sheetHeights: sheetHeights(),
    places,
    spots: spotsInspected(),
    placesShown: (zoom$) => shownOnMap(zoom$, openId),
    layers: mapLayers(theme.colourScheme)
  };
};
