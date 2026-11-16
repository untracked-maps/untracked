import { describe, expect, it } from 'vitest';
import { textMatchOf } from './text-match';

describe('score of a text match', () => {
  it('is full when every word of the text is matched exactly', () => {
    expect(textMatchOf([1, 1], 2).score).toBe(1);
  });

  it('averages the quality of the words typed', () => {
    expect(textMatchOf([1, 0.5], 2).score).toBeCloseTo(0.75);
  });

  it('weighs the quality by the share of the text it covers', () => {
    expect(textMatchOf([1], 2).score).toBeCloseTo(0.8);
  });

  it('counts a text covered more than once as fully covered', () => {
    expect(textMatchOf([1, 1], 1).score).toBe(1);
  });
});

describe('strength of a text match', () => {
  it('holds for good words covering half of the text', () => {
    expect(textMatchOf([0.7], 2).strong).toBe(true);
  });

  it('fails for poor words', () => {
    expect(textMatchOf([0.69], 1).strong).toBe(false);
  });

  it('fails for words covering less than half of the text', () => {
    expect(textMatchOf([1], 3).strong).toBe(false);
  });
});
