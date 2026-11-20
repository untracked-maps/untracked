import { describe, expect, it } from 'vitest';
import type { GeneratedKind } from './fake-place';
import { placeNameOf } from './place-names';

const NAMES: readonly (readonly [GeneratedKind, string])[] = [
  ['restaurant', 'Chez Camille'],
  ['cafe', 'Café Durand'],
  ['bar', 'Le Comptoir Durand'],
  ['bakery', 'Boulangerie Durand'],
  ['pharmacy', 'Pharmacie Durand'],
  ['supermarket', 'Supérette Durand'],
  ['hairdresser', 'Salon Camille'],
  ['beauty-salon', 'Institut Camille'],
  ['florist', 'Fleurs de Camille'],
  ['bookshop', 'Librairie Durand'],
  ['hotel', 'Hôtel Durand'],
  ['school', 'École Camille Durand'],
  ['parking', 'Parking Durand'],
  ['park', 'Square Camille Durand'],
  ['museum', 'Musée Camille Durand'],
  ['cinema', 'Cinéma Durand'],
  ['library', 'Bibliothèque Camille Durand'],
  ['post-office', 'La Poste Durand'],
  ['hospital', 'Hôpital Camille Durand'],
  ['theatre', 'Théâtre Durand']
];

describe('names of generated places', () => {
  it.each(NAMES)('name a place of kind %s after a person, as "%s"', (kind, name) => {
    expect(placeNameOf(kind, { firstName: 'Camille', lastName: 'Durand' })).toBe(name);
  });
});
