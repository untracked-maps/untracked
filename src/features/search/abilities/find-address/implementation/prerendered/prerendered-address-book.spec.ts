import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { KnownAddress } from '../../domain/known-address';
import { prerenderedAddressBook } from './prerendered-address-book';

const HERE = { longitude: 2.35, latitude: 48.85 };

const HOUSE = {
  kind: 'address',
  address: '12 Rue de Rivoli, 75001 Paris',
  number: '12',
  street: 'Rue de Rivoli',
  postcode: '75001',
  city: 'Paris',
  coordinates: HERE
};

const STREET = { kind: 'street', street: 'Rue de Vaugirard', postcode: '75006', city: 'Paris', coordinates: HERE };

const DISTRICT = { kind: 'district', name: 'Paris 11e Arrondissement', postcode: '75011', city: 'Paris', coordinates: HERE };

const bookServed = (body: unknown, status = 200): Promise<readonly KnownAddress[]> =>
  firstValueFrom(prerenderedAddressBook(() => Promise.resolve(Response.json(body, { status })), '/data/addresses.json')());

const kindsServed = async (body: unknown): Promise<readonly string[]> => (await bookServed(body)).map(({ kind }) => kind);

const INVALID_ENTRIES: readonly (readonly [string, unknown])[] = [
  ['a value that is not an object', '12 Rue de Rivoli'],
  ['no value', null],
  ['an unknown kind', { ...STREET, kind: 'lane' }],
  ['no postcode', { ...STREET, postcode: undefined }],
  ['no city', { ...STREET, city: undefined }],
  ['no coordinates', { ...STREET, coordinates: undefined }],
  ['coordinates that are not an object', { ...STREET, coordinates: '2.3, 48.8' }],
  ['no value for coordinates', { ...STREET, coordinates: null }],
  ['no longitude', { ...STREET, coordinates: { latitude: 48.86 } }],
  ['no latitude', { ...STREET, coordinates: { longitude: 2.33 } }],
  ['a street without a name', { ...STREET, street: undefined }],
  ['a house without a number', { ...HOUSE, number: undefined }],
  ['a house without a street', { ...HOUSE, street: undefined }],
  ['an arrondissement without a name', { ...DISTRICT, name: undefined }]
];

describe('prerendered address book', () => {
  it('reads a house address, without its one-line address', async () => {
    expect((await bookServed([HOUSE]))[0]).toEqual({
      kind: 'address',
      number: '12',
      street: 'Rue de Rivoli',
      postcode: '75001',
      city: 'Paris',
      coordinates: HERE
    });
  });

  it('reads a street', async () => {
    expect(await bookServed([STREET])).toEqual([
      { kind: 'street', street: 'Rue de Vaugirard', postcode: '75006', city: 'Paris', coordinates: HERE }
    ]);
  });

  it('reads an arrondissement', async () => {
    expect(await bookServed([DISTRICT])).toEqual([
      { kind: 'district', name: 'Paris 11e Arrondissement', postcode: '75011', city: 'Paris', coordinates: HERE }
    ]);
  });

  it.each(INVALID_ENTRIES)('leaves out an entry with %s', async (_, invalid) => {
    expect(await kindsServed([invalid, DISTRICT])).toEqual(['district']);
  });

  it('reads nothing from a file that is not a list', async () => {
    expect(await bookServed({ addresses: [DISTRICT] })).toEqual([]);
  });

  it('fails when the file cannot be served', async () => {
    await expect(bookServed([], 500)).rejects.toThrow('The addresses file answered 500.');
  });
});

describe('streets of the prerendered address book', () => {
  it('are drawn from the houses', async () => {
    expect((await bookServed([HOUSE]))[1]).toEqual({
      kind: 'street',
      street: 'Rue de Rivoli',
      postcode: '75001',
      city: 'Paris',
      coordinates: HERE
    });
  });

  it('stand at the centre of their houses', async () => {
    const east = { ...HOUSE, number: '14', coordinates: { longitude: 2.4, latitude: 48.9 } };

    expect((await bookServed([HOUSE, east])).at(-1)?.coordinates).toEqual({ longitude: 2.375, latitude: 48.875 });
  });

  it('are one per name and postcode, whatever the case and accents', async () => {
    expect(await kindsServed([HOUSE, { ...HOUSE, number: '14', street: 'rue de rivoli' }])).toEqual([
      'address',
      'address',
      'street'
    ]);
  });

  it('are apart in two postcodes', async () => {
    expect(await kindsServed([HOUSE, { ...HOUSE, postcode: '75004' }])).toEqual(['address', 'address', 'street', 'street']);
  });

  it('come after the streets the file names', async () => {
    expect(await kindsServed([HOUSE, STREET])).toEqual(['address', 'street', 'street']);
  });
});
