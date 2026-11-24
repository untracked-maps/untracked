import { describe, expect, it } from 'vitest';
import type { FakePlace } from '../../fake-place';
import { landmarks } from './landmarks';
import LANDMARKS_FILE from './landmarks.json' with { type: 'json' };

const FACEBOOK = 'https://facebook.example';

const FICTION_PHONE = /^\+33 1 99 00 \d{2} \d{2}$/u;

const EXAMPLE_LINK = /^https:\/\/[a-z0-9.-]+\.example(?:\/[A-Za-z0-9-]*)?$/u;

const TOLD = [
  'tour-eiffel',
  'musee-du-louvre',
  'notre-dame-de-paris',
  'arc-de-triomphe',
  'sacre-coeur',
  'musee-d-orsay',
  'palais-de-l-elysee',
  'centre-pompidou',
  'opera-garnier',
  'grand-palais',
  'pantheon',
  'invalides',
  'jardin-du-luxembourg',
  'pere-lachaise',
  'sainte-chapelle',
  'moulin-rouge',
  'galeries-lafayette',
  'buttes-chaumont',
  'musee-rodin',
  'cafe-de-flore',
  'bibliotheque-francois-mitterrand',
  'notre-dame-de-lorette'
];

const tagged = (key: string): readonly string[] =>
  landmarks().flatMap(({ id, tags }) => (tags?.[key] === undefined ? [] : [id]));

const tagsOf = (landmark: string): FakePlace['tags'] => landmarks().find(({ id }) => id === landmark)?.tags;

const linksOf = ({ website, menu, instagram, facebook }: FakePlace): readonly string[] =>
  [website, menu, instagram, facebook].flatMap((link) => link ?? []);

describe('landmarks', () => {
  it('keep every landmark of the file', () => {
    expect(landmarks()).toHaveLength(LANDMARKS_FILE.length);
  });

  it('are the places written by hand', () => {
    expect(landmarks()[0]).toMatchObject({
      id: 'tour-eiffel',
      name: 'Tour Eiffel',
      kind: 'attraction',
      address: {
        houseNumber: '5',
        street: 'avenue Anatole France',
        postalCode: '75007',
        addressLocality: 'Paris',
        addressCountry: 'FR'
      },
      phone: '+33 1 99 00 00 07',
      website: 'https://www.toureiffel.example',
      instagram: 'https://instagram.example/toureiffel',
      facebook: `${FACEBOOK}/TourEiffel`,
      tags: Object.fromEntries([
        ['heritage', '2'],
        ['heritage:operator', 'mhs'],
        ['payment:contactless', 'yes'],
        ['payment:cards', 'yes'],
        ['reservation', 'recommended'],
        ['toilets', 'yes'],
        ['toilets:wheelchair', 'yes'],
        ['man_made', 'tower']
      ]),
      coordinates: { longitude: 2.294_48, latitude: 48.858_26 },
      fame: 99
    });
  });

  it('may name a street without a house number', () => {
    expect(landmarks()[1]?.address).toEqual({
      street: 'Rue de Rivoli',
      postalCode: '75001',
      addressLocality: 'Paris',
      addressCountry: 'FR'
    });
  });

  it('may tell how to reach a place, written by hand', () => {
    expect(landmarks().find(({ id }) => id === 'cafe-de-flore')).toMatchObject({
      phone: '+33 1 99 00 01 72',
      website: 'https://cafe-de-flore.example',
      menu: 'https://cafe-de-flore.example/menu',
      instagram: 'https://instagram.example/cafedeflore'
    });
  });

  it('give a terrace to the Café de Flore', () => {
    expect(landmarks().find(({ id }) => id === 'cafe-de-flore')?.tags?.['outdoor_seating']).toBe('yes');
  });

  it('give nothing good to know to a station', () => {
    expect(landmarks().filter(({ kind, tags }) => kind === 'station' && tags !== undefined)).toEqual([]);
  });

  it('call only numbers of the Paris range kept for fiction', () => {
    expect(
      landmarks()
        .flatMap(({ phone }) => phone ?? [])
        .filter((phone) => !FICTION_PHONE.test(phone))
    ).toEqual([]);
  });

  it('link only to example addresses', () => {
    expect(
      landmarks()
        .flatMap(linksOf)
        .filter((link) => !EXAMPLE_LINK.test(link))
    ).toEqual([]);
  });

  it('have each their own id', () => {
    expect(new Set(landmarks().map(({ id }) => id)).size).toBe(LANDMARKS_FILE.length);
  });
});

describe('what the landmarks tell about themselves', () => {
  it('is a text in French for the famous places, and none for a station', () => {
    expect(tagged('description:fr')).toEqual(TOLD);
  });

  it('is a text in English for the same places', () => {
    expect(tagged('description:en')).toEqual(TOLD);
  });

  it('is a local name for two places', () => {
    expect(tagged('name')).toEqual(['centre-pompidou', 'opera-garnier']);
  });

  it('is the name of the Opéra Garnier on the spot', () => {
    expect(tagsOf('opera-garnier')?.['name']).toBe('Palais Garnier');
  });

  it('is a church that became a monument for the Panthéon', () => {
    expect(tagsOf('pantheon')).toMatchObject({ building: 'church', historic: 'monument', tourism: 'attraction' });
  });

  it('is a cathedral where people worship for Notre-Dame', () => {
    expect(tagsOf('notre-dame-de-paris')).toMatchObject({ amenity: 'place_of_worship', building: 'cathedral' });
  });
});
