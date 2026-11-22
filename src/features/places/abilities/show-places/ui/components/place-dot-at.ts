import type { MapGeoJSONFeature, Map as MapLibreMap } from 'maplibre-gl';
import { placeDotsLayers } from './place-dots-style';

type ScreenPoint = {
  readonly x: number;
  readonly y: number;
};

type DotFeature = MapGeoJSONFeature & {
  readonly geometry: Extract<MapGeoJSONFeature['geometry'], { readonly type: 'Point' }>;
};

const HALF_TOUCH = 12;

const DOT_LAYERS: readonly string[] = placeDotsLayers('light').map(({ id }) => id);

const isDot = (feature: MapGeoJSONFeature): feature is DotFeature => feature.geometry.type === 'Point';

const touchedAround =
  (map: MapLibreMap, point: ScreenPoint) =>
  ({ geometry: { coordinates } }: DotFeature): boolean => {
    const centre = map.project({ lng: Number(coordinates[0]), lat: Number(coordinates[1]) });
    return Math.abs(centre.x - point.x) <= HALF_TOUCH && Math.abs(centre.y - point.y) <= HALF_TOUCH;
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
    .filter(isDot)
    .filter(touchedAround(map, point));
  const [dot] = [...under, ...around];
  return dot === undefined ? undefined : String(dot.properties['id']);
};

export { placeDotAt };
