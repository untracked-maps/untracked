import type { MapGeoJSONFeature, Map as MapLibreMap } from 'maplibre-gl';
import { placeDotsLayers } from './place-dots-style';

type ScreenPoint = {
  readonly x: number;
  readonly y: number;
};

const HALF_TOUCH = 12;

const DOT_LAYERS: readonly string[] = placeDotsLayers('light').map(({ id }) => id);

const centreOf = (map: MapLibreMap, { geometry }: MapGeoJSONFeature): ScreenPoint | undefined =>
  geometry.type === 'Point'
    ? map.project({ lng: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]) })
    : undefined;

const touchedAround =
  (map: MapLibreMap, point: ScreenPoint) =>
  (feature: MapGeoJSONFeature): boolean => {
    const centre = centreOf(map, feature);
    return centre !== undefined && Math.abs(centre.x - point.x) <= HALF_TOUCH && Math.abs(centre.y - point.y) <= HALF_TOUCH;
  };

const placeDotAt = (map: MapLibreMap, point: ScreenPoint): string | undefined => {
  const layers = DOT_LAYERS.filter((id) => map.getLayer(id) !== undefined);
  const under = map.queryRenderedFeatures([point.x, point.y], { layers });
  const around = map
    .queryRenderedFeatures(
      [
        [point.x - HALF_TOUCH, point.y - HALF_TOUCH],
        [point.x + HALF_TOUCH, point.y + HALF_TOUCH]
      ],
      { layers }
    )
    .filter(touchedAround(map, point));
  const [dot] = [...under, ...around];
  return dot === undefined ? undefined : String(dot.properties['id']);
};

export { placeDotAt };
