import { of } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const FRESHNESS = createRawSnippet(() => ({ render: (): string => '<p data-part="freshness">Info verified</p>' }));

const GLANCE = createRawSnippet(() => ({ render: (): string => '<div data-part="glance">At a glance</div>' }));

const STATION = createRawSnippet(() => ({ render: (): string => '<section data-part="station"></section>' }));

const shown = async (): Promise<void> => {
  await render(PlaceSheetCard, {
    sheet: of<PlaceSheet>({
      status: 'open',
      from: 'map',
      place: {
        id: 'boulangerie',
        name: 'Boulangerie du Coin',
        kind: 'bakery',
        phone: '+33 1 99 00 00 01',
        coordinates: { longitude: 2.35, latitude: 48.85 }
      }
    }),
    onClose: (): void => undefined,
    onCopy: (): void => undefined,
    vibrate: (): void => undefined,
    freshness: FRESHNESS,
    glance: GLANCE,
    first: STATION
  });
};

const partOf = (element: Element): string => {
  if (element.tagName === 'H2') {
    return 'name';
  }
  return element.hasAttribute('data-sheet-actions') ? 'actions' : (element.getAttribute('data-part') ?? '');
};

const order = (): readonly string[] => [...document.querySelectorAll('h2, [data-part], [data-sheet-actions]')].map(partOf);

describe('the glance at a place in its sheet', () => {
  it('puts the freshness under the name, the actions next, then the strip, before the rest', async () => {
    await shown();

    await expect.poll(order).toEqual(['name', 'freshness', 'actions', 'glance', 'station']);
  });
});
