import type { Faker } from '@faker-js/faker';
import type { FakePlace } from './fake-place';
import { type FakeFamily, familyOf } from './place-on-map';

type PhotoFamily = FakeFamily | 'none';

type FakeTags = Readonly<Record<string, string>>;

const PHOTO_FAMILIES: readonly PhotoFamily[] = [
  'food',
  'cafe',
  'bar',
  'bakery',
  'shop',
  'culture',
  'sight',
  'nature',
  'health',
  'stay',
  'money',
  'fuel',
  'train',
  'none'
];

const SHADES = 12;

const SHARE_WITH_PHOTOS = 0.33;

const MOST_PHOTOS = 6;

const DIGITS = 2;

const photoFile = (family: PhotoFamily, shade: number): string => `${family}-${String(shade).padStart(DIGITS, '0')}.svg`;

const PHOTO_FILES: readonly string[] = PHOTO_FAMILIES.flatMap((family) =>
  Array.from({ length: SHADES }, (_, index) => photoFile(family, index + 1))
);

const imageOf = (kind: FakePlace['kind'], shades: readonly number[]): FakeTags => ({
  image: shades.map((shade) => `photos/${photoFile(familyOf(kind) ?? 'none', shade)}`).join(';')
});

const shadesFrom = (first: number, count: number): readonly number[] =>
  Array.from({ length: count }, (_, index) => ((first + index) % SHADES) + 1);

const fakePhotos = (faker: Faker, { kind }: Pick<FakePlace, 'kind'>): FakeTags =>
  faker.datatype.boolean({ probability: SHARE_WITH_PHOTOS })
    ? imageOf(kind, shadesFrom(faker.number.int(SHADES), faker.number.int({ min: 1, max: MOST_PHOTOS })))
    : {};

const photosByHand = (kind: FakePlace['kind'], count: number): FakeTags => imageOf(kind, shadesFrom(0, count));

export { fakePhotos, PHOTO_FAMILIES, PHOTO_FILES, type PhotoFamily, photoFile, photosByHand, SHADES };
