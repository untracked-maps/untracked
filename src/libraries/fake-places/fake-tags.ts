import type { Faker } from '@faker-js/faker';
import type { FakePlace } from './fake-place';

type Kind = FakePlace['kind'];

type FakeTags = Readonly<Record<string, string>>;

type Weighted = { readonly weight: number; readonly value: FakeTags };

type TagRule = {
  readonly kinds: readonly Kind[];
  readonly share: number;
  readonly values: readonly Weighted[];
};

const EATING: readonly Kind[] = ['restaurant', 'cafe', 'bar', 'bakery'];

const SHOPS: readonly Kind[] = ['pharmacy', 'supermarket', 'hairdresser', 'beauty-salon', 'florist', 'bookshop'];

const CULTURE: readonly Kind[] = ['museum', 'cinema', 'theatre', 'library'];

const tagged = (...tags: readonly (readonly [string, string])[]): FakeTags => Object.fromEntries(tags);

const only = (key: string, value: string): readonly Weighted[] => [{ weight: 1, value: tagged([key, value]) }];

const RULES: readonly TagRule[] = [
  {
    kinds: [...EATING, ...SHOPS, 'hotel', 'museum', 'cinema', 'theatre'],
    share: 0.3,
    values: only('payment:contactless', 'yes')
  },
  {
    kinds: [...EATING, ...SHOPS, 'hotel', 'museum', 'cinema', 'theatre'],
    share: 0.2,
    values: [
      { weight: 17, value: tagged(['payment:cards', 'yes']) },
      { weight: 3, value: tagged(['payment:cards', 'no']) }
    ]
  },
  { kinds: ['restaurant', 'cafe', 'bar', 'bakery'], share: 0.05, values: only('payment:cash', 'no') },
  { kinds: ['restaurant', 'cafe', 'bakery', 'supermarket'], share: 0.2, values: only('payment:meal_voucher', 'yes') },
  { kinds: ['cafe'], share: 0.6, values: only('outdoor_seating', 'yes') },
  { kinds: ['restaurant', 'bar'], share: 0.35, values: only('outdoor_seating', 'yes') },
  {
    kinds: ['restaurant', 'cafe'],
    share: 0.25,
    values: [
      { weight: 10, value: tagged(['diet:vegetarian', 'yes']) },
      { weight: 5, value: tagged(['diet:vegetarian', 'yes'], ['diet:vegan', 'yes']) },
      { weight: 3, value: tagged(['diet:vegetarian', 'only']) },
      { weight: 2, value: tagged(['diet:vegetarian', 'only'], ['diet:vegan', 'only']) }
    ]
  },
  { kinds: ['restaurant', 'cafe', 'bakery'], share: 0.1, values: only('diet:gluten_free', 'yes') },
  {
    kinds: ['restaurant', 'cafe', 'bakery'],
    share: 0.35,
    values: [
      { weight: 17, value: tagged(['takeaway', 'yes']) },
      { weight: 3, value: tagged(['takeaway', 'only']) }
    ]
  },
  { kinds: ['restaurant'], share: 0.25, values: only('delivery', 'yes') },
  {
    kinds: ['restaurant'],
    share: 0.35,
    values: [
      { weight: 10, value: tagged(['reservation', 'yes']) },
      { weight: 6, value: tagged(['reservation', 'recommended']) },
      { weight: 3, value: tagged(['reservation', 'no']) },
      { weight: 1, value: tagged(['reservation', 'required']) }
    ]
  },
  {
    kinds: ['bar'],
    share: 0.15,
    values: [
      { weight: 3, value: tagged(['reservation', 'no']) },
      { weight: 2, value: tagged(['reservation', 'yes']) }
    ]
  },
  {
    kinds: ['hairdresser', 'beauty-salon', 'theatre'],
    share: 0.4,
    values: [
      { weight: 5, value: tagged(['reservation', 'recommended']) },
      { weight: 3, value: tagged(['reservation', 'required']) },
      { weight: 2, value: tagged(['reservation', 'yes']) }
    ]
  },
  {
    kinds: ['restaurant', 'cafe', 'bar', 'hotel', 'library'],
    share: 0.3,
    values: [
      { weight: 7, value: tagged(['internet_access', 'wlan'], ['internet_access:fee', 'no']) },
      { weight: 3, value: tagged(['internet_access', 'wlan']) }
    ]
  },
  {
    kinds: [...EATING, 'supermarket', 'pharmacy', 'bookshop', 'hotel', 'museum', 'cinema', 'theatre'],
    share: 0.15,
    values: only('air_conditioning', 'yes')
  },
  {
    kinds: ['restaurant', 'cafe', 'bar', ...CULTURE, 'park', 'hospital'],
    share: 0.25,
    values: [
      { weight: 7, value: tagged(['toilets', 'yes']) },
      { weight: 3, value: tagged(['toilets', 'yes'], ['toilets:wheelchair', 'yes']) }
    ]
  },
  {
    kinds: ['restaurant', 'cafe', 'supermarket', 'museum', 'library', 'park', 'hospital'],
    share: 0.1,
    values: only('changing_table', 'yes')
  },
  {
    kinds: ['restaurant', 'cafe', 'bar', 'hotel', 'park', 'bookshop', 'florist'],
    share: 0.2,
    values: [
      { weight: 4, value: tagged(['dog', 'yes']) },
      { weight: 3, value: tagged(['dog', 'leashed']) },
      { weight: 3, value: tagged(['dog', 'no']) }
    ]
  },
  { kinds: ['supermarket'], share: 0.3, values: only('self_service', 'yes') },
  { kinds: ['bookshop'], share: 0.15, values: only('second_hand', 'only') },
  {
    kinds: ['supermarket', 'bakery', 'cafe', 'restaurant'],
    share: 0.08,
    values: [
      { weight: 7, value: tagged(['organic', 'yes']) },
      { weight: 3, value: tagged(['organic', 'only']) }
    ]
  }
];

const tagsBy =
  (faker: Faker, kind: Kind) =>
  ({ kinds, share, values }: TagRule): readonly FakeTags[] =>
    kinds.includes(kind) && faker.datatype.boolean({ probability: share }) ? [faker.helpers.weightedArrayElement(values)] : [];

const fakeTags = (faker: Faker, { kind }: Pick<FakePlace, 'kind'>): Pick<FakePlace, 'tags'> => {
  const tags: FakeTags = Object.fromEntries(RULES.flatMap(tagsBy(faker, kind)).flatMap(Object.entries));
  return Object.keys(tags).length === 0 ? {} : { tags };
};

export { fakeTags };
