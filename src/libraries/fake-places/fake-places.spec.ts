import { describe, expect, it } from 'vitest';
import { fakePlaces } from './fake-places';
import type { FakeZone } from './fake-zone';
import { PARIS } from './zones/paris/paris';

const ZONE: FakeZone = { ...PARIS, id: 'fake-zone' };

describe('fake places', () => {
  it('start with the landmarks of their zone', () => {
    expect(fakePlaces(ZONE)[0]?.id).toBe(PARIS.landmarks[0]?.id);
  });

  it('hold two thousand generated places after the landmarks', () => {
    expect(fakePlaces(ZONE).filter(({ id }) => id.startsWith('fake-zone-'))).toHaveLength(2000);
  });

  it('give each landmark its family', () => {
    expect(fakePlaces(ZONE)[0]?.family).toBe('sight');
  });

  it('give each generated place its rank', () => {
    expect(fakePlaces(ZONE).filter(({ rank }) => rank >= 0 && rank < 200)).toHaveLength(fakePlaces(ZONE).length);
  });

  it('show each place from a zoom between 11.5 and 16.5, by steps of 0.25', () => {
    expect(
      fakePlaces(ZONE).filter(({ minzoom }) => minzoom < 11.5 || minzoom > 16.5 || !Number.isInteger(minzoom * 4))
    ).toEqual([]);
  });

  it('give each place its own id', () => {
    expect(new Set(fakePlaces(ZONE).map(({ id }) => id)).size).toBe(fakePlaces(ZONE).length);
  });
});
