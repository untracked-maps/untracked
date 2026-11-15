import type { StyleSpecification } from 'maplibre-gl';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { MapView } from '../../domain/show-map';
import MapCanvas from './map-canvas.svelte';

const PARIS: MapView = { center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 };
const EMPTY_BASEMAP: StyleSpecification = { version: 8, sources: {}, layers: [] };

describe('map canvas', () => {
  it('draws the map in a labelled region', async () => {
    await render(MapCanvas, { scene: of({ basemap: EMPTY_BASEMAP, view: PARIS }) });

    await expect.element(page.getByRole('region', { name: 'Map' })).toBeVisible();
  });

  it('removes the map once unmounted', async () => {
    const { unmount } = await render(MapCanvas, { scene: of({ basemap: EMPTY_BASEMAP, view: PARIS }) });

    await unmount();

    await expect.element(page.getByRole('region', { name: 'Map' })).not.toBeInTheDocument();
  });
});
