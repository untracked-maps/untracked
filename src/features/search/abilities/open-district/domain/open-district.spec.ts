import { type Observable, of, Subject, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import {
  type District,
  type DistrictSheet,
  districtsFramedAt,
  districtsOutlined,
  type KnownOutline,
  openDistrict
} from './open-district';

const MARAIS: District = {
  name: 'Le Marais',
  postalCode: '75004',
  addressLocality: 'Paris',
  coordinates: { longitude: 2.36, latitude: 48.859 }
};

const BATIGNOLLES: District = {
  name: 'Batignolles',
  postalCode: '75017',
  addressLocality: 'Paris',
  coordinates: { longitude: 2.318, latitude: 48.888 }
};

const MARAIS_OUTLINE = [
  { longitude: 2.35, latitude: 48.85 },
  { longitude: 2.37, latitude: 48.85 },
  { longitude: 2.36, latitude: 48.87 },
  { longitude: 2.35, latitude: 48.85 }
];

const KNOWN: readonly KnownOutline[] = [{ name: 'Le Marais', postalCode: '75004', outline: MARAIS_OUTLINE }];

const MARAIS_SHEET: DistrictSheet = { status: 'open', district: MARAIS, outline: MARAIS_OUTLINE };

const SHEETS: Readonly<Record<string, DistrictSheet>> = {
  c: { status: 'closed' },
  m: MARAIS_SHEET,
  b: { status: 'open', district: BATIGNOLLES, outline: [] },
  e: { status: 'open', district: MARAIS, outline: [] }
};

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

const expectSheets = (
  marbles: { readonly opened: string; readonly closed?: string; readonly outlines?: string },
  expected: string
): void =>
  new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run((run: Run) => {
    const sheet$ = openDistrict({ loadOutlines: () => run.cold(marbles.outlines ?? '(k|)', { k: KNOWN }) })({
      opened: run.cold(marbles.opened, { m: MARAIS, b: BATIGNOLLES }),
      closed: run.cold(marbles.closed ?? '', { x: undefined })
    });
    run.expectObservable(sheet$).toBe(expected, SHEETS);
  });

describe('open district', () => {
  it('opens no district at first', () => {
    expectSheets({ opened: '' }, 'c');
  });

  it('opens the district chosen with its outline', () => {
    expectSheets({ opened: '-m' }, 'cm');
  });

  it('opens a district without an outline when none is known for it', () => {
    expectSheets({ opened: '-b' }, 'cb');
  });

  it('waits for the outlines before opening', () => {
    expectSheets({ opened: '-m', outlines: '--(k|)' }, 'c--m');
  });

  it('opens a district without an outline when the outlines cannot be loaded', () => {
    expectSheets({ opened: '-m', outlines: '#' }, 'ce');
  });

  it('closes the district once asked', () => {
    expectSheets({ opened: '-m', closed: '--x' }, 'cmc');
  });

  it('moves to the last district chosen', () => {
    expectSheets({ opened: '-mb' }, 'cmb');
  });

  it('loads the outlines once for several districts', () => {
    const loads: string[] = [];
    const opened = new Subject<District>();
    openDistrict({
      loadOutlines: (): Observable<readonly KnownOutline[]> => {
        loads.push('loaded');
        return of(KNOWN);
      }
    })({ opened, closed: of() }).subscribe();
    opened.next(MARAIS);
    opened.next(BATIGNOLLES);

    expect(loads).toEqual(['loaded']);
  });

  it('loads the outlines again after a failure', () => {
    const answers = [throwError(() => new Error('The districts file answered 500.')), of(KNOWN)];
    const seen: DistrictSheet[] = [];
    const opened = new Subject<District>();
    openDistrict({ loadOutlines: () => answers.shift() ?? of([]) })({ opened, closed: of() }).subscribe((sheet) => {
      seen.push(sheet);
    });
    opened.next(MARAIS);
    opened.next(MARAIS);

    expect(seen.at(-1)).toEqual(MARAIS_SHEET);
  });
});

describe('districts framed', () => {
  it('frame the district opened, at its centre and outline', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsFramedAt(cold('cm', SHEETS))).toBe('-f', {
        f: { at: MARAIS.coordinates, outline: MARAIS_OUTLINE }
      });
    });
  });

  it('frame a district once while its sheet stays open', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsFramedAt(cold('mm', { m: MARAIS_SHEET }))).toBe('f-', {
        f: { at: MARAIS.coordinates, outline: MARAIS_OUTLINE }
      });
    });
  });

  it('frame a district again once chosen anew after closing', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsFramedAt(cold('mcm', SHEETS))).toBe('f-f', {
        f: { at: MARAIS.coordinates, outline: MARAIS_OUTLINE }
      });
    });
  });
});

describe('districts outlined', () => {
  it('outline the district opened', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsOutlined(cold('m', SHEETS))).toBe('o', { o: MARAIS_OUTLINE });
    });
  });

  it('outline nothing for a district without an outline', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsOutlined(cold('b', SHEETS))).toBe('n', { n: undefined });
    });
  });

  it('outline nothing once the district is closed', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsOutlined(cold('mc', SHEETS))).toBe('on', { o: MARAIS_OUTLINE, n: undefined });
    });
  });

  it('outline a district once while its sheet stays open', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      expectObservable(districtsOutlined(cold('mm', { m: MARAIS_SHEET }))).toBe('o-', { o: MARAIS_OUTLINE });
    });
  });
});
