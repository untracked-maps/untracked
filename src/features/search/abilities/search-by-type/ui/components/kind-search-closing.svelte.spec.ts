import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Place, PlaceKind } from '../../../../domain/place';
import type { KindSearch } from '../../domain/search-by-type';
import KindSearchPanel from './kind-search.svelte';

const HUBERT: Place = {
  id: 'pharmacie-hubert',
  name: 'Pharmacie Hubert',
  kind: 'pharmacy',
  address: '11 Impasse Lepic, 75019 Paris',
  coordinates: { longitude: 2.33, latitude: 48.88 },
  fame: 0
};

const FOUND: KindSearch = { status: 'found', placeKind: 'pharmacy', places: [HUBERT] };

const HUBERT_BUTTON = /^Pharmacie Hubert/u;

const shown = async (search: KindSearch = FOUND): Promise<readonly string[]> => {
  const choices: string[] = [];
  const remember = (choice: string): void => {
    choices.push(choice);
  };
  await render(KindSearchPanel, {
    search: of(search),
    onChoose: (kind?: PlaceKind): void => remember(kind ?? 'closed'),
    onChoosePlace: ({ id }: Place): void => remember(id)
  });
  return choices;
};

const chip = (name: string): ReturnType<typeof page.getByRole> => page.getByRole('button', { name, exact: true });

const closeButton = (): ReturnType<typeof page.getByRole> => page.getByRole('button', { name: 'Close the list' });

const hubertButton = (): HTMLElement | SVGElement => page.getByRole('button', { name: HUBERT_BUTTON }).element();

const shadowOf = (element: Element | null | undefined): string => (element ? getComputedStyle(element).boxShadow : '');

describe('card of the places of a kind, on a large screen', () => {
  it('is drawn while a kind is shown', async () => {
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

describe('closing the places of a kind', () => {
  it('is offered by a button', async () => {
    const events = await shown();

    await closeButton().click();

    expect(events).toEqual(['closed']);
  });

  it('gives the focus back to the chip of the kind', async () => {
    await shown();

    await closeButton().click();

    await expect.element(chip('Pharmacies')).toHaveFocus();
  });

  it('is done with Escape', async () => {
    const events = await shown();
    hubertButton().focus();

    await userEvent.keyboard('{Escape}');

    expect(events).toEqual(['closed']);
  });

  it('is not done with another key', async () => {
    const events = await shown();
    hubertButton().focus();

    await userEvent.keyboard('{Shift}');

    expect(events).toEqual([]);
  });

  it('is not done with Escape while nothing is shown', async () => {
    const events = await shown({ status: 'closed' });

    page
      .getByRole('status')
      .element()
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(events).toEqual([]);
  });

  it('is offered for a kind without a chip', async () => {
    const events = await shown({ status: 'none-near', placeKind: 'hospital' });

    await closeButton().click();

    expect(events).toEqual(['closed']);
  });
});
