import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';

const BORDEAUX: FakeZone = {
  id: 'fake-bordeaux',
  city: 'Bordeaux',
  country: 'FR',
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

const tagsOf = ({ tags }: FakePlace): readonly (readonly [string, string])[] => Object.entries(tags ?? {});

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

  it('give a terrace to many cafés', () => {
    expect(shareTagged(ofKinds('cafe'), 'outdoor_seating')).toBeGreaterThan(0.25);
  });

  it('give a terrace only where one eats or drinks', () => {
    expect(
      PLACES.filter(
        ({ kind, tags }) => tags?.['outdoor_seating'] !== undefined && !['restaurant', 'cafe', 'bar'].includes(kind)
      )
    ).toEqual([]);
  });

  it('give no tag to schools, car parks nor post offices', () => {
    expect(ofKinds('school', 'parking', 'post-office').filter(({ tags }) => tags !== undefined)).toEqual([]);
  });

  it('give no dish to a place where one does not eat', () => {
    expect(
      PLACES.filter(
        ({ kind, tags }) => tags?.['diet:vegetarian'] !== undefined && !['restaurant', 'cafe', 'bakery'].includes(kind)
      )
    ).toEqual([]);
  });

  it('leave some places without any', () => {
    expect(PLACES.filter(({ tags }) => tags === undefined).length / PLACES.length).toBeGreaterThan(0.25);
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
