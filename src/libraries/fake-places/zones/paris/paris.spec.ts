import { describe, expect, it } from 'vitest';
import { fakeAddresses } from '../../fake-addresses';
import { fakePlaces } from '../../fake-places';
import { generatedPlaces } from '../../generated-places';
import { PARIS } from './paris';

const FACEBOOK = 'https://facebook.example';

describe('the fake Paris', () => {
  it('generates the same first place at every build', () => {
    expect(generatedPlaces(PARIS, 1)).toEqual([
      {
        id: 'fake-paris-0001',
        name: 'Pharmacie Vincent',
        kind: 'pharmacy',
        address: {
          houseNumber: '44',
          street: 'Passage Delesseux',
          postalCode: '75015',
          addressLocality: 'Paris',
          addressCountry: 'FR'
        },
        website: 'https://www.pharmacie-vincent.example',
        facebook: `${FACEBOOK}/PharmacieVincent`,
        tags: Object.fromEntries([['opening_hours', 'Mo-Fr 08:30-19:30; Sa 09:00-19:00']]),
        coordinates: { longitude: 2.325_07, latitude: 48.850_07 },
        fame: 0
      }
    ]);
  });

  it('starts with its landmarks', () => {
    expect(fakePlaces(PARIS)[0]?.id).toBe('tour-eiffel');
  });

  it('holds its twenty arrondissements', () => {
    expect(PARIS.districts).toHaveLength(20);
  });

  it('gives an arrondissement its name, postcode and centre', () => {
    expect(fakeAddresses(PARIS).at(-9)).toEqual({
      kind: 'district',
      name: 'Paris 12e Arrondissement',
      postalCode: '75012',
      addressLocality: 'Paris',
      addressCountry: 'FR',
      coordinates: { longitude: 2.421_33, latitude: 48.834_97 }
    });
  });

  it('has the twenty postcodes of Paris', () => {
    expect(PARIS.postcodes).toEqual(PARIS.districts.map(({ postcode }) => postcode));
  });
});
