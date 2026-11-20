import { from, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { isDragged, type Sheet, type SheetEvent, sheetHeight, sheetOf } from './sheet-gesture';
import type { SheetStop } from './sheet-heights';

type Touched = Extract<SheetEvent, { readonly kind: 'touched' }>;

const MEASURED: SheetEvent = { kind: 'measured', heights: { peek: 150, half: 388, full: 780 } };

const touch = (extra: Partial<Touched> = {}): Touched => ({
  kind: 'touched',
  x: 100,
  y: 500,
  time: 0,
  sideways: false,
  scrolled: false,
  ...extra
});

const move = (dx: number, dy: number): Extract<SheetEvent, { readonly kind: 'moved' }> => ({
  kind: 'moved',
  x: 100 + dx,
  y: 500 + dy
});

const played = (events: readonly SheetEvent[], opening: SheetStop = 'peek'): Promise<Sheet> =>
  lastValueFrom(sheetOf(from<SheetEvent[]>([{ kind: 'opened', stop: opening }, MEASURED, ...events])));

const heightAfter = async (events: readonly SheetEvent[], opening?: SheetStop): Promise<number> =>
  sheetHeight(await played(events, opening));

describe('a finger on the sheet', () => {
  it('moves nothing before 6 px', async () => {
    await expect(heightAfter([touch(), move(0, -5)])).resolves.toBe(150);
  });

  it('is not yet a drag before 6 px', async () => {
    expect(isDragged(await played([touch(), move(3, -5)]))).toBe(false);
  });

  it('drags the sheet from 6 px', async () => {
    await expect(heightAfter([touch(), move(0, -6)])).resolves.toBe(156);
  });

  it('counts the 6 px in a straight line', async () => {
    await expect(heightAfter([touch(), move(3, -5.5)])).resolves.toBe(155.5);
  });

  it('is a drag once the sheet follows it', async () => {
    expect(isDragged(await played([touch(), move(0, -100)]))).toBe(true);
  });

  it('makes the sheet follow it upwards', async () => {
    await expect(heightAfter([touch(), move(0, -100)])).resolves.toBe(250);
  });

  it('makes the sheet follow it downwards', async () => {
    await expect(heightAfter([touch(), move(0, 60)], 'half')).resolves.toBe(328);
  });

  it('keeps dragging once it started, even back within 6 px of where it touched', async () => {
    await expect(heightAfter([touch(), move(0, -100), move(0, -3)])).resolves.toBe(153);
  });

  it('keeps dragging once it started, even sideways', async () => {
    await expect(heightAfter([touch(), move(0, -100), move(80, -120)])).resolves.toBe(270);
  });
});

describe('a finger that goes sideways', () => {
  it('never moves the sheet when it goes rather sideways', async () => {
    await expect(heightAfter([touch(), move(50, -20)])).resolves.toBe(150);
  });

  it('never moves the sheet when it goes as much sideways as up', async () => {
    await expect(heightAfter([touch(), move(10, -10)])).resolves.toBe(150);
  });

  it('moves the sheet when it goes a little more up than sideways', async () => {
    await expect(heightAfter([touch(), move(10, -11)])).resolves.toBe(161);
  });

  it('is left alone until the next touch once it went sideways', async () => {
    await expect(heightAfter([touch(), move(50, -20), move(50, -200)])).resolves.toBe(150);
  });

  it('must go two and a half times more up than sideways on a row that scrolls sideways', async () => {
    await expect(heightAfter([touch({ sideways: true }), move(10, -25)])).resolves.toBe(150);
  });

  it('moves the sheet from a row that scrolls sideways when it goes clearly up', async () => {
    await expect(heightAfter([touch({ sideways: true }), move(10, -26)])).resolves.toBe(176);
  });
});

describe('a sheet under the finger', () => {
  it('never drags the sheet under 40 px', async () => {
    await expect(heightAfter([touch(), move(0, 300)])).resolves.toBe(40);
  });

  it('never drags the sheet more than 24 px over its full height', async () => {
    await expect(heightAfter([touch(), move(0, -900)], 'half')).resolves.toBe(804);
  });

  it('does nothing without a touch first', async () => {
    await expect(heightAfter([move(0, -100)])).resolves.toBe(150);
  });

  it('forgets the gesture under way when its content changes', async () => {
    await expect(heightAfter([touch(), move(0, -100), { kind: 'opened', stop: 'peek' }])).resolves.toBe(150);
  });
});

describe('a finger on a full sheet', () => {
  it('scrolls the content rather than the sheet upwards', async () => {
    await expect(heightAfter([touch(), move(0, -100)], 'full')).resolves.toBe(780);
  });

  it('scrolls the content back rather than the sheet downwards', async () => {
    await expect(heightAfter([touch({ scrolled: true }), move(0, 100)], 'full')).resolves.toBe(780);
  });

  it('pulls the sheet down once the content is at its top', async () => {
    await expect(heightAfter([touch(), move(0, 100)], 'full')).resolves.toBe(680);
  });
});
