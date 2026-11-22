import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Touch, type TouchOutcome, touchTheMap } from './touch-the-map';

const LOUVRE = { longitude: 2.3377, latitude: 48.8606 };

const TOUCHES: Readonly<Record<string, Touch>> = {
  t: { press: 'touch', spot: LOUVRE },
  l: { press: 'long press', spot: LOUVRE },
  d: { press: 'touch', spot: LOUVRE, place: 'flore' },
  p: { press: 'long press', spot: LOUVRE, place: 'flore' }
};

const OUTCOMES: Readonly<Record<string, TouchOutcome>> = {
  o: { kind: 'open place', id: 'flore' },
  i: { kind: 'inspect spot', spot: LOUVRE },
  c: { kind: 'close sheet' }
};

const OPEN: Readonly<Record<string, boolean>> = { y: true, n: false };

const expectOutcomes = (touched: string, sheetOpen: string, expected: string): void =>
  new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ cold, expectObservable }) => {
    expectObservable(touchTheMap({ touched: cold(touched, TOUCHES), sheetOpen: cold(sheetOpen, OPEN) })).toBe(
      expected,
      OUTCOMES
    );
  });

describe('touchTheMap', () => {
  it('opens the place of a dot touched', () => {
    expectOutcomes('-d', 'y', '-o');
  });

  it('opens the place of a dot long-pressed', () => {
    expectOutcomes('-p', 'y', '-o');
  });

  it('inspects an empty spot touched while no sheet has opened yet', () => {
    expectOutcomes('-t', '-', '-i');
  });

  it('closes the sheet open when an empty spot is touched', () => {
    expectOutcomes('-t', 'y', '-c');
  });

  it('inspects an empty spot touched once the sheet has closed', () => {
    expectOutcomes('--t', 'yn', '--i');
  });

  it('inspects an empty spot long-pressed while a sheet is open', () => {
    expectOutcomes('-l', 'y', '-i');
  });
});
