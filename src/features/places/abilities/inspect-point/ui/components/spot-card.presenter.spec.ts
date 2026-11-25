import { describe, expect, it } from 'vitest';
import type { Coordinates, PostalAddress } from '../../domain/inspect-point';
import { spotCardOf } from './spot-card.presenter';

const LOUVRE: Coordinates = { longitude: 2.337_641, latitude: 48.860_609 };

const RIVOLI: PostalAddress = {
  houseNumber: '1',
  street: 'Rue de Rivoli',
  postalCode: '75001',
  addressLocality: 'Paris',
  addressCountry: 'FR'
};

const lineAs = (line: string) => (): string => line;

describe('spot card presenter', () => {
  it('titles the card with the street of the address', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, lineAs('1 Rue de Rivoli, 75001 Paris')).title).toBe(
      '1 Rue de Rivoli'
    );
  });

  it('gives the rest of the address under the street', () => {
    expect(
      spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, lineAs('1 Rue de Rivoli, 75001 Paris, France')).subtitle
    ).toBe('75001 Paris, France');
  });

  it('writes the address with the line of its country', () => {
    expect(
      spotCardOf(
        { kind: 'address', spot: LOUVRE, address: RIVOLI },
        ({ street = '', postalCode }) => `${street}, ${postalCode}`
      ).title
    ).toBe('Rue de Rivoli');
  });

  it('gives the whole address to copy', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, lineAs('1 Rue de Rivoli, 75001 Paris')).address).toBe(
      '1 Rue de Rivoli, 75001 Paris'
    );
  });

  it('titles the card with an address of a single line', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, lineAs('Cour Carrée')).title).toBe('Cour Carrée');
  });

  it('gives the coordinates under an address of a single line', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, lineAs('Cour Carrée')).subtitle).toBe(
      '48.86061, 2.33764'
    );
  });
});

describe('spot card presenter, while the line of the address is being loaded', () => {
  it('titles the card of a spot', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, undefined).title).toBe('Selected spot');
  });

  it('says the address is on its way under the title', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, undefined).subtitle).toBe('Address');
  });

  it('gives no address to copy yet', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, undefined).address).toBeUndefined();
  });
});

describe('spot card presenter, without an address', () => {
  it('titles the card of a spot whose address is being looked for', () => {
    expect(spotCardOf({ kind: 'looking', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).title).toBe('Selected spot');
  });

  it('says the address is being looked for under the title', () => {
    expect(spotCardOf({ kind: 'looking', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).subtitle).toBe('Address');
  });

  it('titles the card of a spot without address', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).title).toBe(
      'Selected spot'
    );
  });

  it('says no address was found under the title', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).subtitle).toBe(
      'Address not found'
    );
  });

  it('titles the card of a spot whose address is unavailable', () => {
    expect(spotCardOf({ kind: 'unavailable', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).title).toBe(
      'Selected spot'
    );
  });

  it('says the address is unavailable under the title', () => {
    expect(spotCardOf({ kind: 'unavailable', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).subtitle).toBe(
      'Address unavailable'
    );
  });

  it('gives no address to copy', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).address).toBeUndefined();
  });

  it('reports on OpenStreetMap with a note at the spot', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }, lineAs('1 Rue de Rivoli, 75001 Paris')).reportHref).toBe(
      'https://www.openstreetmap.org/note/new#map=19/48.86061/2.33764'
    );
  });

  it('leaves the street empty when the address starts with its locality', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: RIVOLI }, lineAs(', 75001 Paris')).title).toBe('');
  });
});
