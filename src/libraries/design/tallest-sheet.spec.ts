import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { tallestSheet } from './tallest-sheet';

describe('tallestSheet', () => {
  it('is 0 while no sheet has told its height', async () => {
    expect(await firstValueFrom(tallestSheet().tallest)).toBe(0);
  });

  it('is the height of the tallest sheet', async () => {
    const sheets = tallestSheet();

    sheets.of('spot')(120);
    sheets.of('place')(300);

    expect(await firstValueFrom(sheets.tallest)).toBe(300);
  });

  it('follows a sheet whose height changes', async () => {
    const sheets = tallestSheet();

    sheets.of('spot')(400);
    sheets.of('place')(300);
    sheets.of('spot')(0);

    expect(await firstValueFrom(sheets.tallest)).toBe(300);
  });
});
