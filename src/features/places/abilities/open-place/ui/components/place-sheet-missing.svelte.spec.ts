import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const MISSING: PlaceSheet = { status: 'missing', at: { longitude: 2.29, latitude: 48.86 } };

type Recorded = { readonly calls: readonly string[] };

const rendered = async (): Promise<Recorded> => {
  const calls: string[] = [];
  await render(PlaceSheetCard, {
    sheet: of(MISSING),
    onClose: (): void => {
      calls.push('closed');
    },
    onCopy: () => undefined,
    vibrate: () => undefined,
    onShare: (): void => {
      calls.push('shared');
    }
  });
  return { calls };
};

describe('the sheet of a place that cannot be found', () => {
  it('is a region named "Place not found"', async () => {
    await rendered();

    await expect.element(page.getByRole('region', { name: 'Place not found' })).toBeVisible();
  });

  it('is titled "Place not found"', async () => {
    await rendered();

    await expect.element(page.getByRole('heading', { name: 'Place not found' })).toBeVisible();
  });

  it('says why just under its title', async () => {
    await rendered();

    expect(page.getByRole('heading', { name: 'Place not found' }).element().nextElementSibling?.textContent).toBe(
      'This place cannot be found: it may have closed, or the link is incomplete.'
    );
  });

  it('closes with its button', async () => {
    const recorded = await rendered();

    await page.getByRole('button', { name: 'Close the sheet' }).click();

    expect(recorded.calls).toEqual(['closed']);
  });

  it('offers nothing to share', async () => {
    await rendered();

    await expect.element(page.getByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });
});

const HANDLE = /^(?:Enlarge|Reduce) the sheet$/u;

const handleOnSmallScreen = async (): Promise<ReturnType<typeof page.getByRole>> => {
  await page.viewport(320, 150);
  await rendered();
  return page.getByRole('button', { name: HANDLE });
};

describe('the handle of the sheet of a place that cannot be found, on a small screen', () => {
  it('enlarges the sheet', async () => {
    const handle = await handleOnSmallScreen();

    await expect.element(handle).toHaveAccessibleName('Enlarge the sheet');
  });

  it('reduces the sheet once enlarged', async () => {
    const handle = await handleOnSmallScreen();

    await handle.click();

    await expect.element(handle).toHaveAccessibleName('Reduce the sheet');
  });
});
