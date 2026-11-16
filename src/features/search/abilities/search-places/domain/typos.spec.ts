import { describe, expect, it } from 'vitest';
import { typosBetween } from './typos';

describe('typos between a typed word and a word of a name', () => {
  it('are none for the same word', () => {
    expect(typosBetween('louvre', 'louvre')).toBe(0);
  });

  it('count a wrong letter as one', () => {
    expect(typosBetween('lauvre', 'louvre')).toBe(1);
  });

  it('count a missing letter as one', () => {
    expect(typosBetween('lovre', 'louvre')).toBe(1);
  });

  it('count an extra letter as one', () => {
    expect(typosBetween('louxvre', 'louvre')).toBe(1);
  });

  it('count two letters swapped as one', () => {
    expect(typosBetween('tuor', 'tour')).toBe(1);
  });

  it('count two letters swapped at the end as one', () => {
    expect(typosBetween('louver', 'louvre')).toBe(1);
  });

  it('add up', () => {
    expect(typosBetween('lovuer', 'louvre')).toBe(2);
  });
});

describe('typos at the edges', () => {
  it('count every letter typed against nothing', () => {
    expect(typosBetween('louvre', '')).toBe(6);
  });

  it('count a word typed in full against nothing', () => {
    expect(typosBetween('bar', '')).toBe(3);
  });

  it('count no more than four, for words too far apart', () => {
    expect(typosBetween('abcdef', 'uvwxyz')).toBe(4);
  });

  it('count nothing typed against a word', () => {
    expect(typosBetween('', 'bar')).toBe(3);
  });

  it('count the two letters of a short word swapped as one', () => {
    expect(typosBetween('on', 'no')).toBe(1);
  });

  it('do not count a swap of letters that are not next to each other', () => {
    expect(typosBetween('acb', 'bca')).toBe(2);
  });
});
