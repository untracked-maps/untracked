import { firstValueFrom, NEVER, type Observable, of, ReplaySubject, Subject } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { on } from 'svelte/events';
import { describe, expect, it } from 'vitest';
import { type Locator, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SearchState } from '../../domain/search-places';
import type { SearchPanel } from './combobox.presenter';
import SearchPlaces from './search-places.svelte';

const IDLE: Observable<SearchState> = of({ kind: 'idle' });

const SUGGESTIONS = [
  '<section aria-label=Suggestions>',
  '<p>Try these</p>',
  '<button>Louvre</button>',
  '<button>Back</button>',
  '</section>'
].join('');

const suggestions = createRawSnippet((searchPanel: () => SearchPanel) => ({
  render: (): string => SUGGESTIONS,
  setup: (element: Element): void => {
    const [louvre, back] = element.querySelectorAll('button');
    on(louvre ?? element, 'click', () => searchPanel().settle('Musée du Louvre'));
    on(back ?? element, 'click', () => searchPanel().focusField());
  }
}));

const shownWith = async (
  state: Observable<SearchState> = IDLE,
  closings: Observable<unknown> = NEVER
): Promise<ReplaySubject<string>> => {
  const queries = new ReplaySubject<string>(1);
  await render(SearchPlaces, {
    state,
    onWake: () => undefined,
    onQuery: (query: string) => queries.next(query),
    onChoose: () => undefined,
    suggestions,
    closings
  });
  return queries;
};

const field = (): Locator => page.getByRole('combobox', { name: 'Search a place or an address' });

const panel = (): Locator => page.getByRole('region', { name: 'Suggestions' });

const focused = async (
  state: Observable<SearchState> = IDLE,
  closings: Observable<unknown> = NEVER
): Promise<ReplaySubject<string>> => {
  const queries = await shownWith(state, closings);
  await field().click();
  return queries;
};

describe('search panel', () => {
  it('stays closed before the field gets the focus', async () => {
    await shownWith();

    await expect.element(panel()).not.toBeInTheDocument();
  });

  it('opens at once when the field gets the focus', async () => {
    await focused();

    await expect.element(panel()).toBeVisible();
  });

  it('keeps the field collapsed, its suggestions not being options', async () => {
    await focused();

    await expect.element(field()).toHaveAttribute('aria-expanded', 'false');
  });

  it('gives way to the search once the visitor types', async () => {
    await focused(of({ kind: 'searching', query: 'louvre' }));

    await field().fill('louvre');

    await expect.element(panel()).not.toBeInTheDocument();
  });

  it('closes when asked to', async () => {
    const closings = new Subject<void>();
    await focused(IDLE, closings);

    closings.next();

    await expect.element(panel()).not.toBeInTheDocument();
  });

  it('opens again when the field is pressed once closed', async () => {
    const closings = new Subject<void>();
    await focused(IDLE, closings);
    closings.next();

    await field().click();

    await expect.element(panel()).toBeVisible();
  });

  it('closes when the focus leaves the search', async () => {
    await render(SearchPlaces, {
      state: IDLE,
      onWake: () => undefined,
      onQuery: () => undefined,
      onChoose: () => undefined
    });
    await field().click();

    await userEvent.tab();

    await expect.element(field()).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('search panel suggestions', () => {
  it('stay open while the focus moves through them', async () => {
    await focused();

    await userEvent.tab();

    await expect.element(panel()).toBeVisible();
  });

  it('give the focus back to the field when asked to close', async () => {
    const closings = new Subject<void>();
    await focused(IDLE, closings);
    await userEvent.tab();

    closings.next();

    await expect.element(field()).toHaveFocus();
  });

  it('leave other keys to the suggestion focused', async () => {
    await focused();
    await userEvent.tab();

    await userEvent.keyboard('{Shift>}{/Shift}');

    await expect.element(panel()).toBeVisible();
  });

  it('keep the focus in the field when pressed', async () => {
    await focused();

    await page.getByText('Try these').click();

    await expect.element(field()).toHaveFocus();
  });
});

describe('search panel suggestion chosen', () => {
  it('shows its name in the field', async () => {
    await focused();

    await page.getByRole('button', { name: 'Louvre' }).click();

    await expect.element(field()).toHaveValue('Musée du Louvre');
  });

  it('searches its name', async () => {
    const queries = await focused();

    await page.getByRole('button', { name: 'Louvre' }).click();

    expect(await firstValueFrom(queries)).toBe('Musée du Louvre');
  });

  it('closes the panel', async () => {
    await focused();

    await page.getByRole('button', { name: 'Louvre' }).click();

    await expect.element(panel()).not.toBeInTheDocument();
  });

  it('gives the focus back to the field when chosen with the keyboard', async () => {
    await focused();
    await userEvent.tab();

    await userEvent.keyboard('{Enter}');

    await expect.element(field()).toHaveFocus();
  });

  it('can give the focus back to the field', async () => {
    await focused();
    await userEvent.tab();
    await userEvent.tab();

    await userEvent.keyboard('{Enter}');

    await expect.element(field()).toHaveFocus();
  });
});
