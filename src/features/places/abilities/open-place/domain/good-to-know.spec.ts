import { describe, expect, it } from 'vitest';
import { goodToKnowOf } from './good-to-know';

type Pairs = readonly (readonly [string, string])[];

const factsOf = (pairs?: Pairs): readonly string[] =>
  goodToKnowOf(pairs === undefined ? undefined : Object.fromEntries(pairs)).map(({ fact, sign }) => `${fact} ${sign}`);

describe('what is good to know about a place', () => {
  it('is nothing without tags', () => {
    expect(factsOf()).toEqual([]);
  });

  it('is nothing when no tag tells it', () => {
    expect(
      factsOf([
        ['name', 'Square du Vert-Galant'],
        ['amenity', 'bench']
      ])
    ).toEqual([]);
  });

  it.each<readonly [string, Pairs, readonly string[]]>([
    ['a heritage level', [['heritage', '2']], ['historic-monument yes']],
    ['a heritage of the French Ministry of Culture', [['heritage:operator', 'mhs']], ['historic-monument yes']],
    ['a heritage of another operator', [['heritage:operator', 'whc']], []],
    ['a reference of a historic monument', [['ref:mhs', 'PA00088801']], ['historic-monument yes']],
    ['contactless payment', [['payment:contactless', 'yes']], ['contactless yes']],
    ['no contactless payment', [['payment:contactless', 'no']], []],
    ['credit cards', [['payment:credit_cards', 'yes']], ['cards-accepted yes']],
    ['cards', [['payment:cards', 'only']], ['cards-accepted yes']],
    ['debit cards', [['payment:debit_cards', 'designated']], ['cards-accepted yes']],
    ['credit cards refused', [['payment:credit_cards', 'no']], ['cards-refused no']],
    ['cards refused', [['payment:cards', 'no']], ['cards-refused no']],
    ['debit cards refused only', [['payment:debit_cards', 'no']], []],
    [
      'credit cards refused and debit cards taken',
      [
        ['payment:credit_cards', 'no'],
        ['payment:debit_cards', 'yes']
      ],
      ['cards-accepted yes']
    ],
    ['cash refused', [['payment:cash', 'no']], ['cash-refused no']],
    ['cash taken', [['payment:cash', 'yes']], []],
    ['meal vouchers', [['payment:meal_voucher', 'yes']], ['meal-vouchers yes']],
    ['chèques déjeuner', [['payment:cheque_dejeuner', 'yes']], ['meal-vouchers yes']],
    ['meal vouchers only', [['payment:meal_voucher', 'only']], []],
    ['a terrace', [['outdoor_seating', 'yes']], ['terrace yes']],
    ['no terrace', [['outdoor_seating', 'no']], []],
    [
      'vegan food only',
      [
        ['diet:vegan', 'only'],
        ['diet:vegetarian', 'only']
      ],
      ['vegan-only yes']
    ],
    [
      'vegetarian food only',
      [
        ['diet:vegan', 'yes'],
        ['diet:vegetarian', 'only']
      ],
      ['vegetarian-only yes']
    ],
    [
      'vegan dishes',
      [
        ['diet:vegan', 'designated'],
        ['diet:vegetarian', 'yes']
      ],
      ['vegan-options yes']
    ],
    ['vegetarian dishes', [['diet:vegetarian', 'yes']], ['vegetarian-options yes']],
    ['no vegetarian dish', [['diet:vegetarian', 'no']], []],
    ['gluten-free dishes', [['diet:gluten_free', 'yes']], ['gluten-free yes']],
    ['takeaway only', [['takeaway', 'only']], ['takeaway-only yes']],
    ['takeaway', [['takeaway', 'yes']], ['takeaway yes']],
    ['no takeaway', [['takeaway', 'no']], []],
    ['delivery', [['delivery', 'yes']], ['delivery yes']],
    ['delivery only', [['delivery', 'only']], []],
    ['a reservation required', [['reservation', 'required']], ['reservation-required no']],
    ['a reservation recommended', [['reservation', 'recommended']], ['reservation-recommended yes']],
    ['reservations taken', [['reservation', 'yes']], ['reservation-possible yes']],
    ['no reservation', [['reservation', 'no']], ['no-reservation yes']],
    ['members only reservations', [['reservation', 'members_only']], []],
    [
      'free Wi-Fi',
      [
        ['internet_access', 'wlan'],
        ['internet_access:fee', 'no']
      ],
      ['free-wifi yes']
    ],
    ['Wi-Fi', [['internet_access', 'wifi']], ['wifi yes']],
    [
      'some access to the internet',
      [
        ['internet_access', 'yes'],
        ['internet_access:fee', 'yes']
      ],
      ['wifi yes']
    ],
    [
      'a wired access to the internet',
      [
        ['internet_access', 'wired'],
        ['internet_access:fee', 'no']
      ],
      []
    ],
    ['air conditioning', [['air_conditioning', 'yes']], ['air-conditioned yes']],
    [
      'toilets open to wheelchairs',
      [
        ['toilets', 'yes'],
        ['toilets:wheelchair', 'yes']
      ],
      ['accessible-toilets yes']
    ],
    [
      'toilets',
      [
        ['toilets', 'yes'],
        ['toilets:wheelchair', 'no']
      ],
      ['toilets yes']
    ],
    [
      'no toilets, said open to wheelchairs',
      [
        ['toilets', 'no'],
        ['toilets:wheelchair', 'yes']
      ],
      []
    ],
    ['a changing table', [['changing_table', 'yes']], ['changing-table yes']],
    ['dogs welcome', [['dog', 'yes']], ['dogs-welcome yes']],
    ['dogs on a leash', [['dog', 'leashed']], ['dogs-on-a-leash yes']],
    ['dogs not allowed', [['dog', 'no']], ['dogs-not-allowed no']],
    ['self-service', [['self_service', 'yes']], ['self-service yes']],
    ['second-hand goods only', [['second_hand', 'only']], ['second-hand yes']],
    ['some second-hand goods', [['second_hand', 'yes']], []],
    ['organic products only', [['organic', 'only']], ['organic-only yes']],
    ['organic products', [['organic', 'yes']], ['organic-products yes']],
    ['no organic product', [['organic', 'no']], []]
  ])('tells %s', (_, tags, facts) => {
    expect(factsOf(tags)).toEqual(facts);
  });

  it('comes in its own order, whatever the order of the tags', () => {
    expect(
      factsOf([
        ['dog', 'no'],
        ['outdoor_seating', 'yes'],
        ['payment:contactless', 'yes'],
        ['takeaway', 'yes'],
        ['internet_access', 'wlan'],
        ['heritage', '3']
      ])
    ).toEqual(['historic-monument yes', 'contactless yes', 'terrace yes', 'takeaway yes', 'wifi yes', 'dogs-not-allowed no']);
  });

  it('tells every fact of every group', () => {
    expect(
      factsOf([
        ['payment:cards', 'yes'],
        ['payment:cash', 'no'],
        ['payment:meal_voucher', 'yes'],
        ['diet:vegetarian', 'yes'],
        ['diet:gluten_free', 'yes'],
        ['delivery', 'yes'],
        ['reservation', 'no'],
        ['air_conditioning', 'yes'],
        ['toilets', 'yes'],
        ['changing_table', 'yes'],
        ['self_service', 'yes'],
        ['second_hand', 'only'],
        ['organic', 'yes']
      ])
    ).toEqual([
      'cards-accepted yes',
      'cash-refused no',
      'meal-vouchers yes',
      'vegetarian-options yes',
      'gluten-free yes',
      'delivery yes',
      'no-reservation yes',
      'air-conditioned yes',
      'toilets yes',
      'changing-table yes',
      'self-service yes',
      'second-hand yes',
      'organic-products yes'
    ]);
  });
});
