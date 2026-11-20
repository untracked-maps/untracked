import { from, lastValueFrom } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Sheet, type SheetEvent, sheetClosed, sheetHeight, sheetOf } from './sheet-gesture';
import type { SheetHeights, SheetStop } from './sheet-heights';

const TALL: SheetHeights = { peek: 150, half: 388, full: 780 };
const SHORT: SheetHeights = { peek: 150, half: 300, full: 300 };
const GRIP: SheetEvent = { kind: 'gripped' };

const sheetAfter = (events: readonly SheetEvent[], opening: SheetStop): Promise<Sheet> =>
  lastValueFrom(
    sheetOf(from<SheetEvent[]>([{ kind: 'opened', stop: opening }, { kind: 'measured', heights: TALL }, ...events]))
  );

const stopAfter = async (events: readonly SheetEvent[], opening: SheetStop = 'peek'): Promise<SheetStop> =>
  (await sheetAfter(events, opening)).stop;

describe('a sheet', () => {
  it('has no height before it is measured', async () => {
    expect(sheetHeight(await lastValueFrom(sheetOf(from([]))))).toBe(0);
  });

  it('opens at the height asked', async () => {
    expect(sheetHeight(await sheetAfter([], 'half'))).toBe(388);
  });

  it('settles on the half stop when measured too short to be full', async () => {
    await expect(stopAfter([{ kind: 'measured', heights: SHORT }], 'full')).resolves.toBe('half');
  });

  it('follows its content when it is measured again', async () => {
    expect(sheetHeight(await sheetAfter([{ kind: 'measured', heights: SHORT }], 'half'))).toBe(300);
  });

  it('opens full before it is measured, then stays full', async () => {
    await expect(
      lastValueFrom(
        sheetOf(
          from<SheetEvent[]>([
            { kind: 'opened', stop: 'full' },
            { kind: 'measured', heights: TALL }
          ])
        )
      )
    ).resolves.toHaveProperty('stop', 'full');
  });

  it('goes back to its opening height when its content changes', async () => {
    await expect(stopAfter([GRIP, { kind: 'opened', stop: 'peek' }])).resolves.toBe('peek');
  });
});

describe('the grip', () => {
  it('grows a peeking sheet to full', async () => {
    await expect(stopAfter([GRIP])).resolves.toBe('full');
  });

  it('grows a half sheet to full', async () => {
    await expect(stopAfter([GRIP], 'half')).resolves.toBe('full');
  });

  it('reduces a full sheet to half', async () => {
    await expect(stopAfter([GRIP], 'full')).resolves.toBe('half');
  });

  it('leaves a sheet too short to be full on its half stop', async () => {
    await expect(stopAfter([{ kind: 'measured', heights: SHORT }, GRIP])).resolves.toBe('half');
  });
});

describe('the wheel', () => {
  it('grows the sheet to full', async () => {
    await expect(stopAfter([{ kind: 'wheeled' }])).resolves.toBe('full');
  });

  it('keeps a full sheet full', async () => {
    await expect(stopAfter([{ kind: 'wheeled' }], 'full')).resolves.toBe('full');
  });
});

describe('the closing of a sheet', () => {
  const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  const Open: Sheet = { stop: 'peek', heights: TALL, closing: false, drag: undefined };
  const Closing: Sheet = { ...Open, closing: true };

  it('is told 180 ms after it starts, once', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const sheet$ = cold('a-c-c', { a: Open, c: Closing });

      expectObservable(sheetClosed(sheet$)).toBe('-- 180ms (c|)', { c: Closing });
    });
  });
});
