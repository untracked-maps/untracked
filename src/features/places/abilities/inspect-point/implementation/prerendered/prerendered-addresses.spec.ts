import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type KnownAddress, prerenderedAddresses } from './prerendered-addresses';

const RIVOLI: KnownAddress = {
  address: 'Rue de Rivoli, 75001 Paris',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
};

const serving =
  (body: unknown, status = 200) =>
  (url: string): Promise<Response> =>
    Promise.resolve(url === '/data/addresses.json' ? Response.json(body, { status }) : new Response('', { status: 404 }));

const addressesServed = (body: unknown): Promise<readonly KnownAddress[]> =>
  firstValueFrom(prerenderedAddresses(serving(body), '/data/addresses.json')());

const INVALID_ADDRESSES: readonly (readonly [string, unknown])[] = [
  ['a value that is not an object', 'Rue de Rivoli'],
  ['no address', { ...RIVOLI, address: undefined }],
  ['an address that is not text', { ...RIVOLI, address: 1 }],
  ['no coordinates', { ...RIVOLI, coordinates: undefined }],
  ['coordinates that are not an object', { ...RIVOLI, coordinates: '2.3, 48.8' }],
  ['no longitude', { ...RIVOLI, coordinates: { latitude: 48.86 } }],
  ['a longitude that is not a number', { ...RIVOLI, coordinates: { longitude: '2.3', latitude: 48.86 } }],
  ['no latitude', { ...RIVOLI, coordinates: { longitude: 2.33 } }],
  ['a latitude that is not a number', { ...RIVOLI, coordinates: { longitude: 2.33, latitude: '48.8' } }]
];

describe('prerendered addresses', () => {
  it('reads the addresses of the prerendered file', async () => {
    expect(await addressesServed([RIVOLI])).toEqual([RIVOLI]);
  });

  it.each(INVALID_ADDRESSES)('leaves out an address with %s', async (_, invalid) => {
    expect(await addressesServed([invalid, RIVOLI])).toEqual([RIVOLI]);
  });

  it('reads no address from a file that is not a list', async () => {
    expect(await addressesServed({ addresses: [RIVOLI] })).toEqual([]);
  });

  it('fails when the file cannot be served', async () => {
    await expect(firstValueFrom(prerenderedAddresses(serving([RIVOLI], 500), '/data/addresses.json')())).rejects.toThrow(
      'The addresses file answered 500.'
    );
  });

  it('asks for the file only once subscribed', () => {
    const refusing = (): Promise<Response> => {
      throw new Error('The file was asked before anyone subscribed.');
    };

    expect(() => prerenderedAddresses(refusing, '/data/addresses.json')()).not.toThrow();
  });
});
