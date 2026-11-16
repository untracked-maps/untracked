import { describe, expect, it } from 'vitest';
import { kilometresBetween } from './distance';
import type { Coordinates } from './place';

const HERE: Coordinates = { longitude: 2.35, latitude: 48.85 };

describe('kilometres between two points', () => {
  it('count 110.54 kilometres per degree northwards', () => {
    expect(kilometresBetween(HERE, { longitude: 2.35, latitude: 49.85 })).toBeCloseTo(110.54);
  });

  it('count the kilometres eastwards at the latitude of the first point', () => {
    expect(kilometresBetween(HERE, { longitude: 3.35, latitude: 48.85 })).toBeCloseTo(
      111.32 * Math.cos((48.85 * Math.PI) / 180)
    );
  });

  it('combine both directions', () => {
    expect(kilometresBetween(HERE, { longitude: 2.36, latitude: 48.86 })).toBeCloseTo(
      Math.hypot(1.1132 * Math.cos((48.85 * Math.PI) / 180), 1.1054)
    );
  });

  it('are none from a point to itself', () => {
    expect(kilometresBetween(HERE, HERE)).toBe(0);
  });
});
