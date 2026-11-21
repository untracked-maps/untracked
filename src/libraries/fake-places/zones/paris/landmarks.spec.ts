import { describe, expect, it } from 'vitest';
import { landmarks } from './landmarks';
import LANDMARKS_FILE from './landmarks.json' with { type: 'json' };

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

  it('have each their own id', () => {
    expect(new Set(landmarks().map(({ id }) => id)).size).toBe(LANDMARKS_FILE.length);
  });
});
