import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { fakeParis } from '#libraries/fake-paris/fake-paris';
import { miniSearchIndex } from './minisearch-index';

const CENTRE_OF_PARIS = { longitude: 2.3522, latitude: 48.8566 };

const findPlaces = await firstValueFrom(miniSearchIndex(fakeParis()));

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

describe('acceptance of the search by name on the fake Paris', () => {
  it.each(ACCEPTANCE)('finds first, for "%s", the place %s', (query, id) => {
    expect(firstFound(query)).toBe(id);
  });
});
