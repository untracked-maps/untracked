import { EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Closable, closeWhatIsOpen, type Report } from './close-what-is-open';

const REPORTS: Readonly<Record<string, Report>> = {
  a: { element: 'about', open: true },
  b: { element: 'about', open: false },
  m: { element: 'map menu', open: true },
  n: { element: 'map menu', open: false },
  s: { element: 'spot', open: true },
  t: { element: 'spot', open: false },
  l: { element: 'kind list', open: true },
  k: { element: 'kind list', open: false },
  q: { element: 'search', open: true },
  r: { element: 'search', open: false }
};

const CLOSINGS: Readonly<Record<string, Closable>> = {
  a: 'about',
  m: 'map menu',
  s: 'spot',
  l: 'kind list',
  q: 'search'
};

type Marbles = {
  readonly reports?: string;
  readonly escapes?: string;
  readonly steps?: string;
};

const expectClosings = ({ reports = '', escapes = '', steps = '' }: Marbles, expected: string): void =>
  new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ hot, expectObservable }) => {
    const closings$ = closeWhatIsOpen({ entry: { add: () => EMPTY, leave: () => EMPTY } })({
      reports: hot(reports, REPORTS),
      escapes: hot(escapes),
      steps: hot(steps)
    });

    expectObservable(closings$).toBe(expected, CLOSINGS);
  });

describe('the Escape key', () => {
  it('closes the element that is open', () => {
    expectClosings({ reports: 's', escapes: '-x' }, '-s');
  });

  it('closes nothing while nothing is open', () => {
    expectClosings({ escapes: '-x' }, '');
  });

  it('closes nothing once the element has closed another way', () => {
    expectClosings({ reports: 'st', escapes: '--x' }, '');
  });

  it('closes the element on top, as the order tells', () => {
    expectClosings({ reports: 'qlsma', escapes: '-----x' }, '-----a');
  });

  it('closes the map menu before a sheet', () => {
    expectClosings({ reports: 'qlsm', escapes: '----x' }, '----m');
  });

  it('closes the sheet of a spot before the list of a kind', () => {
    expectClosings({ reports: 'qls', escapes: '---x' }, '---s');
  });

  it('closes the list of a kind before the search', () => {
    expectClosings({ reports: 'ql', escapes: '--x' }, '--l');
  });

  it('closes the search last', () => {
    expectClosings({ reports: 'q', escapes: '-x' }, '-q');
  });

  it('closes one element at each press', () => {
    expectClosings({ reports: 'sl-t', escapes: '--x-x' }, '--s-l');
  });

  it('closes an element that reports twice it is open only once', () => {
    expectClosings({ reports: 'sst', escapes: '---x' }, '');
  });
});

describe('a step back in the history', () => {
  it('closes the element that is open', () => {
    expectClosings({ reports: 's', steps: '-x' }, '-s');
  });

  it('closes nothing while nothing is open', () => {
    expectClosings({ steps: 'x' }, '');
  });

  it('closes the element on top, as the order tells', () => {
    expectClosings({ reports: 'qlsma', steps: '-----x' }, '-----a');
  });

  it('closes one element at each step', () => {
    expectClosings({ reports: 'sl-t', steps: '--x-x' }, '--s-l');
  });

  it('closes nothing when the app took the step itself', () => {
    expectClosings({ reports: 'stl', steps: '---x' }, '');
  });

  it('closes the element on top again after a step of the app', () => {
    expectClosings({ reports: 'stl', steps: '---x-x' }, '-----l');
  });
});
