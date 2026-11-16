import { describe, expect, it } from 'vitest';
import { qualityOf, toleranceFor } from './word-quality';

const qualityFor = (word: string, term: string, last = true): number | undefined =>
  qualityOf(word, term, toleranceFor(word, last));

describe('typos allowed in a typed word', () => {
  it('are none in a word of three letters', () => {
    expect(qualityFor('bat', 'bar')).toBeUndefined();
  });

  it('are one in a word of four letters', () => {
    expect(qualityFor('tout', 'tour')).toBe(0.72);
  });

  it('are one in a word of seven letters', () => {
    expect(qualityFor('pamtheo', 'pantheon', false)).toBeUndefined();
  });

  it('are two in a word of eight letters', () => {
    expect(qualityFor('pamtheom', 'pantheon')).toBe(0.55);
  });
});

describe('beginnings of words', () => {
  it('are looked for with the last word typed', () => {
    expect(qualityFor('to', 'tour')).toBeCloseTo(0.81);
  });

  it('are not looked for with a single letter', () => {
    expect(qualityFor('t', 'tour')).toBeUndefined();
  });

  it('are not looked for with a short word typed before the last', () => {
    expect(qualityFor('you', 'tour', false)).toBeUndefined();
  });

  it('are looked for with a word of four letters typed before the last', () => {
    expect(qualityFor('tour', 'tours', false)).toBeCloseTo(0.83);
  });
});

describe('quality of a word match', () => {
  it('is full for the exact word', () => {
    expect(qualityFor('louvre', 'louvre')).toBe(1);
  });

  it('is high for the beginning of a word', () => {
    expect(qualityFor('louv', 'louvre')).toBeCloseTo(0.81);
  });

  it('loses a little for each missing letter, down to a floor', () => {
    expect(qualityFor('lo', 'lorem-ipsum-dolor')).toBeCloseTo(0.7);
  });

  it('counts the beginning of a word only where beginnings are looked for', () => {
    expect(qualityFor('you', 'tour', false)).toBeUndefined();
  });

  it('is lower for one typo', () => {
    expect(qualityFor('louvri', 'louvre')).toBe(0.72);
  });

  it('is lower for two letters swapped, as for one typo', () => {
    expect(qualityFor('louver', 'louvre')).toBe(0.72);
  });

  it('is lower still for two typos', () => {
    expect(qualityFor('lauvrexx', 'louvrexy')).toBe(0.55);
  });

  it('is none beyond the typos allowed', () => {
    expect(qualityFor('lauvri', 'louvre')).toBeUndefined();
  });
});

describe('quality of a misspelt beginning', () => {
  it('is none for a word of three letters', () => {
    expect(qualityFor('pak', 'palais')).toBeUndefined();
  });

  it('is lower than a typo in a whole word', () => {
    expect(qualityFor('triomf', 'triomphe')).toBe(0.6);
  });

  it('is none for more than one typo', () => {
    expect(qualityFor('trimf', 'triomphe')).toBeUndefined();
  });

  it('is none for a word typed before the last', () => {
    expect(qualityFor('triomf', 'triomphe', false)).toBeUndefined();
  });

  it('is none for a word no longer than the one typed', () => {
    expect(qualityFor('triomfe', 'triomph')).toBeUndefined();
  });
});

describe('typos on the first letter', () => {
  it('are refused in a short word', () => {
    expect(qualityFor('mouvr', 'louvr')).toBeUndefined();
  });

  it('are accepted in a word of six letters or more', () => {
    expect(qualityFor('mouvre', 'louvre')).toBe(0.72);
  });

  it('do not concern a typo after the first letter', () => {
    expect(qualityFor('lauvr', 'louvr')).toBe(0.72);
  });
});
