import { describe, expect, it } from 'vitest';
import type { Place } from '../../domain/place';
import type { Lookup } from '../../domain/word-matches';
import { wordFinderOf } from './word-finder';

const PANTHEON: Place = {
  id: 'pantheon',
  name: 'Panthéon',
  kind: 'monument',
  address: '',
  coordinates: { longitude: 2.346, latitude: 48.846 },
  fame: 85
};

const EXACTLY: Lookup = { distance: 0, prefix: false, misspeltBeginning: false };

const termsFound = (word: string, lookup: Lookup): readonly string[] =>
  wordFinderOf([PANTHEON])(word, lookup).map(({ term }) => term);

describe('word finder over MiniSearch', () => {
  it('finds the word typed', () => {
    expect(termsFound('pantheon', EXACTLY)).toEqual(['pantheon']);
  });

  it('finds the words as many edits away as asked', () => {
    expect(termsFound('pamtheom', { ...EXACTLY, distance: 2 })).toEqual(['pantheon']);
  });

  it('finds no word further away than asked', () => {
    expect(termsFound('pamtheom', { ...EXACTLY, distance: 1 })).toEqual([]);
  });

  it('finds the words the one typed starts, when asked', () => {
    expect(termsFound('pant', { ...EXACTLY, prefix: true })).toEqual(['pantheon']);
  });

  it('finds the words whose beginning is near the one typed, when asked', () => {
    expect(termsFound('pamth', { ...EXACTLY, distance: 1, misspeltBeginning: true })).toEqual(['pantheon']);
  });

  it('finds no word by a beginning shorter than four letters', () => {
    expect(termsFound('pan', { ...EXACTLY, misspeltBeginning: true })).toEqual([]);
  });

  it('finds a word typed in full once, not again by its beginning', () => {
    expect(termsFound('pantheon', { ...EXACTLY, misspeltBeginning: true })).toEqual(['pantheon']);
  });

  it('finds a word by its longest beginning', () => {
    expect(termsFound('pantheo', { ...EXACTLY, misspeltBeginning: true })).toEqual(['pantheon']);
  });
});
