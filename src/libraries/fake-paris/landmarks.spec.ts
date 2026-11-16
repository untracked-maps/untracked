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
      address: '5 avenue Anatole France, 75007 Paris',
      coordinates: { longitude: 2.294_48, latitude: 48.858_26 },
      fame: 99
    });
  });

  it('have each their own id', () => {
    expect(new Set(landmarks().map(({ id }) => id)).size).toBe(LANDMARKS_FILE.length);
  });
});
