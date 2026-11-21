import { BehaviorSubject, firstValueFrom, lastValueFrom, of, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Place, showPlaces } from './show-places';

const ORSAY: Place = {
  id: 'musee-d-orsay',
  name: 'Musée d’Orsay',
  kind: 'museum',
  family: 'culture',
  coordinates: { longitude: 2.326_56, latitude: 48.859_96 },
  minzoom: 12,
  rank: 3
};

const PANTHEON: Place = {
  id: 'pantheon',
  name: 'Panthéon',
  kind: 'attraction',
  family: 'sight',
  coordinates: { longitude: 2.346_22, latitude: 48.846_22 },
  minzoom: 12.5,
  rank: 8
};

const namesWith = async (open: string | undefined): Promise<readonly string[]> => {
  const dots$ = showPlaces({ loadPlaces: () => of([ORSAY, PANTHEON]) })(of(16), of(open));
  return (await firstValueFrom(dots$)).map(({ name }) => name);
};

describe('show places, while the sheet of a place is open', () => {
  it('leaves out the dot of the place open', async () => {
    expect(await namesWith('musee-d-orsay')).toStrictEqual(['Panthéon']);
  });

  it('shows every place while no sheet is open', async () => {
    expect(await namesWith(undefined)).toStrictEqual(['Musée d’Orsay', 'Panthéon']);
  });

  it('shows the dot of the place again once its sheet closes', async () => {
    const open$ = new BehaviorSubject<string | undefined>('pantheon');
    const dots = lastValueFrom(showPlaces({ loadPlaces: () => of([ORSAY, PANTHEON]) })(of(16), open$).pipe(take(2)));
    open$.next(undefined);

    expect((await dots).map(({ name }) => name)).toStrictEqual(['Musée d’Orsay', 'Panthéon']);
  });
});
