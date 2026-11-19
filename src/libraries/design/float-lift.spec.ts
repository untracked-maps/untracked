import { describe, expect, it } from 'vitest';
import { type FloatMeasures, floatLift } from './float-lift';

const PHONE: FloatMeasures = { sheetHeight: 150, stackHeight: 270, viewportHeight: 844, topBarBottom: 110, inset: 20 };

describe('what floats above a bottom sheet', () => {
  it('stays in place and visible without a sheet, even on a tiny screen', () => {
    expect(floatLift({ ...PHONE, sheetHeight: 0, viewportHeight: 300 })).toEqual({ offset: 0, hidden: false });
  });

  it('rises 8 px above the sheet', () => {
    expect(floatLift(PHONE).offset).toBe(138);
  });

  it('rises from where it rests', () => {
    expect(floatLift({ ...PHONE, inset: 12 }).offset).toBe(146);
  });

  it('never goes down for a sheet lower than where it rests', () => {
    expect(floatLift({ ...PHONE, sheetHeight: 5 }).offset).toBe(0);
  });

  it('stays visible above a low sheet', () => {
    expect(floatLift(PHONE).hidden).toBe(false);
  });

  it('stays visible above a half sheet on a tall phone', () => {
    expect(floatLift({ ...PHONE, sheetHeight: 388 }).hidden).toBe(false);
  });

  it('hides when it no longer fits between the sheet and the top bar', () => {
    expect(floatLift({ ...PHONE, sheetHeight: 600 }).hidden).toBe(true);
  });

  it('hides on a small phone whose top bar is tall', () => {
    expect(floatLift({ ...PHONE, viewportHeight: 568, topBarBottom: 300 }).hidden).toBe(true);
  });

  it('stays visible when it fits exactly, with its 8 px', () => {
    expect(floatLift({ ...PHONE, sheetHeight: 456 }).hidden).toBe(false);
  });

  it('hides when one pixel is missing', () => {
    expect(floatLift({ ...PHONE, sheetHeight: 457 }).hidden).toBe(true);
  });
});
