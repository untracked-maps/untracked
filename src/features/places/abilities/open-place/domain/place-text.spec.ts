import { describe, expect, it } from 'vitest';
import { localNameOf, textOf } from './place-text';

const SHORT = 'a'.repeat(180);

const LONG = 'a'.repeat(181);

describe('the text about a place', () => {
  it('is missing without tags', () => {
    expect(textOf(undefined, 'fr')).toBeUndefined();
  });

  it('is missing when no description is written in the language asked', () => {
    expect(textOf(Object.fromEntries([['description:en', 'A tower.']]), 'fr')).toBeUndefined();
  });

  it('is the description written in the language asked', () => {
    expect(
      textOf(
        Object.fromEntries([
          ['description:en', 'A tower.'],
          ['description:fr', 'Une tour.']
        ]),
        'fr'
      )?.text
    ).toBe('Une tour.');
  });

  it('is short up to 180 characters', () => {
    expect(textOf(Object.fromEntries([['description:fr', SHORT]]), 'fr')?.long).toBe(false);
  });

  it('is long beyond 180 characters', () => {
    expect(textOf(Object.fromEntries([['description:fr', LONG]]), 'fr')?.long).toBe(true);
  });
});

describe('the local name of a place', () => {
  it('is missing without tags', () => {
    expect(localNameOf({ name: 'Opéra Garnier' })).toBeUndefined();
  });

  it('is missing when the tags give no name', () => {
    expect(localNameOf({ name: 'Opéra Garnier', tags: Object.fromEntries([['amenity', 'arts_centre']]) })).toBeUndefined();
  });

  it('is missing when it is the name shown', () => {
    expect(localNameOf({ name: 'Opéra Garnier', tags: Object.fromEntries([['name', 'Opéra Garnier']]) })).toBeUndefined();
  });

  it('is the name of the tags when it differs from the name shown', () => {
    expect(localNameOf({ name: 'Opéra Garnier', tags: Object.fromEntries([['name', 'Palais Garnier']]) })).toBe(
      'Palais Garnier'
    );
  });
});
