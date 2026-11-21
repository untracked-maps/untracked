import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Notice, showNotice } from './show-notice';

const COPIED: Notice = { text: 'Link copied' };
const SAVED: Notice = { text: 'Saved in Favourites' };
const CLEARED: Notice = { text: 'Recent places cleared', action: { label: 'Undo', run: (): void => undefined } };
const TOLD: Readonly<Record<string, Notice>> = { c: COPIED, s: SAVED, u: CLEARED };
const NOTICES: Readonly<Record<string, Notice | undefined>> = { ...TOLD, n: undefined };

type Marbles = {
  readonly told: string;
  readonly acted?: string;
};

const expectShown = ({ told, acted = '' }: Marbles, expected: string): void =>
  new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ hot, expectObservable }) => {
    const shown$ = showNotice({ told: hot(told, TOLD), acted: hot(acted, { a: undefined }) });

    expectObservable(shown$, '^ 20s !').toBe(expected, NOTICES);
  });

describe('a notice', () => {
  it('is absent until something is told', () => {
    expectShown({ told: '' }, 'n');
  });

  it('shows what is told, for three and a half seconds', () => {
    expectShown({ told: '-c' }, 'nc 3499ms n');
  });

  it('shows for six seconds when it offers an action', () => {
    expectShown({ told: '-u' }, 'nu 5999ms n');
  });

  it('goes away once its action is taken', () => {
    expectShown({ told: '-u', acted: '- 2s a' }, 'nu 1999ms n');
  });

  it('is replaced by the next one, whose time starts over', () => {
    expectShown({ told: '-c 2s s' }, 'nc 2s s 3499ms n');
  });

  it('is not withdrawn twice when its action is taken twice', () => {
    expectShown({ told: '-u', acted: '- 1s a 1s a' }, 'nu 999ms n');
  });

  it('ignores an action taken while nothing shows', () => {
    expectShown({ told: '--c', acted: 'a' }, 'n-c 3499ms n');
  });
});
