import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import { PHOTO_FILES } from './fake-photos';
import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { addedPlaces, generatedPlaces } from './generated-places';

const LILLE: FakeZone = {
  id: 'fake-lille',
  city: 'Lille',
  country: 'FR',
  region: 'Hauts-de-France',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  postcodes: ['59000', '59160', '59260', '59777', '59800'],
  bounds: { west: 2.97, south: 50.6, east: 3.13, north: 50.67 },
  districts: [],
  landmarks: [],
  beyond: []
};

const PLACES: readonly FakePlace[] = [...generatedPlaces(LILLE, 1500), ...addedPlaces(LILLE, 1500)];

const KNOWN_FILES: ReadonlySet<string> = new Set(PHOTO_FILES.map((file) => `photos/${file}`));

const photosOf = ({ tags }: FakePlace): readonly string[] => tags?.['image']?.split(';') ?? [];

const withPhotos = (): readonly FakePlace[] => PLACES.filter((place) => photosOf(place).length > 0);

const shareWithPhotos = (): number => withPhotos().length / PLACES.length;

const counts = (): ReadonlySet<number> => new Set(withPhotos().map((place) => photosOf(place).length));

describe('the photos of generated places', () => {
  it('are given to about one place in three', () => {
    expect(shareWithPhotos()).toBeGreaterThan(0.28);
  });

  it('are not given to most places', () => {
    expect(shareWithPhotos()).toBeLessThan(0.38);
  });

  it('are one to six for a place', () => {
    expect([...counts()].toSorted((one, other) => one - other)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('are files the site serves', () => {
    expect(PLACES.flatMap(photosOf).filter((photo) => !KNOWN_FILES.has(photo))).toEqual([]);
  });

  it('are never twice the same photo in a place', () => {
    expect(withPhotos().filter((place) => new Set(photosOf(place)).size !== photosOf(place).length)).toEqual([]);
  });
});
