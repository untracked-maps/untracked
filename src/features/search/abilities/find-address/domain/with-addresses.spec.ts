import { describe, expect, it } from 'vitest';
import type { FindFound, Found } from '../../../domain/found';
import type { Place } from '../../../domain/place';
import type { KnownAddress } from './known-address';
import { withAddressesOf } from './with-addresses';

const CENTRE = { longitude: 2.3522, latitude: 48.8566 };

const BAR: Place = {
  id: 'bar-vaugirard',
  name: 'Bar Vaugirard',
  kind: 'bar',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: CENTRE,
  fame: 0
};

const VAUGIRARD: KnownAddress = {
  kind: 'street',
  street: 'Rue de Vaugirard',
  postcode: '75006',
  city: 'Paris',
  country: 'FR',
  coordinates: CENTRE
};

const findingTheBar: FindFound = () => [BAR];

const namesFound = (query: string): readonly string[] =>
  withAddressesOf([VAUGIRARD])(findingTheBar)(query, CENTRE).map(({ name }: Found) => name);

describe('search with addresses', () => {
  it('gives the street before the places for a street', () => {
    expect(namesFound('rue de vaugirard')).toEqual(['Rue de Vaugirard', 'Bar Vaugirard']);
  });

  it('gives the places alone for a name', () => {
    expect(namesFound('vaugirard')).toEqual(['Bar Vaugirard']);
  });

  it('gives the clean addresses alone for an address', () => {
    expect(namesFound('99 rue de vaugirard')).toEqual(['Rue de Vaugirard']);
  });
});
