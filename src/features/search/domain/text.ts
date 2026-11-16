const COMBINING_MARKS = /\p{M}/gu;

const SEPARATORS = /[^a-z0-9]+/gu;

const folded = (text: string): string =>
  text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replaceAll('æ', 'ae').replaceAll('œ', 'oe');

const normalised = (text: string): string => folded(text).replace(SEPARATORS, ' ').trim();

const wordsIn = (normalisedText: string): readonly string[] => normalisedText.split(' ').filter((word) => word.length > 0);

export { normalised, wordsIn };
