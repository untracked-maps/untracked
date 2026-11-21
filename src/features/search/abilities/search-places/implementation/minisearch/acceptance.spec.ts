import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Place } from '../../../../domain/place';
import { miniSearchIndex } from './minisearch-index';

const CENTRE_OF_PARIS = { longitude: 2.3522, latitude: 48.8566 };

const place = (id: string, name: string, fame: number, [longitude, latitude]: readonly [number, number]): Place => ({
  id,
  name,
  kind: 'attraction',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude, latitude },
  fame
});

const PLACES: readonly Place[] = [
  place('tour-eiffel', 'Tour Eiffel', 99, [2.294_48, 48.858_26]),
  place('musee-du-louvre', 'Musée du Louvre', 98, [2.337_64, 48.860_61]),
  place('notre-dame-de-paris', 'Cathédrale Notre-Dame de Paris', 97, [2.349_92, 48.852_97]),
  place('arc-de-triomphe', 'Arc de Triomphe', 93, [2.295_04, 48.8738]),
  place('sacre-coeur', 'Basilique du Sacré-Cœur', 92, [2.343_06, 48.886_71]),
  place('musee-d-orsay', "Musée d'Orsay", 90, [2.326_56, 48.86]),
  place('palais-de-l-elysee', "Palais de l'Élysée", 88, [2.316_59, 48.870_41]),
  place('centre-pompidou', 'Centre Pompidou', 88, [2.352_22, 48.860_64]),
  place('opera-garnier', 'Opéra Garnier', 86, [2.331_65, 48.871_97]),
  place('grand-palais', 'Grand Palais', 85, [2.312_48, 48.866_13]),
  place('pantheon', 'Panthéon', 85, [2.346_19, 48.846_22]),
  place('invalides', 'Hôtel des Invalides', 84, [2.312_53, 48.856_63]),
  place('jardin-du-luxembourg', 'Jardin du Luxembourg', 84, [2.337_16, 48.846_22]),
  place('gare-du-nord', 'Gare du Nord', 82, [2.355_33, 48.880_94]),
  place('pere-lachaise', 'Cimetière du Père-Lachaise', 82, [2.393_33, 48.861_39]),
  place('gare-de-lyon', 'Gare de Lyon', 80, [2.373_01, 48.844_34]),
  place('sainte-chapelle', 'Sainte-Chapelle', 80, [2.345_03, 48.855_44]),
  place('moulin-rouge', 'Moulin Rouge', 80, [2.332_33, 48.884_11]),
  place('gare-montparnasse', 'Gare Montparnasse', 78, [2.321_22, 48.841_22]),
  place('gare-saint-lazare', 'Gare Saint-Lazare', 78, [2.325_28, 48.876_31]),
  place('galeries-lafayette', 'Galeries Lafayette', 78, [2.331_99, 48.873_57]),
  place('gare-de-l-est', "Gare de l'Est", 75, [2.359_04, 48.876_75]),
  place('buttes-chaumont', 'Parc des Buttes-Chaumont', 75, [2.382_78, 48.880_94]),
  place('chatelet-les-halles', 'Châtelet-Les Halles', 72, [2.346_98, 48.861_97]),
  place('musee-rodin', 'Musée Rodin', 72, [2.315_86, 48.855_31]),
  place('gare-d-austerlitz', "Gare d'Austerlitz", 70, [2.365_47, 48.841_99]),
  place('cafe-de-flore', 'Café de Flore', 70, [2.332_63, 48.854_04]),
  place('bibliotheque-francois-mitterrand', 'Bibliothèque François-Mitterrand', 70, [2.375_94, 48.833_59]),
  place('elysee-beaute', 'Élysée Beauté', 0, [2.353_56, 48.857_99]),
  place('parking-tour-eiffel', 'Parking Tour Eiffel', 0, [2.293_12, 48.859_39]),
  place('hotel-du-louvre', 'Hôtel du Louvre', 12, [2.335_98, 48.863_75]),
  place('pharmacie-gare-de-lyon', 'Pharmacie de la Gare de Lyon', 0, [2.371_92, 48.845_34]),
  place('boulangerie-du-pantheon', 'Boulangerie du Panthéon', 0, [2.344_88, 48.846_77]),
  place('notre-dame-de-lorette', 'Église Notre-Dame-de-Lorette', 30, [2.338_47, 48.876_19]),
  place('orsay-fleurs', 'Orsay Fleurs', 0, [2.331_02, 48.858_17]),
  place('grand-cafe-du-palais', 'Grand Café du Palais', 0, [2.346_22, 48.856_19]),
  place('boulangerie-garcia', 'Boulangerie Garcia', 0, [2.3601, 48.8402]),
  place('cafe-rivoli', 'Café Rivoli', 0, [2.3412, 48.8597]),
  place('pharmacie-centrale', 'Pharmacie Centrale', 0, [2.353, 48.857]),
  place('hotel-lyon-bastille', 'Hôtel Lyon Bastille', 3, [2.3712, 48.8479]),
  place('bar-de-l-est', "Bar de l'Est", 0, [2.3601, 48.8771]),
  place('librairie-saint-lazare', 'Librairie Saint-Lazare', 0, [2.3268, 48.8752])
];

