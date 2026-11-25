import { describe, expect, it } from 'vitest';
import type { CategoryKey } from './categories';
import { categoryNamedIn } from './category-words';
import CATEGORY_WORDS from './category-words.json' with { type: 'json' };

const PHRASES: readonly (readonly [string, string])[] = Object.entries(CATEGORY_WORDS.categories).flatMap(
  ([category, phrases]) => phrases.map((phrase): readonly [string, string] => [phrase, category])
);

const CATEGORIES_NAMED: readonly (readonly [string, CategoryKey])[] = [
  ['bakery', 'bakeries'],
  ['bakeries', 'bakeries'],
  ['boulangerie', 'bakeries'],
  ['Boulangeries', 'bakeries'],
  ['pharmacy', 'pharmacies'],
  ['pharmacie', 'pharmacies'],
  ['pizza', 'restaurants'],
  ['resto', 'restaurants'],
  ['manger', 'restaurants'],
  ['hopital', 'hospitals'],
  ['HÔPITAUX', 'hospitals'],
  ['eglise', 'places-of-worship'],
  ['salon de coiffure', 'hairdressers'],
  ['salon coiffure', 'hairdressers'],
  ['salon de beauté', 'beauty'],
  ['Bureau de poste', 'post-offices'],
  ['la poste', 'post-offices'],
  ['post office', 'post-offices'],
  ['car park', 'car-parks'],
  ['jardin', 'parks'],
  ['grand magasin', 'clothes'],
  ['site touristique', 'monuments'],
  ['place of worship', 'places-of-worship'],
  ['dab', 'cash-machines'],
  ['retirer', 'cash-machines'],
  ['wc', 'toilets'],
  ['fleuriste', 'florists'],
  ['glaces', 'ice-cream'],
  ['primeurs', 'greengrocers'],
  ['vétérinaire', 'vets'],
  ['escape game', 'escape-games'],
  ['piscine', 'swimming-pools']
];

const FIRST_IN_ORDER: readonly (readonly [string, CategoryKey])[] = [
  ['station', 'metro'],
  ['station service', 'fuel'],
  ['station de recharge', 'charging'],
  ['boire', 'bars'],
  ['nuit', 'nightclubs'],
  ['jeux', 'playgrounds'],
  ['salon', 'hairdressers'],
  ['eau', 'drinking-water']
];

const FILLED_QUERIES: readonly (readonly [string, CategoryKey])[] = [
  ['pharmacie la plus proche', 'pharmacies'],
  ['boulangerie près de chez moi', 'bakeries'],
  ['the nearest pharmacy', 'pharmacies'],
  ['bakeries near me', 'bakeries'],
  ["l'hôpital", 'hospitals'],
  ['un café à côté', 'cafes'],
  ['pharmacie ouverte autour de moi', 'pharmacies'],
  ['toy shop', 'toys'],
  ['fruits et légumes', 'greengrocers'],
  ['  Restaurants   proches ', 'restaurants']
];

const NOT_CATEGORIES: readonly string[] = [
  'carpark',
  'boulangerie garcia',
  'tour eiffel',
  'bar restaurant',
  'près de moi',
  '',
  'boulang',
  'shop',
  'école',
  'hôtel de ville'
];

describe('category named in a query', () => {
  it.each(CATEGORIES_NAMED)('is found in "%s"', (query, category) => {
    expect(categoryNamedIn(query)).toBe(category);
  });

  it.each(FIRST_IN_ORDER)('is the first whose words hold every word of "%s"', (query, category) => {
    expect(categoryNamedIn(query)).toBe(category);
  });

  it.each(FILLED_QUERIES)('is found among filler words in "%s"', (query, category) => {
    expect(categoryNamedIn(query)).toBe(category);
  });

  it.each(NOT_CATEGORIES)('is none in "%s"', (query) => {
    expect(categoryNamedIn(query)).toBeUndefined();
  });
});

describe('vocabulary of categories', () => {
  it.each(PHRASES)('names its own category with "%s"', (phrase, category) => {
    expect(categoryNamedIn(phrase)).toBe(category);
  });
});
