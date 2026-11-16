import { describe, expect, it } from 'vitest';
import { fakeAddresses } from './fake-addresses';
import { fakeParis } from './fake-paris';

const ADDRESSES = fakeAddresses();

describe('fake addresses', () => {
  it('start with the address of the first place, in parts', () => {
    expect(ADDRESSES[0]).toEqual({
      kind: 'address',
      address: '5 avenue Anatole France, 75007 Paris',
      number: '5',
      street: 'avenue Anatole France',
      postcode: '75007',
      city: 'Paris',
      coordinates: { longitude: 2.294_48, latitude: 48.858_26 }
    });
  });

  it('name a street when the address of a place has no number', () => {
    expect(ADDRESSES[1]).toEqual({
      kind: 'street',
      address: 'Rue de Rivoli, 75001 Paris',
      street: 'Rue de Rivoli',
      postcode: '75001',
      city: 'Paris',
      coordinates: { longitude: 2.337_64, latitude: 48.860_61 }
    });
  });

  it('hold the address of every place', () => {
    expect(ADDRESSES.filter(({ kind }) => kind !== 'district')).toHaveLength(fakeParis().length);
  });

  it('end with the twenty arrondissements', () => {
    expect(ADDRESSES.filter(({ kind }) => kind === 'district')).toHaveLength(20);
  });

  it('give an arrondissement its name, postcode and centre', () => {
    expect(ADDRESSES.at(-9)).toEqual({
      kind: 'district',
      name: 'Paris 12e Arrondissement',
      postcode: '75012',
      city: 'Paris',
      coordinates: { longitude: 2.421_33, latitude: 48.834_97 }
    });
  });
});
