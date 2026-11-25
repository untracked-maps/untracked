import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type KnownAddress, prerenderedAddresses } from './prerendered-addresses';

const RIVOLI_IN_FILE = {
  kind: 'street',
  street: 'Rue de Rivoli',
  postalCode: '75001',
  addressLocality: 'Paris',
  addressCountry: 'FR',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
};

const RIVOLI: KnownAddress = {
  address: { street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
};

const MOUFFETARD_IN_FILE = {
  kind: 'address',
  houseNumber: '40',
  street: 'Rue Mouffetard',
  postalCode: '75005',
  addressLocality: 'Paris',
  addressCountry: 'FR',
  coordinates: { longitude: 2.35, latitude: 48.842 }
};

const MOUFFETARD: KnownAddress = {
  address: { houseNumber: '40', street: 'Rue Mouffetard', postalCode: '75005', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.35, latitude: 48.842 }
};

const ELEVENTH_IN_FILE = {
  kind: 'district',
  name: 'Paris 11e Arrondissement',
  postalCode: '75011',
  addressLocality: 'Paris',
  addressCountry: 'FR',
  coordinates: { longitude: 2.38, latitude: 48.859 }
};

const serving =
  (body: unknown, status = 200) =>
  (url: string): Promise<Response> =>
    Promise.resolve(url === '/data/addresses.json' ? Response.json(body, { status }) : new Response('', { status: 404 }));

const addressesServed = (body: unknown): Promise<readonly KnownAddress[]> =>
  firstValueFrom(prerenderedAddresses(serving(body), '/data/addresses.json')());

const INVALID_ADDRESSES: readonly (readonly [string, unknown])[] = [
  ['a value that is not an object', 'Rue de Rivoli'],
  ['no street', ELEVENTH_IN_FILE],
  ['a street that is not text', { ...RIVOLI_IN_FILE, street: 1 }],
  ['a house number that is not text', { ...RIVOLI_IN_FILE, houseNumber: 40 }],
  ['no postal code', { ...RIVOLI_IN_FILE, postalCode: undefined }],
  ['no locality', { ...RIVOLI_IN_FILE, addressLocality: undefined }],
  ['no country', { ...RIVOLI_IN_FILE, addressCountry: undefined }],
  ['no coordinates', { ...RIVOLI_IN_FILE, coordinates: undefined }],
  ['coordinates that are not an object', { ...RIVOLI_IN_FILE, coordinates: '2.3, 48.8' }],
  ['no longitude', { ...RIVOLI_IN_FILE, coordinates: { latitude: 48.86 } }],
  ['a longitude that is not a number', { ...RIVOLI_IN_FILE, coordinates: { longitude: '2.3', latitude: 48.86 } }],
  ['no latitude', { ...RIVOLI_IN_FILE, coordinates: { longitude: 2.33 } }],
  ['a latitude that is not a number', { ...RIVOLI_IN_FILE, coordinates: { longitude: 2.33, latitude: '48.8' } }]
];

describe('prerendered addresses', () => {
  it('reads a street in its components', async () => {
    expect(await addressesServed([RIVOLI_IN_FILE])).toEqual([RIVOLI]);
  });

  it('reads an address with its house number', async () => {
    expect(await addressesServed([MOUFFETARD_IN_FILE])).toEqual([MOUFFETARD]);
  });

  it.each(INVALID_ADDRESSES)('leaves out an address with %s', async (_, invalid) => {
    expect(await addressesServed([invalid, RIVOLI_IN_FILE])).toEqual([RIVOLI]);
  });

  it('reads no address from a file that is not a list', async () => {
    expect(await addressesServed({ addresses: [RIVOLI_IN_FILE] })).toEqual([]);
  });

  it('fails when the file cannot be served', async () => {
    await expect(
      firstValueFrom(prerenderedAddresses(serving([RIVOLI_IN_FILE], 500), '/data/addresses.json')())
    ).rejects.toThrow('The addresses file answered 500.');
  });

  it('asks for the file only once subscribed', () => {
    const refusing = (): Promise<Response> => {
      throw new Error('The file was asked before anyone subscribed.');
    };

    expect(() => prerenderedAddresses(refusing, '/data/addresses.json')()).not.toThrow();
  });
});