const findPlaces = await firstValueFrom(miniSearchIndex(PLACES));

const firstFound = (query: string): string | undefined => findPlaces(query, CENTRE_OF_PARIS)[0]?.id;

const ACCEPTANCE: readonly (readonly [string, string])[] = [
  ['tour eiffel', 'tour-eiffel'],
  ['tour eifel', 'tour-eiffel'],
  ['tour eiffell', 'tour-eiffel'],
  ['tuor eiffel', 'tour-eiffel'],
  ['eiffel', 'tour-eiffel'],
  ['louvre', 'musee-du-louvre'],
  ['louvres', 'musee-du-louvre'],
  ['lovure', 'musee-du-louvre'],
  ['musée du louvre', 'musee-du-louvre'],
  ["musée d'orsay", 'musee-d-orsay'],
  ['musee dorsay', 'musee-d-orsay'],
  ['musée d orsay', 'musee-d-orsay'],
  ['orsay', 'musee-d-orsay'],
  ['orsé', 'musee-d-orsay'],
  ['grand palais', 'grand-palais'],
  ['grand palai', 'grand-palais'],
  ['grnd palai', 'grand-palais'],
  ['élysée', 'palais-de-l-elysee'],
  ['elysee', 'palais-de-l-elysee'],
  ['elisée', 'palais-de-l-elysee'],
  ['sacré-cœur', 'sacre-coeur'],
  ['sacre coeur', 'sacre-coeur'],
  ['sacré coeur', 'sacre-coeur'],
  ['notre-dame', 'notre-dame-de-paris'],
  ['notre dame de paris', 'notre-dame-de-paris'],
  ['panthéon', 'pantheon'],
  ['pantheon', 'pantheon'],
  ['panteon', 'pantheon'],
  ['arc de triomphe', 'arc-de-triomphe'],
  ['arc de triomf', 'arc-de-triomphe'],
  ['opera garnier', 'opera-garnier'],
  ['invalides', 'invalides'],
  ['invalid', 'invalides'],
  ['pompidou', 'centre-pompidou'],
  ['luxembourg', 'jardin-du-luxembourg'],
  ['luxembourg jardin', 'jardin-du-luxembourg'],
  ['buttes chaumont', 'buttes-chaumont'],
  ['pere lachaise', 'pere-lachaise'],
  ['gare de lyon', 'gare-de-lyon'],
  ['gare de lyon paris', 'gare-de-lyon'],
  ['gare de lyno', 'gare-de-lyon'],
  ['gare du nord', 'gare-du-nord'],
  ["gare de l'est", 'gare-de-l-est'],
  ['montparnasse', 'gare-montparnasse'],
  ['saint-lazare', 'gare-saint-lazare'],
  ['gare saint lazare', 'gare-saint-lazare'],
  ['austerlitz', 'gare-d-austerlitz'],
  ['châtelet', 'chatelet-les-halles'],
  ['chatelet les halles', 'chatelet-les-halles'],
  ['cafe de flore', 'cafe-de-flore'],
  ['galeries lafayette', 'galeries-lafayette'],
  ['moulin rouge', 'moulin-rouge'],
  ['sainte chapelle', 'sainte-chapelle'],
  ['musée rodin', 'musee-rodin'],
  ['bibliotheque francois mitterrand', 'bibliotheque-francois-mitterrand'],
  ['tour eif', 'tour-eiffel'],
  ['sacre', 'sacre-coeur'],
  ['parking tour eiffel', 'parking-tour-eiffel'],
  ['elysee beaute', 'elysee-beaute'],
  ['pharmacie de la gare de lyon', 'pharmacie-gare-de-lyon']
];

describe('acceptance of the search by name', () => {
  it.each(ACCEPTANCE)('finds first, for "%s", the place %s', (query, id) => {
    expect(firstFound(query)).toBe(id);
  });
});
