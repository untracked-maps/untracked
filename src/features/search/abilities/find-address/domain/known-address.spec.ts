import { describe, expect, it } from 'vitest';
import { entryOf, type KnownAddress } from './known-address';

const HERE = { longitude: 2.35, latitude: 48.85 };

const HOUSE: KnownAddress = {
  kind: 'address',
  number: '18 bis',
  street: 'rue de Châteaudun',
  postcode: '75009',
  city: 'Paris',
  country: 'FR',
  coordinates: HERE
};

const STREET: KnownAddress = {
  kind: 'street',
  street: 'rue de Châteaudun',
  postcode: '75009',
  city: 'Paris',
  country: 'FR',
  coordinates: HERE
};

const DISTRICT: KnownAddress = {
  kind: 'district',
  name: 'Paris 9e Arrondissement',
  postcode: '75009',
  city: 'Paris',
  country: 'FR',
  coordinates: HERE
};

describe('entry of a house address', () => {
  it('is found as the number and the street, in its postcode and city', () => {
    expect(entryOf(HOUSE).found).toEqual({
      id: 'address-75009-18-bis-rue-de-chateaudun',
      name: '18 bis rue de Châteaudun',
      kind: 'address',
      address: {
        houseNumber: '18 bis',
        street: 'Rue de Châteaudun',
        postalCode: '75009',
        addressLocality: 'Paris',
        addressCountry: 'FR'
      },
      coordinates: HERE
    });
  });

  it('keeps its number without spaces, for comparison', () => {
    expect(entryOf(HOUSE).number).toBe('18bis');
  });

  it('keeps its postcode', () => {
    expect(entryOf(HOUSE).postcode).toBe('75009');
  });

  it('is matched by the words of its street', () => {
    expect(entryOf(HOUSE).terms).toEqual(['rue', 'de', 'chateaudun']);
  });

  it('counts the significant words of its street', () => {
    expect(entryOf(HOUSE).wordCount).toBe(2);
  });
});

describe('entry of a street', () => {
  it('is found by its name, written with a capital', () => {
    expect(entryOf(STREET).found.name).toBe('Rue de Châteaudun');
  });

  it('has an id of its own', () => {
    expect(entryOf(STREET).found.id).toBe('street-75009-rue-de-chateaudun');
  });

  it('has no number', () => {
    expect(entryOf(STREET).number).toBeUndefined();
  });

  it('holds its street in its address, written with a capital', () => {
    expect(entryOf(STREET).found.address).toEqual({
      street: 'Rue de Châteaudun',
      postalCode: '75009',
      addressLocality: 'Paris',
      addressCountry: 'FR'
    });
  });
});

describe('entry of an arrondissement', () => {
  it('holds only its postcode, city and country in its address', () => {
    expect(entryOf(DISTRICT).found.address).toEqual({ postalCode: '75009', addressLocality: 'Paris', addressCountry: 'FR' });
  });

  it('is found by its name', () => {
    expect(entryOf(DISTRICT).found.name).toBe('Paris 9e Arrondissement');
  });

  it('is matched by the words of its name', () => {
    expect(entryOf(DISTRICT).terms).toEqual(['paris', '9e', 'arrondissement']);
  });
});
