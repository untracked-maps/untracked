import { base, fr } from '@faker-js/faker';
import type { FakeZone } from '../../fake-zone';
import ARRONDISSEMENTS_FILE from './arrondissements.json' with { type: 'json' };
import { beyond } from './beyond';
import { landmarks } from './landmarks';

const PARIS: FakeZone = {
  id: 'fake-paris',
  city: 'Paris',
  country: 'FR',
  region: 'Île-de-France',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  bounds: { west: 2.22, south: 48.81, east: 2.47, north: 48.91 },
  postcodes: ARRONDISSEMENTS_FILE.map(({ postcode }) => postcode),
  landmarks: landmarks(),
  beyond: beyond(),
  districts: ARRONDISSEMENTS_FILE
};

export { PARIS };
