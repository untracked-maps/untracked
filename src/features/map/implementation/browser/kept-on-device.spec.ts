import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { keptInMemory, keptOnDevice } from './kept-on-device';

const KEY = 'choice';

const storageHolding = (kept?: string): Pick<Storage, 'getItem' | 'setItem'> => {
  const values = new Map<string, string>(kept === undefined ? [] : [[KEY, kept]]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value): void => {
      values.set(key, value);
    }
  };
};

const CHOICES = ['plan', 'satellite'] as const;

const TOGGLE = [false, true] as const;

describe('kept on device', () => {
  it('is the first value on a first visit', async () => {
    expect(await firstValueFrom(keptOnDevice(storageHolding(), KEY, CHOICES).kept())).toBe('plan');
  });

  it('reads a value kept on an earlier visit', async () => {
    expect(await firstValueFrom(keptOnDevice(storageHolding('satellite'), KEY, CHOICES).kept())).toBe('satellite');
  });

  it('is the first value when the kept one is not a known value', async () => {
    expect(await firstValueFrom(keptOnDevice(storageHolding('terrain'), KEY, CHOICES).kept())).toBe('plan');
  });

  it('reads a kept toggle', async () => {
    expect(await firstValueFrom(keptOnDevice(storageHolding('true'), KEY, TOGGLE).kept())).toBe(true);
  });

  it('is the value just kept', async () => {
    const kept = keptOnDevice(storageHolding(), KEY, CHOICES);

    kept.keep('satellite');

    expect(await firstValueFrom(kept.kept())).toBe('satellite');
  });

  it('keeps the value for a later visit', async () => {
    const storage = storageHolding();
    keptOnDevice(storage, KEY, TOGGLE).keep(true);

    expect(await firstValueFrom(keptOnDevice(storage, KEY, TOGGLE).kept())).toBe(true);
  });
});

describe('kept in memory', () => {
  it('is the first value at first', async () => {
    expect(await firstValueFrom(keptInMemory(CHOICES).kept())).toBe('plan');
  });

  it('is the value just kept', async () => {
    const kept = keptInMemory(CHOICES);

    kept.keep('satellite');

    expect(await firstValueFrom(kept.kept())).toBe('satellite');
  });
});
