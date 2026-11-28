import { EMPTY, map, merge, type Observable, Subject, tap } from 'rxjs';
import type { ColourScheme } from '#features/appearance/abilities/choose-theme/domain/choose-theme';
import { BASEMAPS, type Basemap, chooseBasemap } from '#features/map/abilities/choose-basemap/domain/choose-basemap';
import { ignOrthophotos } from '#features/map/abilities/choose-basemap/implementation/ign/ign-orthophotos';
import { linkInUrl, linkKept, placesLinked, pointsLinked } from '#features/map/abilities/keep-view-in-url/domain/followed-link';
import { type LinkTarget, linkTo } from '#features/map/abilities/keep-view-in-url/domain/link-fragment';
import { locationFragment } from '#features/map/abilities/keep-view-in-url/implementation/browser/url-fragment';
import type { Located } from '#features/map/abilities/locate-me/domain/locate-me';
import { showBikeLanes } from '#features/map/abilities/show-bike-lanes/domain/show-bike-lanes';
import type { BasemapImagery } from '#features/map/abilities/show-map/implementation/openfreemap/basemap-style';
import { showTransitLines, type TransitLine } from '#features/map/abilities/show-transit-lines/domain/show-transit-lines';
import { idfmTransitLines } from '#features/map/abilities/show-transit-lines/implementation/idfm/idfm-transit-lines';
import { type KeptOnDevice, keptInMemory, keptOnDevice } from '#features/map/implementation/browser/kept-on-device';
import { type Notices, noticeBoard } from '#features/notices/abilities/show-notice/ui/components/notice-board';
import { type Opening, openPlace, type PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import { clipboardCopy } from '#features/places/abilities/open-place/implementation/browser/clipboard';
import { prerenderedPlaces as prerenderedPlacesOfSheet } from '#features/places/abilities/open-place/implementation/prerendered/prerendered-places';
import { addressCopying } from '#features/places/abilities/open-place/ui/components/address-copying';
import { shareSheet } from '#features/places/abilities/share-link/implementation/browser/share-sheet';
import { linkSharing } from '#features/places/abilities/share-link/ui/components/link-sharing';
import { type PlaceDot, showPlaces } from '#features/places/abilities/show-places/domain/show-places';
import { prerenderedPlaces as prerenderedPlacesOnMap } from '#features/places/abilities/show-places/implementation/prerendered/prerendered-places';
import { findAddress } from '#features/search/abilities/find-address/domain/find-address';
import { lazyAddressBook } from '#features/search/abilities/find-address/implementation/lazy/lazy-address-book';
import { prerenderedAddressBook } from '#features/search/abilities/find-address/implementation/prerendered/prerendered-address-book';
import type { IndexPlaces } from '#features/search/abilities/search-places/domain/search-places';
import { miniSearchIndex } from '#features/search/abilities/search-places/implementation/minisearch/minisearch-index';
import type { LoadPlaces } from '#features/search/domain/place';
import { prerenderedPlaces } from '#features/search/implementation/prerendered/prerendered-places';
import { type TallestSheet, tallestSheet } from '#libraries/design/tallest-sheet';
import { fetchedOnce } from '#libraries/fetched-once/fetched-once';
import { browser } from '$app/env';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';
import { type CoveredPlaces, coveredLoad } from './covered-places';
import { type Districts, districtSheets } from './districts';
import type { Zone } from './opening-hours';
import { type SheetSections, sheetSections } from './sheet-sections';
import { type Chosen, chosenOpened, type Spots, spotsInspected } from './spots';

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

type PlaceSheets = {
  readonly sheet: Observable<PlaceSheet>;
  readonly open: (opening: Opening) => void;
  readonly close: () => void;
  readonly copy: (text: string) => void;
  readonly vibrate: (milliseconds: number) => void;
};

const placeSheets = ({ fetchPlaces, areas }: CoveredPlaces, notices: Notices, closeOthers: () => void): PlaceSheets => {
  const opened = new Subject<Opening>();
  const closed = new Subject<void>();
  return {
    sheet: openPlace({
      loadPlaces: prerenderedPlacesOfSheet({
        places: fetchPlaces,
        details: async () => fetchFile(resolve('/data/place-details.json'))
      }),
      areas
    })({ opened, closed }),
    open: (opening): void => {
      closeOthers();
      opened.next(opening);
    },
    close: () => closed.next(),
    copy: addressCopying({ copyText: clipboardCopy(browser ? navigator.clipboard : undefined) }, notices.tell),
    vibrate: (milliseconds) => navigator.vibrate?.(milliseconds)
  };
};

const SHOWN_OR_HIDDEN = [false, true] as const;

const keptChoice = <Value>(key: string, values: readonly [Value, ...Value[]]): KeptOnDevice<Value> =>
  browser ? keptOnDevice(localStorage, key, values) : keptInMemory(values);

const fetchFile = (url: string): Promise<Response> => fetch(url);

type Links = {
  readonly followed: Observable<unknown>;
  readonly kept: Observable<boolean>;
  readonly share: (shared: LinkTarget & { readonly title: string }) => void;
};

const sharedLinks = (places: PlaceSheets, spots: Spots, notices: Notices): Links => {
  const link$ = browser ? linkInUrl({ readFragment: locationFragment(location) })() : EMPTY;
  const copyText = clipboardCopy(browser ? navigator.clipboard : undefined);
  const share = linkSharing({ shareUrl: shareSheet(browser ? navigator : undefined), copyText }, notices.tell);
  return {
    followed: merge(placesLinked(link$).pipe(tap(places.open)), pointsLinked(link$).pipe(tap(spots.inspect))),
    kept: linkKept(link$, spots.sheetOpen),
    share: ({ title, ...target }) => share({ title, url: linkTo(location.href, target) })
  };
};

const searchSources = ({ fetchPlaces, areas }: CoveredPlaces): SearchSources => {
  const withAddresses = findAddress({
    loadAddresses: prerenderedAddressBook(fetchFile, resolve('/data/addresses.json')),
    indexAddresses: lazyAddressBook
  });
  return {
    loadPlaces: coveredLoad(areas, prerenderedPlaces(fetchPlaces, resolve('/data/places.json'))),
    indexPlaces: (places) => withAddresses(miniSearchIndex(places))
  };
};

type Loaded = SheetSections & {
  readonly position: Located;
  readonly zone: Zone;
  readonly layers: MapLayers;
  readonly search: SearchSources;
  readonly notices: Notices;
  readonly sheetHeights: TallestSheet;
  readonly places: PlaceSheets;
  readonly spots: Spots;
  readonly districts: Districts;
  readonly openChosen: Chosen;
  readonly links: Links;
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

const placesShownBeside = ({ fetchPlaces, areas }: CoveredPlaces, places: PlaceSheets): Loaded['placesShown'] => {
  const openId = places.sheet.pipe(map((sheet) => (sheet.status === 'open' ? sheet.place.id : undefined)));
  const shownOnMap = showPlaces({
    loadPlaces: coveredLoad(areas, prerenderedPlacesOnMap(fetchPlaces, resolve('/data/places.json')))
  });
  return (zoom$) => shownOnMap(zoom$, openId);
};

const othersClosed = (dismissed: Subject<void>, districts: Districts) => (): void => {
  dismissed.next();
  districts.close();
};

export const load: PageLoad = async ({ data, parent }): Promise<Loaded> => {
  const { theme } = await parent();
  const covered: CoveredPlaces = { fetchPlaces: fetchedOnce(fetchFile, resolve('/data/places.json')), areas: data.areas };
  const notices = noticeBoard();
  const dismissed = new Subject<void>();
  const districts = districtSheets(fetchFile, resolve('/data/districts.json'));
  const places = placeSheets(covered, notices, othersClosed(dismissed, districts));
  const spots = spotsInspected({ places, districts, dismissed }, fetchFile, resolve('/data/addresses.json'));
  return {
    ...data,
    search: searchSources(covered),
    notices,
    sheetHeights: tallestSheet(),
    places,
    ...sheetSections(places.sheet, data.zone),
    spots,
    districts,
    openChosen: chosenOpened({ places, districts, spots }),
    links: sharedLinks(places, spots, notices),
    placesShown: placesShownBeside(covered, places),
    layers: mapLayers(theme.colourScheme)
  };
};
