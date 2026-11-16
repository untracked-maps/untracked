import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import MapCredit from './map-credit.svelte';

describe('map credit', () => {
  it('credits the contributors of OpenStreetMap, with a link to its licence', async () => {
    await render(MapCredit);

    await expect
      .element(page.getByRole('link', { name: '© OpenStreetMap' }))
      .toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
  });

  it('credits OpenFreeMap, which serves the basemap', async () => {
    await render(MapCredit);

    await expect.element(page.getByRole('link', { name: 'OpenFreeMap' })).toHaveAttribute('href', 'https://openfreemap.org');
  });

  it('credits OpenMapTiles, whose schema the basemap follows', async () => {
    await render(MapCredit);

    await expect
      .element(page.getByRole('link', { name: '© OpenMapTiles' }))
      .toHaveAttribute('href', 'https://openmaptiles.org');
  });

  it('adds the credits of what else the map shows', async () => {
    const children = createRawSnippet(() => ({ render: (): string => '<a href="https://example.org">© Example</a>' }));
    await render(MapCredit, { children });

    await expect.element(page.getByRole('link', { name: '© Example' })).toBeVisible();
  });
});
