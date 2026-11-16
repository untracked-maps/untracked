import type { Coordinates, Place } from '../../../domain/place';
import { type Candidate, rankedOf, strongFirst } from './ranking';
import { type FindWord, type WordMatch, wordMatches } from './word-matches';
import { queryWordsOf } from './words';

const MOST_PLACES = 7;

const qualitiesOf = (place: Place, matchesPerWord: readonly ReadonlyMap<string, WordMatch>[]): readonly number[] =>
  matchesPerWord.flatMap((matches) => {
    const match = matches.get(place.id);
    return match === undefined ? [] : [match.quality];
  });

const candidatesOf = (matchesPerWord: readonly ReadonlyMap<string, WordMatch>[]): readonly Candidate[] =>
  [...(matchesPerWord[0]?.values() ?? [])]
    .map(({ place }): Candidate => ({ place, qualities: qualitiesOf(place, matchesPerWord) }))
    .filter(({ qualities }) => qualities.length === matchesPerWord.length);

const placesNamed = (findWord: FindWord, query: string, reference: Coordinates): readonly Place[] => {
  const words = queryWordsOf(query);
  return candidatesOf(words.map((word, index) => wordMatches(findWord, word, index === words.length - 1)))
    .map(rankedOf(query, reference))
    .toSorted(strongFirst)
    .slice(0, MOST_PLACES)
    .map(({ place }) => place);
};

export { placesNamed };
