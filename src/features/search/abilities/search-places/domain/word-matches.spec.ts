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

describe('typos allowed in a typed word', () => {
  it('are none in a word of three letters', () => {
    expect(qualityOf('bat', ['bar'])).toBeUndefined();
  });

  it('are one in a word of four letters', () => {
    expect(qualityOf('tout', ['tour'])).toBe(0.72);
  });

  it('are one in a word of seven letters', () => {
    expect(qualityOf('pamtheo', ['pantheon'], false)).toBeUndefined();
  });

  it('are two in a word of eight letters', () => {
    expect(qualityOf('pamtheom', ['pantheon'])).toBe(0.55);
  });
});

describe('beginnings of words', () => {
  it('are looked for with the last word typed', () => {
    expect(qualityOf('to', ['tour'])).toBeCloseTo(0.81);
  });

  it('are not looked for with a single letter', () => {
    expect(qualityOf('t', ['tour'])).toBeUndefined();
  });

  it('are not looked for with a short word typed before the last', () => {
    expect(qualityOf('you', ['tour'], false)).toBeUndefined();
  });

  it('are looked for with a word of four letters typed before the last', () => {
    expect(qualityOf('tour', ['tours'], false)).toBeCloseTo(0.83);
  });
});

describe('lookup in the index for a typed word', () => {
  it('asks for words two edits away per typo allowed, since a swap of two letters is two edits', () => {
    expect(lookedUp('pantheon', true)).toBe(asked({ distance: 4, prefix: true, misspeltBeginning: true }));
  });

  it('asks for the exact word when no typo is allowed', () => {
    expect(lookedUp('you', false)).toBe(asked({ distance: 0, prefix: false, misspeltBeginning: false }));
  });
});

describe('quality of a word match', () => {
  it('is full for the exact word', () => {
    expect(qualityOf('louvre', ['louvre'])).toBe(1);
  });

  it('is high for the beginning of a word', () => {
    expect(qualityOf('louv', ['louvre'])).toBeCloseTo(0.81);
  });

  it('loses a little for each missing letter, down to a floor', () => {
    expect(qualityOf('lo', ['lorem-ipsum-dolor'])).toBeCloseTo(0.7);
  });

  it('counts the beginning of a word only where beginnings are looked for', () => {
    expect(qualityOf('you', ['tour'], false)).toBeUndefined();
  });

  it('is lower for one typo', () => {
    expect(qualityOf('louvri', ['louvre'])).toBe(0.72);
  });

  it('is lower for two letters swapped, as for one typo', () => {
    expect(qualityOf('louver', ['louvre'])).toBe(0.72);
  });

  it('is lower still for two typos', () => {
    expect(qualityOf('lauvrexx', ['louvrexy'])).toBe(0.55);
  });

  it('is none beyond the typos allowed', () => {
    expect(qualityOf('lauvri', ['louvre'])).toBeUndefined();
  });

  it('is the best of the words a place matches', () => {
    expect(qualityOf('louvre', ['louvres', 'louvre', 'louvrex'])).toBe(1);
  });
});

describe('quality of a misspelt beginning', () => {
  it('is none for a word of three letters', () => {
    expect(qualityOf('pak', ['palais'])).toBeUndefined();
  });

  it('is lower than a typo in a whole word', () => {
    expect(qualityOf('triomf', ['triomphe'])).toBe(0.6);
  });

  it('is none for more than one typo', () => {
    expect(qualityOf('trimf', ['triomphe'])).toBeUndefined();
  });

  it('is none for a word typed before the last', () => {
    expect(qualityOf('triomf', ['triomphe'], false)).toBeUndefined();
  });

  it('is none for a word no longer than the one typed', () => {
    expect(qualityOf('triomfe', ['triomph'])).toBeUndefined();
  });
});

describe('typos on the first letter', () => {
  it('are refused in a short word', () => {
    expect(qualityOf('mouvr', ['louvr'])).toBeUndefined();
  });

  it('are accepted in a word of six letters or more', () => {
    expect(qualityOf('mouvre', ['louvre'])).toBe(0.72);
  });

  it('do not concern a typo after the first letter', () => {
    expect(qualityOf('lauvr', ['louvr'])).toBe(0.72);
  });
});
