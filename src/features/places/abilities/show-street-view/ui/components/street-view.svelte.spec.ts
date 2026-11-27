import { BehaviorSubject, of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { type Closable, NEVER_ASKED } from '#libraries/design/closable';
import type { StreetView as View } from '../../domain/show-street-view';
import StreetView from './street-view.svelte';

const NAME = 'Café de Flore';

const PANORAMA = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1000"/>')}`;

const SHOWN: View = { status: 'shown', name: NAME, image: 'street-views/cafe-01.svg', facing: 0.75 };

const shownOver = async (sheetHeight = 0, view: View = SHOWN, closable: Closable = NEVER_ASKED): Promise<void> => {
  await page.viewport(390, 844);
  await render(StreetView, { view: of(view), sheetHeight: of(sheetHeight), source: () => PANORAMA, closable });
};

const opened = async (closable: Closable = NEVER_ASKED): Promise<void> => {
  await shownOver(0, SHOWN, closable);
  await page.getByRole('button', { name: 'See the street view' }).click();
  await expect.element(page.getByRole('dialog', { name: `Street view: ${NAME}` })).toBeVisible();
};

const panorama = (): Element => document.querySelector('.pano') ?? document.body;

describe('the thumbnail of the shop front', () => {
  it('shows the front of the place', async () => {
    await shownOver();

    await expect.element(page.getByRole('img', { name: `Front of ${NAME}` })).toBeVisible();
  });

  it('is not there without a street view', async () => {
    await shownOver(0, { status: 'none' });

    await expect.element(page.getByRole('button', { name: 'See the street view' })).not.toBeInTheDocument();
  });

  it('is hidden once the sheet reaches 60 % of the screen', async () => {
    await shownOver(507);

    await expect.element(page.getByRole('button', { name: 'See the street view' })).not.toBeInTheDocument();
  });

  it('stays below that', async () => {
    await shownOver(506);

    await expect.element(page.getByRole('button', { name: 'See the street view' })).toBeVisible();
  });

  it('comes back when the sheet goes down', async () => {
    const heights = new BehaviorSubject(700);
    await page.viewport(390, 844);
    await render(StreetView, { view: of(SHOWN), sheetHeight: heights, source: () => PANORAMA });
    heights.next(200);

    await expect.element(page.getByRole('button', { name: 'See the street view' })).toBeVisible();
  });

  it('is cut where the place stands', async () => {
    await shownOver();

    expect(
      getComputedStyle(page.getByRole('button', { name: 'See the street view' }).element()).getPropertyValue('--facing')
    ).toBe('0.75');
  });

  it('is 112 px wide on a phone', async () => {
    await shownOver();

    expect(page.getByRole('button', { name: 'See the street view' }).element()).toHaveProperty('offsetWidth', 112);
  });
});

describe('the street view of a place', () => {
  it('tells how to look around', async () => {
    await opened();

    await expect.element(page.getByText('Street view · scroll to look around')).toBeVisible();
  });

  it('shows the whole picture', async () => {
    await opened();

    await expect.element(page.getByRole('img', { name: `360° view in front of ${NAME}` })).toBeVisible();
  });

  it('credits the picture as a sample', async () => {
    await opened();

    await expect.element(page.getByText('Sample image')).toBeVisible();
  });

  it('opens facing the place', async () => {
    await opened();

    expect(Math.round(panorama().scrollLeft)).toBe(Math.round(0.75 * panorama().scrollWidth - panorama().clientWidth / 2));
  });

  it('is on black', async () => {
    await opened();

    expect(getComputedStyle(page.getByRole('dialog').element()).backgroundColor).toBe('rgb(0, 0, 0)');
  });

  it('closes with its round button', async () => {
    await opened();
    await page.getByRole('button', { name: 'Close' }).click();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when asked to', async () => {
    const closings = new Subject<void>();
    await opened({ ...NEVER_ASKED, closings });
    closings.next();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('tells when it opens', async () => {
    const told: boolean[] = [];
    await opened({
      ...NEVER_ASKED,
      onToggle: (open): void => {
        told.push(open);
      }
    });

    expect(told).toEqual([true]);
  });

  it('tells when it closes', async () => {
    const told: boolean[] = [];
    await opened({
      ...NEVER_ASKED,
      onToggle: (open): void => {
        told.push(open);
      }
    });
    await page.getByRole('button', { name: 'Close' }).click();

    await expect.poll(() => told).toEqual([true, false]);
  });
});
