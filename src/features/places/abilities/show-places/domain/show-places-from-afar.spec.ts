import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Place, showPlaces } from './show-places';

const LAFAYETTE: Place = {
  name: 'Galeries Lafayette',
  kind: 'department-store',
  family: 'shop',
  coordinates: { longitude: 2.332_14, latitude: 48.873_73 },
  minzoom: 13.75,
  rank: 110
};

const NORD: Place = {
  name: 'Gare du Nord',
  kind: 'station',
  family: 'train',
  coordinates: { longitude: 2.355_32, latitude: 48.880_95 },
  minzoom: 12.5,
  rank: 20
};

const shownAt = async (zoom: number, place: Place): Promise<readonly (readonly [string, number])[]> => {
  const dots$ = showPlaces({ loadPlaces: () => of([place]) })(of(zoom));
  return (await firstValueFrom(dots$)).map(({ name, order }) => [name, order]);
};

describe('a place that showed from afar, from zoom 17', () => {
  it('stays before its family shows, in the order of its family', async () => {
    expect(await shownAt(17, LAFAYETTE)).toStrictEqual([['Galeries Lafayette', 4]]);
  });

  it('stays when it is a station, and goes first', async () => {
    expect(await shownAt(19, NORD)).toStrictEqual([['Gare du Nord', 0]]);
  });

  it('does not show before its own zoom when it is a station', async () => {
    expect(await shownAt(18, { ...NORD, minzoom: 18.25 })).toStrictEqual([]);
  });

  it('shows from the zoom of its family when its own zoom comes later', async () => {
    expect(await shownAt(17.5, { ...LAFAYETTE, minzoom: 19 })).toStrictEqual([['Galeries Lafayette', 4]]);
  });
});
