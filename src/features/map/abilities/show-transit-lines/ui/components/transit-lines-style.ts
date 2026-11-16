import type { ExpressionSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';

type WidthByMode = {
  readonly zoom: number;
  readonly heavyRail: number;
  readonly others: number;
};

const TRANSIT_LINES_SOURCE = 'idfm-transit-lines';

const OTHER_LINE_COLOUR = '#8c9096';

const LINE_ORDER = { heavyRail: 2, metro: 1, others: 0 };

const widthByMode = (stops: readonly WidthByMode[]): ExpressionSpecification => [
  'interpolate',
  ['linear'],
  ['zoom'],
  ...stops.flatMap(({ zoom, heavyRail, others }): (number | ExpressionSpecification)[] => [
    zoom,
    ['match', ['get', 'mode'], ['rer', 'train'], heavyRail, others]
  ])
];

const lineLayout: LineLayerSpecification['layout'] = {
  'line-cap': 'round',
  'line-join': 'round',
  'line-sort-key': [
    'match',
    ['get', 'mode'],
    ['rer', 'train'],
    LINE_ORDER.heavyRail,
    'metro',
    LINE_ORDER.metro,
    LINE_ORDER.others
  ]
};

const transitLinesStyle: readonly LineLayerSpecification[] = [
  {
    id: 'idfm-transit-lines-casing',
    type: 'line',
    source: TRANSIT_LINES_SOURCE,
    layout: lineLayout,
    paint: {
      'line-color': 'rgb(255 255 255 / 70%)',
      'line-width': widthByMode([
        { zoom: 10, heavyRail: 2.6, others: 2 },
        { zoom: 14, heavyRail: 4.4, others: 3.6 },
        { zoom: 17, heavyRail: 7, others: 6 }
      ])
    }
  },
  {
    id: 'idfm-transit-lines',
    type: 'line',
    source: TRANSIT_LINES_SOURCE,
    layout: lineLayout,
    paint: {
      'line-color': ['coalesce', ['get', 'colour'], OTHER_LINE_COLOUR],
      'line-width': widthByMode([
        { zoom: 10, heavyRail: 1.4, others: 0.9 },
        { zoom: 14, heavyRail: 2.4, others: 1.8 },
        { zoom: 17, heavyRail: 4, others: 3.2 }
      ])
    }
  }
];

export { TRANSIT_LINES_SOURCE, transitLinesStyle };
