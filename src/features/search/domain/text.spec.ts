import { describe, expect, it } from 'vitest';
import { normalised, wordsIn } from './text';

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

describe('words in a normalised text', () => {
  it('are the words between spaces', () => {
    expect(wordsIn('gare de lyon')).toEqual(['gare', 'de', 'lyon']);
  });

  it('are none in an empty text', () => {
    expect(wordsIn('')).toEqual([]);
  });
});
