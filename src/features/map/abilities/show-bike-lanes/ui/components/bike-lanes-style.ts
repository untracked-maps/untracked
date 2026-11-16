import type {
  ExpressionSpecification,
  LineLayerSpecification,
  VectorSourceSpecification
} from '@maplibre/maplibre-gl-style-spec';

type BikeLanesPalette = 'light' | 'dark';

type BikeLanesLayers = {
  readonly sources: Readonly<Record<string, VectorSourceSpecification>>;
  readonly layers: readonly LineLayerSpecification[];
};

type Width = {
  readonly atZoom14: number;
  readonly atZoom18: number;
};

type Dashes = {
  readonly dash: number;
  readonly gap: number;
};

type BikeLaneColours = {
  readonly track: string;
  readonly lane: string;
  readonly pavement: string;
};

const BIKE_LANES_SOURCE = 'ign-bike-lanes';

const BIKE_LANES_TILES = 'https://data.geopf.fr/tms/1.0.0/OSM.PISTECYCLABLE/{z}/{x}/{y}.pbf';

const COLOURS: Readonly<Record<BikeLanesPalette, BikeLaneColours>> = {
  light: { track: '#16793a', lane: '#2f9e55', pavement: '#0f6e6e' },
  dark: { track: '#5ad17f', lane: '#8ee0a6', pavement: '#5cc8c8' }
};

const ZOOMS = { first: 14, close: 18, last: 19 };

const FRANCE = { west: -4.93, south: 41.43, east: 9.85, north: 51.28 };

const widthFrom = ({ atZoom14, atZoom18 }: Width): ExpressionSpecification => [
  'interpolate',
  ['linear'],
  ['zoom'],
  ZOOMS.first,
  atZoom14,
  ZOOMS.close,
  atZoom18
];

type BikeLane = {
  readonly kind: string;
  readonly colour: string;
  readonly width: Width;
  readonly dashes?: Dashes;
};

const bikeLane = ({ kind, colour, width, dashes }: BikeLane): LineLayerSpecification => ({
  id: `${BIKE_LANES_SOURCE}-${kind}`,
  type: 'line',
  source: BIKE_LANES_SOURCE,
  'source-layer': 'piste_cyclable',
  filter: ['==', ['get', 'symbol'], kind],
  layout: { 'line-cap': dashes === undefined ? 'round' : 'butt', 'line-join': 'round' },
  paint: {
    'line-color': colour,
    'line-width': widthFrom(width),
    ...(dashes === undefined ? {} : { 'line-dasharray': [dashes.dash, dashes.gap] })
  }
});

const bikeLanesLayers = (palette: BikeLanesPalette): BikeLanesLayers => {
  const { track, lane, pavement } = COLOURS[palette];
  return {
    sources: {
      [BIKE_LANES_SOURCE]: {
        type: 'vector',
        tiles: [BIKE_LANES_TILES],
        minzoom: ZOOMS.first,
        maxzoom: ZOOMS.last,
        bounds: [FRANCE.west, FRANCE.south, FRANCE.east, FRANCE.north]
      }
    },
    layers: [
      bikeLane({ kind: 'voie_partage', colour: track, width: { atZoom14: 1.2, atZoom18: 3 }, dashes: { dash: 2, gap: 1.5 } }),
      bikeLane({
        kind: 'trottoir_cyclable',
        colour: pavement,
        width: { atZoom14: 1.2, atZoom18: 3 },
        dashes: { dash: 1, gap: 1 }
      }),
      bikeLane({ kind: 'bande_cyclable', colour: lane, width: { atZoom14: 1.4, atZoom18: 3.5 } }),
      bikeLane({ kind: 'piste_cyclable', colour: track, width: { atZoom14: 2, atZoom18: 5 } })
    ]
  };
};

export { type BikeLanesLayers, type BikeLanesPalette, bikeLanesLayers };
