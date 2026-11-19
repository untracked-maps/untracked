import { from, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { isDragged, type Sheet, type SheetEvent, sheetHeight, sheetOf } from './sheet-gesture';
import type { SheetHeights, SheetStop } from './sheet-heights';

type Gesture = {
  readonly dx?: number;
  readonly dy: number;
  readonly from?: number;
  readonly to?: number;
};

type Options = {
  readonly opening?: SheetStop;
  readonly closable?: boolean;
  readonly heights?: SheetHeights;
};

const TALL: SheetHeights = { peek: 150, half: 388, full: 780 };
const SHORT: SheetHeights = { peek: 150, half: 300, full: 300 };
const SLOW = 1000;

const gesture = ({ dx = 0, dy, from: start = 0, to = SLOW }: Gesture): readonly SheetEvent[] => [
  { kind: 'touched', x: 0, y: 0, time: start, sideways: false, scrolled: false },
  { kind: 'moved', x: dx, y: dy },
  { kind: 'released', time: to, closable: false }
];

const closableIf =
  (closable: boolean) =>
  (event: SheetEvent): SheetEvent =>
    event.kind === 'released' ? { ...event, closable } : event;

const left = (
  events: readonly SheetEvent[],
  { opening = 'peek', closable = false, heights = TALL }: Options = {}
): Promise<Sheet> =>
  lastValueFrom(
    sheetOf(
      from<SheetEvent[]>([
        { kind: 'opened', stop: opening },
        { kind: 'measured', heights },
        ...events.map(closableIf(closable))
      ])
    )
  );

const stopLeft = async (drag: Gesture, options?: Options): Promise<SheetStop> => (await left(gesture(drag), options)).stop;

const closingLeft = async (drag: Gesture, opening?: SheetStop): Promise<boolean> =>
  (await left(gesture(drag), opening === undefined ? { closable: true } : { closable: true, opening })).closing;

describe('a finger lifted slowly', () => {
  it('leaves the sheet on the nearest stop below', async () => {
    await expect(stopLeft({ dy: -100 })).resolves.toBe('peek');
  });

  it('leaves the sheet on the nearest stop above', async () => {
    await expect(stopLeft({ dy: -150 })).resolves.toBe('half');
  });

  it('leaves the sheet at the height of its stop', async () => {
    expect(sheetHeight(await left(gesture({ dy: -150 })))).toBe(388);
  });

  it('ends the drag', async () => {
    expect(isDragged(await left(gesture({ dy: -150 })))).toBe(false);
  });

  it('settles a sheet too short to be full on its half stop', async () => {
    await expect(stopLeft({ dy: -200 }, { heights: SHORT })).resolves.toBe('half');
  });

  it('keeps the stop of a sheet that was only tapped', async () => {
    await expect(stopLeft({ dy: -2 }, { opening: 'half' })).resolves.toBe('half');
  });

  it('ends a gesture that went sideways, so that later moves do nothing', async () => {
    expect(sheetHeight(await left([...gesture({ dx: 50, dy: -20 }), { kind: 'moved', x: 0, y: -100 }]))).toBe(150);
  });

  it('leaves the sheet where it was after a gesture that went sideways, then far up', async () => {
    const sideways = gesture({ dx: 50, dy: -20 });

    expect((await left([...sideways.slice(0, 2), { kind: 'moved', x: 50, y: -200 }, ...sideways.slice(2)])).stop).toBe('peek');
  });

  it('lets the next touch drag the sheet after a gesture that went sideways', async () => {
    expect(sheetHeight(await left([...gesture({ dx: 50, dy: -20 }), ...gesture({ dy: -100 }).slice(0, 2)]))).toBe(250);
  });
});

describe('a flick', () => {
  it('takes a peeking sheet one stop up', async () => {
    await expect(stopLeft({ dy: -46, to: 100 })).resolves.toBe('half');
  });

  it('is faster than 0.45 px per millisecond', async () => {
    await expect(stopLeft({ dy: -45, to: 100 })).resolves.toBe('peek');
  });

  it('is timed from the touch', async () => {
    await expect(stopLeft({ dy: -46, from: 900, to: 1000 })).resolves.toBe('half');
  });

  it('takes a half sheet one stop up, wherever the finger stopped', async () => {
    await expect(stopLeft({ dy: -30, to: 50 }, { opening: 'half' })).resolves.toBe('full');
  });

  it('takes a full sheet one stop down', async () => {
    await expect(stopLeft({ dy: 46, to: 100 }, { opening: 'full' })).resolves.toBe('half');
  });

  it('is faster than 0.45 px per millisecond downwards too', async () => {
    await expect(stopLeft({ dy: 45, to: 100 }, { opening: 'full' })).resolves.toBe('full');
  });

  it('takes a half sheet one stop down', async () => {
    await expect(stopLeft({ dy: 30, to: 50 }, { opening: 'half' })).resolves.toBe('peek');
  });

  it('leaves at its peek a sheet that cannot be closed', async () => {
    await expect(stopLeft({ dy: 30, to: 50 })).resolves.toBe('peek');
  });
});

describe('a sheet that can be closed', () => {
  it('closes when left under 70 % of its peek', async () => {
    await expect(closingLeft({ dy: 46 })).resolves.toBe(true);
  });

  it('stays open when left at 70 % of its peek', async () => {
    await expect(closingLeft({ dy: 45 })).resolves.toBe(false);
  });

  it('closes when flicked down from its peek', async () => {
    await expect(closingLeft({ dy: 26, to: 50 })).resolves.toBe(true);
  });

  it('closes on a flick faster than 0.5 px per millisecond only', async () => {
    await expect(closingLeft({ dy: 25, to: 50 })).resolves.toBe(false);
  });

  it('goes down one stop, without closing, when flicked down from above its peek', async () => {
    await expect(closingLeft({ dy: 30, to: 50 }, 'half')).resolves.toBe(false);
  });

  it('has no height left once it closes', async () => {
    expect(sheetHeight(await left(gesture({ dy: 46 }), { closable: true }))).toBe(0);
  });

  it('ends the drag that closes it', async () => {
    expect(isDragged(await left(gesture({ dy: 46 }), { closable: true }))).toBe(false);
  });
});

describe('a sheet that cannot be closed', () => {
  it('stays open when left under its peek', async () => {
    expect((await left([], { closable: false })).closing).toBe(false);
  });

  it('goes back to its peek when left under it', async () => {
    expect(sheetHeight(await left(gesture({ dy: 100 })))).toBe(150);
  });

  it('does not close when left under 70 % of its peek', async () => {
    expect((await left(gesture({ dy: 100 }))).closing).toBe(false);
  });
});
