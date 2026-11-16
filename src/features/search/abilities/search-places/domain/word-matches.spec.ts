import { describe, expect, it } from 'vitest';
import type { Place } from '../../../domain/place';
import { type FindWord, type Lookup, type WordHit, wordMatches } from './word-matches';

const LOUVRE: Place = {
  id: 'louvre',
  name: 'Louvre',
  kind: 'museum',
  address: '',
  coordinates: { longitude: 2.35, latitude: 48.85 },
  fame: 0
};

const answering =
  (terms: readonly string[]): FindWord =>
  (): readonly WordHit[] =>
    terms.map((term) => ({ place: LOUVRE, term }));

const qualityOf = (word: string, terms: readonly string[], last = true): number | undefined =>
  wordMatches(answering(terms), word, last).get(LOUVRE.id)?.quality;

const lookedUp = (word: string, last: boolean): string | undefined =>
  [
    ...wordMatches((typed, lookup) => [{ place: { ...LOUVRE, id: JSON.stringify(lookup) }, term: typed }], word, last).keys()
  ][0];

const asked = (lookup: Lookup): string => JSON.stringify(lookup);

describe('lookup in the index for a typed word', () => {
  it('asks for words two edits away per typo allowed, since a swap of two letters is two edits', () => {
    expect(lookedUp('pantheon', true)).toBe(asked({ distance: 4, prefix: true, misspeltBeginning: true }));
  });

  it('asks for the exact word when no typo is allowed', () => {
    expect(lookedUp('you', false)).toBe(asked({ distance: 0, prefix: false, misspeltBeginning: false }));
  });
});

describe('matches of a typed word', () => {
  it('keep the best of the words a place matches', () => {
    expect(qualityOf('louvre', ['louvres', 'louvre', 'louvrex'])).toBe(1);
  });

  it('drop the words beyond the typos allowed', () => {
    expect(qualityOf('lauvri', ['louvre'])).toBeUndefined();
  });
});
