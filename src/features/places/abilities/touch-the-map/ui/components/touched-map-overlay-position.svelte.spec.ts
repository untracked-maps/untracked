import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { of } from 'rxjs';
import { expect, it, onTestFinished } from 'vitest';
import { touchedMapOverlay } from './touched-map-overlay';

const shiftedMap = (): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const shifted = document.createElement('div');
  shifted.style.cssText = 'position: fixed; left: 50px; top: 40px; width: 400px; height: 300px';
  document.body.append(shifted);
  const map = new MapLibreMap({ container: shifted, style: { version: 8, sources: {}, layers: [] } });
  onTestFinished(() => {
    map.remove();
    shifted.remove();
  });
  return map;
};

it('finds the place where the finger went down on a map away from the corner of the page', async () => {
  const map = shiftedMap();
  const opened: string[] = [];
  const subscription = touchedMapOverlay({
    placeAt: (_, { x, y }) => (x === 200 && y === 150 ? 'flore' : undefined),
    vibrate: () => undefined,
    sheetOpen: of(false),
    onOpenPlace: (id) => {
      opened.push(id);
    },
    onInspect: () => undefined,
    onClose: () => undefined
  })(map).subscribe();
  onTestFinished(() => subscription.unsubscribe());

  map.getCanvasContainer().dispatchEvent(new PointerEvent('pointerdown', { clientX: 250, clientY: 190, bubbles: true }));
  await new Promise((resolve) => {
    setTimeout(resolve, 600);
  });

  expect(opened).toEqual(['flore']);
});
