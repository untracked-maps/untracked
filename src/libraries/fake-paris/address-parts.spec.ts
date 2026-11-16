import { describe, expect, it } from 'vitest';
import { addressPartsOf } from './address-parts';

describe('parts of a one-line address', () => {
  it('are its number, street, postcode and city', () => {
    expect(addressPartsOf('12 Rue de Rivoli, 75001 Paris')).toEqual([
      { number: '12', street: 'Rue de Rivoli', postcode: '75001', city: 'Paris' }
    ]);
  });

  it('have no number when the address names a street only', () => {
    expect(addressPartsOf('Rue de Rivoli, 75001 Paris')).toEqual([
      { street: 'Rue de Rivoli', postcode: '75001', city: 'Paris' }
    ]);
  });

  it('keep "bis" with the number', () => {
    expect(addressPartsOf('18 bis rue de Châteaudun, 75009 Paris')[0]?.number).toBe('18 bis');
  });

  it('keep "ter" with the number', () => {
    expect(addressPartsOf('3 ter rue Ordener, 75018 Paris')[0]?.number).toBe('3 ter');
  });

  it('keep digits that do not start the address in the street', () => {
    expect(addressPartsOf('Place du 11 Novembre 1918, 75010 Paris')[0]?.street).toBe('Place du 11 Novembre 1918');
  });

  it('are none without a postcode', () => {
    expect(addressPartsOf('12 Rue de Rivoli, Paris')).toEqual([]);
  });

  it('are none with a postcode of six digits', () => {
    expect(addressPartsOf('12 Rue de Rivoli, 750011 Paris')).toEqual([]);
  });
});
