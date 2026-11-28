import { describe, expect, it } from 'vitest';
import { beyond } from './beyond';
import { PARIS } from './paris';

const isInParis = ({ coordinates: { longitude, latitude } }: ReturnType<typeof beyond>[number]): boolean =>
  longitude >= PARIS.bounds.west &&
  longitude <= PARIS.bounds.east &&
  latitude >= PARIS.bounds.south &&
  latitude <= PARIS.bounds.north;

describe('the places beyond the fake Paris', () => {
  it('are two', () => {
    expect(beyond()).toHaveLength(2);
  });

  it('all lie outside the box of Paris', () => {
    expect(beyond().filter(isInParis)).toEqual([]);
  });

  it('hold no station', () => {
    expect(beyond().filter(({ kind }) => kind === 'station')).toEqual([]);
  });

  it('hold no address', () => {
    expect(beyond().filter((place) => 'address' in place)).toEqual([]);
  });
});
