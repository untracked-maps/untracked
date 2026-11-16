import { describe, expect, it } from 'vitest';
import type { Place } from '../../../domain/place';
import { viewOfChosenPlace } from './chosen-place';

const LOUVRE: Place = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: 'Rue de Rivoli, 75001 Paris',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 },
  fame: 98
};

describe('view of a chosen place', () => {
  it('is centred on the place', () => {
    expect(viewOfChosenPlace(LOUVRE, 13).center).toEqual({ longitude: 2.337_64, latitude: 48.860_61 });
  });

  it('zooms in to the street when the map is further out', () => {
    expect(viewOfChosenPlace(LOUVRE, 13).zoom).toBe(16.5);
  });

  it('keeps a closer zoom', () => {
    expect(viewOfChosenPlace(LOUVRE, 18).zoom).toBe(18);
  });

  it('shows the whole of an arrondissement, however close the map is', () => {
    expect(viewOfChosenPlace({ ...LOUVRE, kind: 'district' }, 18).zoom).toBe(14);
  });
});
