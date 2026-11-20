import { describe, expect, it } from 'vitest';
import { type FloatMeasures, floatLift } from './float-lift';

const PHONE: FloatMeasures = { stackHeight: 270, viewportHeight: 844, topBarBottom: 110, inset: 20 };

const lift = (sheetHeight: number, measures: Partial<FloatMeasures> = {}): ReturnType<typeof floatLift> =>
  floatLift(sheetHeight, () => ({ ...PHONE, ...measures }));

describe('what floats above a bottom sheet', () => {
  it('measures nothing while no sheet shows', () => {
    const measured: string[] = [];
    floatLift(0, () => {
      measured.push('measured');
      return PHONE;
    });

    expect(measured).toEqual([]);
  });

  it('stays in place and visible without a sheet, even on a tiny screen', () => {
    expect(lift(0, { viewportHeight: 300 })).toEqual({ offset: 0, hidden: false });
  });
});

describe('what floats above an open bottom sheet', () => {
  it('rises 8 px above the sheet', () => {
    expect(lift(150).offset).toBe(138);
  });

  it('rises from where it rests', () => {
    expect(lift(150, { inset: 12 }).offset).toBe(146);
  });

  it('never goes down for a sheet lower than where it rests', () => {
    expect(lift(5).offset).toBe(0);
  });

  it('stays visible above a low sheet', () => {
    expect(lift(150).hidden).toBe(false);
  });

  it('stays visible above a half sheet on a tall phone', () => {
    expect(lift(388).hidden).toBe(false);
  });

  it('hides when it no longer fits between the sheet and the top bar', () => {
    expect(lift(600).hidden).toBe(true);
  });

  it('hides on a small phone whose top bar is tall', () => {
    expect(lift(150, { viewportHeight: 568, topBarBottom: 300 }).hidden).toBe(true);
  });

  it('stays visible when it fits exactly, with its 8 px', () => {
    expect(lift(456).hidden).toBe(false);
  });

  it('hides when one pixel is missing', () => {
    expect(lift(457).hidden).toBe(true);
  });
});
