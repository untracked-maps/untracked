import { base, fr } from '@faker-js/faker';
import OpeningHours from 'opening_hours';
import { describe, expect, it } from 'vitest';
import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { addedPlaces, generatedPlaces } from './generated-places';
import { PARIS } from './zones/paris/paris';

const LYON: FakeZone = {
  id: 'fake-lyon',
  city: 'Lyon',
  country: 'FR',
  region: 'Auvergne-Rhône-Alpes',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  postcodes: ['69001', '69002', '69003'],
  bounds: { west: 4.79, south: 45.71, east: 4.9, north: 45.8 },
  districts: [],
  landmarks: [],
  beyond: []
};

const PLACES = generatedPlaces(LYON, 800);

const IN_FRANCE = { lat: 45.76, lon: 4.84, address: { ['country_code' as const]: 'fr', state: '' } };

const hoursOf = ({ tags }: FakePlace): string | undefined => tags?.['opening_hours'];

const isReadable = (value: string): boolean => {
  try {
    return new OpeningHours(value, IN_FRANCE).getState(new Date(2026, 10, 24, 12)) !== undefined;
  } catch {
    return false;
  }
};

const ofKinds = (...kinds: readonly FakePlace['kind'][]): readonly FakePlace[] =>
  PLACES.filter(({ kind }) => kinds.includes(kind));

const shareWithHours = (places: readonly FakePlace[]): number =>
  places.filter((place) => hoursOf(place) !== undefined).length / places.length;

describe('the opening hours of generated places', () => {
  it('are given to most shops, cafés and restaurants', () => {
    expect(shareWithHours(ofKinds('restaurant', 'cafe', 'bakery', 'florist'))).toBeGreaterThan(0.6);
  });

  it('are not given to every one of them', () => {
    expect(shareWithHours(ofKinds('restaurant', 'cafe', 'bakery', 'florist'))).toBeLessThan(0.9);
  });

  it('are never given to schools, car parks, parks nor hospitals', () => {
    expect(ofKinds('school', 'parking', 'park', 'hospital').filter((place) => hoursOf(place) !== undefined)).toEqual([]);
  });

  it('are values that OpenStreetMap can read, but a few', () => {
    expect(
      PLACES.map(hoursOf)
        .filter((value): value is string => value !== undefined)
        .filter((value) => !isReadable(value)).length
    ).toBeLessThan(3);
  });
});

const IN_PARIS: readonly FakePlace[] = [...generatedPlaces(PARIS, 2000), ...addedPlaces(PARIS, 2000)];

const WEEKS: readonly string[] = [
  '24/7',
  'Mo-Fr 06:00-23:00; Sa,Su 08:00-20:00',
  'Mo-Fr 07:30-19:00',
  'Mo-Fr 08:30-17:00; Th 08:30-19:30; PH off',
  'Mo-Fr 08:30-19:30; Sa 09:00-19:00',
  'Mo-Fr 09:00-12:00,14:00-19:00',
  'Mo-Fr 09:00-18:00 et Sa matin',
  'Mo-Fr 09:00-19:00; Sa 09:00-12:30; PH off',
  'Mo-Sa 07:00-20:00; Su 08:00-19:00',
  'Mo-Sa 07:30-20:00',
  'Mo-Sa 08:30-21:00; Su 09:00-13:00',
  'Mo-Sa 09:00-20:00',
  'Mo-Sa 10:00-19:00',
  'Mo-Sa 10:00-19:00; PH off',
  'Mo-Sa 10:00-19:00; Su unknown',
  'Mo-Sa 12:00-14:30,19:00-22:30',
  'Mo-Su 07:00-02:00',
  'Mo-Su 08:00-22:00',
  'Mo-Su 10:00-23:30',
  'Mo-Su 11:00-23:00',
  'Mo-Su 12:00-23:00',
  'Mo-Su 12:00-23:30',
  'Mo-Su 17:00-02:00',
  'Tu-Fr 09:00-12:30,13:45-17:30; Sa 09:00-12:30; PH off',
  'Tu-Sa 07:00-20:00; Su 07:00-13:30',
  'Tu-Sa 09:30-13:00,14:30-19:00',
  'Tu-Sa 10:00-19:00',
  'Tu-Sa 10:00-19:00; PH off',
  'Tu-Sa 12:00-14:00,19:30-23:00',
  'Tu-Sa 18:00-01:00',
  'Tu-Sa 19:00-23:30; Su 15:00-18:00',
  'Tu-Su 10:00-18:00; PH off',
  'Tu,Fr 07:00-13:30; Su 07:00-14:30',
  'Tu,Th 11:30-13:30,16:30-21:00; We 11:30-18:00; Sa,Su 09:00-18:00',
  'We-Mo 10:00-18:00',
  '9h-18h sauf dimanche'
];

describe('the opening hours of the fake places of Paris', () => {
  it('take the weeks written for them, each at least once', () => {
    expect(new Set(IN_PARIS.map(hoursOf).filter((value) => value !== undefined))).toEqual(new Set(WEEKS));
  });

  it.each(
    [
      'restaurant cafe bar bakery pharmacy supermarket hairdresser beauty-salon florist bookshop hotel museum',
      'cinema library post-office theatre fast-food ice-cream chocolate deli greengrocer cheese butcher wine',
      'clothes newsagent diy mobile-phone toys stationery music optician pet-shop laundry bicycle marketplace',
      'bank townhall doctor fitness-centre swimming-pool'
    ]
      .join(' ')
      .split(' ')
  )('are given to some places of kind %s', (kind) => {
    expect(IN_PARIS.filter((place) => place.kind === kind && hoursOf(place) !== undefined).length).toBeGreaterThan(0);
  });

  it('are badly written for three of them', () => {
    expect(
      generatedPlaces(PARIS, 2000)
        .map(hoursOf)
        .filter((value): value is string => value !== undefined)
        .filter((value) => !isReadable(value))
    ).toHaveLength(3);
  });

  it('are written by hand for the famous places', () => {
    expect(PARIS.landmarks.filter((place) => hoursOf(place) !== undefined)).toHaveLength(25);
  });

  it('are written readably for the famous places', () => {
    expect(
      PARIS.landmarks
        .map(hoursOf)
        .filter((value): value is string => value !== undefined)
        .filter((value) => !isReadable(value))
    ).toEqual([]);
  });
});
