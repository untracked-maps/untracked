import { describe, expect, it } from 'vitest';
import { detailsFile, placesFile } from './place-files';
import type { FakePlaceOnMap } from './place-on-map';

const BASE: FakePlaceOnMap = {
  id: 'a-bakery',
  name: 'Une boulangerie',
  kind: 'bakery',
  address: { street: 'rue de la Paix', postalCode: '75002', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.33, latitude: 48.87 },
  fame: 12,
  minzoom: 15,
  rank: 187
};

const DETAILED: FakePlaceOnMap = {
  ...BASE,
  cuisine: 'french',
  family: 'bakery',
  phone: '+33 1 23 45 67 89',
  website: 'https://boulangerie.example',
  menu: 'https://boulangerie.example/menu',
  instagram: 'https://instagram.example/pain',
  facebook: 'https://facebook.example/pain',
  tags: { dog: 'yes' }
};

describe('the places file', () => {
  it('keeps what the map and the search read', () => {
    expect(placesFile([DETAILED])).toEqual([
      {
        id: 'a-bakery',
        name: 'Une boulangerie',
        kind: 'bakery',
        cuisine: 'french',
        family: 'bakery',
        address: BASE.address,
        coordinates: BASE.coordinates,
        fame: 12,
        minzoom: 15,
        rank: 187
      }
    ]);
  });

  it('leaves out the fields a place does not have', () => {
    expect(placesFile([BASE])).toEqual([
      {
        id: 'a-bakery',
        name: 'Une boulangerie',
        kind: 'bakery',
        address: BASE.address,
        coordinates: BASE.coordinates,
        fame: 12,
        minzoom: 15,
        rank: 187
      }
    ]);
  });
});

describe('the details file', () => {
  it('keeps what only the sheet reads, with the id of the place', () => {
    expect(detailsFile([DETAILED])).toEqual([
      {
        id: 'a-bakery',
        phone: '+33 1 23 45 67 89',
        website: 'https://boulangerie.example',
        menu: 'https://boulangerie.example/menu',
        instagram: 'https://instagram.example/pain',
        facebook: 'https://facebook.example/pain',
        tags: { dog: 'yes' }
      }
    ]);
  });

  it('leaves out a place without details', () => {
    expect(detailsFile([BASE])).toEqual([]);
  });
});
