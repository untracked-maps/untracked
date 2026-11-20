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

  it('give each place its own id', () => {
    expect(new Set(fakePlaces(ZONE).map(({ id }) => id)).size).toBe(fakePlaces(ZONE).length);
  });
});
