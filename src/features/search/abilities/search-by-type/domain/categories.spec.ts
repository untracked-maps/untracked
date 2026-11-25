import { describe, expect, it } from 'vitest';
import type { PlaceKind } from '../../../domain/place';
import { CATEGORY_KEYS, type CategoryKey, CHIPS, kindsOf } from './categories';

const KINDS: readonly (readonly [CategoryKey, readonly PlaceKind[]])[] = [
  ['restaurants', ['restaurant']],
  ['cafes', ['cafe']],
  ['bars', ['bar']],
  ['fast-food', ['fast-food']],
  ['bakeries', ['bakery']],
  ['ice-cream', ['ice-cream']],
  ['chocolate', ['chocolate']],
  ['delis', ['deli']],
  ['nightclubs', ['nightclub']],
  ['groceries', ['supermarket']],
  ['markets', ['marketplace']],
  ['greengrocers', ['greengrocer']],
  ['cheese', ['cheese']],
  ['butchers', ['butcher']],
  ['wine', ['wine']],
  ['clothes', ['clothes', 'department-store']],
  ['bookshops', ['bookshop']],
  ['newsagents', ['newsagent']],
  ['florists', ['florist']],
  ['diy', ['diy']],
  ['phones', ['mobile-phone']],
  ['toys', ['toys']],
  ['stationery', ['stationery']],
  ['music', ['music']],
  ['cash-machines', ['atm']],
  ['banks', ['bank']],
  ['post-offices', ['post-office']],
  ['hairdressers', ['hairdresser']],
  ['beauty', ['beauty-salon']],
  ['opticians', ['optician']],
  ['laundries', ['laundry']],
  ['town-halls', ['townhall']],
  ['police', ['police']],
  ['coworking', ['coworking']],
  ['pharmacies', ['pharmacy']],
  ['doctors', ['doctor']],
  ['hospitals', ['hospital']],
  ['vets', ['veterinary']],
  ['pet-shops', ['pet-shop']],
  ['museums', ['museum']],
  ['monuments', ['monument', 'attraction']],
  ['cinemas', ['cinema']],
  ['theatres', ['theatre']],
  ['libraries', ['library']],
  ['places-of-worship', ['place-of-worship']],
  ['escape-games', ['escape-game']],
  ['parks', ['park', 'garden']],
  ['playgrounds', ['playground']],
  ['gyms', ['fitness-centre']],
  ['swimming-pools', ['swimming-pool']],
  ['cemeteries', ['cemetery']],
  ['metro', ['station']],
  ['bikes', ['bicycle']],
  ['fuel', ['fuel']],
  ['charging', ['charging-station']],
  ['car-parks', ['parking']],
  ['toilets', ['toilets']],
  ['drinking-water', ['drinking-water']],
  ['hotels', ['hotel']]
];

describe('categories', () => {
  it('are fifty-nine until « Mes lieux » comes with its lot', () => {
    expect(CATEGORY_KEYS).toHaveLength(59);
  });

  it('start with restaurants, in the order of the former app', () => {
    expect(CATEGORY_KEYS[0]).toBe('restaurants');
  });

  it('end with hotels, in the order of the former app', () => {
    expect(CATEGORY_KEYS.at(-1)).toBe('hotels');
  });

  it.each(KINDS)('gather the places of %s of kinds %j', (category, kinds) => {
    expect(kindsOf(category)).toEqual(kinds);
  });
});

describe('chips of the categories', () => {
  it('are restaurants, cafés and pharmacies, in that order', () => {
    expect(CHIPS).toEqual(['restaurants', 'cafes', 'pharmacies']);
  });
});
