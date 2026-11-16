import type { Map as MapLibreMap } from 'maplibre-gl';
import { type Observable, tap } from 'rxjs';

type ZoomStep = 'in' | 'out';

const zoomOverlay =
  (steps$: Observable<ZoomStep>) =>
  (map: MapLibreMap): Observable<ZoomStep> =>
    steps$.pipe(tap((step) => (step === 'in' ? map.zoomIn() : map.zoomOut())));

export { type ZoomStep, zoomOverlay };
