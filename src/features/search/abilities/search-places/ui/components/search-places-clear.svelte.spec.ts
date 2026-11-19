import { firstValueFrom, of, ReplaySubject } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SearchState } from '../../domain/search-places';
import SearchPlaces from './search-places.svelte';

const clearButton = (): Locator => page.getByRole('button', { name: 'Clear the search' });

const field = (): Locator => page.getByRole('combobox');

const suggestions = createRawSnippet(() => ({ render: (): string => '<p>Recent places</p>' }));

const shown = async (): Promise<ReplaySubject<string>> => {
  const queries = new ReplaySubject<string>(1);
  await render(SearchPlaces, {
    state: of<SearchState>({ kind: 'idle' }),
    suggestions,
    onWake: () => undefined,
    onQuery: (query: string) => queries.next(query),
    onChoose: () => undefined
  });
  return queries;
};

const typedThenCleared = async (): Promise<ReplaySubject<string>> => {
  const queries = await shown();
  await field().fill('orsay');
  await clearButton().click();
  return queries;
};

describe('the button that clears the search', () => {
  it('is absent while nothing is typed', async () => {
    await shown();

    await expect.element(clearButton()).not.toBeInTheDocument();
  });

  it('appears once something is typed', async () => {
    await shown();
    await field().fill('orsay');

    await expect.element(clearButton()).toBeVisible();
  });

  it('is 46 px wide, as in the previous app', async () => {
    await shown();
    await field().fill('orsay');

    await expect.element(clearButton()).toHaveStyle({ inlineSize: '46px' });
  });

  it('empties the field', async () => {
    await typedThenCleared();

    await expect.element(field()).toHaveValue('');
  });

  it('searches nothing any more', async () => {
    const queries = await typedThenCleared();

    await expect(firstValueFrom(queries)).resolves.toBe('');
  });

  it('gives the focus back to the field', async () => {
    await typedThenCleared();

    await expect.element(field()).toHaveFocus();
  });

  it('offers the suggestions of an empty field again', async () => {
    await typedThenCleared();

    await expect.element(page.getByText('Recent places')).toBeVisible();
  });

  it('goes away with the text', async () => {
    await typedThenCleared();

    await expect.element(clearButton()).not.toBeInTheDocument();
  });
});
