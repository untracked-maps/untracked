import { describe, expect, it } from 'vitest';
import { preciseTypeOf } from './precise-type';

type Pairs = readonly (readonly [string, string])[];

const typeOf = (pairs?: Pairs): string | undefined =>
  preciseTypeOf(pairs === undefined ? undefined : Object.fromEntries(pairs));

describe('the precise type of a place', () => {
  it('is unknown without tags', () => {
    expect(typeOf()).toBeUndefined();
  });

  it.each<readonly [string, Pairs]>([
    [
      'cathedral',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'cathedral']
      ]
    ],
    [
      'basilica',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'basilica']
      ]
    ],
    [
      'chapel',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'chapel']
      ]
    ],
    [
      'church',
      [
        ['amenity', 'place_of_worship'],
        ['building', 'church']
      ]
    ],
    ['monument', [['historic', 'monument']]],
    [
      'palace',
      [
        ['historic', 'castle'],
        ['castle_type', 'palace']
      ]
    ],
    ['tower', [['man_made', 'tower']]],
    ['museum', [['tourism', 'museum']]],
    ['cultural-centre', [['amenity', 'arts_centre']]],
    ['theatre', [['amenity', 'theatre']]],
    ['library', [['amenity', 'library']]],
    ['garden', [['leisure', 'garden']]],
    ['park', [['leisure', 'park']]]
  ])('is %s for a place tagged %j', (type, pairs) => {
    expect(typeOf(pairs)).toBe(type);
  });

  it('is unknown when no tag tells it', () => {
    expect(typeOf([['amenity', 'bench']])).toBeUndefined();
  });

  it('is unknown for a church building where nobody worships', () => {
    expect(typeOf([['building', 'church']])).toBeUndefined();
  });

  it('is unknown for a castle that is no palace', () => {
    expect(typeOf([['historic', 'castle']])).toBeUndefined();
  });

  it('is monument for a church that became a place to visit', () => {
    expect(
      typeOf([
        ['building', 'church'],
        ['historic', 'monument'],
        ['tourism', 'attraction']
      ])
    ).toBe('monument');
  });

  it('is cathedral for a cathedral that is a monument too', () => {
    expect(
      typeOf([
        ['historic', 'monument'],
        ['building', 'cathedral'],
        ['amenity', 'place_of_worship']
      ])
    ).toBe('cathedral');
  });

  it('is tower for a tower that is an attraction too', () => {
    expect(
      typeOf([
        ['tourism', 'attraction'],
        ['man_made', 'tower']
      ])
    ).toBe('tower');
  });
});
