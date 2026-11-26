import type { Faker } from '@faker-js/faker';
import type { FakePlace } from './fake-place';

type Kind = FakePlace['kind'];

type Weighted = { readonly weight: number; readonly value: string };

const SHARE_CHECKED = 0.2;

const SHARE_OLD = 0.25;

const SHARE_HOURS_CHECKED = 0.1;

const SHARE_WITH_WHEELCHAIR = 0.15;

const SHARE_WITH_FEE = 0.7;

const RECENT = { from: '2025-01-01T00:00:00Z', to: '2026-10-31T00:00:00Z' } as const;

const OLD = { from: '2019-01-01T00:00:00Z', to: '2024-06-30T00:00:00Z' } as const;

const DATE_LENGTH = 10;

const WHEELCHAIR: readonly Weighted[] = [
  { weight: 5, value: 'yes' },
  { weight: 3, value: 'limited' },
  { weight: 2, value: 'no' }
];

const FEES: ReadonlyMap<Kind, readonly Weighted[]> = new Map<Kind, readonly Weighted[]>([
  [
    'museum',
    [
      { weight: 8, value: 'yes' },
      { weight: 2, value: 'no' }
    ]
  ],
  ['park', [{ weight: 1, value: 'no' }]],
  ['library', [{ weight: 1, value: 'no' }]],
  ['swimming-pool', [{ weight: 1, value: 'yes' }]]
]);

const dayOf = (faker: Faker, span: { readonly from: string; readonly to: string }): string =>
  faker.date.between(span).toISOString().slice(0, DATE_LENGTH);

const checkDate = (faker: Faker, kind: Kind): Readonly<Record<string, string>> => {
  if (!faker.datatype.boolean({ probability: SHARE_CHECKED })) {
    return {};
  }
  const day = dayOf(faker, faker.datatype.boolean({ probability: SHARE_OLD }) ? OLD : RECENT);
  const key =
    kind !== 'park' && faker.datatype.boolean({ probability: SHARE_HOURS_CHECKED }) ? 'check_date:opening_hours' : 'check_date';
  return { [key]: day };
};

const wheelchair = (faker: Faker): Readonly<Record<string, string>> =>
  faker.datatype.boolean({ probability: SHARE_WITH_WHEELCHAIR })
    ? { wheelchair: faker.helpers.weightedArrayElement(WHEELCHAIR) }
    : {};

const fee = (faker: Faker, kind: Kind): Readonly<Record<string, string>> => {
  const values = FEES.get(kind);
  return values !== undefined && faker.datatype.boolean({ probability: SHARE_WITH_FEE })
    ? { fee: faker.helpers.weightedArrayElement(values) }
    : {};
};

const fakeFreshness = (faker: Faker, { kind }: Pick<FakePlace, 'kind'>): Readonly<Record<string, string>> => ({
  ...checkDate(faker, kind),
  ...wheelchair(faker),
  ...fee(faker, kind)
});

export { fakeFreshness };
