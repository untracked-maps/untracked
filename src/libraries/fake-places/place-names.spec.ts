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
  ['theatre', 'Théâtre Durand'],
  ['fast-food', 'Snack Durand'],
  ['ice-cream', 'Glacier Durand'],
  ['chocolate', 'Chocolaterie Durand'],
  ['deli', 'Traiteur Durand'],
  ['nightclub', 'Le Durand Club'],
  ['marketplace', 'Marché Camille Durand'],
  ['greengrocer', 'Primeurs Durand'],
  ['cheese', 'Fromagerie Durand'],
  ['butcher', 'Boucherie Durand'],
  ['wine', 'Cave Durand'],
  ['clothes', 'Boutique Camille'],
  ['newsagent', 'Tabac Durand'],
  ['diy', 'Bricolage Durand'],
  ['mobile-phone', 'Mobile Durand'],
  ['toys', 'Jouets Durand'],
  ['stationery', 'Papeterie Durand'],
  ['music', 'Musique Durand'],
  ['atm', 'Distributeur Durand'],
  ['bank', 'Banque Durand'],
  ['optician', 'Optique Durand'],
  ['laundry', 'Laverie Durand'],
  ['townhall', 'Mairie annexe Camille Durand'],
  ['police', 'Commissariat Durand'],
  ['coworking', 'Cowork Durand'],
  ['doctor', 'Cabinet Camille Durand'],
  ['veterinary', 'Clinique vétérinaire Durand'],
  ['pet-shop', 'Animalerie Durand'],
  ['escape-game', 'Escape Durand'],
  ['playground', 'Aire de jeux Camille Durand'],
  ['fitness-centre', 'Salle Durand'],
  ['swimming-pool', 'Piscine Camille Durand'],
  ['cemetery', 'Cimetière Durand'],
  ['bicycle', 'Cycles Durand'],
  ['fuel', 'Station Durand'],
  ['charging-station', 'Borne Durand'],
  ['toilets', 'Toilettes Durand'],
  ['drinking-water', 'Fontaine Durand']
];

describe('names of generated places', () => {
  it.each(NAMES)('name a place of kind %s after a person, as "%s"', (kind, name) => {
    expect(placeNameOf(kind, { firstName: 'Camille', lastName: 'Durand' })).toBe(name);
  });
});
