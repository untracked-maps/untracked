type GlyphRange = {
  readonly start: number;
  readonly end: number;
};

const CODE_POINTS = 65_536;

const RANGE_SIZE = 256;

const rangeAt = (index: number): GlyphRange => ({ start: index * RANGE_SIZE, end: index * RANGE_SIZE + RANGE_SIZE - 1 });

const glyphRanges = (): readonly GlyphRange[] => Array.from({ length: CODE_POINTS / RANGE_SIZE }, (_, index) => rangeAt(index));

const rangeName = ({ start, end }: GlyphRange): string => `${start}-${end}`;

const parseRangeName = (name: string): GlyphRange | undefined => glyphRanges().find((range) => rangeName(range) === name);

export { type GlyphRange, glyphRanges, parseRangeName, rangeName };
