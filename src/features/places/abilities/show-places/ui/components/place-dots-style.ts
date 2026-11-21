import type {
  ExpressionSpecification,
  GeoJSONSourceSpecification,
  SymbolLayerSpecification
} from '@maplibre/maplibre-gl-style-spec';
import type { PlaceDot } from '../../domain/show-places';
import { PLACE_DOT_ICON_PREFIX, WITHOUT_FAMILY } from './place-dot-icon';
import COLOURS from './place-name-colours.json' with { type: 'json' };

type PlaceNamesPalette = 'light' | 'dark';

type PlaceDotsData = Extract<GeoJSONSourceSpecification['data'], { readonly type: 'FeatureCollection' }>;

type SymbolLayout = NonNullable<SymbolLayerSpecification['layout']>;

type SymbolPaint = NonNullable<SymbolLayerSpecification['paint']>;

type ZoomStop = {
  readonly zoom: number;
  readonly value: number;
};

const PLACE_DOTS_SOURCE = 'place-dots';

const EXPONENTIAL_BASE = 1.5;

const HALO_WIDTH = 1.6;

const CLOSE_ZOOM = 17;

const LINE_HEIGHT = { fromAfar: 1.1, upClose: 1.15, withoutFamily: 1.2 };

const OFFSET_WITHOUT_FAMILY = 1.05;

const family: ExpressionSpecification = ['get', 'family'];

const exponentialZoom = (stops: readonly ZoomStop[]): ExpressionSpecification => [
  'interpolate',
  ['exponential', EXPONENTIAL_BASE],
  ['zoom'],
  ...stops.flatMap(({ zoom, value }) => [zoom, value])
];

const nameLayout: SymbolLayout = {
  'text-field': ['get', 'name'],
  'text-font': ['Inter SemiBold'],
  'text-anchor': 'left',
  'text-justify': 'left',
  'text-max-width': 8,
  'symbol-sort-key': ['get', 'order']
};

const namePaint = (palette: PlaceNamesPalette): SymbolPaint => ({
  'text-color': ['get', family, ['literal', COLOURS[palette].names]],
  'text-halo-color': COLOURS[palette].halo,
  'text-halo-width': HALO_WIDTH
});

const withoutFamily = (palette: PlaceNamesPalette): SymbolLayerSpecification => ({
  id: `${PLACE_DOTS_SOURCE}-without-family`,
  type: 'symbol',
  source: PLACE_DOTS_SOURCE,
  filter: ['==', family, WITHOUT_FAMILY],
  layout: {
    ...nameLayout,
    'icon-image': `${PLACE_DOT_ICON_PREFIX}${WITHOUT_FAMILY}`,
    'icon-size': 0.85,
    'text-size': 11.5,
    'text-offset': [OFFSET_WITHOUT_FAMILY, 0],
    'text-line-height': LINE_HEIGHT.withoutFamily
  },
  paint: namePaint(palette)
});

const withFamily = (palette: PlaceNamesPalette): SymbolLayerSpecification => ({
  id: PLACE_DOTS_SOURCE,
  type: 'symbol',
  source: PLACE_DOTS_SOURCE,
  filter: ['!=', family, WITHOUT_FAMILY],
  layout: {
    ...nameLayout,
    'icon-image': ['concat', PLACE_DOT_ICON_PREFIX, family],
    'icon-size': exponentialZoom([
      { zoom: 11.5, value: 0.8 },
      { zoom: 14, value: 0.9 },
      { zoom: 16.5, value: 1 }
    ]),
    'text-size': exponentialZoom([
      { zoom: 11.5, value: 10.5 },
      { zoom: 14, value: 11.5 },
      { zoom: 16, value: 12 }
    ]),
    'text-offset': [1, 0],
    'text-line-height': ['step', ['zoom'], LINE_HEIGHT.fromAfar, CLOSE_ZOOM, LINE_HEIGHT.upClose]
  },
  paint: namePaint(palette)
});

const placeDotsLayers = (palette: PlaceNamesPalette): readonly SymbolLayerSpecification[] => [
  withoutFamily(palette),
  withFamily(palette)
];

const placeDotsData = (dots: readonly PlaceDot[]): PlaceDotsData => ({
  type: 'FeatureCollection',
  features: dots.map(({ name, family: familyOfDot, coordinates: { longitude, latitude }, order }) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [longitude, latitude] },
    properties: { name, family: familyOfDot ?? WITHOUT_FAMILY, order }
  }))
});

export { PLACE_DOTS_SOURCE, type PlaceNamesPalette, placeDotsData, placeDotsLayers };
