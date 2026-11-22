import type { Map as MapLibreMap } from 'maplibre-gl';
import { animationFrames, last, map, type Observable, take, tap } from 'rxjs';
import { mapCoversOf } from '#libraries/design/map-covers';
import { type CameraMove, type FramingInputs, frameMap, type MapMeasures } from '../../domain/frame-map';

const FRAMES_UNTIL_SHEETS_KNOW_THEIR_HEIGHT = 2;

const measuresOf = (mapLibre: MapLibreMap): MapMeasures => ({
  width: mapLibre.getContainer().clientWidth,
  height: mapLibre.getContainer().clientHeight,
  zoom: mapLibre.getZoom(),
  ...mapCoversOf(document)
});

const measured = (mapLibre: MapLibreMap) => (): Observable<MapMeasures> =>
  animationFrames().pipe(
    take(FRAMES_UNTIL_SHEETS_KNOW_THEIR_HEIGHT),
    last(),
    map(() => measuresOf(mapLibre))
  );

const moved =
  (mapLibre: MapLibreMap) =>
  (move: CameraMove): void => {
    if (move.kind === 'flight') {
      mapLibre.flyTo({
        center: [move.center.longitude, move.center.latitude],
        zoom: move.zoom,
        offset: [move.offset.right, move.offset.down],
        duration: move.duration,
        essential: move.essential
      });
    } else {
      mapLibre.fitBounds(
        [
          [move.bounds.west, move.bounds.south],
          [move.bounds.east, move.bounds.north]
        ],
        { padding: move.padding, maxZoom: move.maxZoom, duration: move.duration, essential: move.essential }
      );
    }
  };

const framingOverlay =
  (inputs: FramingInputs) =>
  (mapLibre: MapLibreMap): Observable<CameraMove> =>
    frameMap({ measure: measured(mapLibre) })(inputs).pipe(tap(moved(mapLibre)));

export { framingOverlay };
