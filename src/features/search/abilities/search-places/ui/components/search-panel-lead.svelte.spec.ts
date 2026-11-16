import { of } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { on } from 'svelte/events';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SearchPanel } from './combobox.presenter';
import SearchPlaces from './search-places.svelte';

const lead = createRawSnippet((searchPanel: () => SearchPanel) => ({
  render: (): string => ['<button>', 'Bakeries near you', '</button>'].join(''),
  setup: (element: Element): void => {
    on(element, 'click', () => searchPanel().settle(''));
  }
}));

const SEARCHING = { kind: 'searching', query: 'boulangerie' } as const;

const IDLE = { kind: 'idle' } as const;

const shownWith = async (state: typeof SEARCHING | typeof IDLE): Promise<void> => {
  await render(SearchPlaces, {
    state: of(state),
    onWake: () => undefined,
    onQuery: () => undefined,
    onChoose: () => undefined,
    lead
  });
};

type Found = ReturnType<typeof page.getByRole>;

const field = (): Found => page.getByRole('combobox', { name: 'Search a place or an address' });

const leadButton = (): Found => page.getByRole('button', { name: 'Bakeries near you' });

describe('lead of the search panel', () => {
  it('is hidden before the field gets the focus', async () => {
    await shownWith(IDLE);

    await expect.element(leadButton()).not.toBeInTheDocument();
  });

  it('shows above the places found while the panel is open', async () => {
    await shownWith(SEARCHING);

    await field().click();

    await expect.element(leadButton()).toBeVisible();
  });

  it('closes with the panel', async () => {
    await shownWith(IDLE);
    await field().click();

    await userEvent.keyboard('{Escape}');

    await expect.element(leadButton()).not.toBeInTheDocument();
  });

  it('keeps the focus in the field when pressed', async () => {
    await shownWith(IDLE);
    await field().fill('boulangerie');

    await leadButton().click();

    await expect.element(field()).toHaveFocus();
  });

  it('settles the field through the panel', async () => {
    await shownWith(IDLE);
    await field().fill('boulangerie');

    await leadButton().click();

    await expect.element(field()).toHaveValue('');
  });

  it('closes the panel on Escape from its block', async () => {
    await shownWith(IDLE);
    await field().click();
    await leadButton().element().focus();

    await userEvent.keyboard('{Escape}');

    await expect.element(leadButton()).not.toBeInTheDocument();
  });
});
