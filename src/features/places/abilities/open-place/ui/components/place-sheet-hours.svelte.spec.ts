import { of } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const TITLE = 'Hours';

const HOURS = createRawSnippet(() => ({ render: (): string => `<section><h3>${TITLE}</h3></section>` }));

const place = (kind: string): SheetPlace => ({
  id: 'boulangerie',
  name: 'Boulangerie du Coin',
  kind,
  phone: '+33 1 99 00 00 01',
  tags: Object.fromEntries([
    ['payment:contactless', 'yes'],
    ['description:en', 'A bakery of the corner.']
  ]),
  coordinates: { longitude: 2.35, latitude: 48.85 }
});

const shown = async (kind: string): Promise<void> => {
  await render(PlaceSheetCard, {
    sheet: of<PlaceSheet>({ status: 'open', from: 'map', place: place(kind) }),
    onClose: (): void => undefined,
    onCopy: (): void => undefined,
    vibrate: (): void => undefined,
    hours: HOURS
  });
};

const sections = (): readonly string[] =>
  [...document.querySelectorAll('section h3')].map(({ textContent }) => textContent.trim());

describe('the opening hours in the sheet of a place', () => {
  it('come between what is good to know and the details of a shop, before the text', async () => {
    await shown('bakery');
    await expect.poll(sections).toEqual(['Good to know', TITLE, 'Details', 'About']);
  });

  it('come between what is good to know and the details of another place, after the text', async () => {
    await shown('park');
    await expect.poll(sections).toEqual(['About', 'Good to know', TITLE, 'Details']);
  });
});
