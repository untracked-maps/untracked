import { describe, expect, it } from 'vitest';
import {
  hasGrip,
  nearestStop,
  reachesTop,
  type SheetHeights,
  settledStop,
  sheetHeights,
  stopAbove,
  stopBelow
} from './sheet-heights';

const TALL: SheetHeights = { peek: 150, half: 388, full: 780 };
const SHORT: SheetHeights = { peek: 150, half: 300, full: 300 };
const FLAT: SheetHeights = { peek: 120, half: 120, full: 120 };

describe('sheet heights', () => {
  it('leave 80 px of map above a full sheet', () => {
    expect(sheetHeights({ content: 2000, viewport: 844 }).full).toBe(764);
  });

  it('never make a full sheet taller than its content', () => {
    expect(sheetHeights({ content: 500, viewport: 844 }).full).toBe(500);
  });

  it('open a half sheet on 46 % of the screen, rounded', () => {
    expect(sheetHeights({ content: 2000, viewport: 844 }).half).toBe(388);
  });

  it('never make a half sheet taller than its content', () => {
    expect(sheetHeights({ content: 200, viewport: 844 }).half).toBe(200);
  });

  it('peek at 150 px when the content marks no end of peek', () => {
    expect(sheetHeights({ content: 2000, viewport: 844 }).peek).toBe(150);
  });

  it('peek down to the end the content marks', () => {
    expect(sheetHeights({ content: 2000, viewport: 844, peekEnd: 96 }).peek).toBe(96);
  });

  it('never peek higher than a half sheet', () => {
    expect(sheetHeights({ content: 2000, viewport: 844, peekEnd: 600 }).peek).toBe(388);
  });
});

describe('sheet heights beside the room of a notice', () => {
  it('keep a half sheet out of the room of a notice', () => {
    expect(sheetHeights({ content: 2000, viewport: 320, noticeEnd: 180 }).half).toBe(140);
  });

  it('raise a full sheet that would stop in the room of a notice to 80 px of the top', () => {
    expect(sheetHeights({ content: 461, viewport: 640, noticeEnd: 180 }).full).toBe(560);
  });

  it('leave a full sheet that stops under the room of a notice at its content', () => {
    expect(sheetHeights({ content: 460, viewport: 640, noticeEnd: 180 }).full).toBe(460);
  });

  it('leave a full sheet that already reaches 80 px of the top as it is', () => {
    expect(sheetHeights({ content: 2000, viewport: 640, noticeEnd: 180 }).full).toBe(560);
  });
});

describe('the stop above', () => {
  it('is the half sheet from a peek', () => {
    expect(stopAbove('peek', TALL)).toBe('half');
  });

  it('is the full sheet from a half one', () => {
    expect(stopAbove('half', TALL)).toBe('full');
  });

  it('skips a stop that is no taller', () => {
    expect(stopAbove('peek', { peek: 150, half: 150, full: 400 })).toBe('full');
  });

  it('stays where it is at the top', () => {
    expect(stopAbove('full', TALL)).toBe('full');
  });
});

describe('the stop below', () => {
  it('is the half sheet from a full one', () => {
    expect(stopBelow('full', TALL)).toBe('half');
  });

  it('skips a stop that is no shorter', () => {
    expect(stopBelow('full', SHORT)).toBe('peek');
  });

  it('stays where it is at the bottom', () => {
    expect(stopBelow('peek', TALL)).toBe('peek');
  });
});

describe('the nearest stop', () => {
  it('is the peek for a height close to it', () => {
    expect(nearestStop(200, TALL)).toBe('peek');
  });

  it('is the half sheet for a height close to it', () => {
    expect(nearestStop(300, TALL)).toBe('half');
  });

  it('is the full sheet for a height close to it', () => {
    expect(nearestStop(700, TALL)).toBe('full');
  });

  it('is the lower one of two stops as close', () => {
    expect(nearestStop(269, TALL)).toBe('peek');
  });
});

describe('a sheet', () => {
  it('has a grip when it can grow', () => {
    expect(hasGrip(TALL)).toBe(true);
  });

  it('has no grip when it has a single height', () => {
    expect(hasGrip(FLAT)).toBe(false);
  });

  it('settles on the half stop when the full one is no taller', () => {
    expect(settledStop('full', SHORT)).toBe('half');
  });

  it('stays full when the full stop is taller', () => {
    expect(settledStop('full', TALL)).toBe('full');
  });

  it('stays on a peek whatever the heights', () => {
    expect(settledStop('peek', SHORT)).toBe('peek');
  });
});

describe('a sheet reaching the top', () => {
  it('reaches the top once it leaves 80 px of map above it', () => {
    expect(reachesTop(764, 844)).toBe(true);
  });

  it('stays below the top while it leaves more than 80 px of map', () => {
    expect(reachesTop(763, 844)).toBe(false);
  });
});
