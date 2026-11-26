import { describe, expect, it } from 'vitest';
import { expectsHours } from './expects-hours';

describe('a place expected to have opening hours', () => {
  it.each(
    [
      'restaurant cafe bar bakery pharmacy supermarket hairdresser beauty-salon florist bookshop hotel',
      'museum cinema library post-office theatre department-store fast-food ice-cream chocolate deli',
      'greengrocer cheese butcher wine clothes newsagent diy mobile-phone toys stationery music optician',
      'pet-shop laundry bicycle marketplace bank townhall doctor fitness-centre swimming-pool'
    ]
      .join(' ')
      .split(' ')
  )('is a place of kind %s', (kind) => {
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
    'nightclub',
    'atm',
    'police',
    'coworking',
    'veterinary',
    'escape-game',
    'playground',
    'cemetery',
    'fuel',
    'charging-station',
    'toilets',
    'drinking-water',
    'unknown'
  ])('is not a place of kind %s', (kind) => {
    expect(expectsHours(kind)).toBe(false);
  });

  it('is not a place without a kind', () => {
    expect(expectsHours(undefined)).toBe(false);
  });
});
