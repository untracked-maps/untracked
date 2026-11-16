import { firstValueFrom, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Place } from '../../domain/place';
import { prerenderedPlaces } from './prerendered-places';

const LOUVRE: Place = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: 'Rue de Rivoli, 75001 Paris',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 },
  fame: 98
};

const serving =
  (body: unknown, status = 200) =>
  (url: string): Promise<Response> =>
    Promise.resolve(url === '/data/places.json' ? Response.json(body, { status }) : new Response('', { status: 404 }));

const placesServed = (body: unknown): Promise<readonly Place[]> =>
  firstValueFrom(prerenderedPlaces(serving(body), '/data/places.json')());

const INVALID_PLACES: readonly (readonly [string, unknown])[] = [
  ['a value that is not an object', 'Louvre'],
  ['no id', { ...LOUVRE, id: undefined }],
  ['an id that is not text', { ...LOUVRE, id: 1 }],
  ['no name', { ...LOUVRE, name: undefined }],
  ['a name that is not text', { ...LOUVRE, name: 1 }],
  ['no kind', { ...LOUVRE, kind: undefined }],
  ['an unknown kind', { ...LOUVRE, kind: 'castle' }],
  ['no address', { ...LOUVRE, address: undefined }],
  ['an address that is not text', { ...LOUVRE, address: 1 }],
  ['no coordinates', { ...LOUVRE, coordinates: undefined }],
  ['coordinates that are not an object', { ...LOUVRE, coordinates: '2.3, 48.8' }],
  ['no longitude', { ...LOUVRE, coordinates: { latitude: 48.86 } }],
  ['a longitude that is not a number', { ...LOUVRE, coordinates: { longitude: '2.3', latitude: 48.86 } }],
  ['no latitude', { ...LOUVRE, coordinates: { longitude: 2.33 } }],
  ['a latitude that is not a number', { ...LOUVRE, coordinates: { longitude: 2.33, latitude: '48.8' } }],
  ['no fame', { ...LOUVRE, fame: undefined }],
  ['a fame that is not a number', { ...LOUVRE, fame: 'high' }]
];

describe('prerendered places', () => {
  it('reads the places of the prerendered file', async () => {
    expect(await placesServed([LOUVRE])).toEqual([LOUVRE]);
  });

  it.each(INVALID_PLACES)('leaves out a place with %s', async (_, invalid) => {
    expect(await placesServed([invalid, LOUVRE])).toEqual([LOUVRE]);
  });

  it('reads no place from a file that is not a list', async () => {
    expect(await placesServed({ places: [LOUVRE] })).toEqual([]);
  });

  it('fails when the file cannot be served', async () => {
    await expect(firstValueFrom(prerenderedPlaces(serving([LOUVRE], 500), '/data/places.json')())).rejects.toThrow(
      'The places file answered 500.'
    );
  });

  it('asks for the file only once subscribed', () => {
    const refusing = (): Promise<Response> => {
      throw new Error('The file was asked before anyone subscribed.');
    };

    expect(() => prerenderedPlaces(refusing, '/data/places.json')()).not.toThrow();
  });

  it('asks for the file once, however often the places are loaded', async () => {
    const asked: string[] = [];
    const load = prerenderedPlaces((url) => {
      asked.push(url);
      return serving([LOUVRE])(url);
    }, '/data/places.json');

    await lastValueFrom(load());
    await lastValueFrom(load());

    expect(asked).toEqual(['/data/places.json']);
  });

  it('asks for the file again after it could not be served', async () => {
    const statuses = [500, 200];
    const load = prerenderedPlaces((url) => serving([LOUVRE], statuses.shift())(url), '/data/places.json');

    await lastValueFrom(load()).catch(() => []);

    expect(await lastValueFrom(load())).toEqual([LOUVRE]);
  });
});
