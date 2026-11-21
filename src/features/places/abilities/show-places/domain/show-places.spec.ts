import { firstValueFrom, type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Family, type Place, type PlaceDot, showPlaces } from './show-places';

const EIFFEL: Place = {
  name: 'Tour Eiffel',
  kind: 'attraction',
  family: 'sight',
  coordinates: { longitude: 2.294_48, latitude: 48.858_26 },
  minzoom: 11.5,
  rank: 0
};

const LAFAYETTE: Place = {
  name: 'Galeries Lafayette',
  kind: 'department-store',
  family: 'shop',
  coordinates: { longitude: 2.332_14, latitude: 48.873_73 },
  minzoom: 13.75,
  rank: 110
};

const PARKING: Place = {
  name: 'Parking Vinci',
  kind: 'parking',
  family: undefined,
  coordinates: { longitude: 2.3, latitude: 48.86 },
  minzoom: 16.5,
  rank: 199
};

const EIFFEL_DOT: PlaceDot = {
  name: 'Tour Eiffel',
  family: 'sight',
  coordinates: { longitude: 2.294_48, latitude: 48.858_26 },
  order: 0
};

const LAFAYETTE_DOT: PlaceDot = {
  name: 'Galeries Lafayette',
  family: 'shop',
  coordinates: { longitude: 2.332_14, latitude: 48.873_73 },
  order: 110
};

const placeOf = (family: Family | undefined, kind = 'place'): Place => ({
  ...PARKING,
  name: family ?? kind,
  kind,
  family,
  minzoom: 19
});

const EVERY_FAMILY: readonly Place[] = [
  placeOf('food'),
  placeOf('cafe'),
  placeOf('bar'),
  placeOf('bakery'),
  placeOf('culture'),
  placeOf('sight'),
  placeOf('health'),
  placeOf('stay'),
  placeOf('nature'),
  placeOf('shop'),
  placeOf('money'),
  placeOf('fuel'),
  placeOf('train'),
  placeOf(undefined, 'parking'),
  placeOf(undefined, 'school')
];

const dotsAt = (zoom: number, places: readonly Place[]): Promise<readonly PlaceDot[]> =>
  firstValueFrom(showPlaces({ loadPlaces: (): Observable<readonly Place[]> => of(places) })(of(zoom)));

const namesAt = async (zoom: number, places: readonly Place[]): Promise<readonly string[]> =>
  (await dotsAt(zoom, places)).map(({ name }) => name);

const ordersAt = async (zoom: number, places: readonly Place[]): Promise<Readonly<Record<string, number>>> =>
  Object.fromEntries((await dotsAt(zoom, places)).map(({ name, order }) => [name, order]));

const ZOOMS: Readonly<Record<string, number>> = { a: 13.5, b: 13.7, c: 13.75, d: 13.99, e: 14 };

const DOTS: Readonly<Record<string, readonly PlaceDot[]>> = { n: [], e: [EIFFEL_DOT], l: [EIFFEL_DOT, LAFAYETTE_DOT] };

const expectDots = (zooms: string, places: string, expected: string): void =>
  new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }) => {
    const loadPlaces = (): Observable<readonly Place[]> => cold(places, { p: [EIFFEL, LAFAYETTE] });
    expectObservable(showPlaces({ loadPlaces })(cold(zooms, ZOOMS))).toBe(expected, DOTS);
  });

describe('show places, before zoom 17', () => {
  it('shows a place put forward from its own zoom', async () => {
    expect(await dotsAt(11.5, [EIFFEL, LAFAYETTE])).toStrictEqual([EIFFEL_DOT]);
  });

  it('shows no place before its own zoom', async () => {
    expect(await dotsAt(11.25, [EIFFEL, LAFAYETTE])).toStrictEqual([]);
  });

  it('orders the places by their rank', async () => {
    expect(await dotsAt(16.75, [LAFAYETTE, EIFFEL])).toStrictEqual([LAFAYETTE_DOT, EIFFEL_DOT]);
  });

  it('shows no place without a family', async () => {
    expect(await dotsAt(16.75, [PARKING])).toStrictEqual([]);
  });
});

describe('show places, from zoom 17', () => {
  it('shows where to eat, what to see, where to be cared for and where to sleep from zoom 17', async () => {
    expect(await namesAt(17, EVERY_FAMILY)).toStrictEqual([
      'food',
      'cafe',
      'bar',
      'bakery',
      'culture',
      'sight',
      'health',
      'stay'
    ]);
  });

  it('shows parks, shops, banks and fuel stations too from zoom 17.5', async () => {
    expect((await namesAt(17.5, EVERY_FAMILY)).slice(8)).toStrictEqual(['nature', 'shop', 'money', 'fuel']);
  });

  it('shows no other family before zoom 17.5', async () => {
    expect(await namesAt(17.25, EVERY_FAMILY)).toHaveLength(8);
  });

  it('shows places without a family too from zoom 18, but neither stations nor schools', async () => {
    expect((await namesAt(18, EVERY_FAMILY)).slice(12)).toStrictEqual(['parking']);
  });

  it('shows no place without a family before zoom 18', async () => {
    expect(await namesAt(17.75, EVERY_FAMILY)).toHaveLength(12);
  });

  it('shows a place whatever the zoom from which it is put forward', async () => {
    expect(await namesAt(17, [{ ...EIFFEL, minzoom: 17.5 }])).toStrictEqual(['Tour Eiffel']);
  });

  it('gives each family its priority, and the last one to places without a family', async () => {
    expect(await ordersAt(18, EVERY_FAMILY)).toStrictEqual({
      food: 0,
      cafe: 0,
      bar: 0.5,
      bakery: 0.5,
      culture: 1,
      sight: 1,
      health: 2,
      stay: 2.5,
      nature: 3,
      shop: 4,
      money: 4.5,
      fuel: 4.5,
      parking: 5
    });
  });
});

describe('show places, as the map zooms', () => {
  it('waits for the places', () => {
    expectDots('a', '---p', '---e');
  });

  it('shows the places again when the zoom crosses a step of 0.25', () => {
    expectDots('a-c', 'p', 'e-l');
  });

  it('shows nothing again while the zoom stays within a step of 0.25', () => {
    expectDots('ab-cd-e', 'p', 'e--l--l');
  });

  it('shows no place when the places cannot be loaded', async () => {
    const loadPlaces = (): Observable<readonly Place[]> => throwError(() => new Error('The places file answered 500.'));

    expect(await firstValueFrom(showPlaces({ loadPlaces })(of(17)))).toStrictEqual([]);
  });

  it('asks for the places only once the map has a zoom', () => {
    const refusing = (): Observable<readonly Place[]> => {
      throw new Error('The places were asked before anyone subscribed.');
    };

    expect(() => showPlaces({ loadPlaces: refusing })(of(17))).not.toThrow();
  });
});
