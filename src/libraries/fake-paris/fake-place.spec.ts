import { describe, expect, it } from 'vitest';
import { isFakePlaceKind } from './fake-place';

describe('kinds of fake places', () => {
  it.each([
    'restaurant',
    'cafe',
    'bar',
    'bakery',
    'pharmacy',
    'supermarket',
    'hairdresser',
    'beauty-salon',
    'florist',
    'bookshop',
    'hotel',
    'school',
    'parking',
    'park',
    'museum',
    'cinema',
    'library',
    'post-office',
    'hospital',
    'theatre',
    'attraction',
    'department-store',
    'garden',
    'monument',
    'place-of-worship',
    'station'
  ])('include %s', (kind) => {
    expect(isFakePlaceKind(kind)).toBe(true);
  });

  it('reject an unknown kind', () => {
    expect(isFakePlaceKind('castle')).toBe(false);
  });
});
