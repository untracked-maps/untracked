import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { SheetPlace } from '../../domain/open-place';
import { prerenderedPlaces } from './prerendered-places';

const FACEBOOK = 'https://facebook.example';

const LUIGI: SheetPlace = {
  id: 'sakura',
  name: 'Sakura',
  kind: 'restaurant',
  cuisine: 'japanese',
  family: 'food',
  address: {
    houseNumber: '40',
    street: 'Rue Sainte-Anne',
    postalCode: '75002',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  coordinates: { longitude: 2.335, latitude: 48.867 }
};

const VERT_GALANT: SheetPlace = {
  id: 'vert-galant',
  name: 'Square du Vert-Galant',
  coordinates: { longitude: 2.341, latitude: 48.857 }
};

const PROCOPE: SheetPlace = {
  id: 'procope',
  name: 'Le Procope',
  phone: '+33 1 99 00 12 34',
  website: 'https://www.procope.example',
  menu: 'https://www.procope.example/menu',
  instagram: 'https://instagram.example/leprocope',
  facebook: `${FACEBOOK}/procope`,
  coordinates: { longitude: 2.3388, latitude: 48.8531 }
};

const FLORE: SheetPlace = {
  id: 'flore',
  name: 'Café de Flore',
  tags: Object.fromEntries([
    ['outdoor_seating', 'yes'],
    ['payment:contactless', 'yes']
  ]),
  coordinates: { longitude: 2.332_63, latitude: 48.854_04 }
};

const placesServed = (body: unknown, status = 200): Promise<readonly SheetPlace[]> =>
  firstValueFrom(prerenderedPlaces(() => Promise.resolve(Response.json(body, { status })), '/data/places.json')());

const INVALID_PLACES: readonly (readonly [string, unknown])[] = [
  ['a value that is not an object', 'Sakura'],
  ['no value', null],
  ['no id', { ...LUIGI, id: undefined }],
  ['no name', { ...LUIGI, name: 7 }],
  ['no coordinates', { ...LUIGI, coordinates: undefined }],
  ['coordinates that are not an object', { ...LUIGI, coordinates: '2.34, 48.85' }],
  ['no longitude', { ...LUIGI, coordinates: { latitude: 48.85 } }],
  ['no latitude', { ...LUIGI, coordinates: { longitude: 2.34 } }]
];

describe('prerendered places of the sheet', () => {
  it('reads a place with its kind, cuisine, family and address', async () => {
    expect(await placesServed([LUIGI])).toEqual([LUIGI]);
  });

  it('reads a place without kind, cuisine, family nor address', async () => {
    expect(await placesServed([VERT_GALANT])).toEqual([VERT_GALANT]);
  });

  it('reads a place with its phone, website, menu, Instagram and Facebook', async () => {
    expect(await placesServed([PROCOPE])).toEqual([PROCOPE]);
  });

  it('reads a place with its OpenStreetMap tags', async () => {
    expect(await placesServed([FLORE])).toEqual([FLORE]);
  });

  it('keeps only the tags written as text', async () => {
    expect(
      await placesServed([
        {
          ...VERT_GALANT,
          tags: Object.fromEntries([
            ['dog', 'leashed'],
            ['toilets', true],
            ['heritage', 2]
          ])
        }
      ])
    ).toEqual([{ ...VERT_GALANT, tags: Object.fromEntries([['dog', 'leashed']]) }]);
  });

  it('reads an address without house number nor street', async () => {
    const square: SheetPlace = {
      ...VERT_GALANT,
      address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' }
    };

    expect(await placesServed([square])).toEqual([square]);
  });

  it.each(INVALID_PLACES)('leaves out a place with %s', async (_, invalid) => {
    expect(await placesServed([invalid, VERT_GALANT])).toEqual([VERT_GALANT]);
  });

  it.each([
    ['a kind that is not text', { kind: 7 }],
    ['a cuisine that is not text', { cuisine: 7 }],
    ['a family that is not text', { family: 7 }],
    ['a phone that is not text', { phone: 33_199_001_234 }],
    ['a website that is not text', { website: true }],
    ['a menu that is not text', { menu: {} }],
    ['an Instagram account that is not text', { instagram: 7 }],
    ['a Facebook page that is not text', { facebook: 7 }],
    ['tags that are not an object', { tags: 'dog=leashed' }],
    ['no tags', { tags: null }],
    ['an address that is not an object', { address: '40 Rue Sainte-Anne, 75002 Paris' }],
    ['an address without postal code', { address: { ...LUIGI.address, postalCode: undefined } }],
    ['an address without locality', { address: { ...LUIGI.address, addressLocality: 7 } }],
    ['an address without country', { address: { ...LUIGI.address, addressCountry: undefined } }],
    ['a street that is not text', { address: { ...LUIGI.address, street: 7 } }],
    ['a house number that is not text', { address: { ...LUIGI.address, houseNumber: 7 } }]
  ])('leaves out %s', async (_, invalid) => {
    expect(await placesServed([{ ...VERT_GALANT, ...invalid }])).toEqual([VERT_GALANT]);
  });

  it('reads nothing from a file that is not a list', async () => {
    expect(await placesServed({ places: [LUIGI] })).toEqual([]);
  });

  it('fails when the file cannot be served', async () => {
    await expect(placesServed([], 500)).rejects.toThrow('The places file answered 500.');
  });
});
