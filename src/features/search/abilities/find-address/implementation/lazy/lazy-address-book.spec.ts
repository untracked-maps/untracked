import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { KnownAddress } from '../../domain/known-address';
import { lazyAddressBook } from './lazy-address-book';

const HERE = { longitude: 2.35, latitude: 48.85 };

const STREET: KnownAddress = { kind: 'street', street: 'Rue de Rivoli', postcode: '75001', city: 'Paris', coordinates: HERE };

describe('address book loaded on demand', () => {
  it('adds the addresses to the places found', async () => {
    const withAddresses = await firstValueFrom(lazyAddressBook([STREET]));

    expect(withAddresses(() => [])('rue de rivoli', HERE).map(({ name }) => name)).toEqual(['Rue de Rivoli']);
  });
});
