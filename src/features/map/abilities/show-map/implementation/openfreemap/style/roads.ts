import type { ExpressionSpecification, LineLayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { colours } from './colours';
import { exponentialZoom, fadeIn, isNotTunnel, isOneOf, type ZoomRange } from './expressions';
import { fromTiles } from './tiles';

type WidthStop = {
  readonly zoom: number;
  readonly value: number;
};

type RoadClass = {
  readonly id: string;
  readonly classes: string[];
  readonly colour: string;
  readonly casing: string;
  readonly widths: readonly WidthStop[];
  readonly minzoom: number;
  readonly casingFade?: ZoomRange;
};

const casingExtraWidth = 0.9;

const roadClasses: readonly RoadClass[] = [
  {
    id: 'road-minor',
    classes: ['minor', 'service'],
    colour: colours.road,
    casing: colours.roadCase,
    widths: [
      { zoom: 12, value: 0.4 },
      { zoom: 14, value: 1.6 },
      { zoom: 16, value: 6 },
      { zoom: 19, value: 22 }
    ],
    minzoom: 0,
    casingFade: { from: 14, to: 15 }
  },
  {
    id: 'road-mid',
    classes: ['tertiary', 'secondary'],
    colour: colours.road,
    casing: colours.majorCase,
    widths: [
      { zoom: 10, value: 0.6 },
      { zoom: 14, value: 3.2 },
      { zoom: 16, value: 9 },
      { zoom: 19, value: 30 }
    ],
    minzoom: 9
  },
  {
    id: 'road-major',
    classes: ['primary', 'trunk'],
    colour: colours.road,
    casing: colours.majorCase,
    widths: [
      { zoom: 8, value: 0.6 },
      { zoom: 14, value: 4.6 },
      { zoom: 16, value: 12 },
      { zoom: 19, value: 36 }
    ],
    minzoom: 7.5,
    casingFade: { from: 9, to: 11 }
  },
  {
    id: 'road-highway',
    classes: ['motorway'],
    colour: colours.highway,
    casing: colours.highwayCase,
    widths: [
      { zoom: 5, value: 0.7 },
      { zoom: 8, value: 1.2 },
      { zoom: 14, value: 5.5 },
      { zoom: 16, value: 13 },
      { zoom: 19, value: 38 }
    ],
    minzoom: 0,
    casingFade: { from: 8, to: 10 }
  }
];

const roadLine = (road: RoadClass, id: string): LineLayerSpecification => ({
  id,
  type: 'line',
  ...fromTiles('transportation'),
  filter: ['all', isOneOf('class', road.classes), isNotTunnel],
  minzoom: road.minzoom,
  layout: { 'line-cap': 'round', 'line-join': 'round' }
});

const casingWidths = (widths: readonly WidthStop[]): ExpressionSpecification =>
  exponentialZoom(widths.map(({ zoom, value }) => ({ zoom, value: value + casingExtraWidth })));

const casingOpacity = (casingFade?: ZoomRange): Pick<NonNullable<LineLayerSpecification['paint']>, 'line-opacity'> =>
  casingFade === undefined ? {} : { 'line-opacity': fadeIn(casingFade) };

const casingLayer = (road: RoadClass): LineLayerSpecification => ({
  ...roadLine(road, `${road.id}-case`),
  paint: { 'line-color': road.casing, 'line-width': casingWidths(road.widths), ...casingOpacity(road.casingFade) }
});

const roadLayer = (road: RoadClass): LineLayerSpecification => ({
  ...roadLine(road, road.id),
  paint: { 'line-color': road.colour, 'line-width': exponentialZoom(road.widths) }
});

const roadLayers: LineLayerSpecification[] = roadClasses.flatMap((road) => [casingLayer(road), roadLayer(road)]);

export { roadLayers };
