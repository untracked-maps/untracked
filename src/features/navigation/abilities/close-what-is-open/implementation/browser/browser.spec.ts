import { EMPTY, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { escapePresses } from './escape-presses';
import { historyEntry } from './history-entry';
import { historySteps } from './history-steps';

const keyPress = (key: string): Event => Object.assign(new Event('keydown'), { key });

const historyStep = (state: unknown): Event => Object.assign(new Event('popstate'), { state });

const pressesOf = (events: readonly Event[]): number => {
  const presses: unknown[] = [];
  const target = new EventTarget();
  const subscription = escapePresses(target).subscribe((press) => {
    presses.push(press);
  });
  events.map((event) => target.dispatchEvent(event));
  subscription.unsubscribe();
  return presses.length;
};

const stepsOf = (events: readonly Event[]): number => {
  const steps: unknown[] = [];
  const target = new EventTarget();
  const subscription = historySteps(target).subscribe((step) => {
    steps.push(step);
  });
  events.map((event) => target.dispatchEvent(event));
  subscription.unsubscribe();
  return steps.length;
};

const callsOf = async (change: 'add' | 'leave' | 'none'): Promise<readonly string[]> => {
  const calls: string[] = [];
  const entry = historyEntry(
    () => {
      calls.push('pushed');
      return Promise.resolve();
    },
    {
      back: (): void => {
        calls.push('back');
      }
    }
  );
  await lastValueFrom(change === 'none' ? EMPTY : entry[change](), { defaultValue: undefined });
  return calls;
};

describe('presses of the Escape key', () => {
  it('tell each press of the Escape key', () => {
    expect(pressesOf([keyPress('Escape'), keyPress('Escape')])).toBe(2);
  });

  it('ignore the other keys', () => {
    expect(pressesOf([keyPress('Enter')])).toBe(0);
  });

  it('ignore what is not a key press', () => {
    expect(pressesOf([new Event('keydown')])).toBe(0);
  });
});

describe('history steps', () => {
  it('tell each step to an entry the app knows', () => {
    expect(stepsOf([historyStep({}), historyStep({})])).toBe(2);
  });

  it('ignore an address typed or pasted, which comes without a state', () => {
    expect(stepsOf([historyStep(null)])).toBe(0);
  });

  it('ignore what is not a step in the history', () => {
    expect(stepsOf([new Event('popstate')])).toBe(0);
  });
});

describe('the history entry', () => {
  it('is added by pushing an entry', async () => {
    expect(await callsOf('add')).toEqual(['pushed']);
  });

  it('is left by stepping back', async () => {
    expect(await callsOf('leave')).toEqual(['back']);
  });

  it('is left alone until a change is asked for', async () => {
    expect(await callsOf('none')).toEqual([]);
  });
});
