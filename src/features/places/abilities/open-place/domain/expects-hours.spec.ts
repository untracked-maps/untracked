import { describe, expect, it } from 'vitest';
import { expectsHours } from './expects-hours';

describe('a place expected to have opening hours', () => {
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
    'museum',
    'cinema',
    'library',
    'post-office',
    'theatre',
    'department-store'
  ])('is a place of kind %s', (kind) => {
    expect(expectsHours(kind)).toBe(true);
  });

  it.each([
    'school',
    'parking',
    'park',
    'hospital',
    'attraction',
    'garden',
    'monument',
    'place-of-worship',
    'station',
    'unknown'
  ])('is not a place of kind %s', (kind) => {
    expect(expectsHours(kind)).toBe(false);
  });

  it('is not a place without a kind', () => {
    expect(expectsHours(undefined)).toBe(false);
  });
});
