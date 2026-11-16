import type { Coordinates, Place } from '../../../../domain/place';
import { placesNamed } from '../../domain/places-named';
import type { FindPlaces } from '../../domain/search-places';
import { wordFinderOf } from './word-finder';

const searchableIndexOf = (places: readonly Place[]): FindPlaces => {
  const findWord = wordFinderOf(places);
  return (query: string, reference: Coordinates): readonly Place[] => placesNamed(findWord, query, reference);
};

export { searchableIndexOf };
