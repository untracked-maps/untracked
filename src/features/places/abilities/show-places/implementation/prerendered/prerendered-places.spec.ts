import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Place } from '../../domain/show-places';
import { prerenderedPlaces } from './prerendered-places';

const LOUVRE = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: 'Rue de Rivoli, 75001 Paris',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 },
  fame: 98,
  family: 'culture',
  minzoom: 11.5,
  rank: 1
};

const LOUVRE_ON_MAP: Place = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  family: 'culture',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 },
  minzoom: 11.5,
  rank: 1
};

const PLACES_FILE = '/data/places.json';

const fileHolding =
  (content: unknown, status = 200) =>
  (url: string): Promise<Response> =>
    Promise.resolve(Response.json(url === PLACES_FILE ? content : [], { status }));

const placesRead = (content: unknown, url = PLACES_FILE): Promise<readonly Place[]> =>
  firstValueFrom(prerenderedPlaces(fileHolding(content), url)());

const FLAWED_PLACES: readonly { readonly flaw: string; readonly place: unknown }[] = [
  { flaw: 'is not an object', place: 'Musée du Louvre' },
  { flaw: 'has no id', place: { ...LOUVRE, id: undefined } },
  { flaw: 'has an id that is not text', place: { ...LOUVRE, id: 1 } },
  { flaw: 'has no name', place: { ...LOUVRE, name: undefined } },
  { flaw: 'has a name that is not text', place: { ...LOUVRE, name: 1 } },
  { flaw: 'has no kind', place: { ...LOUVRE, kind: undefined } },
  { flaw: 'has a kind that is not text', place: { ...LOUVRE, kind: 1 } },
  { flaw: 'has no coordinates', place: { ...LOUVRE, coordinates: undefined } },
  { flaw: 'has coordinates that are not an object', place: { ...LOUVRE, coordinates: '2.3, 48.8' } },
  { flaw: 'has no longitude', place: { ...LOUVRE, coordinates: { latitude: 48.86 } } },
  { flaw: 'has a longitude that is not a number', place: { ...LOUVRE, coordinates: { longitude: '2.3', latitude: 48.86 } } },
  { flaw: 'has no latitude', place: { ...LOUVRE, coordinates: { longitude: 2.33 } } },
  { flaw: 'has a latitude that is not a number', place: { ...LOUVRE, coordinates: { longitude: 2.33, latitude: '48.8' } } },
  { flaw: 'has no zoom from which it shows', place: { ...LOUVRE, minzoom: undefined } },
  { flaw: 'has a zoom that is not a number', place: { ...LOUVRE, minzoom: '11.5' } },
  { flaw: 'has no rank', place: { ...LOUVRE, rank: undefined } },
  { flaw: 'has a rank that is not a number', place: { ...LOUVRE, rank: 'first' } }
];

describe('the places the map shows, read from the prerendered file', () => {
  it('hold what the map shows of each place', async () => {
    expect(await placesRead([LOUVRE])).toStrictEqual([LOUVRE_ON_MAP]);
  });

  it('are read from the address of the file', async () => {
    expect(await placesRead([LOUVRE], '/data/other.json')).toStrictEqual([]);
  });

  it('may have no family', async () => {
    expect(await placesRead([{ ...LOUVRE, kind: 'parking', family: undefined }])).toStrictEqual([
      { ...LOUVRE_ON_MAP, kind: 'parking', family: undefined }
    ]);
  });

  it('have no family when theirs is unknown', async () => {
    expect(await placesRead([{ ...LOUVRE, family: 'castle' }])).toStrictEqual([{ ...LOUVRE_ON_MAP, family: undefined }]);
  });

  it.each(FLAWED_PLACES)('leave out a place that $flaw', async ({ place }) => {
    expect(await placesRead([place, LOUVRE])).toStrictEqual([LOUVRE_ON_MAP]);
  });

  it('are none when the file is not a list', async () => {
    expect(await placesRead({ places: [LOUVRE] })).toStrictEqual([]);
  });

  it('cannot be read when the file is not served', async () => {
    const places$ = prerenderedPlaces(fileHolding([LOUVRE], 500), PLACES_FILE)();

    await expect(firstValueFrom(places$)).rejects.toThrow('The places file answered 500.');
  });

  it('are asked for only once someone subscribes', () => {
    const askedTooEarly = (): Promise<Response> => {
      throw new Error('The file was asked before anyone subscribed.');
    };

    expect(prerenderedPlaces(askedTooEarly, PLACES_FILE)).not.toThrow();
  });
});
