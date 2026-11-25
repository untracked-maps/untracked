import type {
  CircleLayerSpecification,
  GeoJSONSourceSpecification,
  SymbolLayerSpecification
} from '@maplibre/maplibre-gl-style-spec';
import type { StationView } from '../../domain/show-station';

type ExitsData = Extract<GeoJSONSourceSpecification['data'], { readonly type: 'FeatureCollection' }>;

const STATION_EXITS_SOURCE = 'station-exits';

const EXIT_GREEN = '#2E8B57';

const WHITE = '#FFFFFF';

const SHOWN_FROM = 14;

const NUMBERED_FROM = 15.5;

const LARGEST_AT = 17;

const SMALLEST_RADIUS = 5;

const LARGEST_RADIUS = 10;

const BORDER = 1.5;

const NUMBER_SIZE = 11;

const exitsData = (view: StationView): ExitsData => ({
  type: 'FeatureCollection',
  features:
    view.status === 'open'
      ? view.exits.map(({ ref, coordinates }) => ({
          type: 'Feature',
          properties: { ref: ref ?? '' },
          geometry: { type: 'Point', coordinates: [coordinates.longitude, coordinates.latitude] }
        }))
      : []
});

const circles: CircleLayerSpecification = {
  id: STATION_EXITS_SOURCE,
  type: 'circle',
  source: STATION_EXITS_SOURCE,
  minzoom: SHOWN_FROM,
  paint: {
    'circle-color': EXIT_GREEN,
    'circle-stroke-color': WHITE,
    'circle-stroke-width': BORDER,
    'circle-radius': ['interpolate', ['linear'], ['zoom'], SHOWN_FROM, SMALLEST_RADIUS, LARGEST_AT, LARGEST_RADIUS]
  }
};

const numbers: SymbolLayerSpecification = {
  id: `${STATION_EXITS_SOURCE}-numbers`,
  type: 'symbol',
  source: STATION_EXITS_SOURCE,
  minzoom: NUMBERED_FROM,
  layout: {
    'text-field': ['get', 'ref'],
    'text-font': ['Inter Bold'],
    'text-size': NUMBER_SIZE,
    'text-allow-overlap': true,
    'text-ignore-placement': true
  },
  paint: { 'text-color': WHITE }
};

const stationExitsLayers: readonly (CircleLayerSpecification | SymbolLayerSpecification)[] = [circles, numbers];

export { exitsData, STATION_EXITS_SOURCE, stationExitsLayers };
