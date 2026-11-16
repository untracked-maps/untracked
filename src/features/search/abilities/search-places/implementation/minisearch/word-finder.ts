import SearchableMap from 'minisearch/SearchableMap';
import type { Place } from '../../../../domain/place';
import type { FindWord, Lookup, WordHit } from '../../domain/word-matches';
import { indexedWordsOf } from '../../domain/words';

type Entry = readonly [string, readonly Place[]];

type Index = {
  readonly terms: SearchableMap<readonly Place[]>;
  readonly beginnings: SearchableMap<readonly Entry[]>;
};

const SHORTEST_BEGINNING = 4;

const grouped = <Value>(pairs: readonly (readonly [string, Value])[]): [string, readonly Value[]][] =>
  [...Map.groupBy(pairs, ([key]) => key)].map(([key, group]) => [key, group.map(([, value]) => value)]);

const termsOf = (places: readonly Place[]): [string, readonly Place[]][] =>
  grouped(places.flatMap((place) => indexedWordsOf(place.name).map((term): readonly [string, Place] => [term, place])));

const beginningsOf = (entry: Entry): readonly (readonly [string, Entry])[] =>
  Array.from({ length: entry[0].length - SHORTEST_BEGINNING }, (_, index) => [
    entry[0].slice(0, SHORTEST_BEGINNING + index),
    entry
  ]);

const indexOf = (places: readonly Place[]): Index => {
  const terms = termsOf(places);
  return {
    terms: SearchableMap.from<readonly Place[]>(terms),
    beginnings: SearchableMap.from<readonly Entry[]>(grouped(terms.flatMap(beginningsOf)))
  };
};

const hitsOf = ([term, places]: Entry): readonly WordHit[] => places.map((place) => ({ place, term }));

const near = (terms: SearchableMap<readonly Place[]>, word: string, distance: number): readonly Entry[] =>
  [...terms.fuzzyGet(word, distance)].map(([term, [places]]) => [term, places]);

const misspeltBeginnings = (beginnings: SearchableMap<readonly Entry[]>, word: string, distance: number): readonly Entry[] =>
  [...beginnings.fuzzyGet(word, distance).values()].flatMap(([started]) => started);

const findWordIn =
  (index: Index): FindWord =>
  (word: string, { distance, prefix, misspeltBeginning }: Lookup): readonly WordHit[] =>
    [
      ...near(index.terms, word, distance),
      ...(prefix ? index.terms.atPrefix(word) : []),
      ...(misspeltBeginning ? misspeltBeginnings(index.beginnings, word, distance) : [])
    ].flatMap(hitsOf);

const wordFinderOf = (places: readonly Place[]): FindWord => findWordIn(indexOf(places));

export { wordFinderOf };
