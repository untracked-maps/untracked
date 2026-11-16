import { type Observable, of, Subject, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Coordinates, type InspectedSpot, inspectPoint, type ReverseGeocode, type SpotAddress } from './inspect-point';

const LOUVRE: Coordinates = { longitude: 2.337_64, latitude: 48.860_61 };

const SEINE: Coordinates = { longitude: 2.34, latitude: 48.858 };

const SPOTS: Readonly<Record<string, Coordinates>> = { l: LOUVRE, s: SEINE };

const RIVOLI: SpotAddress = { kind: 'address', address: 'Rue de Rivoli, 75001 Paris' };

const STATES: Readonly<Record<string, InspectedSpot>> = {
  n: { kind: 'none' },
  l: { kind: 'looking', spot: LOUVRE },
  a: { kind: 'address', spot: LOUVRE, address: 'Rue de Rivoli, 75001 Paris' },
  k: { kind: 'looking', spot: SEINE },
  x: { kind: 'no-address', spot: SEINE },
  u: { kind: 'unavailable', spot: LOUVRE }
};

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

type Marbles = {
  readonly inspected: string;
  readonly dismissed?: string;
  readonly answers?: Readonly<Record<string, string>>;
};

const answersOf = (run: Run, marbles: Marbles): ReverseGeocode => {
  const answers: Readonly<Record<string, SpotAddress>> = { r: RIVOLI, x: { kind: 'no-address' } };
  return (spot: Coordinates): Observable<SpotAddress> =>
    run.cold(spot === LOUVRE ? (marbles.answers?.['l'] ?? '--r') : (marbles.answers?.['s'] ?? '-x'), answers);
};

const expectInspection = (marbles: Marbles, expected: string): void =>
  new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run((run: Run) => {
    const spot$ = inspectPoint({ reverseGeocode: answersOf(run, marbles) })({
      inspected: run.cold(marbles.inspected, SPOTS),
      dismissed: run.cold(marbles.dismissed ?? '', { d: undefined })
    });
    run.expectObservable(spot$).toBe(expected, STATES);
  });

describe('inspect point, for one spot', () => {
  it('inspects no spot at first', () => {
    expectInspection({ inspected: '' }, 'n');
  });

  it('looks for the address of the spot inspected', () => {
    expectInspection({ inspected: '-l', answers: { l: '-' } }, 'nl');
  });

  it('gives the address of the spot', () => {
    expectInspection({ inspected: '-l' }, 'nl-a');
  });

  it('says there is no address at the spot', () => {
    expectInspection({ inspected: '-s' }, 'nkx');
  });

  it('keeps the first address given', () => {
    expectInspection({ inspected: '-l', answers: { l: '-(rr)' } }, 'nla');
  });

  it('says the address is unavailable when it cannot be looked for', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      const failing: ReverseGeocode = () => throwError(() => new Error('The addresses file answered 500.'));
      expectObservable(inspectPoint({ reverseGeocode: failing })({ inspected: cold('-l', SPOTS), dismissed: cold('') })).toBe(
        'n(lu)',
        STATES
      );
    });
  });
});

describe('inspect point, over time', () => {
  it('moves to the last spot inspected', () => {
    expectInspection({ inspected: '-ls' }, 'nlkx');
  });

  it('forgets the spot once dismissed', () => {
    expectInspection({ inspected: '-l', dismissed: '----d' }, 'nl-an');
  });

  it('stops looking for an address once dismissed', () => {
    expectInspection({ inspected: '-l', dismissed: '--d' }, 'nln');
  });

  it('inspects a spot again after a dismissal', () => {
    expectInspection({ inspected: '-l--s', dismissed: '--d' }, 'nln-kx');
  });

  it('shares the spot between its viewers', () => {
    const spot$ = inspectPoint({ reverseGeocode: () => of(RIVOLI) })({ inspected: of(LOUVRE), dismissed: of() });
    const seen: InspectedSpot[] = [];
    const first = spot$.subscribe();
    spot$
      .subscribe((spot) => {
        seen.push(spot);
      })
      .unsubscribe();
    first.unsubscribe();

    expect(seen).toEqual([{ kind: 'address', spot: LOUVRE, address: 'Rue de Rivoli, 75001 Paris' }]);
  });

  it('stops inspecting once nobody views the spot', () => {
    const inspected = new Subject<Coordinates>();
    inspectPoint({ reverseGeocode: () => of(RIVOLI) })({ inspected, dismissed: of() })
      .subscribe()
      .unsubscribe();

    expect(inspected.observed).toBe(false);
  });
});
