import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { closedWhenAsked, followed, NEVER_ASKED, toggleTold } from './closable';

const closedAfter = (asks: number, stopBefore = false): readonly string[] => {
  const closed: string[] = [];
  const closings = new Subject<void>();
  const stop = closedWhenAsked(closings, (element: string) => {
    closed.push(element);
  })('the list');
  if (stopBefore) {
    stop();
  }
  Array.from({ length: asks }, () => closings.next());
  return closed;
};

describe('an element closed when asked', () => {
  it('stays open until it is asked to close', () => {
    expect(closedAfter(0)).toEqual([]);
  });

  it('closes each time it is asked to', () => {
    expect(closedAfter(2)).toEqual(['the list', 'the list']);
  });

  it('is no longer asked once it has gone', () => {
    expect(closedAfter(1, true)).toEqual([]);
  });
});

describe('an element that follows values', () => {
  it('is given each value with the element', () => {
    const seen: string[] = [];
    const values = new Subject<number>();
    followed(values, (element: string, value: number) => {
      seen.push(`${element} ${value}`);
    })('the track');
    values.next(2);

    expect(seen).toEqual(['the track 2']);
  });
});

const toldAfter = (newState: string): readonly boolean[] => {
  const told: boolean[] = [];
  toggleTold({
    ...NEVER_ASKED,
    onToggle: (open) => {
      told.push(open);
    }
  })({ newState });
  return told;
};

describe('an element that tells when it opens', () => {
  it('tells it opens', () => {
    expect(toldAfter('open')).toEqual([true]);
  });

  it('tells it closes', () => {
    expect(toldAfter('closed')).toEqual([false]);
  });

  it('tells nobody when nobody listens', () => {
    expect(toggleTold(NEVER_ASKED)({ newState: 'open' })).toBeUndefined();
  });
});
