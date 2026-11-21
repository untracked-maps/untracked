import { describe, expect, it } from 'vitest';
import { fakeAddresses } from './fake-addresses';
import { fakePlaces } from './fake-places';
import type { FakeZone } from './fake-zone';
import { PARIS } from './zones/paris/paris';

const ADDRESSES = fakeAddresses(PARIS);

const SAINT_MALO: FakeZone = {
  ...PARIS,
  city: 'Saint-Malo',
  districts: [{ name: 'Intra-Muros', postcode: '35400', coordinates: { longitude: -2.025, latitude: 48.649 } }]
};

describe('fake addresses', () => {
  it('start with the address of the first place, in components', () => {
    expect(ADDRESSES[0]).toEqual({
      kind: 'address',
      address: '5 avenue Anatole France, 75007 Paris',
      houseNumber: '5',
      street: 'avenue Anatole France',
      postalCode: '75007',
      addressLocality: 'Paris',
      addressCountry: 'FR',
      coordinates: { longitude: 2.294_48, latitude: 48.858_26 }
    });
  });

  it('name a street when the address of a place has no number', () => {
    expect(ADDRESSES[1]).toEqual({
      kind: 'street',
      address: 'Rue de Rivoli, 75001 Paris',
      street: 'Rue de Rivoli',
      postalCode: '75001',
      addressLocality: 'Paris',
      addressCountry: 'FR',
      coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
    });
  });

  it('hold the address of every place', () => {
    expect(ADDRESSES.filter(({ kind }) => kind !== 'district')).toHaveLength(fakePlaces(PARIS).length);
  });

  it('end with the districts of their zone', () => {
    expect(ADDRESSES.filter(({ kind }) => kind === 'district')).toHaveLength(PARIS.districts.length);
  });

  it('place a district in the city of its zone', () => {
    expect(fakeAddresses(SAINT_MALO).at(-1)).toEqual({
      kind: 'district',
      name: 'Intra-Muros',
      postalCode: '35400',
      addressLocality: 'Saint-Malo',
      addressCountry: 'FR',
      coordinates: { longitude: -2.025, latitude: 48.649 }
    });
  });
});
