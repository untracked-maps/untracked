import { defer, EMPTY, type Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { closeWhatIsOpen, type Report } from './close-what-is-open';

const OPENED_THEN_CLOSED: Readonly<Record<string, Report>> = {
  s: { element: 'spot', open: true },
  t: { element: 'spot', open: false },
  l: { element: 'kind list', open: true }
};

const noting = (calls: string[], call: () => string) => (): Observable<never> =>
  defer(() => {
    calls.push(call());
    return EMPTY;
  });

const entryCallsOf = (reports: string, steps = '', escapes = ''): readonly string[] => {
  const calls: string[] = [];
  new TestScheduler(() => undefined).run(({ hot }) => {
    closeWhatIsOpen({ entry: { add: noting(calls, () => 'add'), leave: noting(calls, () => 'leave') } })({
      reports: hot(reports, OPENED_THEN_CLOSED),
      escapes: hot(escapes),
      steps: hot(steps)
    }).subscribe();
  });
  return calls;
};

describe('the history entry', () => {
  it('is added when an element opens', () => {
    expect(entryCallsOf('s')).toEqual(['add']);
  });

  it('is not added while nothing opens', () => {
    expect(entryCallsOf('t')).toEqual([]);
  });

  it('is not added for a second element above the first', () => {
    expect(entryCallsOf('sl')).toEqual(['add']);
  });

  it('is left once when the last element closes another way', () => {
    expect(entryCallsOf('st')).toEqual(['add', 'leave']);
  });

  it('is kept while an element stays open', () => {
    expect(entryCallsOf('slt')).toEqual(['add']);
  });

  it('is left once only when an element reports twice it has closed', () => {
    expect(entryCallsOf('stt')).toEqual(['add', 'leave']);
  });

  it('is not added again by Escape while another element stays open', () => {
    expect(entryCallsOf('sl', '', '--x')).toEqual(['add']);
  });

  it('is untouched by Escape', () => {
    expect(entryCallsOf('s', '', '-x')).toEqual(['add']);
  });
});

describe('the history entry, after a step back', () => {
  it('is added again when an element stays open', () => {
    expect(entryCallsOf('sl', '--x')).toEqual(['add', 'add']);
  });

  it('is neither added nor left when the step closes the last element', () => {
    expect(entryCallsOf('s-t', '-x')).toEqual(['add']);
  });

  it('is added for an element that opens next', () => {
    expect(entryCallsOf('s-tl', '-x')).toEqual(['add', 'add']);
  });

  it('is added for an element that opens once the app has stepped back', () => {
    expect(entryCallsOf('st-l', '--x')).toEqual(['add', 'leave', 'add']);
  });

  it('is added for an element that opened while the app stepped back', () => {
    expect(entryCallsOf('stl', '---x')).toEqual(['add', 'leave', 'add']);
  });

  it('is not added while nothing is open', () => {
    expect(entryCallsOf('', 'x')).toEqual([]);
  });
});

describe('a change of the history entry', () => {
  it('waits for the change before it', () => {
    const calls: string[] = [];
    const scheduler = new TestScheduler(() => undefined);
    scheduler.run(({ hot, cold, expectObservable }) => {
      const closings$ = closeWhatIsOpen({
        entry: {
          add: () => cold('5ms |'),
          leave: noting(calls, () => `left at ${scheduler.now()}`)
        }
      })({ reports: hot('st', OPENED_THEN_CLOSED), escapes: hot(''), steps: hot('') });

      expectObservable(closings$).toBe('');
    });

    expect(calls).toEqual(['left at 5']);
  });

  it('holds back the closing that follows it', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ hot, cold, expectObservable }) => {
      const closings$ = closeWhatIsOpen({ entry: { add: () => cold('5ms |'), leave: () => EMPTY } })({
        reports: hot('ls', OPENED_THEN_CLOSED),
        escapes: hot(''),
        steps: hot('--x')
      });

      expectObservable(closings$).toBe('5ms -----s', { s: 'spot' });
    });
  });
});
