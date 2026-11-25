import { BehaviorSubject, of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { DistrictSheet } from '../../domain/open-district';
import DistrictSheetCard from './district-sheet.svelte';

const MARAIS: DistrictSheet = {
  status: 'open',
  district: {
    name: 'Le Marais',
    postalCode: '75004',
    addressLocality: 'Paris',
    coordinates: { longitude: 2.36, latitude: 48.859 }
  },
  outline: []
};

const shown = async (sheet: DistrictSheet, onClose: () => void = (): void => undefined): Promise<void> => {
  await render(DistrictSheetCard, { sheet: of(sheet), onClose });
};

describe('the sheet of a district', () => {
  it('is a region named by the district', async () => {
    await shown(MARAIS);

    await expect.element(page.getByRole('region', { name: 'Le Marais' })).toBeVisible();
  });

  it('gives the city of the district under its name', async () => {
    await shown(MARAIS);

    await expect.element(page.getByRole('region', { name: 'Le Marais' }).getByText('Paris', { exact: true })).toBeVisible();
  });

  it('shows nothing while no district is open', async () => {
    await shown({ status: 'closed' });

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('closes with its button', async () => {
    const closes: string[] = [];
    await shown(MARAIS, (): void => {
      closes.push('closed');
    });

    await page.getByRole('button', { name: 'Close the sheet' }).click();

    expect(closes).toEqual(['closed']);
  });

  it('closes once asked from outside', async () => {
    const closes: string[] = [];
    const closings = new Subject<void>();
    await render(DistrictSheetCard, {
      sheet: of(MARAIS),
      onClose: (): void => {
        closes.push('closed');
      },
      closings
    });
    await page.getByRole('region', { name: 'Le Marais' }).element();

    closings.next();

    expect(closes).toEqual(['closed']);
  });

  it('follows the district opened', async () => {
    const sheet = new BehaviorSubject<DistrictSheet>(MARAIS);
    await render(DistrictSheetCard, { sheet, onClose: (): void => undefined });

    sheet.next({ ...MARAIS, district: { ...MARAIS.district, name: 'Batignolles' } });

    await expect.element(page.getByRole('region', { name: 'Batignolles' })).toBeVisible();
  });

  it('tells its height to the page', async () => {
    const heights: number[] = [];
    await page.viewport(390, 844);
    await render(DistrictSheetCard, {
      sheet: of(MARAIS),
      onClose: (): void => undefined,
      onSheetHeight: (height: number): void => {
        heights.push(height);
      }
    });

    await expect.poll(() => heights.some((height) => height > 0)).toBe(true);
  });

  it('has no share button', async () => {
    await shown(MARAIS);
    await page.getByRole('region', { name: 'Le Marais' }).element();

    await expect.element(page.getByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });

  it('can be enlarged, then reduced once it fills a small screen', async () => {
    await page.viewport(390, 160);
    await shown(MARAIS);
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

    await expect.element(page.getByRole('button', { name: 'Reduce the sheet' })).toBeInTheDocument();
  });
});
