type TextMatch = {
  readonly score: number;
  readonly strong: boolean;
};

const SURE_TEXT = 0.6;

const COVERED_TEXT = 0.4;

const STRONG_TEXT = 0.7;

const STRONG_COVER = 0.5;

const textMatchOf = (qualities: readonly number[], wordCount: number): TextMatch => {
  const text = qualities.reduce((sum, quality) => sum + quality, 0) / qualities.length;
  const cover = Math.min(1, qualities.length / wordCount);
  return { score: text * (SURE_TEXT + COVERED_TEXT * cover), strong: text >= STRONG_TEXT && cover >= STRONG_COVER };
};

export { textMatchOf };
