import { describe, expect, it } from 'vitest';
import { glyphRanges, parseRangeName, rangeName } from './glyph-ranges';

describe('glyph ranges', () => {
  it('cover the 65,536 code points of the basic multilingual plane in 256 ranges', () => {
    expect(glyphRanges()).toHaveLength(256);
  });

  it('start at the first code point', () => {
    expect(glyphRanges()[0]).toEqual({ start: 0, end: 255 });
  });

  it('end at the last code point', () => {
    expect(glyphRanges().at(-1)).toEqual({ start: 65_280, end: 65_535 });
  });

  it('are named after their first and last code points, as MapLibre requests them', () => {
    expect(rangeName({ start: 256, end: 511 })).toBe('256-511');
  });

  it('reads a range from its name', () => {
    expect(parseRangeName('256-511')).toEqual({ start: 256, end: 511 });
  });

  it('reads no range from a name that is not one of the ranges', () => {
    expect(parseRangeName('300-555')).toBeUndefined();
  });

  it('reads no range from a name that is not a range at all', () => {
    expect(parseRangeName('latin')).toBeUndefined();
  });
});
