import { getWorkerUrl, type Map as MapLibreMap, type StyleSpecification } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { Observable, of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { MapScene, MapView } from '../../domain/show-map';
import MapCanvas from './map-canvas.svelte';

const PARIS: MapView = { center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 };
const BASEMAP: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'land', type: 'background', paint: { 'background-color': '#f4efe1' } }]
};
const PARIS_SCENE = of({ basemap: BASEMAP, view: PARIS });

const drawnMap = async (): Promise<MapLibreMap> => {
  const { promise, resolve } = Promise.withResolvers<MapLibreMap>();
  const onStyleLoaded = (map: MapLibreMap): void => {
    map.once('style.load', () => resolve(map));
  };
  await render(MapCanvas, { scene: PARIS_SCENE, label: 'Map', onMap: onStyleLoaded });
  return promise;
};

const noteOverlay = (map: MapLibreMap): Observable<never> =>
  new Observable(() => {
    const note = document.createElement('p');
    note.textContent = 'Drawn by an overlay';
    map.getContainer().after(note);
    return (): void => note.remove();
  });

describe('map canvas', () => {
  it('draws the map in a region named after its label', async () => {
    await render(MapCanvas, { scene: PARIS_SCENE, label: 'Carte' });

    await expect.element(page.getByRole('region', { name: 'Carte' })).toBeVisible();
  });

  it('draws the basemap of the scene', async () => {
    const map = await drawnMap();

    expect(map.getStyle().layers).toStrictEqual(BASEMAP.layers);
  });

  it('opens at the zoom level of the scene', async () => {
    const map = await drawnMap();

    expect(map.getZoom()).toBe(13);
  });

  it('opens on the centre of the scene', async () => {
    const map = await drawnMap();

    expect(map.getCenter().toArray()).toStrictEqual([2.3522, 48.8566]);
  });

  it('runs MapLibre in the worker file served by the site', async () => {
    await render(MapCanvas, { scene: PARIS_SCENE, label: 'Map' });

    expect(getWorkerUrl()).toBe(workerUrl);
  });

  it('removes the map once unmounted', async () => {
    const { promise, resolve } = Promise.withResolvers<boolean>();
    const onRemoved = (map: MapLibreMap): void => {
      map.once('remove', () => resolve(true));
    };
    const { unmount } = await render(MapCanvas, { scene: PARIS_SCENE, label: 'Map', onMap: onRemoved });

    await unmount();

    expect(await promise).toBe(true);
  });

  it('stops following the scene once unmounted', async () => {
    const scene = new Subject<MapScene<StyleSpecification>>();
    const { unmount } = await render(MapCanvas, { scene, label: 'Map' });

    await unmount();

    expect(scene.observed).toBe(false);
  });

  it('lets overlays draw on the map', async () => {
    await render(MapCanvas, { scene: PARIS_SCENE, label: 'Map', overlays: [noteOverlay] });

    await expect.element(page.getByText('Drawn by an overlay')).toBeVisible();
  });

  it('removes what overlays drew once unmounted', async () => {
    const { unmount } = await render(MapCanvas, { scene: PARIS_SCENE, label: 'Map', overlays: [noteOverlay] });

    await unmount();

    await expect.element(page.getByText('Drawn by an overlay')).not.toBeInTheDocument();
  });
});
