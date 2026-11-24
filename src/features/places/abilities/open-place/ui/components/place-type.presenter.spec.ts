import { describe, expect, it } from 'vitest';
import { typeOf } from './place-type.presenter';

describe('the type of a place', () => {
  it.each([
    ['restaurant', 'Restaurant'],
    ['cafe', 'Café'],
    ['bar', 'Bar'],
    ['bakery', 'Bakery'],
    ['pharmacy', 'Pharmacy'],
    ['supermarket', 'Supermarket'],
    ['hairdresser', 'Hairdresser'],
    ['beauty-salon', 'Beauty salon'],
    ['florist', 'Florist'],
    ['bookshop', 'Bookshop'],
    ['hotel', 'Hotel'],
    ['school', 'School'],
    ['parking', 'Car park'],
    ['park', 'Park'],
    ['museum', 'Museum'],
    ['cinema', 'Cinema'],
    ['library', 'Library'],
    ['post-office', 'Post office'],
    ['hospital', 'Hospital'],
    ['theatre', 'Theatre'],
    ['attraction', 'Attraction'],
    ['department-store', 'Department store'],
    ['garden', 'Garden'],
    ['monument', 'Monument'],
    ['place-of-worship', 'Place of worship'],
    ['station', 'Station']
  ])('names a place of kind %s "%s"', (kind, type) => {
    expect(typeOf({ kind })).toBe(type);
  });

  it('adds the cuisine of a restaurant', () => {
    expect(typeOf({ kind: 'restaurant', cuisine: 'italian' })).toBe('Restaurant · Italian');
  });

  it.each([
    ['french', 'French'],
    ['italian', 'Italian'],
    ['japanese', 'Japanese'],
    ['chinese', 'Chinese'],
    ['lebanese', 'Lebanese'],
    ['indian', 'Indian'],
    ['vietnamese', 'Vietnamese'],
    ['thai', 'Thai'],
    ['greek', 'Greek'],
    ['mexican', 'Mexican']
  ])('names the cuisine %s "%s"', (cuisine, name) => {
    expect(typeOf({ kind: 'restaurant', cuisine })).toBe(`Restaurant · ${name}`);
  });

  it('leaves out a cuisine it does not know', () => {
    expect(typeOf({ kind: 'restaurant', cuisine: 'regional' })).toBe('Restaurant');
  });

  it('names a place without a kind "Place"', () => {
    expect(typeOf({})).toBe('Place');
  });

  it('names a place of a kind it does not know "Place"', () => {
    expect(typeOf({ kind: 'castle' })).toBe('Place');
  });

  it('knows no kind named after what every object holds', () => {
    expect(typeOf({ kind: 'constructor' })).toBe('Place');
  });

  it('knows no cuisine named after what every object holds', () => {
    expect(typeOf({ kind: 'restaurant', cuisine: 'toString' })).toBe('Restaurant');
  });

  it.each<readonly [string, readonly (readonly [string, string])[]]>([
    [
      'Cathedral',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'cathedral']
      ]
    ],
    [
      'Basilica',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'basilica']
      ]
    ],
    [
      'Chapel',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'chapel']
      ]
    ],
    [
      'Church',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'church']
      ]
    ],
    ['Monument', [['historic', 'monument']]],
    [
      'Palace',
      [
        ['historic', 'castle'],
        ['castle_type', 'palace']
      ]
    ],
    ['Tower', [['man_made', 'tower']]],
    ['Museum', [['tourism', 'museum']]],
    ['Cultural centre', [['amenity', 'arts_centre']]],
    ['Theatre', [['amenity', 'theatre']]],
    ['Library', [['amenity', 'library']]],
    ['Garden', [['leisure', 'garden']]],
    ['Park', [['leisure', 'park']]]
  ])('names "%s" a place whose tags tell its precise type, whatever its kind', (type, pairs) => {
    expect(typeOf({ kind: 'attraction', tags: Object.fromEntries(pairs) })).toBe(type);
  });

  it('names a place after its kind when its tags tell no precise type', () => {
    expect(typeOf({ kind: 'attraction', tags: Object.fromEntries([['toilets', 'yes']]) })).toBe('Attraction');
  });
});
