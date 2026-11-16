import { describe, expect, it } from 'vitest';
import { indexedWordsOf, normalised, queryWordsOf, significantWordCountOf } from './words';

const STOP_WORDS = [
  'a',
  'and',
  'au',
  'aux',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'l',
  'la',
  'le',
  'les',
  'of',
  'paris',
  'sure',
  'the'
];

describe('normalised text', () => {
  it('drops accents', () => {
    expect(normalised('Élysée')).toBe('elysee');
  });

  it('spells out the oe ligature', () => {
    expect(normalised('Sacré-Cœur')).toBe('sacre coeur');
  });

  it('spells out the ae ligature', () => {
    expect(normalised('Lætitia')).toBe('laetitia');
  });

  it('spells out an upper-case ligature', () => {
    expect(normalised('ŒUVRE')).toBe('oeuvre');
  });

  it('turns every run of punctuation into a single space', () => {
    expect(normalised("Musée d'Orsay -- Paris")).toBe('musee d orsay paris');
  });

  it('keeps digits', () => {
    expect(normalised('Place du 11 Novembre 1918')).toBe('place du 11 novembre 1918');
  });

  it('trims the ends', () => {
    expect(normalised('  « Louvre »  ')).toBe('louvre');
  });
});

describe('words of a query', () => {
  it('are the significant words typed', () => {
    expect(queryWordsOf('Musée du Louvre')).toEqual(['musee', 'louvre']);
  });

  it.each(STOP_WORDS)('leave out the stop word "%s"', (stop) => {
    expect(queryWordsOf(`orsay ${stop}`)).toEqual(['orsay']);
  });

  it('keep every word when all of them are stop words', () => {
    expect(queryWordsOf('Le Paris')).toEqual(['le', 'paris']);
  });

  it('are none for a blank query', () => {
    expect(queryWordsOf('  ')).toEqual([]);
  });
});

describe('significant word count of a name', () => {
  it('counts the words that are not stop words', () => {
    expect(significantWordCountOf('Gare de Lyon')).toBe(2);
  });

  it('is at least one', () => {
    expect(significantWordCountOf('Les Halles de Paris')).toBe(1);
  });

  it('is one for a name made of stop words only', () => {
    expect(significantWordCountOf('Le')).toBe(1);
  });
});

describe('indexed words of a name', () => {
  it('are the words of the name', () => {
    expect(indexedWordsOf('Gare de Lyon')).toEqual(['gare', 'de', 'lyon']);
  });

  it('add the word an elided letter is glued to', () => {
    expect(indexedWordsOf("Musée d'Orsay")).toEqual(['musee', 'd', 'orsay', 'dorsay']);
  });

  it('do not glue a longer word to the next one', () => {
    expect(indexedWordsOf('Le Grand Palais')).toEqual(['le', 'grand', 'palais']);
  });

  it('do not glue a last letter to anything', () => {
    expect(indexedWordsOf('Vitamine C')).toEqual(['vitamine', 'c']);
  });

  it('list each word once', () => {
    expect(indexedWordsOf('Bar Bar')).toEqual(['bar']);
  });
});
