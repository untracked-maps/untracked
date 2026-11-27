import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';

const BORDEAUX: FakeZone = {
  id: 'fake-bordeaux',
  city: 'Bordeaux',
  country: 'FR',
  region: 'Nouvelle-Aquitaine',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  postcodes: ['33000', '33100', '33200', '33300', '33800'],
  bounds: { west: -0.64, south: 44.81, east: -0.53, north: 44.9 },
  districts: [],
  landmarks: []
};

const PLACES = generatedPlaces(BORDEAUX, 800);

const VALUES: Readonly<Record<string, readonly string[]>> = Object.fromEntries([
  ['payment:contactless', ['yes']],
  ['payment:cards', ['yes', 'no']],
  ['payment:cash', ['no']],
  ['payment:meal_voucher', ['yes']],
  ['outdoor_seating', ['yes']],
  ['diet:vegan', ['yes', 'only']],
  ['diet:vegetarian', ['yes', 'only']],
  ['diet:gluten_free', ['yes']],
  ['takeaway', ['yes', 'only']],
  ['delivery', ['yes']],
  ['reservation', ['required', 'recommended', 'yes', 'no']],
  ['internet_access', ['wlan']],
  ['internet_access:fee', ['no']],
  ['air_conditioning', ['yes']],
  ['toilets', ['yes']],
  ['toilets:wheelchair', ['yes']],
  ['changing_table', ['yes']],
  ['dog', ['yes', 'leashed', 'no']],
  ['self_service', ['yes']],
  ['second_hand', ['only']],
  ['organic', ['yes', 'only']]
]);

const NOT_GOOD_TO_KNOW: ReadonlySet<string> = new Set([
  'opening_hours',
  'check_date',
  'check_date:opening_hours',
  'wheelchair',
  'fee',
  'image'
]);

const tagsOf = ({ tags }: FakePlace): readonly (readonly [string, string])[] =>
  Object.entries(tags ?? {}).filter(([key]) => !NOT_GOOD_TO_KNOW.has(key));

const ofKinds = (...kinds: readonly FakePlace['kind'][]): readonly FakePlace[] =>
  PLACES.filter(({ kind }) => kinds.includes(kind));

const shareTagged = (places: readonly FakePlace[], key: string): number =>
  places.filter(({ tags }) => tags?.[key] !== undefined).length / places.length;

describe('the tags of generated places', () => {
  it('are values OpenStreetMap gives to what is good to know', () => {
    expect(
      PLACES.flatMap(tagsOf)
        .filter(([key, value]) => !(VALUES[key] ?? []).includes(value))
        .map((tag) => tag.join('='))
    ).toEqual([]);
  });

  it('use every value OpenStreetMap gives to what is good to know', () => {
    expect(new Set(PLACES.flatMap(tagsOf).map((tag) => tag.join('=')))).toEqual(
      new Set(Object.entries(VALUES).flatMap(([key, values]) => values.map((value) => `${key}=${value}`)))
    );
  });

  it('give a terrace only where one eats or drinks', () => {
    expect(
      PLACES.filter(
        ({ kind, tags }) => tags?.['outdoor_seating'] !== undefined && !['restaurant', 'cafe', 'bar'].includes(kind)
      )
    ).toEqual([]);
  });

  it('give nothing good to know to schools, car parks nor post offices', () => {
    expect(ofKinds('school', 'parking', 'post-office').flatMap(tagsOf)).toEqual([]);
  });

  it('give no dish to a place where one does not eat', () => {
    expect(
      PLACES.filter(
        ({ kind, tags }) => tags?.['diet:vegetarian'] !== undefined && !['restaurant', 'cafe', 'bakery'].includes(kind)
      )
    ).toEqual([]);
  });

  it('leave out an empty set of tags', () => {
    expect(PLACES.filter(({ tags }) => tags !== undefined && Object.keys(tags).length === 0)).toEqual([]);
  });

  it('say a vegan only place is vegetarian only too', () => {
    expect(PLACES.filter(({ tags }) => tags?.['diet:vegan'] === 'only' && tags['diet:vegetarian'] !== 'only')).toEqual([]);
  });

  it('say accessible toilets are toilets', () => {
    expect(PLACES.filter(({ tags }) => tags?.['toilets:wheelchair'] === 'yes' && tags['toilets'] !== 'yes')).toEqual([]);
  });
});

describe('the places given tags', () => {
  it('give a terrace to many cafés', () => {
    expect(shareTagged(ofKinds('cafe'), 'outdoor_seating')).toBeGreaterThan(0.25);
  });

  it('give a terrace to some restaurants and bars', () => {
    expect(shareTagged(ofKinds('restaurant', 'bar'), 'outdoor_seating')).toBeGreaterThan(0.2);
  });

  it('let some restaurants take contactless payment', () => {
    expect(shareTagged(ofKinds('restaurant'), 'payment:contactless')).toBeGreaterThan(0.1);
  });

  it('let some shops take contactless payment', () => {
    expect(shareTagged(ofKinds('florist', 'hairdresser', 'beauty-salon'), 'payment:contactless')).toBeGreaterThan(0.1);
  });

  it('take reservations at some restaurants', () => {
    expect(shareTagged(ofKinds('restaurant'), 'reservation')).toBeGreaterThan(0.2);
  });

  it('tell whether some bars take reservations', () => {
    expect(shareTagged(ofKinds('bar'), 'reservation')).toBeGreaterThan(0.05);
  });

  it('ask a reservation at some hairdressers and beauty salons', () => {
    expect(shareTagged(ofKinds('hairdresser', 'beauty-salon'), 'reservation')).toBeGreaterThan(0.2);
  });

  it('give toilets to some cinemas, theatres, museums and libraries', () => {
    expect(shareTagged(ofKinds('cinema', 'theatre', 'museum', 'library'), 'toilets')).toBeGreaterThan(0.1);
  });

  it('leave some places without anything good to know', () => {
    expect(PLACES.filter((place) => tagsOf(place).length === 0).length / PLACES.length).toBeGreaterThan(0.25);
  });
});
