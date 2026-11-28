import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { addedPlaces, generatedPlaces } from './generated-places';

const NANTES: FakeZone = {
  id: 'fake-nantes',
  city: 'Nantes',
  country: 'FR',
  region: 'Pays de la Loire',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  postcodes: ['44000', '44100', '44200', '44300'],
  bounds: { west: -1.62, south: 47.18, east: -1.48, north: 47.26 },
  districts: [],
  landmarks: [],
  beyond: []
};

const PLACES: readonly FakePlace[] = [...generatedPlaces(NANTES, 1200), ...addedPlaces(NANTES, 1200)];

const A_DAY = /^\d{4}-\d{2}-\d{2}$/u;

const TWO_YEARS_BEFORE_NOVEMBER_2026 = '2024-11-26';

const tagOf =
  (key: string) =>
  ({ tags }: FakePlace): string | undefined =>
    tags?.[key];

const checkOf = (place: FakePlace): string | undefined =>
  tagOf('check_date')(place) ?? tagOf('check_date:opening_hours')(place);

const checks = (): readonly string[] => PLACES.map(checkOf).filter((value): value is string => value !== undefined);

const shareOf = (count: number): number => count / PLACES.length;

const valuesOf = (key: string, places: readonly FakePlace[] = PLACES): readonly string[] =>
  [...new Set(places.map(tagOf(key)).filter((value): value is string => value !== undefined))].toSorted((one, other) =>
    one.localeCompare(other)
  );

const ofKinds = (...kinds: readonly FakePlace['kind'][]): readonly FakePlace[] =>
  PLACES.filter(({ kind }) => kinds.includes(kind));

describe('the check date of generated places', () => {
  it('is given to some places', () => {
    expect(shareOf(checks().length)).toBeGreaterThan(0.15);
  });

  it('is not given to most places, to keep the places file light', () => {
    expect(shareOf(checks().length)).toBeLessThan(0.25);
  });

  it('is written as OpenStreetMap writes a day', () => {
    expect(checks().filter((value) => !A_DAY.test(value))).toEqual([]);
  });

  it('is older than two years for some places', () => {
    expect(checks().filter((value) => value < TWO_YEARS_BEFORE_NOVEMBER_2026).length / checks().length).toBeGreaterThan(0.15);
  });

  it('is recent for most places', () => {
    expect(checks().filter((value) => value >= '2025-01-01').length / checks().length).toBeGreaterThan(0.65);
  });

  it('never comes after the end of October 2026', () => {
    expect(checks().filter((value) => value > '2026-10-31')).toEqual([]);
  });

  it('never comes before 2019', () => {
    expect(checks().filter((value) => value < '2019-01-01')).toEqual([]);
  });

  it('is sometimes that of the opening hours only', () => {
    expect(shareOf(PLACES.filter((place) => tagOf('check_date:opening_hours')(place) !== undefined).length)).toBeGreaterThan(
      0.01
    );
  });

  it('is rarely that of the opening hours only', () => {
    expect(
      PLACES.filter((place) => tagOf('check_date:opening_hours')(place) !== undefined).length / checks().length
    ).toBeLessThan(0.2);
  });

  it('is never that of the opening hours of a park', () => {
    expect(ofKinds('park').filter((place) => tagOf('check_date:opening_hours')(place) !== undefined)).toEqual([]);
  });
});

describe('the access of generated places', () => {
  it('gives a wheelchair access to some places', () => {
    expect(shareOf(PLACES.filter((place) => tagOf('wheelchair')(place) !== undefined).length)).toBeGreaterThan(0.1);
  });

  it('leaves most places without a wheelchair access', () => {
    expect(shareOf(PLACES.filter((place) => tagOf('wheelchair')(place) !== undefined).length)).toBeLessThan(0.2);
  });

  it('gives a full, partial or no wheelchair access', () => {
    expect(valuesOf('wheelchair')).toEqual(['limited', 'no', 'yes']);
  });

  it('makes most museums charge their entrance', () => {
    expect(valuesOf('fee', ofKinds('museum'))).toEqual(['no', 'yes']);
  });

  it('keeps parks and libraries free', () => {
    expect(valuesOf('fee', ofKinds('park', 'library'))).toEqual(['no']);
  });

  it('makes swimming pools charge their entrance', () => {
    expect(valuesOf('fee', ofKinds('swimming-pool'))).toEqual(['yes']);
  });

  it('gives no entrance fee to shops', () => {
    expect(valuesOf('fee', ofKinds('bakery', 'restaurant', 'florist'))).toEqual([]);
  });

  it('tells the entrance fee of most museums, parks, libraries and swimming pools', () => {
    const places = ofKinds('museum', 'park', 'library', 'swimming-pool');
    expect(places.filter((place) => tagOf('fee')(place) !== undefined).length / places.length).toBeGreaterThan(0.6);
  });

  it('leaves some parks without an entrance fee', () => {
    expect(ofKinds('park').filter((place) => tagOf('fee')(place) === undefined).length).toBeGreaterThan(0);
  });
});
