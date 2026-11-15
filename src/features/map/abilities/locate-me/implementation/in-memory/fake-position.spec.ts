import { describe, expect, it } from 'vitest';
import { fakePosition } from './fake-position';

const EARTH_RADIUS_IN_KILOMETRES = 6371;
const CENTRE_OF_PARIS = { longitude: 2.3522, latitude: 48.8566 };

const radians = (degrees: number): number => (degrees * Math.PI) / 180;

const kilometresFromParis = ({ longitude, latitude }: { longitude: number; latitude: number }): number =>
  EARTH_RADIUS_IN_KILOMETRES *
  Math.hypot(
    radians(longitude - CENTRE_OF_PARIS.longitude) * Math.cos(radians(CENTRE_OF_PARIS.latitude)),
    radians(latitude - CENTRE_OF_PARIS.latitude)
  );

describe('fake position', () => {
  it('places the visitor within 3 km of the centre of Paris', () => {
    expect(kilometresFromParis(fakePosition().position)).toBeLessThan(3);
  });

  it('places the visitor at the same spot at every build', () => {
    expect(fakePosition()).toEqual({
      kind: 'located',
      position: { longitude: 2.344_537_951_705_433_4, latitude: 48.858_727_899_455_6 }
    });
  });
});
