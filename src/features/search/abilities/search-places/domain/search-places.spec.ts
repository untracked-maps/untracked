import { type Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { Coordinates, LoadPlaces, Place } from '../../../domain/place';
import { normalised } from '../../../domain/text';
import { type FindPlaces, type IndexPlaces, type SearchState, searchPlaces } from './search-places';

const place = (id: string, name: string, coordinates: Coordinates): Place => ({
  id,
  name,
  kind: 'pharmacy',
  address: '',
  coordinates,
  fame: 0
});

const ORSAY = place('orsay', 'Pharmacie Orsay', { longitude: 2.3266, latitude: 48.86 });
const ORSAY_SOUTH = place('orsay-south', 'Pharmacie Orsay', { longitude: 2.1873, latitude: 48.6978 });
const PLACES: readonly Place[] = [ORSAY, ORSAY_SOUTH];
const SOUTH: { readonly center: Coordinates } = { center: { longitude: 2.19, latitude: 48.7 } };

const longitudesAway =
  (reference: Coordinates) =>
  (left: Place, right: Place): number =>
    Math.abs(left.coordinates.longitude - reference.longitude) - Math.abs(right.coordinates.longitude - reference.longitude);

const nearestNamed =
  (places: readonly Place[]): FindPlaces =>
  (query, reference): readonly Place[] =>
    places.filter(({ name }) => normalised(name).split(' ').includes(query)).toSorted(longitudesAway(reference));

const indexExactly: IndexPlaces = (places) => of(nearestNamed(places));

const IDLE: SearchState = { kind: 'idle' };
const searching = (query: string): SearchState => ({ kind: 'searching', query });
const found = (query: string, places: readonly Place[]): SearchState => ({ kind: 'found', query, places });

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

type Inputs = {
  readonly wake?: string;
  readonly query: string;
  readonly queries?: Readonly<Record<string, string>>;
  readonly mapView?: string;
  readonly loadPlaces?: LoadPlaces;
};

const statesOf =
  ({ hot, cold }: Pick<Parameters<Parameters<TestScheduler['run']>[0]>[0], 'hot' | 'cold'>) =>
  ({ wake = 'w', query, queries = {}, mapView = '', loadPlaces }: Inputs): Observable<SearchState> =>
    searchPlaces({
      loadPlaces: loadPlaces ?? ((): Observable<readonly Place[]> => cold('p', { p: PLACES })),
      indexPlaces: indexExactly
    })({
      wake: hot(wake, { w: undefined }),
      query: hot(query, queries),
      mapView: cold(mapView, { s: SOUTH })
    });

describe('search places', () => {
  it('shows nothing before the visitor types', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(statesOf(helpers)({ query: '---' })).toBe('i', { i: IDLE });
    });
  });

  it('searches nothing under two characters', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(statesOf(helpers)({ query: '-q', queries: { q: ' o ' } })).toBe('ii', { i: IDLE });
    });
  });

  it('tells the visitor it is searching as soon as they type', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(statesOf(helpers)({ query: '-q', queries: { q: 'orsay' } }), '^-!').toBe('is', {
        i: IDLE,
        s: searching('orsay')
      });
    });
  });

  it('finds the places a quarter of a second after the visitor stops typing', () => {
    scheduler().run((helpers) => {
      helpers.expectObservable(statesOf(helpers)({ query: '-q', queries: { q: 'orsay' } })).toBe('is 249ms f', {
        i: IDLE,
        s: searching('orsay'),
        f: found('orsay', [ORSAY, ORSAY_SOUTH])
      });
    });
  });

  it('forgets a search the visitor kept typing over', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(statesOf(helpers)({ query: '-a 99ms b', queries: { a: 'or', b: 'orsay' } }))
        .toBe('ia 99ms b 249ms f', {
          i: IDLE,
          a: searching('or'),
          b: searching('orsay'),
          f: found('orsay', [ORSAY, ORSAY_SOUTH])
        });
    });
  });

  it('does not search again when only spaces were added', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(statesOf(helpers)({ query: '-a 9ms b', queries: { a: 'orsay', b: ' orsay ' } }))
        .toBe('is 249ms f', { i: IDLE, s: searching('orsay'), f: found('orsay', [ORSAY, ORSAY_SOUTH]) });
    });
  });

  it('tells the visitor no place has the name', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(statesOf(helpers)({ query: '-q', queries: { q: 'louvre' } }))
        .toBe('is 249ms n', { i: IDLE, s: searching('louvre'), n: { kind: 'not-found', query: 'louvre' } });
    });
  });

  it('ranks the places from the centre of the map', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(statesOf(helpers)({ query: '-q', queries: { q: 'orsay' }, mapView: 's' }))
        .toBe('is 249ms f', { i: IDLE, s: searching('orsay'), f: found('orsay', [ORSAY_SOUTH, ORSAY]) });
    });
  });

  it('tells the visitor the search is unavailable when the places cannot be loaded', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(statesOf(helpers)({ query: '-q', queries: { q: 'orsay' }, loadPlaces: () => helpers.cold('#') }))
        .toBe('is 249ms u', { i: IDLE, s: searching('orsay'), u: { kind: 'unavailable' } });
    });
  });

  it('waits for places that arrive after the pause', () => {
    scheduler().run((helpers) => {
      helpers
        .expectObservable(
          statesOf(helpers)({ query: '-q', queries: { q: 'orsay' }, loadPlaces: () => helpers.cold('500ms p', { p: PLACES }) })
        )
        .toBe('is 498ms f', { i: IDLE, s: searching('orsay'), f: found('orsay', [ORSAY, ORSAY_SOUTH]) });
    });
  });
});

describe('places loading', () => {
  it('waits for the search to wake', () => {
    scheduler().run((helpers) => {
      const places$ = helpers.cold('p', { p: PLACES });
      helpers.expectObservable(statesOf(helpers)({ wake: '--w', query: '', loadPlaces: () => places$ }));
      helpers.expectSubscriptions(places$.subscriptions).toBe('--^');
    });
  });

  it('loads the places once, however often the search wakes and is watched', () => {
    scheduler().run((helpers) => {
      const places$ = helpers.cold('p', { p: PLACES });
      const states$ = statesOf(helpers)({ wake: '-ww', query: '--q', queries: { q: 'orsay' }, loadPlaces: () => places$ });
      helpers.expectObservable(states$);
      helpers.expectObservable(states$);
      helpers.expectSubscriptions(places$.subscriptions).toBe('-^');
    });
  });
});
