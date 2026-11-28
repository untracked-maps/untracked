import { describe, expect, it } from 'vitest';
import type { AddressLine } from '#libraries/postal-address/address-line.presenter';
import type { SheetPlace } from '../../domain/open-place';
import { addressOf } from './place-address.presenter';

const ON_ONE_LINE: AddressLine = ({ street, postalCode, addressLocality }) =>
  [street, `${postalCode} ${addressLocality}`].join(', ');

const FLORE: SheetPlace = {
  id: 'cafe-de-flore',
  name: 'Café de Flore',
  coordinates: { longitude: 2.3326, latitude: 48.8541 },
  address: { street: 'Boulevard Saint-Germain', postalCode: '75006', addressLocality: 'Paris', addressCountry: 'FR' }
};

describe('address of a place', () => {
  it('is the address of the place written on one line', () => {
    expect(addressOf(ON_ONE_LINE, FLORE)).toBe('Boulevard Saint-Germain, 75006 Paris');
  });

  it('is missing for a place without an address', () => {
    expect(
      addressOf(ON_ONE_LINE, { id: 'kiosque', name: 'Kiosque', coordinates: { longitude: 2.33, latitude: 48.85 } })
    ).toBeUndefined();
  });

  it('is missing while no place is open', () => {
    expect(addressOf(ON_ONE_LINE, undefined)).toBeUndefined();
  });

  it('is missing while the addresses cannot be written yet', () => {
    expect(addressOf(undefined, FLORE)).toBeUndefined();
  });
});
