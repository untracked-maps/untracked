import { describe, expect, it } from 'vitest';
import type { Place } from '../../../../domain/place';
import { statusOf } from './kind-search-status';

const BAKERY: Place = {
  id: 'bakery',
  name: 'Boulangerie Garcia',
  kind: 'bakery',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.35, latitude: 48.85 },
  fame: 0
};

describe('status of a search by type', () => {
  it('is silent while closed', () => {
    expect(statusOf({ status: 'closed' })).toBe('');
  });

  it('tells the visitor it is searching', () => {
    expect(statusOf({ status: 'searching', category: 'bakeries' })).toBe('Searching…');
  });

  it('counts the places found', () => {
    expect(statusOf({ status: 'found', category: 'bakeries', places: [BAKERY, { ...BAKERY, id: 'other' }] })).toBe(
      '2 places near the centre of the map, the nearest first.'
    );
  });

  it('tells the visitor a single place is found', () => {
    expect(statusOf({ status: 'found', category: 'bakeries', places: [BAKERY] })).toBe('1 place near the centre of the map.');
  });

  it('tells the visitor no such place is near', () => {
    expect(statusOf({ status: 'none-near', category: 'bakeries' })).toBe(
      'No such place near the centre of the map. Move the map and try again.'
    );
  });

  it('tells the visitor the list is unavailable', () => {
    expect(statusOf({ status: 'unavailable', category: 'bakeries' })).toBe(
      'This list is not available right now. Try again later.'
    );
  });
});
