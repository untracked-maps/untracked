import { base, fr } from '@faker-js/faker';
import type { FakeZone } from '../../fake-zone';
import ARRONDISSEMENTS_FILE from './arrondissements.json' with { type: 'json' };
import { landmarks } from './landmarks';

const PARIS: FakeZone = {
  id: 'fake-paris',
  city: 'Paris',
  country: 'FR',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  bounds: { west: 2.22, south: 48.81, east: 2.47, north: 48.91 },
  postcodes: ARRONDISSEMENTS_FILE.map(({ postcode }) => postcode),
  landmarks: landmarks(),
  districts: ARRONDISSEMENTS_FILE
};

export { PARIS };
