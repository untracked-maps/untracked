import type { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { Coordinates, LoadPlaces, Place, PlaceKind } from '../../../domain/place';
import { type KindSearch, searchByType } from './search-by-type';

const KILOMETRES_PER_DEGREE_OF_LATITUDE = 110.54;

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const SOUTH: Coordinates = { longitude: 2.3522, latitude: 48.75 };

const placeNorthOf = (reference: Coordinates, id: string, kilometres: number, kind: PlaceKind = 'bakery'): Place => ({
  id,
  name: id,
  kind,
  address: '',
  coordinates: {
    longitude: reference.longitude,
    latitude: reference.latitude + kilometres / KILOMETRES_PER_DEGREE_OF_LATITUDE
  },
  fame: 0
});

const CENTRAL = placeNorthOf(CENTRE_OF_PARIS, 'central', 1);
const CENTRAL_FURTHER = placeNorthOf(CENTRE_OF_PARIS, 'central-further', 2);
const SOUTHERN = placeNorthOf(SOUTH, 'southern', 1);
const PHARMACY = placeNorthOf(CENTRE_OF_PARIS, 'pharmacy', 1, 'pharmacy');
const PLACES: readonly Place[] = [CENTRAL_FURTHER, SOUTHERN, CENTRAL, PHARMACY];

const CLOSED: KindSearch = { status: 'closed' };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

type Helpers = Pick<Parameters<Parameters<TestScheduler['run']>[0]>[0], 'hot' | 'cold'>;

type Inputs = {
  readonly chosen: string;
  readonly mapView?: string;
  readonly loadPlaces?: LoadPlaces;
};

const CHOICES: Readonly<Record<string, PlaceKind | undefined>> = { b: 'bakery', p: 'pharmacy', h: 'hospital', x: undefined };

const searchesOf =
  ({ hot, cold }: Helpers) =>
  ({ chosen, mapView = '', loadPlaces }: Inputs): Observable<KindSearch> =>
    searchByType({ loadPlaces: loadPlaces ?? ((): Observable<readonly Place[]> => cold('p', { p: PLACES })) })({
      chosen: hot(chosen, CHOICES),
      mapView: hot(mapView, { s: { center: SOUTH } })
    });

const searching = (placeKind: PlaceKind): KindSearch => ({ status: 'searching', placeKind });

const CENTRAL_BAKERIES = {
  c: CLOSED,
  s: searching('bakery'),
  f: { status: 'found', placeKind: 'bakery', places: [CENTRAL, CENTRAL_FURTHER] }
} as const;

describe('search by type', () => {
  it('is closed before a kind is chosen', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(searchesOf(helpers)({ chosen: '---' })).toBe('c', { c: CLOSED });
    });
  });

  it('finds the nearest places of the kind chosen around the centre of Paris', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(searchesOf(helpers)({ chosen: '-b' })).toBe('c(sf)', CENTRAL_BAKERIES);
    });
  });

  it('finds them around the centre of the map', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(searchesOf(helpers)({ mapView: 's', chosen: '-b' })).toBe('c(sf)', {
        c: CLOSED,
        s: searching('bakery'),
        f: { status: 'found', placeKind: 'bakery', places: [SOUTHERN] }
      });
    });
  });

  it('keeps the places found when the map moves afterwards', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(searchesOf(helpers)({ chosen: '-b', mapView: '--s' })).toBe('c(sf)', CENTRAL_BAKERIES);
    });
  });

  it('tells the visitor it is searching while the places are on their way', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(searchesOf(helpers)({ chosen: '-p', loadPlaces: () => helpers.cold('--p', { p: PLACES }) }))
        .toBe('cs-f', {
          c: CLOSED,
          s: searching('pharmacy'),
          f: { status: 'found', placeKind: 'pharmacy', places: [PHARMACY] }
        });
    });
  });

  it('tells the visitor no place of the kind is near', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(searchesOf(helpers)({ chosen: '-h' }))
        .toBe('c(sn)', { c: CLOSED, s: searching('hospital'), n: { status: 'none-near', placeKind: 'hospital' } });
    });
  });

  it('tells the visitor the search is unavailable when the places cannot be loaded', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(searchesOf(helpers)({ chosen: '-b', loadPlaces: () => helpers.cold('#') }))
        .toBe('c(su)', { c: CLOSED, s: searching('bakery'), u: { status: 'unavailable', placeKind: 'bakery' } });
    });
  });

  it('closes when the visitor closes the list', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(searchesOf(helpers)({ chosen: '-b---x' })).toBe('c(sf)c', CENTRAL_BAKERIES);
    });
  });

  it('forgets the kind chosen before when another is chosen', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(searchesOf(helpers)({ chosen: '-b-p', loadPlaces: () => helpers.cold('---p', { p: PLACES }) }))
        .toBe('cb-p--f', {
          c: CLOSED,
          b: searching('bakery'),
          p: searching('pharmacy'),
          f: { status: 'found', placeKind: 'pharmacy', places: [PHARMACY] }
        });
    });
  });
});

describe('places watched by the search by type', () => {
  it('stops watching the choices once nobody watches the search', () => {
    scheduler().run((helpers) => {
      const chosen$ = helpers.hot('-b', CHOICES);
      helpers.expectObservable(
        searchByType({ loadPlaces: () => helpers.cold('p', { p: PLACES }) })({ chosen: chosen$, mapView: helpers.hot('') }),
        '^--!'
      );
      helpers.expectSubscriptions(chosen$.subscriptions).toBe('^--!');
    });
  });

  it('loads the places once per choice, however often it is watched', () => {
    scheduler().run((helpers) => {
      const places$ = helpers.cold('p|', { p: PLACES });
      const searches$ = searchesOf(helpers)({ chosen: '-b', loadPlaces: () => places$ });
      helpers.expectObservable(searches$);
      helpers.expectObservable(searches$);
      helpers.expectSubscriptions(places$.subscriptions).toBe('-(^!)');
    });
  });
});
