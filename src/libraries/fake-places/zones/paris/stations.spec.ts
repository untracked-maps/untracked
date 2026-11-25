import { describe, expect, it } from 'vitest';
import type { FakeStation } from '../../fake-station';
import { landmarks } from './landmarks';
import { stations } from './stations';

const stationOf = (id: string): FakeStation | undefined => stations().find((station) => station.id === id);

describe('the famous stations of the fake Paris', () => {
  it('are the seven famous stations among the landmarks', () => {
    expect(stations().map(({ id }) => id)).toEqual(
      landmarks()
        .filter(({ kind }) => kind === 'station')
        .map(({ id }) => id)
    );
  });

  it('give each line of a station from the list of lines', () => {
    expect(stationOf('gare-du-nord')?.lines.map(({ tags }) => tags['ref'])).toEqual(['4', '5', 'B', 'D', 'H', 'K']);
  });

  it('leave out the direction of a line that ends at the station', () => {
    expect(stationOf('gare-d-austerlitz')?.lines.find(({ id }) => id === 'metro-10')?.directions).toEqual([
      'Boulogne–Point de Saint-Cloud'
    ]);
  });

  it('give its exits to a station', () => {
    expect(stationOf('gare-de-lyon')?.exits).toHaveLength(5);
  });
});
