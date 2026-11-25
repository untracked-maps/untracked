import { NEVER, type Observable, of, ReplaySubject, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { Departure, LineDepartures } from './next-departures';
import { type Station, type StationView, showStation } from './show-station';

const tagged = (entries: readonly (readonly [string, string])[]): Readonly<Record<string, string>> =>
  Object.fromEntries(entries);

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

const NOW = Date.parse('2026-11-24T10:00:00Z');

const SECOND = 1000;

const NORD: Station = {
  id: 'nord',
  lines: [
    {
      id: 'm4',
      tags: tagged([
        ['route_master', 'subway'],
        ['ref', '4']
      ])
    }
  ],
  exits: [{ coordinates: { longitude: 2.355, latitude: 48.88 }, tags: tagged([['ref', '1']]) }]
};

const DEPARTURE: Departure = {
  lineRef: 'm4',
  destinationName: 'Porte de Clignancourt',
  aimedDepartureTime: '2026-11-24T10:04:35Z',
  monitored: false
};

const EXITS = [{ ref: '1', coordinates: { longitude: 2.355, latitude: 48.88 } }];

const line = (minutes: number): LineDepartures => ({
  ref: '4',
  mode: 'subway',
  destination: 'Porte de Clignancourt',
  colour: '#5b6573',
  textColour: '#ffffff',
  times: [{ told: 'minutes', minutes }],
  live: false
});

const VIEWS: Readonly<Record<string, StationView>> = {
  n: { status: 'none' },
  a: { status: 'open', id: 'nord', exits: EXITS, departures: { status: 'asked' } },
  u: { status: 'open', id: 'nord', exits: EXITS, departures: { status: 'unavailable' } },
  k: { status: 'open', id: 'nord', exits: EXITS, departures: { status: 'known', lines: [line(5)] } },
  f: { status: 'open', id: 'nord', exits: EXITS, departures: { status: 'known', lines: [line(4)] } }
};

const TIMES: Readonly<Record<string, number>> = {
  t: NOW,
  h: NOW + 10 * SECOND,
  i: NOW + 20 * SECOND,
  j: NOW + 29 * SECOND,
  r: NOW + 30 * SECOND
};

type Marbles = {
  readonly opened: string;
  readonly time: string;
  readonly shown?: string;
  readonly departures?: () => Observable<readonly Departure[]>;
};

const scheduler = (): TestScheduler => new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted));

const counted = (): { readonly asked: string[]; readonly load: () => Observable<readonly Departure[]> } => {
  const asked: string[] = [];
  return {
    asked,
    load: (): Observable<readonly Departure[]> => {
      asked.push('asked');
      return of([DEPARTURE]);
    }
  };
};

const replayed = <Value>(run: Run, marbles: string, values: Readonly<Record<string, Value>>): Observable<Value> => {
  const latest = new ReplaySubject<Value>(1);
  run.hot(marbles, values).subscribe(latest);
  return latest;
};

const viewOf = (run: Run, marbles: Marbles): Observable<StationView> =>
  showStation({
    loadStation: (id) => (id === 'nord' ? of(NORD) : throwError(() => new Error('Not a station.'))),
    loadDepartures: marbles.departures ?? ((): Observable<readonly Departure[]> => of([DEPARTURE]))
  })({
    opened: run.cold(marbles.opened, { o: 'nord', c: undefined, x: 'flore' }),
    time: replayed(run, marbles.time, TIMES),
    shown: replayed(run, marbles.shown ?? 'v', { v: true, h: false })
  });

const askedWith = (marbles: Omit<Marbles, 'departures'>): readonly string[] => {
  const departures = counted();
  scheduler().run((run) => {
    viewOf(run, { ...marbles, departures: departures.load }).subscribe();
  });
  return departures.asked;
};

describe('the station shown', () => {
  it('is none before a station opens', () => {
    scheduler().run((run) => {
      run.expectObservable(viewOf(run, { opened: '', time: 't' })).toBe('n', VIEWS);
    });
  });

  it('tells the departures of the station opened', () => {
    scheduler().run((run) => {
      run.expectObservable(viewOf(run, { opened: '-o', time: 't' })).toBe('nk', VIEWS);
    });
  });

  it('waits for the departures asked', () => {
    scheduler().run((run) => {
      run.expectObservable(viewOf(run, { opened: '-o', time: 't', departures: () => NEVER })).toBe('na', VIEWS);
    });
  });

  it('counts the minutes down every 10 seconds', () => {
    scheduler().run((run) => {
      run.expectObservable(viewOf(run, { opened: '-o', time: 't--h-i' })).toBe('nk-f-f', VIEWS);
    });
  });

  it('is none once closed', () => {
    scheduler().run((run) => {
      run.expectObservable(viewOf(run, { opened: '-o-c', time: 't' })).toBe('nk-n', VIEWS);
    });
  });

  it('is none for a place that is not a station', () => {
    scheduler().run((run) => {
      run.expectObservable(viewOf(run, { opened: '-x', time: 't' })).toBe('nn', VIEWS);
    });
  });

  it('says the departures are unavailable when the service fails', () => {
    scheduler().run((run) => {
      run
        .expectObservable(
          viewOf(run, { opened: '-o', time: 't', departures: () => throwError(() => new Error('The service failed.')) })
        )
        .toBe('nu', VIEWS);
    });
  });
});

describe('the departures of a station', () => {
  it('are asked once it opens', () => {
    expect(askedWith({ opened: '-o', time: 't' })).toEqual(['asked']);
  });

  it('are asked again every 30 seconds', () => {
    expect(askedWith({ opened: '-o', time: 't-j-r' })).toEqual(['asked', 'asked']);
  });

  it('are not asked while the page is hidden', () => {
    expect(askedWith({ opened: '-o', time: 't--r', shown: 'v-h' })).toEqual(['asked']);
  });

  it('are asked again at once when the page is shown again', () => {
    expect(askedWith({ opened: '-o', time: 't-h', shown: 'v-h--v' })).toEqual(['asked', 'asked']);
  });

  it('are not asked once the station closes', () => {
    expect(askedWith({ opened: '-o-c', time: 't---r' })).toEqual(['asked']);
  });
});
