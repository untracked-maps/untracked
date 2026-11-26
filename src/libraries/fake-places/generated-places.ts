import { Faker } from '@faker-js/faker';
import { fakeHours } from './fake-hours';
import { ADDED_KINDS, type DrawnKind, type FakePlace, type FakePostalAddress, type GeneratedKind } from './fake-place';
import { fakeReach } from './fake-reach';
import { fakeTags } from './fake-tags';
import type { FakeZone } from './fake-zone';
import { placeNameOf } from './place-names';

const SEED = 1789;

const CUISINE_SEED = 1848;

const REACH_SEED = 1871;

const TAGS_SEED = 1905;

const HOURS_SEED = 1936;

const ADDED_SEEDS = { places: 1944, reach: 1958, tags: 1968, hours: 1981 };

const PLACES_PER_ADDED_KIND = 6;

const PRECISION = 5;

const FAMOUS_SHARE = 0.05;

const MOST_FAME = 30;

const HIGHEST_NUMBER = 150;

const ID_DIGITS = 4;

const KIND_WEIGHTS: readonly { readonly weight: number; readonly value: DrawnKind }[] = [
  { weight: 18, value: 'restaurant' },
  { weight: 12, value: 'cafe' },
  { weight: 8, value: 'bar' },
  { weight: 8, value: 'bakery' },
  { weight: 6, value: 'pharmacy' },
  { weight: 6, value: 'supermarket' },
  { weight: 6, value: 'hairdresser' },
  { weight: 4, value: 'beauty-salon' },
  { weight: 4, value: 'florist' },
  { weight: 4, value: 'bookshop' },
  { weight: 5, value: 'hotel' },
  { weight: 4, value: 'school' },
  { weight: 3, value: 'parking' },
  { weight: 3, value: 'park' },
  { weight: 2, value: 'museum' },
  { weight: 2, value: 'cinema' },
  { weight: 2, value: 'library' },
  { weight: 2, value: 'post-office' },
  { weight: 1, value: 'hospital' },
  { weight: 2, value: 'theatre' }
];

const CUISINE_WEIGHTS: readonly { readonly weight: number; readonly value: string | undefined }[] = [
  { weight: 30, value: 'french' },
  { weight: 15, value: 'italian' },
  { weight: 10, value: 'japanese' },
  { weight: 8, value: 'chinese' },
  { weight: 6, value: 'lebanese' },
  { weight: 6, value: 'indian' },
  { weight: 5, value: 'vietnamese' },
  { weight: 4, value: 'thai' },
  { weight: 3, value: 'greek' },
  { weight: 3, value: 'mexican' },
  { weight: 10, value: undefined }
];

type Fakers = {
  readonly faker: Faker;
  readonly cuisines: Faker;
  readonly reach: Faker;
  readonly tags: Faker;
  readonly hours: Faker;
};

const idOf = (zone: FakeZone, index: number): string => `${zone.id}-${String(index + 1).padStart(ID_DIGITS, '0')}`;

const addressOf = (faker: Faker, zone: FakeZone): FakePostalAddress => ({
  houseNumber: String(faker.number.int({ min: 1, max: HIGHEST_NUMBER })),
  street: faker.location.street(),
  postalCode: faker.helpers.arrayElement(zone.postcodes),
  addressLocality: zone.city,
  addressCountry: zone.country
});

const cuisineOf = (faker: Faker, kind: GeneratedKind): Pick<FakePlace, 'cuisine'> => {
  const cuisine = kind === 'restaurant' ? faker.helpers.weightedArrayElement(CUISINE_WEIGHTS) : undefined;
  return cuisine === undefined ? {} : { cuisine };
};

const fameOf = (faker: Faker): number =>
  faker.datatype.boolean({ probability: FAMOUS_SHARE }) ? faker.number.int({ min: 1, max: MOST_FAME }) : 0;

const tagsOf = (fakers: Fakers, kind: GeneratedKind): Pick<FakePlace, 'tags'> => {
  const tags = { ...fakeTags(fakers.tags, { kind }).tags, ...fakeHours(fakers.hours, { kind }) };
  return Object.keys(tags).length === 0 ? {} : { tags };
};

const placeOf =
  (fakers: Fakers, zone: FakeZone) =>
  (kind: GeneratedKind, index: number): FakePlace => {
    const { faker, cuisines, reach } = fakers;
    const name = placeNameOf(kind, { firstName: faker.person.firstName(), lastName: faker.person.lastName() });
    return {
      id: idOf(zone, index),
      name,
      kind,
      ...cuisineOf(cuisines, kind),
      address: addressOf(faker, zone),
      ...fakeReach(reach, { name, kind }),
      ...tagsOf(fakers, kind),
      coordinates: {
        longitude: faker.location.longitude({ min: zone.bounds.west, max: zone.bounds.east, precision: PRECISION }),
        latitude: faker.location.latitude({ min: zone.bounds.south, max: zone.bounds.north, precision: PRECISION })
      },
      fame: fameOf(faker)
    };
  };

const fakersOf = (
  zone: FakeZone,
  seeds: { readonly places: number; readonly reach: number; readonly tags: number; readonly hours: number }
): Fakers => ({
  faker: new Faker({ locale: [...zone.locale], seed: seeds.places }),
  cuisines: new Faker({ locale: [...zone.locale], seed: CUISINE_SEED }),
  reach: new Faker({ locale: [...zone.locale], seed: seeds.reach }),
  tags: new Faker({ locale: [...zone.locale], seed: seeds.tags }),
  hours: new Faker({ locale: [...zone.locale], seed: seeds.hours })
});

const generatedPlaces = (zone: FakeZone, count: number): readonly FakePlace[] => {
  const fakers = fakersOf(zone, { places: SEED, reach: REACH_SEED, tags: TAGS_SEED, hours: HOURS_SEED });
  const place = placeOf(fakers, zone);
  return Array.from({ length: count }, (_, index) => place(fakers.faker.helpers.weightedArrayElement(KIND_WEIGHTS), index));
};

const addedPlaces = (zone: FakeZone, firstIndex: number): readonly FakePlace[] => {
  const place = placeOf(fakersOf(zone, ADDED_SEEDS), zone);
  return ADDED_KINDS.flatMap((kind, rank) =>
    Array.from({ length: PLACES_PER_ADDED_KIND }, (_, index) => place(kind, firstIndex + rank * PLACES_PER_ADDED_KIND + index))
  );
};

export { addedPlaces, generatedPlaces };
