import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Place } from '../../../../domain/place';
import { miniSearchIndex } from './minisearch-index';

const HERE = { longitude: 2.35, latitude: 48.85 };

const place = (id: string, name: string): Place => ({
  id,
  name,
  kind: 'museum',
  address: '',
  coordinates: HERE,
  fame: 0
});

const ORSAY = place('orsay', "Musée d'Orsay");
const LOUVRE = place('louvre', 'Musée du Louvre');
const PANTHEON = place('pantheon', 'Panthéon');
const ZINC = place('zinc', 'Bar Zinc');

const idsFound = async (query: string): Promise<readonly string[]> => {
  const findPlaces = await firstValueFrom(miniSearchIndex([ORSAY, LOUVRE, PANTHEON, ZINC]));
  return findPlaces(query, HERE).map(({ id }) => id);
};

describe('index of places with MiniSearch', () => {
  it('finds the places that hold every word typed', async () => {
    expect(await idsFound('musee louvre')).toEqual(['louvre']);
  });

  it('finds a word glued to its elided letter', async () => {
    expect(await idsFound('dorsay')).toEqual(['orsay']);
  });

  it('finds a word with one typo', async () => {
    expect(await idsFound('lovre')).toEqual(['louvre']);
  });

  it('finds a long word with two typos', async () => {
    expect(await idsFound('pamtheonn')).toEqual(['pantheon']);
  });

  it('does not find a short word with a typo', async () => {
    expect(await idsFound('bat')).toEqual([]);
  });

  it('finds a word with two letters swapped', async () => {
    expect(await idsFound('lovure')).toEqual(['louvre']);
  });

  it('finds the words the last one typed starts with a typo', async () => {
    expect(await idsFound('pamth')).toEqual(['pantheon']);
  });

  it('does not find the words a short last one starts with a typo', async () => {
    expect(await idsFound('pam')).toEqual([]);
  });

  it('finds the words the last one typed starts', async () => {
    expect(await idsFound('louv')).toEqual(['louvre']);
  });

  it('does not find the words a short earlier one starts', async () => {
    expect(await idsFound('lou musee')).toEqual([]);
  });
});
