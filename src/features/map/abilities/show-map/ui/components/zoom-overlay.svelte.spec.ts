import type { StyleSpecification } from 'maplibre-gl';
import { firstValueFrom, last, of, ReplaySubject, Subject, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { MapView } from '../../domain/show-map';
import MapCanvas from './map-canvas.svelte';
import { type ZoomStep, zoomOverlay } from './zoom-overlay';

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const AT_ZOOM_13 = of({ basemap: EMPTY_STYLE, view: { center: { longitude: 2.35, latitude: 48.85 }, zoom: 13 } });

const zoomOnceStepped = async (step: ZoomStep): Promise<number> => {
  const steps = new ReplaySubject<ZoomStep>(1);
  const views = new Subject<MapView>();
  views.pipe(take(1)).subscribe(() => steps.next(step));
  const stepped = firstValueFrom(views.pipe(take(2), last()));
  await render(MapCanvas, {
    scene: AT_ZOOM_13,
    label: 'Map',
    overlays: [zoomOverlay(steps)],
    onViewChange: (view: MapView): void => views.next(view)
  });
  return (await stepped).zoom;
};

describe('zoom overlay', () => {
  it('zooms the map in by one level', async () => {
    expect(await zoomOnceStepped('in')).toBe(14);
  });

  it('zooms the map out by one level', async () => {
    expect(await zoomOnceStepped('out')).toBe(12);
  });
});
