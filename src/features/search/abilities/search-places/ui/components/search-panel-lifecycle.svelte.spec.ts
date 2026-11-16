import { firstValueFrom, of, ReplaySubject } from 'rxjs';
import { createRawSnippet, type Snippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SearchPanel } from './combobox.presenter';
import SearchPlaces from './search-places.svelte';

const SUGGESTIONS = ['<section aria-label=Suggestions>', '<p>Try these</p>', '</section>'].join('');

type Unmount = () => unknown;

const capturedIn = (panels: ReplaySubject<SearchPanel>): Snippet<[SearchPanel]> =>
  createRawSnippet((searchPanel: () => SearchPanel) => ({
    render: (): string => SUGGESTIONS,
    setup: (): void => panels.next(searchPanel())
  }));

const shown = async (panels: ReplaySubject<SearchPanel>): Promise<Unmount> => {
  const { unmount } = await render(SearchPlaces, {
    state: of({ kind: 'idle' } as const),
    onWake: () => undefined,
    onQuery: () => undefined,
    onChoose: () => undefined,
    suggestions: capturedIn(panels)
  });
  return unmount;
};

describe('search panel lifecycle', () => {
  it('opens as soon as the field gets the focus, without a click', async () => {
    await shown(new ReplaySubject<SearchPanel>(1));

    page.getByRole('combobox').element().focus();

    await expect.element(page.getByRole('region', { name: 'Suggestions' })).toBeVisible();
  });

  it('ignores a request to focus the field once the panel is gone', async () => {
    const panels = new ReplaySubject<SearchPanel>(1);
    const unmount = await shown(panels);
    page.getByRole('combobox').element().focus();
    const gone = await firstValueFrom(panels);
    await unmount();

    expect(() => gone.focusField()).not.toThrow();
  });

  it('closes once the focus leaves for the rest of the page', async () => {
    await shown(new ReplaySubject<SearchPanel>(1));
    page.getByRole('combobox').element().focus();
    const elsewhere = document.body.appendChild(document.createElement('button'));

    elsewhere.focus();

    await expect.element(page.getByRole('region', { name: 'Suggestions' })).not.toBeInTheDocument();
  });
});
