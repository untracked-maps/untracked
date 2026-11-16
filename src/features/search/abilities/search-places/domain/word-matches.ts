import type { Place } from '../../../domain/place';
import { qualityOf, type Tolerance, toleranceFor } from '../../../domain/word-quality';

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

const EDITS_PER_SWAP = 2;

const lookupFor = ({ typos, prefix, misspeltBeginning }: Tolerance): Lookup => ({
  distance: typos * EDITS_PER_SWAP,
  prefix,
  misspeltBeginning
});

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
