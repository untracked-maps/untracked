import { SimpleFaker } from '@faker-js/faker';
import type { Located } from '../../domain/locate-me';

const SEED = 1789;

const CENTRE_OF_PARIS = { longitude: 2.3522, latitude: 48.8566 } as const;

const RADIUS_IN_KILOMETRES = 3;

const fakePosition = (): Located => {
  const [latitude, longitude] = new SimpleFaker({ seed: SEED }).location.nearbyGPSCoordinate({
    origin: [CENTRE_OF_PARIS.latitude, CENTRE_OF_PARIS.longitude],
    radius: RADIUS_IN_KILOMETRES,
    isMetric: true
  });
  return { kind: 'located', position: { longitude, latitude } };
};

export { fakePosition };
