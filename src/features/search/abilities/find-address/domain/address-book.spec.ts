import { describe, expect, it } from 'vitest';
import type { Coordinates } from '../../../domain/place';
import { addressBookOf, type RankedAddress } from './address-book';
import { addressQueryOf } from './address-query';
import type { KnownAddress } from './known-address';

const HERE: Coordinates = { longitude: 2.35, latitude: 48.85 };

const KILOMETRES_PER_DEGREE_OF_LATITUDE = 110.54;

const north = (kilometres: number): Coordinates => ({
  longitude: HERE.longitude,
  latitude: HERE.latitude + kilometres / KILOMETRES_PER_DEGREE_OF_LATITUDE
});

const house = (number: string, streetName: string, postcode = '75001', kilometres = 1): KnownAddress => ({
  kind: 'address',
  number,
  street: streetName,
  postcode,
  city: 'Paris',
  coordinates: north(kilometres)
});

const street = (name: string, postcode = '75001', kilometres = 1): KnownAddress => ({
  kind: 'street',
  street: name,
  postcode,
  city: 'Paris',
  coordinates: north(kilometres)
});

const district = (number: number, kilometres = 1): KnownAddress => ({
  kind: 'district',
  name: `Paris ${number}e Arrondissement`,
  postcode: `750${String(number).padStart(2, '0')}`,
  city: 'Paris',
  coordinates: north(kilometres)
});

const RIVOLI: readonly KnownAddress[] = [
  street('Rue de Rivoli'),
  house('12', 'Rue de Rivoli'),
  house('14', 'Rue de Rivoli'),
  street('Rue de Vaugirard', '75006'),
  district(11)
];

const found = (known: readonly KnownAddress[], query: string): readonly RankedAddress[] =>
  addressBookOf(known)(addressQueryOf(query), HERE);

const namesFound = (known: readonly KnownAddress[], query: string): readonly string[] =>
  found(known, query).map(({ address }) => `${address.name}, ${address.address}`);

describe('addresses found for a house number and a street', () => {
  it('start with the house at that number', () => {
    expect(namesFound(RIVOLI, '12 rue de rivoli')[0]).toBe('12 Rue de Rivoli, 75001 Paris');
  });

  it('go on with the street', () => {
    expect(namesFound(RIVOLI, '12 rue de rivoli')).toEqual(['12 Rue de Rivoli, 75001 Paris', 'Rue de Rivoli, 75001 Paris']);
  });

  it('give the street when no house has that number', () => {
    expect(namesFound(RIVOLI, '99 rue de rivoli')).toEqual(['Rue de Rivoli, 75001 Paris']);
  });

  it('put the house first, even farther than the street', () => {
    expect(
      namesFound([street('Rue de Rivoli', '75001', 1), house('12', 'Rue de Rivoli', '75004', 3)], '12 rue de rivoli')[0]
    ).toBe('12 Rue de Rivoli, 75004 Paris');
  });
});

describe('addresses found for a street', () => {
  it('are the streets only, without their houses', () => {
    expect(namesFound(RIVOLI, 'rue de rivoli')).toEqual(['Rue de Rivoli, 75001 Paris']);
  });

  it('match every word typed', () => {
    expect(namesFound(RIVOLI, 'rue de vaugirard')).toEqual(['Rue de Vaugirard, 75006 Paris']);
  });

  it('match words with a typo', () => {
    expect(namesFound(RIVOLI, 'rue de rivolli')).toEqual(['Rue de Rivoli, 75001 Paris']);
  });

  it('match the beginning of the last word', () => {
    expect(namesFound(RIVOLI, 'rue de riv')).toEqual(['Rue de Rivoli, 75001 Paris']);
  });

  it('keep to the postcode typed', () => {
    expect(namesFound([street('Rue de Rivoli', '75001'), street('Rue de Rivoli', '75004')], 'rue de rivoli 75004')).toEqual([
      'Rue de Rivoli, 75004 Paris'
    ]);
  });
});

