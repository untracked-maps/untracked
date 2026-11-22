import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import { mapCoversOf } from './map-covers';

const placed = (html: string): HTMLElement => {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  onTestFinished(() => root.remove());
  return root;
};

const TOP_BAR = '<div data-sheet-top style="position: fixed; inset-block-start: 0; block-size: 72px"></div>';

const sheet = (height: number): string => `<div data-sheet-open style="--sheet-height: ${height}px"></div>`;

const PANEL =
  '<div data-sheet-open style="position: fixed; inset-inline-start: 12px; inline-size: 400px; block-size: 300px"></div>';

describe('what covers the map on a phone', () => {
  it('ends with the bottom of the top bar', async () => {
    await page.viewport(390, 844);

    expect(mapCoversOf(placed(TOP_BAR)).topBarBottom).toBe(72);
  });

  it('starts at the top without a top bar', async () => {
    await page.viewport(390, 844);

    expect(mapCoversOf(placed('')).topBarBottom).toBe(0);
  });

  it('includes the height a bottom sheet goes to', async () => {
    await page.viewport(390, 844);

    expect(mapCoversOf(placed(sheet(368))).sheet).toEqual({ layout: 'bottom', height: 368 });
  });

  it('includes the tallest of the open sheets', async () => {
    await page.viewport(390, 844);

    expect(mapCoversOf(placed(`${sheet(200)}${sheet(368)}`)).sheet).toEqual({ layout: 'bottom', height: 368 });
  });

  it('includes no sheet when none is open', async () => {
    await page.viewport(390, 844);

    expect(mapCoversOf(placed('<div style="--sheet-height: 368px"></div>')).sheet).toEqual({ layout: 'bottom', height: 0 });
  });
});

describe('what covers the map on a large screen', () => {
  it('includes the width of the side panel and where it ends', async () => {
    await page.viewport(1280, 800);

    expect(mapCoversOf(placed(PANEL)).sheet).toEqual({ layout: 'side', width: 400, end: 412 });
  });

  it('includes no side panel when none is open', async () => {
    await page.viewport(1280, 800);

    expect(mapCoversOf(placed('')).sheet).toEqual({ layout: 'side', width: 0, end: 0 });
  });
});
