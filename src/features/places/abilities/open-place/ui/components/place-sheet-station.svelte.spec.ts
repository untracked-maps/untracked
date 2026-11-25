import { of } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const NORD: SheetPlace = {
  id: 'gare-du-nord',
  name: 'Gare du Nord',
  kind: 'station',
  tags: Object.fromEntries([['description:en', 'A station of the north.']]),
  coordinates: { longitude: 2.355, latitude: 48.88 }
};

const TITLE = 'Next departures';

const FIRST = createRawSnippet(() => ({ render: (): string => `<section><h3>${TITLE}</h3></section>` }));

const shown = async (typed?: string): Promise<void> => {
  await render(PlaceSheetCard, {
    sheet: of<PlaceSheet>({ status: 'open', from: 'map', place: NORD }),
    onClose: (): void => undefined,
    onCopy: (): void => undefined,
    vibrate: (): void => undefined,
    typed: of(typed),
    first: FIRST
  });
};

const sections = (): readonly string[] =>
  [...document.querySelectorAll('section h3')].map(({ textContent }) => textContent.trim());

describe('the sheet of a station', () => {
  it('tells its type until the lines are known', async () => {
    await shown();
    await expect.element(page.getByText('Station', { exact: true })).toBeInTheDocument();
  });

  it('tells the lines served under its name once known', async () => {
    await shown('Metro 4 · RER B');
    await expect.element(page.getByText('Metro 4 · RER B')).toBeInTheDocument();
  });

  it('shows the station first, before the text about it', async () => {
    await shown();
    await expect.poll(sections).toEqual([TITLE, 'About']);
  });
});
