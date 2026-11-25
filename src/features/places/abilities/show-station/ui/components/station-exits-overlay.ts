import type { Map as MapLibreMap } from 'maplibre-gl';
import { from, type Observable, switchMap } from 'rxjs';
import type { StationView } from '../../domain/show-station';
import type { Coordinates } from '../../domain/station-exits';

const stationExitsOverlay =
  (station$: Observable<StationView>, touched$: Observable<Coordinates>) =>
  (map: MapLibreMap): Observable<never> =>
    from(import('./station-exits-on-map')).pipe(switchMap(({ drawStationExits }) => drawStationExits(map, station$, touched$)));

export { stationExitsOverlay };
