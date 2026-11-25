import { describe, expect, it } from 'vitest';
import { detailsOf } from './kind-labels';

const RENNES = {
  houseNumber: '57',
  street: 'Rue de Rennes',
  postalCode: '75006',
  addressLocality: 'Paris',
  addressCountry: 'FR'
};

const lineOf = ({ houseNumber, street, postalCode, addressLocality }: typeof RENNES | Partial<typeof RENNES>): string =>
  [[houseNumber, street].filter(Boolean).join(' '), `${postalCode} ${addressLocality}`].filter(Boolean).join(', ');

describe('the details of a result', () => {
  it('give the kind and the whole address of a place', () => {
    expect(detailsOf(lineOf)({ kind: 'bakery', address: RENNES })).toBe('Bakery · 57 Rue de Rennes, 75006 Paris');
  });

  it('give only the postcode and city of an address, its number and street being its name', () => {
    expect(detailsOf(lineOf)({ kind: 'address', address: RENNES })).toBe('Address · 75006 Paris');
  });

  it('give only the postcode and city of a street', () => {
    expect(detailsOf(lineOf)({ kind: 'street', address: RENNES })).toBe('Street · 75006 Paris');
  });

  it('give the kind alone while the line of addresses is being loaded', () => {
    expect(detailsOf(undefined)({ kind: 'address', address: RENNES })).toBe('Address');
  });
});
