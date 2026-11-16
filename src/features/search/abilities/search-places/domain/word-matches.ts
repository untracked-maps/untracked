import type { Place } from '../../../domain/place';
import { typosBetween } from './typos';

type Tolerance = {
  readonly typos: number;
  readonly prefix: boolean;
  readonly misspeltBeginning: boolean;
};

type Lookup = {
  readonly distance: number;
  readonly prefix: boolean;
  readonly misspeltBeginning: boolean;
};

type WordHit = {
  readonly place: Place;
  readonly term: string;
};

type FindWord = (word: string, lookup: Lookup) => readonly WordHit[];

type WordMatch = {
  readonly place: Place;
  readonly quality: number;
};

const SHORTEST_PREFIX = 2;

const LONG_WORD = 4;

const VERY_LONG_WORD = 8;

const TYPO_LENGTHS: readonly number[] = [LONG_WORD, VERY_LONG_WORD];

const SPARES_FIRST_LETTER = 6;

const EDITS_PER_SWAP = 2;

const EXACT = 1;

const PREFIX = 0.85;

const PREFIX_LOSS_PER_LETTER = 0.02;

const PREFIX_MOST_LOSS = 0.15;

const ONE_TYPO = 0.72;

const TWO_TYPOS = 0.55;

const MISSPELT_BEGINNING = 0.6;

const TYPO_QUALITIES: readonly number[] = [EXACT, ONE_TYPO, TWO_TYPOS];

const toleranceFor = (word: string, last: boolean): Tolerance => ({
  typos: TYPO_LENGTHS.filter((length) => word.length >= length).length,
  prefix: word.length >= SHORTEST_PREFIX && (last || word.length >= LONG_WORD),
  misspeltBeginning: last && word.length >= LONG_WORD
});

const lookupFor = ({ typos, prefix, misspeltBeginning }: Tolerance): Lookup => ({
  distance: typos * EDITS_PER_SWAP,
  prefix,
  misspeltBeginning
});

const prefixQuality = (word: string, term: string): number =>
  PREFIX - Math.min(PREFIX_MOST_LOSS, (term.length - word.length) * PREFIX_LOSS_PER_LETTER);

const typoQuality = (word: string, term: string, { typos }: Tolerance): number | undefined => {
  const found = typosBetween(word, term);
  const spared = term.at(0) === word.at(0) || word.length >= SPARES_FIRST_LETTER;
  return found <= typos && spared ? TYPO_QUALITIES[found] : undefined;
};

const misspeltBeginningQuality = (word: string, term: string, { misspeltBeginning }: Tolerance): number | undefined =>
  misspeltBeginning && term.length > word.length && typosBetween(word, term.slice(0, word.length)) <= 1
    ? MISSPELT_BEGINNING
    : undefined;

const qualityOf = (word: string, term: string, tolerance: Tolerance): number | undefined =>
  tolerance.prefix && term.length > word.length && term.startsWith(word)
    ? prefixQuality(word, term)
    : (typoQuality(word, term, tolerance) ?? misspeltBeginningQuality(word, term, tolerance));

const byQuality = (left: WordMatch, right: WordMatch): number => left.quality - right.quality;

const keyed = (match: WordMatch): readonly [string, WordMatch] => [match.place.id, match];

const matchOf =
  (word: string, tolerance: Tolerance) =>
  ({ place, term }: WordHit): readonly WordMatch[] => {
    const quality = qualityOf(word, term, tolerance);
    return quality === undefined ? [] : [{ place, quality }];
  };

const wordMatches = (findWord: FindWord, word: string, last: boolean): ReadonlyMap<string, WordMatch> => {
  const tolerance = toleranceFor(word, last);
  return new Map(findWord(word, lookupFor(tolerance)).flatMap(matchOf(word, tolerance)).toSorted(byQuality).map(keyed));
};

export { type FindWord, type Lookup, type WordHit, type WordMatch, wordMatches };
