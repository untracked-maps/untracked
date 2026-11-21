import { BehaviorSubject, of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const LUIGI: SheetPlace = {
  id: 'luigi',
  name: 'Chez Luigi',
  kind: 'restaurant',
  cuisine: 'italian',
  family: 'food',
  address: {
    houseNumber: '12',
    street: 'Rue de l’Éperon',
    postalCode: '75006',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  coordinates: { longitude: 2.34, latitude: 48.85 }
};

const VERT_GALANT: SheetPlace = {
  id: 'vert-galant',
  name: 'Square du Vert-Galant',
  coordinates: { longitude: 2.341, latitude: 48.857 }
};

const opened = (place: SheetPlace): PlaceSheet => ({ status: 'open', place, from: 'search' });

type Recorded = {
  readonly calls: string[];
  readonly onClose: () => void;
  readonly onCopy: (text: string) => void;
  readonly vibrate: (milliseconds: number) => void;
};

const recording = (): Recorded => {
  const calls: string[] = [];
  return {
    calls,
    onClose: (): void => {
      calls.push('closed');
    },
    onCopy: (text): void => {
      calls.push(text);
    },
    vibrate: (milliseconds): void => {
      calls.push(`vibrated ${milliseconds} ms`);
    }
  };
};

const rendered = async (sheet: PlaceSheet, recorded: Recorded = recording()): Promise<Recorded> => {
  await render(PlaceSheetCard, { sheet: of(sheet), ...recorded });
  return recorded;
};

const ADDRESS = '12 Rue de l’Éperon, 75006 Paris';

describe('the sheet of a place, as shown', () => {
  it('is a region named after the place', async () => {
    await rendered(opened(LUIGI));

    await expect.element(page.getByRole('region', { name: 'Chez Luigi' })).toBeVisible();
  });

  it('titles the place with its name', async () => {
    await rendered(opened(LUIGI));

    await expect.element(page.getByRole('heading', { name: 'Chez Luigi' })).toBeVisible();
  });

  it('gives the type of the place under its name', async () => {
    await rendered(opened(LUIGI));

    await expect.element(page.getByText('Restaurant · Italian')).toBeVisible();
  });

  it('names a place without a type "Place"', async () => {
    await rendered(opened(VERT_GALANT));

    await expect.element(page.getByText('Place', { exact: true })).toBeVisible();
  });

  it('shows nothing while no place is open', async () => {
    await rendered({ status: 'closed' });

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('follows the place opened', async () => {
    const sheet = new BehaviorSubject<PlaceSheet>(opened(LUIGI));
    await render(PlaceSheetCard, { sheet, ...recording() });

    sheet.next(opened(VERT_GALANT));

    await expect.element(page.getByRole('heading', { name: 'Square du Vert-Galant' })).toBeVisible();
  });
});

describe('the details of a place', () => {
  it('are a region named "Details"', async () => {
    await rendered(opened(LUIGI));

    await expect.element(page.getByRole('region', { name: 'Details' })).toBeVisible();
  });

  it('label the address', async () => {
    await rendered(opened(LUIGI));

    await expect.element(page.getByRole('region', { name: 'Details' })).toHaveTextContent(`Address ${ADDRESS}`);
  });

  it('give the address with its city, in the format of its country', async () => {
    await rendered(opened(LUIGI));

    await expect.element(page.getByText(ADDRESS)).toBeVisible();
  });

  it('are left out for a place without an address', async () => {
    await rendered(opened(VERT_GALANT));

    await expect.element(page.getByRole('region', { name: 'Details' })).not.toBeInTheDocument();
  });
});

describe('closing the sheet of a place', () => {
  it('is offered by a button', async () => {
    const recorded = await rendered(opened(LUIGI));

    await page.getByRole('button', { name: 'Close the sheet' }).click();

    expect(recorded.calls).toEqual(['closed']);
  });

  it('happens when asked from outside', async () => {
    const recorded = recording();
    const closings = new Subject<void>();
    await render(PlaceSheetCard, { sheet: of(opened(LUIGI)), ...recorded, closings });
    await vi.waitFor(() => page.getByRole('region', { name: 'Chez Luigi' }).element());

    closings.next();

    expect(recorded.calls).toEqual(['closed']);
  });
});
