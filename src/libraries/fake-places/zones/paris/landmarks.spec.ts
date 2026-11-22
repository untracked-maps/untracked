import { describe, expect, it } from 'vitest';
import type { FakePlace } from '../../fake-place';
import { landmarks } from './landmarks';
import LANDMARKS_FILE from './landmarks.json' with { type: 'json' };

const FACEBOOK = 'https://facebook.example';

const FICTION_PHONE = /^\+33 1 99 00 \d{2} \d{2}$/u;

const EXAMPLE_LINK = /^https:\/\/[a-z0-9.-]+\.example(?:\/[A-Za-z0-9-]*)?$/u;

const linksOf = ({ website, menu, instagram, facebook }: FakePlace): readonly string[] =>
  [website, menu, instagram, facebook].flatMap((link) => link ?? []);

describe('landmarks', () => {
  it('keep every landmark of the file', () => {
    expect(landmarks()).toHaveLength(LANDMARKS_FILE.length);
  });

  it('are the places written by hand', () => {
    expect(landmarks()[0]).toEqual({
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