describe('order of the streets found', () => {
  it('come the nearest first when they match as well', () => {
    expect(namesFound([street('Rue de Rivoli', '75001', 2), street('Rue de Rivoli', '75004', 1)], 'rue de rivoli')).toEqual([
      'Rue de Rivoli, 75004 Paris',
      'Rue de Rivoli, 75001 Paris'
    ]);
  });

  it('come the better matched first, before the nearest', () => {
    expect(
      namesFound([street('Rue de Rivoli Prolongée', '75004', 1), street('Rue de Rivoli', '75001', 2)], 'rue de rivoli')
    ).toEqual(['Rue de Rivoli, 75001 Paris', 'Rue de Rivoli Prolongée, 75004 Paris']);
  });

  it('weigh each word typed by the best word of the street it matches', () => {
    expect(namesFound([street('Rue Tour Tourelle', '75004', 1), street('Rue Tour Blanche', '75001', 2)], 'rue tour')[0]).toBe(
      'Rue Tour Tourelle, 75004 Paris'
    );
  });

  it('match the beginning of a short word only when it is typed last', () => {
    expect(namesFound(RIVOLI, 'riv rue')).toEqual([]);
  });

  it('are seven at most', () => {
    expect(
      found(
        Array.from({ length: 9 }, (_, index) => street(`Rue ${index}`, `750${10 + index}`)),
        'rue'
      )
    ).toHaveLength(7);
  });

  it('keep one street of a postcode and name', () => {
    expect(found([street('Rue de Rivoli', '75001', 1), street('Rue de Rivoli', '75001', 2)], 'rue de rivoli')).toHaveLength(1);
  });

  it('keep the first one given of a postcode and name', () => {
    expect(
      found([street('Rue de Rivoli', '75001', 2), street('Rue de Rivoli', '75001', 1)], 'rue de rivoli')[0]?.address.coordinates
    ).toEqual(north(2));
  });
});

describe('arrondissements found', () => {
  it('are found by their postcode alone', () => {
    expect(namesFound(RIVOLI, '75011')).toEqual(['Paris 11e Arrondissement, 75011 Paris']);
  });

  it('come alone for a postcode alone', () => {
    expect(namesFound([street('Rue de la Roquette', '75011'), district(11)], '75011')).toEqual([
      'Paris 11e Arrondissement, 75011 Paris'
    ]);
  });

  it('are found by the words of their name', () => {
    expect(namesFound([district(11), district(12)], '11e arrondissement')).toEqual(['Paris 11e Arrondissement, 75011 Paris']);
  });

  it('are none for an unknown postcode', () => {
    expect(namesFound(RIVOLI, '75099')).toEqual([]);
  });
});

describe('nothing is found', () => {
  it('for a number alone', () => {
    expect(found(RIVOLI, '12')).toEqual([]);
  });

  it('for an empty query', () => {
    expect(found(RIVOLI, '')).toEqual([]);
  });
});

describe('clean addresses', () => {
  it('match every word exactly', () => {
    expect(found(RIVOLI, '12 rue de rivoli')[0]?.clean).toBe(true);
  });

  it('may match the beginning of the last word', () => {
    expect(found(RIVOLI, 'rue de riv')[0]?.clean).toBe(true);
  });

  it('do not match the beginning of a word before the last', () => {
    expect(found(RIVOLI, 'rivo rue')[0]?.clean).toBe(false);
  });

  it('do not match a word with a typo', () => {
    expect(found(RIVOLI, 'rue de rivolli')[0]?.clean).toBe(false);
  });

  it('include a street when the number typed is not known', () => {
    expect(found(RIVOLI, '99 rue de rivoli')[0]?.clean).toBe(true);
  });

  it('include an arrondissement found by its postcode', () => {
    expect(found(RIVOLI, '75011')[0]?.clean).toBe(true);
  });
});
