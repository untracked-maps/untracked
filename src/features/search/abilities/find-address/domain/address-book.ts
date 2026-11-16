import { kilometresBetween } from '../../../domain/distance';
import type { FoundAddress } from '../../../domain/found';
import type { Coordinates } from '../../../domain/place';
import { textMatchOf } from '../../../domain/text-match';
import { qualityOf, toleranceFor } from '../../../domain/word-quality';
import type { AddressQuery } from './address-query';
import { type AddressEntry, entryOf, type KnownAddress } from './known-address';

type RankedAddress = {
  readonly address: FoundAddress;
  readonly clean: boolean;
};

type FindAddresses = (query: AddressQuery, reference: Coordinates) => readonly RankedAddress[];

type Scored = {
  readonly entry: AddressEntry;
  readonly score: number;
  readonly clean: boolean;
  readonly kilometres: number;
};

type QualityTable = ReadonlyMap<string, number>;

const MOST_ADDRESSES = 7;

const qualityTableOf = (vocabulary: readonly string[], word: string, last: boolean): QualityTable => {
  const tolerance = toleranceFor(word, last);
  return new Map(
    vocabulary.flatMap((term): readonly (readonly [string, number])[] => {
      const quality = qualityOf(word, term, tolerance);
      return quality === undefined ? [] : [[term, quality]];
    })
  );
};

const fitsKind = ({ words, number, postcode }: AddressQuery, { found, number: entryNumber }: AddressEntry): boolean =>
  words.length === 0 ? found.kind === 'district' && postcode !== undefined : found.kind !== 'address' || entryNumber === number;

const isCandidate =
  (query: AddressQuery) =>
  (entry: AddressEntry): boolean =>
    (query.postcode === undefined || entry.postcode === query.postcode) && fitsKind(query, entry);

const isClean = (words: readonly string[], terms: readonly string[]): boolean =>
  words.every(
    (word, index) => terms.includes(word) || (index === words.length - 1 && terms.some((term) => term.startsWith(word)))
  );

const scoredWith =
  (words: readonly string[], tables: readonly QualityTable[], reference: Coordinates) =>
  (entry: AddressEntry): readonly Scored[] => {
    const qualities = tables.map((table) => Math.max(...entry.terms.flatMap((term) => table.get(term) ?? [])));
    return qualities.every(Number.isFinite)
      ? [
          {
            entry,
            score: textMatchOf(qualities, entry.wordCount).score,
            clean: isClean(words, entry.terms),
            kilometres: kilometresBetween(reference, entry.found.coordinates)
          }
        ]
      : [];
  };

const numberRankOf = ({ entry }: Scored): number => Number(entry.found.kind !== 'address');

const byRank = (left: Scored, right: Scored): number =>
  numberRankOf(left) - numberRankOf(right) || right.score - left.score || left.kilometres - right.kilometres;

const uniqueEntries = (entries: readonly AddressEntry[]): readonly AddressEntry[] =>
  [...Map.groupBy(entries, ({ found }) => found.id).values()].flatMap((same) => same.slice(0, 1));

const addressBookOf = (known: readonly KnownAddress[]): FindAddresses => {
  const entries = uniqueEntries(known.map(entryOf));
  const vocabulary = [...new Set(entries.flatMap(({ terms }) => terms))];
  return (query, reference) => {
    const last = query.words.length - 1;
    const tables = query.words.map((word, index) => qualityTableOf(vocabulary, word, index === last));
    return entries
      .filter(isCandidate(query))
      .flatMap(scoredWith(query.words, tables, reference))
      .toSorted(byRank)
      .slice(0, MOST_ADDRESSES)
      .map(({ entry, clean }) => ({ address: entry.found, clean }));
  };
};

export { addressBookOf, type RankedAddress };
