import { describe, expect, it } from 'vitest';
import { thumbShown } from './thumb-shown';

describe('the thumbnail of the shop front', () => {
  it.each([
    { sheet: 0, shown: true },
    { sheet: 479, shown: true },
    { sheet: 480, shown: false },
    { sheet: 700, shown: false }
  ])('is shown $shown over a sheet of $sheet px in 800 px', ({ sheet, shown }) => {
    expect(thumbShown(sheet, 800)).toBe(shown);
  });
});
