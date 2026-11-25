import { NEVER, type Observable, of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Place } from '../../../../domain/place';
import type { CategoryKey } from '../../domain/categories';
import type { KindSearch } from '../../domain/search-by-type';
import KindSearchPanel from './kind-search.svelte';

const HUBERT: Place = {
  id: 'pharmacie-hubert',
  name: 'Pharmacie Hubert',
  kind: 'pharmacy',
  address: { houseNumber: '11', street: 'Impasse Lepic', postalCode: '75019', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.33, latitude: 48.88 },
  fame: 0
};

const FOUND: KindSearch = { status: 'found', category: 'pharmacies', places: [HUBERT] };

const HUBERT_BUTTON = /^Pharmacie Hubert/u;

const shown = async (search: KindSearch = FOUND, closings: Observable<unknown> = NEVER): Promise<readonly string[]> => {
  const choices: string[] = [];
  const remember = (choice: string): void => {
    choices.push(choice);
  };
  await render(KindSearchPanel, {
    search: of(search),
    closings,
    onChoose: (category?: CategoryKey): void => remember(category ?? 'closed'),
    onChoosePlace: ({ id }: Place): void => remember(id)
  });
  return choices;
};

const chip = (name: string): ReturnType<typeof page.getByRole> => page.getByRole('button', { name, exact: true });

const closeButton = (): ReturnType<typeof page.getByRole> => page.getByRole('button', { name: 'Close the list' });

const hubertButton = (): HTMLElement | SVGElement => page.getByRole('button', { name: HUBERT_BUTTON }).element();

const shadowOf = (element: Element | null | undefined): string => (element ? getComputedStyle(element).boxShadow : '');

describe('card of the places of a category, on a large screen', () => {
  it('is drawn while a category is shown', async () => {
    await page.viewport(1280, 800);
    await shown();

    expect(shadowOf(page.getByRole('region', { name: 'Pharmacies' }).element().closest('.sheet'))).not.toBe('none');
  });

  it('is not drawn while nothing is shown', async () => {
    await page.viewport(1280, 800);
    await shown({ status: 'closed' });

    expect(document.querySelector('.sheet')).toBeNull();
  });
});

describe('closing the places of a category', () => {
  it('is offered by a button', async () => {
    const events = await shown();

    await closeButton().click();

    expect(events).toEqual(['closed']);
  });

  it('gives the focus back to the chip of the category', async () => {
    await shown();

    await closeButton().click();

    await expect.element(chip('Pharmacies')).toHaveFocus();
  });

  it('is done when asked to', async () => {
    const closings = new Subject<void>();
    const events = await shown(FOUND, closings);

    closings.next();

    expect(events).toEqual(['closed']);
  });

  it('gives the focus back to the chip when asked to while the focus is in the list', async () => {
    const closings = new Subject<void>();
    await shown(FOUND, closings);
    hubertButton().focus();

    closings.next();

    await expect.element(chip('Pharmacies')).toHaveFocus();
  });

  it('leaves the focus where it is when asked to while the focus is elsewhere', async () => {
    const closings = new Subject<void>();
    await shown(FOUND, closings);
    chip('Cafés').element().focus();

    closings.next();

    await expect.element(chip('Cafés')).toHaveFocus();
  });

  it('is not done when asked to while nothing is shown', async () => {
    const closings = new Subject<void>();
    const events = await shown({ status: 'closed' }, closings);

    closings.next();

    expect(events).toEqual([]);
  });

  it('is offered for a category without a chip', async () => {
    const events = await shown({ status: 'none-near', category: 'hospitals' });

    await closeButton().click();

    expect(events).toEqual(['closed']);
  });
});
