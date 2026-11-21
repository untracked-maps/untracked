import { describe, expect, it } from 'vitest';
import type { Coordinates, Place } from '../../../domain/place';
import { indexedWordsOf } from '../../../domain/words';
import { placesNamed } from './places-named';
import type { FindWord, Lookup, WordHit } from './word-matches';

const CENTRE: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const place = (id: string, name: string, changes: Partial<Place> = {}): Place => ({
  id,
  name,
  kind: 'hotel',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: CENTRE,
  fame: 0,
  ...changes
});

const matchesWord =
  (word: string, { prefix }: Lookup) =>
  (term: string): boolean =>
    term === word || (prefix && term.startsWith(word));

const exactOrPrefixIn =
  (places: readonly Place[]): FindWord =>
  (word, tolerance): readonly WordHit[] =>
    places.flatMap((candidate) =>
      indexedWordsOf(candidate.name)
        .filter(matchesWord(word, tolerance))
        .map((term) => ({ place: candidate, term }))
    );

const idsFound = (places: readonly Place[], query: string): readonly string[] =>
  placesNamed(exactOrPrefixIn(places), query, CENTRE).map(({ id }) => id);

const EIFFEL = place('eiffel', 'Tour Eiffel', { kind: 'attraction', fame: 99 });
const PARKING = place('parking', 'Parking Tour Eiffel', { kind: 'parking' });
const TOURS = place('tours', 'Gare de Tours', { kind: 'station' });

describe('places named after a query', () => {
  it('are those that match every word typed', () => {
    expect(idsFound([EIFFEL, TOURS], 'tour eiffel')).toEqual(['eiffel']);
  });

  it('match the last word typed by its beginning', () => {
    expect(idsFound([EIFFEL], 'tour eif')).toEqual(['eiffel']);
  });

  it('do not match an earlier short word by its beginning', () => {
    expect(idsFound([TOURS], 'you gare')).toEqual([]);
  });

  it('put the famous landmark before its namesake', () => {
    expect(idsFound([PARKING, EIFFEL], 'tour eiffel')).toEqual(['eiffel', 'parking']);
  });

  it('are none for a blank query', () => {
    expect(idsFound([EIFFEL], ' ')).toEqual([]);
  });

  it('are at most seven', () => {
    expect(
      idsFound(
        Array.from({ length: 9 }, (_, index) => place(`pharmacy-${index}`, `Pharmacie ${index}`)),
        'pharmacie'
      )
    ).toHaveLength(7);
  });

  it('keep the seven best', () => {
    expect(
      idsFound(
        [
          ...Array.from({ length: 7 }, (_, index) => place(`pharmacy-${index}`, `Pharmacie ${index}`)),
          place('best', 'Pharmacie', { fame: 50 })
        ],
        'pharmacie'
      )[0]
    ).toBe('best');
  });
});
