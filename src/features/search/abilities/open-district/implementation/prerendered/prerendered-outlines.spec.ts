import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { KnownOutline } from '../../domain/open-district';
import { prerenderedOutlines } from './prerendered-outlines';

const RING = [
  [2.35, 48.85],
  [2.37, 48.85],
  [2.36, 48.87],
  [2.35, 48.85]
];

const MARAIS_FEATURE = {
  type: 'Feature',
  properties: { name: 'Le Marais', postalCode: '75004', addressLocality: 'Paris' },
  geometry: { type: 'Polygon', coordinates: [RING] }
};

const MARAIS: KnownOutline = {
  name: 'Le Marais',
  postalCode: '75004',
  outline: [
    { longitude: 2.35, latitude: 48.85 },
    { longitude: 2.37, latitude: 48.85 },
    { longitude: 2.36, latitude: 48.87 },
    { longitude: 2.35, latitude: 48.85 }
  ]
};

const collectionOf = (features: readonly unknown[]): unknown => ({ type: 'FeatureCollection', features });

const serving =
  (body: unknown, status = 200) =>
  (url: string): Promise<Response> =>
    Promise.resolve(url === '/data/districts.json' ? Response.json(body, { status }) : new Response('', { status: 404 }));

const outlinesServed = (body: unknown): Promise<readonly KnownOutline[]> =>
  firstValueFrom(prerenderedOutlines(serving(body), '/data/districts.json')());

const INVALID_FEATURES: readonly (readonly [string, unknown])[] = [
  ['a value that is not an object', 'Le Marais'],
  ['no properties', { ...MARAIS_FEATURE, properties: undefined }],
  ['no name', { ...MARAIS_FEATURE, properties: { postalCode: '75004' } }],
  ['no postcode', { ...MARAIS_FEATURE, properties: { name: 'Le Marais' } }],
  ['no geometry', { ...MARAIS_FEATURE, geometry: undefined }],
  ['a geometry that is not a polygon', { ...MARAIS_FEATURE, geometry: { type: 'Point', coordinates: [2.36, 48.86] } }],
  ['a polygon without a ring', { ...MARAIS_FEATURE, geometry: { type: 'Polygon', coordinates: [] } }],
  ['a ring that is not a list', { ...MARAIS_FEATURE, geometry: { type: 'Polygon', coordinates: ['ring'] } }],
  ['a position that is not a list', { ...MARAIS_FEATURE, geometry: { type: 'Polygon', coordinates: [[...RING, 'here']] } }],
  [
    'a position that is not made of numbers',
    { ...MARAIS_FEATURE, geometry: { type: 'Polygon', coordinates: [[...RING, ['2.3', 48.8]]] } }
  ]
];

describe('prerendered outlines', () => {
  it('read the outer ring of each district of the file', async () => {
    expect(await outlinesServed(collectionOf([MARAIS_FEATURE]))).toEqual([MARAIS]);
  });

  it.each(INVALID_FEATURES)('leave out a district with %s', async (_, invalid) => {
    expect(await outlinesServed(collectionOf([invalid, MARAIS_FEATURE]))).toEqual([MARAIS]);
  });

  it('read no district from a file that is not a feature collection', async () => {
    expect(await outlinesServed([MARAIS_FEATURE])).toEqual([]);
  });

  it('read no district from a collection without features', async () => {
    expect(await outlinesServed({ type: 'FeatureCollection' })).toEqual([]);
  });

  it('fail when the file cannot be served', async () => {
    await expect(firstValueFrom(prerenderedOutlines(serving(collectionOf([]), 500), '/data/districts.json')())).rejects.toThrow(
      'The districts file answered 500.'
    );
  });

  it('ask for the file only once subscribed', () => {
    const refusing = (): Promise<Response> => {
      throw new Error('The file was asked before anyone subscribed.');
    };

    expect(() => prerenderedOutlines(refusing, '/data/districts.json')()).not.toThrow();
  });
});
