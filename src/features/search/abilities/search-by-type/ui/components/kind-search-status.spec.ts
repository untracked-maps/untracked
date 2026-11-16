import { describe, expect, it } from 'vitest';
import type { Place } from '../../../../domain/place';
import { statusOf } from './kind-search-status';

const BAKERY: Place = {
  id: 'bakery',
  name: 'Boulangerie Garcia',
  kind: 'bakery',
  address: '',
  coordinates: { longitude: 2.35, latitude: 48.85 },
  fame: 0
};

describe('status of a search by type', () => {
  it('is silent while closed', () => {
    expect(statusOf({ status: 'closed' })).toBe('');
  });

  it('tells the visitor it is searching', () => {
    expect(statusOf({ status: 'searching', placeKind: 'bakery' })).toBe('Searching…');
  });

  it('counts the places found', () => {
    expect(statusOf({ status: 'found', placeKind: 'bakery', places: [BAKERY, { ...BAKERY, id: 'other' }] })).toBe(
      '2 places near the centre of the map, the nearest first.'
    );
  });

  it('tells the visitor a single place is found', () => {
    expect(statusOf({ status: 'found', placeKind: 'bakery', places: [BAKERY] })).toBe('1 place near the centre of the map.');
  });

  it('tells the visitor no such place is near', () => {
    expect(statusOf({ status: 'none-near', placeKind: 'bakery' })).toBe(
      'No such place near the centre of the map. Move the map and try again.'
    );
  });

  it('tells the visitor the list is unavailable', () => {
    expect(statusOf({ status: 'unavailable', placeKind: 'bakery' })).toBe(
      'This list is not available right now. Try again later.'
    );
  });
});
