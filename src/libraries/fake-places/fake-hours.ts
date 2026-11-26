import type { Faker } from '@faker-js/faker';
import type { FakePlace } from './fake-place';

type Kind = FakePlace['kind'];

type Weighted = { readonly weight: number; readonly value: string };

type HoursRule = {
  readonly kinds: readonly Kind[];
  readonly values: readonly Weighted[];
};

const OPENING_HOURS = 'opening_hours';

const SHARE_WITH_HOURS = 0.75;

const SHARE_BADLY_WRITTEN = 0.0007;

const BADLY_WRITTEN: readonly Weighted[] = [
  { weight: 1, value: '9h-18h sauf dimanche' },
  { weight: 1, value: 'tlj 10h-19h' },
  { weight: 1, value: 'Mo-Fr 09:00-18:00 et Sa matin' }
];

const SHOP_HOURS: readonly Weighted[] = [
  { weight: 6, value: 'Mo-Sa 10:00-19:00' },
  { weight: 4, value: 'Tu-Sa 10:00-19:00' },
  { weight: 3, value: 'Tu-Sa 09:30-13:00,14:30-19:00' },
  { weight: 2, value: 'Mo-Sa 10:00-19:00; PH off' },
  { weight: 1, value: 'Mo-Sa 10:00-19:00; Su unknown' }
];

const RULES: readonly HoursRule[] = [
  {
    kinds: ['restaurant'],
    values: [
      { weight: 6, value: 'Mo-Sa 12:00-14:30,19:00-22:30' },
      { weight: 4, value: 'Tu-Sa 12:00-14:00,19:30-23:00' },
      { weight: 3, value: 'Mo-Su 12:00-23:00' }
    ]
  },
  {
    kinds: ['cafe'],
    values: [
      { weight: 6, value: 'Mo-Sa 07:00-20:00; Su 08:00-19:00' },
      { weight: 3, value: 'Mo-Fr 07:30-19:00' },
      { weight: 2, value: 'Mo-Su 07:00-02:00' }
    ]
  },
  {
    kinds: ['bar'],
    values: [
      { weight: 5, value: 'Mo-Su 17:00-02:00' },
      { weight: 4, value: 'Tu-Sa 18:00-01:00' }
    ]
  },
  {
    kinds: ['bakery', 'chocolate', 'deli', 'cheese', 'butcher', 'greengrocer'],
    values: [
      { weight: 6, value: 'Tu-Sa 07:00-20:00; Su 07:00-13:30' },
      { weight: 4, value: 'Mo-Sa 07:30-20:00' }
    ]
  },
  {
    kinds: ['pharmacy'],
    values: [
      { weight: 6, value: 'Mo-Sa 09:00-20:00' },
      { weight: 4, value: 'Mo-Fr 08:30-19:30; Sa 09:00-19:00' },
      { weight: 1, value: '24/7' }
    ]
  },
  {
    kinds: ['supermarket'],
    values: [
      { weight: 6, value: 'Mo-Sa 08:30-21:00; Su 09:00-13:00' },
      { weight: 3, value: 'Mo-Su 08:00-22:00' }
    ]
  },
  {
    kinds: [
      'hairdresser',
      'beauty-salon',
      'florist',
      'bookshop',
      'wine',
      'clothes',
      'newsagent',
      'diy',
      'mobile-phone',
      'toys',
      'stationery',
      'music',
      'optician',
      'pet-shop',
      'laundry',
      'bicycle'
    ],
    values: SHOP_HOURS
  },
  { kinds: ['hotel'], values: [{ weight: 1, value: '24/7' }] },
  {
    kinds: ['museum'],
    values: [
      { weight: 3, value: 'Tu-Su 10:00-18:00; PH off' },
      { weight: 2, value: 'We-Mo 10:00-18:00' }
    ]
  },
  { kinds: ['cinema'], values: [{ weight: 1, value: 'Mo-Su 10:00-23:30' }] },
  { kinds: ['theatre'], values: [{ weight: 1, value: 'Tu-Sa 19:00-23:30; Su 15:00-18:00' }] },
  { kinds: ['library'], values: [{ weight: 1, value: 'Tu-Sa 10:00-19:00; PH off' }] },
  { kinds: ['post-office'], values: [{ weight: 1, value: 'Mo-Fr 09:00-19:00; Sa 09:00-12:30; PH off' }] },
  { kinds: ['fast-food'], values: [{ weight: 1, value: 'Mo-Su 11:00-23:00' }] },
  { kinds: ['ice-cream'], values: [{ weight: 1, value: 'Mo-Su 12:00-23:30' }] },
  { kinds: ['marketplace'], values: [{ weight: 1, value: 'Tu,Fr 07:00-13:30; Su 07:00-14:30' }] },
  { kinds: ['bank'], values: [{ weight: 1, value: 'Tu-Fr 09:00-12:30,13:45-17:30; Sa 09:00-12:30; PH off' }] },
  { kinds: ['townhall'], values: [{ weight: 1, value: 'Mo-Fr 08:30-17:00; Th 08:30-19:30; PH off' }] },
  { kinds: ['doctor'], values: [{ weight: 1, value: 'Mo-Fr 09:00-12:00,14:00-19:00' }] },
  { kinds: ['fitness-centre'], values: [{ weight: 1, value: 'Mo-Fr 06:00-23:00; Sa,Su 08:00-20:00' }] },
  {
    kinds: ['swimming-pool'],
    values: [{ weight: 1, value: 'Tu,Th 11:30-13:30,16:30-21:00; We 11:30-18:00; Sa,Su 09:00-18:00' }]
  }
];

const hoursOfKind = (kind: Kind): readonly Weighted[] => RULES.find(({ kinds }) => kinds.includes(kind))?.values ?? [];

const fakeHours = (faker: Faker, { kind }: Pick<FakePlace, 'kind'>): Readonly<Record<string, string>> => {
  const values = hoursOfKind(kind);
  if (values.length === 0 || !faker.datatype.boolean({ probability: SHARE_WITH_HOURS })) {
    return {};
  }
  const value = faker.datatype.boolean({ probability: SHARE_BADLY_WRITTEN })
    ? faker.helpers.weightedArrayElement(BADLY_WRITTEN)
    : faker.helpers.weightedArrayElement(values);
  return { [OPENING_HOURS]: value };
};

export { fakeHours };
