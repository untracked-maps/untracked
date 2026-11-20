import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Found } from '../../../../domain/found';
import type { Coordinates, Place } from '../../../../domain/place';
import { withAddressesOf } from '../../domain/with-addresses';
import { prerenderedAddressBook } from './prerendered-address-book';

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const NORTH_EAST_OF_PARIS: Coordinates = { longitude: 2.45, latitude: 48.91 };

const SQUARE: Place = {
  id: 'square-thierry-martin',
  name: 'Square Thierry Martin',
  kind: 'park',
  address: "150 Quai de l'Abbaye, 75015 Paris",
  coordinates: CENTRE_OF_PARIS,
  fame: 0
};

const house = (
  number: string,
  street: string,
  postcode: string,
  [longitude, latitude]: readonly [number, number]
): Readonly<Record<string, unknown>> => ({
  kind: 'address',
  number,
  street,
  postcode,
  city: 'Paris',
  coordinates: { longitude, latitude }
});

const district = (
  name: string,
  postcode: string,
  [longitude, latitude]: readonly [number, number]
): Readonly<Record<string, unknown>> => ({
  kind: 'district',
  name,
  postcode,
  city: 'Paris',
  coordinates: { longitude, latitude }
});

const ADDRESS_FILE = [
  house('12', 'Boulevard Dauphine', '75005', [2.344, 48.849]),
  house('75', 'Rue Mouffetard', '75018', [2.35, 48.842]),
  house('40', 'Rue Mouffetard', '75008', [2.351, 48.843]),
  house('5', 'avenue Anatole France', '75007', [2.296, 48.857]),
  house('18 bis', 'rue de Châteaudun', '75009', [2.337, 48.876]),
  house('12', "Avenue de l'Odéon", '75001', [2.339, 48.85]),
  house('150', "Quai de l'Abbaye", '75015', [2.28, 48.84]),
  house('3', "Quai de l'Abbaye", '75018', [2.35, 48.86]),
  house('35', 'rue du Chevalier de la Barre', '75018', [2.343, 48.887]),
  house('6', 'parvis Notre-Dame', '75004', [2.349, 48.853]),
  house('3', 'Rue de Rivoli', '75001', [2.348, 48.857]),
  house('5', 'Rue de Rivoli', '75009', [2.44, 48.9]),
  house('8', 'Rue de Rivoli', '75014', [2.32, 48.83]),
  house('20', 'Boulevard de Vaugirard', '75015', [2.32, 48.843]),
  house('7', 'Boulevard de Vaugirard', '75010', [2.43, 48.9]),
  house('9', 'Voie du Chat-qui-Pêche', '75020', [2.4, 48.86]),
  house('2', 'Place du 11 Novembre 1918', '75010', [2.358, 48.876]),
  house('4', 'Passage Joubert', '75001', [2.346, 48.86]),
  house('6', 'Passage Joubert', '75017', [2.44, 48.905]),
  house('1', 'Place Laffitte', '75005', [2.35, 48.846]),
  house('11', 'Impasse de Nesle', '75013', [2.36, 48.83]),
  house('14', 'Rue de Nesle', '75006', [2.338, 48.855]),
  house('22', 'Rue Saint-Lazare', '75009', [2.33, 48.877]),
  district('Paris 1er Arrondissement', '75001', [2.3364, 48.8625]),
  district('Paris 11e Arrondissement', '75011', [2.3801, 48.859])
];

const knownAddresses = await firstValueFrom(
  prerenderedAddressBook(() => Promise.resolve(Response.json(ADDRESS_FILE)), '/data/addresses.json')()
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

describe('acceptance of the search of addresses', () => {
  it.each(FROM_THE_CENTRE)('finds first, for "%s" from the centre of Paris, %s', (query, line) => {
    expect(firstFound(query)).toBe(line);
  });

  it.each(FROM_THE_NORTH_EAST)('finds first, for "%s" from the north-east of Paris, %s', (query, line) => {
    expect(firstFound(query, NORTH_EAST_OF_PARIS)).toBe(line);
  });
});
