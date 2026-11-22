import { type Observable, of, take, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { copyAddress, type Opening, openPlace, type PlaceSheet, placesOpenedAt, type SheetPlace } from './open-place';

const FLORE: SheetPlace = {
  id: 'flore',
  name: 'Café de Flore',
  kind: 'cafe',
  coordinates: { longitude: 2.33, latitude: 48.85 }
};

const LUIGI: SheetPlace = { id: 'luigi', name: 'Chez Luigi', coordinates: { longitude: 2.34, latitude: 48.86 } };

const OPENINGS: Readonly<Record<string, Opening>> = {
  f: { id: 'flore', from: 'search' },
  l: { id: 'luigi', from: 'kind list' },
  u: { id: 'unknown', from: 'search' }
};

const SHEETS: Readonly<Record<string, PlaceSheet>> = {
  c: { status: 'closed' },
  f: { status: 'open', place: FLORE, from: 'search' },
  l: { status: 'open', place: LUIGI, from: 'kind list' }
};

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

type Marbles = {
  readonly places?: string;
  readonly opened: string;
  readonly closed?: string;
};

const scheduler = (): TestScheduler => new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted));

const sheetOf = (run: Run, marbles: Marbles): Observable<PlaceSheet> =>
  openPlace({ loadPlaces: () => run.cold(marbles.places ?? 'p', { p: [FLORE, LUIGI], q: [] }) })({
    opened: run.cold(marbles.opened, OPENINGS),
    closed: run.cold(marbles.closed ?? '', { x: undefined })
  });

const expectSheet = (marbles: Marbles, expected: string): void =>
  scheduler().run((run: Run) => {
    run.expectObservable(sheetOf(run, marbles)).toBe(expected, SHEETS);
  });

describe('the sheet of a place', () => {
  it('is closed at first', () => {
    expectSheet({ opened: '' }, 'c');
  });

  it('opens on the place chosen', () => {
    expectSheet({ opened: '-f' }, 'cf');
  });

  it('tells where the place was chosen', () => {
    expectSheet({ opened: '-l' }, 'cl');
  });

  it('opens once the places are there', () => {
    expectSheet({ places: '--p', opened: '-f' }, 'c--f');
  });

  it('opens with the first places given', () => {
    expectSheet({ places: '-(pq)', opened: 'f' }, 'cf');
  });

  it('closes when the place chosen is not known', () => {
    expectSheet({ opened: '-f-u' }, 'cf-c');
  });

  it('closes when the visitor closes it', () => {
    expectSheet({ opened: '-f', closed: '--x' }, 'cfc');
  });

  it('stays closed when closed while the places are on their way', () => {
    expectSheet({ places: '---p', opened: '-f', closed: '--x' }, 'c-c');
  });

  it('starts closed again once no one shows it any more', () => {
    scheduler().run((run: Run) => {
      const sheet = sheetOf(run, { opened: '-f' });
      sheet.pipe(take(2)).subscribe();

      run.expectObservable(sheet, '---^').toBe('---cf', SHEETS);
    });
  });

  it('opens on the last place chosen', () => {
    expectSheet({ opened: '-fl' }, 'cfl');
  });
});

describe('the places of the sheet', () => {
  it('are loaded once, however many places are chosen', () => {
    scheduler().run((run: Run) => {
      const places$ = run.cold('p', { p: [FLORE] });
      run.expectObservable(
        openPlace({ loadPlaces: () => places$ })({ opened: run.cold('-ff', OPENINGS), closed: run.cold('') })
      );
      run.expectSubscriptions(places$.subscriptions).toBe('-(^!)');
    });
  });

  it('are loaded only once a place is chosen', () => {
    scheduler().run((run: Run) => {
      const places$ = run.cold('p', { p: [FLORE] });
      run.expectObservable(
        openPlace({ loadPlaces: () => places$ })({ opened: run.cold('--f', OPENINGS), closed: run.cold('') })
      );
      run.expectSubscriptions(places$.subscriptions).toBe('--(^!)');
    });
  });

  it('leave every sheet closed when they cannot be loaded', () => {
    scheduler().run((run: Run) => {
      run
        .expectObservable(
          openPlace({ loadPlaces: () => throwError(() => new Error('The places file answered 500.')) })({
            opened: run.cold('-f', OPENINGS),
            closed: run.cold('')
          })
        )
        .toBe('cc', SHEETS);
    });
  });
});

const COPIED: Readonly<Record<string, 'copied' | 'not copied'>> = { y: 'copied', n: 'not copied' };

describe('copying an address', () => {
  it('tells the address is copied once the device has copied it', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      expectObservable(copyAddress({ copyText: () => cold('--(d|)', { d: undefined }) })(cold('a'))).toBe('--y', COPIED);
    });
  });

  it('tells the address could not be copied when the device refuses', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      expectObservable(copyAddress({ copyText: () => cold('-#') })(cold('a'))).toBe('-n', COPIED);
    });
  });

  it('copies each address asked, one after the other', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      expectObservable(copyAddress({ copyText: () => cold('--|') })(cold('ab'))).toBe('--y-y', COPIED);
    });
  });

  it('copies the text asked', () => {
    const texts: string[] = [];
    copyAddress({
      copyText: (text) => {
        texts.push(text);
        return of(undefined);
      }
    })(of('12 Rue de l’Éperon, 75006 Paris')).subscribe();

    expect(texts).toEqual(['12 Rue de l’Éperon, 75006 Paris']);
  });
});

describe('where the place opened stands', () => {
  const expectWhereabouts = (sheets: string, expected: string): void =>
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(placesOpenedAt(cold(sheets, SHEETS))).toBe(expected, {
        f: FLORE.coordinates,
        l: LUIGI.coordinates
      });
    });

  it('is told once its sheet opens', () => {
    expectWhereabouts('cf', '-f');
  });

  it('is told for each place opened', () => {
    expectWhereabouts('fl', 'fl');
  });

  it('is told once while the same sheet stays open', () => {
    expectWhereabouts('ff', 'f-');
  });

  it('is told again when the place opens again after its sheet was closed', () => {
    expectWhereabouts('fcf', 'f-f');
  });
});
