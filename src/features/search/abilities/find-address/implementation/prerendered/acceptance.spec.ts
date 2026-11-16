import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { fakeAddresses } from '#libraries/fake-paris/fake-addresses';
import type { Found } from '../../../../domain/found';
import type { Coordinates, Place } from '../../../../domain/place';
import { withAddressesOf } from '../../domain/with-addresses';
import { prerenderedAddressBook } from './prerendered-address-book';

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const NORTH_EAST_OF_PARIS: Coordinates = { longitude: 2.45, latitude: 48.91 };

const SQUARE: Place = {
  id: 'fake-paris-0067',
  name: 'Square Thierry Martin',
  kind: 'park',
  address: "150 Quai de l'Abbaye, 75015 Paris",
  coordinates: CENTRE_OF_PARIS,
  fame: 0
};

const knownAddresses = await firstValueFrom(
  prerenderedAddressBook(() => Promise.resolve(Response.json(fakeAddresses())), '/data/addresses.json')()
);

const findFound = withAddressesOf(knownAddresses)((query) => (query.includes('martin') ? [SQUARE] : []));

const lineOf = ({ name, address }: Found): string => `${name}, ${address}`;

const firstFound = (query: string, reference: Coordinates = CENTRE_OF_PARIS): string | undefined => {
  const [first] = findFound(query, reference);
  return first === undefined ? undefined : lineOf(first);
};

const FROM_THE_CENTRE: readonly (readonly [string, string])[] = [
  ['12 bd dauphine', '12 Boulevard Dauphine, 75005 Paris'],
  ['75 rue mouffetard', '75 Rue Mouffetard, 75018 Paris'],
  ['40 rue mouffetard', '40 Rue Mouffetard, 75008 Paris'],
  ['40 Rue Mouffetard, 75008 Paris', '40 Rue Mouffetard, 75008 Paris'],
  ['40 rue mouffetard 75008', '40 Rue Mouffetard, 75008 Paris'],
  ['40 rue moufetard', '40 Rue Mouffetard, 75008 Paris'],
  ['40 rue mouffetar', '40 Rue Mouffetard, 75008 Paris'],
  ['5 av anatole france', '5 avenue Anatole France, 75007 Paris'],
  ['5 avenue anatole france paris', '5 avenue Anatole France, 75007 Paris'],
  ['18 bis rue de chateaudun', '18 bis rue de Châteaudun, 75009 Paris'],
  ['18bis rue de chateaudun', '18 bis rue de Châteaudun, 75009 Paris'],
  ["12 av de l'odéon", "12 Avenue de l'Odéon, 75001 Paris"],
  ['12 avenue de lodeon', "12 Avenue de l'Odéon, 75001 Paris"],
  ['150 quai de labbaye', "150 Quai de l'Abbaye, 75015 Paris"],
  ['35 rue du chevalier de la barre', '35 rue du Chevalier de la Barre, 75018 Paris'],
  ['6 parvis notre dame', '6 parvis Notre-Dame, 75004 Paris'],
  ['rue de rivoli', 'Rue de Rivoli, 75001 Paris'],
  ['rue de rivoli 75009', 'Rue de Rivoli, 75009 Paris'],
  ['99 rue de rivoli', 'Rue de Rivoli, 75001 Paris'],
  ['bd de vaugirard', 'Boulevard de Vaugirard, 75015 Paris'],
  ['boulevard de vaugirad', 'Boulevard de Vaugirard, 75015 Paris'],
  ['voie du chat qui peche', 'Voie du Chat-qui-Pêche, 75020 Paris'],
  ['place du 11 novembre 1918', 'Place du 11 Novembre 1918, 75010 Paris'],
  ['passage joubert', 'Passage Joubert, 75001 Paris'],
  ['quai de l abbaye', "Quai de l'Abbaye, 75018 Paris"],
  ['pl laffitte', 'Place Laffitte, 75005 Paris'],
  ['impasse de nesle', 'Impasse de Nesle, 75013 Paris'],
  ['75011', 'Paris 11e Arrondissement, 75011 Paris'],
  ['75011 paris', 'Paris 11e Arrondissement, 75011 Paris'],
  ['11e arrondissement', 'Paris 11e Arrondissement, 75011 Paris'],
  ['1er arrondissement', 'Paris 1er Arrondissement, 75001 Paris'],
  ['square thierry martin', "Square Thierry Martin, 150 Quai de l'Abbaye, 75015 Paris"]
];

const FROM_THE_NORTH_EAST: readonly (readonly [string, string])[] = [
  ['rue de rivoli', 'Rue de Rivoli, 75009 Paris'],
  ['passage joubert', 'Passage Joubert, 75017 Paris'],
  ['bd de vaugirard', 'Boulevard de Vaugirard, 75010 Paris']
];

describe('acceptance of the search of addresses on the fake Paris', () => {
  it.each(FROM_THE_CENTRE)('finds first, for "%s" from the centre of Paris, %s', (query, line) => {
    expect(firstFound(query)).toBe(line);
  });

  it.each(FROM_THE_NORTH_EAST)('finds first, for "%s" from the north-east of Paris, %s', (query, line) => {
    expect(firstFound(query, NORTH_EAST_OF_PARIS)).toBe(line);
  });
});
