import { describe, expect, it } from 'vitest';
import type { PlaceKind } from '../../../domain/place';
import { kindNamedIn } from './kind-words';
import KIND_WORDS from './kind-words.json' with { type: 'json' };

const PHRASES: readonly (readonly [string, string])[] = Object.entries(KIND_WORDS.kinds).flatMap(([kind, phrases]) =>
  phrases.map((phrase): readonly [string, string] => [phrase, kind])
);

const KINDS_NAMED: readonly (readonly [string, PlaceKind])[] = [
  ['bakery', 'bakery'],
  ['bakeries', 'bakery'],
  ['boulangerie', 'bakery'],
  ['Boulangeries', 'bakery'],
  ['pharmacy', 'pharmacy'],
  ['pharmacie', 'pharmacy'],
  ['pizza', 'restaurant'],
  ['hopital', 'hospital'],
  ['HÔPITAUX', 'hospital'],
  ['eglise', 'place-of-worship'],
  ['salon de coiffure', 'hairdresser'],
  ['salon coiffure', 'hairdresser'],
  ['Bureau de poste', 'post-office'],
  ['la poste', 'post-office'],
  ['post office', 'post-office'],
  ['car park', 'parking'],
  ['place of worship', 'place-of-worship']
];

const FILLED_QUERIES: readonly (readonly [string, PlaceKind])[] = [
  ['pharmacie la plus proche', 'pharmacy'],
  ['boulangerie près de chez moi', 'bakery'],
  ['the nearest pharmacy', 'pharmacy'],
  ['bakeries near me', 'bakery'],
  ["l'hôpital", 'hospital'],
  ['un café à côté', 'cafe'],
  ['  Restaurants   proches ', 'restaurant']
];

const NOT_KINDS: readonly string[] = [
  'carpark',
  'boulangerie garcia',
  'tour eiffel',
  'bar restaurant',
  'près de moi',
  '',
  'boulang',
  'salon'
];

describe('kind named in a query', () => {
  it.each(KINDS_NAMED)('is found in "%s"', (query, kind) => {
    expect(kindNamedIn(query)).toBe(kind);
  });

  it.each(FILLED_QUERIES)('is found among filler words in "%s"', (query, kind) => {
    expect(kindNamedIn(query)).toBe(kind);
  });

  it.each(NOT_KINDS)('is none in "%s"', (query) => {
    expect(kindNamedIn(query)).toBeUndefined();
  });
});

describe('vocabulary of kinds', () => {
  it.each(PHRASES)('names a single kind with "%s"', (phrase, kind) => {
    expect(kindNamedIn(phrase)).toBe(kind);
  });
});
