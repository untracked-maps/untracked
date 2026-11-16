import { describe, expect, it } from 'vitest';
import type { Coordinates } from '../../domain/inspect-point';
import { spotCardOf } from './spot-card.presenter';

const LOUVRE: Coordinates = { longitude: 2.337_641, latitude: 48.860_609 };

describe('spot card presenter', () => {
  it('titles the card with the street of the address', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: '1 Rue de Rivoli, 75001 Paris' }).title).toBe(
      '1 Rue de Rivoli'
    );
  });

  it('gives the rest of the address under the street', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: '1 Rue de Rivoli, 75001 Paris, France' }).subtitle).toBe(
      '75001 Paris, France'
    );
  });

  it('titles the card with an address of a single line', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: 'Cour Carrée' }).title).toBe('Cour Carrée');
  });

  it('gives the coordinates under an address of a single line', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: 'Cour Carrée' }).subtitle).toBe('48.86061, 2.33764');
  });

  it('says the address is being looked for', () => {
    expect(spotCardOf({ kind: 'looking', spot: LOUVRE }).title).toBe('Looking for the address…');
  });

  it('says there is no address at the spot', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }).title).toBe('No address here');
  });

  it('says the address is unavailable', () => {
    expect(spotCardOf({ kind: 'unavailable', spot: LOUVRE }).title).toBe('Address unavailable');
  });

  it('gives the coordinates of a spot without address', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }).subtitle).toBe('48.86061, 2.33764');
  });

  it('reports on OpenStreetMap with a note at the spot', () => {
    expect(spotCardOf({ kind: 'no-address', spot: LOUVRE }).reportHref).toBe(
      'https://www.openstreetmap.org/note/new#map=19/48.86061/2.33764'
    );
  });

  it('leaves the street empty when the address starts with its locality', () => {
    expect(spotCardOf({ kind: 'address', spot: LOUVRE, address: ', 75001 Paris' }).title).toBe('');
  });
});
