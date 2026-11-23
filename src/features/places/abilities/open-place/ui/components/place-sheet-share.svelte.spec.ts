import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const FLORE: SheetPlace = { id: 'flore', name: 'Café de Flore', coordinates: { longitude: 2.3326, latitude: 48.854 } };

const OPEN: PlaceSheet = { status: 'open', place: FLORE, from: 'search' };

const sharedFrom = async (): Promise<readonly unknown[]> => {
  const shared: unknown[] = [];
  await render(PlaceSheetCard, {
    sheet: of(OPEN),
    onClose: () => undefined,
    onCopy: () => undefined,
    vibrate: () => undefined,
    onShare: (place: unknown): void => {
      shared.push(place);
    }
  });
  return shared;
};

const boxOf = (name: string): DOMRect => page.getByRole('button', { name }).element().getBoundingClientRect();

describe('sharing the sheet of a place', () => {
  it('is offered by a button named "Share"', async () => {
    await sharedFrom();

    await expect.element(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  it('shares the name, the position and the identifier of the place', async () => {
    const shared = await sharedFrom();

    await page.getByRole('button', { name: 'Share' }).click();

    expect(shared).toEqual([{ title: 'Café de Flore', at: FLORE.coordinates, place: 'flore' }]);
  });

  it('stands 14 px from the left edge of the sheet', async () => {
    await sharedFrom();
    const sheet = page.getByRole('region', { name: 'Café de Flore' }).element().getBoundingClientRect();

    expect(boxOf('Share').left - sheet.left).toBe(14);
  });

  it('stands level with the close button, on the other side', async () => {
    await sharedFrom();
    const sheet = page.getByRole('region', { name: 'Café de Flore' }).element().getBoundingClientRect();
    const [share, close] = [boxOf('Share'), boxOf('Close the sheet')];

    expect([share.top, share.left - sheet.left]).toEqual([close.top, sheet.right - close.right]);
  });

  it('answers a touch 6 px beyond its edge', async () => {
    const shared = await sharedFrom();

    await page.getByRole('button', { name: 'Share' }).click({ position: { x: -5, y: 16 } });

    expect(shared).toHaveLength(1);
  });

  it('is not offered when the page cannot share', async () => {
    await render(PlaceSheetCard, {
      sheet: of(OPEN),
      onClose: () => undefined,
      onCopy: () => undefined,
      vibrate: () => undefined
    });

    await expect.element(page.getByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });
});
